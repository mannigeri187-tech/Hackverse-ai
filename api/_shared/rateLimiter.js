import Redis from 'ioredis';

// Environment variable configuration with sensible production defaults
export function getRateLimitConfig() {
  return {
    AUTH_LIMIT: parseInt(process.env.AUTH_RATE_LIMIT || '5', 10),
    AUTH_WINDOW: parseInt(process.env.AUTH_RATE_WINDOW || '60', 10), // in seconds
    
    PUBLIC_LIMIT: parseInt(process.env.PUBLIC_RATE_LIMIT || '30', 10),
    PUBLIC_WINDOW: parseInt(process.env.PUBLIC_RATE_WINDOW || '60', 10),
    
    AUTHENTICATED_LIMIT: parseInt(process.env.AUTHENTICATED_RATE_LIMIT || '60', 10),
    AUTHENTICATED_WINDOW: parseInt(process.env.AUTHENTICATED_RATE_WINDOW || '60', 10),
    
    AI_LIMIT: parseInt(process.env.AI_RATE_LIMIT || '20', 10),
    AI_WINDOW: parseInt(process.env.AI_RATE_WINDOW || '60', 10),
  };
}

// 1. Redis Distributed Store Connection (if configured on Vercel / production)
const redisUrl = process.env.REDIS_URL;
let redisClient = null;

if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableAutoPipelining: true,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 50, 1000);
      }
    });
    redisClient.on('error', (err) => {
      // Graceful silence/warn to prevent crashing serverless process
      console.warn('⚠️ RateLimiter Redis warning:', err.message);
    });
  } catch (err) {
    console.warn('⚠️ Failed to initialize Redis for RateLimiter:', err.message);
  }
}

// 2. In-Memory L1 Sliding Window Store (with auto-cleanup)
const localRateStore = new Map(); // key -> { count: number, resetAt: number, penaltyLevel: number }
const MAX_LOCAL_STORE_KEYS = 5000;

function cleanupStaleKeys() {
  const now = Date.now();
  for (const [key, record] of localRateStore.entries()) {
    if (record.resetAt <= now) {
      localRateStore.delete(key);
    }
  }
}

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(cleanupStaleKeys, 30000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

/**
 * Extracts client IP address safely from Vercel / reverse proxy headers
 */
export function getClientIp(req) {
  if (!req || !req.headers) return '127.0.0.1';
  
  const forwardedFor = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'];
  if (forwardedFor && typeof forwardedFor === 'string') {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  
  const realIp = req.headers['x-real-ip'] || req.headers['X-Real-Ip'] || req.headers['cf-connecting-ip'];
  if (realIp && typeof realIp === 'string') return realIp.trim();
  
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
}

/**
 * Calculates progressive penalty duration for repeated violations (in seconds)
 */
function getProgressivePenalty(penaltyLevel) {
  switch (penaltyLevel) {
    case 1: return 30;   // 30 seconds
    case 2: return 60;   // 1 minute
    case 3: return 300;  // 5 minutes
    default: return 900; // 15 minutes max
  }
}

/**
 * Evaluates rate limit against distributed Redis or in-memory store
 */
async function recordAndCheckLimit(key, limit, windowSeconds, isAuth = false) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // A. Try Redis Distributed Store first if available
  if (redisClient && redisClient.status === 'ready') {
    try {
      const redisKey = `ratelimit:${key}`;
      const count = await redisClient.incr(redisKey);
      
      if (count === 1) {
        await redisClient.expire(redisKey, windowSeconds);
      }
      
      const ttl = await redisClient.ttl(redisKey);
      const remaining = Math.max(0, limit - count);
      const resetTime = Math.ceil(now / 1000) + (ttl > 0 ? ttl : windowSeconds);
      
      if (count > limit) {
        const retryAfter = ttl > 0 ? ttl : windowSeconds;
        return {
          allowed: false,
          remaining: 0,
          limit,
          resetTime,
          retryAfter
        };
      }
      
      return {
        allowed: true,
        remaining,
        limit,
        resetTime,
        retryAfter: 0
      };
    } catch (redisErr) {
      console.warn('⚠️ Redis rate limit check failed, falling back to L1 memory:', redisErr.message);
    }
  }

  // B. Fallback to L1 In-Memory Sliding Window
  if (localRateStore.size >= MAX_LOCAL_STORE_KEYS) {
    cleanupStaleKeys();
    if (localRateStore.size >= MAX_LOCAL_STORE_KEYS) {
      const oldestKey = localRateStore.keys().next().value;
      if (oldestKey) localRateStore.delete(oldestKey);
    }
  }

  let entry = localRateStore.get(key);

  if (!entry || entry.resetAt <= now) {
    // New window
    const penalty = (entry && isAuth && entry.penaltyLevel) ? entry.penaltyLevel : 0;
    entry = {
      count: 1,
      resetAt: now + windowMs,
      penaltyLevel: penalty
    };
    localRateStore.set(key, entry);
    return {
      allowed: true,
      remaining: limit - 1,
      limit,
      resetTime: Math.ceil(entry.resetAt / 1000),
      retryAfter: 0
    };
  }

  // Existing window
  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

  if (entry.count > limit) {
    if (isAuth) {
      entry.penaltyLevel = (entry.penaltyLevel || 0) + 1;
      const penaltySeconds = getProgressivePenalty(entry.penaltyLevel);
      entry.resetAt = Math.max(entry.resetAt, now + penaltySeconds * 1000);
      const currentRetryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        limit,
        resetTime: Math.ceil(entry.resetAt / 1000),
        retryAfter: currentRetryAfter
      };
    }

    return {
      allowed: false,
      remaining: 0,
      limit,
      resetTime: Math.ceil(entry.resetAt / 1000),
      retryAfter: resetSeconds > 0 ? resetSeconds : windowSeconds
    };
  }

  return {
    allowed: true,
    remaining,
    limit,
    resetTime: Math.ceil(entry.resetAt / 1000),
    retryAfter: 0
  };
}

/**
 * Universal Rate Limiter Middleware for API Endpoints
 * 
 * @param {object} req - HTTP incoming request
 * @param {object} res - HTTP outgoing response
 * @param {object} options
 * @param {'AUTH'|'AI'|'AUTHENTICATED'|'PUBLIC'} options.type - Rate limit tier
 * @param {string} [options.identifier] - Optional user ID, email or account identifier
 * @param {number} [options.customLimit] - Optional custom limit override
 * @param {number} [options.customWindow] - Optional custom window override (seconds)
 * @returns {Promise<boolean>} true if request is allowed, false if rejected (429 sent)
 */
export async function applyRateLimit(req, res, options = {}) {
  const {
    type = 'PUBLIC',
    identifier = null,
    customLimit = null,
    customWindow = null
  } = options;

  const config = getRateLimitConfig();
  const ip = getClientIp(req);

  let limit;
  let windowSeconds;
  let keyPrefix;
  let isAuth = false;

  switch (type) {
    case 'AUTH':
      limit = customLimit || config.AUTH_LIMIT;
      windowSeconds = customWindow || config.AUTH_WINDOW;
      keyPrefix = 'auth';
      isAuth = true;
      break;

    case 'AI':
      limit = customLimit || config.AI_LIMIT;
      windowSeconds = customWindow || config.AI_WINDOW;
      keyPrefix = 'ai';
      break;

    case 'AUTHENTICATED':
      limit = customLimit || config.AUTHENTICATED_LIMIT;
      windowSeconds = customWindow || config.AUTHENTICATED_WINDOW;
      keyPrefix = 'user';
      break;

    case 'PUBLIC':
    default:
      limit = customLimit || config.PUBLIC_LIMIT;
      windowSeconds = customWindow || config.PUBLIC_WINDOW;
      keyPrefix = 'pub';
      break;
  }

  let isAllowed = true;
  let remaining = limit;
  let resetTime = Math.ceil(Date.now() / 1000) + windowSeconds;
  let retryAfter = 0;

  if (type === 'AUTH') {
    // Strict Dual Tracking for Auth (Login, Signup, OTP)
    // 1. IP Check
    const ipKey = `auth:ip:${ip}`;
    const ipRes = await recordAndCheckLimit(ipKey, limit, windowSeconds, true);

    // 2. Email / Account Identifier Check (if provided)
    let idRes = { allowed: true, remaining: limit, resetTime: ipRes.resetTime, retryAfter: 0 };
    if (identifier && typeof identifier === 'string' && identifier.trim()) {
      const cleanId = identifier.trim().toLowerCase();
      const idKey = `auth:id:${cleanId}`;
      idRes = await recordAndCheckLimit(idKey, limit, windowSeconds, true);
    }

    isAllowed = ipRes.allowed && idRes.allowed;
    remaining = Math.min(ipRes.remaining, idRes.remaining);
    resetTime = Math.max(ipRes.resetTime, idRes.resetTime);
    retryAfter = Math.max(ipRes.retryAfter || 0, idRes.retryAfter || 0);
  } else if ((type === 'AI' || type === 'AUTHENTICATED') && identifier) {
    // Authenticated User Tracking: User ID is primary tenant key
    const cleanId = String(identifier).trim().toLowerCase();
    const userKey = `${keyPrefix}:id:${cleanId}`;
    const userRes = await recordAndCheckLimit(userKey, limit, windowSeconds, false);

    // High-threshold IP flood guard (5x user limit) to prevent single-IP DDoS
    // while ensuring multiple students on shared WiFi/dorm IP are not blocked
    const ipFloodKey = `${keyPrefix}:ip_flood:${ip}`;
    const ipFloodLimit = Math.max(limit * 5, 100);
    const ipRes = await recordAndCheckLimit(ipFloodKey, ipFloodLimit, windowSeconds, false);

    isAllowed = userRes.allowed && ipRes.allowed;
    remaining = userRes.remaining;
    resetTime = userRes.resetTime;
    retryAfter = Math.max(userRes.retryAfter || 0, ipRes.retryAfter || 0);
  } else {
    // Public / Unauthenticated Tracking: IP is primary key
    const ipKey = `${keyPrefix}:ip:${ip}`;
    const ipRes = await recordAndCheckLimit(ipKey, limit, windowSeconds, false);

    isAllowed = ipRes.allowed;
    remaining = ipRes.remaining;
    resetTime = ipRes.resetTime;
    retryAfter = ipRes.retryAfter || 0;
  }

  // Set standard rate limit headers
  if (res && !res.headersSent) {
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
    res.setHeader('X-RateLimit-Reset', resetTime);
  }

  if (!isAllowed) {
    if (res && !res.headersSent) {
      if (retryAfter > 0) {
        res.setHeader('Retry-After', retryAfter);
      }
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: retryAfter > 0 ? retryAfter : windowSeconds
      });
    }
    return false;
  }

  return true;
}

/**
 * Resets/clears rate limit penalties on successful authentication
 */
export async function resetRateLimit(keyPrefix, identifier) {
  if (!identifier) return;
  const cleanId = String(identifier).trim().toLowerCase();
  const key = `${keyPrefix}:id:${cleanId}`;
  
  localRateStore.delete(key);
  
  if (redisClient && redisClient.status === 'ready') {
    try {
      await redisClient.del(`ratelimit:${key}`);
    } catch {}
  }
}
