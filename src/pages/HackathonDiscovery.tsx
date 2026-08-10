import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Calendar, Trophy, Bookmark, BookmarkCheck, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SAMPLE_HACKATHONS, HACKATHON_CATEGORIES } from '@/lib/constants';
import { useAppStore } from '@/store/appStore';
import { cn, formatCurrency, formatDate, getCountdown } from '@/lib/utils';

export default function HackathonDiscovery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeMode, setActiveMode] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const { bookmarkedHackathons, toggleBookmark, customHackathons } = useAppStore();

  const allHackathons = [...customHackathons, ...SAMPLE_HACKATHONS];

  const filteredHackathons = allHackathons.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || (h.organizer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || h.category === activeCategory;
    const matchesMode = activeMode === 'All' || h.mode === activeMode;
    const matchesDifficulty = activeDifficulty === 'All' || h.difficulty === activeDifficulty;
    return matchesSearch && matchesCategory && matchesMode && matchesDifficulty;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Discover Hackathons
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Find the perfect hackathon to showcase your skills and win big.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, organizer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
          />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 items-center bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 text-slate-500 mr-4">
          <Filter className="w-5 h-5" />
          <span className="font-semibold">Filters:</span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {['All', ...HACKATHON_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === cat 
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-2"></div>
        
        <select 
          value={activeMode} 
          onChange={(e) => setActiveMode(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium border-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Modes</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        <select 
          value={activeDifficulty} 
          onChange={(e) => setActiveDifficulty(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium border-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </motion.div>

      {/* Grid */}
      {filteredHackathons.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          {filteredHackathons.map((hackathon: any) => {
            const isBookmarked = bookmarkedHackathons?.includes(hackathon.id);
            return (
              <motion.div 
                key={hackathon.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden group hover:border-indigo-500/50 transition-colors flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={hackathon.image} alt={hackathon.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" /> AI Match: {hackathon.aiMatchScore || 85}%
                  </div>
                  <button 
                    onClick={() => toggleBookmark(hackathon.id)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition-colors"
                  >
                    {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-indigo-400" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-indigo-500/80 rounded backdrop-blur-sm">{hackathon.mode}</span>
                      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-purple-500/80 rounded backdrop-blur-sm">{hackathon.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{hackathon.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{hackathon.organizer}</p>
                  
                  <div className="space-y-3 flex-1 mb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="truncate">{hackathon.location?.city || 'Online'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{formatCurrency(hackathon.prizePool)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap mb-6">
                    {hackathon.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                        {tag}
                      </span>
                    ))}
                    {hackathon.tags?.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                        +{hackathon.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between gap-4">
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Closes in: <span className="font-bold text-indigo-500">
                        {(() => {
                          const cd = getCountdown(hackathon.registrationDate);
                          return cd ? `${cd.days}d ${cd.hours}h` : '2d 4h';
                        })()}
                      </span>
                    </div>
                    <Link 
                      to={`/hackathons/${hackathon.id}`}
                      className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No hackathons found</h3>
          <p className="text-slate-500">Try adjusting your filters or search term.</p>
          <button 
            onClick={() => { setSearchTerm(''); setActiveCategory('All'); setActiveMode('All'); setActiveDifficulty('All'); }}
            className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
