import type { User } from "@/types/auth"
import { api } from "./client"

export function updateProfile(data: {
  displayName?: string
  bioTag?: string
}): Promise<User> {
  return api<User>("/users/profile", { method: "PATCH", body: data })
}