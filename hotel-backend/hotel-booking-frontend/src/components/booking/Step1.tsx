import type { RoomType } from "../../services/types";
import type { Step1Props } from "../../pages/Booking";

export default function Step1({
  form,
  roomTypes,
  onChange,
  onNext,
}: Step1Props) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        1. Select Room & Dates
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Room Type
          </label>
          <select
            name="roomTypeId"
            value={form.roomTypeId}
            onChange={onChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose a room</option>
            {roomTypes.map((rt: RoomType) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} — ${rt.basePrice}/night
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Check-in
            </label>
            <input
              type="date"
              name="checkIn"
              value={form.checkIn}
              onChange={onChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Check-out
            </label>
            <input
              type="date"
              name="checkOut"
              value={form.checkOut}
              onChange={onChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
