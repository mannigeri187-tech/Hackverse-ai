import { authenticateServerRequest } from '../_shared/supabase.js';
import { checkFeatureAccess } from '../_shared/usage.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://hackverse-ai.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const { user, error: authError } = await authenticateServerRequest(req);
    if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });

    const { feature } = req.body;
    
    // Enforce feature access before a client-side upload or action
    const usageCheck = await checkFeatureAccess({ userId: user.id, feature });
    if (!usageCheck.allowed) {
      return res.status(usageCheck.status).json(usageCheck);
    }
    
    return res.status(200).json({ allowed: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
