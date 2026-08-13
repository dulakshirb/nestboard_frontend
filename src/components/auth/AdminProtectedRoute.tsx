import { Navigate } from "react-router"
import type { ReactNode } from "react"
import { useAuthStore } from "@/stores/authStore"

type AdminProtectedRouteProps = {
  children: ReactNode
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const status = useAuthStore((state) => state.status)
  const role = useAuthStore((state) => state.user?.role)

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (status !== "signedIn") {
    return <Navigate to="/sign-in" replace />
  }

  if (role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}