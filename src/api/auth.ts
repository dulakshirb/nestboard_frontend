import { api } from "./client"
import type { AuthResponse, User } from "@/types/auth"

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

export function fetchMe(): Promise<User> {
  return api<User>("/auth/me")
}