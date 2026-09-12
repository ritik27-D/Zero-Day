-- Islington R&D Connect conceptual Supabase/PostgreSQL schema.
-- The MVP actively uses researchers, projects, publications and research_areas only.
create extension if not exists pgcrypto;

create table if not exists public.admins (id uuid primary key default gen_random_uuid(), email text not null unique, name text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.researchers (id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, email text not null unique, title text not null, bio text not null, is_demo boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.research_areas (id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null unique, description text not null, is_demo boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.research_groups (id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null unique, description text not null, is_demo boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.projects (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, description text not null, status text not null default 'planned' check (status in ('planned','ongoing','completed','on_hold')), start_date date, end_date date, is_demo boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.publications (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, abstract text not null, status text not null default 'draft' check (status in ('draft','submitted','published')), venue text not null, doi text unique, published_at date, is_demo boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.events (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, description text not null, status text not null default 'draft', starts_at timestamptz, ends_at timestamptz, location text, is_demo boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.opportunities (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, description text not null, status text not null default 'draft', closing_date date, url text, is_demo boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.funding (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, title text not null, funder text not null, amount numeric(14,2), currency text not null default 'NPR', status text not null default 'applied', awarded_at date, is_demo boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.activity_audit (id uuid primary key default gen_random_uuid(), actor_admin_id uuid references public.admins(id) on delete set null, action text not null, entity_type text not null, entity_id uuid not null, description text not null, previous_value jsonb, new_value jsonb, created_at timestamptz not null default now());

create table if not exists public.researcher_research_areas (researcher_id uuid not null references public.researchers(id) on delete cascade, research_area_id uuid not null references public.research_areas(id) on delete cascade, primary key (researcher_id, research_area_id));
create table if not exists public.researcher_research_groups (researcher_id uuid not null references public.researchers(id) on delete cascade, research_group_id uuid not null references public.research_groups(id) on delete cascade, primary key (researcher_id, research_group_id));
create table if not exists public.project_researchers (project_id uuid not null references public.projects(id) on delete cascade, researcher_id uuid not null references public.researchers(id) on delete cascade, primary key (project_id, researcher_id));
create table if not exists public.project_research_areas (project_id uuid not null references public.projects(id) on delete cascade, research_area_id uuid not null references public.research_areas(id) on delete cascade, primary key (project_id, research_area_id));
create table if not exists public.publication_researchers (publication_id uuid not null references public.publications(id) on delete cascade, researcher_id uuid not null references public.researchers(id) on delete cascade, primary key (publication_id, researcher_id));
create table if not exists public.publication_research_areas (publication_id uuid not null references public.publications(id) on delete cascade, research_area_id uuid not null references public.research_areas(id) on delete cascade, primary key (publication_id, research_area_id));
create table if not exists public.project_publications (project_id uuid not null references public.projects(id) on delete cascade, publication_id uuid not null references public.publications(id) on delete cascade, primary key (project_id, publication_id));

create index if not exists researchers_name_idx on public.researchers(name);
create index if not exists projects_title_idx on public.projects(title);
create index if not exists publications_title_idx on public.publications(title);
create index if not exists funding_project_id_idx on public.funding(project_id);
create index if not exists activity_audit_entity_idx on public.activity_audit(entity_type, entity_id);

alter table public.researchers enable row level security;
alter table public.projects enable row level security;
alter table public.publications enable row level security;
alter table public.research_areas enable row level security;
create policy "Public read researchers" on public.researchers for select using (true);
create policy "Public read projects" on public.projects for select using (true);
create policy "Public read publications" on public.publications for select using (true);
create policy "Public read research areas" on public.research_areas for select using (true);
