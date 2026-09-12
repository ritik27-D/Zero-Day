import Link from "next/link";
import { notFound } from "next/navigation";
import LayoutShell from "@/components/layout-shell";
import { getResourceBySlug, getResources } from "@/lib/hub-data";

export async function generateStaticParams() {
  const resources = await getResources();
  return resources.map((r) => ({ slug: r.slug }));
}

export default async function ResourceDetailPage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { slug } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true";
  const res = await getResourceBySlug(slug);

  if (!res) {
    notFound();
  }

  return (
    <LayoutShell activeNav="resources">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Preview Banner */}
        {isPreview && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>PREVIEW MODE — Reviewing guideline protocol / SOP document prior to official publication.</span>
            </div>
            <Link href="/admin?tab=resources" className="underline font-bold text-amber-950 hover:text-amber-800">
              Return to Admin &rarr;
            </Link>
          </div>
        )}

        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <span>&larr;</span>
          <span>Back to All Resources</span>
        </Link>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              {res.category.replace(/_/g, " ")}
            </span>

            {res.is_demo && (
              <span className="hidden" data-demo="true">demo</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {res.title}
          </h1>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800 block mb-1">Executive Summary:</span>
            {res.description}
          </div>

          {/* Full Readable Content */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Standard Operating Procedure &amp; Protocol Guidelines
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {res.content || res.description}
              </p>
            </div>
          </div>

          {/* Linked Research Area */}
          {res.research_area && (
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs">
              <span className="text-slate-400">Pertains to Area:</span>
              <Link
                href={`/discover?q=${encodeURIComponent(res.research_area.name)}`}
                className="font-semibold text-indigo-700 hover:underline"
              >
                {res.research_area.name} &rarr;
              </Link>
            </div>
          )}

          {/* Download / External Action */}
          {res.external_url && (
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <a
                href={res.external_url}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                Download Official Document (PDF/DOCX) &darr;
              </a>
            </div>
          )}
        </article>
      </div>
    </LayoutShell>
  );
}
