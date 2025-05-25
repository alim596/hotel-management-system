export enum UserRole {
  GUEST = 'guest',
  HOTEL_MANAGER = 'hotel_manager',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  starRating: number;
  amenities: string[];
  images: string[];
  managerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: number;
  hotelId: number;
  name: string;
  description: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export interface Review {
  id: number;
  userId: number;
  hotelId: number;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
