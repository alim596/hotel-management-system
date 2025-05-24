// src/pages/Booking.tsx
import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useHotel } from "../hooks/useHotel";
import { useRoomTypes } from "../hooks/useRoomTypes";
import { createReservation } from "../services/api";
import type { RoomType, CreateReservationDto } from "../services/types";

import StepSelector from "../components/booking/StepSelector";
import Step1 from "../components/booking/Step1";
import Step2 from "../components/booking/Step2";
import Step3 from "../components/booking/Step3";

// Toastify imports
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export type BookingForm = {
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  numberOfGuests: number;
  specialRequests?: string;
};

export type Step1Props = {
  form: BookingForm;
  roomTypes: RoomType[];
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onNext: (e?: FormEvent) => void;
};

export type Step2Props = {
  form: BookingForm;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPrev: () => void;
  onNext: () => void;
};

export type Step3Props = {
  form: BookingForm;
  roomTypes: RoomType[];
  onPrev: () => void;
  onConfirm: () => void;
};

export default function Booking() {
  const navigate = useNavigate();
  const { hotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  const { data: hotel, isLoading: hLoading, error: hError } = useHotel();
  const {
    data: roomTypes,
    isLoading: rtLoading,
    error: rtError,
  } = useRoomTypes(hotelId);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BookingForm>({
    roomTypeId: parseInt(searchParams.get("roomType") || "0"),
    checkIn: "",
    checkOut: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    numberOfGuests: 1,
    specialRequests: "",
  });

  // Pre-fill dates from URL
  useEffect(() => {
    setForm((f) => ({
      ...f,
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
    }));
  }, [searchParams]);

  if (hLoading || rtLoading)
    return <div className="p-6 text-center">Loading…</div>;
  if (hError)
    return <div className="p-6 text-red-500">Error: {hError.message}</div>;
  if (!hotel) return <div className="p-6 text-center">Hotel not found.</div>;
  if (rtError)
    return <div className="p-6 text-red-500">Error: {rtError.message}</div>;

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  const next = (e?: FormEvent) => {
    e?.preventDefault();
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => s - 1);

  const confirm = async () => {
    try {
      // Find the selected room type
      const selectedRoomType = roomTypes?.find(
        (rt) => rt.RoomTypeID === form.roomTypeId
      );
      if (!selectedRoomType) {
        throw new Error("Selected room type not found");
      }

      // Create reservation data
      const reservationData: CreateReservationDto = {
        GuestID: 0, // This will be set after creating/finding the guest
        CheckInDate: form.checkIn,
        CheckOutDate: form.checkOut,
        NumberOfGuests: form.numberOfGuests,
        SpecialRequests: form.specialRequests,
        TotalPrice: selectedRoomType.BasePrice,
        FinalAmount: selectedRoomType.BasePrice, // Add tax calculation logic if needed
        RoomDetails: [
          {
            RoomID: 0, // This will be assigned by the backend
            DailyRate: selectedRoomType.BasePrice,
          },
        ],
      };

      // Create the reservation
      const reservation = await createReservation(reservationData);

      toast.success("Booking confirmed successfully!");
      // Redirect to the confirmation page
      navigate(`/booking/confirmation/${reservation.ReservationID}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create reservation"
      );
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
      />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Booking: {hotel.Name}
      </h1>

      <StepSelector currentStep={step} />

      {step === 1 && (
        <Step1
          form={form}
          roomTypes={roomTypes!}
          onChange={handleChange}
          onNext={next}
        />
      )}

      {step === 2 && (
        <Step2
          form={form}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
          onPrev={prev}
          onNext={next}
        />
      )}

      {step === 3 && (
        <Step3
          form={form}
          roomTypes={roomTypes!}
          onPrev={prev}
          onConfirm={confirm}
        />
      )}
    </div>
  );
}
