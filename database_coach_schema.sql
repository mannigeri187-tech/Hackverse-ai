---------------------------------------------------------
-- DAILY AI COACH TABLE
---------------------------------------------------------
create table public.daily_coach_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  task_date date not null,
  title text not null,
  description text,
  category text not null,
  estimated_minutes integer not null,
  priority text not null,
  completed boolean default false not null,
  completed_at timestamp with time zone,
  related_hackathon_id uuid references public.hackathons(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure tasks are identifiable if we need to prevent duplicates or identify them safely
  unique(user_id, task_date, title) 
);

-- Indexes for efficient querying by user and date
create index idx_daily_coach_user_date on public.daily_coach_tasks(user_id, task_date);

-- Enable RLS
alter table public.daily_coach_tasks enable row level security;

-- Policies for daily_coach_tasks
create policy "Users can read own daily tasks" 
  on public.daily_coach_tasks for select 
  using ( auth.uid() = user_id );

create policy "Users can create own daily tasks" 
  on public.daily_coach_tasks for insert 
  with check ( auth.uid() = user_id );

create policy "Users can update own daily tasks" 
  on public.daily_coach_tasks for update 
  using ( auth.uid() = user_id );

create policy "Users can delete own daily tasks" 
  on public.daily_coach_tasks for delete 
  using ( auth.uid() = user_id );

-- Attach updated_at trigger
create trigger update_daily_coach_tasks_updated_at
  before update on public.daily_coach_tasks
  for each row execute procedure public.update_updated_at_column();
