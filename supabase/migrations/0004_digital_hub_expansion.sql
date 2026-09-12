-- Migration 0004: Islington R&D Connect — Digital Hub Expansion
-- Additive & Idempotent Schema Migration for 5 New Content Tables + Research Groups Activation

-- 1. ALTER EXISTING events TABLE (Additive columns)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'conference';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_date timestamptz;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date timestamptz;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS external_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS research_area_id uuid REFERENCES public.research_areas(id) ON DELETE SET NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS researcher_id uuid REFERENCES public.researchers(id) ON DELETE SET NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- 2. ALTER EXISTING opportunities TABLE (Additive columns)
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'grant';
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS provider text;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS eligibility text;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS amount text;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS deadline date;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS application_url text;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS requirements text;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS research_area_id uuid REFERENCES public.research_areas(id) ON DELETE SET NULL;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- 3. CREATE resources TABLE (Guidelines, writing, ethics, templates, policies, facilities)
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  description text NOT NULL,
  content text,
  external_url text,
  research_area_id uuid REFERENCES public.research_areas(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. CREATE partners TABLE (Academic, industry, government, international)
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'academic',
  description text NOT NULL,
  website_url text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past', 'partner')),
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. CREATE announcements TABLE (Official R&D updates, bulletins, calls)
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL,
  content text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  external_url text,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. INDEXES FOR FAST FILTERING & SEARCH
CREATE INDEX IF NOT EXISTS events_slug_idx ON public.events(slug);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);
CREATE INDEX IF NOT EXISTS events_research_area_id_idx ON public.events(research_area_id);
CREATE INDEX IF NOT EXISTS events_project_id_idx ON public.events(project_id);
CREATE INDEX IF NOT EXISTS events_researcher_id_idx ON public.events(researcher_id);

CREATE INDEX IF NOT EXISTS opportunities_slug_idx ON public.opportunities(slug);
CREATE INDEX IF NOT EXISTS opportunities_status_idx ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS opportunities_deadline_idx ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS opportunities_research_area_id_idx ON public.opportunities(research_area_id);
CREATE INDEX IF NOT EXISTS opportunities_project_id_idx ON public.opportunities(project_id);

CREATE INDEX IF NOT EXISTS resources_slug_idx ON public.resources(slug);
CREATE INDEX IF NOT EXISTS resources_category_idx ON public.resources(category);
CREATE INDEX IF NOT EXISTS resources_research_area_id_idx ON public.resources(research_area_id);

CREATE INDEX IF NOT EXISTS partners_slug_idx ON public.partners(slug);
CREATE INDEX IF NOT EXISTS partners_type_idx ON public.partners(type);
CREATE INDEX IF NOT EXISTS partners_project_id_idx ON public.partners(project_id);

CREATE INDEX IF NOT EXISTS announcements_slug_idx ON public.announcements(slug);
CREATE INDEX IF NOT EXISTS announcements_status_idx ON public.announcements(status);

-- 7. ENABLE ROW LEVEL SECURITY & PUBLIC READ ACCESS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researcher_research_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read opportunities" ON public.opportunities;
CREATE POLICY "Public read opportunities" ON public.opportunities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read resources" ON public.resources;
CREATE POLICY "Public read resources" ON public.resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read partners" ON public.partners;
CREATE POLICY "Public read partners" ON public.partners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read research groups" ON public.research_groups;
CREATE POLICY "Public read research groups" ON public.research_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read researcher research groups" ON public.researcher_research_groups;
CREATE POLICY "Public read researcher research groups" ON public.researcher_research_groups FOR SELECT USING (true);

-- 8. SEED DEMO DATA (Idempotent ON CONFLICT DO NOTHING)

-- 8A. Research Groups (Reusing existing table)
INSERT INTO public.research_groups (slug, name, description, is_demo)
VALUES
  ('ai-intelligent-systems-group', 'Applied AI & Intelligent Systems Group', 'Conducts multidisciplinary research in deep learning, natural language processing, and ethical machine learning governance.', true),
  ('cyber-forensics-lab', 'Cybersecurity & Digital Forensics Lab', 'Focuses on network intrusion detection, cryptographic protocol evaluation, and defensive operational security.', true),
  ('sustainable-computing-group', 'Sustainable Computing & Embedded IoT Lab', 'Investigates edge computing architectures, energy-efficient IoT sensor networks, and smart city infrastructure.', true)
ON CONFLICT (slug) DO NOTHING;

-- Link researchers to research groups if researchers exist
DO $$
DECLARE
  v_aisha_id uuid;
  v_niran_id uuid;
  v_ai_group_id uuid;
  v_cyber_group_id uuid;
BEGIN
  SELECT id INTO v_aisha_id FROM public.researchers WHERE slug = 'dr-aisha-rahman' LIMIT 1;
  SELECT id INTO v_niran_id FROM public.researchers WHERE slug = 'niran-shrestha' LIMIT 1;
  SELECT id INTO v_ai_group_id FROM public.research_groups WHERE slug = 'ai-intelligent-systems-group' LIMIT 1;
  SELECT id INTO v_cyber_group_id FROM public.research_groups WHERE slug = 'cyber-forensics-lab' LIMIT 1;

  IF v_aisha_id IS NOT NULL AND v_ai_group_id IS NOT NULL THEN
    INSERT INTO public.researcher_research_groups (researcher_id, research_group_id)
    VALUES (v_aisha_id, v_ai_group_id)
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_niran_id IS NOT NULL AND v_cyber_group_id IS NOT NULL THEN
    INSERT INTO public.researcher_research_groups (researcher_id, research_group_id)
    VALUES (v_niran_id, v_cyber_group_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 8B. Events (6 Demo Events)
DO $$
DECLARE
  v_ai_area_id uuid;
  v_cyber_area_id uuid;
  v_aisha_id uuid;
  v_niran_id uuid;
  v_sentinel_proj_id uuid;
BEGIN
  SELECT id INTO v_ai_area_id FROM public.research_areas WHERE slug = 'artificial-intelligence' LIMIT 1;
  SELECT id INTO v_cyber_area_id FROM public.research_areas WHERE slug = 'cybersecurity' LIMIT 1;
  SELECT id INTO v_aisha_id FROM public.researchers WHERE slug = 'dr-aisha-rahman' LIMIT 1;
  SELECT id INTO v_niran_id FROM public.researchers WHERE slug = 'niran-shrestha' LIMIT 1;
  SELECT id INTO v_sentinel_proj_id FROM public.projects WHERE slug = 'sentinel-ai-ids' LIMIT 1;

  INSERT INTO public.events (slug, title, type, description, start_date, end_date, location, registration_url, external_url, status, research_area_id, researcher_id, project_id, is_demo)
  VALUES
    ('islington-computing-symposium-2026', 'Islington Annual Computing & AI Symposium 2026', 'conference', 'Annual institutional research conference gathering faculty, postgraduate researchers, and industry technologists to present emerging findings in computing and applied data science.', '2026-11-14 09:30:00+05:45', '2026-11-15 17:00:00+05:45', 'Islington College Auditorium, Kamalpokhari, Kathmandu', '#demo-preview-register', 'https://islington.edu.np/events', 'upcoming', v_ai_area_id, v_aisha_id, v_sentinel_proj_id, true),

    ('ai-governance-masterclass-2026', 'Masterclass: Ethical AI & Governance in Developing Economies', 'masterclass', 'Interactive masterclass examining algorithmic accountability, fairness metrics in healthcare ML models, and regulatory compliance standards for South Asian institutions.', '2026-10-05 14:00:00+05:45', '2026-10-05 17:30:00+05:45', 'R&D Innovation Suite 3B, Islington College', '#demo-preview-register', null, 'upcoming', v_ai_area_id, v_aisha_id, null, true),

    ('cyber-threat-hunting-workshop', 'Workshop: Practical Cyber Threat Hunting & Traffic Forensics', 'workshop', 'Hands-on technical laboratory on inspecting anomalous enterprise network traffic, rule-based signature generation, and defensive response pipelines.', '2026-09-28 10:00:00+05:45', '2026-09-28 16:00:00+05:45', 'Cyber Forensics Lab, Block C, Islington College', '#demo-preview-register', null, 'upcoming', v_cyber_area_id, v_niran_id, v_sentinel_proj_id, true),

    ('research-methodology-seminar', 'Research Seminar: Rigorous Empirical Design in Computing', 'seminar', 'Faculty seminar providing structured guidance on formulating valid hypotheses, quantitative validation methods, and statistical significance testing in computer science.', '2026-10-20 11:00:00+05:45', '2026-10-20 13:00:00+05:45', 'Seminar Hall 2, Islington College', '#demo-preview-register', null, 'upcoming', null, null, null, true),

    ('ijmr-author-workshop-2026', 'IJMR 2026 Call for Papers: Manuscript Preparation Workshop', 'workshop', 'Editorial workshop for prospective contributors to the Islington Journal of Multidisciplinary Research, focusing on peer-review expectations and camera-ready formatting.', '2026-10-12 13:30:00+05:45', '2026-10-12 15:30:00+05:45', 'Hybrid: Hall 1 & Virtual Webinar', '#demo-preview-register', 'https://islington.edu.np/ijmr', 'upcoming', null, null, null, true),

    ('green-computing-hackathon-briefing', 'Information Session: Green Computing Innovation Challenge', 'call_for_papers', 'Briefing session for undergraduate and postgraduate researchers entering sustainable IoT computing proposals for the 2026 institutional challenge.', '2026-09-18 15:00:00+05:45', '2026-09-18 16:30:00+05:45', 'Incubation Hall, Block B', '#demo-preview-register', null, 'upcoming', null, null, null, true)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- 8C. Opportunities (6 Demo Opportunities)
DO $$
DECLARE
  v_ai_area_id uuid;
  v_cyber_area_id uuid;
  v_sentinel_proj_id uuid;
BEGIN
  SELECT id INTO v_ai_area_id FROM public.research_areas WHERE slug = 'artificial-intelligence' LIMIT 1;
  SELECT id INTO v_cyber_area_id FROM public.research_areas WHERE slug = 'cybersecurity' LIMIT 1;
  SELECT id INTO v_sentinel_proj_id FROM public.projects WHERE slug = 'sentinel-ai-ids' LIMIT 1;

  INSERT INTO public.opportunities (slug, title, type, description, provider, eligibility, amount, deadline, application_url, requirements, status, research_area_id, project_id, is_demo)
  VALUES
    ('islington-faculty-seed-grant-2026', 'Islington Faculty Research Seed Grant 2026', 'grant', 'Institutional competitive grant program providing early-stage capital for faculty-led exploratory research in computing, AI, and information systems.', 'Islington R&D Committee', 'Permanent and contracted faculty members at Islington College.', 'NPR 350,000 – NPR 500,000', '2026-11-30', '#demo-apply-grant', 'Requires a 5-page formal proposal, detailed work plan, milestone deliverables, and budget justification.', 'open', v_ai_area_id, null, true),

    ('undergraduate-ai-fellowship-2026', 'Undergraduate Research Fellowship in Applied AI', 'student_opportunity', 'Mentored research fellowship pairing high-achieving BSc (Hons) Computing students with faculty research fellows on production R&D initiatives.', 'Islington R&D Hub & Center for Innovation', 'Year 2 and Year 3 undergraduate students with a minimum academic standing of 3.2 GPA.', 'NPR 60,000 stipend + lab access', '2026-10-31', '#demo-apply-fellowship', 'Cover letter, academic transcript, faculty recommendation, and a 500-word statement of research interest.', 'open', v_ai_area_id, v_sentinel_proj_id, true),

    ('special-issue-applied-intelligence-cfp', 'Call for Papers: Special Issue on Trustworthy AI Systems', 'call_for_papers', 'Open call for high-quality peer-reviewed submissions exploring explainability, model robustness, and deployment ethics in real-world critical infrastructures.', 'Islington Journal of Multidisciplinary Research (IJMR)', 'Open to academic researchers, doctoral candidates, and industry specialists.', 'Full open-access APC fee waiver', '2026-12-15', 'https://islington.edu.np/ijmr/submit', 'Full papers between 5,000 and 8,000 words prepared strictly following the IJMR publication guidelines.', 'open', v_ai_area_id, null, true),

    ('cyber-research-assistantship-ids', 'Graduate Research Assistantship: Intrusion Detection Systems', 'research_assistantship', 'Part-time research assistant position supporting dataset curations, model evaluations, and packet flow labeling for the Sentinel AI IDS project.', 'Islington Cyber Forensics Lab', 'Postgraduate MSc IT students or final-year computing students with strong Python & Wireshark skills.', 'NPR 25,000 / month (Part-Time)', '2026-10-15', '#demo-apply-assistantship', 'Demonstrated proficiency in Linux, Python networking libraries (Scapy, PyShark), and network security fundamentals.', 'open', v_cyber_area_id, v_sentinel_proj_id, true),

    ('green-computing-student-challenge', 'Green Tech & Sustainable IoT Innovation Challenge', 'competition', 'Competitive prototyping challenge for student teams developing energy-efficient edge-computing devices or renewable-powered monitoring solutions.', 'Islington Innovation Hub & Industry Partners', 'Teams of 2 to 4 Islington College students across any academic year.', 'Total prize pool: NPR 150,000', '2026-11-15', '#demo-apply-challenge', 'Prototype demonstration video, circuit schematic or software repo, and 3-page design overview document.', 'open', null, null, true),

    ('international-travel-grant-2026', 'Faculty International Conference Travel Support Grant', 'funding', 'Travel reimbursement support for faculty members with peer-reviewed accepted full papers at Scopus/WoS-indexed international conferences.', 'Islington Academic Council', 'Full-time faculty presenting oral papers as first or corresponding authors.', 'Up to NPR 200,000 per paper', '2026-12-31', '#demo-apply-travel', 'Official conference acceptance notification, peer review feedback copies, camera-ready PDF, and cost itinerary.', 'open', null, null, true)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- 8D. Resources (8 Demo Resources)
DO $$
DECLARE
  v_ai_area_id uuid;
  v_cyber_area_id uuid;
BEGIN
  SELECT id INTO v_ai_area_id FROM public.research_areas WHERE slug = 'artificial-intelligence' LIMIT 1;
  SELECT id INTO v_cyber_area_id FROM public.research_areas WHERE slug = 'cybersecurity' LIMIT 1;

  INSERT INTO public.resources (slug, title, category, description, content, external_url, research_area_id, status, is_demo)
  VALUES
    ('research-ethics-irb-guidelines', 'Research Ethics Committee & Institutional Review Board (IRB) SOP', 'ethics', 'Official protocol and standard operating procedures for ethical clearance involving human subjects, surveys, data collection, or behavioral research.', 'All research projects conducted by faculty or students involving human subjects, questionnaires, user evaluations, or sensitive dataset acquisitions must secure formal ethical approval prior to beginning empirical collection. Applications must detail data retention policies, participant consent forms, risk mitigation strategies, and anonymization procedures.', '#demo-download-irb-sop', null, 'published', true),

    ('ieee-acm-academic-writing-guide', 'IEEE & ACM Academic Writing and Formatting Standards', 'academic_writing', 'Comprehensive reference manual covering typography, section structuring, equation typesetting, and citation integrity for computing publications.', 'Academic papers must communicate methodology and validation with utmost clarity. This guide specifies standard formatting for mathematical formulations, algorithm pseudocode, table layout guidelines, and strict IEEE/ACM reference formats. Plagiarism or uncredited paraphrasing is strictly monitored using Turnitin with a similarity threshold below 15%.', '#demo-view-guide', null, 'published', true),

    ('open-access-publication-protocol', 'Open Access Publication Support & APC Assistance Protocol', 'publication_support', 'Guidance for researchers seeking institutional financial subsidies and compliance assistance for publishing in indexed Open Access journals.', 'Islington College supports disseminating scientific inquiry without paywall barriers. Under this protocol, researchers with accepted manuscripts in Q1/Q2 Scopus-indexed Open Access venues may request institutional Article Processing Charge (APC) subsidies through the R&D Director’s office.', '#demo-apc-guidelines', null, 'published', true),

    ('ai-assisted-research-ethics-policy', 'AI-Assisted Research & Authorship Ethics Policy', 'ai_ethics', 'Institutional guidelines regarding the permissible and transparent use of Large Language Models and generative AI tools in academic research.', 'Generative AI tools and LLMs cannot be listed as co-authors on any scholarly publication or research project. Researchers must transparently disclose any utilization of AI tools for code drafting, proofreading, or data synthesis within the paper’s Methodology or Acknowledgements section.', '#demo-ai-policy', v_ai_area_id, 'published', true),

    ('standard-research-proposal-template', 'Standard Research Project Proposal Template (DOCX/LaTeX)', 'templates', 'Downloadable structured template for formulating competitive grant submissions and institutional research proposals.', 'Contains pre-formatted sections for Executive Summary, Problem Formulation, State of the Art & Literature Review, Detailed Research Methodology, Risk Matrix, Work Breakdown Structure (Gantt chart), Milestone Deliverables, and Itemized Budget Justification.', '#demo-download-proposal-template', null, 'published', true),

    ('research-data-protection-privacy-sop', 'Research Data Protection, Security & Privacy SOP', 'data_protection', 'Standard operating procedure for storing, encrypting, and handling experimental datasets in compliance with digital privacy standards.', 'Sensitive datasets, network capture pcap files, and user telemetry collected during research must be encrypted at rest using AES-256 and stored on institutional access-controlled servers. De-identification and pseudonymization pipelines must be validated prior to data sharing.', '#demo-download-privacy-sop', v_cyber_area_id, 'published', true),

    ('advanced-computing-lab-facility-guide', 'Advanced Computing & AI Lab Facility Access Guide', 'facilities', 'Operational protocols, compute node reservation schedules, and safety instructions for accessing high-performance GPU workstations.', 'The R&D Advanced Computing Lab provides specialized hardware workstations equipped with NVIDIA RTX GPUs, isolated subnet testbeds, and hardware logic analyzers for faculty and postgraduate research projects. Access requests require approval from the Lab Supervisor.', '#demo-lab-facilities', v_ai_area_id, 'published', true),

    ('literature-review-citation-toolkit', 'Literature Review & Systematic Mapping Toolkit', 'methodology', 'Methodological toolkit for conducting PRISMA-compliant systematic literature reviews and bibliometric analyses in computer science.', 'Presents step-by-step guidance on query formulation for Scopus, IEEE Xplore, and Google Scholar, criteria for inclusion and exclusion, data extraction tables, and reference management synchronization using Zotero and Mendeley.', '#demo-toolkit-guide', null, 'published', true)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- 8E. Partners (5 Demo Partners)
DO $$
DECLARE
  v_sentinel_proj_id uuid;
BEGIN
  SELECT id INTO v_sentinel_proj_id FROM public.projects WHERE slug = 'sentinel-ai-ids' LIMIT 1;

  INSERT INTO public.partners (slug, name, type, description, website_url, project_id, status, is_demo)
  VALUES
    ('london-metropolitan-university', 'London Metropolitan University', 'academic', 'Primary international academic partner providing quality assurance, curriculum collaborative research, and dual-award joint scholarly initiatives.', 'https://www.londonmet.ac.uk', null, 'active', true),

    ('nepal-internet-foundation', 'Nepal Internet Foundation', 'community', 'Civil society organization collaborating on internet measurement, community digital literacy, and internet governance research across Nepal.', 'https://nif.org.np', null, 'active', true),

    ('techsolutions-nepal', 'TechSolutions Nepal Pvt. Ltd.', 'industry', 'Leading enterprise software engineering firm co-developing intrusion detection testbeds, industrial telemetry pipelines, and hosting student research interns.', 'https://techsolutions.com.np', v_sentinel_proj_id, 'active', true),

    ('center-for-cybersecurity-nepal', 'Center for Cybersecurity Research Nepal', 'government', 'National research alliance partnering on critical infrastructure threat intelligence, vulnerability disclosures, and cyber defense training programs.', 'https://cybersecurity.org.np', v_sentinel_proj_id, 'active', true),

    ('ai-governance-asia-initiative', 'AI Governance Asia Initiative', 'international', 'Regional research consortium advancing ethical machine learning deployment standards, multilingual NLP benchmarks, and AI policy harmonization.', 'https://aigov-asia.org', null, 'active', true)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- 8F. Announcements (4 Demo Announcements)
INSERT INTO public.announcements (slug, title, summary, content, published_at, status, external_url, is_demo)
VALUES
  ('launch-of-islington-rd-digital-hub', 'Official Launch of the Islington R&D Digital Hub', 'Islington College officially unveils its unified R&D Connect Digital Hub to interconnect faculty researchers, ongoing projects, publications, and collaborative opportunities.', 'We are proud to announce the formal launch of the Islington R&D Connect Digital Hub. This platform serves as the central digital nerve center for our academic community, providing seamless public discovery of faculty research profiles, ongoing projects, scholarly outputs, and grant opportunities. The hub demonstrates Islington College''s enduring commitment to pioneering applied research, fostering academic innovation, and strengthening industry partnerships.', '2026-09-01 09:00:00+05:45', 'published', null, true),

  ('ijmr-vol-4-call-for-papers', 'Call for Papers: Islington Journal of Multidisciplinary Research (IJMR) Vol. 4', 'Submissions are invited for Volume 4 of the peer-reviewed Islington Journal of Multidisciplinary Research spanning computing, business technology, and applied sciences.', 'The Editorial Board of the Islington Journal of Multidisciplinary Research (IJMR) announces the open Call for Papers for Vol. 4, Issue 1. Authors are encouraged to submit original research papers, empirical studies, and comprehensive review articles. All submissions undergo double-blind peer review by an international editorial panel. Accepted papers are published open access with zero publication fees for institutional contributors.', '2026-09-08 10:30:00+05:45', 'published', 'https://islington.edu.np/ijmr', true),

  ('2026-faculty-seed-grants-open', '2026 Faculty Research Seed Grants Cycle Open for Applications', 'The Islington R&D Committee is accepting grant applications from faculty researchers for high-impact innovative projects.', 'Faculty members across all computing and business technology faculties are invited to submit proposals for the 2026 Faculty Research Seed Grants. Grants provide financial awards between NPR 350,000 and NPR 500,000 for exploratory computing and applied intelligence research. Proposals must be submitted via the Researcher Submissions Portal by 30 November 2026.', '2026-09-10 11:00:00+05:45', 'published', null, true),

  ('guest-lecture-series-trustworthy-ai', 'Distinguished Guest Lecture: Building Trustworthy and Explainable AI Systems', 'Visiting scholar Dr. Elena Rostova presents an institutional lecture on verifiable machine learning models for high-consequence enterprise environments.', 'The Islington Applied AI & Intelligent Systems Group is pleased to host Dr. Elena Rostova for a distinguished guest lecture titled "Building Trustworthy and Explainable AI Systems: Bridging Theory and Production Deployments". The lecture will take place in the Islington College Auditorium on 14 October 2026. All faculty members, postgraduate researchers, and students are cordially invited.', '2026-09-12 12:00:00+05:45', 'published', null, true)
ON CONFLICT (slug) DO NOTHING;
