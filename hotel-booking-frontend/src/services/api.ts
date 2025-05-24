// src/services/api.ts
import axios from "axios";
import type {
  Hotel,
  RoomType,
  Room,
  Guest,
  Reservation,
  CreateReservationDto,
  ErrorResponse,
} from "./types";

// Create an Axios instance targeting your Nest backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    const errorMessage =
      error.response?.data?.message || "An unexpected error occurred";
    throw new Error(errorMessage);
  }
);

// Hotel endpoints
export async function getHotels(): Promise<Hotel[]> {
  const res = await api.get<Hotel[]>("/hotels");
  return res.data;
}

export async function getHotelById(id: number): Promise<Hotel> {
  const res = await api.get<Hotel>(`/hotels/${id}`);
  return res.data;
}

// Room Type endpoints
export async function getRoomTypes(): Promise<RoomType[]> {
  const res = await api.get<RoomType[]>("/room-types");
  return res.data;
}

export async function getRoomTypesByHotelId(
  hotelId: number
): Promise<RoomType[]> {
  const res = await api.get<RoomType[]>(`/hotels/${hotelId}/room-types`);
  return res.data;
}

export async function getRoomTypeById(id: number): Promise<RoomType> {
  const res = await api.get<RoomType>(`/room-types/${id}`);
  return res.data;
}

// Room endpoints
export async function getRooms(): Promise<Room[]> {
  const res = await api.get<Room[]>("/rooms");
  return res.data;
}

export async function getRoomsByHotelId(hotelId: number): Promise<Room[]> {
  const res = await api.get<Room[]>(`/hotels/${hotelId}/rooms`);
  return res.data;
}

export async function getRoomById(id: number): Promise<Room> {
  const res = await api.get<Room>(`/rooms/${id}`);
  return res.data;
}

// Guest endpoints
export async function getGuests(): Promise<Guest[]> {
  const res = await api.get<Guest[]>("/guests");
  return res.data;
}

export async function getGuestById(id: number): Promise<Guest> {
  const res = await api.get<Guest>(`/guests/${id}`);
  return res.data;
}

export async function createGuest(
  data: Omit<Guest, "GuestID">
): Promise<Guest> {
  const res = await api.post<Guest>("/guests", data);
  return res.data;
}

export async function updateGuest(
  id: number,
  data: Partial<Guest>
): Promise<Guest> {
  const res = await api.patch<Guest>(`/guests/${id}`, data);
  return res.data;
}

// Reservation endpoints
export async function getReservations(): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>("/bookings");
  return res.data;
}

export async function getReservationById(id: number): Promise<Reservation> {
  const res = await api.get<Reservation>(`/bookings/${id}`);
  return res.data;
}

export async function getGuestReservations(
  guestId: number
): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>(`/bookings/guest/${guestId}`);
  return res.data;
}

export async function createReservation(
  data: CreateReservationDto
): Promise<Reservation> {
  const res = await api.post<Reservation>("/bookings", data);
  return res.data;
}

export async function updateReservation(
  id: number,
  data: Partial<Omit<Reservation, "ReservationID" | "BookingDate">>
): Promise<Reservation> {
  const res = await api.patch<Reservation>(`/bookings/${id}`, data);
  return res.data;
}

export async function cancelReservation(
  id: number,
  reason?: string
): Promise<void> {
  await api.delete(`/bookings/${id}`, {
    params: { reason },
  });
}

// Room availability check
export async function checkRoomAvailability(
  hotelId: number,
  checkIn: string,
  checkOut: string
): Promise<Room[]> {
  const res = await api.get<Room[]>(`/hotels/${hotelId}/available-rooms`, {
    params: { checkIn, checkOut },
  });
  return res.data;
}
