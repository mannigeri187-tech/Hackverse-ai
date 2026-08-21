import { authenticateServerRequest, sanitizeEnvString } from '../_shared/supabase.js';
import { applyRateLimit } from '../_shared/rateLimiter.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// In-Memory cache for AI strategic explanations (keyed by user and workspace)
const strategyCache = new Map();

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
    return res.status(500).json({ error: 'AI key not configured on server.' });
  }

  try {
    // 1. Authenticate user from Bearer token
    const { user, error: authError } = await authenticateServerRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized user session.' });
    }

    // 2. Apply AI Tier Rate Limiting (by user.id)
    const isAllowed = await applyRateLimit(req, res, {
      type: 'AI',
      identifier: user.id
    });
    if (!isAllowed) return;

    const { 
      workspace,
      userSkills,
      teamMembers,
      githubScore,
      pitchScore,
      workspaceId,
      workspaceName, 
      hackathonTitle 
    } = req.body;

    if (!workspace) {
      return res.status(400).json({ error: 'Workspace data is required.' });
    }

    const prompt = `You are the HackVerse AI Hackathon Winning Readiness Engine.
Evaluate the student's project progress based on the ACTUAL SEMANTIC QUALITY of their input. Do NOT award points simply because a field exists or a string is long.

# Hackathon: "${String(hackathonTitle || 'Hackathon').slice(0, 60)}"
# Project: "${String(workspaceName || 'Project').slice(0, 60)}"

## Workspace Context (EVIDENCE):
Problem Statement: "${String(workspace.problem_statement || 'None').slice(0, 1000)}"
Solution: "${String(workspace.solution || 'None').slice(0, 1000)}"
Target Users: "${String(workspace.target_users || 'None').slice(0, 500)}"
Tech Stack: ${JSON.stringify(workspace.tech_stack || [])}
Progress: ${workspace.progress_percentage || 0}%
GitHub URL: "${workspace.github_url || 'Not Linked'}"
GitHub Analyzer Score: ${githubScore || 'Not Analyzed'}
Pitch Coach Score: ${pitchScore || 'Not Analyzed'}

## Team Context:
Team Members Count: ${teamMembers ? teamMembers.length : 0}
User Skills: ${JSON.stringify(userSkills || [])}

SCORING RULES & GIBBERISH DETECTION:
1. Meaning Matters: Detect random characters (e.g., "asdf"), repeated words, keyboard smashing, or generic placeholders. If the input is gibberish or lacks semantic meaning, score it near zero and explicitly mention this in the gaps/explanation.
2. Meaningful short input (e.g. "Students can't find hackathons") is better than long gibberish.
3. Tech Stack Validation: Do NOT award points just because there are multiple items. Check if they are REAL technologies, relevant to the proposed solution, and compatible. ["apple", "banana"] gets 0 points.
4. GitHub Validation: Just because a URL contains "github.com" does NOT mean it's valid. Treat it as unverified unless the "GitHub Analyzer Score" is present.
5. Evidence-Based: Every score must be justified by the provided text.

TASK:
1. Assign a readiness_tier: "Excellent Readiness", "Strong Readiness", "Good Progress", "Needs Improvement", or "Early Stage".
2. Evaluate these EXACT 8 categories and assign a score based on semantic quality. Do not invent new categories. 
   - Hackathon Alignment (max 20 points)
   - Project Completeness (max 15 points)
   - Technical Readiness (max 15 points)
   - Team Readiness (max 15 points)
   - Skill Readiness (max 10 points)
   - GitHub Quality (max 10 points)
   - Pitch Readiness (max 10 points)
   - Submission Readiness (max 5 points)
3. Calculate the overall_score by summing the 8 category scores (0-100).
4. List exactly 3 strengths, 3 critical gaps (with priority and action), and 3 action_checklist items.
5. Write an 'explanation': a concise 3-paragraph strategy (Readiness Summary, Competitive Edge, Top Fixes).

Return STRICTLY valid JSON matching this schema exactly:
{
  "overall_score": 0,
  "readiness_tier": "",
  "categories": [
    { "name": "Hackathon Alignment", "key": "hackathon_alignment", "score": 0, "maxScore": 20, "status": "Analyzed", "explanation": "..." },
    { "name": "Project Completeness", "key": "project_completeness", "score": 0, "maxScore": 15, "status": "Analyzed", "explanation": "..." },
    { "name": "Technical Readiness", "key": "technical_readiness", "score": 0, "maxScore": 15, "status": "Analyzed", "explanation": "..." },
    { "name": "Team Readiness", "key": "team_readiness", "score": 0, "maxScore": 15, "status": "Analyzed", "explanation": "..." },
    { "name": "Skill Readiness", "key": "skill_readiness", "score": 0, "maxScore": 10, "status": "Analyzed", "explanation": "..." },
    { "name": "GitHub Quality", "key": "github_quality", "score": 0, "maxScore": 10, "status": "Analyzed", "explanation": "..." },
    { "name": "Pitch Readiness", "key": "pitch_readiness", "score": 0, "maxScore": 10, "status": "Analyzed", "explanation": "..." },
    { "name": "Submission Readiness", "key": "submission_readiness", "score": 0, "maxScore": 5, "status": "Analyzed", "explanation": "..." }
  ],
  "strengths": ["..."],
  "gaps": [
    { "id": "gap1", "title": "...", "priority": "High", "action": "..." }
  ],
  "checklist": ["..."],
  "explanation": "..."
}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const activeModels = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
    let aiResponse = null;
    let lastError = null;

    for (const modelName of activeModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        });

        // 12-second hard timeout
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error('AI generation timed out')), 12000))
        ]);

        const response = await result.response;
        const text = response.text().replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        aiResponse = JSON.parse(text);
        
        if (aiResponse && typeof aiResponse.overall_score === 'number') {
          break; // Valid JSON received
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!aiResponse) throw lastError || new Error('Failed to generate strategic explanation');

    return res.status(200).json(aiResponse);
  } catch (err) {
    console.error('Winning Readiness Advisor Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'Unable to generate strategic summary. Please try again.',
      details: err?.message || 'Server error'
    });
  }
}
