import { Building2, DollarSign, House, Percent, TrendingUp } from "lucide-react"
import { useQueries } from "@tanstack/react-query"
import { type ReactNode, useMemo } from "react"
import { fetchRoomTypes } from "@/api/properties"

import { useAuthStore } from "@/stores/authStore"
import { StatusPill } from "./components/StatusPill"
import { useMyProperties } from "@/hooks/useMyProperties"
import { useAdminBookings } from "@/hooks/useAdminBookings"

function formatTodayLong(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())
}

function formatMoney(value: number): string {
  if (value >= 1_000_000) return `LKR ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `LKR ${Math.round(value / 1_000)}K`
  return `LKR ${value.toLocaleString()}`
}

type StatCardProps = {
  icon: ReactNode
  iconWrapClassName: string
  trend: string
  value: string | null
  label: string
  timeframe: string
  loading?: boolean
}

function StatCard({
  icon,
  iconWrapClassName,
  trend,
  value,
  label,
  timeframe,
  loading,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconWrapClassName}`}
        >
          {icon}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          {trend}
        </div>
      </div>
      <p className="mt-6 text-4xl font-bold tracking-tight text-gray-900 tabular-nums">
        {loading || value === null ? (
          <span className="inline-block h-10 w-16 animate-pulse rounded-md bg-gray-100" />
        ) : (
          value
        )}
      </p>
      <p className="mt-1 text-base font-semibold text-gray-800">{label}</p>
      <p className="mt-2 text-sm text-gray-400">{timeframe}</p>
    </div>
  )
}

export function AdminDashboard() {
  const user = useAuthStore((state) => state.user)
  const { data: properties, isLoading: propsLoading } = useMyProperties()
  const { data: bookings, isLoading: bookingsLoading } = useAdminBookings()

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

  const roomsLoading =
    propertyIds.length > 0 &&
    roomTypeQueries.some((q) => q.isPending || q.isFetching)

  const totalProperties = properties?.length ?? null

  const totalRooms =
    propertyIds.length === 0
      ? 0
      : roomsLoading
        ? null
        : roomTypeQueries.reduce(
          (sum, q) => sum + (q.data?.reduce((s, rt) => s + rt.roomsCount, 0) ?? 0),
          0,
        )

  const totalSeats = useMemo(
    () =>
      roomTypeQueries.reduce(
        (sum, q) => sum + (q.data?.reduce((s, rt) => s + rt.seatCapacity, 0) ?? 0),
        0,
      ),
    [roomTypeQueries],
  )
  const freeSeats = useMemo(
    () =>
      roomTypeQueries.reduce(
        (sum, q) => sum + (q.data?.reduce((s, rt) => s + rt.freeSeats, 0) ?? 0),
        0,
      ),
    [roomTypeQueries],
  )
  const occupancy = totalSeats > 0 ? Math.round(((totalSeats - freeSeats) / totalSeats) * 100) : 0

  const revenue = useMemo(
    () =>
      (bookings ?? [])
        .filter((b) => b.bookingStatus === "CONFIRMED")
        .reduce((sum, b) => sum + Number(b.totalAmount), 0),
    [bookings],
  )

  const perProperty = useMemo(
    () =>
      propertyIds.map((id, i) => {
        const rts = roomTypeQueries[i]?.data ?? []
        const seats = rts.reduce((s, rt) => s + rt.seatCapacity, 0)
        const free = rts.reduce((s, rt) => s + rt.freeSeats, 0)
        return {
          title: properties?.find((p) => p.id === id)?.title ?? "-",
          occ: seats > 0 ? Math.round(((seats - free) / seats) * 100) : 0,
        }
      }),
    [propertyIds, roomTypeQueries, properties],
  )

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Hello, {user?.displayName ?? "there"}
      </h1>
      <p className="mt-2 text-base text-gray-500">{formatTodayLong()}</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-5 w-5 text-teal-600" />}
          iconWrapClassName="bg-teal-100"
          trend="+1"
          value={propsLoading ? null : String(totalProperties ?? 0)}
          label="Total Properties"
          timeframe="this quarter"
          loading={propsLoading}
        />
        <StatCard
          icon={<House className="h-5 w-5 text-purple-600" />}
          iconWrapClassName="bg-purple-100"
          trend="+4"
          value={totalRooms === null ? null : String(totalRooms)}
          label="Total Rooms"
          timeframe="from last month"
          loading={propsLoading || roomsLoading}
        />
        <StatCard
          icon={<Percent className="h-5 w-5 text-blue-600" />}
          iconWrapClassName="bg-blue-100"
          trend="+3%"
          value={roomsLoading ? null : `${occupancy}%`}
          label="Occupancy"
          timeframe="across all rooms"
          loading={roomsLoading}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-amber-600" />}
          iconWrapClassName="bg-amber-100"
          trend="+12%"
          value={bookingsLoading ? null : formatMoney(revenue)}
          label="Monthly Revenue"
          timeframe="from confirmed bookings"
          loading={bookingsLoading}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-lg font-semibold text-gray-900">Occupancy by Property</h2>
          <div className="mt-5 space-y-4">
            {perProperty.length === 0 ? (
              <p className="text-sm text-gray-400">
                No properties yet. Add one from the Properties tab.
              </p>
            ) : (
              perProperty.map((p) => (
                <div key={p.title}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{p.title}</span>
                    <span className="font-semibold text-gray-900">{p.occ}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${p.occ}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <div className="mt-4 space-y-3">
            {(bookings ?? []).slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {b.room.roomType.property.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {b.room.roomLabel} · Seat {b.seatNumber} · {b.tenant.displayName}
                  </p>
                </div>
                <StatusPill status={b.bookingStatus} />
              </div>
            ))}
            {bookings !== undefined && bookings.length === 0 && (
              <p className="text-sm text-gray-400">No bookings yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}