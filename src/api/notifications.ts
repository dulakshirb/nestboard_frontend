import { api } from "./client"
import type { Notification } from "@/types/notification"

export function fetchNotifications(): Promise<Notification[]> {
  return api<Notification[]>("/notifications")
}

export function fetchUnreadCount(): Promise<number> {
  return api<number>("/notifications/unread-count")
}

export function markNotificationRead(id: string): Promise<Notification> {
  return api<Notification>(`/notifications/${id}/read`, { method: "PATCH" })
}

export function markAllNotificationsRead(): Promise<{ count: number }> {
  return api<{ count: number }>("/notifications/read-all", { method: "PATCH" })
}
