# OTT Release — Next Steps

Context for a fresh session. The AdSense remediation sprint shipped (see the final section for what's already live). AdSense review has been submitted and is pending (1–14 day turnaround). This doc captures what's left.

## Step -1 — Mobile LCP + residual desktop CLS (START HERE)

Latest PageSpeed on `https://telugumoviesott.onrender.com/`, 2026-04-18 (after AnimatedBackground eager-load fix, commit `09d1501`):

| Metric         | Mobile | Desktop |
| -------------- | ------ | ------- |
| Performance    | 67     | 67      |
| LCP            | 6.5 s  | 1.0 s ✅ |
| CLS            | 0 ✅    | 0.131   |
| TBT            | 70 ms ✅| 270 ms  |
| FCP            | 3.8 s  | 0.4 s ✅ |

Big wins already landed: mobile CLS 0.863 → 0, desktop LCP 2.3s → 1.0s, mobile TBT 200ms → 70ms.

**Two problems remain:**

### a. Mobile LCP 6.5 s / FCP 3.8 s (critical)
The prerendered HTML is ~71 KB uncompressed. On Moto G Power + slow 4G, the initial HTML download + parse dominates paint time. React then hydrates a 1012-row DOM which adds JS cost. Hypotheses to investigate in order:

1. **Trim the prerendered homepage HTML.** Prerender is baking all 1012 rows into `index.html` even though MoviesTable now only shows 50 on first paint. Change the prerender path so only the first 50 rows are in the snapshot; full data still loads from `/data/movies-index.json` after hydration. Biggest expected win.
2. **Critical-CSS inline + lazy the rest.** Tailwind's full CSS is render-blocking; inline only what the above-the-fold hero + first few rows need.
3. **Preload `/data/movies-index.json`** with `<link rel="preload" as="fetch">` — previously preloading the fat `movies.json` backfired, but the slim index is 135 KB and safer. Test carefully on mobile before keeping.
4. **Defer AdSense loader script** with `defer` or move it below the fold.

### b. Desktop CLS 0.131 (just over the 0.1 threshold)
Small residual shift. Likely sources:
- The `LoadingFallback` in `Home.jsx` (`min-h-[600px]`) doesn't match the actual rendered MoviesTable height on desktop — measure the real height after the 50-row pagination change and adjust.
- Or an AdSlot container with a `min-h` that doesn't match what AdSense fills (not fixable until ads actually serve, but worth double-checking `src/components/AdSlot.jsx` min-heights vs slot spec).

Target: CLS < 0.1 desktop, LCP < 2.5 s mobile, Performance ≥ 85 both.

## Step 0 — Fix PageSpeed / Core Web Vitals (mostly done)

Baseline from PageSpeed Insights on `https://telugumoviesott.onrender.com/`, 2026-04-18 (pre-sprint):

| Metric            | Mobile | Desktop |
| ----------------- | ------ | ------- |
| Performance       | 49     | 49      |
| Accessibility     | 96     | 96      |
| Best Practices    | 96     | 77      |
| SEO               | 100    | 100     |
| LCP               | 7.2 s  | 2.3 s   |
| CLS               | 0.863  | 0.573   |
| TBT               | 200 ms | 400 ms  |
| FCP               | 1.4 s  | 0.3 s   |

CLS and LCP are the real problems. Fixing these is also good for AdSense (layout shift is a UX signal they score on) and for search ranking.

**What shipped in the sprint** (commits `acd94d8` → `09d1501`):
- AdSlot + Suspense fallback min-heights → mobile CLS 0.863 → 0.
- Split `movies.json` into slim index (135 KB) + per-movie detail blobs → smaller first paint payload.
- Pagination: render only latest 50 rows initially, "Show more" expands by 100.
- Compression pipeline fix: `postbuild` recompresses `.br`/`.gz` from the real prerendered HTML (was serving empty SPA shells before).
- Eager-load AnimatedBackground → desktop CLS 0.671 → 0.131 (Suspense fallback had `h-screen w-full` in flow; the real component was `absolute` out of flow, causing viewport-height shift on hydration).

Remaining work on Step 0 is covered under **Step -1** above.

### 0a. Cut CLS (biggest impact, smallest diff)

Current CLS 0.86 on mobile is dominated by sections pushing each other around as lazy-loaded content arrives. Likely sources:

- `<MoviesTable>` lazy-loads in `Suspense` with a small spinner (`src/routes/Home.jsx:62`), then expands and pushes "Popular OTT Platforms" + FAQ down.
- `<AdSlot>` renders an empty `<ins>` that AdSense fills at runtime with arbitrary heights. The one at `home-mid` is especially impactful since it's the first ad on the homepage.
- Any `<img>` without width/height (poster art on movie pages, though that's not the homepage CLS source).

Do:

1. In `src/routes/Home.jsx`, change the Suspense fallback wrapper to reserve vertical space. The current `<LoadingFallback />` is an 8-unit spinner; wrap the actual `<MoviesTable>` slot in a `min-h-[600px]` container (adjust the value after measuring actual desktop table height).
2. In `src/components/AdSlot.jsx`, give the outer `<div>` a `min-h-[250px]` (or slot-specific heights via the `SLOT_IDS` map — top/bottom placements are often 250px, in-content can be 300px). Also set `style={{ display: 'block', minHeight: '250px' }}` on the `<ins>` itself so it claims space before AdSense fills.
3. Audit posters / images: run Lighthouse on `/movie/baahubali-the-epic` — if CLS is elevated there, the TMDB poster `<img>` probably needs explicit width/height or `aspect-ratio` CSS.

Target: CLS < 0.1 on both mobile and desktop.

### 0b. Cut LCP on mobile (7.2 s → <2.5 s)

Root cause: the LCP element is likely the first row of `<MoviesTable>` or the gradient `<h2>` hero — both depend on the lazy chunk finishing AND the movies JSON (~1 MB) downloading. On 4G throttling that's a lot.

Do:

1. Add `<link rel="preload" as="fetch" href="/data/movies.json" crossorigin="anonymous">` to `index.html` so the JSON starts downloading in parallel with the JS chunk instead of after.
2. Consider prerendering the first ~20 rows of the movies table directly into the server HTML for the homepage so LCP resolves without waiting on the fetch. Options:
   - Pass initial rows into `<MoviesTable>` via a prop pulled from `window.__INITIAL_MOVIES__` (inline script in `index.html` that reads a compact slice of `movies.json`).
   - Or move the lazy boundary: keep `MoviesTable` eagerly loaded but lazy-load anything else. A ~1 MB JSON fetch is the bottleneck, not the JS chunk.
3. Split `public/data/movies.json` into `movies-index.json` (slim, just names + slugs + platform for the table) and per-movie detail blobs fetched on /movie/:slug. Bigger change, bigger win — do this if steps 1-2 don't get LCP under 2.5 s.

### 0c. Desktop Best Practices 77 (not urgent)

23-point gap is modest but worth a glance. Run DevTools → Lighthouse on desktop and look at the Best Practices section. Common culprits on this codebase:

- Console errors (AdSense `<ins>` not filling when there's no content match, Helmet dev warnings).
- Deprecated APIs.
- Mixed content or missing CSP headers.

Cheap fixes only — don't spend more than 30 min here.

---

## Step 1 — Linkify Home's "Popular OTT Platforms" tiles

`src/routes/Home.jsx:72-81` renders platform names as plain `<div>` text:

```jsx
{['Netflix', 'Prime Video', 'Disney+ Hotstar', 'Aha', 'Zee5', 'Sony LIV', 'ETV Win', 'Sun NXT'].map(platform => (
  <div key={platform} className="bg-white/90 ...">
    <p className="font-semibold">{platform}</p>
  </div>
))}
```

Turn each tile into a `<Link to="/platform/{slug}">`. Slug mapping lives at `src/content/platforms/` — the 7 platforms we actually have pages for are: `netflix`, `prime-video`, `hotstar`, `aha`, `zee5`, `sonyliv`, `apple-tv`.

Notes:
- Current list has 8 names; we only have pages for 7. Drop `ETV Win` and `Sun NXT` from the list, or add them to both `src/content/platforms/` (new JSON file each) AND to the `PLATFORM_SLUGS` array in `vite.config.js`. Keeping them as dead text is worse than removing them.
- `Disney+ Hotstar` label → `hotstar` slug.
- Add a small hover state (`hover:bg-blue-50 dark:hover:bg-gray-700`) since these are now clickable.

Why it matters: internal link graph for Google (homepage → platform pages is a key signal), plus users can actually navigate to the new content. Cheap, satisfying win.

---

## Step 2 — Polish on blog index and post pages

`src/routes/BlogIndex.jsx` currently shows posts with title + description. Consider:

- Reading time indicator (already in frontmatter per post — `frontmatter.readingTime`).
- Date in a consistent format (done in `BlogPost.jsx`; mirror on index).
- Tag chips if the content benefits (optional — only if we add tags to frontmatter).

Low priority; only do if the AdSense review pushes back on editorial feel.

---

## Step 3 — URL Inspection / Request Indexing in Search Console

Search Console daily quota is ~10-15 URLs per property. Prioritize these over 2-3 days:

1. `https://telugumoviesott.onrender.com/`
2. `https://telugumoviesott.onrender.com/blog`
3. `https://telugumoviesott.onrender.com/platform/aha`
4. `https://telugumoviesott.onrender.com/platform/netflix`
5. `https://telugumoviesott.onrender.com/platform/prime-video`
6. `https://telugumoviesott.onrender.com/blog/best-telugu-films-aha`
7. `https://telugumoviesott.onrender.com/blog/ott-release-calendar-april-2026`
8. `https://telugumoviesott.onrender.com/movie/baahubali-the-epic`
9. `https://telugumoviesott.onrender.com/movie/hit-the-third-case` (or any other 2025 enriched title)
10. `https://telugumoviesott.onrender.com/about`

For each: "Test Live URL" first → confirm "URL is available to Google" and the screenshot shows rendered content (that's proof the prerender is working). Then "Request Indexing."

---

## Step 4 — Monitor

- Watch Search Console → Performance over the next 2–4 weeks for impressions on the new `/platform/*` and `/blog/*` routes. If nothing shows up after 2 weeks, re-check the sitemap submission and crawl stats.
- Watch the AdSense inbox / dashboard for the review verdict.
- If AdSense rejects again, the rejection email will list specific reasons — re-open the plan at `~/.claude/plans/fluttering-dazzling-moon.md` and iterate.

---

## Reference — What's already live

All of the below shipped in this sprint and doesn't need to be redone:

- **Prerender pipeline:** `@prerenderer/rollup-plugin` in `vite.config.js` snapshots HTML for every route (home, about, privacy, /blog, /blog/:slug, /platform/:slug, /movie/:slug). `skipThirdPartyRequests: true` + `maxConcurrentRoutes: 2` tuned to complete inside Render's build timeout.
- **Content:** 7 platform pages (`src/content/platforms/*.json` + `src/routes/PlatformPage.jsx`), 8 blog posts (`src/content/blog/*.jsx` + `src/routes/BlogIndex.jsx` + `BlogPost.jsx`), 1012 TMDB-enriched movie pages.
- **TMDB enrichment:** `ott-release-backend/scripts/backfill_tmdb.py` populated 763 `ok` + 217 `not_found` + 32 `error` records into `data/movies.json`. Errors self-heal on the nightly scrape since `enrich_new_movies` retries records without `tmdb_id`. Rate limit set to 0.55s (~3.6 req/s) with INFO-level request logging.
- **AdSense integration:** `src/components/AdSlot.jsx` with real numeric slot IDs for 5 placements (`home-mid`, `movie-detail`, `platform-top`, `platform-bottom`, `blog-post`). Auto page-level ads disabled. Loader script in `index.html`.
- **SEO:** per-route `<Seo>` component sets title/description/canonical/JSON-LD via `@dr.pogodin/react-helmet`. WebSite / CollectionPage / BlogPosting / Movie JSON-LD emitted for the right route types.
- **Sitemap:** `scripts/generate-sitemap.mjs` runs in `prebuild` → `public/sitemap.xml` with 1031 URLs. `public/robots.txt` points at it. Backend's stub `/sitemap.xml` and `/robots.txt` routes removed to avoid confusion.
- **Deploy pipeline:** Backend auto-deploys on push; frontend has a manual deploy hook at `https://api.render.com/deploy/srv-cuotu256l47c73cgv9d0?key=ZfuQKOyZnQ4` (saved in memory under `reference_render_hooks.md`). Nightly scrape fires the hook after fresh data lands.
- **Search Console:** `sitemap.xml` resubmitted and accepted on 2026-04-18. AdSense review submitted same day.

### Key files to know

- `src/routes/Home.jsx` — homepage (hero, MoviesTable, AdSlot, platforms grid, FAQ).
- `src/routes/MovieDetail.jsx` — per-movie page; consumes enriched TMDB fields.
- `src/routes/PlatformPage.jsx` — per-platform directory page.
- `src/routes/BlogIndex.jsx`, `BlogPost.jsx` — blog.
- `src/components/AdSlot.jsx` — AdSense `<ins>` with slot-name → ID map.
- `src/components/Seo.jsx` — helmet wrapper, single source of truth for head tags.
- `src/App.jsx` — router + Helmet context + prerender-ready event dispatch.
- `vite.config.js` — prerender config, including `computePrerenderRoutes()` that reads `public/data/movies.json`.
- `scripts/fetch-data.mjs` — prebuild step, pulls movies JSON from backend.
- `scripts/generate-sitemap.mjs` — prebuild step, writes sitemap from the JSON + content dirs.
- `index.html` — AdSense loader, favicon, OG defaults. Per-route `<title>`/`<meta>`/canonical are owned by Seo.jsx, not here.

### Known non-issues

- The 32 `error` records in `movies.json` are transient network failures during the initial backfill; they have `tmdb_id: null` so the nightly scrape picks them up automatically.
- `AdSlot` returns `null` for unknown slot names — this is intentional, not a bug.
- The `home-mid` ad being invisible before AdSense approves is expected; once approved, real ads will fill.
