import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query"
import { MapPin, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import { fetchRoomTypes, setPropertyActive } from "@/api/properties"
import { Button } from "@/components/ui/button"
import { useMyProperties } from "@/hooks/useMyProperties"
import { AddPropertyModal } from "./components/AddPropertyModal"
import { StatusPill } from "./components/StatusPill"

export function AdminProperties() {
  const queryClient = useQueryClient()
  const { data: properties, isLoading, isError } = useMyProperties()
  const [modalOpen, setModalOpen] = useState(false)

  const propertyIds = useMemo(
    () => properties?.map((p) => p.id) ?? [],
    [properties],
  )

  const roomTypeQueries = useQueries({
    queries: propertyIds.map((id) => ({
      queryKey: ["adminRoomTypes", id],
      queryFn: () => fetchRoomTypes(id),
      enabled: propertyIds.length > 0,
      staleTime: 60_000,
    })),
  })

  const stats = useMemo(
    () =>
      propertyIds.map((id, i) => {
        const rts = roomTypeQueries[i]?.data ?? []
        const seats = rts.reduce((s, rt) => s + rt.seatCapacity, 0)
        const free = rts.reduce((s, rt) => s + rt.freeSeats, 0)
        return {
          rooms: rts.reduce((s, rt) => s + rt.roomsCount, 0),
          occupancy: seats > 0 ? Math.round(((seats - free) / seats) * 100) : 0,
        }
      }),
    [propertyIds, roomTypeQueries],
  )

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setPropertyActive(id, isActive),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["myProperties"] }),
  })

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            {properties?.length ?? 0} properties in total
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus />
          Add Property
        </Button>
      </div>

      {isError && (
        <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load properties. Check that the API is running.
        </p>
      )}

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="h-40 rounded-xl bg-gray-100" />
              <div className="mt-4 h-4 w-2/3 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {(properties ?? []).map((p, i) => {
            const s = stats[i] ?? { rooms: 0, occupancy: 0 }
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <img src={p.image} alt={p.title} className="h-40 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    <StatusPill status={p.isActive ? "Active" : "Inactive"} />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-600">{s.rooms} Rooms</span>
                    <span className="font-semibold text-gray-900">{s.occupancy}% Occupied</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${s.occupancy}%` }}
                    />
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      disabled={toggle.isPending}
                      onClick={() => toggle.mutate({ id: p.id, isActive: !p.isActive })}
                    >
                      {p.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link to={`/property-details/${p.id}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AddPropertyModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}