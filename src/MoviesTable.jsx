import { useEffect, useState } from "react";

const API_URL = "https://ott-release-backend.onrender.com/movies";

export default function MoviesTable() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setMovies(data))
      .catch((error) => console.error("Error fetching movies:", error));
  }, []);

  return (
    <div className="w-full max-w-4xl overflow-x-auto p-4 z-10">
      <table className="w-full border-collapse border border-gray-300 shadow-lg">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="border border-gray-300 p-3">Movie</th>
            <th className="border border-gray-300 p-3">Platform</th>
            <th className="border border-gray-300 p-3">Available On</th>
            <th className="border border-gray-300 p-3">Type</th>
            <th className="border border-gray-300 p-3">IMDb Rating</th>
          </tr>
        </thead>
        <tbody>
          {movies.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            movies.map((movie, index) => (
              <tr key={index} className="text-center border border-gray-300 hover:bg-gray-200">
                <td className="p-3">{movie.name}</td>
                <td className="p-3">{movie.platform}</td>
                <td className="p-3">{movie.available_on}</td>
                <td className="p-3">{movie.type}</td>
                <td className="p-3">{movie.imdb_rating || "N/A"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}