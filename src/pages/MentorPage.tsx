import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Layers, 
  Clock, 
  AlertCircle, 
  Compass, 
  Loader2,
  FolderGit2,
  FolderPlus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { Hackathon } from '../hooks/useHackathons';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  'Is our idea good?',
  'What should we build first?',
  'How can we improve our project?',
  'What are we missing?',
  'How can we maximize our judging score?',
  'Review our tech stack',
  'What should we do today?',
  'Help us prepare our pitch',
];

// Helpers for user-isolated persistent AI Mentor conversation history
const getLocalHistoryKey = (userId: string, hackathonId: string) => 
  `hackverse_mentor_history_${userId}_${hackathonId || 'general'}`;

async function loadPersistentMessages(userId: string, hackathonId: string, hackathonTitle?: string): Promise<ChatMessage[]> {
  // 1. Try loading from Supabase mentor_messages
  try {
    const { data: dbRows, error: dbError } = await supabase
      .from('mentor_messages')
      .select('id, sender, text, created_at')
      .eq('user_id', userId)
      .eq('hackathon_id', hackathonId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!dbError && dbRows && dbRows.length > 0) {
      return dbRows.map(r => ({
        id: r.id,
        sender: r.sender as 'user' | 'ai',
        text: r.text,
        timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }
  } catch (err) {
    console.warn('Supabase mentor messages fetch notice, using user-scoped storage:', err);
  }

  // 2. Fallback to user-scoped localStorage
  try {
    const raw = localStorage.getItem(getLocalHistoryKey(userId, hackathonId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local mentor history:', e);
  }

  // 3. Default Welcome Greeting
  return [
    {
      id: 'welcome-reset',
      sender: 'ai',
      text: `👋 Hey! I'm your AI Hackathon Mentor for **${hackathonTitle || 'your Hackathon'}**.\n\nI'm connected to your project workspace, tasks, and team data. Ask me anything, or choose a quick evaluation question below to begin!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];
}

async function persistMessage(userId: string, hackathonId: string, message: ChatMessage, allMessages: ChatMessage[]) {
  // 1. Save to user-scoped localStorage immediately for zero-latency recovery
  try {
    localStorage.setItem(getLocalHistoryKey(userId, hackathonId), JSON.stringify(allMessages));
  } catch (e) {
    console.error('Error saving local mentor history:', e);
  }

  // 2. Save asynchronously to Supabase mentor_messages (non-blocking)
  if (message.id !== 'welcome-reset') {
    void Promise.resolve(
      supabase.from('mentor_messages').insert({
        user_id: userId,
        hackathon_id: hackathonId,
        sender: message.sender,
        text: message.text,
      })
    ).catch((err: any) => {
      console.warn('Could not persist to Supabase mentor_messages (using user-scoped store):', err);
    });
  }
}

async function clearPersistentMessages(userId: string, hackathonId: string, hackathonTitle?: string): Promise<ChatMessage[]> {
  try {
    localStorage.removeItem(getLocalHistoryKey(userId, hackathonId));
  } catch (e) {
    console.error('Error removing local mentor history:', e);
  }

  try {
    await supabase
      .from('mentor_messages')
      .delete()
      .eq('user_id', userId)
      .eq('hackathon_id', hackathonId);
  } catch (err) {
    console.warn('Could not delete from Supabase mentor_messages:', err);
  }

  return [
    {
      id: 'welcome-reset',
      sender: 'ai',
      text: `Chat cleared. How can I help you with **${hackathonTitle || 'your Hackathon'}**?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];
}

export default function MentorPage() {
  const { user, session } = useAuth();

  // Selected Hackathon and User Hackathons List
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>(() => {
    try {
      return localStorage.getItem(`hackverse_last_hackathon_${user?.id}`) || '';
    } catch {
      return '';
    }
  });
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [isLoadingHackathons, setIsLoadingHackathons] = useState<boolean>(true);

  // Context Data
  const [userSkillsData, setUserSkillsData] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Workspace integration for this hackathon
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  const { currentWorkspace, tasks } = useWorkspaces(workspaceId);

  // Chat State initialized synchronously from local history for 0ms recovery across navigation
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      if (user?.id) {
        const savedHackId = localStorage.getItem(`hackverse_last_hackathon_${user.id}`) || 'general';
        const raw = localStorage.getItem(getLocalHistoryKey(user.id, savedHackId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {}
    return [
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `👋 Hey! I'm your AI Hackathon Mentor.\n\nI'm connected to your project workspace, tasks, and team data. Ask me anything, or choose a quick evaluation question below to begin!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isSendingRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // 1. Fetch User's Active Hackathons in Parallel
  useEffect(() => {
    let isCancelled = false;

    async function loadUserHackathons() {
      if (!user) return;
      setIsLoadingHackathons(true);
      try {
        const [savedRes, workspaceRes] = await Promise.all([
          supabase
            .from('saved_hackathons')
            .select('hackathons(*)')
            .eq('user_id', user.id),
          supabase
            .from('workspaces')
            .select('hackathon:hackathons(*)')
            .eq('user_id', user.id)
        ]);

        if (isCancelled) return;

        const hackMap = new Map<string, Hackathon>();

        (savedRes.data || []).forEach((item: any) => {
          if (item.hackathons) hackMap.set(item.hackathons.id, item.hackathons);
        });

        (workspaceRes.data || []).forEach((item: any) => {
          if (item.hackathon) hackMap.set(item.hackathon.id, item.hackathon);
        });

        const hackList = Array.from(hackMap.values());
        if (hackList.length > 0) {
          setActiveHackathons(hackList);
          setSelectedHackathonId((currentId) => {
            if (currentId && hackList.some(h => h.id === currentId)) {
              return currentId;
            }
            return hackList[0].id;
          });
        }
      } catch (err) {
        console.error('Error loading active hackathons for Mentor:', err);
      } finally {
        if (!isCancelled) setIsLoadingHackathons(false);
      }
    }

    loadUserHackathons();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // 2. Load context and persistent messages when selectedHackathonId changes
  useEffect(() => {
    let isCancelled = false;

    async function loadContext() {
      if (!user) return;

      if (!selectedHackathonId) {
        setSelectedHackathon(null);
        setWorkspaceId(undefined);
        setUserSkillsData([]);
        setTeamMembers([]);
        return;
      }

      // Save last selected hackathon ID to survive page navigation
      try {
        localStorage.setItem(`hackverse_last_hackathon_${user.id}`, selectedHackathonId);
      } catch {}

      const chosen = activeHackathons.find((h) => h.id === selectedHackathonId) || null;
      if (!isCancelled) setSelectedHackathon(chosen);

      // Fast synchronous load from user-scoped localStorage
      try {
        const raw = localStorage.getItem(getLocalHistoryKey(user.id, selectedHackathonId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0 && !isCancelled) {
            setMessages(parsed);
          }
        }
      } catch {}

      try {
        const [wsRes, profRes, requestsRes, persistentHistory] = await Promise.all([
          supabase
            .from('workspaces')
            .select('id')
            .eq('hackathon_id', selectedHackathonId)
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('team_profiles')
            .select('skills, preferred_roles')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('team_requests')
            .select('sender_id, receiver_id')
            .eq('hackathon_id', selectedHackathonId)
            .eq('status', 'accepted')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
          loadPersistentMessages(user.id, selectedHackathonId, chosen?.title)
        ]);

        if (isCancelled) return;

        setWorkspaceId(wsRes.data?.id || undefined);

        if (profRes.data?.skills) {
          setUserSkillsData(profRes.data.skills.map((s: string) => ({ name: s, proficiency: 'intermediate' })));
        } else {
          setUserSkillsData([]);
        }

        if (requestsRes.data && requestsRes.data.length > 0) {
          const memberIds = requestsRes.data.map((r: any) =>
            r.sender_id === user.id ? r.receiver_id : r.sender_id
          );

          if (memberIds.length > 0) {
            const { data: profiles } = await supabase
              .from('team_profiles')
              .select('user_id, display_name, preferred_roles')
              .in('user_id', memberIds);

            if (!isCancelled && profiles) {
              setTeamMembers(
                profiles.map((p: any) => ({
                  id: p.user_id,
                  display_name: p.display_name || 'Team Member',
                  roles: p.preferred_roles || [],
                }))
              );
            }
          }
        } else {
          setTeamMembers([]);
        }

        // Restore full persistent messages from DB/storage
        if (!isCancelled && persistentHistory && persistentHistory.length > 0) {
          setMessages(persistentHistory);
        }
      } catch (err) {
        console.error('Error loading mentor context:', err);
      }
    }

    loadContext();

    return () => {
      isCancelled = true;
    };
  }, [selectedHackathonId, user, activeHackathons]);

  // 3. Send Message to AI Mentor Handler with Persistence
  const handleSendMessage = useCallback(async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isSendingRef.current || !user) return;

    isSendingRef.current = true;
    setIsSending(true);
    setInputMessage('');
    setChatError(null);

    const clientReqStart = performance.now();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);

    // Persist user message immediately
    persistMessage(user.id, selectedHackathonId, userMsg, updatedWithUser);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 25000);

    try {
      // 1. Get access token directly from existing auth session (0ms) or fallback to getSession
      const token = session?.access_token || (await supabase.auth.getSession()).data.session?.access_token;

      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      // Compact context payload to reduce network latency & token processing
      const compactHistory = messages
        .filter(m => m && m.text && m.id !== 'welcome-reset' && m.id !== 'welcome-1')
        .slice(-3)
        .map(m => ({ sender: m.sender, text: m.text.slice(0, 300) }));

      const compactTasks = Array.isArray(tasks)
        ? tasks.slice(0, 6).map(t => ({ title: t.title?.slice(0, 60), status: t.status, priority: t.priority }))
        : [];

      const compactSkills = Array.isArray(userSkillsData)
        ? userSkillsData.slice(0, 6).map(s => s.skill?.name || s.name || 'Skill')
        : [];

      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream, application/json',
        },
        body: JSON.stringify({
          hackathon: selectedHackathon ? {
            title: selectedHackathon.title,
            organizer: selectedHackathon.organizer,
            mode: selectedHackathon.mode,
            description: selectedHackathon.description?.slice(0, 300),
          } : undefined,
          workspace: currentWorkspace ? {
            project_name: currentWorkspace.project_name,
            problem_statement: currentWorkspace.problem_statement?.slice(0, 200),
            solution: currentWorkspace.solution?.slice(0, 200),
            tech_stack: currentWorkspace.tech_stack,
            progress_percentage: currentWorkspace.progress_percentage,
          } : undefined,
          tasks: compactTasks,
          skills: compactSkills,
          team: teamMembers.slice(0, 4).map(m => ({ display_name: m.display_name, roles: m.roles })),
          userMessage: textToSend,
          chatHistory: compactHistory,
          stream: true,
        }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error('AI Mentor is temporarily unavailable. Please try again.');
      }

      let completeReply = '';
      const aiReplyId = `ai-${Date.now()}`;

      if (res.body) {
        const initialAiReply: ChatMessage = {
          id: aiReplyId,
          sender: 'ai',
          text: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, initialAiReply]);

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              try {
                const jsonStr = trimmed.slice(5).trim();
                if (jsonStr === '[DONE]') continue;
                const dataJson = JSON.parse(jsonStr);
                if (dataJson.chunk) {
                  completeReply += dataJson.chunk;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiReplyId ? { ...msg, text: completeReply } : msg
                    )
                  );
                } else if (dataJson.error) {
                  throw new Error('AI Mentor is temporarily unavailable. Please try again.');
                }
              } catch (parseErr: any) {
                if (parseErr?.message?.includes('AI Mentor is temporarily unavailable')) {
                  throw parseErr;
                }
              }
            }
          }
        }

        // If response was single JSON payload instead of SSE
        if (!completeReply && buffer.trim()) {
          try {
            const fallbackJson = JSON.parse(buffer.trim());
            if (fallbackJson.reply) {
              completeReply = fallbackJson.reply;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiReplyId ? { ...msg, text: completeReply } : msg
                )
              );
            }
          } catch {}
        }
      } else {
        const data = await res.json();
        completeReply = data.reply || '';
        const aiReply: ChatMessage = {
          id: aiReplyId,
          sender: 'ai',
          text: completeReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiReply]);
      }

      const clientDuration = performance.now() - clientReqStart;
      console.log(`[AI-MENTOR-PERF] Stream complete. Total roundtrip: ${clientDuration.toFixed(1)}ms`);

      if (!completeReply) {
        throw new Error('AI Mentor is temporarily unavailable. Please try again.');
      }

      const finalAiReply: ChatMessage = {
        id: aiReplyId,
        sender: 'ai',
        text: completeReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalAllMessages = [...updatedWithUser, finalAiReply];
      // Persist completed conversation
      persistMessage(user.id, selectedHackathonId, finalAiReply, finalAllMessages);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Error contacting AI Mentor:', err);
      const displayError = 'AI Mentor is temporarily unavailable. Please try again.';
      setChatError(displayError);
      setMessages((prev) => {
        const cleaned = prev.filter((m) => m.text && m.text.trim().length > 0);
        return [
          ...cleaned,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'ai',
            text: displayError,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      });
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  }, [inputMessage, selectedHackathon, selectedHackathonId, currentWorkspace, tasks, userSkillsData, teamMembers, messages, user]);

  const clearChat = async () => {
    if (!user) return;
    const freshMessages = await clearPersistentMessages(user.id, selectedHackathonId, selectedHackathon?.title);
    setMessages(freshMessages);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. HERO HEADER */}
      <div className="bg-theme-mentor-8k text-white rounded-3xl p-7 sm:p-10 shadow-2xl border border-cyan-900/40 relative overflow-hidden glow-cyan">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            <Bot className="w-3.5 h-3.5 text-cyan-400" /> AI Hackathon Mentor
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            Real-Time Strategy, Code &amp; Judging Mentorship
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
            Personalized guidance grounded in your active workspace, tasks, sprint progress, and target hackathon requirements.
          </p>
        </div>
      </div>

      {/* 2. HACKATHON SELECTOR BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <label htmlFor="mentor-hackathon-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Hackathon Context
            </label>
            <span className="text-sm font-bold text-slate-800">
              {selectedHackathon ? selectedHackathon.title : 'Select a Hackathon'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {isLoadingHackathons ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading competitions...
            </div>
          ) : (
            <select
              id="mentor-hackathon-select"
              value={selectedHackathonId}
              onChange={(e) => setSelectedHackathonId(e.target.value)}
              className="w-full md:w-72 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {activeHackathons.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title} ({h.organizer || 'Event'})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={clearChat}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. MAIN CHAT & CONTEXT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Context Card */}
        <div className="space-y-4">
          {/* Workspace Status Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-primary-600" /> Linked Workspace
            </h3>

            {currentWorkspace ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-900">{currentWorkspace.project_name || 'Untitled Project'}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentWorkspace.progress_percentage || 0}% Done
                  </span>
                </div>

                {currentWorkspace.problem_statement && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    <strong className="text-slate-800">Problem:</strong> {currentWorkspace.problem_statement}
                  </p>
                )}

                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">
                      {Array.isArray(currentWorkspace.tech_stack) ? currentWorkspace.tech_stack.join(', ') : 'Tech stack in progress'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tasks: {tasks.filter((t) => t.status === 'completed').length}/{tasks.length} Completed</span>
                  </div>
                </div>

                <Link
                  to={`/workspace/${currentWorkspace.id}`}
                  className="text-xs font-bold text-primary-600 hover:text-primary-800 block pt-1"
                >
                  Open Full Workspace →
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-500">No workspace created for this hackathon yet.</p>
                <Link
                  to="/idea-generator"
                  className="px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <FolderPlus className="w-3.5 h-3.5" /> Generate Project Idea
                </Link>
              </div>
            )}
          </div>

          {/* Quick Questions Suggestions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Prompts
            </h3>

            <div className="flex flex-col gap-1.5">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isSending}
                  className="text-left text-xs font-medium p-2.5 bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-700 rounded-xl transition-colors border border-slate-100 truncate"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2-Columns: Chat Interface */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white font-medium rounded-tr-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm whitespace-pre-wrap font-medium'
                  }`}
                >
                  <div>
                    {msg.text ? (
                      msg.text
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-400 py-0.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600 inline flex-shrink-0" />
                        <span className="text-xs font-medium">AI Mentor is thinking...</span>
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] ${
                      msg.sender === 'user' ? 'text-primary-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            {chatError && (
              <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{chatError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about project strategy, judging criteria, technical architecture..."
                disabled={isSending}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
