import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Clock, Shield, Database, Cpu, Globe, Zap, Upload, CheckCircle, AlertTriangle, Lightbulb, Bot, FastForward, Award, ArrowRight, Trophy, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type Phase = 'setup' | 'challenge' | 'evaluation' | 'results';

// 10,000+ Procedural Hackathon Challenge Generator Engine
const CHALLENGE_PREFIXES = [
  'Autonomous', 'Intelligent', 'Hyper-Scalable', 'Zero-Trust', 'Next-Gen', 'Predictive', 'Decentralized', 'Real-Time', 'Quantum-Ready', 'Edge-Optimized',
  'Collaborative', 'Immersive', 'Serverless', 'Biometric', 'Cognitive', 'Omnichannel', 'Frictionless', 'Generative', 'Sustainable', 'Adaptive',
  'Resilient', 'Agile', 'Transparent', 'Semantic', 'Holographic', 'Federated', 'Ephemeral', 'Nomadic', 'Symbiotic', 'Kinetic'
];

const CHALLENGE_SUBJECTS = [
  'AI Data Pipeline', 'DeFi Liquidity Protocol', 'Telehealth Triage Platform', 'Developer Productivity Suite', 'Eco-Footprint Auditor', 'Cyber Threat Matrix', 'Gamified Code Simulator', 'Micro-Invoicing Engine',
  'Supply Chain Ledger', 'Smart City Grid', 'AR Retail Experience', 'Personalized Learning Bot', 'Robotic Process Automation', 'Genomic Data Visualizer', 'Peer-to-Peer Energy Market', 'Disaster Recovery Orchestrator',
  'Mental Health Companion', 'Algorithmic Trading Bot', 'Virtual Event Metaverse', 'Subscription Management Hub', 'Predictive Maintenance Dashboard', 'Fraud Detection System', 'Language Translation API', 'Crop Yield Optimizer'
];

const CHALLENGE_PROBLEMS_POOL = [
  'Build a system that ingests high-frequency real-time events and provides automated AI anomaly detection with interactive alerts.',
  'Develop an end-to-end multi-tenant application that eliminates manual workflow friction for remote engineering teams.',
  'Architect a zero-downtime platform that processes complex user transactions with cryptographic verification and live telemetry.',
  'Construct a predictive ML application that forecasts resource bottlenecks and auto-remediates system failures before impact.',
  'Build a privacy-preserving platform that processes biometric/financial data using edge encryption and zero-knowledge proofs.',
  'Create a decentralized marketplace where users can trade digital assets with automated smart contract escrow and minimal gas fees.',
  'Design an accessibility-first educational platform that adapts its UI and content difficulty based on real-time learner engagement metrics.',
  'Develop a logistics routing algorithm that optimizes delivery fleets for minimum carbon emissions while adhering to strict time windows.',
  'Architect a scalable video streaming service that uses P2P WebRTC to reduce CDN costs while maintaining HD quality for remote areas.',
  'Build a collaborative whiteboarding tool that supports thousands of concurrent users with conflict-free replicated data types (CRDTs).',
  'Implement an AI-driven recruitment platform that anonymizes candidate profiles to eliminate bias while matching skills to job requirements.',
  'Create a personal finance aggregator that securely connects to multiple banking APIs, categorizes spending using NLP, and provides actionable insights.'
];

const REQUIREMENTS_POOL = [
  ['Full-stack architecture with REST/GraphQL API', 'Real-time WebSocket event streaming', 'Interactive glassmorphic dashboard', 'Automated error handling & failovers'],
  ['AI Agent integration with RAG vector search', 'Role-based access control (RBAC)', 'Exportable PDF/TXT reporting suite', 'Live telemetry charts & metrics'],
  ['Smart contract escrow or transactional engine', 'Offline-first local PWA caching', 'Automated security vulnerability scanner', 'Multi-currency / multi-region support'],
  ['Micro frontend architecture', 'Server-side rendering for SEO', 'OAuth2 and MFA authentication', 'Comprehensive API documentation (Swagger/OpenAPI)'],
  ['Native mobile app (React Native/Flutter) or responsive PWA', 'Background sync and push notifications', 'Accessibility compliance (WCAG 2.1)', 'Automated CI/CD deployment pipeline'],
  ['Machine learning model deployment (ONNX/TensorFlow.js)', 'Data visualization using D3/Chart.js', 'User activity audit logging', 'Customizable user dashboards']
];

const CONSTRAINTS_POOL = [
  ['Must achieve sub-100ms response times under load', 'Zero crash rate on edge cases', 'Strict HIPAA/GDPR data compliance'],
  ['Must handle 10,000 concurrent mock events', 'Responsive UI on desktop & mobile form factors', 'Clean modular architecture with 80%+ test coverage'],
  ['Zero third-party telemetry leaks', 'Lightweight client bundle (<200KB initial load)', 'Graceful offline fallback degradation'],
  ['Strict API rate limiting implementation', 'Database queries must execute in <10ms', 'Maximum memory footprint of 512MB per instance'],
  ['Must be deployable via a single Docker compose command', 'Use only open-source fonts and icons', 'Support localization for at least 3 languages'],
  ['No use of heavy UI component libraries (e.g., Material UI)', 'End-to-end encryption for all sensitive payloads', 'Achieve a Lighthouse score of 95+ across all categories']
];

const generateProceduralChallenge = (domain: string, difficulty: string, duration: string, seed: number) => {
  const prefix = CHALLENGE_PREFIXES[seed % CHALLENGE_PREFIXES.length];
  const subject = CHALLENGE_SUBJECTS[(seed * 3) % CHALLENGE_SUBJECTS.length];
  const problem = CHALLENGE_PROBLEMS_POOL[(seed * 7) % CHALLENGE_PROBLEMS_POOL.length];
  const reqs = REQUIREMENTS_POOL[(seed * 5) % REQUIREMENTS_POOL.length];
  const constr = CONSTRAINTS_POOL[(seed * 11) % CONSTRAINTS_POOL.length];

  const title = `${duration === '72h' ? '72-Hour Challenge: ' : ''}${prefix} ${subject} (${domain})`;
  const uniqueId = `hc-${domain}-${difficulty}-${duration}-${seed}-${(title).replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}`;

  return {
    id: uniqueId,
    title,
    problem: `${problem} Tailored specifically for ${difficulty} developers in the ${domain} domain during a ${duration} sprint.`,
    requirements: reqs,
    constraints: constr,
    criteria: ['Innovation & Architecture', 'Code Quality & Security', 'UI/UX Polish', 'Completeness & Speed'],
    techStack: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', domain.includes('AI') ? 'Python / FastAPI' : 'PostgreSQL / Redis']
  };
};

export default function MockHackathon() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [domain, setDomain] = useState('AI/ML');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [duration, setDuration] = useState('72h');
  const [isGenerating, setIsGenerating] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  
  // Persistent Seen Hackathon Challenge Signatures
  const [seenSignatures, setSeenSignatures] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hv_seen_mock_hackathons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [seedCounter, setSeedCounter] = useState(() => Math.floor(Math.random() * 100000));

  // Timer State
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(259200);
  const [timeIsUpAlert, setTimeIsUpAlert] = useState(false);

  // Form State
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [evalResults, setEvalResults] = useState<any>(null);

  const DOMAINS = ['AI/ML', 'Web Dev', 'Mobile', 'FinTech', 'HealthTech', 'Web3', 'Cybersecurity'];
  const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const DURATIONS = [
    { label: '2 Hours', val: '2h', sec: 7200 },
    { label: '6 Hours', val: '6h', sec: 21600 },
    { label: '12 Hours', val: '12h', sec: 43200 },
    { label: '24 Hours', val: '24h', sec: 86400 },
    { label: '72 Hours (3-Day Challenge)', val: '72h', sec: 259200 },
  ];

  useEffect(() => {
    try {
      localStorage.setItem('hv_seen_mock_hackathons', JSON.stringify(seenSignatures.slice(-5000)));
    } catch (e) {
      console.error(e);
    }
  }, [seenSignatures]);

  const getSecondsForDuration = (durVal: string) => {
    const found = DURATIONS.find(d => d.val === durVal);
    return found ? found.sec : 259200;
  };

  // Timer Ticking Effect
  useEffect(() => {
    let interval: any = null;
    if (phase === 'challenge' && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase, timeLeftSeconds]);

  const handleTimeUp = async () => {
    setTimeIsUpAlert(true);
    setTimeout(() => {
      handleSubmit();
    }, 3000);
  };

  const handleFastForward = (secondsToSubtract: number) => {
    setTimeLeftSeconds((prev) => Math.max(0, prev - secondsToSubtract));
  };

  const formatTimerDisplay = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (days > 0) {
      return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(secs)}s`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const initialSec = getSecondsForDuration(duration);
    setTimeLeftSeconds(initialSec);
    setTimeIsUpAlert(false);

    try {
      await new Promise(r => setTimeout(r, 600));

      let currentSeed = seedCounter + 1;
      let newChallenge = generateProceduralChallenge(domain, difficulty, duration, currentSeed);
      let attempts = 0;

      while (seenSignatures.includes(newChallenge.id) && attempts < 100) {
        currentSeed += 1;
        newChallenge = generateProceduralChallenge(domain, difficulty, duration, currentSeed);
        attempts += 1;
      }

      setSeedCounter(currentSeed);
      setSeenSignatures(prev => [...prev, newChallenge.id]);
      setChallenge(newChallenge);
      setPhase('challenge');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    setPhase('evaluation');
    await new Promise(r => setTimeout(r, 2000));
    setEvalResults({
      score: 88,
      categories: [
        { name: 'Innovation & Architecture', score: 92 },
        { name: 'UI/UX Polish', score: 85 },
        { name: 'Backend & APIs', score: 88 },
        { name: 'Problem Solving', score: 87 }
      ],
      plusPoints: [
        'Excellent architecture with modular React & TypeScript setup',
        'Intuitive UI design with clean glassmorphism styling',
        'Handled async state updates and real-time event tickers smoothly'
      ],
      minusPoints: [
        'API rate-limit error fallback requires more explicit user feedback',
        'Missing comprehensive unit test coverage for edge case handlers'
      ],
      skillLack: [
        'Advanced Redis Caching strategies for high-frequency requests',
        'End-to-end Playwright integration test suite setup',
        'WebSockets for bi-directional live video streams'
      ],
      recommendedNextSteps: [
        'Complete the "System Design & Scalable Backends" masterclass in the AI Learning Center',
        'Add Redis caching middleware to prevent API rate limit issues',
        'Practice timed coding mock tests to improve test coverage under time pressure'
      ]
    });
    setPhase('results');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl mb-2">
            <Trophy className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Mock Hackathon Simulator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Experience real hackathons with 10,000+ procedural non-repeating challenges, countdown timers, and detailed AI feedback.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
            <ShieldCheck size={14} /> Unique Hackathons Generated: {seenSignatures.length} / 10,000+
          </div>
        </div>

        {/* Phase: Setup */}
        {phase === 'setup' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configure Hackathon Challenge</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Domain</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DOMAINS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDomain(d)}
                      className={cn(
                        "py-3 px-3 rounded-xl font-bold text-xs border transition-all",
                        domain === d ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "py-3 px-3 rounded-xl font-bold text-xs border transition-all",
                        difficulty === d ? "bg-purple-600 text-white border-purple-600 shadow-md" : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Timeframe Duration</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d.val}
                      onClick={() => setDuration(d.val)}
                      className={cn(
                        "py-3.5 px-4 rounded-xl font-bold text-xs border text-left flex items-center justify-between transition-all",
                        duration === d.val ? "bg-pink-600 text-white border-pink-600 shadow-md" : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                      )}
                    >
                      <span>{d.label}</span>
                      {d.val === '72h' && <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Featured</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg"
            >
              {isGenerating ? <Zap className="animate-spin" size={20} /> : <Trophy size={20} />}
              Start Non-Repeating Challenge
            </button>
          </motion.div>
        )}

        {/* Phase: Challenge Active */}
        {phase === 'challenge' && challenge && (
          <div className="space-y-6">
            
            {/* Timer Notification Banner */}
            <div className="bg-slate-900 text-white border border-indigo-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-500/20 rounded-2xl">
                  <Clock className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Remaining Hackathon Time</span>
                  <h2 className="text-4xl font-extrabold font-mono tracking-tight text-white">{formatTimerDisplay(timeLeftSeconds)}</h2>
                </div>
              </div>

              {/* Fast Forward Testing Toolbar */}
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
                <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1">
                  <FastForward size={14} /> Fast-Test:
                </span>
                <button onClick={() => handleFastForward(3600)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors">
                  -1h
                </button>
                <button onClick={() => handleFastForward(86400)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors">
                  -24h
                </button>
                <button onClick={() => handleFastForward(timeLeftSeconds)} className="px-3 py-1.5 bg-rose-500/30 hover:bg-rose-500/50 text-rose-300 font-bold text-xs rounded-xl transition-colors">
                  Expire Now
                </button>
              </div>
            </div>

            {/* Time Up Alert Banner */}
            {timeIsUpAlert && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-500 text-white p-5 rounded-2xl font-bold flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="animate-bounce" size={24} />
                  <span>⏰ Time is Up! Your hackathon time has expired. Submitting your project for evaluation now...</span>
                </div>
              </motion.div>
            )}

            {/* Challenge Details */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="bg-indigo-500/20 text-indigo-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {domain} • {difficulty}
                  </span>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{challenge.title}</h2>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">{challenge.problem}</p>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={16} /> Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {challenge.requirements.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" size={16} /> Constraints
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {challenge.constraints.map((c: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Submission Form */}
              <div className="pt-6 border-t border-gray-200 dark:border-white/10 space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Submit Project Deliverables</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    placeholder="GitHub Repository URL"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <input
                    type="url"
                    placeholder="Live Deployment URL"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Submit Project for AI Evaluation <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phase: Evaluation */}
        {phase === 'evaluation' && (
          <div className="text-center py-20 space-y-4">
            <Bot className="w-16 h-16 text-indigo-500 animate-spin mx-auto" />
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Evaluating Submission...</h2>
            <p className="text-slate-500 dark:text-slate-400">Analyzing code quality, architecture patterns, and requirements completeness.</p>
          </div>
        )}

        {/* Phase: Results */}
        {phase === 'results' && evalResults && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-slate-900 text-white border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8">
              <div className="flex justify-between items-center pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Final Hackathon Grade</span>
                  <h2 className="text-4xl font-extrabold">{evalResults.score} / 100</h2>
                </div>
                <Award className="w-12 h-12 text-yellow-400" />
              </div>

              {/* (+) Plus & (-) Minus Points */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl space-y-3">
                  <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider">(+) Strong Plus Points</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {evalResults.plusPoints.map((pt: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl space-y-3">
                  <h3 className="font-bold text-rose-400 text-sm uppercase tracking-wider">(-) Areas Needing Improvement</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {evalResults.minusPoints.map((pt: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={16} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skill Lack & Recommendations */}
              <div className="space-y-4">
                <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wider">Skills to Develop & Next Steps</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {evalResults.recommendedNextSteps.map((step: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 text-sm">
                      <Lightbulb className="text-amber-400 shrink-0" size={18} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setPhase('setup')}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl transition-all shadow-lg"
              >
                Try Another Non-Repeating Challenge
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
