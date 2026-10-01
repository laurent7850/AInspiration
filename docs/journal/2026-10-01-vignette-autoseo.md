---
date: 2026-10-01
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Aucune
---

## Fait

- **La vignette de la fiche AutoSEO montre la nouvelle page d'accueil de SEOPilot**
  (« Le SEO de nos marques, mesuré avant d'être promis »), à la demande de Laurent.
  L'ancienne image montrait la grille de fonctionnalités de l'ancienne page.
- Cible `autoseo` ajoutée à `scripts/captures/capture.mjs`
  (`https://seopilot.srv767464.hstgr.cloud/`) : la vignette se regénère désormais par
  le script. Seule la page publique est capturée — le tableau de bord derrière la
  connexion affiche positions et trafic réels.
- Déploiement dans l'ordre : commit des sources, build (garde-fou `public/` conforme
  à HEAD), manifeste inchangé à 214 entrées (même nom de fichier, aucune empreinte),
  push, `netlify deploy --prod`, **214/214 vérifiées sur le CDN**, `compose-exact
  ainspiration-web up -d --force-recreate web`, « Frontend: 214 files downloaded ».
- Vérifié en production : `/images/realisations/autoseo.jpg` a la même empreinte md5
  que le build, `/realisations/autoseo` répond 200, l'image se charge sur
  `/realisations`. Contrôle de santé 27/27.

## Cassé

- Rien.

## Reste

- Rien pour cette vignette.

## Complément — l'ancienne image restait affichée

- Laurent voyait toujours l'ancienne vignette. Le serveur servait la bonne : c'est son
  navigateur qui gardait l'ancienne. `routes/seo.js` posait
  `max-age=31536000, immutable` sur **toute** image, y compris celles de `public/`,
  qui gardent leur nom quand on les remplace. Un an sans revérification.
- Corrigé : `immutable` réservé à `dist/assets/` (noms à empreinte Vite) ; images, PDF
  et autres fichiers de `public/` en `max-age=3600`, revalidés par ETag.
- La fiche pointe désormais sur `autoseo.jpg?v=20261001` : les navigateurs qui avaient
  déjà l'ancienne en cache un an la redemandent. **À incrémenter à chaque remplacement
  d'une image de `public/`** — les autres vignettes sont toujours en cache chez qui les
  a vues avant ce jour.
- Déployé dans l'ordre (manifeste poussé d'abord, 214/214 sur le CDN, recreate,
  « Frontend: 214 files downloaded »). En-têtes vérifiés en production : image en
  `max-age=3600`, chunk `/assets/` toujours `immutable`. Nouvelle vignette vue dans le
  navigateur sur `/realisations`. 138 tests backend, 84 frontend.
