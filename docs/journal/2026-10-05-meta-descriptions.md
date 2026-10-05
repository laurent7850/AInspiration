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
- Troisième passage : la coupe des titres d'articles. Mesurée sur les 102 titres réels
  avant de toucher au code : sur 60 titres raccourcis, une vingtaine finissaient en plein
  groupe de mots (« …quand on est », « …when you are a small », « …with Generative »,
  « …of Belgian »). Nouvelle règle : une coupe n'est gardée que si le premier mot retiré
  ouvre un groupe ou est une ponctuation ; sinon repli sur la partie avant le « : ».
  35 titres changent, comparés un à un avant/après ; front et serveur identiques sur les
  102. Déployé, titres relus dans le HTML servi, contrôle de santé 27/27.
- Les deux titres que la nouvelle règle raccourcissait trop faisaient 61 caractères, un
  de trop. Reformulés en base pour tenir en entier, plus la version anglaise du premier,
  dans le même cas (sauvegarde préalable sur le VPS) :
  « Créer du contenu marketing performant avec l'IA générative » (58),
  « 5 usages concrets de l'IA pour les entreprises wallonnes » (56),
  « Create High-Performing Marketing Content with Generative AI » (59).
  Slugs inchangés ; titres et `<h1>` relus en production après expiration du cache.

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
- La règle de sous-titre ne s'appliquait qu'au français depuis le début : elle cherchait
  « : » avec une espace avant, que les titres anglais et néerlandais n'ont pas.
- Trois essais de la règle des titres ont régressé avant la bonne version (sous-titres
  complets sacrifiés, « : » collé pris pour un milieu de phrase) : c'est la comparaison
  avant/après sur les titres réels qui les a montrés, pas les tests unitaires.
- Les heredocs de Git Bash ont dénaturé les antislashes de deux scripts et d'un test,
  sans erreur à l'écriture — repris par l'outil Write. Noté en piège.

## Reste

- Validation par Laurent du texte juridique ajouté aux mentions légales. Tâche CRM non
  déposée : `.env.local` était illisible depuis la session.
- Les pages CRM (noindex) gardent des descriptions sous 120, sans enjeu.
