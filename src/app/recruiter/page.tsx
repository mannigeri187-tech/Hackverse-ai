'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Trophy, 
  CheckCircle2, 
  FileText, 
  Code, 
  MessageSquare, 
  UserCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function RecruiterPortalPage() {
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const candidates = [
    {
      id: 'c1',
      name: 'Alex Vance',
      role: 'Full Stack & AI Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      location: 'San Francisco, CA',
      hackathonWins: '12 Wins',
      atsScore: 95,
      rubricScore: 94.8,
      topSkills: ['TypeScript', 'Next.js 15', 'AI Agents', 'PostgreSQL'],
      githubUrl: 'https://github.com/alexvance-dev',
      verifiedWinner: true,
    },
    {
      id: 'c2',
      name: 'Sophia Chen',
      role: 'Web3 & Cryptography Architect',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      location: 'Berlin, Germany',
      hackathonWins: '8 Wins',
      atsScore: 92,
      rubricScore: 93.5,
      topSkills: ['Rust', 'Solidity', 'Zero Knowledge', 'Go'],
      githubUrl: 'https://github.com/sophiachen-zk',
      verifiedWinner: true,
    },
    {
      id: 'c3',
      name: 'Marcus Brody',
      role: 'DevOps & Telemetry Specialist',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      location: 'New York, NY',
      hackathonWins: '6 Wins',
      atsScore: 90,
      rubricScore: 91.2,
      topSkills: ['Kubernetes', 'Docker', 'Go', 'Python'],
      githubUrl: 'https://github.com/marcusbrody',
      verifiedWinner: false,
    },
  ];

  const filteredCandidates = candidates.filter((c) => {
    return searchTerm === '' || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.topSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300">
            <Briefcase className="h-3.5 w-3.5 text-purple-400" />
            <span>Enterprise Talent Matchmaker Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Recruiter <span className="gradient-text">Talent Portal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Directly source verified hackathon winners and top AI mock performers with real-time code audit scores and ATS profile metrics.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-white/10">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Candidates Found:</span>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
              {filteredCandidates.length} Verified Engineers
            </span>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl glass-card border border-white/10 p-6 space-y-6 glass-card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4">
                  <img
                    src={c.avatarUrl}
                    alt={c.name}
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-glow"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-white">{c.name}</h3>
                      {c.verifiedWinner && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" title="Verified Hackathon Winner" />
                      )}
                    </div>
                    <p className="text-xs text-cyan-400 font-semibold">{c.role}</p>
                    <p className="text-[11px] text-slate-400">{c.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs my-4 pt-4 border-t border-white/10">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Hackathon Wins</p>
                    <p className="text-sm font-extrabold text-amber-400">{c.hackathonWins}</p>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Code Rubric Score</p>
                    <p className="text-sm font-extrabold text-emerald-400">{c.rubricScore}/100</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] text-slate-400 font-semibold">Top Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {c.topSkills.map((s) => (
                      <span key={s} className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => alert(`Interview Request sent to ${c.name}!`)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-glow"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Request Interview
                </button>
                <a
                  href={c.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
