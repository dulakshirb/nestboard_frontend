import { Building2, Heart, LogOut, Menu, Bell, X } from "lucide-react"
import { useState } from "react"
import { NavLink, useNavigate } from "react-router"
import { useAuthStore } from "@/stores/authStore"
import { useQuery } from "@tanstack/react-query"
import { fetchUnreadCount } from "@/api/notifications"

export type NavbarLink = {
  label: string
  to: string
}

type NavbarProps = {
  links: NavbarLink[]
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function Navbar({ links }: NavbarProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const signOut = useAuthStore((state) => state.signOut)
  const isSignedIn = status === "signedIn"
  const isAdmin = user?.role === "ADMIN"

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: fetchUnreadCount,
    enabled: isSignedIn,
    refetchInterval: 30000,
  })

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "text-md rounded-full px-4 py-1.5 transition-all duration-200",
      isActive
        ? "bg-primary text-white"
        : "text-white/70 hover:bg-white/10 hover:text-white",
    ].join(" ")

  function closeMenu() {
    setOpen(false)
  }

  return (
    <div className="absolute top-0 right-0 left-0 z-50 px-4 pt-4">
      <nav
        className={`flex items-center justify-between rounded-full px-5 py-3 ${isAdmin ? "bg-blue-500/50" : "bg-primary/50"
          }`}
      >
        {/* Logo */}
        <NavLink to="/" onClick={closeMenu}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg tracking-wide text-white">NestBoard</span>
          </div>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map(({ label, to }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          <button
            onClick={() => navigate("/saved")}
            className="hidden rounded-full p-2 transition-colors hover:bg-white/10 sm:block"
          >
            <Heart className="h-5 w-5 text-white/70 hover:text-white" />
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="relative hidden rounded-full p-2 transition-colors hover:bg-white/10 sm:block"
          >
            <Bell className="h-5 w-5 text-white/70 hover:text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {!isSignedIn ? (
            <NavLink
              to="/sign-in"
              className="text-md rounded-full bg-white px-4 py-1.5 text-gray-800 transition-colors hover:bg-white/90"
            >
              Sign in
            </NavLink>
          ) : (
            <>
              <button
                onClick={() => navigate("/profile")}
                title="Profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7C948] text-sm font-semibold text-white"
              >
                {user ? initials(user.displayName) : "?"}
              </button>
              <button
                onClick={signOut}
                title="Sign out"
                className="rounded-full p-2 transition-colors hover:bg-white/10"
              >
                <LogOut className="h-5 w-5 text-white/70 hover:text-white" />
              </button>
            </>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            title="Menu"
            className="rounded-full p-2 transition-colors hover:bg-white/10 md:hidden"
          >
            {open ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="mt-2 rounded-2xl bg-white p-2 shadow-lg md:hidden">
          {links.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) =>
                [
                  "block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}
          {isSignedIn && (
            <NavLink
              to="/profile"
              onClick={closeMenu}
              className={({ isActive }) =>
                [
                  "block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")
              }
            >
              Profile
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={closeMenu}
              className={({ isActive }) =>
                [
                  "block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")
              }
            >
              Admin
            </NavLink>
          )}
        </div>
      )}
    </div>
  )
}