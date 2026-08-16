-- Enable UUID extension
create extension if not exists "uuid-ossp";

---------------------------------------------------------
-- 1. PROFILES TABLE
---------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  college text,
  bio text,
  profile_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can read own profile" 
  on public.profiles for select 
  using ( auth.uid() = user_id );

create policy "Users can update own profile" 
  on public.profiles for update 
  using ( auth.uid() = user_id );

-- Trigger to automatically create a profile for new users
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (user_id, email, name)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

---------------------------------------------------------
-- 2. HACKATHONS TABLE
---------------------------------------------------------
create table public.hackathons (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  organizer text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  registration_deadline timestamp with time zone,
  location text,
  mode text,
  prize text,
  team_size text,
  eligibility text,
  registration_url text,
  image_url text,
  status text default 'upcoming',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.hackathons enable row level security;

-- Policies for hackathons
create policy "Public hackathon information can be read by everyone" 
  on public.hackathons for select 
  using ( true );

-- (Only admins/service roles can insert/update/delete - default deny for authenticated/anon users)

---------------------------------------------------------
-- 3. SAVED HACKATHONS TABLE
---------------------------------------------------------
create table public.saved_hackathons (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  hackathon_id uuid references public.hackathons(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, hackathon_id) -- Prevent duplicate saves
);

-- Indexes for efficient querying
create index idx_saved_hackathons_user_id on public.saved_hackathons(user_id);
create index idx_saved_hackathons_hackathon_id on public.saved_hackathons(hackathon_id);

-- Enable RLS
alter table public.saved_hackathons enable row level security;

-- Policies for saved_hackathons
create policy "Users can read own saved hackathons" 
  on public.saved_hackathons for select 
  using ( auth.uid() = user_id );

create policy "Users can create own saved hackathons" 
  on public.saved_hackathons for insert 
  with check ( auth.uid() = user_id );

create policy "Users can delete own saved hackathons" 
  on public.saved_hackathons for delete 
  using ( auth.uid() = user_id );

---------------------------------------------------------
-- 4. NOTIFICATIONS TABLE
---------------------------------------------------------
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  title text not null,
  message text,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for efficient querying by user
create index idx_notifications_user_id on public.notifications(user_id);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies for notifications
create policy "Users can read own notifications" 
  on public.notifications for select 
  using ( auth.uid() = user_id );

-- (Users cannot update or delete notifications currently based on requirements)

---------------------------------------------------------
-- 5. AUTOMATIC UPDATED_AT TRIGGERS
---------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_hackathons_updated_at
  before update on public.hackathons
  for each row execute procedure public.update_updated_at_column();
