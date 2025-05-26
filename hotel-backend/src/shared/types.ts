import { Request } from 'express';

export enum UserRole {
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
  MANAGER = 'MANAGER',
  HOTEL_MANAGER = 'HOTEL_MANAGER',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  FAILED = 'FAILED',
}

export enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
}

export interface JWTPayload {
  id: number;
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface DBUser {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  stripe_customer_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DBHotel {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  address: string;
  image_url: string[];
  average_rating: number;
  manager_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface DBRoom {
  id: number;
  hotel_id: number;
  name: string;
  description: string;
  capacity: number;
  price_per_night: number;
  room_type: RoomType;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
  manager_id: number;
}

export interface DBBooking {
  id: number;
  user_id: number;
  room_id: number;
  check_in: Date;
  check_out: Date;
  total_price: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  stripe_payment_intent_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DBReview {
  id: number;
  user_id: number;
  hotel_id: number;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
}

export interface DBBookingWithUser extends DBBooking {
  email: string;
  first_name: string;
  last_name: string;
  stripe_customer_id?: string;
}

export interface DBReviewWithUser extends DBReview {
  first_name: string;
  last_name: string;
}

export interface DashboardStats {
  users: {
    byRole: { role: UserRole; count: number }[];
    total: number;
  };
  hotels: {
    total_hotels: number;
    average_hotel_rating: number;
    highly_rated_hotels: number;
  };
  bookings: {
    total_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    completed_bookings: number;
    total_revenue: number;
  };
  recentActivity: {
    id: number;
    status: BookingStatus;
    payment_status: PaymentStatus;
    total_price: number;
    created_at: Date;
    user_email: string;
    hotel_name: string;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}
