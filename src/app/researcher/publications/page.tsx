import { requireResearcher } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { submitResearchUpdateAction } from "../actions";

export default async function ResearcherPublicationsPage() {
  const session = await requireResearcher();
  const profile = session.profile;
  const admin = createSupabaseAdminClient();

  let publications: {
    id: string;
    slug: string;
    title: string;
    venue: string;
    status: string;
    doi: string | null;
    published_at: string | null;
  }[] = [];

  function toItem<T>(val: T | T[] | null | undefined): T | null {
    if (!val) return null;
    return Array.isArray(val) ? val[0] ?? null : val;
  }

  if (profile.researcherId) {
    const { data } = await admin
      .from("publication_researchers")
      .select(`
        publications (
          id,
          slug,
          title,
          venue,
          status,
          doi,
          published_at
        )
      `)
      .eq("researcher_id", profile.researcherId);

    if (data) {
      publications = data
        .map((row) => toItem(row.publications))
        .filter((pub): pub is typeof publications[0] => Boolean(pub));
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Publications &amp; Preprints
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Scholarly articles, conference proceedings, and technical reports credited to your profile.
        </p>
      </div>

      {/* Publications List */}
      <section className="space-y-4">
        {publications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
            No publications linked to your profile currently. Propose a new publication below.
          </div>
        ) : (
          publications.map((pub) => (
            <div
              key={pub.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{pub.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                      {pub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 font-medium">
                    Published in: {pub.venue}
                  </p>
                  {pub.doi && (
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      DOI: {pub.doi}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Propose New Publication Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">
          Propose Publication for Institutional Registry
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Submit peer-reviewed papers or conference preprints. Proposals will be reviewed by an Administrator before publication.
        </p>

        <form action={submitResearchUpdateAction} className="mt-6 space-y-4 text-xs">
          <input type="hidden" name="submission_type" value="new_publication" />

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">
              Submission Title *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. New Paper: Distributed Consensus for IoT Nodes"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">
              Publication Title *
            </label>
            <input
              type="text"
              name="pub_title"
              required
              placeholder="Full official title as published"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                Venue / Conference / Journal *
              </label>
              <input
                type="text"
                name="venue"
                required
                placeholder="e.g. IEEE Access / ACM SIGCOMM"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                DOI (Digital Object Identifier)
              </label>
              <input
                type="text"
                name="doi"
                placeholder="10.1109/ACCESS.2026.XXXXXXX"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">
              Abstract &amp; Findings Summary *
            </label>
            <textarea
              name="abstract"
              rows={4}
              required
              placeholder="Abstract summary of the methodology, datasets used, and key outcomes..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition shadow-xs"
            >
              Submit Publication for Review
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
