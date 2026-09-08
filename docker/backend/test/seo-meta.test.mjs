/**
 * Article meta lengths. The two cases at the top are the ones ainspiration.eu
 * actually served: a 94-character title and a 239-character description, both
 * cut by Google before the reader reached the point.
 * Run: `npm test` in docker/backend.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { metaTitleFor, metaDescriptionFor, TITLE_MAX, DESC_MAX } = require('../seo-meta.js');

test('coupe un titre a son sous-titre plutot qu\'au milieu d\'une phrase', () => {
  const title = metaTitleFor(
    'Comparatif des Meilleures Solutions IA pour PME en 2026 : Le Guide Complet'
  );
  assert.equal(title, 'Comparatif des Meilleures Solutions IA pour PME en 2026');
  assert.ok(title.length <= TITLE_MAX);
});

test('ne laisse pas un titre se terminer sur un mot-outil', () => {
  // Sans regle, la coupe au mot donnait « ... pour les entrepreneurs en ».
  const title = metaTitleFor('Les meilleurs outils IA gratuits pour les entrepreneurs en 2026');
  assert.equal(title, 'Les meilleurs outils IA gratuits pour les entrepreneurs');
  assert.ok(title.length <= TITLE_MAX);
});

test('garde la marque quand elle tient, la sacrifie sinon', () => {
  assert.equal(metaTitleFor('IA et RGPD'), 'IA et RGPD | Blog AInspiration');
  const long = metaTitleFor('Automatiser sa facturation quand on est indépendant');
  assert.equal(long, 'Automatiser sa facturation quand on est indépendant');
  assert.ok(!long.includes('Blog AInspiration'));
});

test('rend un titre par defaut plutot qu\'une chaine vide', () => {
  assert.equal(metaTitleFor(''), 'Blog AInspiration');
  assert.equal(metaTitleFor(null), 'Blog AInspiration');
});

test('arrete la description a une fin de phrase quand il en reste assez', () => {
  const description = metaDescriptionFor(
    "Découvrez le comparatif des meilleures solutions IA pour PME en 2026, avec prix, fonctionnalités et cas d'usage concrets. Choisissez l'outil qui va vraiment transformer votre entreprise."
  );
  assert.equal(
    description,
    "Découvrez le comparatif des meilleures solutions IA pour PME en 2026, avec prix, fonctionnalités et cas d'usage concrets."
  );
  assert.ok(description.length <= DESC_MAX);
});

test('signale la coupe quand aucune phrase ne tombe au bon endroit', () => {
  const description = metaDescriptionFor(
    "Découvrez les outils IA gratuits incontournables pour booster votre activité entrepreneuriale en 2026. De la rédaction à l'analyse de données, ces solutions accessibles transforment votre façon de travailler sans grever votre budget."
  );
  assert.ok(description.length <= DESC_MAX);
  assert.ok(description.endsWith('…'));
  assert.ok(description.startsWith('Découvrez les outils IA gratuits'));
});

test('laisse intacte une description deja courte', () => {
  const short = 'Un guide pratique pour automatiser la facturation des indépendants avec des outils accessibles.';
  assert.equal(metaDescriptionFor(short), short);
});

test('retombe sur le corps de l\'article quand l\'extrait manque', () => {
  const description = metaDescriptionFor('', 'Le texte complet de l\'article sert de secours.');
  assert.equal(description, 'Le texte complet de l\'article sert de secours.');
  assert.equal(metaDescriptionFor('', ''), '');
});
