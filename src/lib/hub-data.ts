import { createSupabaseAdminClient, createSupabaseServerClient } from "./supabase/server";

export type HubEvent = {
  id: string;
  slug: string;
  title: string;
  type: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  registration_url: string | null;
  external_url: string | null;
  status: string;
  research_area_id?: string | null;
  researcher_id?: string | null;
  project_id?: string | null;
  is_demo: boolean;
  research_area?: { id: string; name: string; slug: string } | null;
  researcher?: { id: string; name: string; slug: string } | null;
  project?: { id: string; title: string; slug: string } | null;
};

export type HubOpportunity = {
  id: string;
  slug: string;
  title: string;
  type: string;
  description: string;
  provider: string | null;
  eligibility: string | null;
  amount: string | null;
  deadline: string | null;
  application_url: string | null;
  requirements: string | null;
  status: string;
  research_area_id?: string | null;
  project_id?: string | null;
  is_demo: boolean;
  research_area?: { id: string; name: string; slug: string } | null;
  project?: { id: string; title: string; slug: string } | null;
};

export type HubResource = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string | null;
  external_url: string | null;
  research_area_id?: string | null;
  status: string;
  is_demo: boolean;
  research_area?: { id: string; name: string; slug: string } | null;
};

export type HubPartner = {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  website_url: string | null;
  project_id?: string | null;
  status: string;
  is_demo: boolean;
  project?: { id: string; title: string; slug: string } | null;
};

export type HubAnnouncement = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  published_at: string;
  status: string;
  external_url: string | null;
  is_demo: boolean;
};

export type HubResearchGroup = {
  id: string;
  slug: string;
  name: string;
  description: string;
  is_demo: boolean;
  researchers?: { id: string; name: string; slug: string; title: string }[];
};

// Fallback / canonical content datasets
export const DEMO_EVENTS: HubEvent[] = [
  {
    id: "e1-symposium-2026",
    slug: "islington-computing-symposium-2026",
    title: "Islington Annual Computing & AI Symposium 2026",
    type: "conference",
    description: "Annual institutional research conference gathering faculty, postgraduate researchers, and industry technologists to present emerging findings in computing, intelligent systems, and applied data science.",
    start_date: "2026-11-14T09:30:00+05:45",
    end_date: "2026-11-15T17:00:00+05:45",
    location: "Islington College Auditorium, Kamalpokhari, Kathmandu",
    registration_url: "#demo-preview-register",
    external_url: "https://islington.edu.np/events",
    status: "upcoming",
    is_demo: true,
    research_area: { id: "ra-ai", name: "Artificial Intelligence", slug: "artificial-intelligence" },
    researcher: { id: "res-aisha", name: "Dr Aisha Rahman", slug: "dr-aisha-rahman" },
    project: { id: "proj-sentinel", title: "Sentinel AI IDS", slug: "sentinel-ai-ids" },
  },
  {
    id: "e2-ai-masterclass",
    slug: "ai-governance-masterclass-2026",
    title: "Masterclass: Ethical AI & Governance in Developing Economies",
    type: "masterclass",
    description: "Interactive masterclass examining algorithmic accountability, fairness metrics in healthcare ML models, and regulatory compliance standards for South Asian institutions.",
    start_date: "2026-10-05T14:00:00+05:45",
    end_date: "2026-10-05T17:30:00+05:45",
    location: "R&D Innovation Suite 3B, Islington College",
    registration_url: "#demo-preview-register",
    external_url: null,
    status: "upcoming",
    is_demo: true,
    research_area: { id: "ra-ai", name: "Artificial Intelligence", slug: "artificial-intelligence" },
    researcher: { id: "res-aisha", name: "Dr Aisha Rahman", slug: "dr-aisha-rahman" },
  },
  {
    id: "e3-cyber-workshop",
    slug: "cyber-threat-hunting-workshop",
    title: "Workshop: Practical Cyber Threat Hunting & Traffic Forensics",
    type: "workshop",
    description: "Hands-on technical laboratory on inspecting anomalous enterprise network traffic, rule-based signature generation, and defensive response pipelines.",
    start_date: "2026-09-28T10:00:00+05:45",
    end_date: "2026-09-28T16:00:00+05:45",
    location: "Cyber Forensics Lab, Block C, Islington College",
    registration_url: "#demo-preview-register",
    external_url: null,
    status: "upcoming",
    is_demo: true,
    research_area: { id: "ra-cyber", name: "Cybersecurity", slug: "cybersecurity" },
    researcher: { id: "res-niran", name: "Niran Shrestha", slug: "niran-shrestha" },
    project: { id: "proj-sentinel", title: "Sentinel AI IDS", slug: "sentinel-ai-ids" },
  },
  {
    id: "e4-methodology-seminar",
    slug: "research-methodology-seminar",
    title: "Research Seminar: Rigorous Empirical Design in Computing",
    type: "seminar",
    description: "Faculty seminar providing structured guidance on formulating valid hypotheses, quantitative validation methods, and statistical significance testing in computer science.",
    start_date: "2026-10-20T11:00:00+05:45",
    end_date: "2026-10-20T13:00:00+05:45",
    location: "Seminar Hall 2, Islington College",
    registration_url: "#demo-preview-register",
    external_url: null,
    status: "upcoming",
    is_demo: true,
  },
  {
    id: "e5-ijmr-workshop",
    slug: "ijmr-author-workshop-2026",
    title: "IJMR 2026 Call for Papers: Manuscript Preparation Workshop",
    type: "workshop",
    description: "Editorial workshop for prospective contributors to the Islington Journal of Multidisciplinary Research, focusing on peer-review expectations and camera-ready formatting.",
    start_date: "2026-10-12T13:30:00+05:45",
    end_date: "2026-10-12T15:30:00+05:45",
    location: "Hybrid: Hall 1 & Virtual Webinar",
    registration_url: "#demo-preview-register",
    external_url: "https://islington.edu.np/ijmr",
    status: "upcoming",
    is_demo: true,
  },
  {
    id: "e6-green-hackathon",
    slug: "green-computing-hackathon-briefing",
    title: "Information Session: Green Computing Innovation Challenge",
    type: "call_for_papers",
    description: "Briefing session for undergraduate and postgraduate researchers entering sustainable IoT computing proposals for the 2026 institutional challenge.",
    start_date: "2026-09-18T15:00:00+05:45",
    end_date: "2026-09-18T16:30:00+05:45",
    location: "Incubation Hall, Block B, Islington College",
    registration_url: "#demo-preview-register",
    external_url: null,
    status: "upcoming",
    is_demo: true,
  },
];

export const DEMO_OPPORTUNITIES: HubOpportunity[] = [
  {
    id: "op1-seed-grant",
    slug: "islington-faculty-seed-grant-2026",
    title: "Islington Faculty Research Seed Grant 2026",
    type: "grant",
    description: "Institutional competitive grant program providing early-stage capital for faculty-led exploratory research in computing, AI, and information systems.",
    provider: "Islington R&D Committee",
    eligibility: "Permanent and contracted faculty members at Islington College.",
    amount: "NPR 350,000 – NPR 500,000",
    deadline: "2026-11-30",
    application_url: "/login?redirect=/researcher/submissions",
    requirements: "Requires a 5-page formal proposal, detailed work plan, milestone deliverables, and budget justification.",
    status: "open",
    is_demo: true,
    research_area: { id: "ra-ai", name: "Artificial Intelligence", slug: "artificial-intelligence" },
  },
  {
    id: "op2-ug-fellowship",
    slug: "undergraduate-ai-fellowship-2026",
    title: "Undergraduate Research Fellowship in Applied AI",
    type: "student_opportunity",
    description: "Mentored research fellowship pairing high-achieving BSc (Hons) Computing students with faculty research fellows on production R&D initiatives.",
    provider: "Islington R&D Hub & Center for Innovation",
    eligibility: "Year 2 and Year 3 undergraduate students with a minimum academic standing of 3.2 GPA.",
    amount: "NPR 60,000 stipend + lab access",
    deadline: "2026-10-31",
    application_url: "/login?redirect=/researcher/submissions",
    requirements: "Cover letter, academic transcript, faculty recommendation, and a 500-word statement of research interest.",
    status: "open",
    is_demo: true,
    research_area: { id: "ra-ai", name: "Artificial Intelligence", slug: "artificial-intelligence" },
    project: { id: "proj-sentinel", title: "Sentinel AI IDS", slug: "sentinel-ai-ids" },
  },
  {
    id: "op3-ijmr-special-issue",
    slug: "special-issue-applied-intelligence-cfp",
    title: "Call for Papers: Special Issue on Trustworthy AI Systems",
    type: "call_for_papers",
    description: "Open call for high-quality peer-reviewed submissions exploring explainability, model robustness, and deployment ethics in real-world critical infrastructures.",
    provider: "Islington Journal of Multidisciplinary Research (IJMR)",
    eligibility: "Open to academic researchers, doctoral candidates, and industry specialists.",
    amount: "Full open-access APC fee waiver",
    deadline: "2026-12-15",
    application_url: "/ijmr",
    requirements: "Full papers between 5,000 and 8,000 words prepared strictly following the IJMR publication guidelines.",
    status: "open",
    is_demo: true,
    research_area: { id: "ra-ai", name: "Artificial Intelligence", slug: "artificial-intelligence" },
  },
  {
    id: "op4-cyber-ra",
    slug: "cyber-research-assistantship-ids",
    title: "Graduate Research Assistantship: Intrusion Detection Systems",
    type: "research_assistantship",
    description: "Part-time research assistant position supporting dataset curations, model evaluations, and packet flow labeling for the Sentinel AI IDS project.",
    provider: "Islington Cyber Forensics Lab",
    eligibility: "Postgraduate MSc IT students or final-year computing students with strong Python & Wireshark skills.",
    amount: "NPR 25,000 / month (Part-Time)",
    deadline: "2026-10-15",
    application_url: "/login?redirect=/researcher/submissions",
    requirements: "Demonstrated proficiency in Linux, Python networking libraries (Scapy, PyShark), and network security fundamentals.",
    status: "open",
    is_demo: true,
    research_area: { id: "ra-cyber", name: "Cybersecurity", slug: "cybersecurity" },
    project: { id: "proj-sentinel", title: "Sentinel AI IDS", slug: "sentinel-ai-ids" },
  },
  {
    id: "op5-green-comp",
    slug: "green-computing-student-challenge",
    title: "Green Tech & Sustainable IoT Innovation Challenge",
    type: "competition",
    description: "Competitive prototyping challenge for student teams developing energy-efficient edge-computing devices or renewable-powered monitoring solutions.",
    provider: "Islington Innovation Hub & Industry Partners",
    eligibility: "Teams of 2 to 4 Islington College students across any academic year.",
    amount: "Total prize pool: NPR 150,000",
    deadline: "2026-11-15",
    application_url: "/login?redirect=/researcher/submissions",
    requirements: "Prototype demonstration video, circuit schematic or software repo, and 3-page design overview document.",
    status: "open",
    is_demo: true,
  },
  {
    id: "op6-travel-grant",
    slug: "international-travel-grant-2026",
    title: "Faculty International Conference Travel Support Grant",
    type: "funding",
    description: "Travel reimbursement support for faculty members with peer-reviewed accepted full papers at Scopus/WoS-indexed international conferences.",
    provider: "Islington Academic Council",
    eligibility: "Full-time faculty presenting oral papers as first or corresponding authors.",
    amount: "Up to NPR 200,000 per paper",
    deadline: "2026-12-31",
    application_url: "/login?redirect=/researcher/submissions",
    requirements: "Official conference acceptance notification, peer review feedback copies, camera-ready PDF, and cost itinerary.",
    status: "open",
    is_demo: true,
  },
];

export const DEMO_RESOURCES: HubResource[] = [
  {
    id: "res1-ethics-irb",
    slug: "research-ethics-irb-guidelines",
    title: "Research Ethics Committee & Institutional Review Board (IRB) SOP",
    category: "ethics",
    description: "Official protocol and standard operating procedures for ethical clearance involving human subjects, surveys, data collection, or behavioral research.",
    content: "All research projects conducted by faculty or students involving human subjects, questionnaires, user evaluations, or sensitive dataset acquisitions must secure formal ethical approval prior to beginning empirical collection. Applications must detail data retention policies, participant consent forms, risk mitigation strategies, and anonymization procedures.",
    external_url: "/ethics",
    status: "published",
    is_demo: true,
  },
  {
    id: "res2-writing-guide",
    slug: "ieee-acm-academic-writing-guide",
    title: "IEEE & ACM Academic Writing and Formatting Standards",
    category: "academic_writing",
    description: "Comprehensive reference manual covering typography, section structuring, equation typesetting, and citation integrity for computing publications.",
    content: "Academic papers must communicate methodology and validation with utmost clarity. This guide specifies standard formatting for mathematical formulations, algorithm pseudocode, table layout guidelines, and strict IEEE/ACM reference formats. Plagiarism or uncredited paraphrasing is strictly monitored using Turnitin with a similarity threshold below 15%.",
    external_url: "/research-support",
    status: "published",
    is_demo: true,
  },
  {
    id: "res3-open-access",
    slug: "open-access-publication-protocol",
    title: "Open Access Publication Support & APC Assistance Protocol",
    category: "publication_support",
    description: "Guidance for researchers seeking institutional financial subsidies and compliance assistance for publishing in indexed Open Access journals.",
    content: "Islington College supports disseminating scientific inquiry without paywall barriers. Under this protocol, researchers with accepted manuscripts in Q1/Q2 Scopus-indexed Open Access venues may request institutional Article Processing Charge (APC) subsidies through the R&D Director’s office.",
    external_url: "/funding",
    status: "published",
    is_demo: true,
  },
  {
    id: "res4-ai-ethics",
    slug: "ai-assisted-research-ethics-policy",
    title: "AI-Assisted Research & Authorship Ethics Policy",
    category: "ai_ethics",
    description: "Institutional guidelines regarding the permissible and transparent use of Large Language Models and generative AI tools in academic research.",
    content: "Generative AI tools and LLMs cannot be listed as co-authors on any scholarly publication or research project. Researchers must transparently disclose any utilization of AI tools for code drafting, proofreading, or data synthesis within the paper’s Methodology or Acknowledgements section.",
    external_url: "/ethics",
    status: "published",
    is_demo: true,
    research_area: { id: "ra-ai", name: "Artificial Intelligence", slug: "artificial-intelligence" },
  },
  {
    id: "res5-proposal-template",
    slug: "standard-research-proposal-template",
    title: "Standard Research Project Proposal Template (DOCX/LaTeX)",
    category: "templates",
    description: "Downloadable structured template for formulating competitive grant submissions and institutional research proposals.",
    content: "Contains pre-formatted sections for Executive Summary, Problem Formulation, State of the Art & Literature Review, Detailed Research Methodology, Risk Matrix, Work Breakdown Structure (Gantt chart), Milestone Deliverables, and Itemized Budget Justification.",
    external_url: "/research-support",
    status: "published",
    is_demo: true,
  },
  {
    id: "res6-privacy-sop",
    slug: "research-data-protection-privacy-sop",
    title: "Research Data Protection, Security & Privacy SOP",
    category: "data_protection",
    description: "Standard operating procedure for storing, encrypting, and handling experimental datasets in compliance with digital privacy standards.",
    content: "Sensitive datasets, network capture pcap files, and user telemetry collected during research must be encrypted at rest using AES-256 and stored on institutional access-controlled servers. De-identification and pseudonymization pipelines must be validated prior to data sharing.",
    external_url: "/ethics",
    status: "published",
    is_demo: true,
    research_area: { id: "ra-cyber", name: "Cybersecurity", slug: "cybersecurity" },
  },
  {
    id: "res7-facility-guide",
    slug: "advanced-computing-lab-facility-guide",
    title: "Advanced Computing & AI Lab Facility Access Guide",
    category: "facilities",
    description: "Operational protocols, compute node reservation schedules, and safety instructions for accessing high-performance GPU workstations.",
    content: "The R&D Advanced Computing Lab provides specialized hardware workstations equipped with NVIDIA RTX GPUs, isolated subnet testbeds, and hardware logic analyzers for faculty and postgraduate research projects. Access requests require approval from the Lab Supervisor.",
    external_url: "/research-support",
    status: "published",
    is_demo: true,
    research_area: { id: "ra-ai", name: "Artificial Intelligence", slug: "artificial-intelligence" },
  },
  {
    id: "res8-literature-toolkit",
    slug: "literature-review-citation-toolkit",
    title: "Literature Review & Systematic Mapping Toolkit",
    category: "methodology",
    description: "Methodological toolkit for conducting PRISMA-compliant systematic literature reviews and bibliometric analyses in computer science.",
    content: "Presents step-by-step guidance on query formulation for Scopus, IEEE Xplore, and Google Scholar, criteria for inclusion and exclusion, data extraction tables, and reference management synchronization using Zotero and Mendeley.",
    external_url: "/research-support",
    status: "published",
    is_demo: true,
  },
  {
    id: "res9-research-tools",
    slug: "research-tools-frameworks-directory",
    title: "Computational Research Tools & Frameworks Directory",
    category: "tools",
    description: "Curated catalog of licensed academic software, open-source benchmarking suites, simulation engines, and static code analyzers.",
    content: "Islington researchers have access to specialized simulation environments including MATLAB/Simulink, NS-3 for network modeling, PyTorch/TensorFlow GPU clusters, and Wireshark enterprise analyzers. This directory outlines software provisioning and license keys.",
    external_url: "/research-support",
    status: "published",
    is_demo: true,
  },
  {
    id: "res10-ethics-committee",
    slug: "ethics-committee-review-charter",
    title: "Institutional Research Ethics Committee (REC) Charter & Application Process",
    category: "ethics_committee",
    description: "Composition of the ethics committee, review schedules, expedited review criteria, and formal ethical clearance application pack.",
    content: "The Research Ethics Committee oversees research integrity, human subject protections, and algorithmic fairness. Regular review cycles convene monthly. Submissions requiring expedited or full committee review must submit the standard Ethical Clearance Application Form alongside consent instruments.",
    external_url: "/ethics",
    status: "published",
    is_demo: true,
  },
];

export const DEMO_PARTNERS: HubPartner[] = [
  {
    id: "p1-london-met",
    slug: "london-metropolitan-university",
    name: "London Metropolitan University",
    type: "academic",
    description: "Primary international academic partner providing quality assurance, curriculum collaborative research, and dual-award joint scholarly initiatives.",
    website_url: "https://www.londonmet.ac.uk",
    status: "active",
    is_demo: true,
  },
  {
    id: "p2-nif",
    slug: "icimod",
    name: "International Centre for Integrated Mountain Development",
    type: "research",
    description: "Regional knowledge centre working on sustainable mountain development, climate resilience, and data-informed policy across the Hindu Kush Himalaya.",
    website_url: "https://www.icimod.org",
    status: "active",
    is_demo: true,
  },
  {
    id: "p3-techsolutions",
    slug: "nepal-academy-of-science-and-technology",
    name: "Nepal Academy of Science and Technology",
    type: "research",
    description: "National science and technology institution supporting research collaboration, innovation, and scientific capacity building in Nepal.",
    website_url: "https://nast.org.np",
    status: "active",
    is_demo: true,
    project: { id: "proj-sentinel", title: "Sentinel AI IDS", slug: "sentinel-ai-ids" },
  },
  {
    id: "p4-ccrn",
    slug: "kathmandu-university",
    name: "Kathmandu University",
    type: "academic",
    description: "Nepali university partner represented in the hub for academic exchange, joint supervision, and interdisciplinary research collaboration.",
    website_url: "https://ku.edu.np",
    status: "active",
    is_demo: true,
    project: { id: "proj-sentinel", title: "Sentinel AI IDS", slug: "sentinel-ai-ids" },
  },
  {
    id: "p5-aigov",
    slug: "nepal-research-and-education-network",
    name: "Nepal Research and Education Network",
    type: "network",
    description: "Research and education network supporting connectivity, knowledge exchange, and digital research infrastructure for institutions across Nepal.",
    website_url: "https://nren.net.np",
    status: "active",
    is_demo: true,
  },
];

export const DEMO_ANNOUNCEMENTS: HubAnnouncement[] = [
  {
    id: "an1-launch",
    slug: "launch-of-islington-rd-digital-hub",
    title: "Islington R&D Connect Hub Opens for Research Discovery",
    summary: "The research office has opened the R&D Connect hub for discovering people, projects, publications, resources, and collaboration opportunities.",
    content: "The Islington R&D Connect hub is now available to the college community. Researchers can maintain profiles, share projects and publications, find support resources, and follow opportunities coordinated by the Research and Development Centre.",
    published_at: "2026-09-01T09:00:00+05:45",
    status: "published",
    external_url: null,
    is_demo: true,
  },
  {
    id: "an2-ijmr-call",
    slug: "ijmr-vol-4-call-for-papers",
    title: "IJMR Invites Manuscripts for Volume 4",
    summary: "The Islington Journal of Multidisciplinary Research invites original research articles, reviews, and applied studies for its next volume.",
    content: "The editorial team welcomes original research articles, empirical studies, and comprehensive reviews across computing, business technology, education, and applied sciences. Authors should consult the journal guidelines before submitting a manuscript for editorial screening and peer review.",
    published_at: "2026-09-08T10:30:00+05:45",
    status: "published",
    external_url: "/ijmr",
    is_demo: true,
  },
  {
    id: "an3-grants",
    slug: "2026-faculty-seed-grants-open",
    title: "Faculty Seed Grant Applications Open",
    summary: "Faculty researchers can submit proposals for the 2026 internal seed grant cycle through the researcher portal.",
    content: "The Research and Development Centre is accepting proposals for small-scale projects that demonstrate a clear research question, feasible methodology, expected outputs, and a realistic delivery plan. Applications should be submitted through the researcher portal before the published closing date.",
    published_at: "2026-09-10T11:00:00+05:45",
    status: "published",
    external_url: "/login?redirect=/researcher/submissions",
    is_demo: true,
  },
  {
    id: "an4-lecture",
    slug: "guest-lecture-series-trustworthy-ai",
    title: "Guest Lecture on Trustworthy AI Systems",
    summary: "The Applied AI and Intelligent Systems Group will host an open lecture on explainability, evaluation, and responsible deployment.",
    content: "The session will examine practical approaches to evaluating machine learning systems in high-consequence settings, including documentation, uncertainty communication, and human oversight. Faculty members, researchers, and students are invited to attend.",
    published_at: "2026-09-12T12:00:00+05:45",
    status: "published",
    external_url: "/events",
    is_demo: true,
  },
];

export const DEMO_GROUPS: HubResearchGroup[] = [
  {
    id: "g1-ai",
    slug: "ai-intelligent-systems-group",
    name: "Applied AI & Intelligent Systems Group",
    description: "Conducts multidisciplinary research in deep learning, natural language processing, and ethical machine learning governance.",
    is_demo: true,
    researchers: [
      { id: "res-aisha", name: "Dr Aisha Rahman", slug: "dr-aisha-rahman", title: "Senior Lecturer, Computing" },
    ],
  },
  {
    id: "g2-cyber",
    slug: "cyber-forensics-lab",
    name: "Cybersecurity & Digital Forensics Lab",
    description: "Focuses on network intrusion detection, cryptographic protocol evaluation, and defensive operational security.",
    is_demo: true,
    researchers: [
      { id: "res-niran", name: "Niran Shrestha", slug: "niran-shrestha", title: "Lecturer, Networking & Security" },
    ],
  },
  {
    id: "g3-green",
    slug: "sustainable-computing-group",
    name: "Sustainable Computing & Embedded IoT Lab",
    description: "Investigates edge computing architectures, energy-efficient IoT sensor networks, and smart city infrastructure.",
    is_demo: true,
    researchers: [],
  },
];

// Helper to sanitize arrays
function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

// ----------------------------------------------------------------------------
// DATA ACCESS FUNCTIONS
// ----------------------------------------------------------------------------

export async function getEvents(useAdminClient = false): Promise<HubEvent[]> {
  try {
    const client = useAdminClient ? createSupabaseAdminClient() : createSupabaseServerClient();
    const { data, error } = await client
      .from("events")
      .select("id, slug, title, type, description, start_date, starts_at, end_date, ends_at, location, registration_url, external_url, status, is_demo, research_area_id, researcher_id, project_id")
      .order("start_date", { ascending: true, nullsFirst: false });

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        type: d.type || "conference",
        description: d.description,
        start_date: d.start_date || d.starts_at || null,
        end_date: d.end_date || d.ends_at || null,
        location: d.location || null,
        registration_url: d.registration_url || null,
        external_url: d.external_url || null,
        status: d.status || "upcoming",
        research_area_id: d.research_area_id || null,
        researcher_id: d.researcher_id || null,
        project_id: d.project_id || null,
        is_demo: d.is_demo ?? true,
      }));
    }

    const { data: baseData, error: baseError } = await client
      .from("events")
      .select("id, slug, title, description, starts_at, ends_at, location, status, is_demo")
      .order("starts_at", { ascending: true, nullsFirst: false });

    if (!baseError && baseData && baseData.length > 0) {
      return baseData.map((d) => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        type: "conference",
        description: d.description,
        start_date: d.starts_at || null,
        end_date: d.ends_at || null,
        location: d.location || null,
        registration_url: null,
        external_url: null,
        status: d.status || "upcoming",
        is_demo: d.is_demo ?? true,
      }));
    }
  } catch {
    // fallback
  }
  return DEMO_EVENTS;
}

export async function getEventBySlug(slug: string): Promise<HubEvent | null> {
  const events = await getEvents();
  return events.find((e) => e.slug === slug) || null;
}

export async function getOpportunities(useAdminClient = false): Promise<HubOpportunity[]> {
  try {
    const client = useAdminClient ? createSupabaseAdminClient() : createSupabaseServerClient();
    const { data, error } = await client
      .from("opportunities")
      .select("id, slug, title, type, description, provider, eligibility, amount, deadline, closing_date, application_url, url, requirements, status, is_demo, research_area_id, project_id")
      .order("deadline", { ascending: true, nullsFirst: false });

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        type: d.type || "grant",
        description: d.description,
        provider: d.provider || "Islington College",
        eligibility: d.eligibility || null,
        amount: d.amount || null,
        deadline: d.deadline || d.closing_date || null,
        application_url: d.application_url || d.url || null,
        requirements: d.requirements || null,
        status: d.status || "open",
        research_area_id: d.research_area_id || null,
        project_id: d.project_id || null,
        is_demo: d.is_demo ?? true,
      }));
    }

    const { data: baseData, error: baseError } = await client
      .from("opportunities")
      .select("id, slug, title, description, status, closing_date, url, is_demo")
      .order("closing_date", { ascending: true, nullsFirst: false });

    if (!baseError && baseData) {
      return baseData.map((d) => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        type: "grant",
        description: d.description,
        provider: "Islington College",
        eligibility: null,
        amount: null,
        deadline: d.closing_date || null,
        application_url: d.url || null,
        requirements: null,
        status: d.status || "open",
        is_demo: d.is_demo ?? true,
      }));
    }
  } catch {
    // fallback
  }
  return DEMO_OPPORTUNITIES;
}

export async function getOpportunityBySlug(slug: string): Promise<HubOpportunity | null> {
  const opps = await getOpportunities();
  return opps.find((o) => o.slug === slug) || null;
}

export async function getResources(useAdminClient = false): Promise<HubResource[]> {
  try {
    const client = useAdminClient ? createSupabaseAdminClient() : createSupabaseServerClient();
    const { data, error } = await client
      .from("resources")
      .select("id, slug, title, category, description, content, external_url, status, is_demo, research_area_id")
      .order("title");

    if (!error && data && data.length > 0) {
      return data as HubResource[];
    }
  } catch {
    // fallback
  }
  return DEMO_RESOURCES;
}

export async function getResourceBySlug(slug: string): Promise<HubResource | null> {
  const resources = await getResources();
  return resources.find((r) => r.slug === slug) || null;
}

export async function getPartners(useAdminClient = false): Promise<HubPartner[]> {
  try {
    const client = useAdminClient ? createSupabaseAdminClient() : createSupabaseServerClient();
    const { data, error } = await client
      .from("partners")
      .select("id, slug, name, type, description, website_url, status, is_demo, project_id")
      .order("name");

    if (!error && data && data.length > 0) {
      return data as HubPartner[];
    }
  } catch {
    // fallback
  }
  return DEMO_PARTNERS;
}

export async function getAnnouncements(useAdminClient = false): Promise<HubAnnouncement[]> {
  try {
    const client = useAdminClient ? createSupabaseAdminClient() : createSupabaseServerClient();
    const { data, error } = await client
      .from("announcements")
      .select("id, slug, title, summary, content, published_at, status, external_url, is_demo")
      .order("published_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as HubAnnouncement[];
    }
  } catch {
    // fallback
  }
  return DEMO_ANNOUNCEMENTS;
}

export async function getAnnouncementBySlug(slug: string): Promise<HubAnnouncement | null> {
  const announcements = await getAnnouncements();
  return announcements.find((a) => a.slug === slug) || null;
}

export async function getResearchGroups(useAdminClient = false): Promise<HubResearchGroup[]> {
  try {
    const client = useAdminClient ? createSupabaseAdminClient() : createSupabaseServerClient();
    const { data, error } = await client
      .from("research_groups")
      .select(`
        id, slug, name, description, is_demo,
        researcher_research_groups (
          researchers (id, name, slug, title)
        )
      `)
      .order("name");

    if (!error && data && data.length > 0) {
      return data.map((d) => {
        const researchers = (d.researcher_research_groups || [])
          .map((rrg: { researchers: unknown }) => toItem(rrg.researchers as { id: string; name: string; slug: string; title: string }))
          .filter(Boolean) as { id: string; name: string; slug: string; title: string }[];

        return {
          id: d.id,
          slug: d.slug,
          name: d.name,
          description: d.description,
          is_demo: d.is_demo ?? true,
          researchers,
        };
      });
    }
  } catch {
    // fallback
  }
  return DEMO_GROUPS;
}

// ----------------------------------------------------------------------------
// NEEDS ATTENTION (Computed dynamically in memory)
// ----------------------------------------------------------------------------

export type NeedsAttentionItem = {
  id: string;
  type: "submission" | "opportunity" | "project" | "researcher" | "event" | "resource";
  severity: "urgent" | "warning" | "info";
  title: string;
  description: string;
  link: string;
};

export async function getNeedsAttentionItems(pendingSubmissionsCount: number): Promise<NeedsAttentionItem[]> {
  const items: NeedsAttentionItem[] = [];

  // 1. Pending researcher submissions
  if (pendingSubmissionsCount > 0) {
    items.push({
      id: "pending-subs",
      type: "submission",
      severity: "urgent",
      title: `${pendingSubmissionsCount} Pending Researcher Submission${pendingSubmissionsCount > 1 ? "s" : ""}`,
      description: "Submissions are awaiting administrative review and approval before canonical data updates.",
      link: "/admin?tab=submissions",
    });
  }

  // 2. Opportunities approaching deadline (< 14 days) or expired
  const opps = await getOpportunities();
  const now = new Date();
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  for (const op of opps) {
    if (op.deadline && op.status === "open") {
      const d = new Date(op.deadline);
      if (d < now) {
        items.push({
          id: `expired-${op.id}`,
          type: "opportunity",
          severity: "warning",
          title: `Opportunity Passed Deadline: ${op.title}`,
          description: `Closing date was ${op.deadline}, but status is still marked as 'open'.`,
          link: `/admin?tab=opportunities`,
        });
      } else if (d <= twoWeeksLater) {
        const daysLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        items.push({
          id: `closing-soon-${op.id}`,
          type: "opportunity",
          severity: "info",
          title: `Closing Soon (${daysLeft} days): ${op.title}`,
          description: `Deadline is ${op.deadline}. Verify applicant pool before cycle closes.`,
          link: `/admin?tab=opportunities`,
        });
      }
    }
  }

  // 3. Projects missing end date or publications
  try {
    const client = createSupabaseServerClient();
    const { data: projs } = await client
      .from("projects")
      .select("id, title, slug, status, end_date, project_publications(publication_id)")
      .eq("status", "ongoing");

    if (projs) {
      for (const p of projs) {
        const pubCount = (p.project_publications || []).length;
        if (!p.end_date) {
          items.push({
            id: `proj-end-${p.id}`,
            type: "project",
            severity: "info",
            title: `Ongoing Project Missing End Date: ${p.title}`,
            description: "No expected completion date specified. Adding a target timeline improves reporting.",
            link: `/admin?tab=projects&editProject=${p.id}`,
          });
        }
        if (pubCount === 0) {
          items.push({
            id: `proj-nopub-${p.id}`,
            type: "project",
            severity: "info",
            title: `Ongoing Project Without Linked Publications: ${p.title}`,
            description: "No scholarly publications currently indexed for this active research project.",
            link: `/admin?tab=projects&editProject=${p.id}`,
          });
        }
      }
    }
  } catch {
    // fallback
  }

  // 4. Events missing research area
  const allEvents = await getEvents();
  for (const ev of allEvents) {
    if (!ev.research_area && !ev.research_area_id) {
      items.push({
        id: `event-unassigned-${ev.id}`,
        type: "event",
        severity: "info",
        title: `Unassigned Research Area: ${ev.title}`,
        description: "Event has no academic research discipline associated with it.",
        link: `/admin?tab=events&editEvent=${ev.id}`,
      });
    }
  }

  // 5. Resources with sparse content
  const allResources = await getResources();
  for (const res of allResources) {
    if (!res.external_url && (!res.content || res.content.length < 40)) {
      items.push({
        id: `resource-sparse-${res.id}`,
        type: "resource",
        severity: "warning",
        title: `Sparse Content in Guideline: ${res.title}`,
        description: "Document lacks detailed text guidance and has no external file attachment URL.",
        link: `/admin?tab=resources&editResource=${res.id}`,
      });
    }
  }

  return items;
}

// ----------------------------------------------------------------------------
// ACTIVITY AUDIT HELPERS (Using existing activity_audit table)
// ----------------------------------------------------------------------------

export type ActivityLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  created_at: string;
};

export async function logAdminActivity(
  action: string,
  entityType: string,
  description: string,
  entityId?: string | null
): Promise<void> {
  try {
    const client = createSupabaseServerClient();
    await Promise.resolve(
      client.from("activity_audit").insert({
        action,
        entity_type: entityType,
        entity_id: entityId || "00000000-0000-0000-0000-000000000000",
        description,
      })
    );
  } catch {
    // Graceful execution
  }
}

export async function getRecentAdminActivity(): Promise<ActivityLog[]> {
  try {
    const client = createSupabaseServerClient();
    const { data } = await client
      .from("activity_audit")
      .select("id, action, entity_type, entity_id, description, created_at")
      .order("created_at", { ascending: false })
      .limit(6);

    if (data && data.length > 0) {
      return data as ActivityLog[];
    }
  } catch {
    // Graceful fallback
  }

  // Canonical demo activity trail for verification when database audit table is initially empty
  return [
    {
      id: "act-1",
      action: "system_init",
      entity_type: "system",
      entity_id: "00000000-0000-0000-0000-000000000001",
      description: "Initialized Islington R&D Connect Digital Hub core data structure.",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "act-2",
      action: "batch_publish",
      entity_type: "opportunities",
      entity_id: "00000000-0000-0000-0000-000000000002",
      description: "Activated Faculty Research Seed Grants 2026 application cycle.",
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: "act-3",
      action: "approval",
      entity_type: "researcher_submissions",
      entity_id: "00000000-0000-0000-0000-000000000003",
      description: "Approved Project Submission: Sentinel AI IDS into production discovery.",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];
}
