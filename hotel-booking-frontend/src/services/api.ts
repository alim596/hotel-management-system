// src/services/api.ts
import axios from "axios";
import type { Hotel, RoomType } from "./types";

// Create an Axios instance targeting your Nest backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Fetch all hotels
export async function getHotels(): Promise<Hotel[]> {
  const res = await api.get<Hotel[]>("/hotels");
  return res.data;
}

// Fetch a single hotel by ID
export async function getHotelById(id: string): Promise<Hotel> {
  const res = await api.get<Hotel>(`/hotels/${id}`);
  return res.data;
}

// Fetch room types for a given hotel
export async function getRoomTypesByHotelId(
  hotelId: string
): Promise<RoomType[]> {
  const res = await api.get<RoomType[]>(`/room-types/${hotelId}`);
  return res.data;
}
