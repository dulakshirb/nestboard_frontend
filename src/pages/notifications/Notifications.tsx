import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/api/notifications"
import { Bell, CheckCheck, CalendarCheck, XCircle, Clock } from "lucide-react"
import type { NotificationType } from "@/types/notification"

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  BOOKING_RECEIVED: {
    icon: Bell,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  BOOKING_CONFIRMED: {
    icon: CalendarCheck,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  BOOKING_CANCELLED: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  BOOKING_EXPIRED: {
    icon: Clock,
    color: "text-gray-500",
    bg: "bg-gray-100",
  },
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  )
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function Notifications() {
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: fetchUnreadCount,
  })

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] })
    },
  })

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] })
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-28 pb-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
            >
              <CheckCheck className="size-4" />
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5"
              >
                <div className="flex gap-3">
                  <div className="size-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/4 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <Bell className="mx-auto mb-3 size-10 text-gray-300" />
            <p className="text-sm text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.BOOKING_EXPIRED
              const Icon = config.icon
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markRead.mutate(n.id)
                  }}
                  className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                    n.read
                      ? "border-gray-100 bg-white hover:bg-gray-50/50"
                      : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                    >
                      <Icon className={`size-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{n.message}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {timeAgo(n.createdAt)}
                        </span>
                        {n.property && (
                          <span className="text-xs text-gray-400">
                            · {n.property.title}
                          </span>
                        )}
                      </div>
                    </div>
                    {!n.read && (
                      <div className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
