import { Heart, Star } from "lucide-react"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import type { Property } from "@/types/property"
import { Link } from "react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleFavorite } from "@/api/properties"
import { useAuthStore } from "@/stores/authStore"
import { useNavigate } from "react-router"

export function PropertyCard(props: Property) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const favMutation = useMutation({
    mutationFn: () => toggleFavorite(props.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["properties"] })
      void queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })

  function handleFav(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate(`/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    favMutation.mutate()
  }

  return (
    <Link to={`/property-details/${props.id}`} className="block">
      <Card
        className="relative cursor-pointer rounded-2xl p-0 ring-0"
        style={{ aspectRatio: "1/1" }}
      >
        {/* Background image */}
        <img
          src={props.image}
          alt={props.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

        {/* Favourite button */}
        <button
          onClick={handleFav}
          className="absolute top-2.5 left-2.5 z-10 rounded-full bg-black/30 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <Heart
            className={`size-4 ${props.isFavorite ? "fill-red-500 text-red-500" : "text-white/70"}`}
          />
        </button>

        {/* Rating badge */}
        <Badge className="absolute top-2.5 right-2.5 h-auto gap-1 border-0 bg-white/90 py-0.5 text-gray-800 backdrop-blur-sm">
          <Star className="size-3 fill-yellow-400 text-yellow-400" />
          {props.rating}
        </Badge>

        {/* Bottom info */}
        <div className="absolute right-0 bottom-0 left-0 p-3">
          <Badge
            variant="secondary"
            className="mb-1.5 h-auto border-0 bg-white/25 text-[9px] tracking-wider text-white uppercase backdrop-blur-sm hover:bg-white/25"
          >
            {props.type}
          </Badge>
          <h3 className="text-sm leading-snug font-bold text-white">
            {props.title}
          </h3>
          <p className="mb-1.5 text-[11px] text-white/65">{props.location}</p>
          <p className="text-sm text-white">
            <span className="font-bold">{props.price}</span>
            <span className="text-[11px] text-white/60"> /Month</span>
          </p>
        </div>
      </Card>
    </Link>
  )
}
