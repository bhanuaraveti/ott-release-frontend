/**
 * Editorial copy helpers for movie detail pages.
 *
 * The core function, `buildEditorialBlurb(movie)`, implements the
 * template from the AdSense remediation plan (§Fallback Copy). It must
 * reliably produce >200 words for the page body even when every
 * optional TMDB field is null — the fallback is the AdSense word-count
 * cushion for unenriched records.
 *
 * All field access is defensive: any record returned by the loader is
 * acceptable input, including the raw pre-enrichment 5-field shape.
 */
import slugify from 'slugify';

/**
 * @param {string} value
 * @returns {string}
 */
export function slugifyPlatform(value) {
  const base = slugify(value || 'other', { lower: true, strict: true });
  return base || 'other';
}

/**
 * Convert the backend's flexible `available_on` string into a
 * human-readable date. Accepts "17 Apr 2026", "2024-02-23", "Soon",
 * null, etc.
 *
 * @param {string|null|undefined} raw
 * @returns {string|null}
 */
export function formatReleaseDate(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Skip placeholder strings — render them as-is for the caller to decide.
  if (/^(soon|tba|tbd|n\/a)$/i.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
  return trimmed;
}

/**
 * Runtime in minutes → "2h 38m". Returns null on bad input.
 *
 * @param {number|null|undefined} minutes
 * @returns {string|null}
 */
export function formatRuntime(minutes) {
  if (minutes == null || typeof minutes !== 'number' || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * The heart of the AdSense fallback. Returns an object with a
 * consistent shape so MovieDetail.jsx can pick pieces regardless of
 * enrichment status.
 *
 * @param {import('../data/loader').MovieRecord} movie
 * @returns {{
 *   intro: string,
 *   body: string,
 *   editorial: string,
 *   cta: string,
 *   facts: string[]
 * }}
 */
export function buildEditorialBlurb(movie) {
  const name = (movie && movie.name) || 'This title';
  const platform = (movie && movie.platform) || 'the streaming service';
  const platformSlug = slugifyPlatform(platform);
  const type = (movie && movie.type) || 'Film';
  const typeLower = type.toLowerCase();
  const isSeries = /series|show/i.test(type);
  const imdbRating = movie && movie.imdb_rating;
  const releaseDate = formatReleaseDate(movie && movie.available_on);
  const overview = movie && typeof movie.overview === 'string' ? movie.overview.trim() : '';
  const director = movie && movie.director;
  const cast = Array.isArray(movie && movie.cast) ? movie.cast.filter((c) => c && c.name) : [];
  const genres = Array.isArray(movie && movie.genres) ? movie.genres.filter(Boolean) : [];
  const runtimeStr = formatRuntime(movie && movie.runtime);

  // Paragraph 1 — hero framing, always present, never depends on TMDB data.
  const releaseClause = releaseDate
    ? releaseDate === 'Soon' || releaseDate === 'TBA' || releaseDate === 'TBD'
      ? `, with streaming arriving ${releaseDate.toLowerCase()}`
      : `, streaming from ${releaseDate}`
    : '';
  const intro =
    `${name} is a ${typeLower} available on ${platform}${releaseClause}. ` +
    `This page is part of our continuously updated directory of Telugu films and series on OTT platforms in India. ` +
    `We track ${platform} weekly and refresh this listing whenever a new streaming window opens or a title is pulled from the service.`;

  // Paragraph 2 — per plan: if overview is present, it replaces the
  // middle paragraph; otherwise the generic watch-where paragraph runs.
  let body;
  if (overview) {
    body = overview;
  } else {
    const searchPhrase = isSeries
      ? `where to watch ${name} online in Telugu`
      : `where to watch ${name} online in Telugu`;
    const availabilityClause = isSeries
      ? `this entry confirms it is streaming as a series on ${platform}`
      : `this entry confirms it is available as a film on ${platform}`;
    const ratingClause = imdbRating
      ? `IMDb currently rates it ${imdbRating}/10 based on user reviews.`
      : `User ratings are not yet available for this title, which is common for recent releases still gathering audience feedback.`;
    body =
      `If you are searching for ${searchPhrase}, ${availabilityClause}. ${ratingClause} ` +
      `Our directory is curated for viewers in India who want a single place to check OTT availability for Telugu cinema without chasing platform-specific announcements.`;
  }

  // Paragraph 3 — editorial framing, always emitted. This is the word-count
  // cushion. Deliberately written to stay relevant whether or not TMDB
  // data is present.
  const creditsLine = (() => {
    const parts = [];
    if (director) parts.push(`directed by ${director}`);
    if (cast.length) {
      const leads = cast
        .slice(0, 3)
        .map((c) => c.name)
        .filter(Boolean)
        .join(', ');
      if (leads) parts.push(`featuring ${leads}`);
    }
    if (!parts.length) return '';
    return ` The cast and crew details — ${parts.join(' and ')} — are sourced from our metadata provider and verified against platform listings where possible.`;
  })();

  const genreLine = genres.length
    ? ` Classified under ${genres.slice(0, 3).join(', ')}, it joins a broader catalogue of Telugu releases we index on the same platform.`
    : '';

  const runtimeLine = runtimeStr
    ? ` With a runtime of ${runtimeStr}, it fits a standard ${isSeries ? 'episodic session' : 'single-sitting watch'}.`
    : '';

  const editorial =
    `We will expand this page with a fuller synopsis, cast, and crew as soon as the title is indexed by our metadata provider.` +
    creditsLine +
    genreLine +
    runtimeLine +
    ` In the meantime, the table above reflects the most recent availability we have on record, and the links below make it easy to jump to the platform or browse other Telugu titles streaming right now.`;

  // CTA paragraph (rendered separately near related links).
  const cta =
    `Browse every Telugu title on ${platform} in our ${platform} lineup, or return to the homepage for the full weekly release calendar across every OTT service we track.`;

  // Facts for a simple <ul> when overview is missing — keeps the
  // content hierarchy readable.
  const facts = [];
  if (releaseDate) facts.push(`Release date: ${releaseDate}`);
  facts.push(`Platform: ${platform}`);
  facts.push(`Type: ${type}`);
  if (imdbRating) facts.push(`IMDb rating: ${imdbRating}/10`);
  if (runtimeStr) facts.push(`Runtime: ${runtimeStr}`);
  if (genres.length) facts.push(`Genres: ${genres.join(', ')}`);
  if (director) facts.push(`Director: ${director}`);

  return { intro, body, editorial, cta, facts, platformSlug };
}

/**
 * Produce a description suitable for <meta name="description"> — capped
 * at 160 chars, prefers the TMDB overview and falls back to the intro.
 *
 * @param {import('../data/loader').MovieRecord} movie
 * @returns {string}
 */
export function buildMetaDescription(movie) {
  const overview = movie && typeof movie.overview === 'string' ? movie.overview.trim() : '';
  const source = overview || buildEditorialBlurb(movie).intro;
  const cleaned = source.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 160) return cleaned;
  const trimmed = cleaned.slice(0, 157);
  const lastSpace = trimmed.lastIndexOf(' ');
  return `${(lastSpace > 120 ? trimmed.slice(0, lastSpace) : trimmed).trim()}...`;
}
