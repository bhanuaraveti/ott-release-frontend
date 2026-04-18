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
const OUT_PATH = path.join(REPO_ROOT, 'public', 'data', 'movies.json');
const SOURCE_URL =
  process.env.MOVIES_SOURCE_URL ||
  'https://ott-release-backend.onrender.com/movies';
const FETCH_TIMEOUT_MS = 30_000;

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
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  const tmpPath = `${OUT_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(records, null, 2), 'utf8');
  fs.renameSync(tmpPath, OUT_PATH);

  console.log(
    `[fetch-data] wrote ${records.length} records to ${path.relative(REPO_ROOT, OUT_PATH)}` +
      (collisions ? ` (resolved ${collisions} slug collision${collisions === 1 ? '' : 's'})` : '')
  );
}

main().catch((err) => {
  console.error(`[fetch-data] UNEXPECTED ERROR: ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});
