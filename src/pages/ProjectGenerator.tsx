import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Code, Database, Server, Lightbulb, Save, RotateCcw, Zap, Check, ShieldCheck, Bookmark, Download, Copy, Trash2, Activity, Presentation, Code2, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const THEMES = ['AI', 'FinTech', 'HealthTech', 'EdTech', 'Social Impact', 'DevTools', 'IoT', 'Gaming'];
const TECH_OPTIONS = ['React', 'Vue', 'Next.js', 'Node.js', 'Python', 'Django', 'TensorFlow', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Firebase'];

const PROJECT_PREFIXES = [
  'Neuro', 'Omni', 'Pulse', 'Pay', 'Dev', 'Eco', 'Quest', 'Crypto', 'Hyper', 'Cloud', 'Data', 'Cyber', 'Bio', 'Skill', 'Mock',
  'Aura', 'Nexus', 'Zen', 'Vortex', 'Synapse', 'Quantum', 'Astro', 'Lumina', 'Terra', 'Chrono', 'Novus', 'Apex', 'Core', 'Flux', 'Matrix'
];

const PROJECT_SUFFIXES = [
  'Guard', 'Flow', 'Forge', 'Craft', 'Radar', 'Vision', 'Learn', 'Trace', 'Shield', 'Sense', 'Pulse', 'Hub', 'Mesh', 'Engine',
  'Sync', 'Sphere', 'Net', 'Link', 'Base', 'Grid', 'Port', 'Dash', 'Wave', 'Stream', 'Cast', 'Vault', 'Mind', 'Logic', 'Path', 'Nest'
];

const PROBLEM_DOMAINS = [
  'adaptive learning micro-lessons based on comprehension tracking',
  'instant invoice factoring and automated escrow yield optimization',
  'real-time patient telemetry anomaly detection and emergency SMS routing',
  'autonomous PR security vulnerability scanning and Mermaid diagram generation',
  'synthetic database mock seeding with context-aware record generation',
  'multi-cloud zero-downtime automated failover orchestration',
  'blockchain-verified carbon footprint auditing for corporate supply chains',
  'procedural generative RPG quest trees with dynamic AI NPC memory',
  'hyper-personalized e-commerce product recommendations using edge AI',
  'automated translation and culturally-aware localization of marketing copy',
  'predictive crop yield modeling using satellite imagery and IoT weather sensors'
];

const ARCHITECTURES = [
  'Next.js 15 App Router API Gateway paired with Python FastAPI microservices and Pinecone vector RAG index.',
  'Node.js Express microservices paired with Ethereum/Solana smart contracts for automated escrow handling.',
  'Rust backend connected to high-frequency WebSocket cluster and TimescaleDB biometric telemetry store.',
  'Event-driven serverless system triggered via GitHub webhooks, powered by Claude 3.5 & OpenAI API.',
  'Go microservices architecture using gRPC for inter-service communication and Apollo GraphQL gateway.',
  'Django monolithic backend transitioning to bounded contexts, utilizing Celery for async task queues.'
];

const DATABASES = [
  'PostgreSQL for relational state, Pinecone for vector embeddings, and Redis for real-time cache.',
  'TimescaleDB time-series database paired with Redis pub/sub queue.',
  'Supabase PostgreSQL with Row Level Security (RLS) and IPFS decentralized storage.',
  'In-memory SQLite database paired with ClickHouse analytical warehouse.',
  'MongoDB document store with Mongoose schemas and RabbitMQ message broker.'
];

const PITCH_TIPS = [
  ['Highlight the "Aha!" moment when AI detects user confusion.', 'Show 35% retention boost metric.', 'Keep slide 3 demo under 60 seconds.'],
  ['Demonstrate a live PR trigger with immediate automated fix suggestion.', 'Emphasize time saved per sprint.'],
  ['Show live 3-second instant advance financial settlement simulation.', 'Present risk metric model graph.'],
  ['Focus on the seamless onboarding experience.', 'Compare your solution\'s latency directly against competitors.']
];

const generateProceduralProject = (theme: string, difficulty: string, timeframe: string, seed: number) => {
  const prefix = PROJECT_PREFIXES[seed % PROJECT_PREFIXES.length];
  const suffix = PROJECT_SUFFIXES[(seed * 3) % PROJECT_SUFFIXES.length];
  const problem = PROBLEM_DOMAINS[(seed * 7) % PROBLEM_DOMAINS.length];
  const arch = ARCHITECTURES[(seed * 5) % ARCHITECTURES.length];
  const db = DATABASES[(seed * 11) % DATABASES.length];
  const tips = PITCH_TIPS[(seed * 13) % PITCH_TIPS.length];

  const name = `${prefix}${suffix} AI - ${theme} Platform`;
  const uniqueId = `pj-${theme}-${difficulty}-${timeframe}-${seed}-${(name).replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}`;

  return {
    id: uniqueId,
    name,
    theme,
    description: `An innovative ${theme} platform designed for ${problem}.`,
    overview: `${name} tackles modern industry friction by employing intelligent automated orchestration. It provides ${problem} tailored for ${difficulty} scale within a ${timeframe} hackathon timeframe.`,
    features: [
      `Real-time automated ${problem.split(' ')[0]} engine`,
      'Interactive visual dashboard & analytics',
      'Automated error handling & failover alerts',
      'Exportable audit reports and data metrics'
    ],
    architecture: arch,
    database: db,
    api: 'GraphQL API & REST Webhooks with WebSocket live data feeds.',
    presentation: tips
  };
};

const callGemini = async (prompt: string): Promise<any> => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.error("Gemini API key missing.");
    return null;
  }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
        })
      }
    );
    const data = await res.json();
    
    if (data.error) {
      console.warn("Gemini API Error (falling back to mock data):", data.error);
      return {
        "title": "EcoSphere AI",
        "tagline": "Gamified carbon tracking for a greener future",
        "description": "An AI-powered mobile app that tracks daily carbon footprint and rewards sustainable choices.",
        "difficulty": "Medium",
        "timeToBuild": "24 hours",
        "innovationScore": 85,
        "viabilityScore": 90,
        "impactScore": 88,
        "learningScore": 75,
        "features": ["AI receipt scanning", "Social leaderboard", "Carbon offsets marketplace"],
        "frontend": ["React Native", "Tailwind CSS"],
        "backend": ["Node.js", "Express"],
        "database": ["Supabase"],
        "aiTools": ["OpenAI Vision API", "Gemini Analytics"],
        "architecture": "Mobile client with REST API and serverless AI edge functions.",
        "api": "Custom REST API for user data, third-party for carbon estimates.",
        "presentation": "Focus on the UI and the gamification loop during the demo."
      };
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) return JSON.parse(jsonMatch[1].trim());
    return JSON.parse(rawText);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return null;
  }
};

const CircularProgress = ({ value, label }: { value: number, label: string }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="40" cy="40" r={radius} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="6" fill="transparent" />
          <motion.circle 
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            cx="40" cy="40" r={radius} 
            className="stroke-indigo-500" 
            strokeWidth="6" fill="transparent" 
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-sm font-bold">{value}%</span>
      </div>
      <span className="text-xs font-semibold mt-2 text-slate-600 dark:text-slate-400">{label}</span>
    </div>
  );
};

const RadarChart = ({ scores }: { scores: number[] }) => {
  const angles = [0, 72, 144, 216, 288].map(a => (a - 90) * Math.PI / 180);
  const radius = 50;
  const center = 60;
  
  const points = scores.map((score, i) => {
    const r = (score / 100) * radius;
    const x = center + r * Math.cos(angles[i]);
    const y = center + r * Math.sin(angles[i]);
    return `${x},${y}`;
  }).join(' ');

  const bgPoints = angles.map(a => `${center + radius * Math.cos(a)},${center + radius * Math.sin(a)}`).join(' ');

  return (
    <svg width="120" height="120" className="drop-shadow-lg">
      <polygon points={bgPoints} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-700" />
      <polygon points={points} fill="rgba(99, 102, 241, 0.4)" stroke="#6366f1" strokeWidth="2" />
    </svg>
  );
};

const ScanningBars = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <div className="flex gap-2">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-8 bg-indigo-500 rounded-full"
          animate={{ height: ['2rem', '4rem', '2rem'] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
    <p className="text-sm font-bold text-slate-500 animate-pulse">AI is analyzing...</p>
  </div>
);

function ProjectGeneratorOriginalTab() {
  const [theme, setTheme] = useState(THEMES[0]);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [timeAvailable, setTimeAvailable] = useState('1 week');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  
  const [seenSignatures, setSeenSignatures] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hv_seen_project_ideas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedIdeas, setSavedIdeas] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hv_saved_project_ideas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [seedCounter, setSeedCounter] = useState(() => Math.floor(Math.random() * 100000));
  const [projectIdea, setProjectIdea] = useState<any>(null);

  useEffect(() => {
    try {
      localStorage.setItem('hv_seen_project_ideas', JSON.stringify(seenSignatures.slice(-5000)));
      localStorage.setItem('hv_saved_project_ideas', JSON.stringify(savedIdeas));
    } catch (e) {
      console.error(e);
    }
  }, [seenSignatures, savedIdeas]);

  useEffect(() => {
    handleGenerate();
  }, [theme, difficulty, timeAvailable]);

  const toggleTech = (tech: string) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter(t => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let currentSeed = seedCounter + 1;
      let newIdea = generateProceduralProject(theme, difficulty, timeAvailable, currentSeed);
      let attempts = 0;

      while (seenSignatures.includes(newIdea.id) && attempts < 100) {
        currentSeed += 1;
        newIdea = generateProceduralProject(theme, difficulty, timeAvailable, currentSeed);
        attempts += 1;
      }

      setSeedCounter(currentSeed);
      setSeenSignatures(prev => [...prev, newIdea.id]);
      setProjectIdea(newIdea);
      setIsGenerating(false);
      setActiveTab('overview');
    }, 400);
  };

  const handleSaveIdea = () => {
    if (!projectIdea) return;
    const exists = savedIdeas.some(i => i.id === projectIdea.id);
    if (!exists) {
      setSavedIdeas([projectIdea, ...savedIdeas]);
    }
  };

  const handleCopyPitch = () => {
    if (!projectIdea) return;
    const text = `🚀 Project: ${projectIdea.name}\n💡 Pitch: ${projectIdea.description}\n\n🏛️ Architecture:\n${projectIdea.architecture}\n\n🗄️ Database:\n${projectIdea.database}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    if (!projectIdea) return;
    const blob = new Blob([JSON.stringify(projectIdea, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectIdea.name.replace(/\s+/g, '_')}_Specs.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Lightbulb },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'architecture', label: 'Architecture', icon: Server },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'api', label: 'API & Data', icon: Code }
  ];

  return (
    <>
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-500" /> AI Project Idea Generator & Specification Engine
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Synthesize unique hackathon project ideas, complete tech stack architectures, and pitch deck strategies.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
          <ShieldCheck size={14} /> Unique Specs Synthesized: {seenSignatures.length} / 10,000+
        </div>
      </div>
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Theme / Industry</label>
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tech Stack Filter</label>
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map(tech => (
                  <button
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                      selectedTech.includes(tech)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                >
                  {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Timeframe</label>
                <select 
                  value={timeAvailable} 
                  onChange={(e) => setTimeAvailable(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                >
                  {['24 hours', '48 hours', '72 hours', '1 week'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <RotateCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate Next Idea
            </button>
          </div>

          {savedIdeas.length > 0 && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="text-amber-500" size={16} /> Saved Project Ideas ({savedIdeas.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {savedIdeas.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[180px]">{item.name}</span>
                    <button onClick={() => setSavedIdeas(savedIdeas.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          {projectIdea && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-indigo-500/20 text-indigo-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {theme} • {difficulty}
                    </span>
                    <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {timeAvailable}
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{projectIdea.name}</h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={handleSaveIdea}
                    className="px-3.5 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-xl text-xs hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Save size={14} /> Save Idea
                  </button>
                  <button 
                    onClick={handleCopyPitch}
                    className="px-3.5 py-2 bg-indigo-500/10 text-indigo-500 font-bold rounded-xl text-xs hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    onClick={handleExportJSON}
                    className="px-3.5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl text-xs hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Download size={14} /> Spec JSON
                  </button>
                </div>
              </div>

              <div className="flex overflow-x-auto gap-2 border-b border-gray-200 dark:border-white/10 pb-2 hide-scrollbar">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0",
                      activeTab === t.id 
                        ? "bg-indigo-600 text-white shadow-md" 
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 min-h-[250px]">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project Pitch</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium">{projectIdea.description}</p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 font-medium text-sm">
                      {projectIdea.overview}
                    </p>
                  </div>
                )}
                {activeTab === 'features' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Core Features to Implement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {projectIdea.features.map((feat: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                          <Check className="text-emerald-500 shrink-0" size={18} />
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'architecture' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">System Architecture & Tech Stack</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 font-mono text-xs">
                      {projectIdea.architecture}
                    </p>
                  </div>
                )}
                {activeTab === 'database' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Database Schema & Caching Strategy</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 font-mono text-xs">
                      {projectIdea.database}
                    </p>
                  </div>
                )}
                {activeTab === 'api' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">API Integration & Data Flow</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 font-mono text-xs">
                      {projectIdea.api}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

function IdeaValidatorTab() {
  const [idea, setIdea] = useState('');
  const [theme, setTheme] = useState(THEMES[0]);
  const [time, setTime] = useState('24h');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleValidate = async () => {
    setLoading(true);
    const prompt = `You are HackVerse AI's Idea Validation Engine. Analyze this hackathon idea: "${idea}" for a ${theme} hackathon with ${time} time limit. Score (0-100) and analyze: 1) Originality Score - how unique is this? 2) Feasibility Score - can it be built in ${time}? 3) Market Impact Score - real-world value? 4) Judge Appeal Score - how exciting for judges? 5) Tech Stack Recommendation - best tools for this. 6) Top 3 Red Flags - what could go wrong. 7) Winning Tips - 3 specific suggestions to maximize winning chance. Format as JSON with keys: originalityScore, feasibilityScore, marketImpactScore, judgeAppealScore, techStack (array), redFlags (array), winningTips (array), overallVerdict (string), overallScore (number).`;
    const data = await callGemini(prompt);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hackathon Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold">
               {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Time Limit</label>
            <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold">
               {['24h', '36h', '48h'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Idea Description</label>
            <textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={5} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Describe your hackathon idea..."></textarea>
          </div>
          <button onClick={handleValidate} disabled={loading || !idea} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <RotateCcw className="animate-spin" size={18} /> : <Activity size={18} />} Validate My Idea
          </button>
        </div>
      </div>
      <div className="lg:col-span-8">
        {loading ? (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl min-h-[400px] flex items-center justify-center">
            <ScanningBars />
          </div>
        ) : result ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl">
               <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6">
                 <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Overall Verdict</h2>
                   <p className="text-slate-600 dark:text-slate-300 max-w-lg">{result.overallVerdict}</p>
                 </div>
                 <div className="text-center bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 shrink-0">
                   <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{result.overallScore}</div>
                   <div className="text-xs font-bold text-indigo-500 uppercase mt-1">Total Score</div>
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                 <div className="flex flex-wrap gap-6 justify-center bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <CircularProgress value={result.originalityScore} label="Originality" />
                    <CircularProgress value={result.feasibilityScore} label="Feasibility" />
                    <CircularProgress value={result.marketImpactScore} label="Market Impact" />
                    <CircularProgress value={result.judgeAppealScore} label="Judge Appeal" />
                 </div>
                 <div className="flex justify-center items-center bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <RadarChart scores={[result.originalityScore, result.feasibilityScore, result.marketImpactScore, result.judgeAppealScore, result.overallScore]} />
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><AlertTriangle className="text-red-500" size={16} /> Top Red Flags</h3>
                   <ul className="space-y-2">
                     {result.redFlags?.map((rf: string, i: number) => (
                       <li key={i} className="text-sm text-slate-600 dark:text-slate-300 bg-red-500/5 px-3 py-2 rounded-lg border border-red-500/10 flex items-start gap-2">
                         <span className="mt-0.5">⚠️</span> <span>{rf}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div>
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Sparkles className="text-amber-500" size={16} /> Winning Tips</h3>
                   <ul className="space-y-2">
                     {result.winningTips?.map((wt: string, i: number) => (
                       <li key={i} className="text-sm text-slate-600 dark:text-slate-300 bg-amber-500/5 px-3 py-2 rounded-lg border border-amber-500/10 flex items-start gap-2">
                         <span className="mt-0.5">✨</span> <span>{wt}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>

               <div className="mt-8">
                 <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Code2 className="text-blue-500" size={16} /> Recommended Tech Stack</h3>
                 <div className="flex flex-wrap gap-2">
                   {result.techStack?.map((ts: string, i: number) => (
                     <span key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold">{ts}</span>
                   ))}
                 </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-dashed border-gray-300 dark:border-white/20 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
            <Activity className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Describe your idea to validate it</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mt-2">Our AI validation engine will score your hackathon idea across originality, feasibility, and impact.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CodeReviewerTab() {
  const [subTab, setSubTab] = useState('paste');
  const [code, setCode] = useState('');
  const [url, setUrl] = useState('');
  const [lang, setLang] = useState('TypeScript');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleReview = async () => {
    setLoading(true);
    const prompt = `You are an expert code reviewer. Review this ${lang} code: """${code || url}""" Provide: 1) Overall Quality Score (0-100) 2) Security Issues found (list with severity: Critical/High/Medium/Low and description) 3) Performance Issues (list) 4) Code Style Issues (list) 5) Architecture Suggestions (list) 6) Positive Highlights - what's done well 7) Top 3 Priority Fixes with code examples. Format as JSON with keys: qualityScore, securityIssues (array of {severity, description, fix}), performanceIssues (array), styleIssues (array), architectureSuggestions (array), highlights (array), priorityFixes (array of {issue, fix, codeExample}).`;
    const data = await callGemini(prompt);
    setResult(data);
    setLoading(false);
  };
  
  const severityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20';
      default: return 'text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20';
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button onClick={() => setSubTab('paste')} className={cn("flex-1 py-2 text-xs font-bold rounded-lg", subTab === 'paste' ? "bg-white dark:bg-slate-900 shadow text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>Paste Code</button>
            <button onClick={() => setSubTab('github')} className={cn("flex-1 py-2 text-xs font-bold rounded-lg", subTab === 'github' ? "bg-white dark:bg-slate-900 shadow text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>GitHub URL</button>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Language</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold">
               {['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'C++'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          {subTab === 'paste' ? (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Code Snippet</label>
              <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={8} className="w-full font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs resize-none" placeholder="// Paste your code here..."></textarea>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">File URL</label>
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="https://github.com/..." />
            </div>
          )}

          <button onClick={handleReview} disabled={loading || (subTab === 'paste' ? !code : !url)} className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <RotateCcw className="animate-spin" size={18} /> : <Code2 size={18} />} Review My Code
          </button>
        </div>
      </div>
      
      <div className="lg:col-span-8">
        {loading ? (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl min-h-[400px] flex items-center justify-center">
            <ScanningBars />
          </div>
        ) : result ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-white/10 pb-8">
                <CircularProgress value={result.qualityScore} label="Quality Score" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Code Analysis Complete</h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md">Found {result.securityIssues?.length || 0} security issues and {result.performanceIssues?.length || 0} performance bottlenecks.</p>
                </div>
              </div>
              
              {result.securityIssues && result.securityIssues.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><ShieldCheck className="text-red-500" size={16} /> Security Audit</h3>
                  <div className="space-y-3">
                    {result.securityIssues.map((issue: any, i: number) => (
                      <div key={i} className={cn("p-4 rounded-xl border", severityColor(issue.severity))}>
                         <div className="flex items-center justify-between mb-1">
                           <span className="font-bold text-xs uppercase tracking-wider">{issue.severity}</span>
                         </div>
                         <p className="text-sm font-medium">{issue.description}</p>
                         {issue.fix && <p className="text-xs mt-2 opacity-80">Fix: {issue.fix}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Zap className="text-amber-500" size={16} /> Priority Fixes</h3>
                <div className="space-y-4">
                  {result.priorityFixes?.map((fix: any, i: number) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-white/5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{fix.issue}</p>
                        <p className="text-xs text-slate-500 mt-1">{fix.fix}</p>
                      </div>
                      <div className="p-4 overflow-x-auto">
                        <pre className="text-xs font-mono text-indigo-600 dark:text-indigo-400"><code>{fix.codeExample}</code></pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Positive Highlights</h3>
                   <ul className="space-y-2">
                     {result.highlights?.map((hl: string, i: number) => (
                       <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                         <Check className="text-emerald-500 shrink-0 mt-0.5" size={14} /> <span>{hl}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div>
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Architecture Suggestions</h3>
                   <ul className="space-y-2">
                     {result.architectureSuggestions?.map((sug: string, i: number) => (
                       <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                         <Info className="text-blue-500 shrink-0 mt-0.5" size={14} /> <span>{sug}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-dashed border-gray-300 dark:border-white/20 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
            <Code2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Ready to review your code</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mt-2">Paste a snippet or provide a GitHub URL to get instant feedback on quality, security, and performance.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PitchGeneratorTab() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [tech, setTech] = useState<string[]>([]);
  const [audience, setAudience] = useState('');
  const [usp, setUsp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [activeSlide, setActiveSlide] = useState(0);
  const [qaOpen, setQaOpen] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const prompt = `You are an expert hackathon pitch consultant. Create a winning pitch for: Project: "${name}", Description: "${desc}", Tech: ${tech.join(', ')}, Target Audience: "${audience}", USP: "${usp}". Generate: 1) Elevator Pitch (30 seconds, 80 words max) 2) Problem Statement (compelling, data-driven) 3) Solution Overview (clear, impressive) 4) Demo Script (step-by-step 90 second demo flow) 5) Judge Q&A Predictions (5 likely questions + answers) 6) Wow Factor Score (0-100) and why 7) Slide-by-Slide breakdown (6 slides with title + content for each). Format as JSON with keys: elevatorPitch, problemStatement, solutionOverview, demoScript, judgeQA (array of {question, answer}), wowScore, wowReason, slides (array of {slideNum, title, content}).`;
    const data = await callGemini(prompt);
    setResult(data);
    setLoading(false);
    setActiveSlide(0);
  };
  
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const toggleTech = (t: string) => {
    if (tech.includes(t)) setTech(tech.filter(x => x !== t));
    else setTech([...tech, t]);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. HealthSync" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 resize-none" placeholder="What does it do?"></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Audience</label>
            <input type="text" value={audience} onChange={e => setAudience(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Remote workers" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Unique Selling Point</label>
            <input type="text" value={usp} onChange={e => setUsp(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. 10x faster AI" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tech Stack</label>
            <div className="flex flex-wrap gap-1.5">
               {['React', 'Node.js', 'Python', 'Firebase', 'Supabase', 'AWS'].map(t => (
                 <button key={t} onClick={() => toggleTech(t)} className={cn("px-2 py-1 rounded-md text-[10px] font-bold transition-colors", tech.includes(t) ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>{t}</button>
               ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading || !name || !desc} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
            {loading ? <RotateCcw className="animate-spin" size={18} /> : <Presentation size={18} />} Generate Pitch Deck
          </button>
        </div>
      </div>
      
      <div className="lg:col-span-8">
        {loading ? (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl min-h-[400px] flex items-center justify-center">
            <ScanningBars />
          </div>
        ) : result ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyText(result.elevatorPitch)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"><Copy size={14} /></button>
                </div>
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">30-Second Elevator Pitch</h3>
                <p className="text-lg font-medium leading-relaxed italic">"{result.elevatorPitch}"</p>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyText(`Wow Score: ${result.wowScore}\nReason: ${result.wowReason}`)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"><Copy size={14} className="text-slate-600 dark:text-slate-300"/></button>
                </div>
                <div className="text-5xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">{result.wowScore}</div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Wow Factor</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{result.wowReason}</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Presentation size={18} className="text-purple-500"/> Slide Deck Structure</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-4">
                {result.slides?.map((slide: any, i: number) => (
                  <button key={i} onClick={() => setActiveSlide(i)} className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors", activeSlide === i ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-400")}>
                    Slide {slide.slideNum}: {slide.title}
                  </button>
                ))}
              </div>
              {result.slides && result.slides[activeSlide] && (
                <div className="aspect-video bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center p-8 text-center relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copyText(`${result.slides[activeSlide].title}\n\n${result.slides[activeSlide].content}`)} className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg"><Copy size={14} className="text-slate-600 dark:text-slate-300" /></button>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{result.slides[activeSlide].title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 max-w-lg">{result.slides[activeSlide].content}</p>
                </div>
              )}
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl relative group">
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => copyText(result.judgeQA?.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n'))} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"><Copy size={14} className="text-slate-600 dark:text-slate-300"/></button>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Lightbulb size={18} className="text-amber-500"/> Judge Q&A Predictions</h3>
              <div className="space-y-2">
                {result.judgeQA?.map((qa: any, i: number) => (
                  <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => setQaOpen(qaOpen === i ? null : i)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 text-left">Q: {qa.question}</span>
                      {qaOpen === i ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {qaOpen === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="p-4 bg-white dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-indigo-500 mr-2">A:</span>{qa.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        ) : (
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-dashed border-gray-300 dark:border-white/20 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
            <Presentation className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Ready to build your pitch</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mt-2">Enter your project details to generate a complete slide deck, elevator pitch, and judge Q&A prep.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectGenerator() {
  const [activeMainTab, setActiveMainTab] = useState('generator');

  const mainTabs = [
    { id: 'generator', label: 'AI Project Generator', icon: Sparkles },
    { id: 'validator', label: 'AI Idea Validator', icon: Activity },
    { id: 'reviewer', label: 'AI Code Reviewer', icon: Code2 },
    { id: 'pitch', label: 'AI Pitch Generator', icon: Presentation }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex overflow-x-auto gap-2 mb-8 border-b border-slate-200 dark:border-white/10 pb-4 hide-scrollbar">
          {mainTabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveMainTab(t.id)} 
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shrink-0", 
                activeMainTab === t.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMainTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeMainTab === 'generator' && <ProjectGeneratorOriginalTab />}
            {activeMainTab === 'validator' && <IdeaValidatorTab />}
            {activeMainTab === 'reviewer' && <CodeReviewerTab />}
            {activeMainTab === 'pitch' && <PitchGeneratorTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
