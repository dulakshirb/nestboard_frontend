import { useParams } from "react-router"
import { PropertySection } from "./components/PropertySection"
import { PropertyInfo } from "./components/PropertyInfo"
import { RoomList } from "./components/RoomList"
import { ReviewsSection } from "./components/ReviewsSection"
import { usePropertyDetail } from "@/hooks/usePropertyDetail"
import { useRoomTypes } from "@/hooks/useRoomTypes"

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>()
  const { data: property, isLoading, isError } = usePropertyDetail(id)
  const { data: roomTypes, isLoading: roomTypesLoading } = useRoomTypes(id)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading property...</p>
      </div>
    )
  }

  if (isError || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-xl font-semibold text-gray-700">
          Property not found
        </p>
        <p className="text-sm text-gray-400">No property matches id: {id}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PropertySection
        image={property.imageUrl}
        rating={Number(property.rating)}
      />

      <div className="px-4 pb-12">
        <div className="relative z-10 -mt-12">
          <PropertyInfo
            title={property.title}
            address={property.address}
            amenities={property.amenities}
            seatsAvailable={property.available_seats}
            minStay={property.minStay}
            startingPrice={property.cost}
          />
        </div>

        <div className="mt-5">
          <RoomList
            rooms={roomTypes ?? []}
            loading={roomTypesLoading}
            propertyId={property.id}
          />
        </div>

        <ReviewsSection propertyId={property.id} />
      </div>
    </div>
  )
}