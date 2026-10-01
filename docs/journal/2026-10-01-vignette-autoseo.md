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
