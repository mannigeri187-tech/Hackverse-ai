-- =========================================================
-- HACKVERSE AI — CERTIFICATE VAULT DATABASE SCHEMA
-- Migration File: database_certificate_vault_schema.sql
-- =========================================================

-- Ensure UUID extension is enabled
create extension if not exists "uuid-ossp";

---------------------------------------------------------
-- 1. CERTIFICATES TABLE
---------------------------------------------------------
create table if not exists public.certificates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  hackathon_id uuid references public.hackathons(id) on delete cascade not null,
  title text not null,
  issuer text,
  certificate_url text,
  certificate_date timestamptz,
  description text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Performance Indexes
create index if not exists idx_certificates_user_id on public.certificates (user_id);
create index if not exists idx_certificates_hackathon_id on public.certificates (hackathon_id);

-- Enable Row Level Security
alter table public.certificates enable row level security;

-- Strict RLS Policies for public.certificates (Users can only manage their own certificates)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'certificates' and policyname = 'Users can view their own certificates') then
    create policy "Users can view their own certificates"
      on public.certificates for select
      to authenticated
      using ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'certificates' and policyname = 'Users can insert their own certificates') then
    create policy "Users can insert their own certificates"
      on public.certificates for insert
      to authenticated
      with check ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'certificates' and policyname = 'Users can update their own certificates') then
    create policy "Users can update their own certificates"
      on public.certificates for update
      to authenticated
      using ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'certificates' and policyname = 'Users can delete their own certificates') then
    create policy "Users can delete their own certificates"
      on public.certificates for delete
      to authenticated
      using ( auth.uid() = user_id );
  end if;
end
$$;

---------------------------------------------------------
-- 2. AUTOMATIC UPDATED_AT TRIGGER
---------------------------------------------------------
drop trigger if exists update_certificates_updated_at on public.certificates;
create trigger update_certificates_updated_at
  before update on public.certificates
  for each row execute procedure public.update_updated_at_column();
