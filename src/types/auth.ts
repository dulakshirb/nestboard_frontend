export type Role = "ADMIN" | "USER"

export type User = {
  id: string
  email: string
  displayName: string
  role: Role
  avatarUrl: string | null
  bioTag: string | null
  createdAt: string | null
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
}

export type AuthStatus = "loading" | "signedOut" | "signedIn"