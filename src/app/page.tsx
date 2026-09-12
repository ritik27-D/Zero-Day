import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";
import { getEvents, getOpportunities } from "@/lib/hub-data";

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
  ]);

  const researchers = (researchersRes.data ?? []) as unknown as ResearcherItem[];
  const projects = (projectsRes.data ?? []) as unknown as ProjectItem[];
  const publications = (publicationsRes.data ?? []) as unknown as PublicationItem[];
  const areas = (areasRes.data ?? []) as unknown as ResearchAreaItem[];

  // Statistics
  const totalResearchers = researchers.length;
  const totalProjects = projects.length;
  const totalPublications = publications.length;
  const totalAreas = areas.length;

  // Connected Trail Data (Live Supabase Knowledge Graph Linkage)
  const primaryArea = areas.find((a) => a.slug === "artificial-intelligence") || areas[0];
  const connectedResearchers = researchers.filter((r) =>
    r.researcher_research_areas?.some((ra) => toItem(ra.research_areas)?.id === primaryArea?.id)
  );
  const connectedLead = connectedResearchers[0] || researchers[0];
  const connectedProject = projects.find((p) =>
    p.project_research_areas?.some((pra) => toItem(pra.research_areas)?.id === primaryArea?.id)
  ) || projects[0];
  const connectedPublication = publications.find((pub) =>
    pub.project_publications?.some((pp) => toItem(pp.projects)?.id === connectedProject?.id)
  ) || publications[0];

  return (
    <LayoutShell activeNav="home">
      <div className="space-y-12 sm:space-y-16 lg:space-y-20">
        {/* ========================================================================= */}
        {/* HERO SECTION: Clean, Spacious, Islington College Inspired                 */}
        {/* ========================================================================= */}
        <section className="text-center py-8 sm:py-14 lg:py-16 px-4 max-w-4xl mx-auto">
          {/* Authentic Islington R&D Brand Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/islington-rd-logo.png"
              alt="Islington College R&D"
              width={100}
              height={100}
              className="w-20 sm:w-24 md:w-28 h-auto object-contain"
              priority
            />
          </div>

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold tracking-widest uppercase mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            <span>Research &amp; Development</span>
          </div>

          {/* Exact Hero Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] break-words">
            Connecting Research, People &amp; Impact.
          </h1>

          {/* Exact Hero Subtitle */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover the people, projects, publications and opportunities shaping research at Islington.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto">
            <Link
              href="/research"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-sm hover:shadow-md text-center cursor-pointer"
            >
              Explore Research
            </Link>
            <Link
              href="/discover"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 font-bold text-sm border border-slate-300 transition shadow-2xs text-center cursor-pointer"
            >
              Search Research
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: RESEARCH AT A GLANCE (Modest Clean Statistics)                */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Institutional Overview
              </h2>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                Research at a Glance
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Live Academic Database &bull; Verified Research Records</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. Researchers */}
            <Link
              href="/people"
              className="p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition group"
            >
              <span className="text-xs font-semibold text-slate-500 block">Faculty Researchers</span>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                {totalResearchers}
              </p>
              <p className="text-xs text-slate-500 group-hover:text-cyan-700 mt-2 flex items-center justify-between">
                <span>View Directory</span>
                <span>&rarr;</span>
              </p>
            </Link>

            {/* 2. Research Areas */}
            <Link
              href="/research"
              className="p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition group"
            >
              <span className="text-xs font-semibold text-slate-500 block">Research Areas</span>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                {totalAreas}
              </p>
              <p className="text-xs text-slate-500 group-hover:text-cyan-700 mt-2 flex items-center justify-between">
                <span>Explore Disciplines</span>
                <span>&rarr;</span>
              </p>
            </Link>

            {/* 3. Projects */}
            <Link
              href="/projects"
              className="p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition group"
            >
              <span className="text-xs font-semibold text-slate-500 block">Research Projects</span>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                {totalProjects}
              </p>
              <p className="text-xs text-slate-500 group-hover:text-cyan-700 mt-2 flex items-center justify-between">
                <span>Active &amp; Completed</span>
                <span>&rarr;</span>
              </p>
            </Link>

            {/* 4. Publications */}
            <Link
              href="/publications"
              className="p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition group"
            >
              <span className="text-xs font-semibold text-slate-500 block">Publications &amp; DOIs</span>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                {totalPublications}
              </p>
              <p className="text-xs text-slate-500 group-hover:text-cyan-700 mt-2 flex items-center justify-between">
                <span>Indexed Outputs</span>
                <span>&rarr;</span>
              </p>
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: EXPLORE RESEARCH (4 Clean Cards)                               */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                R&amp;D Knowledge Hub
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                Explore Research
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Navigate the core pillars of academic inquiry and scholarly dissemination across Islington College.
              </p>
            </div>
            <Link
              href="/discover"
              className="text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline shrink-0"
            >
              Unified Search &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Research Areas */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="mt-4 font-bold text-base text-slate-900">
                  Research Areas
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Interdisciplinary specializations in Artificial Intelligence, Cybersecurity, Data Science, and Sustainable Computing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/research"
                  className="text-xs font-bold text-slate-900 hover:text-cyan-700 flex items-center justify-between transition"
                >
                  <span>Browse Areas</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Card 2: Faculty Directory */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 font-bold text-base text-slate-900">
                  Researchers
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Academic investigators, doctoral supervisors, research fellows, and departmental research teams.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/people"
                  className="text-xs font-bold text-slate-900 hover:text-cyan-700 flex items-center justify-between transition"
                >
                  <span>View Faculty</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Card 3: Research Projects */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="mt-4 font-bold text-base text-slate-900">
                  Projects
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Collaborative research initiatives, funded project milestones, and student-faculty co-investigations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/projects"
                  className="text-xs font-bold text-slate-900 hover:text-cyan-700 flex items-center justify-between transition"
                >
                  <span>Explore Projects</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Card 4: Scholarly Publications */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="mt-4 font-bold text-base text-slate-900">
                  Publications
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Peer-reviewed journal articles, conference papers, institutional reports, and IJMR gateway access.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/publications"
                  className="text-xs font-bold text-slate-900 hover:text-cyan-700 flex items-center justify-between transition"
                >
                  <span>Browse Publications</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: FEATURED RESEARCH (2-3 Project Cards)                          */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Selected Initiatives
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                Featured Research Projects
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Active investigations advancing technological solutions, security standards, and academic excellence.
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-bold text-slate-900 hover:text-cyan-700 hover:underline shrink-0"
            >
              View All Projects &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projects.slice(0, 3).map((proj) => {
              const team =
                proj.project_researchers
                  ?.map((pr) => toItem(pr.researchers))
                  .filter(Boolean) || [];
              const projArea = toItem(proj.project_research_areas?.[0]?.research_areas);

              return (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {proj.status}
                      </span>
                      {proj.is_demo && (
                        <span className="hidden" data-demo="true">demo</span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                      {team.length > 0 && (
                        <p className="truncate">
                          <span className="font-semibold text-slate-700">Lead:</span> {team[0]?.name}
                        </p>
                      )}
                      {projArea && (
                        <p className="truncate">
                          <span className="font-semibold text-slate-700">Field:</span> {projArea.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href={`/projects/${proj.slug}`}
                      className="text-xs font-bold text-slate-900 hover:text-cyan-700 flex items-center justify-between transition"
                    >
                      <span>View Project Details</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: CONNECTED RESEARCH TRAIL (Light Institutional Styling)         */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                Relational Knowledge Graph
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Connected Research Trail
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
                Demonstrating Islington&apos;s relational architecture: how a field of inquiry connects directly to faculty investigators, collaborative projects, and peer-reviewed publications.
              </p>
            </div>
            <Link
              href="/discover?q=Artificial+Intelligence"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
            >
              Explore Graph in Discover &rarr;
            </Link>
          </div>

          {/* 4 Connected Cards with Clean Step Progression */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5 relative">
            {/* Step 1: Research Field */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col justify-between hover:border-slate-300 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
                    Step 1 &bull; Focus
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Domain</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 pt-1">
                  {primaryArea?.name || "Artificial Intelligence"}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {primaryArea?.description || "Applied AI, neural networks, and automated intelligence systems."}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  {primaryArea?.researcher_research_areas?.length || 1} Faculty Linked
                </span>
                <Link
                  href={`/discover?q=${encodeURIComponent(primaryArea?.name || "Artificial Intelligence")}`}
                  className="text-teal-700 hover:text-teal-900 font-semibold"
                >
                  View Area &rarr;
                </Link>
              </div>
            </div>

            {/* Step 2: Faculty Lead */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col justify-between hover:border-slate-300 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                    Step 2 &bull; Faculty Lead
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Researcher</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 pt-1 truncate">
                  {connectedLead?.name || "Dr. Aisha Rahman"}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {connectedLead?.bio || "Senior Lecturer & Lead Investigator specializing in machine learning and network anomaly detection."}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] truncate max-w-[120px]">
                  {connectedLead?.title || "Lead Researcher"}
                </span>
                <Link
                  href={`/researchers/${connectedLead?.slug || "dr-aisha-rahman"}`}
                  className="text-indigo-700 hover:text-indigo-900 font-semibold"
                >
                  Profile &rarr;
                </Link>
              </div>
            </div>

            {/* Step 3: Collaborative Project */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col justify-between hover:border-slate-300 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                    Step 3 &bull; Project
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    {connectedProject?.status || "Ongoing"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 pt-1 line-clamp-2">
                  {connectedProject?.title || "Sentinel: AI-Based Intrusion Detection"}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {connectedProject?.description || "Network intrusion detection prototype tailored for campus infrastructure."}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  {connectedProject?.project_researchers?.length || 1} Investigators
                </span>
                <Link
                  href={`/projects/${connectedProject?.slug || "sentinel-ai-ids"}`}
                  className="text-amber-700 hover:text-amber-900 font-semibold"
                >
                  Project &rarr;
                </Link>
              </div>
            </div>

            {/* Step 4: Dissemination & Publication */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col justify-between hover:border-slate-300 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
                    Step 4 &bull; Publication
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Indexed</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 pt-1 line-clamp-2">
                  {connectedPublication?.title || "Explainable AI for Campus Intrusion Detection"}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">
                  {connectedPublication?.venue || "IEEE Symposium on Applied Security"}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[10px] truncate max-w-[120px]">
                  {connectedPublication?.doi || "10.1109/DEMO.2025"}
                </span>
                <Link
                  href={`/discover?q=${encodeURIComponent(connectedPublication?.title || "")}`}
                  className="text-teal-700 hover:text-teal-900 font-semibold"
                >
                  Discover &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: LATEST RESEARCH & OPPORTUNITIES (2-Column Editorial)           */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Institutional Activity
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                Latest Research &amp; Opportunities
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Upcoming scholarly conferences, symposia, research seed grants, and academic fellowships.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="text-xs font-bold text-slate-900 hover:text-cyan-700 hover:underline shrink-0"
            >
              All Calls &amp; Grants &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Column 1: Current Opportunities */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Current Grants &amp; Fellowships
                  </h3>
                  <Link
                    href="/opportunities"
                    className="text-xs font-semibold text-cyan-700 hover:underline"
                  >
                    View Directory &rarr;
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {opportunities.slice(0, 3).map((opp) => (
                    <div
                      key={opp.id}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {opp.type.replace(/_/g, " ")}
                        </span>
                        {opp.deadline && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Deadline: {new Date(opp.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/opportunities/${opp.slug}`}
                        className="text-xs font-bold text-slate-900 hover:text-cyan-700 block leading-snug line-clamp-1"
                      >
                        {opp.title}
                      </Link>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {opp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-right">
                <Link
                  href="/funding"
                  className="text-xs font-bold text-slate-900 hover:text-cyan-700 hover:underline"
                >
                  Funding Guidelines &amp; Internal Grants &rarr;
                </Link>
              </div>
            </div>

            {/* Column 2: Conferences & Events */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Conferences &amp; Academic Events
                  </h3>
                  <Link
                    href="/events"
                    className="text-xs font-semibold text-cyan-700 hover:underline"
                  >
                    Event Calendar &rarr;
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {events.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {ev.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {ev.start_date
                            ? new Date(ev.start_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "TBA"}
                        </span>
                      </div>
                      <Link
                        href={`/events/${ev.slug}`}
                        className="text-xs font-bold text-slate-900 hover:text-cyan-700 block leading-snug line-clamp-1"
                      >
                        {ev.title}
                      </Link>
                      {ev.location && (
                        <p className="text-[11px] text-slate-500 truncate">
                          Location: {ev.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-right">
                <Link
                  href="/ijmr"
                  className="text-xs font-bold text-slate-900 hover:text-cyan-700 hover:underline"
                >
                  IJMR Journal Call for Papers &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: INSTITUTIONAL CALL-TO-ACTION                                  */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-b from-white to-slate-50/90 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs text-center max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Islington College R&amp;D
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Explore Islington Research
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Connect with faculty researchers, explore collaborative opportunities, or submit academic work to the digital hub and peer-reviewed journal.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/discover"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm text-center cursor-pointer"
            >
              Search Knowledge Graph
            </Link>
            <Link
              href="/people"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 font-semibold text-xs transition border border-slate-300 text-center cursor-pointer shadow-2xs"
            >
              Researcher Directory
            </Link>
            <Link
              href="/ijmr"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 font-semibold text-xs transition border border-slate-300 text-center cursor-pointer shadow-2xs"
            >
              IJMR Journal Gateway
            </Link>
          </div>
        </section>
      </div>
    </LayoutShell>
  );
}
