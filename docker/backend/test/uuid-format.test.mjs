/**
 * Les identifiants du jeu de démonstration doivent rester acceptés.
 *
 * Zod 4 a durci `.uuid()` : il exige désormais un UUID conforme à la RFC, avec
 * le chiffre de version et le variant corrects. Les identifiants « décoratifs »
 * du seed — c0000000-…, d0000000-…, e0000000-…, f0000000-…, b0000000-…,
 * a1000000-…, et l'utilisateur démo a0000000-… — n'en sont pas. Après la montée
 * de version, `validateUuidParam()` renvoyait donc 400 sur CHAQUE fiche de la
 * démonstration publique : contacts, sociétés, produits, opportunités, tâches.
 * Le CRM de démonstration, qui est la vitrine commerciale, était inutilisable.
 *
 * L'intention du validateur est de rejeter ce qui n'est pas un identifiant bien
 * formé, pas d'imposer la version 4 : c'est `guid()`. Ce test échoue si
 * quelqu'un revient à `uuid()`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { z } = require('zod');
const here = path.dirname(fileURLToPath(import.meta.url));
const SERVER = readFileSync(path.join(here, '..', 'server.js'), 'utf8');

const SEED_IDS = [
  'a0000000-0000-0000-0000-000000000001', // utilisateur démo
  'c0000000-0000-0000-0000-000000000002', // société
  'd0000000-0000-0000-0000-000000000001', // contact
  'e0000000-0000-0000-0000-000000000001', // produit
  'f0000000-0000-0000-0000-000000000001', // opportunité
  'b0000000-0000-0000-0000-000000000001', // tâche
  'a1000000-0000-0000-0000-000000000001', // message du site
];

test('guid() accepte les identifiants du seed, uuid() les refuse', () => {
  for (const id of SEED_IDS) {
    assert.ok(z.string().guid().safeParse(id).success, `${id} devrait être accepté par guid()`);
  }
  // Le jour où cette assertion tombe, Zod a de nouveau changé de comportement :
  // relire le validateur avant de supposer que le problème a disparu.
  assert.ok(
    !z.string().uuid().safeParse(SEED_IDS[0]).success,
    'uuid() accepte de nouveau les identifiants non conformes — vérifier la version de Zod'
  );
});

test('un identifiant réellement mal formé reste refusé', () => {
  for (const bad of ['', 'pas-un-uuid', '../../etc/passwd', 'c0000000-0000-0000-0000']) {
    assert.ok(!z.string().guid().safeParse(bad).success, `${bad} devrait être refusé`);
  }
});

test('le validateur de paramètre et zUuid utilisent guid(), jamais uuid()', () => {
  assert.match(SERVER, /function validateUuidParam[\s\S]{0,400}?z\.string\(\)\.guid\(\)/);
  assert.match(SERVER, /const zUuid = z\.string\(\)\.guid\(\);/);
  assert.ok(
    !/z\.string\(\)\.uuid\(\)/.test(SERVER),
    'server.js utilise encore z.string().uuid() : les fiches de démonstration répondront 400'
  );
});
