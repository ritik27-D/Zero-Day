"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface LayoutShellProps {
  children: React.ReactNode;
  activeNav?: "home" | "discover" | "researchers" | "projects" | "publications" | "areas" | "admin";
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
      : pathname.startsWith("/projects")
      ? "projects"
      : pathname.startsWith("/admin")
      ? "admin"
      : "home");

  type NavItem = {
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
    highlight?: boolean;
  };

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home Dashboard",
      href: "/",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "discover",
      label: "Unified Discovery",
      href: "/discover",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      badge: "Connected",
    },
    {
      id: "researchers",
      label: "Researchers",
      href: "/researchers",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: "projects",
      label: "Research Projects",
      href: "/discover?q=project",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: "publications",
      label: "Publications",
      href: "/discover?q=publication",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "areas",
      label: "Research Areas",
      href: "/discover?q=Intelligence",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
  ];

  const comingSoonItems = [
    { label: "Events & Symposia", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "Grants & Funding", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Ethics & Compliance", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { label: "Industry Partnerships", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* Desktop & Mobile Main Layout Wrapper */}
      <div className="flex-1 flex w-full">
        {/* LEFT SIDEBAR (Dark Navy/Purple #0b0f19) */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0b0f19] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Top Brand Section */}
          <div className="p-5">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-indigo-800 p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
                  <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                    <span className="text-cyan-400 font-black text-sm tracking-tighter">IC</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-cyan-400">
                      ISLINGTON
                    </span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                  <h1 className="text-sm font-bold text-white tracking-tight -mt-0.5">
                    R&amp;D Connect
                  </h1>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Live Connection Badge */}
            <div className="mt-5 rounded-lg bg-slate-900/90 border border-cyan-500/20 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                <span className="text-[11px] font-semibold text-slate-300">Live Graph DB</span>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                Supabase
              </span>
            </div>

            {/* Main Navigation */}
            <div className="mt-6">
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Discovery &amp; Data
              </p>
              <nav className="mt-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = currentNav === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition ${
                        isActive
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                          : item.highlight
                          ? "text-indigo-300 hover:bg-indigo-950/40 hover:text-white border border-indigo-500/20"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? "text-cyan-400" : item.highlight ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Platform & Governance Modules */}
            <div className="mt-6">
              <div className="flex items-center justify-between px-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Institutional Suite
                </p>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Planned</span>
              </div>
              <div className="mt-2 space-y-1">
                {comingSoonItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-400 rounded-lg cursor-not-allowed opacity-80 select-none hover:bg-slate-900/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      <span className="text-slate-400 text-[11px]">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 border border-slate-700/60 rounded px-1 py-0.2">
                      v2
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-400">Islington College</span>
              <span className="text-slate-400 font-mono">Hackathon 2026</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Connected Research Knowledge Graph MVP
            </p>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* MAIN BODY WRAPPER */}
        <div className="flex-1 flex flex-col md:pl-64 min-w-0">
          {/* TOP GLOBAL HEADER */}
          <header className="sticky top-0 z-20 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Open navigation menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Global Search Input */}
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Global search: researchers, projects, publications, topics... (Press Enter)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-24 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition shadow-xs"
                />
                <button
                  type="submit"
                  className="absolute inset-y-1 right-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-white transition flex items-center gap-1"
                >
                  <span>Search</span>
                </button>
              </form>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-3">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-xs font-semibold text-slate-700">Islington R&amp;D Knowledge Hub</span>
              </div>
              <Link
                href="/discover"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
              >
                <span>Browse Discovery</span>
                <span className="text-cyan-600 font-bold">&rarr;</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Researcher Portal</span>
              </Link>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
