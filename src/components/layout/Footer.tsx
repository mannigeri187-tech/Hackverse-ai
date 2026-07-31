import React from 'react';
import Link from 'next/link';
import { Sparkles, Github, Twitter, Linkedin, ShieldCheck, Cpu, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                HackVerse <span className="text-indigo-400">AI</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              The premier AI-powered hackathon preparation, portfolio building, ATS resume optimization, and developer recruitment platform. Combining Devpost, GitHub, Coursera, and ChatGPT into one platform.
            </p>
            <div className="flex items-center gap-4 text-slate-400 pt-2">
              <Link href="https://github.com" className="hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://linkedin.com" className="hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/hackathons" className="hover:text-indigo-400 transition-colors">Hackathon Discovery</Link></li>
              <li><Link href="/mock-hackathon" className="hover:text-indigo-400 transition-colors">AI Mock Engine</Link></li>
              <li><Link href="/resume-builder" className="hover:text-indigo-400 transition-colors">ATS Resume Builder</Link></li>
              <li><Link href="/portfolio-builder" className="hover:text-indigo-400 transition-colors">Portfolio Generator</Link></li>
              <li><Link href="/community" className="hover:text-indigo-400 transition-colors">Developer Teams</Link></li>
            </ul>
          </div>

          {/* Column 2: Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Student Dashboard</Link></li>
              <li><Link href="/recruiter" className="hover:text-indigo-400 transition-colors">Recruiter Talent Hub</Link></li>
              <li><Link href="/company" className="hover:text-indigo-400 transition-colors">Company Sponsor Portal</Link></li>
              <li><Link href="/admin" className="hover:text-indigo-400 transition-colors">Admin Governance</Link></li>
            </ul>
          </div>

          {/* Column 3: Enterprise */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Security & API</h4>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> SOC2 Type II Certified
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <Cpu className="h-4 w-4" /> OpenAI & Gemini Ready
              </div>
              <div className="flex items-center gap-2 text-indigo-400">
                <Globe className="h-4 w-4" /> 99.99% SLA Uptime
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 HackVerse AI Inc. All rights reserved. Enterprise SLA Grade.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="/security" className="hover:text-slate-300">Security Architecture</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
