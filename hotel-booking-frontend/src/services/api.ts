export interface Hotel {
  id: string;
  name: string;
  city: string;
  rating: number;
  price: number;
  imageUrl: string;
}

export async function getHotels(): Promise<Hotel[]> {
  // TODO: replace with real API call via axios later
  return Promise.resolve([
    {
      id: "1",
      name: "Grand Istanbul Hotel",
      city: "Istanbul",
      rating: 4.5,
      price: 120,
      imageUrl: "/assets/hotel1.jpg",
    },
    {
      id: "2",
      name: "Ankara Comfort Suites",
      city: "Ankara",
      rating: 4.0,
      price: 95,
      imageUrl: "/assets/hotel2.jpg",
    },
    // …add a few more for your mock
  ]);
}
