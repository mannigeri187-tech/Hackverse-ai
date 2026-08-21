export interface DailyCoachTask {
  id: string;
  user_id: string;
  task_date: string;
  title: string;
  description: string | null;
  category: 'learning' | 'hackathon' | 'resume' | 'coding' | 'github' | 'team' | 'project' | 'career';
  estimated_minutes: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completed_at: string | null;
  related_hackathon_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachGenerationResponse {
  source: 'database' | 'gemini';
  tasks: DailyCoachTask[];
  error?: string;
}
