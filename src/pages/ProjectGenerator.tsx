import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Code, Database, Server, Lightbulb, Save, RotateCcw, Zap, Check, ShieldCheck, Bookmark, Download, Copy, Trash2 } from 'lucide-react';
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

export default function ProjectGenerator() {
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

  // Saved Bookmarked Ideas
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
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
          {/* Controls Panel */}
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
                Generate Next Idea (Never Repeats)
              </button>
            </div>

            {/* Saved Bookmarks */}
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

          {/* Results Panel */}
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

                {/* Tabs */}
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

                {/* Tab Content */}
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
      </div>
    </div>
  );
}
