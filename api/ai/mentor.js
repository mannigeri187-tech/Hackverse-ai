import { authenticateServerRequest, sanitizeEnvString } from '../shared/supabase.js';
import { applyRateLimit } from '../shared/rateLimiter.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Module-level memoized Gemini client singleton to eliminate instantiation on warm Vercel invocations
let cachedGenAI = null;
let cachedApiKey = '';

function getGenAIClient(apiKey) {
  if (!cachedGenAI || cachedApiKey !== apiKey) {
    cachedGenAI = new GoogleGenerativeAI(apiKey);
    cachedApiKey = apiKey;
  }
  return cachedGenAI;
}

export default async function handler(req, res) {
  const reqStart = performance.now();
  console.log('[MENTOR-PERF] request received');

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
    // 1. Authenticate user from Bearer token using shared server validator
    const tAuthStart = performance.now();
    const { user, error: authError } = await authenticateServerRequest(req);
    const authDuration = performance.now() - tAuthStart;
    console.log(`[MENTOR-PERF] auth completed: ${authDuration.toFixed(2)} ms`);

    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized user session.' });
    }

    // 2. Database / Rate Limiting Check
    const tDbStart = performance.now();
    const isAllowed = await applyRateLimit(req, res, {
      type: 'AI',
      identifier: user.id
    });
    const dbDuration = performance.now() - tDbStart;
    console.log(`[MENTOR-PERF] database completed: ${dbDuration.toFixed(2)} ms`);

    if (!isAllowed) return;

    // 3. Extract and validate request body
    const { 
      hackathon, 
      workspace, 
      tasks, 
      skills, 
      skillGaps, 
      team, 
      userMessage,
      chatHistory
    } = req.body;

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // 4. Assemble Hackathon & Workspace Context concisely
    const hackathonContext = hackathon ? `
Target Hackathon: "${hackathon.title || 'Unknown'}"
Organizer: "${hackathon.organizer || 'N/A'}"
Mode: "${hackathon.mode || 'Online'}"
Start Date: "${hackathon.start_date || 'N/A'}"
End Date / Deadline: "${hackathon.end_date || hackathon.registration_deadline || 'N/A'}"
Description: "${(hackathon.description || 'No detailed description').slice(0, 500)}"
` : 'No specific hackathon selected.';

    const workspaceContext = workspace ? `
Project Name: "${workspace.project_name || 'Untitled Project'}"
Problem Statement: "${workspace.problem_statement || 'Not specified'}"
Solution Proposal: "${workspace.solution || 'Not specified'}"
Tech Stack: "${Array.isArray(workspace.tech_stack) ? workspace.tech_stack.join(', ') : 'Not specified'}"
GitHub Repo: "${workspace.github_url || 'None linked'}"
Progress: ${workspace.progress_percentage || 0}%
` : 'No workspace created yet for this hackathon.';

    const tasksContext = Array.isArray(tasks) && tasks.length > 0 ? `
Workspace Tasks (${tasks.length} total):
${tasks.slice(0, 10).map(t => `- [${t.status.toUpperCase()}] (Priority: ${t.priority}) "${t.title}" ${t.due_date ? `(Due: ${t.due_date})` : ''}`).join('\n')}
` : 'No workspace tasks logged yet.';

    const skillsContext = `
User Skills: ${Array.isArray(skills) && skills.length > 0 ? skills.map(s => `${s.skill?.name || s.name} (${s.proficiency || 'intermediate'})`).join(', ') : 'None added'}
Missing/Gap Skills: ${Array.isArray(skillGaps) && skillGaps.length > 0 ? skillGaps.map(g => `${g.skill_name} (${g.importance})`).join(', ') : 'None identified'}
`;

    const teamContext = Array.isArray(team) && team.length > 0 ? `
Team Squad (${team.length} members):
${team.map(m => `- ${m.display_name} (Roles: ${(m.roles || []).join(', ') || 'General Hacker'})`).join('\n')}
` : 'Solo hacker or no team members connected yet.';

    // 5. Build System Prompt for Gemini
    const systemPrompt = `You are the AI Hackathon Mentor on HackVerse AI — an elite technical coach and mentor helping student hackers win hackathons.

YOUR WORKING CONTEXT:
${hackathonContext}
${workspaceContext}
${tasksContext}
${skillsContext}
${teamContext}

GUIDELINES FOR YOUR RESPONSES:
1. ALWAYS be context-aware. Ground every answer in the selected hackathon, the user's project, current workspace tasks, and skill gaps.
2. Structure your answers with clear markdown headings (###), bullet points, and actionable next steps.
3. Be direct, pragmatic, and highly technical. Avoid generic motivational fluff.
4. When asked "Is our idea good?": evaluate problem importance, solution novelty, technical feasibility in hackathon timeframe, and judging potential. Categorize as: "Strong", "Promising", "Needs Improvement", or "High Risk" with concrete rationale. Do NOT output a fake percentage score.
5. When asked "Review our project": structure as: ### Strengths, ### Weaknesses & Gaps, ### Risks, ### Recommended Improvements, and ### Next 3 Actions.
6. When asked "What should we do today?": analyze the deadline, incomplete high-priority tasks, and missing skills to provide the top 3 focused actions with realistic time estimates.
7. Keep answers concise, high-impact, and easy to read during a high-speed hackathon.`;

    // 6. Construct full prompt
    let historySnippet = '';
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      const genuineHistory = chatHistory
        .filter(h => h && h.text && h.id !== 'welcome-1' && h.id !== 'welcome-reset')
        .slice(-4);

      if (genuineHistory.length > 0) {
        historySnippet = `\nRECENT CONVERSATION HISTORY:\n` + genuineHistory
          .map(h => `${h.sender === 'user' ? 'User' : 'Mentor'}: ${h.text}`)
          .join('\n\n') + '\n';
      }
    }

    const fullPrompt = `${systemPrompt}\n${historySnippet}\nUSER MESSAGE:\n${userMessage.trim()}\n\nMENTOR RESPONSE:`;

    // 7. Streaming SSE response handler for ultra-low latency on Vercel
    if (req.body.stream === true || req.headers.accept?.includes('text/event-stream')) {
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

      console.log('[MENTOR-PERF] Gemini request started');
      const tGeminiStart = performance.now();
      const genAI = getGenAIClient(apiKey);
      const modelName = 'gemini-3.5-flash-lite';
      
      let streamedSuccess = false;
      let lastStreamError = null;
      let tFirstChunk = null;
      let totalStreamDuration = 0;
      let chunkCount = 0;

      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        });
        const streamResult = await model.generateContentStream(fullPrompt);

        const tResponseProcessingStart = performance.now();

        for await (const chunk of streamResult.stream) {
          if (tFirstChunk === null) {
            tFirstChunk = performance.now() - tGeminiStart;
          }
          const chunkText = chunk.text();
          if (chunkText) {
            chunkCount++;
            res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
            if (typeof res.flush === 'function') {
              res.flush();
            }
          }
        }

        const geminiDuration = performance.now() - tGeminiStart;
        console.log(`[MENTOR-PERF] Gemini request completed: ${geminiDuration.toFixed(2)} ms`);

        const responseProcessingDuration = performance.now() - tResponseProcessingStart;
        console.log(`[MENTOR-PERF] response processing: ${responseProcessingDuration.toFixed(2)} ms`);

        streamedSuccess = true;
        totalStreamDuration = performance.now() - reqStart;
        console.log(`[MENTOR-PERF] total: ${totalStreamDuration.toFixed(2)} ms`);

        res.write(`data: ${JSON.stringify({ done: true, perf: { totalMs: Math.round(totalStreamDuration), ttftMs: Math.round(tFirstChunk || 0), model: modelName } })}\n\n`);
        if (typeof res.flush === 'function') {
          res.flush();
        }
        res.end();
      } catch (streamErr) {
        lastStreamError = streamErr;
        console.error('Gemini Stream Error:', streamErr?.message);
      }

      if (!streamedSuccess) {
        res.write(`data: ${JSON.stringify({ error: lastStreamError?.message || 'Streaming generation failed' })}\n\n`);
        if (typeof res.flush === 'function') {
          res.flush();
        }
        res.end();
      }
      return;
    }

    // 8. Fast JSON Response fallback
    console.log('[MENTOR-PERF] Gemini request started');
    const tGeminiStart = performance.now();
    const genAI = getGenAIClient(apiKey);
    const modelName = 'gemini-3.5-flash-lite';
    let responseText = '';

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    responseText = response.text().trim();

    const geminiDuration = performance.now() - tGeminiStart;
    console.log(`[MENTOR-PERF] Gemini request completed: ${geminiDuration.toFixed(2)} ms`);

    const tResponseProcessingStart = performance.now();
    const totalDuration = performance.now() - reqStart;
    const responseProcessingDuration = performance.now() - tResponseProcessingStart;
    console.log(`[MENTOR-PERF] response processing: ${responseProcessingDuration.toFixed(2)} ms`);
    console.log(`[MENTOR-PERF] total: ${totalDuration.toFixed(2)} ms`);

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


