import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type {
  Workspace,
  WorkspaceTask,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskStatus,
  TaskPriority,
} from '../types/workspace';

export function useWorkspaces(workspaceId?: string) {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to recalculate and persist progress percentage for a workspace
  const syncWorkspaceProgress = useCallback(async (targetWorkspaceId: string, currentTasks: WorkspaceTask[]) => {
    if (!targetWorkspaceId) return;

    const total = currentTasks.length;
    const completed = currentTasks.filter((t) => t.status === 'completed').length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Update local state immediately
    setCurrentWorkspace((prev) => (prev && prev.id === targetWorkspaceId ? { ...prev, progress_percentage: percentage } : prev));
    setWorkspaces((prev) => prev.map((w) => (w.id === targetWorkspaceId ? { ...w, progress_percentage: percentage } : w)));

    // Persist to Supabase
    try {
      await supabase
        .from('workspaces')
        .update({ progress_percentage: percentage })
        .eq('id', targetWorkspaceId);
    } catch (err) {
      console.error('Error syncing workspace progress:', err);
    }
  }, []);

  // 1. Fetch all workspaces for the authenticated user
  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('workspaces')
        .select(`
          *,
          hackathon:hackathons (
            id,
            title,
            description,
            start_date,
            end_date,
            location,
            mode,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      setWorkspaces((data || []) as Workspace[]);
    } catch (err: any) {
      console.error('Error fetching workspaces:', err.message);
      setError(err.message || 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 2. Fetch a specific workspace by ID
  const fetchWorkspaceById = useCallback(async (id: string) => {
    if (!user || !id) {
      setCurrentWorkspace(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('workspaces')
        .select(`
          *,
          hackathon:hackathons (
            id,
            title,
            description,
            start_date,
            end_date,
            location,
            mode,
            image_url
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      const ws = data as Workspace | null;
      setCurrentWorkspace(ws);
      return ws;
    } catch (err: any) {
      console.error(`Error fetching workspace ${id}:`, err.message);
      setError(err.message || 'Failed to fetch workspace');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 3. Fetch tasks for a workspace and sync automatic progress
  const fetchTasks = useCallback(async (targetWorkspaceId: string) => {
    if (!user || !targetWorkspaceId) {
      setTasks([]);
      return [];
    }

    try {
      const { data, error: taskError } = await supabase
        .from('workspace_tasks')
        .select('*')
        .eq('workspace_id', targetWorkspaceId)
        .order('created_at', { ascending: true });

      if (taskError) throw taskError;
      const loadedTasks = (data || []) as WorkspaceTask[];
      setTasks(loadedTasks);

      // Auto calculate and sync progress percentage from loaded tasks
      const total = loadedTasks.length;
      const completed = loadedTasks.filter((t) => t.status === 'completed').length;
      const calculatedPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

      setCurrentWorkspace((prev) =>
        prev && prev.id === targetWorkspaceId ? { ...prev, progress_percentage: calculatedPercentage } : prev
      );

      return loadedTasks;
    } catch (err: any) {
      console.error(`Error fetching tasks for workspace ${targetWorkspaceId}:`, err.message);
      setError(err.message || 'Failed to fetch tasks');
      return [];
    }
  }, [user]);

  // 4. Create a new workspace for a hackathon
  const createWorkspace = async (payload: CreateWorkspacePayload): Promise<Workspace | null> => {
    if (!user) {
      setError('You must be signed in to create a workspace');
      return null;
    }

    setError(null);

    try {
      const insertData = {
        user_id: user.id,
        hackathon_id: payload.hackathon_id,
        project_name: payload.project_name || null,
        problem_statement: payload.problem_statement || null,
        solution: payload.solution || null,
        tech_stack: payload.tech_stack || [],
        github_url: payload.github_url || null,
        submission_deadline: payload.submission_deadline || null,
        progress_percentage: 0,
      };

      const { data, error: insertError } = await supabase
        .from('workspaces')
        .insert(insertData)
        .select(`
          *,
          hackathon:hackathons (
            id,
            title,
            description,
            start_date,
            end_date,
            location,
            mode,
            image_url
          )
        `)
        .single();

      if (insertError) {
        // Handle unique constraint (duplicate workspace for user + hackathon) gracefully
        if (insertError.code === '23505' || insertError.message.includes('unique')) {
          const { data: existing } = await supabase
            .from('workspaces')
            .select(`
              *,
              hackathon:hackathons (
                id,
                title,
                description,
                start_date,
                end_date,
                location,
                mode,
                image_url
              )
            `)
            .eq('user_id', user.id)
            .eq('hackathon_id', payload.hackathon_id)
            .single();

          if (existing) {
            return existing as Workspace;
          }
        }
        throw insertError;
      }

      const newWorkspace = data as Workspace;
      setWorkspaces((prev) => [newWorkspace, ...prev]);
      return newWorkspace;
    } catch (err: any) {
      console.error('Error creating workspace:', err.message);
      setError(err.message || 'Failed to create workspace');
      return null;
    }
  };

  // 5. Update workspace information
  const updateWorkspace = async (id: string, payload: UpdateWorkspacePayload): Promise<Workspace | null> => {
    if (!user) {
      setError('You must be signed in to update a workspace');
      return null;
    }

    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('workspaces')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          hackathon:hackathons (
            id,
            title,
            description,
            start_date,
            end_date,
            location,
            mode,
            image_url
          )
        `)
        .single();

      if (updateError) throw updateError;

      const updated = data as Workspace;
      setWorkspaces((prev) => prev.map((w) => (w.id === id ? updated : w)));
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(updated);
      }
      return updated;
    } catch (err: any) {
      console.error(`Error updating workspace ${id}:`, err.message);
      setError(err.message || 'Failed to update workspace');
      return null;
    }
  };

  // 6. Delete a workspace
  const deleteWorkspace = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('You must be signed in to delete a workspace');
      return false;
    }

    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      if (currentWorkspace?.id === id) {
        setCurrentWorkspace(null);
        setTasks([]);
      }
      return true;
    } catch (err: any) {
      console.error(`Error deleting workspace ${id}:`, err.message);
      setError(err.message || 'Failed to delete workspace');
      return false;
    }
  };

  // 7. Create a task in a workspace & recalculate progress
  const createTask = async (payload: CreateTaskPayload): Promise<WorkspaceTask | null> => {
    if (!user) {
      setError('You must be signed in to create a task');
      return null;
    }

    setError(null);

    try {
      const taskData = {
        workspace_id: payload.workspace_id,
        title: payload.title,
        description: payload.description || null,
        status: payload.status || 'todo',
        priority: payload.priority || 'medium',
        due_date: payload.due_date || null,
        assigned_to: payload.assigned_to || null,
      };

      const { data, error: insertError } = await supabase
        .from('workspace_tasks')
        .insert(taskData)
        .select()
        .single();

      if (insertError) throw insertError;

      const newTask = data as WorkspaceTask;
      const updatedTaskList = [...tasks, newTask];
      setTasks(updatedTaskList);

      // Auto-recalculate progress
      syncWorkspaceProgress(payload.workspace_id, updatedTaskList);

      return newTask;
    } catch (err: any) {
      console.error('Error creating workspace task:', err.message);
      setError(err.message || 'Failed to create task');
      return null;
    }
  };

  // 8. Update a task & recalculate progress
  const updateTask = async (taskId: string, payload: UpdateTaskPayload): Promise<WorkspaceTask | null> => {
    if (!user) {
      setError('You must be signed in to update a task');
      return null;
    }

    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('workspace_tasks')
        .update(payload)
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) throw updateError;

      const updated = data as WorkspaceTask;
      const updatedTaskList = tasks.map((t) => (t.id === taskId ? updated : t));
      setTasks(updatedTaskList);

      // Auto-recalculate progress
      if (updated.workspace_id) {
        syncWorkspaceProgress(updated.workspace_id, updatedTaskList);
      }

      return updated;
    } catch (err: any) {
      console.error(`Error updating task ${taskId}:`, err.message);
      setError(err.message || 'Failed to update task');
      return null;
    }
  };

  // 9. Delete a task & recalculate progress
  const deleteTask = async (taskId: string): Promise<boolean> => {
    if (!user) {
      setError('You must be signed in to delete a task');
      return false;
    }

    setError(null);

    try {
      const targetTask = tasks.find((t) => t.id === taskId);
      const targetWorkspaceId = targetTask?.workspace_id || workspaceId;

      const { error: deleteError } = await supabase
        .from('workspace_tasks')
        .delete()
        .eq('id', taskId);

      if (deleteError) throw deleteError;

      const updatedTaskList = tasks.filter((t) => t.id !== taskId);
      setTasks(updatedTaskList);

      // Auto-recalculate progress after deletion
      if (targetWorkspaceId) {
        syncWorkspaceProgress(targetWorkspaceId, updatedTaskList);
      }

      return true;
    } catch (err: any) {
      console.error(`Error deleting task ${taskId}:`, err.message);
      setError(err.message || 'Failed to delete task');
      return false;
    }
  };

  // 10. Change task status
  const changeTaskStatus = async (taskId: string, status: TaskStatus): Promise<WorkspaceTask | null> => {
    return updateTask(taskId, { status });
  };

  // 11. Change task priority
  const changeTaskPriority = async (taskId: string, priority: TaskPriority): Promise<WorkspaceTask | null> => {
    return updateTask(taskId, { priority });
  };

  // Initial load effect
  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceById(workspaceId);
      fetchTasks(workspaceId);
    } else if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setTasks([]);
      setLoading(false);
    }
  }, [user, workspaceId, fetchWorkspaceById, fetchTasks, fetchWorkspaces]);

  return {
    workspaces,
    currentWorkspace,
    tasks,
    loading,
    error,
    fetchWorkspaces,
    fetchWorkspaceById,
    fetchTasks,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    changeTaskPriority,
  };
}
