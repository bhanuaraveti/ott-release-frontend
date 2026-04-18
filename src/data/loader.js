/**
 * Data loader for movie records.
 *
 * The prerender pipeline runs the built SPA inside a headless Chromium
 * served over an Express static server (see
 * @prerenderer/rollup-plugin), so this module always executes in a
 * browser context — even during `vite build`. We therefore fetch
 * `/data/movies.json` and cache the parsed array in-module. The same
 * file (copied from `public/` to `dist/` by Vite) is served both during
 * prerender and at runtime on the live site, so the same fetch works in
 * both situations.
 *
 * First render may return an empty array while the fetch is in flight;
 * callers that need the data should wait on the promise via
 * `getAllMoviesAsync()` and re-render (MovieDetail.jsx does this). The
 * prerender snapshot is gated behind MovieDetail dispatching
 * `prerender-ready` only after its fetch resolves.
 *
 * @typedef {Object} MovieRecord
 * @property {string}  name
 * @property {string}  platform
 * @property {string}  available_on
 * @property {string}  type
 * @property {string|null} imdb_rating
 * @property {string}  slug                 - always present (backend or fetch-data.mjs)
 * @property {number|null} [tmdb_id]
 * @property {string|null} [overview]
 * @property {string|null} [poster_path]
 * @property {string|null} [poster_url]
 * @property {string|null} [release_date]
 * @property {number|null} [runtime]        - minutes
 * @property {string[]}   [genres]
 * @property {{name: string, character?: string}[]} [cast]
 * @property {string|null} [director]
 * @property {string|null} [tmdb_checked_at]
 * @property {'ok'|'not_found'|'error'} [enrichment_status]
 */

/** @type {MovieRecord[] | null} */
let cache = null;
/** @type {Promise<MovieRecord[]> | null} */
let inFlight = null;

function loadAsync() {
  if (cache) return Promise.resolve(cache);
  if (inFlight) return inFlight;
  if (typeof fetch !== 'function') {
    // Pure-Node entry point (tests, scripts). Best-effort sync read.
    try {
      // Dynamic eval keeps Vite's browser bundler from trying to resolve
      // node: specifiers.
      // eslint-disable-next-line no-new-func
      const req = new Function('m', 'return require(m)');
      const fs = req('node:fs');
      const path = req('node:path');
      const candidate = path.resolve(process.cwd(), 'public', 'data', 'movies.json');
      if (fs.existsSync(candidate)) {
        cache = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        if (!Array.isArray(cache)) cache = [];
        return Promise.resolve(cache);
      }
    } catch {
      /* fall through */
    }
    cache = [];
    return Promise.resolve(cache);
  }
  inFlight = fetch('/data/movies.json')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((json) => {
      cache = Array.isArray(json) ? json : [];
      return cache;
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[loader] failed to load /data/movies.json:', err);
      cache = [];
      return cache;
    });
  return inFlight;
}

/**
 * Returns the array of movies. In the browser this returns whatever is
 * cached right now; callers should re-render when the fetch resolves
 * (see `getAllMoviesAsync`).
 *
 * @returns {MovieRecord[]}
 */
export function getAllMovies() {
  if (cache) return cache;
  // Warm the cache for subsequent calls.
  void loadAsync();
  return [];
}

/**
 * @returns {Promise<MovieRecord[]>}
 */
export function getAllMoviesAsync() {
  return loadAsync();
}

/**
 * Synchronous lookup. Returns null if the cache has not yet loaded — use
 * `getAllMoviesAsync()` in a `useEffect` to populate state on first
 * render in the browser.
 *
 * @param {string} slug
 * @returns {MovieRecord | null}
 */
export function getMovieBySlug(slug) {
  if (!slug) return null;
  const records = getAllMovies();
  for (const record of records) {
    if (record && record.slug === slug) return record;
  }
  return null;
}

/** Invalidate the in-memory cache. Only useful for tests. */
export function __resetCacheForTests() {
  cache = null;
  inFlight = null;
}
