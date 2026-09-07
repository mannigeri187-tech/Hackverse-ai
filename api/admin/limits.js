import { authenticateServerRequest } from '../_shared/supabase.js';
import { createClient } from '@supabase/supabase-js';
import { invalidateLimitsCache } from '../_shared/usage.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { user, error: authError } = await authenticateServerRequest(req);
    if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // CRITICAL SECURITY CHECK
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.is_admin !== true) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('feature_limits').select('*').order('feature', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const updates = req.body;
      if (!Array.isArray(updates)) return res.status(400).json({ error: 'Expected array of updates' });

      for (const update of updates) {
        const { feature, free_limit, pro_limit, premium_limit } = update;
        
        // Strict Validation
        if (typeof feature !== 'string') return res.status(400).json({ error: 'Invalid feature key' });
        
        const validateInt = (val) => Number.isInteger(val) && val >= 0 && val <= 1000000;
        if (!validateInt(free_limit) || !validateInt(pro_limit) || !validateInt(premium_limit)) {
          return res.status(400).json({ error: \Invalid limits for feature: \\ });
        }

        const { error } = await supabase
          .from('feature_limits')
          .update({
            free_limit,
            pro_limit,
            premium_limit,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq('feature', feature);

        if (error) return res.status(500).json({ error: error.message });
      }

      invalidateLimitsCache();
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin limits error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
