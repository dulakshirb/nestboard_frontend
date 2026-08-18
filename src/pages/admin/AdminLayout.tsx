import { useState, useCallback } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router"
import { Building2, CalendarCheck, LayoutDashboard, LogOut, Settings, Bell } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { useQuery } from "@tanstack/react-query"
import { fetchUnreadCount } from "@/api/notifications"
import { AdminNotificationPopover } from "./components/AdminNotificationPopover"

const items = [
  { label: "Dashboard", to: "/admin", end: true, icon: LayoutDashboard },
  { label: "Properties", to: "/admin/properties", end: false, icon: Building2 },
  { label: "Bookings", to: "/admin/bookings", end: false, icon: CalendarCheck },
  { label: "Settings", to: "/admin/settings", end: false, icon: Settings },
]

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/properties": "Properties",
  "/admin/bookings": "Bookings",
  "/admin/settings": "Settings",
}

export function AdminLayout() {
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const navigate = useNavigate()
  const location = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: fetchUnreadCount,
  })

  const basePath = "/" + (location.pathname.split("/")[1] ?? "") + "/" + (location.pathname.split("/")[2] ?? "")
  const title = PAGE_TITLES[location.pathname] ?? PAGE_TITLES[basePath] ?? "Dashboard"

  const closeNotif = useCallback(() => setNotifOpen(false), [])

  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      <aside className="hidden w-[270px] shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-[76.8px] items-center gap-[10px] border-b border-gray-100 pl-[22px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-100">
            <Building2 className="h-[18px] w-[18px] text-primary" />
          </div>
          <span className="text-lg font-bold text-gray-900">NestBoard</span>
        </div>

        <nav className="flex flex-col gap-[2px] px-[10px] pt-[14px]">
          {items.map(({ label, to, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex h-[43px] items-center gap-3 rounded-[10px] pl-[14px] text-sm font-normal transition-colors",
                  isActive
                    ? "bg-[#eff6ff] font-bold text-primary"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-gray-100 px-4 py-4">
          <div className="flex items-center gap-[10px]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {user ? initials(user.displayName) : "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold leading-[19.5px] text-gray-900">
                {user?.displayName ?? "Admin"}
              </p>
              <p className="text-[11px] leading-[16.5px] text-gray-400">Property Owner</p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:text-gray-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[66.3px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-7">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold leading-[30px] text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex h-5 w-5 items-center justify-center text-gray-500 transition-colors hover:text-gray-700"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 left-[13px] size-[7px] rounded-full bg-red-400" />
              )}
            </button>
            <button
              onClick={() => navigate("/admin/properties")}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-primary/90"
            >
              <span className="text-lg leading-none">+</span>
              Add Property
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <AdminNotificationPopover open={notifOpen} onClose={closeNotif} />
    </div>
  )
}
