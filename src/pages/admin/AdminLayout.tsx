import { NavLink, Outlet } from "react-router"
import { Building2, CalendarCheck, LayoutDashboard, User } from "lucide-react"

const items = [
  { label: "Dashboard", to: "/admin", end: true, icon: LayoutDashboard },
  { label: "Bookings", to: "/admin/bookings", end: false, icon: CalendarCheck },
  { label: "Properties", to: "/admin/properties", end: false, icon: Building2 },
  { label: "Profile", to: "/admin/profile", end: false, icon: User },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
    isActive
      ? "bg-primary text-white"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  ].join(" ")

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-28 pb-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
          {items.map(({ label, to, end, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} className={navClass}>
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <nav className="flex flex-col gap-1 rounded-2xl bg-white p-3 shadow-sm">
              {items.map(({ label, to, end, icon: Icon }) => (
                <NavLink key={to} to={to} end={end} className={navClass}>
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}