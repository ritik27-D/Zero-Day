-- Refresh the hub's starter content with realistic institutional records.
-- These are illustrative records for local/demo deployment, not claims of active agreements.

update public.opportunities
set
  provider = 'Islington College Research and Development Centre',
  application_url = '/login?redirect=/researcher/submissions',
  url = '/login?redirect=/researcher/submissions'
where slug = 'islington-faculty-seed-grant-2026';

update public.opportunities
set
  provider = 'Islington College Research and Development Centre',
  application_url = '/login?redirect=/researcher/submissions',
  url = '/login?redirect=/researcher/submissions'
where slug = 'undergraduate-ai-fellowship-2026';

update public.opportunities
set
  provider = 'Islington Journal of Multidisciplinary Research',
  application_url = '/ijmr',
  url = '/ijmr'
where slug = 'special-issue-applied-intelligence-cfp';

update public.opportunities
set
  provider = 'Islington Cybersecurity and Digital Forensics Lab',
  application_url = '/login?redirect=/researcher/submissions',
  url = '/login?redirect=/researcher/submissions'
where slug = 'cyber-research-assistantship-ids';

update public.opportunities
set
  provider = 'Islington Innovation Hub',
  application_url = '/login?redirect=/researcher/submissions',
  url = '/login?redirect=/researcher/submissions'
where slug = 'green-computing-student-challenge';

update public.opportunities
set
  provider = 'Islington College Academic Council',
  application_url = '/login?redirect=/researcher/submissions',
  url = '/login?redirect=/researcher/submissions'
where slug = 'international-travel-grant-2026';

update public.resources
set external_url = '/ethics'
where slug = 'research-ethics-irb-guidelines';

update public.resources
set external_url = '/research-support'
where slug = 'ieee-acm-academic-writing-guide';

update public.resources
set external_url = '/funding'
where slug = 'open-access-publication-protocol';

update public.resources
set external_url = '/ethics'
where slug = 'ai-assisted-research-ethics-policy';

update public.resources
set external_url = '/research-support'
where slug = 'standard-research-proposal-template';

update public.resources
set external_url = '/ethics'
where slug = 'research-data-protection-privacy-sop';

update public.resources
set external_url = '/research-support'
where slug = 'advanced-computing-lab-facility-guide';

update public.resources
set external_url = '/research-support'
where slug = 'literature-review-citation-toolkit';

update public.resources
set external_url = '/research-support'
where slug = 'research-tools-frameworks-directory';

update public.resources
set external_url = '/ethics'
where slug = 'ethics-committee-review-charter';

update public.partners
set
  name = 'London Metropolitan University',
  type = 'academic',
  description = 'International academic partner represented in the hub for collaborative teaching, research exchange, and quality enhancement initiatives.',
  website_url = 'https://www.londonmet.ac.uk'
where slug = 'london-metropolitan-university';

update public.partners
set
  slug = 'icimod',
  name = 'International Centre for Integrated Mountain Development',
  type = 'research',
  description = 'Regional knowledge centre working on sustainable mountain development, climate resilience, and data-informed policy across the Hindu Kush Himalaya.',
  website_url = 'https://www.icimod.org'
where slug = 'nepal-internet-foundation';

update public.partners
set
  slug = 'nepal-academy-of-science-and-technology',
  name = 'Nepal Academy of Science and Technology',
  type = 'research',
  description = 'National science and technology institution supporting research collaboration, innovation, and scientific capacity building in Nepal.',
  website_url = 'https://nast.org.np'
where slug = 'techsolutions-nepal';

update public.partners
set
  slug = 'kathmandu-university',
  name = 'Kathmandu University',
  type = 'academic',
  description = 'Nepali university partner represented in the hub for academic exchange, joint supervision, and interdisciplinary research collaboration.',
  website_url = 'https://ku.edu.np'
where slug = 'center-for-cybersecurity-nepal';

update public.partners
set
  slug = 'nepal-research-and-education-network',
  name = 'Nepal Research and Education Network',
  type = 'network',
  description = 'Research and education network supporting connectivity, knowledge exchange, and digital research infrastructure for institutions across Nepal.',
  website_url = 'https://nren.net.np'
where slug = 'ai-governance-asia-initiative';

update public.announcements
set
  title = 'Islington R&D Connect Hub Opens for Research Discovery',
  summary = 'The research office has opened the R&D Connect hub for discovering people, projects, publications, resources, and collaboration opportunities.',
  content = 'The Islington R&D Connect hub is now available to the college community. Researchers can maintain profiles, share projects and publications, find support resources, and follow opportunities coordinated by the Research and Development Centre.'
where slug = 'launch-of-islington-rd-digital-hub';

update public.announcements
set
  title = 'IJMR Invites Manuscripts for Volume 4',
  summary = 'The Islington Journal of Multidisciplinary Research invites original research articles, reviews, and applied studies for its next volume.',
  content = 'The editorial team welcomes original research articles, empirical studies, and comprehensive reviews across computing, business technology, education, and applied sciences. Authors should consult the journal guidelines before submitting a manuscript for editorial screening and peer review.',
  external_url = '/ijmr'
where slug = 'ijmr-vol-4-call-for-papers';

update public.announcements
set
  title = 'Faculty Seed Grant Applications Open',
  summary = 'Faculty researchers can submit proposals for the 2026 internal seed grant cycle through the researcher portal.',
  content = 'The Research and Development Centre is accepting proposals for small-scale projects that demonstrate a clear research question, feasible methodology, expected outputs, and a realistic delivery plan. Applications should be submitted through the researcher portal before the published closing date.',
  external_url = '/login?redirect=/researcher/submissions'
where slug = '2026-faculty-seed-grants-open';

update public.announcements
set
  title = 'Guest Lecture on Trustworthy AI Systems',
  summary = 'The Applied AI and Intelligent Systems Group will host an open lecture on explainability, evaluation, and responsible deployment.',
  content = 'The session will examine practical approaches to evaluating machine learning systems in high-consequence settings, including documentation, uncertainty communication, and human oversight. Faculty members, researchers, and students are invited to attend.',
  external_url = '/events'
where slug = 'guest-lecture-series-trustworthy-ai';

notify pgrst, 'reload schema';
