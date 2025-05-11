import { Link } from "react-router-dom";
import SearchForm from "../components/SearchForm";

export default function Home() {
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Find Your Perfect Stay</h1>
      <SearchForm />
      <p className="mt-6 text-center text-gray-600">
        Or{" "}
        <Link to="/hotels" className="text-blue-600 underline">
          browse all hotels
        </Link>
      </p>
    </div>
  );
}
