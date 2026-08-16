---------------------------------------------------------
-- DEADLINE & APPLICATION TRACKER SCHEMA
-- Extends saved_hackathons table to store tracker status & reminders
---------------------------------------------------------

-- 1. Add status, notes, reminder_enabled, and updated_at columns
alter table public.saved_hackathons 
  add column if not exists status text default 'Saved' not null,
  add column if not exists notes text,
  add column if not exists reminder_enabled boolean default false not null,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- 2. Add index on (user_id, status) for fast status filtering
create index if not exists idx_saved_hackathons_user_status on public.saved_hackathons(user_id, status);

-- 3. Add RLS policy allowing users to update their own tracker records
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'saved_hackathons' and policyname = 'Users can update own saved hackathons'
  ) then
    create policy "Users can update own saved hackathons" 
      on public.saved_hackathons for update 
      using ( auth.uid() = user_id );
  end if;
end
$$;

-- 4. Create trigger to automatically update updated_at timestamp on saved_hackathons
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists update_saved_hackathons_updated_at on public.saved_hackathons;
create trigger update_saved_hackathons_updated_at
  before update on public.saved_hackathons
  for each row execute procedure public.update_updated_at_column();
