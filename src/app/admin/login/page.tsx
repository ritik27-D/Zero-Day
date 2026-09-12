"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction } from "@/lib/auth-actions";

function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlError = searchParams.get("error") === "denied"
    ? "Access denied. Administrator privileges are required to enter this portal."
    : null;

  const displayError = error || urlError;

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
    <div className="bg-[#0e1424] py-8 px-6 shadow-xl border border-slate-800 rounded-2xl sm:px-10">
      {displayError && (
        <div className="mb-5 rounded-xl bg-rose-950/50 border border-rose-800/80 p-3.5 text-xs text-rose-300 flex items-start gap-2">
          <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{displayError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-username" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Administrator Username
          </label>
          <div className="mt-1">
            <input
              id="admin-username"
              name="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="block w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Password
          </label>
          <div className="mt-1">
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-block bg-white px-5 py-2.5 rounded-2xl shadow-xl border border-slate-700/60 hover:opacity-95 transition group"
          >
            <Image
              src="/images/islington-rd-connect-logo.png"
              alt="Islington R&D Connect"
              width={180}
              height={63}
              className="w-[165px] h-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="mt-5 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Institutional Governance &bull; Admin Portal
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
            Administrator Login
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Sign in with authorized administrator credentials to manage research entities and review submissions.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="bg-[#0e1424] p-8 rounded-2xl text-center text-xs text-slate-400">Loading...</div>}>
          <AdminLoginForm />
        </Suspense>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Restricted Institutional Area &bull; Unauthorized access is logged
        </p>
      </div>
    </div>
  );
}
