import { type FormEvent, useState } from "react"
import { createBooking } from "@/api/bookings"
import { ApiError } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Booking } from "@/types/booking"

type BookingModalProps = {
  propertyTitle: string
  roomTypeName: string
  roomName: string
  roomId: string
  seatNumber: number
  pricePerMonth: string
  onCancel: () => void
  onDone: (booking: Booking) => void
}

export function BookingModal({
  propertyTitle,
  roomTypeName,
  roomName,
  roomId,
  seatNumber,
  pricePerMonth,
  onCancel,
  onDone,
}: BookingModalProps) {
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  const [startMonth, setStartMonth] = useState(currentMonth)
  const [durationMonths, setDurationMonths] = useState(3)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = Number(pricePerMonth) * durationMonths

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const booking = await createBooking({
        roomId,
        seatNumber,
        startMonth,
        durationMonths,
      })
      onDone(booking)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Booking failed. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md gap-0 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900">Confirm Booking</h2>
        <p className="mt-1 text-sm text-gray-500">
          You are about to book a seat in {roomName} at {propertyTitle}.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <dl className="divide-y divide-gray-100 text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Room Type</dt>
              <dd className="font-semibold text-gray-900">{roomTypeName}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Room</dt>
              <dd className="font-semibold text-gray-900">{roomName}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Seat</dt>
              <dd className="font-semibold text-gray-900">Seat {seatNumber}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Price</dt>
              <dd className="font-semibold text-gray-900">
                LKR {pricePerMonth} / month
              </dd>
            </div>
          </dl>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Start Month
              <input
                type="month"
                required
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Duration
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "month" : "months"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-lg font-bold text-gray-900">
              LKR {total.toLocaleString()}
            </span>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl font-semibold cursor-pointer"
            >
              {submitting ? "Reserving..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}