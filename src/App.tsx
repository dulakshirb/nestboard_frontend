import { BrowserRouter, Route, Routes, Outlet } from "react-router"
import { useEffect } from "react"
import type { ReactNode } from "react"
import { Home } from "./pages/home/Home"
import { PropertyDetails } from "./pages/property/PropertyDetails"
import { RoomSeats } from "./pages/property/RoomSeats"
import { Navbar, type NavbarLink } from "./components/common/Navbar"
import { MapRoute } from "./components/common/MapRoute"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { SignIn } from "./pages/Auth/SignIn"
import { SignUp } from "./pages/Auth/SignUp"
import { Dashboard } from "./pages/dashboard/Dashboard"
import { MyBookings } from "./pages/bookings/MyBookings"
import { Saved } from "./pages/saved/Saved"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { AdminProtectedRoute } from "./components/auth/AdminProtectedRoute"
import { AdminThemeApplier } from "./components/auth/AdminThemeApplier"
import { useAuthStore } from "@/stores/authStore"
import { AdminLayout } from "./pages/admin/AdminLayout"
import { AdminBookings } from "./pages/admin/AdminBookings"
import { AdminProperties } from "./pages/admin/AdminProperties"
import { AdminProfile } from "./pages/admin/AdminProfile"
import { AdminSettings } from "./pages/admin/AdminSettings"
import { AdminPropertyManage } from "./pages/admin/AdminPropertyManage"
import { Profile } from "./pages/profile/Profile"
import { Settings } from "./pages/settings/Settings"
import { Notifications } from "./pages/notifications/Notifications"

const navLinks: NavbarLink[] = [
  { label: "Explore", to: "/" },
  { label: "My Bookings", to: "/bookings" },
  { label: "Favorites", to: "/saved" },
  { label: "Map View", to: "/map" },
]

function AppLayout() {
  return (
    <>
      <Navbar links={navLinks} />
      <Outlet />
    </>
  )
}

function AuthBootstrap({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate)
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <AdminThemeApplier>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/property-details/:id" element={<PropertyDetails />} />
              <Route
                path="/property-details/:id/room-types/:roomTypeId"
                element={<RoomSeats />}
              />
              <Route path="/map" element={<MapRoute />} />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <Saved />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="properties/:id" element={<AdminPropertyManage />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/sign-in/*" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Routes>
          <ReactQueryDevtools initialIsOpen={false} />
        </AdminThemeApplier>
      </AuthBootstrap>
    </BrowserRouter>
  )
}
export default App