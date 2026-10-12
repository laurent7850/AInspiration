/**
 * Carte « Coûts OpenRouter » — contrat du client ORcosts et de sa route admin.
 *
 * Deux niveaux :
 *   1. le client (orcosts.js), en mémoire, avec un `fetch` injecté : forme de
 *      la carte, schéma strict, cache 5 min, échecs retenus, 401/429/503/réseau
 *      transformés en « indisponible » sans fuite du message ni du jeton ;
 *   2. la route (routes/orcosts.js), contre un vrai server.js sans base et un
 *      faux ORcosts local : anonyme 401, authentifié non-admin 403, admin 200
 *      avec les chiffres ; un ORcosts en 503 donne 200 + `available: false`.
 *
 * Run: `npm test` dans docker/backend (Node >= 20).
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { createOrcostsClient, CACHE_TTL_MS, FAILURE_TTL_MS, TOP_APPLICATIONS } = require('../orcosts.js');
const jwt = require('jsonwebtoken');

const FIXTURE = JSON.parse(readFileSync(path.join(here, 'fixtures', 'orcosts-summary.json'), 'utf8'));
const TOKEN = 'jeton-orcosts-reserve-aux-tests';

// L'exemple exact de la consigne (une seule application) : il doit passer tel quel.
const SPEC_EXAMPLE = {
  generatedAt: '2026-10-12T07:30:00.000Z',
  lastCollectionAt: '2026-10-12T07:00:02.000Z',
  dashboardUrl: 'https://orcosts.distr-action.com',
  currency: 'EUR',
  period: { from: '2026-10-01', to: '2026-10-12' },
  totals: {
    todayEur: 1.84, last7Eur: 12.4, monthEur: 38.12, periodEur: 38.12, periodUsd: 41.0132,
    periodRequests: 1532, billableEur: 46.9, previousPeriodEur: 31.05, trend: 0.228,
  },
  applications: [{
    id: 3, name: 'Paperclip (agents IA)', client: 'Radio Horizon', eur: 20.1, usd: 21.62,
    requests: 800, marginPct: 25, billableEur: 25.13, trend: 0.12,
  }],
  clients: [{ name: 'Radio Horizon', applications: 2, eur: 24.3, billableEur: 30.38 }],
  unassigned: { eur: 0.47, keys: 1 },
  legacyEur: 0,
};

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

function silentLog() {
  const lines = [];
  return { lines, warn: (m) => lines.push(String(m)), error: (m) => lines.push(String(m)) };
}

function makeClient({ responses, env, clock }) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    if (typeof next === 'function') return next();
    return next;
  };
  const log = silentLog();
  const client = createOrcostsClient({
    fetchImpl,
    env: { ORCOSTS_API_TOKEN: TOKEN, ORCOSTS_API_URL: 'http://orcosts.test:3000/', ...env },
    now: () => clock.t,
    log,
  });
  return { client, calls, log };
}

describe('client ORcosts', () => {
  test('la fixture donne une carte complète, tronquée aux 5 premières applications', async () => {
    const clock = { t: 1_000 };
    const { client, calls } = makeClient({ responses: [json(FIXTURE)], clock });
    const card = await client.getSummary();

    assert.equal(card.available, true);
    assert.equal(card.dashboardUrl, 'https://orcosts.distr-action.com');
    assert.equal(card.lastCollectionAt, '2026-10-12T07:00:02.000Z');
    assert.deepEqual(card.totals, { todayEur: 1.84, last7Eur: 12.4, monthEur: 38.12, billableEur: 46.9, trend: 0.228 });
    assert.equal(FIXTURE.applications.length, TOP_APPLICATIONS + 1, 'la fixture doit dépasser le plafond');
    assert.equal(card.applications.length, TOP_APPLICATIONS);
    assert.deepEqual(card.applications[0], { name: 'Paperclip (agents IA)', client: 'Radio Horizon', eur: 20.1 });
    assert.deepEqual(card.applications[1], { name: 'SEOPilot', client: null, eur: 8.2 });
    assert.equal(card.unassignedKeys, 1);

    // Rien d'autre de la page ORcosts n'est relayé.
    assert.deepEqual(Object.keys(card).sort(), ['applications', 'available', 'dashboardUrl', 'lastCollectionAt', 'period', 'totals', 'unassignedKeys']);
    assert.equal('usd' in card.applications[0], false);
    assert.equal('clients' in card, false);

    // L'appel porte le jeton, sur l'URL de base configurée, sans période.
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'http://orcosts.test:3000/api/v1/summary');
    assert.equal(calls[0].init.headers.Authorization, `Bearer ${TOKEN}`);
  });

  test("l'exemple exact de la consigne est accepté", async () => {
    const { client } = makeClient({ responses: [json(SPEC_EXAMPLE)], clock: { t: 0 } });
    const card = await client.getSummary();
    assert.equal(card.available, true);
    assert.equal(card.applications.length, 1);
  });

  test('sans jeton, la porte est fermée et ORcosts n’est jamais appelé', async () => {
    const { client, calls } = makeClient({ responses: [json(FIXTURE)], env: { ORCOSTS_API_TOKEN: '' }, clock: { t: 0 } });
    const card = await client.getSummary();
    assert.deepEqual(card, { available: false, reason: 'not_configured', dashboardUrl: 'https://orcosts.distr-action.com' });
    assert.equal(calls.length, 0);
  });

  test('sans ORCOSTS_API_URL, le repli est le domaine public', async () => {
    const { client, calls } = makeClient({ responses: [json(FIXTURE)], env: { ORCOSTS_API_URL: undefined }, clock: { t: 0 } });
    await client.getSummary();
    assert.equal(calls[0].url, 'https://orcosts.distr-action.com/api/v1/summary');
  });

  for (const [status, reason] of [[401, 'unauthorized'], [429, 'rate_limited'], [503, 'unavailable'], [500, 'unavailable']]) {
    test(`HTTP ${status} → indisponible (${reason}), sans message brut`, async () => {
      const { client, log } = makeClient({ responses: [json({ error: 'raw upstream message XYZ' }, status)], clock: { t: 0 } });
      const card = await client.getSummary();
      assert.equal(card.available, false);
      assert.equal(card.reason, reason);
      assert.equal(card.dashboardUrl, 'https://orcosts.distr-action.com');
      assert.equal(JSON.stringify(card).includes('XYZ'), false);
      assert.equal(log.lines.join(' ').includes('XYZ'), false);
      assert.equal(log.lines.join(' ').includes(TOKEN), false, 'le jeton ne doit jamais être journalisé');
    });
  }

  test('erreur réseau ou délai dépassé → indisponible (network)', async () => {
    const timeout = new Error('The operation was aborted due to timeout');
    timeout.name = 'TimeoutError';
    const { client, log } = makeClient({ responses: [timeout], clock: { t: 0 } });
    const card = await client.getSummary();
    assert.equal(card.available, false);
    assert.equal(card.reason, 'network');
    assert.equal(log.lines.join(' ').includes('orcosts.test'), false, "l'URL interne ne sort pas dans le journal");
  });

  test('le délai d’attente est posé sur la requête', async () => {
    const { client, calls } = makeClient({ responses: [json(FIXTURE)], clock: { t: 0 } });
    await client.getSummary();
    assert.ok(calls[0].init.signal instanceof AbortSignal);
  });

  test('corps non JSON → indisponible (invalid)', async () => {
    const { client } = makeClient({ responses: [new Response('<html>', { status: 200 })], clock: { t: 0 } });
    const card = await client.getSummary();
    assert.equal(card.reason, 'invalid');
  });

  test('le schéma est strict : clé en trop, clé manquante, mauvais type', async () => {
    const cases = [
      { ...FIXTURE, surprise: 1 },
      (() => { const { legacyEur, ...rest } = FIXTURE; void legacyEur; return rest; })(),
      { ...FIXTURE, totals: { ...FIXTURE.totals, monthEur: '38.12' } },
      { ...FIXTURE, currency: 'USD' },
      { ...FIXTURE, dashboardUrl: 'javascript:alert(1)' },
      { ...FIXTURE, applications: [{ ...FIXTURE.applications[0], secret: 'x' }] },
    ];
    for (const body of cases) {
      const { client, log } = makeClient({ responses: [json(body)], clock: { t: 0 } });
      const card = await client.getSummary();
      assert.equal(card.available, false, `accepté à tort: ${JSON.stringify(body).slice(0, 80)}`);
      assert.equal(card.reason, 'invalid');
      assert.equal(log.lines.join(' ').includes('38.12'), false, 'les valeurs ne sont pas recopiées au journal');
    }
  });

  test('un résultat est retenu 5 minutes, puis rafraîchi', async () => {
    const clock = { t: 0 };
    const { client, calls } = makeClient({ responses: [json(FIXTURE), json(SPEC_EXAMPLE)], clock });
    const a = await client.getSummary();
    clock.t = CACHE_TTL_MS - 1;
    const b = await client.getSummary();
    assert.equal(calls.length, 1);
    assert.equal(a, b);
    clock.t = CACHE_TTL_MS + 1;
    const c = await client.getSummary();
    assert.equal(calls.length, 2);
    assert.equal(c.applications.length, 1);
  });

  test('un échec est retenu 60 s, pas 5 minutes', async () => {
    const clock = { t: 0 };
    const { client, calls } = makeClient({ responses: [json({}, 503), json(FIXTURE)], clock });
    assert.equal((await client.getSummary()).available, false);
    clock.t = FAILURE_TTL_MS - 1;
    assert.equal((await client.getSummary()).available, false);
    assert.equal(calls.length, 1);
    clock.t = FAILURE_TTL_MS + 1;
    assert.equal((await client.getSummary()).available, true);
    assert.equal(calls.length, 2);
  });

  test('un 429 est retenu le temps du Retry-After (borné à 5 minutes)', async () => {
    const clock = { t: 0 };
    const { client, calls } = makeClient({
      responses: [json({}, 429, { 'retry-after': '120' }), json(FIXTURE)],
      clock,
    });
    assert.equal((await client.getSummary()).reason, 'rate_limited');
    clock.t = 119_000;
    await client.getSummary();
    assert.equal(calls.length, 1);
    clock.t = 121_000;
    assert.equal((await client.getSummary()).available, true);
  });

  test('des appels simultanés ne font qu’une requête', async () => {
    const { client, calls } = makeClient({ responses: [json(FIXTURE), json(FIXTURE)], clock: { t: 0 } });
    const [a, b, c] = await Promise.all([client.getSummary(), client.getSummary(), client.getSummary()]);
    assert.equal(calls.length, 1);
    assert.equal(a, b);
    assert.equal(b, c);
  });
});

// ── Route ───────────────────────────────────────────────────────────────────

const SERVER = path.join(here, '..', 'server.js');
const JWT_SECRET = 'test-only-secret';

function fakeOrcosts(handler) {
  return new Promise((resolve) => {
    const srv = createServer((req, res) => handler(req, res));
    srv.listen(0, '127.0.0.1', () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}` }));
  });
}

async function startServer(port, extraEnv) {
  const child = spawn(process.execPath, [SERVER], {
    cwd: path.join(here, '..'),
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'test',
      JWT_SECRET,
      DATABASE_URL: 'postgres://nobody:nobody@127.0.0.1:1/none',
      ALLOWED_ORIGINS: `http://127.0.0.1:${port}`,
      N8N_BASE: 'http://127.0.0.1:1/never',
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/health`);
      if (r.ok) return child;
    } catch { /* pas encore démarré */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  child.kill();
  throw new Error('server.js did not start');
}

const sign = (role) => jwt.sign({ id: '00000000-0000-4000-8000-00000000000a', email: `${role}@test`, role }, JWT_SECRET, { expiresIn: '5m' });
const ROUTE = '/api/admin/orcosts-summary';

describe('GET /api/admin/orcosts-summary', () => {
  const PORT_OK = 3700 + Math.floor(Math.random() * 50);
  const PORT_DOWN = PORT_OK + 50;
  let okUpstream;
  let downUpstream;
  let serverOk;
  let serverDown;
  const seenAuth = [];

  before(async () => {
    okUpstream = await fakeOrcosts((req, res) => {
      seenAuth.push(req.headers.authorization);
      if (req.url !== '/api/v1/summary') { res.writeHead(404); return res.end(); }
      if (req.headers.authorization !== `Bearer ${TOKEN}`) { res.writeHead(401); return res.end('{"error":"bad token"}'); }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(FIXTURE));
    });
    downUpstream = await fakeOrcosts((req, res) => {
      res.writeHead(503, { 'content-type': 'application/json' });
      res.end('{"error":"ORcosts API not configured — secret detail"}');
    });
    [serverOk, serverDown] = await Promise.all([
      startServer(PORT_OK, { ORCOSTS_API_URL: okUpstream.url, ORCOSTS_API_TOKEN: TOKEN }),
      startServer(PORT_DOWN, { ORCOSTS_API_URL: downUpstream.url, ORCOSTS_API_TOKEN: TOKEN }),
    ]);
  });

  after(() => {
    serverOk?.kill();
    serverDown?.kill();
    okUpstream?.srv.close();
    downUpstream?.srv.close();
  });

  test('anonyme → 401, et ORcosts n’est pas appelé', async () => {
    const before = seenAuth.length;
    const r = await fetch(`http://127.0.0.1:${PORT_OK}${ROUTE}`);
    assert.equal(r.status, 401);
    assert.equal(seenAuth.length, before);
  });

  test('authentifié non-admin (le compte démo) → 403, et ORcosts n’est pas appelé', async () => {
    const before = seenAuth.length;
    const r = await fetch(`http://127.0.0.1:${PORT_OK}${ROUTE}`, { headers: { Authorization: `Bearer ${sign('user')}` } });
    assert.equal(r.status, 403);
    assert.equal(seenAuth.length, before);
  });

  test('admin → 200 avec la carte, jeton ORcosts transmis côté serveur seulement', async () => {
    const r = await fetch(`http://127.0.0.1:${PORT_OK}${ROUTE}`, { headers: { Authorization: `Bearer ${sign('admin')}` } });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('cache-control'), 'private, no-store');
    const card = await r.json();
    assert.equal(card.available, true);
    assert.equal(card.totals.monthEur, 38.12);
    assert.equal(card.applications.length, TOP_APPLICATIONS);
    assert.equal(seenAuth.at(-1), `Bearer ${TOKEN}`);
    assert.equal(JSON.stringify(card).includes(TOKEN), false, 'le jeton ne doit jamais atteindre le navigateur');
  });

  test('ORcosts en 503 → 200 + available:false, sans le message d’origine', async () => {
    const r = await fetch(`http://127.0.0.1:${PORT_DOWN}${ROUTE}`, { headers: { Authorization: `Bearer ${sign('admin')}` } });
    assert.equal(r.status, 200);
    const card = await r.json();
    assert.equal(card.available, false);
    assert.equal(card.reason, 'unavailable');
    assert.equal(card.dashboardUrl, 'https://orcosts.distr-action.com');
    assert.equal(JSON.stringify(card).includes('secret detail'), false);
  });
});
