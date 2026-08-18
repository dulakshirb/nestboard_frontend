export type NotificationType =
  | "BOOKING_RECEIVED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_EXPIRED"

export type Notification = {
  id: string
  userId: string
  type: NotificationType
  message: string
  read: boolean
  bookingId: string | null
  propertyId: string | null
  createdAt: string
  booking?: {
    id: string
    seatNumber: number
    leaseStart: string
    leaseEnd: string
  }
  property?: {
    id: string
    title: string
  }
}
