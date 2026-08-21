import { authenticateServerRequest, sanitizeEnvString } from '../_shared/supabase.js';
import { applyRateLimit } from '../_shared/rateLimiter.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
    return res.status(500).json({ error: 'AI API key is not configured.' });
  }

  try {
    // 1. Verify user session from Bearer token
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

    // 2. Validate input text (limit size to prevent unlimited token billing)
    const { section, text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text to improve is required.' });
    }

    const sanitizedText = text.trim().slice(0, 1500);

    let prompt = '';
    if (section === 'summary') {
      prompt = `Improve the following professional summary for a college student/new grad resume. Make it concise, impactful, and action-oriented. Keep it to 3-4 sentences maximum. Do not include markdown formatting or quotes.\n\nOriginal: ${sanitizedText}`;
    } else if (section === 'project') {
      prompt = `Improve the following project description for a technical resume. Use strong action verbs, mention technologies used, and highlight outcomes or metrics if possible. Format as a single paragraph or 2-3 concise bullet points separated by newlines. Do not include markdown formatting.\n\nOriginal: ${sanitizedText}`;
    } else if (section === 'experience') {
      prompt = `Improve the following work/internship experience description for a technical resume. Use the STAR method (Situation, Task, Action, Result) if applicable. Use strong action verbs. Format as 2-3 concise bullet points separated by newlines. Do not include markdown formatting.\n\nOriginal: ${sanitizedText}`;
    } else {
      prompt = `Improve the following text for a professional technical resume. Make it concise and impactful. Do not include markdown formatting.\n\nOriginal: ${sanitizedText}`;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const activeModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let improvedText = '';
    let lastError = null;

    for (const modelName of activeModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        improvedText = response.text().trim().replace(/^["']|["']$/g, '');
        if (improvedText) break;
      } catch (geminiErr) {
        lastError = geminiErr;
      }
    }

    if (!improvedText) {
      throw lastError || new Error('No response from Gemini');
    }

    return res.status(200).json({ improved: improvedText });
  } catch (err) {
    console.error('AI Improve Error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to generate AI improvement.' });
  }
}
