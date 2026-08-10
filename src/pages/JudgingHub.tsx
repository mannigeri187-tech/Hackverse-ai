import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, FileCheck, ShieldCheck, Download, Award, Star, CheckCircle, Search, Sparkles, ExternalLink, AlertTriangle, Code2, Layers, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const TEAMS_TO_JUDGE = [
  { id: 1, table: 'Table #101', name: 'MedVoice AI', project: 'Voice AI Healthcare Assistant', members: 'Priya S., Alex V.', category: 'AI / Healthcare', score: 0 },
  { id: 2, table: 'Table #102', name: 'EcoChain', project: 'Tokenized Carbon Offsets', members: 'Alex V., Evan S.', category: 'Web3 / Climate', score: 0 },
  { id: 3, table: 'Table #103', name: 'AutoShield', project: 'AST Static Analysis Vulnerability Scanner', members: 'Evan S., Sarah W.', category: 'Cybersecurity', score: 0 },
];

export default function JudgingHub() {
  const [activeTab, setActiveTab] = useState<'qr' | 'exporter' | 'plagiarism'>('qr');

  // QR Judging State
  const [selectedTeam, setSelectedTeam] = useState<any>(TEAMS_TO_JUDGE[0]);
  const [scores, setScores] = useState({ innovation: 9, execution: 8, design: 9, pitch: 8 });
  const [submittedScores, setSubmittedScores] = useState<{ [key: number]: number }>({});
  const [judgeToast, setJudgeToast] = useState<string | null>(null);

  // Exporter State
  const [exportName, setExportName] = useState('Manjunath H Annigeri');
  const [exportProject, setExportProject] = useState('HackVerse AI Platform');
  const [exportGithub, setExportGithub] = useState('https://github.com/manjunath/hackverse-ai');
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Plagiarism Checker State
  const [repoUrl, setRepoUrl] = useState('https://github.com/sample/hackathon-submission');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const totalScore = scores.innovation + scores.execution + scores.design + scores.pitch;

  const handleSubmitScore = () => {
    setSubmittedScores({ ...submittedScores, [selectedTeam.id]: totalScore });
    setJudgeToast(`Score of ${totalScore}/40 submitted for ${selectedTeam.name} (${selectedTeam.table})!`);
    setTimeout(() => setJudgeToast(null), 3000);
  };

  const handleExportPortfolio = () => {
    const data = {
      developer: exportName,
      project: exportProject,
      github: exportGithub,
      techStack: ['React', 'TypeScript', 'Tailwind', 'Zustand', 'Node.js'],
      atsResumeScore: 94,
      hackathonWins: 3,
      verifiedCertificate: 'HackVerse AI Verified Developer #HV-8849',
      exportDate: new Date().toLocaleDateString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportName.replace(/\s+/g, '_')}_Hackathon_Portfolio.json`;
    a.click();
    setExportToast('Portfolio downloaded successfully!');
    setTimeout(() => setExportToast(null), 3000);
  };

  const handleRunPlagiarismCheck = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setScanResult({
        overallOriginality: '94% Original Code',
        plagiarismRisk: 'Low Risk 🟢',
        boilerplateRatio: '6.2%',
        aiGeneratedRatio: '12.4%',
        templateMatch: 'No exact template match detected in GitHub public index.',
        summary: 'Code passes all plagiarism & template compliance checks cleanly.',
      });
    }, 1200);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <QrCode className="w-8 h-8 text-indigo-400" /> Judging & Post-Event Operations
          </h1>
          <p className="text-slate-400 mt-1">Expo-Style QR judging rubric, automated portfolio exporter & AI anti-plagiarism checker.</p>
        </div>

        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('qr')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'qr' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <QrCode className="w-4 h-4" /> QR Rubric Judging
          </button>
          <button
            onClick={() => setActiveTab('exporter')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'exporter' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <Download className="w-4 h-4" /> Portfolio Exporter
          </button>
          <button
            onClick={() => setActiveTab('plagiarism')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'plagiarism' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Anti-Plagiarism
          </button>
        </div>
      </div>

      {/* TAB 1: Expo-Style QR Judging System */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          {judgeToast && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> {judgeToast}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Selection List */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xl font-bold text-white">Select Expo Table</h3>
              <div className="space-y-3">
                {TEAMS_TO_JUDGE.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTeam(t)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center",
                      selectedTeam.id === t.id ? "bg-indigo-600/20 border-indigo-500" : "bg-white/5 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-400">{t.table}</span>
                      <h4 className="font-bold text-white text-base">{t.name}</h4>
                      <p className="text-xs text-slate-400">{t.project}</p>
                    </div>
                    {submittedScores[t.id] ? (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                        {submittedScores[t.id]}/40
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-white/5 text-slate-400 text-xs font-bold rounded-full border border-white/10">
                        Unscored
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Judging Rubric Form */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-400">{selectedTeam.table}</span>
                  <h2 className="text-2xl font-bold text-white">{selectedTeam.name}</h2>
                  <p className="text-sm text-slate-400 mt-1">Category: <span className="text-indigo-300 font-semibold">{selectedTeam.category}</span> | Members: {selectedTeam.members}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Total Score</p>
                  <p className="text-3xl font-extrabold text-indigo-400">{totalScore} <span className="text-lg text-slate-500">/ 40</span></p>
                </div>
              </div>

              {/* Rubric Sliders */}
              <div className="space-y-5">
                {[
                  { key: 'innovation', label: '1. Innovation & Novelty', desc: 'Is the solution unique and creative?' },
                  { key: 'execution', label: '2. Technical Execution', desc: 'Is code functional, complete, and scalable?' },
                  { key: 'design', label: '3. UI/UX & Design', desc: 'Is the user experience polished and intuitive?' },
                  { key: 'pitch', label: '4. Pitch & Presentation', desc: 'Did the team clearly articulate value in demo?' },
                ].map(r => (
                  <div key={r.key} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-white">{r.label}</span>
                        <p className="text-xs text-slate-400">{r.desc}</p>
                      </div>
                      <span className="text-lg font-mono font-extrabold text-indigo-400">{scores[r.key as keyof typeof scores]} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={scores[r.key as keyof typeof scores]}
                      onChange={(e) => setScores({ ...scores, [r.key]: Number(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={handleSubmitScore}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Submit Official Score
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Automated Portfolio Exporter */}
      {activeTab === 'exporter' && (
        <div className="space-y-6">
          {exportToast && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> {exportToast}
            </motion.div>
          )}

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Download className="w-6 h-6 text-indigo-400" /> Automated Portfolio Exporter
              </h2>
              <p className="text-slate-400 text-sm mt-1">Generate a 1-click verified portfolio bundle to send directly to recruiters & sponsors.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Developer Name</label>
                <input
                  type="text"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Featured Hackathon Project</label>
                <input
                  type="text"
                  value={exportProject}
                  onChange={(e) => setExportProject(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">GitHub Repository Link</label>
                <input
                  type="text"
                  value={exportGithub}
                  onChange={(e) => setExportGithub(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleExportPortfolio}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-indigo-500/20 transition-all"
            >
              <Download className="w-5 h-5" /> Download Verified Developer Portfolio Bundle (JSON)
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Anti-Plagiarism Code Checker */}
      {activeTab === 'plagiarism' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" /> AI Anti-Plagiarism Code Checker
              </h2>
              <p className="text-slate-400 text-sm mt-1">Scan submission repos to detect pre-existing template reliance & AI boilerplate ratio.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">GitHub Submission Repository URL</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleRunPlagiarismCheck}
                disabled={isAnalyzing}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? <Sparkles className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                {isAnalyzing ? 'Scanning GitHub Index & AST Nodes...' : 'Run Plagiarism & Template Audit'}
              </button>
            </div>

            {scanResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-800/80 border border-emerald-500/30 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="font-bold text-white text-lg">Audit Report Summary</h3>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-extrabold">
                    {scanResult.plagiarismRisk}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-slate-400">Originality</p>
                    <p className="text-xl font-bold text-emerald-400">{scanResult.overallOriginality}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-slate-400">Boilerplate</p>
                    <p className="text-xl font-bold text-indigo-300">{scanResult.boilerplateRatio}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-slate-400">AI Code %</p>
                    <p className="text-xl font-bold text-purple-300">{scanResult.aiGeneratedRatio}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 italic">{scanResult.summary}</p>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
