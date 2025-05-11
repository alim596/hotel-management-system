// src/components/SearchForm.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchForm() {
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const navigate = useNavigate();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", String(guests));
    navigate(`/hotels?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700"
        >
          City
        </label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Istanbul"
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="checkIn"
            className="block text-sm font-medium text-gray-700"
          >
            Check-in
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label
            htmlFor="checkOut"
            className="block text-sm font-medium text-gray-700"
          >
            Check-out
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="guests"
          className="block text-sm font-medium text-gray-700"
        >
          Guests
        </label>
        <input
          id="guests"
          type="number"
          min={1}
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Search
      </button>
    </form>
  );
}
