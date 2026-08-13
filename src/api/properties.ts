import { api } from "./client"
import type {
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
  return api<RoomType[]>(`/properties/${id}/room-types`)
}

export function fetchRoomTypeDetail(
  id: string,
  roomTypeId: string,
): Promise<RoomTypeDetail> {
  return api<RoomTypeDetail>(`/properties/${id}/room-types/${roomTypeId}`)
}