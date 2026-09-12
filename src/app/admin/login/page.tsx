"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInAction } from "@/lib/auth-actions";

export default function AdminLoginPage() {
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
    formData.set("role", "admin");

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
    <div className="min-h-screen bg-[#080c14] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-900 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-indigo-400">
            ISLINGTON R&amp;D GOVERNANCE
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Administrator Login
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in with authorized administrator credentials to manage research entities and review submissions.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#0e1424] py-8 px-6 shadow-xl border border-slate-800 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 rounded-xl bg-rose-950/50 border border-rose-800/80 p-3.5 text-xs text-rose-300 flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Administrator Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-md text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
              >
                {isPending ? "Verifying..." : "Sign In to Admin Portal"}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center text-xs text-slate-400">
            <Link href="/" className="hover:text-indigo-400 transition">
              &larr; Return to Public Portal
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Restricted Institutional Area &bull; Unauthorized access is logged
        </p>
      </div>
    </div>
  );
}
