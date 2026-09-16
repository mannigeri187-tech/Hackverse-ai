import { Link } from 'react-router-dom';
import { Bot, ArrowRight, CheckCircle2 } from 'lucide-react';
import aiMentorHdImage from '../../assets/ai_mentor_hd.jpg';

export default function AIMentorFeature() {
  return (
    <section className="w-full bg-slate-950 text-white rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
      <div className="grid lg:grid-cols-12 items-center">
        {/* Left Column: Feature presentation & CTA */}
        <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-full text-xs font-bold text-cyan-300">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Feature #01</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              AI Mentor
            </h2>
            <p className="text-lg font-bold text-cyan-400">
              Your 24/7 Developer Guide
            </p>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Get instant help with coding, debugging, concepts, and real-world problem solving.
            Trained on advanced computer science patterns, system design architectures, and hackathon strategies.
          </p>

          <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Multi-intent conversational coding &amp; error debugging</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Grounded in your active workspace &amp; task progress</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Tailored strategy for 24h/36h/48h hackathon timelines</span>
            </li>
          </ul>

          <div className="pt-4">
            <Link 
              to="/mentor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-cyan-600/20"
            >
              Launch AI Mentor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: Provided HD Robot Developer Image */}
        <div className="lg:col-span-6 p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full h-full max-h-[420px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl glow-cyan bg-slate-900">
            <img 
              src={aiMentorHdImage} 
              alt="HackVerse AI Mentor helping developers with AI-powered guidance"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
