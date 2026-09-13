import Link from "next/link";
import { connection } from "next/server";
import LayoutShell from "@/components/layout-shell";
import { getResearchGroups, getPartners } from "@/lib/hub-data";

export default async function AboutPage() {
  await connection();
  const [researchGroups, partners] = await Promise.all([
    getResearchGroups(),
    getPartners(),
  ]);

  return (
    <LayoutShell activeNav="about">
      <div className="space-y-10 sm:space-y-12">
        {/* ========================================================================= */}
        {/* 1. HERO / ABOUT R&D                                                      */}
        {/* ========================================================================= */}
        <section id="about" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-800">
              <span>ISLINGTON COLLEGE</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">About R&amp;D Division</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Institutional Research &amp; Development
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Islington College R&amp;D Connect is the central academic division advancing innovative inquiry,
              interdisciplinary computing research, and faculty-student collaboration in Nepal, in strategic academic
              partnership with London Metropolitan University.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <a href="#vision" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-200 transition">
                Vision &amp; Mission &darr;
              </a>
              <a href="#structure" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-200 transition">
                Governance Structure &darr;
              </a>
              <a href="#leadership" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-200 transition">
                Leadership &darr;
              </a>
              <a href="#teams" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-200 transition">
                Research Teams &darr;
              </a>
              <a href="#partners" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-200 transition">
                Partners &darr;
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. VISION & MISSION                                                      */}
        {/* ========================================================================= */}
        <section id="vision" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To establish Islington College as a pioneering regional center for applied technology research,
              nurturing scholarly excellence that addresses socio-economic and industrial challenges through
              cutting-edge computational systems and ethical artificial intelligence.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Empower faculty and student researchers by providing institutional seed funding, state-of-the-art laboratory
              infrastructure, peer-review publishing venues, and ethical oversight to produce globally recognized,
              high-impact research.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. R&D STRUCTURE                                                         */}
        {/* ========================================================================= */}
        <section id="structure" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">Governance &amp; Organization</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">R&amp;D Institutional Structure</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Hierarchical organization ensuring rigorous peer review, ethical clearance, and resource allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">1. Executive Directorate</span>
              <p className="text-slate-600 leading-relaxed">
                Chaired by the Director of R&amp;D and College Principal, directing strategic research policy, institutional grant endowments, and international partnerships.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">2. Research Advisory Board</span>
              <p className="text-slate-600 leading-relaxed">
                Comprises senior academic leads from London Metropolitan University and national technology innovators guiding domain roadmaps.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">3. Ethics &amp; Review Board (REC)</span>
              <p className="text-slate-600 leading-relaxed">
                Independent compliance committee evaluating research proposals for human subject protections, data privacy, and ethical AI deployment.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. LEADERSHIP & ADVISORY STRUCTURE                                      */}
        {/* ========================================================================= */}
        <section id="leadership" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Institutional Leadership &amp; Advisory Structure</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">R&amp;D Directorate &amp; Advisory Council</h2>
              <p className="text-xs text-slate-600 mt-1">
                Executive research leadership overseeing academic strategy, industry collaboration, and institutional inquiry standards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
              </span>
              <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-sm">
                AR
              </div>
              <h3 className="font-bold text-sm text-slate-900">Dr. Aisha Rahman</h3>
              <p className="text-xs text-cyan-700 font-semibold">Director of R&amp;D</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                PhD in Machine Learning &amp; Distributed Systems. Lead investigator for applied computing initiatives.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
              </span>
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
                NS
              </div>
              <h3 className="font-bold text-sm text-slate-900">Niran Shrestha</h3>
              <p className="text-xs text-indigo-700 font-semibold">Head of Cyber Defense Lab</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Specializes in enterprise threat hunting, network traffic telemetry, and applied cryptography.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
              </span>
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                PJ
              </div>
              <h3 className="font-bold text-sm text-slate-900">Prabin Joshi</h3>
              <p className="text-xs text-teal-700 font-semibold">Lead, Sustainable IoT</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Expertise in micro-power embedded systems, edge AI sensing, and agro-ecological automation.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
              </span>
              <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center font-bold text-sm">
                LM
              </div>
              <h3 className="font-bold text-sm text-slate-900">Prof. Academic Liaison</h3>
              <p className="text-xs text-violet-700 font-semibold">London Met Advisory Chair</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                External academic auditor ensuring UK QAA benchmarking and international dissemination standards.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. RESEARCH TEAMS (Reusing research_groups)                              */}
        {/* ========================================================================= */}
        <section id="teams" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Research Groups</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Active Research Teams &amp; Labs</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Faculty-led research groups established under the Islington R&amp;D charter.
              </p>
            </div>
            <Link href="/researchers" className="text-xs font-bold text-cyan-700 hover:underline">
              View All Researchers &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {researchGroups.map((grp) => (
              <div key={grp.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                      Specialized Lab
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{grp.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{grp.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {grp.researchers?.length || 0} Faculty Investigators
                  </span>
                  <Link href="/researchers" className="text-xs font-bold text-indigo-600 hover:underline">
                    Team &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. PARTNERS (Reusing partners table)                                     */}
        {/* ========================================================================= */}
        <section id="partners" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Institutional Alliances</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Academic &amp; Industry Partners</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Collaborative agreements powering joint research, external grants, and technology transfer.
              </p>
            </div>
            <Link href="/partners" className="text-xs font-bold text-blue-700 hover:underline">
              Partner Directory &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <div key={partner.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {partner.type}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 pt-1">{partner.name}</h3>
                <p className="text-xs text-slate-600 line-clamp-3">{partner.description}</p>
                {partner.website_url && (
                  <div className="pt-2">
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Visit Partner Website</span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </LayoutShell>
  );
}
