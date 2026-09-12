import fs from "fs";
import path from "path";
import { createSupabaseAdminClient } from "./supabase/server";

export type MessagingResearcher = {
  id: string; // researcher id
  userId: string; // auth user id
  username: string;
  name: string;
  slug: string;
  title: string;
  email: string;
};

export type ConversationMemberInfo = {
  userId: string;
  name: string;
  slug?: string;
  title?: string;
  joinedAt: string;
};

export type MessageRecord = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderSlug?: string;
  content: string;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  type: "direct" | "group";
  name: string | null;
  displayName: string;
  created_by: string;
  created_at: string;
  members: ConversationMemberInfo[];
  latestMessage: MessageRecord | null;
};

// Types for local fallback store
type LocalStore = {
  conversations: {
    id: string;
    type: "direct" | "group";
    name: string | null;
    created_by: string;
    created_at: string;
  }[];
  conversation_members: {
    conversation_id: string;
    user_id: string;
    joined_at: string;
  }[];
  messages: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
  }[];
};

const CACHE_DIR = path.join(process.cwd(), "node_modules", ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "islington_messaging_store.json");

function getLocalStore(): LocalStore {
  const g = globalThis as unknown as { __islington_messaging_store?: LocalStore };
  if (g.__islington_messaging_store) {
    return g.__islington_messaging_store;
  }

  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
      g.__islington_messaging_store = JSON.parse(data);
      return g.__islington_messaging_store!;
    }
  } catch {
    // ignore read error
  }

  g.__islington_messaging_store = {
    conversations: [],
    conversation_members: [],
    messages: [],
  };
  return g.__islington_messaging_store;
}

function saveLocalStore(store: LocalStore) {
  const g = globalThis as unknown as { __islington_messaging_store?: LocalStore };
  g.__islington_messaging_store = store;
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // ignore write error
  }
}

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

/**
 * List all researchers available for messaging.
 * Maps auth.users user_id to researcher profile details.
 */
export async function getMessagingResearchers(): Promise<MessagingResearcher[]> {
  const admin = createSupabaseAdminClient();

  try {
    const { data: profiles, error } = await admin
      .from("user_profiles")
      .select(`
        user_id,
        username,
        researcher_id,
        researchers (
          id,
          name,
          slug,
          title,
          email
        )
      `)
      .eq("role", "researcher");

    if (!error && profiles) {
      const list: MessagingResearcher[] = [];
      for (const p of profiles) {
        const r = toItem(p.researchers as unknown as {
          id: string;
          name: string;
          slug: string;
          title: string;
          email: string;
        });

        if (r && p.user_id) {
          list.push({
            id: r.id,
            userId: p.user_id,
            username: p.username,
            name: r.name,
            slug: r.slug,
            title: r.title,
            email: r.email,
          });
        }
      }
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch {
    // fall through
  }

  // Fallback: direct researchers query
  try {
    const { data: researchers } = await admin
      .from("researchers")
      .select("id, name, slug, title, email")
      .order("name", { ascending: true });

    if (researchers) {
      return researchers.map((r) => ({
        id: r.id,
        userId: r.id, // fallback identifier
        username: r.slug,
        name: r.name,
        slug: r.slug,
        title: r.title,
        email: r.email,
      }));
    }
  } catch {
    // fall through
  }

  return [];
}

/**
 * Helper to build map of userId -> researcher details
 */
async function getResearcherMap(): Promise<Map<string, MessagingResearcher>> {
  const list = await getMessagingResearchers();
  const map = new Map<string, MessagingResearcher>();
  for (const r of list) {
    map.set(r.userId, r);
    map.set(r.id, r);
  }
  return map;
}

/**
 * Get or create a direct 1-to-1 conversation between two users.
 * Strictly prevents duplicate direct conversations between the same two users.
 */
export async function getOrCreateDirectConversation(
  currentUserId: string,
  targetUserId: string
): Promise<{ conversationId: string }> {
  if (currentUserId === targetUserId) {
    throw new Error("Cannot start a direct conversation with yourself.");
  }

  const admin = createSupabaseAdminClient();

  // 1. Try Supabase DB
  try {
    // Find all direct conversations created by or involving currentUserId
    const { data: memberRows, error: memberErr } = await admin
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", currentUserId);

    if (!memberErr && memberRows && memberRows.length > 0) {
      const convIds = memberRows.map((r) => r.conversation_id);

      // Check if target is also member of any direct conversation in this list
      const { data: directConvs, error: convErr } = await admin
        .from("conversations")
        .select("id")
        .eq("type", "direct")
        .in("id", convIds);

      if (!convErr && directConvs && directConvs.length > 0) {
        const directIds = directConvs.map((c) => c.id);
        const { data: targetRows } = await admin
          .from("conversation_members")
          .select("conversation_id")
          .eq("user_id", targetUserId)
          .in("conversation_id", directIds)
          .limit(1);

        if (targetRows && targetRows.length > 0) {
          return { conversationId: targetRows[0].conversation_id };
        }
      }
    }

    // No existing direct conversation found: create new
    const { data: newConv, error: createErr } = await admin
      .from("conversations")
      .insert({
        type: "direct",
        name: null,
        created_by: currentUserId,
      })
      .select("id")
      .single();

    if (!createErr && newConv?.id) {
      const convId = newConv.id;
      await admin.from("conversation_members").insert([
        { conversation_id: convId, user_id: currentUserId },
        { conversation_id: convId, user_id: targetUserId },
      ]);
      return { conversationId: convId };
    }
  } catch {
    // Table missing or schema error -> fallback to local store
  }

  // 2. Resilient local fallback
  const store = getLocalStore();

  // Find existing direct conversation with both members
  const existingConv = store.conversations.find((c) => {
    if (c.type !== "direct") return false;
    const members = store.conversation_members.filter((m) => m.conversation_id === c.id);
    const memberIds = members.map((m) => m.user_id);
    return memberIds.includes(currentUserId) && memberIds.includes(targetUserId);
  });

  if (existingConv) {
    return { conversationId: existingConv.id };
  }

  // Create new direct conversation
  const newId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  store.conversations.push({
    id: newId,
    type: "direct",
    name: null,
    created_by: currentUserId,
    created_at: now,
  });

  store.conversation_members.push(
    { conversation_id: newId, user_id: currentUserId, joined_at: now },
    { conversation_id: newId, user_id: targetUserId, joined_at: now }
  );

  saveLocalStore(store);
  return { conversationId: newId };
}

/**
 * Create a simple group chat with a name and multiple researchers.
 */
export async function createGroupConversation(
  currentUserId: string,
  name: string,
  memberUserIds: string[]
): Promise<{ conversationId: string }> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Group name is required.");
  }

  // Ensure unique members including creator
  const allMembers = Array.from(new Set([currentUserId, ...memberUserIds]));
  if (allMembers.length < 2) {
    throw new Error("A group must include at least two researchers.");
  }

  const admin = createSupabaseAdminClient();

  // 1. Try Supabase DB
  try {
    const { data: newConv, error: createErr } = await admin
      .from("conversations")
      .insert({
        type: "group",
        name: trimmedName,
        created_by: currentUserId,
      })
      .select("id")
      .single();

    if (!createErr && newConv?.id) {
      const convId = newConv.id;
      const memberRows = allMembers.map((uid) => ({
        conversation_id: convId,
        user_id: uid,
      }));
      await admin.from("conversation_members").insert(memberRows);
      return { conversationId: convId };
    }
  } catch {
    // Fallback
  }

  // 2. Local fallback
  const store = getLocalStore();
  const newId = `group-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  store.conversations.push({
    id: newId,
    type: "group",
    name: trimmedName,
    created_by: currentUserId,
    created_at: now,
  });

  for (const uid of allMembers) {
    store.conversation_members.push({
      conversation_id: newId,
      user_id: uid,
      joined_at: now,
    });
  }

  saveLocalStore(store);
  return { conversationId: newId };
}

/**
 * List all conversations that the current user belongs to,
 * along with the latest message and computed display name.
 */
export async function listUserConversations(
  currentUserId: string
): Promise<ConversationSummary[]> {
  const researcherMap = await getResearcherMap();
  const admin = createSupabaseAdminClient();

  // 1. Try Supabase DB
  try {
    const { data: memberRows, error: memErr } = await admin
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", currentUserId);

    if (!memErr && memberRows) {
      const convIds = memberRows.map((r) => r.conversation_id);
      if (convIds.length === 0) return [];

      const { data: conversations, error: convErr } = await admin
        .from("conversations")
        .select("id, type, name, created_by, created_at")
        .in("id", convIds);

      if (!convErr && conversations) {
        // Fetch all members for these conversations
        const { data: allMembers } = await admin
          .from("conversation_members")
          .select("conversation_id, user_id, joined_at")
          .in("id", convIds);

        // Fetch latest message for each
        const { data: messages } = await admin
          .from("messages")
          .select("id, conversation_id, sender_id, content, created_at")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false });

        const results: ConversationSummary[] = conversations.map((conv) => {
          const membersInConv = (allMembers || [])
            .filter((m) => m.conversation_id === conv.id)
            .map((m) => {
              const r = researcherMap.get(m.user_id);
              return {
                userId: m.user_id,
                name: r?.name || "Researcher",
                slug: r?.slug,
                title: r?.title,
                joinedAt: m.joined_at,
              };
            });

          const latestMsgRow = (messages || []).find((m) => m.conversation_id === conv.id);
          let latestMsg: MessageRecord | null = null;
          if (latestMsgRow) {
            const senderR = researcherMap.get(latestMsgRow.sender_id);
            latestMsg = {
              id: latestMsgRow.id,
              conversationId: conv.id,
              senderId: latestMsgRow.sender_id,
              senderName: senderR?.name || "Researcher",
              senderSlug: senderR?.slug,
              content: latestMsgRow.content,
              createdAt: latestMsgRow.created_at,
            };
          }

          let displayName = conv.name || "Conversation";
          if (conv.type === "direct") {
            const other = membersInConv.find((m) => m.userId !== currentUserId);
            displayName = other?.name || "Direct Message";
          }

          return {
            id: conv.id,
            type: conv.type,
            name: conv.name,
            displayName,
            created_by: conv.created_by,
            created_at: conv.created_at,
            members: membersInConv,
            latestMessage: latestMsg,
          };
        });

        // Sort by latest message date or conversation created_at desc
        return results.sort((a, b) => {
          const dateA = a.latestMessage?.createdAt || a.created_at;
          const dateB = b.latestMessage?.createdAt || b.created_at;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      }
    }
  } catch {
    // Fallback to local store
  }

  // 2. Resilient local fallback
  const store = getLocalStore();

  const userConvIds = store.conversation_members
    .filter((m) => m.user_id === currentUserId)
    .map((m) => m.conversation_id);

  const conversations = store.conversations.filter((c) => userConvIds.includes(c.id));

  const summaries: ConversationSummary[] = conversations.map((conv) => {
    const membersInConv = store.conversation_members
      .filter((m) => m.conversation_id === conv.id)
      .map((m) => {
        const r = researcherMap.get(m.user_id);
        return {
          userId: m.user_id,
          name: r?.name || "Researcher",
          slug: r?.slug,
          title: r?.title,
          joinedAt: m.joined_at,
        };
      });

    const messages = store.messages
      .filter((m) => m.conversation_id === conv.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const latest = messages[0];
    let latestMsg: MessageRecord | null = null;
    if (latest) {
      const senderR = researcherMap.get(latest.sender_id);
      latestMsg = {
        id: latest.id,
        conversationId: conv.id,
        senderId: latest.sender_id,
        senderName: senderR?.name || "Researcher",
        senderSlug: senderR?.slug,
        content: latest.content,
        createdAt: latest.created_at,
      };
    }

    let displayName = conv.name || "Conversation";
    if (conv.type === "direct") {
      const other = membersInConv.find((m) => m.userId !== currentUserId);
      displayName = other?.name || "Direct Message";
    }

    return {
      id: conv.id,
      type: conv.type,
      name: conv.name,
      displayName,
      created_by: conv.created_by,
      created_at: conv.created_at,
      members: membersInConv,
      latestMessage: latestMsg,
    };
  });

  return summaries.sort((a, b) => {
    const dateA = a.latestMessage?.createdAt || a.created_at;
    const dateB = b.latestMessage?.createdAt || b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

/**
 * Get message history for a specific conversation.
 * Verifies that the requesting user is a member of the conversation.
 */
export async function getConversationMessages(
  conversationId: string,
  currentUserId: string
): Promise<MessageRecord[]> {
  const researcherMap = await getResearcherMap();
  const admin = createSupabaseAdminClient();

  // 1. Try Supabase DB
  try {
    // Membership check
    const { data: member } = await admin
      .from("conversation_members")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", currentUserId)
      .maybeSingle();

    if (member) {
      const { data: rows, error } = await admin
        .from("messages")
        .select("id, conversation_id, sender_id, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!error && rows) {
        return rows.map((r) => {
          const sender = researcherMap.get(r.sender_id);
          return {
            id: r.id,
            conversationId: r.conversation_id,
            senderId: r.sender_id,
            senderName: sender?.name || "Researcher",
            senderSlug: sender?.slug,
            content: r.content,
            createdAt: r.created_at,
          };
        });
      }
    }
  } catch {
    // Fallback to local store
  }

  // 2. Resilient local fallback
  const store = getLocalStore();

  const isMember = store.conversation_members.some(
    (m) => m.conversation_id === conversationId && m.user_id === currentUserId
  );

  if (!isMember) {
    throw new Error("Unauthorized: You are not a member of this conversation.");
  }

  const messages = store.messages
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return messages.map((m) => {
    const sender = researcherMap.get(m.sender_id);
    return {
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: sender?.name || "Researcher",
      senderSlug: sender?.slug,
      content: m.content,
      createdAt: m.created_at,
    };
  });
}

/**
 * Send a message to a conversation.
 * Verifies that the sender is a member of the conversation.
 */
export async function sendMessage(
  conversationId: string,
  senderUserId: string,
  content: string
): Promise<MessageRecord> {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Message content cannot be empty.");
  }

  const researcherMap = await getResearcherMap();
  const senderInfo = researcherMap.get(senderUserId);
  const senderName = senderInfo?.name || "Researcher";
  const senderSlug = senderInfo?.slug;
  const admin = createSupabaseAdminClient();

  // 1. Try Supabase DB
  try {
    // Verify membership
    const { data: member } = await admin
      .from("conversation_members")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", senderUserId)
      .maybeSingle();

    if (member) {
      const { data: row, error } = await admin
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderUserId,
          content: trimmed,
        })
        .select("id, conversation_id, sender_id, content, created_at")
        .single();

      if (!error && row) {
        return {
          id: row.id,
          conversationId: row.conversation_id,
          senderId: row.sender_id,
          senderName,
          senderSlug,
          content: row.content,
          createdAt: row.created_at,
        };
      }
    }
  } catch {
    // Fallback
  }

  // 2. Resilient local fallback
  const store = getLocalStore();

  const isMember = store.conversation_members.some(
    (m) => m.conversation_id === conversationId && m.user_id === senderUserId
  );

  if (!isMember) {
    throw new Error("Unauthorized: You are not a member of this conversation.");
  }

  const newId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const msgItem = {
    id: newId,
    conversation_id: conversationId,
    sender_id: senderUserId,
    content: trimmed,
    created_at: now,
  };

  store.messages.push(msgItem);
  saveLocalStore(store);

  return {
    id: newId,
    conversationId,
    senderId: senderUserId,
    senderName,
    senderSlug,
    content: trimmed,
    createdAt: now,
  };
}
