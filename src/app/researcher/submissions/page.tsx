import { requireResearcher } from "@/lib/auth";
import { listSubmissionsForResearcher, SubmissionRecord } from "@/lib/submissions";

export default async function ResearcherSubmissionsPage(props: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await requireResearcher();
  const profile = session.profile;
  const searchParams = await props.searchParams;

  let submissions: SubmissionRecord[] = [];

  if (profile.researcherId) {
    submissions = await listSubmissionsForResearcher(profile.researcherId);
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Research Submissions &amp; Change Requests
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Review the status of your submitted change requests to the institutional research registry.
        </p>
      </div>

      {searchParams.success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <div className="font-semibold">{searchParams.success}</div>
        </div>
      )}

      {searchParams.error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="font-semibold">{searchParams.error}</div>
        </div>
      )}

      <section className="space-y-4">
        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
            No submissions recorded yet. Propose an update from your Profile, Projects, or Publications pages.
          </div>
        ) : (
          submissions.map((sub) => {
            const badgeColor =
              sub.status === "approved"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : sub.status === "rejected"
                ? "bg-rose-100 text-rose-800 border-rose-200"
                : "bg-amber-100 text-amber-800 border-amber-200";

            return (
              <div
                key={sub.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{sub.title}</h2>
                      <span className="text-[10px] text-slate-400 capitalize font-medium">
                        ({sub.submission_type.replace(/_/g, " ")})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Submitted on {new Date(sub.created_at).toLocaleString()}
                      {sub.reviewed_at && ` • Reviewed on ${new Date(sub.reviewed_at).toLocaleDateString()}`}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColor}`}>
                    {sub.status}
                  </span>
                </div>

                {sub.admin_notes && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Administrator Review Notes:</span>
                    {sub.admin_notes}
                  </div>
                )}

              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
