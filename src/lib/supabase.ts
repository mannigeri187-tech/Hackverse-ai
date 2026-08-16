import { createClient } from '@supabase/supabase-js';

// Safe sanitization to strip quotes, trailing whitespace, or accidental linebreaks from env variables
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (rawUrl ? String(rawUrl).trim().replace(/^["']|["']$/g, '') : '') || 'https://updhbkmjgzighnifabsd.supabase.co';
const supabaseAnonKey = (rawAnonKey ? String(rawAnonKey).trim().replace(/^["']|["']$/g, '') : '') || 'sb_publishable_uptpQI7aYbSbNeKKipLQxQ_AiT4A3w4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
