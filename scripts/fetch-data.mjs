#!/usr/bin/env node
/**
 * prebuild — fetch the backend /movies endpoint and write it to
 * public/data/movies.json. Run before every `vite build` so the prerender
 * plugin (which reads this file to compute the full route list) and the
 * client loader (which fetches /data/movies.json at runtime) see a
 * consistent snapshot.
 *
 * Policy:
 *   - Non-zero exit on any failure so Render aborts the deploy.
 *   - Create parent dirs as needed; overwrite the file atomically.
 *   - Generate `slug` on the fly for records that haven't been enriched
 *     yet by the backend. Matches the backend's collision rule
 *     (base → base-<year> → base-2 → base-3 …) from
 *     ott-release-backend/enrich.py::_assign_slug.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'public', 'data');
const OUT_PATH = path.join(DATA_DIR, 'movies.json');
const INDEX_OUT_PATH = path.join(DATA_DIR, 'movies-index.json');
const DETAIL_DIR = path.join(DATA_DIR, 'movies');
const SOURCE_URL =
  process.env.MOVIES_SOURCE_URL ||
  'https://ott-release-backend.onrender.com/movies';
const FETCH_TIMEOUT_MS = 30_000;

// Fields kept in the slim index — the minimum needed by MoviesTable (home)
// and PlatformPage lists. Per-movie detail pages fetch /data/movies/<slug>.json
// for everything else (overview, cast, poster_url, etc.) on demand.
const INDEX_FIELDS = ['slug', 'name', 'platform', 'available_on', 'type', 'imdb_rating'];

function slimRecord(record) {
  const out = {};
  for (const field of INDEX_FIELDS) {
    if (record[field] !== undefined) out[field] = record[field];
  }
  return out;
}

/** Extract a four-digit year from the backend's `available_on` string. */
function extractYear(availableOn) {
  if (!availableOn || typeof availableOn !== 'string') return null;
  const match = availableOn.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : null;
}

/** Deterministic slug matching the backend's collision rule. */
function slugifyName(name) {
  const base = slugify(name || 'untitled', { lower: true, strict: true });
  return base || 'untitled';
}

function assignSlugs(records) {
  const seen = new Set();
  let collisionCount = 0;
  for (const record of records) {
    if (record.slug && typeof record.slug === 'string') {
      seen.add(record.slug);
      continue;
    }
    const base = slugifyName(record.name);
    let slug = base;
    if (seen.has(slug)) {
      collisionCount += 1;
      const year = extractYear(record.available_on);
      if (year) slug = `${base}-${year}`;
      let i = 2;
      while (seen.has(slug)) {
        slug = `${base}-${i}`;
        i += 1;
      }
    }
    seen.add(slug);
    record.slug = slug;
  }
  return collisionCount;
}

async function fetchMovies() {
  console.log(`[fetch-data] GET ${SOURCE_URL}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(SOURCE_URL, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    if (!Array.isArray(json)) {
      throw new Error(
        `Expected array response, got ${typeof json} (${json && json.constructor ? json.constructor.name : 'unknown'})`
      );
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  let records;
  try {
    records = await fetchMovies();
  } catch (err) {
    console.error(`[fetch-data] FAILED to fetch movies: ${err.message}`);
    process.exit(1);
  }

  const collisions = assignSlugs(records);
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // 1. Full records — still needed by vite.config.js (prerender route plan),
  //    scripts/generate-sitemap.mjs, and the Node-side loader fallback.
  const tmpPath = `${OUT_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(records, null, 2), 'utf8');
  fs.renameSync(tmpPath, OUT_PATH);

  // 2. Slim index — fetched by MoviesTable (home) and PlatformPage.
  //    JSON.stringify without indent — runtime payload, every byte counts.
  const index = records.map(slimRecord);
  const tmpIndex = `${INDEX_OUT_PATH}.tmp`;
  fs.writeFileSync(tmpIndex, JSON.stringify(index), 'utf8');
  fs.renameSync(tmpIndex, INDEX_OUT_PATH);

  // 3. Per-movie detail files — fetched lazily by MovieDetail on navigation.
  //    Clean the directory first so deleted records don't leave stale files.
  if (fs.existsSync(DETAIL_DIR)) {
    fs.rmSync(DETAIL_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DETAIL_DIR, { recursive: true });
  let detailCount = 0;
  for (const record of records) {
    if (!record.slug) continue;
    const detailPath = path.join(DETAIL_DIR, `${record.slug}.json`);
    fs.writeFileSync(detailPath, JSON.stringify(record), 'utf8');
    detailCount += 1;
  }

  const fullSize = fs.statSync(OUT_PATH).size;
  const indexSize = fs.statSync(INDEX_OUT_PATH).size;
  console.log(
    `[fetch-data] wrote ${records.length} records to ${path.relative(REPO_ROOT, OUT_PATH)}` +
      (collisions ? ` (resolved ${collisions} slug collision${collisions === 1 ? '' : 's'})` : '')
  );
  console.log(
    `[fetch-data] wrote slim index (${(indexSize / 1024).toFixed(1)} KB, ${((indexSize / fullSize) * 100).toFixed(1)}% of full) ` +
      `and ${detailCount} per-movie detail files`
  );
}

main().catch((err) => {
  console.error(`[fetch-data] UNEXPECTED ERROR: ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});
