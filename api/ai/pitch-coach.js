import { authenticateServerRequest } from '../shared/supabase.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// In-Memory cache for generated pitches to deliver 0ms repeat requests
const pitchCache = new Map();

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

    // 2. Extract and validate request body
    const { 
      action, // 'generate' | 'analyze' | 'practice_feedback'
      workspace,
      customPitch,
      pitchSections,
      practiceQuestion,
      practiceAnswer
    } = req.body;

    // Send Gemini ONLY the exact context required
    const projectTitle = workspace?.project_name ? String(workspace.project_name).slice(0, 80) : 'Project';
    const problem = workspace?.problem_statement ? String(workspace.problem_statement).slice(0, 300) : 'Not specified';
    const solution = workspace?.solution ? String(workspace.solution).slice(0, 300) : 'Not specified';
    const techStack = Array.isArray(workspace?.tech_stack) 
      ? workspace.tech_stack.slice(0, 8).join(', ') 
      : String(workspace?.tech_stack || 'Standard web stack').slice(0, 100);
    const hackathonTitle = workspace?.hackathon?.title ? String(workspace.hackathon.title).slice(0, 80) : 'Hackathon';
    const hackathonDesc = workspace?.hackathon?.description ? String(workspace.hackathon.description).slice(0, 200) : '';

    const workspaceContext = `
PROJECT CONTEXT:
- Name: "${projectTitle}"
- Problem: "${problem}"
- Solution: "${solution}"
- Tech Stack: "${techStack}"
- Hackathon: "${hackathonTitle}" ${hackathonDesc ? `(${hackathonDesc})` : ''}
`;

    // 3. Fast Flash Models prioritized for high speed and generous token headroom
    const genAI = new GoogleGenerativeAI(apiKey);
    const activeModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

    // Helper to call Gemini with adequate tokens and timeout
    const callGemini = async (prompt, maxTokens = 4096) => {
      let rawText = '';
      let lastError = null;

      for (const modelName of activeModels) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { 
              responseMimeType: "application/json",
              maxOutputTokens: maxTokens,
              temperature: 0.4
            }
          });

          const result = await Promise.race([
            model.generateContent(prompt),
            new Promise((_, reject) => setTimeout(() => reject(new Error('AI generation timed out')), 12000))
          ]);

          const response = await result.response;
          rawText = response.text().trim();
          if (rawText) break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!rawText) throw lastError || new Error('Failed to generate response from Gemini AI');
      return rawText;
    };

    // A. ACTION: GENERATE PITCHES (30s, 60s, 2-min)
    if (action === 'generate') {
      const cacheKey = `pitch:gen:${user.id}:${workspace?.id || projectTitle}`;
      const cached = pitchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 180000) {
        return res.status(200).json(cached.data);
      }

      const prompt = `You are the AI Pitch Coach for hackathons on HackVerse AI.
Generate a structured, high-impact hackathon pitch for the following project:

${workspaceContext}

RULES:
1. Provide 3 versions: 30-second elevator pitch (~60 words), 60-second demo pitch (~120 words), and 2-minute presentation pitch (~240 words).
2. Segment pitch components: hook, problem, solution, target_users, tech_stack, business_impact, differentiation, closing.
3. Return STRICTLY valid JSON matching schema:
{
  "pitches": {
    "pitch_30s": "30s elevator pitch text",
    "pitch_60s": "60s demo pitch text",
    "pitch_2min": "2min presentation pitch text"
  },
  "sections": {
    "hook": "Opening hook",
    "problem": "Problem statement",
    "solution": "Solution demo",
    "target_users": "Target user persona",
    "tech_stack": "Tech architecture summary",
    "business_impact": "Viability/impact",
    "differentiation": "Key competitive edge",
    "closing": "Closing call to action"
  }
}`;

      const rawText = await callGemini(prompt, 4096);
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      // Save to memory cache
      pitchCache.set(cacheKey, { data: parsed, timestamp: Date.now() });
      if (pitchCache.size > 200) pitchCache.delete(pitchCache.keys().next().value);

      return res.status(200).json(parsed);
    }

    // B. ACTION: ANALYZE PITCH
    if (action === 'analyze') {
      const pitchToAnalyze = (customPitch || Object.entries(pitchSections || {})
        .map(([k, v]) => `[${k.toUpperCase()}]: ${v}`)
        .join('\n')).slice(0, 1500);

      if (!pitchToAnalyze || !pitchToAnalyze.trim()) {
        return res.status(400).json({ error: 'Please provide pitch content to analyze.' });
      }

      const prompt = `You are an expert Hackathon Pitch Judge.
Analyze this hackathon pitch objectively:

${workspaceContext}

PITCH:
"""
${pitchToAnalyze}
"""

Return STRICTLY valid JSON matching schema:
{
  "overall_score": 82,
  "scores": {
    "problem_clarity": 85,
    "solution_clarity": 88,
    "innovation": 78,
    "technical_credibility": 80,
    "user_impact": 84,
    "differentiation": 75,
    "storytelling": 82,
    "delivery_structure": 85,
    "hackathon_relevance": 90
  },
  "strengths": ["Clear problem statement", "Solid technical pipeline"],
  "weaknesses": ["Differentiation is brief", "Closing lacks urgency"],
  "missing_information": ["No user metrics mentioned"],
  "improvements": ["Add 1-sentence benchmark comparison"],
  "rewritten_pitch": "Polished improved pitch version."
}`;

      const rawText = await callGemini(prompt, 3072);
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json(parsed);
    }

    // C. ACTION: PRACTICE FEEDBACK
    if (action === 'practice_feedback') {
      if (!practiceQuestion || !practiceAnswer) {
        return res.status(400).json({ error: 'Question and answer are required.' });
      }

      const prompt = `You are an AI Hackathon Judge conducting live Q&A practice.
${workspaceContext}
QUESTION: "${String(practiceQuestion).slice(0, 200)}"
USER ANSWER: "${String(practiceAnswer).slice(0, 600)}"

Return STRICTLY valid JSON matching schema:
{
  "score": 85,
  "feedback_summary": "1-2 sentence assessment",
  "strengths": ["Direct and clear"],
  "weaknesses": ["Needs more quantitative evidence"],
  "improved_response": "Winning concise version of this answer"
}`;

      const rawText = await callGemini(prompt, 2048);
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json(parsed);
    }

    return res.status(400).json({ error: 'Invalid action specified.' });
  } catch (err) {
    console.error('AI Pitch Coach Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'Unable to process pitch coach request. Please try again.',
      details: err?.message || 'Server error'
    });
  }
}
