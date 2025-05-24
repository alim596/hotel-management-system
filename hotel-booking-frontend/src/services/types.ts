export interface Hotel {
  HotelID: number;
  Name: string;
  Address: string;
  City: string;
  Country: string;
  PhoneNumber: string;
  Email: string;
  Website?: string;
  Description?: string;
  CheckInTime: string;
  CheckOutTime: string;
  Rating?: number;
  Status: "active" | "inactive";
}

export interface RoomType {
  RoomTypeID: number;
  HotelID: number;
  Name: string;
  Description: string;
  Capacity: number;
  BedType: string;
  BasePrice: number;
  Status: "active" | "inactive";
}

export interface Room {
  RoomID: number;
  RoomTypeID: number;
  RoomNumber: string;
  Floor: number;
  Status: "available" | "occupied" | "maintenance";
  Notes?: string;
}

export interface Guest {
  GuestID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: string;
  Address?: string;
  City?: string;
  Country?: string;
  PreferredLanguage?: string;
  LoyaltyPoints?: number;
  Status: "active" | "inactive";
}

export interface Reservation {
  ReservationID: number;
  GuestID: number;
  BookingDate: string;
  CheckInDate: string;
  CheckOutDate: string;
  NumberOfGuests: number;
  Status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
  SpecialRequests?: string;
  TotalPrice: number;
  TaxAmount?: number;
  DiscountAmount?: number;
  FinalAmount: number;
  PromotionID?: number;
  CancellationDate?: string;
  CancellationReason?: string;
}

export interface ReservationDetail {
  ReservationDetailID: number;
  ReservationID: number;
  RoomID: number;
  DailyRate: number;
}

export interface CreateReservationDto {
  GuestID: number;
  CheckInDate: string;
  CheckOutDate: string;
  NumberOfGuests: number;
  SpecialRequests?: string;
  TotalPrice: number;
  TaxAmount?: number;
  DiscountAmount?: number;
  FinalAmount: number;
  PromotionID?: number;
  RoomDetails: {
    RoomID: number;
    DailyRate: number;
  }[];
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}
