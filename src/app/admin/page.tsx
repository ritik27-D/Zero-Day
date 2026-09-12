import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";
import {
  saveResearcherAction,
  saveProjectAction,
  deleteResearcherAction,
  deleteProjectAction,
} from "./actions";

type ResearchArea = {
  id: string;
  name: string;
  slug: string;
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
    research_areas: { id: string; name: string } | { id: string; name: string }[] | null;
  }[];
};

type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  is_demo: boolean;
  project_researchers?: {
    researchers: { id: string; name: string } | { id: string; name: string }[] | null;
  }[];
  project_research_areas?: {
    research_areas: { id: string; name: string } | { id: string; name: string }[] | null;
  }[];
  project_publications?: {
    publications: { id: string; title: string } | { id: string; title: string }[] | null;
  }[];
};

type Publication = {
  id: string;
  title: string;
  slug: string;
};

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

export default async function AdminPage(props: {
  searchParams: Promise<{
    tab?: string;
    editResearcher?: string;
    editProject?: string;
    success?: string;
    error?: string;
  }>;
}) {
  await connection();
  if (!isSupabaseConfigured()) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900">
        <section className="max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Supabase Not Configured</h1>
          <p className="mt-4 leading-7 text-slate-600">
            Please ensure <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> are configured.
          </p>
        </section>
      </main>
    );
  }

  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab === "projects" ? "projects" : "researchers";
  const successMsg = searchParams.success;
  const errorMsg = searchParams.error;
  const editingResearcherId = searchParams.editResearcher;
  const editingProjectId = searchParams.editProject;

  const client = createSupabaseServerClient();

  const [researchersRes, projectsRes, areasRes, publicationsRes] = await Promise.all([
    client
      .from("researchers")
      .select("id, slug, name, email, title, bio, is_demo, researcher_research_areas(research_areas(id, name))")
      .order("name"),
    client
      .from("projects")
      .select(
        "id, slug, title, description, status, start_date, end_date, is_demo, project_researchers(researchers(id, name)), project_research_areas(research_areas(id, name)), project_publications(publications(id, title))"
      )
      .order("title"),
    client.from("research_areas").select("id, name, slug").order("name"),
    client.from("publications").select("id, title, slug").order("title"),
  ]);

  const researchers = (researchersRes.data ?? []) as unknown as Researcher[];
  const projects = (projectsRes.data ?? []) as unknown as Project[];
  const areas = (areasRes.data ?? []) as ResearchArea[];
  const publications = (publicationsRes.data ?? []) as Publication[];

  const editingResearcher = editingResearcherId
    ? researchers.find((r) => r.id === editingResearcherId)
    : null;

  const editingProject = editingProjectId ? projects.find((p) => p.id === editingProjectId) : null;

  const editingResearcherAreaIds = new Set(
    editingResearcher?.researcher_research_areas
      ?.map((ra) => toItem(ra.research_areas)?.id)
      .filter(Boolean) ?? []
  );

  const editingProjectResearcherIds = new Set(
    editingProject?.project_researchers
      ?.map((pr) => toItem(pr.researchers)?.id)
      .filter(Boolean) ?? []
  );

  const editingProjectAreaIds = new Set(
    editingProject?.project_research_areas
      ?.map((pra) => toItem(pra.research_areas)?.id)
      .filter(Boolean) ?? []
  );

  const editingProjectPublicationIds = new Set(
    editingProject?.project_publications
      ?.map((pp) => toItem(pp.publications)?.id)
      .filter(Boolean) ?? []
  );

  return (
    <LayoutShell activeNav="admin">
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-800">
                Admin Portal
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Islington College Hackathon 2026
              </p>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Research Data Management
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
              href="/discover"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Unified Discovery &rarr;
            </Link>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {successMsg}
          </div>
        ) : null}

        {errorMsg ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {errorMsg}
          </div>
        ) : null}

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-2 border-b border-slate-200 pb-px">
          <Link
            href="/admin?tab=researchers"
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition ${
              activeTab === "researchers"
                ? "border-indigo-600 bg-white text-indigo-700 shadow-sm"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Researchers ({researchers.length})
          </Link>
          <Link
            href="/admin?tab=projects"
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition ${
              activeTab === "projects"
                ? "border-indigo-600 bg-white text-indigo-700 shadow-sm"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Projects ({projects.length})
          </Link>
        </div>

        {/* TAB 1: RESEARCHERS MANAGEMENT */}
        {activeTab === "researchers" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            {/* Researcher Form */}
            <div className="lg:col-span-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingResearcher ? `Edit: ${editingResearcher.name}` : "Add New Researcher"}
                  </h2>
                  {editingResearcher ? (
                    <Link
                      href="/admin?tab=researchers"
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                    >
                      Cancel Edit
                    </Link>
                  ) : null}
                </div>

                <form action={saveResearcherAction} className="mt-5 space-y-4 text-sm">
                  {editingResearcher ? (
                    <input type="hidden" name="id" value={editingResearcher.id} />
                  ) : null}

                  <div>
                    <label className="block font-semibold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingResearcher?.name ?? ""}
                      placeholder="e.g. Dr Aisha Rahman"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Slug * (URL Identifier)</label>
                    <input
                      type="text"
                      name="slug"
                      required
                      defaultValue={editingResearcher?.slug ?? ""}
                      placeholder="e.g. dr-aisha-rahman"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono text-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Academic Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={editingResearcher?.title ?? ""}
                      placeholder="e.g. Senior Lecturer, Computing"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      defaultValue={editingResearcher?.email ?? ""}
                      placeholder="e.g. aisha.rahman@demo.islington.edu.np"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Biography / Research Focus *</label>
                    <textarea
                      name="bio"
                      required
                      rows={3}
                      defaultValue={editingResearcher?.bio ?? ""}
                      placeholder="Describe research specialization, interests, and background..."
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  {/* Research Areas Linker */}
                  <div>
                    <label className="block font-semibold text-slate-700">
                      Link Research Areas
                    </label>
                    <p className="text-xs text-slate-500 mb-2">Select all topics this researcher contributes to:</p>
                    <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 max-h-40 overflow-y-auto">
                      {areas.map((area) => (
                        <label key={area.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="research_area_ids"
                            value={area.id}
                            defaultChecked={editingResearcherAreaIds.has(area.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{area.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="r_is_demo"
                      name="is_demo"
                      defaultChecked={editingResearcher?.is_demo ?? true}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="r_is_demo" className="text-xs font-medium text-slate-700">
                      Mark as Demo Data
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-indigo-700 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-800 transition"
                    >
                      {editingResearcher ? "Update Researcher" : "Create Researcher"}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            {/* Researchers List */}
            <div className="lg:col-span-7">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                  Existing Researchers ({researchers.length})
                </h2>

                <div className="mt-4 divide-y divide-slate-100">
                  {researchers.map((r) => {
                    const rAreas =
                      r.researcher_research_areas
                        ?.map((ra) => toItem(ra.research_areas))
                        .filter(Boolean) as { id: string; name: string }[] | undefined;

                    return (
                      <div key={r.id} className="py-4 flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/researchers/${r.slug}`}
                              className="font-bold text-slate-900 hover:text-indigo-700 hover:underline truncate"
                            >
                              {r.name}
                            </Link>
                            {r.is_demo ? (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                                Demo
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs font-medium text-indigo-700">{r.title}</p>
                          <p className="mt-1 text-xs text-slate-500 truncate">{r.email}</p>

                          {rAreas && rAreas.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {rAreas.map((a) => (
                                <span
                                  key={a.id}
                                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
                                >
                                  {a.name}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/admin?tab=researchers&editResearcher=${r.id}`}
                            className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                          <form action={deleteResearcherAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <button
                              type="submit"
                              className="rounded border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        ) : null}

        {/* TAB 2: PROJECTS MANAGEMENT */}
        {activeTab === "projects" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            {/* Project Form */}
            <div className="lg:col-span-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingProject ? `Edit: ${editingProject.title}` : "Add New Project"}
                  </h2>
                  {editingProject ? (
                    <Link
                      href="/admin?tab=projects"
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                    >
                      Cancel Edit
                    </Link>
                  ) : null}
                </div>

                <form action={saveProjectAction} className="mt-5 space-y-4 text-sm">
                  {editingProject ? (
                    <input type="hidden" name="id" value={editingProject.id} />
                  ) : null}

                  <div>
                    <label className="block font-semibold text-slate-700">Project Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={editingProject?.title ?? ""}
                      placeholder="e.g. Sentinel: AI Intrusion Detection"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Slug * (URL Identifier)</label>
                    <input
                      type="text"
                      name="slug"
                      required
                      defaultValue={editingProject?.slug ?? ""}
                      placeholder="e.g. sentinel-ai-ids"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono text-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Status *</label>
                    <select
                      name="status"
                      defaultValue={editingProject?.status ?? "ongoing"}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 capitalize focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="planned">Planned</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      defaultValue={editingProject?.description ?? ""}
                      placeholder="Describe the research aims, methodologies, and objectives..."
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs">Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        defaultValue={editingProject?.start_date ?? ""}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs">End Date</label>
                      <input
                        type="date"
                        name="end_date"
                        defaultValue={editingProject?.end_date ?? ""}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Researchers Linker */}
                  <div>
                    <label className="block font-semibold text-slate-700">
                      Link Researchers (Team)
                    </label>
                    <div className="mt-1 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 max-h-32 overflow-y-auto">
                      {researchers.map((res) => (
                        <label key={res.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="researcher_ids"
                            value={res.id}
                            defaultChecked={editingProjectResearcherIds.has(res.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{res.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Research Areas Linker */}
                  <div>
                    <label className="block font-semibold text-slate-700">
                      Link Research Areas
                    </label>
                    <div className="mt-1 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 max-h-32 overflow-y-auto">
                      {areas.map((area) => (
                        <label key={area.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="research_area_ids"
                            value={area.id}
                            defaultChecked={editingProjectAreaIds.has(area.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{area.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Publications Linker */}
                  <div>
                    <label className="block font-semibold text-slate-700">
                      Link Publications
                    </label>
                    <div className="mt-1 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 max-h-32 overflow-y-auto">
                      {publications.map((pub) => (
                        <label key={pub.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="publication_ids"
                            value={pub.id}
                            defaultChecked={editingProjectPublicationIds.has(pub.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="truncate">{pub.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="p_is_demo"
                      name="is_demo"
                      defaultChecked={editingProject?.is_demo ?? true}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="p_is_demo" className="text-xs font-medium text-slate-700">
                      Mark as Demo Data
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-indigo-700 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-800 transition"
                    >
                      {editingProject ? "Update Project" : "Create Project"}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            {/* Projects List */}
            <div className="lg:col-span-7">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                  Existing Projects ({projects.length})
                </h2>

                <div className="mt-4 divide-y divide-slate-100">
                  {projects.map((p) => {
                    const pResearchers =
                      p.project_researchers
                        ?.map((pr) => toItem(pr.researchers))
                        .filter(Boolean) as { id: string; name: string }[] | undefined;
                    const pAreas =
                      p.project_research_areas
                        ?.map((pra) => toItem(pra.research_areas))
                        .filter(Boolean) as { id: string; name: string }[] | undefined;

                    return (
                      <div key={p.id} className="py-4 flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/projects/${p.slug}`}
                              className="font-bold text-slate-900 hover:text-indigo-700 hover:underline truncate"
                            >
                              {p.title}
                            </Link>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-emerald-700">
                              {p.status}
                            </span>
                            {p.is_demo ? (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                                Demo
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-1 text-xs text-slate-600 line-clamp-2">{p.description}</p>

                          {pResearchers && pResearchers.length > 0 ? (
                            <p className="mt-2 text-xs text-slate-500">
                              <span className="font-semibold text-slate-400">Team: </span>
                              {pResearchers.map((res) => res.name).join(", ")}
                            </p>
                          ) : null}

                          {pAreas && pAreas.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {pAreas.map((a) => (
                                <span
                                  key={a.id}
                                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
                                >
                                  {a.name}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/admin?tab=projects&editProject=${p.id}`}
                            className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                          <form action={deleteProjectAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <button
                              type="submit"
                              className="rounded border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </LayoutShell>
  );
}
