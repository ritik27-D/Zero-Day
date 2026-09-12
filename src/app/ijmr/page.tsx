import Link from "next/link";
import Image from "next/image";
import LayoutShell from "@/components/layout-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function IJMRGatewayPage() {
  const client = createSupabaseServerClient();
  const { data: publications } = await client
    .from("publications")
    .select(`
      id,
      slug,
      title,
      abstract,
      venue,
      doi,
      status,
      is_demo,
      publication_researchers (
        researchers (id, name, slug)
      )
    `)
    .limit(4);

  return (
    <LayoutShell activeNav="ijmr">
      <div className="space-y-10 max-w-5xl mx-auto">
        {/* Gateway Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>Institutional Scholarly Dissemination Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Islington Journal of Multidisciplinary Research (IJMR)
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              A peer-reviewed, open-access academic journal dedicated to publishing cutting-edge research across Computing, Information Systems, Applied AI, and Technology Governance.
            </p>
            <div className="pt-3 flex flex-wrap gap-3">
              <a
                href="https://ijmr.islingtoncollege.edu.np/index.php/IJMR"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center gap-1.5"
              >
                <span>Visit IJMR Portal</span>
                <span>&nearr;</span>
              </a>
              <a
                href="https://ijmr.islingtoncollege.edu.np/index.php/IJMR/about/submissions"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center gap-1.5"
              >
                <span>Submit a Manuscript</span>
                <span>&nearr;</span>
              </a>
              <Link
                href="/publications"
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
              >
                <span>Browse Publications</span>
              </Link>
            </div>
          </div>
          <div className="shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center">
            <Image
              src="/images/ijmr-logo.png"
              alt="Islington Journal of Multidisciplinary Research (IJMR)"
              width={200}
              height={80}
              className="h-16 sm:h-20 w-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Section: About the Journal */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Journal Scope &amp; Aims
            </h3>
            <p className="text-base font-bold text-slate-900">Multidisciplinary Inquiry</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              IJMR fosters theoretical and empirical inquiry bridging applied artificial intelligence, enterprise cybersecurity, data management, and digital transformation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Peer-Review Standard
            </h3>
            <p className="text-base font-bold text-slate-900">Double-Blind Peer Review</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every manuscript is independently reviewed by at least two domain specialists to guarantee academic rigour, methodological validity, and ethical compliance.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Open Access &amp; Ethics
            </h3>
            <p className="text-base font-bold text-slate-900">Zero Paywall Access</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              IJMR adheres to Budapest Open Access Initiative principles. Full texts are freely accessible to worldwide researchers without author subscription barriers.
            </p>
          </div>
        </section>

        {/* Section: Active Call for Papers */}
        <section className="rounded-2xl border border-cyan-200/80 bg-cyan-50/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-700" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-cyan-800">
                Active Call for Papers: Volume 4, Issue 1
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-200/80 text-cyan-900">
              Open Call
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">
            Special Issue on Trustworthy AI, Resilient Networks &amp; Sustainable Systems
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Prospective authors are invited to submit original research papers, empirical studies, and survey articles. Priority topics include explainable ML models, IoT attack surface reduction, and energy-aware edge compute pipelines.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
            <span>&bull; Submission Deadline: <strong className="text-slate-900">15 December 2026</strong></span>
            <span>&bull; Notification of Review: <strong className="text-slate-900">30 January 2027</strong></span>
            <span>&bull; Publication Date: <strong className="text-slate-900">March 2027</strong></span>
          </div>
        </section>

        {/* Section: Current Issue & Indexed Articles */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Issue &amp; Indexed Articles
              </h2>
              <p className="text-lg font-bold text-slate-900">Volume 3, Issue 2 &bull; Recent Papers</p>
            </div>
            <Link
              href="/discover?q=publication"
              className="text-xs font-bold text-cyan-700 hover:underline"
            >
              Browse All Indexed Publications &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(publications || []).map((pub) => (
              <div
                key={pub.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-600">{pub.venue}</span>
                  {pub.doi && <span className="font-mono text-[10px]">DOI: {pub.doi}</span>}
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{pub.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{pub.abstract}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Peer-Reviewed
                  </span>
                  <Link
                    href={`/discover?q=${encodeURIComponent(pub.title)}`}
                    className="text-xs font-semibold text-cyan-700 hover:underline"
                  >
                    View In Graph &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Author Guidelines & Ethics */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Author Guidelines &amp; Submission Standards
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">&check;</span>
                <span><strong>Manuscript Length:</strong> Full original papers must be between 5,000 and 8,000 words including references and tables.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">&check;</span>
                <span><strong>Referencing:</strong> Follow strict IEEE or ACM citation styles. All digital sources must supply valid DOIs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">&check;</span>
                <span><strong>Plagiarism Policy:</strong> Submissions are checked via Turnitin. Manuscripts with over 15% text overlap are returned without review.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Publication Ethics &amp; Integrity Policy
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">&check;</span>
                <span><strong>Authorship:</strong> All listed co-authors must have contributed substantially to empirical conception or manuscript writing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">&check;</span>
                <span><strong>AI Disclosure:</strong> Utilization of AI or LLM tools must be explicitly declared in the Methodology section.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">&check;</span>
                <span><strong>Conflicts of Interest:</strong> Authors must state any commercial affiliations or funding sources upon submission.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section: Archives Overview */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Journal Archives &amp; Past Volumes</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Access previously published volumes, symposium special issues, and indexation archives.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
              Vol. 1 (2024) &bull; Vol. 2 (2025) &bull; Vol. 3 (2026)
            </span>
          </div>
        </section>
      </div>
    </LayoutShell>
  );
}
