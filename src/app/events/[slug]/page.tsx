import Link from "next/link";
import { notFound } from "next/navigation";
import LayoutShell from "@/components/layout-shell";
import { getEventBySlug, getEvents } from "@/lib/hub-data";

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export default async function EventDetailPage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { slug } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPreview = searchParams.preview === "true";
  const evt = await getEventBySlug(slug);

  if (!evt) {
    notFound();
  }

  const startDateFormatted = evt.start_date
    ? new Date(evt.start_date).toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "To Be Announced";

  const endDateFormatted = evt.end_date
    ? new Date(evt.end_date).toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : null;

  return (
    <LayoutShell activeNav="events">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Preview Banner */}
        {isPreview && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>PREVIEW MODE — Viewing draft/preview record prior to public dissemination.</span>
            </div>
            <Link href="/admin?tab=events" className="underline font-bold text-amber-950 hover:text-amber-800">
              Return to Admin &rarr;
            </Link>
          </div>
        )}

        {/* Back Link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <span>&larr;</span>
          <span>Back to All Events</span>
        </Link>

        {/* Main Event Header Card */}
        <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200">
                {evt.type.replace(/_/g, " ")}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {evt.status}
              </span>
            </div>

            {evt.is_demo && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                Sample Demo Event
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {evt.title}
          </h1>

          {/* Key Event Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Date &amp; Schedule
              </span>
              <p className="text-sm font-semibold text-slate-900">{startDateFormatted}</p>
              {endDateFormatted && (
                <p className="text-xs text-slate-500">Concludes: {endDateFormatted}</p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Venue Location
              </span>
              <p className="text-sm font-semibold text-slate-900">
                {evt.location || "Venue details will be announced soon"}
              </p>
              <p className="text-xs text-slate-500">Islington College &bull; Kathmandu</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Overview &amp; Academic Scope
            </h2>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {evt.description}
            </div>
          </div>

          {/* Connected Graph Links */}
          {(evt.research_area || evt.researcher || evt.project) && (
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Connected R&amp;D Entities
              </h3>
              <div className="flex flex-wrap gap-2">
                {evt.research_area && (
                  <Link
                    href={`/discover?q=${encodeURIComponent(evt.research_area.name)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition border border-indigo-200/80"
                  >
                    <span>Area:</span>
                    <span>{evt.research_area.name}</span>
                  </Link>
                )}
                {evt.researcher && (
                  <Link
                    href={`/researchers/${evt.researcher.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 text-xs font-semibold hover:bg-cyan-100 transition border border-cyan-200/80"
                  >
                    <span>Presenter / Fellow:</span>
                    <span>{evt.researcher.name}</span>
                  </Link>
                )}
                {evt.project && (
                  <Link
                    href={`/projects/${evt.project.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition border border-slate-200"
                  >
                    <span>Project:</span>
                    <span>{evt.project.title}</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Registration / External Link Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
            {evt.registration_url && (
              <a
                href={evt.registration_url}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                Register for Event &rarr;
              </a>
            )}
            {evt.external_url && (
              <a
                href={evt.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition"
              >
                External Event Page &nearr;
              </a>
            )}
          </div>
        </article>
      </div>
    </LayoutShell>
  );
}
