// src/pages/HotelList.tsx
import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import HotelCard from "../components/HotelCard";
import SortControl, { type SortOption } from "../components/SortControl";
import { useHotels } from "../hooks/useHotels";
import type { Hotel } from "../services/types";

export default function HotelList() {
  const { data: hotels, isLoading, error } = useHotels();
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState<SortOption>("price-asc");

  const city = searchParams.get("city") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "1";

  // 1) Filter by city and active status
  const filtered = useMemo(() => {
    if (!hotels) return [];
    return hotels.filter(
      (h) =>
        h.Status === "active" &&
        (city ? h.City.toLowerCase().includes(city.toLowerCase()) : true)
    );
  }, [hotels, city]);

  // 2) Sort according to sort state
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.BasePrice - b.BasePrice;
        case "price-desc":
          return b.BasePrice - a.BasePrice;
        case "rating-asc":
          return (a.Rating || 0) - (b.Rating || 0);
        case "rating-desc":
          return (b.Rating || 0) - (a.Rating || 0);
        default:
          return 0;
      }
    });
  }, [filtered, sort]);

  if (isLoading) return <div className="p-4">Loading hotels…</div>;
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      {/* Search summary */}
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-semibold">Search results</h2>
        <p className="text-gray-700">
          {city && (
            <>
              City: <span className="font-medium">{city}</span>.{" "}
            </>
          )}
          {checkIn && (
            <>
              Check-in: <span className="font-medium">{checkIn}</span>.{" "}
            </>
          )}
          {checkOut && (
            <>
              Check-out: <span className="font-medium">{checkOut}</span>.{" "}
            </>
          )}
          Guests: <span className="font-medium">{guests}</span>
        </p>
      </div>

      {/* Sort control */}
      <SortControl value={sort} onChange={setSort} />

      {/* Results */}
      {sorted.length === 0 ? (
        <p>No hotels found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((hotel) => (
            <HotelCard key={hotel.HotelID} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
}
