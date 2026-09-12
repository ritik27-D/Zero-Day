import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";
import { getResearchGroups } from "@/lib/hub-data";

type Researcher = {
  id: string;
  slug: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  is_demo: boolean;
};

export default async function ResearchersPage() {
  await connection();
  if (!isSupabaseConfigured()) return <ConfigurationRequired />;

  const [researchersRes, researchGroups] = await Promise.all([
    createSupabaseServerClient()
      .from("researchers")
      .select("id, slug, name, email, title, bio, is_demo")
      .order("name"),
    getResearchGroups(),
  ]);

  if (researchersRes.error) return <DataError message={researchersRes.error.message} />;
  const researchers = (researchersRes.data ?? []) as Researcher[];

  return (
    <LayoutShell activeNav="researchers">
      <div className="space-y-12">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 ring-4 ring-cyan-500/20" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                Academic Faculty &amp; Fellows
              </p>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Researchers &amp; Research Groups Directory
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/discover"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Unified Discovery
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-cyan-200 bg-cyan-50 px-3.5 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100 transition"
            >
              Researcher Portal
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Browse faculty investigators, research fellows, and lecturers registered in Islington College&apos;s
              R&amp;D repository. Select any researcher to view connected projects, publications, and affiliated labs.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Supabase Data ({researchers.length} Faculty)
          </span>
        </div>

        {/* Faculty Grid */}
        {researchers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            No researchers found in the database.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {researchers.map((researcher) => (
              <div
                key={researcher.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {researcher.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 leading-snug">
                          {researcher.name}
                        </h2>
                        <p className="text-xs font-medium text-slate-500">{researcher.title}</p>
                      </div>
                    </div>
                    {researcher.is_demo && (
                      <span className="hidden" data-demo="true">demo</span>
                    )}
                  </div>

                  <p className="mt-4 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {researcher.bio}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <a
                    className="text-xs font-mono text-slate-500 hover:text-indigo-600 truncate max-w-[220px]"
                    href={`mailto:${researcher.email}`}
                  >
                    {researcher.email}
                  </a>
                  <Link
                    href={`/researchers/${researcher.slug}`}
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 shrink-0 hover:underline"
                  >
                    <span>Profile &amp; Graph</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Research Groups & Labs Section (Reusing existing research_groups table) */}
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Institutional Research Clusters
                </h2>
              </div>
              <h3 className="mt-1 text-xl font-bold text-slate-900">
                Research Groups &amp; Specialized Labs
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {researchGroups.length} Recognized Clusters
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {researchGroups.map((group) => (
              <div
                key={group.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Research Lab
                    </span>
                    {group.is_demo && (
                      <span className="hidden" data-demo="true">demo</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{group.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {group.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Affiliated Faculty:
                  </span>
                  {group.researchers && group.researchers.length > 0 ? (
                    <div className="space-y-1">
                      {group.researchers.map((rf) => (
                        <Link
                          key={rf.id}
                          href={`/researchers/${rf.slug}`}
                          className="text-xs font-semibold text-cyan-700 hover:underline block truncate"
                        >
                          &bull; {rf.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Interdisciplinary / Open Lab</span>
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

function ConfigurationRequired() {
  return (
    <LayoutShell activeNav="researchers">
      <div className="p-8 max-w-xl mx-auto mt-12 rounded-2xl border border-slate-200 bg-white shadow-sm text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">Researchers</p>
        <h1 className="mt-2 text-2xl font-bold">Supabase Configuration Required</h1>
        <p className="mt-4 text-sm text-slate-600">
          Add <code>SUPABASE_URL</code> and <code>SUPABASE_PUBLISHABLE_KEY</code> to your environment.
        </p>
      </div>
    </LayoutShell>
  );
}

function DataError({ message }: { message: string }) {
  return (
    <LayoutShell activeNav="researchers">
      <div className="p-8 max-w-xl mx-auto mt-12 rounded-2xl border border-red-200 bg-white shadow-sm text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">Error</p>
        <h1 className="mt-2 text-2xl font-bold">Could not load researchers</h1>
        <p className="mt-4 text-sm text-slate-600">{message}</p>
      </div>
    </LayoutShell>
  );
}
