import { applyRateLimit, resetRateLimit } from './_shared/rateLimiter.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // -----------------------------------------------------
    // GET: Fetch Public Profile
    // -----------------------------------------------------
    if (req.method === 'GET') {
      const isAllowed = await applyRateLimit(req, res, { type: 'PUBLIC' });
      if (!isAllowed) return;

      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing profile ID' });

      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      let profile = null;
      const { data: pData } = await adminClient.from('profiles').select('*').eq('user_id', id).single();
      if (pData) profile = pData;

      const { data: userData } = await adminClient.auth.admin.getUserById(id);
      let finalProfile = { ...profile, user_id: id };
      
      if (userData?.user?.user_metadata) {
        const meta = userData.user.user_metadata;
        if (!finalProfile.name) finalProfile.name = meta.full_name || meta.name || userData.user.email.split('@')[0];
        if (!finalProfile.linkedin_url) finalProfile.linkedin_url = meta.linkedin_url;
        if (!finalProfile.headline) finalProfile.headline = meta.headline;
        if (!finalProfile.location) finalProfile.location = meta.location;
        if (!finalProfile.username) finalProfile.username = meta.username;
        if (!finalProfile.bio) finalProfile.bio = meta.bio;
        if (!finalProfile.github_url) finalProfile.github_url = meta.github_url;
        if (!finalProfile.portfolio_url) finalProfile.portfolio_url = meta.portfolio_url;
      }

      const { data: skills } = await adminClient.from('user_skills').select('proficiency, skill:skills(id, name, category)').eq('user_id', id);
      const { data: workspaces } = await adminClient.from('workspaces').select('id, project_name, problem_statement, tech_stack, github_url, hackathon:hackathons(id, title)').eq('user_id', id).not('project_name', 'is', null);
      const { data: certificates } = await adminClient.from('certificates').select('id, title, issuer, certificate_date, description, hackathon:hackathons(id, title)').eq('user_id', id);

      return res.status(200).json({
        profile: finalProfile,
        skills: skills || [],
        projects: workspaces || [],
        achievements: certificates || []
      });
    }

    // -----------------------------------------------------
    // POST: Rate Limit Authentication Attempt
    // -----------------------------------------------------
    if (req.method === 'POST') {
      const { action = 'auth', email = '', status = 'attempt' } = req.body || {};
      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

      if (status === 'success' && cleanEmail) {
        await resetRateLimit('auth', cleanEmail);
        return res.status(200).json({ allowed: true, status: 'cleared' });
      }

      const isAllowed = await applyRateLimit(req, res, { type: 'AUTH', identifier: cleanEmail || null });
      if (!isAllowed) return;

      return res.status(200).json({ allowed: true, action });
    }

    // -----------------------------------------------------
    // DELETE: Delete Account
    // -----------------------------------------------------
    if (req.method === 'DELETE') {
      const isAllowed = await applyRateLimit(req, res, { type: 'AUTH' });
      if (!isAllowed) return;

      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

      const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

      if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });

      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error("Error deleting user:", deleteError);
        return res.status(500).json({ error: 'Failed to delete account' });
      }

      return res.status(200).json({ success: true, message: 'Account deleted successfully' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (err) {
    console.error('User Actions Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
