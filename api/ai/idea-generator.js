import { authenticateServerRequest } from '../shared/supabase.js';
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
    const { user, error: authError } = await authenticateServerRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized user session.' });
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

    // 3. Assemble Prompt
    const hackathonInfo = `
Target Hackathon: ${hackathon.title}
Theme / Description: ${hackathon.description || 'Open Innovation'}
Mode: ${hackathon.mode || 'Online'}
`;

    const skillsInfo = skills && skills.length > 0
      ? `Participant Skills: ${skills.map(s => typeof s === 'string' ? s : (s.skill?.name || s.name || '')).filter(Boolean).join(', ')}`
      : 'Participant Skills: General Full-stack Developer';

    const existingProject = workspaceContext
      ? `Existing Workspace/Idea in Progress: "${workspaceContext.project_name || ''}" - ${workspaceContext.problem_statement || ''}`
      : '';

    const prompt = `You are a hackathon mentor specializing in generating winning MVP concepts.
Based on the hackathon details and participant skills provided, generate 3 to 5 realistic, buildable 24-48h hackathon ideas.

${hackathonInfo}
${skillsInfo}
${existingProject}

Requirements:
- Each idea must be buildable within 24 to 48 hours.
- Clearly define the problem, solution, MVP feature set, recommended tech stack, and why it appeals to judges.
- Categorize difficulty as 'Beginner', 'Intermediate', or 'Advanced'.

Respond STRICTLY with a JSON object matching this schema:
{
  "ideas": [
    {
      "title": "Clear catchy title",
      "tagline": "One sentence punchy summary",
      "problem": "Specific problem statement being solved",
      "solution": "Concrete solution description",
      "mvp_features": ["Feature 1", "Feature 2", "Feature 3"],
      "tech_stack": ["React", "Node.js", "Supabase"],
      "difficulty": "Intermediate",
      "winning_factor": "Why this idea stands out to hackathon judges"
    }
  ]
}

Return ONLY valid JSON. No conversational intro, no markdown formatting.`;

    // 4. Generate with Gemini with active models
    const genAI = new GoogleGenerativeAI(apiKey);
    const activeModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let text = '';
    let lastError = null;

    for (const modelName of activeModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text().trim();
        if (text) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!text) {
      throw lastError || new Error('Failed to generate ideas from AI model.');
    }

    const cleanText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleanText);

    if (!parsed.ideas || !Array.isArray(parsed.ideas)) {
      throw new Error('Invalid JSON format received from AI model.');
    }

    const responsePayload = { ideas: parsed.ideas };

    // Cache the result
    ideaCache.set(cacheKey, {
      data: responsePayload,
      timestamp: Date.now()
    });

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error('Idea Generator API Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'Unable to generate ideas at this time. Please try again.',
      details: err?.message || 'Server error'
    });
  }
}
