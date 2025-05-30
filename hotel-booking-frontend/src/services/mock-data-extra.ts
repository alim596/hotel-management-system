// src/services/mock-data.ts
import type { Hotel, RoomType, Room, Guest, Review, Booking } from "./types";

// --- Hotels ---
export const mockHotels: Hotel[] = [
  {
    id: "1",
    name: "Grand Istanbul Hotel",
    city: "Istanbul",
    rating: 4.5,
    price: 120,
    imageUrl: "/assets/hotel1.jpg",
  },
  {
    id: "2",
    name: "Ankara Comfort Suites",
    city: "Ankara",
    rating: 4.0,
    price: 95,
    imageUrl: "/assets/hotel2.jpg",
  },
  {
    id: "3",
    name: "Cozy Cappadocia Inn",
    city: "Nevşehir",
    rating: 4.2,
    price: 110,
    imageUrl: "/assets/hotel3.jpg",
  },
  {
    id: "4",
    name: "Antalya Beach Resort",
    city: "Antalya",
    rating: 4.8,
    price: 200,
    imageUrl: "/assets/hotel4.jpg",
  },
  {
    id: "5",
    name: "Bursa Historic Lodge",
    city: "Bursa",
    rating: 3.9,
    price: 80,
    imageUrl: "/assets/hotel5.jpg",
  },
  {
    id: "6",
    name: "Izmir Seaside Hotel",
    city: "Izmir",
    rating: 4.3,
    price: 130,
    imageUrl: "/assets/hotel6.jpg",
  },
  {
    id: "7",
    name: "Pamukkale Thermal Spa",
    city: "Denizli",
    rating: 4.6,
    price: 150,
    imageUrl: "/assets/hotel7.jpg",
  },
  {
    id: "8",
    name: "Trabzon Mountain Retreat",
    city: "Trabzon",
    rating: 4.1,
    price: 105,
    imageUrl: "/assets/hotel8.jpg",
  },
];

// --- Room Types ---
export const mockRoomTypes: RoomType[] = [
  // for hotel 1
  {
    id: "rt1",
    hotelId: "1",
    name: "Standard Room",
    description: "Queen bed, city view",
    capacity: 2,
    bedType: "Queen",
    sizeInSqFt: 250,
    basePrice: 100,
    images: ["/assets/room1.jpg"],
  },
  {
    id: "rt2",
    hotelId: "1",
    name: "Deluxe Suite",
    description: "King bed + living area",
    capacity: 4,
    bedType: "King",
    sizeInSqFt: 450,
    basePrice: 200,
    images: ["/assets/room2.jpg"],
  },
  // for hotel 2
  {
    id: "rt3",
    hotelId: "2",
    name: "Economy Room",
    description: "Double bed, budget-friendly",
    capacity: 2,
    bedType: "Double",
    sizeInSqFt: 200,
    basePrice: 80,
    images: ["/assets/room3.jpg"],
  },
  {
    id: "rt4",
    hotelId: "2",
    name: "Family Suite",
    description: "Two bedrooms, suite style",
    capacity: 6,
    bedType: "Queen",
    sizeInSqFt: 600,
    basePrice: 180,
    images: ["/assets/room4.jpg"],
  },
  // for hotel 3
  {
    id: "rt5",
    hotelId: "3",
    name: "Cave Room",
    description: "Traditional cave lodging",
    capacity: 2,
    bedType: "Queen",
    sizeInSqFt: 300,
    basePrice: 120,
    images: ["/assets/room5.jpg"],
  },
  // and so on…
  {
    id: "rt6",
    hotelId: "4",
    name: "Sea View Deluxe",
    description: "Balcony with sea view",
    capacity: 3,
    bedType: "King",
    sizeInSqFt: 350,
    basePrice: 220,
    images: ["/assets/room6.jpg"],
  },
  {
    id: "rt7",
    hotelId: "5",
    name: "Historic Suite",
    description: "Heritage decor suite",
    capacity: 2,
    bedType: "Double",
    sizeInSqFt: 400,
    basePrice: 90,
    images: ["/assets/room7.jpg"],
  },
  {
    id: "rt8",
    hotelId: "6",
    name: "Penthouse",
    description: "Top-floor luxury",
    capacity: 4,
    bedType: "King",
    sizeInSqFt: 550,
    basePrice: 300,
    images: ["/assets/room8.jpg"],
  },
  {
    id: "rt9",
    hotelId: "7",
    name: "Thermal Suite",
    description: "Private thermal pool",
    capacity: 2,
    bedType: "Queen",
    sizeInSqFt: 500,
    basePrice: 250,
    images: ["/assets/room9.jpg"],
  },
  {
    id: "rt10",
    hotelId: "8",
    name: "Mountain Cabin",
    description: "Rustic wood cabin",
    capacity: 3,
    bedType: "Double",
    sizeInSqFt: 320,
    basePrice: 140,
    images: ["/assets/room10.jpg"],
  },
];

// --- Rooms ---
export const mockRooms: Room[] = mockRoomTypes.flatMap((rt) => [
  {
    id: `${rt.id}-1`,
    hotelId: rt.hotelId,
    roomTypeId: rt.id,
    roomNumber: `1${rt.id}`,
    floor: 1,
    status: "available",
  },
  {
    id: `${rt.id}-2`,
    hotelId: rt.hotelId,
    roomTypeId: rt.id,
    roomNumber: `2${rt.id}`,
    floor: 2,
    status: Math.random() < 0.2 ? "maintenance" : "available",
  },
]);

// --- Guests ---
export const mockGuests: Guest[] = [
  {
    id: "g1",
    firstName: "Alice",
    lastName: "Yılmaz",
    email: "alice@example.com",
    phone: "+905551112233",
  },
  {
    id: "g2",
    firstName: "Burak",
    lastName: "Kaya",
    email: "burak@example.com",
    phone: "+905559998877",
  },
  {
    id: "g3",
    firstName: "Ceren",
    lastName: "Demir",
    email: "ceren@example.com",
    phone: "+905553334455",
  },
];

// --- Reservations ---
export const mockReservations: Booking[] = [
  {
    id: "res1",
    guestId: "g1",
    roomId: "rt1-1",
    checkIn: "2025-06-01",
    checkOut: "2025-06-05",
    totalPrice: 100 * 4,
    status: "confirmed",
  },
  {
    id: "res2",
    guestId: "g2",
    roomId: "rt4-2",
    checkIn: "2025-07-10",
    checkOut: "2025-07-15",
    totalPrice: 180 * 5,
    status: "pending",
  },
];

// --- Reviews ---
export const mockReviews: Review[] = [
  {
    id: "rev1",
    hotelId: "1",
    guestId: "g1",
    rating: 5,
    comment: "Fantastic stay with amazing service!",
    date: "2025-04-20",
  },
  {
    id: "rev2",
    hotelId: "4",
    guestId: "g3",
    rating: 4,
    comment: "Beautiful location but a bit noisy.",
    date: "2025-05-01",
  },
];
