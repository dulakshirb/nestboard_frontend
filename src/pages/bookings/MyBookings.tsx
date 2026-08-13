import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useLocation } from "react-router"
import { confirmBooking } from "@/api/bookings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMyBookings } from "@/hooks/useMyBookings"
import type { BookingStatus } from "@/types/booking"

const STATUS_STYLE: Record<BookingStatus, string> = {
  PENDING: "bg-orange-50 text-orange-700",
  CONFIRMED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-600",
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })
}

export function MyBookings() {
  const location = useLocation()
  const justBooked = (location.state as { justBooked?: boolean } | null)
    ?.justBooked
  const { data: bookings, isLoading, isError } = useMyBookings()
  const queryClient = useQueryClient()
  const confirmMutation = useMutation({
    mutationFn: confirmBooking,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["myBookings"] }),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading bookings...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-400">Failed to load bookings.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-28 pb-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-gray-900">My Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">
          {bookings?.length ?? 0} booking(s)
        </p>

        {justBooked && (
          <p className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
            Your seat is reserved! Confirm your payment below to finalize the
            booking.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {bookings?.length === 0 && (
            <Card className="rounded-3xl p-6 text-sm text-gray-500 shadow-sm ring-0">
              You have no bookings yet.
            </Card>
          )}
          {bookings?.map((booking) => (
            <Card
              key={booking.id}
              className="gap-0 rounded-3xl p-5 shadow-sm ring-0"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">
                    {booking.room.roomType.property.title}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {booking.room.roomType.name} · {booking.room.roomLabel} ·{" "}
                    Seat {booking.seatNumber}
                  </p>
                </div>
                <Badge
                  className={`rounded-full px-3 py-1 text-xs ${STATUS_STYLE[booking.bookingStatus]}`}
                >
                  {booking.bookingStatus}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-500">
                <span>
                  {formatDate(booking.leaseStart)} –{" "}
                  {formatDate(booking.leaseEnd)}
                </span>
                <span>{booking.durationMonths} months</span>
                <span>LKR {Number(booking.totalAmount).toLocaleString()}</span>
              </div>

              {booking.bookingStatus === "PENDING" && (
                <Button
                  onClick={() => confirmMutation.mutate(booking.id)}
                  disabled={confirmMutation.isPending}
                  className="mt-4 w-full rounded-xl font-semibold cursor-pointer"
                >
                  Pay & Confirm
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}