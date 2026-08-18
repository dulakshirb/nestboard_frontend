import { useQuery } from "@tanstack/react-query"
import { fetchFavorites } from "@/api/properties"
import { PropertyCard } from "@/components/common/PropertyCard"
import { Heart } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { Link } from "react-router"

export function Saved() {
  const status = useAuthStore((s) => s.status)
  const isSignedIn = status === "signedIn"

  const { data: favorites = [], isLoading, isError } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: isSignedIn,
  })

  if (!isSignedIn) {
    return (
      <section className="mt-24 px-4 pb-10 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
        </div>
        <div className="flex flex-col items-center py-20 text-center">
          <Heart className="mb-4 size-12 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700">Sign in to view saved properties</h2>
          <p className="mt-1 text-sm text-gray-400">
            Tap the heart icon on any property to save it here.
          </p>
          <Link
            to="/sign-in"
            className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Sign In
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-24 px-4 pb-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
        <p className="text-md mt-0.5 text-gray-500">
          {favorites.length} saved {favorites.length === 1 ? "property" : "properties"}
        </p>
      </div>

      {isError && (
        <div className="py-10 text-center text-red-400">
          Failed to load favorites. Please try again.
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-gray-100" style={{ aspectRatio: "1/1" }} />
          ))}
        </div>
      )}

      {!isLoading && !isError && favorites.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <Heart className="mb-4 size-12 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700">No saved properties yet</h2>
          <p className="mt-1 text-sm text-gray-400">
            Tap the heart icon on any property to save it here.
          </p>
        </div>
      )}

      {!isLoading && !isError && favorites.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {favorites.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      )}
    </section>
  )
}
