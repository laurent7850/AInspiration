---
date: 2026-10-05
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Faire valider par Laurent les quatre sections ajoutées aux mentions légales (§8 à §11)
---

## Fait

- Les 12 alertes du crawler SEO corrigées, déployées et vérifiées en production : 11 meta
  descriptions sous 120 caractères (de 54 à 117) et les mentions légales à 170 mots.
  Après déploiement, les 12 URL servent entre 147 et 160 caractères ; les mentions légales
  servent ~455 mots dans le HTML brut.
- Articles : la règle a été corrigée plutôt que les textes. Un extrait de moins de
  120 caractères est complété par les paragraphes du corps (titres exclus, entités HTML
  décodées) ; un extrait qui recopie le titre sans ses accents est écarté. Simulé sur la
  base de production : 23 articles sur 102 étaient sous le seuil, 99 vérifiés dans la
  fourchette après (3 refusés en 429 par la limitation de débit pendant la simulation).
- Même règle côté serveur (`docker/backend/seo-meta.js`) et côté front (`src/utils/seoMeta.ts`),
  mêmes cas dans les deux suites de tests ; 141 tests backend et 12 tests front verts.
- Réalisations : le résumé de carte (38 à 118 caractères) est complété par les résultats
  puis la solution. `/realisations/autoseo` passe de 77 à 156.
- Pages statiques réécrites dans `seoConfig.ts` : `/solutions` (fr), `/mentions-legales`,
  `/cgv`, `/cgu` (fr/en/nl), `/privacy` (en/nl).
- Mentions légales : quatre sections ajoutées en trois langues — limitation de
  responsabilité, liens hypertextes, contenus produits avec l'IA, contact.
- Déployé dans l'ordre : build (215 entrées) → manifeste poussé → Netlify → 215/215 vérifiées
  sur le CDN → `--force-recreate`. Contrôle de santé 27/27, asset absent toujours en 404.

- Second passage, à la demande de Laurent, déployé et vérifié (contrôle de santé 27/27) :
  - plus aucune page publique hors 120–160 caractères : 15 descriptions EN/NL réécrites
    dans `seoConfig.ts`, plus les textes de locales que certaines pages imposent après
    chargement (`analysis`, `local`, `guide`, `crm`) ; 18 URL relues en production, de 125
    à 159 caractères ;
  - les deux extraits d'articles qui recopiaient le titre sans accents, réécrits en base
    après sauvegarde (`/root/backups/blog-excerpts-before-20261005_134817.csv`) ;
  - l'article sur les stocks avait aussi son titre sans accents, donc son `<title>` et son
    `<h1>` : corrigé, slug inchangé.

## Cassé

- Rien en production. Mais deux surprises :
- Les pages légales avaient **deux** descriptions : celle de `seoConfig.ts` pour le serveur,
  et une plus courte dans `legal.json` passée en prop à `SEOHead`, qui l'emportait à
  l'hydratation. Corriger la config seule n'aurait rien changé pour un robot qui exécute
  le JavaScript. Supprimée, source unique.
- Le build a refusé de partir tant que `public/` n'était pas commité (garde-fou du 19/09) :
  il a fait son travail.
- La description de `/crm` affirmait une « augmentation prouvée des conversions » dans les
  trois langues, sans aucune preuve derrière : retirée.
- Un script de remplacement a écrit le texte néerlandais du guide dans la description
  anglaise de `/pme-hainaut-bruxelles`, parce que `seoConfig.ts` mélange guillemets simples
  et doubles. Une autre ligne du même script l'a réécrite juste après : aucun dégât, mais
  par chance. Noté en piège.
- Les heredocs de Git Bash ont dénaturé les antislashes de deux scripts et d'un test,
  sans erreur à l'écriture — repris par l'outil Write. Noté en piège.

## Reste

- Validation par Laurent du texte juridique ajouté aux mentions légales. Tâche CRM non
  déposée : `.env.local` était illisible depuis la session.
- Le `<title>` de l'article Hainaut est coupé en « …quand on est » : la règle de coupe ne
  retire pas `est`, `on`, `quand` en fin de titre.
- Les pages CRM (noindex) gardent des descriptions sous 120, sans enjeu.
