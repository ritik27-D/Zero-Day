import Link from "next/link";
import { requireResearcher } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export default async function ResearcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireResearcher();
  const profile = session.profile;
  const researcherName = profile.researcher?.name || profile.username;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* Top Researcher Header */}
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/researcher" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-700 p-0.5 flex items-center justify-center shadow-xs">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-xs">RP</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-cyan-700 block">
                ISLINGTON COLLEGE
              </span>
              <span className="text-sm font-bold text-slate-900 tracking-tight block -mt-0.5">
                Researcher Portal
              </span>
            </div>
          </Link>
          <span className="hidden md:inline-block h-4 w-px bg-slate-200" />
          <span className="hidden md:inline-block text-xs font-semibold text-slate-500">
            Authenticated Workspace
          </span>
        </div>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-800">{researcherName}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
              {profile.role}
            </span>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
          >
            &larr; Public Hub
          </Link>

          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200/80 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Subnavigation Bar */}
      <nav className="border-b border-slate-200/80 bg-white px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-1 overflow-x-auto py-2 text-xs font-semibold text-slate-600">
          <Link
            href="/researcher"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition shrink-0"
          >
            Dashboard
          </Link>
          <Link
            href="/researcher/profile"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition shrink-0"
          >
            My Profile
          </Link>
          <Link
            href="/researcher/projects"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition shrink-0"
          >
            My Projects
          </Link>
          <Link
            href="/researcher/publications"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition shrink-0"
          >
            My Publications
          </Link>
          <Link
            href="/researcher/submissions"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition shrink-0 flex items-center gap-1.5"
          >
            <span>My Submissions</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
