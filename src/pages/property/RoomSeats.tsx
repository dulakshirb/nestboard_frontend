import { useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetchRoomTypeDetail } from "@/api/properties"
import { useAuthStore } from "@/stores/authStore"
import { usePropertyDetail } from "@/hooks/usePropertyDetail"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookingModal } from "./components/BookingModal"

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

type SelectedSeat = {
  roomId: string
  roomName: string
  seatNumber: number
}

export function RoomSeats() {
  const { id, roomTypeId } = useParams<{ id: string; roomTypeId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const [selected, setSelected] = useState<SelectedSeat | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: property } = usePropertyDetail(id)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["roomTypeDetail", id, roomTypeId],
    queryFn: () => fetchRoomTypeDetail(id!, roomTypeId!),
    enabled: !!id && !!roomTypeId,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading rooms...</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Room type not found</p>
      </div>
    )
  }

  function handleBook() {
    if (!selected) return
    if (status !== "signedIn") {
      navigate(`/sign-in?redirect=${encodeURIComponent(location.pathname)}`)
      return
    }
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-28 pb-12">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(`/property-details/${id}`)}
          className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
        >
          <ArrowLeft className="size-4" />
          Back to property
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {property?.title ?? data.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {data.name} · LKR {data.pricePerMonth} / seat / month ·{" "}
            {data.hasAC ? "AC" : "Non-AC"}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {data.rooms.map((room) => {
            const takenSeats = room.booking.filter(
              (seat) => seat.tenant !== ""
            )
            return (
              <Card
                key={room.roomId}
                className="gap-0 rounded-3xl p-6 shadow-sm ring-0"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    {room.roomName}
                  </h2>
                  <Badge
                    variant="outline"
                    className="rounded-full text-xs text-gray-500"
                  >
                    {data.maxSeatsCount} seats
                  </Badge>
                </div>

                <div className="grid grid-cols-5 gap-3 sm:grid-cols-8">
                  {room.booking.map((seat) => {
                    const taken = seat.tenant !== ""
                    const isSelected =
                      selected?.roomId === room.roomId &&
                      selected.seatNumber === seat.seatIndex
                    return (
                      <button
                        key={seat.seatIndex}
                        disabled={taken}
                        onClick={() =>
                          setSelected({
                            roomId: room.roomId,
                            roomName: room.roomName,
                            seatNumber: seat.seatIndex,
                          })
                        }
                        title={`Seat ${seat.seatIndex}`}
                        className={`flex aspect-square items-center justify-center rounded-xl border text-sm font-semibold transition-all ${taken
                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                            : isSelected
                              ? "border-primary bg-primary text-white"
                              : "cursor-pointer border-green-200 bg-green-50 text-green-700 hover:border-green-400"
                          }`}
                      >
                        {taken
                          ? initials(seat.tenant)
                          : isSelected
                            ? "✓"
                            : "+"}
                      </button>
                    )
                  })}
                </div>

                {takenSeats.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {takenSeats.map((seat) => (
                      <span
                        key={seat.seatIndex}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                      >
                        Seat {seat.seatIndex}: {seat.tenant}
                        {seat.tenantBio ? ` — ${seat.tenantBio}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <Button
          onClick={handleBook}
          disabled={!selected}
          className="mt-8 w-full rounded-xl font-semibold cursor-pointer"
          size="lg"
        >
          {selected
            ? `Book seat ${selected.seatNumber} (${selected.roomName})`
            : "Select a seat"}
        </Button>
      </div>

      {modalOpen && selected && (
        <BookingModal
          propertyTitle={property?.title ?? ""}
          roomTypeName={data.name}
          roomName={selected.roomName}
          roomId={selected.roomId}
          seatNumber={selected.seatNumber}
          pricePerMonth={data.pricePerMonth}
          onCancel={() => setModalOpen(false)}
          onDone={() => {
            setModalOpen(false)
            navigate("/bookings", {
              state: { justBooked: true },
              replace: true,
            })
          }}
        />
      )}
    </div>
  )
}