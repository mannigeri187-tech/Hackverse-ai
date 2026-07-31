'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Bot, ShieldCheck, Trophy, Terminal, Play, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-slate-950">
      
      {/* Background Cyber Gradients & Glow Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Badge */}
        <div className="flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-glow"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
            <span>Introducing HackVerse AI 2.0 Engine</span>
            <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] text-cyan-300">NEW</span>
          </motion.div>
        </div>

        {/* Hero Title */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight"
          >
            The All-In-One <br />
            <span className="gradient-text">AI Hackathon & Career</span> Platform
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Discover top hackathons, practice through realistic AI-generated mock challenges, analyze skill gaps, build ATS resumes, and get hired by tech recruiters.
          </motion.p>
        </div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/mock-hackathon"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-glow hover:scale-105 transition-all"
          >
            <Bot className="h-4 w-4" /> Start AI Mock Hackathon
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/hackathons"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl glass-card border border-white/10 px-8 py-4 text-sm font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-all"
          >
            <Trophy className="h-4 w-4 text-amber-400" /> Explore Global Hackathons
          </Link>
        </motion.div>

        {/* Interactive Terminal / Showcase Preview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 mx-auto max-w-5xl rounded-3xl glass-card border border-white/15 p-4 sm:p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" /> hackverse-ai-evaluator --mode=live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ● Live AI Agent Active
              </span>
            </div>
          </div>

          {/* Terminal Code & Metric Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            {/* Terminal Command Output */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-950 p-4 border border-white/10 space-y-2 text-slate-300">
              <p className="text-cyan-400">$ hackverse ai-eval --repo="github.com/user/ai-agent-hub"</p>
              <p className="text-slate-400">[INFO] Fetching AST syntax tree & dependency graph...</p>
              <p className="text-slate-400">[INFO] Evaluating Architecture, Innovation, Security & UI/UX...</p>
              <div className="my-2 border-t border-white/10" />
              <p className="text-emerald-400 font-bold">✔ Total Evaluation Score: 94.8 / 100 (Top 2% Globally)</p>
              <p className="text-slate-300">├── Innovation: 96/100 (Novel Agentic Workflow)</p>
              <p className="text-slate-300">├── Security: 94/100 (Zero Telemetry Data Leakage)</p>
              <p className="text-slate-300">└── Performance: 97/100 (Sub-50ms Response Latency)</p>
            </div>

            {/* Quick Metrics Widget */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="rounded-2xl bg-indigo-950/40 p-4 border border-indigo-500/30">
                <p className="text-slate-400 text-[11px]">AI Match Score</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">98%</span>
                  <span className="text-xs text-emerald-400 font-semibold">+12% vs avg</span>
                </div>
                <p className="mt-2 text-[10px] text-slate-400">High probability of winning Global AI Hackathon 2026.</p>
              </div>

              <div className="rounded-2xl bg-cyan-950/40 p-4 border border-cyan-500/30">
                <p className="text-slate-400 text-[11px]">ATS Resume Optimization</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-cyan-300">95/100</span>
                  <span className="text-xs text-cyan-400 font-semibold">Tier 1 Approved</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
