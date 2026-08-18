import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/authStore"
import { updateProfile } from "@/api/auth"
import { Link } from "react-router"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Save,
  Lock,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Moon,
  HelpCircle,
  MessageCircle,
  FileText,
  ChevronRight,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  CreditCardIcon,
} from "lucide-react"

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  )
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="size-5 text-gray-800" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function FieldLabel({
  children,
  icon,
}: {
  children: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-600">
      {icon && <icon className="size-4 text-gray-500" />}
      {children}
    </label>
  )
}

export function Settings() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  const [displayName, setDisplayName] = useState(user?.displayName ?? "")
  const [bioTag, setBioTag] = useState(user?.bioTag ?? "")
  const [phone, setPhone] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [bookingUpdates, setBookingUpdates] = useState(true)
  const [promotions, setPromotions] = useState(false)

  const [language, setLanguage] = useState("en")
  const [currency, setCurrency] = useState("LKR")
  const [darkMode, setDarkMode] = useState(false)

  const profileMutation = useMutation({
    mutationFn: () =>
      updateProfile({
        displayName: displayName || undefined,
        bioTag: bioTag !== undefined ? bioTag : undefined,
      }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })

  function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault()
    profileMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-28 pb-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/profile"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Profile
        </Link>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>

        <div className="mt-6 space-y-6">
          {/* Account Information */}
          <SectionCard title="Account Information" icon={User}>
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-[10px] border border-gray-200 px-4 py-2 text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <FieldLabel icon={Mail}>Email Address</FieldLabel>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500"
                />
              </div>
              <div>
                <FieldLabel icon={Phone}>Phone Number</FieldLabel>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full rounded-[10px] border border-gray-200 px-4 py-2 text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <FieldLabel>Bio</FieldLabel>
                <textarea
                  rows={4}
                  value={bioTag ?? ""}
                  onChange={(e) => setBioTag(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full resize-none rounded-[10px] border border-gray-200 px-4 py-2 text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={profileMutation.isPending}
                className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/80 disabled:opacity-50"
              >
                <Save className="size-4" />
                {profileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
              {profileMutation.isSuccess && (
                <span className="ml-3 text-sm text-green-600">
                  Profile updated
                </span>
              )}
            </form>
          </SectionCard>

          {/* Security */}
          <SectionCard title="Security" icon={Lock}>
            <div className="space-y-4">
              <div>
                <FieldLabel icon={Lock}>Password</FieldLabel>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-[10px] border border-gray-200 px-4 py-2 text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPw ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-[10px] bg-gray-100 px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Two-Factor Authentication
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-[10px] bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/80"
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title="Notifications" icon={Bell}>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive updates via email
                  </p>
                </div>
                <Toggle
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    SMS Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive text message alerts
                  </p>
                </div>
                <Toggle
                  checked={smsNotifications}
                  onChange={setSmsNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Push Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive push notifications in app
                  </p>
                </div>
                <Toggle
                  checked={pushNotifications}
                  onChange={setPushNotifications}
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">
                      Booking Updates
                    </span>
                    <Toggle
                      checked={bookingUpdates}
                      onChange={setBookingUpdates}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">
                      Promotions & Offers
                    </span>
                    <Toggle checked={promotions} onChange={setPromotions} />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Payment Methods */}
          <SectionCard title="Payment Methods" icon={CreditCard}>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[10px] border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-[10px] bg-primary">
                    <CreditCardIcon className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      •••• •••• •••• 4242
                    </p>
                    <p className="text-sm text-gray-500">Expires 12/25</p>
                  </div>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Default
                </span>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
              >
                <Plus className="size-4" />
                Add New Payment Method
              </button>
            </div>
          </SectionCard>

          {/* Preferences */}
          <SectionCard title="Preferences" icon={Globe}>
            <div className="space-y-4">
              <div>
                <FieldLabel icon={Globe}>Language</FieldLabel>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-[10px] border border-gray-200 px-4 py-2 text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="en">English</option>
                  <option value="si">Sinhala</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
              <div>
                <FieldLabel>Currency</FieldLabel>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-[10px] border border-gray-200 px-4 py-2 text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="LKR">LKR - Sri Lankan Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="size-5 text-gray-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dark Mode
                    </h3>
                    <p className="text-sm text-gray-500">Enable dark theme</p>
                  </div>
                </div>
                <Toggle checked={darkMode} onChange={setDarkMode} />
              </div>
            </div>
          </SectionCard>

          {/* Help & Support */}
          <SectionCard title="Help & Support" icon={HelpCircle}>
            <div className="space-y-3">
              {[
                { label: "Help Center", icon: HelpCircle },
                { label: "Contact Support", icon: MessageCircle },
                { label: "Terms of Service", icon: FileText },
                { label: "Privacy Policy", icon: FileText },
              ].map(({ label, icon: ItemIcon }) => (
                <button
                  key={label}
                  type="button"
                  className="flex w-full items-center justify-between rounded-[10px] px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="text-base font-medium text-gray-900">
                    {label}
                  </span>
                  <ChevronRight className="size-5 text-gray-400" />
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Danger Zone */}
          <div className="rounded-2xl border-2 border-red-200 bg-white p-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-600" />
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                className="w-full rounded-[10px] bg-red-50 px-4 py-3 text-left text-base font-semibold text-red-600 transition-colors hover:bg-red-100"
              >
                Deactivate Account
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-[10px] bg-red-600 px-4 py-3 text-left text-base font-semibold text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="size-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
