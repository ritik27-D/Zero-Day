import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import LayoutShell from "@/components/layout-shell";

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

  const { data, error } = await createSupabaseServerClient()
    .from("researchers")
    .select("id, slug, name, email, title, bio, is_demo")
    .order("name");

  if (error) return <DataError message={error.message} />;
  const researchers = (data ?? []) as Researcher[];

  return (
    <LayoutShell activeNav="researchers">
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
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
              Researchers Directory
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              &larr; Dashboard
            </Link>
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
              R&amp;D repository. Select any researcher to view connected projects and publications.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Supabase Data ({researchers.length})
          </span>
        </div>

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
                        <Link
                          href={`/researchers/${researcher.slug}`}
                          className="text-base font-bold text-slate-900 hover:text-cyan-700 hover:underline transition"
                        >
                          {researcher.name}
                        </Link>
                        <p className="text-xs font-semibold text-indigo-700">{researcher.title}</p>
                      </div>
                    </div>
                    {researcher.is_demo && (
                      <span className="shrink-0 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-slate-600 line-clamp-3">
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
