import Link from "next/link";
import { requireResearcher } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { submitResearchUpdateAction } from "../actions";

export default async function ResearcherProjectsPage() {
  const session = await requireResearcher();
  const profile = session.profile;
  const admin = createSupabaseAdminClient();

  let projects: {
    id: string;
    slug: string;
    title: string;
    status: string;
    description: string;
    start_date: string | null;
    end_date: string | null;
  }[] = [];

  function toItem<T>(val: T | T[] | null | undefined): T | null {
    if (!val) return null;
    return Array.isArray(val) ? val[0] ?? null : val;
  }

  if (profile.researcherId) {
    const { data } = await admin
      .from("project_researchers")
      .select(`
        projects (
          id,
          slug,
          title,
          status,
          description,
          start_date,
          end_date
        )
      `)
      .eq("researcher_id", profile.researcherId);

    if (data) {
      projects = data
        .map((row) => toItem(row.projects))
        .filter((p): p is typeof projects[0] => Boolean(p));
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Research Projects
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Projects where you are registered as an active lead investigator or contributor.
        </p>
      </div>

      {/* Projects List */}
      <section className="space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
            No projects linked to your profile currently. Propose a new research project below.
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{proj.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800">
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>
                <Link
                  href={`/projects/${proj.slug}`}
                  target="_blank"
                  className="shrink-0 text-xs font-semibold text-cyan-700 hover:text-cyan-800"
                >
                  View Public Detail &rarr;
                </Link>
              </div>

              {(proj.start_date || proj.end_date) && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Timeline: {proj.start_date || "TBD"} &rarr; {proj.end_date || "Ongoing"}
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {/* Propose New Project Submission Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">
          Propose Project or Contribution Update
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Submit proposals for new research initiatives. Submissions are queued for Administrator approval.
        </p>

        <form action={submitResearchUpdateAction} className="mt-6 space-y-4 text-xs">
          <input type="hidden" name="submission_type" value="new_project" />

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">
              Submission Title *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. New Project Proposal: Edge AI for Health Diagnostics"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">
              Official Project Title *
            </label>
            <input
              type="text"
              name="project_title"
              required
              placeholder="Full institutional project title"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                URL Identifier / Slug *
              </label>
              <input
                type="text"
                name="project_slug"
                required
                placeholder="e.g. edge-ai-health"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                Status *
              </label>
              <select
                name="status"
                defaultValue="planned"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="planned">Planned</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">
              Project Description &amp; Scope *
            </label>
            <textarea
              name="description"
              rows={4}
              required
              placeholder="Outline project objectives, methodology, campus impact, and collaboration opportunities..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition shadow-xs"
            >
              Submit Project Proposal
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
