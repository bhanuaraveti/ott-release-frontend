/**
 * Data loader for movie records.
 *
 * Two separate payloads, fetched on different paths:
 *
 *   - `/data/movies-index.json` — slim records (slug, name, platform,
 *     available_on, type, imdb_rating) for every movie. Used by the
 *     homepage MoviesTable and per-platform listings. Small (~150 KB
 *     minified) so the homepage's render-critical payload stays light.
 *
 *   - `/data/movies/<slug>.json` — full record (overview, cast, poster,
 *     genres, etc.) for one movie. Fetched lazily by MovieDetail when
 *     the user navigates to a movie page.
 *
 * The prerender pipeline (see vite.config.js) runs the built SPA inside
 * headless Chromium over an Express static server, so both paths resolve
 * to real files during build. At runtime the same files are served from
 * Render's static host.
 *
 * First browser render for Home/PlatformPage may return an empty array
 * while the index fetch is in flight; callers wait on the promise via
 * `getIndexAsync()` and re-render. MovieDetail uses `getMovieDetailAsync`
 * which returns the full record.
 *
 * @typedef {Object} MovieIndexRecord
 * @property {string}  slug
 * @property {string}  name
 * @property {string}  platform
 * @property {string}  available_on
 * @property {string}  type
 * @property {string|null} imdb_rating
 *
 * @typedef {MovieIndexRecord & {
 *   tmdb_id?: number|null,
 *   overview?: string|null,
 *   poster_path?: string|null,
 *   poster_url?: string|null,
 *   release_date?: string|null,
 *   runtime?: number|null,
 *   genres?: string[],
 *   cast?: {name: string, character?: string}[],
 *   director?: string|null,
 *   tmdb_checked_at?: string|null,
 *   enrichment_status?: 'ok'|'not_found'|'error'
 * }} MovieDetailRecord
 */

/** @type {MovieIndexRecord[] | null} */
let indexCache = null;
/** @type {Promise<MovieIndexRecord[]> | null} */
let indexInFlight = null;

/** @type {Map<string, MovieDetailRecord>} */
const detailCache = new Map();
/** @type {Map<string, Promise<MovieDetailRecord | null>>} */
const detailInFlight = new Map();

function loadIndexAsync() {
  if (indexCache) return Promise.resolve(indexCache);
  if (indexInFlight) return indexInFlight;
  if (typeof fetch !== 'function') {
    // Pure-Node entry point (tests, scripts). Best-effort sync read of
    // the full movies.json — we derive the slim fields on the fly.
    try {
      // eslint-disable-next-line no-new-func
      const req = new Function('m', 'return require(m)');
      const fs = req('node:fs');
      const path = req('node:path');
      const candidate = path.resolve(process.cwd(), 'public', 'data', 'movies-index.json');
      if (fs.existsSync(candidate)) {
        indexCache = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        if (!Array.isArray(indexCache)) indexCache = [];
        return Promise.resolve(indexCache);
      }
      const fallback = path.resolve(process.cwd(), 'public', 'data', 'movies.json');
      if (fs.existsSync(fallback)) {
        const raw = JSON.parse(fs.readFileSync(fallback, 'utf8'));
        indexCache = Array.isArray(raw) ? raw : [];
        return Promise.resolve(indexCache);
      }
    } catch {
      /* fall through */
    }
    indexCache = [];
    return Promise.resolve(indexCache);
  }
  indexInFlight = fetch('/data/movies-index.json')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((json) => {
      indexCache = Array.isArray(json) ? json : [];
      return indexCache;
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[loader] failed to load /data/movies-index.json:', err);
      indexCache = [];
      return indexCache;
    });
  return indexInFlight;
}

/**
 * Returns the slim index synchronously. Empty array if not yet loaded;
 * call `getIndexAsync()` to await and re-render.
 *
 * @returns {MovieIndexRecord[]}
 */
export function getIndex() {
  if (indexCache) return indexCache;
  void loadIndexAsync();
  return [];
}

/** @returns {Promise<MovieIndexRecord[]>} */
export function getIndexAsync() {
  return loadIndexAsync();
}

/**
 * Fetch one movie's full detail record. Returns null if unknown slug or
 * if the fetch fails.
 *
 * @param {string} slug
 * @returns {Promise<MovieDetailRecord | null>}
 */
export function getMovieDetailAsync(slug) {
  if (!slug || typeof slug !== 'string') return Promise.resolve(null);
  if (detailCache.has(slug)) return Promise.resolve(detailCache.get(slug));
  if (detailInFlight.has(slug)) return detailInFlight.get(slug);
  if (typeof fetch !== 'function') {
    try {
      // eslint-disable-next-line no-new-func
      const req = new Function('m', 'return require(m)');
      const fs = req('node:fs');
      const path = req('node:path');
      const candidate = path.resolve(process.cwd(), 'public', 'data', 'movies', `${slug}.json`);
      if (fs.existsSync(candidate)) {
        const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        detailCache.set(slug, parsed);
        return Promise.resolve(parsed);
      }
    } catch {
      /* fall through */
    }
    return Promise.resolve(null);
  }
  const promise = fetch(`/data/movies/${encodeURIComponent(slug)}.json`)
    .then((res) => {
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((json) => {
      if (json && typeof json === 'object') {
        detailCache.set(slug, json);
        return json;
      }
      return null;
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`[loader] failed to load detail for ${slug}:`, err);
      return null;
    })
    .finally(() => {
      detailInFlight.delete(slug);
    });
  detailInFlight.set(slug, promise);
  return promise;
}

/**
 * Synchronous detail lookup from the in-memory detail cache only. Returns
 * null if the slug hasn't been fetched yet — callers should use
 * `getMovieDetailAsync()` in a `useEffect`.
 *
 * @param {string} slug
 * @returns {MovieDetailRecord | null}
 */
export function getMovieDetail(slug) {
  if (!slug) return null;
  return detailCache.get(slug) || null;
}

/** Invalidate all caches. Only useful for tests. */
export function __resetCacheForTests() {
  indexCache = null;
  indexInFlight = null;
  detailCache.clear();
  detailInFlight.clear();
}
