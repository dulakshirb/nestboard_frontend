import { api } from "./client"
import type { AuthResponse, User } from "@/types/auth"

const ACCESS_KEY = "nestboard.accessToken"

export function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return api<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  })
}

export function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResponse> {
  return api<AuthResponse>("/auth/register", {
    method: "POST",
    body: { email, password, displayName },
    auth: false,
  })
}

export function googleAuth(idToken: string): Promise<AuthResponse> {
  return api<AuthResponse>("/auth/google", {
    method: "POST",
    body: { idToken },
    auth: false,
  })
}

export function fetchMe(): Promise<User> {
  return api<User>("/auth/me")
}

type UpdateProfilePayload = {
  displayName?: string
  bioTag?: string
  avatar?: File
}

export async function updateProfile(
  data: UpdateProfilePayload,
): Promise<User> {
  const formData = new FormData()
  if (data.displayName !== undefined) formData.append("displayName", data.displayName)
  if (data.bioTag !== undefined) formData.append("bioTag", data.bioTag)
  if (data.avatar) formData.append("avatar", data.avatar)

  const token = localStorage.getItem(ACCESS_KEY)
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch("/api/users/profile", {
    method: "PATCH",
    headers,
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const msg = body?.error?.message ?? res.statusText
    throw new Error(msg)
  }

  return res.json() as Promise<User>
}
