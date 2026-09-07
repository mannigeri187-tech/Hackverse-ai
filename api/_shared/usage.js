import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';
import { PLANS, FEATURE_LIMITS as FALLBACK_LIMITS } from './usageConfig.js';

// Centralized Upstash Redis connection
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Internal caches for Ratelimit instances
const ratelimiters = new Map();

function getRatelimiter(limit, windowStr) {
  const key = \\_\\;
  if (!ratelimiters.has(key)) {
    if (!redis) {
      console.warn('UPSTASH_REDIS_REST_URL is missing. Using permissive fallback.');
      return {
        limit: async () => ({ success: true, limit, remaining: limit, reset: Date.now() + 60000 })
      };
    }
    ratelimiters.set(key, new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, windowStr),
      analytics: true,
      ephemeralCache: ratelimiters
    }));
  }
  return ratelimiters.get(key);
}

// IN-MEMORY LIMITS CACHE
let cachedLimits = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60000; // 1 minute

export function invalidateLimitsCache() {
  cachedLimits = null;
  cacheExpiresAt = 0;
}

export async function getFeatureLimitsConfig(supabase) {
  if (cachedLimits && Date.now() < cacheExpiresAt) {
    return cachedLimits;
  }

  try {
    const { data, error } = await supabase.from('feature_limits').select('*');
    if (error) throw error;
    
    // Transform DB rows into the expected usageConfig structure
    const config = {
      [PLANS.FREE]: {},
      [PLANS.PRO]: {},
      [PLANS.PREMIUM]: {}
    };

    data.forEach(row => {
      const baseConf = { type: row.type, window: row.window, table: row.table_name };
      config[PLANS.FREE][row.feature] = { ...baseConf, limit: row.free_limit };
      config[PLANS.PRO][row.feature] = { ...baseConf, limit: row.pro_limit };
      config[PLANS.PREMIUM][row.feature] = { ...baseConf, limit: row.premium_limit };
    });

    cachedLimits = config;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return config;
  } catch (err) {
    console.error('Error fetching feature_limits from DB. Using fallback.', err);
    return FALLBACK_LIMITS; // Fallback safely
  }
}

/**
 * Validates authenticated user plan and checks specific feature limit/quota.
 */
export async function checkFeatureAccess({ userId, feature, action = 'consume', req }) {
  const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown') : 'unknown';
  const identity = userId || ip;

  if (!identity) {
    return { allowed: false, error: 'UNAUTHENTICATED', status: 401 };
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let userPlan = PLANS.FREE;
  
  if (userId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('user_id', userId)
        .single();

      if (profile && profile.subscription_tier) {
        const tier = String(profile.subscription_tier).toLowerCase();
        if (Object.values(PLANS).includes(tier)) {
          userPlan = tier;
        }
      }
    } catch (err) {
      console.error('Error fetching user plan, defaulting to free:', err);
    }
  }

  const limitsConfig = await getFeatureLimitsConfig(supabase);
  const planLimits = limitsConfig[userPlan];
  
  if (!planLimits) {
    return { allowed: false, error: 'PLAN_NOT_FOUND', status: 500 };
  }

  const limitConfig = planLimits[feature];
  if (!limitConfig) {
    return { allowed: false, error: 'UNKNOWN_FEATURE', status: 403 };
  }

  if (limitConfig.type === 'resource') {
    const { table, limit } = limitConfig;
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error(\Error counting \:\, error);
      return { allowed: false, error: 'INTERNAL_ERROR', status: 500 };
    }

    if (count >= limit) {
      return { allowed: false, error: 'RESOURCE_LIMIT_REACHED', feature, plan: userPlan, limit, used: count, remaining: 0, status: 429 };
    }
    return { allowed: true, limit, used: count, remaining: limit - count };
  }

  const { limit, window } = limitConfig;
  const limiter = getRatelimiter(limit, window);
  const identifierKey = \usage:\:\\;

  try {
    const { success, pending, limit: maxLimit, remaining, reset } = await limiter.limit(identifierKey);

    if (!success) {
      return { allowed: false, error: 'FEATURE_LIMIT_REACHED', feature, plan: userPlan, limit: maxLimit, used: maxLimit, remaining: 0, resetAt: new Date(reset).toISOString(), status: 429 };
    }

    return { allowed: true, limit: maxLimit, used: maxLimit - remaining, remaining, resetAt: new Date(reset).toISOString() };
  } catch (err) {
    console.error('Upstash Ratelimit error:', err);
    return { allowed: true };
  }
}
