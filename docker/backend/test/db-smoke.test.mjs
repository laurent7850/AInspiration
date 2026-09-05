/**
 * Database-backed smoke test — runs only when DATABASE_URL points at a
 * PostgreSQL that already has docker/init.sql + migrations applied (CI job
 * "backend-db"). Locally without a database every test is skipped.
 *
 * Covers the flows the authorization contract cannot: the public blog API
 * against real rows, the newsletter double opt-in end to end (pending →
 * confirm → subscribed → unsubscribe by token), a consented contact message,
 * and the server-rendered article HTML.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(here, '..', 'server.js');
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = 3800 + Math.floor(Math.random() * 100);
const BASE = `http://127.0.0.1:${PORT}`;
const skip = !DATABASE_URL || DATABASE_URL.includes('127.0.0.1:1/');

let child;
let pool;

before(async () => {
  if (skip) return;
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: DATABASE_URL });
  // A published article to serve
  await pool.query(
    `INSERT INTO blog_posts (title, slug, excerpt, content, status, language, published_at)
     VALUES ('Article de test CI', 'ci-smoke-article', 'Extrait de test.', '<p>Corps de test avec <a href="https://ainspiration.eu/audit">lien</a>.</p>', 'published', 'fr', NOW())
     ON CONFLICT (slug) DO NOTHING`
  );
  child = spawn(process.execPath, [SERVER], {
    cwd: path.join(here, '..'),
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'test',
      JWT_SECRET: 'test-only-secret',
      DATABASE_URL,
      ALLOWED_ORIGINS: BASE,
      N8N_BASE: 'http://127.0.0.1:1/never', // confirmation email call fails silently
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/health`); if (r.ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('server.js did not start');
});

after(async () => {
  child?.kill();
  if (pool) {
    await pool.query(`DELETE FROM newsletter_subscribers WHERE email LIKE 'ci-smoke-%@example.com'`);
    await pool.query(`DELETE FROM contact_messages WHERE email LIKE 'ci-smoke-%@example.com'`);
    await pool.query(`DELETE FROM blog_posts WHERE slug = 'ci-smoke-article'`);
    await pool.end();
  }
});

const json = (init) => ({ headers: { 'Content-Type': 'application/json' }, ...init });

test('blog list: published rows, no body by default, body on request', { skip }, async () => {
  const r = await fetch(`${BASE}/api/blog-posts?language=fr&limit=5`);
  assert.equal(r.status, 200);
  const rows = await r.json();
  assert.ok(Array.isArray(rows) && rows.length > 0);
  assert.ok(rows.every((p) => p.status === 'published'));
  assert.ok(rows.every((p) => !('content' in p)), 'list must not carry content');
  assert.ok(rows.every((p) => typeof p.image_url === 'string' && p.image_url.length > 0), 'cover fallback');
  const full = await (await fetch(`${BASE}/api/blog-posts?language=fr&limit=1&include=content`)).json();
  assert.ok('content' in full[0]);
});

test('article HTML: title, BlogPosting JSON-LD, article og:type', { skip }, async () => {
  const html = await (await fetch(`${BASE}/blog/ci-smoke-article`)).text();
  assert.match(html, /<title>Article de test CI \| Blog AInspiration<\/title>/);
  assert.match(html, /"@type":"BlogPosting"/);
  assert.match(html, /<meta property="og:type" content="article"/);
  assert.match(html, /<h1>Article de test CI<\/h1>/);
});

test('unknown article → 404, unknown route → 404, /etudes-de-cas → 301', { skip }, async () => {
  assert.equal((await fetch(`${BASE}/blog/does-not-exist-ci`)).status, 404);
  assert.equal((await fetch(`${BASE}/page-inexistante-ci`)).status, 404);
  const r = await fetch(`${BASE}/etudes-de-cas`, { redirect: 'manual' });
  assert.equal(r.status, 301);
  assert.equal(r.headers.get('location'), '/realisations');
});

test('newsletter double opt-in: pending → confirm → subscribed → unsubscribe by token', { skip }, async () => {
  const email = `ci-smoke-${Date.now()}@example.com`;
  const r = await fetch(`${BASE}/api/newsletter-subscribers`, json({ method: 'POST', body: JSON.stringify({ email, language: 'fr', source: 'ci' }) }));
  assert.equal(r.status, 201);
  assert.deepEqual(await r.json(), { success: true, pending: true });

  const row = (await pool.query('SELECT status, confirm_token, unsubscribe_token FROM newsletter_subscribers WHERE email = $1', [email])).rows[0];
  assert.equal(row.status, 'pending');
  assert.ok(row.confirm_token);

  // n8n's lookup
  const pending = await (await fetch(`${BASE}/api/newsletter-subscribers/pending?token=${row.confirm_token}`)).json();
  assert.equal(pending.email, email);
  assert.equal((await fetch(`${BASE}/api/newsletter-subscribers/pending?token=nope`)).status, 404);

  // the link in the email
  const c = await fetch(`${BASE}/api/newsletter-subscribers/confirm?token=${row.confirm_token}`, { redirect: 'manual' });
  assert.equal(c.status, 302);
  assert.equal(c.headers.get('location'), '/newsletter-confirmee?status=ok');
  const after1 = (await pool.query('SELECT status, confirm_token FROM newsletter_subscribers WHERE email = $1', [email])).rows[0];
  assert.equal(after1.status, 'subscribed');
  assert.equal(after1.confirm_token, null);

  // second use of the link is refused
  const c2 = await fetch(`${BASE}/api/newsletter-subscribers/confirm?token=${row.confirm_token}`, { redirect: 'manual' });
  assert.equal(c2.headers.get('location'), '/newsletter-confirmee?status=invalid');

  // unsubscribe: email alone refused, token works
  assert.equal((await fetch(`${BASE}/api/newsletter-subscribers/unsubscribe`, json({ method: 'POST', body: JSON.stringify({ email }) }))).status, 400);
  assert.equal((await fetch(`${BASE}/api/newsletter-subscribers/unsubscribe`, json({ method: 'POST', body: JSON.stringify({ token: row.unsubscribe_token }) }))).status, 200);
  const after2 = (await pool.query('SELECT status FROM newsletter_subscribers WHERE email = $1', [email])).rows[0];
  assert.equal(after2.status, 'unsubscribed');
});

test('contact message: consent enforced, honeypot dropped, stored otherwise', { skip }, async () => {
  const email = `ci-smoke-contact-${Date.now()}@example.com`;
  const base = { name: 'CI Smoke', email, message: 'Message de test automatisé, dix mots au moins ici.' };
  assert.equal((await fetch(`${BASE}/api/contact-messages`, json({ method: 'POST', body: JSON.stringify(base) }))).status, 400);
  const hp = await fetch(`${BASE}/api/contact-messages`, json({ method: 'POST', body: JSON.stringify({ ...base, consent: true, website: 'http://spam.example' }) }));
  assert.equal(hp.status, 201);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM contact_messages WHERE email = $1', [email])).rows[0].n, 0, 'honeypot submission must not be stored');
  const ok = await fetch(`${BASE}/api/contact-messages`, json({ method: 'POST', body: JSON.stringify({ ...base, consent: true }) }));
  assert.equal(ok.status, 201);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM contact_messages WHERE email = $1', [email])).rows[0].n, 1);
});
