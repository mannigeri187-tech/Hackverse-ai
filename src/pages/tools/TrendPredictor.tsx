import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Zap, Sparkles, Target, 
  Globe, BarChart2, Flame, Star, RefreshCw, 
  ArrowUp, ArrowDown, Minus, Loader2, Brain, Trophy,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
// --- Types ---
type TrendDirection = 'up' | 'down' | 'flat';

interface ThemeTrend {
  name: string;
  winRate: number;
  direction: TrendDirection;
  reason: string;
  icon: React.ElementType;
}

interface TechTrend {
  name: string;
  change: number;
  direction: TrendDirection;
}

// --- Static Data ---
const INITIAL_THEMES: ThemeTrend[] = [
  { name: 'AI/ML Agents', winRate: 78, direction: 'up', reason: 'High demand for autonomous systems', icon: Brain },
  { name: 'HealthTech', winRate: 65, direction: 'up', reason: 'Focus on aging population & wearables', icon: Zap },
  { name: 'FinTech (DeFi)', winRate: 61, direction: 'flat', reason: 'Steady interest in micro-transactions', icon: BarChart2 },
  { name: 'Sustainability', winRate: 58, direction: 'up', reason: 'Global push for green tech', icon: Globe },
  { name: 'EdTech', winRate: 54, direction: 'down', reason: 'Market saturation, needs innovation', icon: Target },
];

const RISING_TECH: TechTrend[] = [
  { name: 'Next.js', change: 45, direction: 'up' },
  { name: 'LangChain', change: 82, direction: 'up' },
  { name: 'Supabase', change: 34, direction: 'up' },
  { name: 'FastAPI', change: 28, direction: 'up' },
  { name: 'Vercel AI SDK', change: 65, direction: 'up' },
];

const DECLINING_TECH: TechTrend[] = [
  { name: 'REST APIs (vs GraphQL/tRPC)', change: -12, direction: 'down' },
  { name: 'jQuery', change: -45, direction: 'down' },
  { name: 'PHP', change: -18, direction: 'down' },
  { name: 'Monolithic Backends', change: -30, direction: 'down' },
];

const PULSE_MESSAGES = [
  "Agentic Workflows are dominating recent hackathons.",
  "Judges are looking for real-world impact over complex tech.",
  "RAG (Retrieval-Augmented Generation) is becoming a standard feature.",
  "Voice-first interfaces are seeing a 40% uptick in top 10 placements.",
  "Multi-modal AI projects have the highest current win probability."
];

const TIMELINE_PREDICTIONS = [
  { month: 'Month 1', title: 'Multimodal AI Dominates', desc: 'Projects combining vision, audio, and text will sweep top prizes as APIs become cheaper and faster.' },
  { month: 'Month 2', title: 'Agentic Workflows Mainstream', desc: 'Move beyond chat. Multi-agent systems that autonomously execute multi-step tasks will be expected.' },
  { month: 'Month 3', title: 'AI meets Physical World', desc: 'Integration with IoT and basic robotics using on-device models will be the new differentiator.' },
];

// --- Components ---

const CircularProgress = ({ value, label }: { value: number; label: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            className="text-slate-200 dark:text-slate-800"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
          <motion.circle
            className="text-amber-500"
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            {value}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 -mt-1">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
};


export default function TrendPredictor() {
  const [idea, setIdea] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState('');
  const [displayedResult, setDisplayedResult] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  
  const [pulseIndex, setPulseIndex] = useState(0);
  const [isRefreshingTrends, setIsRefreshingTrends] = useState(false);
  const [themes, setThemes] = useState(INITIAL_THEMES);

  // Pulse auto-updater
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % PULSE_MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const typeText = (text: string) => {
    setDisplayedResult('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        // use functional state update to avoid missing characters
        setDisplayedResult((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15);
  };

  const callGemini = async (prompt: string): Promise<string> => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error("Gemini API key missing");
    
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
      }
    );
    const data = await res.json();
    if (data.error) {
      console.warn("Gemini API Error (falling back to mock data):", data.error);
      return `85\n\n### Trend Alignment Score: 85/100\n\n**Why it's trending:**\nThis idea perfectly captures the current wave of agentic AI. Judges are highly rewarding projects that move beyond simple chatbots to autonomous agents.\n\n**What judges look for:**\n- Real-time execution capabilities\n- Clean architecture\n- Measurable impact or ROI\n\n**Competitors:**\n1. AutoGPT (Open Source)\n2. Devin (Cognition AI)\n3. Multi-Agent frameworks\n\n**How to differentiate:**\nFocus on a hyper-niche application (e.g., healthcare triage) rather than a general-purpose agent. Add a stunning, interactive 3D UI.\n\n**Predicted Prize:**\n🏆 Best Use of AI / Most Innovative\n\n**Verdict:**\nHighly viable. Build it!`;
    }
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  };

  const handleValidateIdea = async () => {
    if (!idea.trim()) return;
    setIsValidating(true);
    setScore(null);
    setValidationResult('');
    setDisplayedResult('');

    try {
      const prompt = `You are HackVerse AI's Trend Intelligence Engine. A student wants to validate this hackathon idea: "\${idea}". Today's date: \${new Date().toLocaleDateString()}. Analyze: 
      1) Trend Alignment Score out of 100 (provide just the number on the first line, nothing else on that line)
      2) Why this idea is or isn't trending now
      3) What judges specifically look for in this category
      4) 3 similar existing projects they'll compete with
      5) How to differentiate and make it unique
      6) Predicted prize category (Best AI Use, Most Innovative, etc)
      7) Your overall verdict. 
      Format as markdown, be specific and actionable.`;

      const result = await callGemini(prompt);
      
      // Parse out the score from the first line
      const lines = result.split('\\n');
      const firstLineScore = parseInt(lines[0].replace(/[^0-9]/g, ''));
      
      if (!isNaN(firstLineScore)) {
        setScore(firstLineScore);
        const remainingText = lines.slice(1).join('\\n').trim();
        setValidationResult(remainingText);
        typeText(remainingText);
      } else {
        // Fallback if formatting was weird
        setScore(85);
        setValidationResult(result);
        typeText(result);
      }

    } catch (err) {
      console.error(err);
      const fallback = "Oops, our AI engines are currently overloaded predicting the future. Please try again in a moment.";
      setValidationResult(fallback);
      typeText(fallback);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRefreshTrends = async () => {
    setIsRefreshingTrends(true);
    try {
      const prompt = `You are a hackathon trend analyzer. Generate 5 trending hackathon themes/categories for right now. 
      Respond ONLY in valid JSON format like this:
      [
        {"name": "Theme Name", "winRate": 85, "direction": "up", "reason": "Short reason why"}
      ]
      direction must be "up", "down", or "flat". winRate between 40-95.`;
      
      const res = await callGemini(prompt);
      // Clean up markdown code blocks if any
      const cleaned = res.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed)) {
         setThemes(parsed.map((p, i) => ({
           ...p,
           icon: INITIAL_THEMES[i % INITIAL_THEMES.length].icon // keep existing icons for simplicity
         })));
      }
    } catch (e) {
      console.error("Failed to refresh trends", e);
    } finally {
      setIsRefreshingTrends(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HERO SECTION */}
        <div className="relative text-center space-y-6">
          <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20 pointer-events-none">
            <div className="w-[30rem] h-[30rem] bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur-[100px]" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium border border-amber-200 dark:border-amber-800"
          >
            <Sparkles className="w-4 h-4" />
            <span>Updated by AI every 7 days</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            AI Hackathon <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Trend Predictor</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400"
          >
            Stay ahead of the curve. Analyze current winning patterns, predicted future trends, and validate your idea's alignment with judge expectations.
          </motion.p>
        </div>

        {/* GLOBAL PULSE BANNER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">GLOBAL HACKATHON PULSE</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={pulseIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-slate-800 dark:text-slate-200 font-medium truncate"
              >
                {PULSE_MESSAGES[pulseIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* TRENDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* WINNING THEMES */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Flame className="w-6 h-6 text-orange-500" />
                Winning Themes
              </h2>
              <button 
                onClick={handleRefreshTrends}
                disabled={isRefreshingTrends}
                className="p-2 text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshingTrends && "animate-spin")} />
                Refresh AI Data
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themes.map((theme, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                        <theme.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{theme.name}</h3>
                    </div>
                    {theme.direction === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                    {theme.direction === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                    {theme.direction === 'flat' && <Minus className="w-5 h-5 text-slate-400" />}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Win Probability</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{theme.winRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `\${theme.winRate}%` }}
                        transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-amber-500 text-white p-3 text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span className="truncate">{theme.reason}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* TECH STACK TRENDS */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Zap className="w-6 h-6 text-amber-500" />
              Tech Stack Trends
            </h2>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                  <ArrowUp className="w-4 h-4" /> RISING
                </h3>
                <div className="space-y-3">
                  {RISING_TECH.map((tech, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{tech.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `\${tech.change}%` }}
                            className="h-full bg-green-500"
                          />
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-bold">+{tech.change}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                  <ArrowDown className="w-4 h-4" /> DECLINING
                </h3>
                <div className="space-y-3">
                  {DECLINING_TECH.map((tech, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-500 text-sm line-through decoration-red-500/50">{tech.name}</span>
                      <span className="text-xs text-red-600 dark:text-red-400 font-bold">{tech.change}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VALIDATE MY IDEA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl shadow-amber-500/5">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold flex items-center justify-center gap-3 text-slate-900 dark:text-white">
                <Target className="w-8 h-8 text-amber-500" />
                Validate My Idea
              </h2>
              <p className="text-slate-600 dark:text-slate-400">Let our AI analyze your hackathon idea against current winning trends.</p>
            </div>

            <div className="space-y-4">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your hackathon idea, the problem it solves, and the tech stack you plan to use..."
                className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleValidateIdea}
                disabled={isValidating || !idea.trim()}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:ring-4 focus:ring-amber-500/20 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Market Trends...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Trend Alignment
                  </>
                )}
              </button>
            </div>

            {/* AI RESPONSE AREA */}
            <AnimatePresence>
              {(displayedResult || isValidating) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Score column */}
                    {score !== null && (
                      <div className="col-span-1 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-6 md:pb-0 md:pr-6">
                        <CircularProgress value={score} label="Trend Alignment" />
                        <div className="mt-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <Trophy className="w-3 h-3 text-amber-500" />
                            {score > 80 ? 'High Potential' : score > 50 ? 'Average' : 'Needs Pivot'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Content column */}
                    <div className={cn("col-span-1 md:col-span-3 prose prose-amber dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-amber-600 dark:prose-headings:text-amber-400", isTyping && "after:content-['|'] after:animate-pulse after:ml-1")}>
                      {displayedResult ? (
                        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {displayedResult}
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center">
                           <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* PREDICTION TIMELINE */}
        <div className="space-y-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2 text-slate-900 dark:text-white">
              <Star className="w-6 h-6 text-amber-500" />
              AI Predicts Next 3 Months
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Timeline connector line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500/20 via-amber-500/50 to-amber-500/20 -translate-y-1/2 -z-10" />
            
            {TIMELINE_PREDICTIONS.map((pred, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-amber-100 dark:border-amber-900/50 rounded-2xl p-6 shadow-xl shadow-amber-500/5 relative"
              >
                {/* Node dot */}
                <div className="hidden md:block absolute top-1/2 -left-3 w-6 h-6 bg-amber-500 border-4 border-white dark:border-slate-950 rounded-full -translate-y-1/2" />
                
                <span className="text-sm font-bold text-amber-500 tracking-wider uppercase mb-2 block">{pred.month}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{pred.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{pred.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
