import { useQuery } from "@tanstack/react-query";
import { getHotels } from "../services/api";
import type { Hotel } from "../services/types";

/**
 * Hook to fetch the list of all hotels.
 * Returns a React Query result containing Hotel[] data.
 */
export function useHotels() {
  return useQuery<Hotel[], Error>({
    queryKey: ["hotels"],
    queryFn: getHotels,
  });
}
