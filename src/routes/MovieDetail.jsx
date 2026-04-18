import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import AdSlot from '../components/AdSlot';
import { getAllMoviesAsync, getMovieBySlug } from '../data/loader';
import {
  buildEditorialBlurb,
  buildMetaDescription,
  formatReleaseDate,
  formatRuntime,
  slugifyPlatform,
} from '../utils/movieCopy';

const SITE = 'https://telugumoviesott.onrender.com';
const POSTER_PLACEHOLDER = '/images/poster-placeholder.svg';

/** Signal to the prerenderer / parent App that this route is done loading. */
function dispatchPrerenderReady() {
  if (typeof document === 'undefined') return;
  // 50ms + rAF so @dr.pogodin/react-helmet's scheduled DOM writes flush
  // before the prerenderer snapshots HTML. A plain setTimeout(0) races
  // Helmet's internal rAF and leaves stale <title> from index.html.
  setTimeout(() => {
    requestAnimationFrame(() => {
      document.dispatchEvent(new Event('prerender-ready'));
    });
  }, 50);
}

/** 404 block when the slug doesn't match any record. */
function NotFound({ slug }) {
  useEffect(() => {
    dispatchPrerenderReady();
  }, []);
  return (
    <>
      <Seo
        title="Movie not found | TeluguMoviesOTT"
        description="We could not find this movie in our directory. Browse the full list of Telugu OTT releases on the homepage."
        canonical={`${SITE}/movie/${slug || ''}`}
      />
      <section className="z-10 w-full max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Movie not found</h1>
        <p className="opacity-80 mb-6">
          We could not find a title with the slug <code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">{slug || '—'}</code> in
          our directory. It may have been removed, renamed, or not yet
          indexed.
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

function FactsGrid({ movie, copy }) {
  const items = [];
  const releaseDate = formatReleaseDate(movie.available_on);
  if (releaseDate) items.push({ label: 'Release', value: releaseDate });
  items.push({ label: 'Platform', value: movie.platform || 'Unknown' });
  items.push({ label: 'Type', value: movie.type || 'Film' });
  if (movie.imdb_rating) items.push({ label: 'IMDb', value: `${movie.imdb_rating}/10` });
  const runtimeStr = formatRuntime(movie.runtime);
  if (runtimeStr) items.push({ label: 'Runtime', value: runtimeStr });
  if (movie.director) items.push({ label: 'Director', value: movie.director });

  return (
    <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-sm"
        >
          <dt className="text-xs uppercase tracking-wide opacity-60 mb-1">{item.label}</dt>
          <dd className="font-semibold">{item.value}</dd>
        </div>
      ))}
      {Array.isArray(movie.genres) && movie.genres.length ? (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-sm col-span-2 md:col-span-3">
          <dt className="text-xs uppercase tracking-wide opacity-60 mb-2">Genres</dt>
          <dd className="flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100 text-sm"
              >
                {g}
              </span>
            ))}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

function CastList({ cast }) {
  if (!Array.isArray(cast) || cast.length === 0) return null;
  const top = cast.slice(0, 5).filter((c) => c && c.name);
  if (!top.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Cast</h2>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {top.map((person) => (
          <li
            key={person.name}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg shadow-sm text-center"
          >
            <p className="font-semibold text-sm">{person.name}</p>
            {person.character ? (
              <p className="text-xs opacity-70 mt-1">as {person.character}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function buildJsonLd(movie, description, canonical) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.name,
    description,
    url: canonical,
  };
  if (movie.poster_url) jsonLd.image = movie.poster_url;
  const releaseDate = movie.release_date || movie.available_on;
  if (releaseDate) jsonLd.datePublished = releaseDate;
  if (movie.imdb_rating) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(movie.imdb_rating),
      bestRating: '10',
      ratingCount: 1,
    };
  }
  if (Array.isArray(movie.cast) && movie.cast.length) {
    jsonLd.actor = movie.cast
      .filter((c) => c && c.name)
      .slice(0, 5)
      .map((c) => ({ '@type': 'Person', name: c.name }));
  }
  if (movie.director) {
    jsonLd.director = { '@type': 'Person', name: movie.director };
  }
  if (Array.isArray(movie.genres) && movie.genres.length) {
    jsonLd.genre = movie.genres;
  }
  return jsonLd;
}

export default function MovieDetail() {
  const { slug } = useParams();
  const [movie, setMovie] = useState(() => (slug ? getMovieBySlug(slug) : null));
  const [loaded, setLoaded] = useState(() => movie != null);

  // Async path for browser hydration: the prerender snapshot already has
  // the final DOM, but the SPA shell needs to fetch /data/movies.json
  // client-side on first navigation.
  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setLoaded(true);
      dispatchPrerenderReady();
      return undefined;
    }
    if (movie) {
      dispatchPrerenderReady();
      return undefined;
    }
    getAllMoviesAsync()
      .then((records) => {
        if (cancelled) return;
        const found = records.find((r) => r && r.slug === slug) || null;
        setMovie(found);
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
  }, [slug, movie]);

  const copy = useMemo(() => (movie ? buildEditorialBlurb(movie) : null), [movie]);

  if (!loaded) {
    // First client render while we wait on fetch — keep the DOM stable so
    // hydration doesn't warn. The prerender already has real content.
    return (
      <section className="z-10 w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-10 h-10 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin" />
      </section>
    );
  }

  if (!movie) return <NotFound slug={slug} />;

  const canonical = `${SITE}/movie/${movie.slug}`;
  const description = buildMetaDescription(movie);
  const title = `${movie.name} on ${movie.platform || 'OTT'} | TeluguMoviesOTT`;
  const jsonLd = buildJsonLd(movie, description, canonical);
  const posterSrc = movie.poster_url || POSTER_PLACEHOLDER;
  const hasOverview = typeof movie.overview === 'string' && movie.overview.trim().length > 0;
  const platformSlug = copy?.platformSlug || slugifyPlatform(movie.platform);
  const watchHref = movie.platform
    ? `/platform/${platformSlug}`
    : '/';

  return (
    <>
      <Seo title={title} description={description} canonical={canonical} jsonLd={jsonLd} />

      <article className="z-10 w-full max-w-5xl mx-auto px-4 py-10">
        {/* Hero */}
        <header className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 mb-10 items-start">
          <div className="mx-auto md:mx-0 w-full max-w-[220px]">
            <img
              src={posterSrc}
              alt={`${movie.name} poster`}
              width={220}
              height={330}
              loading="eager"
              className="w-full h-auto rounded-lg shadow-lg bg-gray-200 dark:bg-gray-700"
              onError={(e) => {
                const img = e.currentTarget;
                // Guard against onError loops: once we've swapped to the
                // placeholder (or the placeholder itself failed), stop.
                if (img.dataset.fallbackApplied === '1') {
                  img.onerror = null;
                  return;
                }
                img.dataset.fallbackApplied = '1';
                if (!img.src.endsWith(POSTER_PLACEHOLDER)) {
                  img.src = POSTER_PLACEHOLDER;
                }
              }}
            />
          </div>
          <div>
            <div className="inline-block mb-3 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-100 text-sm font-semibold">
              {movie.platform || 'Streaming'}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {movie.name}
            </h1>
            <p className="opacity-80 mb-6">
              {copy.intro}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={watchHref}
                className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Watch on {movie.platform || 'OTT'}
              </Link>
              <Link
                to="/"
                className="px-5 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Browse all releases
              </Link>
            </div>
          </div>
        </header>

        {/* Facts */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Quick facts</h2>
          <FactsGrid movie={movie} copy={copy} />
        </section>

        {/* Synopsis */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
          {hasOverview ? (
            <p className="opacity-90 leading-relaxed whitespace-pre-line">{movie.overview}</p>
          ) : (
            <>
              <p className="opacity-90 leading-relaxed mb-4">{copy.body}</p>
              {copy.facts && copy.facts.length ? (
                <ul className="list-disc list-inside opacity-80 space-y-1">
                  {copy.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </section>

        <CastList cast={movie.cast} />

        {/* Editorial framing — always present, covers the AdSense
             word-count floor for unenriched records. */}
        <section className="mt-10 mb-10">
          <h2 className="text-2xl font-bold mb-4">About this listing</h2>
          <p className="opacity-90 leading-relaxed">{copy.editorial}</p>
        </section>

        <AdSlot slot="movie-detail" className="my-10" />

        {/* Related links */}
        <section className="mt-10 mb-4">
          <h2 className="text-2xl font-bold mb-4">Related</h2>
          <p className="opacity-90 leading-relaxed mb-4">{copy.cta}</p>
          <ul className="flex flex-wrap gap-3">
            <li>
              <Link
                to={`/platform/${platformSlug}`}
                className="inline-block px-4 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
              >
                {movie.platform || 'Platform'} lineup
              </Link>
            </li>
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
