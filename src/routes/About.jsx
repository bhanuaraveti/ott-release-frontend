import Seo from '../components/Seo';

const SITE = 'https://telugumoviesott.onrender.com';

export default function About() {
  return (
    <>
      <Seo
        title="About TeluguMoviesOTT - Your Telugu Cinema OTT Guide"
        description="Learn about TeluguMoviesOTT, your trusted source for Telugu movie OTT release information. Discover our mission to help fans find their favorite films on streaming platforms."
        canonical={`${SITE}/about`}
      />

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
            <p className="opacity-80 mb-3">
              Have questions, corrections, or suggestions? We want to hear from you — especially if you spot a missing release or incorrect streaming date.
            </p>
            <p className="opacity-80">
              Email:{' '}
              {/* TODO: replace placeholder with the real contact address */}
              <a
                href="mailto:hello@telugumoviesott.com"
                className="text-blue-600 hover:underline"
              >
                hello@telugumoviesott.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
