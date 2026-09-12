-- Clearly labelled, idempotent demo data for the active MVP tables.
insert into public.research_areas (slug,name,description,is_demo) values
('artificial-intelligence','Artificial Intelligence','DEMO DATA: Intelligent systems, responsible AI and applied automation.',true),
('machine-learning','Machine Learning','DEMO DATA: Data-driven predictive and adaptive systems.',true),
('cybersecurity','Cybersecurity','DEMO DATA: Digital resilience and threat research.',true),
('healthcare-technology','Healthcare Technology','DEMO DATA: Safe, inclusive digital health innovation.',true)
on conflict (slug) do update set name=excluded.name,description=excluded.description,is_demo=true;

insert into public.researchers (slug,name,email,title,bio,is_demo) values
('dr-aisha-rahman','Dr Aisha Rahman','aisha.rahman@demo.islington.edu.np','Senior Lecturer, Computing','DEMO DATA: Leads applied Artificial Intelligence research for public good.',true),
('niran-shrestha','Niran Shrestha','niran.shrestha@demo.islington.edu.np','Lecturer, Cybersecurity','DEMO DATA: Researches AI-assisted cyber defence and network security.',true),
('maya-gurung','Maya Gurung','maya.gurung@demo.islington.edu.np','Research Fellow, Data Science','DEMO DATA: Applies machine learning to healthcare datasets.',true),
('leela-karki','Leela Karki','leela.karki@demo.islington.edu.np','Healthcare Technology Fellow','DEMO DATA: Designs equitable digital healthcare services.',true)
on conflict (slug) do update set name=excluded.name,email=excluded.email,title=excluded.title,bio=excluded.bio,is_demo=true;

insert into public.projects (slug,title,description,status,start_date,is_demo) values
('sentinel-ai-ids','Sentinel: AI-Based Intrusion Detection for Campus Networks','DEMO DATA: A project using machine learning to identify network anomalies and support cyber analysts.','ongoing','2026-01-15',true),
('carepath-ai','CarePath AI Triage Explorer','DEMO DATA: Exploring explainable AI-supported healthcare triage.','planned','2026-08-01',true)
on conflict (slug) do update set title=excluded.title,description=excluded.description,status=excluded.status,start_date=excluded.start_date,is_demo=true;

insert into public.publications (slug,title,abstract,status,venue,doi,published_at,is_demo) values
('explainable-ai-intrusion-detection','Explainable AI for Campus Intrusion Detection','DEMO DATA: A study of interpretable anomaly detection for higher-education networks.','published','DEMO International Journal of Applied Cybersecurity','10.9999/demo.sentinel.2026','2026-05-10',true),
('responsible-triage-models','Responsible Triage Models for Community Clinics','DEMO DATA: An early research manuscript on accountable digital health AI.','submitted','DEMO Conference on Healthcare Technology',null,null,true)
on conflict (slug) do update set title=excluded.title,abstract=excluded.abstract,status=excluded.status,venue=excluded.venue,doi=excluded.doi,published_at=excluded.published_at,is_demo=true;

insert into public.researcher_research_areas (researcher_id, research_area_id)
select r.id, a.id
from (values
  ('dr-aisha-rahman', 'artificial-intelligence'),
  ('dr-aisha-rahman', 'machine-learning'),
  ('niran-shrestha', 'artificial-intelligence'),
  ('niran-shrestha', 'cybersecurity'),
  ('maya-gurung', 'machine-learning'),
  ('maya-gurung', 'healthcare-technology'),
  ('leela-karki', 'artificial-intelligence'),
  ('leela-karki', 'healthcare-technology')
) as map(researcher_slug, area_slug)
join public.researchers r on r.slug = map.researcher_slug
join public.research_areas a on a.slug = map.area_slug
on conflict do nothing;

insert into public.project_researchers (project_id, researcher_id)
select p.id, r.id
from (values
  ('sentinel-ai-ids', 'dr-aisha-rahman'),
  ('sentinel-ai-ids', 'niran-shrestha'),
  ('sentinel-ai-ids', 'maya-gurung'),
  ('carepath-ai', 'dr-aisha-rahman'),
  ('carepath-ai', 'maya-gurung'),
  ('carepath-ai', 'leela-karki')
) as map(project_slug, researcher_slug)
join public.projects p on p.slug = map.project_slug
join public.researchers r on r.slug = map.researcher_slug
on conflict do nothing;

insert into public.publication_researchers (publication_id, researcher_id)
select pub.id, r.id
from (values
  ('explainable-ai-intrusion-detection', 'dr-aisha-rahman'),
  ('explainable-ai-intrusion-detection', 'niran-shrestha'),
  ('explainable-ai-intrusion-detection', 'maya-gurung'),
  ('responsible-triage-models', 'maya-gurung'),
  ('responsible-triage-models', 'leela-karki')
) as map(publication_slug, researcher_slug)
join public.publications pub on pub.slug = map.publication_slug
join public.researchers r on r.slug = map.researcher_slug
on conflict do nothing;

insert into public.project_publications (project_id, publication_id)
select p.id, pub.id
from (values
  ('sentinel-ai-ids', 'explainable-ai-intrusion-detection'),
  ('carepath-ai', 'responsible-triage-models')
) as map(project_slug, publication_slug)
join public.projects p on p.slug = map.project_slug
join public.publications pub on pub.slug = map.publication_slug
on conflict do nothing;

insert into public.project_research_areas (project_id, research_area_id)
select p.id, a.id
from (values
  ('sentinel-ai-ids', 'artificial-intelligence'),
  ('sentinel-ai-ids', 'machine-learning'),
  ('sentinel-ai-ids', 'cybersecurity'),
  ('carepath-ai', 'artificial-intelligence'),
  ('carepath-ai', 'machine-learning'),
  ('carepath-ai', 'healthcare-technology')
) as map(project_slug, area_slug)
join public.projects p on p.slug = map.project_slug
join public.research_areas a on a.slug = map.area_slug
on conflict do nothing;
