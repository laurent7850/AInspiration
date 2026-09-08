import { describe, it, expect } from 'vitest';
import { metaTitleFor, metaDescriptionFor, plainTextFrom, TITLE_MAX, DESC_MAX } from './seoMeta';

/**
 * The same cases are pinned in docker/backend/test/seo-meta.test.mjs. Both
 * runtimes write the same tags on the same pages, so they have to agree
 * character for character.
 */
describe('metaTitleFor', () => {
  it('coupe au sous-titre plutôt qu\'au milieu d\'une phrase', () => {
    expect(
      metaTitleFor('Comparatif des Meilleures Solutions IA pour PME en 2026 : Le Guide Complet')
    ).toBe('Comparatif des Meilleures Solutions IA pour PME en 2026');
  });

  it('ne laisse pas un titre se terminer sur un mot-outil', () => {
    // Sans cette règle : « ... pour les entrepreneurs en ».
    expect(metaTitleFor('Les meilleurs outils IA gratuits pour les entrepreneurs en 2026')).toBe(
      'Les meilleurs outils IA gratuits pour les entrepreneurs'
    );
  });

  it('garde la marque quand elle tient, la sacrifie sinon', () => {
    expect(metaTitleFor('IA et RGPD')).toBe('IA et RGPD | Blog AInspiration');
    expect(metaTitleFor('Automatiser sa facturation quand on est indépendant')).toBe(
      'Automatiser sa facturation quand on est indépendant'
    );
  });

  it('reste sous la limite quel que soit le titre', () => {
    const titles = [
      'Comparatif des Meilleures Solutions IA pour PME en 2026 : Le Guide Complet',
      'Les meilleurs outils IA gratuits pour les entrepreneurs en 2026',
      'Comment intégrer une intelligence artificielle générative dans une petite entreprise belge',
      'IA',
      '',
    ];
    for (const title of titles) {
      expect(metaTitleFor(title).length).toBeLessThanOrEqual(TITLE_MAX);
    }
  });
});

describe('metaDescriptionFor', () => {
  it('arrête la description à une fin de phrase quand il en reste assez', () => {
    expect(
      metaDescriptionFor(
        "Découvrez le comparatif des meilleures solutions IA pour PME en 2026, avec prix, fonctionnalités et cas d'usage concrets. Choisissez l'outil qui va vraiment transformer votre entreprise."
      )
    ).toBe(
      "Découvrez le comparatif des meilleures solutions IA pour PME en 2026, avec prix, fonctionnalités et cas d'usage concrets."
    );
  });

  it('signale la coupe quand aucune phrase ne tombe au bon endroit', () => {
    const description = metaDescriptionFor(
      "Découvrez les outils IA gratuits incontournables pour booster votre activité entrepreneuriale en 2026. De la rédaction à l'analyse de données, ces solutions accessibles transforment votre façon de travailler sans grever votre budget."
    );
    expect(description.length).toBeLessThanOrEqual(DESC_MAX);
    expect(description.endsWith('…')).toBe(true);
  });

  it('laisse intacte une description déjà courte', () => {
    const short = 'Un guide pratique pour automatiser la facturation des indépendants.';
    expect(metaDescriptionFor(short)).toBe(short);
  });

  it('retombe sur le corps de l\'article quand l\'extrait manque', () => {
    expect(metaDescriptionFor('', 'Le texte complet sert de secours.')).toBe(
      'Le texte complet sert de secours.'
    );
    expect(metaDescriptionFor(null, null)).toBe('');
  });
});

describe('plainTextFrom', () => {
  it('retire le balisage et normalise les espaces', () => {
    expect(plainTextFrom('<p>Un <strong>test</strong></p>\n<p>simple</p>')).toBe('Un test simple');
    expect(plainTextFrom(null)).toBe('');
  });
});
