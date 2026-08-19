import { authenticateServerRequest, sanitizeEnvString } from '../shared/supabase.js';
import { applyRateLimit } from '../shared/rateLimiter.js';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Strict OpenAPI-compliant structured response schema
const IDEA_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    ideas: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          problem_statement: { type: SchemaType.STRING },
          proposed_solution: { type: SchemaType.STRING },
          target_users: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          core_mvp_features: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          recommended_tech_stack: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          suggested_team_roles: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          difficulty: { type: SchemaType.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
          why_it_fits_hackathon: { type: SchemaType.STRING },
          judging_strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          risks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          estimated_build_time: { type: SchemaType.STRING }
        },
        required: [
          'title', 'problem_statement', 'proposed_solution', 'target_users',
          'core_mvp_features', 'recommended_tech_stack', 'suggested_team_roles',
          'difficulty', 'why_it_fits_hackathon', 'judging_strengths', 'risks', 'estimated_build_time'
        ]
      }
    }
  },
  required: ['ideas']
};

// Module-level memoized Gemini client and model singleton
let cachedGenAI = null;
let cachedApiKey = '';
let cachedIdeaModel = null;

function getIdeaModel(apiKey) {
  if (!cachedGenAI || cachedApiKey !== apiKey || !cachedIdeaModel) {
    cachedGenAI = new GoogleGenerativeAI(apiKey);
    cachedApiKey = apiKey;
    cachedIdeaModel = cachedGenAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: IDEA_RESPONSE_SCHEMA,
        temperature: 0.7,
        maxOutputTokens: 2500
      }
    });
  }
  return cachedIdeaModel;
}

export default async function handler(req, res) {
  const reqStart = performance.now();
  console.log('[IDEA-PERF] request started');

  // Setup CORS & strict anti-caching headers (NEVER cache idea generations)
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
    // 1. Authenticate user from Bearer token with fast in-memory cache
    const tAuthStart = performance.now();
    const { user, error: authError } = await authenticateServerRequest(req);
    const authDuration = performance.now() - tAuthStart;
    console.log(`[IDEA-PERF] auth completed: ${authDuration.toFixed(1)} ms`);

    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized user session.' });
    }

    // 2. Database & Rate Limiting Check
    const tDbStart = performance.now();
    const isAllowed = await applyRateLimit(req, res, {
      type: 'AI',
      identifier: user.id
    });
    const dbDuration = performance.now() - tDbStart;
    console.log(`[IDEA-PERF] database/context completed: ${dbDuration.toFixed(1)} ms`);

    if (!isAllowed) return;

    // 3. Extract and validate request payload
    const { 
      hackathon, 
      skills = [], 
      workspaceContext, 
      previousIdeaTitles = [],
      generationNonce
    } = req.body || {};

    if (!hackathon || !hackathon.title) {
      return res.status(400).json({ error: 'Selected hackathon details are required.' });
    }

    // 4. Assemble Streamlined Prompt
    const hackathonTitle = String(hackathon.title || 'Hackathon').trim();
    const hackathonDesc = String(hackathon.description || 'Open Innovation').slice(0, 200).trim();
    const skillsList = Array.isArray(skills) && skills.length > 0
      ? skills.map(s => typeof s === 'string' ? s : (s.skill?.name || s.name || '')).filter(Boolean).slice(0, 6).join(', ')
      : 'Full-Stack Web, AI/ML';

    const existingProject = workspaceContext && workspaceContext.project_name
      ? `Current Project: "${workspaceContext.project_name}"`
      : '';

    const previousExclusions = Array.isArray(previousIdeaTitles) && previousIdeaTitles.length > 0
      ? `Exclude previous titles: ${previousIdeaTitles.slice(0, 8).join(', ')}`
      : '';

    const prompt = `You are an elite hackathon mentor and technical judge.
Generate exactly 3 novel, winning hackathon MVP project concepts for:
Target Hackathon: "${hackathonTitle}" (${hackathonDesc})
Participant Skills: ${skillsList}
Nonce: ${generationNonce || `${Date.now()}-${Math.random()}`}
${existingProject}
${previousExclusions}

Requirements:
1. Generate exactly 3 distinct, fresh ideas.
2. Be crisp and high-impact (1-2 clear sentences per field). Max 3-4 bullet items per array.
3. Realistic 24-36h hackathon MVP scope.
4. Output strictly structured JSON conforming to the schema.`;

    // 5. Generate with Gemini using fastest flash-lite model & singleton client
    const tGeminiStart = performance.now();
    const model = getIdeaModel(apiKey);
    const modelName = 'gemini-3.5-flash-lite';
    let text = '';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text().trim();

    const geminiDuration = performance.now() - tGeminiStart;

    if (!text) {
      throw new Error('Failed to generate ideas from AI model.');
    }

    // 6. JSON Parsing & Validation
    const tParseStart = performance.now();
    const cleanText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleanText);
    const parseDuration = performance.now() - tParseStart;

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

    const totalDuration = performance.now() - reqStart;
    const processingDuration = totalDuration - authDuration - dbDuration - geminiDuration;

    // Exact required performance block
    console.log(`[IDEA-PERF]\nauth=${authDuration.toFixed(1)}ms\ncontext=${dbDuration.toFixed(1)}ms\ngemini=${geminiDuration.toFixed(1)}ms\nprocessing=${processingDuration.toFixed(1)}ms\ntotal=${totalDuration.toFixed(1)}ms`);

    return res.status(200).json({ 
      ideas: normalizedIdeas,
      perf: {
        totalMs: Math.round(totalDuration),
        geminiMs: Math.round(geminiDuration),
        authMs: Math.round(authDuration),
        contextMs: Math.round(dbDuration),
        parseMs: Math.round(parseDuration),
        model: modelName
      }
    });
  } catch (err) {
    console.error('Idea Generator API Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'Unable to generate ideas at this time. Please try again.',
      details: err?.message || 'Server error'
    });
  }
}



