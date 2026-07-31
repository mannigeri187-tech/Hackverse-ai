'use client';

import React, { useState } from 'react';
import { 
  Code, 
  Globe, 
  Sparkles, 
  Github, 
  ExternalLink, 
  Layers, 
  Check, 
  RefreshCw, 
  Tv, 
  Palette
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PortfolioBuilderPage() {
  const [theme, setTheme] = useState('Cyberpunk Glass');
  const [slug, setSlug] = useState('alexvance');
  const [githubUser, setGithubUser] = useState('alexvance-dev');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeployed, setIsDeployed] = useState(true);

  const handleSyncGitHub = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const themes = [
    { name: 'Cyberpunk Glass', color: 'from-indigo-600 to-cyan-400' },
    { name: 'Vercel Minimalist', color: 'from-slate-700 to-slate-900' },
    { name: 'Linear Dark', color: 'from-purple-600 to-indigo-900' },
    { name: 'Neon Matrix', color: 'from-emerald-600 to-teal-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <Code className="h-3.5 w-3.5 text-emerald-400" />
            <span>Instant Developer Portfolio Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            One-Click <span className="gradient-text">Portfolio Builder</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Automatically render a modern developer website synced with your GitHub repositories, hackathon wins, and verified code audit reports.
          </p>
        </div>

        {/* 2-Column Split: Controls & Live Portfolio Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Form */}
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-cyan-400" /> Customization Settings
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Portfolio Subdomain Slug</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 glass-input rounded-xl px-3 py-2 text-xs"
                  />
                  <span className="text-[11px] text-slate-400 font-mono">.hackverse.dev</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">GitHub Account</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                    className="flex-1 glass-input rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    onClick={handleSyncGitHub}
                    disabled={isSyncing}
                    className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1 text-[11px] font-bold"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> Sync
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-2">Design Theme Preset</label>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setTheme(t.name)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        theme === t.name
                          ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-glow'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className={`h-2 w-full rounded-full bg-gradient-to-r ${t.color} mb-2`} />
                      <span className="text-[11px] font-bold block">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Deployment Status</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    ● Live on Edge CDN
                  </span>
                </div>
                <a
                  href={`https://${slug}.hackverse.dev`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-glow hover:opacity-90 transition-all"
                >
                  Visit Live Site <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Live Portfolio Preview Window */}
          <div className="lg:col-span-2 rounded-3xl glass-card border border-white/15 p-6 shadow-2xl space-y-6">
            
            {/* Browser Mockup Window Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs font-mono text-slate-400">
                  https://{slug}.hackverse.dev
                </span>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">Theme: {theme}</span>
            </div>

            {/* Simulated Live Developer Site */}
            <div className="rounded-2xl bg-slate-950 p-8 border border-white/10 space-y-8 text-left">
              
              {/* Site Hero */}
              <div className="space-y-3">
                <div className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
                  ⚡ Available for High-Impact Software Roles
                </div>
                <h2 className="text-3xl font-extrabold text-white">Alex Vance</h2>
                <p className="text-sm text-cyan-400 font-mono">Full Stack & Autonomous AI Engineer</p>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Architecting multi-agent swarm platforms, Next.js 15 web applications, and resilient microservices. 12x Accredited Global Hackathon Winner.
                </p>
              </div>

              {/* Verified Hackathon Projects */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured Hackathon Projects</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/5 p-4 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">AI PR Sentinel</h4>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Rubric Score: 94.8</span>
                    </div>
                    <p className="text-xs text-slate-400">Automated GitHub PR security auditor & AST syntax analyzer.</p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-4 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">Quantum DeFi Router</h4>
                      <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">Winner Top 3</span>
                    </div>
                    <p className="text-xs text-slate-400">Zero-knowledge proof liquid staking aggregator on Ethereum.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
