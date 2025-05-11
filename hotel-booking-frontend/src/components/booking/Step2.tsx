import type { ChangeEvent } from "react";
import type { Step2Props } from "../../pages/Booking";

export default function Step2({ form, onChange, onPrev, onNext }: Step2Props) {
  const fields: Array<keyof typeof form> = [
    "firstName",
    "lastName",
    "email",
    "phone",
  ];
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        2. Your Information
      </h2>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700">
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase())}
            </label>
            <input
              type={
                field === "email" ? "email" : field === "phone" ? "tel" : "text"
              }
              name={field}
              value={form[field]}
              onChange={onChange as ChangeEvent<HTMLInputElement> & any}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
        >
          Back
        </button>
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
