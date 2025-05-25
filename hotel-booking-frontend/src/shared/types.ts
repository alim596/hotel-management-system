export enum UserRole {
  GUEST = "GUEST",
  HOTEL_MANAGER = "HOTEL_MANAGER",
  ADMIN = "ADMIN",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  totalBookings?: number;
  totalSpent?: number;
}

export interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
}

export interface Room {
  id: number;
  hotel_id: number;
  name: string;
  description: string;
  type: string;
  capacity: number;
  price_per_night: number;
  amenities: string[];
  images: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: number;
  userId: number;
  hotelId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  createdAt: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  hotel?: {
    name: string;
  };
}

export interface Review {
  id: number;
  user_id: number;
  hotel_id: number;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  status: PaymentStatus;
  stripe_payment_intent_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface DashboardStats {
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: Array<{
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    status: BookingStatus;
    payment_status: PaymentStatus;
    total_price: number;
    created_at: string;
  }>;
  usersByRole: Array<{
    role: UserRole;
    count: string;
  }>;
  bookingsByStatus: Array<{
    status: BookingStatus;
    count: string;
  }>;
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}
