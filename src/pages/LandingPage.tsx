
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Users, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-12 pb-12">
      {/* Hero Banner Section */}
      <div className="w-full bg-theme-hero text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-800/80 relative overflow-hidden glow-blue">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
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
            Your all-in-one platform for AI mentorship, procedural idea generation, sprint workspaces, pitch coaching, and verified developer portfolios.
          </p>

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
      
      {/* 3 Core Highlight Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 w-full pt-4">
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Discovery</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">Find verified hackathons across India and Karnataka tailored to your exact skills.</p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 border border-purple-100">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Squad Formation</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">Connect with fellow developers and assemble complementary hackathon teams.</p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-4 border border-cyan-100">
            <Code className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">AI Strategy & Mentorship</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">Ground your sprint in real-time AI guidance, code audits, and pitch preparation.</p>
        </div>
      </div>
    </div>
  );
}
