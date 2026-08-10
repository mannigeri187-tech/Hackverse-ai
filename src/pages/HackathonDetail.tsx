import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, MapPin, Trophy, Users, CheckCircle, 
  Share2, Bookmark, BookmarkCheck, ArrowLeft, ExternalLink, Globe, Sparkles
} from 'lucide-react';
import { SAMPLE_HACKATHONS } from '@/lib/constants';
import { useAppStore } from '@/store/appStore';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export default function HackathonDetail() {
  const { id } = useParams();
  const hackathon = SAMPLE_HACKATHONS.find(h => h.id === id) || SAMPLE_HACKATHONS[0];
  const { bookmarkedHackathons, toggleBookmark } = useAppStore();
  
  if (!hackathon) {
    return <div className="p-10 text-center dark:text-white">Hackathon not found</div>;
  }

  const isBookmarked = bookmarkedHackathons?.includes(hackathon.id);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <Link to="/discover" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Hackathons
      </Link>
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl"
      >
        <div className="h-64 md:h-80 relative">
          <img src={hackathon.image} alt={hackathon.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => toggleBookmark(hackathon.id)}
              className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 transition-colors"
            >
              {isBookmarked ? <BookmarkCheck className="w-5 h-5 text-indigo-400" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>

          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-indigo-500/80 rounded-full backdrop-blur-md border border-indigo-400/30">
                {hackathon.mode}
              </span>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-purple-500/80 rounded-full backdrop-blur-md border border-purple-400/30">
                {hackathon.difficulty}
              </span>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-900 bg-yellow-400/90 rounded-full backdrop-blur-md border border-yellow-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Match: {hackathon.aiMatchScore || 90}%
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{hackathon.name}</h1>
            <p className="text-lg text-slate-300 flex items-center gap-2">
              <Globe className="w-5 h-5" /> Organized by <span className="font-semibold text-white">{hackathon.organizer}</span>
            </p>
          </div>
        </div>

        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About this Hackathon</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {hackathon.description || 'Join us for an exciting hackathon where you can build innovative solutions, network with industry professionals, and win amazing prizes. Whether you are a beginner or a seasoned pro, there is something for everyone.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Technology Focus</h2>
              <div className="flex flex-wrap gap-2">
                {hackathon.tags?.map((tag: string) => (
                  <span key={tag} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium border border-slate-200 dark:border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Key Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 rounded-lg shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Prize Pool</p>
                    <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(hackathon.prizePool)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-lg shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                    <p className="font-bold text-slate-900 dark:text-white">{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-500 rounded-lg shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                    <p className="font-bold text-slate-900 dark:text-white">{hackathon.location || 'Virtual'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-lg shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Team Size</p>
                    <p className="font-bold text-slate-900 dark:text-white">{hackathon.teamSize || '1-4'} Members</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-500 rounded-lg shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Eligibility</p>
                    <p className="font-bold text-slate-900 dark:text-white">{hackathon.eligibility || 'College Students'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]">
                  Register Now <ExternalLink className="w-5 h-5" />
                </button>
                <p className="text-center text-xs text-slate-500 mt-3">
                  Registration closes on {formatDate(hackathon.registrationDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
