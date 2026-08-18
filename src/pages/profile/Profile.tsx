import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/authStore"
import { updateProfile } from "@/api/auth"
import { fetchFavorites } from "@/api/properties"
import { useMyBookings } from "@/hooks/useMyBookings"
import { Link, useNavigate } from "react-router"
import {
  Camera,
  Mail,
  Calendar,
  Settings,
  LogOut,
  HelpCircle,
  ChevronRight,
  Heart,
  Home,
} from "lucide-react"

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })
}

function daysBetween(a: string, b: string): number {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime())
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function Profile() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName ?? "")
  const [bioTag, setBioTag] = useState(user?.bioTag ?? "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const { data: bookings = [] } = useMyBookings()
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: !!user,
  })

  const totalBookings = bookings.length

  const profileMutation = useMutation({
    mutationFn: () =>
      updateProfile({
        displayName: displayName || undefined,
        bioTag: bioTag !== undefined ? bioTag : undefined,
        avatar: avatarFile ?? undefined,
      }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setAvatarFile(null)
      setAvatarPreview(null)
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    profileMutation.mutate()
  }

  function handleSignOut() {
    signOut()
    navigate("/")
  }

  const totalFavorites = favorites.length
  const daysStayed = bookings.reduce((sum, b) => {
    if (b.bookingStatus === "CONFIRMED") {
      return sum + daysBetween(b.leaseStart, b.leaseEnd)
    }
    return sum
  }, 0)

  const avatarSrc = avatarPreview ?? user?.avatarUrl ?? null

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-28 pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: main content */}
          <div className="flex-1 space-y-8">
            {/* Profile Header */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                <div className="relative mb-4 sm:mb-0 sm:mr-6">
                  <div className="flex size-24 items-center justify-center rounded-full bg-[#F7C948] text-3xl font-bold text-white">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="size-24 rounded-full object-cover"
                      />
                    ) : (
                      initials(user?.displayName ?? "U")
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute right-0 bottom-0 flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md transition-colors hover:bg-primary/80"
                  >
                    <Camera className="size-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>

                <div className="flex-1">
                  {editing ? (
                    <form onSubmit={handleSave} className="space-y-3">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-lg font-semibold text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                      <textarea
                        rows={2}
                        value={bioTag ?? ""}
                        onChange={(e) => setBioTag(e.target.value)}
                        placeholder="Bio tagline..."
                        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-gray-400"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={profileMutation.isPending}
                          className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
                        >
                          {profileMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(false)
                            setDisplayName(user?.displayName ?? "")
                            setBioTag(user?.bioTag ?? "")
                            setAvatarFile(null)
                            setAvatarPreview(null)
                          }}
                          className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                      {profileMutation.isSuccess && (
                        <p className="text-sm text-green-600">Profile updated</p>
                      )}
                    </form>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user?.displayName || "User"}
                      </h1>
                      {user?.bioTag && (
                        <p className="mt-0.5 text-sm text-gray-500">{user.bioTag}</p>
                      )}
                      <div className="mt-3 flex flex-col gap-1.5 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                          <Mail className="size-4 text-gray-400" />
                          {user?.email}
                        </span>
                        {user?.createdAt && (
                          <span className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-400" />
                            Joined {formatMonthYear(user.createdAt)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setEditing(true)}
                        className="mt-4 rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Edit Profile
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Current Bookings */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Current Bookings ({totalBookings})
                </h2>
              </div>

              {totalBookings > 0 ? (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:flex-row"
                    >
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold text-gray-900">
                              {b.room.roomType.property.title}
                            </h3>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {b.room.roomType.name} ·{ " "}
                              {b.room.roomLabel}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              b.bookingStatus === "CONFIRMED"
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {b.bookingStatus === "CONFIRMED" ? "Active" : "Pending"}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDate(b.leaseStart)} –{" "}
                            {formatDate(b.leaseEnd)}
                          </span>
                          <span>
                            {b.durationMonths} month
                            {b.durationMonths !== 1 ? "s" : ""}
                          </span>
                          <span className="font-medium text-gray-700">
                            LKR{" "}
                            {Number(b.totalAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                  <Home className="mx-auto mb-3 size-10 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    No bookings yet.{" "}
                    <Link to="/" className="font-medium text-primary hover:underline">
                      Browse properties
                    </Link>
                  </p>
                </div>
              )}
            </section>

            {/* Favorite Properties */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Favorite Properties ({totalFavorites})
                </h2>
                {totalFavorites > 0 && (
                  <Link
                    to="/saved"
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View All Favorites
                    <ChevronRight className="size-4" />
                  </Link>
                )}
              </div>

              {totalFavorites > 0 ? (
                <div className="space-y-3">
                  {favorites.slice(0, 3).map((property) => (
                    <Link
                      key={property.id}
                      to={`/property-details/${property.id}`}
                      className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <img
                        src={property.image}
                        alt={property.title}
                        className="size-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900">
                          {property.title}
                        </h3>
                        <p className="text-xs text-gray-500">{property.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {property.price}
                        </p>
                        <p className="text-[11px] text-gray-400">/Month</p>
                      </div>
                      <ChevronRight className="size-4 text-gray-300" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                  <Heart className="mx-auto mb-3 size-10 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    No favorites yet. Tap the heart icon on any property to save
                    it.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right: sidebar */}
          <div className="w-full shrink-0 space-y-6 lg:w-72">
            {/* Quick Stats */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[#FEF3E2] px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    Total Bookings
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#F7C948] text-sm font-bold text-white">
                    {totalBookings}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    Favorites
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                    {totalFavorites}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    Days Stayed
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                    {daysStayed}
                  </span>
                </div>
              </div>
            </div>

            {/* Account */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Account
              </h3>
              <div className="space-y-1">
                <Link
                  to="/settings"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Settings className="size-4 text-gray-400" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setEditing(true)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Camera className="size-4 text-gray-400" />
                  Edit Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </div>
            </div>

            {/* Need Help */}
            <div className="rounded-2xl bg-[#EA580C] p-5 text-white">
              <div className="mb-2 flex items-center gap-2">
                <HelpCircle className="size-5" />
                <h3 className="text-base font-semibold">Need Help?</h3>
              </div>
              <p className="mb-4 text-sm text-white/80">
                Have questions about your booking or our services? We're here to
                help.
              </p>
              <button className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#EA580C] transition-colors hover:bg-white/90">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
