// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import HotelList from "./pages/HotelList";
import HotelDetail from "./pages/HotelDetail";
import Booking from "./pages/Booking";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hotels" element={<HotelList />} />
      <Route path="/hotels/:hotelId" element={<HotelDetail />} />
      <Route path="/booking/:hotelId" element={<Booking />} />
      {/* Redirect any unknown route back to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
