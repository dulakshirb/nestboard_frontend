import { fetchAdminBookings } from "@/api/bookings";
import { useQuery } from "@tanstack/react-query";

export function useAdminBookings() {
  return useQuery({
    queryKey: ["adminBookings"],
    queryFn: fetchAdminBookings,
  })
}