import { applyRateLimit } from '../_shared/rateLimiter.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const isAllowed = await applyRateLimit(req, res, { type: 'PUBLIC' });
  if (!isAllowed) return;

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Missing profile ID' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Use admin client to bypass RLS for public read
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Try to fetch profile from public table (ignoring missing column errors safely)
    let profile = null;
    const { data: pData, error: pError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    
    if (pData) profile = pData;

    // Since migration might not be run yet, also fetch from auth.users to fallback to user_metadata
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(id);
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

    // Fetch skills
    const { data: skills } = await adminClient
      .from('user_skills')
      .select('proficiency, skill:skills(id, name, category)')
      .eq('user_id', id);

    // Fetch workspaces (public projects)
    const { data: workspaces } = await adminClient
      .from('workspaces')
      .select('id, project_name, problem_statement, tech_stack, github_url, hackathon:hackathons(id, title)')
      .eq('user_id', id)
      .not('project_name', 'is', null);

    // Fetch certificates (wins/achievements)
    const { data: certificates } = await adminClient
      .from('certificates')
      .select('id, title, issuer, certificate_date, description, hackathon:hackathons(id, title)')
      .eq('user_id', id);

    return res.status(200).json({
      profile: finalProfile,
      skills: skills || [],
      projects: workspaces || [],
      achievements: certificates || []
    });
  } catch (err) {
    console.error('Public Profile Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
