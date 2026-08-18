import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchPropertyReviews,
  fetchUserReview,
  createReview,
} from "@/api/reviews"
import { useAuthStore } from "@/stores/authStore"
import { Star } from "lucide-react"

const AVATAR_COLORS = ["#C9A87C", "#E8652A", "#1A1A2E", "#7C8CA9", "#A87CC9"]

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

function StarRow({
  value,
  onChange,
  size = 16,
}: {
  value: number
  onChange?: (v: number) => void
  size?: number
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={
              n <= value ? "text-yellow-400" : "text-gray-200"
            }
            fill={n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  )
}

export function ReviewsSection({ propertyId }: { propertyId: string }) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", propertyId],
    queryFn: () => fetchPropertyReviews(propertyId),
  })

  const { data: myReview } = useQuery({
    queryKey: ["reviews", propertyId, "mine"],
    queryFn: () => fetchUserReview(propertyId),
    enabled: !!user,
  })

  const submitMutation = useMutation({
    mutationFn: () =>
      createReview(propertyId, {
        rating,
        comment: comment.trim() || null,
      }),
    onSuccess: () => {
      setShowForm(false)
      setError(null)
      queryClient.invalidateQueries({ queryKey: ["reviews", propertyId] })
      queryClient.invalidateQueries({
        queryKey: ["reviews", propertyId, "mine"],
      })
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] })
    },
    onError: (err: any) => {
      setError(
        err?.message ?? "Could not submit review. You may need a confirmed booking.",
      )
    },
  })

  function handleOpenForm() {
    if (myReview) {
      setRating(myReview.rating)
      setComment(myReview.comment ?? "")
    }
    setShowForm(true)
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
        {reviews.length > 0 && (
          <span className="text-sm text-gray-400">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {user && !myReview && !showForm && (
        <button
          onClick={handleOpenForm}
          className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Write a review
        </button>
      )}

      {user && myReview && !showForm && (
        <button
          onClick={handleOpenForm}
          className="mb-4 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Edit your review
        </button>
      )}

      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            {myReview ? "Edit your review" : "Your rating"}
          </h3>
          <StarRow value={rating} onChange={setRating} size={28} />
          <textarea
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)"
            className="mt-3 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-gray-400"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {submitMutation.isPending
                ? "Submitting..."
                : myReview
                  ? "Update review"
                  : "Submit review"}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setError(null)
              }}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="flex gap-3">
                <div className="size-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <Star className="mx-auto mb-2 size-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{
                    backgroundColor:
                      AVATAR_COLORS[
                        review.user.id.charCodeAt(0) % AVATAR_COLORS.length
                      ],
                  }}
                >
                  {initials(review.user.displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {review.user.displayName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StarRow value={review.rating} />
              </div>
              {review.comment && (
                <p className="mt-3 text-sm text-gray-600">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
