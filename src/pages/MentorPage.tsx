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

export default function MentorPage() {
  const { user } = useAuth();

  // Selected Hackathon and User Hackathons List
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [isLoadingHackathons, setIsLoadingHackathons] = useState<boolean>(true);

  // Context Data
  const [userSkillsData, setUserSkillsData] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Workspace integration for this hackathon
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  const { currentWorkspace, tasks } = useWorkspaces(workspaceId);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
        const savedPromise = supabase
          .from('saved_hackathons')
          .select('hackathons(*)')
          .eq('user_id', user.id);

        const workspacePromise = supabase
          .from('workspaces')
          .select('hackathon:hackathons(*)')
          .eq('user_id', user.id);

        const [savedRes, workspaceRes] = await Promise.all([savedPromise, workspacePromise]);

        if (isCancelled) return;

        const hackMap = new Map<string, Hackathon>();

        (savedRes.data || []).forEach((item: any) => {
          if (item.hackathons) hackMap.set(item.hackathons.id, item.hackathons);
        });

        (workspaceRes.data || []).forEach((item: any) => {
          if (item.hackathon) hackMap.set(item.hackathon.id, item.hackathon);
        });

        if (hackMap.size === 0) {
          const { data: popularHacks } = await supabase
            .from('hackathons')
            .select('*')
            .order('start_date', { ascending: true })
            .limit(5);

          if (!isCancelled) {
            (popularHacks || []).forEach((h: any) => hackMap.set(h.id, h));
          }
        }

        const hackList = Array.from(hackMap.values());
        if (!isCancelled) {
          setActiveHackathons(hackList);
          if (hackList.length > 0) {
            setSelectedHackathonId(hackList[0].id);
          }
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

  // 2. Load context in Parallel (Promise.all) when selectedHackathonId changes
  useEffect(() => {
    let isCancelled = false;

    async function loadContext() {
      if (!user || !selectedHackathonId) {
        setSelectedHackathon(null);
        setWorkspaceId(undefined);
        setUserSkillsData([]);
        setTeamMembers([]);
        return;
      }

      const chosen = activeHackathons.find((h) => h.id === selectedHackathonId) || null;
      if (!isCancelled) setSelectedHackathon(chosen);

      try {
        const wsPromise = supabase
          .from('workspaces')
          .select('id')
          .eq('hackathon_id', selectedHackathonId)
          .eq('user_id', user.id)
          .maybeSingle();

        const profPromise = supabase
          .from('team_profiles')
          .select('skills, preferred_roles')
          .eq('user_id', user.id)
          .maybeSingle();

        const requestsPromise = supabase
          .from('team_requests')
          .select('sender_id, receiver_id')
          .eq('hackathon_id', selectedHackathonId)
          .eq('status', 'accepted')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        const [wsRes, profRes, requestsRes] = await Promise.all([
          wsPromise,
          profPromise,
          requestsPromise
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

        // Welcome greeting for this hackathon
        if (chosen && !isCancelled) {
          setMessages([
            {
              id: 'welcome-reset',
              sender: 'ai',
              text: `👋 Hey! I'm your AI Hackathon Mentor for **${chosen.title}**.\n\nI'm connected to your project workspace, tasks, and team data. Ask me anything, or choose a quick evaluation question below to begin!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
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

  // 3. Send Message to AI Mentor Handler with Atomic Lock & Timeout
  const handleSendMessage = useCallback(async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isSendingRef.current) return;

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

    setMessages((prev) => [...prev, userMsg]);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 25000);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hackathon: selectedHackathon,
          workspace: currentWorkspace,
          tasks: tasks || [],
          skills: userSkillsData,
          skillGaps: [],
          team: teamMembers,
          userMessage: textToSend,
          chatHistory: messages.slice(-4),
        }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const statusMsg = `(HTTP ${res.status})`;
        throw new Error(errorData.error || errorData.details || `AI Mentor is temporarily unavailable ${statusMsg}. Please try again.`);
      }

      const data = await res.json();
      const clientDuration = performance.now() - clientReqStart;
      console.log(`[AI-MENTOR-PERF] Client Roundtrip: ${clientDuration.toFixed(1)}ms | Server Reported: ${data?.perf?.totalMs || 0}ms (Model: ${data?.perf?.model || 'default'})`);

      if (!data || !data.reply) {
        throw new Error('Empty response received from AI Mentor.');
      }

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Error contacting AI Mentor:', err);
      const isTimeout = err.name === 'AbortError';
      const displayError = isTimeout 
        ? 'AI Mentor request timed out. Please try again.' 
        : (err.message || 'AI Mentor is temporarily unavailable. Please try again.');
      setChatError(displayError);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Notice:** ${displayError}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  }, [inputMessage, selectedHackathon, currentWorkspace, tasks, userSkillsData, teamMembers, messages]);

  const clearChat = () => {
    if (selectedHackathon) {
      setMessages([
        {
          id: 'welcome-reset',
          sender: 'ai',
          text: `Chat cleared. How can I help you with **${selectedHackathon.title}**?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([]);
    }
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
                  <div>{msg.text}</div>
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

            {isSending && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 font-medium flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
                  <span>AI Mentor is strategizing...</span>
                </div>
              </div>
            )}

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
