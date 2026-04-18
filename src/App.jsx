import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

import Home from "./routes/Home";
import About from "./routes/About";
import Privacy from "./routes/Privacy";
import MovieDetail from "./routes/MovieDetail";
import PlatformPage from "./routes/PlatformPage";
import BlogIndex from "./routes/BlogIndex";
import BlogPost from "./routes/BlogPost";

// Lazy-loaded decorative pieces
const AnimatedBackground = lazy(() => import("./AnimatedBackground"));
const Breadcrumb = lazy(() => import("./Breadcrumb"));

function getPageKey(pathname) {
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/privacy")) return "privacy";
  if (pathname.startsWith("/movie/")) return "movie";
  if (pathname.startsWith("/platform/")) return "platform";
  if (pathname === "/blog" || pathname === "/blog/") return "blog-index";
  if (pathname.startsWith("/blog/")) return "blog-post";
  return "home";
}

// Routes that need to finish loading their own data before prerender can
// snapshot — they dispatch `prerender-ready` themselves once data is in.
const SELF_SIGNALS_READINESS = new Set(["movie", "platform"]);

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const currentPage = getPageKey(location.pathname);

  // Check system preference for dark mode
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }

    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleDarkModeChange = (e) => setDarkMode(e.matches);

    darkModeMediaQuery.addEventListener("change", handleDarkModeChange);
    return () => darkModeMediaQuery.removeEventListener("change", handleDarkModeChange);
  }, []);

  // Signal the prerenderer that the initial render + Helmet writes are done.
  // Defer via setTimeout so Helmet's side-effect writes flush first.
  // Routes that load their own data (e.g. /movie/:slug) opt out and
  // dispatch this event themselves once ready.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (SELF_SIGNALS_READINESS.has(currentPage)) return;
    const t = setTimeout(() => {
      requestAnimationFrame(() => {
        document.dispatchEvent(new Event("prerender-ready"));
      });
    }, 50);
    return () => clearTimeout(t);
  }, [currentPage]);

  return (
    <div
      className={`relative flex flex-col min-h-screen w-full transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Suspense fallback={<div className="h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800" />}>
        <AnimatedBackground />
      </Suspense>

      {/* Navigation */}
      <nav className="z-10 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            TeluguMoviesOTT
          </Link>
          <div className="flex gap-2">
            <Link
              to={currentPage === "about" ? "/" : "/about"}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {currentPage === "about" ? "View Movies" : "About"}
            </Link>
            <Link
              to={currentPage === "privacy" ? "/" : "/privacy"}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb Navigation */}
      <Suspense fallback={null}>
        <Breadcrumb currentPage={currentPage} />
      </Suspense>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/movie/:slug" element={<MovieDetail />} />
        <Route path="/platform/:slug" element={<PlatformPage />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>

      {/* Footer */}
      <footer className="z-10 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h4 className="font-bold text-lg mb-3">TeluguMoviesOTT</h4>
              <p className="text-sm opacity-70">Your trusted source for Telugu movie OTT release information.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><Link to="/" className="hover:opacity-100 transition-opacity">Home</Link></li>
                <li><Link to="/blog" className="hover:opacity-100 transition-opacity">Blog</Link></li>
                <li><Link to="/about" className="hover:opacity-100 transition-opacity">About</Link></li>
                <li><Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3">Disclaimer</h4>
              <p className="text-sm opacity-70">
                We provide information about OTT releases. Streaming availability may vary by region.
                All trademarks belong to their respective owners.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-300 dark:border-gray-700 pt-6 text-center text-sm opacity-70">
            <p>© {new Date().getFullYear()} TeluguMoviesOTT. All rights reserved. | Made with love for Telugu Cinema Fans</p>
          </div>
        </div>
      </footer>

      {/* Theme toggle button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-xl z-20 hover:scale-110 transition-transform"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? "Light" : "Dark"}
      </button>
    </div>
  );
}
