-- Migration 0003: Three-Role Access Control (RBAC) & Submissions Approval Workflow

-- 1. User Profiles table mapping Supabase Auth users to roles and researcher records
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  role text not null check (role in ('researcher', 'admin')),
  researcher_id uuid references public.researchers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Researcher Submissions table for lightweight change approval workflow
create table if not exists public.researcher_submissions (
  id uuid primary key default gen_random_uuid(),
  researcher_id uuid not null references public.researchers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_type text not null check (submission_type in ('profile_update', 'new_project', 'project_update', 'new_publication', 'publication_update')),
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  payload jsonb not null default '{}'::jsonb,
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Indexes for fast lookup
create index if not exists user_profiles_user_id_idx on public.user_profiles(user_id);
create index if not exists user_profiles_username_idx on public.user_profiles(username);
create index if not exists user_profiles_researcher_id_idx on public.user_profiles(researcher_id);
create index if not exists researcher_submissions_researcher_id_idx on public.researcher_submissions(researcher_id);
create index if not exists researcher_submissions_status_idx on public.researcher_submissions(status);

-- 4. Enable Row Level Security
alter table public.user_profiles enable row level security;
alter table public.researcher_submissions enable row level security;

-- 5. RLS Policies for user_profiles
drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile" on public.user_profiles
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = user_id);

-- 6. RLS Policies for researcher_submissions
drop policy if exists "Researchers can read own submissions" on public.researcher_submissions;
create policy "Researchers can read own submissions" on public.researcher_submissions
  for select using (auth.uid() = user_id);

drop policy if exists "Researchers can insert own submissions" on public.researcher_submissions;
create policy "Researchers can insert own submissions" on public.researcher_submissions
  for insert with check (auth.uid() = user_id);

-- Note: All canonical research tables (researchers, projects, publications, research_areas)
-- remain public-read (SELECT using true). Public/researcher direct write policies are strictly forbidden,
-- ensuring that canonical data is modified only through admin approval via server-side service role execution.
