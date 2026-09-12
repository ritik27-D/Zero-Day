import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";
import { getEvents, getOpportunities, getAnnouncements } from "@/lib/hub-data";

type ResearchAreaItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  is_demo: boolean;
  researcher_research_areas?: { researcher_id: string }[];
  project_research_areas?: { project_id: string }[];
};

type ResearcherItem = {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  is_demo: boolean;
  researcher_research_areas?: {
    research_areas: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
  }[];
  project_researchers?: {
    projects: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
  }[];
  publication_researchers?: {
    publications: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
  }[];
};

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  start_date: string | null;
  is_demo: boolean;
  project_researchers?: {
    researchers: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
  }[];
  project_research_areas?: {
    research_areas: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
  }[];
  project_publications?: {
    publications: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
  }[];
};

type PublicationItem = {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  venue: string;
  doi: string | null;
  status: string;
  published_at: string | null;
  is_demo: boolean;
  publication_researchers?: {
    researchers: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
  }[];
  project_publications?: {
    projects: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
  }[];
};

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

export default async function HomePage() {
  await connection();

  if (!isSupabaseConfigured()) {
    return (
      <LayoutShell activeNav="home">
        <div className="p-8 max-w-2xl mx-auto mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="inline-block p-3 rounded-full bg-amber-50 text-amber-600 mb-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
          <h2 className="text-xl font-bold text-slate-900">Database Connection Required</h2>
          <p className="mt-2 text-sm text-slate-600">
            Please configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to display live research data.
          </p>
        </div>
      </LayoutShell>
    );
  }

  const client = createSupabaseServerClient();

  const [
    researchersRes,
    projectsRes,
    publicationsRes,
    areasRes,
    events,
    opportunities,
    announcements,
  ] = await Promise.all([
    client
      .from("researchers")
      .select(`
        id, slug, name, title, bio, is_demo,
        researcher_research_areas ( research_areas (id, name, slug) ),
        project_researchers ( projects (id, title, slug) ),
        publication_researchers ( publications (id, title, slug) )
      `)
      .order("name"),
    client
      .from("projects")
      .select(`
        id, slug, title, description, status, start_date, is_demo,
        project_researchers ( researchers (id, name, slug) ),
        project_research_areas ( research_areas (id, name, slug) ),
        project_publications ( publications (id, title, slug) )
      `)
      .order("title"),
    client
      .from("publications")
      .select(`
        id, slug, title, abstract, status, venue, doi, published_at, is_demo,
        publication_researchers ( researchers (id, name, slug) ),
        project_publications ( projects (id, title, slug) )
      `)
      .order("published_at", { ascending: false, nullsFirst: false }),
    client
      .from("research_areas")
      .select(`
        id, slug, name, description, is_demo,
        researcher_research_areas ( researcher_id ),
        project_research_areas ( project_id )
      `)
      .order("name"),
    getEvents(),
    getOpportunities(),
    getAnnouncements(),
  ]);

  const researchers = (researchersRes.data ?? []) as unknown as ResearcherItem[];
  const projects = (projectsRes.data ?? []) as unknown as ProjectItem[];
  const publications = (publicationsRes.data ?? []) as unknown as PublicationItem[];
  const areas = (areasRes.data ?? []) as unknown as ResearchAreaItem[];

  // Dynamic KPI Calculations
  const totalResearchers = researchers.length;
  const totalProjects = projects.length;
  const totalPublications = publications.length;
  const totalAreas = areas.length;
  const totalEvents = events.length;
  const totalOpportunities = opportunities.length;

  // Connected trail data: Find primary connected sample
  const primaryArea = areas.find((a) => a.slug === "artificial-intelligence") || areas[0];
  const connectedResearchers = researchers.filter((r) =>
    r.researcher_research_areas?.some((ra) => toItem(ra.research_areas)?.id === primaryArea?.id)
  );
  const connectedProject = projects.find((p) =>
    p.project_research_areas?.some((pra) => toItem(pra.research_areas)?.id === primaryArea?.id)
  );
  const connectedPublication = publications.find((pub) =>
    pub.project_publications?.some((pp) => toItem(pp.projects)?.id === connectedProject?.id)
  );

  return (
    <LayoutShell activeNav="home">
      <div className="space-y-8 sm:space-y-10 lg:space-y-12">
        {/* ========================================================================= */}
        {/* 1. HERO / GLOBAL DISCOVERY                                               */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1120] via-[#11192e] to-[#1a233d] border border-slate-800/80 p-6 sm:p-8 lg:p-10 text-white shadow-xl shadow-slate-950/20">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>ISLINGTON COLLEGE</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-medium">R&amp;D Connect Digital Hub</span>
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Discover Islington Research
            </h1>

            <p className="mt-2.5 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Explore interconnected academic knowledge: query faculty researchers, active projects, scholarly
              publications, academic events, funding opportunities, and research resources across Islington College.
            </p>

            {/* Prominent Global Search Form */}
            <form action="/discover" method="GET" className="mt-5 flex flex-col sm:flex-row items-stretch gap-2 max-w-2xl">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="q"
                  placeholder="Search topics, faculty members, projects, symposia, grants..."
                  className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-400 focus:bg-slate-950 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Discover</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* Trending Research Area Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Trending Areas:</span>
              {areas.map((area) => (
                <Link
                  key={area.id}
                  href={`/discover?q=${encodeURIComponent(area.name)}`}
                  className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 border border-slate-700/70 hover:border-cyan-500/40 transition font-medium text-[11px]"
                >
                  {area.name}
                </Link>
              ))}
              <Link
                href="/ijmr"
                className="px-3 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900/80 border border-cyan-700/50 transition font-semibold text-[11px]"
              >
                IJMR Journal &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. DYNAMIC STATISTICS (6 Core Metrics)                                   */}
        {/* ========================================================================= */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Institutional Research Metrics
              </h2>
              <p className="text-sm font-bold text-slate-900">
                Live Data Snapshot
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Database
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Researchers */}
            <Link
              href="/researchers"
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-cyan-500 hover:shadow-md transition group"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Researchers
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalResearchers}</span>
                <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1 py-0.5 rounded">Faculty</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 group-hover:text-cyan-700 flex items-center justify-between transition">
                <span>View Directory</span>
                <span>&rarr;</span>
              </p>
            </Link>

            {/* Projects */}
            <Link
              href="/discover?q=project"
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-indigo-500 hover:shadow-md transition group"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Projects
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalProjects}</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">Active</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 group-hover:text-indigo-700 flex items-center justify-between transition">
                <span>Explore Projects</span>
                <span>&rarr;</span>
              </p>
            </Link>

            {/* Publications */}
            <Link
              href="/discover?q=publication"
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-teal-500 hover:shadow-md transition group"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Publications
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalPublications}</span>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded">Indexed</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 group-hover:text-teal-700 flex items-center justify-between transition">
                <span>Browse Publications</span>
                <span>&rarr;</span>
              </p>
            </Link>

            {/* Research Areas */}
            <Link
              href="/discover"
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-violet-500 hover:shadow-md transition group"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Research Areas
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalAreas}</span>
                <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-1 py-0.5 rounded">Domains</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 group-hover:text-violet-700 flex items-center justify-between transition">
                <span>Browse Topics</span>
                <span>&rarr;</span>
              </p>
            </Link>

            {/* Events */}
            <Link
              href="/events"
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-amber-500 hover:shadow-md transition group"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Events
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalEvents}</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded">Upcoming</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 group-hover:text-amber-700 flex items-center justify-between transition">
                <span>View Event Calendar</span>
                <span>&rarr;</span>
              </p>
            </Link>

            {/* Opportunities */}
            <Link
              href="/opportunities"
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-emerald-500 hover:shadow-md transition group"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Opportunities
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalOpportunities}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">Open</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 group-hover:text-emerald-700 flex items-center justify-between transition">
                <span>Explore Grants &amp; Calls</span>
                <span>&rarr;</span>
              </p>
            </Link>
          </div>
        </section>

        {/* CONNECTED RESEARCH TRAIL (Live Interactive Knowledge Graph) */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 ring-4 ring-cyan-500/20" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                  Interactive Knowledge Graph
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Connected Research Trail
              </h2>
              <p className="mt-1 text-xs text-slate-600 max-w-2xl">
                Demonstrating live Supabase relationships: how a research field flows directly into academic investigators, collaborative projects, and peer-reviewed publications.
              </p>
            </div>
            <Link
              href="/discover?q=Artificial+Intelligence"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm"
            >
              <span>Explore Graph on Discover</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {/* Graph Trail Visual Visualization */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1: Research Area */}
            <div className="relative rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-b from-cyan-50/50 to-white p-5 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-extrabold uppercase tracking-wider">
                    1. Research Field
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600">Origin</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 pt-1">
                  {primaryArea?.name || "Artificial Intelligence"}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {primaryArea?.description || "Intelligent systems and automation."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-cyan-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-cyan-700">
                  {primaryArea?.researcher_research_areas?.length || 0} Faculty linked
                </span>
                <Link
                  href={`/discover?q=${encodeURIComponent(primaryArea?.name || "")}`}
                  className="text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline"
                >
                  View Area &rarr;
                </Link>
              </div>
            </div>

            {/* Step 2: Researchers */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase tracking-wider">
                    2. Investigators
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600">Faculty</span>
                </div>
                <div className="space-y-2 pt-1">
                  {connectedResearchers.slice(0, 2).map((r) => (
                    <div key={r.id} className="p-2 bg-white rounded-lg border border-slate-200/80">
                      <Link
                        href={`/researchers/${r.slug}`}
                        className="text-xs font-bold text-slate-900 hover:text-indigo-600 hover:underline block truncate"
                      >
                        {r.name}
                      </Link>
                      <p className="text-[10px] text-indigo-700 truncate">{r.title}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">
                  {connectedResearchers.length} Active leads
                </span>
                <Link href="/researchers" className="text-xs font-bold text-indigo-600 hover:underline">
                  Directory &rarr;
                </Link>
              </div>
            </div>

            {/* Step 3: Project */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
                    3. Research Project
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {connectedProject?.status || "ongoing"}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 pt-1 line-clamp-2">
                  {connectedProject?.title || "Sentinel: AI-Based Intrusion Detection"}
                </h3>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {connectedProject?.description || "Applied anomaly detection on campus networks."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">
                  {connectedProject?.project_researchers?.length || 0} Team members
                </span>
                {connectedProject ? (
                  <Link
                    href={`/projects/${connectedProject.slug}`}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View Project &rarr;
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Step 4: Publication */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase tracking-wider">
                    4. Publication
                  </span>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                    {connectedPublication?.status || "published"}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 pt-1 line-clamp-2">
                  {connectedPublication?.title || "Explainable AI for Campus Intrusion Detection"}
                </h3>
                <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                  {connectedPublication?.venue || "DEMO Journal"}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-600 truncate max-w-[120px]">
                  {connectedPublication?.doi || "10.9999/demo"}
                </span>
                <Link
                  href={`/discover?q=${encodeURIComponent(connectedPublication?.title || "")}`}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  Discover &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. R&D KNOWLEDGE HUB (Digital Hub Modular Entry Points)                   */}
        {/* ========================================================================= */}
        <section className="space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Digital Hub Architecture
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                R&amp;D Knowledge Hub
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
                Comprehensive academic infrastructure supporting the entire research lifecycle from funding and ethics to peer-reviewed dissemination.
              </p>
            </div>
            <Link
              href="/discover"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline"
            >
              Search All Digital Hub &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Events & Symposia */}
            <Link
              href="/events"
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-400 hover:shadow-sm transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {totalEvents} Upcoming
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
                  Events &amp; Symposia
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Institutional conferences, seminars, workshops, and calls for papers across computing domains.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700 group-hover:text-indigo-700 flex items-center justify-between">
                <span>View Events Schedule</span>
                <span>&rarr;</span>
              </span>
            </Link>

            {/* Card 2: Opportunities & Funding */}
            <Link
              href="/opportunities"
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-400 hover:shadow-sm transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {totalOpportunities} Active Calls
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                  Opportunities &amp; Funding
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Faculty research seed grants, postgraduate assistantships, external funding, and student grants.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700 group-hover:text-emerald-700 flex items-center justify-between">
                <span>Explore Open Grants</span>
                <span>&rarr;</span>
              </span>
            </Link>

            {/* Card 3: Research Resources */}
            <Link
              href="/resources"
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-cyan-400 hover:shadow-sm transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                    Ethics &amp; SOPs
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-sm text-slate-900 group-hover:text-cyan-700 transition">
                  Research Resources
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Standard operating procedures, IRB research ethics protocols, methodology guides, and templates.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700 group-hover:text-cyan-700 flex items-center justify-between">
                <span>Access Protocols</span>
                <span>&rarr;</span>
              </span>
            </Link>

            {/* Card 4: Research Groups & Labs */}
            <Link
              href="/researchers"
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-violet-400 hover:shadow-sm transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                    Specialized Clusters
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-sm text-slate-900 group-hover:text-violet-700 transition">
                  Research Groups &amp; Labs
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Faculty clusters including Applied AI &amp; Intelligent Systems Group and Cyber Defense Lab.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700 group-hover:text-violet-700 flex items-center justify-between">
                <span>View Research Groups</span>
                <span>&rarr;</span>
              </span>
            </Link>

            {/* Card 5: Institutional Partners */}
            <Link
              href="/partners"
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    London Met &amp; Industry
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-sm text-slate-900 group-hover:text-blue-700 transition">
                  Institutional Partners
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Academic collaboration with London Metropolitan University, enterprise engineering firms, and NGOs.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700 group-hover:text-blue-700 flex items-center justify-between">
                <span>View Partner Alliances</span>
                <span>&rarr;</span>
              </span>
            </Link>

            {/* Card 6: Announcements */}
            <Link
              href="/announcements"
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-rose-400 hover:shadow-sm transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    Latest Notices
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-sm text-slate-900 group-hover:text-rose-700 transition">
                  Announcements &amp; Calls
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Official R&amp;D notices, call for paper deadlines, seed grant cycles, and institutional updates.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700 group-hover:text-rose-700 flex items-center justify-between">
                <span>Read Institutional Notices</span>
                <span>&rarr;</span>
              </span>
            </Link>

            {/* Card 7: IJMR Journal Gateway */}
            <Link
              href="/ijmr"
              className="rounded-2xl border border-cyan-300 bg-gradient-to-b from-cyan-50/40 to-white p-5 hover:border-cyan-500 hover:shadow-sm transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                    Peer-Reviewed
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-sm text-slate-900 group-hover:text-cyan-800 transition">
                  IJMR Journal Gateway
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Islington Journal of Multidisciplinary Research — editorial guidelines, peer review, and submission portal.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-cyan-100 text-xs font-bold text-cyan-800 flex items-center justify-between">
                <span>Submit Manuscript &rarr;</span>
              </span>
            </Link>

            {/* Card 8: Research Areas */}
            <Link
              href="/discover"
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-400 hover:shadow-sm transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {totalAreas} Disciplines
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-sm text-slate-900 group-hover:text-cyan-700 transition">
                  Research Areas
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Interdisciplinary specializations linking faculty experts, publications, and grant applications.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700 group-hover:text-cyan-700 flex items-center justify-between">
                <span>Browse All Disciplines</span>
                <span>&rarr;</span>
              </span>
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. RECENT RESEARCH & ACTIVITY SECTION                                    */}
        {/* ========================================================================= */}
        <section className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Live Repository Feed
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Recent Research &amp; Activity
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Latest peer-reviewed outputs, ongoing faculty investigations, and scheduled symposia.
              </p>
            </div>
            <Link
              href="/discover"
              className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
            >
              Browse Complete Catalog &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Column 1: Recent Publications */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Latest Publications
                  </h3>
                  <Link href="/discover?q=publication" className="text-xs font-semibold text-teal-700 hover:underline">
                    All Papers &rarr;
                  </Link>
                </div>

                <div className="mt-4 space-y-3.5">
                  {publications.slice(0, 3).map((pub) => (
                    <div key={pub.id} className="space-y-1">
                      <Link
                        href={`/discover?q=${encodeURIComponent(pub.title)}`}
                        className="text-xs font-bold text-slate-900 hover:text-teal-700 block line-clamp-2 leading-snug"
                      >
                        {pub.title}
                      </Link>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2 truncate">
                        <span className="font-medium text-slate-700">{pub.venue}</span>
                        {pub.published_at && (
                          <>
                            <span>&bull;</span>
                            <span>{pub.published_at}</span>
                          </>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-right">
                <Link
                  href="/discover?q=publication"
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  Explore Indexed Publications &rarr;
                </Link>
              </div>
            </div>

            {/* Column 2: Active Projects */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Ongoing Projects
                  </h3>
                  <Link href="/discover?q=project" className="text-xs font-semibold text-indigo-700 hover:underline">
                    All Projects &rarr;
                  </Link>
                </div>

                <div className="mt-4 space-y-3.5">
                  {projects.slice(0, 2).map((proj) => {
                    const team = proj.project_researchers
                      ?.map((pr) => toItem(pr.researchers))
                      .filter(Boolean) || [];

                    return (
                      <div key={proj.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            {proj.status}
                          </span>
                          {proj.is_demo && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded uppercase">
                              Demo
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/projects/${proj.slug}`}
                          className="text-xs font-bold text-slate-900 hover:text-indigo-700 block line-clamp-2 leading-snug"
                        >
                          {proj.title}
                        </Link>
                        {team.length > 0 && (
                          <p className="text-[11px] text-slate-500 truncate">
                            Lead: {team[0]?.name}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-right">
                <Link
                  href="/discover?q=project"
                  className="text-xs font-bold text-indigo-700 hover:underline"
                >
                  View Active Project Registry &rarr;
                </Link>
              </div>
            </div>

            {/* Column 3: Upcoming Events & Notices */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Upcoming Events &amp; Notices
                  </h3>
                  <Link href="/events" className="text-xs font-semibold text-amber-700 hover:underline">
                    Calendar &rarr;
                  </Link>
                </div>

                <div className="mt-4 space-y-3.5">
                  {events.slice(0, 2).map((ev) => (
                    <div key={ev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          {ev.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {ev.start_date ? new Date(ev.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBA"}
                        </span>
                      </div>
                      <Link
                        href={`/events/${ev.slug}`}
                        className="text-xs font-bold text-slate-900 hover:text-amber-800 block line-clamp-2 leading-snug"
                      >
                        {ev.title}
                      </Link>
                      {ev.location && (
                        <p className="text-[11px] text-slate-500 truncate">
                          {ev.location}
                        </p>
                      )}
                    </div>
                  ))}
                  {announcements.slice(0, 1).map((ann) => (
                    <div key={ann.id} className="text-xs pt-1">
                      <span className="text-[10px] font-bold text-rose-700 uppercase block">Notice</span>
                      <Link href={`/announcements/${ann.slug}`} className="font-semibold text-slate-900 hover:text-rose-700 line-clamp-1">
                        {ann.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-right">
                <Link
                  href="/announcements"
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  View All Institutional Notices &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. INSTITUTIONAL CALL-TO-ACTION                                          */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 lg:p-9 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Islington Academic Faculty &amp; Investigators
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Participate in Institutional Research &amp; Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Authorized faculty can submit new project proposals, update researcher biographies, link peer-reviewed
              publications, and track submission approvals via the portal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/25 flex items-center justify-center gap-2 text-center cursor-pointer"
            >
              Sign in to Researcher Portal
            </Link>
            <Link
              href="/admin/login"
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs text-center transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Admin Governance
            </Link>
          </div>
        </section>
      </div>
    </LayoutShell>
  );
}
