import { useQuery } from "@tanstack/react-query"
import { fetchMyBookings } from "@/api/bookings"

export function useMyBookings() {
  return useQuery({
    queryKey: ["myBookings"],
    queryFn: fetchMyBookings,
  })
}