---------------------------------------------------------
-- AI TEAM FINDER SCHEMA
---------------------------------------------------------

-- 1. TEAM PROFILES TABLE
create table if not exists public.team_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  skills text[] default '{}' not null,
  experience_level text default 'Beginner' not null check (experience_level in ('Beginner', 'Intermediate', 'Advanced')),
  interests text[] default '{}' not null,
  availability text default 'Both' not null check (availability in ('Weekdays', 'Weekends', 'Both')),
  preferred_roles text[] default '{}' not null,
  previous_hackathons integer default 0 not null,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for efficient searching
create index if not exists idx_team_profiles_user_id on public.team_profiles(user_id);

-- Enable RLS on team_profiles
alter table public.team_profiles enable row level security;

-- Policies for team_profiles
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'team_profiles' and policyname = 'Authenticated users can view team profiles') then
    create policy "Authenticated users can view team profiles"
      on public.team_profiles for select
      to authenticated
      using ( true );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'team_profiles' and policyname = 'Users can create own team profile') then
    create policy "Users can create own team profile"
      on public.team_profiles for insert
      to authenticated
      with check ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'team_profiles' and policyname = 'Users can update own team profile') then
    create policy "Users can update own team profile"
      on public.team_profiles for update
      to authenticated
      using ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'team_profiles' and policyname = 'Users can delete own team profile') then
    create policy "Users can delete own team profile"
      on public.team_profiles for delete
      to authenticated
      using ( auth.uid() = user_id );
  end if;
end
$$;

-- 2. TEAM REQUESTS TABLE
create table if not exists public.team_requests (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  hackathon_id uuid references public.hackathons(id) on delete cascade not null,
  status text default 'pending' not null check (status in ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(sender_id, receiver_id, hackathon_id),
  constraint sender_not_receiver check (sender_id != receiver_id)
);

-- Indexes for requests
create index if not exists idx_team_requests_sender on public.team_requests(sender_id);
create index if not exists idx_team_requests_receiver on public.team_requests(receiver_id);
create index if not exists idx_team_requests_hackathon on public.team_requests(hackathon_id);

-- Enable RLS on team_requests
alter table public.team_requests enable row level security;

-- Policies for team_requests
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'team_requests' and policyname = 'Users can view involved requests') then
    create policy "Users can view involved requests"
      on public.team_requests for select
      to authenticated
      using ( auth.uid() = sender_id or auth.uid() = receiver_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'team_requests' and policyname = 'Users can send team requests') then
    create policy "Users can send team requests"
      on public.team_requests for insert
      to authenticated
      with check ( auth.uid() = sender_id and sender_id != receiver_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'team_requests' and policyname = 'Users can update involved requests') then
    create policy "Users can update involved requests"
      on public.team_requests for update
      to authenticated
      using ( auth.uid() = receiver_id or auth.uid() = sender_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'team_requests' and policyname = 'Users can delete own sent requests') then
    create policy "Users can delete own sent requests"
      on public.team_requests for delete
      to authenticated
      using ( auth.uid() = sender_id or auth.uid() = receiver_id );
  end if;
end
$$;

-- 3. UPDATED_AT TRIGGERS
drop trigger if exists update_team_profiles_updated_at on public.team_profiles;
create trigger update_team_profiles_updated_at
  before update on public.team_profiles
  for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_team_requests_updated_at on public.team_requests;
create trigger update_team_requests_updated_at
  before update on public.team_requests
  for each row execute procedure public.update_updated_at_column();
