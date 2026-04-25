import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import { compression } from 'vite-plugin-compression2';
import prerender from '@prerenderer/rollup-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * During prerender, `@prerenderer/rollup-plugin` strips express's
 * static-file middleware and only serves URLs present in the rollup
 * `bundle`. Public assets like `public/data/movies.json` are copied to
 * `dist/` separately and are NOT in `bundle`, so a fetch for
 * `/data/movies.json` from inside a prerendered page returns the SPA
 * shell HTML instead of JSON. That breaks MovieDetail's data load.
 *
 * Fix: emit the JSON as a rollup asset so it lives in `bundle`. The
 * prerender plugin's wildcard handler then returns real JSON, and
 * `fetch('/data/movies.json')` resolves as expected.
 *
 * In production the file is still served from disk by Render's static
 * host, so there's no runtime change.
 */
function emitMoviesJsonForPrerender() {
  return {
    name: 'emit-movies-json-for-prerender',
    enforce: 'pre',
    apply: 'build',
    generateBundle() {
      const dataDir = path.resolve(__dirname, 'public', 'data');

      // Full movies.json — still used by sitemap generator + Node-side
      // loader fallback. Not fetched at runtime anymore.
      const fullPath = path.join(dataDir, 'movies.json');
      if (fs.existsSync(fullPath)) {
        this.emitFile({
          type: 'asset',
          fileName: 'data/movies.json',
          source: fs.readFileSync(fullPath, 'utf8'),
        });
      }

      // Slim index — fetched by MoviesTable (home) and PlatformPage.
      const indexPath = path.join(dataDir, 'movies-index.json');
      if (fs.existsSync(indexPath)) {
        this.emitFile({
          type: 'asset',
          fileName: 'data/movies-index.json',
          source: fs.readFileSync(indexPath, 'utf8'),
        });
      }

      // Per-movie detail files — fetched by MovieDetail on navigation.
      // Emit each one so the prerender express static server can serve
      // them from `bundle` during headless-Chromium route snapshots.
      const detailDir = path.join(dataDir, 'movies');
      if (fs.existsSync(detailDir) && fs.statSync(detailDir).isDirectory()) {
        const files = fs.readdirSync(detailDir);
        let emitted = 0;
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          this.emitFile({
            type: 'asset',
            fileName: `data/movies/${file}`,
            source: fs.readFileSync(path.join(detailDir, file), 'utf8'),
          });
          emitted += 1;
        }
        if (emitted > 0) {
          // eslint-disable-next-line no-console
          console.log(`[vite.config] emitted ${emitted} per-movie detail files for prerender`);
        }
      }
    },
  };
}

/**
 * Compute the prerender route list. Read public/data/movies.json (written by
 * scripts/fetch-data.mjs in `prebuild`) and emit one route per record.
 *
 * Falls back to just the three static routes if the JSON is missing (e.g.
 * local `vite build` run without `prebuild`) or malformed. This keeps
 * dev ergonomics sane without silently shipping a 3-page production build.
 */
const PLATFORM_SLUGS = [
  'aha',
  'prime-video',
  'netflix',
  'hotstar',
  'zee5',
  'sonyliv',
  'apple-tv',
];

const BLOG_SLUGS = [
  'best-telugu-films-aha',
  'prime-video-telugu-lineup',
  'netflix-telugu-originals',
  'ott-release-calendar-april-2026',
  'hotstar-telugu-watchlist',
  'zee5-telugu-picks',
  'sonyliv-telugu-guide',
  'how-we-track-ott-releases',
  'telugu-ott-roundup-april-15-25-2026',
];

function computePrerenderRoutes() {
  const platformRoutes = PLATFORM_SLUGS.map((s) => `/platform/${s}`);
  const blogRoutes = ['/blog', ...BLOG_SLUGS.map((s) => `/blog/${s}`)];
  const staticRoutes = ['/', '/about', '/privacy', ...platformRoutes, ...blogRoutes];
  const jsonPath = path.resolve(__dirname, 'public', 'data', 'movies.json');
  if (!fs.existsSync(jsonPath)) {
    console.warn(
      `[vite.config] ${jsonPath} not found — prerendering only static routes. ` +
        `Run \`yarn prebuild\` (or \`yarn build\`) to pull backend data.`,
    );
    return staticRoutes;
  }
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const records = JSON.parse(raw);
    if (!Array.isArray(records)) {
      console.warn('[vite.config] movies.json is not an array — falling back to static routes.');
      return staticRoutes;
    }
    const movieRoutes = [];
    const seen = new Set();
    for (const record of records) {
      if (!record || typeof record.slug !== 'string' || !record.slug) continue;
      if (seen.has(record.slug)) continue;
      seen.add(record.slug);
      movieRoutes.push(`/movie/${record.slug}`);
    }
    // Allow opt-in subsetting for slow hardware / debugging. Useful
    // locally if a full 1012-route run exceeds patience.
    const limit = Number(process.env.PRERENDER_LIMIT || '');
    const trimmed = limit > 0 ? movieRoutes.slice(0, limit) : movieRoutes;
    if (limit > 0) {
      console.warn(
        `[vite.config] PRERENDER_LIMIT=${limit} set — only ${trimmed.length} of ${movieRoutes.length} movie routes will be prerendered.`,
      );
    }
    console.log(
      `[vite.config] prerender route plan: ${staticRoutes.length} static + ${trimmed.length} movie routes`,
    );
    return [...staticRoutes, ...trimmed];
  } catch (err) {
    console.warn(`[vite.config] failed to parse movies.json: ${err.message} — falling back to static routes.`);
    return staticRoutes;
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Register movies.json as a rollup asset so the prerender express
    // server can serve it. Must come before the prerender plugin so the
    // asset lands in `bundle` by the time the wildcard handler runs.
    emitMoviesJsonForPrerender(),
    // Build-time prerender: snapshot real HTML for each route so the
    // AdSense crawler (and other non-JS crawlers) can see rendered content.
    // Route list is computed from public/data/movies.json written by
    // scripts/fetch-data.mjs during `prebuild`.
    prerender({
      routes: computePrerenderRoutes(),
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        renderAfterDocumentEvent: 'prerender-ready',
        // 2 is the safe default on Render's 512MB build dyno. 4 works
        // locally but thrashes under 1k+ routes on modest hardware, which
        // can push individual routes past the 60s per-route ceiling.
        maxConcurrentRoutes: 2,
        headless: true,
        timeout: 60000,
        // Block third-party requests (AdSense, GA, TMDB image CDN) during
        // prerender. We only need the rendered DOM in the snapshot — the
        // real AdSense script runs at browser-load time on the live site.
        // Without this, pagead2.googlesyndication.com fetches serialize
        // through Chromium's network stack and can stall individual pages
        // past the 60s per-route timeout on a cold Render build dyno.
        skipThirdPartyRequests: true,
      },
    }),
    // Compression runs AFTER prerender so the precompressed .gz / .br
    // files contain the real prerendered HTML (with rendered movie rows,
    // etc.) — not the empty SPA shell. Previously compression ran before
    // prerender and the .br / .gz variants were the tiny pre-render
    // shells, which Render would serve to any client sending
    // `Accept-Encoding: br` — defeating the whole prerender pipeline.
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],

  build: {
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500,

    // CSS code splitting
    cssCodeSplit: true,

    // Source maps (disable for production)
    sourcemap: false,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
