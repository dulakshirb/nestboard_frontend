import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Camera, Loader2, X } from "lucide-react"
import { useRef, useState, useEffect, type FormEvent } from "react"
import { createProperty } from "@/api/properties"
import { uploadFile } from "@/api/client"
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
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onOpenChange])

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
      setPreview(null)
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ["myProperties"] })
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : "Could not add property"),
  })

  if (!open) return null

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onOpenChange(false)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    mutation.mutate()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setUploading(true)
    try {
      setPreview(URL.createObjectURL(file))
      const { url } = await uploadFile(file)
      setForm((prev) => ({ ...prev, imageUrl: url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed")
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={handleBackdrop}>
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
            <div className="block text-sm font-medium text-gray-700">
              Cover Image
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 hover:bg-gray-100"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {uploading ? "Uploading..." : preview ? "Change image" : "Pick an image"}
              </button>
              {preview && form.imageUrl && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2 h-32 w-full rounded-md object-cover"
                />
              )}
            </div>
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

          <Button type="submit" disabled={mutation.isPending || uploading || !form.imageUrl} className="w-full">
            {(mutation.isPending || uploading) && <Loader2 className="animate-spin" />}
            {mutation.isPending ? "Creating..." : "Create Property"}
          </Button>
        </form>
      </div>
    </div>
  )
}
