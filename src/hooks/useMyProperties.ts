import { useQuery } from "@tanstack/react-query"
import { fetchMyProperties } from "@/api/properties"

export function useMyProperties() {
  return useQuery({
    queryKey: ["myProperties"],
    queryFn: fetchMyProperties,
  })
}