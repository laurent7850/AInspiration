'use strict';
/**
 * seo routes — extracted verbatim from server.js on 2026-09-05.
 * Everything shared (pool, middleware, validation schemas, helpers) arrives
 * through `ctx`, built in server.js from its top-level bindings. Register
 * order is preserved by server.js; do not require this file elsewhere.
 */
module.exports = function register(ctx) {
  const {
    BLOG_DEFAULT_AUTHOR,
    app,
    blogCoverFor,
    estimateReadTime,
    express,
    helmet,
    langPrefix,
    linkedin,
    pool,
    schemas
  } = ctx;

// ==================== STATIC FILES + SPA FALLBACK ====================

const path = require('path');
// routes/ lives one level below server.js: dist/ is next to server.js
const distPath = path.join(__dirname, '..', 'dist');

// Serve static frontend files (if dist/ exists alongside server.js).
// index: false is load-bearing — with the default, express.static answers "/"
// straight from disk and the request never reaches the SEO fallback below, so
// the homepage alone kept whatever was baked into the built index.html.
app.use(express.static(distPath, {
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|webp|avif|ico|gif)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('.xml') || filePath.endsWith('.txt')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// 404 for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Hard 404 for missing static assets — never let them fall through to the SPA
// fallback below. If a request for /assets/* or any hashed file with an
// extension (.js/.css/.woff2/...) reaches this point, express.static did not
// find it on disk, which means the deploy is incomplete (e.g. a lazy chunk
// that never propagated to Netlify, or a stale dist-manifest.txt). Serving
// index.html here returns "200 OK + text/html" for a .js URL, which the browser
// rejects with "Failed to load module script: ... MIME type text/html" — a
// silent, site-wide outage. Returning 404 makes a partial deploy fail loudly.
// The SPA fallback must only handle navigation routes (Accept: text/html).
const ASSET_EXT = /\.(js|mjs|cjs|css|map|json|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico|bmp|mp4|webm|mp3|wav|wasm|txt|xml|webmanifest|pdf)$/i;
app.get('*', (req, res, next) => {
  // A hashed asset path (/assets/* or any *.js/.css/.woff2/...) that reaches
  // here is missing from disk — 404 instead of masking it with index.html.
  // Extension-less paths (/, /audit, /blog/slug) are navigation routes and fall
  // through to the SPA fallback so server-side SEO injection still applies, even
  // for crawlers that don't send Accept: text/html.
  const wantsHtml = (req.headers.accept || '').includes('text/html');
  const looksLikeAsset = req.path.startsWith('/assets/') || (ASSET_EXT.test(req.path) && !wantsHtml);
  if (looksLikeAsset) {
    return res.status(404).type('text/plain').send('Not Found');
  }
  next();
});

// SPA fallback: serve index.html with per-route SEO meta injection.
// The file is re-read when its mtime changes so deploys that swap dist/ (via
// docker cp) are picked up without needing a container restart.
const fs = require('fs');
let indexHtml = '';
let indexHtmlMtime = 0;

function readIndexHtml() {
  try {
    const indexPath = path.join(distPath, 'index.html');
    const stat = fs.statSync(indexPath);
    if (stat.mtimeMs !== indexHtmlMtime) {
      indexHtml = fs.readFileSync(indexPath, 'utf8');
      indexHtmlMtime = stat.mtimeMs;
    }
  } catch (e) { /* dist not ready yet */ }
  return indexHtml;
}
readIndexHtml();

const routeSEO = {
  '/audit': { title: 'Audit IA Gratuit en 24h | Diagnostic Personnalis\u00e9 | AInspiration', description: 'Demandez votre audit IA gratuit. Un expert analyse votre activit\u00e9 et vous livre un plan d\'action concret en 24h. Sans engagement. PME et ind\u00e9pendants en Belgique.' },
  '/assistants': { title: 'Assistants Virtuels IA | Chatbots Intelligents | AInspiration', description: 'D\u00e9ployez des assistants virtuels IA pour votre service client. Chatbots intelligents disponibles 24/7 pour r\u00e9pondre \u00e0 vos clients.' },
  '/automatisation': { title: 'Automatisation IA pour PME | Workflows Intelligents | AInspiration', description: 'Automatisez 60% de vos t\u00e2ches r\u00e9p\u00e9titives gr\u00e2ce \u00e0 l\'IA. Workflows n8n sur mesure, livr\u00e9s en 5 jours.' },
  '/formation': { title: 'Formation IA pour Entreprises | ChatGPT, Claude, Outils IA | AInspiration', description: 'Formations pratiques IA pour PME et ind\u00e9pendants. Apprenez \u00e0 utiliser ChatGPT, Claude et les outils IA pour votre m\u00e9tier.' },
  '/contact': { title: 'Contactez AInspiration | Solutions IA pour PME', description: 'Contactez notre \u00e9quipe pour discuter de vos besoins en intelligence artificielle. R\u00e9ponse sous 24h. Givry, Belgique.' },
  '/prompts': { title: 'Biblioth\u00e8que de Prompts IA | Optimisez vos Interactions | AInspiration', description: 'Acc\u00e9dez \u00e0 notre biblioth\u00e8que de prompts IA optimis\u00e9s pour PME. Gagnez du temps avec des prompts test\u00e9s par secteur.' },
  '/blog': { title: 'Blog IA pour PME | Actualit\u00e9s et Guides | AInspiration', description: 'Articles, guides et actualit\u00e9s sur l\'intelligence artificielle pour PME et ind\u00e9pendants belges.' },
  '/solutions': { title: 'Solutions IA pour PME | AInspiration', description: 'D\u00e9couvrez nos solutions IA compl\u00e8tes pour PME : audit, automatisation, chatbots, CRM intelligent, formation.' },
  '/a-propos': { title: '\u00c0 Propos d\'AInspiration | \u00c9quipe et Mission', description: 'AInspiration accompagne les PME belges dans leur transition IA. D\u00e9couvrez notre \u00e9quipe, notre mission et nos valeurs.' },
  '/newsletter-confirmee': { title: 'Newsletter | AInspiration', description: 'Confirmation de votre inscription \u00e0 la newsletter AInspiration.' },
  '/realisations': { title: 'R\u00e9alisations | Ce que nous avons construit | AInspiration', description: 'Seize automatisations et applications en service : facturation, comptabilit\u00e9, contenu, conformit\u00e9. Ce qui a \u00e9t\u00e9 construit, pour qui, et ce que \u00e7a a chang\u00e9.' },
  '/creation-ia': { title: 'Cr\u00e9ation de Contenu IA | AInspiration', description: 'G\u00e9n\u00e9rez du contenu professionnel avec l\'IA : articles, visuels, newsletters, posts r\u00e9seaux sociaux.' },
  '/analyse-ia': { title: 'Analyse de Donn\u00e9es IA | Tableaux de Bord Intelligents | AInspiration', description: 'Exploitez vos donn\u00e9es avec l\'IA. Tableaux de bord intelligents, pr\u00e9dictions de ventes, segmentation clients.' },
  '/cgv': { title: 'Conditions G\u00e9n\u00e9rales de Vente | AInspiration', description: 'CGV des services AInspiration par Distr\'Action SRL.' },
  '/cgu': { title: 'Conditions G\u00e9n\u00e9rales d\'Utilisation | AInspiration', description: 'CGU du site ainspiration.eu.' },
  '/privacy': { title: 'Politique de Confidentialit\u00e9 | AInspiration', description: 'Politique de confidentialit\u00e9 et protection des donn\u00e9es personnelles d\'AInspiration.' },
  '/mentions-legales': { title: 'Mentions L\u00e9gales | AInspiration', description: 'Mentions l\u00e9gales du site ainspiration.eu - Distr\'Action SRL.' },
  '/login': { title: 'Connexion | AInspiration', description: 'Connectez-vous \u00e0 votre espace AInspiration.' },
  '/transformation': { title: 'Transformation Digitale IA | PME Belgique | AInspiration', description: 'Acc\u00e9l\u00e9rez votre transformation digitale gr\u00e2ce \u00e0 l\'IA. Modernisez vos processus, optimisez vos op\u00e9rations et pr\u00e9parez l\'avenir de votre entreprise.' },
  '/produits': { title: 'Offres IA pour PME | Audit Gratuit | AInspiration', description: 'Consultez nos offres IA pour PME : audit gratuit, formation IA, accompagnement premium. Solutions adapt\u00e9es \u00e0 chaque budget en Belgique et France.' },
  '/conseil': { title: 'Conseil Strat\u00e9gique IA | Consulting IA | AInspiration', description: 'B\u00e9n\u00e9ficiez de notre expertise en conseil strat\u00e9gique IA : audit, roadmap et accompagnement pour une int\u00e9gration r\u00e9ussie de l\'IA.' },
  '/accompagnement': { title: 'Accompagnement IA Personnalis\u00e9 | Support Expert | AInspiration', description: 'B\u00e9n\u00e9ficiez d\'un accompagnement IA sur mesure : support d\u00e9di\u00e9, suivi de projet et expertise continue pour r\u00e9ussir votre transformation.' },
  '/crm': { title: 'CRM IA | Gestion Client Intelligente | AInspiration', description: 'Optimisez votre relation client avec notre CRM propuls\u00e9 par l\'IA : automatisation, insights et suivi intelligent de vos opportunit\u00e9s.' },
  '/audio': { title: 'Audio IA | Voix de Synth\u00e8se et Podcasts | AInspiration', description: 'Produisez voix off, podcasts et contenus audio gr\u00e2ce \u00e0 l\'IA. Solutions audio pour PME en Belgique et en France.' },
  '/video': { title: 'Vid\u00e9o IA | G\u00e9n\u00e9ration et Montage Automatis\u00e9s | AInspiration', description: 'Cr\u00e9ez et montez vos vid\u00e9os avec l\'IA : g\u00e9n\u00e9ration, sous-titrage et d\u00e9clinaisons automatiques pour vos canaux.' },
  '/recommandations': { title: 'Recommandations IA Personnalis\u00e9es | AInspiration', description: 'Recevez des recommandations IA adapt\u00e9es \u00e0 votre activit\u00e9 : outils, cas d\'usage et priorit\u00e9s de mise en \u0153uvre.' },
};

// Navigation routes the SPA actually serves (src/config/routes.ts + the
// client-side redirects declared in App.tsx). Anything outside this set is a
// real 404: without it, Express answered "200 + homepage" for every unknown
// URL, which Google reads as an unbounded supply of duplicate homepages.
const KNOWN_ROUTES = new Set([
  '/', '/login', '/audit', '/analyse-ia', '/transformation', '/creation-ia', '/audio', '/video',
  '/recommandations', '/dashboard', '/solutions', '/produits', '/a-propos',
  '/realisations', '/newsletter-confirmee',
  '/contact', '/prompts', '/automatisation', '/assistants', '/conseil', '/formation',
  '/accompagnement', '/blog', '/crm', '/crm-dashboard', '/privacy', '/mentions-legales',
  '/cgv', '/cgu', '/unsubscribe', '/linkedin', '/newsletter-admin',
  '/opportunities', '/contacts', '/companies', '/products', '/tasks', '/reports', '/messages',
  // Client-side redirects (App.tsx) \u2014 must stay 200 so the redirect can run.
  '/pourquoi-ia', '/pour-qui-ia', '/creation-visuelle', '/creativite',
  // Hand-built article page, not a blog_posts row.
  '/blog/thierry-facturation-ia',
]);

// CRM detail routes (/contacts/:id \u2026) \u2014 known, but with a variable segment.
// /realisations/:slug is NOT here: unlike the CRM prefixes (private, behind
// login, never crawled), it is public \u2014 a blanket prefix match would 200 any
// typo under it, the exact "every unknown URL clones the homepage" defect
// already fixed once for the site at large. It is validated against
// REALISATION_DETAIL_SLUGS below instead, the same way blog slugs are
// validated against the database.
const KNOWN_ROUTE_PREFIXES = ['/contacts/', '/companies/', '/opportunities/', '/products/', '/tasks/'];

// KEEP IN SYNC with the `format: 'complet'` entries in src/data/realisations.ts.
// The two `reduit` slugs (enghien, rampa) own no detail page \u2014 the frontend
// itself redirects them to the index (see RealisationDetailPage.tsx), so a
// crawler must see a real 404 for them too, not a served-then-redirected shell.
const REALISATION_DETAIL_SLUGS = new Set([
  'facturation-automatisee', 'reconciliation-caisse', 'factures-fournisseurs',
  'chat-ia-site', 'audityo', 'labo-nostalgie', 'autoseo', 'preparation-emission',
  'dreamoracle', 'artpero', 'tl-services', 'playlist-spotify', 'veille-youtube',
  'paperclip',
]);

// HTML-escape helper for any value injected into the served markup.
const escHtml = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Short-lived cache for everything we read from blog_posts on the render path.
const blogCache = new Map();
const BLOG_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function cacheGet(key) {
  const hit = blogCache.get(key);
  return hit && hit.exp > Date.now() ? hit.data : undefined;
}
function cacheSet(key, data) {
  blogCache.set(key, { data, exp: Date.now() + BLOG_CACHE_TTL });
  return data;
}

// SECURITY: article bodies are stored HTML (authenticated /api/blog-posts writes
// and the AI generator) and are now injected verbatim into the served markup.
// The CSP allows 'unsafe-inline' for scripts, so a stored <script> or an
// onerror= attribute would execute. Everything outside this allowlist is
// dropped before it can reach the page.
const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'span',
  'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a',
  'blockquote', 'code', 'pre', 'figure', 'figcaption', 'img',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
]);
const ALLOWED_ATTRS = {
  a: ['href', 'title'],
  img: ['src', 'alt', 'width', 'height', 'loading'],
  th: ['colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
};
const URL_ATTRS = new Set(['href', 'src']);
const SAFE_URL = /^(https?:\/\/|\/|#|mailto:|tel:)/i;

function sanitizeArticleHtml(raw) {
  let html = String(raw || '');
  // Executable / embedding elements: drop the element *and* its content.
  html = html.replace(/<(script|style|iframe|object|embed|noscript|template|svg|math)\b[\s\S]*?<\/\1\s*>/gi, '');
  // …and any unbalanced opening tag of the same kind left behind.
  html = html.replace(/<(script|style|iframe|object|embed|noscript|template|svg|math)\b[^>]*>/gi, '');
  return html.replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (_match, closing, rawTag, rawAttrs) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    if (closing) return `</${tag}>`;

    const allowed = ALLOWED_ATTRS[tag] || [];
    const kept = [];
    const attrRe = /([a-z_:][a-z0-9_.:-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
    let attr;
    while ((attr = attrRe.exec(rawAttrs)) !== null) {
      const name = attr[1].toLowerCase();
      const value = attr[2].replace(/^["']|["']$/g, '');
      if (!allowed.includes(name)) continue;            // also drops every on* handler
      if (URL_ATTRS.has(name) && !SAFE_URL.test(value)) continue;
      kept.push(`${name}="${escHtml(value)}"`);
    }
    if (tag === 'a') kept.push('rel="noopener"');
    return `<${tag}${kept.length ? ' ' + kept.join(' ') : ''}>`;
  });
}

// Returns the post, null when the slug does not exist, and undefined when the
// database is unreachable. The three cases differ: only `null` may 404, or a
// database blip would delist every article at once.
async function getBlogPost(slug) {
  const key = `post:${slug}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;
  try {
    const r = await pool.query(
      `SELECT p.title, p.excerpt, p.content, p.language, p.published_at, p.updated_at, p.featured_image, p.author_name, p.read_time, c.slug AS category
       FROM blog_posts p LEFT JOIN blog_categories c ON c.id = p.category_id
       WHERE p.slug = $1 AND p.status = 'published'`,
      [slug]
    );
    if (!r.rows[0]) return cacheSet(key, null);
    const p = r.rows[0];
    const plain = (p.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return cacheSet(key, {
      title: `${p.title} | Blog AInspiration`,
      description: (p.excerpt && p.excerpt.trim()) ? p.excerpt.trim() : plain.slice(0, 155),
      h1: p.title,
      body: sanitizeArticleHtml(p.content),
      language: p.language || 'fr',
      publishedAt: p.published_at,
      updatedAt: p.updated_at,
      image: p.featured_image || blogCoverFor(p.category),
      author: p.author_name || BLOG_DEFAULT_AUTHOR,
      readTime: p.read_time || estimateReadTime(p.content),
      wordCount: plain.split(' ').filter(Boolean).length,
    });
  } catch (e) {
    return undefined; // DB not ready — serve the plain shell, never a 404
  }
}

// Slug d'un article retire (doublon) -> slug de l'article conserve.
// null = pas de redirection connue ; undefined = base injoignable.
// La distinction compte : sur une coupure de base, on ne doit ni rediriger a
// tort, ni transformer l'incident en 404 — on sert la page normalement.
async function getBlogRedirect(slug) {
  const key = `redirect:${slug}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;
  try {
    const r = await pool.query('SELECT to_slug FROM blog_redirects WHERE from_slug = $1', [slug]);
    return cacheSet(key, r.rows[0] ? r.rows[0].to_slug : null);
  } catch (e) {
    return undefined;
  }
}

async function getRecentPosts(language, limit) {
  const key = `recent:${language}:${limit}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;
  try {
    const r = await pool.query(
      `SELECT title, slug, excerpt FROM blog_posts
       WHERE status = 'published' AND language = $1
       ORDER BY published_at DESC NULLS LAST LIMIT $2`,
      [language, limit]
    );
    return cacheSet(key, r.rows);
  } catch (e) {
    return [];
  }
}

// Translated articles share a base slug with a `-en` / `-nl` suffix. Without
// hreflang the three versions compete with each other instead of pooling.
async function getBlogAlternates(slug) {
  const base = slug.replace(/-(en|nl)$/i, '');
  const key = `alt:${base}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;
  try {
    const r = await pool.query(
      `SELECT slug, language FROM blog_posts
       WHERE slug = ANY($1) AND status = 'published'`,
      [[base, `${base}-en`, `${base}-nl`]]
    );
    return cacheSet(key, r.rows);
  } catch (e) {
    return [];
  }
}

function renderPostList(posts) {
  if (!posts.length) return '';
  return '<ul>' + posts.map((p) =>
    `<li><a href="/blog/${escHtml(p.slug)}">${escHtml(p.title)}</a>`
    + (p.excerpt ? ` — ${escHtml(String(p.excerpt).trim().slice(0, 160))}` : '')
    + '</li>'
  ).join('') + '</ul>';
}

const SITE_URL = 'https://ainspiration.eu';

// `/en/...` and `/nl/...` are language prefixes, not distinct routes.
function splitLang(routePath) {
  const m = routePath.match(/^\/(en|nl)(\/.*)?$/i);
  if (!m) return { lang: 'fr', rest: routePath };
  return { lang: m[1].toLowerCase(), rest: m[2] || '/' };
}

function isKnownRoute(rest) {
  return KNOWN_ROUTES.has(rest) || KNOWN_ROUTE_PREFIXES.some((p) => rest.startsWith(p));
}

// Per-slug SEO for /realisations/:slug — without this, every one of the 14
// detail pages falls back to the untouched static <title> in dist/index.html
// (the homepage's), because routeSEO only holds the generic '/realisations'
// entry. Reads title + summary straight from the shipped locale JSON, the
// same source the React page itself uses, so the two can never drift apart.
const realisationSeoCache = new Map();

function getRealisationSeo(lang, slug) {
  const key = `${lang}:${slug}`;
  if (realisationSeoCache.has(key)) return realisationSeoCache.get(key);

  let result = null;
  for (const candidate of [lang, 'fr']) {          // fall back to French
    try {
      const json = JSON.parse(
        fs.readFileSync(path.join(distPath, 'locales', candidate, 'realisations.json'), 'utf8')
      );
      const item = json.items && json.items[slug];
      if (item && item.title && item.summary) {
        result = { title: `${item.title} | AInspiration`, description: item.summary };
        break;
      }
    } catch (e) { /* try the next candidate */ }
  }
  realisationSeoCache.set(key, result);
  return result;
}

// ---------------------------------------------------------------------------
// Service pages: real copy in the served HTML.
//
// These pages render their text from the i18n bundles, so a crawler that does
// not execute JavaScript saw only an h1 and one boilerplate sentence — the
// "thin content" a SEO audit keeps reporting. The copy is not thin, it just
// never reached the HTML. dist/locales/<lang>/<ns>.json ships with the
// frontend, so we read it here instead of duplicating the text server-side:
// one source of truth, and translations stay in step automatically.
//
// Routes absent from this map keep the generic block on purpose: /produits
// holds its copy in the CRM namespace, which would spill application labels
// onto a public page. (/solutions moved to its own namespace on 2026-09-05.)
// KEEP IN SYNC with the namespace a page actually calls useTranslation() with.
const SERVICE_NS = {
  '/solutions': 'solutions',
  '/audit': 'audit',
  '/formation': 'training',
  '/automatisation': 'automation',
  '/conseil': 'features',
  '/assistants': 'features',
  '/accompagnement': 'support',
  '/prompts': 'prompts',
  '/a-propos': 'about',
  '/realisations': 'realisations',
  '/analyse-ia': 'analysis',
  '/transformation': 'transformation',
  '/creation-ia': 'content',
  '/recommandations': 'recommendations',
  '/audio': 'audio',
  '/video': 'video',
};

// Interface chrome (buttons, placeholders, form steps) and meta already emitted
// in <title>/<meta description> — neither belongs in the page body.
const SKIP_LOCALE_KEY = /(placeholder|button|submit|cancel|close|back|continue|next|prev|loading|error|success|required|step\d|stepOf|\bform\b|\bnav\b|menu|aria|alt$|badge|tag$|unit$|currency|^seo\.|\.seo\.|^meta\.|\.meta\.)/i;
const LOCALE_HEADING_KEY = /(^|\.)(title|heading|name|q)$/i;
const MAX_LOCALE_BLOCKS = 120;

function flattenLocale(node, prefix, out) {
  for (const [k, v] of Object.entries(node)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (SKIP_LOCALE_KEY.test(key)) continue;
    if (typeof v === 'string') out.push([key, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => {
      if (typeof x === 'string') out.push([`${key}.${i}`, x]);
      else if (x && typeof x === 'object') flattenLocale(x, `${key}.${i}`, out);
    });
    else if (v && typeof v === 'object') flattenLocale(v, key, out);
  }
}

const localeBlockCache = new Map();

function getLocaleBlocks(lang, ns) {
  const key = `${lang}:${ns}`;
  if (localeBlockCache.has(key)) return localeBlockCache.get(key);

  let json = null;
  for (const candidate of [lang, 'fr']) {          // fall back to French
    try {
      json = JSON.parse(fs.readFileSync(path.join(distPath, 'locales', candidate, `${ns}.json`), 'utf8'));
      break;
    } catch (e) { /* try the next candidate */ }
  }
  if (!json) {
    localeBlockCache.set(key, []);
    return [];
  }

  const flat = [];
  flattenLocale(json, '', flat);

  const blocks = [];
  const seen = new Set();
  for (const [k, raw] of flat) {
    const text = String(raw).replace(/\{\{[^}]*\}\}/g, '').replace(/\s+/g, ' ').trim();
    if (!text || seen.has(text)) continue;
    const isHeading = LOCALE_HEADING_KEY.test(k);
    if (isHeading && text.length >= 8 && text.length <= 120) blocks.push({ tag: 'h2', text });
    else if (!isHeading && text.length >= 40) blocks.push({ tag: 'p', text });
    else continue;
    seen.add(text);
    if (blocks.length >= MAX_LOCALE_BLOCKS) break;
  }
  localeBlockCache.set(key, blocks);
  return blocks;
}

// Cross-links appended to service pages — in the visitor's language, with the
// language prefix on every href so /en pages link to /en pages.
const SERVICE_LINK_LABELS = {
  fr: { audit: 'Audit IA gratuit', automatisation: 'Automatisation', solutions: 'Solutions IA', formation: 'Formation', blog: 'Blog', contact: 'Contact' },
  en: { audit: 'Free AI audit', automatisation: 'Automation', solutions: 'AI solutions', formation: 'Training', blog: 'Blog', contact: 'Contact' },
  nl: { audit: 'Gratis AI-audit', automatisation: 'Automatisering', solutions: 'AI-oplossingen', formation: 'Opleiding', blog: 'Blog', contact: 'Contact' },
};
// (langPrefix moved to core on 2026-09-05)
function serviceLinks(lang) {
  const labels = SERVICE_LINK_LABELS[lang] || SERVICE_LINK_LABELS.fr;
  const p = langPrefix(lang);
  return '<p>' + Object.entries(labels)
    .map(([slug, label]) => `<a href="${p}/${slug}">${escHtml(label)}</a>`)
    .join(' · ') + '</p>';
}

// Per-route, per-language <title>/<meta description>, exported at build time
// from src/config/seoConfig.ts by scripts/vite-plugin-seo-routes.ts. Read from
// dist like the locale files, re-read when the build changes. Falls back to
// the French routeSEO map when the file or the language is missing.
let seoRoutes = null;
let seoRoutesMtime = 0;
function getRouteSeo(lang, rest) {
  try {
    const p = path.join(distPath, 'seo-routes.json');
    const stat = fs.statSync(p);
    if (stat.mtimeMs !== seoRoutesMtime || !seoRoutes) {
      seoRoutes = JSON.parse(fs.readFileSync(p, 'utf8'));
      seoRoutesMtime = stat.mtimeMs;
    }
  } catch (e) { seoRoutes = seoRoutes || null; }
  const entry = seoRoutes && seoRoutes[rest];
  const localized = entry && (entry[lang] || entry.fr);
  const base = routeSEO[rest] ? { ...routeSEO[rest] } : null;
  if (!localized) return base;
  return { ...(base || {}), title: localized.title, description: localized.description, ...(lang !== 'fr' ? { h1: undefined } : {}) };
}

// Full body of a réalisation detail page for crawlers — the same fields the
// React page renders, read from the shipped locale JSON. Without this the raw
// HTML of a proof page held ~380 characters.
function localizedRealisationMain(lang, slug) {
  const data = readLocaleNs(lang, 'realisations') || readLocaleNs('fr', 'realisations');
  const item = data && data.items && data.items[slug];
  if (!item) return null;
  const labels = (data && data.detail) || {};
  const block = (label, value) => {
    if (!value) return '';
    const heading = label ? `<h2>${escHtml(label)}</h2>` : '';
    if (Array.isArray(value)) return heading + '<ul>' + value.filter((v) => typeof v === 'string').map((v) => `<li>${escHtml(v)}</li>`).join('') + '</ul>';
    if (typeof value === 'string') return heading + `<p>${escHtml(value)}</p>`;
    if (typeof value === 'object') return heading + Object.values(value).filter((v) => typeof v === 'string').map((v) => `<p>${escHtml(v)}</p>`).join('');
    return '';
  };
  return `<article><h1>${escHtml(item.title)}</h1>`
    + (item.summary ? `<p>${escHtml(item.summary)}</p>` : '')
    + (item.sector ? `<p>${escHtml(labels.sector || 'Secteur')} : ${escHtml(item.sector)}${item.client ? ' — ' + escHtml(item.client) : ''}</p>` : '')
    + block(labels.context, item.context)
    + block(labels.problem, item.problem)
    + block(labels.solution, item.solution)
    + block(labels.results, item.results)
    + block(labels.howItWorks, item.howItWorks)
    + block(labels.transposition, item.transposition)
    + `</article><p><a href="${langPrefix(lang)}/realisations">${escHtml(labels.backToIndex || 'Réalisations')}</a></p>`;
}

// hreflang for the static public routes (blog posts have their own, built from
// the translated rows). x-default is French, the site's primary language.
function hreflangLinks(rest) {
  const suffix = rest === '/' ? '' : rest;
  return [
    `<link rel="alternate" hreflang="fr" href="${SITE_URL}${suffix || '/'}" />`,
    `<link rel="alternate" hreflang="en" href="${SITE_URL}/en${suffix}" />`,
    `<link rel="alternate" hreflang="nl" href="${SITE_URL}/nl${suffix}" />`,
    `<link rel="alternate" hreflang="x-default" href="${SITE_URL}${suffix || '/'}" />`,
  ].join('\n    ');
}

// Homepage body in EN/NL. The static <main> in dist/index.html is French
// (hand-written for the crawler); for the other languages we rebuild it from
// the same keys the React homepage renders, so the three versions say the
// same thing and Google stops seeing French under /en and /nl.
function readLocaleNs(lang, ns) {
  try {
    return JSON.parse(fs.readFileSync(path.join(distPath, 'locales', lang, `${ns}.json`), 'utf8'));
  } catch (e) { return null; }
}
function localizedHomeMain(lang) {
  const c = readLocaleNs(lang, 'common');
  if (!c || !c.hero) return null;
  const parts = [];
  parts.push(`<h1>${escHtml(c.hero.title)}</h1>`);
  if (c.hero.subtitle) parts.push(`<p>${escHtml(c.hero.subtitle)}</p>`);
  const si = c.seoIntro || {};
  for (const [h, p] of [['subtitle1', 'p1'], ['subtitle2', 'p2'], ['subtitle3', 'p3'], [null, 'p4']]) {
    if (h && si[h]) parts.push(`<h2>${escHtml(si[h])}</h2>`);
    if (si[p]) parts.push(`<p>${escHtml(si[p])}</p>`);
  }
  const faq = c.faq || {};
  const qa = [1, 2, 3, 4, 5].filter((i) => faq[`q${i}`] && faq[`a${i}`]);
  if (qa.length) {
    parts.push(`<h2>${escHtml(faq.title || 'FAQ')}</h2><dl>`);
    for (const i of qa) parts.push(`<dt>${escHtml(faq[`q${i}`])}</dt><dd>${escHtml(faq[`a${i}`])}</dd>`);
    parts.push('</dl>');
  }
  return parts.join('');
}

// SPA fallback with per-route SEO injected into the RAW HTML. SEO crawlers that
// do not execute JS (e.g. SEOPilot) only see this server response, so we inject
// here: a per-route canonical, the title/description/OG tags, hreflang for
// translated posts, and a real <main> — including the full article body for
// blog routes. Real users get the React app, which re-manages the meta tags via
// react-helmet (data-rh) on hydration.
app.get('*', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  const html = readIndexHtml();
  if (!html) return res.sendFile(path.join(distPath, 'index.html'));

  try {
    const routePath = req.path.replace(/\/+$/, '') || '/';
    const { lang, rest } = splitLang(routePath);

    // Études de cas merged into Réalisations (2026-09-05): keep the indexed URL alive.
    if (rest === '/etudes-de-cas') {
      return res.redirect(301, `${langPrefix(lang)}/realisations`);
    }
    const canonical = SITE_URL + (routePath === '/' ? '/' : routePath);

    // Resolve SEO: static route map (per language) first, then a dynamic
    // blog-post lookup.
    let seo = getRouteSeo(lang, rest);
    let post = null;
    let notFound = false;

    // /blog/thierry-facturation-ia is a hand-built page, not a blog_posts row.
    const blogMatch = rest === '/blog/thierry-facturation-ia'
      ? null
      : rest.match(/^\/blog\/([a-z0-9-]+)$/i);

    if (blogMatch) {
      // Un article retire comme doublon redirige en 301 vers celui qu'on a
      // garde, dans la meme langue. A faire avant toute resolution SEO : une
      // URL indexee ne doit ni rendre une page morte, ni tomber en 404 —
      // l'autorite acquise se transfere, elle ne se recree pas.
      const redirectTo = await getBlogRedirect(blogMatch[1]);
      if (redirectTo) {
        // splitLang renvoie 'fr' en l'absence de prefixe : le francais n'en a
        // pas, seuls /en et /nl en portent un.
        const prefix = lang === 'fr' ? '' : `/${lang}`;
        return res.redirect(301, `${prefix}/blog/${redirectTo}`);
      }

      const found = await getBlogPost(blogMatch[1]);
      if (found === null) notFound = true;          // slug does not exist
      else if (found) {                              // undefined = DB down → plain shell
        post = found;
        seo = { title: post.title, description: post.description, h1: post.h1 };
      }
    } else {
      const realisationMatch = rest.match(/^\/realisations\/([a-z0-9-]+)$/i);
      if (realisationMatch) {
        if (!REALISATION_DETAIL_SLUGS.has(realisationMatch[1])) notFound = true;
        else seo = getRealisationSeo(lang, realisationMatch[1]) || seo;
      } else if (!isKnownRoute(rest)) {
        notFound = true;
      }
    }

    let out = html;

    // Canonical + og:url for every route (data-rh so react-helmet replaces, not
    // duplicates). Insert the tags if the built index.html doesn't already carry
    // them, so the backend fix works even before a frontend redeploy.
    const canonicalTag = `<link rel="canonical" href="${canonical}" data-rh="true" />`;
    if (/<link rel="canonical"[^>]*>/.test(out)) {
      out = out.replace(/<link rel="canonical"[^>]*>/, canonicalTag);
    } else {
      out = out.replace(/<\/title>/, `</title>\n    ${canonicalTag}`);
    }
    const ogUrlTag = `<meta property="og:url" content="${canonical}" />`;
    if (/<meta property="og:url" content="[^"]*"\s*\/?>/.test(out)) {
      out = out.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, ogUrlTag);
    } else {
      out = out.replace(canonicalTag, `${canonicalTag}\n    ${ogUrlTag}`);
    }

    // The served document must declare the language it is written in — the
    // built index.html always says "fr".
    out = out.replace(/<html([^>]*)\slang="[a-zA-Z-]*"/, `<html$1 lang="${lang}"`);

    // hreflang for the static public routes (not blog posts: they get theirs
    // from the translated rows below; not the CRM: private).
    if (!blogMatch && !notFound && KNOWN_ROUTES.has(rest)) {
      out = out.replace(canonicalTag, `${canonicalTag}\n    ${hreflangLinks(rest)}`);
    }

    // Unknown URL → a real 404. Serving the homepage with 200 (the previous
    // behaviour) turned every typo and every stale link into another copy of the
    // homepage in the index.
    if (notFound) {
      const main =
        `<main><h1>Page introuvable</h1>`
        + `<p>Cette page n'existe pas ou a été déplacée.</p>`
        + `<p><a href="/">Accueil</a> · <a href="/blog">Blog</a> · `
        + `<a href="/solutions">Solutions IA</a> · <a href="/contact">Contact</a></p></main>`;
      out = out.replace(/<title>[^<]*<\/title>/, '<title>Page introuvable | AInspiration</title>');
      out = out.replace(/<\/title>/, '</title>\n    <meta name="robots" content="noindex,follow" />');
      out = out.replace(/<main>[\s\S]*?<\/main>/, main);
      return res.status(404).send(out);
    }

    if (seo) {
      const title = escHtml(seo.title);
      const description = escHtml(seo.description);
      out = out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
      out = out.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${description}"`);
      out = out.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`);
      out = out.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${description}"`);
    }

    // Article metadata for crawlers and link previews: og:type article, the
    // article's own cover, publication dates and a BlogPosting JSON-LD.
    // Until 2026-09-05 every article shared the generic og-image and carried
    // only the Organization/WebSite schemas — no rich result possible.
    if (post && blogMatch) {
      const iso = (d) => (d ? new Date(d).toISOString() : null);
      out = out.replace(/<meta property="og:type" content="[^"]*"/, '<meta property="og:type" content="article"');
      out = out.replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${escHtml(post.image)}"`);
      out = out.replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${escHtml(post.image)}"`);
      const ld = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${canonical}#article`,
        headline: post.h1,
        description: post.description,
        image: post.image,
        inLanguage: post.language,
        wordCount: post.wordCount,
        datePublished: iso(post.publishedAt),
        dateModified: iso(post.updatedAt || post.publishedAt),
        author: { '@type': 'Person', name: post.author, url: 'https://ainspiration.eu/a-propos' },
        publisher: { '@id': 'https://ainspiration.eu/#organization' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      };
      const extra = [
        post.publishedAt ? `<meta property="article:published_time" content="${iso(post.publishedAt)}" />` : '',
        post.updatedAt ? `<meta property="article:modified_time" content="${iso(post.updatedAt)}" />` : '',
        `<meta property="article:author" content="${escHtml(post.author)}" />`,
        `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
      ].filter(Boolean).join('\n    ');
      out = out.replace(canonicalTag, `${canonicalTag}\n    ${extra}`);
    }

    // hreflang for translated articles, so the FR/EN/NL versions reinforce one
    // another instead of competing as near-duplicates.
    if (post && blogMatch) {
      const alternates = await getBlogAlternates(blogMatch[1]);
      if (alternates.length > 1) {
        const links = alternates.map((a) =>
          `<link rel="alternate" hreflang="${escHtml(a.language)}" href="${SITE_URL}/blog/${escHtml(a.slug)}" />`
        );
        const fr = alternates.find((a) => a.language === 'fr');
        if (fr) links.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/blog/${escHtml(fr.slug)}" />`);
        out = out.replace(canonicalTag, `${canonicalTag}\n    ${links.join('\n    ')}`);
      }
    }

    // The <main> served without JavaScript. Until now it held only an h1 and a
    // boilerplate paragraph: the article text lived in the React bundle, so a
    // crawler that does not run JS saw an empty page — which is what kept the
    // whole blog out of the index.
    if (post) {
      const related = await getRecentPosts(post.language, 6);
      const others = related.filter((p) => p.slug !== blogMatch[1]).slice(0, 5);
      out = out.replace(/<main>[\s\S]*?<\/main>/,
        `<main><article><h1>${escHtml(post.h1)}</h1>`
        + `<p>${escHtml(post.description)}</p>`
        + `<p><img src="${escHtml(post.image)}" alt="" width="1200" height="630" loading="lazy" /></p>`
        + `<p>${escHtml(post.author)}${post.publishedAt ? ' · ' + new Date(post.publishedAt).toISOString().slice(0, 10) : ''} · ${post.readTime} min</p>`
        + post.body
        + `</article>`
        + (others.length ? `<aside><h2>À lire aussi</h2>${renderPostList(others)}</aside>` : '')
        + serviceLinks(post.language || lang) + '</main>'
      );
    } else if (rest === '/blog') {
      // The article list was rendered client-side, so the raw HTML carried no
      // link at all to any post: 50 published articles reachable only through
      // the sitemap, with zero internal linking.
      const posts = await getRecentPosts(lang, 30);
      out = out.replace(/<main>[\s\S]*?<\/main>/,
        `<main><h1>${escHtml(seo.h1 || 'Blog IA pour PME')}</h1>`
        + `<p>${escHtml(seo.description)}</p>`
        + renderPostList(posts)
        + `</main>`
      );
    } else if (/^\/realisations\/[a-z0-9-]+$/i.test(rest)) {
      const body = localizedRealisationMain(lang, rest.slice('/realisations/'.length));
      if (body) out = out.replace(/<main>[\s\S]*?<\/main>/, `<main>${body}${serviceLinks(lang)}</main>`);
    } else if (rest === '/') {
      const posts = await getRecentPosts(lang, 8);
      if (lang !== 'fr') {
        // EN/NL homepage: rebuild <main> from the translated locale, then the
        // article list in that language.
        const body = localizedHomeMain(lang);
        if (body) {
          const blogTitle = lang === 'nl' ? 'Blog — Recente artikels' : 'Blog — Latest articles';
          out = out.replace(/<main>[\s\S]*?<\/main>/,
            `<main>${body}${posts.length ? `<h2>${blogTitle}</h2>${renderPostList(posts)}` : ''}${serviceLinks(lang)}</main>`);
        }
      } else if (posts.length) {
        // The homepage carried a hand-written list of four article links whose
        // slugs matched nothing in the database. Generate it instead.
        out = out.replace(/(<h2>Blog[^<]*<\/h2>\s*)<ul>[\s\S]*?<\/ul>/, `$1${renderPostList(posts)}`);
      }
    } else if (seo) {
      const h1 = escHtml(seo.h1 || seo.title.split(' | ')[0]);
      const intro = escHtml(seo.description);

      // Service pages pull their real copy from the i18n bundle; everything
      // else keeps the short generic block.
      const ns = SERVICE_NS[rest];
      const body = ns
        ? getLocaleBlocks(lang, ns).map((b) => `<${b.tag}>${escHtml(b.text)}</${b.tag}>`).join('')
        : serviceLinks(lang);

      out = out.replace(/<main>[\s\S]*?<\/main>/,
        `<main><h1>${h1}</h1><p>${intro}</p>${body}${ns ? serviceLinks(lang) : ''}</main>`
      );
    }

    res.send(out);
  } catch (e) {
    // Never fail the page over SEO injection — but say so, loudly. A silent
    // catch here is how a whole blog can stay unrendered for months.
    console.error('[SEO] injection failed for', req.path, '—', e && e.stack ? e.stack : e);
    res.send(html);
  }
});

};
