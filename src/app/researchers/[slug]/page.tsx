import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/auth";
import LayoutShell from "@/components/layout-shell";

type ResearchArea = {
  id: string;
  slug: string;
  name: string;
};

type LinkedProject = {
  id: string;
  slug: string;
  title: string;
  status: string;
  description: string;
};

type LinkedPublication = {
  id: string;
  slug: string;
  title: string;
  venue: string;
  status: string;
  doi: string | null;
  published_at: string | null;
};

type ResearcherDetail = {
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
    projects: LinkedProject | LinkedProject[] | null;
  }[];
  publication_researchers?: {
    publications: LinkedPublication | LinkedPublication[] | null;
  }[];
};

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

export default async function ResearcherDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  if (!isSupabaseConfigured()) {
    return <ConfigurationRequired />;
  }

  const { slug } = await props.params;
  const client = createSupabaseServerClient();

  const { data, error } = await client
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
        projects (id, title, slug, status, description)
      ),
      publication_researchers (
        publications (id, title, slug, venue, status, doi, published_at)
      )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return <DataError message={error.message} />;
  }

  if (!data) {
    notFound();
  }

  const researcher = data as unknown as ResearcherDetail;
  const session = await getCurrentSession();
  const isOwnProfile = session?.profile.researcher?.slug === slug;

  const areas = researcher.researcher_research_areas
    ?.map((r) => toItem(r.research_areas))
    .filter((a): a is ResearchArea => Boolean(a)) ?? [];

  const projects = researcher.project_researchers
    ?.map((p) => toItem(p.projects))
    .filter((p): p is LinkedProject => Boolean(p)) ?? [];

  const publications = researcher.publication_researchers
    ?.map((p) => toItem(p.publications))
    .filter((pub): pub is LinkedPublication => Boolean(pub)) ?? [];

  return (
    <LayoutShell activeNav="researchers">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-cyan-700">
              Home
            </Link>
            <span>/</span>
            <Link href="/researchers" className="hover:text-cyan-700">
              Researchers
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-900">{researcher.name}</span>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/researchers"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              &larr; All Researchers
            </Link>
            <Link
              href="/discover"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Unified Discovery
            </Link>
          </div>
        </div>

        {/* Researcher Profile Hero */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                Researcher Profile
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {researcher.name}
              </h1>
              <p className="mt-1.5 text-base font-medium text-indigo-700">{researcher.title}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!isOwnProfile && (
                <Link
                  href={session ? `/researcher/messages?recipientId=${researcher.id}` : `/login?redirect=/researcher/messages?recipientId=${researcher.id}`}
                  className="rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-1.5 text-xs font-bold text-cyan-900 hover:bg-cyan-100 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Message Researcher</span>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Biography &amp; Focus
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">{researcher.bio}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contact:
              </span>{" "}
              <a
                href={`mailto:${researcher.email}`}
                className="font-medium text-indigo-700 hover:underline mr-3"
              >
                {researcher.email}
              </a>
              {!isOwnProfile && (
                <Link
                  href={session ? `/researcher/messages?recipientId=${researcher.id}` : `/login?redirect=/researcher/messages?recipientId=${researcher.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800 underline"
                >
                  Direct Message &rarr;
                </Link>
              )}
            </div>

            {/* Linked Research Areas */}
            {areas.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Areas:
                </span>
                {areas.map((area) => (
                  <Link
                    key={area.id}
                    href={`/discover?q=${encodeURIComponent(area.name)}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    {area.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* Connected Projects */}
        <section className="mt-10">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Connected Projects</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              {projects.length}
            </span>
          </div>

          {projects.length === 0 ? (
            <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No active research projects currently linked to this researcher.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {projects.map((project) => (
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
                      <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-emerald-700">
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {project.description}
                    </p>
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-3">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="text-xs font-semibold text-indigo-700 hover:underline"
                    >
                      View Project Details &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Connected Publications */}
        <section className="mt-12">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Publications</h2>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
              {publications.length}
            </span>
          </div>

          {publications.length === 0 ? (
            <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No publications currently recorded for this researcher.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {publications.map((pub) => (
                <article
                  key={pub.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{pub.title}</h3>
                    <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-purple-700">
                      {pub.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-indigo-700">{pub.venue}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    {pub.published_at ? <span>Published: {pub.published_at}</span> : <span>Pre-print</span>}
                    {pub.doi ? <span className="font-mono text-[11px]">DOI: {pub.doi}</span> : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </LayoutShell>
  );
}

function ConfigurationRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900">
      <section className="max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">Researcher</p>
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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">Researcher</p>
        <h1 className="mt-2 text-3xl font-bold">Could not load researcher</h1>
        <p className="mt-4 leading-7 text-slate-600">{message}</p>
      </section>
    </main>
  );
}
