export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED"
export type PaymentStatus = "PENDING" | "PAID" | "FAILED"

export type Booking = {
  id: string
  tenantId: string
  roomId: string
  seatNumber: number
  leaseStart: string
  leaseEnd: string
  durationMonths: number
  totalAmount: string
  paymentStatus: PaymentStatus
  bookingStatus: BookingStatus
  createdAt: string
  room: {
    id: string
    roomLabel: string
    isAvailable: boolean
    roomType: {
      id: string
      name: string
      pricePerMonth: string
      property: {
        id: string
        title: string
      }
    }
  }
}

export type CreateBookingInput = {
  roomId: string
  seatNumber: number
  startMonth: string
  durationMonths: number
}

export type AdminBooking = Booking & {
  tenant: {
    id: string
    displayName: string
    email: string
    avatarUrl: string | null
  }
}