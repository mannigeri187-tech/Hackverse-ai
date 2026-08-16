import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { DailyCoachTask, CoachGenerationResponse } from '../types/coach';
import { CheckCircle2, Circle, Flame, Sparkles, BookOpen, Code, Terminal, Users, Briefcase, FileText, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const CATEGORY_ICONS = {
  learning: BookOpen,
  hackathon: Flame,
  resume: FileText,
  coding: Code,
  github: Terminal,
  team: Users,
  project: Briefcase,
  career: Sparkles
};

export function DailyCoach() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyCoachTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  // We use the local date string "YYYY-MM-DD"
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (user) {
      loadOrCreateTasks();
      calculateStreak();
    }
  }, [user]);

  const calculateStreak = async () => {
    try {
      // Find all distinct dates where ALL tasks for that date are completed
      // A simple approximation for this requirement: count distinct completed task dates
      const { data, error } = await supabase
        .from('daily_coach_tasks')
        .select('task_date')
        .eq('user_id', user!.id)
        .eq('completed', true)
        .order('task_date', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setStreak(0);
        return;
      }
      
      const distinctDates = [...new Set(data.map(d => d.task_date))];
      let currentStreak = 0;
      let checkDate = new Date();
      
      for (let i = 0; i < distinctDates.length; i++) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (distinctDates.includes(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1); // move back one day
        } else {
          // If we missed today, allow yesterday to continue the streak
          if (i === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
            const yStr = checkDate.toISOString().split('T')[0];
            if (distinctDates.includes(yStr)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
              continue;
            }
          }
          break;
        }
      }
      setStreak(currentStreak);
    } catch (e) {
      console.error('Failed to calculate streak', e);
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

      if (fetchError) throw fetchError;

      if (existingTasks && existingTasks.length > 0) {
        setTasks(existingTasks as DailyCoachTask[]);
        setIsLoading(false);
        return;
      }

      // 2. If no tasks, call the serverless generation endpoint
      setIsGenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const response = await fetch(`/api/ai/coach?date=${todayStr}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate daily tasks');
      }

      const responseData: CoachGenerationResponse = await response.json();
      if (responseData.tasks) {
        setTasks(responseData.tasks);
      }
    } catch (err: any) {
      console.error('Daily Coach Error:', err);
      setError(err.message || 'Failed to load daily tasks');
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
        // Revert on error
        setTasks(tasks);
        throw error;
      }
      
      // Recalculate streak in background
      calculateStreak();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (isLoading && !isGenerating) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded border border-slate-100"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
      
      {/* Left Sidebar - Progress */}
      <div className="md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">GOOD MORNING 👋</h2>
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Your goals for today</h3>
          
          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-600">Today's Progress</span>
              <span className="text-sm font-bold text-slate-900">{completedCount} / {tasks.length} completed</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center space-x-3 p-4 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
          <Flame className="w-8 h-8" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wide opacity-80">Streak</div>
            <div className="text-xl font-bold">{streak} {streak === 1 ? 'day' : 'days'}</div>
          </div>
        </div>
      </div>

      {/* Right Content - Tasks */}
      <div className="md:w-2/3 p-6">
        {error ? (
          <div className="flex items-center text-red-500 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Generating your personalized daily plan...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No tasks generated for today.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = CATEGORY_ICONS[task.category] || Sparkles;
              return (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task)}
                  className={cn(
                    "flex items-start p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm",
                    task.completed 
                      ? "bg-slate-50 border-slate-200 opacity-60" 
                      : "bg-white border-slate-200 hover:border-primary-300"
                  )}
                >
                  <button className="flex-shrink-0 mt-0.5 mr-4 focus:outline-none">
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-primary-400" />
                    )}
                  </button>
                  <div className="flex-grow">
                    <h4 className={cn("font-bold text-slate-900 mb-1", task.completed && "line-through text-slate-500")}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-slate-500 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-3 text-xs font-medium">
                      <span className="flex items-center text-slate-500">
                        <Icon className="w-3.5 h-3.5 mr-1" />
                        <span className="capitalize">{task.category}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{task.estimated_minutes} min</span>
                      <span className="text-slate-300">•</span>
                      <span className={cn(
                        "uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full",
                        task.priority === 'high' ? "bg-red-100 text-red-700" :
                        task.priority === 'medium' ? "bg-orange-100 text-orange-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
