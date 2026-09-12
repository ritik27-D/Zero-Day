import Link from "next/link";
import { requireResearcher } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { submitResearchUpdateAction } from "../actions";

export default async function ResearcherProfilePage() {
  const session = await requireResearcher();
  const profile = session.profile;
  const admin = createSupabaseAdminClient();

  let researcher: {
    id: string;
    slug: string;
    name: string;
    email: string;
    title: string;
    bio: string;
    researcher_research_areas?: {
      research_areas: { id: string; name: string } | { id: string; name: string }[] | null;
    }[];
  } | null = null;

  if (profile.researcherId) {
    const { data } = await admin
      .from("researchers")
      .select(`
        id,
        slug,
        name,
        email,
        title,
        bio,
        researcher_research_areas (
          research_areas (id, name)
        )
      `)
      .eq("id", profile.researcherId)
      .maybeSingle();

    if (data) researcher = data;
  }

  function toItem<T>(val: T | T[] | null | undefined): T | null {
    if (!val) return null;
    return Array.isArray(val) ? val[0] ?? null : val;
  }

  const areas = researcher?.researcher_research_areas
    ?.map((r) => toItem(r.research_areas))
    .filter((a): a is { id: string; name: string } => Boolean(a)) ?? [];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Researcher Profile
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Review your official academic profile and propose updates to your biography and academic title.
        </p>
      </div>

      {/* Official Registry Profile Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Official Institutional Record
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {researcher?.name || profile.username}
            </h2>
          </div>
          {researcher?.slug ? (
            <Link
              href={`/researchers/${researcher.slug}`}
              target="_blank"
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
            >
              View on Public Hub &rarr;
            </Link>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div>
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Academic Title / Role
            </span>
            <p className="mt-1 font-medium text-slate-800 text-sm">{researcher?.title || "Not recorded"}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Institutional Email
            </span>
            <p className="mt-1 font-mono text-slate-700">{researcher?.email || session.user.email}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Research Areas
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {areas.length > 0 ? (
                areas.map((a) => (
                  <span
                    key={a.id}
                    className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200/60 font-medium text-[11px]"
                  >
                    {a.name}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">No research areas linked yet</span>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Current Biography
            </span>
            <p className="mt-1 text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
              {researcher?.bio || "No biography provided."}
            </p>
          </div>
        </div>
      </section>

      {/* Propose Profile Update Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">
          Propose Profile Update
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Submitting this form creates a pending change request. Changes require Administrator approval before going live.
        </p>

        <form action={submitResearchUpdateAction} className="mt-6 space-y-4 text-xs">
          <input type="hidden" name="submission_type" value="profile_update" />
          <input
            type="hidden"
            name="title"
            value={`Profile update request for ${researcher?.name || profile.username}`}
          />

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">
              Updated Title / Position
            </label>
            <input
              type="text"
              name="title_role"
              required
              defaultValue={researcher?.title ?? ""}
              placeholder="e.g. Associate Professor, Computing & AI"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">
              Updated Biography &amp; Research Statement
            </label>
            <textarea
              name="bio"
              rows={4}
              required
              defaultValue={researcher?.bio ?? ""}
              placeholder="Provide your updated research focus, recent achievements, and academic scope..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition shadow-xs"
            >
              Submit Update Request
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
