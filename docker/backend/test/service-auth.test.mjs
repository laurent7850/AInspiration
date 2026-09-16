/**
 * Contrat du secret de service (SERVICE_SECRET).
 *
 * Les workflows n8n publiaient les articles et lisaient les abonnés avec un JWT
 * admin valable un an, collé à la main dans une credential n8n. Toute rotation
 * de JWT_SECRET arrêtait donc en silence l'auto-blog ET la newsletter : c'est
 * arrivé les 08 et 15/09/2026, et le blog est resté muet 18 jours.
 *
 * Ce test verrouille les trois propriétés qui font que ça ne peut plus revenir
 * de la même manière :
 *   1. le secret ouvre les deux routes dont n8n a besoin, sans JWT ;
 *   2. il n'ouvre RIEN d'autre — surtout pas le CRM ;
 *   3. il est fermé par défaut : sans SERVICE_SECRET dans l'environnement,
 *      aucun en-tête ne passe (jamais ouvert par omission de configuration).
 *
 * Tourne sans base de données : une route autorisée répond 400 ou 500, jamais
 * 401. C'est « pas 401 » qui prouve que l'authentification est passée.
 *
 * Run: `npm test` dans docker/backend (Node >= 20, aucune dépendance).
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(here, '..', 'server.js');

const SECRET = 'secret-de-service-reserve-aux-tests';

async function startServer(port, extraEnv) {
  const child = spawn(process.execPath, [SERVER], {
    cwd: path.join(here, '..'),
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'test',
      JWT_SECRET: 'test-only-secret',
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

const PORT_WITH = 3800 + Math.floor(Math.random() * 50);
const PORT_WITHOUT = PORT_WITH + 50;
const WITH = `http://127.0.0.1:${PORT_WITH}`;
const WITHOUT = `http://127.0.0.1:${PORT_WITHOUT}`;

let avecSecret;
let sansSecret;

before(async () => {
  // Le second serveur n'a délibérément PAS de SERVICE_SECRET : `undefined`
  // écrase la variable éventuellement présente dans l'environnement réel.
  [avecSecret, sansSecret] = await Promise.all([
    startServer(PORT_WITH, { SERVICE_SECRET: SECRET }),
    startServer(PORT_WITHOUT, { SERVICE_SECRET: undefined }),
  ]);
});

after(() => { avecSecret?.kill(); sansSecret?.kill(); });

const post = (base, url, headers) =>
  fetch(base + url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: '{}' });
const get = (base, url, headers) => fetch(base + url, { headers });

// 1. Le secret ouvre ce dont n8n a besoin, sans JWT.

test('le secret de service publie un article sans JWT', async () => {
  const r = await post(WITH, '/api/blog-posts', { 'x-service-secret': SECRET });
  assert.notEqual(r.status, 401, 'le secret de service devrait passer l authentification');
});

test('le secret de service lit les abonnés sans JWT', async () => {
  const r = await get(WITH, '/api/newsletter-subscribers?limit=1', { 'x-service-secret': SECRET });
  assert.notEqual(r.status, 401, 'le secret de service devrait passer l authentification');
});

// 2. Il n'ouvre rien d'autre.

test('un mauvais secret est refusé', async () => {
  const r = await post(WITH, '/api/blog-posts', { 'x-service-secret': 'mauvais-secret' });
  assert.equal(r.status, 401);
});

test('un secret de la bonne longueur mais faux est refusé', async () => {
  const faux = 'x'.repeat(SECRET.length);
  const r = await post(WITH, '/api/blog-posts', { 'x-service-secret': faux });
  assert.equal(r.status, 401);
});

test('le secret de service n ouvre pas le CRM', async () => {
  for (const route of ['/api/contacts', '/api/companies', '/api/opportunities', '/api/access-logs']) {
    const r = await get(WITH, route, { 'x-service-secret': SECRET });
    assert.equal(r.status, 401, `${route} ne doit pas s ouvrir au secret de service`);
  }
});

test('le secret de service ne modifie ni ne supprime un article', async () => {
  const id = '00000000-0000-4000-8000-000000000000';
  const put = await fetch(`${WITH}/api/blog-posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-service-secret': SECRET },
    body: '{}',
  });
  assert.equal(put.status, 401, 'la relecture éditoriale reste réservée à un humain authentifié');
  const del = await fetch(`${WITH}/api/blog-posts/${id}`, {
    method: 'DELETE',
    headers: { 'x-service-secret': SECRET },
  });
  assert.equal(del.status, 401);
});

// 3. Fermé par défaut.

test('sans SERVICE_SECRET dans l environnement, aucun en-tête ne passe', async () => {
  const r = await post(WITHOUT, '/api/blog-posts', { 'x-service-secret': SECRET });
  assert.equal(r.status, 401, 'une variable absente doit fermer la porte, jamais l ouvrir');
});

test('un en-tête vide ne passe pas non plus', async () => {
  const r = await post(WITH, '/api/blog-posts', { 'x-service-secret': '' });
  assert.equal(r.status, 401);
});
