import { useMemo, useState } from "react"
import { useAdminBookings } from "@/hooks/useAdminBookings"
import { StatusPill } from "./components/StatusPill"

const statuses = ["ALL", "PENDING", "CONFIRMED", "EXPIRED", "CANCELLED"]
const payments = ["ALL", "PENDING", "PAID", "FAILED"]

function label(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function AdminBookings() {
  const { data: bookings, isLoading, isError } = useAdminBookings()
  const [status, setStatus] = useState("ALL")
  const [payment, setPayment] = useState("ALL")

  const filtered = useMemo(
    () =>
      (bookings ?? []).filter(
        (b) =>
          (status === "ALL" || b.bookingStatus === status) &&
          (payment === "ALL" || b.paymentStatus === payment),
      ),
    [bookings, status, payment],
  )

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Showing {filtered.length} of {bookings?.length ?? 0} bookings
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All statuses" : label(s)}
              </option>
            ))}
          </select>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
          >
            {payments.map((p) => (
              <option key={p} value={p}>
                {p === "ALL" ? "All payments" : label(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs tracking-wide text-gray-400 uppercase">
              <th className="px-5 py-3.5 font-medium">Booking ID</th>
              <th className="px-5 py-3.5 font-medium">Property</th>
              <th className="px-5 py-3.5 font-medium">Room</th>
              <th className="px-5 py-3.5 font-medium">Seat</th>
              <th className="px-5 py-3.5 font-medium">Tenant</th>
              <th className="px-5 py-3.5 font-medium">Duration</th>
              <th className="px-5 py-3.5 font-medium">Amount</th>
              <th className="px-5 py-3.5 font-medium">Payment</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                  bk-{b.id.slice(-8)}
                </td>
                <td className="px-5 py-3.5 font-medium text-gray-900">
                  {b.room.roomType.property.title}
                </td>
                <td className="px-5 py-3.5 text-gray-600">{b.room.roomLabel}</td>
                <td className="px-5 py-3.5 text-gray-600">{b.seatNumber}</td>
                <td className="px-5 py-3.5 text-gray-600">{b.tenant.displayName}</td>
                <td className="px-5 py-3.5 text-gray-600">{b.durationMonths} mo</td>
                <td className="px-5 py-3.5 font-medium text-gray-900">
                  LKR {Number(b.totalAmount).toLocaleString()}
                </td>
                <td className="px-5 py-3.5">
                  <StatusPill status={b.paymentStatus} />
                </td>
                <td className="px-5 py-3.5">
                  <StatusPill status={b.bookingStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-gray-400">
            No bookings match the selected filters.
          </p>
        )}
      </div>

      {isError && (
        <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load bookings. Check that the API is running.
        </p>
      )}
    </div>
  )
}