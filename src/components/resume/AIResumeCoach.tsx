import { useState } from 'react';
import { Bot, Sparkles, AlertCircle, Info, CheckCircle, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ResumeData } from '../../types/resumeBuilder';
import type { ATSScoreResult } from '../../utils/resume/atsScoreEngine';

export interface AICoachSuggestion {
  section: 'summary' | 'experience' | 'projects';
  itemId: string;
  field: 'description' | 'summary';
  originalText: string;
  suggestedText: string;
  reason: string;
}

export interface AICoachFeedback {
  section: string;
  severity: 'high' | 'medium' | 'low';
  issue: string;
  recommendation: string;
}

export interface AICoachResult {
  overallAssessment: string;
  sectionFeedback: AICoachFeedback[];
  suggestions: AICoachSuggestion[];
}

interface Props {
  data: ResumeData;
  atsResult: ATSScoreResult;
  onChange: (data: ResumeData) => void;
}

export function AIResumeCoach({ data, atsResult, onChange }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AICoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    // Prevent empty analysis
    if (!data.summary && (!data.experience || data.experience.length === 0) && (!data.projects || data.projects.length === 0)) {
      setError("Add some resume content first, then ask AI Resume Coach for feedback.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Unauthorized");

      // We assume the API lives at /api/ai/resume-coach
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/ai/resume-coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ resumeData: data, atsResult })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'AI Request failed');
      }

      const aiData = await response.json();
      setResult(aiData);
    } catch (err: any) {
      console.error('AI Coach Error:', err);
      setError('AI Resume Coach is temporarily unavailable. Your resume and ATS score are still working.');
    } finally {
      setAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: AICoachSuggestion) => {
    const newData = { ...data };

    if (suggestion.section === 'summary' && suggestion.itemId === 'summary') {
      if (newData.summary?.trim() !== suggestion.originalText.trim()) {
        alert("This resume section has changed since this suggestion was generated. Please review it again.");
        return;
      }
      newData.summary = suggestion.suggestedText;
    } else if (suggestion.section === 'experience') {
      const idx = newData.experience.findIndex(e => e.id === suggestion.itemId);
      if (idx === -1 || newData.experience[idx].description?.trim() !== suggestion.originalText.trim()) {
        alert("This resume section has changed since this suggestion was generated. Please review it again.");
        return;
      }
      newData.experience[idx].description = suggestion.suggestedText;
    } else if (suggestion.section === 'projects') {
      const idx = newData.projects.findIndex(p => p.id === suggestion.itemId);
      if (idx === -1 || newData.projects[idx].description?.trim() !== suggestion.originalText.trim()) {
        alert("This resume section has changed since this suggestion was generated. Please review it again.");
        return;
      }
      newData.projects[idx].description = suggestion.suggestedText;
    } else {
      alert("Unknown suggestion target.");
      return;
    }

    onChange(newData);

    // Remove the applied suggestion from the UI
    if (result) {
      setResult({
        ...result,
        suggestions: result.suggestions.filter(s => s !== suggestion)
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
      default: return null;
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col mb-8 text-white border border-slate-700">
      <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-1 text-primary-400">
            <Bot className="w-6 h-6" />
            AI Resume Coach
          </h2>
          <p className="text-slate-400 text-sm">Get intelligent, factual suggestions to strengthen your wording.</p>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {analyzing ? 'Analyzing...' : result ? 'Re-analyze Resume' : 'Analyze Resume'}
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {!result && !error && !analyzing && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Ready to review your resume.
          </div>
        )}

        {analyzing && (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-primary-500" />
            <p>Analyzing your resume structure and wording...</p>
          </div>
        )}

        {result && !analyzing && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Overall Assessment */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Overall Assessment</h3>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-800 p-4 rounded-xl border border-slate-700">
                {result.overallAssessment}
              </p>
            </section>

            {/* Priority Improvements */}
            {result.sectionFeedback && result.sectionFeedback.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Priority Improvements</h3>
                <div className="space-y-3">
                  {result.sectionFeedback.map((fb, idx) => (
                    <div key={idx} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex gap-3 text-sm">
                      {getSeverityIcon(fb.severity)}
                      <div>
                        <div className="font-bold text-slate-200 capitalize">{fb.section}</div>
                        <div className="text-slate-400 mt-0.5">{fb.recommendation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Direct Suggestions</h3>
                <div className="space-y-4">
                  {result.suggestions.map((sug, idx) => (
                    <div key={idx} className="bg-slate-800 border border-slate-700 p-5 rounded-xl text-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="font-bold text-primary-400 capitalize flex items-center gap-2">
                          {sug.section} <ChevronRight className="w-3 h-3 text-slate-600" /> {sug.field}
                        </div>
                        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                          {sug.reason}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-900 p-3 rounded-lg border border-red-900/30">
                          <div className="text-xs font-bold text-red-400 mb-2">Current</div>
                          <p className="text-slate-400 line-through decoration-red-900/50">{sug.originalText}</p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-green-900/30">
                          <div className="text-xs font-bold text-green-400 mb-2">Suggested</div>
                          <p className="text-slate-200">{sug.suggestedText}</p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => applySuggestion(sug)}
                          className="px-4 py-2 bg-slate-700 hover:bg-primary-600 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Apply Suggestion
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
