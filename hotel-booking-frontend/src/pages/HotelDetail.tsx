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
  } = useRoomTypes(hotel?.HotelID?.toString());

  if (hLoading || rtLoading) return <div className="p-4">Loading…</div>;
  if (hError)
    return <div className="p-4 text-red-500">Error: {hError.message}</div>;
  if (!hotel) return <div className="p-4">Hotel not found.</div>;
  if (rtError)
    return <div className="p-4 text-red-500">Error: {rtError.message}</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      {/* Hotel Info */}
      <h1 className="text-3xl font-bold">{hotel.Name}</h1>
      <div className="text-gray-600">
        <p>{hotel.Address}</p>
        <p>
          {hotel.City}, {hotel.Country}
        </p>
        <p>Phone: {hotel.PhoneNumber}</p>
        <p>Email: {hotel.Email}</p>
      </div>
      {hotel.Website && (
        <img
          src={hotel.Website}
          alt={hotel.Name}
          className="w-full h-64 object-cover rounded-lg"
        />
      )}
      <div className="grid grid-cols-2 gap-4">
        {hotel.Rating && (
          <div>
            <span className="font-semibold">Rating:</span> {hotel.Rating}★
          </div>
        )}
        <div>
          <span className="font-semibold">Check-in:</span> {hotel.CheckInTime}
        </div>
        <div>
          <span className="font-semibold">Check-out:</span> {hotel.CheckOutTime}
        </div>
      </div>
      {hotel.Description && (
        <p className="text-gray-700">{hotel.Description}</p>
      )}

      {/* Room Types */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Room Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {roomTypes!.map((rt: RoomType) => (
            <div
              key={rt.RoomTypeID}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-4">
                <h3 className="text-xl font-medium">{rt.Name}</h3>
                <p className="text-gray-700">{rt.Description}</p>
                <p className="mt-2">
                  <span className="font-semibold">Capacity:</span> {rt.Capacity}{" "}
                  guests
                </p>
                <p>
                  <span className="font-semibold">Bed Type:</span> {rt.BedType}
                </p>
                <p className="mt-2 font-bold">${rt.BasePrice}/night</p>
                {rt.Status === "active" && (
                  <Link
                    to={`/booking/${hotel.HotelID}?roomType=${rt.RoomTypeID}`}
                    className="mt-4 inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                  >
                    Select
                  </Link>
                )}
                {rt.Status === "inactive" && (
                  <p className="mt-4 text-red-500">Currently Unavailable</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
