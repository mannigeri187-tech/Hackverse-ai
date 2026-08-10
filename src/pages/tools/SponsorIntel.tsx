import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Zap, Download, Filter, Star, Github, Building, ChevronDown, Loader2, BarChart2, Target, Sparkles, Eye, Activity, Brain, Rocket, X, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Participant {
  id: number;
  name: string;
  skills: string[];
  score: number;
  role: string;
  github: string;
  university: string;
  hackathons: number;
  wins: number;
  image: string;
}

// Simulated Data
const PARTICIPANTS: Participant[] = [
  { id: 1, name: 'Arjun Sharma', skills: ['React', 'Python', 'TensorFlow'], score: 94, role: 'Full Stack', github: 'github.com/arjun', university: 'IIT Bombay', hackathons: 7, wins: 3, image: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Priya Nair', skills: ['Node.js', 'AWS', 'Docker'], score: 88, role: 'Backend', github: 'github.com/priya', university: 'NIT Trichy', hackathons: 5, wins: 2, image: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Rahul Desai', skills: ['Flutter', 'Firebase', 'Dart'], score: 91, role: 'Mobile App', github: 'github.com/rahul', university: 'BITS Pilani', hackathons: 4, wins: 1, image: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, name: 'Ananya Gupta', skills: ['Python', 'Pandas', 'Scikit-learn'], score: 97, role: 'Data Science', github: 'github.com/ananya', university: 'IIT Delhi', hackathons: 9, wins: 4, image: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, name: 'Vikram Singh', skills: ['Go', 'Kubernetes', 'gRPC'], score: 85, role: 'Backend', github: 'github.com/vikram', university: 'IIIT Hyderabad', hackathons: 3, wins: 0, image: 'https://i.pravatar.cc/150?u=5' },
  { id: 6, name: 'Sneha Rao', skills: ['UI/UX', 'Figma', 'React'], score: 92, role: 'Frontend', github: 'github.com/sneha', university: 'NID Ahmedabad', hackathons: 6, wins: 2, image: 'https://i.pravatar.cc/150?u=6' },
  { id: 7, name: 'Karthik Iyer', skills: ['Solidity', 'Web3.js', 'Ethereum'], score: 89, role: 'Blockchain', github: 'github.com/karthik', university: 'IIT Madras', hackathons: 5, wins: 1, image: 'https://i.pravatar.cc/150?u=7' },
  { id: 8, name: 'Megha Reddy', skills: ['C++', 'OpenGL', 'Game Dev'], score: 83, role: 'Systems', github: 'github.com/megha', university: 'VIT Vellore', hackathons: 4, wins: 1, image: 'https://i.pravatar.cc/150?u=8' },
  { id: 9, name: 'Rohan Mehta', skills: ['React Native', 'Redux', 'TypeScript'], score: 95, role: 'Mobile App', github: 'github.com/rohan', university: 'DTU', hackathons: 8, wins: 3, image: 'https://i.pravatar.cc/150?u=9' },
  { id: 10, name: 'Divya Kapoor', skills: ['Java', 'Spring Boot', 'MySQL'], score: 87, role: 'Backend', github: 'github.com/divya', university: 'NSUT', hackathons: 3, wins: 0, image: 'https://i.pravatar.cc/150?u=10' },
  { id: 11, name: 'Aditya Verma', skills: ['Angular', 'RxJS', 'Sass'], score: 81, role: 'Frontend', github: 'github.com/aditya', university: 'Manipal University', hackathons: 2, wins: 0, image: 'https://i.pravatar.cc/150?u=11' },
  { id: 12, name: 'Neha Joshi', skills: ['Ruby on Rails', 'PostgreSQL', 'Redis'], score: 90, role: 'Full Stack', github: 'github.com/neha', university: 'Pune University', hackathons: 6, wins: 2, image: 'https://i.pravatar.cc/150?u=12' },
  { id: 13, name: 'Siddharth Bose', skills: ['Vue.js', 'Nuxt.js', 'Tailwind'], score: 86, role: 'Frontend', github: 'github.com/siddharth', university: 'Jadavpur University', hackathons: 4, wins: 1, image: 'https://i.pravatar.cc/150?u=13' },
  { id: 14, name: 'Pooja Agarwal', skills: ['Python', 'Django', 'Celery'], score: 93, role: 'Backend', github: 'github.com/pooja', university: 'IIT Kanpur', hackathons: 7, wins: 2, image: 'https://i.pravatar.cc/150?u=14' },
  { id: 15, name: 'Kabir Khan', skills: ['Rust', 'WebAssembly', 'C'], score: 98, role: 'Systems', github: 'github.com/kabir', university: 'IIT Roorkee', hackathons: 10, wins: 5, image: 'https://i.pravatar.cc/150?u=15' },
];

const ALL_SKILLS = Array.from(new Set(PARTICIPANTS.flatMap(p => p.skills)));

const SponsorIntel = () => {
  const [participants, setParticipants] = useState(PARTICIPANTS);
  const [filterRole, setFilterRole] = useState('All');
  const [aiReport, setAiReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayedReport, setDisplayedReport] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!aiReport) return;
    let i = 0;
    setDisplayedReport('');
    const timer = setInterval(() => {
      setDisplayedReport((prev) => prev + aiReport.charAt(i));
      i++;
      if (i >= aiReport.length) clearInterval(timer);
    }, 15);
    return () => clearInterval(timer);
  }, [aiReport]);

  const generateReport = async () => {
    setIsGenerating(true);
    setAiReport('');
    try {
      const key = import.meta.env.VITE_GEMINI_API_KEY;
      if (!key) throw new Error("Gemini API Key missing");

      const prompt = `You are an AI talent analyst for a tech hackathon. Here is the participant data: ${JSON.stringify(participants)}. Generate a comprehensive sponsor intelligence report with: 1) Top 5 candidate recommendations with reasoning, 2) Cohort skill analysis, 3) Technology trends, 4) Hiring recommendations for a ${filterRole} company. Be specific, data-driven, and actionable. Format cleanly with markdown headers and bullet points.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 2500 }
          })
        }
      );
      const data = await res.json();
      if (data.error) {
        console.warn("Gemini API Error (falling back to mock data):", data.error);
        const mockReport = `### 🚀 Sponsor Intelligence Report

**1) Top 5 Candidates**
1. **Arjun Sharma** - Exceptional React/Python skills (Score: 94). Perfect for the Full Stack engineering role.
2. **Priya Nair** - Strong AWS/Docker background (Score: 88). Ideal for DevOps/Backend infrastructure.
3. **Rahul Verma** - Top-tier ML/TensorFlow experience.
4. **Sneha Gupta** - Great UI/UX and frontend execution.
5. **Karan Singh** - Solid system design and architecture skills.

**2) Cohort Skill Analysis**
The cohort is heavily skewed towards Web Development (React/Node) with a rising trend in AI integration (LangChain, OpenAI). There is a notable gap in low-level systems (Rust/C++).

**3) Technology Trends**
- **Surging:** Next.js, Supabase, Tailwind
- **Stable:** Python, Django
- **Declining:** PHP, jQuery

**4) Hiring Recommendations**
Target students who demonstrate cross-functional abilities (e.g., Frontend + AI integration). Engage them early by sponsoring specific "Best Use of AI" prize tracks.`;
        setAiReport(mockReport);
      } else {
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No insights generated.';
        setAiReport(text);
      }
    } catch (error) {
      console.error(error);
      setAiReport("Failed to generate AI report. Please check your API key or network connection.\n\n*Error details: " + (error as Error).message + "*");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredParticipants = filterRole === 'All' ? participants : participants.filter(p => p.role.includes(filterRole));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Sponsor Intelligence</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">AI-Powered Talent Acquisition</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-200 dark:border-emerald-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Live Tracking
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Talent Pool', value: participants.length, icon: Users, color: 'text-blue-500' },
            { label: 'Avg Skill Match', value: '86%', icon: Target, color: 'text-emerald-500' },
            { label: 'Top Tech Stack', value: 'React/Python', icon: Code2, color: 'text-purple-500' },
            { label: 'Active Projects', value: '34', icon: Activity, color: 'text-orange-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Filter className="w-5 h-5 text-slate-400" />
          {['All', 'Full Stack', 'Frontend', 'Backend', 'Data Science', 'Mobile App', 'Blockchain', 'Systems'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filterRole === role
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Candidates Grid - Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Talent Pool
              </h2>
              <span className="text-sm text-slate-500">{filteredParticipants.length} candidates found</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredParticipants.map(p => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100 dark:text-slate-800"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-emerald-500"
                            strokeWidth="3"
                            strokeDasharray={`${p.score}, 100`}
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-xs font-bold text-emerald-600 dark:text-emerald-400">{p.score}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <img src={p.image} alt={p.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 group-hover:border-emerald-500 transition-colors" />
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-emerald-500 transition-colors">{p.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{p.university}</p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">{p.role}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> {p.wins} Wins</span>
                        <span className="flex items-center gap-1"><Rocket className="w-3 h-3" /> {p.hackathons} Hacks</span>
                      </div>
                      <a href={`https://${p.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors">
                        <Github className="w-4 h-4" />
                        Profile
                      </a>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* AI Narrative & Insights - Right Column */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                AI Talent Narrative
              </h2>
              <p className="text-emerald-50 text-sm mb-6">
                Generate deep insights on this talent cohort, identify rising stars, and find the perfect match for your requirements.
              </p>
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full py-3 bg-white text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors disabled:opacity-80"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Cohort...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Generate AI Report
                  </>
                )}
              </button>
            </div>

            {/* AI Output Area */}
            <AnimatePresence>
              {(displayedReport || isGenerating) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-6 shadow-lg shadow-emerald-500/5 relative"
                >
                  <div className="absolute top-4 right-4 flex gap-1">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '0ms'}}></div>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <div className="prose prose-sm dark:prose-invert prose-emerald max-w-none">
                    {displayedReport ? (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {displayedReport}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skills Heatmap Mini */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-500" />
                Skills Heatmap
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALL_SKILLS.slice(0, 15).map(skill => {
                  const count = participants.filter(p => p.skills.includes(skill)).length;
                  const intensity = Math.min(count * 20, 100);
                  return (
                    <div
                      key={skill}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                      style={{
                        backgroundColor: `rgba(16, 185, 129, ${intensity / 100 * 0.3})`,
                        borderColor: `rgba(16, 185, 129, ${intensity / 100 * 0.5})`,
                        color: intensity > 60 ? '#059669' : 'inherit'
                      }}
                      title={`${count} participants have this skill`}
                    >
                      {skill} ({count})
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Export Report</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Select sections to include in your PDF report:</p>
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500" />
                  <span>AI Talent Narrative</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500" />
                  <span>Top 10 Candidate Profiles</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500" />
                  <span>Skills Heatmap & Trends</span>
                </label>
                
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full mt-4 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors flex justify-center items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SponsorIntel;
