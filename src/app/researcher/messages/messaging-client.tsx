"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  ConversationSummary,
  MessagingResearcher,
  MessageRecord,
} from "@/lib/messaging";
import {
  getOrCreateDirectConversationAction,
  createGroupAction,
  sendMessageAction,
  getConversationMessagesAction,
  listUserConversationsAction,
} from "./actions";

type Props = {
  currentUserId: string;
  currentResearcher?: {
    id: string;
    name: string;
    slug: string;
    title: string;
  } | null;
  initialConversations: ConversationSummary[];
  allResearchers: MessagingResearcher[];
  initialActiveConversationId: string | null;
  supabaseConfig: {
    url: string;
    publishableKey: string;
  } | null;
};

export default function ResearcherMessagingClient({
  currentUserId,
  currentResearcher,
  initialConversations,
  allResearchers,
  initialActiveConversationId,
  supabaseConfig,
}: Props) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialActiveConversationId
  );
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    initialActiveConversationId ? "chat" : "list"
  );

  // Modals state
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [researcherSearch, setResearcherSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedGroupUserIds, setSelectedGroupUserIds] = useState<string[]>([]);
  const [groupError, setGroupError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const activeConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const otherResearchers = allResearchers.filter((r) => r.userId !== currentUserId);

  // Active conversation summary
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages whenever activeConversationId changes
  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    let isMounted = true;

    getConversationMessagesAction(activeConversationId).then((res) => {
      if (isMounted) {
        setMessages(res.messages || []);
        setLoadingMessages(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  // Realtime subscription via Supabase if configured
  useEffect(() => {
    if (!supabaseConfig?.url || !supabaseConfig?.publishableKey) return;

    try {
      const client = createClient(supabaseConfig.url, supabaseConfig.publishableKey);
      const channel = client
        .channel("realtime:messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const newRow = payload.new as {
              id: string;
              conversation_id: string;
              sender_id: string;
              content: string;
              created_at: string;
            };

            // If incoming message belongs to active conversation
            if (newRow.conversation_id === activeConversationIdRef.current) {
              const sender = allResearchers.find((r) => r.userId === newRow.sender_id);
              const formatted: MessageRecord = {
                id: newRow.id,
                conversationId: newRow.conversation_id,
                senderId: newRow.sender_id,
                senderName: sender?.name || "Researcher",
                senderSlug: sender?.slug,
                content: newRow.content,
                createdAt: newRow.created_at,
              };

              setMessages((prev) => {
                if (prev.some((m) => m.id === formatted.id)) return prev;
                return [...prev, formatted];
              });
            }

            // Refresh conversation list preview
            listUserConversationsAction().then((res) => {
              if (res.conversations) setConversations(res.conversations);
            });
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch {
      // ignore
    }
  }, [supabaseConfig, allResearchers]);

  // Polling heartbeat fallback for high reliability in local & test environments
  useEffect(() => {
    const timer = setInterval(async () => {
      const convRes = await listUserConversationsAction();
      if (convRes.conversations) {
        setConversations(convRes.conversations);
      }

      const activeId = activeConversationIdRef.current;
      if (activeId) {
        const msgRes = await getConversationMessagesAction(activeId);
        if (msgRes.messages && msgRes.messages.length > 0) {
          setMessages((prev) => {
            if (msgRes.messages.length !== prev.length) {
              return msgRes.messages;
            }
            return prev;
          });
        }
      }
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputText.trim();
    if (!content || !activeConversationId || isSending) return;

    setIsSending(true);
    setInputText("");

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: MessageRecord = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: currentUserId,
      senderName: currentResearcher?.name || "You",
      senderSlug: currentResearcher?.slug,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    const res = await sendMessageAction(activeConversationId, content);

    if (res.success && res.message) {
      const confirmed = res.message;
      setMessages((prev) => prev.map((m) => (m.id === tempId ? confirmed : m)));

      // Update conversations list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                latestMessage: confirmed,
              }
            : c
        )
      );
    } else {
      // Revert if error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert(res.error || "Failed to send message. Please try again.");
    }

    setIsSending(false);
  };

  // Start direct conversation
  const handleStartDirect = async (targetUserId: string) => {
    setIsDirectModalOpen(false);
    setResearcherSearch("");

    const res = await getOrCreateDirectConversationAction(targetUserId);
    if (res.conversationId) {
      setActiveConversationId(res.conversationId);
      setMobileView("chat");

      const listRes = await listUserConversationsAction();
      if (listRes.conversations) setConversations(listRes.conversations);
    } else {
      alert(res.error || "Failed to start direct conversation.");
    }
  };

  // Create group chat
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = groupName.trim();
    if (!name) {
      setGroupError("Group name is required.");
      return;
    }
    if (selectedGroupUserIds.length === 0) {
      setGroupError("Please select at least one other researcher.");
      return;
    }

    setGroupError(null);
    const res = await createGroupAction(name, selectedGroupUserIds);

    if (res.conversationId) {
      setIsGroupModalOpen(false);
      setGroupName("");
      setSelectedGroupUserIds([]);
      setActiveConversationId(res.conversationId);
      setMobileView("chat");

      const listRes = await listUserConversationsAction();
      if (listRes.conversations) setConversations(listRes.conversations);
    } else {
      setGroupError(res.error || "Failed to create group.");
    }
  };

  const toggleGroupMember = (userId: string) => {
    setSelectedGroupUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Filtered conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.displayName.toLowerCase().includes(q) ||
      (c.latestMessage?.content && c.latestMessage.content.toLowerCase().includes(q))
    );
  });

  // Filtered researchers for modals
  const filteredResearchers = otherResearchers.filter((r) => {
    if (!researcherSearch) return true;
    const q = researcherSearch.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    );
  });

  // Format date helper
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[750px] max-h-[82vh]">
      {/* Messaging Header */}
      <div className="border-b border-slate-200/80 px-5 py-3.5 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              Researcher Communications
            </h1>
            <p className="text-[11px] text-slate-500">
              Institutional direct messaging &amp; collaborative academic groups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setResearcherSearch("");
              setIsDirectModalOpen(true);
            }}
            className="rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100 transition flex items-center gap-1.5 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGroupName("");
              setSelectedGroupUserIds([]);
              setGroupError(null);
              setResearcherSearch("");
              setIsGroupModalOpen(true);
            }}
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Conversation List */}
        <aside
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-white shrink-0 ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-600 focus:border-cyan-600"
              />
            </div>
          </div>

          {/* Conversations list container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-slate-700">No conversations yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Click &ldquo;New Chat&rdquo; to connect with colleagues or create a working group.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const isGroup = conv.type === "group";

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setMobileView("chat");
                    }}
                    className={`w-full text-left p-3.5 transition flex items-start gap-3 hover:bg-slate-50 ${
                      isActive ? "bg-cyan-50/60 border-l-4 border-cyan-600" : ""
                    }`}
                  >
                    {/* Avatar / Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                        isGroup
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-800 text-white"
                      }`}
                    >
                      {isGroup ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        conv.displayName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {conv.displayName}
                          </span>
                          {isGroup && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                              Group
                            </span>
                          )}
                        </div>
                        {conv.latestMessage && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatTime(conv.latestMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.latestMessage ? (
                          <>
                            {conv.latestMessage.senderId === currentUserId ? (
                              <span className="font-medium text-slate-700">You: </span>
                            ) : isGroup ? (
                              <span className="font-medium text-slate-700">
                                {conv.latestMessage.senderName.split(" ")[0]}:{" "}
                              </span>
                            ) : null}
                            {conv.latestMessage.content}
                          </>
                        ) : (
                          <span className="italic text-slate-400">No messages yet</span>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Active Conversation Messages & Composer */}
        <main
          className={`flex-1 flex flex-col bg-slate-50/40 min-w-0 ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConversation ? (
            <>
              {/* Conversation Header */}
              <div className="h-16 px-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setMobileView("list")}
                    className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      activeConversation.type === "group"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-slate-800 text-white"
                    }`}
                  >
                    {activeConversation.type === "group" ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      activeConversation.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 truncate">
                        {activeConversation.displayName}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate">
                      {activeConversation.type === "group" ? (
                        <span>
                          {activeConversation.members.length} members:{" "}
                          {activeConversation.members.map((m) => m.name).join(", ")}
                        </span>
                      ) : (
                        (() => {
                          const other = activeConversation.members.find((m) => m.userId !== currentUserId);
                          return other?.title || "Academic Colleague";
                        })()
                      )}
                    </p>
                  </div>
                </div>

                {/* Direct Chat Profile Link */}
                {activeConversation.type === "direct" &&
                  (() => {
                    const other = activeConversation.members.find((m) => m.userId !== currentUserId);
                    if (!other?.slug) return null;
                    return (
                      <Link
                        href={`/researchers/${other.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200 transition hidden sm:flex items-center gap-1"
                      >
                        <span>View Profile</span>
                        <svg className="w-3 h-3 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    );
                  })()}
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    Loading conversation messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-800">No messages in this channel yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Send the first message below to begin academic collaboration or discuss joint projects.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    const isGroup = activeConversation.type === "group";

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        {!isMe && isGroup && (
                          <span className="text-[10px] font-bold text-slate-600 mb-1 ml-1">
                            {msg.senderName}
                          </span>
                        )}

                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                            isMe
                              ? "bg-slate-900 text-white rounded-br-xs"
                              : "bg-white text-slate-900 border border-slate-200 rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>

                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Write an institutional message (Press Enter to send)..."
                    disabled={isSending}
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="rounded-xl bg-cyan-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Send</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-cyan-50 border border-cyan-100 text-cyan-700 flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Islington Faculty Messaging</h2>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Select a conversation from the sidebar, or start a new direct exchange or group with any registered researcher.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setResearcherSearch("");
                    setIsDirectModalOpen(true);
                  }}
                  className="rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-800 hover:bg-cyan-100 transition shadow-2xs"
                >
                  Start Direct Message
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGroupName("");
                    setSelectedGroupUserIds([]);
                    setGroupError(null);
                    setResearcherSearch("");
                    setIsGroupModalOpen(true);
                  }}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-2xs"
                >
                  Create Group Chat
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: New Direct Message Researcher Picker */}
      {isDirectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Start Direct Message</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select a researcher to open or resume a chat</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDirectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <input
                type="text"
                value={researcherSearch}
                onChange={(e) => setResearcherSearch(e.target.value)}
                placeholder="Search faculty by name, title, or email..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                autoFocus
              />
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-2">
              {filteredResearchers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No researchers found matching your search.
                </div>
              ) : (
                filteredResearchers.map((r) => (
                  <button
                    key={r.userId}
                    type="button"
                    onClick={() => handleStartDirect(r.userId)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {r.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition">
                          {r.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{r.title}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-cyan-700 opacity-0 group-hover:opacity-100 transition">
                      Message &rarr;
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setIsDirectModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Group Chat */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create Academic Group</h3>
                <p className="text-xs text-slate-500 mt-0.5">Collaborate with multiple researchers in one channel</p>
              </div>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div className="p-4 space-y-4">
                {groupError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {groupError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. AI & Robotics Research Initiative"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                    autoFocus
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Members ({selectedGroupUserIds.length} selected)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={researcherSearch}
                    onChange={(e) => setResearcherSearch(e.target.value)}
                    placeholder="Filter researchers..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 placeholder-slate-400 mb-2 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                  />

                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl p-1 bg-white">
                    {filteredResearchers.map((r) => {
                      const isSelected = selectedGroupUserIds.includes(r.userId);
                      return (
                        <div
                          key={r.userId}
                          onClick={() => toggleGroupMember(r.userId)}
                          className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition ${
                            isSelected ? "bg-cyan-50/80" : "hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">{r.name}</div>
                            <div className="text-[11px] text-slate-500">{r.title}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-cyan-700 focus:ring-cyan-600 pointer-events-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!groupName.trim() || selectedGroupUserIds.length === 0}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition shadow-2xs"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
