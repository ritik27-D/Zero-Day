import Link from "next/link";
import Image from "next/image";
import { requireResearcher } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { getResearcherNotifications } from "@/lib/notifications";
import NotificationsDropdown from "@/components/notifications-dropdown";

export default async function ResearcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireResearcher();
  const profile = session.profile;
  const researcherName = profile.researcher?.name || profile.username;

  const { notifications, unreadCount } = await getResearcherNotifications(
    session.user.id,
    profile.researcherId
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* Top Researcher Header */}
      <header className="sticky top-0 z-30 min-h-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/researcher" className="flex items-center gap-3 group">
            <Image
              src="/images/islington-rd-connect-logo.png"
              alt="Islington R&D Connect"
              width={220}
              height={72}
              className="h-12 sm:h-14 w-auto object-contain group-hover:opacity-90 transition"
              priority
            />
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-cyan-700 block">
                RESEARCHER PORTAL
              </span>
              <span className="text-xs font-bold text-slate-700 tracking-tight block -mt-0.5">
                Faculty Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <NotificationsDropdown
            initialNotifications={notifications}
            initialUnreadCount={unreadCount}
            role="researcher"
          />

          <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-800">{researcherName}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
              {profile.role}
            </span>
          </div>

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
          <Link
            href="/researcher/log"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition shrink-0"
          >
            Log
          </Link>
          <Link
            href="/researcher/messages"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition shrink-0 flex items-center gap-1.5 text-cyan-800 font-bold bg-cyan-50/60"
          >
            <svg className="w-3.5 h-3.5 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Messages</span>
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
