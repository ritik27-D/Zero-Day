import Link from "next/link";
import { connection } from "next/server";
import LayoutShell from "@/components/layout-shell";
import { getResources } from "@/lib/hub-data";

export default async function EthicsAndIntegrityPage() {
  await connection();
  const allResources = await getResources();
  const ethicsPolicies = allResources.filter(
    (r) => r.category === "ethics" || r.category === "ethics_committee" || r.category === "guidelines"
  );

  return (
    <LayoutShell activeNav="ethics">
      <div className="space-y-8 sm:space-y-10">
        {/* Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-800">
              <span>ETHICS &amp; GOVERNANCE</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">Handbook Information Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Institutional Research Ethics, Academic Integrity &amp; AI Standards
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Islington College upholds the highest standards of rigorous, ethical, and responsible scientific inquiry.
              Review ethics clearance protocols, Research Ethics Committee (REC) guidelines, data protection policies, and AI ethics frameworks.
            </p>
          </div>
        </div>

        {/* Handbook Section Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1: Research Ethics & Principles */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h2 className="text-base font-bold text-slate-900">Research Ethics &amp; Human Subjects</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict ethical protocols for any investigation involving human participants, surveys, biometric data collection, or behavioral observation.
            </p>
            <ul className="text-xs text-slate-600 space-y-1 pt-1 list-disc list-inside">
              <li>Informed consent requirement</li>
              <li>Right to withdraw without penalty</li>
              <li>Participant anonymity &amp; pseudonymization</li>
            </ul>
          </div>

          {/* Section 2: Research Ethics Committee (REC) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h2 className="text-base font-bold text-slate-900">Ethics Committee (REC)</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Islington Institutional Review Board / Research Ethics Committee convenes monthly to evaluate formal ethics applications and grant clearance.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <p><strong>Committee Chair:</strong> Head of Academic Governance</p>
              <p><strong>Review Schedule:</strong> Monthly (Third Thursday)</p>
              <p><strong>Turnaround:</strong> 10–14 business days</p>
            </div>
          </div>

          {/* Section 3: Ethics Application Process */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h2 className="text-base font-bold text-slate-900">Ethics Application Workflow</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mandatory application clearance process prior to empirical data gathering or public model deployment.
            </p>
            <ol className="text-xs text-slate-600 space-y-1.5 pt-1 list-decimal list-inside">
              <li>Complete the REC-01 Clearance Form</li>
              <li>Attach Participant Information Sheet</li>
              <li>Department Head &amp; Supervisor Endorsement</li>
              <li>REC Review &amp; Clearance Certificate</li>
            </ol>
          </div>

          {/* Section 4: Research Integrity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h2 className="text-base font-bold text-slate-900">Research Integrity &amp; Conduct</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero tolerance for scientific misconduct, data fabrication, falsification, authorship attribution fraud, or plagiarism.
            </p>
            <div className="text-xs text-slate-600 space-y-1 pt-1">
              <p>&bull; Mandatory Turnitin indexing for all theses &amp; papers</p>
              <p>&bull; Whistleblower protection &amp; reporting channel</p>
              <p>&bull; Independent investigation procedure</p>
            </div>
          </div>

          {/* Section 5: Data Protection & Privacy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              05
            </div>
            <h2 className="text-base font-bold text-slate-900">Data Protection &amp; Privacy</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compliance with Nepal Individual Privacy Act (2018) and international GDPR guidelines for research data governance.
            </p>
            <div className="text-xs text-slate-600 space-y-1 pt-1">
              <p>&bull; AES-256 encrypted storage for raw datasets</p>
              <p>&bull; Data Retention Policy: 5 years minimum preservation</p>
              <p>&bull; Strict access control on institutional servers</p>
            </div>
          </div>

          {/* Section 6: AI Ethics Standards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
              06
            </div>
            <h2 className="text-base font-bold text-slate-900">AI Ethics &amp; LLM Disclosure</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Institutional standards governing the responsible training, auditing, and transparent reporting of artificial intelligence systems.
            </p>
            <div className="text-xs text-slate-600 space-y-1 pt-1">
              <p>&bull; Explicit disclosure of generative AI assistance in manuscripts</p>
              <p>&bull; Algorithmic bias audits on training corpora</p>
              <p>&bull; No upload of confidential college data to public AI APIs</p>
            </div>
          </div>
        </div>

        {/* Section 7: Official Policies & SOPs Directory */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Institutional Governance Repository
                </p>
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Official Policies, Forms &amp; Standard Operating Procedures (SOPs)
              </h2>
            </div>
            <Link
              href="/resources"
              className="text-xs font-bold text-cyan-700 hover:underline"
            >
              Browse Full Resource Directory &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ethicsPolicies.map((policy) => (
              <div
                key={policy.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-500 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {policy.category}
                  </span>
                  <h3 className="mt-2 text-xs font-bold text-slate-900 line-clamp-2">
                    {policy.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                    {policy.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <Link
                    href={`/resources/${policy.slug}`}
                    className="text-xs font-bold text-cyan-700 hover:underline"
                  >
                    Read Policy &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 8: Ethics Application Submission Box */}
        <section className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50 via-slate-50 to-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Ready to submit an Ethics Clearance Application?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Download the official REC-01 form, prepare your informed consent documentation, and submit to the Research Ethics Committee secretary at <a href="mailto:ethics@islington.edu.np" className="text-indigo-700 font-semibold underline">ethics@islington.edu.np</a>.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/resources/islington-research-ethics-framework"
              className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition shadow-xs"
            >
              Download REC-01 Form
            </Link>
          </div>
        </section>
      </div>
    </LayoutShell>
  );
}
