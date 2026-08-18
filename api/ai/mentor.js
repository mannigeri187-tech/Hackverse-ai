import { authenticateServerRequest, sanitizeEnvString } from '../shared/supabase.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    // 1. Authenticate user from Bearer token using shared server validator
    const tAuthStart = performance.now();
    const { user, error: authError } = await authenticateServerRequest(req);
    const authDuration = performance.now() - tAuthStart;

    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized user session.' });
    }

    // 2. Extract and validate request body
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

    const tContextStart = performance.now();

    // 3. Assemble Hackathon & Workspace Context concisely
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

    // 4. Build System Prompt for Gemini
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

    // 5. Construct full prompt
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
    const contextDuration = performance.now() - tContextStart;

    // 6. Streaming SSE response handler if requested by client
    if (req.body.stream === true || req.headers.accept?.includes('text/event-stream')) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform, no-store',
        'Connection': 'keep-alive',
      });

      const genAI = new GoogleGenerativeAI(apiKey);
      const activeModels = ['gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.6-flash'];
      let streamedSuccess = false;
      let lastStreamError = null;
      let selectedModel = '';

      const tStreamStart = performance.now();

      for (const modelName of activeModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const streamResult = await model.generateContentStream(fullPrompt);
          selectedModel = modelName;

          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
            }
          }

          streamedSuccess = true;
          const totalStreamDuration = performance.now() - reqStart;
          res.write(`data: ${JSON.stringify({ done: true, perf: { totalMs: Math.round(totalStreamDuration), model: selectedModel } })}\n\n`);
          res.end();
          break;
        } catch (streamErr) {
          lastStreamError = streamErr;
        }
      }

      if (!streamedSuccess) {
        res.write(`data: ${JSON.stringify({ error: lastStreamError?.message || 'Streaming generation failed' })}\n\n`);
        res.end();
      }
      return;
    }

    // 7. Fast JSON Response using verified active Gemini models with fallback
    const genAI = new GoogleGenerativeAI(apiKey);
    const activeModels = ['gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.6-flash'];
    let responseText = '';
    let lastError = null;
    let selectedModel = '';

    const tGeminiStart = performance.now();

    for (const modelName of activeModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        responseText = response.text().trim();
        if (responseText) {
          selectedModel = modelName;
          break;
        }
      } catch (geminiErr) {
        lastError = geminiErr;
      }
    }

    const geminiDuration = performance.now() - tGeminiStart;
    const totalDuration = performance.now() - reqStart;

    console.log(`[AI-MENTOR-PERF] total: ${totalDuration.toFixed(1)}ms | auth: ${authDuration.toFixed(1)}ms | context: ${contextDuration.toFixed(1)}ms | gemini (${selectedModel}): ${geminiDuration.toFixed(1)}ms`);

    if (!responseText) {
      throw lastError || new Error('No response from Gemini models');
    }

    return res.status(200).json({ 
      reply: responseText,
      perf: {
        totalMs: Math.round(totalDuration),
        geminiMs: Math.round(geminiDuration),
        model: selectedModel
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

