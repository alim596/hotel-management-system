import type { Hotel } from "../services/api";
import { Link } from "react-router-dom";

type Props = { hotel: Hotel };

export default function HotelCard({ hotel }: Props) {
  return (
    <Link
      to={`/hotels/${hotel.id}`}
      className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <img
        src={hotel.imageUrl}
        alt={hotel.name}
        className="h-48 w-full object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{hotel.name}</h3>
        <p className="text-sm text-gray-600">{hotel.city}</p>
        <div className="mt-2 flex justify-between items-center">
          <span className="font-medium">${hotel.price}/night</span>
          <span className="text-yellow-500">{hotel.rating}★</span>
        </div>
      </div>
    </Link>
  );
}
