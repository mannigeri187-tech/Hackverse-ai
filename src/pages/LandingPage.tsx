
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Users, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
          Win your next <span className="text-primary-600">Hackathon</span>.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The ultimate AI-powered companion for students. Discover hackathons, build your team, and ship winning projects faster.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/signup" className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-lg flex items-center justify-center transition-all">
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link to="/hackathons" className="w-full sm:w-auto px-8 py-3 bg-white text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg font-semibold text-lg transition-all shadow-sm">
            Explore Hackathons
          </Link>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 w-full pt-12 border-t border-slate-200">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Smart Discovery</h3>
          <p className="text-slate-600">Find hackathons tailored to your skills and interests instantly.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Build Your Team</h3>
          <p className="text-slate-600">Connect with other students and form the perfect hacking squad.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
            <Code className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">AI Mentor</h3>
          <p className="text-slate-600">Get stuck? Your AI mentor is ready to help you debug and brainstorm.</p>
        </div>
      </div>
    </div>
  );
}
