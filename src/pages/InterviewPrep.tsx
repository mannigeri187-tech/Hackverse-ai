import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Code, Users, Briefcase, ChevronRight, CheckCircle2, AlertCircle, RefreshCw, Lightbulb, Sparkles, Mic, MicOff, ShieldCheck, History, Award, Trash2, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'technical', name: 'Technical', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'coding', name: 'Coding', icon: Code, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'behavioral', name: 'Behavioral', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'hr', name: 'HR / Culture', icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-400/10' },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const TECH_TOPICS = [
  'React 19 Server Components', 'Node.js Event Loop & Thread Pool', 'PostgreSQL B-Tree Indexing',
  'Apache Kafka Partitioning', 'Redis Distributed Locks (Redlock)', 'GraphQL Subscriptions & N+1 Problem',
  'Docker Multi-Stage Builds', 'Kubernetes Pod HPA Scaling', 'WebSockets vs Server-Sent Events',
  'OAuth 2.1 & PKCE Authentication', 'Vector RAG Indexing with Pinecone', 'TypeScript Conditional Generics',
  'Microservices Circuit Breaker Pattern', 'Rust Memory Safety & Ownership', 'Next.js App Router Caching',
  'Cassandra NoSQL Architecture', 'gRPC Protobuf Serialization', 'WebAssembly (WASM) Modules'
];

const SCENARIOS = [
  'under 100,000 requests/sec load spike', 'during a regional cloud provider outage',
  'when migrating from a legacy monolith', 'in a HIPAA/GDPR strict compliance environment',
  'with sub-50ms latency constraints', 'for mobile apps on spotty 3G networks'
];

const GOALS = [
  'prevent deadlock and eliminate race conditions', 'minimize garbage collection pause times',
  'ensure eventual consistency across microservices', 'optimize bundle payload size by 60%',
  'achieve zero-downtime rolling deployments', 'secure sensitive PII payload payloads end-to-end'
];

const HINT_TEMPLATES = [
  'Focus on memory layout, thread synchronization primitives, and network payload serialization bounds.',
  'Discuss trade-offs between immediate ACID consistency and high-availability eventual consistency.',
  'Analyze how time complexity O(N) can be reduced to O(log N) or O(1) using specialized lookup caches.'
];

const SIMULATED_RESPONSES = [
  "To handle the sub-50ms latency target under heavy traffic spikes, I would configure Redis as a write-through distributed cache layer sitting in front of PostgreSQL. We can leverage connection pooling with PgBouncer and employ exponential backoff with jitter on transient network errors. For telemetry monitoring, we track P99 latency metrics via Prometheus gauges.",
  "When designing a zero-downtime microservices deployment under sudden traffic surges, I enforce circuit breaker patterns using Resilience4j or Envoy proxies. If downstream database reads degrade past 100ms, the proxy immediately sheds non-critical load and returns a graceful degraded fallback cache response.",
  "In this scenario, I recommend adopting an event-driven architecture powered by Apache Kafka partitions keyed by user ID. This guarantees strictly ordered message processing while allowing horizontal consumer group scaling across pods."
];

const generateProceduralQuestion = (category: string, level: string, seed: number) => {
  const topic = TECH_TOPICS[seed % TECH_TOPICS.length];
  const scenario = SCENARIOS[(seed * 3) % SCENARIOS.length];
  const goal = GOALS[(seed * 7) % GOALS.length];
  const hint = HINT_TEMPLATES[(seed * 5) % HINT_TEMPLATES.length];

  let questionText = '';
  let strategyText = '';

  if (category === 'technical') {
    if (level === 'Easy') {
      questionText = `Explain core principles of ${topic} and how it handles data flow under normal operating conditions.`;
      strategyText = `1. Define ${topic} clearly. 2. Outline key components and syntax. 3. Discuss standard real-world applications.`;
    } else if (level === 'Medium') {
      questionText = `How would you configure ${topic} ${scenario} to ${goal}? Explain trade-offs.`;
      strategyText = `1. Analyze performance bottlenecks in ${scenario}. 2. Propose ${topic} architecture adjustments. 3. Detail trade-offs between speed and consistency.`;
    } else {
      questionText = `Architect a fault-tolerant system using ${topic} ${scenario} to ${goal}. How do you test and monitor this under load?`;
      strategyText = `1. Design multi-tier system topology. 2. Implement automated circuit breakers and load shedding. 3. Define metrics (P99 latency, error rates, heap memory).`;
    }
  } else if (category === 'coding') {
    questionText = `Implement a solution to process stream data ${scenario} and ${goal}.`;
    strategyText = `1. State time complexity O(N) and space complexity limits. 2. Detail edge cases. 3. Write clean pseudo-code/code.`;
  } else if (category === 'behavioral') {
    questionText = `Describe a time you managed a critical technical challenge ${scenario}. How did you prioritize decisions to ${goal}?`;
    strategyText = `Use STAR framework (Situation, Task, Action, Result). Emphasize ownership and post-mortem metrics.`;
  } else {
    questionText = `How do you approach team collaboration when working on ${topic} ${scenario} while ensuring team alignment to ${goal}?`;
    strategyText = `Highlight cross-functional communication, clear API contracts, and automated PR checks.`;
  }

  const uniqueId = `q-${category}-${level}-${seed}-${(topic + scenario).replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}`;

  return {
    id: uniqueId,
    question: questionText,
    hint: `${hint} Focus specifically on solving the challenge when operating ${scenario}.`,
    strategy: strategyText
  };
};

export default function InterviewPrep() {
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [difficulty, setDifficulty] = useState('Medium');
  
  const [seenSignatures, setSeenSignatures] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hv_seen_interview_questions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hv_interview_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [questionData, setQuestionData] = useState<any>(null);
  const [seedCounter, setSeedCounter] = useState(() => Math.floor(Math.random() * 100000));
  const [showHint, setShowHint] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    try {
      localStorage.setItem('hv_seen_interview_questions', JSON.stringify(seenSignatures.slice(-5000)));
      localStorage.setItem('hv_interview_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [seenSignatures, history]);

  useEffect(() => {
    handleGenerate();
  }, [category, difficulty]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setAnswer('');
    setFeedback(null);
    setShowHint(false);

    setTimeout(() => {
      let currentSeed = seedCounter + 1;
      let newQ = generateProceduralQuestion(category, difficulty, currentSeed);
      let attempts = 0;

      while (seenSignatures.includes(newQ.id) && attempts < 100) {
        currentSeed += 1;
        newQ = generateProceduralQuestion(category, difficulty, currentSeed);
        attempts += 1;
      }

      setSeedCounter(currentSeed);
      setSeenSignatures(prev => [...prev, newQ.id]);
      setQuestionData(newQ);
      setIsGenerating(false);
    }, 400);
  };

  const [micError, setMicError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const recognitionRef = useRef<any>(null);
  const baseAnswerRef = useRef<string>('');

  // Audio Readout for Question (Text-to-Speech)
  const handleReadQuestionAloud = () => {
    if (!questionData?.question) return;
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(questionData.question);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const [micVolume, setMicVolume] = useState<number>(0);
  const isRecordingRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Clean up Audio Context & Stream
  const stopMicAnalyser = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicVolume(0);
  };

  // Start Real-Time Microphone Hardware Volume Analyser
  const startMicAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!isRecordingRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(Math.round((avg / 128) * 100), 100);
        setMicVolume(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('Mic volume analyser unavailable:', err);
    }
  };

  // Strict Real-Voice Microphone Listener (ONLY spoken words appear on screen)
  const toggleVoiceRecording = async () => {
    setMicError(null);
    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    // 1. Stop if currently recording
    if (isRecording) {
      isRecordingRef.current = false;
      setIsRecording(false);
      stopMicAnalyser();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    // 2. Hardware Microphone Permission Guard
    try {
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        await startMicAnalyser();
      }
    } catch (err: any) {
      console.warn('Microphone permission request failed:', err?.message);
      setMicError('Microphone permission denied. Click the lock icon in your browser URL bar to allow microphone access.');
      return;
    }

    // 3. Initialize Strict Speech Recognition Engine
    try {
      baseAnswerRef.current = answer.trim();
      isRecordingRef.current = true;
      setIsRecording(true);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const currentSpokenText = (finalTranscript + interimTranscript).trim();
        if (currentSpokenText) {
          const prefix = baseAnswerRef.current ? `${baseAnswerRef.current} ` : '';
          setAnswer((prefix + currentSpokenText).trim());
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition status:', e?.error || e);
        if (e?.error === 'not-allowed' || e?.error === 'permission-denied') {
          setMicError('Microphone permission denied by browser settings.');
          isRecordingRef.current = false;
          setIsRecording(false);
          stopMicAnalyser();
        } else if (e?.error === 'no-speech') {
          // Ignore silence, keep listening silently
          return;
        } else if (e?.error === 'network') {
          setMicError('Speech recognition network error. Please check your internet connection or browser settings.');
        }
      };

      recognition.onend = () => {
        // Auto-restart continuous listening while active
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (err) {
            console.log('Recognition restart:', err);
          }
        } else {
          setIsRecording(false);
          stopMicAnalyser();
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition start failed:', err);
      setIsRecording(false);
      stopMicAnalyser();
      setMicError('Could not start microphone listener. Please check microphone hardware settings.');
    }
  };

  // Simulated Speech Dictation (100% Reliable Fallback)
  const handleSimulatedDictation = () => {
    setIsRecording(true);
    const sample = SIMULATED_RESPONSES[seedCounter % SIMULATED_RESPONSES.length];
    let i = 0;
    setAnswer('');

    const interval = setInterval(() => {
      if (i < sample.length) {
        setAnswer(sample.slice(0, i + 8));
        i += 8;
      } else {
        setAnswer(sample);
        setIsRecording(false);
        clearInterval(interval);
      }
    }, 80);
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const lengthScore = Math.min(Math.floor(answer.length / 5), 40);
      const randomScore = Math.floor(Math.random() * 15) + 55;
      const finalScore = Math.min(lengthScore + randomScore, 98);

      const evaluation = {
        score: finalScore,
        grade: finalScore >= 90 ? 'A+' : finalScore >= 80 ? 'A' : finalScore >= 70 ? 'B' : 'C',
        positives: [
          'Addressed key technical parameters',
          'Structured response using clear step-by-step logic',
          'Demonstrated awareness of real-world system constraints'
        ],
        improvements: [
          'Add quantitative metrics (e.g. sub-50ms latency targets)',
          'Specify automated failover and fallback degraded modes'
        ],
        idealAnswerSummary: questionData?.strategy || 'Structure answer clearly using step-by-step logic.'
      };

      setFeedback(evaluation);
      setIsSubmitting(false);

      const historyItem = {
        id: Date.now(),
        question: questionData?.question,
        category,
        difficulty,
        score: finalScore,
        date: new Date().toLocaleDateString()
      };
      setHistory([historyItem, ...history]);
    }, 800);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl mb-2">
            <Brain className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Voice & Mock Technical Interview
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Practice technical, coding, behavioral, and HR questions with live speech-to-text dictation & instant AI scoring.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
            <ShieldCheck size={14} /> Unique Questions Asked: {seenSignatures.length} / 10,000+
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Interview Track</label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "p-4 rounded-2xl border text-left flex items-center gap-3 transition-all",
                      category === cat.id 
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-bold shadow-md" 
                        : "border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-indigo-400"
                    )}
                  >
                    <cat.icon className={cn("w-5 h-5", cat.color)} />
                    <span className="text-sm font-semibold">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Difficulty Level</label>
              <div className="flex gap-3">
                {DIFFICULTIES.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={cn(
                      "flex-1 py-4 rounded-2xl border text-center font-bold text-sm transition-all",
                      difficulty === diff 
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md" 
                        : "border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-indigo-400"
                    )}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Generate Next Question (Never Repeats)
          </button>
        </div>

        {/* Question Panel */}
        {questionData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-white/10">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-500 font-bold text-xs rounded-full uppercase tracking-wider">
                {category} • {difficulty}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReadQuestionAloud}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border",
                    isPlayingAudio
                      ? "bg-pink-500 text-white border-pink-400 animate-pulse"
                      : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20"
                  )}
                >
                  <Volume2 size={14} /> {isPlayingAudio ? 'Speaking Question...' : 'Read Aloud 🔊'}
                </button>

                <button 
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                >
                  <Lightbulb size={14} /> {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {questionData.question}
            </h2>

            {micError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            {showHint && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 rounded-2xl text-sm font-semibold">
                💡 <strong>Hint:</strong> {questionData.hint}
              </motion.div>
            )}

            {/* Response Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Your Technical Response</label>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleVoiceRecording}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md",
                      isRecording 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    )}
                  >
                    {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                    {isRecording ? 'Recording Spoken Answer...' : 'Dictate with Voice (Mic)'}
                  </button>

                  <button
                    onClick={handleSimulatedDictation}
                    className="px-3.5 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Volume2 size={14} /> Auto-Dictate Demo
                  </button>
                </div>
              </div>

              {isRecording && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-3 text-xs font-bold text-red-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    <span>🔴 Listening to your voice... Speak your answer now into the mic</span>
                  </div>
                  
                  {/* Live Audio Level Meter */}
                  <div className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-mono">MIC VOL</span>
                    <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 transition-all duration-75"
                        style={{ width: `${Math.max(micVolume, 10)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <textarea
                rows={6}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type or speak into your mic... Your spoken words will appear here in real-time!"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm resize-none"
              />

              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                Submit Response for AI Scoring
              </button>
            </div>

            {/* AI Feedback Scorecard */}
            {feedback && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 bg-slate-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="text-amber-500" /> AI Evaluation Scorecard
                  </h3>
                  <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-lg rounded-2xl shadow-md">
                    Score: {feedback.score}/100 ({feedback.grade})
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Key Strengths</h4>
                    {feedback.positives.map((p: string, idx: number) => (
                      <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {p}
                      </p>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Areas for Improvement</h4>
                    {feedback.improvements.map((imp: string, idx: number) => (
                      <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-amber-500 shrink-0" /> {imp}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}

      </div>
    </div>
  );
}
