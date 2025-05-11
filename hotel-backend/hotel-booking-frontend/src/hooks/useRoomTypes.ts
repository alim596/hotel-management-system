import { useQuery } from "@tanstack/react-query";
import { getRoomTypesByHotelId } from "../services/api";
import type { RoomType } from "../services/types";

export function useRoomTypes(hotelId: string | undefined) {
  return useQuery<RoomType[], Error>({
    queryKey: ["roomTypes", hotelId],
    queryFn: () => getRoomTypesByHotelId(hotelId!),
    enabled: Boolean(hotelId),
  });
}
