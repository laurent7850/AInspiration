---
date: 2026-10-02
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Aucune — reprendre band.count et les « quinze » à la prochaine fiche ajoutée ou retirée
---

## Fait

- Recompté les réalisations : **15** (14 fiches complètes + Enghien en format réduit),
  identiques dans `src/data/realisations.ts`, les `items` des trois locales, la liste
  blanche `REALISATION_DETAIL_SLUGS` (14, Enghien sans page de détail, voulu) et le sitemap.
  En production, `/realisations` et ses textes disent 15 dans les trois langues.
- Seul écart : le compteur animé « Réalisations en service » d'`AnimatedStats.tsx`
  (accueil via `Hero`, et `/solutions`) affichait **14**, valeur écrite à la main le 26/09
  avant l'arrivée de la quinzième fiche.
- Le compteur dérive maintenant de `realisations.length` — il ne peut plus décaler.
  tsc, lint et 84 tests au vert.

- **Déployé le 03/10** : build, Netlify, manifeste (`7c0e341`), `dist/` copié dans le
  conteneur. Le bundle servi `index-BiJDy3xj.js` contient `end:Ot.length`, et `Ot` compte
  bien les 15 slugs. Contrôle de santé 27/27. Vérification visuelle impossible : le panneau
  du navigateur était masqué, l'animation `requestAnimationFrame` restait à 0.

## Cassé

- rien

## Reste

- Restent en dur : `band.count` « 15 » des trois `realisations.json`, et les mots
  « quinze / fifteen / vijftien » (locales `common`, `about`, `realisations`, `seoConfig.ts`,
  `routes/seo.js`). Justes aujourd'hui ; à reprendre à chaque ajout ou retrait de fiche.
