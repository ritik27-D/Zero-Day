"use client";

import React, { useState } from "react";

interface EventRegisterModalProps {
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string | null;
  className?: string;
  buttonLabel?: string;
}

export function EventRegisterModal({
  eventTitle,
  eventDate,
  eventLocation,
  className = "",
  buttonLabel = "Register for Event",
}: EventRegisterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [regId, setRegId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError("Please provide a valid email address (e.g. name@domain.edu.np).");
      return;
    }

    setIsSubmitting(true);

    // Client-side confirmation without mutating DB schema
    setTimeout(() => {
      const code = `ISL-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
      setRegId(code);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setIsOpen(false);
    setIsSubmitted(false);
    setFullName("");
    setEmail("");
    setRole("student");
    setDepartment("");
    setNotes("");
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        }
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {buttonLabel}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/75">
              <div>
                <span className="text-xs font-semibold tracking-wider text-teal-700 uppercase">
                  Islington College R&amp;D
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900 leading-snug">
                  {isSubmitted ? "Registration Form Completed" : "Event Registration"}
                </h3>
                <p className="mt-1 text-xs text-slate-600 line-clamp-1 font-medium">
                  {eventTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close registration modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {isSubmitted ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-teal-50/50">
                    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Registration Received</h4>
                    <p className="mt-1.5 text-sm text-slate-600 max-w-sm mx-auto">
                      Thank you, <span className="font-semibold text-slate-800">{fullName}</span>. Your registration details have been validated for this demo session.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Submission Reference:</span>
                      <span className="font-mono font-bold text-teal-700">{regId}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Attendee Email:</span>
                      <span className="font-semibold text-slate-700">{email}</span>
                    </div>
                    {eventDate && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Date &amp; Schedule:</span>
                        <span className="text-slate-700 font-medium">{eventDate}</span>
                      </div>
                    )}
                    {eventLocation && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 font-medium">Venue:</span>
                        <span className="text-slate-700 font-medium">{eventLocation}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    Registration form completed for this demonstration session. Official academic registrations are coordinated with the CRD secretariat.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aayush Sharma"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700">
                      Institutional / Personal Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@islingtoncollege.edu.np"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="reg-role" className="block text-xs font-semibold text-slate-700">
                        Affiliation / Role
                      </label>
                      <select
                        id="reg-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900"
                      >
                        <option value="student">Student (Undergraduate/MSc)</option>
                        <option value="faculty">Faculty / Academic Staff</option>
                        <option value="researcher">Researcher / Fellow</option>
                        <option value="partner">Industry Partner / Guest</option>
                        <option value="alumni">Islington Alumni</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="reg-dept" className="block text-xs font-semibold text-slate-700">
                        Department / Program
                      </label>
                      <input
                        id="reg-dept"
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computing / AI"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-notes" className="block text-xs font-semibold text-slate-700">
                      Questions or Accessibility Needs (Optional)
                    </label>
                    <textarea
                      id="reg-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any topics you'd like the speakers to cover or requirements..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900 placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm Registration
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
