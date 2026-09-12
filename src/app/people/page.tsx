import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";
import { getResearchGroups } from "@/lib/hub-data";

type ResearcherItem = {
  id: string;
  slug: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  is_demo: boolean;
  researcher_research_areas?: {
    research_areas: { id: string; name: string; slug: string } | null;
  }[];
};

type ResearchAreaItem = {
  id: string;
  name: string;
  slug: string;
};

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

export default async function PeopleHubPage(props: {
  searchParams: Promise<{ dept?: string; area?: string; q?: string }>;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const deptFilter = searchParams.dept?.toLowerCase() || "";
  const areaFilter = searchParams.area?.toLowerCase() || "";
  const query = searchParams.q?.toLowerCase() || "";

  if (!isSupabaseConfigured()) {
    return (
      <LayoutShell activeNav="people">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600">Database configuration required to load researchers.</p>
        </div>
      </LayoutShell>
    );
  }

  const client = createSupabaseServerClient();
  const [researchersRes, areasRes, researchGroups] = await Promise.all([
    client
      .from("researchers")
      .select(`
        id, slug, name, email, title, bio, is_demo,
        researcher_research_areas ( research_areas (id, name, slug) )
      `)
      .order("name"),
    client.from("research_areas").select("id, name, slug").order("name"),
    getResearchGroups(),
  ]);

  const allResearchers = (researchersRes.data ?? []) as unknown as ResearcherItem[];
  const areas = (areasRes.data ?? []) as ResearchAreaItem[];

  // Filter researchers based on query, dept, or area
  const filteredResearchers = allResearchers.filter((r) => {
    if (query && !r.name.toLowerCase().includes(query) && !r.title.toLowerCase().includes(query) && !r.bio.toLowerCase().includes(query)) {
      return false;
    }
    if (deptFilter) {
      if (deptFilter === "computing" && !r.title.toLowerCase().includes("computing") && !r.bio.toLowerCase().includes("computing")) return false;
      if (deptFilter === "networking" && !r.title.toLowerCase().includes("network") && !r.bio.toLowerCase().includes("network")) return false;
      if (deptFilter === "ai" && !r.title.toLowerCase().includes("intelligence") && !r.bio.toLowerCase().includes("ai") && !r.bio.toLowerCase().includes("learning")) return false;
    }
    if (areaFilter) {
      const hasArea = r.researcher_research_areas?.some((ra) => {
        const area = toItem(ra.research_areas);
        return area?.slug.toLowerCase().includes(areaFilter) || area?.name.toLowerCase().includes(areaFilter);
      });
      if (!hasArea) return false;
    }
    return true;
  });

  return (
    <LayoutShell activeNav="people">
      <div className="space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-800">
              <span>PEOPLE &amp; FACULTY</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">Researcher Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Islington Researchers &amp; Faculty Investigators
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore profiles of faculty researchers, lecturers, and student innovators across Islington College. Filter
              by academic department, specialized research area, or affiliated research lab.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <form method="GET" action="/people" className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search faculty name, title, or keywords..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Department Views */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-500 font-semibold shrink-0">Department:</span>
              <Link
                href="/people"
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  !deptFilter ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Departments
              </Link>
              <Link
                href="/people?dept=computing"
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  deptFilter === "computing" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Computing &amp; IT
              </Link>
              <Link
                href="/people?dept=ai"
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  deptFilter === "ai" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                AI &amp; Data Science
              </Link>
              <Link
                href="/people?dept=networking"
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  deptFilter === "networking" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Networking &amp; Cyber
              </Link>
            </div>
          </div>

          {/* Research Area Views */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Research Area:</span>
            <Link
              href="/people"
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                !areaFilter ? "bg-cyan-100 text-cyan-900 font-bold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Areas
            </Link>
            {areas.map((area) => (
              <Link
                key={area.id}
                href={`/people?area=${encodeURIComponent(area.slug)}`}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  areaFilter === area.slug.toLowerCase()
                    ? "bg-cyan-600 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {area.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Researcher Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredResearchers.length} of {allResearchers.length} researchers</span>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Live Database
            </span>
          </div>

          {filteredResearchers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 space-y-2">
              <p className="font-bold">No researchers matched your filter.</p>
              <Link href="/people" className="text-xs font-semibold text-cyan-700 hover:underline">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredResearchers.map((researcher) => {
                const linkedAreas = researcher.researcher_research_areas
                  ?.map((ra) => toItem(ra.research_areas))
                  .filter(Boolean) as ResearchAreaItem[];

                return (
                  <div
                    key={researcher.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-cyan-500 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                            {researcher.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <h2 className="text-sm font-bold text-slate-900 leading-snug">
                              {researcher.name}
                            </h2>
                            <p className="text-xs font-semibold text-cyan-700">{researcher.title}</p>
                          </div>
                        </div>
                        {researcher.is_demo && (
                          <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase">
                            Demo
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {researcher.bio}
                      </p>

                      {linkedAreas.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {linkedAreas.map((area) => (
                            <span
                              key={area.id}
                              className="rounded bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium"
                            >
                              {area.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono truncate max-w-[160px]">
                        {researcher.email}
                      </span>
                      <Link
                        href={`/researchers/${researcher.slug}`}
                        className="text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline"
                      >
                        Full Profile &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Affiliated Research Groups */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Affiliated Research Groups &amp; Labs</h2>
            <p className="text-xs text-slate-500">Collaborative faculty research clusters established across Islington College.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {researchGroups.map((grp) => (
              <div key={grp.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Research Group
                </span>
                <h3 className="font-bold text-xs text-slate-900">{grp.name}</h3>
                <p className="text-[11px] text-slate-600 line-clamp-2">{grp.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </LayoutShell>
  );
}
