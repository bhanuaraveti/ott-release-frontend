import { lazy, Suspense } from 'react';
import Seo from '../components/Seo';
import AdSlot from '../components/AdSlot';

const MoviesTable = lazy(() => import('../MoviesTable'));

const SITE = 'https://telugumoviesott.onrender.com';

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin"></div>
  </div>
);

export default function Home() {
  return (
    <>
      <Seo
        title="Latest Telugu Movies OTT Release Dates 2026 | Netflix, Prime Video, Hotstar & More"
        description="Find the latest Telugu movies OTT release dates across Netflix, Amazon Prime Video, Disney+ Hotstar, Aha, Zee5 and other platforms. Updated daily with 800+ movies. Your complete guide to Telugu cinema streaming!"
        canonical={`${SITE}/`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'TeluguMoviesOTT',
          description: 'Your complete guide to Telugu movie OTT releases across all streaming platforms',
          url: `${SITE}/`,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />

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

      <div className="z-10 w-full max-w-6xl mx-auto px-4">
        <AdSlot slot="home-mid" />
      </div>

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
  );
}
