-- Replace placeholder resource records with realistic institutional resources.
-- These are illustrative starter records for the portal, not legal or policy advice.

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'research_support',
  description text not null,
  content text,
  external_url text,
  research_area_id uuid references public.research_areas(id) on delete set null,
  status text not null default 'published',
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

delete from public.resources
where lower(slug) in ('mnbghv', 'nlbvgh', 'test-resource', 'sample-resource')
   or lower(title) in ('mnbghv', 'nlbvgh', 'test resource', 'sample resource');

insert into public.resources (slug, title, category, description, content, external_url, status, is_demo)
values
  (
    'research-ethics-irb-guidelines',
    'Research Ethics Committee and IRB Procedure',
    'ethics',
    'Procedure for submitting research involving people, personal data, interviews, surveys, or behavioural observation for ethics review.',
    'Researchers should identify potential risks, explain consent and withdrawal procedures, describe data retention and access controls, and attach participant-facing information sheets before beginning data collection.',
    '/ethics',
    'published',
    true
  ),
  (
    'ieee-acm-academic-writing-guide',
    'Academic Writing and Citation Guide',
    'academic_writing',
    'Practical guidance for structuring computing research papers, reporting methods clearly, and maintaining accurate citations.',
    'Use a clear research question, describe the method sufficiently for reproduction, separate results from interpretation, and check every citation against the original source. Researchers should follow the formatting requirements of their target venue.',
    '/research-support',
    'published',
    true
  ),
  (
    'open-access-publication-protocol',
    'Open Access Publication Support',
    'publication_support',
    'Information about publication planning, journal selection, open access routes, and institutional support for eligible article processing charges.',
    'Before submitting, researchers should confirm the journal scope, indexing claims, peer-review process, licence terms, and total publication costs. Funding requests should include the acceptance letter and publisher invoice where available.',
    '/funding',
    'published',
    true
  ),
  (
    'ai-assisted-research-ethics-policy',
    'Responsible Use of AI in Research',
    'ai_ethics',
    'Guidance for transparent, accountable use of generative AI and machine learning tools during research and scholarly writing.',
    'Researchers remain responsible for accuracy, originality, confidentiality, and attribution. AI tools must not be listed as authors. Material assistance with analysis, drafting, or code should be checked and disclosed according to the requirements of the target venue.',
    '/ethics',
    'published',
    true
  ),
  (
    'standard-research-proposal-template',
    'Research Proposal Planning Template',
    'templates',
    'A structured planning aid for developing a research question, literature review, methodology, work plan, outputs, risks, and budget.',
    'A complete proposal should explain the problem, identify the contribution, justify the method, define measurable outputs, identify responsible team members, and include a realistic timeline and resource plan.',
    '/research-support',
    'published',
    true
  ),
  (
    'research-data-protection-privacy-sop',
    'Research Data Management and Privacy Procedure',
    'data_protection',
    'Guidance for classifying, storing, securing, sharing, and disposing of research data throughout a project lifecycle.',
    'Collect only the data required for the stated purpose. Use access controls, secure backups, encryption where appropriate, and de-identification before sharing. Document retention periods, custodianship, and approved deletion procedures.',
    '/ethics',
    'published',
    true
  ),
  (
    'advanced-computing-lab-facility-guide',
    'Research Computing and Laboratory Access Guide',
    'facilities',
    'Information for researchers requesting access to computing workstations, network testbeds, laboratory equipment, and shared technical facilities.',
    'Access requests should identify the project, equipment required, expected usage period, supervisor, and any safety or data-handling considerations. Users must follow booking, access, and responsible-use procedures for shared facilities.',
    '/research-support',
    'published',
    true
  ),
  (
    'literature-review-citation-toolkit',
    'Literature Review and Evidence Mapping Toolkit',
    'methodology',
    'A practical guide for planning systematic searches, screening literature, extracting evidence, and maintaining a reproducible review record.',
    'Define search terms and inclusion criteria before screening. Record databases, dates, queries, exclusions, and extracted findings so another researcher can understand and reproduce the review process.',
    '/research-support',
    'published',
    true
  ),
  (
    'research-tools-frameworks-directory',
    'Computational Research Tools Directory',
    'tools',
    'Directory of software, analysis environments, simulation tools, and development frameworks commonly used by research teams.',
    'Researchers should select tools that match the method, document versions and dependencies, retain reproducible scripts, and check licensing requirements before distributing software or datasets.',
    '/research-support',
    'published',
    true
  ),
  (
    'ethics-committee-review-charter',
    'Research Ethics Committee Charter and Review Process',
    'ethics_committee',
    'Overview of committee responsibilities, review routes, submission requirements, and expected decision timelines.',
    'Applications should include the protocol, participant materials, consent approach, risk assessment, data management plan, and investigator responsibilities. Amendments must be reported before making material changes to an approved study.',
    '/ethics',
    'published',
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  description = excluded.description,
  content = excluded.content,
  external_url = excluded.external_url,
  status = excluded.status,
  updated_at = now();

notify pgrst, 'reload schema';
