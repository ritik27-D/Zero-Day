"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInAction } from "@/lib/auth-actions";

export default function ResearcherLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("username", username);
    formData.set("password", password);
    formData.set("role", "researcher");

    startTransition(async () => {
      const res = await signInAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.redirectTo) {
        router.push(res.redirectTo);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-indigo-800 p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <span className="text-cyan-400 font-black text-sm tracking-tighter">IC</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-cyan-600 block">
                ISLINGTON COLLEGE
              </span>
              <span className="text-base font-bold text-slate-900 tracking-tight block -mt-0.5">
                R&amp;D Connect
              </span>
            </div>
          </Link>
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Researcher Portal
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500">
          Sign in to manage your profile, project contributions, and research submissions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Username or Institutional Email
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. dr-aisha-rahman"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-xs text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition"
              >
                {isPending ? "Authenticating..." : "Sign In to Researcher Portal"}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-cyan-700 transition">
              &larr; Public Knowledge Hub
            </Link>
            <Link href="/discover" className="hover:text-cyan-700 transition">
              Browse Discovery &rarr;
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Islington College Research &amp; Development Knowledge Platform
        </p>
      </div>
    </div>
  );
}
