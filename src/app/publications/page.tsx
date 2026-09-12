import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";

type Publication = {
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
    researchers: { id: string; name: string; slug: string } | null;
  }[];
  project_publications?: {
    projects: { id: string; title: string; slug: string } | null;
  }[];
};

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

function classifyPublication(venue: string): "journal" | "conference" | "report" | "other" {
  const v = (venue || "").toLowerCase();
  if (v.includes("journal")) return "journal";
  if (v.includes("conference") || v.includes("workshop") || v.includes("symposium") || v.includes("proceedings")) return "conference";
  if (v.includes("report") || v.includes("whitepaper") || v.includes("colloquium")) return "report";
  return "other";
}

export default async function PublicationsHubPage(props: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const typeFilter = searchParams.type?.toLowerCase() || "all";
  const query = searchParams.q?.toLowerCase() || "";

  if (!isSupabaseConfigured()) {
    return (
      <LayoutShell activeNav="publications">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600">Database configuration required to load publications.</p>
        </div>
      </LayoutShell>
    );
  }

  const client = createSupabaseServerClient();
  const { data, error } = await client
    .from("publications")
    .select(`
      id, slug, title, abstract, venue, doi, status, published_at, is_demo,
      publication_researchers ( researchers (id, name, slug) ),
      project_publications ( projects (id, title, slug) )
    `)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    return (
      <LayoutShell activeNav="publications">
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
          <p className="text-red-600">Failed to load publications: {error.message}</p>
        </div>
      </LayoutShell>
    );
  }

  const allPublications = (data ?? []) as unknown as Publication[];

  // Filter based on handbook tabs: all, journal, conference, report, other
  const filtered = allPublications.filter((p) => {
    if (query && !p.title.toLowerCase().includes(query) && !p.abstract.toLowerCase().includes(query) && !p.venue.toLowerCase().includes(query)) {
      return false;
    }
    const cat = classifyPublication(p.venue);
    if (typeFilter === "journal" && cat !== "journal") return false;
    if (typeFilter === "conference" && cat !== "conference") return false;
    if (typeFilter === "report" && cat !== "report") return false;
    if (typeFilter === "other" && cat !== "other") return false;
    return true;
  });

  const journalCount = allPublications.filter((p) => classifyPublication(p.venue) === "journal").length;
  const confCount = allPublications.filter((p) => classifyPublication(p.venue) === "conference").length;
  const reportCount = allPublications.filter((p) => classifyPublication(p.venue) === "report").length;
  const otherCount = allPublications.filter((p) => classifyPublication(p.venue) === "other").length;

  return (
    <LayoutShell activeNav="publications">
      <div className="space-y-8 sm:space-y-10">
        {/* Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-800">
              <span>PUBLICATIONS &amp; SCHOLARSHIP</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">Handbook Information Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Institutional Research Publications &amp; Scholarly Outputs
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore peer-reviewed journal articles, international conference proceedings, institutional technical
              reports, and scholarly monographs authored by Islington College researchers.
            </p>
          </div>
        </div>

        {/* IJMR Gateway Callout Card */}
        <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-white p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-700 text-white text-[10px] font-bold uppercase tracking-wider">
                Official Institutional Journal
              </span>
              <span className="text-xs font-semibold text-cyan-800">ISSN Online Indexed</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Islington Journal of Multidisciplinary Research (IJMR)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our flagship peer-reviewed, open-access academic journal publishing cutting-edge research across Computing,
              Applied Artificial Intelligence, and Technology Governance.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/ijmr"
              className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition shadow-sm"
            >
              Open IJMR Gateway &rarr;
            </Link>
          </div>
        </div>

        {/* Filter Navigation & Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <form method="GET" action="/publications" className="relative flex-1">
              <input type="hidden" name="type" value={typeFilter} />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search publication title, abstract, or venue..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Handbook Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <Link
                href={`/publications${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  typeFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Publications ({allPublications.length})
              </Link>
              <Link
                href={`/publications?type=journal${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  typeFilter === "journal" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Journal Articles ({journalCount})
              </Link>
              <Link
                href={`/publications?type=conference${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  typeFilter === "conference" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Conference Papers ({confCount})
              </Link>
              <Link
                href={`/publications?type=report${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  typeFilter === "report" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Reports ({reportCount})
              </Link>
              <Link
                href={`/publications?type=other${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  typeFilter === "other" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Other Outputs ({otherCount})
              </Link>
            </div>
          </div>
        </div>

        {/* Publications List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filtered.length} of {allPublications.length} indexed outputs
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Live Verified DB
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 space-y-2">
              <p className="font-bold">No publications matched your filter criteria.</p>
              <Link href="/publications" className="text-xs font-semibold text-cyan-700 hover:underline">
                Reset All Filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((pub) => {
                const authors = pub.publication_researchers
                  ?.map((pr) => toItem(pr.researchers))
                  .filter(Boolean) as { id: string; name: string; slug: string }[];
                const linkedProjects = pub.project_publications
                  ?.map((pp) => toItem(pp.projects))
                  .filter(Boolean) as { id: string; title: string; slug: string }[];
                const category = classifyPublication(pub.venue);

                return (
                  <article
                    key={pub.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-cyan-500 hover:shadow-md transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            category === "journal"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : category === "conference"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : category === "report"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {category === "journal"
                            ? "Journal Article"
                            : category === "conference"
                            ? "Conference Paper"
                            : category === "report"
                            ? "Institutional Report"
                            : "Scholarly Output"}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{pub.venue}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {pub.doi && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            DOI: {pub.doi}
                          </span>
                        )}
                        {pub.is_demo && (
                          <span className="text-[9px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                            Demo
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {pub.title}
                    </h2>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {pub.abstract}
                    </p>

                    {/* Authors & Project Attribution */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-400 font-medium">Authors:</span>
                        {authors && authors.length > 0 ? (
                          authors.map((author) => (
                            <Link
                              key={author.id}
                              href={`/researchers/${author.slug}`}
                              className="font-semibold text-cyan-700 hover:underline"
                            >
                              {author.name}
                            </Link>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">Faculty Investigators</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {linkedProjects && linkedProjects.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>Project:</span>
                            <Link
                              href={`/projects/${linkedProjects[0].slug}`}
                              className="font-semibold text-slate-700 hover:text-cyan-700 hover:underline max-w-[200px] truncate"
                            >
                              {linkedProjects[0].title}
                            </Link>
                          </div>
                        )}
                        <Link
                          href={`/discover?q=${encodeURIComponent(pub.title)}`}
                          className="font-bold text-cyan-700 hover:text-cyan-900 hover:underline"
                        >
                          Connected Graph &rarr;
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
