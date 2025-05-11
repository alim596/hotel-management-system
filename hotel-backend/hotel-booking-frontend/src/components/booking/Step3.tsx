import type { Step3Props } from "../../pages/Booking";

export default function Step3({
  form,
  roomTypes,
  onPrev,
  onConfirm,
}: Step3Props) {
  const room = roomTypes.find((rt) => rt.id === form.roomTypeId);
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        3. Review & Confirm
      </h2>
      <ul className="grid grid-cols-1 gap-2 text-gray-700">
        <li>
          <strong>Room:</strong> {room?.name}
        </li>
        <li>
          <strong>Check-in:</strong> {form.checkIn}
        </li>
        <li>
          <strong>Check-out:</strong> {form.checkOut}
        </li>
        <li>
          <strong>Name:</strong> {form.firstName} {form.lastName}
        </li>
        <li>
          <strong>Email:</strong> {form.email}
        </li>
        <li>
          <strong>Phone:</strong> {form.phone}
        </li>
      </ul>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
