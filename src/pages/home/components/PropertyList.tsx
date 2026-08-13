import { PropertyCard } from "@/components/common/PropertyCard"
import type { Property } from "@/types/property"

interface PropertyListProps {
  properties: Property[]
}

export function PropertyList({ properties }: PropertyListProps) {
  return (
    <section className="mt-6 px-4 pb-10 sm:px-">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Property Listings</h2>
        <p className="text-md font-regular mt-0.5 text-gray-500">
          {properties.length} properties found
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
        {properties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
    </section>
  )
}
