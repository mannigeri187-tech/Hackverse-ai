import { authenticateServerRequest, sanitizeEnvString } from '../shared/supabase.js';
import { applyRateLimit } from '../shared/rateLimiter.js';
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

    const prompt = `You are an AI Hackathon Strategy Advisor & Readiness Engine.
Evaluate the student's project progress and calculate a strictly realistic score (0-100) based on their actual semantic input.

# Hackathon: "${String(hackathonTitle || 'Hackathon').slice(0, 60)}"
# Project: "${String(workspaceName || 'Project').slice(0, 60)}"

## Workspace Context:
Problem Statement: "${String(workspace.problem_statement || 'None').slice(0, 1000)}"
Solution: "${String(workspace.solution || 'None').slice(0, 1000)}"
Tech Stack: ${JSON.stringify(workspace.tech_stack || [])}
Progress: ${workspace.progress_percentage || 0}%
GitHub URL: ${workspace.github_url ? 'Linked' : 'Not Linked'}
GitHub Analyzer Score: ${githubScore || 'Not Analyzed'}
Pitch Coach Score: ${pitchScore || 'Not Analyzed'}

## Team Context:
Team Members Count: ${teamMembers ? teamMembers.length : 0}
User Skills: ${JSON.stringify(userSkills || [])}

TASK:
1. Evaluate the semantic quality of the Problem Statement and Solution. If it's gibberish (e.g. "asdfasdf"), score it extremely low. If it's legitimate, score it realistically.
2. Evaluate Tech Stack, Team, Skills, GitHub, and Pitch.
3. Calculate an overall_score (0-100).
4. Assign a readiness_tier: "Excellent Readiness", "Strong Readiness", "Good Progress", "Needs Improvement", or "Early Stage".
5. Generate 8 category scores. Each category needs: name, key, score, maxScore, status ('Analyzed' | 'Partial' | 'Not analyzed yet'), explanation.
6. List 3 strengths, 3 critical gaps, and 3 checklist items.
7. Write a concise 3-paragraph strategy explanation (Readiness Summary, Competitive Edge, Top 3 Fixes).
8. Return strictly as JSON.`;

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
