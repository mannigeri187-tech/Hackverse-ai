import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Trophy, Bot, Timer, BarChart3, FileText, FileSearch,
  Lightbulb, GraduationCap, Users, TrendingUp, Award, Mic,
  ChevronDown, Check, Menu, X, ArrowRight, Github, Twitter, Linkedin,
  UserCircle, Sparkles, Rocket, Quote
} from 'lucide-react';

import BrandEmblem from '@/components/common/BrandEmblem';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- Navbar ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-slate-900/80 backdrop-blur-xl border-b border-white/10 py-4" : "bg-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/">
          <BrandEmblem size="lg" />
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium">Log In</Link>
          <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:scale-105 transition-transform shadow-lg shadow-indigo-500/25">
            Sign Up
          </Link>
        </div>

        <button className="md:hidden text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-4"
          >
            <a href="#features" className="p-2 text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="p-2 text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="p-2 text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <hr className="border-white/10" />
            <Link to="/login" className="p-2 text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
            <Link to="/signup" className="p-2 w-full text-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium" onClick={() => setMobileMenuOpen(false)}>
              Sign Up
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Typewriter ---
const Typewriter = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="h-12 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute left-0 right-0 text-3xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

// --- Hero Section ---
const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-slate-950 -z-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-[128px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[128px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-4 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            HackVerse AI is now live!
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Your AI-Powered <br className="hidden md:block" />
            Hackathon Coach
          </h1>
          
          <Typewriter words={['Discover Hackathons', 'Build Skills', 'Win Competitions', 'Launch Careers']} />

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mt-4">
            Master the art of hackathons with personalized AI mentoring, real-time feedback, and a comprehensive suite of tools designed to help you win.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-colors backdrop-blur-md">
              Explore Hackathons
            </Link>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 pt-8 border-t border-white/10"
        >
          {[
            { value: "10,000+", label: "Students" },
            { value: "500+", label: "Hackathons" },
            { value: "95%", label: "Success Rate" },
            { value: "50+", label: "Partners" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</span>
              <span className="text-gray-400 text-sm md:text-base">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// --- Features Section ---
const featuresList = [
  { icon: <Trophy />, title: "Hackathon Discovery", desc: "Find hackathons from Devpost, MLH, Unstop" },
  { icon: <Bot />, title: "AI Mentor Chat", desc: "24/7 AI coach for preparation" },
  { icon: <Timer />, title: "Mock Hackathons", desc: "Practice with AI-generated challenges" },
  { icon: <BarChart3 />, title: "Skill Gap Analysis", desc: "Identify and fill skill gaps" },
  { icon: <FileText />, title: "Resume Builder", desc: "ATS-optimized resume creator" },
  { icon: <FileSearch />, title: "AI Resume Review", desc: "Instant resume feedback" },
  { icon: <Lightbulb />, title: "Project Generator", desc: "AI-powered project ideas" },
  { icon: <GraduationCap />, title: "Learning Center", desc: "Structured courses & quizzes" },
  { icon: <Users />, title: "Team Finder", desc: "Find perfect teammates" },
  { icon: <TrendingUp />, title: "Progress Analytics", desc: "Track your growth" },
  { icon: <Award />, title: "Leaderboard", desc: "Compete with peers" },
  { icon: <Mic />, title: "Interview Prep", desc: "AI mock interviews" },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Everything You Need to Win</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A comprehensive suite of tools designed to take you from a beginner to a hackathon champion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-indigo-500 group-hover:text-white">
                {React.cloneElement(feature.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Animated Counter ---
const Counter = ({ end, label, suffix = "" }: { end: number, label: string, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return (
    <div ref={ref} className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-400 font-medium">{label}</div>
    </div>
  );
};

const Statistics = () => {
  return (
    <section className="py-20 bg-slate-900 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Counter end={10000} suffix="+" label="Active Students" />
          <Counter end={500} suffix="+" label="Hackathons Tracked" />
          <Counter end={95} suffix="%" label="Success Rate" />
          <Counter end={50} suffix="+" label="Partner Organizations" />
        </div>
      </div>
    </section>
  );
};

// --- How It Works ---
const HowItWorks = () => {
  const steps = [
    { title: "Create Your Profile", desc: "Sign up and tell us about your skills, interests, and goals.", icon: <UserCircle className="w-8 h-8" /> },
    { title: "Get AI Recommendations", desc: "Our AI mentor analyzes your profile and suggests the best hackathons and learning paths.", icon: <Sparkles className="w-8 h-8" /> },
    { title: "Prepare & Win", desc: "Use our tools to build a team, practice, create a project, and dominate the competition.", icon: <Rocket className="w-8 h-8" /> },
  ];

  return (
    <section className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400">Your journey from beginner to hackathon champion in 3 simple steps.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative flex flex-col items-center text-center p-8 bg-slate-900/50 rounded-3xl border border-white/10"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-gray-400">{step.desc}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-white/20 transform -translate-y-1/2"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Testimonials ---
const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      college: "Stanford University",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      quote: "HackVerse AI completely transformed how I prepare. The AI mentor helped me identify my weak spots in React, and the mock hackathons gave me the confidence to compete."
    },
    {
      name: "Alex Kumar",
      college: "MIT",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      quote: "The team finder is a game-changer. I found my co-founders for a Web3 hackathon here, and we ended up winning first place!"
    },
    {
      name: "Emily Rodriguez",
      college: "UC Berkeley",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
      quote: "As a beginner, I was intimidated by hackathons. HackVerse AI provided a structured learning path that took me from zero to my first submission in just 3 weeks."
    }
  ];

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Loved by Students</h2>
          <p className="text-gray-400">Join thousands of students winning hackathons globally.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col justify-between"
            >
              <div>
                <Quote className="w-10 h-10 text-indigo-500/50 mb-6" />
                <p className="text-gray-300 italic mb-8">{t.quote}</p>
              </div>
              <div className="flex items-center gap-4">
                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="text-white font-semibold">{t.name}</h4>
                  <p className="text-gray-500 text-sm">{t.college}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Pricing ---
const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      desc: "Perfect for getting started",
      features: ["3 hackathons/mo", "Basic AI mentor", "1 resume template", "Community access"],
      button: "Get Started",
      highlight: false
    },
    {
      name: "Pro",
      price: "₹499",
      period: "per month",
      desc: "Everything you need to win",
      features: ["Unlimited hackathons", "Full AI mentor", "All templates", "Mock hackathons", "Skill analysis", "Priority support"],
      button: "Upgrade to Pro",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      desc: "For colleges and clubs",
      features: ["Everything in Pro", "Custom branding", "API access", "Dedicated support", "Analytics dashboard"],
      button: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-950 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400">Choose the plan that best fits your journey.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-3xl p-8 flex flex-col",
                plan.highlight 
                  ? "bg-gradient-to-b from-indigo-500/20 to-slate-900 border border-indigo-500 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]" 
                  : "bg-white/5 border border-white/10"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-white text-sm font-semibold tracking-wide">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm h-10">{plan.desc}</p>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={cn(
                "w-full py-3 rounded-xl font-semibold transition-all",
                plan.highlight
                  ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}>
                {plan.button}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- FAQ ---
const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Faq = () => {
  const faqs = [
    { q: "What is HackVerse AI?", a: "HackVerse AI is an all-in-one platform designed to help students prepare for, participate in, and win hackathons. It includes an AI mentor, mock hackathons, team building tools, and more." },
    { q: "Is it free to use?", a: "We offer a generous free tier that includes access to basic hackathon discovery and the AI mentor. For advanced features like unlimited mock hackathons and resume reviews, we offer a Pro plan." },
    { q: "How does the AI mentor work?", a: "The AI mentor is a 24/7 personalized coach trained on successful hackathon projects and strategies. It can help you brainstorm ideas, debug code, review your pitch, and guide your learning." },
    { q: "Can I use it to find teammates?", a: "Yes! Our Team Finder allows you to connect with other students based on complementary skills, interests, and hackathon availability." },
    { q: "What hackathons are listed?", a: "We aggregate hackathons from major platforms like Devpost, MLH, and Unstop, as well as exclusive college-level hackathons submitted by our community." },
    { q: "How does a mock hackathon work?", a: "A mock hackathon simulates a real event. You're given a problem statement, a time limit, and access to AI tools. At the end, our AI evaluates your project and provides detailed feedback." }
  ];

  return (
    <section id="faq" className="py-24 bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => <FaqItem key={i} question={faq.q} answer={faq.a} />)}
        </div>
      </div>
    </section>
  );
};

// --- CTA Section ---
const CTA = () => {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 -z-10" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to Win Your Next Hackathon?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of students who are already using HackVerse AI to level up their skills and build amazing projects.
          </p>
          <Link to="/signup" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-indigo-500 hover:bg-indigo-600 transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)] hover:scale-105 relative z-10">
            Start For Free Today
          </Link>
        </div>
      </div>
    </section>
  );
};

// --- Footer ---
const Footer = () => {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Trophy className="w-8 h-8 text-indigo-500" />
              <span className="text-2xl font-bold text-white">HackVerse AI</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-xs">
              Empowering students to learn, build, and win at hackathons globally with the power of AI.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">AI Mentor</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Mock Hackathons</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Community</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} HackVerse AI. All rights reserved.</p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Built with <span className="text-red-500">❤️</span> by HackVerse AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30 text-slate-50">
      <Navbar />
      <Hero />
      <Features />
      <Statistics />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Faq />
      <CTA />
      <Footer />
    </div>
  );
}
