import type { Hotel } from "../services/types";
import { Link } from "react-router-dom";

type Props = { hotel: Hotel };

export default function HotelCard({ hotel }: Props) {
  return (
    <Link
      to={`/hotels/${hotel.HotelID}`}
      className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
        {hotel.Website ? (
          <img
            src={hotel.Website}
            alt={hotel.Name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-500">No image available</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{hotel.Name}</h3>
        <p className="text-sm text-gray-600">{hotel.City}</p>
        <p className="text-xs text-gray-500 mt-1">{hotel.Description}</p>
        <div className="mt-2 flex justify-between items-center">
          <div className="text-sm">
            <p>Check-in: {hotel.CheckInTime}</p>
            <p>Check-out: {hotel.CheckOutTime}</p>
          </div>
          {hotel.Rating && (
            <span className="text-yellow-500">{hotel.Rating}★</span>
          )}
        </div>
      </div>
    </Link>
  );
}
