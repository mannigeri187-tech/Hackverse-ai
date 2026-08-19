import { applyRateLimit, resetRateLimit } from '../shared/rateLimiter.js';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action = 'auth', email = '', status = 'attempt' } = req.body || {};

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    // If user succeeded, clear the failure penalty counter
    if (status === 'success' && cleanEmail) {
      await resetRateLimit('auth', cleanEmail);
      return res.status(200).json({ allowed: true, status: 'cleared' });
    }

    // Apply strict dual IP + Email rate limiting with progressive backoff
    const isAllowed = await applyRateLimit(req, res, {
      type: 'AUTH',
      identifier: cleanEmail || null
    });

    if (!isAllowed) {
      // applyRateLimit already sent 429 and Retry-After headers
      return;
    }

    return res.status(200).json({
      allowed: true,
      action
    });
  } catch (err) {
    console.error('Auth Rate Limiter Error:', err.message);
    // Fail open safely to avoid locking legitimate users if service blips
    return res.status(200).json({ allowed: true });
  }
}
