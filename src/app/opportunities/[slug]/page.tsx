import Link from "next/link";
import { notFound } from "next/navigation";
import LayoutShell from "@/components/layout-shell";
import { getOpportunityBySlug, getOpportunities } from "@/lib/hub-data";

export async function generateStaticParams() {
  const opps = await getOpportunities();
  return opps.map((o) => ({ slug: o.slug }));
}

export default async function OpportunityDetailPage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { slug } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true";
  const op = await getOpportunityBySlug(slug);

  if (!op) {
    notFound();
  }

  const deadlineFormatted = op.deadline
    ? new Date(op.deadline).toLocaleDateString("en-US", {
        dateStyle: "full",
      })
    : "Rolling Application";

  return (
    <LayoutShell activeNav="opportunities">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Preview Banner */}
        {isPreview && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>PREVIEW MODE — Reviewing opportunity guidelines and requirements prior to public publishing.</span>
            </div>
            <Link href="/admin?tab=opportunities" className="underline font-bold text-amber-950 hover:text-amber-800">
              Return to Admin &rarr;
            </Link>
          </div>
        )}

        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <span>&larr;</span>
          <span>Back to All Opportunities</span>
        </Link>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {op.type.replace(/_/g, " ")}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {op.status}
              </span>
            </div>

            {op.is_demo && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                Sample Opportunity Call
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {op.title}
          </h1>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Funding / Stipend
              </span>
              <p className="text-sm font-bold text-slate-900">{op.amount || "Institutional Support"}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Submission Deadline
              </span>
              <p className="text-sm font-bold text-rose-700">{deadlineFormatted}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Awarding Provider
              </span>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {op.provider || "Islington College"}
              </p>
            </div>
          </div>

          {/* Scope Description */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Scope &amp; Background
            </h2>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {op.description}
            </div>
          </div>

          {/* Eligibility */}
          {op.eligibility && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Eligibility Criteria
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{op.eligibility}</p>
            </div>
          )}

          {/* Requirements */}
          {op.requirements && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Submission Requirements
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{op.requirements}</p>
            </div>
          )}

          {/* Connected Graph Links */}
          {(op.research_area || op.project) && (
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Associated Research Domain
              </h3>
              <div className="flex flex-wrap gap-2">
                {op.research_area && (
                  <Link
                    href={`/discover?q=${encodeURIComponent(op.research_area.name)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition border border-indigo-200/80"
                  >
                    <span>Area:</span>
                    <span>{op.research_area.name}</span>
                  </Link>
                )}
                {op.project && (
                  <Link
                    href={`/projects/${op.project.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition border border-slate-200"
                  >
                    <span>Associated Project:</span>
                    <span>{op.project.title}</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Apply Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
            {op.application_url && (
              <a
                href={op.application_url}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                Apply for Opportunity &rarr;
              </a>
            )}
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition"
            >
              Submit via Researcher Portal
            </Link>
          </div>
        </article>
      </div>
    </LayoutShell>
  );
}
