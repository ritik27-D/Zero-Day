"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction } from "@/lib/auth-actions";

function ResearcherLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlError = searchParams.get("error") === "admin_denied"
    ? "Administrators must access the system via the Admin Portal."
    : null;

  const displayError = error || urlError;

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
    <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
      {displayError && (
        <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2">
          <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{displayError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Username or Institutional Email
          </label>
          <div className="mt-1">
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. dr-aisha-rahman"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPassword((prev) => !prev);
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3 z-10 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none focus:text-teal-600 cursor-pointer"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-xs text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition cursor-pointer"
          >
            {isPending ? "Authenticating..." : "Sign In to Researcher Portal"}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <Link href="/" className="hover:text-teal-700 transition">
          &larr; Public Knowledge Hub
        </Link>
        <Link href="/discover" className="hover:text-teal-700 transition">
          Browse Discovery &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function ResearcherLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-block bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition group"
          >
            <Image
              src="/images/islington-rd-connect-logo.png"
              alt="Islington R&D Connect"
              width={180}
              height={63}
              className="w-[165px] h-auto object-contain mx-auto group-hover:opacity-90 transition"
              priority
            />
          </Link>
        </div>

        <div className="mt-5 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            Faculty Workspace &bull; Researcher Portal
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Researcher Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Sign in to manage your profile, project contributions, and research submissions.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400 border border-slate-200">Loading...</div>}>
          <ResearcherLoginForm />
        </Suspense>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Islington College Research &amp; Development Knowledge Platform
        </p>
      </div>
    </div>
  );
}
