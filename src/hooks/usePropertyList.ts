import { useInfiniteQuery } from "@tanstack/react-query"
import { api } from "@/api/client"
import type { Property, PropertyListResponse } from "@/types/property"

export type PropertyFilters = {
  search?: string
  type?: string
  city?: string
  sort?: string
  page?: number
}

function fetchPropertiesPage(params: PropertyFilters & { page: number }): Promise<PropertyListResponse> {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set("search", params.search)
  if (params.type && params.type !== "All") searchParams.set("type", params.type)
  if (params.city) searchParams.set("city", params.city)
  if (params.sort) searchParams.set("sort", params.sort)
  searchParams.set("page", String(params.page))
  searchParams.set("limit", "12")
  return api<PropertyListResponse>(`/properties?${searchParams.toString()}`)
}

export function usePropertyList(filters: Omit<PropertyFilters, "page">) {
  return useInfiniteQuery({
    queryKey: ["properties", filters],
    queryFn: ({ pageParam = 1 }) =>
      fetchPropertiesPage({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    select: (data) => ({
      pages: data.pages,
      properties: data.pages.flatMap((p) => p.data),
      total: data.pages[0]?.meta.total ?? 0,
      hasNextPage: data.pages[data.pages.length - 1]?.meta.hasNextPage ?? false,
    }),
  })
}
