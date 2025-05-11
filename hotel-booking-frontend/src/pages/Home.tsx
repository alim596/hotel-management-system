import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to the Hotel Booking System
      </h1>
      <p className="mb-6">Find and book your perfect stay with ease.</p>
      <Link
        to="/hotels"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Browse Hotels
      </Link>
    </div>
  );
}
