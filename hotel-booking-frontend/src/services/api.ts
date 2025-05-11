import type { Hotel, RoomType } from "./types";
import { mockHotels, mockRoomTypes } from "./mock-data";

/**
 * Fetch all hotels (mock)
 */
export async function getHotels(): Promise<Hotel[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockHotels), 300);
  });
}

/**
 * Fetch a single hotel by ID (mock)
 */
export async function getHotelById(id: string): Promise<Hotel> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const hotel = mockHotels.find((h) => h.id === id);
      if (hotel) resolve(hotel);
      else reject(new Error("Hotel not found"));
    }, 300);
  });
}

/** Fetch mock room types for a given hotel */
export async function getRoomTypesByHotelId(
  hotelId: string
): Promise<RoomType[]> {
  return new Promise((res) =>
    setTimeout(
      () => res(mockRoomTypes.filter((rt) => rt.hotelId === hotelId)),
      300
    )
  );
}
