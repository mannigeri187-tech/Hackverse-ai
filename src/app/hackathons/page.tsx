'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Trophy, 
  Bookmark, 
  Clock, 
  Globe, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAppStore } from '@/store/useStore';

export default function HackathonDiscoveryPage() {
  const { bookmarks, toggleBookmark, searchQuery, setSearchQuery } = useAppStore();
  const [selectedTag, setSelectedTag] = useState('All');

  const hackathons = [
    {
      id: 'global-ai-agentic-hackathon-2026',
      title: 'Global AI Agentic Hackathon 2026',
      slug: 'global-ai-agentic-hackathon-2026',
      organizer: 'OpenAI Labs & Anthropic',
      tagLine: 'Build multi-agent autonomous software using LLMs & Neural Workflows',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      locationType: 'ONLINE',
      startDate: 'Aug 15, 2026',
      endDate: 'Aug 18, 2026',
      prizePool: '$100,000',
      matchingScore: 98,
      tags: ['AI', 'LLM', 'Agents', 'Python'],
      winningProb: 'High (89%)',
    },
    {
      id: 'quantum-web3-defi-summit',
      title: 'Quantum Web3 & DeFi Summit',
      slug: 'quantum-web3-defi-summit',
      organizer: 'Ethereum Foundation',
      tagLine: 'Next-gen decentralized finance and cryptographic zero-knowledge protocols',
      bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
      locationType: 'HYBRID',
      city: 'Berlin, Germany',
      startDate: 'Sep 01, 2026',
      endDate: 'Sep 04, 2026',
      prizePool: '$75,000',
      matchingScore: 92,
      tags: ['Web3', 'Solidity', 'Zero-Knowledge', 'Rust'],
      winningProb: 'Medium (76%)',
    },
    {
      id: 'fintech-ai-disruption-challenge',
      title: 'FinTech AI Disruption Challenge 2026',
      slug: 'fintech-ai-disruption-challenge',
      organizer: 'Stripe & Plaid',
      tagLine: 'Reinventing retail banking, credit scoring, and fraud detection with AI',
      bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800',
      locationType: 'ONLINE',
      startDate: 'Aug 25, 2026',
      endDate: 'Aug 28, 2026',
      prizePool: '$50,000',
      matchingScore: 95,
      tags: ['FinTech', 'AI', 'Stripe', 'React'],
      winningProb: 'High (84%)',
    },
    {
      id: 'devtools-telemetry-engine-hackathon',
      title: 'DevTools & Open Source Telemetry Hackathon',
      slug: 'devtools-telemetry-engine-hackathon',
      organizer: 'Vercel & Datadog',
      tagLine: 'Build high-performance observability pipelines and developer utilities',
      bannerUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      locationType: 'ONLINE',
      startDate: 'Sep 10, 2026',
      endDate: 'Sep 12, 2026',
      prizePool: '$40,000',
      matchingScore: 90,
      tags: ['DevTools', 'TypeScript', 'Node.js'],
      winningProb: 'High (82%)',
    },
  ];

  const categories = ['All', 'AI', 'Web3', 'FinTech', 'DevTools'];

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch = searchQuery === '' || h.title.toLowerCase().includes(searchQuery.toLowerCase()) || h.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === 'All' || h.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Page Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>AI Hackathon Matchmaker Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Discover Global <span className="gradient-text">AI Hackathons</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Browse verified events from Devpost, MLH, and Unstop. Ranked by your personalized AI Match Score & winning probability.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-white/10">
          
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTag(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTag === cat
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, tag, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Hackathon Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredHackathons.map((h) => {
            const isBookmarked = bookmarks.includes(h.id);
            return (
              <div
                key={h.id}
                className="group rounded-3xl glass-card border border-white/10 overflow-hidden glass-card-hover flex flex-col justify-between"
              >
                {/* Banner & Badges */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={h.bannerUrl}
                    alt={h.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 rounded-full bg-indigo-600/90 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-white shadow-glow">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> {h.matchingScore}% AI Match
                    </span>
                    <button
                      onClick={() => toggleBookmark(h.id)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md border transition-all ${
                        isBookmarked
                          ? 'bg-amber-500 border-amber-400 text-slate-950'
                          : 'bg-slate-950/60 border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-slate-950' : ''}`} />
                    </button>
                  </div>

                  {/* Bottom Banner Title */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{h.organizer}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{h.title}</h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 leading-relaxed">{h.tagLine}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      <span>{h.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <DollarSign className="h-4 w-4" />
                      <span>{h.prizePool} Prize Pool</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {h.tags.map((tag) => (
                      <span key={tag} className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Winning Prob: {h.winningProb}
                    </span>
                    <Link
                      href={`/mock-hackathon?domain=${h.tags[0]}`}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
                    >
                      Practice Mock <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
