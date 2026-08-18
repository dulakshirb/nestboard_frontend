export type Property = {
  id: string
  title: string
  description: string
  location: string
  type: "House" | "Villa" | "Apartment" | "Hotel"
  price: string
  rating: number
  isFavorite: boolean
  isActive: boolean
  image: string
  lat?: number
  lng?: number
}

export type PropertyListResponse = {
  data: Property[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export type PropertyDetail = {
  id: string
  vendorId: string
  title: string
  description: string
  address: string
  city: string
  type: string
  rating: number
  isFavorite: boolean
  amenities: string[]
  latitude: number
  longitude: number
  imageUrl: string
  minStay: string
  cost: string
  available_seats: number
}

export type RoomType = {
  id: string
  name: string
  pricePerMonth: string
  freeSeats: number
  roomsCount: number
  seatCapacity: number
  hasAC: boolean
}

export type SeatInfo = {
  seatIndex: number
  tenant: string
  tenantBio: string
}

export type RoomSeats = {
  roomId: string
  roomName: string
  booking: SeatInfo[]
}

export type RoomTypeDetail = {
  id: string
  name: string
  pricePerMonth: string
  seatCapacity: number
  roomsCount: number
  hasAC: boolean
  rooms: RoomSeats[]
}

export type CreatePropertyInput = {
  title: string
  description: string
  address: string
  city: string
  type: "HOUSE" | "VILLA" | "APARTMENT" | "HOTEL"
  amenities: string[]
  latitude: number
  longitude: number
  imageUrl: string
  minStay?: string
}

export type CreateRoomTypeInput = {
  name: string
  pricePerMonth: number
  hasAC?: boolean
  isAvailable?: boolean
}

export type CreateRoomInput = {
  roomLabel: string
  seatCapacity?: number
  isAvailable?: boolean
}

export type UpdateRoomInput = {
  roomLabel?: string
  seatCapacity?: number
  isAvailable?: boolean
}
