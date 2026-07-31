'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Clock, 
  Code, 
  ShieldAlert, 
  CheckCircle, 
  Github, 
  Globe, 
  FileText, 
  Zap, 
  TrendingUp,
  Award,
  Play
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HackVerseAIEngine, EvaluationResult } from '@/lib/ai-engine';

export default function MockHackathonPage() {
  const [domain, setDomain] = useState('AI');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Extreme'>('Hard');
  const [durationHours, setDurationHours] = useState(24);
  const [techStack, setTechStack] = useState('Next.js 15, React 19, TypeScript, Tailwind');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  
  const [githubUrl, setGithubUrl] = useState('https://github.com/alexvance/ai-pr-sentinel');
  const [demoUrl, setDemoUrl] = useState('https://ai-pr-sentinel.vercel.app');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setEvaluation(null);

    const generated = await HackVerseAIEngine.generateMockHackathon({
      domain,
      difficulty,
      techStack: techStack.split(',').map((s) => s.trim()),
      durationHours,
    });

    setChallenge(generated);
    setIsGenerating(false);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);

    const result = await HackVerseAIEngine.evaluateSubmission(githubUrl, demoUrl);
    setEvaluation(result);
    setIsEvaluating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Bot className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI Autonomous Hackathon Simulator</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            AI Mock <span className="gradient-text">Hackathon Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Simulate realistic 24h/48h hackathons. Get AI-generated problem statements, submit your code, and receive instant rubric scores across Architecture, Security, and UI/UX.
          </p>
        </div>

        {/* Wizard Form & Active Challenge Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Challenge Generator Parameters */}
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" /> Configure Challenge
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 bg-slate-900 text-white"
                >
                  <option value="AI">AI & Multi-Agent Swarms</option>
                  <option value="Web3">Web3 & Zero-Knowledge DeFi</option>
                  <option value="DevTools">DevTools & Telemetry</option>
                  <option value="FinTech">FinTech & Micro-Lending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Easy', 'Medium', 'Hard', 'Extreme'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`rounded-xl py-2 text-[11px] font-bold transition-all ${
                        difficulty === d
                          ? 'bg-indigo-600 text-white shadow-glow'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Hours)</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 bg-slate-900 text-white"
                >
                  <option value={12}>12 Hours (Sprint)</option>
                  <option value={24}>24 Hours (Standard)</option>
                  <option value={48}>48 Hours (Marathon)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
                  placeholder="Next.js, TypeScript, Python"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-bold text-white shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isGenerating ? 'Generating Problem Statement...' : 'Generate AI Challenge'} <Play className="h-3.5 w-3.5 fill-white" />
              </button>
            </form>
          </div>

          {/* Right 2 Columns: Challenge Display & Submission Evaluator */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Generated Challenge Card */}
            {challenge ? (
              <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                      {challenge.difficulty} Difficulty • {challenge.domain}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{challenge.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                    <Clock className="h-4 w-4 animate-pulse" />
                    <span className="text-xs font-mono font-bold">Timer: 23h 58m 14s</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-cyan-400 uppercase tracking-wider">Problem Statement</h4>
                  <p className="text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                    {challenge.problemStatement}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <h4 className="font-bold text-emerald-400 uppercase tracking-wider">Technical Requirements</h4>
                    <ul className="space-y-1.5 text-slate-300">
                      {challenge.requirements.map((req: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-rose-400 uppercase tracking-wider">System Constraints</h4>
                    <ul className="space-y-1.5 text-slate-300">
                      {challenge.constraints.map((c: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Submission Portal Form */}
                <div className="border-t border-white/10 pt-6 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code className="h-4 w-4 text-indigo-400" /> Submit Your Solution for AI Evaluation
                  </h4>

                  <form onSubmit={handleEvaluate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">GitHub Repository URL</label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="url"
                          required
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          className="w-full glass-input rounded-xl pl-8 pr-3 py-2 text-xs"
                          placeholder="https://github.com/user/repo"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Live Demo / Deployment URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="url"
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          className="w-full glass-input rounded-xl pl-8 pr-3 py-2 text-xs"
                          placeholder="https://demo.vercel.app"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        disabled={isEvaluating}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {isEvaluating ? 'AI Auditing Code & Submitting Rubric...' : 'Evaluate Submission'} <Award className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl glass-card border border-white/10 p-12 text-center space-y-4">
                <Bot className="h-12 w-12 text-indigo-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-white">No Active AI Challenge Selected</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Configure your domain, difficulty, and tech stack on the left to generate an AI Mock Hackathon challenge.
                </p>
              </div>
            )}

            {/* Evaluation Results Card */}
            {evaluation && (
              <div className="rounded-3xl glass-card border border-emerald-500/40 p-6 space-y-6 bg-slate-900/90 shadow-glow">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      Evaluation Complete
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">
                      Total Rubric Score: <span className="text-emerald-400">{evaluation.totalScore} / 100</span>
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/30">
                    Rank: Top 2% Globally
                  </span>
                </div>

                {/* Score Grid Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Innovation</p>
                    <p className="text-xl font-bold text-cyan-400">{evaluation.innovationScore}%</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Architecture</p>
                    <p className="text-xl font-bold text-indigo-400">{evaluation.architectureScore}%</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">UI/UX</p>
                    <p className="text-xl font-bold text-purple-400">{evaluation.uiUxScore}%</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Testing</p>
                    <p className="text-xl font-bold text-emerald-400">{evaluation.testingScore}%</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Performance</p>
                    <p className="text-xl font-bold text-amber-400">{evaluation.performanceScore}%</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Security</p>
                    <p className="text-xl font-bold text-rose-400">{evaluation.securityScore}%</p>
                  </div>
                </div>

                {/* Key Strengths & Plan */}
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider">AI Identified Strengths</h4>
                  <ul className="space-y-1 text-slate-300">
                    {evaluation.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className="font-bold text-indigo-400 uppercase tracking-wider pt-2">Improvement Action Plan</h4>
                  <p className="text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed">
                    {evaluation.improvementPlan}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
