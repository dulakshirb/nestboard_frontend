import { api } from "./client"
import type { AdminBooking, Booking, CreateBookingInput } from "@/types/booking"

export function createBooking(input: CreateBookingInput): Promise<Booking> {
  return api<Booking>("/bookings", { method: "POST", body: input })
}

export function confirmBooking(id: string): Promise<Booking> {
  return api<Booking>(`/bookings/${id}/confirm`, { method: "POST" })
}

export function fetchMyBookings(): Promise<Booking[]> {
  return api<Booking[]>("/bookings/my")
}

export function fetchAdminBookings(): Promise<AdminBooking[]> {
  return api<AdminBooking[]>("/bookings/admin")
}