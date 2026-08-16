---------------------------------------------------------
-- HACKATHON PREPARATION WORKSPACE DATABASE SCHEMA
---------------------------------------------------------

-- 1. WORKSPACES TABLE
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  hackathon_id uuid references public.hackathons(id) on delete cascade not null,
  project_name text,
  problem_statement text,
  solution text,
  tech_stack text[] default '{}' not null,
  github_url text,
  submission_deadline timestamp with time zone,
  progress_percentage integer default 0 not null check (progress_percentage >= 0 and progress_percentage <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, hackathon_id)
);

-- 2. WORKSPACE TASKS TABLE
create table if not exists public.workspace_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' not null check (status in ('todo', 'in_progress', 'completed')),
  priority text default 'medium' not null check (priority in ('low', 'medium', 'high')),
  due_date timestamp with time zone,
  assigned_to text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INDEXES FOR PERFORMANCE
create index if not exists idx_workspaces_user_id on public.workspaces(user_id);
create index if not exists idx_workspaces_hackathon_id on public.workspaces(hackathon_id);
create index if not exists idx_workspace_tasks_workspace_id on public.workspace_tasks(workspace_id);
create index if not exists idx_workspace_tasks_status on public.workspace_tasks(status);

-- 4. ROW LEVEL SECURITY (RLS)
alter table public.workspaces enable row level security;
alter table public.workspace_tasks enable row level security;

-- Policies for public.workspaces
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'workspaces' and policyname = 'Users can view own workspaces') then
    create policy "Users can view own workspaces"
      on public.workspaces for select
      to authenticated
      using ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'workspaces' and policyname = 'Users can create own workspaces') then
    create policy "Users can create own workspaces"
      on public.workspaces for insert
      to authenticated
      with check ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'workspaces' and policyname = 'Users can update own workspaces') then
    create policy "Users can update own workspaces"
      on public.workspaces for update
      to authenticated
      using ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'workspaces' and policyname = 'Users can delete own workspaces') then
    create policy "Users can delete own workspaces"
      on public.workspaces for delete
      to authenticated
      using ( auth.uid() = user_id );
  end if;
end
$$;

-- Policies for public.workspace_tasks (tied to workspace ownership)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'workspace_tasks' and policyname = 'Users can view own workspace tasks') then
    create policy "Users can view own workspace tasks"
      on public.workspace_tasks for select
      to authenticated
      using (
        exists (
          select 1 from public.workspaces w
          where w.id = workspace_tasks.workspace_id
          and w.user_id = auth.uid()
        )
      );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'workspace_tasks' and policyname = 'Users can create own workspace tasks') then
    create policy "Users can create own workspace tasks"
      on public.workspace_tasks for insert
      to authenticated
      with check (
        exists (
          select 1 from public.workspaces w
          where w.id = workspace_tasks.workspace_id
          and w.user_id = auth.uid()
        )
      );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'workspace_tasks' and policyname = 'Users can update own workspace tasks') then
    create policy "Users can update own workspace tasks"
      on public.workspace_tasks for update
      to authenticated
      using (
        exists (
          select 1 from public.workspaces w
          where w.id = workspace_tasks.workspace_id
          and w.user_id = auth.uid()
        )
      );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'workspace_tasks' and policyname = 'Users can delete own workspace tasks') then
    create policy "Users can delete own workspace tasks"
      on public.workspace_tasks for delete
      to authenticated
      using (
        exists (
          select 1 from public.workspaces w
          where w.id = workspace_tasks.workspace_id
          and w.user_id = auth.uid()
        )
      );
  end if;
end
$$;

-- 5. UPDATED_AT TIMESTAMP TRIGGERS
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists update_workspaces_updated_at on public.workspaces;
create trigger update_workspaces_updated_at
  before update on public.workspaces
  for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_workspace_tasks_updated_at on public.workspace_tasks;
create trigger update_workspace_tasks_updated_at
  before update on public.workspace_tasks
  for each row execute procedure public.update_updated_at_column();
