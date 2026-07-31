'use client';

import React from 'react';
import { 
  Trophy, 
  Bot, 
  FileText, 
  Code, 
  Users, 
  Briefcase, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Trophy,
      title: 'Global Hackathon Discovery',
      description: 'Discover events from Devpost, MLH, and Unstop. Filter by location, prize pool, difficulty, and AI match probability score.',
      tag: 'Devpost + Unstop',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      icon: Bot,
      title: 'AI Mock Hackathon Engine',
      description: 'Practice through realistic AI-generated 24h/48h hackathons with automated scoring across architecture, security, UI/UX, and testing.',
      tag: 'ChatGPT Power',
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      icon: FileText,
      title: 'ATS Resume Builder',
      description: 'Build recruiter-ready resumes with instant ATS keyword optimization, score breakdown, and PDF export capabilities.',
      tag: 'Resume Builder',
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      icon: Code,
      title: 'One-Click Portfolio Builder',
      description: 'Automatically render high-converting developer portfolio sites synchronized directly with your GitHub repositories and hackathon wins.',
      tag: 'Portfolio Engine',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      icon: Users,
      title: 'AI Team Matcher & Community',
      description: 'Find compatible hackathon teammates using skill gap analytics, direct messaging, and Kanban workspace tools.',
      tag: 'LinkedIn + Discord',
      color: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
    },
    {
      icon: Briefcase,
      title: 'Recruiter & Company Hub',
      description: 'Get discovered by top tech recruiters hiring hackathon winners directly from verified submission analytics.',
      tag: 'Direct Hiring',
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <section className="py-24 bg-slate-950/90 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>Unified Platform Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Replacing 8 Separate Tools into <br />
            <span className="gradient-text">One Enterprise Super Platform</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            No more switching between Devpost, GitHub, LinkedIn, ChatGPT, Coursera, and Resume Builders. Everything you need to excel in hackathons and get recruited.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative rounded-3xl glass-card p-6 sm:p-8 glass-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} border shadow-glow`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                    {item.title}
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>Production Ready</span>
                  <span className="text-emerald-400 font-semibold">100% Functional</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
