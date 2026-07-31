'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Eye, 
  Bot, 
  Code, 
  Briefcase, 
  User, 
  Plus, 
  Check
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HackVerseAIEngine, ResumeATSResult } from '@/lib/ai-engine';

export default function ResumeBuilderPage() {
  const [fullName, setFullName] = useState('Alex Vance');
  const [headline, setHeadline] = useState('Full Stack & AI Engineer');
  const [email, setEmail] = useState('alex.vance@hackverse.ai');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [summary, setSummary] = useState('Full Stack Software Engineer with 4+ years of experience architecting high-throughput distributed systems, AI agent workflows, Next.js 15 web applications, and PostgreSQL databases. 12x accredited global hackathon winner.');

  const [skillsInput, setSkillsInput] = useState('TypeScript, Next.js 15, React 19, Node.js, PostgreSQL, Prisma, Tailwind CSS, Docker, CI/CD, PyTorch, OpenAI API');

  const [isScanning, setIsScanning] = useState(false);
  const [atsResult, setAtsResult] = useState<ResumeATSResult>({
    atsScore: 95,
    formatScore: 98,
    keywordScore: 92,
    contentScore: 96,
    matchedKeywords: ['TypeScript', 'Next.js', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'CI/CD', 'Prisma'],
    missingKeywords: ['Redis Caching', 'GraphQL', 'Kubernetes'],
    suggestions: [
      'Add bullet points quantifying API response speed improvements with metric percentages.',
      'Highlight 12x Hackathon Win awards directly under the Summary section.',
    ],
  });

  const handleRunATSScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);

    const result = await HackVerseAIEngine.analyzeResumeATS(summary + ' ' + skillsInput);
    setAtsResult(result);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span>Enterprise ATS Resume Optimizer</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            AI Resume Builder & <span className="gradient-text">ATS Scanner</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Build recruiter-ready resumes tailored to top tech companies. Scans keywords against Lever, Workday, and Greenhouse ATS parsers.
          </p>
        </div>

        {/* 2-Column Split: Editor on Left, Live ATS Audit on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Interactive Wizard Editor */}
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-400" /> Resume Profile Details
              </h3>
              <span className="text-xs text-indigo-400 font-semibold">Live Auto-Saved</span>
            </div>

            <form onSubmit={handleRunATSScan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Executive Professional Summary</label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Technical Skills & Keywords</label>
                <textarea
                  rows={2}
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isScanning}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-bold text-white shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isScanning ? 'Scanning ATS Parser...' : 'Re-Run ATS Audit'} <Sparkles className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => alert('Downloading ATS Resume PDF...')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition-all"
                >
                  <Download className="h-4 w-4" /> Export PDF
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live ATS Audit Report Card */}
          <div className="space-y-6">
            
            {/* ATS Score Meter Card */}
            <div className="rounded-3xl glass-card border border-indigo-500/40 p-6 space-y-6 bg-slate-900/90 shadow-glow">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Overall ATS Resume Score</h3>
                  <p className="text-xs text-slate-400">Audited against Lever & Greenhouse ATS engines</p>
                </div>
                <div className="flex items-center gap-1 text-3xl font-extrabold text-cyan-400 bg-cyan-500/10 px-4 py-1.5 rounded-2xl border border-cyan-500/30">
                  {atsResult.atsScore} <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>

              {/* Sub Scores Grid */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Format</p>
                  <p className="text-lg font-bold text-emerald-400">{atsResult.formatScore}%</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Keywords</p>
                  <p className="text-lg font-bold text-indigo-400">{atsResult.keywordScore}%</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Content</p>
                  <p className="text-lg font-bold text-purple-400">{atsResult.contentScore}%</p>
                </div>
              </div>

              {/* Matched Keywords Chips */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Matched High-Impact Keywords ({atsResult.matchedKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.matchedKeywords.map((kw) => (
                    <span key={kw} className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                      ✔ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords Chips */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> Suggested Missing Keywords ({atsResult.missingKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.missingKeywords.map((kw) => (
                    <span key={kw} className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2 text-xs pt-2 border-t border-white/10">
                <h4 className="font-bold text-cyan-400 uppercase tracking-wider">AI Optimization Tips</h4>
                <ul className="space-y-1.5 text-slate-300">
                  {atsResult.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <Sparkles className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
