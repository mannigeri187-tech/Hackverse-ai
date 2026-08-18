import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Bot, 
  Lightbulb, 
  Brain, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-16 pb-20">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Unchanged) */}
      {/* ========================================================================= */}
      <div className="w-full bg-theme-hero text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-800/80 relative overflow-hidden glow-blue">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Next-Gen Hackathon Operating Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            Build. Learn. Compete. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Win with AI.
            </span>
          </h1>

          <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Your all-in-one platform for AI mentorship, project ideas, mock interviews, hackathons, and real-world developer growth.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-xl text-left flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white">AI Mentor</p>
                <p className="text-[9px] text-slate-400">24/7 Guidance</p>
              </div>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-xl text-left flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white">100K+</p>
                <p className="text-[9px] text-slate-400">Unique Ideas</p>
              </div>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-xl text-left flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white">Mock Interviews</p>
                <p className="text-[9px] text-slate-400">Practice & Excel</p>
              </div>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-xl text-left flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white">Hackathons</p>
                <p className="text-[9px] text-slate-400">Compete & Win</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-lg shadow-primary-600/30"
            >
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/hackathons" 
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/80 hover:bg-slate-800/90 text-white border border-slate-700/80 backdrop-blur-md rounded-xl font-bold text-sm sm:text-base transition-all shadow-sm"
            >
              Explore Hackathons
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FIRST FEATURE SECTION — AI MENTOR */}
      {/* ========================================================================= */}
      <section className="w-full bg-slate-950 text-white rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-full text-xs font-bold text-cyan-300">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Feature #01</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                AI Mentor
              </h2>
              <p className="text-lg font-bold text-cyan-400">
                Your 24/7 Developer Guide
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Get instant help with coding, debugging, concepts, and real-world problem solving.
              Trained on advanced computer science patterns, system design architectures, and hackathon strategies.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Multi-intent conversational coding & error debugging</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Grounded in your active workspace & task progress</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Tailored strategy for 24h/36h/48h hackathon timelines</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link 
                to="/mentor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-cyan-600/20"
              >
                Launch AI Mentor <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 p-4 sm:p-8 flex items-center justify-center">
            <div className="w-full h-full max-h-[420px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl glow-cyan bg-slate-900">
              <picture>
                <source srcSet="/assets/landing/hackverse-ai-mentor-hero-hd.webp?v=hero8k" type="image/webp" />
                <img 
                  src="/assets/landing/hackverse-ai-mentor-hero-hd.jpg?v=hero8k" 
                  alt="AI Mentor - 24/7 Developer Guide robot coding at workstation"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECOND FEATURE — PROJECT IDEAS */}
      {/* ========================================================================= */}
      <section className="w-full bg-slate-950 text-white rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-4 sm:p-8 flex items-center justify-center order-2 lg:order-1">
            <div className="w-full h-full max-h-[420px] rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-900">
              <img 
                src="/assets/landing/feat_project_ideas_8k.jpg" 
                alt="Project Ideas - 100,000+ Unique & Non-Repeating ideas with glowing lightbulb"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 space-y-6 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-500/40 rounded-full text-xs font-bold text-amber-300">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Feature #02</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Project Ideas
              </h2>
              <p className="text-lg font-bold text-amber-400">
                100,000+ Unique &amp; Non-Repeating
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Discover innovative project ideas powered by advanced AI with persistent uniqueness tracking.
              Every generated concept arrives with architecture blueprints, tech stack pills, and judging angles.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Zero repetition with cryptographic request nonces</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>One-click workspace setup with prefilled problem &amp; solution</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Tailored to your squad's exact verified technical skills</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link 
                to="/idea-generator"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-amber-600/20"
              >
                Generate Winning Ideas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THIRD FEATURE — MOCK INTERVIEWS */}
      {/* ========================================================================= */}
      <section className="w-full bg-slate-950 text-white rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/80 border border-purple-500/40 rounded-full text-xs font-bold text-purple-300">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>Feature #03</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Mock Interviews
              </h2>
              <p className="text-lg font-bold text-purple-400">
                Practice. Improve. Succeed.
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              100,000+ non-repeating DSA, System Design, and Behavioral questions with instant AI evaluation.
              Master technical interview rounds with personalized feedback and benchmark scores.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Simulated judge Q&amp;A defense for hackathon project pitching</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Real-time code complexity analysis (Time &amp; Space)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Detailed rubric scoring across 8 engineering competencies</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link 
                to="/pitch-coach"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-purple-600/20"
              >
                Practice Interviewing <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 p-4 sm:p-8 flex items-center justify-center">
            <div className="w-full h-full max-h-[420px] rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl glow-purple bg-slate-900">
              <img 
                src="/assets/landing/feat_mock_interviews_8k.jpg" 
                alt="Mock Interviews - AI neural brain evaluation and questions"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FOURTH FEATURE — HACKATHON ENGINE */}
      {/* ========================================================================= */}
      <section className="w-full bg-slate-950 text-white rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-4 sm:p-8 flex items-center justify-center order-2 lg:order-1">
            <div className="w-full h-full max-h-[420px] rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-slate-900">
              <img 
                src="/assets/landing/feat_hackathon_engine_8k.jpg" 
                alt="Hackathon Engine - Compete, build, win with victory trophy"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 space-y-6 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-300">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Feature #04</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Hackathon Engine
              </h2>
              <p className="text-lg font-bold text-emerald-400">
                Compete. Build. Win.
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              24h, 48h, 72h hackathons with unique problem statements, live sprint boards, automated submission scoring, and verified credentials.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Deterministic 0–100 Winning Readiness calculation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>First-class search filters for Karnataka, India, and Online</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Shareable winner certificates &amp; public developer portfolio</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link 
                to="/hackathons"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20"
              >
                Browse Hackathons <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FIFTH FEATURE — CYBERSECURITY LEARNING */}
      {/* ========================================================================= */}
      <section className="w-full bg-slate-950 text-white rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/80 border border-blue-500/40 rounded-full text-xs font-bold text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Feature #05</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Cybersecurity Learning
              </h2>
              <p className="text-lg font-bold text-blue-400">
                Secure Today, Protect Tomorrow
              </p>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Interactive video lessons covering XSS, SQL Injection, Auth Security, and Rate Limiting.
              Ensure your hackathon MVP passes strict security and architecture inspection.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Automated GitHub repository security audit</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Defense against top OWASP web application vulnerabilities</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Production-ready authentication &amp; secret isolation best practices</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link 
                to="/github-analyzer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                Analyze Repo Security <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 p-4 sm:p-8 flex items-center justify-center">
            <div className="w-full h-full max-h-[420px] rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl glow-blue bg-slate-900">
              <img 
                src="/assets/landing/feat_cybersecurity_8k.jpg" 
                alt="Cybersecurity Learning - Secure defense shield and encryption padlock"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOUR SCENIC THEMES SHOWCASE GALLERY */}
      {/* ========================================================================= */}
      <section className="w-full space-y-6 text-center pt-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            The Complete Developer Operating Ecosystem
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            From procedural concept discovery to victory stage presentation, HackVerse AI powers every phase.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {/* Card 1: AI-Powered Learning */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
            <div className="h-48 overflow-hidden relative">
              <img 
                src="/assets/landing/showcase_ai_learning_8k.jpg" 
                alt="AI-Powered Learning neural matrix"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                AI-Powered Learning
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adaptive concept explanations and continuous skill mastery tailored to your pace.
              </p>
            </div>
          </div>

          {/* Card 2: Build Your Future */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
            <div className="h-48 overflow-hidden relative">
              <img 
                src="/assets/landing/showcase_build_future_8k.jpg" 
                alt="Build Your Future developer standing before futuristic city sunrise"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                Build Your Future
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transform weekend hackathon prototypes into portfolio-grade production startups.
              </p>
            </div>
          </div>

          {/* Card 3: Collaborate & Compete */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
            <div className="h-48 overflow-hidden relative">
              <img 
                src="/assets/landing/showcase_collaborate_compete_8k.jpg" 
                alt="Collaborate and compete hackathon team coding together"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                Collaborate &amp; Compete
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with complementary developers, match roles, and build high-scoring squads.
              </p>
            </div>
          </div>

          {/* Card 4: Secure. Defend. Empower. */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
            <div className="h-48 overflow-hidden relative">
              <img 
                src="/assets/landing/showcase_secure_empower_8k.jpg" 
                alt="Secure, defend, empower cybersecurity matrix hacker"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                Secure. Defend. Empower.
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enterprise-grade security audits, code hygiene reviews, and vulnerability prevention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL CTA */}
      {/* ========================================================================= */}
      <div className="w-full bg-gradient-to-r from-primary-950 via-slate-900 to-purple-950 border border-slate-800 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl glow-purple">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to win your next hackathon?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Join thousands of developers using HackVerse AI to discover competitions, assemble dream squads, and ship winning MVPs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link 
            to="/signup" 
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all shadow-lg shadow-primary-600/30"
          >
            Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link 
            to="/dashboard" 
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl font-bold text-sm sm:text-base transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
