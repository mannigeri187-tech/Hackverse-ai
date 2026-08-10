import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Code, Terminal, Sparkles, Search, CheckCircle, Award, ExternalLink, Download, Send, Zap, Key, Layers, DollarSign, User, Star, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const callGemini = async (prompt: string): Promise<string> => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) return "Error: VITE_GEMINI_API_KEY is not set.";
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
        })
      }
    );
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err) {
    return "Error generating response from AI.";
  }
};

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
    atsScore: 82,
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
    atsScore: 78,
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
    haveSkills: ['Python', 'Node.js'],
    missingSkills: ['Kubernetes', 'Go'],
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
    haveSkills: ['React', 'TypeScript', 'PostgreSQL'],
    missingSkills: ['Deno'],
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
    haveSkills: ['Node.js', 'React'],
    missingSkills: ['Java', 'C#'],
  },
];

export default function SponsorHub() {
  const [activeTab, setActiveTab] = useState<'talent' | 'sandbox'>('talent');
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedIds, setInvitedIds] = useState<number[]>([]);
  const [selectedApi, setSelectedApi] = useState(SPONSOR_APIS[0]);
  const [sponsorToast, setSponsorToast] = useState<string | null>(null);

  // AI Recruiter Match State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [displayedAnalysis, setDisplayedAnalysis] = useState("");

  // Cover Letter Modal State
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);
  const [generatingCompany, setGeneratingCompany] = useState<string | null>(null);
  const [coverLetterResult, setCoverLetterResult] = useState("");
  const [displayedCoverLetter, setDisplayedCoverLetter] = useState("");

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

  const handleAnalyzeProfile = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("");
    setDisplayedAnalysis("");
    
    const prompt = `You are an AI career counselor. A student with these skills: [React, TypeScript, Python, Node.js, PostgreSQL] and 3 hackathon wins wants to find their perfect job match. Here are the companies at this hackathon: [Google Cloud, Supabase, Twilio, OpenAI, AWS]. Generate: 1) Top 3 company matches with match percentage and specific reasoning, 2) What skills to showcase to each company, 3) A one-paragraph personalized cover letter for their #1 match, 4) Skills to develop for better matches. Be specific and actionable.`;
    
    const result = await callGemini(prompt);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (aiAnalysis && displayedAnalysis.length < aiAnalysis.length) {
      const timer = setTimeout(() => {
        setDisplayedAnalysis(aiAnalysis.slice(0, displayedAnalysis.length + 1));
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [aiAnalysis, displayedAnalysis]);

  const handleGenerateCoverLetter = async (companyName: string) => {
    setGeneratingCompany(companyName);
    setCoverLetterModalOpen(true);
    setCoverLetterResult("");
    setDisplayedCoverLetter("");
    
    const prompt = `Write a personalized one-paragraph cover letter for a student applying to ${companyName}. The student has skills in [React, TypeScript, Python, Node.js, PostgreSQL] and 3 hackathon wins. Make it enthusiastic, professional, and tailored to the company.`;
    
    const result = await callGemini(prompt);
    setCoverLetterResult(result);
    setGeneratingCompany(null);
  };

  useEffect(() => {
    if (coverLetterResult && displayedCoverLetter.length < coverLetterResult.length) {
      const timer = setTimeout(() => {
        setDisplayedCoverLetter(coverLetterResult.slice(0, displayedCoverLetter.length + 1));
      }, 15);
      return () => clearTimeout(timer);
    }
  }, [coverLetterResult, displayedCoverLetter]);

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetterResult);
    setSponsorToast("Cover letter copied to clipboard!");
    setTimeout(() => setSponsorToast(null), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
      {/* AI Recruiter Match Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl shadow-indigo-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400" /> Find Your Perfect Job Match with AI
            </h2>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">Your Skills Profile:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['React', 'TypeScript', 'Python', 'Node.js', 'PostgreSQL'].map(s => (
                    <span key={s} className="px-2 py-1 bg-white/10 border border-white/20 text-white rounded-md text-xs font-bold">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleAnalyzeProfile}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isAnalyzing ? (
              <><Zap className="w-5 h-5 animate-pulse" /> Analyzing Profile...</>
            ) : (
              <><Zap className="w-5 h-5" /> Analyze My Profile</>
            )}
          </button>
        </div>
        
        {/* AI Analysis Result */}
        {(isAnalyzing || displayedAnalysis) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-6 bg-slate-950/50 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> AI Career Counselor Insights
            </h3>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed font-medium">
                {displayedAnalysis}
                {isAnalyzing && <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse"></span>}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

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
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 font-bold text-sm flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" /> {sponsorToast}
          </motion.div>
        </AnimatePresence>
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
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                
                {/* AI Match Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950 border border-white/10">
                    <div className={cn(
                      "w-3 h-3 rounded-full animate-pulse",
                      c.atsScore >= 90 ? "bg-emerald-500" :
                      c.atsScore >= 80 ? "bg-yellow-500" : "bg-orange-500"
                    )} />
                    <span className={cn(
                      "text-xs font-bold",
                      c.atsScore >= 90 ? "text-emerald-400" :
                      c.atsScore >= 80 ? "text-yellow-400" : "text-orange-400"
                    )}>
                      AI Score: {c.atsScore}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <img src={c.avatar} alt={c.name} className="w-16 h-16 rounded-2xl object-cover border border-purple-500/30" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{c.name}</h3>
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
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {selectedApi.logo} {selectedApi.sponsor}
                  </h2>
                  <p className="text-sm text-purple-400 font-semibold">{selectedApi.apiName}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-extrabold flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> {selectedApi.prize}
                  </span>
                  <button 
                    onClick={() => handleGenerateCoverLetter(selectedApi.sponsor)}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generate Cover Letter
                  </button>
                </div>
              </div>

              {/* Skill Gap Analysis */}
              <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" /> AI Skill Gap Analysis
                </h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-1.5">
                    <p className="text-xs text-slate-400 font-semibold">You have:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApi.haveSkills.map(s => (
                        <span key={s} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-medium">
                          {s} <CheckCircle className="w-3 h-3" />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="text-xs text-slate-400 font-semibold">Missing (To Learn):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApi.missingSkills.map(s => (
                        <span key={s} className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs font-medium">
                          {s} <X className="w-3 h-3" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
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

      {/* Cover Letter Modal */}
      <AnimatePresence>
        {coverLetterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCoverLetterModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
              <button onClick={() => setCoverLetterModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> AI Generated Cover Letter
              </h3>
              <p className="text-sm text-slate-400 mb-6">Tailored for {generatingCompany || "the company"}</p>
              
              <div className="bg-slate-950 border border-white/10 rounded-xl p-6 min-h-[200px] mb-6">
                {!coverLetterResult && !generatingCompany ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 py-8">
                    <Zap className="w-8 h-8 animate-pulse text-purple-500" />
                    <p className="text-sm font-medium">Crafting your personalized cover letter...</p>
                  </div>
                ) : (
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {displayedCoverLetter}
                    {(generatingCompany || displayedCoverLetter.length < coverLetterResult.length) && (
                      <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse"></span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCoverLetterModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleCopyCoverLetter}
                  disabled={!coverLetterResult || displayedCoverLetter.length < coverLetterResult.length}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Copy className="w-4 h-4" /> Copy to Clipboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
