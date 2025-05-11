// src/services/api.ts
import axios from "axios";
import type { Hotel, RoomType, Booking } from "./types";

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

// !!! NOT ALL ENDPOINTS ARE IMPLEMENTED IN THE BACKEND YET !!!

// Fetch all bookings
export async function getBookings(): Promise<Booking[]> {
  const res = await api.get<Booking[]>("/bookings");
  return res.data;
}

// Fetch a single booking by its ID
export async function getBookingById(id: string): Promise<Booking> {
  const res = await api.get<Booking>(`/bookings/${id}`);
  return res.data;
}

// Create a new booking
export async function createBooking(
  data: Omit<Booking, "id" | "createdAt">
): Promise<Booking> {
  const res = await api.post<Booking>("/bookings", data);
  return res.data;
}

// (Optional) Update an existing booking
export async function updateBooking(
  id: string,
  data: Partial<Omit<Booking, "id" | "createdAt">>
): Promise<Booking> {
  const res = await api.patch<Booking>(`/bookings/${id}`, data);
  return res.data;
}

// (Optional) Cancel/delete a booking
export async function deleteBooking(id: string): Promise<void> {
  await api.delete(`/bookings/${id}`);
}
