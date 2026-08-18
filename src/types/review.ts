export type Review = {
  id: string
  userId: string
  propertyId: string
  bookingId: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    id: string
    displayName: string
    avatarUrl: string | null
  }
}

export type CreateReviewInput = {
  rating: number
  comment?: string | null
}
