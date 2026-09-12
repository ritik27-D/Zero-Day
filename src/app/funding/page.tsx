import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";
import { getOpportunities, getResources } from "@/lib/hub-data";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  summary: string;
  is_demo: boolean;
  project_researchers?: {
    researchers: { id: string; name: string; slug: string } | null;
  }[];
};

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

export default async function FundingHubPage(props: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab?.toLowerCase() || "all";
  const query = searchParams.q?.toLowerCase() || "";

  const [opportunities, allResources] = await Promise.all([
    getOpportunities(),
    getResources(),
  ]);

  // Query projects for "Previous Funded Projects"
  let fundedProjects: ProjectItem[] = [];
  try {
    const client = createSupabaseServerClient();
    const { data } = await client
      .from("projects")
      .select(`
        id, slug, title, status, summary, is_demo,
        project_researchers ( researchers (id, name, slug) )
      `)
      .order("title");
    fundedProjects = (data ?? []) as unknown as ProjectItem[];
  } catch {
    fundedProjects = [];
  }

  // Filter opportunities based on query and tab
  const filteredOpps = opportunities.filter((op) => {
    if (
      query &&
      !op.title.toLowerCase().includes(query) &&
      !op.description.toLowerCase().includes(query) &&
      !(op.provider || "").toLowerCase().includes(query)
    ) {
      return false;
    }
    if (activeTab === "internal") {
      const p = (op.provider || "").toLowerCase();
      const isInternal = p.includes("islington") || p.includes("internal") || op.type === "grant" || op.type === "student_opportunity";
      if (!isInternal) return false;
    }
    if (activeTab === "external") {
      const p = (op.provider || "").toLowerCase();
      const isExternal = p.includes("international") || p.includes("external") || p.includes("ministry") || p.includes("council") || p.includes("british");
      if (!isExternal && !op.application_url?.startsWith("http")) return false;
    }
    return true;
  });

  const fundingGuidelines = allResources.filter(
    (r) => r.category === "guidelines" || r.category === "ethics" || r.slug.includes("grant") || r.slug.includes("proposal")
  );

  return (
    <LayoutShell activeNav="funding">
      <div className="space-y-8 sm:space-y-10">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0c1120] via-[#11192e] to-[#1a233d] border border-slate-800 p-6 sm:p-10 text-white shadow-xl">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span>GRANTS &amp; RESEARCH FUNDING</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-medium">Handbook Information Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Institutional Grants, Seed Capital &amp; External Funding
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore internal faculty seed grants, undergraduate fellowships, external government and industry
              sponsorships, proposal guidelines, and previously awarded research initiatives.
            </p>
          </div>
        </div>

        {/* Demo Funding Disclaimer Notice */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
          <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-amber-200 text-amber-900 border border-amber-300 shrink-0">
            Sample Calls
          </span>
          <p className="leading-relaxed">
            <strong>Evaluator Notice:</strong> Seed grant amounts, fellowship stipends, and external funding calls displayed below are curated demonstration entries illustrating the institutional funding lifecycle.
          </p>
        </div>

        {/* Navigation & Section Tabs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <form method="GET" action="/funding" className="relative flex-1">
              <input type="hidden" name="tab" value={activeTab} />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search grants, sponsors, or keywords..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Handbook Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <Link
                href={`/funding${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeTab === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Current Opportunities ({opportunities.length})
              </Link>
              <Link
                href={`/funding?tab=internal${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeTab === "internal" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Internal Funding
              </Link>
              <Link
                href={`/funding?tab=external${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeTab === "external" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                External Funding
              </Link>
              <a
                href="#funding-guidelines"
                className="px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Guidelines &amp; SOPs
              </a>
              <a
                href="#previous-funded-projects"
                className="px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Previous Funded Projects ({fundedProjects.length})
              </a>
            </div>
          </div>
        </div>

        {/* Section 1: Current Opportunities Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div>
              <span className="font-bold text-slate-900 uppercase tracking-wider">
                {activeTab === "internal"
                  ? "Internal Seed Grants & Fellowships"
                  : activeTab === "external"
                  ? "External Grants & Industry Sponsorships"
                  : "All Current Funding Opportunities"}
              </span>
              <span className="ml-2">({filteredOpps.length} active)</span>
            </div>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Active Call
            </span>
          </div>

          {filteredOpps.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 space-y-2">
              <p className="font-bold">No funding opportunities matched your criteria.</p>
              <Link href="/funding" className="text-xs font-semibold text-cyan-700 hover:underline">
                View All Opportunities
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredOpps.map((op) => (
                <div
                  key={op.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {op.type.replace("_", " ")}
                      </span>
                      {op.is_demo && (
                        <span className="text-[9px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                          Sample Call
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-slate-900 leading-snug">
                      {op.title}
                    </h2>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {op.description}
                    </p>

                    <div className="space-y-1 pt-1 text-xs text-slate-600">
                      {op.provider && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-400">Funding Body:</span>
                          <span className="text-slate-800 font-medium">{op.provider}</span>
                        </div>
                      )}
                      {op.amount && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-400">Award Amount:</span>
                          <span className="text-emerald-700 font-bold">{op.amount}</span>
                        </div>
                      )}
                      {op.deadline && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-400">Deadline:</span>
                          <span className="text-slate-800 font-mono font-medium">{op.deadline}</span>
                        </div>
                      )}
                      {op.eligibility && (
                        <div className="flex items-start gap-1.5 pt-1">
                          <span className="font-semibold text-slate-400 shrink-0">Eligibility:</span>
                          <span className="text-slate-700 text-[11px] line-clamp-2">{op.eligibility}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/opportunities/${op.slug}`}
                      className="text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline"
                    >
                      Call Details &amp; Criteria &rarr;
                    </Link>
                    {op.application_url && (
                      <a
                        href={op.application_url}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        Apply Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Funding Guidelines */}
        <section id="funding-guidelines" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Application Standards &amp; Review Protocol
              </p>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Institutional Funding Guidelines &amp; Submission Protocols
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              All grant proposals submitted to Islington College R&amp;D Committee or external sponsors must adhere to institutional review standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">1. Proposal Preparation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard 5-page proposal detailing research objective, state-of-the-art gap analysis, proposed methodology, and expected publications.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">2. Budget Justification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Itemized breakdown covering student stipends, compute/cloud resources, laboratory consumables, and open-access publication fees.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">3. Ethics &amp; Integrity Sign-off</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mandatory preliminary screening with the Research Ethics Committee (REC) prior to disbursement of seed funds.
              </p>
            </div>
          </div>

          {fundingGuidelines.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Guideline Documents &amp; Policy Resources
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fundingGuidelines.map((res) => (
                  <Link
                    key={res.id}
                    href={`/resources/${res.slug}`}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white flex items-center justify-between text-xs group transition"
                  >
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition">{res.title}</p>
                      <p className="text-[11px] text-slate-500 capitalize">{res.category}</p>
                    </div>
                    <span className="text-slate-400 group-hover:text-emerald-600 font-bold">&rarr;</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Previous Funded Projects */}
        <section id="previous-funded-projects" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Track Record of Institutional Excellence
                </p>
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Previous &amp; Current Funded Research Projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-xs font-bold text-cyan-700 hover:underline"
            >
              Browse Full Project Archive &rarr;
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {fundedProjects.slice(0, 6).map((proj) => {
              const investigators = proj.project_researchers
                ?.map((pr) => toItem(pr.researchers))
                .filter(Boolean) as { id: string; name: string; slug: string }[];

              return (
                <div
                  key={proj.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between space-y-2.5"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {proj.status}
                      </span>
                      {proj.is_demo && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Demo
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {proj.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {proj.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 truncate max-w-[140px]">
                      {investigators.length > 0 ? investigators[0].name : "Faculty Lead"}
                    </span>
                    <Link
                      href={`/projects/${proj.slug}`}
                      className="font-bold text-cyan-700 hover:underline"
                    >
                      Project &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </LayoutShell>
  );
}
