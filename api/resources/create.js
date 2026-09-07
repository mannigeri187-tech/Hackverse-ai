import { authenticateServerRequest } from '../_shared/supabase.js';
import { checkFeatureAccess } from '../_shared/usage.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user, error: authError } = await authenticateServerRequest(req);
    if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });

    const { table, payload, selectQuery = '*' } = req.body;

    const featureMap = {
      workspaces: 'max_projects',
      certificates: 'max_certificates',
      resumes: 'max_resumes',
      user_skills: 'max_skills'
    };
    
    if (!Object.keys(featureMap).includes(table)) {
      return res.status(403).json({ error: 'Forbidden. Table insertion not allowed via this endpoint.' });
    }

    const feature = featureMap[table];
    const usageCheck = await checkFeatureAccess({ userId: user.id, feature });
    if (!usageCheck.allowed) {
      return res.status(usageCheck.status).json(usageCheck);
    }

    // Also trigger resume_generation quota if generating a new resume
    if (table === 'resumes') {
      const resumeCheck = await checkFeatureAccess({ userId: user.id, feature: 'resume_generation' });
      if (!resumeCheck.allowed) return res.status(resumeCheck.status).json(resumeCheck);
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data, error } = await supabase
      .from(table)
      .insert({ ...payload, user_id: user.id })
      .select(selectQuery)
      .single();
      
    if (error) {
      if (error.code === '23505' || error.message.includes('unique')) {
        return res.status(409).json({ error: error.message, code: error.code });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Resource create error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
