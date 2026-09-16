-- =========================================================
-- HACKVERSE AI — SKILL GAP ANALYZER DATABASE SCHEMA
-- Migration File: database_skill_gap_schema.sql
-- =========================================================

-- Ensure UUID extension is enabled
create extension if not exists "uuid-ossp";

---------------------------------------------------------
-- 1. SKILLS CATALOG TABLE (Standard reusable skill taxonomy)
---------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  category text not null check (category in (
    'Frontend',
    'Backend',
    'AI/ML',
    'Database',
    'DevOps',
    'Cloud',
    'Design',
    'Business',
    'Mobile',
    'Other'
  )),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for case-insensitive lookup and searching by name and category
create index if not exists idx_skills_name on public.skills (name);
create index if not exists idx_skills_category on public.skills (category);

-- Enable RLS
alter table public.skills enable row level security;

-- Policies for skills table (Public read for all users, write reserved for admins/service role)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'skills' and policyname = 'Skills catalog is readable by everyone') then
    create policy "Skills catalog is readable by everyone"
      on public.skills for select
      using ( true );
  end if;
end
$$;

---------------------------------------------------------
-- 2. USER SKILLS JUNCTION TABLE (User's individual skills & proficiency)
---------------------------------------------------------
create table if not exists public.user_skills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  proficiency text not null default 'intermediate' check (proficiency in ('beginner', 'intermediate', 'advanced')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, skill_id) -- Strictly prevent duplicate skills for the same user
);

-- Performance indexes for querying user skills and inverse lookups
create index if not exists idx_user_skills_user_id on public.user_skills (user_id);
create index if not exists idx_user_skills_skill_id on public.user_skills (skill_id);

-- Enable RLS
alter table public.user_skills enable row level security;

-- Strict RLS Policies for user_skills (Users can only manage their own skills)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'user_skills' and policyname = 'Users can view their own skills') then
    create policy "Users can view their own skills"
      on public.user_skills for select
      to authenticated
      using ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'user_skills' and policyname = 'Users can insert their own skills') then
    create policy "Users can insert their own skills"
      on public.user_skills for insert
      to authenticated
      with check ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'user_skills' and policyname = 'Users can update their own skills') then
    create policy "Users can update their own skills"
      on public.user_skills for update
      to authenticated
      using ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'user_skills' and policyname = 'Users can delete their own skills') then
    create policy "Users can delete their own skills"
      on public.user_skills for delete
      to authenticated
      using ( auth.uid() = user_id );
  end if;
end
$$;

---------------------------------------------------------
-- 3. HACKATHON SKILLS JUNCTION TABLE (Required / Recommended skills per hackathon)
---------------------------------------------------------
create table if not exists public.hackathon_skills (
  id uuid primary key default uuid_generate_v4(),
  hackathon_id uuid references public.hackathons(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  importance text not null default 'required' check (importance in ('required', 'recommended')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(hackathon_id, skill_id) -- Strictly prevent duplicate skills on the same hackathon
);

-- Performance indexes for querying hackathon skill requirements
create index if not exists idx_hackathon_skills_hackathon_id on public.hackathon_skills (hackathon_id);
create index if not exists idx_hackathon_skills_skill_id on public.hackathon_skills (skill_id);

-- Enable RLS
alter table public.hackathon_skills enable row level security;

-- Policies for hackathon_skills (Public read; normal users cannot insert/update/delete)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'hackathon_skills' and policyname = 'Hackathon skill requirements are readable by everyone') then
    create policy "Hackathon skill requirements are readable by everyone"
      on public.hackathon_skills for select
      using ( true );
  end if;
end
$$;

---------------------------------------------------------
-- 4. AUTOMATIC UPDATED_AT TRIGGERS
---------------------------------------------------------
drop trigger if exists update_user_skills_updated_at on public.user_skills;
create trigger update_user_skills_updated_at
  before update on public.user_skills
  for each row execute procedure public.update_updated_at_column();

---------------------------------------------------------
-- 5. INITIAL SEED DATA FOR STANDARD SKILLS CATALOG
---------------------------------------------------------
insert into public.skills (name, category) values
  -- Frontend
  ('React', 'Frontend'),
  ('TypeScript', 'Frontend'),
  ('JavaScript', 'Frontend'),
  ('Next.js', 'Frontend'),
  ('Vue.js', 'Frontend'),
  ('Tailwind CSS', 'Frontend'),
  ('HTML/CSS', 'Frontend'),
  ('Angular', 'Frontend'),

  -- Backend
  ('Node.js', 'Backend'),
  ('Python', 'Backend'),
  ('Java', 'Backend'),
  ('Go', 'Backend'),
  ('Express', 'Backend'),
  ('FastAPI', 'Backend'),
  ('Django', 'Backend'),
  ('C++', 'Backend'),
  ('Rust', 'Backend'),

  -- AI / ML
  ('Machine Learning', 'AI/ML'),
  ('Artificial Intelligence', 'AI/ML'),
  ('Deep Learning', 'AI/ML'),
  ('OpenAI / LLMs', 'AI/ML'),
  ('Gemini AI', 'AI/ML'),
  ('PyTorch', 'AI/ML'),
  ('TensorFlow', 'AI/ML'),
  ('Computer Vision', 'AI/ML'),
  ('NLP', 'AI/ML'),

  -- Database
  ('PostgreSQL', 'Database'),
  ('SQL', 'Database'),
  ('MongoDB', 'Database'),
  ('Redis', 'Database'),
  ('Supabase', 'Database'),
  ('Firebase', 'Database'),

  -- DevOps & Cloud
  ('Docker', 'DevOps'),
  ('Kubernetes', 'DevOps'),
  ('Git', 'DevOps'),
  ('GitHub', 'DevOps'),
  ('CI/CD', 'DevOps'),
  ('AWS', 'Cloud'),
  ('Google Cloud', 'Cloud'),
  ('Azure', 'Cloud'),

  -- Mobile
  ('Flutter', 'Mobile'),
  ('React Native', 'Mobile'),
  ('Swift / iOS', 'Mobile'),
  ('Android / Kotlin', 'Mobile'),

  -- Design & Business
  ('UI/UX', 'Design'),
  ('Figma', 'Design'),
  ('Pitching', 'Business'),
  ('Business Strategy', 'Business'),
  ('Product Management', 'Business')
on conflict (name) do nothing;
