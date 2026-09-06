import { runHackathonIngestion } from '../_shared/ingestionService.js';
import { runDatabaseLinkValidation } from '../_shared/linkAuditService.js';
import { supabase } from '../_shared/supabase.js';
import { applyRateLimit } from '../_shared/rateLimiter.js';

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

  if (cronSecret && (authHeader === `Bearer ${cronSecret}` || cronHeader === `Bearer ${cronSecret}`)) {
    isAuthorized = true;
  }

  if (!isAuthorized && authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (user && !error) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized && (process.env.NODE_ENV !== 'production' || req.query.dev === 'true')) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized. Admin or cron authorization required.' });
  }

  try {
    const task = req.query.task;
    if (task === 'ingest') {
      const result = await runHackathonIngestion();
      return res.status(200).json(result);
    } else if (task === 'validate-links') {
      const result = await runDatabaseLinkValidation();
      return res.status(200).json(result);
    } else {
      return res.status(400).json({ error: 'Invalid task specified.' });
    }
  } catch (err) {
    console.error('?O Cron Task Error:', err?.message || err);
    return res.status(500).json({ error: 'Cron task failed', details: err?.message });
  }
}
