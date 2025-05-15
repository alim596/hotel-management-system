//import destinations from "@/data/destinations";  //implement backend later
import { useState, useEffect } from "react";
import { FaSearchLocation, FaCalendarAlt, FaUser, FaDownload, FaRegCommentDots} from "react-icons/fa";
import {IoLogInOutline} from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


/* for search bar, will bring once connecting to backend
const [query, setQuery] = useState("");
const [filteredDestinations, setFilteredDestinations] = useState<string[]>([]);
const [showDropdown, setShowDropdown] = useState(false);

useEffect(() => {
  if (query.trim() === "") {
    setFilteredDestinations([]);
    setShowDropdown(false);
    return;
  }

  const results = destinations.filter((place) =>
    place.toLowerCase().includes(query.toLowerCase())
  );

  setFilteredDestinations(results);
  setShowDropdown(results.length > 0);
}, [query]);

const handleSelect = (value: string) => {
  setQuery(value);
  setShowDropdown(false);
};*/

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
        {/* Left side: Logo and menu */}
        <div className="flex items-center gap-6">
          <span className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Hotel Booking System
          </span>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-5 mt-3 sm:mt-0 text-sm">
          <span className="text-gray-700 font-medium">TRY </span>
          <a href="#" className="text-red-600 hover:underline font-medium">
            Support
          </a>
          <a href="#" className="text-red-600 hover:underline font-medium">
            Travels
          </a>
          <a href="#" className="text-red-600 hover:underline font-medium">
            Register
          </a>
          <a href="#" className="text-red-600 hover:underline font-medium flex items-center gap-1">
            <IoLogInOutline />Log in
          </a>
        </div>
      </div>
    </nav>
  );
}
export default function Home() {
  //for check in and check out
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  //for number of guests and rooms option
  type Room = {
    adults: number;
    children: number;
  };
  const [rooms, setRooms] = useState<Room[]>([
    { adults: 2, children: 0 },
  ]);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);


  //remove the three lines below when we bring back the top commented part after connecting destinations.ts for the search bar
  const [query, setQuery] = useState("");
  const [filteredDestinations, setFilteredDestinations] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-blue-700 text-white py-16 text-center px-4">
          <h1 className="text-4xl font-extrabold mb-3">Find your next stay</h1>
          <p className="text-lg">Search deals on hotels, homes and more...</p>
        </div>

        {/* Search Bar */}
        
        <div className="flex justify-center px-4 -mt-8 z-10 relative">
          <div className="bg-white border-4 border-yellow-400 rounded-xl shadow-md p-4 w-full max-w-6xl grid grid-cols-1 md:grid-cols-[2fr_2fr_2fr_1fr] gap-2 items-center">
            {/* Destination */}
            <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
              <FaSearchLocation className="text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where are you going?"
                className="w-full outline-none placeholder-gray-500"
                onFocus={() => {
                  if (query.trim() !== "") setShowDropdown(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowDropdown(false), 100); // delay for click to register
                }}
              />
            </div>
                
            {showDropdown && (
              <ul className="absolute left-0 right-0 bg-white border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto z-20">
                {filteredDestinations.map((place) => (
                  <li
                    key={place}
                    //onClick={() => handleSelect(place)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {place}
                  </li>
                ))}
              </ul>
            )}
          </div>

            {/* Dates */}
            <div className="flex gap-4 items-center">
            {/* Check-in */}
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md w-full">
              <FaCalendarAlt className="text-gray-500" />
              <DatePicker
                selected={checkInDate}
                onChange={(date) => setCheckInDate(date)}
                selectsStart
                startDate={checkInDate}
                endDate={checkOutDate}
                placeholderText="Check-in"
                className="outline-none w-full text-sm"
              />
            </div>

            {/* Check-out */}
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md w-full">
              <FaCalendarAlt className="text-gray-500" />
              <DatePicker
                selected={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                selectsEnd
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={checkInDate}
                placeholderText="Check-out"
                className="outline-none w-full text-sm"
              />
            </div>
          </div>

            {/* Guests */}
            <div className="relative">
            {/* Trigger */}
            <div
              className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer"
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            >
              <FaUser className="text-gray-500" />
              <span className="text-gray-700">
                {rooms.reduce((sum, r) => sum + r.adults + r.children, 0)} guests, {rooms.length} room{rooms.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Dropdown */}
            {showGuestDropdown && (
              <div className="absolute bg-white border rounded-md shadow-md p-4 mt-2 w-72 z-20 space-y-4">
                {rooms.map((room, index) => (
                  <div key={index} className="space-y-3 border-b pb-4">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-700">Room {index + 1}</p>
                      {rooms.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = [...rooms];
                            updated.splice(index, 1);
                            setRooms(updated);
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Adults */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Number of Adults</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const updated = [...rooms];
                            updated[index].adults = Math.max(1, updated[index].adults - 1);
                            setRooms(updated);
                          }}
                          className="w-6 h-6 flex items-center justify-center border rounded-full"
                        >−</button>
                        <span>{room.adults}</span>
                        <button
                          onClick={() => {
                            const updated = [...rooms];
                            updated[index].adults += 1;
                            setRooms(updated);
                          }}
                          className="w-6 h-6 flex items-center justify-center border rounded-full"
                        >+</button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Number of Children
                        <span className="block text-xs text-gray-400">0–17 years old</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const updated = [...rooms];
                            updated[index].children = Math.max(0, updated[index].children - 1);
                            setRooms(updated);
                          }}
                          className="w-6 h-6 flex items-center justify-center border rounded-full"
                        >−</button>
                        <span>{room.children}</span>
                        <button
                          onClick={() => {
                            const updated = [...rooms];
                            updated[index].children += 1;
                            setRooms(updated);
                          }}
                          className="w-6 h-6 flex items-center justify-center border rounded-full"
                        >+</button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Another Room */}
                <div className="text-center">
                  <button
                    onClick={() => setRooms([...rooms, { adults: 2, children: 0 }])}
                    className="text-blue-600 hover:underline font-medium text-sm"
                  >
                    Add another room
                  </button>
                </div>
              </div>
            )}
          </div>



            {/* Search Button */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 w-full">
              Search
            </button>
          </div>
        </div>

        {/* Browse All Hotels Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Or{" "}
            <a
              href="/hotels"
              className="text-blue-600 font-medium underline hover:text-blue-800"
            >
              browse all hotels
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
