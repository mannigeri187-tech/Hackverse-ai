import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Flame, Zap, Trophy, Eye, Search, Play, FileText, MessageSquare, 
  CheckCircle, Circle, Clock, TrendingUp, Calendar, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { SAMPLE_HACKATHONS, MOTIVATION_QUOTES, SAMPLE_USER } from '@/lib/constants';
import { cn, getCountdown } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const LEARNING_DATA = [
  { name: 'React', progress: 85, color: '#6366f1' },
  { name: 'Python', progress: 70, color: '#8b5cf6' },
  { name: 'ML', progress: 45, color: '#ec4899' },
  { name: 'Cloud', progress: 30, color: '#10b981' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { user } = useAuthStore();
  
  // 24-Hour Rotating Motivational Quote System
  const get24HourDailyQuote = () => {
    const dayEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const quotes = (MOTIVATION_QUOTES && MOTIVATION_QUOTES.length > 0) 
      ? MOTIVATION_QUOTES 
      : [{ quote: "Keep pushing limits line by line.", author: "HackVerse AI" }];
    return quotes[dayEpoch % quotes.length];
  };

  const [quoteIndexOffset, setQuoteIndexOffset] = useState(0);
  
  const currentQuote = () => {
    const dayEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) + quoteIndexOffset;
    const quotes = MOTIVATION_QUOTES;
    return quotes[Math.abs(dayEpoch) % quotes.length];
  };

  const activeQuote = currentQuote();

  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete React mock test', done: true },
    { id: 2, text: 'Update resume with new ML project', done: false },
    { id: 3, text: 'Register for Web3 Hackathon', done: false }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const currentUser = user || SAMPLE_USER;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <TrendingUp className="w-48 h-48 text-indigo-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 shrink-0">
              <img src={currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} alt="Avatar" className="w-full h-full rounded-full bg-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{currentUser.name}</span>!
              </h1>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-sm font-semibold rounded-full border border-indigo-500/30">
                  Level {currentUser.level || 1}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/30">
                  ✨ Daily Quote (Updates every 24h)
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 italic">"{activeQuote.quote}" — <span className="font-semibold text-slate-700 dark:text-slate-300">{activeQuote.author}</span></p>
            </div>
          </div>

          <button 
            onClick={() => setQuoteIndexOffset(prev => prev + 1)} 
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-indigo-300 border border-white/10 flex items-center gap-1.5 shrink-0 transition-colors"
            title="Cycle daily quote"
          >
            🔄 Cycle Quote
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Streak', value: `${currentUser.streak || 0} days`, icon: Flame, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Total XP', value: currentUser.xp || 0, icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Hackathons Won', value: currentUser.hackathonsWon || 0, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Recruiter Views', value: currentUser.recruiterViews || 0, icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Find Hackathon', icon: Search, to: '/hackathons', color: 'from-blue-500 to-indigo-600' },
              { label: 'Start Mock', icon: Play, to: '/mock-hackathon', color: 'from-purple-500 to-pink-600' },
              { label: 'Build Resume', icon: FileText, to: '/resume-builder', color: 'from-emerald-500 to-teal-600' },
              { label: 'Ask Mentor', icon: MessageSquare, to: '/ai-mentor', color: 'from-amber-500 to-orange-600' }
            ].map((action, i) => (
              <Link key={i} to={action.to}>
                <div className={cn("bg-gradient-to-br p-4 rounded-2xl text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center space-y-3", action.color)}>
                  <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto backdrop-blur-md">
                    <action.icon className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm">{action.label}</p>
                </div>
              </Link>
            ))}
          </motion.div>

          {/* Upcoming Hackathons */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Hackathons</h2>
              <Link to="/hackathons" className="text-indigo-500 hover:text-indigo-400 text-sm flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {SAMPLE_HACKATHONS?.slice(0, 3).map((hackathon: any) => (
                <div key={hackathon.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 hover:border-indigo-500/30 transition-colors">
                  <img src={hackathon.image} alt={hackathon.name} className="w-full sm:w-24 h-24 sm:h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{hackathon.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {hackathon.startDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-500 font-medium mb-1">Registration ends in</p>
                    <p className="font-mono text-sm dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                      {(() => {
                        const cd = getCountdown(hackathon.registrationDate);
                        return cd ? `${cd.days}d ${cd.hours}h` : '2d 14h';
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Learning Progress */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Learning Progress</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LEARNING_DATA} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', color: '#fff' }} />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={24}>
                    {LEARNING_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Prep Score */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Preparation Score</h2>
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-800" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" 
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - (currentUser.preparationScore || 75) / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                  className="text-indigo-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{currentUser.preparationScore || 75}%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">Ready</span>
              </div>
            </div>
          </motion.div>

          {/* Today's Tasks */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Today's Tasks</h2>
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 cursor-pointer group" onClick={() => toggleTask(task.id)}>
                  <div className="mt-1">
                    {task.done ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>
                  <span className={cn("text-slate-700 dark:text-slate-300 transition-all", task.done && "line-through text-slate-400 dark:text-slate-500")}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
              {[
                { title: 'Earned React Badge', time: '2 hours ago', icon: Trophy, color: 'text-yellow-500' },
                { title: 'Completed Mock Interview', time: 'Yesterday', icon: Play, color: 'text-purple-500' },
                { title: 'Registered for HackNY', time: '3 days ago', icon: Calendar, color: 'text-indigo-500' }
              ].map((activity, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <activity.icon className={cn("w-4 h-4", activity.color)} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{activity.title}</h4>
                    </div>
                    <time className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {activity.time}</time>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
