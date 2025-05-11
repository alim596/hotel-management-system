// src/components/SortControl.tsx
import type { ChangeEvent } from "react";

export type SortOption =
  | "price-asc"
  | "price-desc"
  | "rating-asc"
  | "rating-desc";

interface Props {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortControl({ value, onChange }: Props) {
  function handle(e: ChangeEvent<HTMLSelectElement>) {
    onChange(e.target.value as SortOption);
  }

  return (
    <div className="mb-4">
      <label className="mr-2 font-medium">Sort by:</label>
      <select value={value} onChange={handle} className="border rounded-md p-1">
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating-desc">Rating: High to Low</option>
        <option value="rating-asc">Rating: Low to High</option>
      </select>
    </div>
  );
}
