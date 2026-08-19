import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lightbulb, 
  Sparkles, 
  Rocket, 
  Calendar, 
  Clock, 
  Target, 
  Cpu, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  FolderGit2,
  Compass,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { Hackathon } from '../hooks/useHackathons';

export interface GeneratedIdea {
  title: string;
  problem_statement: string;
  proposed_solution: string;
  target_users: string[];
  core_mvp_features: string[];
  recommended_tech_stack: string[];
  suggested_team_roles: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  why_it_fits_hackathon: string;
  judging_strengths: string[];
  risks: string[];
  estimated_build_time: string;
}

export default function IdeaGeneratorPage() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { createWorkspace } = useWorkspaces();

  // Hackathons & Selection
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [isLoadingHackathons, setIsLoadingHackathons] = useState<boolean>(true);

  // User Context
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [existingWorkspace, setExistingWorkspace] = useState<any | null>(null);

  // Idea Generation State
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const isGeneratingRef = useRef<boolean>(false);

  // Expandable Idea cards state
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // Workspace creation / opening state
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // 1. Fetch available hackathons & user skills concurrently on mount
  useEffect(() => {
    async function loadInitialData() {
      if (!user) return;
      setIsLoadingHackathons(true);

      try {
        const [hackRes, profRes] = await Promise.all([
          supabase
            .from('hackathons')
            .select('*')
            .order('start_date', { ascending: true }),
          supabase
            .from('team_profiles')
            .select('skills')
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        if (hackRes.error) throw hackRes.error;

        const list = hackRes.data || [];
        setHackathons(list);

        if (list.length > 0) {
          setSelectedHackathonId(list[0].id);
          setSelectedHackathon(list[0]);
        }

        if (profRes.data?.skills && Array.isArray(profRes.data.skills)) {
          setUserSkills(profRes.data.skills);
        }
      } catch (err) {
        console.error('Error loading hackathons for idea generator:', err);
      } finally {
        setIsLoadingHackathons(false);
      }
    }

    loadInitialData();
  }, [user]);

  // 2. Update selected hackathon & check if workspace already exists
  useEffect(() => {
    if (!selectedHackathonId) {
      setSelectedHackathon(null);
      setExistingWorkspace(null);
      return;
    }

    const match = hackathons.find(h => h.id === selectedHackathonId) || null;
    setSelectedHackathon(match);

    // Clear previous generated ideas when changing hackathon to keep context aligned
    setIdeas([]);
    setGenerateError(null);
    setActionError(null);

    // Check if user already has a workspace for this hackathon
    async function checkWorkspace() {
      if (!user) return;
      try {
        const { data: ws } = await supabase
          .from('workspaces')
          .select('id, project_name, problem_statement, solution, tech_stack')
          .eq('hackathon_id', selectedHackathonId)
          .eq('user_id', user.id)
          .maybeSingle();

        setExistingWorkspace(ws || null);
      } catch {
        setExistingWorkspace(null);
      }
    }

    checkWorkspace();
  }, [selectedHackathonId, hackathons, user]);

  // 3. Generate Ideas Handler
  const handleGenerateIdeas = async () => {
    if (!selectedHackathon || isGeneratingRef.current || !user) {
      return;
    }

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setGenerateError(null);
    setActionError(null);

    const clientReqStart = performance.now();
    const previousTitles = ideas.map(i => i.title);

    // Atomically reset expanded cards and clear previous ideas
    setExpandedCards({});
    setIdeas([]);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 25000);

    try {
      const token = session?.access_token || (await supabase.auth.getSession()).data.session?.access_token;

      if (!token) {
        throw new Error('Authentication session expired. Please sign in again.');
      }

      const generationNonce = `${Date.now()}-${Math.random()}`;

      const requestUrl = '/api/ai/idea-generator';
      const requestPayload = {
        hackathon: selectedHackathon ? {
          title: selectedHackathon.title,
          description: selectedHackathon.description?.slice(0, 200),
          mode: selectedHackathon.mode
        } : undefined,
        skills: userSkills.slice(0, 6),
        workspaceContext: existingWorkspace ? { project_name: existingWorkspace.project_name } : undefined,
        previousIdeaTitles: previousTitles.slice(0, 6),
        generationNonce,
      };

      const res = await fetch(requestUrl, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
        body: JSON.stringify(requestPayload),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const statusMsg = `(HTTP ${res.status})`;
        throw new Error(data.error || data.details || `Unable to generate ideas ${statusMsg}. Please try again.`);
      }

      if (!data.ideas || !Array.isArray(data.ideas) || data.ideas.length === 0) {
        throw new Error('No ideas were returned. Please try again.');
      }

      const tRenderStart = performance.now();

      // Safe normalization of all array and string properties to guarantee zero render exceptions
      const normalizedIdeas: GeneratedIdea[] = data.ideas.map((raw: any, index: number) => {
        const norm: GeneratedIdea = {
          title: raw?.title || `Concept #${index + 1}`,
          problem_statement: raw?.problem_statement || 'No problem statement provided.',
          proposed_solution: raw?.proposed_solution || 'No solution description provided.',
          target_users: Array.isArray(raw?.target_users) ? raw.target_users : [],
          core_mvp_features: Array.isArray(raw?.core_mvp_features) ? raw.core_mvp_features : [],
          recommended_tech_stack: Array.isArray(raw?.recommended_tech_stack) ? raw.recommended_tech_stack : [],
          suggested_team_roles: Array.isArray(raw?.suggested_team_roles) ? raw.suggested_team_roles : [],
          difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(raw?.difficulty) ? raw.difficulty : 'Intermediate',
          why_it_fits_hackathon: raw?.why_it_fits_hackathon || '',
          judging_strengths: Array.isArray(raw?.judging_strengths) ? raw.judging_strengths : [],
          risks: Array.isArray(raw?.risks) ? raw.risks : [],
          estimated_build_time: raw?.estimated_build_time || '24-36 Hours',
        };
        return norm;
      });

      // Atomically replace state with fresh ideas
      setIdeas(normalizedIdeas);
      setGenerateError(null);
      setExpandedCards({ 0: true });

      const renderDuration = performance.now() - tRenderStart;
      const clientDuration = performance.now() - clientReqStart;
      console.log(`[IDEA-PERF] frontend rendering: ${renderDuration.toFixed(1)} ms | client total: ${clientDuration.toFixed(1)} ms`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('[IDEA-GEN-PERF] Error generating ideas:', err);
      const isTimeout = err.name === 'AbortError';
      const displayMsg = isTimeout 
        ? 'Idea generation timed out. Please try again.' 
        : (err.message || 'Unable to generate ideas. Please try again.');
      setGenerateError(displayMsg);
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  };

  // 4. "Use This Idea" Action Handler
  const handleUseIdea = async (idea: GeneratedIdea, index: number) => {
    if (!user || !selectedHackathon || processingIndex !== null) return;

    setProcessingIndex(index);
    setActionError(null);

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    try {
      console.log('[WORKSPACE-TRACE-01] handleUseIdea entered for index:', index);
      console.log('[WORKSPACE-TRACE-02] idea received:', idea.title);
      console.log('[WORKSPACE-TRACE-03] hackathon ID:', selectedHackathon.id);

      // If workspace already exists for this hackathon, navigate directly to it
      if (existingWorkspace?.id) {
        const existingId = String(existingWorkspace.id).trim();
        console.log('[WORKSPACE-TRACE-03-EXISTING] Existing workspace found. ID:', existingId);
        if (UUID_REGEX.test(existingId)) {
          console.log('[WORKSPACE-TRACE-09] final navigation URL: /workspace/' + existingId);
          navigate(`/workspace/${existingId}`);
          return;
        }
      }

      const creationPayload = {
        hackathon_id: selectedHackathon.id,
        project_name: idea.title,
        problem_statement: idea.problem_statement,
        solution: idea.proposed_solution,
        tech_stack: idea.recommended_tech_stack,
      };

      console.log('[WORKSPACE-TRACE-04] inserting workspace with payload:', creationPayload);

      // Insert or fetch workspace row populated with the chosen idea
      const newWs = await createWorkspace(creationPayload);

      console.log('[WORKSPACE-TRACE-05] Supabase response object:', newWs);
      console.log('[WORKSPACE-TRACE-07] returned workspace ID:', newWs?.id);

      const workspaceId = newWs?.id ? String(newWs.id).trim() : '';

      if (!workspaceId || !UUID_REGEX.test(workspaceId)) {
        console.error('[WORKSPACE-TRACE-08] Invalid workspace UUID returned:', workspaceId);
        throw new Error('Invalid workspace ID returned from database. Please try again.');
      }

      console.log('[WORKSPACE-TRACE-08] UUID validation result: PASS (', workspaceId, ')');
      console.log('[WORKSPACE-TRACE-09] final navigation URL: /workspace/' + workspaceId);

      navigate(`/workspace/${workspaceId}`);
    } catch (err: any) {
      console.error('[WORKSPACE-TRACE-CATCH] Use Idea error:', err);
      setActionError(err.message || 'Unable to create workspace. Please try again.');
    } finally {
      setProcessingIndex(null);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Intermediate':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. HERO BANNER */}
      <div className="bg-theme-idea-lab text-white rounded-3xl p-7 sm:p-10 shadow-2xl border border-amber-900/40 relative overflow-hidden glow-cyan">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md text-amber-300 border border-amber-500/30">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> AI Hackathon Idea Generator
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            Turn Hackathon Challenges Into Winning Projects
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
            Generate tailored, technically buildable MVP project concepts with defined architectures, team roles, judging strengths, and build timelines.
          </p>
        </div>
      </div>

      {/* 2. HACKATHON SELECTOR BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <label htmlFor="idea-hackathon-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Target Hackathon
              </label>
              <p className="text-xs text-slate-500">Pick the competition you are participating in.</p>
            </div>
          </div>

          <div className="w-full md:max-w-md">
            {isLoadingHackathons ? (
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
            ) : hackathons.length === 0 ? (
              <div className="text-xs text-slate-500 flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span>No hackathons available.</span>
                <Link to="/hackathons" className="text-primary-600 font-bold hover:underline flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> Discover
                </Link>
              </div>
            ) : (
              <select
                id="idea-hackathon-select"
                value={selectedHackathonId}
                onChange={(e) => setSelectedHackathonId(e.target.value)}
                disabled={isGenerating}
                className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {hackathons.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title} ({h.mode || 'Online'})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Selected Hackathon Brief Details */}
        {selectedHackathon && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="space-y-1 max-w-2xl">
              <p className="font-semibold text-slate-800 line-clamp-2">
                {selectedHackathon.description || 'General innovation & technology hackathon challenge.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                <span className="font-medium text-slate-700">Organizer: {selectedHackathon.organizer || 'HackVerse'}</span>
                <span>•</span>
                <span>Mode: {selectedHackathon.mode || 'Online'}</span>
                <span>•</span>
                <span>Start: {new Date(selectedHackathon.start_date).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={handleGenerateIdeas}
              disabled={isGenerating || !selectedHackathon}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 self-start sm:self-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Brainstorming Ideas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{ideas.length > 0 ? 'Regenerate Ideas' : 'Generate Ideas'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Global Error Banner */}
      {(generateError || actionError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-700 flex items-center gap-3 font-medium animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{generateError || actionError}</span>
        </div>
      )}

      {/* 3. LOADING STATE */}
      {isGenerating && (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Crafting Winning Hackathon Ideas</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Analyzing theme requirements, technical feasibility, MVP scope, and judging criteria for {selectedHackathon?.title}...
            </p>
          </div>
        </div>
      )}

      {/* 4. EMPTY STATE — NO SELECTION / NOT GENERATED YET */}
      {!isGenerating && ideas.length === 0 && (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {selectedHackathon ? 'No ideas generated yet.' : 'Select a hackathon to generate project ideas.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {selectedHackathon 
                ? 'Click "Generate Ideas" above to create actionable MVP concepts with complete architectures and team breakdowns.'
                : 'Select your target hackathon above to start the AI ideation process.'}
            </p>
          </div>
          {selectedHackathon && (
            <button
              onClick={handleGenerateIdeas}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Generate Ideas Now
            </button>
          )}
        </div>
      )}

      {/* 5. GENERATED IDEAS LIST */}
      {!isGenerating && ideas.length > 0 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-600" />
              Generated Project Concepts ({ideas.length})
            </h2>
            <span className="text-xs text-slate-500">
              Tailored for <span className="font-semibold text-slate-800">{selectedHackathon?.title}</span>
            </span>
          </div>

          <div className="space-y-4">
            {ideas.map((idea, idx) => {
              const isExpanded = expandedCards[idx] ?? false;
              const isProcessing = processingIndex === idx;

              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Card Header Bar */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-400">#0{idx + 1}</span>
                        <h3 className="text-lg font-bold text-slate-900">{idea.title}</h3>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(idea.difficulty)}`}>
                          {idea.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{idea.estimated_build_time}</span>
                      </div>
                    </div>

                    {/* Problem & Solution Preview */}
                    <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <p><strong className="text-slate-900 font-semibold">Problem:</strong> {idea.problem_statement}</p>
                      <p><strong className="text-slate-900 font-semibold">Solution:</strong> {idea.proposed_solution}</p>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-slate-400" /> Stack:
                      </span>
                      {idea.recommended_tech_stack.map((tech, tIdx) => (
                        <span 
                          key={tIdx}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Card Action Row */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors self-start sm:self-auto"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Details & Architecture</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>View Full MVP Scope & Judging Strengths</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleUseIdea(idea, idx)}
                        disabled={isProcessing || processingIndex !== null}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Setting up workspace...</span>
                          </>
                        ) : existingWorkspace?.id ? (
                          <>
                            <FolderGit2 className="w-3.5 h-3.5" />
                            <span>Open Existing Workspace</span>
                          </>
                        ) : (
                          <>
                            <Rocket className="w-3.5 h-3.5" />
                            <span>Use This Idea</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section Details */}
                  {isExpanded && (
                    <div className="px-5 pb-6 sm:px-6 pt-2 bg-slate-50/60 border-t border-slate-100 space-y-4 text-xs">
                      {/* Grid Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Core MVP Features */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-primary-600">
                            <Layers className="w-3.5 h-3.5" /> Core MVP Features
                          </span>
                          <ul className="space-y-1.5">
                            {idea.core_mvp_features.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-1.5 text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 2. Judging Strengths */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-purple-600">
                            <Target className="w-3.5 h-3.5" /> Judging Strengths
                          </span>
                          <ul className="space-y-1.5">
                            {idea.judging_strengths.map((str, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-1.5 text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 mt-1.5"></span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 3. Team Roles Breakdown */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-blue-600">
                            <Users className="w-3.5 h-3.5" /> Suggested Team Squad
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {idea.suggested_team_roles.map((role, rIdx) => (
                              <span 
                                key={rIdx}
                                className="px-2.5 py-1 bg-blue-50 text-blue-800 font-semibold rounded-lg text-[11px]"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* 4. Risks & Mitigations */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-amber-600">
                            <AlertTriangle className="w-3.5 h-3.5" /> Hackathon Risks & Bottlenecks
                          </span>
                          <ul className="space-y-1.5">
                            {idea.risks.map((risk, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-1.5 text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5"></span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Why it fits hackathon box */}
                      <div className="p-3.5 bg-primary-50/50 border border-primary-100 rounded-xl text-slate-700 text-xs">
                        <strong className="text-primary-950 font-bold block mb-1">Why this project fits {selectedHackathon?.title}:</strong>
                        <p>{idea.why_it_fits_hackathon}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
