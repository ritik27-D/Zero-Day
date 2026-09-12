"use server";

import { requireResearcher } from "@/lib/auth";
import {
  getOrCreateDirectConversation,
  createGroupConversation,
  listUserConversations,
  getConversationMessages,
  sendMessage,
  MessageRecord,
  ConversationSummary,
} from "@/lib/messaging";

export async function getOrCreateDirectConversationAction(
  targetUserId: string
): Promise<{ conversationId: string; error?: string }> {
  try {
    const session = await requireResearcher();
    const result = await getOrCreateDirectConversation(session.user.id, targetUserId);
    return { conversationId: result.conversationId };
  } catch (err: unknown) {
    return {
      conversationId: "",
      error: err instanceof Error ? err.message : "Failed to open direct conversation",
    };
  }
}

export async function createGroupAction(
  name: string,
  memberUserIds: string[]
): Promise<{ conversationId: string; error?: string }> {
  try {
    const session = await requireResearcher();
    const result = await createGroupConversation(session.user.id, name, memberUserIds);
    return { conversationId: result.conversationId };
  } catch (err: unknown) {
    return {
      conversationId: "",
      error: err instanceof Error ? err.message : "Failed to create group",
    };
  }
}

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<{ success: boolean; message?: MessageRecord; error?: string }> {
  try {
    const session = await requireResearcher();
    const message = await sendMessage(conversationId, session.user.id, content);
    return { success: true, message };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send message",
    };
  }
}

export async function getConversationMessagesAction(
  conversationId: string
): Promise<{ messages: MessageRecord[]; error?: string }> {
  try {
    const session = await requireResearcher();
    const messages = await getConversationMessages(conversationId, session.user.id);
    return { messages };
  } catch (err: unknown) {
    return {
      messages: [],
      error: err instanceof Error ? err.message : "Failed to load messages",
    };
  }
}

export async function listUserConversationsAction(): Promise<{
  conversations: ConversationSummary[];
  error?: string;
}> {
  try {
    const session = await requireResearcher();
    const conversations = await listUserConversations(session.user.id);
    return { conversations };
  } catch (err: unknown) {
    return {
      conversations: [],
      error: err instanceof Error ? err.message : "Failed to load conversations",
    };
  }
}
