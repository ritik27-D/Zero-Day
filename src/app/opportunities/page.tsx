import Link from "next/link";
import LayoutShell from "@/components/layout-shell";
import { getOpportunities } from "@/lib/hub-data";

export default async function OpportunitiesPage(props: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filterType = searchParams?.type || "all";
  const searchQuery = (searchParams?.q || "").toLowerCase().trim();

  const allOpps = await getOpportunities();

  const categories = [
    { id: "all", label: "All Opportunities" },
    { id: "student", label: "Student Opportunities" },
    { id: "faculty", label: "Faculty Opportunities" },
    { id: "assistantship", label: "Research Assistantships" },
    { id: "grant", label: "Grants" },
    { id: "conference", label: "Conferences" },
    { id: "call_for_papers", label: "Calls for Papers" },
  ];

  const filteredOpps = allOpps.filter((o) => {
    let matchesType = true;
    if (filterType === "all") {
      matchesType = true;
    } else if (filterType === "student") {
      matchesType =
        o.type === "student_opportunity" ||
        (o.eligibility || "").toLowerCase().includes("student") ||
        (o.eligibility || "").toLowerCase().includes("undergraduate");
    } else if (filterType === "faculty") {
      matchesType =
        o.type === "grant" ||
        (o.eligibility || "").toLowerCase().includes("faculty") ||
        (o.eligibility || "").toLowerCase().includes("researcher");
    } else if (filterType === "assistantship") {
      matchesType =
        o.type === "research_assistantship" ||
        o.title.toLowerCase().includes("assistant");
    } else if (filterType === "grant") {
      matchesType = o.type === "grant" || o.type === "funding";
    } else if (filterType === "conference") {
      matchesType =
        o.type === "conference" ||
        o.title.toLowerCase().includes("conference") ||
        o.description.toLowerCase().includes("conference");
    } else if (filterType === "call_for_papers") {
      matchesType =
        o.type === "call_for_papers" ||
        o.title.toLowerCase().includes("call for papers") ||
        o.title.toLowerCase().includes("special issue");
    } else {
      matchesType = o.type === filterType;
    }

    const matchesQuery =
      !searchQuery ||
      o.title.toLowerCase().includes(searchQuery) ||
      o.description.toLowerCase().includes(searchQuery) ||
      (o.provider && o.provider.toLowerCase().includes(searchQuery));

    return matchesType && matchesQuery;
  });

  return (
    <LayoutShell activeNav="opportunities">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Grants &amp; Research Opportunities &bull; Fellowships</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Grants, Fellowships &amp; Research Opportunities
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Discover student research fellowships, faculty seed grants, graduate assistantships, conference opportunities, and peer-reviewed calls for papers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              {filteredOpps.length} Active Call{filteredOpps.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Category Tabs & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/opportunities?type=${c.id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === c.id
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
              placeholder="Search opportunities..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600"
            />
            {filterType !== "all" && <input type="hidden" name="type" value={filterType} />}
          </form>
        </div>

        {/* Opportunities List */}
        {filteredOpps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No opportunities match your current filter.</p>
            <p className="mt-1 text-xs text-slate-500">Try clearing filters or search terms.</p>
            <Link
              href="/opportunities"
              className="mt-4 inline-block text-xs font-bold text-cyan-700 hover:underline"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpps.map((op) => {
              const deadlineFormatted = op.deadline
                ? new Date(op.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Rolling / Continuous";

              return (
                <div
                  key={op.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {op.type.replace(/_/g, " ")}
                      </span>
                      {op.is_demo && (
                        <span className="hidden" data-demo="true">demo</span>
                      )}
                    </div>

                    <Link href={`/opportunities/${op.slug}`} className="block group">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition line-clamp-2">
                        {op.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {op.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                      {op.provider && (
                        <div>
                          <span className="font-semibold text-slate-400">Host:</span> {op.provider}
                        </div>
                      )}
                      {op.amount && (
                        <div className="text-emerald-700 font-semibold">
                          <span>Award:</span> {op.amount}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-slate-400">Deadline:</span>{" "}
                        <span className="font-mono text-slate-700">{deadlineFormatted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/opportunities/${op.slug}`}
                      className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 hover:underline"
                    >
                      <span>Opportunity Details</span>
                      <span>&rarr;</span>
                    </Link>

                    {op.application_url && (
                      <a
                        href={op.application_url}
                        className="text-xs font-semibold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        Apply
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
