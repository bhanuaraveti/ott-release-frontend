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
      const jsonPath = path.resolve(__dirname, 'public', 'data', 'movies.json');
      if (!fs.existsSync(jsonPath)) return;
      const source = fs.readFileSync(jsonPath, 'utf8');
      this.emitFile({
        type: 'asset',
        fileName: 'data/movies.json',
        source,
      });
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
    // Gzip compression
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Brotli compression (better than gzip)
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
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
        maxConcurrentRoutes: 4,
        headless: true,
        timeout: 60000,
      },
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
