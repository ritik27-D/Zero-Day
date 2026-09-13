-- Add administrator review workflow to researcher activity logs.

alter table public.researcher_activity_logs
  add column if not exists status text not null default 'pending';

alter table public.researcher_activity_logs
  add column if not exists admin_notes text;

alter table public.researcher_activity_logs
  add column if not exists reviewed_at timestamptz;

alter table public.researcher_activity_logs
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

create index if not exists researcher_activity_logs_status_idx
  on public.researcher_activity_logs(status, created_at desc);

notify pgrst, 'reload schema';
