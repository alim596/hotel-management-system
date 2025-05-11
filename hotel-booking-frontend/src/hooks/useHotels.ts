// src/hooks/useHotels.ts
import { useQuery } from "@tanstack/react-query";
import { getHotels } from "../services/api";
import type { Hotel } from "../services/types";

export function useHotels() {
  return useQuery<Hotel[], Error>({
    queryKey: ["hotels"],
    queryFn: getHotels,
  });
}
