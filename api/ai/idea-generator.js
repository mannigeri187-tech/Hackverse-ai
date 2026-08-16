import { supabase } from '../shared/supabase.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// In-memory cache for generated ideas (3-minute TTL)
const ideaCache = new Map();

export default async function handler(req, res) {
  // Setup CORS
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on server.' });
  }

  try {
    // 1. Authenticate user from Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    // 2. Extract and validate request payload
    const { 
      hackathon, 
      skills = [], 
      workspaceContext, 
      teamContext 
    } = req.body;

    if (!hackathon || !hackathon.title) {
      return res.status(400).json({ error: 'Selected hackathon details are required.' });
    }

    // Check user-isolated idea cache
    const cacheKey = `idea:${user.id}:${hackathon.id || hackathon.title}`;
    const cached = ideaCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 180000) {
      return res.status(200).json(cached.data);
    }

    // 3. Assemble Minimal Sanitized Context
    const hackathonTitle = String(hackathon.title).slice(0, 80);
    const hackathonDesc = String(hackathon.description || 'General technology hackathon').slice(0, 400);
    const userSkills = Array.isArray(skills) && skills.length > 0
      ? skills.slice(0, 8).map(s => typeof s === 'string' ? s : s.name || s.skill?.name).filter(Boolean).join(', ')
      : 'General Full-stack';

    const prompt = `You are an AI Hackathon Idea Generator.
Target Hackathon: "${hackathonTitle}"
Theme: "${hackathonDesc}"
User Skills: ${userSkills}
${workspaceContext?.project_name ? `Existing Idea Draft: "${workspaceContext.project_name}"` : ''}

TASK:
Generate exactly 3 practical, innovative, 24-48h hackathon project ideas.
Difficulty: "Beginner", "Intermediate", or "Advanced".

Return STRICTLY valid JSON:
{
  "ideas": [
    {
      "title": "Catchy Title",
      "problem_statement": "2-sentence pain point",
      "proposed_solution": "2-sentence MVP solution",
      "target_users": ["User Group 1"],
      "core_mvp_features": ["Feature 1", "Feature 2", "Feature 3"],
      "recommended_tech_stack": ["React", "Node.js", "Supabase"],
      "suggested_team_roles": ["Frontend Dev", "Backend Dev"],
      "difficulty": "Intermediate",
      "why_it_fits_hackathon": "Judging alignment rationale",
      "judging_strengths": ["Novelty", "Utility", "Tech Depth"],
      "risks": ["API quota", "Time limit"],
      "estimated_build_time": "24 hours"
    }
  ]
}`;

    // 4. Generate Ideas with 10-second timeout & model fallback
    const genAI = new GoogleGenerativeAI(apiKey);
    const activeModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let rawText = '';
    let lastError = null;

    for (const modelName of activeModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 1400,
            temperature: 0.5
          }
        });

        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Idea generation timed out')), 10000))
        ]);

        const response = await result.response;
        rawText = response.text().trim();
        if (rawText) break;
      } catch (geminiErr) {
        lastError = geminiErr;
      }
    }

    if (!rawText) {
      throw lastError || new Error('Failed to generate response from Gemini AI');
    }

    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsedData = JSON.parse(cleaned);

    // Save in memory cache
    ideaCache.set(cacheKey, { data: parsedData, timestamp: Date.now() });
    if (ideaCache.size > 200) ideaCache.delete(ideaCache.keys().next().value);

    return res.status(200).json(parsedData);
  } catch (err) {
    console.error('AI Idea Generator Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'Unable to generate ideas at this time. Please try again.',
      details: err?.message || 'Server error'
    });
  }
}
