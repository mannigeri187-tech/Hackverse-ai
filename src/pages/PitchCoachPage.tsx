import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  Sparkles, 
  Layers, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  FolderGit2, 
  Clock,
  Send,
  HelpCircle,
  TrendingUp,
  Target
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { Workspace } from '../types/workspace';

interface PitchAnalysisResult {
  overall_score: number;
  scores: {
    problem_clarity: number;
    solution_clarity: number;
    innovation: number;
    technical_credibility: number;
    user_impact: number;
    differentiation: number;
    storytelling: number;
    delivery_structure: number;
    hackathon_relevance: number;
  };
  strengths: string[];
  weaknesses: string[];
  missing_information: string[];
  improvements: string[];
  rewritten_pitch: string;
}

const PRACTICE_QUESTIONS = [
  'Explain the problem your project solves.',
  'What makes your solution unique compared to existing alternatives?',
  'Walk us through your tech stack and architecture choices.',
  'Who is your target user and what validation have you received?',
  'How will this project scale after the hackathon?',
];

export default function PitchCoachPage() {
  const { workspaces, fetchWorkspaces } = useWorkspaces();

  // Active Tab: 'generate' | 'analyze' | 'practice'
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze' | 'practice'>('generate');

  // Selected Workspace
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  // Pitch Generation State
  const [generatedPitches, setGeneratedPitches] = useState<{
    pitch_30s?: string;
    pitch_60s?: string;
    pitch_2min?: string;
  } | null>(null);
  const [pitchSections, setPitchSections] = useState<{
    hook: string;
    problem: string;
    solution: string;
    target_users: string;
    tech_stack: string;
    business_impact: string;
    differentiation: string;
    closing: string;
  }>({
    hook: '',
    problem: '',
    solution: '',
    target_users: '',
    tech_stack: '',
    business_impact: '',
    differentiation: '',
    closing: '',
  });

  const [selectedDurationTab, setSelectedDurationTab] = useState<'30s' | '60s' | '2min'>('60s');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Pitch Analysis State
  const [customPitchText, setCustomPitchText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PitchAnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Q&A Practice State
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [practiceAnswer, setPracticeAnswer] = useState<string>('');
  const [isEvaluatingPractice, setIsEvaluatingPractice] = useState<boolean>(false);
  const [practiceFeedback, setPracticeFeedback] = useState<any | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);

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

  // 1. Generate Pitch Handler
  const handleGeneratePitch = async () => {
    if (!selectedWorkspace || isGenerating) return;

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error('Session expired. Please log in again.');

      const res = await fetch('/api/ai/pitch-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'generate',
          workspace: selectedWorkspace,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Unable to generate pitch.');
      }

      const data = await res.json();
      setGeneratedPitches(data.pitches || null);
      if (data.sections) {
        setPitchSections({
          hook: data.sections.hook || '',
          problem: data.sections.problem || '',
          solution: data.sections.solution || '',
          target_users: data.sections.target_users || '',
          tech_stack: data.sections.tech_stack || '',
          business_impact: data.sections.business_impact || '',
          differentiation: data.sections.differentiation || '',
          closing: data.sections.closing || '',
        });
      }

      // Pre-fill analyze box with the 60s pitch
      if (data.pitches?.pitch_60s) {
        setCustomPitchText(data.pitches.pitch_60s);
      }
    } catch (err: any) {
      console.error('Error generating pitch:', err);
      setGenerateError(err.message || 'Unable to generate pitch. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Analyze Pitch Handler
  const handleAnalyzePitch = async () => {
    const pitchToSend = customPitchText.trim();
    if (!pitchToSend || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error('Session expired. Please log in again.');

      const res = await fetch('/api/ai/pitch-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'analyze',
          workspace: selectedWorkspace,
          customPitch: pitchToSend,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Unable to analyze pitch.');
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Error analyzing pitch:', err);
      setAnalyzeError(err.message || 'Unable to analyze pitch. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. Practice Q&A Answer Evaluation Handler
  const handleEvaluatePractice = async () => {
    const answer = practiceAnswer.trim();
    if (!answer || isEvaluatingPractice) return;

    setIsEvaluatingPractice(true);
    setPracticeError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error('Session expired. Please log in again.');

      const res = await fetch('/api/ai/pitch-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'practice_feedback',
          workspace: selectedWorkspace,
          practiceQuestion: PRACTICE_QUESTIONS[selectedQuestionIndex],
          practiceAnswer: answer,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Unable to evaluate practice answer.');
      }

      const data = await res.json();
      setPracticeFeedback(data);
    } catch (err: any) {
      console.error('Error evaluating practice answer:', err);
      setPracticeError(err.message || 'Unable to evaluate answer. Please try again.');
    } finally {
      setIsEvaluatingPractice(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. HERO HEADER */}
      <div className="bg-theme-brain text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden glow-cyan">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            <Mic className="w-3.5 h-3.5 text-cyan-400" /> AI Pitch Coach
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            Master Your Hackathon Demo & Final Pitch
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed">
            Generate tailored 30s, 60s, and 2-minute elevator pitches, get multi-criteria judging scores (0–100), and practice tough judge Q&A questions.
          </p>
        </div>
      </div>

      {/* 2. WORKSPACE SELECTOR */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl flex-shrink-0">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <label htmlFor="pitch-workspace-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Project Workspace
            </label>
            <p className="text-xs text-slate-500">The pitch coach customizes arguments using this project.</p>
          </div>
        </div>

        <div className="w-full md:max-w-md">
          {workspaces.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2">
              <span>Create a workspace first to use AI Pitch Coach.</span>
              <Link
                to="/idea-generator"
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex-shrink-0"
              >
                Idea Generator
              </Link>
            </div>
          ) : (
            <select
              id="pitch-workspace-select"
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
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

      {/* Selected Workspace Snapshot Box */}
      {selectedWorkspace && (
        <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{selectedWorkspace.project_name || 'Project'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{selectedWorkspace.hackathon?.title || 'Hackathon Event'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Stack: {Array.isArray(selectedWorkspace.tech_stack) ? selectedWorkspace.tech_stack.slice(0, 4).join(', ') : 'Web Stack'}</span>
          </div>
        </div>
      )}

      {/* 3. NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('generate')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'generate'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1. Generate & Edit Pitch</span>
        </button>

        <button
          onClick={() => setActiveTab('analyze')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'analyze'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>2. Judging Score & Review</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'practice'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>3. Judge Q&A Practice</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GENERATE PITCH & SECTION EDITOR */}
      {/* ========================================================================= */}
      {activeTab === 'generate' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Pitch Generator Trigger Action */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  AI Hackathon Pitch Generator
                </h2>
                <p className="text-xs text-slate-500">
                  Synthesize your project details into formatted 30s, 60s, and 2-min pitches with structured section builders.
                </p>
              </div>

              <button
                onClick={handleGeneratePitch}
                disabled={isGenerating || !selectedWorkspace}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Drafting Pitch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{generatedPitches ? 'Regenerate Pitch' : 'Generate Pitch'}</span>
                  </>
                )}
              </button>
            </div>

            {generateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{generateError}</span>
              </div>
            )}
          </div>

          {/* Pitches by Duration Tabs */}
          {generatedPitches && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> Formatted Pitch Scripts
                </h3>

                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {(['30s', '60s', '2min'] as const).map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setSelectedDurationTab(dur)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        selectedDurationTab === dur
                          ? 'bg-white text-primary-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {dur === '30s' ? '30s Elevator' : dur === '60s' ? '60s Demo' : '2-Min Final'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedDurationTab === '30s' && (generatedPitches.pitch_30s || 'No 30s pitch')}
                {selectedDurationTab === '60s' && (generatedPitches.pitch_60s || 'No 60s pitch')}
                {selectedDurationTab === '2min' && (generatedPitches.pitch_2min || 'No 2-minute pitch')}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    const text = selectedDurationTab === '30s' 
                      ? generatedPitches.pitch_30s 
                      : selectedDurationTab === '60s' 
                        ? generatedPitches.pitch_60s 
                        : generatedPitches.pitch_2min;
                    if (text) {
                      setCustomPitchText(text);
                      setActiveTab('analyze');
                    }
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Analyze This Script</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Modular Section Editor */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-600" />
                Modular Pitch Script Editor
              </h3>
              <p className="text-xs text-slate-500">
                Fine-tune each individual section of your hackathon pitch presentation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Opening Hook */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">1. Opening Hook</label>
                <textarea
                  value={pitchSections.hook}
                  onChange={(e) => setPitchSections({ ...pitchSections, hook: e.target.value })}
                  placeholder="Start with a surprising stat, relatable frustration, or bold vision..."
                  rows={3}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 2. Problem Statement */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">2. Problem Statement</label>
                <textarea
                  value={pitchSections.problem}
                  onChange={(e) => setPitchSections({ ...pitchSections, problem: e.target.value })}
                  placeholder="Clearly describe the pain point and who suffers from it..."
                  rows={3}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 3. Proposed Solution */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">3. Proposed Solution & MVP</label>
                <textarea
                  value={pitchSections.solution}
                  onChange={(e) => setPitchSections({ ...pitchSections, solution: e.target.value })}
                  placeholder="Explain what your app does and how it eliminates the problem..."
                  rows={3}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 4. Target Users */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">4. Target Users & Validation</label>
                <textarea
                  value={pitchSections.target_users}
                  onChange={(e) => setPitchSections({ ...pitchSections, target_users: e.target.value })}
                  placeholder="Who will use this product and why do they care?..."
                  rows={3}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 5. Technology Architecture */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">5. Tech Architecture & Stack</label>
                <textarea
                  value={pitchSections.tech_stack}
                  onChange={(e) => setPitchSections({ ...pitchSections, tech_stack: e.target.value })}
                  placeholder="How does your tech stack power high performance and AI inference?..."
                  rows={3}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 6. Differentiation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">6. Unfair Advantage / Differentiation</label>
                <textarea
                  value={pitchSections.differentiation}
                  onChange={(e) => setPitchSections({ ...pitchSections, differentiation: e.target.value })}
                  placeholder="Why is your solution 10x better than existing alternatives?..."
                  rows={3}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 7. Business & Social Impact */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">7. Impact & Future Scalability</label>
                <textarea
                  value={pitchSections.business_impact}
                  onChange={(e) => setPitchSections({ ...pitchSections, business_impact: e.target.value })}
                  placeholder="Viability, market potential, or user adoption roadmap..."
                  rows={3}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 8. Closing Call to Action */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">8. Closing & Call to Action</label>
                <textarea
                  value={pitchSections.closing}
                  onChange={(e) => setPitchSections({ ...pitchSections, closing: e.target.value })}
                  placeholder="Memorable closing phrase and thank you to the judges..."
                  rows={3}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  const merged = [
                    pitchSections.hook,
                    pitchSections.problem,
                    pitchSections.solution,
                    pitchSections.target_users,
                    pitchSections.tech_stack,
                    pitchSections.differentiation,
                    pitchSections.business_impact,
                    pitchSections.closing,
                  ]
                    .filter(Boolean)
                    .join('\n\n');

                  if (merged) {
                    setCustomPitchText(merged);
                    setActiveTab('analyze');
                  }
                }}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Score My Sectioned Pitch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PITCH ANALYSIS & JUDGING METRICS */}
      {/* ========================================================================= */}
      {activeTab === 'analyze' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Input Box for custom pitch text */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-600" />
                Pitch Evaluation & Judging Rubric
              </h2>
              <p className="text-xs text-slate-500">
                Paste or edit your complete pitch draft below to get a 0–100 breakdown across 9 key hackathon judging criteria.
              </p>
            </div>

            <textarea
              value={customPitchText}
              onChange={(e) => setCustomPitchText(e.target.value)}
              placeholder="Paste your pitch script here (problem, solution, demo points, tech stack, and impact)..."
              rows={8}
              className="w-full text-xs sm:text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium leading-relaxed"
            />

            {analyzeError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{analyzeError}</span>
              </div>
            )}

            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-[11px] text-slate-400 font-semibold">
                {customPitchText.split(/\s+/).filter(Boolean).length} words
              </span>

              <button
                onClick={handleAnalyzePitch}
                disabled={isAnalyzing || !customPitchText.trim()}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Against Judging Rubric...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Analyze Pitch Score</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Dashboard Result */}
          {analysisResult && (
            <div className="space-y-6 animate-in fade-in">
              {/* Overall Score Banner */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Judging Readiness
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">Overall Pitch Quality</h3>
                  <p className="text-xs text-slate-500 max-w-md">
                    Evaluated against hackathon judging criteria (clarity, innovation, technical depth, and impact).
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-black ${getScoreColor(analysisResult.overall_score)}`}>
                    {analysisResult.overall_score}
                  </span>
                  <span className="text-base font-bold text-slate-400">/100</span>
                </div>
              </div>

              {/* 9-Metric Category Breakdown Grid */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  Category Score Breakdown
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysisResult.scores).map(([categoryKey, score]) => {
                    const label = categoryKey
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase());

                    return (
                      <div key={categoryKey} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-700">{label}</span>
                          <span className={getScoreColor(score)}>{score}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreBarColor(score)} transition-all duration-500`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths, Weaknesses, Improvements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strong Points
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysisResult.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses & Missing Info */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas for Improvement & Missing Info
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysisResult.weaknesses.concat(analysisResult.missing_information || []).map((wk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Improvements */}
              {analysisResult.improvements && analysisResult.improvements.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-primary-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-primary-600" /> Recommended Strategic Tweaks
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysisResult.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rewritten Polished Pitch Version */}
              {analysisResult.rewritten_pitch && (
                <div className="bg-primary-50/50 border border-primary-200 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-primary-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary-600" /> Suggested Polished Version
                    </h4>
                    <button
                      onClick={() => setCustomPitchText(analysisResult.rewritten_pitch)}
                      className="text-xs font-bold text-primary-700 hover:text-primary-900 underline"
                    >
                      Use as Active Script
                    </button>
                  </div>
                  <div className="p-4 bg-white border border-primary-100 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
                    {analysisResult.rewritten_pitch}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: JUDGE Q&A PRACTICE */}
      {/* ========================================================================= */}
      {activeTab === 'practice' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary-600" />
                Live Judge Q&A Simulator
              </h2>
              <p className="text-xs text-slate-500">
                Practice answering the toughest questions judges ask during hackathon evaluations.
              </p>
            </div>

            {/* Question Selector Carousel */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-600">Select Practice Question:</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {PRACTICE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedQuestionIndex(idx);
                      setPracticeFeedback(null);
                    }}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedQuestionIndex === idx
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Q{idx + 1}: {q.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Active Question Box */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> Judge Question
              </span>
              <p className="text-sm sm:text-base font-bold">
                "{PRACTICE_QUESTIONS[selectedQuestionIndex]}"
              </p>
            </div>

            {/* Answer Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Your Response:</label>
              <textarea
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                placeholder="Type how you would respond to the judge in 2-3 concise sentences..."
                rows={4}
                className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium"
              />
            </div>

            {practiceError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{practiceError}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleEvaluatePractice}
                disabled={isEvaluatingPractice || !practiceAnswer.trim()}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {isEvaluatingPractice ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Evaluate My Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Practice Feedback Results */}
          {practiceFeedback && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Answer Evaluation</h3>
                  <p className="text-xs text-slate-500">{practiceFeedback.feedback_summary}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${getScoreColor(practiceFeedback.score)}`}>
                    {practiceFeedback.score}
                  </span>
                  <span className="text-xs font-bold text-slate-400">/100</span>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> What Worked:
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {(practiceFeedback.strengths || []).map((s: string, idx: number) => (
                      <li key={idx}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Missing / Needs Work:
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {(practiceFeedback.weaknesses || []).map((w: string, idx: number) => (
                      <li key={idx}>• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improved Model Answer */}
              {practiceFeedback.improved_response && (
                <div className="p-4 bg-primary-50/60 border border-primary-200 rounded-xl space-y-1 text-xs">
                  <span className="font-bold text-primary-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary-600" /> Recommended Winning Answer:
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    "{practiceFeedback.improved_response}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
