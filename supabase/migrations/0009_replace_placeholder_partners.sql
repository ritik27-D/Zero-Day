-- Replace placeholder partner records with realistic institutional records.
-- These are illustrative starter records for the portal, not claims of active agreements.

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null default 'academic',
  description text not null,
  website_url text,
  project_id uuid references public.projects(id) on delete set null,
  status text not null default 'active',
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

delete from public.partners
where lower(slug) in ('mnbghv', 'nlbvgh')
   or lower(name) in ('mnbghv', 'nlbvgh');

insert into public.partners (slug, name, type, description, website_url, status, is_demo)
values
  (
    'london-metropolitan-university',
    'London Metropolitan University',
    'academic',
    'International academic partner represented in the hub for collaborative teaching, research exchange, and quality enhancement initiatives.',
    'https://www.londonmet.ac.uk',
    'active',
    true
  ),
  (
    'icimod',
    'International Centre for Integrated Mountain Development',
    'research',
    'Regional knowledge centre working on sustainable mountain development, climate resilience, and data-informed policy across the Hindu Kush Himalaya.',
    'https://www.icimod.org',
    'active',
    true
  ),
  (
    'nepal-academy-of-science-and-technology',
    'Nepal Academy of Science and Technology',
    'research',
    'National science and technology institution supporting research collaboration, innovation, and scientific capacity building in Nepal.',
    'https://nast.org.np',
    'active',
    true
  ),
  (
    'kathmandu-university',
    'Kathmandu University',
    'academic',
    'Nepali university partner represented in the hub for academic exchange, joint supervision, and interdisciplinary research collaboration.',
    'https://ku.edu.np',
    'active',
    true
  ),
  (
    'nepal-research-and-education-network',
    'Nepal Research and Education Network',
    'network',
    'Research and education network supporting connectivity, knowledge exchange, and digital research infrastructure for institutions across Nepal.',
    'https://nren.net.np',
    'active',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  type = excluded.type,
  description = excluded.description,
  website_url = excluded.website_url,
  status = excluded.status,
  updated_at = now();

notify pgrst, 'reload schema';
