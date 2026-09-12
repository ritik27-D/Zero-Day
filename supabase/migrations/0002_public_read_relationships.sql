-- Enable Row Level Security and grant public read access for discovery relationship tables.

alter table if exists public.researcher_research_areas enable row level security;
drop policy if exists "Public read researcher research areas" on public.researcher_research_areas;
create policy "Public read researcher research areas" on public.researcher_research_areas for select using (true);

alter table if exists public.project_researchers enable row level security;
drop policy if exists "Public read project researchers" on public.project_researchers;
create policy "Public read project researchers" on public.project_researchers for select using (true);

alter table if exists public.publication_researchers enable row level security;
drop policy if exists "Public read publication researchers" on public.publication_researchers;
create policy "Public read publication researchers" on public.publication_researchers for select using (true);

alter table if exists public.project_publications enable row level security;
drop policy if exists "Public read project publications" on public.project_publications;
create policy "Public read project publications" on public.project_publications for select using (true);

alter table if exists public.project_research_areas enable row level security;
drop policy if exists "Public read project research areas" on public.project_research_areas;
create policy "Public read project research areas" on public.project_research_areas for select using (true);
