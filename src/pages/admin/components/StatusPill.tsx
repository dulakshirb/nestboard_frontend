const styles: Record<string, string> = {
  CONFIRMED: "bg-green-50 text-green-700",
  PENDING: "bg-amber-50 text-amber-700",
  EXPIRED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-50 text-red-700",
  PAID: "bg-blue-50 text-blue-700",
  FAILED: "bg-red-50 text-red-700",
  Active: "bg-green-50 text-green-700",
  Inactive: "bg-gray-100 text-gray-500",
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}