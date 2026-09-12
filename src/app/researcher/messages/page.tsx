import { requireResearcher } from "@/lib/auth";
import {
  listUserConversations,
  getMessagingResearchers,
  getOrCreateDirectConversation,
} from "@/lib/messaging";
import ResearcherMessagingClient from "./messaging-client";

export default async function ResearcherMessagesPage(props: {
  searchParams: Promise<{
    recipientId?: string;
    slug?: string;
    conversationId?: string;
  }>;
}) {
  const session = await requireResearcher();
  const searchParams = await props.searchParams;

  const [allResearchers, conversations] = await Promise.all([
    getMessagingResearchers(),
    listUserConversations(session.user.id),
  ]);

  let activeConversationId = searchParams.conversationId || null;

  // Handle direct message intent via URL parameters (recipientId or slug)
  if (!activeConversationId && (searchParams.recipientId || searchParams.slug)) {
    const target = allResearchers.find(
      (r) =>
        r.id === searchParams.recipientId ||
        r.slug === searchParams.slug ||
        r.slug === searchParams.recipientId ||
        r.userId === searchParams.recipientId
    );

    if (target && target.userId !== session.user.id) {
      try {
        const direct = await getOrCreateDirectConversation(session.user.id, target.userId);
        activeConversationId = direct.conversationId;
      } catch {
        // Fall back to default first conversation
      }
    }
  }

  // If no specific conversation requested, default to first conversation if available
  if (!activeConversationId && conversations.length > 0) {
    activeConversationId = conversations[0].id;
  }

  // Pass configuration for client Supabase Realtime
  const supabaseConfig =
    process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY
      ? {
          url: process.env.SUPABASE_URL,
          publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
        }
      : null;

  return (
    <div className="space-y-4">
      <ResearcherMessagingClient
        currentUserId={session.user.id}
        currentResearcher={session.profile.researcher}
        initialConversations={conversations}
        allResearchers={allResearchers}
        initialActiveConversationId={activeConversationId}
        supabaseConfig={supabaseConfig}
      />
    </div>
  );
}
