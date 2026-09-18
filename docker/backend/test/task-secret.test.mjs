/**
 * Contrat du secret des tâches (TASK_SECRET).
 *
 * Les routes /api/service/tasks déposent dans le CRM les actions que Laurent
 * doit mener lui-même. Elles filtrent par propriétaire, et c'est là que tout
 * se joue : `requireAuthOrService` ne doit JAMAIS être branché dessus, sous
 * peine de rouvrir en silence le cloisonnement réparé le 15/09/2026.
 *
 * Ce test verrouille les propriétés qui font que ça ne peut pas arriver :
 *   1. fermé par défaut — sans TASK_SECRET, aucun en-tête ne passe ;
 *   2. un mauvais secret est refusé ;
 *   3. le secret des tâches n'ouvre RIEN d'autre — surtout pas le CRM ;
 *   4. le secret de service (n8n) n'ouvre PAS les tâches, et réciproquement :
 *      une fuite de l'un ne donne pas l'autre ;
 *   5. la clôture EXIGE un motif ('preuve' ou 'ordre') et une justification ;
 *   6. la surface n'expose aucune suppression.
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

const TASK = 'secret-des-taches-reserve-aux-tests';
const SERVICE = 'secret-de-service-reserve-aux-tests';

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

const PORT_WITH = 3700 + Math.floor(Math.random() * 40);
const PORT_WITHOUT = PORT_WITH + 40;

let withSecret;
let withoutSecret;

before(async () => {
  withSecret = await startServer(PORT_WITH, {
    TASK_SECRET: TASK,
    SERVICE_SECRET: SERVICE,
    TASK_OWNER_EMAIL: 'admin@ainspiration.eu',
  });
  // Aucun TASK_SECRET : la porte doit rester fermée.
  withoutSecret = await startServer(PORT_WITHOUT, { SERVICE_SECRET: SERVICE });
});

after(() => {
  withSecret?.kill();
  withoutSecret?.kill();
});

const base = (port) => `http://127.0.0.1:${port}`;

const post = (port, route, headers, body) =>
  fetch(`${base(port)}${route}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body ?? {}),
  });

const get = (port, route, headers) => fetch(`${base(port)}${route}`, { headers });

test('sans en-tête, les trois routes répondent 401', async () => {
  assert.equal((await post(PORT_WITH, '/api/service/tasks', {}, { ref: 'r', titre: 't' })).status, 401);
  assert.equal((await post(PORT_WITH, '/api/service/tasks/close', {}, { ref: 'r' })).status, 401);
  assert.equal((await get(PORT_WITH, '/api/service/tasks', {})).status, 401);
});

test('un mauvais secret est refusé', async () => {
  const r = await post(PORT_WITH, '/api/service/tasks', { 'x-task-secret': 'faux' }, { ref: 'r', titre: 't' });
  assert.equal(r.status, 401);
});

test('le bon secret passe l’authentification', async () => {
  // Sans base, la route échoue plus loin — mais elle n'échoue plus sur l'auth.
  const r = await post(PORT_WITH, '/api/service/tasks', { 'x-task-secret': TASK }, { ref: 'r', titre: 't' });
  assert.notEqual(r.status, 401);
});

test('TASK_SECRET absent ferme la porte, même avec un en-tête', async () => {
  // Le mode de panne à éviter : une variable oubliée qui OUVRE au lieu de fermer.
  const r = await post(PORT_WITHOUT, '/api/service/tasks', { 'x-task-secret': TASK }, { ref: 'r', titre: 't' });
  assert.equal(r.status, 401);
  assert.equal((await get(PORT_WITHOUT, '/api/service/tasks', { 'x-task-secret': TASK })).status, 401);
});

test('les deux secrets sont cloisonnés — une fuite de l’un ne donne pas l’autre', async () => {
  // Le secret de service (n8n) n'ouvre pas les tâches...
  const t = await post(PORT_WITH, '/api/service/tasks', { 'x-service-secret': SERVICE }, { ref: 'r', titre: 't' });
  assert.equal(t.status, 401);
  // ...et le secret des tâches n'ouvre pas les routes de n8n.
  const n = await get(PORT_WITH, '/api/newsletter-subscribers', { 'x-task-secret': TASK });
  assert.equal(n.status, 401);
});

test('le secret des tâches n’ouvre pas le CRM', async () => {
  for (const route of ['/api/contacts', '/api/companies', '/api/tasks', '/api/opportunities']) {
    const r = await get(PORT_WITH, route, { 'x-task-secret': TASK });
    assert.equal(r.status, 401, `${route} devrait rester fermé au secret des tâches`);
  }
});

test('ref et titre sont obligatoires à la création', async () => {
  const h = { 'x-task-secret': TASK };
  assert.equal((await post(PORT_WITH, '/api/service/tasks', h, { titre: 't' })).status, 400);
  assert.equal((await post(PORT_WITH, '/api/service/tasks', h, { ref: 'r' })).status, 400);
});

test('la clôture exige un motif valide et une justification', async () => {
  const h = { 'x-task-secret': TASK };
  // Pas de motif
  assert.equal((await post(PORT_WITH, '/api/service/tasks/close', h, { ref: 'r', justification: 'x' })).status, 400);
  // Motif inventé
  assert.equal(
    (await post(PORT_WITH, '/api/service/tasks/close', h, { ref: 'r', motif: 'parce que', justification: 'x' })).status,
    400
  );
  // Motif valide mais justification vide : refusé aussi. C'est le test qui
  // compte : une clôture ne doit jamais être muette.
  assert.equal(
    (await post(PORT_WITH, '/api/service/tasks/close', h, { ref: 'r', motif: 'preuve', justification: '  ' })).status,
    400
  );
});

test('la surface de service n’expose aucune suppression', async () => {
  for (const route of ['/api/service/tasks', '/api/service/tasks/close']) {
    const r = await fetch(`${base(PORT_WITH)}${route}`, {
      method: 'DELETE',
      headers: { 'x-task-secret': TASK },
    });
    // 404 (aucune route DELETE déclarée) — surtout pas 200 ni 401.
    assert.equal(r.status, 404, `DELETE ${route} ne doit pas exister`);
  }
});
