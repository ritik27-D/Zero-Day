import Link from "next/link";
import { connection } from "next/server";
import LayoutShell from "@/components/layout-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getResearchGroups } from "@/lib/hub-data";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  is_demo: boolean;
};

type ResearchAreaItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export default async function ResearchHubPage() {
  await connection();
  const client = createSupabaseServerClient();

  const [areasRes, projectsRes, researchGroups] = await Promise.all([
    client.from("research_areas").select("id, slug, name, description").order("name"),
    client.from("projects").select("id, slug, title, description, status, is_demo").order("title"),
    getResearchGroups(),
  ]);

  const areas = (areasRes.data ?? []) as ResearchAreaItem[];
  const projects = (projectsRes.data ?? []) as ProjectItem[];

  const activeProjects = projects.filter((p) => p.status === "ongoing" || p.status === "active");
  const completedProjects = projects.filter((p) => p.status === "completed");

  return (
    <LayoutShell activeNav="research">
      <div className="space-y-10 sm:space-y-12">
        {/* ========================================================================= */}
        {/* 1. HERO / RESEARCH HUB                                                   */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-800">
              <span>ACADEMIC SPECIALIZATIONS</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">Research Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Research Areas, Labs &amp; Scientific Impact
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore Islington College’s thematic computational disciplines, specialized interest clusters, active and completed
              investigations, research facilities, and real-world technology impact.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <a href="#areas" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-200 transition">
                Research Areas &darr;
              </a>
              <a href="#groups" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-200 transition">
                Interest Groups &darr;
              </a>
              <a href="#projects" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-200 transition">
                Active &amp; Completed Projects &darr;
              </a>
              <a href="#facilities" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-200 transition">
                Facilities &darr;
              </a>
              <a href="#impact" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-200 transition">
                Research Impact &darr;
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. RESEARCH AREAS                                                        */}
        {/* ========================================================================= */}
        <section id="areas" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">Thematic Disciplines</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Core Research Areas</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Interdisciplinary specializations driving curriculum innovation and funded research.
              </p>
            </div>
            <Link href="/discover" className="text-xs font-bold text-cyan-700 hover:underline">
              Query Topics on Discover &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {areas.map((area) => (
              <div key={area.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{area.name}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                    {area.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/discover?q=${encodeURIComponent(area.name)}`}
                    className="text-xs font-bold text-cyan-700 hover:underline"
                  >
                    Explore Field &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. INTEREST GROUPS / LABS                                                */}
        {/* ========================================================================= */}
        <section id="groups" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Specialized Clusters</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Research Interest Groups &amp; Labs</h2>
            </div>
            <Link href="/researchers" className="text-xs font-bold text-indigo-700 hover:underline">
              Faculty Directory &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {researchGroups.map((grp) => (
              <div key={grp.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  Cluster Lab
                </span>
                <h3 className="font-bold text-sm text-slate-900">{grp.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{grp.description}</p>
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Lead Researchers: {grp.researchers?.map((r) => r.name).join(", ") || "Faculty Investigators"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. ACTIVE & COMPLETED PROJECTS                                           */}
        {/* ========================================================================= */}
        <section id="projects" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Project Registry</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Active &amp; Completed Investigations</h2>
            </div>
            <Link href="/projects" className="text-xs font-bold text-emerald-700 hover:underline">
              View All Projects Hub &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Projects */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Active Research Projects ({activeProjects.length})</span>
                </h3>
                <Link href="/projects?status=ongoing" className="text-xs font-semibold text-emerald-700 hover:underline">
                  Filter Active &rarr;
                </Link>
              </div>
              <div className="space-y-3">
                {activeProjects.slice(0, 3).map((proj) => (
                  <div key={proj.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Ongoing
                      </span>
                      {proj.is_demo && (
                        <span className="text-[9px] text-amber-700 bg-amber-50 px-1 rounded uppercase font-semibold">
                          Demo
                        </span>
                      )}
                    </div>
                    <Link href={`/projects/${proj.slug}`} className="font-bold text-xs text-slate-900 hover:text-emerald-700 block">
                      {proj.title}
                    </Link>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Projects */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Completed Research Projects ({completedProjects.length})</span>
                </h3>
                <Link href="/projects?status=completed" className="text-xs font-semibold text-blue-700 hover:underline">
                  Filter Completed &rarr;
                </Link>
              </div>
              <div className="space-y-3">
                {completedProjects.slice(0, 3).map((proj) => (
                  <div key={proj.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 inline-block">
                      Completed
                    </span>
                    <Link href={`/projects/${proj.slug}`} className="font-bold text-xs text-slate-900 hover:text-blue-700 block">
                      {proj.title}
                    </Link>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{proj.description}</p>
                  </div>
                ))}
                {completedProjects.length === 0 && (
                  <p className="text-xs text-slate-500 italic p-3">
                    Completed milestone projects are archived with peer-reviewed publications.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. FACILITIES (Clearly Labeled Institutional Infrastructure)              */}
        {/* ========================================================================= */}
        <section id="facilities" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Infrastructure</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Research Laboratories &amp; Facilities</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Equipped technical spaces available for faculty investigations and mentored student development.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">AI &amp; High-Performance Compute Cluster</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated multi-GPU workstations (NVIDIA RTX) configured for deep learning training, model quantization, and medical imaging inference.
              </p>
              <span className="text-[10px] font-mono text-cyan-800 block">Location: Block A, Room 304</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">Cyber Forensics &amp; Traffic Laboratory</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Isolated network sandbox for enterprise packet capture, malware behavior analysis, and intrusion detection benchmark evaluation.
              </p>
              <span className="text-[10px] font-mono text-cyan-800 block">Location: Block C, Room 201</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">Embedded IoT &amp; Sensor Development Suite</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rapid prototyping equipment, micro-soldering stations, logic analyzers, and environmental telemetry sensors for smart agriculture.
              </p>
              <span className="text-[10px] font-mono text-cyan-800 block">Location: Innovation Hub 102</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. RESEARCH IMPACT                                                       */}
        {/* ========================================================================= */}
        <section id="impact" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Dissemination &amp; Outreach</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Research Impact &amp; Technology Transfer</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Translating academic research into societal solutions, industrial open-source tools, and peer-reviewed international publications.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-1">
              <span className="text-3xl font-black text-teal-800">100%</span>
              <span className="text-xs font-bold text-slate-800 block">Open Access Commitment</span>
              <p className="text-[11px] text-slate-600">All institutional journal outputs disseminated under open Creative Commons licensing.</p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200 space-y-1">
              <span className="text-3xl font-black text-cyan-800">Scopus/WoS</span>
              <span className="text-xs font-bold text-slate-800 block">International Indexing</span>
              <p className="text-[11px] text-slate-600">Faculty publications peer-reviewed and benchmarked against UK QAA academic rigor.</p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-1">
              <span className="text-3xl font-black text-indigo-800">Industry</span>
              <span className="text-xs font-bold text-slate-800 block">Collaborative Pilots</span>
              <p className="text-[11px] text-slate-600">Intrusion detection models and agro-monitoring systems piloted with local enterprise partners.</p>
            </div>
          </div>
        </section>
      </div>
    </LayoutShell>
  );
}
