import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FolderGit2, 
  Loader2, 
  ListChecks, 
  Layers
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { Workspace } from '../types/workspace';

// Session-level strategy cache map for instantaneous tab revisiting (user-isolated in React memory)
const clientStrategyCache = new Map<string, string>();

export default function WinningReadinessPage() {
  const { user } = useAuth();
  const { workspaces, fetchWorkspaces } = useWorkspaces();

  // Selected workspace
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  // Additional context
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Scores from linked modules (optional session/cached benchmarks)
  const [githubScore] = useState<number | null>(null);
  const [pitchScore] = useState<number | null>(null);

  // AI Strategic Explanation
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [strategyStatus, setStrategyStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Set default selected workspace
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
      setSelectedWorkspace(workspaces[0]);
    } else if (selectedWorkspaceId) {
      const match = workspaces.find((w) => w.id === selectedWorkspaceId) || null;
      setSelectedWorkspace(match);
    }
  }, [workspaces, selectedWorkspaceId]);

  // Load user skills & team members in parallel (Promise.all)
  useEffect(() => {
    let isCancelled = false;

    async function loadExtraContext() {
      if (!user) return;

      try {
        const skillsPromise = supabase
          .from('team_profiles')
          .select('skills')
          .eq('user_id', user.id)
          .maybeSingle();

        const teamPromise = selectedWorkspace?.hackathon_id
          ? supabase
              .from('team_requests')
              .select('sender_id, receiver_id')
              .eq('hackathon_id', selectedWorkspace.hackathon_id)
              .eq('status', 'accepted')
              .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          : Promise.resolve({ data: null, error: null });

        const [skillsRes, teamRes] = await Promise.all([skillsPromise, teamPromise]);

        if (isCancelled) return;

        if (skillsRes.data?.skills && Array.isArray(skillsRes.data.skills)) {
          setUserSkills(skillsRes.data.skills);
        } else {
          setUserSkills([]);
        }

        if (teamRes.data && teamRes.data.length > 0) {
          const memberIds = teamRes.data.map((r: any) =>
            r.sender_id === user.id ? r.receiver_id : r.sender_id
          );

          if (memberIds.length > 0) {
            const { data: profiles } = await supabase
              .from('team_profiles')
              .select('user_id, display_name, preferred_roles')
              .in('user_id', memberIds);

            if (!isCancelled) setTeamMembers(profiles || []);
          }
        } else {
          setTeamMembers([]);
        }
      } catch (err) {
        console.error('Error loading extra context:', err);
      }
    }

    loadExtraContext();

    return () => {
      isCancelled = true;
    };
  }, [user, selectedWorkspace]);

  // AI dynamically evaluates readiness instead of local logic
  const [readiness, setReadiness] = useState<any>(null);

  // Check cached strategy on workspace switch
  useEffect(() => {
    if (selectedWorkspace) {
      const cacheKey = `strat:${selectedWorkspace.id}`;
      const cachedStr = clientStrategyCache.get(cacheKey);
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          setReadiness(cached);
          setAiExplanation(cached.explanation);
          setStrategyStatus('ready');
        } catch(e) {}
      } else {
        setReadiness(null);
        setAiExplanation(null);
        setStrategyStatus('idle');
      }
    }
  }, [selectedWorkspaceId]);

  // AI Strategic Explanation Handler (On-Demand only)
  const handleGenerateAiExplanation = async () => {
    if (!selectedWorkspace || strategyStatus === 'loading' || !user) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setStrategyStatus('loading');
    setStrategyError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error('Session expired. Please sign in again.');

      const res = await fetch('/api/ai/winning-readiness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspace: selectedWorkspace,
          userSkills,
          teamMembers,
          githubScore,
          pitchScore,
          workspaceId: selectedWorkspace.id,
          workspaceName: selectedWorkspace.project_name,
          hackathonTitle: selectedWorkspace.hackathon?.title,
        }),
        signal: abortController.signal
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'AI strategy temporarily unavailable. Try again.');
      }

      const data = await res.json();
      setReadiness(data);
      setAiExplanation(data.explanation || null);
      setStrategyStatus('ready');

      // Cache locally in React memory
      if (data.overall_score !== undefined) {
        const cacheKey = `strat:${selectedWorkspace.id}`;
        clientStrategyCache.set(cacheKey, JSON.stringify(data));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error generating AI explanation:', err);
        setStrategyError(err.message || 'AI strategy temporarily unavailable. Try again.');
        setStrategyStatus('error');
      }
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Excellent Readiness':
        return 'text-emerald-600';
      case 'Strong Readiness':
        return 'text-blue-600';
      case 'Good Progress':
        return 'text-amber-600';
      case 'Needs Improvement':
      case 'Early Stage':
      default:
        return 'text-red-600';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Excellent Readiness':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Strong Readiness':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Good Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Needs Improvement':
      case 'Early Stage':
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getScoreBarColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. HERO HEADER */}
      <div className="bg-theme-readiness-8k text-white rounded-3xl p-7 sm:p-10 shadow-2xl border border-purple-900/40 relative overflow-hidden glow-purple">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md text-purple-300 border border-purple-500/30">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Winning Readiness &amp; Architecture Engine
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            Deterministic Hackathon Winning Probability
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
            Multi-dimensional mathematical evaluation of project maturity, technical architecture depth, team role coverage, and judging readiness (0–100 score).
          </p>
        </div>
      </div>

      {/* 2. WORKSPACE SELECTION BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl flex-shrink-0">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <label htmlFor="readiness-workspace-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Choose Workspace to Evaluate
            </label>
            <p className="text-xs text-slate-500">Evaluates current project data against competition criteria.</p>
          </div>
        </div>

        <div className="w-full md:max-w-md">
          {workspaces.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2">
              <span>Create a workspace to measure project readiness.</span>
              <Link
                to="/idea-generator"
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex-shrink-0"
              >
                Idea Generator
              </Link>
            </div>
          ) : (
            <select
              id="readiness-workspace-select"
              value={selectedWorkspaceId}
              onChange={(e) => {
                setSelectedWorkspaceId(e.target.value);
                setStrategyStatus('idle');
              }}
              className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.project_name || 'Untitled Workspace'} ({w.hackathon?.title || 'Hackathon'})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 3. MAIN SCORE CARD */}
      {selectedWorkspace ? (
        !readiness ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 mt-8">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Project Not Evaluated</h3>
              <p className="text-sm text-slate-500">Click the button below to have the AI evaluate your project's semantic quality and calculate your winning readiness score.</p>
            </div>
            <button
              onClick={handleGenerateAiExplanation}
              disabled={strategyStatus === 'loading'}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-all"
            >
              {strategyStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Semantics...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Evaluate Readiness
                </>
              )}
            </button>
          </div>
        ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Evaluation Metric • Ready
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {selectedWorkspace.project_name || 'Project'} Readiness Score
              </h2>
              <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getTierBadge(readiness.readiness_tier)}`}>
                  {readiness.readiness_tier}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  for {selectedWorkspace.hackathon?.title || 'Hackathon Event'}
                </span>
              </div>
            </div>

            {/* Score circle / metric */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center min-w-[200px] flex-shrink-0">
              <div className="flex items-baseline gap-1 my-1">
                <span className={`text-5xl sm:text-6xl font-black ${getTierColor(readiness.readiness_tier)}`}>
                  {readiness.overall_score}
                </span>
                <span className="text-lg font-bold text-slate-400">/100</span>
              </div>
              <div className="w-36 h-2.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full ${getScoreBarColor(readiness.overall_score, 100)} transition-all duration-500`}
                  style={{ width: `${readiness.overall_score}%` }}
                />
              </div>
            </div>
          </div>

          {/* 4. 8-CATEGORY BREAKDOWN CARDS */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary-600" />
                Category Score Breakdown (100 Points Total)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {readiness.categories && readiness.categories.map((cat: any) => (
                <div key={cat.key} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start text-xs font-bold gap-2">
                      <span className="text-slate-800">{cat.name}</span>
                      <span className="text-slate-900 flex-shrink-0">
                        {cat.score} <span className="text-slate-400 font-normal">/ {cat.maxScore}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {cat.explanation}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBarColor(cat.score, cat.maxScore)} transition-all duration-500`}
                        style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold block text-right ${
                      cat.status === 'Analyzed' ? 'text-emerald-600' : cat.status === 'Partial' ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {cat.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. STRENGTHS & GAPS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Your Strengths
              </h3>
              {readiness.strengths.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-700">
                  {readiness.strengths.map((str: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">Complete more workspace tasks and linked tools to unlock strengths.</p>
              )}
            </div>

            {/* Critical Gaps */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Critical Gaps to Address
              </h3>
              {readiness.gaps.length > 0 ? (
                <div className="space-y-2.5">
                  {readiness.gaps.slice(0, 5).map((gap: any) => (
                    <div key={gap.id} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{gap.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          gap.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {gap.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">{gap.action}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No critical gaps identified!</p>
              )}
            </div>
          </div>

          {/* 6. BEFORE YOU SUBMIT: ACTION PLAN CHECKLIST */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-primary-600" />
              Before You Submit (Action Checklist)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {readiness.checklist && readiness.checklist.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7. OPTIONAL AI STRATEGIC EXPLANATION */}
          <div className="bg-primary-50/40 border border-primary-100 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-primary-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  AI Strategic Pitch & Judging Summary
                </h3>
                <p className="text-xs text-slate-600">
                  {strategyStatus === 'ready' ? 'Strategy ready' : 'Generate an in-depth strategic breakdown on-demand.'}
                </p>
              </div>

              <button
                onClick={handleGenerateAiExplanation}
                disabled={strategyStatus === 'loading'}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                {strategyStatus === 'loading' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating strategy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiExplanation ? 'Regenerate Strategy' : 'Explain My Score'}</span>
                  </>
                )}
              </button>
            </div>

            {strategyError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {strategyError}
              </div>
            )}

            {aiExplanation && (
              <div className="p-4 bg-white border border-primary-100 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium shadow-inner animate-in fade-in">
                {aiExplanation}
              </div>
            )}
          </div>
        </div>
        )
      ) : (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
          <FolderGit2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Workspace Selected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create or select a workspace to measure how prepared your project is before final submission.
          </p>
        </div>
      )}
    </div>
  );
}
