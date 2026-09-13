import Link from "next/link";
import LayoutShell from "@/components/layout-shell";
import { getResources } from "@/lib/hub-data";

export default async function ResourcesPage(props: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filterCat = searchParams?.category || "all";
  const searchQuery = (searchParams?.q || "").toLowerCase().trim();

  const allResources = await getResources();

  const categories = [
    { id: "all", label: "All Resources" },
    { id: "ethics", label: "Ethics & IRB" },
    { id: "ai_ethics", label: "AI Ethics" },
    { id: "academic_writing", label: "Writing & Standards" },
    { id: "templates", label: "Templates" },
    { id: "publication_support", label: "Publication & APC" },
    { id: "data_protection", label: "Data Protection" },
    { id: "facilities", label: "Lab Facilities" },
    { id: "methodology", label: "Methodology" },
  ];

  const filteredResources = allResources.filter((r) => {
    const matchesCat = filterCat === "all" || r.category === filterCat;
    const matchesQuery =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery) ||
      r.description.toLowerCase().includes(searchQuery) ||
      r.category.toLowerCase().includes(searchQuery);
    return matchesCat && matchesQuery;
  });

  return (
    <LayoutShell activeNav="resources">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Research Governance &bull; Support Toolkit</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Research Guidelines, Ethics &amp; SOPs
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Access official Institutional Review Board (IRB) ethics clearance protocols, AI authorship guidelines, proposal templates, and lab facility access procedures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              {filteredResources.length} Document{filteredResources.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Category Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/resources?category=${c.id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterCat === c.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>

          <form className="relative w-full sm:w-64">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search guidelines & SOPs..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600"
            />
            {filterCat !== "all" && <input type="hidden" name="category" value={filterCat} />}
          </form>
        </div>

        {/* Resource Cards Grid */}
        {filteredResources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No resources found matching this criteria.</p>
            <p className="mt-1 text-xs text-slate-500">Try choosing a different category or clearing your search.</p>
            <Link
              href="/resources"
              className="mt-4 inline-block text-xs font-bold text-cyan-700 hover:underline"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {res.category.replace(/_/g, " ")}
                    </span>
                  </div>

                  <Link href={`/resources/${res.slug}`} className="block group">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition line-clamp-2">
                      {res.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/resources/${res.slug}`}
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-800 transition flex items-center gap-1"
                  >
                    <span>Read Full SOP</span>
                    <span>&rarr;</span>
                  </Link>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Institutional Standard
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
