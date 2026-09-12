import Link from "next/link";
import LayoutShell from "@/components/layout-shell";
import { getAnnouncements } from "@/lib/hub-data";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <LayoutShell activeNav="announcements">
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Institutional Bulletins &bull; Notices</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            R&amp;D Announcements &amp; Calls
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Official announcements, institutional research updates, upcoming grant cycle openings, and journal calls for papers from Islington College.
          </p>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {announcements.map((an) => {
            const pubDate = new Date(an.published_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });

            return (
              <article
                key={an.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{pubDate}</span>
                    <span>&bull;</span>
                    <span className="text-cyan-700 font-semibold uppercase text-[10px] tracking-wider">
                      Official Notice
                    </span>
                  </div>
                  {an.is_demo && (
                    <span className="text-[9px] font-semibold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Sample Announcement
                    </span>
                  )}
                </div>

                <Link href={`/announcements/${an.slug}`} className="block group">
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-cyan-700 transition">
                    {an.title}
                  </h2>
                </Link>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {an.summary}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/announcements/${an.slug}`}
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-800 transition flex items-center gap-1"
                  >
                    <span>Read Full Bulletin</span>
                    <span>&rarr;</span>
                  </Link>

                  {an.external_url && (
                    <a
                      href={an.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-slate-800 transition"
                    >
                      Related Portal &nearr;
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </LayoutShell>
  );
}
