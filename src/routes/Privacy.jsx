import { lazy, Suspense } from 'react';
import Seo from '../components/Seo';

const PrivacyPolicy = lazy(() => import('../PrivacyPolicy'));

const SITE = 'https://telugumoviesott.onrender.com';

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin"></div>
  </div>
);

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy - TeluguMoviesOTT"
        description="Read our privacy policy to understand how we collect, use, and protect your information on TeluguMoviesOTT."
        canonical={`${SITE}/privacy`}
      />

      <section className="z-10 w-full max-w-4xl mx-auto px-4 py-12">
        <Suspense fallback={<LoadingFallback />}>
          <PrivacyPolicy />
        </Suspense>
      </section>
    </>
  );
}
