import HotelCard from "../components/HotelCard";
import { useHotels } from "../hooks/useHotels";

export default function HotelList() {
  const { data: hotels, isLoading, error } = useHotels();

  if (isLoading) return <div className="p-4">Loading hotels…</div>;
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {hotels!.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}
