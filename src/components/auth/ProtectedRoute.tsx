import { Navigate } from "react-router"
import type { ReactNode } from "react"
import { useAuthStore } from "@/stores/authStore"

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const status = useAuthStore((state) => state.status)

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

  return <>{children}</>
}