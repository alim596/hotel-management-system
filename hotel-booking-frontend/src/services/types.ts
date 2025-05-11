export interface Hotel {
  id: string;
  name: string;
  city: string;
  rating: number;
  price: number;
  imageUrl: string;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  capacity: number;
  bedType: string;
  sizeInSqFt: number;
  basePrice: number;
  images: string[];
}

export interface Room {
  id: string;
  hotelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number;
  status: "available" | "booked" | "maintenance";
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  status?: "pending" | "confirmed" | "cancelled"; // optional if you need it
}

export interface Review {
  id: string;
  hotelId: string;
  guestId: string;
  rating: number; // 1–5
  comment: string;
  date: string; // date
}
