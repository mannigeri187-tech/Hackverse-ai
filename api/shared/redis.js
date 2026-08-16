import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
let redis = null;

// In-Memory L1 Fallback Cache
const memoryCache = new Map();
const MAX_MEMORY_KEYS = 500;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    enableAutoPipelining: true,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 50, 1000);
    }
  });
  
  redis.on('error', (err) => {
    console.error('⚠️ Redis connection error:', err.message);
  });
}

export async function getFromCache(key) {
  const memItem = memoryCache.get(key);
  if (memItem) {
    if (Date.now() < memItem.expiresAt) {
      return memItem.data;
    }
    memoryCache.delete(key);
  }

  if (!redis || redis.status !== 'ready') return null;
  try {
    const data = await redis.get(key);
    if (data) {
      const parsed = JSON.parse(data);
      memoryCache.set(key, { data: parsed, expiresAt: Date.now() + 60000 });
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('⚠️ Redis GET error:', err.message);
    return null;
  }
}

export async function setToCache(key, data, ttl = 300) {
  if (memoryCache.size >= MAX_MEMORY_KEYS) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(key, { data, expiresAt: Date.now() + ttl * 1000 });

  if (!redis || redis.status !== 'ready') return;
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
  } catch (err) {
    console.error('⚠️ Redis SET error:', err.message);
  }
}

/**
 * Invalidates hackathon search cache keys on ingestion
 */
export async function clearSearchCache() {
  // Clear L1 memory
  memoryCache.clear();

  // Clear L2 Redis keys if available
  if (redis && redis.status === 'ready') {
    try {
      const keys = await redis.keys('hackathons:search:*');
      if (keys && keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      console.error('⚠️ Error clearing Redis search cache:', err.message);
    }
  }
}
