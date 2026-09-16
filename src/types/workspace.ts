export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Workspace {
  id: string;
  user_id: string;
  hackathon_id: string;
  project_name: string | null;
  problem_statement: string | null;
  solution: string | null;
  tech_stack: string[];
  github_url: string | null;
  submission_deadline: string | null;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  hackathon?: {
    id: string;
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    mode?: string;
    image_url?: string;
  };
}

export interface WorkspaceTask {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkspacePayload {
  hackathon_id: string;
  project_name?: string;
  problem_statement?: string;
  solution?: string;
  tech_stack?: string[];
  github_url?: string;
  submission_deadline?: string;
}

export interface UpdateWorkspacePayload {
  project_name?: string | null;
  problem_statement?: string | null;
  solution?: string | null;
  tech_stack?: string[];
  github_url?: string | null;
  submission_deadline?: string | null;
  progress_percentage?: number;
}

export interface CreateTaskPayload {
  workspace_id: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assigned_to?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assigned_to?: string | null;
}
