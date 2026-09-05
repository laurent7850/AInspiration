/**
 * Authorization contract: every API route that is not on the public allowlist
 * must answer 401 to an anonymous request — before validation, before touching
 * the database. Runs against a real server.js process with no database, so a
 * route that reaches Postgres without auth shows up as a 500, not a 401.
 *
 * The two critical findings of the 2026-09-05 audit (public access-log writes,
 * public subscriber lookup) would both have failed this test.
 *
 * Run: `npm test` in docker/backend (Node >= 20, no dependency).
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(here, '..', 'server.js');
const PORT = 3900 + Math.floor(Math.random() * 100);
const BASE = `http://127.0.0.1:${PORT}`;

// Routes that are public BY DESIGN. Adding a route here is a security
// decision: say why in a comment.
const PUBLIC = new Set([
  'GET /health',
  'GET /api/status',
  'POST /api/auth/register',                     // gated by ALLOW_REGISTRATION
  'POST /api/auth/login',
  'POST /api/auth/logout',
  'GET /api/blog-posts',                         // published only for anon
  'GET /api/blog-posts/slug/:slug',              // published only for anon
  'GET /api/blog-posts/:id',                     // published only for anon
  'GET /api/blog-categories',
  'POST /api/contact-messages',                  // honeypot + consent + formLimiter
  'GET /api/newsletter-subscribers/by-token',    // token is the secret
  'POST /api/newsletter-subscribers',            // double opt-in, generic answer
  'GET /api/newsletter-subscribers/pending',     // token-gated, used by n8n
  'GET /api/newsletter-subscribers/confirm',     // link in the confirmation email
  'POST /api/newsletter-subscribers/unsubscribe',// token only
  'POST /api/webhook/chat',                      // chatLimiter
  'POST /api/webhook/audit',                     // formLimiter + consent
  'POST /api/webhook/contact',                   // formLimiter + consent
  'GET /api/linkedin/callback',                  // OAuth redirect target
  // POST /api/webhook/linkedin-post is NOT listed: it answers 401 without the
  // x-webhook-secret header, which is exactly the contract the private test checks.
]);

// Every `app.<method>('/api/...'` in server.js and routes/*.js (split of
// 2026-09-05). The catch-alls (`*`) are the SPA.
function discoverRoutes() {
  const files = [SERVER, ...readdirSync(path.join(here, '..', 'routes')).filter((f) => f.endsWith('.js')).map((f) => path.join(here, '..', 'routes', f))];
  const src = files.map((f) => readFileSync(f, 'utf8')).join(String.fromCharCode(10));
  const re = /^app\.(get|post|put|patch|delete)\('([^']+)'/gm;
  const routes = [];
  let m;
  while ((m = re.exec(src))) {
    if (m[2] === '*') continue;
    routes.push({ method: m[1].toUpperCase(), path: m[2] });
  }
  return routes;
}

const UUID = '00000000-0000-4000-8000-000000000000';
const concretePath = (p) => p.replace(/:[a-zA-Z_]+/g, UUID);

let child;
before(async () => {
  child = spawn(process.execPath, [SERVER], {
    cwd: path.join(here, '..'),
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'test',
      JWT_SECRET: 'test-only-secret',
      DATABASE_URL: 'postgres://nobody:nobody@127.0.0.1:1/none',
      ALLOWED_ORIGINS: BASE,
      N8N_BASE: 'http://127.0.0.1:1/never',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('server.js did not start');
});

after(() => { child?.kill(); });

const routes = discoverRoutes();

test('route discovery finds the API surface', () => {
  assert.ok(routes.length > 60, `only ${routes.length} routes discovered`);
});

for (const route of routes) {
  const key = `${route.method} ${route.path}`;
  const url = `${BASE}${concretePath(route.path)}`;
  const init = { method: route.method, headers: { 'Content-Type': 'application/json' } };
  if (route.method !== 'GET') init.body = '{}';

  if (PUBLIC.has(key)) {
    test(`public   ${key} is reachable without a token`, async () => {
      const r = await fetch(url, init);
      assert.notEqual(r.status, 401, `${key} unexpectedly requires auth`);
    });
  } else {
    test(`private  ${key} answers 401 to an anonymous request`, async () => {
      const r = await fetch(url, init);
      assert.equal(r.status, 401, `${key} answered ${r.status} without a token`);
    });
  }
}

test('no route in PUBLIC has disappeared from server.js', () => {
  const known = new Set(routes.map((r) => `${r.method} ${r.path}`));
  for (const p of PUBLIC) assert.ok(known.has(p), `${p} is allowlisted but no longer exists`);
});
