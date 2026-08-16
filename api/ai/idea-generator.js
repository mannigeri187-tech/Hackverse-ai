import { authenticateServerRequest, sanitizeEnvString } from '../shared/supabase.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// In-memory cache for generated ideas (3-minute TTL)
const ideaCache = new Map();

export default async function handler(req, res) {
  // Setup CORS & anti-caching headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = sanitizeEnvString(process.env.GEMINI_API_KEY);
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
      teamContext,
      generationNonce
    } = req.body;

    if (!hackathon || !hackathon.title) {
      return res.status(400).json({ error: 'Selected hackathon details are required.' });
    }

    // 3. Assemble Prompt
    const hackathonInfo = `
Target Hackathon: "${hackathon.title}"
Theme / Description: "${hackathon.description || 'Open Innovation & Technical Excellence'}"
Mode: "${hackathon.mode || 'Online'}"
`;

    const skillsInfo = skills && skills.length > 0
      ? `Participant Skills: ${skills.map(s => typeof s === 'string' ? s : (s.skill?.name || s.name || '')).filter(Boolean).join(', ')}`
      : 'Participant Skills: Full-Stack Web Development, React, Node.js, AI/ML, Cloud';

    const existingProject = workspaceContext
      ? `Existing Workspace/Idea in Progress: "${workspaceContext.project_name || ''}" - ${workspaceContext.problem_statement || ''}`
      : '';

    const prompt = `You are an elite hackathon mentor and technical judge specializing in generating winning MVP project concepts.

You are generating a fresh set of hackathon project ideas.
Session Nonce / Request Seed: ${generationNonce || `${Date.now()}-${Math.random()}`}

Generate exactly 3 genuinely different, novel, and high-impact ideas.
Do NOT reuse, repeat, paraphrase, or slightly modify previous ideas.
Avoid cliché or generic concepts.

Each idea must have a distinct:
- problem domain & target audience
- technical architecture & novel solution approach
- concrete MVP scope achievable in a 24-48 hour hackathon
- distinct technology combination
- clear judging advantage / winning factor

CONTEXT:
${hackathonInfo}
${skillsInfo}
${existingProject}

Respond STRICTLY with a JSON object matching this schema:
{
  "ideas": [
    {
      "title": "Short Catchy Project Title",
      "problem_statement": "Clear, specific 1-2 sentence problem description.",
      "proposed_solution": "Concrete MVP solution description explaining what gets built.",
      "target_users": ["Target Persona 1", "Target Persona 2"],
      "core_mvp_features": ["Feature 1", "Feature 2", "Feature 3"],
      "recommended_tech_stack": ["React", "TypeScript", "Node.js", "Supabase", "Gemini API"],
      "suggested_team_roles": ["Frontend Engineer", "Backend / AI Engineer", "UI/UX Designer"],
      "difficulty": "Intermediate",
      "why_it_fits_hackathon": "Why this solution directly targets the hackathon problem statement and theme.",
      "judging_strengths": ["High technical complexity", "Immediate real-world utility", "Clean live demo potential"],
      "risks": ["API rate limiting during demo", "Scope creep on real-time features"],
      "estimated_build_time": "18-24 hours"
    }
  ]
}

Difficulty must be one of: "Beginner", "Intermediate", "Advanced".
Return exactly 3 ideas in the "ideas" array.
Return ONLY valid JSON. No markdown formatting, no conversational text.`;

    // 4. Generate with Gemini with active models
    const genAI = new GoogleGenerativeAI(apiKey);
    const activeModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let text = '';
    let lastError = null;

    for (const modelName of activeModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.85
          }
        });
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

    // Normalize each idea object to guarantee all UI fields exist safely
    const normalizedIdeas = parsed.ideas.slice(0, 3).map((item, idx) => ({
      title: String(item.title || `Hackathon Project Concept #${idx + 1}`),
      problem_statement: String(item.problem_statement || item.problem || 'Specific hackathon problem statement being addressed.'),
      proposed_solution: String(item.proposed_solution || item.solution || 'Practical MVP solution designed for hackathon judging.'),
      target_users: Array.isArray(item.target_users) ? item.target_users : ['Hackathon Judges', 'End Users'],
      core_mvp_features: Array.isArray(item.core_mvp_features || item.mvp_features) ? (item.core_mvp_features || item.mvp_features) : ['Core MVP Workflow', 'Interactive Dashboard', 'AI Integration'],
      recommended_tech_stack: Array.isArray(item.recommended_tech_stack || item.tech_stack) ? (item.recommended_tech_stack || item.tech_stack) : ['React', 'TypeScript', 'TailwindCSS', 'Supabase'],
      suggested_team_roles: Array.isArray(item.suggested_team_roles) ? item.suggested_team_roles : ['Frontend Developer', 'Backend / AI Engineer'],
      difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(item.difficulty) ? item.difficulty : 'Intermediate',
      why_it_fits_hackathon: String(item.why_it_fits_hackathon || item.winning_factor || `Aligns directly with ${hackathon.title} judging criteria.`),
      judging_strengths: Array.isArray(item.judging_strengths) ? item.judging_strengths : [item.winning_factor || 'Strong live demonstration potential', 'Actionable user workflow'],
      risks: Array.isArray(item.risks) ? item.risks : ['Time constraint for edge case handling', 'External API latency'],
      estimated_build_time: String(item.estimated_build_time || '20-28 hours')
    }));

    return res.status(200).json({ ideas: normalizedIdeas });
  } catch (err) {
    console.error('Idea Generator API Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'Unable to generate ideas at this time. Please try again.',
      details: err?.message || 'Server error'
    });
  }
}
