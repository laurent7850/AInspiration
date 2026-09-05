/**
 * Local preview of the production stack without a database.
 *
 * Runs docker/backend/server.js against the last `npm run build` output, the
 * same way the VPS container does (Express serves dist/ + injects SEO HTML).
 * Everything that needs PostgreSQL (blog list, CRM, newsletter) answers 500;
 * pages, translations, forms UI and the server-rendered HTML are exercised
 * for real. Usage: `node scripts/local-preview.cjs` → http://localhost:3100
 */
const { spawn } = require('child_process');
const { existsSync, symlinkSync, rmSync } = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'docker', 'backend');
const DIST = path.join(ROOT, 'dist');
const LINK = path.join(BACKEND, 'dist');
const PORT = process.env.PORT || '3100';

if (!existsSync(path.join(DIST, 'index.html'))) {
  console.error('[local-preview] dist/index.html missing — run `npm run build` first.');
  process.exit(1);
}
if (!existsSync(path.join(BACKEND, 'node_modules'))) {
  console.error('[local-preview] docker/backend/node_modules missing — run `npm install --omit=dev` in docker/backend first.');
  process.exit(1);
}
// server.js reads dist/ next to itself; a junction (Windows) / symlink points it at the build.
if (existsSync(LINK)) rmSync(LINK, { recursive: false, force: true });
symlinkSync(DIST, LINK, 'junction');

const child = spawn(process.execPath, ['server.js'], {
  cwd: BACKEND,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT,
    NODE_ENV: 'production',
    JWT_SECRET: process.env.JWT_SECRET || 'local-preview-only-not-a-real-secret',
    DATABASE_URL: process.env.DATABASE_URL || 'postgres://nobody:nobody@127.0.0.1:1/none',
    ALLOWED_ORIGINS: `http://localhost:${PORT},http://127.0.0.1:${PORT}`,
    N8N_BASE: process.env.N8N_BASE || 'http://127.0.0.1:1/never', // never hit real webhooks from a preview
  },
});
const cleanup = () => { try { rmSync(LINK, { force: true }); } catch (e) { /* ignore */ } };
child.on('exit', (code) => { cleanup(); process.exit(code ?? 0); });
process.on('SIGINT', () => { child.kill('SIGINT'); });
process.on('SIGTERM', () => { child.kill('SIGTERM'); });
console.log(`[local-preview] http://localhost:${PORT} (no database: DB-backed routes answer 500)`);
