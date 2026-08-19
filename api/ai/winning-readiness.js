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

    // 2. Extract deterministic calculated scores and minimal sanitized context
    const { 
      readinessData, 
      workspaceId,
      workspaceName, 
      hackathonTitle 
    } = req.body;

    if (!readinessData) {
      return res.status(400).json({ error: 'Readiness data is required.' });
    }

    // Check user-isolated strategic cache (3-minute TTL)
    const cacheKey = `strat:${user.id}:${workspaceId || workspaceName || 'default'}:${readinessData.overall_score}`;
    const cached = strategyCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 180000) {
      return res.status(200).json({ explanation: cached.data, cached: true });
    }

    // 3. Construct lightweight prompt with compact summaries
    const categorySummary = (readinessData.categories || [])
      .map(c => `- ${c.name}: ${c.score}/${c.maxScore} (${c.status})`)
      .join('\n');

    const topStrengths = (readinessData.strengths || []).slice(0, 4).map(s => `- ${s}`).join('\n') || '- In progress';
    const topGaps = (readinessData.gaps || []).slice(0, 4).map(g => `- [${g.priority}] ${g.title}: ${g.action}`).join('\n') || '- None';

    const prompt = `You are an AI Hackathon Strategy Advisor.
The student's project has a DETERMINISTIC readiness score of ${readinessData.overall_score}/100 (${readinessData.readiness_tier}) for hackathon "${String(hackathonTitle || 'Hackathon').slice(0, 60)}".

SCORES:
${categorySummary}

STRENGTHS:
${topStrengths}

CRITICAL GAPS:
${topGaps}

TASK:
Write a concise 3-paragraph strategy in clean Markdown:
1. **Readiness Summary**: Why the score is ${readinessData.overall_score}/100.
2. **Competitive Edge**: 2 main strengths for judges.
3. **Top 3 Fixes Before Submission**: High-impact improvements.

Keep it direct and high-impact. Do not recalculate the score.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const activeModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let explanationText = '';
    let lastError = null;

    for (const modelName of activeModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            maxOutputTokens: 650,
            temperature: 0.3
          }
        });

        // 8-second hard timeout
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error('AI generation timed out')), 8000))
        ]);

        const response = await result.response;
        explanationText = response.text().trim();
        if (explanationText) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!explanationText) throw lastError || new Error('Failed to generate strategic explanation');

    // Save in user-isolated memory cache
    strategyCache.set(cacheKey, { data: explanationText, timestamp: Date.now() });
    if (strategyCache.size > 200) strategyCache.delete(strategyCache.keys().next().value);

    return res.status(200).json({ explanation: explanationText });
  } catch (err) {
    console.error('Winning Readiness Advisor Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'Unable to generate strategic summary. Please try again.',
      details: err?.message || 'Server error'
    });
  }
}
