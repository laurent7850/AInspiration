/**
 * Contrat de la sonde du parcours de contact Audityo.
 *
 * Le webhook n8n `audityo-contact` répond 200 avant d'exécuter quoi que ce
 * soit. Il l'a fait pendant six jours alors que plus rien ne partait : le
 * formulaire d'Audityo était muet et rien ne l'a signalé. La surveillance ne
 * peut donc pas se fier au code de statut, elle doit relire la ligne écrite
 * dans `contacts` — puis l'effacer, parce qu'elle porte
 * `source = 'formulaire-audityo'` et compterait sinon comme un vrai prospect.
 *
 * Effacer, c'est un pouvoir. Ce test verrouille les propriétés qui font que ce
 * pouvoir reste borné :
 *   1. les deux routes exigent le secret d'ingestion ;
 *   2. elles sont fermées par défaut — sans INGEST_SECRET, aucun en-tête ne
 *      passe (jamais ouvert par omission de configuration) ;
 *   3. le secret d'ingestion n'ouvre toujours RIEN d'autre, surtout pas le CRM ;
 *   4. la purge ne lit AUCUNE donnée de la requête : l'adresse effacée est
 *      figée dans le code, on ne peut pas la braquer sur une autre fiche.
 *
 * Tourne sans base de données : une route autorisée répond 500, jamais 401.
 * C'est « pas 401 » qui prouve que l'authentification est passée.
 *
 * Run: `npm test` dans docker/backend (Node >= 20, aucune dépendance).
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(here, '..', 'server.js');

const SECRET = 'secret-d-ingestion-reserve-aux-tests';

const LECTURE = '/api/ingest/probe/audityo';
const PURGE = '/api/ingest/probe/audityo';

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

const PORT_WITH = 3700 + Math.floor(Math.random() * 50);
const PORT_WITHOUT = PORT_WITH + 50;
const WITH = `http://127.0.0.1:${PORT_WITH}`;
const WITHOUT = `http://127.0.0.1:${PORT_WITHOUT}`;

let avecSecret;
let sansSecret;

before(async () => {
  // Le second serveur n'a délibérément PAS d'INGEST_SECRET : `undefined`
  // écrase la variable éventuellement présente dans l'environnement réel.
  [avecSecret, sansSecret] = await Promise.all([
    startServer(PORT_WITH, { INGEST_SECRET: SECRET }),
    startServer(PORT_WITHOUT, { INGEST_SECRET: undefined }),
  ]);
});

after(() => { avecSecret?.kill(); sansSecret?.kill(); });

const get = (base, url, headers) => fetch(base + url, { headers });
const del = (base, url, headers, body) =>
  fetch(base + url, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...headers }, body });

// 1. Le secret d'ingestion ouvre les deux routes, sans JWT.

test('le secret d ingestion relit la fiche de sonde Audityo', async () => {
  const r = await get(WITH, LECTURE, { 'x-ingest-secret': SECRET });
  assert.notEqual(r.status, 401, 'le secret d ingestion devrait passer l authentification');
});

test('le secret d ingestion purge la fiche de sonde Audityo', async () => {
  const r = await del(WITH, PURGE, { 'x-ingest-secret': SECRET });
  assert.notEqual(r.status, 401, 'le secret d ingestion devrait passer l authentification');
});

// 2. Fermé par défaut, et rien d'autre ne passe.

test('sans en-tête, les deux routes refusent', async () => {
  assert.equal((await get(WITH, LECTURE)).status, 401);
  assert.equal((await del(WITH, PURGE)).status, 401);
});

test('un mauvais secret est refusé', async () => {
  assert.equal((await get(WITH, LECTURE, { 'x-ingest-secret': 'mauvais' })).status, 401);
  assert.equal((await del(WITH, PURGE, { 'x-ingest-secret': 'mauvais' })).status, 401);
});

test('un secret de la bonne longueur mais faux est refusé', async () => {
  const faux = 'x'.repeat(SECRET.length);
  assert.equal((await del(WITH, PURGE, { 'x-ingest-secret': faux })).status, 401);
});

test('sans INGEST_SECRET dans l environnement, aucun en-tête ne passe', async () => {
  const lecture = await get(WITHOUT, LECTURE, { 'x-ingest-secret': SECRET });
  assert.equal(lecture.status, 401, 'une variable absente doit fermer la porte, jamais l ouvrir');
  const purge = await del(WITHOUT, PURGE, { 'x-ingest-secret': SECRET });
  assert.equal(purge.status, 401, 'surtout pour une route qui efface');
});

// 3. Le secret d'ingestion n'ouvre rien d'autre.

test('le secret d ingestion n ouvre pas le CRM', async () => {
  for (const route of ['/api/contacts', '/api/companies', '/api/activities', '/api/access-logs']) {
    const r = await get(WITH, route, { 'x-ingest-secret': SECRET });
    assert.equal(r.status, 401, `${route} ne doit pas s ouvrir au secret d ingestion`);
  }
});

// 4. La purge ne peut pas être braquée ailleurs.
//
// Le test précédent ne peut pas le prouver sans base : la route répond 500
// avant d'avoir rien effacé. La propriété se lit donc dans la source, et c'est
// la bonne granularité — ce qu'on verrouille, c'est qu'aucune donnée de la
// requête n'atteigne jamais le DELETE.

test('le handler de purge ne lit aucune donnée de la requête', () => {
  const src = readFileSync(path.join(here, '..', 'routes', 'webhooks.js'), 'utf8');
  const debut = src.indexOf("app.delete('/api/ingest/probe/audityo'");
  assert.ok(debut > 0, 'la route de purge est introuvable dans routes/webhooks.js');
  const fin = src.indexOf('\napp.', debut + 1);
  const handler = src.slice(debut, fin === -1 ? src.length : fin);

  assert.ok(
    handler.includes('AUDITYO_PROBE_EMAIL'),
    'la purge doit viser la constante figée dans le code'
  );
  for (const entree of ['req.body', 'req.query', 'req.params']) {
    assert.ok(
      !handler.includes(entree),
      `la purge ne doit jamais lire ${entree} : l adresse effacée est figée dans le code`
    );
  }
});

test('la constante de sonde Audityo est une adresse de surveillance', () => {
  const src = readFileSync(path.join(here, '..', 'routes', 'webhooks.js'), 'utf8');
  const m = src.match(/const AUDITYO_PROBE_EMAIL = '([^']+)'/);
  assert.ok(m, 'AUDITYO_PROBE_EMAIL introuvable');
  assert.match(
    m[1],
    /@surveillance\.ainspiration\.eu$/,
    'la fiche purgée doit appartenir au domaine de surveillance, jamais à un prospect réel'
  );
});
