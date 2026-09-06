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
      personal: {
        name: resumeData.personal?.name || '',
        email: resumeData.personal?.email || '',
        phone: resumeData.personal?.phone || '',
        location: resumeData.personal?.location || '',
        linkedin: resumeData.personal?.linkedin || '',
        github: resumeData.personal?.github || '',
        portfolio: resumeData.personal?.portfolio || ''
      },
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

    const systemPrompt = `You are a strict, professional ATS and AI Resume Coach. Analyze the JSON resume data and ATS scores.
CRITICAL RULES:
1. ANTI-HALLUCINATION: NEVER invent numbers, percentages, users, revenue, rankings, awards, employers, job titles, dates, technologies, responsibilities, or degrees. If a metric does not exist, tell the user what is missing; do NOT fabricate it.
2. COMPLETENESS: Check for missing information (Name, Email, Location, LinkedIn, Portfolio, etc.). Not all missing fields are errors (e.g. students might lack experience). Classify as HIGH, MEDIUM, LOW, or INFO.
3. BULLET QUALITY & ACTION VERBS: Detect weak descriptions (e.g. "Made a website", "Helped the team", "Worked on..."). Suggest stronger action verbs without changing the meaning. Do not invent metrics!
4. KEYWORD ANALYSIS: Identify technical keywords based ONLY on present information (e.g. React, Node.js). Do not claim a skill is missing unless there is legitimate contextual evidence.
5. ATS FORMATTING: Look for ATS risks (missing contact info, empty sections, extremely short descriptions). Say "Potential ATS concern" rather than definitively claiming it will fail.
6. Output MUST be valid JSON matching this schema exactly:
{
  "overallAssessment": "string (2-3 sentences)",
  "strengths": ["string", "string"],
  "prioritySummary": [
    {
      "priority": "high" | "medium" | "low" | "info",
      "issue": "string (WHAT is wrong and WHY it matters)",
      "recommendation": "string (WHAT the user should do)"
    }
  ],
  "sectionFeedback": [
    {
      "section": "summary" | "skills" | "experience" | "projects" | "hackathons" | "education" | "achievements" | "certifications" | "personal",
      "severity": "high" | "medium" | "low" | "info",
      "feedback": "string"
    }
  ],
  "suggestions": [
    {
      "section": "summary" | "experience" | "projects",
      "itemId": "string (exact id) or null",
      "severity": "high" | "medium" | "low" | "info",
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
      
      if (!parsedResponse || typeof parsedResponse !== 'object' || Array.isArray(parsedResponse)) {
        throw new Error('Not a valid JSON object');
      }
      
      // Validate overallAssessment
      if (typeof parsedResponse.overallAssessment !== 'string') {
        parsedResponse.overallAssessment = "Analysis complete. Review the suggestions below.";
      }
      if (parsedResponse.overallAssessment.length > 2000) {
        parsedResponse.overallAssessment = parsedResponse.overallAssessment.substring(0, 2000);
      }
      
      // Validate strengths
      if (Array.isArray(parsedResponse.strengths)) {
        parsedResponse.strengths = parsedResponse.strengths.filter(s => typeof s === 'string').map(s => s.substring(0, 500));
      } else {
        parsedResponse.strengths = [];
      }

      // Validate prioritySummary
      if (Array.isArray(parsedResponse.prioritySummary)) {
        parsedResponse.prioritySummary = parsedResponse.prioritySummary.filter(p => 
          ['high', 'medium', 'low', 'info'].includes(p.priority) &&
          typeof p.issue === 'string' &&
          typeof p.recommendation === 'string'
        ).map(p => ({
          priority: p.priority,
          issue: p.issue.substring(0, 500),
          recommendation: p.recommendation.substring(0, 1000)
        }));
      } else {
        parsedResponse.prioritySummary = [];
      }

      // Validate sectionFeedback
      const validSections = ['summary', 'skills', 'experience', 'projects', 'hackathons', 'education', 'achievements', 'certifications', 'personal'];
      if (Array.isArray(parsedResponse.sectionFeedback)) {
        parsedResponse.sectionFeedback = parsedResponse.sectionFeedback.filter(fb =>
          validSections.includes(fb.section) &&
          ['high', 'medium', 'low', 'info'].includes(fb.severity) &&
          typeof fb.feedback === 'string'
        ).map(fb => ({
          section: fb.section,
          severity: fb.severity,
          feedback: fb.feedback.substring(0, 1500)
        }));
      } else {
        parsedResponse.sectionFeedback = [];
      }
      
      // Collect valid item IDs to prevent targeted injection
      const validExpIds = new Set((resumeData.experience || []).map(e => e.id));
      const validProjIds = new Set((resumeData.projects || []).filter(p => p.included).map(p => p.id));
      
      // Validate suggestions
      if (Array.isArray(parsedResponse.suggestions)) {
        parsedResponse.suggestions = parsedResponse.suggestions.filter(s => {
          if (!['summary', 'experience', 'projects'].includes(s.section)) return false;
          if (!['high', 'medium', 'low', 'info'].includes(s.severity)) return false;
          if (typeof s.issue !== 'string' || typeof s.recommendation !== 'string') return false;
          if (typeof s.originalText !== 'string' || typeof s.suggestedText !== 'string') return false;
          
          // ID Security validation
          if (s.section === 'summary') {
            if (s.itemId !== 'summary' && s.itemId !== null) return false;
          } else if (s.section === 'experience') {
            if (typeof s.itemId !== 'string' || !validExpIds.has(s.itemId)) return false;
          } else if (s.section === 'projects') {
            if (typeof s.itemId !== 'string' || !validProjIds.has(s.itemId)) return false;
          }
          
          return true;
        }).map(s => ({
          ...s,
          issue: s.issue.substring(0, 500),
          recommendation: s.recommendation.substring(0, 1000),
          originalText: s.originalText,
          suggestedText: s.suggestedText.substring(0, 2000) // Maximum safe limit for text injection
        })).slice(0, 10);
      } else {
        parsedResponse.suggestions = [];
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
