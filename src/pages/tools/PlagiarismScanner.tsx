import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Github,
  FileCode,
  Download,
  Plus,
  Loader2,
  Zap,
  Eye,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface FlaggedIssue {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  location?: string;
}

interface ScanResult {
  integrityScore: number;
  originalityScore: number;
  codeQualityScore: number;
  verdict: 'PASS' | 'REVIEW NEEDED' | 'FAIL';
  preWrittenSignatures: string[];
  flaggedIssues: FlaggedIssue[];
  summary: string;
}

// Circular Progress Component
const CircularProgress = ({
  score,
  label,
  colorClass,
  size = 120,
}: {
  score: number;
  label: string;
  colorClass: string;
  size?: number;
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={colorClass}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center top-0 left-0 w-full h-full">
        <span className="text-3xl font-bold text-slate-800 dark:text-white">
          {score}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          {label}
        </span>
      </div>
    </div>
  );
};

// Severity Badge Component
const SeverityBadge = ({ severity }: { severity: FlaggedIssue['severity'] }) => {
  const styles = {
    Critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
    High: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
    Low: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  };

  return (
    <span
      className={cn(
        'px-2.5 py-1 text-xs font-semibold rounded-full border',
        styles[severity]
      )}
    >
      {severity}
    </span>
  );
};

export default function PlagiarismScanner() {
  const [activeTab, setActiveTab] = useState<'github' | 'code'>('github');
  const [inputData, setInputData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [rawTextResult, setRawTextResult] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleScan = async () => {
    if (!inputData.trim()) return;

    setIsScanning(true);
    setResult(null);
    setRawTextResult(null);

    try {
      const prompt = `Analyze this code/repository for:
1) Plagiarism indicators (copied patterns, common boilerplate vs original work)
2) Code quality score 0-100
3) Originality score 0-100
4) Pre-written code signatures (npm packages heavily used as core logic)
5) Specific flagged sections with severity (Critical/High/Medium/Low)
6) Overall integrity verdict (PASS / REVIEW NEEDED / FAIL).

Input:
${inputData}

Format your response as strictly valid JSON with this structure:
{
  "integrityScore": number,
  "originalityScore": number,
  "codeQualityScore": number,
  "verdict": "PASS" | "REVIEW NEEDED" | "FAIL",
  "preWrittenSignatures": string[],
  "flaggedIssues": [{ "severity": "Critical" | "High" | "Medium" | "Low", "description": string, "location": string }],
  "summary": string
}`;

      const key = import.meta.env.VITE_GEMINI_API_KEY;
      const res = await fetch(
        \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=\${key}\`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 3000 },
          }),
        }
      );

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Try parsing JSON
      let parsedJson = null;
      try {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (jsonMatch) {
          parsedJson = JSON.parse(jsonMatch[1]);
        } else {
          parsedJson = JSON.parse(text);
        }
        
        // Calculate a composite integrity score if missing
        if (!parsedJson.integrityScore) {
             parsedJson.integrityScore = Math.floor((parsedJson.originalityScore + parsedJson.codeQualityScore) / 2);
        }

        setResult(parsedJson);
      } catch (e) {
        console.error('Failed to parse AI response as JSON:', e);
        setRawTextResult(text);
      }
    } catch (error) {
      console.error('Error scanning code:', error);
      setRawTextResult('An error occurred while connecting to the AI scanning service.');
    } finally {
      setIsScanning(false);
    }
  };

  const getColorForScore = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'PASS':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'REVIEW NEEDED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'FAIL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 sm:p-12 shadow-xl shadow-indigo-500/25">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Shield size={240} className="transform rotate-12" />
          </div>
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 text-white mb-6"
            >
              <Zap size={16} />
              <span className="text-sm font-medium tracking-wide">Powered by Gemini AI</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4"
            >
              AI Code Integrity Scanner
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-indigo-100 text-lg sm:text-xl max-w-2xl"
            >
              Analyze project submissions for plagiarism, code quality, and originality. Ensure fair play with deep AI-powered static analysis.
            </motion.p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/10 overflow-hidden">
              <div className="flex border-b border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setActiveTab('github')}
                  className={cn(
                    'flex-1 py-4 flex items-center justify-center space-x-2 text-sm font-medium transition-colors',
                    activeTab === 'github'
                      ? 'bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  )}
                >
                  <Github size={18} />
                  <span>GitHub URL</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={cn(
                    'flex-1 py-4 flex items-center justify-center space-x-2 text-sm font-medium transition-colors',
                    activeTab === 'code'
                      ? 'bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  )}
                >
                  <FileCode size={18} />
                  <span>Paste Code</span>
                </button>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'github' ? (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Repository URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://github.com/user/repo"
                          value={inputData}
                          onChange={(e) => setInputData(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Source Code
                        </label>
                        <textarea
                          placeholder="Paste source code here..."
                          rows={8}
                          value={inputData}
                          onChange={(e) => setInputData(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-none"
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <button
                  onClick={handleScan}
                  disabled={!inputData.trim() || isScanning}
                  className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Eye size={20} />
                      <span>Scan Code</span>
                    </>
                  )}
                </button>

                {/* Compare Mode Button */}
                <button
                  className="w-full mt-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add Another Submission</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2">
            {isScanning ? (
              <div className="h-full min-h-[400px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-8 overflow-hidden relative">
                {/* CSS Scanning Animation Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="h-full w-full bg-[linear-gradient(transparent_0%,rgba(99,102,241,0.5)_50%,transparent_100%)] animate-[scan_2s_ease-in-out_infinite]" style={{ backgroundSize: '100% 200%' }} />
                </div>
                
                <Loader2 className="animate-spin text-indigo-500 mb-6" size={48} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Codebase</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                  Gemini AI is performing deep static analysis, checking for code overlaps, boilerplate signatures, and structural plagiarism...
                </p>
                <div className="mt-8 flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-8 bg-indigo-500 rounded-full"
                      animate={{ height: ['32px', '64px', '32px'] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            ) : result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Verdict Banner */}
                <div className={cn("rounded-2xl p-6 border flex items-center justify-between", getVerdictStyle(result.verdict))}>
                  <div className="flex items-center space-x-4">
                    {result.verdict === 'PASS' ? (
                      <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={32} />
                    ) : result.verdict === 'FAIL' ? (
                      <XCircle className="text-red-600 dark:text-red-400" size={32} />
                    ) : (
                      <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={32} />
                    )}
                    <div>
                      <h3 className="text-lg font-bold">Overall Verdict: {result.verdict}</h3>
                      <p className="text-sm opacity-90 mt-1">{result.summary}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
                  >
                    <Download size={20} />
                  </button>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center shadow-lg shadow-slate-200/20 dark:shadow-none">
                    <CircularProgress
                      score={result.integrityScore}
                      label="Integrity Score"
                      colorClass={getColorForScore(result.integrityScore)}
                    />
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center shadow-lg shadow-slate-200/20 dark:shadow-none">
                    <CircularProgress
                      score={result.originalityScore}
                      label="Originality"
                      colorClass={getColorForScore(result.originalityScore)}
                    />
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center shadow-lg shadow-slate-200/20 dark:shadow-none">
                    <CircularProgress
                      score={result.codeQualityScore}
                      label="Code Quality"
                      colorClass={getColorForScore(result.codeQualityScore)}
                    />
                  </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Flagged Issues */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-200/20 dark:shadow-none">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                      <AlertTriangle size={18} className="text-orange-500" />
                      <span>Flagged Issues</span>
                    </h4>
                    {result.flaggedIssues.length > 0 ? (
                      <div className="space-y-4">
                        {result.flaggedIssues.map((issue, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-start mb-2">
                              <SeverityBadge severity={issue.severity} />
                              {issue.location && (
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                                  {issue.location}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {issue.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-slate-500 dark:text-slate-400">
                        <CheckCircle size={32} className="text-emerald-500 mb-2 opacity-50" />
                        <p>No critical issues found</p>
                      </div>
                    )}
                  </div>

                  {/* Boilerplate Signatures */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-200/20 dark:shadow-none">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                      <BarChart3 size={18} className="text-indigo-500" />
                      <span>Detected Signatures</span>
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Common frameworks or boilerplates identified in the codebase:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.preWrittenSignatures.length > 0 ? (
                        result.preWrittenSignatures.map((sig, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-lg text-sm font-medium"
                          >
                            {sig}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400 italic">None detected</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : rawTextResult ? (
               <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 h-full shadow-lg"
              >
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Scan Results</h3>
                 <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300">
                   <pre className="whitespace-pre-wrap bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-xs overflow-auto">
                     {rawTextResult}
                   </pre>
                 </div>
               </motion.div>
            ) : (
              <div className="h-full min-h-[400px] bg-slate-100/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-8">
                <Upload size={48} className="mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2 text-slate-700 dark:text-slate-300">Ready to Scan</h3>
                <p className="text-center max-w-md">
                  Enter a GitHub URL or paste code on the left, then click 'Scan Code' to begin AI analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Report Modal */}
      <AnimatePresence>
        {showExportModal && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Export Report</h3>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-white/10 whitespace-pre-wrap text-slate-800 dark:text-slate-300">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes scan {
          0% { background-position: 0% -100%; }
          100% { background-position: 0% 200%; }
        }
      `}</style>
    </div>
  );
}
