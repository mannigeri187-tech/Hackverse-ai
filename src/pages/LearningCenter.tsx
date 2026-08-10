import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Code, Database, Globe, Cpu, Shield, Search, Star, Clock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

// Fallback topics
const LEARNING_TOPICS = [
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: Cpu, color: 'from-blue-500 to-indigo-500', courses: 12 },
  { id: 'web-dev', name: 'Web Development', icon: Globe, color: 'from-emerald-500 to-teal-500', courses: 24 },
  { id: 'backend', name: 'Backend & Systems', icon: Database, color: 'from-orange-500 to-red-500', courses: 18 },
  { id: 'security', name: 'Cybersecurity', icon: Shield, color: 'from-purple-500 to-pink-500', courses: 8 }
];

const SAMPLE_COURSES = [
  { id: 'c1', title: 'Generative AI for Hackathons', category: 'AI & ML', duration: '4h 30m', difficulty: 'Intermediate', xp: 500, progress: 65, color: 'from-indigo-500 to-purple-500' },
  { id: 'c2', title: 'Fullstack Next.js Mastery', category: 'Web Dev', duration: '8h 15m', difficulty: 'Advanced', xp: 850, progress: 0, color: 'from-emerald-500 to-teal-500' },
  { id: 'c3', title: 'System Design Fundamentals', category: 'Backend', duration: '5h 0m', difficulty: 'Beginner', xp: 400, progress: 100, color: 'from-orange-500 to-red-500' },
  { id: 'c4', title: 'Smart Contract Security', category: 'Web3', duration: '6h 45m', difficulty: 'Advanced', xp: 750, progress: 0, color: 'from-blue-500 to-cyan-500' },
  { id: 'c5', title: 'Mastering React & Framer Motion', category: 'Frontend', duration: '3h 20m', difficulty: 'Intermediate', xp: 450, progress: 30, color: 'from-pink-500 to-rose-500' },
  { id: 'c6', title: 'Data Structures Refresher', category: 'Algorithms', duration: '12h 0m', difficulty: 'Advanced', xp: 1200, progress: 0, color: 'from-yellow-500 to-amber-500' }
];

export default function LearningCenter() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">AI Learning Center</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Level up your skills with AI-curated hackathon courses.</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search courses, topics..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-xl shadow-sm"
            />
          </motion.div>
        </div>

        {/* Categories */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LEARNING_TOPICS.map((topic, i) => (
            <Link key={topic.id} to={`/learning/${topic.id}`}>
              <motion.div whileHover={{ scale: 1.02 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group cursor-pointer h-full">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br mb-4 shadow-sm", topic.color)}>
                  <topic.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">{topic.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{topic.courses} courses available</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Continue Learning */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="text-indigo-500" /> Continue Learning
            </h2>
            <button className="text-indigo-500 hover:text-indigo-600 text-sm font-semibold transition-colors">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_COURSES.filter(c => c.progress > 0 && c.progress < 100).map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        </div>

        {/* Recommended */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="text-amber-500" /> Recommended for You
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SAMPLE_COURSES.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, index }: { course: any, index: number }) {
  return (
    <Link to={`/learning/${course.id}`} className="block h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
      >
        <div className={cn("h-32 bg-gradient-to-r w-full relative", course.color)}>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
            {course.category}
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-500 transition-colors">{course.title}</h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
            <span className="flex items-center gap-1"><Trophy size={14} /> {course.xp} XP</span>
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{course.difficulty}</span>
              <span className="font-semibold text-indigo-500">{course.progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }} />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
