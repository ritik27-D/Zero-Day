-- Repair migration for environments where the digital hub migration was not applied.
-- Safe to run repeatedly.

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'ethics',
  description text not null,
  content text,
  external_url text,
  research_area_id uuid references public.research_areas(id) on delete set null,
  status text not null default 'published' check (status in ('published', 'draft', 'archived')),
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null default 'academic',
  description text not null,
  website_url text,
  project_id uuid references public.projects(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'past', 'partner')),
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  content text not null,
  published_at timestamptz not null default now(),
  status text not null default 'published' check (status in ('published', 'draft', 'archived')),
  external_url text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.opportunities add column if not exists type text not null default 'grant';
alter table public.opportunities add column if not exists provider text;
alter table public.opportunities add column if not exists eligibility text;
alter table public.opportunities add column if not exists amount text;
alter table public.opportunities add column if not exists deadline date;
alter table public.opportunities add column if not exists application_url text;
alter table public.opportunities add column if not exists requirements text;
alter table public.opportunities add column if not exists research_area_id uuid references public.research_areas(id) on delete set null;
alter table public.opportunities add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.events add column if not exists type text not null default 'conference';
alter table public.events add column if not exists start_date timestamptz;
alter table public.events add column if not exists end_date timestamptz;
alter table public.events add column if not exists registration_url text;
alter table public.events add column if not exists external_url text;
alter table public.events add column if not exists research_area_id uuid references public.research_areas(id) on delete set null;
alter table public.events add column if not exists researcher_id uuid references public.researchers(id) on delete set null;
alter table public.events add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.resources enable row level security;
alter table public.partners enable row level security;
alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.opportunities enable row level security;
alter table public.research_groups enable row level security;
alter table public.publications enable row level security;

drop policy if exists "Public read resources" on public.resources;
create policy "Public read resources" on public.resources for select using (true);

drop policy if exists "Public read partners" on public.partners;
create policy "Public read partners" on public.partners for select using (true);

drop policy if exists "Public read announcements" on public.announcements;
create policy "Public read announcements" on public.announcements for select using (true);

drop policy if exists "Public read events" on public.events;
create policy "Public read events" on public.events for select using (true);

drop policy if exists "Public read opportunities" on public.opportunities;
create policy "Public read opportunities" on public.opportunities for select using (true);

drop policy if exists "Public read research groups" on public.research_groups;
create policy "Public read research groups" on public.research_groups for select using (true);

drop policy if exists "Public read publications" on public.publications;
create policy "Public read publications" on public.publications for select using (true);

notify pgrst, 'reload schema';
