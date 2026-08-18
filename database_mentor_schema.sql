---------------------------------------------------------
-- AI MENTOR CONVERSATION HISTORY SCHEMA
---------------------------------------------------------

-- 1. MENTOR MESSAGES TABLE
create table if not exists public.mentor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  hackathon_id uuid references public.hackathons(id) on delete cascade,
  sender text not null check (sender in ('user', 'ai')),
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. INDEXES FOR HIGH-SPEED ORDERED RETRIEVAL
create index if not exists idx_mentor_messages_user_hack on public.mentor_messages(user_id, hackathon_id, created_at);
create index if not exists idx_mentor_messages_user_created on public.mentor_messages(user_id, created_at);

-- 3. ENABLE ROW LEVEL SECURITY
alter table public.mentor_messages enable row level security;

-- 4. ROW LEVEL SECURITY POLICIES (STRICT USER ISOLATION)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'mentor_messages' and policyname = 'Users can read own mentor messages') then
    create policy "Users can read own mentor messages" 
      on public.mentor_messages for select 
      to authenticated
      using ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'mentor_messages' and policyname = 'Users can insert own mentor messages') then
    create policy "Users can insert own mentor messages" 
      on public.mentor_messages for insert 
      to authenticated
      with check ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'mentor_messages' and policyname = 'Users can delete own mentor messages') then
    create policy "Users can delete own mentor messages" 
      on public.mentor_messages for delete 
      to authenticated
      using ( auth.uid() = user_id );
  end if;
end $$;
