import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Camera, Loader2, X } from "lucide-react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { updateProperty } from "@/api/properties"
import { uploadFile } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePropertyDetail } from "@/hooks/usePropertyDetail"
import type { CreatePropertyInput, PropertyDetail } from "@/types/property"

type Props = {
  propertyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPropertyModal({ propertyId, open, onOpenChange }: Props) {
  const { data: property, isLoading } = usePropertyDetail(
    open ? propertyId : undefined,
  )

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onOpenChange])

  if (!open) return null

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={handleBackdrop}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit Property</h2>
          <button
            onClick={() => onOpenChange(false)}
            title="Close"
            className="rounded-full p-1.5 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {isLoading && !property ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Loading property...</p>
          </div>
        ) : property ? (
          <EditPropertyForm
            key={property.id}
            property={property}
            propertyId={propertyId}
            onDone={() => onOpenChange(false)}
          />
        ) : (
          <p className="mt-10 text-center text-sm text-red-600">
            Could not load property details.
          </p>
        )}
      </div>
    </div>
  )
}

function EditPropertyForm({
  property,
  propertyId,
  onDone,
}: {
  property: PropertyDetail
  propertyId: string
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CreatePropertyInput>({
    title: property.title,
    description: property.description,
    address: property.address,
    city: property.city,
    type: property.type as CreatePropertyInput["type"],
    amenities: property.amenities,
    latitude: property.latitude,
    longitude: property.longitude,
    imageUrl: property.imageUrl,
    minStay: property.minStay,
  })
  const [amenitiesText, setAmenitiesText] = useState(property.amenities.join(", "))
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string | null>(null)

  const setPreviewUrl = (url: string | null) => {
    if (previewRef.current && previewRef.current !== url) {
      URL.revokeObjectURL(previewRef.current)
    }
    previewRef.current = url
    setPreview(url)
  }

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  const mutation = useMutation({
    mutationFn: () =>
      updateProperty(propertyId, {
        ...form,
        amenities: amenitiesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      onDone()
      void queryClient.invalidateQueries({ queryKey: ["property", propertyId] })
      void queryClient.invalidateQueries({ queryKey: ["myProperties"] })
      void queryClient.invalidateQueries({ queryKey: ["properties"] })
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : "Could not update property"),
  })

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
      setPreviewUrl(URL.createObjectURL(file))
      const { url } = await uploadFile(file)
      setForm((prev) => ({ ...prev, imageUrl: url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed")
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  return (
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
          <Input
            type="url"
            value={form.imageUrl}
            onChange={(e) => {
              setForm({ ...form, imageUrl: e.target.value.trim() })
              setPreviewUrl(null)
            }}
            className="mt-1"
            placeholder="https://example.com/image.jpg"
          />
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
            className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 hover:bg-gray-100"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {uploading ? "Uploading..." : "Upload instead"}
          </button>
          {(preview ?? form.imageUrl) && (
            <img
              src={preview ?? form.imageUrl}
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

      <Button type="submit" disabled={mutation.isPending || uploading} className="w-full">
        {(mutation.isPending || uploading) && <Loader2 className="animate-spin" />}
        {mutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}