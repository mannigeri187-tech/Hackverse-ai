import { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Loader2, 
  Layers, 
  FolderGit2, 
  ExternalLink, 
  ShieldCheck, 
  FileCode2, 
  TrendingUp, 
  BookOpen, 
  ListChecks, 
  Star, 
  GitFork,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWorkspaces } from '../hooks/useWorkspaces';

interface GitHubAnalysisResult {
  repo_metadata?: {
    name: string;
    description: string;
    html_url: string;
    stars: number;
    forks: number;
    default_branch: string;
  };
  overview: string;
  tech_stack: string[];
  repository_structure: Array<{ folder: string; purpose: string }>;
  scores: {
    project_structure: number;
    documentation: number;
    code_organization: number;
    setup_experience: number;
    feature_completeness: number;
    demo_readiness: number;
    technical_quality: number;
    hackathon_readiness: number;
  };
  strengths: string[];
  issues: string[];
  missing_items: string[];
  improvements: string[];
  demo_checklist: string[];
  overall_score: number;
}

export default function GitHubAnalyzerPage() {
  const { workspaces, fetchWorkspaces } = useWorkspaces();

  // Repository input & state
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<GitHubAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load workspaces on mount to provide "Analyze Workspace Repository" quick options
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Find workspaces with GitHub URLs linked
  const workspacesWithGithub = workspaces.filter(w => w.github_url && w.github_url.includes('github.com'));

  // 1. Analyze Repository Handler
  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = (urlToAnalyze || repoUrl).trim();

    if (!targetUrl) {
      setErrorMessage('Enter a GitHub repository URL to begin.');
      return;
    }

    if (!targetUrl.includes('github.com/')) {
      setErrorMessage('Please enter a valid public GitHub repository URL (e.g. https://github.com/owner/repo).');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    if (urlToAnalyze) {
      setRepoUrl(urlToAnalyze);
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('Authentication session expired. Please sign in again.');
      }

      const res = await fetch('/api/ai/github-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          repoUrl: targetUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Unable to analyze this repository. Please try again.');
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Error analyzing GitHub repository:', err);
      setErrorMessage(err.message || 'Unable to analyze this repository. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. HERO HEADER */}
      <div className="bg-theme-shield text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-cyan-900/40 relative overflow-hidden glow-cyan">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" /> AI GitHub Repository Health Analyzer
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            Audit Code Quality, Structure & Demo Readiness
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed">
            Inspect public repository architecture, README clarity, file modularity, demo readiness, and judge evaluation rubrics in seconds.
          </p>
        </div>
      </div>

      {/* 2. REPOSITORY INPUT BOX */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="space-y-1">
          <label htmlFor="github-repo-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Public GitHub Repository URL
          </label>
          <p className="text-xs text-slate-500">
            Provide any public open-source or hackathon repository to analyze.
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <input
              id="github-repo-input"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/project-repo"
              disabled={isAnalyzing}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || !repoUrl.trim()}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-shrink-0"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Repository...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Repo</span>
              </>
            )}
          </button>
        </form>

        {/* Workspace Quick Links if available */}
        {workspacesWithGithub.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <FolderGit2 className="w-3.5 h-3.5 text-primary-600" /> Linked Workspaces:
            </span>
            {workspacesWithGithub.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => ws.github_url && handleAnalyze(ws.github_url)}
                disabled={isAnalyzing}
                className="px-2.5 py-1 bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 rounded-lg font-semibold text-[11px] transition-colors border border-slate-200"
              >
                {ws.project_name || 'Project'}
              </button>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* 3. LOADING STATE */}
      {isAnalyzing && (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Inspecting Repository Architecture</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Fetching file trees, analyzing README setup instructions, parsing package dependencies, and benchmarking against judging criteria...
            </p>
          </div>
        </div>
      )}

      {/* 4. EMPTY STATE */}
      {!isAnalyzing && !analysisResult && (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto">
            <FileCode2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Enter a GitHub repository URL to begin</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Get instant actionable feedback on missing configuration files, setup guides, code organization, and demo preparedness.
          </p>
        </div>
      )}

      {/* 5. ANALYSIS DASHBOARD */}
      {!isAnalyzing && analysisResult && (
        <div className="space-y-6 animate-in fade-in">
          {/* Repo Overview & Overall Score Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-slate-800" />
                  {analysisResult.repo_metadata?.name || 'GitHub Repository'}
                </h2>

                {analysisResult.repo_metadata?.html_url && (
                  <a
                    href={analysisResult.repo_metadata.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {analysisResult.overview}
              </p>

              {/* Repo Stats and Metadata */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                {analysisResult.repo_metadata && (
                  <>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Star className="w-3.5 h-3.5 text-amber-500" /> {analysisResult.repo_metadata.stars} stars
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <GitFork className="w-3.5 h-3.5 text-slate-500" /> {analysisResult.repo_metadata.forks} forks
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <GitBranch className="w-3.5 h-3.5 text-slate-500" /> {analysisResult.repo_metadata.default_branch}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Overall Readiness Score Display */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center min-w-[170px] flex-shrink-0 self-center md:self-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Hackathon Readiness
              </span>
              <div className="flex items-baseline gap-1 my-1">
                <span className={`text-4xl sm:text-5xl font-black ${getScoreColor(analysisResult.overall_score)}`}>
                  {analysisResult.overall_score}
                </span>
                <span className="text-sm font-bold text-slate-400">/100</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {analysisResult.overall_score >= 80 ? 'Demo Ready' : analysisResult.overall_score >= 60 ? 'Needs Polish' : 'Action Required'}
              </span>
            </div>
          </div>

          {/* Tech Stack & Detected Architecture */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary-600" /> Detected Tech Stack & Directory Structure
            </h3>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {analysisResult.tech_stack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Structure Mapping */}
            {analysisResult.repository_structure && analysisResult.repository_structure.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {analysisResult.repository_structure.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-mono text-xs font-bold text-primary-700 block">
                      📁 {item.folder}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {item.purpose}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 8-Metric Category Breakdown Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary-600" /> Category Quality Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {Object.entries(analysisResult.scores).map(([categoryKey, score]) => {
                const label = categoryKey
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase());

                return (
                  <div key={categoryKey} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">{label}</span>
                      <span className={getScoreColor(score)}>{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBarColor(score)} transition-all duration-500`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Issues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Detected Strengths
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysisResult.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Potential Issues & Missing Items */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Issues & Missing Files
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysisResult.issues.concat(analysisResult.missing_items || []).map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Improvements */}
          {analysisResult.improvements && analysisResult.improvements.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-primary-950 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary-600" /> Recommended Action Items
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {analysisResult.improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Demo Checklist */}
          {analysisResult.demo_checklist && analysisResult.demo_checklist.length > 0 && (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-emerald-600" /> Pre-Judging Demo Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800">
                {analysisResult.demo_checklist.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{check}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
