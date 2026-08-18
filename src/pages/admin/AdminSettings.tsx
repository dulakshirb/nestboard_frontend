import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { User } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { api } from "@/api/client"

export function AdminSettings() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()

  const [displayName, setDisplayName] = useState(user?.displayName ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")

  const updateProfile = useMutation({
    mutationFn: (data: { displayName: string; email: string; phone: string }) =>
      api("/users/profile", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateProfile.mutate({ displayName, email, phone })
  }

  return (
    <div className="p-7">
      <div className="mx-auto max-w-[560px] rounded-[18px] border border-gray-100 bg-white p-[28.8px] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-[#eff6ff]">
            <User className="h-[22px] w-[22px] text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-6 text-gray-900">Profile</h2>
            <p className="text-[13px] leading-[19.5px] text-primary">
              Manage your personal information and contact details
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-[28px] space-[18px]">
          <div className="space-y-1.5">
            <label className="text-[13px] leading-[19.5px] text-gray-600">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] leading-[19.5px] text-gray-600">Email Address</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] leading-[19.5px] text-gray-600">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+94 77 123 4567"
              className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="mt-6 flex h-[43px] w-[152px] items-center justify-center rounded-full bg-primary text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}
