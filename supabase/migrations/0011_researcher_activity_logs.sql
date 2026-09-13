-- Researcher activity and attendance logs submitted from the researcher portal.

create table if not exists public.researcher_activity_logs (
  id uuid primary key default gen_random_uuid(),
  researcher_id uuid not null references public.researchers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_name text not null,
  mentor_name text not null,
  activity_date date not null,
  duration text not null,
  mentor_attendance text not null default 'Present',
  student_attendance text not null default 'Present',
  attendance_mode text not null default 'Physical',
  created_at timestamptz not null default now()
);

create index if not exists researcher_activity_logs_researcher_idx
  on public.researcher_activity_logs(researcher_id, activity_date desc);

alter table public.researcher_activity_logs enable row level security;

drop policy if exists "Researchers can read own activity logs" on public.researcher_activity_logs;
create policy "Researchers can read own activity logs"
  on public.researcher_activity_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Researchers can create own activity logs" on public.researcher_activity_logs;
create policy "Researchers can create own activity logs"
  on public.researcher_activity_logs for insert
  with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
