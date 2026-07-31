'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Sparkles, 
  Bot, 
  FileText, 
  Code, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Send,
  UserCheck,
  Star,
  Layers
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAppStore } from '@/store/useStore';
import { HackVerseAIEngine } from '@/lib/ai-engine';

export default function StudentDashboardPage() {
  const { user } = useAppStore();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'mentor'; text: string }>>([
    { role: 'mentor', text: 'Hey Alex! I analyzed your latest GitHub repo. You have strong Next.js skills! Ready to practice an AI Mock Hackathon to boost your ATS score to 98?' },
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userText = chatPrompt;
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setChatPrompt('');

    const mentorReply = await HackVerseAIEngine.getMentorResponse(userText);
    setChatMessages((prev) => [...prev, { role: 'mentor', text: mentorReply }]);
  };

  const skills = [
    { name: 'TypeScript & React 19', score: 95 },
    { name: 'Next.js 15 App Router', score: 92 },
    { name: 'AI LLM API Integration', score: 88 },
    { name: 'PostgreSQL & Prisma', score: 85 },
    { name: 'System Design & Security', score: 78 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Header Banner */}
        <div className="rounded-3xl glass-card border border-white/10 p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-950">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.fullName || 'Alex'}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-glow"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {user?.fullName || 'Alex'}!</h1>
                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/30">
                    Level {user?.level || 14} Hacker
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Full Stack & AI Engineer • 12x Global Hackathon Winner • Top 1% Developer Rank
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/mock-hackathon"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow hover:scale-105 transition-all"
              >
                <Bot className="h-4 w-4" /> Start AI Mock
              </Link>
              <Link
                href="/resume-builder"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 transition-all"
              >
                <FileText className="h-4 w-4 text-cyan-400" /> ATS Resume (95/100)
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl glass-card p-5 border border-white/10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Daily Streak</p>
              <p className="text-2xl font-extrabold text-white">{user?.streak || 19} Days</p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-5 border border-white/10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Total XP Earned</p>
              <p className="text-2xl font-extrabold text-white">{(user?.xp || 14250).toLocaleString()} XP</p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-5 border border-white/10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Hackathons Won</p>
              <p className="text-2xl font-extrabold text-white">12 Events</p>
            </div>
          </div>

          <div className="rounded-2xl glass-card p-5 border border-white/10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Recruiter Views</p>
              <p className="text-2xl font-extrabold text-white">48 Views</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: Recommended Hackathons & Skill Radar */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recommended Hackathons */}
            <div className="rounded-3xl glass-card p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Recommended AI Hackathons</h3>
                </div>
                <Link href="/hackathons" className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 hover:border-indigo-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                        98% AI Match Score
                      </span>
                      <span className="text-xs text-slate-400">Prize: $100,000</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Global AI Agentic Hackathon 2026</h4>
                    <p className="text-xs text-slate-400">Organized by OpenAI Labs • Starts Aug 15, 2026</p>
                  </div>
                  <Link
                    href="/hackathons/global-ai-agentic-hackathon-2026"
                    className="flex-shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors text-center"
                  >
                    View Details
                  </Link>
                </div>

                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 hover:border-indigo-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                        92% AI Match Score
                      </span>
                      <span className="text-xs text-slate-400">Prize: $75,000</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Quantum Web3 & DeFi Summit</h4>
                    <p className="text-xs text-slate-400">Ethereum Foundation • Berlin, Germany • Starts Sep 01, 2026</p>
                  </div>
                  <Link
                    href="/hackathons/quantum-web3-defi-summit"
                    className="flex-shrink-0 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Skill Radar / Skill Breakdown */}
            <div className="rounded-3xl glass-card p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" /> Technical Skill Proficiency
                </h3>
                <span className="text-xs text-emerald-400 font-semibold">Top 2% Tier</span>
              </div>

              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{skill.name}</span>
                      <span className="text-cyan-400">{skill.score}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: AI Mentor Chat Widget & Recent Activity */}
          <div className="space-y-8">
            
            {/* AI Mentor Floating / Embedded Card */}
            <div className="rounded-3xl glass-card p-6 border border-indigo-500/30 space-y-4 bg-gradient-to-b from-indigo-950/40 to-slate-950 shadow-glow">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">AI Career & Hackathon Mentor</h4>
                    <p className="text-[10px] text-emerald-400">● Always Online</p>
                  </div>
                </div>
              </div>

              {/* Chat Conversation Box */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === 'mentor'
                        ? 'bg-indigo-600/20 text-slate-200 border border-indigo-500/30'
                        : 'bg-white/10 text-white ml-6'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Ask mentor a question..."
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  className="flex-1 glass-input rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 p-2 text-white hover:bg-indigo-500 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Quick Leaderboard Rank */}
            <div className="rounded-3xl glass-card p-6 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Global Leaderboard</h4>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-amber-400">#4</span>
                  <span className="text-xs font-semibold text-white">Alex Vance (You)</span>
                </div>
                <span className="text-xs text-cyan-400 font-mono">14,250 XP</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
