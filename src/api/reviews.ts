import { api } from "./client"
import type { Review, CreateReviewInput } from "@/types/review"

export function fetchPropertyReviews(propertyId: string): Promise<Review[]> {
  return api<Review[]>(`/reviews/${propertyId}`, { auth: false })
}

export function fetchUserReview(propertyId: string): Promise<Review | null> {
  return api<Review | null>(`/reviews/${propertyId}/my`)
}

export function createReview(
  propertyId: string,
  data: CreateReviewInput,
): Promise<Review> {
  return api<Review>(`/reviews/${propertyId}`, {
    method: "POST",
    body: data,
  })
}

export function deleteReview(propertyId: string): Promise<void> {
  return api<void>(`/reviews/${propertyId}`, { method: "DELETE" })
}
