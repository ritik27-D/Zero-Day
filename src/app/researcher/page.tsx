import Link from "next/link";
import { requireResearcher } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { listSubmissionsForResearcher, SubmissionRecord } from "@/lib/submissions";
import { getResearcherNotifications } from "@/lib/notifications";

export default async function ResearcherDashboardPage() {
  const session = await requireResearcher();
  const profile = session.profile;
  const researcher = profile.researcher;
  const admin = createSupabaseAdminClient();

  let projectCount = 0;
  let publicationCount = 0;
  let submissions: SubmissionRecord[] = [];

  const { notifications } = await getResearcherNotifications(
    session.user.id,
    profile.researcherId
  );

  if (profile.researcherId) {
    // 1. Fetch linked project count
    const { count: pCount } = await admin
      .from("project_researchers")
      .select("*", { count: "exact", head: true })
      .eq("researcher_id", profile.researcherId);
    projectCount = pCount ?? 0;

    // 2. Fetch linked publication count
    const { count: pubCount } = await admin
      .from("publication_researchers")
      .select("*", { count: "exact", head: true })
      .eq("researcher_id", profile.researcherId);
    publicationCount = pubCount ?? 0;

    // 3. Fetch submissions for this researcher
    submissions = await listSubmissionsForResearcher(profile.researcherId);
  }

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-8">
      {/* Researcher Identity Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                Researcher Workspace
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {researcher?.name || profile.username}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {researcher?.title || "Academic Staff & Research Fellow"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {researcher?.email || session.user.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {researcher?.slug ? (
              <Link
                href={`/researchers/${researcher.slug}`}
                target="_blank"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <span>View Public Profile</span>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            ) : null}
            <Link
              href="/researcher/messages"
              className="rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-2 text-xs font-semibold text-cyan-800 hover:bg-cyan-100 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Faculty Messages</span>
            </Link>
            <Link
              href="/researcher/profile"
              className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              Propose Profile Update
            </Link>
          </div>
        </div>

        {/* Informational Guidance on Approval Workflow */}
        <div className="mt-6 rounded-xl bg-cyan-50/70 border border-cyan-200/80 p-4 text-xs text-cyan-950 flex items-start gap-3">
          <svg className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="leading-relaxed">
            <strong className="font-semibold">Institutional Governance Notice:</strong> Updates to your bio, affiliated research areas, project contributions, or publications are submitted as formal change requests. Once reviewed and approved by an Administrator, your changes will automatically reflect on the public research hub.
          </div>
        </div>
      </section>

      {/* Overview Stat Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Projects
            </span>
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{projectCount}</p>
          <Link
            href="/researcher/projects"
            className="mt-2 inline-block text-xs font-semibold text-cyan-700 hover:text-cyan-800"
          >
            Manage project details &rarr;
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Publications
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{publicationCount}</p>
          <Link
            href="/researcher/publications"
            className="mt-2 inline-block text-xs font-semibold text-indigo-700 hover:text-indigo-800"
          >
            Submit publication update &rarr;
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Submissions
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{pendingCount}</p>
          <Link
            href="/researcher/submissions"
            className="mt-2 inline-block text-xs font-semibold text-amber-700 hover:text-amber-800"
          >
            Track review status &rarr;
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Collaboration
            </span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-xl font-extrabold text-slate-900">Messaging</p>
          <Link
            href="/researcher/messages"
            className="mt-2 inline-block text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            Open Faculty Chat &rarr;
          </Link>
        </div>
      </section>

      {/* Notifications & Recent Faculty Activity Feed */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Notifications &amp; Activity Feed</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct messages, review decisions, and institutional announcements.
              </p>
            </div>
          </div>
          <Link
            href="/researcher/messages"
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
          >
            Open Messenger &rarr;
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No recent notifications. You are all caught up!
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      n.unread ? "bg-cyan-600 animate-pulse" : "bg-slate-300"
                    }`}
                  />
                  <div>
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <p className="text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                </div>
                <Link
                  href={n.link}
                  className="shrink-0 text-xs font-semibold text-cyan-700 hover:text-cyan-800 transition"
                >
                  View &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Submissions Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Change Requests</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of your submitted updates to the institutional research registry.
            </p>
          </div>
          <Link
            href="/researcher/submissions"
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
          >
            View All &rarr;
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No submissions recorded yet. Use the action buttons above to propose updates.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {submissions.map((sub) => {
              const badgeColor =
                sub.status === "approved"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : sub.status === "rejected"
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : "bg-amber-100 text-amber-800 border-amber-200";

              return (
                <div key={sub.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{sub.title}</span>
                      <span className="text-[10px] text-slate-400 capitalize font-medium">
                        ({sub.submission_type.replace(/_/g, " ")})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Submitted on {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                    {sub.admin_notes && (
                      <p className="mt-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <strong>Admin Feedback:</strong> {sub.admin_notes}
                      </p>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                    {sub.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
