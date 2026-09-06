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

    const analysisPayload = {
      summary: resumeData.summary || '',
      skills: resumeData.skills || [],
      experience: (resumeData.experience || []).map(e => ({ id: e.id, title: e.title, description: e.description })),
      projects: (resumeData.projects || []).filter(p => p.included).map(p => ({ id: p.id, name: p.name, description: p.description, tech: p.technologies })),
      hackathons: (resumeData.hackathons || []).filter(h => h.included).map(h => ({ name: h.name, project: h.project })),
      certifications: (resumeData.certifications || []).filter(c => c.included).map(c => ({ title: c.title })),
      education: (resumeData.education || []).map(e => ({ degree: e.degree, institution: e.institution })),
      atsScore: atsResult.totalScore,
      atsWeaknesses: atsResult.improvements.slice(0, 3).map(i => i.message)
    };

    const systemPrompt = `You are a strict, professional AI Resume Coach. Analyze the JSON resume data and ATS scores.
CRITICAL RULES:
1. ANTI-HALLUCINATION: NEVER invent numbers, percentages, users, revenue, rankings, awards, employers, job titles, dates, technologies, responsibilities, or degrees. If a metric does not exist, tell the user what is missing; do NOT fabricate it.
2. Only suggest improvements based strictly on existing text. Do not make up outcomes.
3. Output MUST be valid JSON matching this schema exactly:
{
  "overallAssessment": "string (2-3 sentences)",
  "strengths": ["string", "string"],
  "prioritySummary": [
    {
      "priority": "high" | "medium" | "low",
      "issue": "string",
      "recommendation": "string"
    }
  ],
  "sectionFeedback": [
    {
      "section": "summary" | "skills" | "experience" | "projects" | "hackathons" | "education" | "achievements" | "certifications",
      "severity": "high" | "medium" | "low",
      "feedback": "string"
    }
  ],
  "suggestions": [
    {
      "section": "summary" | "experience" | "projects",
      "itemId": "string (the exact id from the payload, or null if none)",
      "severity": "high" | "medium" | "low",
      "issue": "string",
      "recommendation": "string",
      "originalText": "string (must exactly match input)",
      "suggestedText": "string (improved wording WITHOUT inventing new facts)"
    }
  ]
}

Only provide a maximum of 5 high-priority suggestions, and 10 total.`;

    const userPrompt = `Payload: ${JSON.stringify(analysisPayload)}`;
    
    const model = getCoachModel(apiKey);
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);
    
    const responseText = result.response.text().trim();
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
      
      if (!parsedResponse || typeof parsedResponse !== 'object') throw new Error('Not an object');
      
      if (!Array.isArray(parsedResponse.strengths)) parsedResponse.strengths = [];
      if (!Array.isArray(parsedResponse.prioritySummary)) parsedResponse.prioritySummary = [];
      if (!Array.isArray(parsedResponse.sectionFeedback)) parsedResponse.sectionFeedback = [];
      if (!Array.isArray(parsedResponse.suggestions)) parsedResponse.suggestions = [];
      
      // Filter out invalid enum shapes
      parsedResponse.suggestions = parsedResponse.suggestions.filter(s => 
        ['summary', 'experience', 'projects'].includes(s.section) &&
        ['high', 'medium', 'low'].includes(s.severity) &&
        typeof s.originalText === 'string' &&
        typeof s.suggestedText === 'string'
      ).slice(0, 10);
      
      // Ensure required string fields exist
      if (typeof parsedResponse.overallAssessment !== 'string') {
        parsedResponse.overallAssessment = "Analysis complete. Review the suggestions below.";
      }
      
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
