import { supabase } from "@/lib/supabase";
import { NotificationItem } from "@/types";

type NotificationType = NotificationItem["type"];

type AppNotificationPayload = {
  authUserId: string;
  title: string;
  body: string;
  type: NotificationType;
  sourceTable?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
};

function mapNotification(row: any): NotificationItem {
  return {
    id: row.id,
    title: row.title ?? "Update",
    body: row.body ?? "",
    type: (row.type ?? "system") as NotificationType,
    createdAt: row.created_at ?? new Date().toISOString(),
    read: row.read ?? false,
  };
}

export async function loadAppNotifications(authUserId: string) {
  const { data, error } = await supabase
    .from("app_notifications")
    .select("*")
    .eq("auth_user_id", authUserId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { data: [] as NotificationItem[], error };
  }

  return {
    data: (data ?? []).map(mapNotification),
    error: null,
  };
}

export async function createAppNotification(payload: AppNotificationPayload) {
  const { error } = await supabase.from("app_notifications").insert({
    auth_user_id: payload.authUserId,
    title: payload.title,
    body: payload.body,
    type: payload.type,
    read: false,
    source_table: payload.sourceTable ?? null,
    source_id: payload.sourceId ?? null,
    metadata: payload.metadata ?? {},
  });

  return { error };
}

export async function markAllAppNotificationsRead(authUserId: string) {
  const { error } = await supabase
    .from("app_notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("auth_user_id", authUserId)
    .eq("read", false);

  return { error };
}
