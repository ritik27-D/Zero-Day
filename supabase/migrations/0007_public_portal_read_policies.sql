-- Ensure all public portal content is readable through the publishable Supabase key.
-- Safe to run repeatedly.

alter table public.events enable row level security;
alter table public.opportunities enable row level security;
alter table public.research_groups enable row level security;
alter table public.resources enable row level security;
alter table public.partners enable row level security;
alter table public.announcements enable row level security;
alter table public.publications enable row level security;

drop policy if exists "Public read events" on public.events;
create policy "Public read events" on public.events for select using (true);

drop policy if exists "Public read opportunities" on public.opportunities;
create policy "Public read opportunities" on public.opportunities for select using (true);

drop policy if exists "Public read research groups" on public.research_groups;
create policy "Public read research groups" on public.research_groups for select using (true);

drop policy if exists "Public read resources" on public.resources;
create policy "Public read resources" on public.resources for select using (true);

drop policy if exists "Public read partners" on public.partners;
create policy "Public read partners" on public.partners for select using (true);

drop policy if exists "Public read announcements" on public.announcements;
create policy "Public read announcements" on public.announcements for select using (true);

drop policy if exists "Public read publications" on public.publications;
create policy "Public read publications" on public.publications for select using (true);

notify pgrst, 'reload schema';
