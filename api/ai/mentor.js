import { authenticateServerRequest, sanitizeEnvString } from '../shared/supabase.js';
import { applyRateLimit } from '../shared/rateLimiter.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Memoized singleton GoogleGenerativeAI client and model across warm serverless invocations
let cachedGenAI = null;
let cachedApiKey = '';
let cachedModel = null;

function getMentorModel(apiKey) {
  if (!cachedGenAI || cachedApiKey !== apiKey) {
    cachedGenAI = new GoogleGenerativeAI(apiKey);
    cachedApiKey = apiKey;
    cachedModel = cachedGenAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 800,
      }
    });
  }
  return cachedModel;
}

export default async function handler(req, res) {
  const reqStart = performance.now();

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
    return res.status(500).json({ error: 'Gemini API key is not configured on server.' });
  }

  try {
    // 1. Fast Auth Verification
    const tAuthStart = performance.now();
    const { user, error: authError } = await authenticateServerRequest(req);
    const authDuration = performance.now() - tAuthStart;

    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized user session.' });
    }

    // 2. Fast Database & Rate Limit Verification
    const tDbStart = performance.now();
    const isAllowed = await applyRateLimit(req, res, {
      type: 'AI',
      identifier: user.id
    });
    const dbDuration = performance.now() - tDbStart;

    if (!isAllowed) return;

    // 3. Extract request body
    const { 
      hackathon, 
      workspace, 
      tasks, 
      skills, 
      team, 
      userMessage,
      chatHistory
    } = req.body || {};

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // 4. Compact Context Formatting
    const hackathonStr = hackathon ? `Target: "${hackathon.title || 'Hackathon'}" (${hackathon.mode || 'Online'})` : '';
    const workspaceStr = workspace ? `Project: "${workspace.project_name || 'Project'}" | Stack: ${Array.isArray(workspace.tech_stack) ? workspace.tech_stack.slice(0, 5).join(', ') : 'Web'}` : '';
    const tasksStr = Array.isArray(tasks) && tasks.length > 0 ? `Tasks: ${tasks.slice(0, 5).map(t => `${t.status === 'completed' ? '✓' : '○'} ${t.title}`).join('; ')}` : '';
    const skillsStr = Array.isArray(skills) && skills.length > 0 ? `Skills: ${skills.slice(0, 5).join(', ')}` : '';

    const contextParts = [hackathonStr, workspaceStr, tasksStr, skillsStr].filter(Boolean).join('\n');

    // 5. High-Impact Concise System Prompt
    const systemPrompt = `You are the elite AI Hackathon Mentor on HackVerse AI. Provide direct, actionable, highly technical guidance. Use clear markdown (###, bullets, bolding). Avoid generic filler.

CONTEXT:
${contextParts || 'General Hackathon Guidance'}`;

    // 6. Compact History (last 3 genuine turns max)
    let historySnippet = '';
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      const genuineHistory = chatHistory
        .filter(h => h && h.text && h.id !== 'welcome-1' && h.id !== 'welcome-reset')
        .slice(-3);

      if (genuineHistory.length > 0) {
        historySnippet = '\nHISTORY:\n' + genuineHistory
          .map(h => `${h.sender === 'user' ? 'User' : 'Mentor'}: ${h.text}`)
          .join('\n') + '\n';
      }
    }

    const fullPrompt = `${systemPrompt}${historySnippet}\nUSER: ${userMessage.trim()}\nMENTOR:`;

    // 7. Ultra-Low Latency Streaming via SSE
    if (req.body?.stream === true || req.headers.accept?.includes('text/event-stream')) {
      if (res.socket && typeof res.socket.setNoDelay === 'function') {
        res.socket.setNoDelay(true);
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Content-Encoding': 'none',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      });

      if (typeof res.flushHeaders === 'function') {
        res.flushHeaders();
      }

      // Send initial keep-alive comment to unbuffer reverse proxies immediately
      res.write(': stream-start\n\n');
      if (typeof res.flush === 'function') {
        res.flush();
      }

      const tGeminiStart = performance.now();
      const model = getMentorModel(apiKey);
      const modelName = 'gemini-3.5-flash-lite';
      
      let streamedSuccess = false;
      let lastStreamError = null;
      let tFirstChunk = null;
      const tProcessingStart = performance.now();

      try {
        const streamResult = await model.generateContentStream(fullPrompt);

        for await (const chunk of streamResult.stream) {
          if (tFirstChunk === null) {
            tFirstChunk = performance.now() - tGeminiStart;
          }
          const chunkText = chunk.text();
          if (chunkText) {
            res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
            if (typeof res.flush === 'function') {
              res.flush();
            }
          }
        }

        const geminiDuration = performance.now() - tGeminiStart;
        const processingDuration = performance.now() - tProcessingStart;
        const totalDuration = performance.now() - reqStart;

        // Structured performance logs
        console.log(`[MENTOR-PERF]\nauth=${authDuration.toFixed(1)}ms\ndatabase=${dbDuration.toFixed(1)}ms\ngemini=${geminiDuration.toFixed(1)}ms\nprocessing=${processingDuration.toFixed(1)}ms\ntotal=${totalDuration.toFixed(1)}ms`);

        streamedSuccess = true;
        res.write(`data: ${JSON.stringify({ done: true, perf: { totalMs: Math.round(totalDuration), ttftMs: Math.round(tFirstChunk || 0), model: modelName } })}\n\n`);
        if (typeof res.flush === 'function') {
          res.flush();
        }
        res.end();
      } catch (streamErr) {
        lastStreamError = streamErr;
        console.error('Gemini Stream Error:', streamErr?.message);
      }

      if (!streamedSuccess) {
        res.write(`data: ${JSON.stringify({ error: 'AI Mentor is temporarily unavailable. Please try again.' })}\n\n`);
        if (typeof res.flush === 'function') {
          res.flush();
        }
        res.end();
      }
      return;
    }

    // 8. Fast JSON Response Fallback
    const tGeminiStart = performance.now();
    const model = getMentorModel(apiKey);
    const modelName = 'gemini-3.5-flash-lite';

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text().trim();

    const geminiDuration = performance.now() - tGeminiStart;
    const totalDuration = performance.now() - reqStart;
    const processingDuration = totalDuration - authDuration - dbDuration - geminiDuration;

    console.log(`[MENTOR-PERF]\nauth=${authDuration.toFixed(1)}ms\ndatabase=${dbDuration.toFixed(1)}ms\ngemini=${geminiDuration.toFixed(1)}ms\nprocessing=${processingDuration.toFixed(1)}ms\ntotal=${totalDuration.toFixed(1)}ms`);

    return res.status(200).json({ 
      reply: responseText,
      perf: {
        totalMs: Math.round(totalDuration),
        geminiMs: Math.round(geminiDuration),
        model: modelName
      }
    });
  } catch (err) {
    console.error('AI Mentor Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'AI Mentor is temporarily unavailable.',
      details: err?.message || 'Server error'
    });
  }
}



