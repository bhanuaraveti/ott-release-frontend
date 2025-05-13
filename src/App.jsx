import { useState, useEffect } from "react";
import MoviesTable from "./MoviesTable";
import AnimatedBackground from "./AnimatedBackground";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Check system preference for dark mode
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e) => setDarkMode(e.matches);
    
    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen w-full px-4 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    } transition-colors duration-300`}>
      <AnimatedBackground />
      
      <header className="z-10 w-full max-w-4xl text-center mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Telugu Movie OTT Releases
        </h1>
        <p className="text-sm md:text-base opacity-80 max-w-xl mx-auto">
          Find the latest Telugu movies available on various OTT platforms along with their release dates.
        </p>
      </header>
      
      <main className="z-10 w-full">
        <MoviesTable />
      </main>
      
      <footer className="z-10 mt-12 py-4 text-sm text-center opacity-70 w-full">
        <p>© {new Date().getFullYear()} TeluguMoviesOTT. All rights reserved.</p>
      </footer>
      
      {/* Theme toggle button */}
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-200 dark:bg-gray-700 shadow-lg z-20"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? "🌞" : "🌙"}
      </button>
    </div>
  );
}