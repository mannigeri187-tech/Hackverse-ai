import { supabase } from '../_shared/supabase.js';
import { getFromCache, setToCache } from '../_shared/redis.js';
import { applyRateLimit } from '../_shared/rateLimiter.js';

const CACHE_TTL_DETAIL = 3600; // 1 hour

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apply Public Tier Rate Limiting (by IP)
  const isAllowed = await applyRateLimit(req, res, { type: 'PUBLIC' });
  if (!isAllowed) return;

  const { id } = req.query; // In Vercel, dynamic path segments are in req.query
  if (!id) return res.status(400).json({ error: 'Missing ID parameter' });

  const startTime = performance.now();
  const cacheKey = `hackathon:detail:${id}`;

  const cachedData = await getFromCache(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      source: 'redis',
      data: cachedData,
      responseTime: performance.now() - startTime
    });
  }

  try {
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    await setToCache(cacheKey, data, CACHE_TTL_DETAIL);

    return res.status(200).json({
      source: 'postgres',
      data,
      responseTime: performance.now() - startTime
    });
  } catch (err) {
    console.error('❌ Details Error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
