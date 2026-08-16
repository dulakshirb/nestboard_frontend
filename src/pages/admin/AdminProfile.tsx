import { useState, type FormEvent } from "react"
import { updateProfile } from "@/api/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/stores/authStore"

export function AdminProfile() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [displayName, setDisplayName] = useState(user?.displayName ?? "")
  const [bioTag, setBioTag] = useState(user?.bioTag ?? "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    setError("")
    try {
      const updated = await updateProfile({ displayName, bioTag })
      setUser(updated)
      setMessage("Profile updated.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Update your public profile information.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Full Name
          <Input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1"
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Email (read-only)
          <Input value={user?.email ?? ""} disabled className="mt-1" />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Bio
          <textarea
            value={bioTag}
            onChange={(e) => setBioTag(e.target.value)}
            rows={4}
            maxLength={500}
            className="mt-1 w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Tell tenants a bit about yourself..."
          />
        </label>

        {message && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}