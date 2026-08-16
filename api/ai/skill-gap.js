import { authenticateServerRequest } from '../shared/supabase.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    return res.status(500).json({ error: 'AI recommendations are temporarily unavailable. Please try again.' });
  }

  try {
    // 1. Authenticate user from Bearer token
    const { user, error: authError } = await authenticateServerRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized user session.' });
    }

    // 2. Extract and validate input payload
    const { hackathonTitle, hackathonDescription, missingSkills, userSkills } = req.body;

    if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
      return res.status(400).json({ error: 'No missing skills provided for learning plan generation.' });
    }

    // Sanitize missing skills input & limit length
    const sanitizedMissing = missingSkills.slice(0, 10).map((s) => ({
      skill_name: String(s.skill_name || s.name || 'Technical Skill').slice(0, 50),
      category: String(s.category || 'Other').slice(0, 30),
      importance: s.importance === 'required' ? 'required' : 'recommended',
      priority: s.importance === 'required' ? 'high' : 'medium',
    }));

    const knownUserSkills = Array.isArray(userSkills)
      ? userSkills.slice(0, 20).map((us) => `${us.skill_name || us.name} (${us.user_proficiency || us.proficiency || 'intermediate'})`).join(', ')
      : 'None listed';

    // 3. Build prompt for Gemini
    const prompt = `You are a technical hackathon mentor assisting a student preparing for a hackathon.
The student has selected the hackathon: "${hackathonTitle || 'Upcoming Hackathon'}".
${hackathonDescription ? `Hackathon Context/Theme: "${String(hackathonDescription).slice(0, 500)}"` : ''}

The student already knows: ${knownUserSkills}

The deterministic Skill Gap Analyzer identified these MISSING skills for this hackathon:
${JSON.stringify(sanitizedMissing, null, 2)}

TASK:
Create a realistic, actionable, and structured learning plan to help the student get hackathon-ready.
Prioritize REQUIRED missing skills first, then RECOMMENDED skills.
Do NOT invent new required skills. Focus strictly on the provided missing skills list.
Provide realistic student time estimates (e.g. 3-5 hours, 4-6 hours, 6-8 hours).

Output MUST be strictly valid JSON matching this schema:
{
  "summary": "Brief encouraging summary explaining the learning focus for this event (2-3 sentences max).",
  "learning_plan": [
    {
      "skill": "Skill Name",
      "priority": "high",
      "reason": "Why this skill is crucial for this specific hackathon",
      "topics": [
        "Core topic or concept 1",
        "Core topic or concept 2",
        "Core topic or concept 3"
      ],
      "estimated_hours": "4-6 hours",
      "practice_task": "A concise, hands-on mini practice project or exercise",
      "hackathon_application": "How to directly utilize this skill in their hackathon build or demo"
    }
  ]
}

Return ONLY raw valid JSON. Do NOT wrap with markdown fences or extra commentary.`;

    // 4. Call Gemini with cascading active models
    const genAI = new GoogleGenerativeAI(apiKey);
    const activeModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let responseText = '';
    let lastError = null;

    for (const modelName of activeModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        responseText = result.response.text().trim();
        if (responseText) break;
      } catch (geminiErr) {
        lastError = geminiErr;
      }
    }

    if (!responseText) {
      throw lastError || new Error('No response from Gemini');
    }

    // 5. Parse and Validate Response
    let parsedResponse;
    try {
      const cleanJson = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();
      parsedResponse = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse Gemini skill gap JSON:', responseText);
      return res.status(500).json({ error: 'AI recommendations are temporarily unavailable. Please try again.' });
    }

    if (!parsedResponse.learning_plan || !Array.isArray(parsedResponse.learning_plan)) {
      return res.status(500).json({ error: 'Invalid learning plan format returned by AI.' });
    }

    return res.status(200).json(parsedResponse);
  } catch (err) {
    console.error('Skill Gap AI Endpoint Error:', err);
    return res.status(500).json({ error: 'AI recommendations are temporarily unavailable. Please try again.' });
  }
}
