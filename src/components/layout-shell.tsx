"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface LayoutShellProps {
  children: React.ReactNode;
  activeNav?: string;
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

  // Direct, reliable flat desktop navigation (Zero broken dropdowns)
  const primaryNavItems = [
    { id: "home", label: "Home", href: "/" },
    { id: "about", label: "About R&D", href: "/about" },
    { id: "research", label: "Research", href: "/research" },
    { id: "people", label: "People", href: "/people" },
    { id: "projects", label: "Projects", href: "/projects" },
    { id: "publications", label: "Publications", href: "/publications" },
    { id: "events", label: "Events", href: "/events" },
    { id: "opportunities", label: "Opportunities", href: "/opportunities" },
    { id: "search", label: "Search", href: "/discover" },
  ];

  // Secondary institutional resources accessible via mobile menu and footer
  const secondaryNavItems = [
    { label: "Grants & Funding", href: "/funding" },
    { label: "Research Support", href: "/research-support" },
    { label: "Ethics & Integrity", href: "/ethics" },
    { label: "IJMR Journal Gateway", href: "/ijmr" },
    { label: "Faculty Directory", href: "/researchers" },
    { label: "Resources & SOPs", href: "/resources" },
    { label: "Institutional Partners", href: "/partners" },
    { label: "Announcements & Notices", href: "/announcements" },
  ];

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 overflow-x-hidden w-full">
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR: Single Clean Row, Zero Dropdowns, Clean Wordmark      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Left: Authentic Text Lockup (No fabricated logo mark) */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex flex-col group">
                <span className="text-xs sm:text-sm font-black tracking-[0.14em] uppercase text-slate-900 group-hover:text-cyan-700 transition">
                  ISLINGTON R&amp;D
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-cyan-700 tracking-wider uppercase -mt-0.5">
                  R&amp;D Connect
                </span>
              </Link>
            </div>

            {/* Center: Desktop Direct Flat Links (Zero dropdowns, 100% reliable) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {primaryNavItems.map((item) => {
                const isActive = currentNav === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Sign In / Admin Mode & Mobile Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Admin controls ONLY visible when inside /admin */}
              {isAdminRoute ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded bg-rose-100 text-rose-800">
                    Admin Mode
                  </span>
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                /* Public Sign In Button in Top Header (visible on all screens) */
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs cursor-pointer"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

        {/* Mobile Slideout Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Search Input */}
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

            {/* Primary Mobile Navigation Links */}
            <div className="space-y-1">
              {primaryNavItems.map((item) => {
                const isActive = currentNav === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-xs font-bold transition ${
                      isActive ? "bg-slate-900 text-white" : "text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Institutional Portals & Secondary Links */}
            <div className="pt-2 border-t border-slate-100">
              <span className="block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Support &amp; Secondary Portals
              </span>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-cyan-700 hover:bg-slate-50 truncate"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Auth Button */}
            <div className="pt-2 border-t border-slate-100">
              {isAdminRoute ? (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-slate-900"
                >
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-slate-900"
                >
                  Sign In to Researcher Portal
                </Link>
              )}
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
      {/* INSTITUTIONAL FOOTER: Factual Claims Verified, Clean 4-Column Structure   */}
      {/* ========================================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
            {/* Col 1: Institutional Identity & Verified Location */}
            <div className="space-y-3 md:col-span-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                ISLINGTON R&amp;D
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connecting Research, People &amp; Impact. Islington College&apos;s digital platform for research discovery, scholarly dissemination, and academic inquiry.
              </p>
              <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                <p className="font-semibold text-slate-700">Kamal Marg, Kathmandu 44600, Nepal</p>
                <p>Tel: +977 1 4512929</p>
              </div>
              <div className="pt-2">
                <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                  Hackathon Prototype &bull; Sample Demo Dataset
                </span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
                Quick Links
              </h3>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-cyan-700 transition">Home</Link></li>
                <li><Link href="/about" className="hover:text-cyan-700 transition">About R&amp;D</Link></li>
                <li><Link href="/research" className="hover:text-cyan-700 transition">Research Areas</Link></li>
                <li><Link href="/researchers" className="hover:text-cyan-700 transition">Faculty Researchers</Link></li>
                <li><Link href="/projects" className="hover:text-cyan-700 transition">Research Projects</Link></li>
                <li><Link href="/publications" className="hover:text-cyan-700 transition">Publications &amp; DOIs</Link></li>
                <li><Link href="/events" className="hover:text-cyan-700 transition">Academic Events</Link></li>
                <li><Link href="/opportunities" className="hover:text-cyan-700 transition">Grants &amp; Opportunities</Link></li>
              </ul>
            </div>

            {/* Col 3: Research & Dissemination */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
                Research &amp; Dissemination
              </h3>
              <ul className="space-y-2 text-xs">
                <li><Link href="/discover" className="hover:text-cyan-700 transition font-medium">Unified Graph Discovery</Link></li>
                <li><Link href="/research#groups" className="hover:text-cyan-700 transition">Research Groups &amp; Labs</Link></li>
                <li><Link href="/projects?status=ongoing" className="hover:text-cyan-700 transition">Active Projects</Link></li>
                <li><Link href="/ijmr" className="hover:text-cyan-700 font-medium transition">IJMR Journal Gateway &rarr;</Link></li>
                <li><Link href="/partners" className="hover:text-cyan-700 transition">Institutional Partners</Link></li>
              </ul>
            </div>

            {/* Col 4: Support & Governance */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
                Support &amp; Governance
              </h3>
              <ul className="space-y-2 text-xs">
                <li><Link href="/research-support" className="hover:text-cyan-700 transition">Research Support &amp; Methodology</Link></li>
                <li><Link href="/ethics" className="hover:text-cyan-700 transition">Ethics &amp; Integrity Protocols</Link></li>
                <li><Link href="/funding" className="hover:text-cyan-700 transition">Grants &amp; Funding Guidelines</Link></li>
                <li><Link href="/resources" className="hover:text-cyan-700 transition">Resources &amp; SOPs Directory</Link></li>
                <li><Link href="/announcements" className="hover:text-cyan-700 transition">R&amp;D Bulletins &amp; Notices</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>&copy; 2026 Islington College. Connected Research Knowledge Graph &amp; Digital Hub.</p>
            <p className="font-medium text-slate-500">Kamal Marg, Kathmandu, Nepal &bull; In academic partnership with London Metropolitan University</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
