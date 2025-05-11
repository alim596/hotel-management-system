// src/hooks/useHotel.ts
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getHotelById } from "../services/api";
import type { Hotel } from "../services/types";

export function useHotel() {
  const { hotelId } = useParams<{ hotelId: string }>();
  return useQuery<Hotel, Error>({
    queryKey: ["hotel", hotelId],
    queryFn: () => getHotelById(hotelId!),
    enabled: Boolean(hotelId),
  });
}
