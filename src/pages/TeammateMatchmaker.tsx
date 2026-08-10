import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Sparkles, UserCheck, MessageSquare, Play, Video, Plus, Clock, Tag, Award, CheckCircle, Flame, Filter, ShieldCheck, BrainCircuit, Loader2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const FIRST_NAMES = ['Aarav', 'Sophia', 'Liam', 'Ananya', 'Lucas', 'Emily', 'Rohan', 'Mia', 'Vikram', 'Zoe', 'Karthik', 'Chloe', 'Arjun', 'Elena', 'Yash', 'Isabella', 'Dev', 'Olivia'];
const LAST_NAMES = ['Sharma', 'Chen', 'Wilson', 'Patel', 'Garcia', 'Kumar', 'Taylor', 'Deshmukh', 'Smith', 'Iyer', 'Johnson', 'Reddy', 'Brown', 'Verma', 'Davis', 'Nair', 'Miller', 'Joshi'];
const ROLES = ['AI / ML Engineer', 'Frontend & UI/UX Specialist', 'Full-Stack Developer', 'Cybersecurity Engineer', 'Cloud & DevOps Architect', 'Mobile App Dev (React Native)', 'Blockchain & Smart Contract Dev'];
const COLLEGES = ['IIT Delhi', 'Stanford University', 'MIT', 'IISc Bangalore', 'UC Berkeley', 'IIT Bombay', 'Carnegie Mellon', 'BITS Pilani', 'Oxford', 'Harvard'];
const SKILLS_POOL = ['PyTorch', 'Python', 'FastAPI', 'React', 'TypeScript', 'Tailwind', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Solidity', 'Rust', 'GraphQL', 'TensorFlow', 'Firebase'];
const IDEAS_POOL = [
  'Real-Time Voice AI Agent for Emergency Medical Triage',
  'Decentralized Anti-Plagiarism Verification for Code Submissions',
  'Gamified Hackathon Platform with Dynamic 3D Avatars',
  'Zero-Knowledge Proofs for Anonymous Student Credential Verification',
  'Autonomous AST Vulnerability Scanner for GitHub Pull Requests',
  'AI-Powered Satellite Telemetry Yield Modeling for Sustainable Farming',
  'Synthetic Database Seeding with Context-Aware Edge AI',
  'Multi-Cloud Zero-Downtime Failover Orchestrator for Microservices'
];

const INITIAL_TEAMMATES = [
  {
    id: 'p-1',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    role: 'AI / Machine Learning Specialist',
    college: 'IIT Delhi',
    skills: ['PyTorch', 'Python', 'LLMs', 'FastAPI'],
    idea: 'Building a Real-Time Voice AI Agent for Healthcare Triage',
    compatibility: 98,
    bio: 'Looking for a solid React/UI developer & backend lead to build a winning AI project for Global AI Hackathon!',
  },
  {
    id: 'p-2',
    name: 'James Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    role: 'Frontend & UI/UX Designer',
    college: 'Stanford University',
    skills: ['React', 'TypeScript', 'Tailwind', 'Figma'],
    idea: 'Gamified Hackathon Platform with Dynamic 3D Avatars',
    compatibility: 94,
    bio: 'UI/UX wizard with 3 hackathon wins. Need a backend/DB expert and AI modeler.',
  },
  {
    id: 'p-3',
    name: 'Sarah Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    role: 'Full-Stack & Cloud Architect',
    college: 'MIT',
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    idea: 'Decentralized Anti-Plagiarism Verification for Code Submissions',
    compatibility: 91,
    bio: 'Senior at MIT. Passionate about Web3 & DevOps. Ready to grind 24 hours!',
  },
  {
    id: 'p-4',
    name: 'Ravi Kumar',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    role: 'Cybersecurity & Blockchain Dev',
    college: 'IISc Bangalore',
    skills: ['Solidity', 'Rust', 'Pentesting', 'Web3.js'],
    idea: 'Zero-Knowledge Proofs for Anonymous Student Credential Verification',
    compatibility: 87,
    bio: 'CTF Top 10 finisher. Building secure protocols. Need frontend specialist.',
  }
];

const generateProceduralProfile = (seed: number) => {
  const firstName = FIRST_NAMES[seed % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(seed * 3) % LAST_NAMES.length];
  const role = ROLES[(seed * 5) % ROLES.length];
  const college = COLLEGES[(seed * 7) % COLLEGES.length];
  const idea = IDEAS_POOL[(seed * 11) % IDEAS_POOL.length];
  
  const skill1 = SKILLS_POOL[(seed * 2) % SKILLS_POOL.length];
  const skill2 = SKILLS_POOL[(seed * 4) % SKILLS_POOL.length];
  const skill3 = SKILLS_POOL[(seed * 6) % SKILLS_POOL.length];
  const uniqueSkills = Array.from(new Set([skill1, skill2, skill3]));

  const compatibility = 80 + ((seed * 13) % 19);
  const avatarId = (seed % 70) + 1;
  const avatar = `https://i.pravatar.cc/400?img=${avatarId}`;

  return {
    id: `proc-p-${seed}`,
    name: `${firstName} ${lastName}`,
    avatar,
    role,
    college,
    skills: uniqueSkills,
    idea,
    compatibility,
    bio: `Passionate ${role} from ${college}. Eager to collaborate on high-impact hackathon projects!`
  };
};

const INITIAL_PITCHES = [
  {
    id: 1,
    founder: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    title: 'MedVoice AI — Instant Medical Triage Agent',
    category: 'AI / Healthcare',
    pitch: 'A 60-second voice assistant that diagnoses symptoms in 12 languages and alerts local ERs in real-time. We have the ML model ready; we need a React frontend wizard!',
    rolesNeeded: ['Frontend (React)', 'UI/UX Designer'],
    duration: '60s Pitch',
    likes: 42,
    timeAgo: '15 mins ago',
  },
  {
    id: 2,
    founder: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    title: 'EcoChain — Tokenized Carbon Offsets',
    category: 'Web3 / Climate',
    pitch: 'Empowering local farmers to mint carbon credit NFTs verified by satellite telemetry. Need a Solidity smart contract engineer to finalize our pitch deck!',
    rolesNeeded: ['Solidity / Smart Contracts', 'Data Scientist'],
    duration: '45s Pitch',
    likes: 38,
    timeAgo: '1 hour ago',
  }
];

const callGemini = async (prompt: string): Promise<string> => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
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
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to get AI response. Please try again.';
};

const startTyping = (text: string, setter: (v: string) => void, onDone?: () => void) => {
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) { setter(text.slice(0, i + 1)); i++; }
    else { clearInterval(interval); onDone?.(); }
  }, 8);
};

export default function TeammateMatchmaker() {
  const [activeTab, setActiveTab] = useState<'matchmaker' | 'pitches'>('matchmaker');
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [pitches, setPitches] = useState(INITIAL_PITCHES);
  
  // Persistent Trackers for 100% NON-REPEATING Profiles
  const [swipedIds, setSwipedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hv_swiped_profile_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [seedCounter, setSeedCounter] = useState(() => Math.floor(Math.random() * 10000) + 10);
  const [currentProfile, setCurrentProfile] = useState<any>(null);

  // New Pitch Form state
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('AI / ML');
  const [newPitch, setNewPitch] = useState('');
  const [newRoles, setNewRoles] = useState('');
  const [appliedPitches, setAppliedPitches] = useState<number[]>([]);

  // AI Dream Team Match state
  const [showDreamTeamModal, setShowDreamTeamModal] = useState(false);
  const [projectDesc, setProjectDesc] = useState('');
  const [userRole, setUserRole] = useState(ROLES[0]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  // AI Needs Analysis state
  const [projectNeedsQuery, setProjectNeedsQuery] = useState('');
  const [isAnalyzingNeeds, setIsAnalyzingNeeds] = useState(false);
  const [needsAnalysisResult, setNeedsAnalysisResult] = useState<string[]>([]);
  const [typedNeedsResult, setTypedNeedsResult] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('hv_swiped_profile_ids', JSON.stringify(swipedIds.slice(-5000)));
    } catch (e) {
      console.error(e);
    }
  }, [swipedIds]);

  // Load next unique profile that has NEVER been swiped
  const loadNextUniqueProfile = (nextSeed: number) => {
    // First check unswiped initial profiles
    const unswipedInitial = INITIAL_TEAMMATES.find(p => !swipedIds.includes(p.id));
    if (unswipedInitial) {
      setCurrentProfile(unswipedInitial);
      return;
    }

    // Otherwise generate procedural non-repeating profile
    let currentSeed = nextSeed;
    let generated = generateProceduralProfile(currentSeed);
    let attempts = 0;

    while (swipedIds.includes(generated.id) && attempts < 100) {
      currentSeed += 1;
      generated = generateProceduralProfile(currentSeed);
      attempts += 1;
    }

    setSeedCounter(currentSeed);
    setCurrentProfile(generated);
  };

  useEffect(() => {
    loadNextUniqueProfile(seedCounter);
  }, []);

  const handleSwipe = (direction: 'right' | 'left') => {
    if (!currentProfile) return;

    if (direction === 'right') {
      setMatchedUser(currentProfile);
    }

    // Mark current profile as swiped so it NEVER repeats
    setSwipedIds(prev => [...prev, currentProfile.id]);
    
    // Load next unique profile
    loadNextUniqueProfile(seedCounter + 1);
  };

  const handleCreatePitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPitch) return;
    const created = {
      id: Date.now(),
      founder: 'Manjunath H Annigeri',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      title: newTitle,
      category: newCategory,
      pitch: newPitch,
      rolesNeeded: newRoles ? newRoles.split(',').map(r => r.trim()) : ['Frontend', 'Backend'],
      duration: '60s Pitch',
      likes: 1,
      timeAgo: 'Just now',
    };
    setPitches([created, ...pitches]);
    setShowPitchModal(false);
    setNewTitle('');
    setNewPitch('');
    setNewRoles('');
  };

  const handleApplyPitch = (id: number) => {
    setAppliedPitches(prev => [...prev, id]);
  };

  const handleFindDreamTeam = async () => {
    if (!projectDesc.trim()) return;
    setIsAILoading(true);
    setAiResult('');
    
    try {
      const prompt = `You are an AI team formation expert for hackathons. The user's project: "${projectDesc}". Their role: "${userRole}". Available teammates: ${JSON.stringify(INITIAL_TEAMMATES)}. Recommend the BEST 3 teammates for this project and explain WHY each person is essential, what specific role they'll play, and how the team chemistry will work. Also predict the team's win probability. Be specific and encouraging.`;
      
      const response = await callGemini(prompt);
      startTyping(response, setAiResult);
    } catch (error) {
      console.error(error);
      setAiResult("Failed to get recommendation from AI.");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAnalyzeNeeds = async () => {
    if (!projectNeedsQuery.trim()) return;
    setIsAnalyzingNeeds(true);
    setTypedNeedsResult('');
    setNeedsAnalysisResult([]);

    try {
      const prompt = `Analyze this hackathon project and list only the 4 most critical roles or skills needed (e.g., "React Native", "Firebase", "Backend Dev", "UI/UX"). Return ONLY a comma-separated list. Project: ${projectNeedsQuery}`;
      const response = await callGemini(prompt);
      const items = response.split(',').map(item => item.trim()).filter(i => i.length > 0);
      setNeedsAnalysisResult(items);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzingNeeds(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500" /> AI Connector & Recruitment Pitch Deck
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Connect with compatible hackathon teammates & post 60-second recruitment pitches.</p>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
            <ShieldCheck size={14} /> Unique Teammates Swiped: {swipedIds.length} / 10,000+ (Zero Repetition)
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowDreamTeamModal(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:opacity-90"
          >
            <BrainCircuit className="w-4 h-4" /> Find My Dream Team
          </button>
          
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10">
            <button
              onClick={() => setActiveTab('matchmaker')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'matchmaker' ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Flame className="w-4 h-4 text-pink-400" /> AI Connector
            </button>
            <button
              onClick={() => setActiveTab('pitches')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'pitches' ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Video className="w-4 h-4 text-indigo-400" /> 60s Pitch Board
            </button>
          </div>
        </div>
      </div>

      {/* Project Needs Analysis Panel */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Project Needs Analysis</h3>
          </div>
          <input 
            type="text" 
            placeholder="Describe your project briefly (e.g. 'A medical app using AI...')"
            value={projectNeedsQuery}
            onChange={(e) => setProjectNeedsQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeNeeds()}
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button 
          onClick={handleAnalyzeNeeds}
          disabled={!projectNeedsQuery || isAnalyzingNeeds}
          className="mt-6 md:mt-7 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shrink-0 w-full md:w-auto justify-center"
        >
          {isAnalyzingNeeds ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
        </button>
        
        {needsAnalysisResult.length > 0 && (
          <div className="mt-6 md:mt-7 flex flex-wrap gap-2 w-full md:w-auto">
            {needsAnalysisResult.map((need, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/30">
                {need}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Matchmaker Section */}
      {activeTab === 'matchmaker' && (
        <div className="max-w-xl mx-auto space-y-6">
          {currentProfile ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProfile.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ x: 200, opacity: 0 }}
                className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl space-y-4"
              >
                {/* Avatar & Score */}
                <div className="relative h-80 w-full overflow-hidden bg-slate-900 group">
                  <img
                    src={currentProfile.avatar}
                    alt={currentProfile.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* AI Match Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="bg-indigo-600/90 text-white px-3 py-1.5 rounded-full font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(79,70,229,0.5)] backdrop-blur-md cursor-pointer group-hover:scale-105 transition-transform" title="AI Match Score">
                      <BrainCircuit className="w-3.5 h-3.5" /> {currentProfile.compatibility}% AI Match
                    </div>
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-10 w-48 bg-slate-900 text-slate-200 text-xs p-2 rounded-lg border border-white/10 shadow-xl pointer-events-none z-10">
                      Click <Heart className="w-3 h-3 inline text-pink-500" /> to see why AI picked this person based on your complementary skills.
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-extrabold text-white">{currentProfile.name}</h2>
                    <p className="text-indigo-300 text-sm font-semibold">{currentProfile.role} • {currentProfile.college}</p>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hackathon Project Idea</h4>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20">
                      💡 "{currentProfile.idea}"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-indigo-600 dark:text-indigo-300 font-extrabold text-xs rounded-full border border-gray-200 dark:border-white/10">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{currentProfile.bio}</p>

                  {/* Controls */}
                  <div className="flex justify-center items-center gap-6 pt-4 border-t border-gray-200 dark:border-white/10">
                    <button
                      onClick={() => handleSwipe('left')}
                      className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg hover:scale-110"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() => handleSwipe('right')}
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center transition-all shadow-xl hover:scale-110 shadow-pink-500/25"
                    >
                      <Heart className="w-8 h-8 fill-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      )}

      {/* Pitches Section */}
      {activeTab === 'pitches' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Live 60-Second Pitch Board</h2>
            <button
              onClick={() => setShowPitchModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Post Your Pitch
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitches.map((pitch: any) => (
              <div key={pitch.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={pitch.avatar} alt={pitch.founder} className="w-10 h-10 rounded-full object-cover border border-indigo-500/30" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pitch.founder}</h4>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase">{pitch.category}</span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">{pitch.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{pitch.pitch}</p>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Roles Needed:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {pitch.rolesNeeded.map((r: string) => (
                        <span key={r} className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-bold">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 font-semibold">{pitch.timeAgo}</span>
                  <button
                    onClick={() => handleApplyPitch(pitch.id)}
                    disabled={appliedPitches.includes(pitch.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                      appliedPitches.includes(pitch.id) 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                    )}
                  >
                    {appliedPitches.includes(pitch.id) ? 'Applied!' : 'Apply for Team'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Modal */}
      {matchedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl text-center space-y-6 max-w-md w-full shadow-2xl">
            <Sparkles className="w-12 h-12 text-pink-500 mx-auto animate-bounce" />
            <div>
              <h2 className="text-3xl font-extrabold text-white">It's a Teammate Match! 🎉</h2>
              <p className="text-slate-300 text-sm mt-2">You and {matchedUser.name} both want to build together.</p>
            </div>
            <button
              onClick={() => setMatchedUser(null)}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg"
            >
              Continue Connecting
            </button>
          </div>
        </div>
      )}

      {/* AI Dream Team Modal */}
      {showDreamTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto pt-20 pb-20">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 p-6 md:p-8 rounded-3xl space-y-6 max-w-2xl w-full shadow-2xl relative my-auto">
            <button 
              onClick={() => setShowDreamTeamModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Find My Dream Team</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Let AI build your perfect hackathon squad.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Describe your hackathon project</label>
                <textarea 
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="e.g. A web3 platform for tracking carbon credits..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">What's your own role?</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>

              <button
                onClick={handleFindDreamTeam}
                disabled={!projectDesc || isAILoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAILoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Find Perfect Team
              </button>
            </div>

            {aiResult && (
              <div className="mt-6 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl p-6 relative">
                <div className="absolute top-0 left-6 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  AI Recommendation
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-2">
                  {aiResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
