import { useRef, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCheck, CalendarCheck, XCircle, Clock } from "lucide-react"
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "@/api/notifications"
import type { NotificationType } from "@/types/notification"

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  BOOKING_RECEIVED: { icon: Bell, color: "text-blue-600", bg: "bg-blue-50" },
  BOOKING_CONFIRMED: { icon: CalendarCheck, color: "text-green-600", bg: "bg-green-50" },
  BOOKING_CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  BOOKING_EXPIRED: { icon: Clock, color: "text-gray-500", bg: "bg-gray-100" },
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

type Props = {
  open: boolean
  onClose: () => void
}

export function AdminNotificationPopover({ open, onClose }: Props) {
  const queryClient = useQueryClient()
  const panelRef = useRef<HTMLDivElement>(null)

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: open,
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

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-7 top-[66.3px] z-50 w-[400px] max-h-[520px] rounded-2xl border border-gray-100 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(520px - 56px)" }}>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-100 p-3">
                  <div className="flex gap-3">
                    <div className="size-8 shrink-0 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-gray-200" />
                      <div className="h-2.5 w-1/4 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Bell className="mx-auto mb-2 size-8 text-gray-300" />
              <p className="text-sm text-gray-400">No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.slice(0, 20).map((n) => {
                const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.BOOKING_EXPIRED
                const Icon = config.icon
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.read) markRead.mutate(n.id)
                    }}
                    className={`w-full text-left px-5 py-3 transition-colors ${
                      n.read
                        ? "bg-white hover:bg-gray-50/50"
                        : "bg-primary/5 hover:bg-primary/10"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                      >
                        <Icon className={`size-4 ${config.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] leading-[19.5px] text-gray-900">{n.message}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="text-[11px] text-gray-400">{timeAgo(n.createdAt)}</span>
                          {n.property && (
                            <span className="text-[11px] text-gray-400">· {n.property.title}</span>
                          )}
                        </div>
                      </div>
                      {!n.read && (
                        <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
