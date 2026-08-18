import { type FormEvent, useState, useEffect, useCallback } from "react"
import { createBooking, confirmBooking } from "@/api/bookings"
import { ApiError } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Booking } from "@/types/booking"

const TEN_MINUTES = 10 * 60 * 1000

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

  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null)
  const [countdown, setCountdown] = useState(TEN_MINUTES)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!pendingBooking) return
    const deadline = new Date(pendingBooking.createdAt).getTime() + TEN_MINUTES

    const interval = setInterval(() => {
      const remaining = deadline - Date.now()
      if (remaining <= 0) {
        setCountdown(0)
        setExpired(true)
        clearInterval(interval)
      } else {
        setCountdown(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [pendingBooking])

  const minutes = Math.floor(countdown / 60000)
  const seconds = Math.floor((countdown % 60000) / 1000)

  const total = Number(pricePerMonth) * durationMonths

  async function handleCreate(e: FormEvent) {
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
      setPendingBooking(booking)
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

  const handleConfirm = useCallback(async () => {
    if (!pendingBooking) return
    setSubmitting(true)
    setError(null)
    try {
      const confirmed = await confirmBooking(pendingBooking.id)
      onDone(confirmed)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("This seat was taken by someone else. Please go back and choose a different seat.")
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Confirmation failed. Please try again."
        )
      }
    } finally {
      setSubmitting(false)
    }
  }, [pendingBooking, onDone])

  if (expired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <Card className="w-full max-w-md gap-0 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-red-600">Booking Expired</h2>
          <p className="mt-2 text-sm text-gray-500">
            The 10-minute payment window has passed. The seat hold has been released.
          </p>
          <Button onClick={onCancel} className="mt-6 w-full rounded-xl">
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  if (pendingBooking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <Card className="w-full max-w-md gap-0 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900">Confirm Booking</h2>
          <p className="mt-1 text-sm text-gray-500">
            You are about to book a seat in {roomName} at {propertyTitle}.
          </p>

          <dl className="mt-4 divide-y divide-gray-100 text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Room</dt>
              <dd className="font-semibold text-gray-900">{roomName}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Seat</dt>
              <dd className="font-semibold text-gray-900">Seat {seatNumber}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Lease</dt>
              <dd className="font-semibold text-gray-900">
                {startMonth} ({durationMonths} months)
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Total</dt>
              <dd className="text-lg font-bold text-gray-900">
                LKR {total.toLocaleString()}
              </dd>
            </div>
          </dl>

          {/* Countdown */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 py-3">
            <span className="text-sm text-orange-700">Payment window ends in</span>
            <span className="font-mono text-lg font-bold text-orange-700">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
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
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="flex-1 rounded-xl font-semibold cursor-pointer"
            >
              {submitting ? "Confirming..." : `Pay LKR ${total.toLocaleString()}`}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md gap-0 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900">Confirm Booking</h2>
        <p className="mt-1 text-sm text-gray-500">
          You are about to book a seat in {roomName} at {propertyTitle}.
        </p>

        <form onSubmit={handleCreate} className="mt-6">
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
              {submitting ? "Reserving..." : "Reserve Seat"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
