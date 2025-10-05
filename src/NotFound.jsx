export default function NotFound({ onNavigateHome }) {
  return (
    <div className="z-10 w-full max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
        {/* 404 Number */}
        <h1 className="text-9xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          404
        </h1>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Page Not Found
        </h2>

        <p className="text-lg opacity-80 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onNavigateHome}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Go to Home
          </button>

          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600">
          <p className="text-sm opacity-70 mb-4">Here are some helpful links instead:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={onNavigateHome}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse Movies
            </button>
            <span className="opacity-50">•</span>
            <a
              href="https://telugumoviesott.onrender.com/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Latest Releases
            </a>
            <span className="opacity-50">•</span>
            <a
              href="https://ott-release-backend.onrender.com/movies"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              API
            </a>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8">
          <p className="text-sm opacity-60 italic">
            "This page is as elusive as a Telugu movie without an OTT release date!"
          </p>
        </div>
      </div>
    </div>
  );
}
