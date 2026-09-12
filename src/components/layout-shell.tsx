"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface LayoutShellProps {
  children: React.ReactNode;
  activeNav?: string;
}

interface NavSubItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavSection {
  id: string;
  label: string;
  href: string;
  subItems?: NavSubItem[];
}

export default function LayoutShell({ children, activeNav }: LayoutShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const currentNav =
    activeNav ||
    (pathname === "/"
      ? "home"
      : pathname.startsWith("/about")
      ? "about"
      : pathname.startsWith("/research-support")
      ? "support"
      : pathname.startsWith("/research") && !pathname.startsWith("/researchers")
      ? "research"
      : pathname.startsWith("/people") || pathname.startsWith("/researchers")
      ? "people"
      : pathname.startsWith("/projects")
      ? "projects"
      : pathname.startsWith("/publications") || pathname.startsWith("/ijmr")
      ? "publications"
      : pathname.startsWith("/events")
      ? "events"
      : pathname.startsWith("/funding")
      ? "funding"
      : pathname.startsWith("/resources")
      ? "support"
      : pathname.startsWith("/ethics")
      ? "ethics"
      : pathname.startsWith("/opportunities")
      ? "opportunities"
      : pathname.startsWith("/discover")
      ? "search"
      : pathname.startsWith("/admin")
      ? "admin"
      : "home");

  const handbookNav: NavSection[] = [
    {
      id: "home",
      label: "HOME",
      href: "/",
      subItems: [
        { label: "Overview", href: "/" },
        { label: "Highlights", href: "/#highlights" },
        { label: "Discovery Entry Point", href: "/discover" },
      ],
    },
    {
      id: "about",
      label: "ABOUT R&D",
      href: "/about",
      subItems: [
        { label: "About R&D", href: "/about#about" },
        { label: "Vision & Mission", href: "/about#vision" },
        { label: "Structure", href: "/about#structure" },
        { label: "Leadership", href: "/about#leadership" },
        { label: "Advisory Structure", href: "/about#advisory" },
        { label: "Research Teams", href: "/about#teams" },
        { label: "Partners", href: "/partners" },
      ],
    },
    {
      id: "research",
      label: "RESEARCH",
      href: "/research",
      subItems: [
        { label: "Research Areas", href: "/research#areas" },
        { label: "Interest Groups", href: "/research#groups" },
        { label: "Active Projects", href: "/projects?status=ongoing" },
        { label: "Completed Projects", href: "/projects?status=completed" },
        { label: "Facilities", href: "/research#facilities" },
        { label: "Research Impact", href: "/research#impact" },
      ],
    },
    {
      id: "people",
      label: "PEOPLE",
      href: "/people",
      subItems: [
        { label: "Researcher Directory", href: "/people" },
        { label: "Profiles", href: "/people" },
        { label: "Department Views", href: "/people?dept=computing" },
        { label: "Research Area Views", href: "/people?area=ai" },
      ],
    },
    {
      id: "projects",
      label: "PROJECTS",
      href: "/projects",
      subItems: [
        { label: "All Projects", href: "/projects" },
        { label: "Active Projects", href: "/projects?status=ongoing" },
        { label: "Completed Projects", href: "/projects?status=completed" },
        { label: "Project Archive", href: "/projects?status=archive" },
      ],
    },
    {
      id: "publications",
      label: "PUBLICATIONS",
      href: "/publications",
      subItems: [
        { label: "All Publications", href: "/publications" },
        { label: "Journal Articles", href: "/publications?type=journal" },
        { label: "Conference Papers", href: "/publications?type=conference" },
        { label: "Reports", href: "/publications?type=report" },
        { label: "Other Outputs", href: "/publications?type=other" },
        { label: "IJMR Gateway", href: "/ijmr", badge: "Peer-Reviewed" },
      ],
    },
    {
      id: "events",
      label: "CONFERENCES & EVENTS",
      href: "/events",
      subItems: [
        { label: "Upcoming Events", href: "/events?type=upcoming" },
        { label: "Conferences", href: "/events?type=conference" },
        { label: "Seminars", href: "/events?type=seminar" },
        { label: "Workshops", href: "/events?type=workshop" },
        { label: "Calls for Papers", href: "/events?type=call_for_papers" },
        { label: "Proceedings", href: "/events?type=proceedings" },
        { label: "Past Events", href: "/events?type=past" },
      ],
    },
    {
      id: "funding",
      label: "GRANTS & FUNDING",
      href: "/funding",
      subItems: [
        { label: "Current Opportunities", href: "/funding" },
        { label: "Internal Funding", href: "/funding?tab=internal" },
        { label: "External Funding", href: "/funding?tab=external" },
        { label: "Funding Guidelines", href: "/funding#funding-guidelines" },
        { label: "Previous Funded Projects", href: "/funding#previous-funded-projects" },
      ],
    },
    {
      id: "support",
      label: "RESEARCH SUPPORT",
      href: "/research-support",
      subItems: [
        { label: "Methodology", href: "/research-support?category=methodology" },
        { label: "Resources Directory", href: "/resources" },
        { label: "Templates", href: "/research-support?category=templates" },
        { label: "Publication Support", href: "/research-support" },
        { label: "Academic Writing", href: "/research-support" },
        { label: "Research Tools", href: "/research-support?category=tools" },
      ],
    },
    {
      id: "ethics",
      label: "ETHICS & INTEGRITY",
      href: "/ethics",
      subItems: [
        { label: "Research Ethics", href: "/ethics" },
        { label: "Ethics Committee", href: "/ethics" },
        { label: "Ethics Application", href: "/ethics" },
        { label: "Research Integrity", href: "/ethics" },
        { label: "Data Protection", href: "/ethics" },
        { label: "AI Ethics", href: "/ethics" },
        { label: "Policies & SOPs", href: "/ethics" },
      ],
    },
    {
      id: "opportunities",
      label: "OPPORTUNITIES",
      href: "/opportunities",
      subItems: [
        { label: "Student", href: "/opportunities?type=student" },
        { label: "Faculty", href: "/opportunities?type=faculty" },
        { label: "Research Assistantships", href: "/opportunities?type=assistantship" },
        { label: "Grants", href: "/opportunities?type=grant" },
        { label: "Conferences", href: "/opportunities?type=conference" },
        { label: "Calls for Papers", href: "/opportunities?type=call_for_papers" },
      ],
    },
    {
      id: "search",
      label: "SEARCH",
      href: "/discover",
      subItems: [
        { label: "Search Islington Research", href: "/discover" },
        { label: "Advanced Field Query", href: "/discover?q=Artificial+Intelligence" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR (Clean, Minimal, Institutional)                       */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Row 1: Brand, Global Search, Portals */}
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 via-indigo-700 to-slate-900 p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/15 group-hover:scale-105 transition">
                  <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                    <span className="text-cyan-400 font-black text-xs tracking-tight">IC</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-cyan-600">
                      ISLINGTON
                    </span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  </div>
                  <h1 className="text-sm font-bold text-slate-900 tracking-tight -mt-0.5">
                    R&amp;D Connect
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right: Quick Search & Portal Access */}
            <div className="flex items-center gap-2.5">
              {/* Quick Search */}
              <form onSubmit={handleSearch} className="hidden md:block relative w-48 lg:w-64">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search Islington Research..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition"
                />
              </form>

              {/* Researcher Portal Button */}
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/90 transition shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Researcher Portal</span>
              </Link>

              {/* Admin Button */}
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition"
              >
                <span>Admin</span>
              </Link>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Toggle Navigation Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Desktop 12-Item Mega-Menu Dropdown Navigation Bar */}
        <div className="hidden lg:block border-t border-slate-100 bg-white/95">
          <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between text-[11px] font-bold tracking-tight">
              {handbookNav.map((item) => {
                const isActive = currentNav === item.id;
                return (
                  <div key={item.id} className="relative group py-2">
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:text-cyan-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.subItems && item.subItems.length > 0 && (
                        <svg
                          className="w-2.5 h-2.5 text-slate-400 group-hover:text-cyan-600 transition group-hover:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Link>

                    {/* Dropdown Menu on Hover */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="absolute left-0 top-full hidden group-hover:block pt-1 z-50 min-w-[210px]">
                        <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 animate-in fade-in-50 duration-100">
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 mb-1">
                            {item.label}
                          </div>
                          {item.subItems.map((sub) => (
                            <Link
                              key={sub.href + sub.label}
                              href={sub.href}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-cyan-800 hover:bg-cyan-50/70 transition"
                            >
                              <span>{sub.label}</span>
                              {sub.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 font-bold uppercase">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Accordion Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search Islington Research..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Mobile Handbook Sections Accordion */}
            <div className="space-y-1 divide-y divide-slate-100">
              {handbookNav.map((item) => {
                const isExpanded = expandedMobileSection === item.id;
                const isActive = currentNav === item.id;

                return (
                  <div key={item.id} className="pt-1.5">
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-xs font-bold px-2 py-1.5 rounded-lg flex-1 ${
                          isActive ? "text-cyan-700 bg-cyan-50" : "text-slate-800"
                        }`}
                      >
                        {item.label}
                      </Link>
                      {item.subItems && item.subItems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedMobileSection(isExpanded ? null : item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700"
                          aria-label={`Toggle ${item.label}`}
                        >
                          <svg
                            className={`w-4 h-4 transition ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {isExpanded && item.subItems && (
                      <div className="pl-4 pr-2 py-1.5 space-y-1 bg-slate-50/70 rounded-lg mt-1">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.href + sub.label}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-2 py-1 text-xs text-slate-600 hover:text-cyan-700 font-medium"
                          >
                            &bull; {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA                                                         */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* ========================================================================= */}
      {/* INSTITUTIONAL FOOTER                                                     */}
      {/* ========================================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Institutional Identity */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Islington College R&amp;D
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empowering academic faculty and student researchers to solve critical technological challenges across artificial intelligence, cybersecurity, and sustainable computing.
              </p>
              <div className="pt-1">
                <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                  Hackathon Prototype &bull; Sample Demo Dataset
                </span>
              </div>
            </div>

            {/* Col 2: Research Discovery */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Research &amp; People
              </h3>
              <ul className="space-y-2 text-xs">
                <li><Link href="/researchers" className="hover:text-cyan-700 transition">Faculty Researchers</Link></li>
                <li><Link href="/discover?q=project" className="hover:text-cyan-700 transition">Active Projects</Link></li>
                <li><Link href="/discover?q=publication" className="hover:text-cyan-700 transition">Publications &amp; DOIs</Link></li>
                <li><Link href="/discover" className="hover:text-cyan-700 transition">Unified Graph Discovery</Link></li>
              </ul>
            </div>

            {/* Col 3: Academic Opportunities & Community */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Opportunities &amp; Events
              </h3>
              <ul className="space-y-2 text-xs">
                <li><Link href="/events" className="hover:text-cyan-700 transition">Conferences &amp; Workshops</Link></li>
                <li><Link href="/opportunities" className="hover:text-cyan-700 transition">Grants &amp; Fellowships</Link></li>
                <li><Link href="/resources" className="hover:text-cyan-700 transition">Research Ethics &amp; SOPs</Link></li>
                <li><Link href="/partners" className="hover:text-cyan-700 transition">Industry &amp; Academic Partners</Link></li>
              </ul>
            </div>

            {/* Col 4: Dissemination & Journal */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Dissemination &amp; Governance
              </h3>
              <ul className="space-y-2 text-xs">
                <li><Link href="/ijmr" className="hover:text-cyan-700 font-medium transition">IJMR Journal Gateway &rarr;</Link></li>
                <li><Link href="/announcements" className="hover:text-cyan-700 transition">R&amp;D Bulletins &amp; Notices</Link></li>
                <li><Link href="/resources/research-ethics-irb-guidelines" className="hover:text-cyan-700 transition">IRB Ethics Clearance</Link></li>
                <li><Link href="/login" className="text-cyan-700 font-semibold hover:underline transition">Researcher Sign-In</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>&copy; 2026 Islington College. Connected Research Knowledge Graph &amp; Digital Hub.</p>
            <p className="font-mono text-[10px]">Kathmandu, Nepal &bull; Academic Excellence</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
