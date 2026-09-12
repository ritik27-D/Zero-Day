import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";
import { getEvents, getOpportunities, getResources } from "@/lib/hub-data";

type ResearchArea = {
  id: string;
  slug: string;
  name: string;
};

type Researcher = {
  id: string;
  slug: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  is_demo: boolean;
  researcher_research_areas?: {
    research_areas: ResearchArea | ResearchArea[] | null;
  }[];
  project_researchers?: {
    projects: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
  }[];
};

type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  is_demo: boolean;
  project_researchers?: {
    researchers: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
  }[];
  project_research_areas?: {
    research_areas: ResearchArea | ResearchArea[] | null;
  }[];
  project_publications?: {
    publications: { id: string; title: string; slug: string } | { id: string; title: string; slug: string }[] | null;
  }[];
};

type Publication = {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  venue: string;
  doi: string | null;
  status: string;
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

export default async function DiscoverPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  await connection();
  if (!isSupabaseConfigured()) {
    return <ConfigurationRequired />;
  }

  const searchParams = await props.searchParams;
  const rawQuery = searchParams?.q?.trim() || "";
  const query = rawQuery.toLowerCase();
  const isAISearch = query.includes("artificial intelligence") || query === "ai";
  const isCyberSearch = query.includes("cybersecurity") || query.includes("cyber") || query.includes("threat");
  const isHealthSearch = query.includes("healthcare") || query.includes("health");

  const client = createSupabaseServerClient();

  const [
    researchersRes,
    projectsRes,
    publicationsRes,
    areasRes,
    allEvents,
    allOpportunities,
    allResources,
  ] = await Promise.all([
    client
      .from("researchers")
      .select(`
        id,
        slug,
        name,
        email,
        title,
        bio,
        is_demo,
        researcher_research_areas (
          research_areas (id, name, slug)
        ),
        project_researchers (
          projects (id, title, slug)
        )
      `)
      .order("name"),
    client
      .from("projects")
      .select(`
        id,
        slug,
        title,
        description,
        status,
        is_demo,
        project_researchers (
          researchers (id, name, slug)
        ),
        project_research_areas (
          research_areas (id, name, slug)
        ),
        project_publications (
          publications (id, title, slug)
        )
      `)
      .order("title"),
    client
      .from("publications")
      .select(`
        id,
        slug,
        title,
        abstract,
        venue,
        doi,
        status,
        is_demo,
        publication_researchers (
          researchers (id, name, slug)
        ),
        project_publications (
          projects (id, title, slug)
        )
      `)
      .order("title"),
    client.from("research_areas").select("id, name, slug, description").order("name"),
    getEvents(),
    getOpportunities(),
    getResources(),
  ]);

  if (researchersRes.error) return <DataError message={researchersRes.error.message} />;
  if (projectsRes.error) return <DataError message={projectsRes.error.message} />;
  if (publicationsRes.error) return <DataError message={publicationsRes.error.message} />;

  const allResearchers = (researchersRes.data ?? []) as unknown as Researcher[];
  const allProjects = (projectsRes.data ?? []) as unknown as Project[];
  const allPublications = (publicationsRes.data ?? []) as unknown as Publication[];
  const allAreas = (areasRes.data ?? []) as { id: string; name: string; slug: string; description: string }[];

  const hasSearch = rawQuery.length > 0;

  // Filter researchers with graph awareness
  const matchedResearchers = hasSearch
    ? allResearchers.filter((r) => {
        const textMatch =
          r.name.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          r.bio.toLowerCase().includes(query) ||
          (isAISearch && (r.bio.toLowerCase().includes("ai") || r.title.toLowerCase().includes("ai")));
        const areaMatch = r.researcher_research_areas?.some((ra) => {
          const area = toItem(ra.research_areas);
          return area?.name.toLowerCase().includes(query);
        });
        const projectMatch = r.project_researchers?.some((pr) => {
          const proj = toItem(pr.projects);
          return proj?.title.toLowerCase().includes(query);
        });
        return textMatch || areaMatch || projectMatch;
      })
    : allResearchers;

  // Filter projects with graph awareness
  const matchedProjects = hasSearch
    ? allProjects.filter((p) => {
        const textMatch =
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (isAISearch &&
            (p.title.toLowerCase().includes("ai") || p.description.toLowerCase().includes("ai")));
        const areaMatch = p.project_research_areas?.some((pra) => {
          const area = toItem(pra.research_areas);
          return area?.name.toLowerCase().includes(query);
        });
        const researcherMatch = p.project_researchers?.some((pr) => {
          const res = toItem(pr.researchers);
          return res?.name.toLowerCase().includes(query);
        });
        const publicationMatch = p.project_publications?.some((pp) => {
          const pub = toItem(pp.publications);
          return pub?.title.toLowerCase().includes(query);
        });
        return textMatch || areaMatch || researcherMatch || publicationMatch;
      })
    : allProjects;

  // Filter publications with graph awareness
  const matchedPublications = hasSearch
    ? allPublications.filter((pub) => {
        const textMatch =
          pub.title.toLowerCase().includes(query) ||
          pub.abstract.toLowerCase().includes(query) ||
          pub.venue.toLowerCase().includes(query) ||
          (isAISearch &&
            (pub.title.toLowerCase().includes("ai") || pub.abstract.toLowerCase().includes("ai")));
        const authorMatch = pub.publication_researchers?.some((pr) => {
          const res = toItem(pr.researchers);
          return res?.name.toLowerCase().includes(query);
        });
        const projectMatch = pub.project_publications?.some((pp) => {
          const proj = toItem(pp.projects);
          return proj?.title.toLowerCase().includes(query);
        });
        return textMatch || authorMatch || projectMatch;
      })
    : allPublications;

  // Filter Events
  const matchedEvents = hasSearch
    ? allEvents.filter((e) => {
        return (
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          (e.location && e.location.toLowerCase().includes(query)) ||
          (e.research_area && e.research_area.name.toLowerCase().includes(query)) ||
          (isAISearch && (e.title.toLowerCase().includes("ai") || e.description.toLowerCase().includes("ai"))) ||
          (isCyberSearch && (e.title.toLowerCase().includes("cyber") || e.description.toLowerCase().includes("cyber"))) ||
          (isHealthSearch && (e.title.toLowerCase().includes("health") || e.description.toLowerCase().includes("health")))
        );
      })
    : allEvents;

  // Filter Opportunities
  const matchedOpportunities = hasSearch
    ? allOpportunities.filter((op) => {
        return (
          op.title.toLowerCase().includes(query) ||
          op.description.toLowerCase().includes(query) ||
          (op.provider && op.provider.toLowerCase().includes(query)) ||
          (op.research_area && op.research_area.name.toLowerCase().includes(query)) ||
          (isAISearch && (op.title.toLowerCase().includes("ai") || op.description.toLowerCase().includes("ai"))) ||
          (isCyberSearch && (op.title.toLowerCase().includes("cyber") || op.description.toLowerCase().includes("cyber")))
        );
      })
    : allOpportunities;

  // Filter Resources
  const matchedResources = hasSearch
    ? allResources.filter((res) => {
        return (
          res.title.toLowerCase().includes(query) ||
          res.description.toLowerCase().includes(query) ||
          res.category.toLowerCase().includes(query) ||
          (res.content && res.content.toLowerCase().includes(query)) ||
          (res.research_area && res.research_area.name.toLowerCase().includes(query)) ||
          (isAISearch && (res.title.toLowerCase().includes("ai") || res.category.includes("ai"))) ||
          (isCyberSearch && (res.title.toLowerCase().includes("privacy") || res.description.toLowerCase().includes("cyber")))
        );
      })
    : allResources;

  // IJMR Relevance Callout
  const isIJMRRelevant =
    hasSearch &&
    (query.includes("ijmr") ||
      query.includes("journal") ||
      query.includes("paper") ||
      query.includes("publication") ||
      query.includes("peer") ||
      isAISearch ||
      isCyberSearch);

  const totalResults =
    matchedResearchers.length +
    matchedProjects.length +
    matchedPublications.length +
    matchedEvents.length +
    matchedOpportunities.length +
    matchedResources.length;

  return (
    <LayoutShell activeNav="discover">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 ring-4 ring-cyan-500/20" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                Connected Knowledge Graph
              </p>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Unified Research Discovery
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/researchers"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Faculty Directory
            </Link>
            <Link
              href="/ijmr"
              className="rounded-xl border border-cyan-200 bg-cyan-50 px-3.5 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100 transition"
            >
              IJMR Gateway &rarr;
            </Link>
          </div>
        </div>

        {/* Discovery Search Form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Search Islington Research &amp; Digital Hub
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
              Search across faculty researchers, active projects, indexed publications, symposia, grants, ethics SOPs, and IJMR journal articles.
            </p>
          </div>

          <form method="GET" action="/discover" className="mt-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  name="q"
                  defaultValue={rawQuery}
                  placeholder="Search topic e.g. Artificial Intelligence, Cybersecurity, Healthcare..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition"
              >
                Search Graph
              </button>
              {hasSearch && (
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>

          {/* Quick Filter Topic Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Recommended Topics:
            </span>
            {allAreas.map((area) => {
              const isSelected = rawQuery.toLowerCase() === area.name.toLowerCase();
              return (
                <Link
                  key={area.id}
                  href={`/discover?q=${encodeURIComponent(area.name)}`}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                  }`}
                >
                  {area.name}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Results Summary */}
        {hasSearch && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p className="text-sm text-slate-600">
              Found <strong className="text-slate-900">{totalResults}</strong> total connected records matching{" "}
              <span className="font-semibold text-cyan-700">&ldquo;{rawQuery}&rdquo;</span>
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-md bg-blue-50 text-blue-800 px-2.5 py-1 border border-blue-100">
                {matchedResearchers.length} People
              </span>
              <span className="rounded-md bg-emerald-50 text-emerald-800 px-2.5 py-1 border border-emerald-100">
                {matchedProjects.length} Projects
              </span>
              <span className="rounded-md bg-purple-50 text-purple-800 px-2.5 py-1 border border-purple-100">
                {matchedPublications.length} Publications
              </span>
              <span className="rounded-md bg-cyan-50 text-cyan-800 px-2.5 py-1 border border-cyan-100">
                {matchedEvents.length} Events
              </span>
              <span className="rounded-md bg-indigo-50 text-indigo-800 px-2.5 py-1 border border-indigo-100">
                {matchedOpportunities.length} Opportunities
              </span>
              <span className="rounded-md bg-slate-100 text-slate-800 px-2.5 py-1 border border-slate-200">
                {matchedResources.length} Resources
              </span>
            </div>
          </div>
        )}

        {/* Contextual IJMR Gateway Match Banner */}
        {isIJMRRelevant && (
          <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-indigo-50/50 to-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  IJMR Scholarly Gateway Match
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                Relevant Peer-Reviewed Call &amp; Special Issues in IJMR
              </p>
              <p className="text-xs text-slate-600">
                Explore indexed journal papers and open calls for papers in the Islington Journal of Multidisciplinary Research related to your query.
              </p>
            </div>
            <Link
              href="/ijmr"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold whitespace-nowrap transition"
            >
              Open IJMR Gateway &rarr;
            </Link>
          </div>
        )}

        {/* Grouped Entity Results */}
        <div className="space-y-12">
          {/* GROUP 1: RESEARCHERS */}
          {matchedResearchers.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Faculty Researchers</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {matchedResearchers.length}
                  </span>
                </div>
                <Link href="/researchers" className="text-xs font-bold text-cyan-700 hover:underline">
                  All Faculty &rarr;
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {matchedResearchers.map((researcher) => {
                  const areas = researcher.researcher_research_areas
                    ?.map((r) => toItem(r.research_areas))
                    .filter((a): a is ResearchArea => Boolean(a));

                  return (
                    <article
                      key={researcher.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/researchers/${researcher.slug}`}
                              className="text-base font-bold text-slate-900 hover:text-cyan-700 hover:underline"
                            >
                              {researcher.name}
                            </Link>
                            <p className="text-xs font-medium text-cyan-700">{researcher.title}</p>
                          </div>
                          {researcher.is_demo && (
                            <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Demo
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {researcher.bio}
                        </p>

                        {areas && areas.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {areas.map((a) => (
                              <span
                                key={a.id}
                                className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-700"
                              >
                                {a.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono truncate max-w-[180px]">
                          {researcher.email}
                        </span>
                        <Link
                          href={`/researchers/${researcher.slug}`}
                          className="font-bold text-cyan-700 hover:underline"
                        >
                          Profile &rarr;
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* GROUP 2: PROJECTS */}
          {matchedProjects.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Research Projects</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {matchedProjects.length}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {matchedProjects.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status}
                        </span>
                        {p.is_demo && (
                          <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Demo
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/projects/${p.slug}`}
                        className="text-base font-bold text-slate-900 hover:text-cyan-700 hover:underline block"
                      >
                        {p.title}
                      </Link>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/projects/${p.slug}`}
                        className="text-xs font-bold text-cyan-700 hover:underline"
                      >
                        Project Details &rarr;
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* GROUP 3: PUBLICATIONS */}
          {matchedPublications.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Publications &amp; DOIs</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    {matchedPublications.length}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {matchedPublications.map((pub) => (
                  <article
                    key={pub.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700 truncate max-w-[200px]">{pub.venue}</span>
                      {pub.doi && <span className="font-mono text-[10px]">DOI: {pub.doi}</span>}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{pub.title}</h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{pub.abstract}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        Published
                      </span>
                      <Link
                        href={`/discover?q=${encodeURIComponent(pub.title)}`}
                        className="text-xs font-semibold text-cyan-700 hover:underline"
                      >
                        Explore Graph &rarr;
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* GROUP 4: EVENTS */}
          {matchedEvents.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Events &amp; Symposia</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
                    {matchedEvents.length}
                  </span>
                </div>
                <Link href="/events" className="text-xs font-bold text-cyan-700 hover:underline">
                  All Events &rarr;
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {matchedEvents.map((evt) => (
                  <article
                    key={evt.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200">
                        {evt.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {evt.start_date ? new Date(evt.start_date).toLocaleDateString() : "TBA"}
                      </span>
                    </div>

                    <Link
                      href={`/events/${evt.slug}`}
                      className="text-sm font-bold text-slate-900 hover:text-cyan-700 block"
                    >
                      {evt.title}
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{evt.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 truncate max-w-[180px]">{evt.location}</span>
                      <Link href={`/events/${evt.slug}`} className="text-xs font-bold text-cyan-700 hover:underline">
                        Event Details &rarr;
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* GROUP 5: OPPORTUNITIES */}
          {matchedOpportunities.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Grants &amp; Opportunities</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                    {matchedOpportunities.length}
                  </span>
                </div>
                <Link href="/opportunities" className="text-xs font-bold text-cyan-700 hover:underline">
                  All Grants &rarr;
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {matchedOpportunities.map((op) => (
                  <article
                    key={op.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {op.type.replace(/_/g, " ")}
                      </span>
                      {op.amount && <span className="text-xs font-bold text-slate-800">{op.amount}</span>}
                    </div>

                    <Link
                      href={`/opportunities/${op.slug}`}
                      className="text-sm font-bold text-slate-900 hover:text-cyan-700 block"
                    >
                      {op.title}
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{op.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-rose-700 font-semibold">
                        Deadline: {op.deadline || "Open"}
                      </span>
                      <Link href={`/opportunities/${op.slug}`} className="text-xs font-bold text-cyan-700 hover:underline">
                        Apply &rarr;
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* GROUP 6: RESOURCES */}
          {matchedResources.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Guidelines, Ethics &amp; SOPs</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                    {matchedResources.length}
                  </span>
                </div>
                <Link href="/resources" className="text-xs font-bold text-cyan-700 hover:underline">
                  All Resources &rarr;
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {matchedResources.map((res) => (
                  <article
                    key={res.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition space-y-2"
                  >
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {res.category.replace(/_/g, " ")}
                    </span>

                    <Link
                      href={`/resources/${res.slug}`}
                      className="text-sm font-bold text-slate-900 hover:text-cyan-700 block"
                    >
                      {res.title}
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{res.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Institutional Protocol</span>
                      <Link href={`/resources/${res.slug}`} className="text-xs font-bold text-cyan-700 hover:underline">
                        Read SOP &rarr;
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Zero Results Empty State */}
          {hasSearch && totalResults === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900">No matching research records found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                No faculty, projects, publications, events, opportunities, or SOP guidelines matched &ldquo;{rawQuery}&rdquo;. Try searching for broader terms or clearing your search filter.
              </p>
              <div className="mt-4">
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  <span>Reset Search Filter</span> &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}

function ConfigurationRequired() {
  return (
    <LayoutShell activeNav="discover">
      <div className="p-8 max-w-xl mx-auto mt-12 rounded-2xl border border-slate-200 bg-white shadow-sm text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">Discovery</p>
        <h1 className="mt-2 text-2xl font-bold">Supabase Configuration Required</h1>
        <p className="mt-4 text-sm text-slate-600">
          Add <code>SUPABASE_URL</code> and <code>SUPABASE_PUBLISHABLE_KEY</code> to your environment.
        </p>
      </div>
    </LayoutShell>
  );
}

function DataError({ message }: { message: string }) {
  return (
    <LayoutShell activeNav="discover">
      <div className="p-8 max-w-xl mx-auto mt-12 rounded-2xl border border-red-200 bg-white shadow-sm text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">Error</p>
        <h1 className="mt-2 text-2xl font-bold">Could not query discovery graph</h1>
        <p className="mt-4 text-sm text-slate-600">{message}</p>
      </div>
    </LayoutShell>
  );
}
