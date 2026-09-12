import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  start_date: string | null;
  end_date?: string | null;
  is_demo: boolean;
  project_researchers?: {
    researchers: { id: string; name: string; slug: string } | null;
  }[];
  project_research_areas?: {
    research_areas: { id: string; name: string; slug: string } | null;
  }[];
  project_publications?: {
    publications: { id: string; title: string; slug: string } | null;
  }[];
};

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

export default async function ProjectsHubPage(props: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const statusFilter = searchParams.status?.toLowerCase() || "all";
  const query = searchParams.q?.toLowerCase() || "";

  if (!isSupabaseConfigured()) {
    return (
      <LayoutShell activeNav="projects">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600">Database connection required to load projects.</p>
        </div>
      </LayoutShell>
    );
  }

  const client = createSupabaseServerClient();
  const { data: projectsData } = await client
    .from("projects")
    .select(`
      id, slug, title, description, status, start_date, is_demo,
      project_researchers ( researchers (id, name, slug) ),
      project_research_areas ( research_areas (id, name, slug) ),
      project_publications ( publications (id, title, slug) )
    `)
    .order("title");

  const allProjects = (projectsData ?? []) as unknown as ProjectItem[];

  // Filter projects by status and search query
  const filteredProjects = allProjects.filter((p) => {
    if (query && !p.title.toLowerCase().includes(query) && !p.description.toLowerCase().includes(query)) {
      return false;
    }
    if (statusFilter === "ongoing" || statusFilter === "active") {
      return p.status === "ongoing" || p.status === "active";
    }
    if (statusFilter === "completed") {
      return p.status === "completed";
    }
    if (statusFilter === "archive" || statusFilter === "archived") {
      return p.status === "archived" || p.status === "planned" || p.status === "completed";
    }
    return true;
  });

  const activeCount = allProjects.filter((p) => p.status === "ongoing" || p.status === "active").length;
  const completedCount = allProjects.filter((p) => p.status === "completed").length;
  const archiveCount = allProjects.filter((p) => p.status === "archived" || p.status === "planned" || p.status === "completed").length;

  return (
    <LayoutShell activeNav="projects">
      <div className="space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-800">
              <span>PROJECTS PORTFOLIO</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">Research Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Institutional Research Projects
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore active investigations, completed scientific projects, and historical archives led by faculty
              researchers and student innovators across Islington College.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Status Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <Link
                href="/projects"
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                  statusFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Projects ({allProjects.length})
              </Link>
              <Link
                href="/projects?status=ongoing"
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                  statusFilter === "ongoing" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Active Projects ({activeCount})
              </Link>
              <Link
                href="/projects?status=completed"
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                  statusFilter === "completed" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                }`}
              >
                Completed Projects ({completedCount})
              </Link>
              <Link
                href="/projects?status=archive"
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                  statusFilter === "archive" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Project Archive ({archiveCount})
              </Link>
            </div>

            {/* Keyword Search */}
            <form method="GET" action="/projects" className="relative sm:w-64">
              {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search projects..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredProjects.length} projects</span>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Live Database
            </span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 space-y-2">
              <p className="font-bold">No projects matched your criteria.</p>
              <Link href="/projects" className="text-xs font-semibold text-cyan-700 hover:underline">
                View All Projects
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredProjects.map((project) => {
                const team = project.project_researchers
                  ?.map((pr) => toItem(pr.researchers))
                  .filter(Boolean) || [];
                const areas = project.project_research_areas
                  ?.map((pra) => toItem(pra.research_areas))
                  .filter(Boolean) || [];
                const pubs = project.project_publications
                  ?.map((pp) => toItem(pp.publications))
                  .filter(Boolean) || [];

                return (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-cyan-500 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            project.status === "ongoing" || project.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : project.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {project.status}
                        </span>
                        {project.is_demo && (
                          <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase font-semibold">
                            Demo
                          </span>
                        )}
                      </div>

                      <Link href={`/projects/${project.slug}`} className="block mt-2 font-bold text-sm text-slate-900 hover:text-cyan-700 leading-snug">
                        {project.title}
                      </Link>

                      <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Team & Areas */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                        {team.length > 0 && (
                          <p className="truncate">
                            <span className="font-semibold text-slate-700">Team:</span> {team.map((t) => t?.name).join(", ")}
                          </p>
                        )}
                        {areas.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {areas.map((a) => (
                              <span key={a?.id} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                {a?.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {pubs.length} Publication{pubs.length === 1 ? "" : "s"} linked
                      </span>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="font-bold text-cyan-700 hover:text-cyan-900 hover:underline"
                      >
                        Project Details &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
