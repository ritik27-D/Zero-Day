import Link from "next/link";
import LayoutShell from "@/components/layout-shell";
import { getPartners } from "@/lib/hub-data";

export default async function PartnersPage(props: {
  searchParams: Promise<{ type?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filterType = searchParams?.type || "all";

  const allPartners = await getPartners();

  const partnerTypes = [
    { id: "all", label: "All Partners" },
    { id: "academic", label: "Academic & Universities" },
    { id: "industry", label: "Industry & Corporate" },
    { id: "government", label: "Government & Coalitions" },
    { id: "community", label: "Community & Civil Society" },
    { id: "international", label: "International Alliances" },
  ];

  const filteredPartners = allPartners.filter((p) => {
    return filterType === "all" || p.type === filterType;
  });

  return (
    <LayoutShell activeNav="partners">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>External Ecosystem &bull; Strategic Collaboration</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Research &amp; Industry Partners
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Islington College collaborates with leading international universities, enterprise tech innovators, and government alliances to conduct high-impact applied research.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              {filteredPartners.length} Active Collaboration{filteredPartners.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-1.5">
          {partnerTypes.map((t) => (
            <Link
              key={t.id}
              href={`/partners?type=${t.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === t.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((pt) => (
            <div
              key={pt.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    {pt.type.replace(/_/g, " ")} Partner
                  </span>
                  {pt.is_demo && (
                    <span className="text-[9px] font-semibold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Sample Partner
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {pt.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">
                  {pt.description}
                </p>

                {pt.project && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Collaborative Initiative:
                    </span>
                    <Link
                      href={`/projects/${pt.project.slug}`}
                      className="text-xs font-semibold text-cyan-700 hover:underline inline-block"
                    >
                      {pt.project.title} &rarr;
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {pt.website_url ? (
                  <a
                    href={pt.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-800 transition flex items-center gap-1"
                  >
                    <span>Visit Website</span>
                    <span>&nearr;</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Institutional Partner</span>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Active</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutShell>
  );
}
