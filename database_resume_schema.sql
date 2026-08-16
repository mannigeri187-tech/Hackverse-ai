---------------------------------------------------------
-- RESUMES TABLE
---------------------------------------------------------
create table public.resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  title text not null default 'My Resume',
  template_id text not null default 'modern',
  content jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for efficient querying by user
create index idx_resumes_user_id on public.resumes(user_id);

-- Enable RLS
alter table public.resumes enable row level security;

-- Policies for resumes
create policy "Users can read own resumes" 
  on public.resumes for select 
  using ( auth.uid() = user_id );

create policy "Users can create own resumes" 
  on public.resumes for insert 
  with check ( auth.uid() = user_id );

create policy "Users can update own resumes" 
  on public.resumes for update 
  using ( auth.uid() = user_id );

create policy "Users can delete own resumes" 
  on public.resumes for delete 
  using ( auth.uid() = user_id );

-- Automatic updated_at trigger
create trigger update_resumes_updated_at
  before update on public.resumes
  for each row execute procedure public.update_updated_at_column();
