import { authenticateServerRequest, getSupabaseServerClient, sanitizeEnvString } from '../shared/supabase.js';
import { applyRateLimit } from '../shared/rateLimiter.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { user, error: authError } = await authenticateServerRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized session or invalid auth token' });
    }

    // Apply Rate Limiting (AI tier for POST generation, Authenticated tier for GET)
    const isAllowed = await applyRateLimit(req, res, {
      type: req.method === 'POST' ? 'AI' : 'AUTHENTICATED',
      identifier: user.id
    });
    if (!isAllowed) return;

    const supabase = getSupabaseServerClient();
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];

    if (req.method === 'GET') {
      const { data: tasks, error } = await supabase
        .from('daily_coach_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', targetDate)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ source: 'database', tasks: tasks || [] });
    }

    if (req.method === 'POST') {
      const apiKey = sanitizeEnvString(process.env.GEMINI_API_KEY);

      // 1. Check if tasks already exist to prevent duplicate Gemini calls
      const { data: existingTasks } = await supabase
        .from('daily_coach_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', targetDate)
        .order('created_at', { ascending: true });

      if (existingTasks && existingTasks.length > 0) {
        return res.status(200).json({ source: 'database', tasks: existingTasks });
      }

      // 2. Fetch User Context safely
      try {
        await supabase.from('profiles').upsert({ user_id: user.id, email: user.email }, { onConflict: 'user_id', ignoreDuplicates: true });
      } catch (profileErr) {
        console.warn('Profile upsert notice:', profileErr?.message);
      }

      const [profileRes, savedHacksRes, resumesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('saved_hackathons').select('hackathons(title, status, mode)').eq('user_id', user.id).limit(5),
        supabase.from('resumes').select('content').eq('user_id', user.id).limit(1)
      ]);

      const profile = profileRes?.data || {};
      const savedHacks = savedHacksRes?.data?.map(s => s.hackathons?.title).filter(Boolean).join(', ') || 'None';
      const resume = resumesRes?.data?.[0]?.content || {};

      const promptContext = `
        User Profile: ${JSON.stringify({ name: profile.name, bio: profile.bio, college: profile.college })}
        Saved Hackathons: ${savedHacks}
        Resume Skills: ${JSON.stringify(resume.skills || [])}
      `;

      let aiResponse = null;

      // 3. Call Gemini if apiKey is configured on server
      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const activeModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
          const prompt = `You are a Daily AI Coach for a college student/hacker participating in hackathons.
Based on the following user context, generate exactly 3 to 5 realistic, actionable daily tasks (15-60 mins each).

Context:
${promptContext}

Valid categories: "learning", "hackathon", "resume", "coding", "github", "team", "project", "career"
Valid priorities: "high", "medium", "low"

Provide the output strictly as a JSON object matching this schema:
{
  "tasks": [
    {
      "title": "Task title (max 50 chars)",
      "description": "Brief instruction on how to achieve it",
      "category": "learning",
      "estimated_minutes": 30,
      "priority": "high"
    }
  ]
}
Return ONLY valid JSON. Do not include markdown formatting or extra text.`;

          let text = '';
          for (const modelName of activeModels) {
            try {
              const model = genAI.getGenerativeModel({ model: modelName });
              const result = await model.generateContent(prompt);
              text = result.response.text().trim();
              if (text) break;
            } catch (err) {
              // Try next model
            }
          }

          if (text) {
            const cleanText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
            aiResponse = JSON.parse(cleanText);
          }
        } catch (geminiError) {
          console.warn('Gemini generation notice:', geminiError?.message);
        }
      }

      // Default fallback tasks if Gemini is unavailable or rate limited
      if (!aiResponse || !aiResponse.tasks || !Array.isArray(aiResponse.tasks)) {
        aiResponse = {
          tasks: [
            {
              title: "Discover 1 upcoming hackathon",
              description: "Browse the HackVerse discovery tab and save an event you like.",
              category: "hackathon",
              estimated_minutes: 15,
              priority: "high"
            },
            {
              title: "Update your tech skills list",
              description: "Review and refine your skills in the Team Finder profile.",
              category: "learning",
              estimated_minutes: 20,
              priority: "medium"
            },
            {
              title: "Test your hackathon project pitch",
              description: "Run the AI Pitch Coach on your project concept.",
              category: "project",
              estimated_minutes: 30,
              priority: "medium"
            }
          ]
        };
      }

      const validCategories = ['learning', 'hackathon', 'resume', 'coding', 'github', 'team', 'project', 'career'];
      const validPriorities = ['high', 'medium', 'low'];

      const newTasks = aiResponse.tasks.slice(0, 5).map(task => {
        const cat = (task.category || 'learning').toLowerCase();
        const prio = (task.priority || 'medium').toLowerCase();
        return {
          user_id: user.id,
          task_date: targetDate,
          title: String(task.title || 'Daily Goal').slice(0, 80),
          description: task.description ? String(task.description).slice(0, 300) : null,
          category: validCategories.includes(cat) ? cat : 'learning',
          estimated_minutes: Math.min(Math.max(Number(task.estimated_minutes) || 30, 5), 180),
          priority: validPriorities.includes(prio) ? prio : 'medium',
          completed: false
        };
      });

      // 4. Save to Database
      const { data: insertedTasks, error: insertError } = await supabase
        .from('daily_coach_tasks')
        .insert(newTasks)
        .select();

      if (insertError) {
        console.warn('Database insert notice:', insertError.message);
        const { data: fallbackFetched } = await supabase
          .from('daily_coach_tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('task_date', targetDate);

        if (fallbackFetched && fallbackFetched.length > 0) {
          return res.status(200).json({ source: 'database', tasks: fallbackFetched });
        }
        return res.status(200).json({ source: 'fallback', tasks: newTasks });
      }

      return res.status(200).json({ source: 'gemini', tasks: insertedTasks || newTasks });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Coach API Error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
