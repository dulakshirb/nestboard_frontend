import { HeroSection } from "./components/HeroSection"
import { PropertyList } from "./components/PropertyList"
import { SearchFilters } from "./components/SearchFilters"
import { usePropertyList } from "@/hooks/usePropertyList"
import { useSearchParams } from "react-router"
import { useCallback, useRef } from "react"

export function Home() {
  const [searchParams] = useSearchParams()

  const search = searchParams.get("search") ?? ""
  const type = searchParams.get("type") ?? "All"
  const city = searchParams.get("city") ?? ""
  const sort = searchParams.get("sort") ?? "newest"

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePropertyList({ search, type, city, sort })

  const properties = data?.properties ?? []
  const total = data?.total ?? 0

  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          void fetchNextPage()
        }
      })
      if (node) observerRef.current.observe(node)
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  )

  return (
    <>
      <HeroSection />
      <SearchFilters />

      {isError && (
        <div className="px-8 py-10 text-red-400">
          Failed to load properties. Please try again.
        </div>
      )}
      {!isLoading && !isError && (
        <PropertyList
          properties={properties}
          total={total}
          lastElementRef={lastElementRef}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
        />
      )}
    </>
  )
}
