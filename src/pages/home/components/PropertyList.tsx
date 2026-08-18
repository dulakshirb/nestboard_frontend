import { PropertyCard } from "@/components/common/PropertyCard"
import type { Property } from "@/types/property"
import { Loader2 } from "lucide-react"

interface PropertyListProps {
  properties: Property[]
  total: number
  lastElementRef?: (node: HTMLDivElement | null) => void
  isFetchingNextPage?: boolean
  isLoading?: boolean
  hasNextPage?: boolean
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-gray-100">
      <div className="aspect-[4/3] rounded-t-2xl bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-3 w-full rounded bg-gray-200" />
      </div>
    </div>
  )
}

export function PropertyList({ properties, total, lastElementRef, isFetchingNextPage, isLoading, hasNextPage }: PropertyListProps) {
  return (
    <section className="mt-6 px-4 pb-10 sm:px-6">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Popular Listings</h2>
        <p className="text-md font-regular mt-0.5 text-gray-500">
          {total} {total === 1 ? "property" : "properties"} found
        </p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {properties.map((property, i) => {
              const isLast = i === properties.length - 1
              return (
                <div key={property.id} ref={isLast ? lastElementRef : undefined}>
                  <PropertyCard {...property} />
                </div>
              )
            })}
          </div>
          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <Loader2 className="size-6 animate-spin text-gray-400" />
            </div>
          )}
          {!isFetchingNextPage && properties.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              No properties found. Try adjusting your filters.
            </div>
          )}
          {!isFetchingNextPage && properties.length > 0 && hasNextPage === false && (
            <div className="py-6 text-center text-sm text-gray-400">
              You've reached the end of the list
            </div>
          )}
        </>
      )}
    </section>
  )
}
