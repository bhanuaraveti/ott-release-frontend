import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import AdSlot from '../components/AdSlot';
import { getAllMoviesAsync, getAllMovies } from '../data/loader';
import { getPlatformBySlug, matchPlatformRecord } from '../content/platforms';
import { formatReleaseDate } from '../utils/movieCopy';

const SITE = 'https://telugumoviesott.onrender.com';

function dispatchPrerenderReady() {
  if (typeof document === 'undefined') return;
  setTimeout(() => {
    requestAnimationFrame(() => {
      document.dispatchEvent(new Event('prerender-ready'));
    });
  }, 50);
}

function filterByPlatform(records, platform) {
  if (!platform || !Array.isArray(records)) return [];
  const names = new Set(platform.matchNames.map((n) => n.toLowerCase()));
  return records
    .filter((r) => r && typeof r.platform === 'string' && names.has(r.platform.toLowerCase()))
    .sort((a, b) => {
      const ra = (a.name || '').toLowerCase();
      const rb = (b.name || '').toLowerCase();
      return ra < rb ? -1 : ra > rb ? 1 : 0;
    });
}

function PlatformNotFound({ slug }) {
  useEffect(() => {
    dispatchPrerenderReady();
  }, []);
  return (
    <>
      <Seo
        title="Platform not found | TeluguMoviesOTT"
        description="We could not find this OTT platform in our directory. Browse the homepage for the full list of platforms we track."
        canonical={`${SITE}/platform/${slug || ''}`}
      />
      <section className="z-10 w-full max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Platform not found</h1>
        <p className="opacity-80 mb-6">
          We do not currently have a dedicated page for{' '}
          <code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">{slug || '—'}</code>.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to all Telugu OTT releases
        </Link>
      </section>
    </>
  );
}

export default function PlatformPage() {
  const { slug } = useParams();
  const platform = slug ? getPlatformBySlug(slug) : null;
  const [records, setRecords] = useState(() => getAllMovies());
  const [loaded, setLoaded] = useState(() => records.length > 0);

  useEffect(() => {
    let cancelled = false;
    if (!platform) {
      setLoaded(true);
      dispatchPrerenderReady();
      return undefined;
    }
    if (records.length > 0) {
      dispatchPrerenderReady();
      return undefined;
    }
    getAllMoviesAsync()
      .then((all) => {
        if (cancelled) return;
        setRecords(all);
        setLoaded(true);
        dispatchPrerenderReady();
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
        dispatchPrerenderReady();
      });
    return () => {
      cancelled = true;
    };
  }, [platform, records.length]);

  const filtered = useMemo(
    () => (platform ? filterByPlatform(records, platform) : []),
    [records, platform],
  );

  if (!platform) return <PlatformNotFound slug={slug} />;

  const canonical = `${SITE}/platform/${platform.slug}`;
  const title = `Telugu Movies & Series on ${platform.name} | TeluguMoviesOTT`;
  const description = platform.tagline;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    about: {
      '@type': 'Organization',
      name: platform.name,
    },
    hasPart: filtered.slice(0, 50).map((r) => ({
      '@type': 'Movie',
      name: r.name,
      url: `${SITE}/movie/${r.slug}`,
    })),
  };

  return (
    <>
      <Seo title={title} description={description} canonical={canonical} jsonLd={jsonLd} />

      <article className="z-10 w-full max-w-5xl mx-auto px-4 py-10">
        <header className="mb-10">
          <div className="inline-block mb-3 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100 text-sm font-semibold">
            OTT Platform
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Telugu titles on {platform.name}
          </h1>
          <p className="text-lg opacity-80">{platform.tagline}</p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">About {platform.name}</h2>
          <p className="opacity-90 leading-relaxed">{platform.intro}</p>
        </section>

        <AdSlot slot="platform-top" />

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            {filtered.length > 0
              ? `${filtered.length} Telugu title${filtered.length === 1 ? '' : 's'} on ${platform.name}`
              : `No Telugu titles currently indexed for ${platform.name}`}
          </h2>
          {!loaded && filtered.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="opacity-80">
              We have not indexed any Telugu titles on {platform.name} yet. Check back shortly or{' '}
              <Link to="/" className="text-blue-600 hover:underline">browse all platforms</Link>.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((r) => {
                const release = formatReleaseDate(r.available_on);
                return (
                  <li
                    key={r.slug}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link to={`/movie/${r.slug}`} className="block">
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-sm opacity-70 mt-1">
                        {r.type || 'Film'}
                        {release ? ` · ${release}` : ''}
                        {r.imdb_rating ? ` · IMDb ${r.imdb_rating}` : ''}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <AdSlot slot="platform-bottom" />

        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Explore more</h2>
          <ul className="flex flex-wrap gap-3">
            <li>
              <Link
                to="/"
                className="inline-block px-4 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
              >
                All Telugu OTT releases
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="inline-block px-4 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
              >
                Editorial blog
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="inline-block px-4 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
              >
                About TeluguMoviesOTT
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}
