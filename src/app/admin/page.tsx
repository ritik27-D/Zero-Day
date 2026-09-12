import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { listAllSubmissions } from "@/lib/submissions";
import LayoutShell from "@/components/layout-shell";
import {
  saveResearcherAction,
  saveProjectAction,
  deleteResearcherAction,
  deleteProjectAction,
  approveSubmissionAction,
  rejectSubmissionAction,
  provisionResearcherAccountAction,
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

type Submission = {
  id: string;
  submission_type: string;
  title: string;
  status: string;
  payload: Record<string, unknown>;
  admin_notes: string | null;
  created_at: string;
  researcher_id: string;
  researchers?: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

function formatVal(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const str = String(v).trim();
  return str.length > 0 ? str : "—";
}

function SubmissionPayloadCard({ sub }: { sub: Submission }) {
  const p = (sub.payload || {}) as Record<string, unknown>;

  if (sub.submission_type === "new_project" || sub.submission_type === "project_update") {
    const title = formatVal(p.project_title || p.title);
    const description = formatVal(p.description);
    const status = formatVal(p.status);
    const startDate = formatVal(p.start_date);
    const endDate = formatVal(p.end_date);
    const slug = formatVal(p.slug || p.project_slug);

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Project Details</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {sub.submission_type === "new_project" ? "New Project" : "Project Update"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Project Title
            </span>
            <p className="mt-1 text-base font-bold text-slate-900">
              {title}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Project Description
            </span>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {description !== "—" ? description : (
                  <span className="text-slate-400 italic">No description provided.</span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Status
              </span>
              <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold uppercase text-[11px] border border-indigo-100">
                {status}
              </span>
            </div>

            <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Timeline
              </span>
              <div className="mt-1 space-y-0.5 text-xs text-slate-700">
                <p><span className="text-slate-400 font-medium">Start Date:</span> {startDate}</p>
                <p><span className="text-slate-400 font-medium">End Date:</span> {endDate}</p>
              </div>
            </div>

            <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Project Slug
              </span>
              <p className="mt-1 font-mono text-xs text-slate-700 truncate">
                {slug}
              </p>
            </div>
          </div>

          {p.project_id ? (
            <div className="text-xs text-slate-500 border-t border-slate-200/80 pt-2.5">
              <span className="font-semibold text-slate-600">Existing Target Project ID:</span>{" "}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{String(p.project_id)}</code>
            </div>
          ) : null}
        </div>

        <details className="text-xs text-slate-500 group">
          <summary className="cursor-pointer font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 py-1 select-none w-fit">
            <span>View raw payload</span>
            <svg className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <pre className="font-mono text-[11px] text-slate-600 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(sub.payload, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    );
  }

  if (sub.submission_type === "profile_update") {
    const title = formatVal(p.title || p.title_role);
    const bio = formatVal(p.bio);

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Profile Update Details</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Profile Revision
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Proposed Academic Title / Position
            </span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {title}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Proposed Biography &amp; Research Statement
            </span>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {bio !== "—" ? bio : (
                  <span className="text-slate-400 italic">No biography provided.</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <details className="text-xs text-slate-500 group">
          <summary className="cursor-pointer font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 py-1 select-none w-fit">
            <span>View raw payload</span>
            <svg className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <pre className="font-mono text-[11px] text-slate-600 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(sub.payload, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    );
  }

  if (sub.submission_type === "new_publication" || sub.submission_type === "publication_update") {
    const pubTitle = formatVal(p.pub_title || p.title);
    const abstract = formatVal(p.abstract);
    const venue = formatVal(p.venue);
    const status = formatVal(p.status);
    const publishedAt = formatVal(p.published_at);
    const doi = formatVal(p.doi);
    const slug = formatVal(p.slug || p.pub_slug);

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Publication Details</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {sub.submission_type === "new_publication" ? "New Publication" : "Publication Update"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Publication Title
            </span>
            <p className="mt-1 text-base font-bold text-slate-900">
              {pubTitle}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Abstract &amp; Summary
            </span>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {abstract !== "—" ? abstract : (
                  <span className="text-slate-400 italic">No abstract provided.</span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Target Venue
              </span>
              <p className="mt-1 text-xs font-medium text-slate-800">
                {venue}
              </p>
            </div>

            <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Status
              </span>
              <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold uppercase text-[11px] border border-purple-100">
                {status}
              </span>
            </div>

            <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Published Date
              </span>
              <p className="mt-1 text-xs font-medium text-slate-800">
                {publishedAt}
              </p>
            </div>

            <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                DOI
              </span>
              <p className="mt-1 font-mono text-xs text-slate-700 truncate">
                {doi}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Publication Slug
              </span>
              <p className="mt-1 font-mono text-xs text-slate-700 truncate">
                {slug}
              </p>
            </div>
            {p.linked_project_id ? (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Linked Project ID
                </span>
                <p className="mt-1 font-mono text-xs text-slate-700 truncate">
                  {String(p.linked_project_id)}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <details className="text-xs text-slate-500 group">
          <summary className="cursor-pointer font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 py-1 select-none w-fit">
            <span>View raw payload</span>
            <svg className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <pre className="font-mono text-[11px] text-slate-600 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(sub.payload, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    );
  }

  // Fallback for any other submission type
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Submission Details</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {sub.submission_type.replace(/_/g, " ")}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {Object.entries(p).map(([key, val]) => (
            <div key={key} className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {key.replace(/_/g, " ")}
              </span>
              <p className="mt-1 text-slate-800 break-words font-medium">
                {formatVal(val)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <details className="text-xs text-slate-500 group">
        <summary className="cursor-pointer font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5 py-1 select-none w-fit">
          <span>View raw payload</span>
          <svg className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <pre className="font-mono text-[11px] text-slate-600 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(sub.payload, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
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

  // Server-side authentication and role check (redirects to /admin/login if not admin)
  const session = await requireAdmin();

  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "researchers";
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

  // Fetch submissions for review
  const submissions = ((await listAllSubmissions()) ?? []) as unknown as Submission[];

  const pendingSubmissionsCount = submissions.filter((s) => s.status === "pending").length;

  const editingResearcher = editingResearcherId
    ? researchers.find((r) => r.id === editingResearcherId)
    : null;

  const editingProject = editingProjectId ? projects.find((p) => p.id === editingProjectId) : null;

  const editingAreaIds = new Set(
    editingResearcher?.researcher_research_areas
      ?.map((rra) => toItem(rra.research_areas)?.id)
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
                Islington College Governance
              </p>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Research Data &amp; Submissions Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold text-slate-800">
                Admin: {session.profile.username}
              </span>
            </div>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              &larr; Public Hub
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {successMsg}
          </div>
        ) : null}

        {errorMsg ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {errorMsg}
          </div>
        ) : null}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
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
          <Link
            href="/admin?tab=submissions"
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "submissions"
                ? "border-indigo-600 bg-white text-indigo-700 shadow-sm"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>Submissions</span>
            {pendingSubmissionsCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingSubmissionsCount}
              </span>
            ) : (
              <span className="text-xs text-slate-400">({submissions.length})</span>
            )}
          </Link>
          <Link
            href="/admin?tab=accounts"
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition ${
              activeTab === "accounts"
                ? "border-indigo-600 bg-white text-indigo-700 shadow-sm"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Provision Accounts
          </Link>
        </div>

        {/* TAB 1: RESEARCHERS MANAGEMENT */}
        {activeTab === "researchers" ? (
          <div className="grid gap-8 lg:grid-cols-12">
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
                    <label className="block font-semibold text-slate-700">Title / Designation *</label>
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
                    <label className="block font-semibold text-slate-700">Biography / Focus *</label>
                    <textarea
                      name="bio"
                      required
                      rows={3}
                      defaultValue={editingResearcher?.bio ?? ""}
                      placeholder="Research focus and academic overview..."
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-2">
                      Linked Research Areas
                    </label>
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50">
                      {areas.map((area) => {
                        const isChecked = editingAreaIds.has(area.id);
                        return (
                          <label key={area.id} className="flex items-center gap-2 text-xs text-slate-700">
                            <input
                              type="checkbox"
                              name="research_area_ids"
                              value={area.id}
                              defaultChecked={isChecked}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{area.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_demo_researcher"
                      name="is_demo"
                      defaultChecked={editingResearcher ? editingResearcher.is_demo : true}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="is_demo_researcher" className="text-xs text-slate-600">
                      Mark as Demo Data
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
                    >
                      {editingResearcher ? "Update Researcher" : "Create Researcher"}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            {/* Researcher List */}
            <div className="lg:col-span-7">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Existing Researchers ({researchers.length})
                </h2>
                <div className="mt-4 divide-y divide-slate-100">
                  {researchers.map((r) => {
                    const rAreas = r.researcher_research_areas
                      ?.map((rra) => toItem(rra.research_areas))
                      .filter((item): item is { id: string; name: string } => Boolean(item));

                    return (
                      <div key={r.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/researchers/${r.slug}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-indigo-600 transition"
                            >
                              {r.name}
                            </Link>
                            {r.is_demo ? (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                Demo
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-500">{r.title}</p>
                          <p className="text-xs text-slate-400 font-mono">{r.email}</p>

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
          <div className="grid gap-8 lg:grid-cols-12">
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
                      placeholder="e.g. AI-Based Network Security"
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
                      placeholder="e.g. ai-network-sec"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Status *</label>
                    <select
                      name="status"
                      required
                      defaultValue={editingProject?.status ?? "planned"}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
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
                      placeholder="Scope and research objectives..."
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
                        className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs">End Date</label>
                      <input
                        type="date"
                        name="end_date"
                        defaultValue={editingProject?.end_date ?? ""}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Multi-links */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Participating Researchers
                    </label>
                    <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 p-2.5 space-y-1.5 bg-slate-50">
                      {researchers.map((r) => {
                        const isChecked = editingProjectResearcherIds.has(r.id);
                        return (
                          <label key={r.id} className="flex items-center gap-2 text-xs text-slate-700">
                            <input
                              type="checkbox"
                              name="researcher_ids"
                              value={r.id}
                              defaultChecked={isChecked}
                              className="rounded border-slate-300 text-indigo-600"
                            />
                            <span>{r.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Connected Research Areas
                    </label>
                    <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 p-2.5 space-y-1.5 bg-slate-50">
                      {areas.map((a) => {
                        const isChecked = editingProjectAreaIds.has(a.id);
                        return (
                          <label key={a.id} className="flex items-center gap-2 text-xs text-slate-700">
                            <input
                              type="checkbox"
                              name="research_area_ids"
                              value={a.id}
                              defaultChecked={isChecked}
                              className="rounded border-slate-300 text-indigo-600"
                            />
                            <span>{a.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Linked Publications
                    </label>
                    <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 p-2.5 space-y-1.5 bg-slate-50">
                      {publications.map((pub) => {
                        const isChecked = editingProjectPublicationIds.has(pub.id);
                        return (
                          <label key={pub.id} className="flex items-center gap-2 text-xs text-slate-700">
                            <input
                              type="checkbox"
                              name="publication_ids"
                              value={pub.id}
                              defaultChecked={isChecked}
                              className="rounded border-slate-300 text-indigo-600"
                            />
                            <span className="truncate">{pub.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_demo_proj"
                      name="is_demo"
                      defaultChecked={editingProject ? editingProject.is_demo : true}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="is_demo_proj" className="text-xs text-slate-600">
                      Mark as Demo Data
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
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
                <h2 className="text-lg font-bold text-slate-900">
                  Existing Projects ({projects.length})
                </h2>
                <div className="mt-4 divide-y divide-slate-100">
                  {projects.map((p) => {
                    const pTeam = p.project_researchers
                      ?.map((pr) => toItem(pr.researchers))
                      .filter((item): item is { id: string; name: string } => Boolean(item));
                    const pAreas = p.project_research_areas
                      ?.map((pra) => toItem(pra.research_areas))
                      .filter((item): item is { id: string; name: string } => Boolean(item));

                    return (
                      <div key={p.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/projects/${p.slug}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-indigo-600 transition"
                            >
                              {p.title}
                            </Link>
                            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                              {p.status}
                            </span>
                            {p.is_demo ? (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                Demo
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>

                          {pTeam && pTeam.length > 0 ? (
                            <div className="mt-2 text-xs text-slate-600">
                              <span className="font-semibold text-slate-400">Team: </span>
                              {pTeam.map((t) => t.name).join(", ")}
                            </div>
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

        {/* TAB 3: SUBMISSIONS APPROVAL WORKFLOW */}
        {activeTab === "submissions" ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Researcher Change Requests &amp; Submissions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Review and approve researcher proposals. Approved submissions automatically update canonical institutional records and invalidate cache.
              </p>
            </div>

            {submissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No submissions found. Researcher change requests will appear here for review.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => {
                  const researcherObj = toItem(sub.researchers);
                  const isPending = sub.status === "pending";
                  const badgeColor =
                    sub.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : sub.status === "rejected"
                      ? "bg-rose-100 text-rose-800 border-rose-200"
                      : "bg-amber-100 text-amber-800 border-amber-200";

                  return (
                    <div
                      key={sub.id}
                      className="rounded-xl border border-slate-200 p-5 space-y-4 bg-white hover:border-slate-300 transition"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-slate-900">{sub.title}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {sub.submission_type.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Submitted by{" "}
                            <span className="font-semibold text-slate-800">
                              {researcherObj?.name || "Researcher ID: " + sub.researcher_id}
                            </span>{" "}
                            &bull; {new Date(sub.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColor}`}>
                          {sub.status}
                        </span>
                      </div>

                      {/* Human-Readable Submission Details */}
                      <SubmissionPayloadCard sub={sub} />

                      {sub.admin_notes && (
                        <div className="text-xs text-slate-600 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-800">Reviewer Notes: </span>
                          {sub.admin_notes}
                        </div>
                      )}

                      {/* Review Action Controls */}
                      {isPending && (
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <form action={approveSubmissionAction} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={sub.id} />
                            <input
                              type="text"
                              name="admin_notes"
                              placeholder="Optional approval notes..."
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 w-64"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition shadow-xs"
                            >
                              Approve &amp; Publish
                            </button>
                          </form>

                          <form action={rejectSubmissionAction} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={sub.id} />
                            <input
                              type="text"
                              name="admin_notes"
                              placeholder="Reason for rejection..."
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 w-64"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition shadow-xs"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        {/* TAB 4: PROVISION ACCOUNTS */}
        {activeTab === "accounts" ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Provision Researcher Account
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Create new authenticated researcher login credentials and map them to canonical researcher records.
              </p>
            </div>

            <form action={provisionResearcherAccountAction} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="e.g. dr-aisha-rahman"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                  Institutional Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. aisha.rahman@demo.islington.edu.np"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                  Initial Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Minimum 8 characters"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                  Map to Researcher Profile *
                </label>
                <select
                  name="researcher_id"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select a researcher...</option>
                  {researchers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 transition shadow-xs"
                >
                  Provision Researcher Credentials
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </div>
    </LayoutShell>
  );
}
