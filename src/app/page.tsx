import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";

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

  const [researchersRes, projectsRes, publicationsRes, areasRes] = await Promise.all([
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
  ]);

  const researchers = (researchersRes.data ?? []) as unknown as ResearcherItem[];
  const projects = (projectsRes.data ?? []) as unknown as ProjectItem[];
  const publications = (publicationsRes.data ?? []) as unknown as PublicationItem[];
  const areas = (areasRes.data ?? []) as unknown as ResearchAreaItem[];

  // KPI Calculations
  const totalResearchers = researchers.length;
  const totalProjects = projects.length;
  const totalPublications = publications.length;
  const totalAreas = areas.length;

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
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1120] via-[#11192e] to-[#1a233d] border border-slate-800/80 p-6 sm:p-10 text-white shadow-xl shadow-slate-950/20">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>ISLINGTON COLLEGE</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-medium">Research &amp; Development Hub</span>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Discover Research at <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300">
                Islington College
              </span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Explore interconnected academic knowledge: query faculty specializations, ongoing funded projects,
              peer-reviewed publications, and interdisciplinary focus areas powered by live database relationships.
            </p>

            {/* Prominent Search Form */}
            <form action="/discover" method="GET" className="mt-6 flex flex-col sm:flex-row items-stretch gap-2 max-w-2xl">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="q"
                  placeholder="Try 'Artificial Intelligence', 'Sentinel', or 'Cybersecurity'..."
                  className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-400 focus:bg-slate-950 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Discover</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* Trending Research Area Pills */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
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
            </div>
          </div>
        </section>

        {/* KPI CARDS (Live Supabase counts) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Researchers KPI */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Faculty &amp; Fellows</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">{totalResearchers}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 flex items-center justify-between">
              <span>Researchers &amp; Lecturers</span>
              <Link href="/researchers" className="text-cyan-600 font-semibold hover:underline">
                View &rarr;
              </Link>
            </p>
          </div>

          {/* Projects KPI */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Initiatives</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">{totalProjects}</span>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Ongoing / Planned</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 flex items-center justify-between">
              <span>Research Projects</span>
              <Link href="/discover?q=project" className="text-indigo-600 font-semibold hover:underline">
                Explore &rarr;
              </Link>
            </p>
          </div>

          {/* Publications KPI */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Publications</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-110 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">{totalPublications}</span>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Indexed</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 flex items-center justify-between">
              <span>Articles &amp; Manuscripts</span>
              <Link href="/discover?q=publication" className="text-teal-600 font-semibold hover:underline">
                Read &rarr;
              </Link>
            </p>
          </div>

          {/* Research Areas KPI */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Topics</span>
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 group-hover:scale-110 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">{totalAreas}</span>
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">Specialized</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 flex items-center justify-between">
              <span>Research Disciplines</span>
              <Link href="/discover" className="text-violet-600 font-semibold hover:underline">
                Explore &rarr;
              </Link>
            </p>
          </div>
        </section>

        {/* CONNECTED RESEARCH TRAIL (Live Interactive Knowledge Graph) */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
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

        {/* MAIN TWO-COLUMN DASHBOARD CONTENT (Center Grid & Right Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CENTER MAIN CONTENT (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-8">
            {/* EXPLORE RESEARCH AREAS */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Explore Research Areas</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select a research domain to view connected staff, publications, and initiatives.
                  </p>
                </div>
                <Link
                  href="/discover"
                  className="text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {areas.map((area) => {
                  const researcherCount = area.researcher_research_areas?.length || 0;
                  const projectCount = area.project_research_areas?.length || 0;
                  return (
                    <Link
                      key={area.id}
                      href={`/discover?q=${encodeURIComponent(area.name)}`}
                      className="group rounded-2xl border border-slate-200 p-5 hover:border-cyan-500 hover:bg-cyan-50/20 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-cyan-800 transition">
                            {area.name}
                          </h3>
                          {area.is_demo && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase">
                              Demo
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {area.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-3 text-slate-600">
                          <span>{researcherCount} Faculty</span>
                          <span>&bull;</span>
                          <span>{projectCount} Projects</span>
                        </div>
                        <span className="text-cyan-700 group-hover:translate-x-1 transition font-bold">
                          Explore &rarr;
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* RECENT PUBLICATIONS */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Recent Publications &amp; Preprints</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Peer-reviewed articles, conference proceedings, and accepted submissions.
                  </p>
                </div>
                <Link
                  href="/discover?q=publication"
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
                >
                  Browse Discovery &rarr;
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                {publications.map((pub) => {
                  const authors =
                    pub.publication_researchers
                      ?.map((pr) => toItem(pr.researchers))
                      .filter(Boolean) || [];

                  return (
                    <div
                      key={pub.id}
                      className="rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:bg-slate-50/50 transition"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                pub.status === "published"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {pub.status}
                            </span>
                            {pub.is_demo && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase">
                                Demo
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 text-sm font-bold text-slate-900 leading-snug">
                            {pub.title}
                          </h3>
                          <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {pub.abstract}
                          </p>
                          <p className="mt-2 text-xs font-medium text-slate-600 flex items-center gap-2">
                            <span className="font-semibold text-slate-700">{pub.venue}</span>
                            {pub.published_at && (
                              <>
                                <span>&bull;</span>
                                <span>{pub.published_at}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <Link
                            href={`/discover?q=${encodeURIComponent(pub.title)}`}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                          >
                            Find in Graph
                          </Link>
                        </div>
                      </div>

                      {/* Authors Row */}
                      {authors.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-600">Authors:</span>
                          {authors.map((author) => (
                            <Link
                              key={author?.id}
                              href={`/researchers/${author?.slug}`}
                              className="text-[11px] font-semibold text-indigo-700 hover:underline bg-indigo-50 px-2 py-0.5 rounded"
                            >
                              {author?.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR DASHBOARD CONTENT (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            {/* LIVE RESEARCH SNAPSHOT WIDGET */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Research Snapshot
                </h3>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-600">Database Engine</span>
                  <span className="font-semibold text-slate-900">PostgreSQL (Supabase)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-600">Access Control (RLS)</span>
                  <span className="font-semibold text-emerald-700">Strict Read-Only Public</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-600">Graph Entities</span>
                  <span className="font-bold text-slate-900">
                    {totalResearchers + totalProjects + totalPublications + totalAreas} Nodes
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Admin Operations</span>
                  <span className="font-semibold text-indigo-700">Server Actions Only</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
                >
                  <span>Researcher Portal</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* TOP RESEARCH AREAS DISTRIBUTION */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
                Research Focus Distribution
              </h3>

              <div className="mt-4 space-y-4">
                {areas.map((area, idx) => {
                  const weight = (area.researcher_research_areas?.length || 0) + (area.project_research_areas?.length || 0);
                  const percentage = Math.min(Math.round((weight / 6) * 100), 100);
                  const colorClass =
                    idx === 0
                      ? "bg-cyan-500"
                      : idx === 1
                      ? "bg-indigo-500"
                      : idx === 2
                      ? "bg-teal-500"
                      : "bg-violet-500";

                  return (
                    <div key={area.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <Link
                          href={`/discover?q=${encodeURIComponent(area.name)}`}
                          className="font-semibold text-slate-800 hover:text-cyan-700 truncate"
                        >
                          {area.name}
                        </Link>
                        <span className="text-[11px] font-bold text-slate-500">{weight} links</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colorClass}`}
                          style={{ width: `${Math.max(percentage, 20)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FEATURED ACTIVE PROJECTS WIDGET */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Featured Projects
                </h3>
                <Link href="/discover?q=project" className="text-xs font-bold text-indigo-700 hover:underline">
                  All &rarr;
                </Link>
              </div>

              <div className="mt-4 space-y-4">
                {projects.map((proj) => {
                  const team =
                    proj.project_researchers
                      ?.map((pr) => toItem(pr.researchers))
                      .filter(Boolean) || [];

                  return (
                    <div key={proj.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          {proj.status}
                        </span>
                        {proj.start_date && (
                          <span className="text-[10px] font-medium text-slate-500">
                            Started {proj.start_date}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/projects/${proj.slug}`}
                        className="font-bold text-xs text-slate-900 hover:text-indigo-700 hover:underline block line-clamp-2"
                      >
                        {proj.title}
                      </Link>
                      {team.length > 0 && (
                        <p className="text-[11px] text-slate-500 truncate">
                          Team: {team.map((t) => t?.name).join(", ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
