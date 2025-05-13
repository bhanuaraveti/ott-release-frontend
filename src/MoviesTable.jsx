import { useEffect, useState } from "react";

const API_URL = "https://ott-release-backend.onrender.com/movies";

// Enhanced helper function to normalize platform names
const normalizePlatformName = (name) => {
  if (!name) return "";
  
  // Trim the name and convert to consistent case for comparison
  const trimmedName = name.trim();
  
  // Amazon/Prime Video variations
  if (trimmedName.includes("Prime") || trimmedName.includes("Amazon")) {
    return trimmedName.includes("Rent") ? "Prime Video (Rent)" : "Prime Video";
  }
  
  // Aha Video variations
  if (trimmedName.includes("Aha")) {
    return "Aha";
  }
  
  // Hungama variations
  if (trimmedName.includes("Hungama")) {
    return "Hungama";
  }
  
  // Jiocinema/Hotstar variations
  if (trimmedName.includes("Jio")) {
    return "Hotstar";
  }
  
  // Sony LIV variations
  if (trimmedName.toLowerCase().includes("sony")) {
    return "Sony LIV";
  }
  
  // ZEE5 variations
  if (trimmedName.toLowerCase().includes("zee")) {
    return "ZEE5";
  }
  
  // Return the trimmed name for other platforms
  return trimmedName;
};

export default function MoviesTable() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [platforms, setPlatforms] = useState(["All"]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setMovies(data);
        setFilteredMovies(data);
        
        // Extract platforms and count their frequency
        const platformFrequency = new Map();
        platformFrequency.set("All", Infinity); // Ensure "All" stays at the top
        
        data.forEach(movie => {
          if (!movie.platform) return;
          
          // Split platforms by comma, ampersand, or "and"
          const platformList = movie.platform
            .split(/,|\s&\s|\sand\s/)
            .map(p => normalizePlatformName(p))
            .filter(p => p); // Remove empty entries
            
          platformList.forEach(platform => {
            const currentCount = platformFrequency.get(platform) || 0;
            platformFrequency.set(platform, currentCount + 1);
          });
        });
        
        // Convert map to array and sort by frequency (descending)
        const sortedPlatforms = Array.from(platformFrequency.entries())
          .sort((a, b) => {
            // Ensure "All" is always first
            if (a[0] === "All") return -1;
            if (b[0] === "All") return 1;
            // Sort by frequency (descending), then alphabetically if frequencies are equal
            return b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1];
          })
          .map(entry => entry[0]); // Extract just the platform names
        
        setPlatforms(sortedPlatforms);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Filter movies based on search term and selected platform
  useEffect(() => {
    let result = movies;
    
    // Filter by search term
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(movie => 
        movie.name && movie.name.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Filter by platform
    if (selectedPlatform !== "All") {
      result = result.filter(movie => {
        if (!movie.platform) return false;
        
        // Split the movie's platform string and check if any match the selected platform
        const moviePlatforms = movie.platform
          .split(/,|\s&\s|\sand\s/)
          .map(p => normalizePlatformName(p));
          
        return moviePlatforms.some(p => p === selectedPlatform);
      });
    }
    
    setFilteredMovies(result);
  }, [searchTerm, selectedPlatform, movies]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle platform selection change
  const handlePlatformChange = (e) => {
    setSelectedPlatform(e.target.value);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedPlatform("All");
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl p-4 z-10 text-center fixed-container">
        <div role="status" className="inline-block">
          <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin"></div>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl p-4 z-10 fixed-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-4 z-10 rounded-lg shadow-lg bg-white/95 dark:bg-gray-800/95 fixed-container">
      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 search-area w-full">
        {/* Search input */}
        <div className="relative flex-grow">
          <label htmlFor="movie-search" className="sr-only">Search movies</label>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="search"
            id="movie-search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Search movie names..."
            aria-label="Search movies"
          />
        </div>
        
        {/* Platform filter dropdown */}
        <div className="md:min-w-[180px] w-full md:w-auto">
          <label htmlFor="platform-filter" className="sr-only">Filter by Platform</label>
          <select
            id="platform-filter"
            value={selectedPlatform}
            onChange={handlePlatformChange}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            aria-label="Filter by platform"
          >
            {platforms.map(platform => (
              <option key={platform} value={platform}>
                {platform === "All" ? "All Platforms" : platform}
              </option>
            ))}
          </select>
        </div>
        
        {/* Clear filters button */}
        <button
          onClick={handleClearFilters}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white dark:focus:ring-gray-800 w-full md:w-auto"
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      </div>
      
      {/* Table Container with fixed height and width */}
      <div className="table-container w-full">
        <table className="min-w-full border-collapse border border-gray-300 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <caption className="sr-only">Telugu Movies OTT Release Dates</caption>
          <thead className="bg-gray-800 text-white sticky top-0 z-10 w-full">
            <tr>
              <th scope="col" className="border border-gray-300 p-3 text-left w-1/4">Movie</th>
              <th scope="col" className="border border-gray-300 p-3 text-left w-1/5">Platform</th>
              <th scope="col" className="border border-gray-300 p-3 text-left w-1/5">Available On</th>
              <th scope="col" className="border border-gray-300 p-3 text-left w-1/5">Type</th>
              <th scope="col" className="border border-gray-300 p-3 text-left w-1/5">IMDb Rating</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovies.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-300">
                  {movies.length === 0 ? "No data available" : "No movies match your search criteria"}
                </td>
              </tr>
            ) : (
              filteredMovies.map((movie, index) => (
                <tr 
                  key={index} 
                  className={
                    index % 2 === 0 
                      ? 'bg-gray-50 dark:bg-gray-900 border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-100' 
                      : 'bg-white dark:bg-gray-800 border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-100'
                  }
                >
                  <td className="p-3 border-r border-gray-300 w-1/4">{movie.name}</td>
                  <td className="p-3 border-r border-gray-300 w-1/5">{movie.platform}</td>
                  <td className="p-3 border-r border-gray-300 w-1/5">{movie.available_on}</td>
                  <td className="p-3 border-r border-gray-300 w-1/5">{movie.type}</td>
                  <td className="p-3 w-1/5">{movie.imdb_rating || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Results summary */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-300 w-full">
        {searchTerm || selectedPlatform !== "All" ? (
          <p>Showing {filteredMovies.length} of {movies.length} movies</p>
        ) : (
          <p>Showing all {movies.length} movies</p>
        )}
      </div>
    </div>
  );
}