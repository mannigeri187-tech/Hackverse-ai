import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Activity, Award, FileText } from 'lucide-react';
import { useHackathons } from '../hooks/useHackathons';
import { useAuth } from '../contexts/AuthContext';
import { DailyCoach } from '../components/DailyCoach';
import { TrackerSummaryWidget } from '../components/TrackerSummaryWidget';

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || 'Hacker';

  // Fetch only 3 upcoming hackathons for the preview
  const { hackathons, isLoading, isError } = useHackathons({
    status: 'upcoming',
    page: 1,
    limit: 3
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO COMMAND HEADER */}
      <div className="bg-theme-dashboard-8k text-white rounded-3xl p-7 sm:p-10 shadow-2xl border border-cyan-900/40 relative overflow-hidden glow-blue">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Command Dashboard &amp; Mission Control
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            Welcome back, {userName}! 🚀
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
            Here's an overview of your hackathon sprint, active registrations, and strategic AI tools.
          </p>
        </div>
      </div>

      <DailyCoach />

      <TrackerSummaryWidget />
      
      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium mb-1">Active Registrations</h3>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium mb-1">Resume Builder</h3>
            <Link to="/resume" className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-2 block">
              Edit Resume →
            </Link>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium mb-1">Hackathons Won</h3>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>
      </div>

      {/* Recommended/Upcoming Hackathons Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upcoming Hackathons</h2>
            <p className="text-sm text-slate-500 mt-1">Events starting soon that you might like.</p>
          </div>
          <Link to="/hackathons" className="text-primary-600 hover:text-primary-700 font-medium flex items-center text-sm">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-100 rounded-xl h-48 border border-slate-200"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">Failed to load preview.</div>
          ) : hackathons.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No upcoming hackathons found.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {hackathons.map((hackathon) => (
                <Link key={hackathon.id} to={`/hackathons/${hackathon.id}`} className="block group">
                  <div className="h-full border border-slate-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all">
                    <div 
                      className="h-24 bg-slate-200 bg-cover bg-center"
                      style={hackathon.image_url ? { backgroundImage: `url(${hackathon.image_url})` } : {}}
                    ></div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {hackathon.title}
                      </h3>
                      <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-2" />
                          <span>{new Date(hackathon.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-2" />
                          <span className="line-clamp-1">{hackathon.location || hackathon.mode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
