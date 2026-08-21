import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Clock, 
  Flame, 
  RefreshCw, 
  AlertCircle,
  Trophy,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { DailyCoachTask, CoachGenerationResponse } from '../types/coach';

const CATEGORY_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  learning: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  hackathon: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  resume: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  coding: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  github: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  team: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  project: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  career: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' }
};

const PRIORITY_BADGES: Record<string, { label: string, color: string }> = {
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600' }
};

export function DailyCoach() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyCoachTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    if (user) {
      loadOrCreateTasks();
      calculateStreak();
    }
  }, [user]);

  const calculateStreak = async () => {
    try {
      if (!user) return;
      const { data } = await supabase
        .from('daily_coach_tasks')
        .select('task_date, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('task_date', { ascending: false });

      if (!data || data.length === 0) {
        setStreak(0);
        return;
      }

      // Find unique completed dates
      const completedDates = Array.from(new Set(data.map(d => d.task_date)));
      let currentStreak = 0;
      let checkDate = new Date();

      // Check if today or yesterday is completed
      const todayStr = checkDate.toISOString().split('T')[0];
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];

      let startDate = completedDates.includes(todayStr) 
        ? new Date() 
        : completedDates.includes(yesterdayStr) 
          ? checkDate 
          : null;

      if (!startDate) {
        setStreak(0);
        return;
      }

      let curr = new Date(startDate);
      while (true) {
        const dStr = curr.toISOString().split('T')[0];
        if (completedDates.includes(dStr)) {
          currentStreak++;
          curr.setDate(curr.getDate() - 1);
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (err) {
      console.error('Streak calculation error:', err);
    }
  };

  const loadOrCreateTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const todayStr = getTodayDateString();

      // 1. Try to load today's tasks directly from Supabase
      const { data: existingTasks, error: fetchError } = await supabase
        .from('daily_coach_tasks')
        .select('*')
        .eq('user_id', user!.id)
        .eq('task_date', todayStr)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.warn('Supabase local fetch error:', fetchError.message);
      }

      if (existingTasks && existingTasks.length > 0) {
        setTasks(existingTasks as DailyCoachTask[]);
        setIsLoading(false);
        return;
      }

      // 2. If no tasks, call the serverless generation endpoint
      setIsGenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        setIsGenerating(false);
        return;
      }

      const response = await fetch(`/api/ai/coach?date=${todayStr}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({ error: 'Request failed' }));
        console.error('Daily tasks generation failed:', {
          status: response.status,
          endpoint: '/api/ai/coach',
          message: errorJson.error || response.statusText
        });
        throw new Error(errorJson.error || 'Failed to generate daily tasks');
      }

      const responseData: CoachGenerationResponse = await response.json();
      if (responseData.tasks && responseData.tasks.length > 0) {
        setTasks(responseData.tasks);
      }
    } catch (err: any) {
      console.error('Daily Coach Error:', err);
      setError(err?.message || 'Failed to load daily tasks');
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const toggleTask = async (task: DailyCoachTask) => {
    try {
      const newStatus = !task.completed;
      // Optimistic update
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: newStatus } : t));

      const { error } = await supabase
        .from('daily_coach_tasks')
        .update({ 
          completed: newStatus,
          completed_at: newStatus ? new Date().toISOString() : null
        })
        .eq('id', task.id)
        .eq('user_id', user!.id);

      if (error) {
        console.error('Toggle task error:', error);
        // Revert
        setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !newStatus } : t));
      } else {
        calculateStreak();
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Daily AI Coach
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Action Plan
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized tasks tailored to your skills & hackathons
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{streak} Day Streak</span>
          </div>

          {/* Regenerate Button */}
          <button
            onClick={() => loadOrCreateTasks()}
            disabled={isLoading || isGenerating}
            title="Refresh action plan"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-primary-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
          <span className="text-slate-600">Today's Progress ({completedCount}/{tasks.length})</span>
          <span className="text-primary-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => loadOrCreateTasks()} 
            className="text-xs font-bold underline hover:no-underline ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-xs font-medium">Crafting your personalized hackathon action plan...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          <Trophy className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium">No tasks scheduled for today.</p>
          <button
            onClick={() => loadOrCreateTasks()}
            className="mt-3 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-xs font-bold hover:bg-primary-100 transition-colors"
          >
            Generate Today's Plan
          </button>
        </div>
      ) : (
        /* Task List */
        <div className="space-y-3">
          {tasks.map((task) => {
            const categoryStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.learning;
            const priorityStyle = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;

            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 group select-none ${
                  task.completed 
                    ? 'bg-slate-50/80 border-slate-200 opacity-60' 
                    : 'bg-white border-slate-200/90 hover:border-primary-300 hover:shadow-sm'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 flex-shrink-0 text-slate-400 group-hover:text-primary-600 transition-colors"
                  aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                      {task.category}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priorityStyle.color}`}>
                      {priorityStyle.label}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />
                      {task.estimated_minutes} min
                    </span>
                  </div>

                  <h3 className={`text-sm font-semibold text-slate-800 leading-snug ${task.completed ? 'line-through text-slate-500' : ''}`}>
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer encouragement */}
      {!isLoading && tasks.length > 0 && completedCount === tasks.length && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-medium text-emerald-800">
          <span className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-600" />
            All goals completed for today! Keep up the momentum.
          </span>
        </div>
      )}
    </div>
  );
}

