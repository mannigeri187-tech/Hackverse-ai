import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = rawUrl ? String(rawUrl).trim().replace(/^["']|["']$/g, '') : 'https://placeholder.supabase.co';
const supabaseKey = rawKey ? String(rawKey).trim().replace(/^["']|["']$/g, '') : 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
