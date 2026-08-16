import crypto from 'crypto';
import { supabase } from '../shared/supabase.js';
import { getFromCache, setToCache } from '../shared/redis.js';

const CACHE_TTL_SEARCH = 300; // 5 minutes cache

function generateSearchCacheKey(params) {
  const normalizedParams = {
    query: params.query || '',
    location: params.location || '',
    regionFilter: params.regionFilter || 'all',
    mode: params.mode || 'all',
    status: params.status || 'all',
    date: params.date || '',
    page: params.page || 1,
    limit: params.limit || 9
  };
  const stringified = JSON.stringify(normalizedParams);
  const hash = crypto.createHash('md5').update(stringified).digest('hex');
  return `hackathons:search:v3:${hash}`;
}

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const startTime = performance.now();
  const cacheKey = generateSearchCacheKey(req.query);

  // 1. Check Redis Cache
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      source: 'redis',
      data: cachedData.data,
      count: cachedData.count,
      responseTime: performance.now() - startTime
    });
  }

  // 2. Database Query with Location & Region Filtering
  try {
    const {
      query = '',
      location = '',
      regionFilter = 'all', // 'all', 'karnataka', 'bengaluru', 'india', 'online', 'international'
      mode = 'all',
      status = 'all',
      date = '',
      page = 1,
      limit = 9
    } = req.query;

    let q = supabase
      .from('hackathons')
      .select('id, title, organizer, start_date, location, mode, image_url, status', { count: 'exact' });

    // Comprehensive text search across title, organizer, and location
    if (query) {
      q = q.or(`title.ilike.%${query}%,organizer.ilike.%${query}%,location.ilike.%${query}%`);
    }

    // Specific location text search
    if (location) {
      q = q.ilike('location', `%${location}%`);
    }

    // Region First-Class Filtering
    if (regionFilter === 'karnataka') {
      q = q.or('location.ilike.%Karnataka%,location.ilike.%Bengaluru%,location.ilike.%Bangalore%');
    } else if (regionFilter === 'bengaluru') {
      q = q.or('location.ilike.%Bengaluru%,location.ilike.%Bangalore%');
    } else if (regionFilter === 'india') {
      q = q.or('location.ilike.%India%,location.ilike.%Karnataka%,location.ilike.%Bengaluru%,location.ilike.%Bangalore%,location.ilike.%Mumbai%,location.ilike.%Delhi%,location.ilike.%Hyderabad%,location.ilike.%Chennai%,location.ilike.%Pune%,location.ilike.%Kolkata%');
    } else if (regionFilter === 'online') {
      q = q.eq('mode', 'online');
    } else if (regionFilter === 'international') {
      q = q.not('location', 'ilike', '%India%')
           .not('location', 'ilike', '%Karnataka%')
           .not('location', 'ilike', '%Bengaluru%')
           .not('location', 'ilike', '%Bangalore%');
    }

    if (mode && mode !== 'all') q = q.eq('mode', mode);
    if (status && status !== 'all') q = q.eq('status', status);
    if (date) q = q.gte('start_date', date);

    // Order by date
    q = q.order('start_date', { ascending: true });

    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    q = q.range(from, to);

    const { data, count, error } = await q;

    if (error) throw error;

    const responsePayload = { data: data || [], count: count || 0 };

    // 3. Store in Redis cache
    await setToCache(cacheKey, responsePayload, CACHE_TTL_SEARCH);

    return res.status(200).json({
      source: 'postgres',
      data: responsePayload.data,
      count: responsePayload.count,
      responseTime: performance.now() - startTime
    });
  } catch (err) {
    console.error('❌ Search Error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to search hackathons' });
  }
}
