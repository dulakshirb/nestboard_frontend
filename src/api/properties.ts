import { api } from "./client"
import type {
  CreatePropertyInput,
  CreateRoomInput,
  CreateRoomTypeInput,
  Property,
  PropertyDetail,
  PropertyListResponse,
  RoomType,
  RoomTypeDetail,
} from "@/types/property"

export function fetchProperties(): Promise<PropertyListResponse> {
  return api<PropertyListResponse>("/properties")
}

export function fetchPropertyDetail(id: string): Promise<PropertyDetail> {
  return api<PropertyDetail>(`/properties/${id}`)
}

export function fetchRoomTypes(id: string): Promise<RoomType[]> {
  return api<RoomType[]>(`/properties/${id}/room-types?all=true`)
}

export function fetchRoomTypeDetail(
  id: string,
  roomTypeId: string,
): Promise<RoomTypeDetail> {
  return api<RoomTypeDetail>(`/properties/${id}/room-types/${roomTypeId}`)
}

export function fetchMyProperties(): Promise<Property[]> {
  return api<Property[]>("/properties/mine")
}

export function createProperty(input: CreatePropertyInput): Promise<unknown> {
  return api("/properties", { method: "POST", body: input })
}

export function setPropertyActive(
  id: string,
  isActive: boolean,
): Promise<unknown> {
  return api(`/properties/${id}`, { method: "PATCH", body: { isActive } })
}

export function updateProperty(
  id: string,
  input: Partial<CreatePropertyInput>,
): Promise<unknown> {
  return api(`/properties/${id}`, { method: "PATCH", body: input })
}

export function deleteProperty(id: string): Promise<unknown> {
  return api(`/properties/${id}`, { method: "DELETE" })
}

export function createRoomType(
  propertyId: string,
  input: CreateRoomTypeInput,
): Promise<unknown> {
  return api(`/properties/${propertyId}/room-types`, {
    method: "POST",
    body: input,
  })
}

export function updateRoomType(
  propertyId: string,
  roomTypeId: string,
  input: Partial<CreateRoomTypeInput>,
): Promise<unknown> {
  return api(`/properties/${propertyId}/room-types/${roomTypeId}`, {
    method: "PATCH",
    body: input,
  })
}

export function deleteRoomType(
  propertyId: string,
  roomTypeId: string,
): Promise<unknown> {
  return api(`/properties/${propertyId}/room-types/${roomTypeId}`, {
    method: "DELETE",
  })
}

export function createRoom(
  propertyId: string,
  roomTypeId: string,
  input: CreateRoomInput,
): Promise<unknown> {
  return api(`/properties/${propertyId}/room-types/${roomTypeId}/rooms`, {
    method: "POST",
    body: input,
  })
}

export function updateRoom(
  propertyId: string,
  roomTypeId: string,
  roomId: string,
  input: { roomLabel?: string; seatCapacity?: number; isAvailable?: boolean },
): Promise<unknown> {
  return api(`/properties/${propertyId}/room-types/${roomTypeId}/rooms/${roomId}`, {
    method: "PATCH",
    body: input,
  })
}

export function deleteRoom(
  propertyId: string,
  roomTypeId: string,
  roomId: string,
): Promise<unknown> {
  return api(`/properties/${propertyId}/room-types/${roomTypeId}/rooms/${roomId}`, {
    method: "DELETE",
  })
}

export function toggleFavorite(propertyId: string): Promise<{ isFavorite: boolean }> {
  return api(`/properties/${propertyId}/toggle-favorite`, { method: "PATCH" })
}

export function fetchFavorites(): Promise<Property[]> {
  return api<Property[]>("/properties/my-favorites")
}