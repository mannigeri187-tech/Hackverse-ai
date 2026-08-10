import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Code, Terminal, Sparkles, Search, CheckCircle, Award, ExternalLink, Download, Send, Zap, Key, Layers, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const TALENT_CANDIDATES = [
  {
    id: 1,
    name: 'Manjunath H Annigeri',
    role: 'Lead Full-Stack & AI Architect',
    college: 'MIT',
    atsScore: 96,
    wins: 5,
    skills: ['React', 'TypeScript', 'Python', 'PyTorch', 'Node.js', 'Docker'],
    github: 'https://github.com/manjunath',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    status: 'Available for Hire',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'AI / Machine Learning Engineer',
    college: 'IIT Delhi',
    atsScore: 94,
    wins: 4,
    skills: ['PyTorch', 'TensorFlow', 'Python', 'FastAPI', 'LLMs'],
    github: 'https://github.com/priya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    status: 'Available for Hire',
  },
  {
    id: 3,
    name: 'James Chen',
    role: 'Frontend & UI/UX Specialist',
    college: 'Stanford University',
    atsScore: 91,
    wins: 3,
    skills: ['React', 'TypeScript', 'Tailwind', 'Figma', 'Next.js'],
    github: 'https://github.com/james',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    status: 'Available for Hire',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    role: 'Cloud & Systems Architect',
    college: 'MIT',
    atsScore: 89,
    wins: 3,
    skills: ['AWS', 'Kubernetes', 'Go', 'Node.js', 'PostgreSQL'],
    github: 'https://github.com/sarah',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    status: 'Available for Hire',
  },
];

const SPONSOR_APIS = [
  {
    id: 'google-cloud',
    sponsor: 'Google Cloud Platform',
    logo: '⚡',
    apiName: 'Gemini Multimodal Vision API',
    prize: '$10,000 Best AI Hack',
    docs: 'https://ai.google.dev',
    snippet: `// Test Google Gemini API Call\nfetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=SANDBOX_KEY', {\n  method: 'POST',\n  body: JSON.stringify({ contents: [{ parts: [{ text: "Hello Gemini" }] }] })\n})`,
    competingTeams: 42,
  },
  {
    id: 'supabase',
    sponsor: 'Supabase',
    logo: '⚡',
    apiName: 'Supabase Realtime & Vector Database',
    prize: '$5,000 Best Postgres Vector Hack',
    docs: 'https://supabase.com/docs',
    snippet: `// Initialize Supabase Client\nimport { createClient } from '@supabase/supabase-js'\nconst supabase = createClient('https://xyz.supabase.co', 'SANDBOX_ANON_KEY')`,
    competingTeams: 38,
  },
  {
    id: 'twilio',
    sponsor: 'Twilio',
    logo: '💬',
    apiName: 'Twilio Programmable Voice & SMS',
    prize: '$5,000 Best Communication Hack',
    docs: 'https://twilio.com/docs',
    snippet: `// Send SMS via Twilio API\nclient.messages.create({\n   body: 'Your HackVerse verification code is 8849',\n   from: '+18005550199',\n   to: '+1234567890'\n})`,
    competingTeams: 29,
  },
];

export default function SponsorHub() {
  const [activeTab, setActiveTab] = useState<'talent' | 'sandbox'>('talent');
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedIds, setInvitedIds] = useState<number[]>([]);
  const [selectedApi, setSelectedApi] = useState(SPONSOR_APIS[0]);
  const [sponsorToast, setSponsorToast] = useState<string | null>(null);

  const handleInvite = (id: number, name: string) => {
    setInvitedIds(prev => [...prev, id]);
    setSponsorToast(`Official Technical Interview Invitation sent to ${name}!`);
    setTimeout(() => setSponsorToast(null), 3000);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Role,College,ATS Score,Hackathon Wins,Skills,Status\n" +
      TALENT_CANDIDATES.map(c => `"${c.name}","${c.role}","${c.college}",${c.atsScore},${c.wins},"${c.skills.join(';')}",${c.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "HackVerse_Sponsor_Talent_Pipeline.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCandidates = TALENT_CANDIDATES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-purple-400" /> Sponsor Talent Pipeline & API Sandbox
          </h1>
          <p className="text-slate-400 mt-1">Paid sponsor recruiter portal to hire top hackers & integrate sponsor APIs for bonus prizes.</p>
        </div>

        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('talent')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'talent' ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <Briefcase className="w-4 h-4" /> Talent Pipeline
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'sandbox' ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <Code className="w-4 h-4 text-cyan-400" /> API Sandbox & Prizes
          </button>
        </div>
      </div>

      {sponsorToast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> {sponsorToast}
        </motion.div>
      )}

      {/* TAB 1: Sponsor Talent Pipeline Portal */}
      {activeTab === 'talent' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates by skill, name, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 font-bold rounded-xl text-sm flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" /> Download Talent Pipeline CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCandidates.map(c => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-4">
                  <img src={c.avatar} alt={c.name} className="w-16 h-16 rounded-2xl object-cover border border-purple-500/30" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{c.name}</h3>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-extrabold">
                        {c.atsScore} ATS
                      </span>
                    </div>
                    <p className="text-xs text-purple-400 font-semibold">{c.role}</p>
                    <p className="text-xs text-slate-400">{c.college} | 🏆 {c.wins} Hackathon Wins</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {c.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <a href={c.github} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> View GitHub Profile
                  </a>

                  {invitedIds.includes(c.id) ? (
                    <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Interview Invite Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInvite(c.id, c.name)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-purple-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Invite to Technical Interview
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Sponsor API Sandbox & Bonus Prize Tracker */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* API List */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xl font-bold text-white">Sponsor Bonus APIs</h3>
              <div className="space-y-3">
                {SPONSOR_APIS.map(api => (
                  <button
                    key={api.id}
                    onClick={() => setSelectedApi(api)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all space-y-1",
                      selectedApi.id === api.id ? "bg-purple-600/20 border-purple-500" : "bg-white/5 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white text-sm">{api.sponsor}</h4>
                      <span className="text-xs font-bold text-emerald-400">{api.prize}</span>
                    </div>
                    <p className="text-xs text-slate-400">{api.apiName}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sandbox Details */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedApi.sponsor}</h2>
                  <p className="text-sm text-purple-400 font-semibold">{selectedApi.apiName}</p>
                </div>
                <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-extrabold flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> {selectedApi.prize}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interactive Integration Code Snippet</p>
                <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto">
                  <code>{selectedApi.snippet}</code>
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-slate-400">
                  ⚡ <strong>{selectedApi.competingTeams} Teams</strong> competing for this sponsor prize.
                </span>
                <a
                  href={selectedApi.docs}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Read Official API Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
