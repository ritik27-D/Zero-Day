import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

type Researcher = { id: string; slug: string; name: string; email: string; title: string; bio: string; is_demo: boolean };

export default async function ResearchersPage() {
  await connection();
  if (!isSupabaseConfigured()) return <ConfigurationRequired />;
  const { data, error } = await createSupabaseServerClient().from("researchers").select("id, slug, name, email, title, bio, is_demo").order("name");
  if (error) return <DataError message={error.message} />;
  const researchers = (data ?? []) as Researcher[];
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
              Islington College Hackathon 2026
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Islington R&amp;D Connect
            </h1>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/discover"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Unified Discovery
            </Link>
            <Link
              href="/researchers"
              className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800"
            >
              Researchers Directory
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Admin Portal
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Researchers Directory</h2>
            <p className="mt-1 max-w-2xl text-slate-600">Browse the researchers currently available in the R&amp;D directory.</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">Live Supabase data</span>
        </div>

        {researchers.length === 0 ? (
          <p className="mt-10 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No researchers have been added yet. Run the supplied Supabase migration and seed script.</p>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {researchers.map((researcher) => (
              <li key={researcher.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/researchers/${researcher.slug}`} className="text-xl font-semibold hover:text-indigo-700 hover:underline">
                      {researcher.name}
                    </Link>
                    <p className="mt-1 text-sm font-medium text-indigo-700">{researcher.title}</p>
                  </div>
                  {researcher.is_demo ? <span className="shrink-0 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">DEMO DATA</span> : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{researcher.bio}</p>
                <a className="mt-4 inline-block text-sm font-medium text-indigo-700 hover:text-indigo-900" href={`mailto:${researcher.email}`}>
                  {researcher.email}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function ConfigurationRequired() { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900"><section className="max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">Researchers</p><h1 className="mt-2 text-3xl font-bold">Supabase needs configuration</h1><p className="mt-4 leading-7 text-slate-600">Add <code>SUPABASE_URL</code> and <code>SUPABASE_PUBLISHABLE_KEY</code> to <code>.env.local</code>, then run the SQL files in <code>supabase</code> in your Supabase project.</p></section></main>; }
function DataError({ message }: { message: string }) { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900"><section className="max-w-xl rounded-xl border border-red-200 bg-white p-8 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">Researchers</p><h1 className="mt-2 text-3xl font-bold">Supabase could not load researchers</h1><p className="mt-4 leading-7 text-slate-600">{message}</p></section></main>; }
