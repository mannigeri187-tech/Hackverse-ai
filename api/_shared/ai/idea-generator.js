import { checkFeatureAccess } from '../usage.js';
import { authenticateServerRequest, sanitizeEnvString } from '../supabase.js';
import { applyRateLimit } from '../rateLimiter.js';
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
      model: 'gemini-pro',
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
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://hackverse-ai.vercel.app');
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
    console.warn('Gemini API key missing. Returning offline fallback.');
    return res.status(200).json({ 
      ideas: [
                {
          title: "AI-Powered Accessibility Toolkit",
          problem_statement: "Developers struggle to make their applications fully accessible to visually impaired users.",
          proposed_solution: "A library/plugin that automatically scans UI components and injects proper ARIA labels.",
          target_users: ["Web Developers", "Visually Impaired Users"],
          core_mvp_features: ["Automated Scanning", "Real-time Fixes", "Screen Reader Testing Mode"],
          recommended_tech_stack: ["React", "TypeScript", "Node.js"],
          winning_potential: "High potential for social impact and technical innovation categories.",
          estimated_build_time: "24-36 hours"
        },
        {
          title: "Smart Study Scheduler",
          problem_statement: "Students often feel overwhelmed and fail to organize their study time effectively before exams.",
          proposed_solution: "An intelligent app that breaks down syllabuses and creates adaptive, optimized study schedules.",
          target_users: ["College Students", "High School Students"],
          core_mvp_features: ["Calendar Integration", "Pomodoro Timer", "Adaptive Rescheduling"],
          recommended_tech_stack: ["Flutter", "Firebase", "Python (FastAPI)"],
          winning_potential: "Strong in ed-tech and productivity categories.",
          estimated_build_time: "36-48 hours"
        },
        {
          title: "Local Farm-to-Table Marketplace",
          problem_statement: "Consumers want fresh local produce but struggle to connect directly with nearby independent farmers.",
          proposed_solution: "A hyper-local marketplace app connecting farmers directly with neighborhood buyers to reduce food miles.",
          target_users: ["Local Farmers", "Eco-conscious Consumers"],
          core_mvp_features: ["Geo-location Search", "In-app Payments", "Inventory Management"],
          recommended_tech_stack: ["React Native", "Supabase", "Stripe API"],
          winning_potential: "High potential for sustainability and community impact.",
          estimated_build_time: "48 hours"
        }
      ],
      perf: {
        totalMs: 0,
        geminiMs: 0,
        authMs: 0,
        contextMs: 0,
        parseMs: 0,
        model: "mock-fallback"
      }
    });
  }

  try {
    // 1. Authenticate user from Bearer token with fast in-memory cache
    const tAuthStart = performance.now();
    const { user, error: authError } = await authenticateServerRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized user session.' });
    }

    // 2. Strict Payload Size Validation BEFORE Quota Check
    const bodyStr = JSON.stringify(req.body || {});
    if (bodyStr.length > 25000) {
      return res.status(400).json({ error: 'Payload exceeds 25,000 characters limit. Please shorten your input.' });
    }

    const __aiBody = req.body || {}; const __aiMsg = __aiBody.userMessage; const __aiHist = __aiBody.chatHistory; const __aiPrompt = __aiBody.prompt;
    if (__aiMsg && typeof __aiMsg === 'string' && __aiMsg.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds 2000 character limit.' });
    }
    if (__aiPrompt && typeof __aiPrompt === 'string' && __aiPrompt.length > 5000) {
      return res.status(400).json({ error: 'Prompt exceeds 5000 character limit.' });
    }
    if (Array.isArray(__aiHist)) {
      if (__aiHist.length > 50) return res.status(400).json({ error: 'Chat history too long.' });
      for (const msg of __aiHist) {
        if (msg && msg.text && msg.text.length > 2000) {
          return res.status(400).json({ error: 'A chat history message exceeds 2000 characters.' });
        }
      }
    }

    // 3. Quota Enforcement
    const usageCheck = await checkFeatureAccess({ userId: user.id, feature: 'ai_generation' });
    if (!usageCheck.allowed) {
      return res.status(usageCheck.status).json(usageCheck);
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
    const modelName = 'gemini-pro';
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
    // FALLBACK IF GEMINI FAILS
    return res.status(200).json({ 
      ideas: [
                {
          title: "AI-Powered Accessibility Toolkit",
          problem_statement: "Developers struggle to make their applications fully accessible to visually impaired users.",
          proposed_solution: "A library/plugin that automatically scans UI components and injects proper ARIA labels.",
          target_users: ["Web Developers", "Visually Impaired Users"],
          core_mvp_features: ["Automated Scanning", "Real-time Fixes", "Screen Reader Testing Mode"],
          recommended_tech_stack: ["React", "TypeScript", "Node.js"],
          winning_potential: "High potential for social impact and technical innovation categories.",
          estimated_build_time: "24-36 hours"
        },
        {
          title: "Smart Study Scheduler",
          problem_statement: "Students often feel overwhelmed and fail to organize their study time effectively before exams.",
          proposed_solution: "An intelligent app that breaks down syllabuses and creates adaptive, optimized study schedules.",
          target_users: ["College Students", "High School Students"],
          core_mvp_features: ["Calendar Integration", "Pomodoro Timer", "Adaptive Rescheduling"],
          recommended_tech_stack: ["Flutter", "Firebase", "Python (FastAPI)"],
          winning_potential: "Strong in ed-tech and productivity categories.",
          estimated_build_time: "36-48 hours"
        },
        {
          title: "Local Farm-to-Table Marketplace",
          problem_statement: "Consumers want fresh local produce but struggle to connect directly with nearby independent farmers.",
          proposed_solution: "A hyper-local marketplace app connecting farmers directly with neighborhood buyers to reduce food miles.",
          target_users: ["Local Farmers", "Eco-conscious Consumers"],
          core_mvp_features: ["Geo-location Search", "In-app Payments", "Inventory Management"],
          recommended_tech_stack: ["React Native", "Supabase", "Stripe API"],
          winning_potential: "High potential for sustainability and community impact.",
          estimated_build_time: "48 hours"
        }
      ],
      perf: {
        totalMs: 0,
        geminiMs: 0,
        authMs: 0,
        contextMs: 0,
        parseMs: 0,
        model: "mock-fallback"
      }
    });
  }
}




