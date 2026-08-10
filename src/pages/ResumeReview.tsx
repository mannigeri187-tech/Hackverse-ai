import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, Star, ArrowRight, Percent, FileUp, X, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function ResumeReview() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [analysis, setAnalysis] = useState<{
    score: number;
    metrics: { name: string; score: number; feedback: string; icon: any }[];
    strengths: string[];
    weaknesses: string[];
    suggestions: { text: string; priority: 'high' | 'medium' | 'low' }[];
  } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    setFile(file);
    setIsUploading(true);
    
    // Simulate AI Analysis
    setTimeout(() => {
      setAnalysis({
        score: 72,
        metrics: [
          { name: 'Formatting', score: 85, feedback: 'Clean layout, good use of whitespace.', icon: FileText },
          { name: 'Grammar', score: 90, feedback: 'No major grammatical errors found.', icon: CheckCircle },
          { name: 'ATS Compatibility', score: 65, feedback: 'Missing key standard section headers.', icon: Activity },
          { name: 'Keywords', score: 60, feedback: 'Low density of industry-specific terms.', icon: Star },
          { name: 'Projects', score: 75, feedback: 'Good descriptions, lacking GitHub links.', icon: Code2 },
          { name: 'Skills', score: 80, feedback: 'Relevant skills listed, could be categorized.', icon: Zap }
        ],
        strengths: [
          'Strong educational background highlighted.',
          'Action verbs used at the beginning of bullet points.',
          'Consistent typography and readable font size.'
        ],
        weaknesses: [
          'Lack of quantifiable metrics in experience.',
          'Missing links to live project demos or code repositories.',
          'Summary section is too generic and passive.'
        ],
        suggestions: [
          { text: 'Add specific numbers to experience (e.g., "Improved performance by X%").', priority: 'high' },
          { text: 'Rename "Things I Built" to "Projects" for better ATS parsing.', priority: 'high' },
          { text: 'Include a link to your LinkedIn profile in the header.', priority: 'medium' },
          { text: 'Group skills into categories (Languages, Frameworks, Tools).', priority: 'low' }
        ]
      });
      setIsUploading(false);
    }, 2500);
  };

  const resetUpload = () => {
    setFile(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">AI Resume Review</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload your resume and get instant, actionable feedback to improve your chances of passing ATS and impressing recruiters.
          </p>
        </div>

        {!analysis && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300",
              isDragging 
                ? "border-indigo-500 bg-indigo-500/10" 
                : "border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
              <FileUp className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Upload your resume (PDF)</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Drag and drop your file here, or click to browse</p>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
              Select File
            </button>
          </motion.div>
        )}

        {isUploading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Analyzing Resume...</h3>
            <p className="text-slate-500 dark:text-slate-400">Our AI is parsing your experience, skills, and formatting.</p>
          </div>
        )}

        {analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Header / Score */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full"></div>
              
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none" className="text-slate-100 dark:text-slate-800" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none" strokeDasharray="439.8" strokeDashoffset={439.8 - (439.8 * analysis.score) / 100} className={cn("transition-all duration-1500 ease-out", analysis.score > 80 ? "text-emerald-500" : analysis.score > 60 ? "text-amber-500" : "text-red-500")} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-800 dark:text-white">{analysis.score}</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Score</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left z-10">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Analysis Complete</h2>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold uppercase">
                    {file?.name}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Your resume has some strong points, but requires optimization to pass ATS filters and stand out to technical recruiters.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Link to="/resume-builder" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Improve with AI
                  </Link>
                  <button onClick={resetUpload} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors flex items-center gap-2">
                    <X className="w-5 h-5" /> Analyze Another
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.metrics.map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white">{metric.name}</h3>
                      </div>
                      <span className={cn("font-bold text-lg", metric.score >= 80 ? "text-emerald-500" : metric.score >= 60 ? "text-amber-500" : "text-red-500")}>
                        {metric.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-3">
                      <div className={cn("h-1.5 rounded-full", metric.score >= 80 ? "bg-emerald-500" : metric.score >= 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${metric.score}%` }}></div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{metric.feedback}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths & Weaknesses */}
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> Strengths
                  </h3>
                  <ul className="space-y-3">
                    {analysis.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-500" /> Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {analysis.weaknesses.map((weak, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Suggestions */}
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-indigo-500" /> Action Plan
                </h3>
                <div className="space-y-4">
                  {analysis.suggestions.map((sug, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className={cn(
                        "px-2 py-1 text-[10px] font-bold uppercase rounded mt-0.5 shrink-0",
                        sug.priority === 'high' ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                        sug.priority === 'medium' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                      )}>
                        {sug.priority}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{sug.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Icons
const Activity = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const Code2 = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
const Zap = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
