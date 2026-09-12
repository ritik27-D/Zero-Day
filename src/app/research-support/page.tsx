import Link from "next/link";
import { connection } from "next/server";
import LayoutShell from "@/components/layout-shell";
import { getResources } from "@/lib/hub-data";

export default async function ResearchSupportPage(props: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const activeCategory = searchParams.category?.toLowerCase() || "all";
  const query = searchParams.q?.toLowerCase() || "";

  const allResources = await getResources();

  const filtered = allResources.filter((r) => {
    if (query && !r.title.toLowerCase().includes(query) && !r.description.toLowerCase().includes(query)) {
      return false;
    }
    if (activeCategory === "methodology" && r.category !== "methodology") return false;
    if (activeCategory === "templates" && r.category !== "templates") return false;
    if (activeCategory === "tools" && r.category !== "tools") return false;
    if (activeCategory === "guidelines" && r.category !== "guidelines") return false;
    return true;
  });

  return (
    <LayoutShell activeNav="research-support">
      <div className="space-y-8 sm:space-y-10">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0c1120] via-[#11192e] to-[#1a233d] border border-slate-800 p-6 sm:p-10 text-white shadow-xl">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <span>RESEARCH SUPPORT &amp; SCHOLARLY INFRASTRUCTURE</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-medium">Handbook Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Academic Support, Methodology, Tools &amp; Templates
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Comprehensive operational support for Islington faculty and student researchers: research methodology
              design, institutional templates, publication funding, academic writing mentoring, and research compute tools.
            </p>
          </div>
        </div>

        {/* Demo Disclaimer Notice */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
          <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-amber-200 text-amber-900 border border-amber-300 shrink-0">
            Prototype Support Hub
          </span>
          <p className="leading-relaxed">
            <strong>Evaluator Notice:</strong> The methodology guidelines, software tool access, and template downloads below represent an institutional research enablement prototype for Islington College.
          </p>
        </div>

        {/* 6 Key Handbook Support Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h2 className="text-sm font-bold text-slate-900">Methodology Guidance</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assistance with quantitative experiments, empirical ML benchmarks, qualitative surveys, and statistical significance testing.
            </p>
            <Link href="/research-support?category=methodology" className="inline-block pt-1 text-xs font-bold text-cyan-700 hover:underline">
              View Protocols &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h2 className="text-sm font-bold text-slate-900">Resources Directory</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Central repository of institutional guidelines, ethics codes, open science policies, and data management plans.
            </p>
            <Link href="/resources" className="inline-block pt-1 text-xs font-bold text-cyan-700 hover:underline">
              Browse Directory &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h2 className="text-sm font-bold text-slate-900">Institutional Templates</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official LaTeX and MS Word manuscript templates, grant proposal frameworks, and ethics approval application kits.
            </p>
            <Link href="/research-support?category=templates" className="inline-block pt-1 text-xs font-bold text-cyan-700 hover:underline">
              Download Templates &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h2 className="text-sm font-bold text-slate-900">Publication Support</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Article Processing Charge (APC) fee waivers, target venue selection, journal indexing compliance, and open-access licensing.
            </p>
            <Link href="/ijmr" className="inline-block pt-1 text-xs font-bold text-cyan-700 hover:underline">
              IJMR &amp; Dissemination &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              05
            </div>
            <h2 className="text-sm font-bold text-slate-900">Academic Writing</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Workshops on structuring manuscripts, crafting peer-review rebuttal responses, abstract formulation, and citation integrity.
            </p>
            <Link href="/events?type=workshop" className="inline-block pt-1 text-xs font-bold text-cyan-700 hover:underline">
              Writing Workshops &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
              06
            </div>
            <h2 className="text-sm font-bold text-slate-900">Research Tools &amp; Compute</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Institutional licenses for Turnitin plagiarism detection, GPU-accelerated computing nodes, and Overleaf collaboration.
            </p>
            <Link href="/research-support?category=tools" className="inline-block pt-1 text-xs font-bold text-cyan-700 hover:underline">
              Access Tool Suite &rarr;
            </Link>
          </div>
        </div>

        {/* Resources Filter & Search Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <form method="GET" action="/research-support" className="relative flex-1">
              <input type="hidden" name="category" value={activeCategory} />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search templates, guides, or tool documentation..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <Link
                href={`/research-support${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeCategory === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Resources ({allResources.length})
              </Link>
              <Link
                href={`/research-support?category=methodology${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeCategory === "methodology" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Methodology
              </Link>
              <Link
                href={`/research-support?category=templates${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeCategory === "templates" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Templates
              </Link>
              <Link
                href={`/research-support?category=tools${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeCategory === "tools" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Research Tools
              </Link>
              <Link
                href={`/research-support?category=guidelines${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                  activeCategory === "guidelines" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Guidelines
              </Link>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filtered.length} curated support assets</span>
            <Link href="/resources" className="text-cyan-700 font-bold hover:underline">
              Open Full Resources Directory &rarr;
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((res) => (
              <div
                key={res.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-cyan-500 hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {res.category}
                    </span>
                    {res.is_demo && (
                      <span className="text-[9px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                        Sample Resource
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{res.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {res.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/resources/${res.slug}`}
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline"
                  >
                    View Resource &amp; Download &rarr;
                  </Link>
                  {res.external_url && (
                    <a
                      href={res.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline"
                    >
                      External Link
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
