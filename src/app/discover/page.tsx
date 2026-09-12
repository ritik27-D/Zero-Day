import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";

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

  const client = createSupabaseServerClient();

  const [researchersRes, projectsRes, publicationsRes, areasRes] = await Promise.all([
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
  ]);

  if (researchersRes.error) return <DataError message={researchersRes.error.message} />;
  if (projectsRes.error) return <DataError message={projectsRes.error.message} />;
  if (publicationsRes.error) return <DataError message={publicationsRes.error.message} />;

  const allResearchers = (researchersRes.data ?? []) as unknown as Researcher[];
  const allProjects = (projectsRes.data ?? []) as unknown as Project[];
  const allPublications = (publicationsRes.data ?? []) as unknown as Publication[];
  const allAreas = (areasRes.data ?? []) as { id: string; name: string; slug: string; description: string }[];

  const hasSearch = rawQuery.length > 0;

  // Filter with graph-awareness
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

  const totalResults = matchedResearchers.length + matchedProjects.length + matchedPublications.length;

  return (
    <LayoutShell activeNav="discover">
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
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
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              &larr; Dashboard
            </Link>
            <Link
              href="/researchers"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Researchers
            </Link>
            <Link
              href="/admin"
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
            >
              Admin Portal
            </Link>
          </div>
        </div>

        {/* Discovery Search Form */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Discover Connected Research
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Search across researchers, projects, publications, and topics in Islington College&apos;s
              research ecosystem.
            </p>
          </div>

          <form method="GET" action="/discover" className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  name="q"
                  defaultValue={rawQuery}
                  placeholder="Search a topic, e.g. Artificial Intelligence..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-700 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                Search
              </button>
              {hasSearch ? (
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>

          {/* Quick Filter Topic Pills */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Popular Topics:
            </span>
            {allAreas.map((area) => {
              const isSelected = rawQuery.toLowerCase() === area.name.toLowerCase();
              return (
                <Link
                  key={area.id}
                  href={`/discover?q=${encodeURIComponent(area.name)}`}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    isSelected
                      ? "bg-indigo-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  {area.name}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Search Results Summary */}
        {hasSearch ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Found <span className="font-bold text-slate-900">{totalResults}</span> connected results for{" "}
                <span className="font-semibold text-indigo-700">&ldquo;{rawQuery}&rdquo;</span>
              </p>
            </div>
            <div className="flex gap-3 text-xs font-medium">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
                {matchedResearchers.length} Researchers
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                {matchedProjects.length} Projects
              </span>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-800">
                {matchedPublications.length} Publications
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white/50 p-4 text-center">
            <p className="text-sm text-slate-600">
              Showing the full Islington R&amp;D ecosystem. Type a keyword above or select a topic pill to filter.
            </p>
          </div>
        )}

        {/* No Results State */}
        {hasSearch && totalResults === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">No matching research found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              No researchers, projects, or publications matched &ldquo;{rawQuery}&rdquo;. Try searching for an active topic such as &ldquo;Artificial Intelligence&rdquo; or &ldquo;Cybersecurity&rdquo;.
            </p>
            <div className="mt-6">
              <Link
                href="/discover"
                className="inline-flex rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800"
              >
                Clear Search
              </Link>
            </div>
          </div>
        ) : null}

        {/* Grouped Entity Results */}
        <div className="mt-10 space-y-12">
          {/* GROUP 1: RESEARCHERS */}
          {matchedResearchers.length > 0 ? (
            <section>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Researchers</h2>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                    {matchedResearchers.length}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {matchedResearchers.map((researcher) => {
                  const areas = researcher.researcher_research_areas
                    ?.map((r) => toItem(r.research_areas))
                    .filter((a): a is ResearchArea => Boolean(a));
                  const projects = researcher.project_researchers
                    ?.map((p) => toItem(p.projects))
                    .filter((p): p is { id: string; title: string; slug: string } => Boolean(p));

                  return (
                    <article
                      key={researcher.id}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/researchers/${researcher.slug}`}
                              className="text-lg font-bold text-slate-900 hover:text-indigo-700 hover:underline"
                            >
                              {researcher.name}
                            </Link>
                            <p className="text-sm font-medium text-indigo-700">{researcher.title}</p>
                          </div>
                          {researcher.is_demo ? (
                            <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                              Demo Data
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{researcher.bio}</p>

                        {/* Connected Research Areas */}
                        {areas && areas.length > 0 ? (
                          <div className="mt-4 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-medium text-slate-400">Areas:</span>
                            {areas.map((area) => (
                              <Link
                                key={area.id}
                                href={`/discover?q=${encodeURIComponent(area.name)}`}
                                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                {area.name}
                              </Link>
                            ))}
                          </div>
                        ) : null}

                        {/* Connected Projects */}
                        {projects && projects.length > 0 ? (
                          <div className="mt-3 text-xs text-slate-500">
                            <span className="font-medium text-slate-400">Projects: </span>
                            {projects.map((proj, idx) => (
                              <span key={proj.id}>
                                <Link
                                  href={`/projects/${proj.slug}`}
                                  className="font-medium text-indigo-700 hover:underline"
                                >
                                  {proj.title}
                                </Link>
                                {idx < projects.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-3">
                        <a
                          href={`mailto:${researcher.email}`}
                          className="inline-block text-xs font-medium text-indigo-700 hover:text-indigo-900"
                        >
                          {researcher.email}
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* GROUP 2: PROJECTS */}
          {matchedProjects.length > 0 ? (
            <section>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    {matchedProjects.length}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {matchedProjects.map((project) => {
                  const researchers = project.project_researchers
                    ?.map((r) => toItem(r.researchers))
                    .filter((r): r is { id: string; name: string; slug: string } => Boolean(r));
                  const areas = project.project_research_areas
                    ?.map((ra) => toItem(ra.research_areas))
                    .filter((a): a is ResearchArea => Boolean(a));
                  const publications = project.project_publications
                    ?.map((pub) => toItem(pub.publications))
                    .filter((pub): pub is { id: string; title: string; slug: string } => Boolean(pub));

                  return (
                    <article
                      key={project.id}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            href={`/projects/${project.slug}`}
                            className="text-lg font-bold text-slate-900 hover:text-indigo-700 hover:underline"
                          >
                            {project.title}
                          </Link>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-emerald-700 border border-emerald-200">
                              {project.status}
                            </span>
                            {project.is_demo ? (
                              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                Demo
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{project.description}</p>

                        {/* Connected Research Areas */}
                        {areas && areas.length > 0 ? (
                          <div className="mt-4 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-medium text-slate-400">Areas:</span>
                            {areas.map((area) => (
                              <Link
                                key={area.id}
                                href={`/discover?q=${encodeURIComponent(area.name)}`}
                                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                {area.name}
                              </Link>
                            ))}
                          </div>
                        ) : null}

                        {/* Connected Researchers */}
                        {researchers && researchers.length > 0 ? (
                          <div className="mt-3 text-xs text-slate-600">
                            <span className="font-medium text-slate-400">Researchers: </span>
                            {researchers.map((res, idx) => (
                              <span key={res.id}>
                                <Link
                                  href={`/researchers/${res.slug}`}
                                  className="font-medium text-indigo-700 hover:underline"
                                >
                                  {res.name}
                                </Link>
                                {idx < researchers.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {/* Connected Publications */}
                        {publications && publications.length > 0 ? (
                          <div className="mt-2 text-xs text-slate-500">
                            <span className="font-medium text-slate-400">Related Publications: </span>
                            {publications.map((pub, idx) => (
                              <span key={pub.id} className="italic">
                                {pub.title}
                                {idx < publications.length - 1 ? "; " : ""}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* GROUP 3: PUBLICATIONS */}
          {matchedPublications.length > 0 ? (
            <section>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Publications</h2>
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                    {matchedPublications.length}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {matchedPublications.map((pub) => {
                  const authors = pub.publication_researchers
                    ?.map((r) => toItem(r.researchers))
                    .filter((r): r is { id: string; name: string; slug: string } => Boolean(r));
                  const projects = pub.project_publications
                    ?.map((p) => toItem(p.projects))
                    .filter((p): p is { id: string; title: string; slug: string } => Boolean(p));

                  return (
                    <article
                      key={pub.id}
                      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-slate-900">{pub.title}</h3>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-purple-700 border border-purple-200">
                            {pub.status}
                          </span>
                          {pub.is_demo ? (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                              Demo
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <p className="mt-1 text-sm font-medium text-indigo-700">{pub.venue}</p>

                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{pub.abstract}</p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-4">
                          {authors && authors.length > 0 ? (
                            <div>
                              <span className="font-medium text-slate-400">Authors: </span>
                              {authors.map((author, idx) => (
                                <span key={author.id}>
                                  <Link
                                    href={`/researchers/${author.slug}`}
                                    className="font-medium text-indigo-700 hover:underline"
                                  >
                                    {author.name}
                                  </Link>
                                  {idx < authors.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {projects && projects.length > 0 ? (
                            <div>
                              <span className="font-medium text-slate-400">Project: </span>
                              {projects.map((proj, idx) => (
                                <span key={proj.id}>
                                  <Link
                                    href={`/projects/${proj.slug}`}
                                    className="font-medium text-indigo-700 hover:underline"
                                  >
                                    {proj.title}
                                  </Link>
                                  {idx < projects.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        {pub.doi ? (
                          <span className="font-mono text-[11px] text-slate-400">DOI: {pub.doi}</span>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </LayoutShell>
  );
}

function ConfigurationRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900">
      <section className="max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">Discovery</p>
        <h1 className="mt-2 text-3xl font-bold">Supabase needs configuration</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Add <code>SUPABASE_URL</code> and <code>SUPABASE_PUBLISHABLE_KEY</code> to your environment.
        </p>
      </section>
    </main>
  );
}

function DataError({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900">
      <section className="max-w-xl rounded-xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">Discovery</p>
        <h1 className="mt-2 text-3xl font-bold">Could not load research data</h1>
        <p className="mt-4 leading-7 text-slate-600">{message}</p>
      </section>
    </main>
  );
}
