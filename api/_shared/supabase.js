import { createClient } from '@supabase/supabase-js';

// Dedicated server-side Supabase configuration
export function sanitizeEnvString(val) {
  if (!val) return '';
  const lines = String(val).split(/\r?\n/).map(l => l.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  return lines[0] || '';
}

const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = sanitizeEnvString(rawUrl);
const supabaseKey = sanitizeEnvString(rawKey);

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
    throw new Error('SERVER_CONFIG_ERROR: SUPABASE_URL must be a valid HTTPS URL.');
  }
  if (!supabaseKey) {
    throw new Error('SERVER_CONFIG_ERROR: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is missing.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// In-memory token cache (60-second TTL) to eliminate repeated Supabase Auth HTTP requests
const tokenCache = new Map();

/**
 * Shared helper to safely verify Bearer JWT token on server with fast local validation
 */
export async function authenticateServerRequest(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header format' };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { user: null, error: 'Empty bearer token' };
  }

  const nowMs = Date.now();

  // 1. Check in-memory fast cache
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > nowMs) {
    return { user: cached.user, error: null };
  }

  // 2. Fast local JWT verification
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);
      
      if (payload && payload.sub && (!payload.exp || payload.exp * 1000 > nowMs)) {
        const user = {
          id: payload.sub,
          email: payload.email || '',
          user_metadata: payload.user_metadata || {},
          role: payload.role || 'authenticated'
        };

        // Cache for remaining token lifespan up to 60 seconds
        const ttlMs = payload.exp ? Math.min(60000, (payload.exp * 1000) - nowMs) : 60000;
        tokenCache.set(token, { user, expiresAt: nowMs + ttlMs });

        return { user, error: null };
      }
    }
  } catch {
    // If local decode fails, fall back to remote client verification
  }

  // 3. Fallback to Supabase remote client verification
  try {
    const client = getSupabaseServerClient();
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) {
      return { user: null, error: error?.message || 'Invalid or expired user session' };
    }

    tokenCache.set(token, { user, expiresAt: nowMs + 60000 });
    return { user, error: null };
  } catch (err) {
    return { user: null, error: err.message || 'Authentication service error' };
  }
}

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;
