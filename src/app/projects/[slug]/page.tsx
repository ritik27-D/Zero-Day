import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";

type ResearchArea = {
  id: string;
  slug: string;
  name: string;
};

type LinkedResearcher = {
  id: string;
  slug: string;
  name: string;
  email: string;
  title: string;
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

type ProjectDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  is_demo: boolean;
  project_researchers?: {
    researchers: LinkedResearcher | LinkedResearcher[] | null;
  }[];
  project_research_areas?: {
    research_areas: ResearchArea | ResearchArea[] | null;
  }[];
  project_publications?: {
    publications: LinkedPublication | LinkedPublication[] | null;
  }[];
};

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

export default async function ProjectDetailPage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  await connection();
  if (!isSupabaseConfigured()) {
    return <ConfigurationRequired />;
  }

  const { slug } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true";
  const client = createSupabaseServerClient();

  const { data, error } = await client
    .from("projects")
    .select(`
      id,
      slug,
      title,
      description,
      status,
      start_date,
      end_date,
      is_demo,
      project_researchers (
        researchers (id, name, slug, title, email)
      ),
      project_research_areas (
        research_areas (id, name, slug)
      ),
      project_publications (
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

  const project = data as unknown as ProjectDetail;

  const researchers = project.project_researchers
    ?.map((r) => toItem(r.researchers))
    .filter((res): res is LinkedResearcher => Boolean(res)) ?? [];

  const areas = project.project_research_areas
    ?.map((ra) => toItem(ra.research_areas))
    .filter((a): a is ResearchArea => Boolean(a)) ?? [];

  const publications = project.project_publications
    ?.map((pub) => toItem(pub.publications))
    .filter((p): p is LinkedPublication => Boolean(p)) ?? [];

  return (
    <LayoutShell activeNav="projects">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        {/* Preview Banner */}
        {isPreview && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>PREVIEW MODE — Reviewing project proposal/record in draft state prior to public catalog indexing.</span>
            </div>
            <Link href="/admin?tab=projects" className="underline font-bold text-amber-950 hover:text-amber-800">
              Return to Admin &rarr;
            </Link>
          </div>
        )}

        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-cyan-700">
              Home
            </Link>
            <span>/</span>
            <Link href="/discover" className="hover:text-cyan-700">
              Projects
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-900 truncate max-w-xs">{project.title}</span>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/discover"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              &larr; Back to Discovery
            </Link>
            <Link
              href="/researchers"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Researchers
            </Link>
          </div>
        </div>

        {/* Project Hero Card */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                Research Project
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {project.title}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                Status: {project.status}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overview &amp; Objectives
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">{project.description}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-sm text-slate-600">
            <div>
              {project.start_date ? (
                <span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Timeline:
                  </span>{" "}
                  {project.start_date} {project.end_date ? `to ${project.end_date}` : "(Ongoing)"}
                </span>
              ) : null}
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

        {/* Linked Project Researchers */}
        <section className="mt-10">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Project Researchers</h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              {researchers.length}
            </span>
          </div>

          {researchers.length === 0 ? (
            <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No researchers currently assigned to this project.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {researchers.map((researcher) => (
                <article
                  key={researcher.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <Link
                      href={`/researchers/${researcher.slug}`}
                      className="text-lg font-bold text-slate-900 hover:text-indigo-700 hover:underline"
                    >
                      {researcher.name}
                    </Link>
                    <p className="mt-1 text-sm font-medium text-indigo-700">{researcher.title}</p>
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                    <a
                      href={`mailto:${researcher.email}`}
                      className="font-medium text-indigo-700 hover:underline"
                    >
                      {researcher.email}
                    </a>
                    <Link
                      href={`/researchers/${researcher.slug}`}
                      className="font-semibold text-slate-600 hover:text-indigo-700"
                    >
                      View Profile &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Linked Publications */}
        <section className="mt-12">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Related Publications
            </h2>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
              {publications.length}
            </span>
          </div>

          {publications.length === 0 ? (
            <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No publications directly linked to this project yet.
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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">Project</p>
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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">Project</p>
        <h1 className="mt-2 text-3xl font-bold">Could not load project</h1>
        <p className="mt-4 leading-7 text-slate-600">{message}</p>
      </section>
    </main>
  );
}
