import { useQuery } from "@tanstack/react-query"
import { fetchRoomTypes } from "@/api/properties"

export function useRoomTypes(id: string | undefined) {
  return useQuery({
    queryKey: ["roomTypes", id],
    queryFn: () => fetchRoomTypes(id!),
    enabled: !!id,
  })
}