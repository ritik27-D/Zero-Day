"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface LayoutShellProps {
  children: React.ReactNode;
  activeNav?:
    | "home"
    | "discover"
    | "researchers"
    | "projects"
    | "publications"
    | "events"
    | "opportunities"
    | "resources"
    | "partners"
    | "announcements"
    | "ijmr"
    | "admin"
    | "areas";
}

export default function LayoutShell({ children, activeNav }: LayoutShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      : pathname.startsWith("/discover")
      ? "discover"
      : pathname.startsWith("/researchers")
      ? "researchers"
      : pathname.startsWith("/events")
      ? "events"
      : pathname.startsWith("/opportunities")
      ? "opportunities"
      : pathname.startsWith("/resources")
      ? "resources"
      : pathname.startsWith("/partners")
      ? "partners"
      : pathname.startsWith("/announcements")
      ? "announcements"
      : pathname.startsWith("/ijmr")
      ? "ijmr"
      : pathname.startsWith("/admin")
      ? "admin"
      : "home");

  const navLinks = [
    { id: "home", label: "Home", href: "/" },
    { id: "discover", label: "Discover", href: "/discover" },
    { id: "researchers", label: "Researchers", href: "/researchers" },
    { id: "projects", label: "Projects", href: "/discover?q=project" },
    { id: "publications", label: "Publications", href: "/discover?q=publication" },
    { id: "areas", label: "Research Areas", href: "/discover" },
    { id: "events", label: "Events", href: "/events" },
    { id: "opportunities", label: "Opportunities", href: "/opportunities" },
    { id: "resources", label: "Resources", href: "/resources" },
    { id: "partners", label: "Partners", href: "/partners" },
    { id: "announcements", label: "Announcements", href: "/announcements" },
    { id: "ijmr", label: "IJMR", href: "/ijmr" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR (Clean, Minimal, Responsive)                          */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-4 lg:gap-6">
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

              {/* Desktop Primary Nav Links */}
              <nav className="hidden xl:flex items-center gap-0.5">
                {navLinks.map((item) => {
                  const isActive = currentNav === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Quick Search & Portal Links */}
            <div className="flex items-center gap-3">
              {/* Quick Search */}
              <form onSubmit={handleSearch} className="hidden sm:block relative w-36 xl:w-44">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search hub..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition"
                />
              </form>

              {/* Portal CTA */}
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/90 transition shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden xs:inline">Researcher Portal</span>
              </Link>

              {/* Mobile Menu Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

          {/* Medium Screen Secondary Nav Bar (for tablets between lg and xl) */}
          <div className="hidden lg:flex xl:hidden items-center gap-1 py-2 border-t border-slate-100 overflow-x-auto text-xs">
            {navLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition ${
                  currentNav === item.id ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search researchers, events, opportunities..."
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

            <nav className="grid grid-cols-2 gap-1 pt-1">
              {navLinks.map((item) => {
                const isActive = currentNav === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Live Graph DB</span>
              <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-mono text-[11px] font-bold border border-cyan-200">
                Supabase Connected
              </span>
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
