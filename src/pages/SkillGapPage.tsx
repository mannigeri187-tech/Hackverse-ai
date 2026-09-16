import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Trash2, 
  Check, 
  Layers, 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  BarChart3, 
  Award,
  BrainCircuit,
  Clock,
  Code,
  Rocket
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSkillGap } from '../hooks/useSkillGap';
import type { 
  Skill, 
  UserSkill, 
  SkillGapResult, 
  SkillProficiency, 
  SkillCategory,
  AILearningPlanResponse 
} from '../types/skillGap';

export default function SkillGapPage() {
  const { user } = useAuth();
  const { 
    loading: analysisLoading, 
    error: analysisError, 
    aiPlanLoading,
    aiPlanError,
    getUserSkills, 
    analyzeSkillGap, 
    generateAILearningPlan,
    setUserSkill, 
    removeUserSkill, 
    getAllSkills 
  } = useSkillGap();

  // State
  const [hackathons, setHackathons] = useState<{ id: string; title: string; mode?: string; description?: string }[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [hackathonsLoading, setHackathonsLoading] = useState<boolean>(true);

  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [analysisResult, setAnalysisResult] = useState<SkillGapResult | null>(null);
  const [aiLearningPlan, setAiLearningPlan] = useState<AILearningPlanResponse | null>(null);

  // Skill modal / adding state
  const [isAddSkillOpen, setIsAddSkillOpen] = useState<boolean>(false);
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState<string>('');
  const [selectedProficiency, setSelectedProficiency] = useState<SkillProficiency>('intermediate');
  const [isSavingSkill, setIsSavingSkill] = useState<boolean>(false);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Initial Load: Fetch Hackathons, User Skills, Catalog Skills
  const loadInitialData = useCallback(async () => {
    setHackathonsLoading(true);
    try {
      // Fetch hackathons
      const { data: hackData } = await supabase
        .from('hackathons')
        .select('id, title, mode, description')
        .order('start_date', { ascending: true })
        .limit(30);

      if (hackData && hackData.length > 0) {
        setHackathons(hackData);
      }

      // Fetch user's skills
      const uSkills = await getUserSkills();
      setUserSkills(uSkills);

      // Fetch skill catalog
      const allSkills = await getAllSkills();
      setAvailableSkills(allSkills);
    } catch (err) {
      console.error('Error loading initial skill gap data:', err);
    } finally {
      setHackathonsLoading(false);
    }
  }, [getUserSkills, getAllSkills]);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  // 2. Trigger Analysis when Hackathon Selection changes
  const runAnalysis = useCallback(async (hId: string) => {
    if (!hId) {
      setAnalysisResult(null);
      setAiLearningPlan(null);
      return;
    }
    setAiLearningPlan(null); // Reset AI plan on hackathon switch
    const result = await analyzeSkillGap(hId);
    setAnalysisResult(result);
  }, [analyzeSkillGap]);

  useEffect(() => {
    if (selectedHackathonId) {
      runAnalysis(selectedHackathonId);
    } else {
      setAnalysisResult(null);
      setAiLearningPlan(null);
    }
  }, [selectedHackathonId, runAnalysis]);

  // 3. User Skill Management Handlers
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillToAdd) return;

    setIsSavingSkill(true);
    const success = await setUserSkill(selectedSkillToAdd, selectedProficiency);
    if (success) {
      showToast('Skill added successfully!');
      setIsAddSkillOpen(false);
      setSelectedSkillToAdd('');
      setSelectedProficiency('intermediate');

      // Refresh user skills
      const updated = await getUserSkills();
      setUserSkills(updated);

      // Re-run analysis if hackathon is selected
      if (selectedHackathonId) {
        runAnalysis(selectedHackathonId);
      }
    }
    setIsSavingSkill(false);
  };

  const handleRemoveSkill = async (skillId: string) => {
    const success = await removeUserSkill(skillId);
    if (success) {
      showToast('Skill removed.');
      const updated = await getUserSkills();
      setUserSkills(updated);

      if (selectedHackathonId) {
        runAnalysis(selectedHackathonId);
      }
    }
  };

  // 4. AI Learning Plan Generator Action
  const handleGenerateLearningPlan = async () => {
    if (!analysisResult || analysisResult.missingSkills === 0) return;

    const currentHackathon = hackathons.find((h) => h.id === selectedHackathonId);
    const missing = analysisResult.skills.filter((s) => s.status === 'missing');
    const matched = analysisResult.skills.filter((s) => s.status === 'have');

    const plan = await generateAILearningPlan(
      currentHackathon?.title || 'Target Hackathon',
      currentHackathon?.description,
      missing,
      matched
    );

    if (plan) {
      setAiLearningPlan(plan);
    }
  };

  // 5. Category breakdown calculations
  const categoryStats = useMemo(() => {
    if (!analysisResult || analysisResult.skills.length === 0) return [];

    const map = new Map<SkillCategory, { matched: number; missing: number }>();

    analysisResult.skills.forEach((item) => {
      const cat = item.category;
      if (!map.has(cat)) {
        map.set(cat, { matched: 0, missing: 0 });
      }
      const current = map.get(cat)!;
      if (item.status === 'have') {
        current.matched++;
      } else {
        current.missing++;
      }
    });

    return Array.from(map.entries()).map(([category, stats]) => ({
      category,
      matched: stats.matched,
      missing: stats.missing,
      total: stats.matched + stats.missing,
    }));
  }, [analysisResult]);

  // Filter skills by status
  const matchedSkills = analysisResult?.skills.filter((s) => s.status === 'have') || [];
  const missingSkills = analysisResult?.skills.filter((s) => s.status === 'missing') || [];

  // Summary counts
  const requiredCount = analysisResult?.skills.filter((s) => s.importance === 'required').length || 0;
  const recommendedCount = analysisResult?.skills.filter((s) => s.importance === 'recommended').length || 0;

  // Unselected skills for modal dropdown
  const unassignedCatalogSkills = availableSkills.filter(
    (cs) => !userSkills.some((us) => us.skill_id === cs.id)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* 1. HERO HEADER */}
      <div className="bg-theme-dsa-8k text-white rounded-3xl p-7 sm:p-10 shadow-2xl border border-cyan-900/40 relative overflow-hidden glow-cyan">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            <Award className="w-3.5 h-3.5 text-cyan-400" /> AI Skill Gap &amp; DSA Roadmap Engine
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            Identify Missing Skills &amp; Generate Daily Study Plans
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
            Benchmark your current technical abilities against target hackathon judging requirements and generate structured study roadmaps.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setIsAddSkillOpen(true)}
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Manage My Skills ({userSkills.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. HACKATHON SELECTOR */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <label htmlFor="hackathon-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Select a Hackathon
            </label>
            <p className="text-xs text-slate-500">Pick an event to compare required technologies with your profile.</p>
          </div>
        </div>

        <div className="w-full md:max-w-md">
          {hackathonsLoading ? (
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
          ) : (
            <select
              id="hackathon-select"
              value={selectedHackathonId}
              onChange={(e) => setSelectedHackathonId(e.target.value)}
              className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Select a hackathon to analyze --</option>
              {hackathons.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title} {h.mode ? `(${h.mode})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 3. ANALYSIS OUTPUT OR EMPTY / LOADING STATES */}
      {!selectedHackathonId ? (
        /* Empty State 1: No Hackathon Selected */
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center py-16 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">Select a hackathon to analyze your skills.</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Choose an upcoming hackathon above to run real-time skill matching and identify your priority learning goals.
          </p>
        </div>
      ) : analysisLoading ? (
        /* Loading State */
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Analyzing your skills...</h3>
          <p className="text-slate-500 text-xs">Comparing your profile against hackathon technical requirements.</p>
        </div>
      ) : analysisError ? (
        /* Error State */
        <div className="bg-white p-8 rounded-2xl border border-red-200 text-center py-12 space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Unable to analyze this hackathon. Please try again.</h3>
          <p className="text-xs text-red-500">{analysisError}</p>
        </div>
      ) : analysisResult && analysisResult.totalRequiredSkills === 0 ? (
        /* Empty State 2: No Requirements on Hackathon */
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center py-16 space-y-4">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">This hackathon has no skill requirements available yet.</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            The organizer has not tagged required technical stacks for this event. You can still prepare with your general skills!
          </p>
        </div>
      ) : analysisResult ? (
        /* Active Analysis Results Layout */
        <div className="space-y-8">
          {/* 4. PROMINENT MATCH SCORE & PROGRESS VISUALIZATION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 flex items-center gap-1.5 mb-1">
                  <Award className="w-4 h-4" /> Hackathon Skill Match
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                  {analysisResult.completionPercentage}% Match
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {analysisResult.completionPercentage === 100
                    ? "You're fully matched for this hackathon."
                    : analysisResult.completionPercentage === 0
                    ? 'No matching skills yet.'
                    : `You match ${analysisResult.skillsUserHas} of ${analysisResult.totalRequiredSkills} required technical areas.`}
                </p>
              </div>

              {/* Match Score Badge */}
              <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Skills Matched</span>
                  <span className="text-lg font-black text-slate-900">
                    {analysisResult.skillsUserHas} <span className="text-slate-400 font-normal">/ {analysisResult.totalRequiredSkills}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Compatibility Progress</span>
                <span className="text-primary-600 font-black">{analysisResult.completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    analysisResult.completionPercentage >= 70
                      ? 'bg-emerald-500'
                      : analysisResult.completionPercentage >= 40
                      ? 'bg-amber-500'
                      : 'bg-primary-600'
                  }`}
                  style={{ width: `${analysisResult.completionPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* 5. SUMMARY METRIC CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Skills You Have</div>
                <div className="text-2xl font-black text-emerald-950 mt-1">{analysisResult.skillsUserHas}</div>
              </div>

              <div className="p-4 bg-red-50/60 rounded-xl border border-red-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-red-700">Skills Missing</div>
                <div className="text-2xl font-black text-red-950 mt-1">{analysisResult.missingSkills}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Required Skills</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{requiredCount}</div>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Recommended Skills</div>
                <div className="text-2xl font-black text-blue-950 mt-1">{recommendedCount}</div>
              </div>
            </div>
          </div>

          {/* 6. CATEGORY BREAKDOWN SECTION */}
          {categoryStats.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                <h3 className="text-base font-bold text-slate-900">Skill Category Breakdown</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                {categoryStats.map((cat) => (
                  <div key={cat.category} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900">{cat.category}</span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {cat.matched}/{cat.total} Ready
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {cat.matched} matched
                      </span>
                      {cat.missing > 0 && (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {cat.missing} missing
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. SKILL MATCHING DETAILS GRID (YOU HAVE vs. SKILLS YOU NEED) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COLUMN 1: YOU HAVE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">You Have</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  {matchedSkills.length} Matched
                </span>
              </div>

              {matchedSkills.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-400 italic">No matching skills found for this hackathon.</p>
                  <button
                    onClick={() => setIsAddSkillOpen(true)}
                    className="text-xs font-bold text-primary-600 hover:underline"
                  >
                    + Add your skills
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {matchedSkills.map((item) => (
                    <div
                      key={item.skill_id}
                      className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{item.skill_name}</span>
                          <span className="text-[10px] font-extrabold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md uppercase">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 font-semibold capitalize flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Proficiency: {item.user_proficiency || 'Intermediate'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            item.importance === 'required'
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.importance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMN 2: SKILLS YOU NEED (MISSING) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Skills You Need</h3>
                </div>
                <span className="bg-red-100 text-red-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  {missingSkills.length} Missing
                </span>
              </div>

              {missingSkills.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">You have all the required skills for this event!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {missingSkills.map((item) => (
                    <div
                      key={item.skill_id}
                      className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{item.skill_name}</span>
                          <span className="text-[10px] font-extrabold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md uppercase">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium capitalize">
                          Importance: <strong className="text-slate-700">{item.importance}</strong>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            item.priority === 'high'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 8. AI LEARNING PLAN RECOMMENDATIONS SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">AI Learning Plan</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Customized, structured roadmap to learn missing technologies and optimize your preparation.
                </p>
              </div>

              {analysisResult.missingSkills > 0 && (
                <button
                  onClick={handleGenerateLearningPlan}
                  disabled={aiPlanLoading}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
                >
                  {aiPlanLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary-400" /> Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-primary-400" />
                      {aiLearningPlan ? 'Regenerate Plan' : 'Generate Learning Plan'}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error Message */}
            {aiPlanError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{aiPlanError}</span>
              </div>
            )}

            {/* Full Match State */}
            {analysisResult.completionPercentage === 100 ? (
              <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">You're fully matched for this hackathon!</h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Focus on strengthening your existing skills, prototyping project ideas, and coordinating with your team.
                </p>
              </div>
            ) : !aiLearningPlan && !aiPlanLoading ? (
              <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <BrainCircuit className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Ready to boost your hackathon readiness?</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click <strong>"Generate Learning Plan"</strong> to get a prioritized roadmap with realistic study hours, key topics, and practical exercises.
                </p>
              </div>
            ) : aiPlanLoading ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Crafting your tailored learning strategy...</h4>
                <p className="text-xs text-slate-400">Analyzing skill dependencies and practical implementation tasks.</p>
              </div>
            ) : aiLearningPlan ? (
              <div className="space-y-6">
                {/* Summary Box */}
                {aiLearningPlan.summary && (
                  <div className="p-4 bg-primary-50/70 border border-primary-100 rounded-xl text-xs text-primary-950 leading-relaxed font-medium">
                    {aiLearningPlan.summary}
                  </div>
                )}

                {/* Plan Recommendation Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {aiLearningPlan.learning_plan.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-primary-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Header: Skill Name & Priority */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                              Step {index + 1}
                            </span>
                            <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                              {item.skill}
                            </h4>
                          </div>

                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              item.priority === 'high'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                          </span>
                        </div>

                        {/* Why it matters */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                            Why:
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {item.reason}
                          </p>
                        </div>

                        {/* What to learn */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                            Learn:
                          </span>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {item.topics.map((topic, tIdx) => (
                              <li key={tIdx} className="flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-primary-600 flex-shrink-0 mt-0.5" />
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Estimated Time */}
                        <div className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-800">
                          <Clock className="w-4 h-4 text-primary-600" />
                          <span>Estimated Time: <strong className="text-primary-700">{item.estimated_hours}</strong></span>
                        </div>
                      </div>

                      {/* Bottom Box: Practice Task & Hackathon Application */}
                      <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                            <Code className="w-3.5 h-3.5 text-primary-600" /> Practice Task:
                          </span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {item.practice_task}
                          </p>
                        </div>

                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-[11px]">
                            <Rocket className="w-3.5 h-3.5 text-emerald-600" /> Hackathon Application:
                          </span>
                          <p className="text-emerald-800 text-[11px] leading-relaxed">
                            {item.hackathon_application}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* 9. USER SKILL MANAGEMENT DRAWER / MODAL */}
      {isAddSkillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-600" />
                <h3 className="text-base font-bold text-slate-900">Manage Your Skills</h3>
              </div>
              <button
                onClick={() => setIsAddSkillOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Add New Skill
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Skill</label>
                  <select
                    required
                    value={selectedSkillToAdd}
                    onChange={(e) => setSelectedSkillToAdd(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Choose skill --</option>
                    {unassignedCatalogSkills.map((cs) => (
                      <option key={cs.id} value={cs.id}>
                        {cs.name} ({cs.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Proficiency</label>
                  <select
                    value={selectedProficiency}
                    onChange={(e) => setSelectedProficiency(e.target.value as SkillProficiency)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedSkillToAdd || isSavingSkill}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                {isSavingSkill ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add Skill to Profile
              </button>
            </form>

            {/* Existing User Skills List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Your Current Skills ({userSkills.length})
              </span>

              {userSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  You haven't added any skills yet. Select a skill above to start.
                </p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {userSkills.map((us) => (
                    <div
                      key={us.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 mr-2">{us.skill?.name || 'Skill'}</span>
                        <span className="text-[10px] text-slate-400 capitalize">({us.proficiency})</span>
                      </div>

                      <button
                        onClick={() => handleRemoveSkill(us.skill_id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddSkillOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
