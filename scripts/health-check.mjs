#!/usr/bin/env node
/**
 * Weekly production health check (run by .github/workflows/health-check.yml,
 * or locally: `node scripts/health-check.mjs [https://site]`).
 *
 * Everything here is checked on the RAW HTML — no JavaScript executed — because
 * that is what crawlers see. The blog stayed invisible for three months in 2026
 * while every page answered 200: only this class of test catches it.
 *
 * Exit code 1 on any failure; warnings never fail the run. A markdown report is
 * appended to $GITHUB_STEP_SUMMARY when present.
 */
import { appendFileSync } from 'node:fs';
import tls from 'node:tls';

const SITE = (process.argv[2] || process.env.SITE_URL || 'https://ainspiration.eu').replace(/\/+$/, '');
const HOST = new URL(SITE).hostname;
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 6;

const failures = [];
const warnings = [];
const passes = [];
const fail = (scope, msg) => failures.push(`${scope}: ${msg}`);
const warn = (scope, msg) => warnings.push(`${scope}: ${msg}`);
const pass = (scope, msg) => passes.push(`${scope}: ${msg}`);

async function get(url, { redirect = 'manual', method = 'GET' } = {}) {
  const res = await fetch(url, {
    method,
    redirect,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': 'AInspiration-HealthCheck/1.0 (+https://ainspiration.eu)' },
  });
  const text = method === 'GET' ? await res.text() : '';
  return { status: res.status, headers: res.headers, text, location: res.headers.get('location') || '' };
}

/** HEAD with one retry — a single dropped connection must not flag a dead link. */
async function head(url) {
  try {
    return await get(url, { method: 'HEAD' });
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
    return get(url, { method: 'HEAD' });
  }
}

async function mapLimit(items, limit, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    })
  );
  return out;
}

const stripTags = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const attr = (html, re) => (html.match(re) || [])[1] || '';

// ---------------------------------------------------------------------------
// 1. Key pages — raw HTML SEO invariants per language
// ---------------------------------------------------------------------------
async function checkPage({ path, lang, article = false, minMain = 300 }) {
  const url = SITE + path;
  const scope = `page ${path}`;
  const failuresBefore = failures.length;
  let res;
  try {
    res = await get(url);
  } catch (err) {
    return fail(scope, `unreachable (${err.message})`);
  }
  if (res.status !== 200) return fail(scope, `HTTP ${res.status}`);
  const html = res.text;

  const htmlLang = attr(html, /<html[^>]*\slang="([^"]+)"/i);
  if (htmlLang !== lang) fail(scope, `<html lang> is "${htmlLang}", expected "${lang}"`);

  const title = stripTags(attr(html, /<title>([^<]*)<\/title>/i));
  if (!title) fail(scope, 'empty <title>');
  else if (title.length > 70) warn(scope, `<title> is ${title.length} chars (> 70)`);

  const desc = attr(html, /<meta\s+name="description"\s+content="([^"]*)"/i) || attr(html, /<meta\s+content="([^"]*)"\s+name="description"/i);
  if (!desc) fail(scope, 'missing meta description');
  else if (desc.length > 170) warn(scope, `meta description is ${desc.length} chars (> 170)`);

  const hreflangs = (html.match(/<link[^>]+rel="alternate"[^>]+hreflang=/gi) || []).length;
  if (hreflangs < 3) fail(scope, `${hreflangs} hreflang links (expected ≥ 3)`);

  if (!/<h1[\s>]/i.test(html)) fail(scope, 'no <h1> in raw HTML');

  const main = attr(html, /<main[\s>]([\s\S]*?)<\/main>/i);
  const mainText = stripTags(main);
  if (mainText.length < minMain) fail(scope, `<main> holds ${mainText.length} chars of text without JS (expected ≥ ${minMain})`);

  if (article) {
    const h2 = (html.match(/<h2[\s>]/gi) || []).length;
    if (h2 < 1) fail(scope, 'article body without <h2> — server-side injection broken?');
    if (!/"@type"\s*:\s*"BlogPosting"/.test(html)) fail(scope, 'no BlogPosting JSON-LD');
  }

  const canonical = attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
  if (canonical && canonical !== url) warn(scope, `canonical is ${canonical}`);

  if (failures.length === failuresBefore) pass(scope, `200, lang=${lang}, ${mainText.length} chars in <main>`);
  return html;
}

// ---------------------------------------------------------------------------
// 2. Redirect contracts
// ---------------------------------------------------------------------------
async function checkRedirect(from, to) {
  const scope = `redirect ${from}`;
  try {
    const res = await get(SITE + from);
    const target = res.location.startsWith('/') ? SITE + res.location : res.location;
    if (res.status !== 301 || target !== SITE + to) fail(scope, `got ${res.status} → ${res.location || '(none)'}, expected 301 → ${to}`);
    else pass(scope, `301 → ${to}`);
  } catch (err) {
    fail(scope, err.message);
  }
}

// ---------------------------------------------------------------------------
// 3. Sitemap: every <loc> answers 200 directly (no redirect chain)
// ---------------------------------------------------------------------------
async function checkSitemap() {
  const scope = 'sitemap';
  let res;
  try {
    res = await get(SITE + '/sitemap.xml');
  } catch (err) {
    return fail(scope, err.message);
  }
  if (res.status !== 200) return fail(scope, `HTTP ${res.status}`);
  const locs = [...res.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (locs.length < 30) fail(scope, `only ${locs.length} URLs`);
  const bad = [];
  await mapLimit(locs, CONCURRENCY, async (loc) => {
    try {
      const r = await head(loc);
      if (r.status !== 200) bad.push(`${loc} → ${r.status}${r.location ? ' ' + r.location : ''}`);
    } catch (err) {
      bad.push(`${loc} → ${err.message}`);
    }
  });
  if (bad.length) fail(scope, `${bad.length}/${locs.length} URLs not 200:\n    ${bad.join('\n    ')}`);
  else pass(scope, `${locs.length} URLs all 200`);
  const today = new Date().toISOString().slice(0, 10);
  const buildDated = (res.text.match(new RegExp(`<lastmod>${today}`, 'g')) || []).length;
  if (buildDated > locs.length * 0.9) warn(scope, `${buildDated}/${locs.length} lastmod equal today — git dates lost at build?`);
  return locs;
}

// ---------------------------------------------------------------------------
// 4. Internal links found in the crawled pages
// ---------------------------------------------------------------------------
async function checkInternalLinks(pages) {
  const scope = 'links';
  const seen = new Set();
  for (const html of pages) {
    for (const m of html.matchAll(/<a\s[^>]*href="([^"#?]+)[^"]*"/gi)) {
      let href = m[1];
      if (href.startsWith(SITE)) href = href.slice(SITE.length) || '/';
      if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/api/') || /\.(js|css|png|jpe?g|webp|svg|pdf|xml|txt)$/i.test(href)) continue;
      seen.add(href);
    }
  }
  const links = [...seen];
  const dead = [];
  const redirected = [];
  await mapLimit(links, CONCURRENCY, async (href) => {
    try {
      const r = await head(SITE + href);
      if (r.status >= 400) dead.push(`${href} → ${r.status}`);
      else if (r.status >= 300) redirected.push(`${href} → ${r.status} ${r.location}`);
    } catch (err) {
      dead.push(`${href} → ${err.message}`);
    }
  });
  if (dead.length) fail(scope, `${dead.length} dead internal links:\n    ${dead.join('\n    ')}`);
  else pass(scope, `${links.length} internal links, none dead`);
  if (redirected.length) warn(scope, `${redirected.length} links go through a redirect:\n    ${redirected.join('\n    ')}`);
}

// ---------------------------------------------------------------------------
// 5. Security headers, robots, API, TLS
// ---------------------------------------------------------------------------
async function checkHeaders() {
  const scope = 'headers';
  const res = await get(SITE + '/');
  const h = res.headers;
  const need = {
    'strict-transport-security': /max-age=\d{6,}/,
    'content-security-policy': /default-src/,
    'x-content-type-options': /nosniff/,
    'x-frame-options': /DENY|SAMEORIGIN/i,
    'referrer-policy': /./,
  };
  for (const [name, re] of Object.entries(need)) {
    const v = h.get(name) || '';
    if (!re.test(v)) fail(scope, `${name} missing or weak (${v || 'absent'})`);
  }
  if (/'unsafe-inline'/.test(h.get('content-security-policy') || '') && /script-src[^;]*'unsafe-inline'/.test(h.get('content-security-policy'))) {
    fail(scope, "CSP script-src allows 'unsafe-inline'");
  }
  if (failures.every((f) => !f.startsWith(scope))) pass(scope, 'HSTS, CSP, nosniff, frame, referrer present');
}

async function checkRobots() {
  const res = await get(SITE + '/robots.txt');
  if (res.status !== 200) return fail('robots.txt', `HTTP ${res.status}`);
  if (!/Sitemap:\s*https?:\/\//i.test(res.text)) fail('robots.txt', 'no Sitemap: line');
  else pass('robots.txt', 'present with Sitemap line');
}

async function checkApi() {
  const scope = 'api';
  const status = await get(SITE + '/api/status');
  if (status.status !== 200) fail(scope, `/api/status → ${status.status}`);
  const list = await get(SITE + '/api/blog-posts?status=published');
  if (list.status !== 200) return fail(scope, `/api/blog-posts → ${list.status}`);
  let posts;
  try {
    posts = JSON.parse(list.text);
  } catch {
    return fail(scope, '/api/blog-posts is not JSON');
  }
  if (!Array.isArray(posts) || posts.length === 0) return fail(scope, '/api/blog-posts returned no published post');
  if (posts.some((p) => 'content' in p)) warn(scope, 'blog list embeds article bodies (payload guard lost?)');
  const bad = posts.filter((p) => !p.slug || !p.title || !p.published_at);
  if (bad.length) fail(scope, `${bad.length} published posts without slug/title/published_at`);
  const latest = posts.map((p) => p.published_at).sort().pop();
  const ageDays = (Date.now() - new Date(latest).getTime()) / 86_400_000;
  if (ageDays > 21) warn(scope, `latest article is ${Math.round(ageDays)} days old — auto-blog stalled?`);
  pass(scope, `${posts.length} published posts, latest ${latest.slice(0, 10)}`);
  const me = await get(SITE + '/api/auth/me');
  if (me.status !== 401) fail(scope, `/api/auth/me without token → ${me.status}, expected 401`);
  return posts;
}

function checkTls() {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: HOST, port: 443, servername: HOST, timeout: TIMEOUT_MS }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      const days = Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86_400_000);
      if (days < 14) fail('tls', `certificate expires in ${days} days`);
      else if (days < 30) warn('tls', `certificate expires in ${days} days`);
      else pass('tls', `certificate valid ${days} more days (${cert.issuer?.O || 'issuer ?'})`);
      resolve();
    });
    socket.on('error', (err) => {
      fail('tls', err.message);
      resolve();
    });
  });
}

// ---------------------------------------------------------------------------
async function main() {
  const started = Date.now();
  const posts = (await checkApi().catch((err) => fail('api', err.message))) || [];
  const fr = posts.filter((p) => (p.language || 'fr') === 'fr' && !/-(en|nl)$/.test(p.slug)).slice(0, 2);
  const en = posts.filter((p) => /-en$/.test(p.slug)).slice(0, 1);
  const nl = posts.filter((p) => /-nl$/.test(p.slug)).slice(0, 1);

  const pages = [
    { path: '/', lang: 'fr' }, { path: '/en', lang: 'en' }, { path: '/nl', lang: 'nl' },
    { path: '/solutions', lang: 'fr' }, { path: '/en/solutions', lang: 'en' }, { path: '/nl/solutions', lang: 'nl' },
    { path: '/realisations', lang: 'fr' }, { path: '/realisations/audityo', lang: 'fr' },
    { path: '/pme-hainaut-bruxelles', lang: 'fr' }, { path: '/contact', lang: 'fr', minMain: 150 }, { path: '/a-propos', lang: 'fr' },
    { path: '/blog', lang: 'fr' }, { path: '/en/blog', lang: 'en' }, { path: '/nl/blog', lang: 'nl' },
    ...fr.map((p) => ({ path: `/blog/${p.slug}`, lang: 'fr', article: true })),
    ...en.map((p) => ({ path: `/blog/${p.slug}`, lang: 'en', article: true })),
    ...nl.map((p) => ({ path: `/blog/${p.slug}`, lang: 'nl', article: true })),
  ];
  const htmls = (await mapLimit(pages, CONCURRENCY, (p) => checkPage(p).catch((err) => fail(`page ${p.path}`, err.message)))).filter((h) => typeof h === 'string');

  await Promise.all([
    checkRedirect('/solutions/', '/solutions'),
    checkRedirect('/etudes-de-cas', '/realisations'),
    en[0] ? checkRedirect(`/en/blog/${en[0].slug}`, `/blog/${en[0].slug}`) : Promise.resolve(),
    checkHeaders().catch((err) => fail('headers', err.message)),
    checkRobots().catch((err) => fail('robots.txt', err.message)),
    checkTls(),
  ]);
  await checkSitemap().catch((err) => fail('sitemap', err.message));
  await checkInternalLinks(htmls).catch((err) => fail('links', err.message));

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const lines = [
    `## Health check — ${SITE} — ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    '',
    `**${failures.length} failure(s), ${warnings.length} warning(s), ${passes.length} check(s) passed in ${seconds}s**`,
    '',
    ...(failures.length ? ['### ❌ Failures', ...failures.map((f) => `- ${f}`), ''] : []),
    ...(warnings.length ? ['### ⚠️ Warnings', ...warnings.map((w) => `- ${w}`), ''] : []),
    '<details><summary>Passed</summary>', '', ...passes.map((p) => `- ${p}`), '', '</details>', '',
  ];
  const report = lines.join('\n');
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
  process.exit(failures.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
