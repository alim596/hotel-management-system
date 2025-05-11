import { useQuery } from "@tanstack/react-query";
import { getHotels } from "../services/api";
import type { Hotel } from "../services/api";

export function useHotels() {
  return useQuery<Hotel[], Error>({
    queryKey: ["hotels"],
    queryFn: getHotels,
  });
}
