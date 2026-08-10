import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Clock, BookOpen, Target, Award, Star, Zap, ChevronDown, Code2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';

// Mock Data
const scoreTrendData = [
  { name: 'Mon', score: 65 }, { name: 'Tue', score: 68 }, { name: 'Wed', score: 75 },
  { name: 'Thu', score: 73 }, { name: 'Fri', score: 82 }, { name: 'Sat', score: 88 }, { name: 'Sun', score: 92 }
];

const skillsRadarData = [
  { subject: 'React', A: 90, fullMark: 100 },
  { subject: 'Python', A: 75, fullMark: 100 },
  { subject: 'Machine Learning', A: 60, fullMark: 100 },
  { subject: 'Cloud (AWS)', A: 70, fullMark: 100 },
  { subject: 'Security', A: 50, fullMark: 100 },
  { subject: 'UI/UX', A: 85, fullMark: 100 },
];

const weeklyActivityData = [
  { name: 'Mon', hours: 2 }, { name: 'Tue', hours: 3.5 }, { name: 'Wed', hours: 4 },
  { name: 'Thu', hours: 2.5 }, { name: 'Fri', hours: 5 }, { name: 'Sat', hours: 8 }, { name: 'Sun', hours: 6 }
];

const mockTestScores = [
  { test: 'Test 1', score: 60 }, { test: 'Test 2', score: 65 }, { test: 'Test 3', score: 78 },
  { test: 'Test 4', score: 75 }, { test: 'Test 5', score: 85 }
];

const courseProgress = [
  { name: 'Frontend', completed: 85 },
  { name: 'Backend', completed: 60 },
  { name: 'DevOps', completed: 40 },
  { name: 'Algorithms', completed: 75 }
];

const ACHIEVEMENTS = [
  { id: 1, title: 'Early Bird', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 2, title: 'Code Ninja', icon: Code2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 3, title: 'Fast Learner', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 4, title: 'Top 10%', icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' }
];

export default function ProgressAnalytics() {
  const [timeRange, setTimeRange] = useState('This Week');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Your Progress Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400">Track your skills, activity, and readiness for your next hackathon.</p>
          </div>
          <div className="relative">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>All Time</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Preparation Score" value="92/100" trend="+5%" icon={Target} color="indigo" />
          <StatCard title="Coding Hours" value="31h" trend="+12%" icon={Clock} color="purple" />
          <StatCard title="Courses Completed" value="4" trend="2 this week" icon={BookOpen} color="pink" />
          <StatCard title="Mock Tests" value="5" trend="Avg 72%" icon={Award} color="emerald" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Preparation Readiness Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Skills Profiler</h3>
            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsRadarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Radar name="Skills" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Activity Bar Chart */}
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Coding Hours Activity</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="hours" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mock Tests Line Chart */}
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Mock Test Performance</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTestScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="test" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Achievements Grid */}
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Badges</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map(badge => {
                const Icon = badge.icon;
                return (
                  <div key={badge.id} className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", badge.bg, badge.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{badge.title}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Skill Growth Table */}
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Course Progress</h3>
            <div className="space-y-5">
              {courseProgress.map((course, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{course.name}</span>
                    <span className="text-xs font-bold text-slate-500">{course.completed}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${course.completed}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }: { title: string, value: string, trend: string, icon: any, color: 'indigo' | 'purple' | 'pink' | 'emerald' }) {
  const colorMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <div>
        <h4 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h4>
        <span className="text-2xl font-black text-slate-800 dark:text-white">{value}</span>
      </div>
    </motion.div>
  );
}

// Icons
