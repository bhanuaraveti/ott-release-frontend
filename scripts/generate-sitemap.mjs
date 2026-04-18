#!/usr/bin/env node
/**
 * generate-sitemap — write public/sitemap.xml from the current route plan.
 *
 * Runs in `prebuild` after fetch-data.mjs so movies.json is already on disk
 * and the full route list is discoverable from the filesystem. Matches the
 * routes computed in vite.config.js::computePrerenderRoutes so what we tell
 * Google is exactly what we prerender.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const SITE = 'https://telugumoviesott.onrender.com';
const TODAY = new Date().toISOString().slice(0, 10);

function readPlatformSlugs() {
  const dir = path.join(REPO_ROOT, 'src', 'content', 'platforms');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

function readBlogSlugs() {
  const dir = path.join(REPO_ROOT, 'src', 'content', 'blog');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.jsx'))
    .map((f) => f.replace(/\.jsx$/, ''));
}

function readMovieSlugs() {
  const p = path.join(REPO_ROOT, 'public', 'data', 'movies.json');
  if (!fs.existsSync(p)) {
    console.warn(`[sitemap] ${p} not found — skipping movie URLs.`);
    return [];
  }
  const records = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!Array.isArray(records)) {
    console.warn('[sitemap] movies.json is not an array — skipping movie URLs.');
    return [];
  }
  const seen = new Set();
  const out = [];
  for (const r of records) {
    if (!r || typeof r.slug !== 'string' || !r.slug) continue;
    if (seen.has(r.slug)) continue;
    seen.add(r.slug);
    out.push(r.slug);
  }
  return out;
}

function urlEntry(loc, { changefreq = 'weekly', priority = '0.7' } = {}) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function buildSitemap() {
  const entries = [];
  entries.push(urlEntry(`${SITE}/`, { changefreq: 'daily', priority: '1.0' }));
  entries.push(urlEntry(`${SITE}/about`, { changefreq: 'monthly', priority: '0.5' }));
  entries.push(urlEntry(`${SITE}/privacy`, { changefreq: 'monthly', priority: '0.3' }));
  entries.push(urlEntry(`${SITE}/blog`, { changefreq: 'weekly', priority: '0.8' }));

  for (const slug of readPlatformSlugs()) {
    entries.push(urlEntry(`${SITE}/platform/${slug}`, { changefreq: 'weekly', priority: '0.8' }));
  }
  for (const slug of readBlogSlugs()) {
    entries.push(urlEntry(`${SITE}/blog/${slug}`, { changefreq: 'monthly', priority: '0.6' }));
  }
  for (const slug of readMovieSlugs()) {
    entries.push(urlEntry(`${SITE}/movie/${slug}`, { changefreq: 'monthly', priority: '0.6' }));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
}

function main() {
  const xml = buildSitemap();
  const outPath = path.join(REPO_ROOT, 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  const count = (xml.match(/<loc>/g) || []).length;
  console.log(`[sitemap] wrote ${outPath} with ${count} URLs`);
}

main();
