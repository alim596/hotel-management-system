// src/pages/HotelDetail.tsx
import { useHotel } from "../hooks/useHotel";
import { useRoomTypes } from "../hooks/useRoomTypes";
import type { RoomType } from "../services/types";
import { Link } from "react-router-dom";

export default function HotelDetail() {
  const { data: hotel, isLoading: hLoading, error: hError } = useHotel();
  const {
    data: roomTypes,
    isLoading: rtLoading,
    error: rtError,
  } = useRoomTypes(hotel?.id);

  if (hLoading || rtLoading) return <div className="p-4">Loading…</div>;
  if (hError)
    return <div className="p-4 text-red-500">Error: {hError.message}</div>;
  if (!hotel) return <div className="p-4">Hotel not found.</div>;
  if (rtError)
    return <div className="p-4 text-red-500">Error: {rtError.message}</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      {/* Hotel Info */}
      <h1 className="text-3xl font-bold">{hotel.name}</h1>
      <p className="text-gray-600">{hotel.city}</p>
      <img
        src={hotel.imageUrl}
        alt={hotel.name}
        className="w-full h-64 object-cover rounded-lg"
      />
      <div className="flex gap-4">
        <span className="font-semibold">Rating:</span> {hotel.rating}★
        <span className="font-semibold">Price:</span> ${hotel.price}/night
      </div>

      {/* Room Types */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Room Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {roomTypes!.map((rt: RoomType) => (
            <div
              key={rt.id}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <img
                src={rt.images[0]}
                alt={rt.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-medium">{rt.name}</h3>
                <p className="text-gray-700">{rt.description}</p>
                <p className="mt-2">
                  <span className="font-semibold">Capacity:</span> {rt.capacity}{" "}
                  guests
                </p>
                <p>
                  <span className="font-semibold">Bed Type:</span> {rt.bedType}
                </p>
                <p>
                  <span className="font-semibold">Size:</span> {rt.sizeInSqFt}{" "}
                  ft²
                </p>
                <p className="mt-2 font-bold">${rt.basePrice}/night</p>
                <Link
                  to={`/booking/${hotel.id}`}
                  className="mt-4 inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                >
                  Select
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
