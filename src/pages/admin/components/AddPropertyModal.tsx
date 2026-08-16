import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, X } from "lucide-react"
import { useState, type FormEvent } from "react"
import { createProperty } from "@/api/properties"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CreatePropertyInput } from "@/types/property"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const initial: CreatePropertyInput = {
  title: "",
  description: "",
  address: "",
  city: "",
  type: "APARTMENT",
  amenities: [],
  latitude: 6.9271,
  longitude: 79.8612,
  imageUrl: "",
  minStay: "1 month",
}

export function AddPropertyModal({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CreatePropertyInput>(initial)
  const [amenitiesText, setAmenitiesText] = useState("")
  const [error, setError] = useState("")

  const mutation = useMutation({
    mutationFn: () =>
      createProperty({
        ...form,
        amenities: amenitiesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      setForm(initial)
      setAmenitiesText("")
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ["myProperties"] })
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : "Could not add property"),
  })

  if (!open) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    mutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add New Property</h2>
          <button
            onClick={() => onOpenChange(false)}
            title="Close"
            className="rounded-full p-1.5 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Title
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1"
              placeholder="e.g. Harbor View"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Description
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Describe the property..."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Address
              <Input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="mt-1"
                placeholder="42 Marine Drive"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              City
              <Input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1"
                placeholder="Colombo 03"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Type
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as CreatePropertyInput["type"],
                  })
                }
                className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none"
              >
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOTEL">Hotel</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Image URL
              <Input
                required
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="mt-1"
                placeholder="https://..."
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Amenities (comma separated)
            <Input
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              className="mt-1"
              placeholder="Wi-Fi, Air Conditioning, Parking"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700">
              Latitude
              <Input
                required
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) =>
                  setForm({ ...form, latitude: Number(e.target.value) })
                }
                className="mt-1"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Longitude
              <Input
                required
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) =>
                  setForm({ ...form, longitude: Number(e.target.value) })
                }
                className="mt-1"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Min Stay
              <Input
                value={form.minStay ?? ""}
                onChange={(e) => setForm({ ...form, minStay: e.target.value })}
                className="mt-1"
                placeholder="1 month"
              />
            </label>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {mutation.isPending ? "Creating..." : "Create Property"}
          </Button>
        </form>
      </div>
    </div>
  )
}