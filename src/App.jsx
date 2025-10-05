import { useState, useEffect, lazy, Suspense } from "react";
import { updateMetaTags, getPageMetadata } from "./utils/metaTags";

// Lazy load components for code splitting
const MoviesTable = lazy(() => import("./MoviesTable"));
const AnimatedBackground = lazy(() => import("./AnimatedBackground"));
const PrivacyPolicy = lazy(() => import("./PrivacyPolicy"));
const Breadcrumb = lazy(() => import("./Breadcrumb"));

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'about', 'privacy'

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

  // Update meta tags when page changes
  useEffect(() => {
    const metadata = getPageMetadata(currentPage);
    updateMetaTags(metadata);
  }, [currentPage]);

  // Loading component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin"></div>
    </div>
  );

  return (
    <div className={`relative flex flex-col min-h-screen w-full transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <Suspense fallback={<div className="h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800" />}>
        <AnimatedBackground />
      </Suspense>

      {/* Navigation */}
      <nav className="z-10 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            TeluguMoviesOTT
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage === 'about' ? 'home' : 'about')}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {currentPage === 'about' ? 'View Movies' : 'About'}
            </button>
            <button
              onClick={() => setCurrentPage(currentPage === 'privacy' ? 'home' : 'privacy')}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Privacy
            </button>
          </div>
        </div>
      </nav>

      {/* Breadcrumb Navigation */}
      <Suspense fallback={<LoadingFallback />}>
        <Breadcrumb currentPage={currentPage} onNavigate={setCurrentPage} />
      </Suspense>

      {currentPage === 'home' ? (
        <>
          {/* Hero Section */}
          <header className="z-10 w-full max-w-6xl mx-auto px-4 py-12 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Latest Telugu Movie OTT Releases
            </h2>
            <p className="text-lg md:text-xl opacity-80 max-w-3xl mx-auto mb-4">
              Your one-stop destination for tracking Telugu movies on OTT platforms. Find where to watch your favorite films!
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-md">
                <p className="text-sm opacity-70">Total Movies</p>
                <p className="text-2xl font-bold">800+</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-md">
                <p className="text-sm opacity-70">OTT Platforms</p>
                <p className="text-2xl font-bold">15+</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-md">
                <p className="text-sm opacity-70">Updated</p>
                <p className="text-2xl font-bold">Daily</p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="z-10 w-full max-w-6xl mx-auto px-4 mb-12">
            <Suspense fallback={<LoadingFallback />}>
              <MoviesTable />
            </Suspense>
          </main>

          {/* Popular Platforms Section */}
          <section className="z-10 w-full max-w-6xl mx-auto px-4 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Popular OTT Platforms</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {['Netflix', 'Prime Video', 'Disney+ Hotstar', 'Aha', 'Zee5', 'Sony LIV', 'ETV Win', 'Sun NXT'].map(platform => (
                <div key={platform} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
                  <p className="font-semibold">{platform}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="z-10 w-full max-w-6xl mx-auto px-4 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <details className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-md">
                <summary className="font-semibold cursor-pointer">How often is the movie list updated?</summary>
                <p className="mt-3 opacity-80">Our database is updated daily to ensure you have the latest information about Telugu movie OTT releases.</p>
              </details>
              <details className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-md">
                <summary className="font-semibold cursor-pointer">Which OTT platforms are covered?</summary>
                <p className="mt-3 opacity-80">We cover all major OTT platforms including Netflix, Amazon Prime Video, Disney+ Hotstar, Aha, Zee5, Sony LIV, ETV Win, and many more.</p>
              </details>
              <details className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-md">
                <summary className="font-semibold cursor-pointer">Can I search for specific movies?</summary>
                <p className="mt-3 opacity-80">Yes! Use the search bar above the movie table to find specific titles, and filter by platform to see what's available on your preferred streaming service.</p>
              </details>
              <details className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-md">
                <summary className="font-semibold cursor-pointer">Is this service free?</summary>
                <p className="mt-3 opacity-80">Absolutely! TeluguMoviesOTT is completely free to use. We provide this information as a service to Telugu cinema fans.</p>
              </details>
            </div>
          </section>
        </>
      ) : currentPage === 'about' ? (
        /* About Page */
        <section className="z-10 w-full max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About TeluguMoviesOTT</h2>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-lg shadow-lg space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="opacity-80 leading-relaxed">
                TeluguMoviesOTT is dedicated to helping Telugu cinema enthusiasts discover and track the latest movie releases on various OTT platforms.
                We understand the challenge of finding where your favorite Telugu movies are streaming, and we're here to make that process seamless and convenient.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">What We Offer</h3>
              <ul className="list-disc list-inside opacity-80 space-y-2">
                <li>Comprehensive database of Telugu movie OTT releases</li>
                <li>Daily updates with the latest release information</li>
                <li>Easy search and filter functionality</li>
                <li>Coverage of all major streaming platforms</li>
                <li>Free and accessible to all Telugu cinema fans</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Our Commitment</h3>
              <p className="opacity-80 leading-relaxed">
                We are committed to providing accurate, up-to-date information about Telugu movie streaming availability.
                Our team works diligently to ensure you never miss out on watching your favorite films on your preferred platform.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
              <p className="opacity-80">
                Have questions or suggestions? We'd love to hear from you! Reach out to us and help us improve your experience.
              </p>
            </div>
          </div>
        </section>
      ) : (
        /* Privacy Policy Page */
        <section className="z-10 w-full max-w-4xl mx-auto px-4 py-12">
          <Suspense fallback={<LoadingFallback />}>
            <PrivacyPolicy />
          </Suspense>
        </section>
      )}

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
                <li><button onClick={() => setCurrentPage('home')} className="hover:opacity-100 transition-opacity">Home</button></li>
                <li><button onClick={() => setCurrentPage('about')} className="hover:opacity-100 transition-opacity">About</button></li>
                <li><button onClick={() => setCurrentPage('privacy')} className="hover:opacity-100 transition-opacity">Privacy Policy</button></li>
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
            <p>© {new Date().getFullYear()} TeluguMoviesOTT. All rights reserved. | Made with ❤️ for Telugu Cinema Fans</p>
          </div>
        </div>
      </footer>

      {/* Theme toggle button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-xl z-20 hover:scale-110 transition-transform"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? "🌞" : "🌙"}
      </button>
    </div>
  );
}