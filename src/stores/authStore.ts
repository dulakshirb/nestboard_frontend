import { create } from "zustand"
import { fetchMe, googleAuth, login, register } from "@/api/auth"
import { clearTokens } from "@/api/client"
import type { AuthStatus, User } from "@/types/auth"

const ACCESS_KEY = "nestboard.accessToken"
const REFRESH_KEY = "nestboard.refreshToken"

type AuthState = {
  user: User | null
  status: AuthStatus
  hydrate: () => Promise<void>
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string, displayName?: string) => Promise<User>
  signInWithGoogle: (idToken: string) => Promise<User>
  signOut: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",

  hydrate: async () => {
    if (!localStorage.getItem(ACCESS_KEY)) {
      set({ user: null, status: "signedOut" })
      return
    }
    try {
      const user = await fetchMe()
      set({ user, status: "signedIn" })
    } catch {
      clearTokens()
      set({ user: null, status: "signedOut" })
    }
  },

  signIn: async (email, password) => {
    const res = await login(email, password)
    localStorage.setItem(ACCESS_KEY, res.accessToken)
    localStorage.setItem(REFRESH_KEY, res.refreshToken)
    const user = await fetchMe()
    set({ user, status: "signedIn" })
    return user
  },

  signUp: async (email, password, displayName) => {
    const res = await register(email, password, displayName)
    localStorage.setItem(ACCESS_KEY, res.accessToken)
    localStorage.setItem(REFRESH_KEY, res.refreshToken)
    const user = await fetchMe()
    set({ user, status: "signedIn" })
    return user
  },

  signInWithGoogle: async (idToken) => {
    const res = await googleAuth(idToken)
    localStorage.setItem(ACCESS_KEY, res.accessToken)
    localStorage.setItem(REFRESH_KEY, res.refreshToken)
    const user = await fetchMe()
    set({ user, status: "signedIn" })
    return user
  },

  signOut: () => {
    clearTokens()
    set({ user: null, status: "signedOut" })
  },

  setUser: (user) => set({ user }),
}))