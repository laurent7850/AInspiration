// Regenerates docker/dist-manifest.txt from the freshly built dist/ folder.
//
// The VPS container (ainspiration-web) downloads the frontend from Netlify at
// boot, file by file, using this manifest. If the manifest is stale, lazy
// chunks that exist in dist/ but are missing from the list never reach the
// container — the whole site 500s/404s on navigation. This script runs as an
// npm `postbuild` hook so the manifest is *always* in sync with the last build.
//
// Format: paths relative to dist/, POSIX separators, sorted, one per line.
// Excludes pre-compressed (.br/.gz) and sourcemap (.map) files, which are not
// fetched by the container.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url)); // scripts/
const projectRoot = join(root, '..');
const distDir = join(projectRoot, 'dist');
const manifestPath = join(projectRoot, 'docker', 'dist-manifest.txt');

const EXCLUDED = /\.(br|gz|map)$/i;

/** @param {string} dir @returns {string[]} files relative to distDir, POSIX paths */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) {
      out.push(...walk(abs));
    } else if (!EXCLUDED.test(entry)) {
      out.push(relative(distDir, abs).split(sep).join('/'));
    }
  }
  return out;
}

try {
  statSync(distDir);
} catch {
  console.error(`[dist-manifest] dist/ not found at ${distDir} — run the build first.`);
  process.exit(1);
}

const files = walk(distDir).sort();
if (files.length === 0) {
  console.error('[dist-manifest] dist/ is empty — aborting to avoid wiping the manifest.');
  process.exit(1);
}

writeFileSync(manifestPath, files.join('\n') + '\n', 'utf8');
console.log(`[dist-manifest] Wrote ${files.length} entries to docker/dist-manifest.txt`);
