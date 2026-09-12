import { createSupabaseServerClient } from "./supabase/server";

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

// Fallback / Canonical Demo Datasets
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
    application_url: "#demo-apply-grant",
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
    application_url: "#demo-apply-fellowship",
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
    application_url: "https://islington.edu.np/ijmr/submit",
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
    application_url: "#demo-apply-assistantship",
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
    application_url: "#demo-apply-challenge",
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
    application_url: "#demo-apply-travel",
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
    external_url: "#demo-download-irb-sop",
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
    external_url: "#demo-view-guide",
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
    external_url: "#demo-apc-guidelines",
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
    external_url: "#demo-ai-policy",
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
    external_url: "#demo-download-proposal-template",
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
    external_url: "#demo-download-privacy-sop",
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
    external_url: "#demo-lab-facilities",
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
    external_url: "#demo-toolkit-guide",
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
    slug: "nepal-internet-foundation",
    name: "Nepal Internet Foundation",
    type: "community",
    description: "Civil society organization collaborating on internet measurement, community digital literacy, and internet governance research across Nepal.",
    website_url: "https://nif.org.np",
    status: "active",
    is_demo: true,
  },
  {
    id: "p3-techsolutions",
    slug: "techsolutions-nepal",
    name: "TechSolutions Nepal Pvt. Ltd.",
    type: "industry",
    description: "Leading enterprise software engineering firm co-developing intrusion detection testbeds, industrial telemetry pipelines, and hosting student research interns.",
    website_url: "https://techsolutions.com.np",
    status: "active",
    is_demo: true,
    project: { id: "proj-sentinel", title: "Sentinel AI IDS", slug: "sentinel-ai-ids" },
  },
  {
    id: "p4-ccrn",
    slug: "center-for-cybersecurity-nepal",
    name: "Center for Cybersecurity Research Nepal",
    type: "government",
    description: "National research alliance partnering on critical infrastructure threat intelligence, vulnerability disclosures, and cyber defense training programs.",
    website_url: "https://cybersecurity.org.np",
    status: "active",
    is_demo: true,
    project: { id: "proj-sentinel", title: "Sentinel AI IDS", slug: "sentinel-ai-ids" },
  },
  {
    id: "p5-aigov",
    slug: "ai-governance-asia-initiative",
    name: "AI Governance Asia Initiative",
    type: "international",
    description: "Regional research consortium advancing ethical machine learning deployment standards, multilingual NLP benchmarks, and AI policy harmonization.",
    website_url: "https://aigov-asia.org",
    status: "active",
    is_demo: true,
  },
];

export const DEMO_ANNOUNCEMENTS: HubAnnouncement[] = [
  {
    id: "an1-launch",
    slug: "launch-of-islington-rd-digital-hub",
    title: "Official Launch of the Islington R&D Digital Hub",
    summary: "Islington College officially unveils its unified R&D Connect Digital Hub to interconnect faculty researchers, ongoing projects, publications, and collaborative opportunities.",
    content: "We are proud to announce the formal launch of the Islington R&D Connect Digital Hub. This platform serves as the central digital nerve center for our academic community, providing seamless public discovery of faculty research profiles, ongoing projects, scholarly outputs, and grant opportunities. The hub demonstrates Islington College's enduring commitment to pioneering applied research, fostering academic innovation, and strengthening industry partnerships.",
    published_at: "2026-09-01T09:00:00+05:45",
    status: "published",
    external_url: null,
    is_demo: true,
  },
  {
    id: "an2-ijmr-call",
    slug: "ijmr-vol-4-call-for-papers",
    title: "Call for Papers: Islington Journal of Multidisciplinary Research (IJMR) Vol. 4",
    summary: "Submissions are invited for Volume 4 of the peer-reviewed Islington Journal of Multidisciplinary Research spanning computing, business technology, and applied sciences.",
    content: "The Editorial Board of the Islington Journal of Multidisciplinary Research (IJMR) announces the open Call for Papers for Vol. 4, Issue 1. Authors are encouraged to submit original research papers, empirical studies, and comprehensive review articles. All submissions undergo double-blind peer review by an international editorial panel. Accepted papers are published open access with zero publication fees for institutional contributors.",
    published_at: "2026-09-08T10:30:00+05:45",
    status: "published",
    external_url: "https://islington.edu.np/ijmr",
    is_demo: true,
  },
  {
    id: "an3-grants",
    slug: "2026-faculty-seed-grants-open",
    title: "2026 Faculty Research Seed Grants Cycle Open for Applications",
    summary: "The Islington R&D Committee is accepting grant applications from faculty researchers for high-impact innovative projects.",
    content: "Faculty members across all computing and business technology faculties are invited to submit proposals for the 2026 Faculty Research Seed Grants. Grants provide financial awards between NPR 350,000 and NPR 500,000 for exploratory computing and applied intelligence research. Proposals must be submitted via the Researcher Submissions Portal by 30 November 2026.",
    published_at: "2026-09-10T11:00:00+05:45",
    status: "published",
    external_url: null,
    is_demo: true,
  },
  {
    id: "an4-lecture",
    slug: "guest-lecture-series-trustworthy-ai",
    title: "Distinguished Guest Lecture: Building Trustworthy and Explainable AI Systems",
    summary: "Visiting scholar Dr. Elena Rostova presents an institutional lecture on verifiable machine learning models for high-consequence enterprise environments.",
    content: "The Islington Applied AI & Intelligent Systems Group is pleased to host Dr. Elena Rostova for a distinguished guest lecture titled 'Building Trustworthy and Explainable AI Systems: Bridging Theory and Production Deployments'. The lecture will take place in the Islington College Auditorium on 14 October 2026. All faculty members, postgraduate researchers, and students are cordially invited.",
    published_at: "2026-09-12T12:00:00+05:45",
    status: "published",
    external_url: null,
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

export async function getEvents(): Promise<HubEvent[]> {
  try {
    const client = createSupabaseServerClient();
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
  } catch {
    // fallback
  }
  return DEMO_EVENTS;
}

export async function getEventBySlug(slug: string): Promise<HubEvent | null> {
  const events = await getEvents();
  return events.find((e) => e.slug === slug) || null;
}

export async function getOpportunities(): Promise<HubOpportunity[]> {
  try {
    const client = createSupabaseServerClient();
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
  } catch {
    // fallback
  }
  return DEMO_OPPORTUNITIES;
}

export async function getOpportunityBySlug(slug: string): Promise<HubOpportunity | null> {
  const opps = await getOpportunities();
  return opps.find((o) => o.slug === slug) || null;
}

export async function getResources(): Promise<HubResource[]> {
  try {
    const client = createSupabaseServerClient();
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

export async function getPartners(): Promise<HubPartner[]> {
  try {
    const client = createSupabaseServerClient();
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

export async function getAnnouncements(): Promise<HubAnnouncement[]> {
  try {
    const client = createSupabaseServerClient();
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

export async function getResearchGroups(): Promise<HubResearchGroup[]> {
  try {
    const client = createSupabaseServerClient();
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

export async function getResearchGroupBySlug(slug: string): Promise<HubResearchGroup | null> {
  const groups = await getResearchGroups();
  return groups.find((g) => g.slug === slug) || null;
}

// ----------------------------------------------------------------------------
// DYNAMIC STATISTICS (No statistics table)
// ----------------------------------------------------------------------------

export async function getDynamicHubStats() {
  const client = createSupabaseServerClient();

  const [
    projectsCount,
    publicationsCount,
    researchersCount,
    areasCount,
  ] = await Promise.all([
    Promise.resolve(client.from("projects").select("*", { count: "exact", head: true })).then((r) => r.count || 0).catch(() => 4),
    Promise.resolve(client.from("publications").select("*", { count: "exact", head: true })).then((r) => r.count || 0).catch(() => 4),
    Promise.resolve(client.from("researchers").select("*", { count: "exact", head: true })).then((r) => r.count || 0).catch(() => 3),
    Promise.resolve(client.from("research_areas").select("*", { count: "exact", head: true })).then((r) => r.count || 0).catch(() => 5),
  ]);

  const [events, opportunities, resources, partners, groups] = await Promise.all([
    getEvents(),
    getOpportunities(),
    getResources(),
    getPartners(),
    getResearchGroups(),
  ]);

  return {
    projectsCount,
    publicationsCount,
    researchersCount,
    areasCount,
    eventsCount: events.length,
    upcomingEventsCount: events.filter((e) => e.status === "upcoming").length,
    opportunitiesCount: opportunities.length,
    openOpportunitiesCount: opportunities.filter((o) => o.status === "open").length,
    resourcesCount: resources.length,
    partnersCount: partners.length,
    groupsCount: groups.length,
  };
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
