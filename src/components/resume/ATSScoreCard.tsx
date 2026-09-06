import { useMemo } from 'react';
import { Target, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { calculateATSScore } from '../../utils/resume/atsScoreEngine';
import type { ATSImprovementPriority } from '../../utils/resume/atsScoreEngine';
import type { ResumeData } from '../../types/resumeBuilder';

interface Props {
  data: ResumeData;
}

export function ATSScoreCard({ data }: Props) {
  const result = useMemo(() => calculateATSScore(data), [data]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityIcon = (priority: ATSImprovementPriority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  const getPriorityClass = (priority: ATSImprovementPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-8">
      {/* Header / Score Summary */}
      <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-primary-400" />
            ATS Resume Score
          </h2>
          <p className="text-slate-400 text-sm">Deterministic analysis based on resume content.</p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Score</div>
            <div className={`text-sm font-medium ${result.totalScore >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
              {result.totalScore >= 80 ? 'Excellent' : result.totalScore >= 60 ? 'Needs Work' : 'Incomplete'}
            </div>
          </div>
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-700"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={getScoreColor(result.totalScore)}
                strokeWidth="3"
                strokeDasharray={`${result.totalScore}, 100`}
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold">{result.totalScore}</span>
            </div>
          </div>
        </div>
      </div>

      {result.totalScore === 0 ? (
        <div className="p-8 text-center text-slate-500">
          Start building your resume to see your ATS score.
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Breakdown */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {result.categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                      <div 
                        className={`h-full rounded-full ${cat.score === cat.maxScore ? 'bg-green-500' : cat.score > 0 ? 'bg-primary-500' : 'bg-slate-300'}`}
                        style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-slate-900 w-8 text-right">{cat.score}/{cat.maxScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">How to Improve</h3>
            {result.improvements.length === 0 ? (
              <div className="bg-green-50 text-green-800 border border-green-200 p-4 rounded-xl flex gap-3 text-sm font-medium">
                <CheckCircle className="w-5 h-5 shrink-0" />
                Your resume looks structurally excellent! No major ATS recommendations right now.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {result.improvements.map((imp, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex gap-3 text-sm ${getPriorityClass(imp.priority)}`}>
                    {getPriorityIcon(imp.priority)}
                    <span className="font-medium">{imp.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
