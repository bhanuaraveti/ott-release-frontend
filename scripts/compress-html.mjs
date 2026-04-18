#!/usr/bin/env node
/**
 * postbuild — recompress prerendered HTML files.
 *
 * `vite-plugin-compression2` runs during rollup's generateBundle hook. The
 * @prerenderer/rollup-plugin writes its snapshots to disk *after* that,
 * which means the precompressed .br / .gz variants on disk come from the
 * tiny empty SPA shell — not from the real prerendered HTML with movie
 * rows baked in.
 *
 * Render serves the static .br file as-is when the client sends
 * `Accept-Encoding: br`, so the stale shell wins and the user never sees
 * the prerendered content.
 *
 * This script walks `dist/` after the build completes, finds every .html
 * file, and (re)writes .html.br and .html.gz from its current contents.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

function* walkHtml(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkHtml(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield full;
    }
  }
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.warn(`[compress-html] ${DIST_DIR} does not exist — skipping.`);
    return;
  }
  let count = 0;
  let totalRaw = 0;
  let totalBr = 0;
  let totalGz = 0;
  for (const htmlPath of walkHtml(DIST_DIR)) {
    const raw = fs.readFileSync(htmlPath);
    const br = zlib.brotliCompressSync(raw, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      },
    });
    const gz = zlib.gzipSync(raw, { level: 9 });
    fs.writeFileSync(`${htmlPath}.br`, br);
    fs.writeFileSync(`${htmlPath}.gz`, gz);
    count += 1;
    totalRaw += raw.length;
    totalBr += br.length;
    totalGz += gz.length;
  }
  const kb = (n) => (n / 1024).toFixed(1);
  console.log(
    `[compress-html] recompressed ${count} HTML file${count === 1 ? '' : 's'}: ` +
      `raw ${kb(totalRaw)} KB, br ${kb(totalBr)} KB, gz ${kb(totalGz)} KB`
  );
}

main();
