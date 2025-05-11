import { useQuery } from "@tanstack/react-query";
import { getBookingById } from "../services/api";
import type { Booking } from "../services/types";

export function useBooking(id?: string) {
  return useQuery<Booking, Error>({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id!),
    enabled: Boolean(id),
  });
}
