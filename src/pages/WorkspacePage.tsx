import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Rocket, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  GitBranch, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Users, 
  Save, 
  AlertCircle,
  FolderGit2,
  Code2,
  Lightbulb,
  Target,
  CheckSquare
} from 'lucide-react';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { TaskStatus, TaskPriority, WorkspaceTask } from '../types/workspace';

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    currentWorkspace,
    tasks,
    loading,
    error,
    updateWorkspace,
    deleteWorkspace,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
  } = useWorkspaces(id);

  // Form state for project info
  const [projectName, setProjectName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solution, setSolution] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');

  // Save status indicator
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Task creation modal / form state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkspaceTask | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');

  // Team members fetched from team_requests (accepted)
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; display_name: string; roles: string[] }>>([]);

  // AUTOMATIC PROGRESS CALCULATION: (completed / total * 100)
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const autoProgressPercentage = useMemo(() => {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasksCount / totalTasks) * 100);
  }, [totalTasks, completedTasksCount]);

  // Sync workspace details to local form state
  useEffect(() => {
    if (currentWorkspace) {
      setProjectName(currentWorkspace.project_name || '');
      setProblemStatement(currentWorkspace.problem_statement || '');
      setSolution(currentWorkspace.solution || '');
      setTechStackInput(currentWorkspace.tech_stack?.join(', ') || '');
      setGithubUrl(currentWorkspace.github_url || '');
      setSubmissionDeadline(
        currentWorkspace.submission_deadline
          ? new Date(currentWorkspace.submission_deadline).toISOString().slice(0, 16)
          : ''
      );
    }
  }, [currentWorkspace]);

  // Fetch accepted team requests for this hackathon to show real team members
  useEffect(() => {
    async function loadTeam() {
      if (!user || !currentWorkspace?.hackathon_id) return;
      try {
        const { data: requests } = await supabase
          .from('team_requests')
          .select('sender_id, receiver_id')
          .eq('hackathon_id', currentWorkspace.hackathon_id)
          .eq('status', 'accepted')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (requests && requests.length > 0) {
          const memberIds = requests.map((r: any) =>
            r.sender_id === user.id ? r.receiver_id : r.sender_id
          );

          if (memberIds.length > 0) {
            const { data: profiles } = await supabase
              .from('team_profiles')
              .select('user_id, display_name, preferred_roles')
              .in('user_id', memberIds);

            if (profiles) {
              setTeamMembers(
                profiles.map((p: any) => ({
                  id: p.user_id,
                  display_name: p.display_name || 'Team Member',
                  roles: p.preferred_roles || [],
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error('Error loading team members:', err);
      }
    }
    loadTeam();
  }, [user, currentWorkspace?.hackathon_id]);

  // Save project details handler
  const handleSaveProject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!id) return;

    setSaveStatus('saving');
    setSaveError(null);

    const techStackArray = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated = await updateWorkspace(id, {
      project_name: projectName.trim() || null,
      problem_statement: problemStatement.trim() || null,
      solution: solution.trim() || null,
      tech_stack: techStackArray,
      github_url: githubUrl.trim() || null,
      submission_deadline: submissionDeadline ? new Date(submissionDeadline).toISOString() : null,
      progress_percentage: autoProgressPercentage,
    });

    if (updated) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } else {
      setSaveStatus('error');
      setSaveError('Failed to save changes. Please try again.');
    }
  };

  // Task submit handler (create or edit)
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !taskTitle.trim()) return;

    if (editingTask) {
      await updateTask(editingTask.id, {
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
        status: taskStatus,
        priority: taskPriority,
        due_date: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        assigned_to: taskAssignedTo.trim() || null,
      });
    } else {
      await createTask({
        workspace_id: id,
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
        status: taskStatus,
        priority: taskPriority,
        due_date: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        assigned_to: taskAssignedTo.trim() || null,
      });
    }

    closeTaskModal();
  };

  const openCreateTaskModal = (defaultStatus: TaskStatus = 'todo') => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskStatus(defaultStatus);
    setTaskPriority('medium');
    setTaskDueDate('');
    setTaskAssignedTo('');
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: WorkspaceTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : '');
    setTaskAssignedTo(task.assigned_to || '');
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteWorkspace = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this workspace? All tasks will be permanently removed.')) {
      return;
    }
    const success = await deleteWorkspace(id);
    if (success) {
      navigate('/dashboard');
    }
  };

  // Deadline countdown calculation
  const getDeadlineText = () => {
    const deadlineStr = currentWorkspace?.submission_deadline || currentWorkspace?.hackathon?.end_date;
    if (!deadlineStr) return 'Deadline not available';

    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Deadline has passed';
    if (diffDays === 0) return 'Due today!';
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse py-8">
        <div className="h-40 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !currentWorkspace) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Workspace Not Found</h2>
        <p className="text-slate-600 mb-6 text-sm">
          This workspace does not exist or you do not have permission to view it.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/hackathons/${currentWorkspace.hackathon_id}`}
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Hackathon Details
        </Link>
        <button
          onClick={handleDeleteWorkspace}
          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Workspace
        </button>
      </div>

      {/* 1. WORKSPACE HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm text-primary-300 border border-white/10">
              <Rocket className="w-3.5 h-3.5" /> Workspace Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              <Clock className="w-3.5 h-3.5" /> {getDeadlineText()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            {currentWorkspace.hackathon?.title || 'Hackathon Workspace'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="font-medium text-slate-200">
              Project:{' '}
              <strong className="text-white font-bold">
                {currentWorkspace.project_name || 'Untitled Project'}
              </strong>
            </span>
          </div>

          {/* Automatic Progress Bar in Hero */}
          <div className="space-y-2 pt-2 max-w-md">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>Overall Progress ({completedTasksCount}/{totalTasks} Tasks)</span>
              <span className="text-primary-300 font-extrabold">{autoProgressPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${autoProgressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: PROJECT INFORMATION & DETAILS (2 cols on large screens) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Details Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Project Information</h2>
                  <p className="text-xs text-slate-500">Document your hackathon problem, architecture, and pitch</p>
                </div>
              </div>

              {/* Save Status Pill */}
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && (
                  <span className="text-xs font-medium text-slate-500 animate-pulse flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                    {saveError || 'Save Error'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveProject()}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-5">
              {/* Project Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-primary-600" /> Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. EcoRoute - Smart Carbon Navigation"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-slate-900"
                />
              </div>

              {/* Problem Statement */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-primary-600" /> Problem Statement
                </label>
                <textarea
                  rows={3}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="What core problem does your hackathon build address?"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
                />
              </div>

              {/* Solution */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-primary-600" /> Proposed Solution
                </label>
                <textarea
                  rows={3}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="How does your application uniquely solve this problem?"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
                />
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-primary-600" /> Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="React, TypeScript, Supabase, Tailwind, Python, FastAPI"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
                />
              </div>

              {/* GitHub Repository & Submission Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-primary-600" /> GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary-600" /> Submission Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={submissionDeadline}
                    onChange={(e) => setSubmissionDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Automatic Progress Display Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600" /> Auto-Calculated Progress
                  </span>
                  <span className="text-sm font-black text-emerald-600">
                    {autoProgressPercentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Calculated automatically from workspace tasks: <strong className="text-slate-800">{completedTasksCount}</strong> of <strong className="text-slate-800">{totalTasks}</strong> tasks completed ({autoProgressPercentage}%).
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${autoProgressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </form>
          </div>

          {/* 3. WORKSPACE TASK BOARD (KANBAN COLUMNS) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Sprint Tasks & Milestones</h2>
                <p className="text-xs text-slate-500">Tasks update workspace completion percentage automatically in real-time</p>
              </div>
              <button
                type="button"
                onClick={() => openCreateTaskModal('todo')}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>

            {/* Task Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* COLUMN 1: TODO */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-600 pb-1 border-b border-slate-200">
                  <span>To Do</span>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
                    {todoTasks.length}
                  </span>
                </div>

                {todoTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No pending tasks</p>
                ) : (
                  <div className="space-y-2.5">
                    {todoTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={() => openEditTaskModal(task)}
                        onDelete={() => deleteTask(task.id)}
                        onStatusChange={(newStatus) => changeTaskStatus(task.id, newStatus)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* COLUMN 2: IN PROGRESS */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-blue-800 pb-1 border-b border-blue-200/60">
                  <span>In Progress</span>
                  <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
                    {inProgressTasks.length}
                  </span>
                </div>

                {inProgressTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">Nothing in progress</p>
                ) : (
                  <div className="space-y-2.5">
                    {inProgressTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={() => openEditTaskModal(task)}
                        onDelete={() => deleteTask(task.id)}
                        onStatusChange={(newStatus) => changeTaskStatus(task.id, newStatus)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* COLUMN 3: COMPLETED */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-emerald-200/60">
                  <span>Completed</span>
                  <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
                    {completedTasks.length}
                  </span>
                </div>

                {completedTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No completed tasks yet</p>
                ) : (
                  <div className="space-y-2.5">
                    {completedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={() => openEditTaskModal(task)}
                        onDelete={() => deleteTask(task.id)}
                        onStatusChange={(newStatus) => changeTaskStatus(task.id, newStatus)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR (GitHub, Team Members, Quick Info) */}
        <div className="space-y-6">
          {/* GitHub Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FolderGit2 className="w-4 h-4 text-primary-600" />
              <span>Repository</span>
            </div>

            {currentWorkspace.github_url ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 truncate font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                  {currentWorkspace.github_url}
                </p>
                <a
                  href={currentWorkspace.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <GitBranch className="w-4 h-4" /> Open GitHub Repository <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            ) : (
              <div className="text-center py-3 space-y-2">
                <p className="text-xs text-slate-400">No GitHub repository linked yet.</p>
                <button
                  onClick={() => {
                    const el = document.querySelector('input[type="url"]') as HTMLInputElement;
                    el?.focus();
                  }}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700"
                >
                  + Add GitHub Repository
                </button>
              </div>
            )}
          </div>

          {/* Team Members Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Users className="w-4 h-4 text-primary-600" />
                <span>Squad & Teammates</span>
              </div>
              <Link
                to="/team-finder"
                className="text-[11px] font-bold text-primary-600 hover:underline"
              >
                Find Teammates
              </Link>
            </div>

            {teamMembers.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-slate-400">No team members added yet.</p>
                <Link
                  to="/team-finder"
                  className="inline-block text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  Find teammates in Team Finder
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{member.display_name}</p>
                      <p className="text-[10px] text-slate-500">{member.roles.join(', ') || 'Hacker'}</p>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Accepted
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hackathon Quick Card */}
          {currentWorkspace.hackathon && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Target Hackathon
              </h3>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {currentWorkspace.hackathon.title}
              </p>
              <div className="text-xs text-slate-500 space-y-1">
                <p>
                  <strong>Start Date:</strong>{' '}
                  {currentWorkspace.hackathon.start_date
                    ? new Date(currentWorkspace.hackathon.start_date).toLocaleDateString()
                    : 'TBA'}
                </p>
                <p>
                  <strong>Mode:</strong> {currentWorkspace.hackathon.mode || 'Online'}
                </p>
              </div>
              <Link
                to={`/hackathons/${currentWorkspace.hackathon_id}`}
                className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700 pt-1"
              >
                View Full Event Details <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 4. CREATE / EDIT TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={closeTaskModal}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Build backend auth routes with Supabase"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Task details and deliverables..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value)}
                    placeholder="e.g. Rahul / Self"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Individual Task Card inside Kanban column
function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: WorkspaceTask;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
}) {
  const priorityBadge = {
    low: 'bg-slate-100 text-slate-700 border-slate-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    high: 'bg-red-100 text-red-800 border-red-200',
  }[task.priority];

  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 group hover:border-primary-400 transition-all">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-bold text-slate-900 leading-snug break-words flex-1">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
            title="Edit task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[10px]">
        <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${priorityBadge}`}>
          {task.priority}
        </span>

        {task.due_date && (
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Quick Status Shift Dropdown */}
      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 text-[10px]">Move to:</span>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700 focus:outline-none"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
