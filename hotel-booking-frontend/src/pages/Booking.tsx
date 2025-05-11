import { useParams } from "react-router-dom";

export default function Booking() {
  const { hotelId } = useParams<{ hotelId: string }>();
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Booking for Hotel {hotelId}</h1>
      <p className="mb-6">Booking form and steps will be implemented here.</p>
      {/* TODO: Add multi-step booking wizard: select room, guest details, payment */}
    </div>
  );
}
