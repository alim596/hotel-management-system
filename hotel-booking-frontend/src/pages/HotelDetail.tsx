import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getHotels } from "../services/api";
import type { Hotel } from "../services/api";

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    data: hotels,
    isLoading,
    error,
  } = useQuery<Hotel[], Error>({
    queryKey: ["hotels"],
    queryFn: getHotels,
  });

  if (isLoading) return <div className="p-4">Loading hotel details…</div>;
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  const hotel = hotels?.find((h) => h.id === id);
  if (!hotel) return <div className="p-4">Hotel not found.</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{hotel.name}</h1>
      <p className="text-gray-600 mb-6">{hotel.city}</p>
      <img
        src={hotel.imageUrl}
        alt={hotel.name}
        className="w-full h-64 object-cover rounded-lg mb-6"
      />
      <div className="mb-4">
        <span className="font-semibold">Rating:</span> {hotel.rating}★
      </div>
      <div className="mb-6">
        <span className="font-semibold">Price:</span> ${hotel.price}/night
      </div>
      <Link
        to={`/booking/${hotel.id}`}
        className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Book Now
      </Link>
    </div>
  );
}
