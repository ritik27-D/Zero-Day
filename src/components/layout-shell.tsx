"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

  const isHomePage = activeNav === "home" || pathname === "/";

  const currentNav =
    activeNav ||
    (pathname === "/"
      ? "home"
      : pathname.startsWith("/about") || pathname.startsWith("/ethics") || pathname.startsWith("/research-support")
      ? "about"
      : pathname.startsWith("/research") && !pathname.startsWith("/researchers")
      ? "research"
      : pathname.startsWith("/people") || pathname.startsWith("/researchers")
      ? "people"
      : pathname.startsWith("/projects")
      ? "projects"
      : pathname.startsWith("/publications")
      ? "publications"
      : pathname.startsWith("/events")
      ? "events"
      : pathname.startsWith("/opportunities") || pathname.startsWith("/funding")
      ? "opportunities"
      : pathname.startsWith("/ijmr")
      ? "ijmr"
      : pathname.startsWith("/discover")
      ? "search"
      : pathname.startsWith("/admin")
      ? "admin"
      : "home");

  const navLinks = [
    { id: "home", label: "Home", href: "/" },
    { id: "about", label: "About R&D", href: "/about" },
    { id: "research", label: "Research", href: "/research" },
    { id: "people", label: "People", href: "/people" },
    { id: "projects", label: "Projects", href: "/projects" },
    { id: "publications", label: "Publications", href: "/publications" },
    { id: "events", label: "Events", href: "/events" },
    { id: "opportunities", label: "Opportunities", href: "/opportunities" },
    { id: "ijmr", label: "IJMR", href: "/ijmr" },
  ];

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 overflow-x-hidden w-full">
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR: Simple Flat Navigation, ZERO DROPDOWNS                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[66px] sm:min-h-[70px] py-1.5 gap-2 lg:gap-3 xl:gap-4">
            {/* Left: Authentic Brand Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group">
                <Image
                  src="/images/islington-rd-connect-logo.png"
                  alt="Islington R&D Connect"
                  width={180}
                  height={63}
                  className="w-[145px] sm:w-[168px] h-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Center: Desktop Flat Navigation (No Dropdowns) */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {navLinks.map((item) => {
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

            {/* Right: Search (Hidden on Homepage) + Researcher Sign In / Admin Indicator */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Compact Search Field */}
              {!isHomePage && (
                <form onSubmit={handleSearch} className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Search Islington Research..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 lg:w-44 xl:w-56 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 transition"
                  />
                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 hover:text-teal-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              )}

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
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs cursor-pointer whitespace-nowrap"
                >
                  Researcher Sign In
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
            {/* Mobile Search Input (Hidden on Homepage) */}
            {!isHomePage && (
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
            )}

            {/* Flat Navigation Links */}
            <div className="space-y-1 divide-y divide-slate-100">
              {navLinks.map((item) => {
                const isActive = currentNav === item.id;
                return (
                  <div key={item.id} className="pt-1.5 first:pt-0">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2 text-xs font-bold transition ${
                        isActive ? "text-teal-700" : "text-slate-800 hover:text-teal-700"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Additional Secondary Links */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <Link href="/discover" onClick={() => setMobileMenuOpen(false)} className="hover:text-teal-700 py-1">
                Unified Search
              </Link>
              <Link href="/researchers" onClick={() => setMobileMenuOpen(false)} className="hover:text-teal-700 py-1">
                Researchers
              </Link>
              <Link href="/resources" onClick={() => setMobileMenuOpen(false)} className="hover:text-teal-700 py-1">
                Resources
              </Link>
              <Link href="/partners" onClick={() => setMobileMenuOpen(false)} className="hover:text-teal-700 py-1">
                Partners
              </Link>
              <Link href="/announcements" onClick={() => setMobileMenuOpen(false)} className="hover:text-teal-700 py-1">
                Announcements
              </Link>
              <Link href="/funding" onClick={() => setMobileMenuOpen(false)} className="hover:text-teal-700 py-1">
                Funding
              </Link>
            </div>

            {/* Mobile Auth Button */}
            <div className="pt-3 border-t border-slate-200">
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
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
                >
                  Researcher Sign In
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
      {/* INSTITUTIONAL FOOTER: Authentic Brand Logo, Clean 4-Column Structure      */}
      {/* ========================================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
            {/* Col 1: Institutional Identity & Verified Location */}
            <div className="space-y-3 md:col-span-1">
              <Link href="/" className="inline-block">
                <Image
                  src="/images/islington-rd-connect-logo.png"
                  alt="Islington R&D Connect"
                  width={160}
                  height={38}
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connecting Research, People &amp; Impact. Islington College&apos;s digital platform for research discovery, scholarly dissemination, and academic inquiry.
              </p>
              <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                <p className="font-semibold text-slate-700">Kamal Marg, Kathmandu 44600, Nepal</p>
                <p>Tel: +977 1 4512929</p>
              </div>
              <div className="pt-2">
                <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                  Islington College &bull; R&amp;D Knowledge Hub
                </span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
                Quick Links
              </h3>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-teal-700 transition">Home</Link></li>
                <li><Link href="/about" className="hover:text-teal-700 transition">About R&amp;D</Link></li>
                <li><Link href="/research" className="hover:text-teal-700 transition">Research Areas</Link></li>
                <li><Link href="/researchers" className="hover:text-teal-700 transition">Faculty Researchers</Link></li>
                <li><Link href="/projects" className="hover:text-teal-700 transition">Research Projects</Link></li>
                <li><Link href="/publications" className="hover:text-teal-700 transition">Publications &amp; DOIs</Link></li>
                <li><Link href="/events" className="hover:text-teal-700 transition">Academic Events</Link></li>
                <li><Link href="/opportunities" className="hover:text-teal-700 transition">Grants &amp; Opportunities</Link></li>
              </ul>
            </div>

            {/* Col 3: Research & Dissemination */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
                Research &amp; Dissemination
              </h3>
              <ul className="space-y-2 text-xs">
                <li><Link href="/discover" className="hover:text-teal-700 transition font-medium">Unified Graph Discovery</Link></li>
                <li><Link href="/research#groups" className="hover:text-teal-700 transition">Research Groups &amp; Labs</Link></li>
                <li><Link href="/projects?status=ongoing" className="hover:text-teal-700 transition">Active Projects</Link></li>
                <li><Link href="/ijmr" className="hover:text-teal-700 font-medium transition">IJMR Journal Gateway &rarr;</Link></li>
                <li><Link href="/partners" className="hover:text-teal-700 transition">Institutional Partners</Link></li>
              </ul>
            </div>

            {/* Col 4: Support & Governance */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
                Support &amp; Governance
              </h3>
              <ul className="space-y-2 text-xs">
                <li><Link href="/research-support" className="hover:text-teal-700 transition">Research Support &amp; Methodology</Link></li>
                <li><Link href="/ethics" className="hover:text-teal-700 transition">Ethics &amp; Integrity Protocols</Link></li>
                <li><Link href="/funding" className="hover:text-teal-700 transition">Grants &amp; Funding Guidelines</Link></li>
                <li><Link href="/resources" className="hover:text-teal-700 transition">Resources &amp; SOPs Directory</Link></li>
                <li><Link href="/announcements" className="hover:text-teal-700 transition">R&amp;D Bulletins &amp; Notices</Link></li>
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
