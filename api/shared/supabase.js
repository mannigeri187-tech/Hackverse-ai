import { createClient } from '@supabase/supabase-js';

// Dedicated server-side Supabase configuration
const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = rawUrl ? String(rawUrl).trim().replace(/^["']|["']$/g, '') : '';
const supabaseKey = rawKey ? String(rawKey).trim().replace(/^["']|["']$/g, '') : '';

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

/**
 * Shared helper to safely verify Bearer JWT token on server
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

  try {
    const client = getSupabaseServerClient();
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) {
      return { user: null, error: error?.message || 'Invalid or expired user session' };
    }
    return { user, error: null };
  } catch (err) {
    return { user: null, error: err.message || 'Authentication service error' };
  }
}

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;
