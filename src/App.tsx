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
import { Dashboard } from "./pages/dashboard/Dashboard"
import { MyBookings } from "./pages/bookings/MyBookings"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { AdminProtectedRoute } from "./components/auth/AdminProtectedRoute"
import { AdminThemeApplier } from "./components/auth/AdminThemeApplier"
import { useAuthStore } from "@/stores/authStore"

const navLinks: NavbarLink[] = [
  { label: "Explore", to: "/" },
  { label: "Map View", to: "/map" },
  { label: "Bookings", to: "/bookings" },
  { label: "Dashboard", to: "/dashboard" },
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
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />
            </Route>
            <Route path="/sign-in/*" element={<SignIn />} />
          </Routes>
          <ReactQueryDevtools initialIsOpen={false} />
        </AdminThemeApplier>
      </AuthBootstrap>
    </BrowserRouter>
  )
}
export default App