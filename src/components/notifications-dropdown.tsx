"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { NotificationItem } from "@/lib/notifications";

type Props = {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
  role: "researcher" | "admin";
  align?: "left" | "right";
};

export default function NotificationsDropdown({
  initialNotifications,
  initialUnreadCount,
  role,
  align = "right",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  const handleItemClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setIsOpen(false);
  };

  const formatNotificationTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const themeAccent =
    role === "admin"
      ? {
          badge: "bg-indigo-600 text-white",
          activeRing: "focus:ring-indigo-500",
          hoverBg: "hover:bg-indigo-50/70",
          headerBg: "bg-indigo-50/80 border-indigo-100",
          dot: "bg-indigo-600",
        }
      : {
          badge: "bg-cyan-600 text-white",
          activeRing: "focus:ring-cyan-500",
          hoverBg: "hover:bg-cyan-50/70",
          headerBg: "bg-cyan-50/80 border-cyan-100",
          dot: "bg-cyan-600",
        };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
        className={`relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 ${themeAccent.activeRing} transition`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span
            className={`absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${themeAccent.badge} shadow-xs animate-pulse`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div
            className={`p-3.5 border-b flex items-center justify-between ${themeAccent.headerBg}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-900 text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:underline transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => handleItemClick(item.id)}
                  className={`block p-3.5 transition ${themeAccent.hoverBg} ${
                    item.unread ? "bg-slate-50/80" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="shrink-0 mt-0.5">
                      {item.type === "submission_approved" && (
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                      {item.type === "submission_rejected" && (
                        <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      )}
                      {item.type === "submission_pending" && (
                        <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      )}
                      {item.type === "message" && (
                        <span className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </span>
                      )}
                      {(item.type === "announcement" || item.type === "system" || item.type === "researcher_log" || item.type === "alert") && (
                        <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatNotificationTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {item.unread && (
                      <span className={`w-2 h-2 rounded-full ${themeAccent.dot} shrink-0 mt-1.5`} />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href={role === "admin" ? "/admin?tab=submissions" : "/researcher/submissions"}
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              {role === "admin" ? "View Submissions Queue →" : "View My Submissions →"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
