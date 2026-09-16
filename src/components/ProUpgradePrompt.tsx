import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProUpgradePromptProps {
  title?: string;
  message?: string;
}

export default function ProUpgradePrompt({ title, message }: ProUpgradePromptProps) {
  return (
    <div className="p-5 bg-gradient-to-br from-slate-50 to-primary-50/30 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 animate-in fade-in shadow-sm">
      <div className="flex gap-4 items-start">
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 tracking-tight">
            {title || "Get more with HackVerse Pro"}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
            {message || "Unlock higher limits, more workspaces, additional resumes, and priority access across the platform."}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
        <Link 
          to="/pricing" 
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          Upgrade to Pro
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
