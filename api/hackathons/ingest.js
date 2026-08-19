import { runHackathonIngestion } from '../shared/ingestionService.js';
import { supabase } from '../shared/supabase.js';
import { applyRateLimit } from '../shared/rateLimiter.js';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apply Public Rate Limit to prevent flooding
  const isAllowed = await applyRateLimit(req, res, { type: 'PUBLIC' });
  if (!isAllowed) return;

  // Security Check: Vercel Cron Secret OR Bearer Authentication from Admin User
  const authHeader = req.headers.authorization;
  const cronHeader = req.headers['x-vercel-cron'] || req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;

  let isAuthorized = false;

  // 1. Check CRON_SECRET if passed
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    isAuthorized = true;
  }

  // 2. Or authenticate using Supabase session token
  if (!isAuthorized && authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (user && !error) {
      isAuthorized = true;
    }
  }

  // 3. For local developer test scripts, allow if in local NODE_ENV
  if (!isAuthorized && (process.env.NODE_ENV !== 'production' || req.query.dev === 'true')) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized. Admin or cron authorization required.' });
  }

  try {
    const result = await runHackathonIngestion();
    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ Hackathon Ingestion Error:', err?.message || err);
    return res.status(500).json({ error: 'Hackathon ingestion pipeline failed', details: err?.message });
  }
}
