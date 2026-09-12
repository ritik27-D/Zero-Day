import Link from "next/link";
import { notFound } from "next/navigation";
import LayoutShell from "@/components/layout-shell";
import { getAnnouncementBySlug, getAnnouncements } from "@/lib/hub-data";

export async function generateStaticParams() {
  const announcements = await getAnnouncements();
  return announcements.map((a) => ({ slug: a.slug }));
}

export default async function AnnouncementDetailPage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { slug } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true";
  const an = await getAnnouncementBySlug(slug);

  if (!an) {
    notFound();
  }

  const pubDate = new Date(an.published_at).toLocaleDateString("en-US", {
    dateStyle: "full",
  });

  return (
    <LayoutShell activeNav="announcements">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Preview Banner */}
        {isPreview && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>PREVIEW MODE — Reviewing announcement and call details prior to official broadcast.</span>
            </div>
            <Link href="/admin?tab=announcements" className="underline font-bold text-amber-950 hover:text-amber-800">
              Return to Admin &rarr;
            </Link>
          </div>
        )}

        <Link
          href="/announcements"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <span>&larr;</span>
          <span>Back to All Announcements</span>
        </Link>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">{pubDate}</span>
              <span>&bull;</span>
              <span className="text-cyan-700 font-bold uppercase text-[10px] tracking-wider">
                Institutional Notice
              </span>
            </div>

            {an.is_demo && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                Sample Announcement
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {an.title}
          </h1>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-medium text-slate-700 leading-relaxed">
            {an.summary}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Official Bulletin Content
            </h2>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {an.content}
            </div>
          </div>

          {an.external_url && (
            <div className="pt-6 border-t border-slate-100">
              <a
                href={an.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm inline-block"
              >
                Visit Related External Portal &rarr;
              </a>
            </div>
          )}
        </article>
      </div>
    </LayoutShell>
  );
}
