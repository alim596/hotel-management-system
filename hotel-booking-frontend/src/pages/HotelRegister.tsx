import { useState } from "react";
import { Link } from "react-router-dom";
import { IoLogInOutline } from "react-icons/io5";

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-2xl font-bold text-gray-800 flex items-center gap-2 hover:text-blue-600 cursor-pointer"
          >
            Hotel Booking System
          </Link>
        </div>
        <div className="flex items-center gap-5 mt-3 sm:mt-0 text-sm">
          <span className="text-gray-700 font-medium">TRY </span>
          <Link to="/support" className="text-red-600 hover:underline font-medium">
            Support
          </Link>
          <a href="#" className="text-red-600 hover:underline font-medium">
            Travels
          </a>
          <a href="#" className="text-red-600 hover:underline font-medium">
            Register
          </a>
          <a href="#" className="text-red-600 hover:underline font-medium flex items-center gap-1">
            <IoLogInOutline /> Log in
          </a>
        </div>
      </div>
    </nav>
  );
}

type RoomType = {
  name: string;
  description: string;
  capacity: number;
  bedType: string;
  sizeInSqFt: number;
  basePrice: number;
};

export default function CreateHotel() {
  const [hotel, setHotel] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    phoneNumber: "",
    email: "",
    websiteURL: "",
    rating: "0",
  });

  const [rooms, setRooms] = useState<RoomType[]>([
    {
      name: "",
      description: "",
      capacity: 1,
      bedType: "Single",
      sizeInSqFt: 0,
      basePrice: 0,
    },
  ]);

  const handleHotelChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHotel({ ...hotel, [e.target.name]: e.target.value });
  };

  const handleRoomChange = <K extends keyof RoomType>(
    index: number,
    field: K,
    value: RoomType[K]
  ) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    setRooms([
      ...rooms,
      {
        name: "",
        description: "",
        capacity: 1,
        bedType: "Single",
        sizeInSqFt: 0,
        basePrice: 0,
      },
    ]);
  };

  const removeRoom = (index: number) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...hotel,
      rooms,
    };
    console.log("Hotel data:", payload);
  };

  return (
    <>
      <Navbar />
      {/* Top Image Row */}
      <div className="flex justify-center gap-4 mt-6 mb-4 px-4">
          <div className="bg-gray-200 rounded-lg shadow-inner flex items-center justify-center text-gray-500">
            <img src="\src\hotel_room.png" alt="Hotel Room"/>
          </div>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-800">Hotel Registration</h1>
        <p className="text-gray-500">Showcase your hotel to the world!</p>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6 mb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hotel Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(hotel)
            .filter(([key]) => key !== "rating") // 👈 Exclude rating from input rendering
            .map(([key, value]) => (
                <input
                key={key}
                name={key}
                placeholder={key.replace(/([A-Z])/g, " $1")}
                value={value}
                onChange={handleHotelChange}
                className="p-2 border rounded"
                required={["name", "email"].includes(key)}
                />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Hotel Rating:</label>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                key={star}
                className={`cursor-pointer text-2xl ${
                    parseInt(hotel.rating) >= star ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setHotel({ ...hotel, rating: star.toString() })}
                >
                ★
                </span>
            ))}
            <span className="text-sm text-gray-500 ml-2">{hotel.rating}/5</span>
            </div>

          {/* Room Info */}
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Room Types</h2>
            {rooms.map((room, index) => (
                <div key={index} className="border p-4 mt-4 rounded-md bg-gray-50 shadow-sm">
                <h3 className="font-medium text-gray-700 mb-2">Room {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Room Name */}
                    <div>
                    <label className="text-sm text-gray-600 mb-1 block">Room Name</label>
                    <input
                        type="text"
                        placeholder="e.g., Deluxe Suite"
                        value={room.name}
                        onChange={(e) => handleRoomChange(index, "name", e.target.value)}
                        className="p-2 border rounded w-full"
                        required
                    />
                    </div>

                    {/* Capacity */}
                    <div>
                    <label className="text-sm text-gray-600 mb-1 block">Capacity</label>
                    <input
                        type="number"
                        placeholder="Number of guests the room can accommodate"
                        value={room.capacity}
                        onChange={(e) => handleRoomChange(index, "capacity", parseInt(e.target.value))}
                        className="p-2 border rounded w-full"
                        required
                    />
                    </div>

                    {/* Bed Type */}
                    <div>
                    <label className="text-sm text-gray-600 mb-1 block">Bed Type</label>
                    <select
                        value={room.bedType}
                        onChange={(e) => handleRoomChange(index, "bedType", e.target.value)}
                        className="p-2 border rounded w-full"
                    >
                        <option>Single</option>
                        <option>Double</option>
                        <option>Queen</option>
                        <option>King</option>
                    </select>
                    </div>

                    {/* Room Size */}
                    <div>
                    <label className="text-sm text-gray-600 mb-1 block">Room Size (sq ft)</label>
                    <input
                        type="number"
                        placeholder="e.g., 250"
                        value={room.sizeInSqFt}
                        onChange={(e) => handleRoomChange(index, "sizeInSqFt", parseInt(e.target.value))}
                        className="p-2 border rounded w-full"
                    />
                    </div>

                    {/* Base Price */}
                    <div>
                    <label className="text-sm text-gray-600 mb-1 block">Base Price ($)</label>
                    <input
                        type="number"
                        placeholder="e.g., 120"
                        value={room.basePrice}
                        onChange={(e) => handleRoomChange(index, "basePrice", parseFloat(e.target.value))}
                        className="p-2 border rounded w-full"
                    />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 mb-1 block">Room Description</label>
                    <textarea
                        placeholder="Describe features like amenities, view, or layout"
                        value={room.description}
                        onChange={(e) => handleRoomChange(index, "description", e.target.value)}
                        className="p-2 border rounded w-full"
                    />
                    </div>
                </div>

                {/* Remove Button */}
                {rooms.length > 1 && (
                    <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    className="mt-2 text-red-600 hover:underline"
                    >
                    Remove Room
                    </button>
                )}
                </div>
            ))}

            {/* Add Room Button */}
            <button
                type="button"
                onClick={addRoom}
                className="text-blue-600 hover:underline mt-4 block"
            >
                + Add Another Room
            </button>
            </div>


          {/* Image Upload Placeholder */}
          <div>
            <label className="block font-medium mb-1">Hotel Image (coming soon)</label>
            <input type="file" disabled className="p-2 border rounded bg-gray-100 cursor-not-allowed" />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md text-lg"
            >
              Submit Hotel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
