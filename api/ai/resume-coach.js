import { authenticateServerRequest, sanitizeEnvString } from '../_shared/supabase.js';
import { applyRateLimit } from '../_shared/rateLimiter.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

let cachedGenAI = null;
let cachedApiKey = '';
let cachedModel = null;

function getCoachModel(apiKey) {
  if (!cachedGenAI || cachedApiKey !== apiKey) {
    cachedGenAI = new GoogleGenerativeAI(apiKey);
    cachedApiKey = apiKey;
    cachedModel = cachedGenAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        temperature: 0.2, // Low temperature for deterministic/factual responses
        responseMimeType: "application/json" // Force strict JSON output
      }
    });
  }
  return cachedModel;
}

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

  const apiKey = sanitizeEnvString(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured.' });
  }

  try {
    // Verify user session
    const { user, error: authError } = await authenticateServerRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized user session.' });
    }

    // Apply Rate Limiting
    const isAllowed = await applyRateLimit(req, res, {
      type: 'AI',
      identifier: user.id
    });
    if (!isAllowed) return;

    const { resumeData, atsResult } = req.body || {};

    if (!resumeData || !atsResult) {
      return res.status(400).json({ error: 'Missing required resume data or ATS results.' });
    }

    // Prepare compact prompt payload to save tokens
    const analysisPayload = {
      summary: resumeData.summary || '',
      skills: resumeData.skills || [],
      experience: (resumeData.experience || []).map(e => ({ id: e.id, title: e.title, description: e.description })),
      projects: (resumeData.projects || []).filter(p => p.included).map(p => ({ id: p.id, name: p.name, description: p.description, tech: p.technologies })),
      atsScore: atsResult.totalScore,
      atsWeaknesses: atsResult.improvements.slice(0, 3).map(i => i.message)
    };

    const systemPrompt = `You are a strict, professional AI Resume Coach. Analyze the provided JSON resume data and ATS scores.
CRITICAL RULES:
1. NEVER invent facts, metrics, skills, names, dates, or jobs.
2. Only suggest improvements based strictly on existing text. Do not make up outcomes.
3. Output MUST be valid JSON matching this schema exactly:
{
  "overallAssessment": "string (2-3 sentences)",
  "sectionFeedback": [
    {
      "section": "summary|skills|experience|projects|education",
      "severity": "high|medium|low",
      "issue": "string",
      "recommendation": "string"
    }
  ],
  "suggestions": [
    {
      "section": "summary|experience|projects",
      "itemId": "string (the exact id from the payload, or 'summary')",
      "field": "description|summary",
      "originalText": "string (must exactly match input)",
      "suggestedText": "string (improved wording WITHOUT inventing new facts)",
      "reason": "string"
    }
  ]
}

Focus primarily on identifying weak verbs, poor formatting, generic descriptions, or missing technical specificity.
Only provide a maximum of 3 concrete suggestions.`;

    const userPrompt = `Payload: ${JSON.stringify(analysisPayload)}`;
    
    const model = getCoachModel(apiKey);
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);
    
    const responseText = result.response.text().trim();
    
    // Validate JSON parsing
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse AI Coach response:', responseText);
      return res.status(500).json({ error: 'AI returned malformed data.' });
    }

    return res.status(200).json(parsedResponse);
  } catch (err) {
    console.error('AI Resume Coach Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'AI Resume Coach is temporarily unavailable.',
      details: err?.message || 'Server error'
    });
  }
}
