import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Shield, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SAMPLE_LEADERBOARD } from '@/lib/constants';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'all'>('weekly');
  const [category, setCategory] = useState('overall');

  // Sort and prep data
  const sortedData = [...SAMPLE_LEADERBOARD].sort((a, b) => b.xp - a.xp);
  const topThree = sortedData.slice(0, 3);
  const rest = sortedData.slice(3);

  // Reorder top 3 for podium (2, 1, 3)
  const podium = [topThree[1], topThree[0], topThree[2]];

  const getPodiumStyles = (idx: number) => {
    if (idx === 1) return "h-48 bg-gradient-to-t from-yellow-500/20 to-yellow-300/10 border-yellow-500/50"; // 1st
    if (idx === 0) return "h-36 bg-gradient-to-t from-slate-300/20 to-slate-100/10 border-slate-300/50"; // 2nd
    return "h-32 bg-gradient-to-t from-amber-700/20 to-amber-500/10 border-amber-700/50"; // 3rd
  };

  const getPodiumColor = (idx: number) => {
    if (idx === 1) return "text-yellow-400";
    if (idx === 0) return "text-slate-300";
    return "text-amber-600";
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4 inline-block">
            Global Leaderboard
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Compete with hackers worldwide. Earn XP by completing courses, winning mock hackathons, and helping the community.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex bg-slate-900/50 backdrop-blur-md p-1 rounded-xl border border-white/10 w-full md:w-auto">
            {['weekly', 'monthly', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all capitalize", 
                  activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none flex-1 md:w-48"
            >
              <option value="overall">Overall Score</option>
              <option value="mock">Mock Hackathons</option>
              <option value="courses">Courses</option>
              <option value="community">Community</option>
            </select>
          </div>
        </div>

        {/* Podium */}
        <div className="flex justify-center items-end h-72 mb-16 gap-2 sm:gap-6">
          {podium.map((user, idx) => {
            if (!user) return null;
            const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
            return (
              <motion.div 
                      key={user.rank}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2, type: 'spring' }}
                className="flex flex-col items-center relative w-24 sm:w-32"
              >
                <div className="relative mb-4 z-10">
                  <img src={user.avatar} alt={user.name} className={cn("rounded-full border-4 shadow-xl object-cover", rank === 1 ? "w-24 h-24 border-yellow-500" : "w-20 h-20 border-slate-700")} />
                  <div className={cn("absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg", rank === 1 ? "bg-yellow-500 text-yellow-900" : rank === 2 ? "bg-slate-300 text-slate-900" : "bg-amber-600 text-amber-50")}>
                    #{rank}
                  </div>
                </div>
                
                <div className="text-center mb-2 z-10">
                  <h3 className="text-white font-bold text-sm sm:text-base truncate w-full px-1">{user.name}</h3>
                  <p className={cn("text-xs font-bold", getPodiumColor(idx))}>{user.xp.toLocaleString()} XP</p>
                </div>

                <div className={cn("w-full rounded-t-xl border-t border-x relative overflow-hidden backdrop-blur-sm", getPodiumStyles(idx))}>
                  <div className="absolute inset-0 bg-white/5"></div>
                  {rank === 1 && <Trophy className="absolute top-4 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-500/50" />}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Table */}
        <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hacker</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rest.map((user, idx) => {
                  const rank = idx + 4;
                  const isCurrentUser = user.name === "Current User"; // Mock check
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 * idx }}
                            key={user.rank} 
                      className={cn("hover:bg-white/5 transition-colors", isCurrentUser && "bg-indigo-500/10")}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-slate-400 font-medium">#{rank}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                          <div>
                            <p className="text-white font-medium flex items-center">
                              {user.name}
                              {isCurrentUser && <span className="ml-2 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-slate-300">
                          <Shield className="h-4 w-4 text-indigo-400" />
                          <span>Lvl {user.level}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-medium text-indigo-300">
                        {user.xp.toLocaleString()}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
