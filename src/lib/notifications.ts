import { listSubmissionsForResearcher, listAllSubmissions } from "./submissions";
import { listUserConversations } from "./messaging";
import { getAnnouncements, getRecentAdminActivity, getNeedsAttentionItems } from "./hub-data";

export type NotificationItem = {
  id: string;
  type:
    | "submission_approved"
    | "submission_rejected"
    | "submission_pending"
    | "message"
    | "announcement"
    | "alert"
    | "system";
  title: string;
  message: string;
  timestamp: string;
  link: string;
  unread: boolean;
  severity?: "info" | "success" | "warning" | "error";
};

export async function getResearcherNotifications(
  userId: string,
  researcherId: string | null
): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const notifications: NotificationItem[] = [];

  // 1. Submissions for this researcher
  if (researcherId) {
    try {
      const submissions = await listSubmissionsForResearcher(researcherId);
      for (const sub of submissions.slice(0, 5)) {
        if (sub.status === "approved") {
          notifications.push({
            id: `sub-app-${sub.id}`,
            type: "submission_approved",
            severity: "success",
            title: "Change Request Approved",
            message: `Your update "${sub.title}" was approved by an Administrator and published.`,
            timestamp: sub.reviewed_at || sub.created_at,
            link: "/researcher/submissions",
            unread: true,
          });
        } else if (sub.status === "rejected") {
          notifications.push({
            id: `sub-rej-${sub.id}`,
            type: "submission_rejected",
            severity: "error",
            title: "Change Request Feedback",
            message: sub.admin_notes
              ? `Admin feedback on "${sub.title}": ${sub.admin_notes}`
              : `Your update "${sub.title}" requires revisions before approval.`,
            timestamp: sub.reviewed_at || sub.created_at,
            link: "/researcher/submissions",
            unread: true,
          });
        } else if (sub.status === "pending") {
          notifications.push({
            id: `sub-pend-${sub.id}`,
            type: "submission_pending",
            severity: "warning",
            title: "Submission Under Review",
            message: `"${sub.title}" is queued for institutional evaluation.`,
            timestamp: sub.created_at,
            link: "/researcher/submissions",
            unread: false,
          });
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Recent Messages received from other faculty members
  try {
    const conversations = await listUserConversations(userId);
    for (const conv of conversations) {
      if (conv.latestMessage && conv.latestMessage.senderId !== userId) {
        notifications.push({
          id: `msg-${conv.latestMessage.id}`,
          type: "message",
          severity: "info",
          title: `New Message: ${conv.latestMessage.senderName}`,
          message:
            conv.type === "group"
              ? `[${conv.displayName}] ${conv.latestMessage.content}`
              : conv.latestMessage.content,
          timestamp: conv.latestMessage.createdAt,
          link: `/researcher/messages?conversationId=${conv.id}`,
          unread: true,
        });
      }
    }
  } catch {
    // ignore
  }

  // 3. Institutional Announcements
  try {
    const announcements = await getAnnouncements();
    for (const ann of announcements.slice(0, 2)) {
      notifications.push({
        id: `ann-${ann.id}`,
        type: "announcement",
        severity: "info",
        title: `Institutional Notice: ${ann.title}`,
        message: ann.summary || "Official academic announcement from the Research Office.",
        timestamp: ann.published_at || new Date().toISOString(),
        link: `/announcements/${ann.slug}`,
        unread: false,
      });
    }
  } catch {
    // ignore
  }

  // Sort by timestamp desc
  notifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const unreadCount = notifications.filter((n) => n.unread).length;

  return { notifications, unreadCount };
}

export async function getAdminNotifications(): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  const notifications: NotificationItem[] = [];
  let pendingSubsCount = 0;

  // 1. Pending Submissions requiring Admin decision
  try {
    const allSubs = await listAllSubmissions();
    const pendingSubs = allSubs.filter((s) => s.status === "pending");
    pendingSubsCount = pendingSubs.length;

    for (const sub of pendingSubs) {
      const researcherName = sub.researchers?.name || "Faculty Member";
      notifications.push({
        id: `admin-sub-${sub.id}`,
        type: "submission_pending",
        severity: "warning",
        title: `Submission Awaiting Review: ${sub.title}`,
        message: `Submitted by ${researcherName} (${sub.submission_type.replace(/_/g, " ")}). Needs approval decision.`,
        timestamp: sub.created_at,
        link: "/admin?tab=submissions",
        unread: true,
      });
    }
  } catch {
    // ignore
  }

  // 2. Hub items needing attention
  try {
    const attentionItems = await getNeedsAttentionItems(pendingSubsCount);
    for (const item of attentionItems.slice(0, 4)) {
      // Don't duplicate the pending submissions notification if we already added individual items
      if (item.id === "pending-subs" && pendingSubsCount > 0) continue;

      notifications.push({
        id: `att-${item.id}`,
        type: "alert",
        severity: item.severity === "urgent" ? "error" : item.severity === "warning" ? "warning" : "info",
        title: item.title,
        message: item.description,
        timestamp: new Date().toISOString(),
        link: item.link || "/admin",
        unread: true,
      });
    }
  } catch {
    // ignore
  }

  // 3. Recent Admin Activity Audit
  try {
    const activities = await getRecentAdminActivity();
    for (const act of activities.slice(0, 3)) {
      notifications.push({
        id: `act-${act.id}`,
        type: "system",
        severity: "info",
        title: `Audit: ${act.action.replace(/_/g, " ").toUpperCase()}`,
        message: act.description,
        timestamp: act.created_at,
        link: "/admin",
        unread: false,
      });
    }
  } catch {
    // ignore
  }

  // Sort by timestamp desc
  notifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const unreadCount = notifications.filter((n) => n.unread).length;

  return { notifications, unreadCount };
}
