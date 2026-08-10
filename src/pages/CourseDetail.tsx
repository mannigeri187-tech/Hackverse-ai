import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, CheckCircle, Clock, Trophy, Layers, FileText, ArrowLeft, Sparkles, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = ['Overview', 'Lessons', 'Quizzes', 'Assignments'];

// 100% reliable embed links & direct video streams
const UNRESTRICTED_EMBEDS = [
  'https://www.youtube.com/embed/zQnBQ4tB3ZA', // AI & ML Deep Dive
  'https://www.youtube.com/embed/843nec-IvW0', // Next.js 15 & React
  'https://www.youtube.com/embed/m8Icp_Cid5o', // System Design Masterclass
  'https://www.youtube.com/embed/RBSGKlAvoiM', // Data Structures & Algorithms
  'https://www.youtube.com/embed/Tn6-PIqc4UM', // React Ecosystem
  'https://www.youtube.com/embed/qwA6MmjsGNo', // Cybersecurity & Hacking
  'https://www.youtube.com/embed/rfscVS0vtbw', // Python for AI Backend
  'https://www.youtube.com/embed/nu_pCVPKzTk'  // Fullstack Web Dev
];

const DIRECT_MP4_FALLBACKS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
];

const COURSE_DATABASE: Record<string, any> = {
  'c1': {
    id: 'c1',
    title: 'Generative AI for Hackathons',
    category: 'AI & ML',
    level: 'Intermediate',
    duration: '4h 30m',
    xp: 500,
    progress: 65,
    description: 'Learn how to leverage Large Language Models (LLMs), RAG pipelines, and OpenAI APIs to build award-winning AI hackathon prototypes in record time.',
    outcomes: ['Prompt engineering techniques', 'OpenAI & Claude API integration', 'Building RAG with LangChain & Pinecone', 'Deploying fast AI microservices'],
    lessons: [
      { id: 1, title: 'Introduction to GenAI Architecture', duration: '15m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[0] },
      { id: 2, title: 'API Keys, Rate Limits & Security', duration: '20m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[6] },
      { id: 3, title: 'Advanced System Prompting & LLMs', duration: '35m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[0] },
      { id: 4, title: 'Building RAG (Retrieval Augmented Generation)', duration: '45m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[2] },
      { id: 5, title: 'Deploying AI Backend API to Vercel/Render', duration: '30m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[1] },
    ]
  },
  'c2': {
    id: 'c2',
    title: 'Fullstack Next.js 15 & React Mastery',
    category: 'Web Dev',
    level: 'Advanced',
    duration: '8h 15m',
    xp: 850,
    progress: 20,
    description: 'Master modern server components, App Router, Zustand state management, and real-time WebSockets to build high-performance web applications.',
    outcomes: ['Next.js App Router Architecture', 'Server Actions & Mutations', 'Zustand & React Query state management', 'Tailwind CSS & Framer Motion animations'],
    lessons: [
      { id: 1, title: 'Next.js App Router Fundamentals', duration: '25m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[1] },
      { id: 2, title: 'Server Components vs Client Components', duration: '30m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[4] },
      { id: 3, title: 'Database Integration with Supabase & Prisma', duration: '50m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[7] }
    ]
  },
  'c3': {
    id: 'c3',
    title: 'System Design & Scalable Backends',
    category: 'Backend',
    level: 'Beginner',
    duration: '5h 0m',
    xp: 400,
    progress: 100,
    description: 'Understand how microservices, caching with Redis, load balancing, and SQL/NoSQL databases work together in high-traffic applications.',
    outcomes: ['Load balancing & Horizontal scaling', 'Caching strategies with Redis', 'Database indexing & partitioning', 'Event-driven architecture with Kafka'],
    lessons: [
      { id: 1, title: 'Client-Server Architecture Basics', duration: '20m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[2] },
      { id: 2, title: 'Database Indexing & Query Optimization', duration: '40m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[6] }
    ]
  },
  'c4': {
    id: 'c4',
    title: 'Smart Contract Security & Web3',
    category: 'Web3',
    level: 'Advanced',
    duration: '6h 45m',
    xp: 750,
    progress: 10,
    description: 'Master Solidity auditing, reentrancy defense, ERC-20/721 standard implementation, and decentralized application security.',
    outcomes: ['Solidity security best practices', 'Preventing Reentrancy & Front-running', 'Hardhat & Foundry test suites', 'Ethers.js frontend integration'],
    lessons: [
      { id: 1, title: 'Introduction to Solidity & EVM', duration: '30m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[5] },
      { id: 2, title: 'Smart Contract Vulnerabilities & Auditing', duration: '45m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[5] }
    ]
  },
  'c5': {
    id: 'c5',
    title: 'Mastering React & Framer Motion Animations',
    category: 'Frontend',
    level: 'Intermediate',
    duration: '3h 20m',
    xp: 450,
    progress: 30,
    description: 'Create breathtaking user interfaces with fluid Framer Motion animations, glassmorphism UI, and responsive layout patterns.',
    outcomes: ['AnimatePresence & Motion components', 'Scroll-driven animations', 'Micro-interactions & Spring physics', 'Custom design systems'],
    lessons: [
      { id: 1, title: 'Framer Motion Basics & Variants', duration: '25m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[4] },
      { id: 2, title: 'Building Fluid Glassmorphism Components', duration: '35m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[7] }
    ]
  },
  'c6': {
    id: 'c6',
    title: 'Data Structures & Algorithms Masterclass',
    category: 'Algorithms',
    level: 'Advanced',
    duration: '12h 0m',
    xp: 1200,
    progress: 0,
    description: 'Ace technical interviews and competitive coding challenges with graph algorithms, dynamic programming, and binary search strategies.',
    outcomes: ['Time & Space Complexity Analysis', 'Graph Traversals (BFS & DFS)', 'Dynamic Programming patterns', 'Tree data structures & Heaps'],
    lessons: [
      { id: 1, title: 'Big O Notation & Array Manipulation', duration: '40m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[3] },
      { id: 2, title: 'Graphs, Trees & Dynamic Programming', duration: '60m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[3] }
    ]
  },
  'ai-ml': {
    id: 'ai-ml',
    title: 'Artificial Intelligence & Machine Learning Track',
    category: 'AI & ML',
    level: 'All Levels',
    duration: '12h 0m',
    xp: 1200,
    progress: 40,
    description: 'Comprehensive track covering Python ML libraries, Fine-tuning LLaMA models, Vision APIs, and Vector Search.',
    outcomes: ['PyTorch & TensorFlow foundations', 'Fine-tuning open-source LLMs', 'Embedding models & Cosine Similarity', 'Multi-modal AI applications'],
    lessons: [
      { id: 1, title: 'Intro to Vectors & Embeddings', duration: '30m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[0] },
      { id: 2, title: 'Fine-tuning LLaMA 3 with Unsloth', duration: '60m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[6] }
    ]
  },
  'web-dev': {
    id: 'web-dev',
    title: 'Modern Web Development Mastery',
    category: 'Web Dev',
    level: 'Intermediate',
    duration: '10h 0m',
    xp: 1000,
    progress: 50,
    description: 'Complete roadmap covering HTML5, CSS3, Modern JavaScript, React 19, Tailwind CSS, and Vite.',
    outcomes: ['Modern JavaScript ES6+', 'React hooks & state management', 'Tailwind CSS design systems', 'REST & GraphQL APIs'],
    lessons: [
      { id: 1, title: 'React 19 Deep Dive', duration: '45m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[1] },
      { id: 2, title: 'Tailwind CSS Pro Layouts', duration: '40m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[7] }
    ]
  },
  'backend': {
    id: 'backend',
    title: 'Backend Systems & Database Architecture',
    category: 'Backend',
    level: 'Intermediate',
    duration: '8h 0m',
    xp: 900,
    progress: 30,
    description: 'Design robust backend servers with Node.js, Express, PostgreSQL, Supabase, and Docker.',
    outcomes: ['Express API design', 'PostgreSQL database modeling', 'JWT & OAuth Authentication', 'Docker container deployment'],
    lessons: [
      { id: 1, title: 'Node.js Microservices', duration: '50m', completed: true, embedUrl: UNRESTRICTED_EMBEDS[2] },
      { id: 2, title: 'PostgreSQL & Prisma Setup', duration: '45m', completed: false, embedUrl: UNRESTRICTED_EMBEDS[6] }
    ]
  },
  'security': {
    id: 'security',
    title: 'Cybersecurity & Web App Defense',
    category: 'Cybersecurity',
    level: 'Advanced',
    duration: '7h 30m',
    xp: 800,
    progress: 15,
    description: 'Learn ethical hacking, OWASP Top 10 vulnerabilities, penetration testing, and secure coding standards.',
    outcomes: ['OWASP Top 10 Vulnerability defense', 'XSS & SQL Injection prevention', 'Encrypted communications (TLS/SSL)', 'Penetration testing basics'],
    lessons: [
      { id: 1, title: 'Web Application Security Fundamentals', duration: '35m', completed: true, embedUrl: 'https://www.youtube-nocookie.com/embed/zQnBQ4tB3ZA?rel=0' },
      { id: 2, title: 'Securing REST APIs & OWASP Defense', duration: '40m', completed: false, embedUrl: 'https://www.youtube-nocookie.com/embed/rfscVS0vtbw?rel=0' },
      { id: 3, title: 'Ethical Hacking & Penetration Testing', duration: '50m', completed: false, embedUrl: 'https://www.youtube-nocookie.com/embed/m8Icp_Cid5o?rel=0' },
      { id: 4, title: 'Network Security & Encryption Protocols', duration: '45m', completed: false, embedUrl: 'https://www.youtube-nocookie.com/embed/nu_pCVPKzTk?rel=0' }
    ]
  }
};

export default function CourseDetail() {
  const { courseId } = useParams();
  const course = COURSE_DATABASE[courseId || 'c1'] || COURSE_DATABASE['c1'];

  const [activeTab, setActiveTab] = useState('Lessons');
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [useDirectStream, setUseDirectStream] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<number[]>(
    course.lessons.filter((l: any) => l.completed).map((l: any) => l.id)
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  const [assignmentLink, setAssignmentLink] = useState('');

  const currentLesson = course.lessons[activeLessonIndex] || course.lessons[0];

  const toggleCompleteLesson = (id: number) => {
    if (completedLessons.includes(id)) {
      setCompletedLessons(completedLessons.filter(l => l !== id));
    } else {
      setCompletedLessons([...completedLessons, id]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20 text-slate-900 dark:text-white">
      {/* Header Back Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <Link to="/learning" className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 font-semibold mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Learning Center
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                {course.category}
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                {course.level}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{course.title}</h1>
            <p className="text-indigo-200 text-lg max-w-3xl leading-relaxed">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-indigo-100 text-sm pt-2">
              <span className="flex items-center gap-2"><Clock size={16} className="text-indigo-400" /> {course.duration}</span>
              <span className="flex items-center gap-2"><Layers size={16} className="text-indigo-400" /> {course.lessons.length} Lessons</span>
              <span className="flex items-center gap-2"><Trophy size={16} className="text-yellow-400" /> {course.xp} XP reward</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-slate-900/50 backdrop-blur-xl">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-4 text-center font-bold text-sm transition-all border-b-2",
                  activeTab === tab 
                    ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-900" 
                    : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'Overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles className="text-indigo-500" /> Course Syllabus & Learning Objectives
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{course.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What You Will Master</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.outcomes.map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
                          <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                          <span className="text-gray-800 dark:text-gray-200 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={() => setActiveTab('Lessons')}
                      className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
                    >
                      Start Video Lessons Now <PlayCircle size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: LESSONS & INSTANT PLAYING EMBEDDED VIDEO PLAYER */}
              {activeTab === 'Lessons' && (
                <motion.div key="lessons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col lg:flex-row gap-8">
                  {/* Playlist */}
                  <div className="w-full lg:w-1/3 space-y-3">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Course Playlist</h4>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {course.lessons.map((lesson: any, index: number) => {
                        const isDone = completedLessons.includes(lesson.id);
                        const isActive = activeLessonIndex === index;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLessonIndex(index)}
                            className={cn(
                              "w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all border",
                              isActive 
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                                : "bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:border-indigo-400"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {isDone ? (
                                <CheckCircle className={isActive ? "text-white" : "text-emerald-500"} size={20} />
                              ) : (
                                <PlayCircle className={isActive ? "text-white" : "text-indigo-500"} size={20} />
                              )}
                              <div>
                                <span className={cn("text-xs font-bold block", isActive ? "text-indigo-200" : "text-gray-400")}>
                                  LESSON {index + 1} • {lesson.duration}
                                </span>
                                <span className="font-semibold text-sm line-clamp-1">{lesson.title}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Video Player Container */}
                  <div className="w-full lg:w-2/3 space-y-6">
                    <div className="aspect-video bg-black rounded-3xl relative overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
                      {!useDirectStream ? (
                        <iframe
                          key={currentLesson.id}
                          src={currentLesson.embedUrl}
                          title={currentLesson.title}
                          className="w-full h-full border-0 rounded-3xl"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          key={`direct-${currentLesson.id}`}
                          controls
                          autoPlay
                          className="w-full h-full object-cover rounded-3xl"
                        >
                          <source src={DIRECT_MP4_FALLBACKS[activeLessonIndex % DIRECT_MP4_FALLBACKS.length]} type="video/mp4" />
                          Your browser does not support video playback.
                        </video>
                      )}
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Active Lesson {activeLessonIndex + 1} of {course.lessons.length}</span>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentLesson.title}</h2>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setUseDirectStream(!useDirectStream)}
                            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                            title="Toggle stream mode"
                          >
                            <RefreshCw size={14} /> {useDirectStream ? 'Switch to HD Embed' : 'Switch to Direct Stream'}
                          </button>
                          <button
                            onClick={() => toggleCompleteLesson(currentLesson.id)}
                            className={cn(
                              "px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md",
                              completedLessons.includes(currentLesson.id)
                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            )}
                          >
                            {completedLessons.includes(currentLesson.id) ? (
                              <>Completed <Check size={16} /></>
                            ) : (
                              <>Mark Complete <CheckCircle size={16} /></>
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                        This video lecture covers practical AI algorithms, code walkthroughs, and step-by-step hackathon implementation strategies.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: QUIZZES */}
              {activeTab === 'Quizzes' && (
                <motion.div key="quizzes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-200 dark:border-white/10 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Knowledge Check Quiz</h3>
                      <span className="bg-indigo-500/20 text-indigo-500 px-3 py-1 rounded-full text-xs font-bold">100 XP</span>
                    </div>

                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                      What is the primary advantage of Retrieval Augmented Generation (RAG) in AI hackathon projects?
                    </p>

                    <div className="space-y-3">
                      {[
                        'It allows LLMs to query custom private data without retraining the base model.',
                        'It makes the model run offline on microcontrollers.',
                        'It converts text directly into 3D CAD models.',
                        'It bypasses API rate limits automatically.'
                      ].map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedAnswer(idx)}
                          className={cn(
                            "w-full text-left p-4 rounded-2xl border font-medium text-sm transition-all",
                            selectedAnswer === idx 
                              ? "border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold" 
                              : "border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-indigo-400"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={selectedAnswer === null}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg"
                    >
                      {quizSubmitted ? 'Quiz Submitted (+100 XP Granted!)' : 'Submit Quiz Answer'}
                    </button>

                    {quizSubmitted && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 font-semibold text-sm text-center">
                        🎉 Correct answer! RAG empowers your app to reference custom hackathon datasets dynamically.
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: ASSIGNMENTS */}
              {activeTab === 'Assignments' && (
                <motion.div key="assignments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-200 dark:border-white/10 space-y-6">
                    <div className="flex items-center gap-3">
                      <FileText className="text-indigo-500" size={28} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Practical Hackathon Challenge</h3>
                        <p className="text-sm text-gray-500">Earn +200 XP upon AI mentor review</p>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Build a working prototype script using Python or TypeScript that integrates an LLM API to answer user queries based on a uploaded PDF or markdown file. Submit your GitHub repository URL below.
                    </p>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase text-gray-500">Repository Link</label>
                      <input 
                        type="url"
                        value={assignmentLink}
                        onChange={(e) => setAssignmentLink(e.target.value)}
                        placeholder="https://github.com/username/ai-hackathon-prototype"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <button
                      onClick={() => setAssignmentSubmitted(true)}
                      disabled={!assignmentLink}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg"
                    >
                      {assignmentSubmitted ? 'Assignment Submitted for AI Review!' : 'Submit Project Repository'}
                    </button>

                    {assignmentSubmitted && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400 font-semibold text-sm text-center">
                        ✅ Project received! AI Mentor will review code structure and provide performance scores.
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
