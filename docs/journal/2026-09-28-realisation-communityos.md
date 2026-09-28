---
date: 2026-09-28
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Vérifier le 29/09 que le post du guide est bien parti de CommunityOS à 8 h 30, et le noter sur la fiche si ce n'est pas le cas
---

## Fait

- **CommunityOS ajouté aux réalisations**, fr/en/nl, vérifié en production :
  `/realisations/communityos` et ses versions `/en` et `/nl` répondent 200 avec le bon
  `lang`, quatre `hreflang`, six `<h2>` dans le HTML brut ; la liste `/realisations` le
  porte dans les trois langues ; un slug inventé rend toujours 404.
- **Faits seulement**, comme demandé : outil interne de Distr'Action SRL, validation à
  quatre yeux par défaut, planification à l'heure de Bruxelles, journal d'audit chaîné,
  double authentification, jetons chiffrés, arrêt d'urgence, médiathèque avec droits
  d'usage et texte alternatif, brouillons IA relus avant envoi. Disponible : profil
  LinkedIn. En cours : pages entreprise (accès demandé le 28/09). Prévu : Facebook,
  Instagram, boîte de réception, statistiques. Première utilisation réelle : le post du
  guide, planifié pour le 29/09 à 8 h 30. **Aucun chiffre, aucun client, aucun « conforme
  RGPD »** — `metrics: []`, statut `interne`.
- **Le slug vit dans six fichiers, tous touchés** (leçon Paperclip du 26/09, trouvés par
  `grep -rn veille-youtube` sur le dépôt) : `src/data/realisations.ts`, les trois
  `public/locales/*/realisations.json`, `REALISATION_DETAIL_SLUGS` dans
  `docker/backend/routes/seo.js`, et la liste à la main de `scripts/vite-plugin-sitemap.ts`.
- **Le compte de réalisations est en dur à quatre endroits**, tous passés à 15 :
  `band.count` des trois `realisations.json` (disait 14), `history.m2026_desc` des trois
  `about.json` (« Quatorze »), le compteur de `Consulting.tsx` (`"14"`), et la méta
  description de `/realisations` dans `seo.js`, qui disait encore **« Seize »**. Les
  « Quinze » de `seoConfig.ts`, `common.json` et du hero de la page, restés à quinze
  après le retrait de Paperclip, redeviennent justes.
- **Nouveau champ `projectUrl`** dans `src/data/realisations.ts`, rendu en tête de fiche
  (« Page publique ») : `clientUrl` reste le site du commanditaire, et ici le commanditaire
  est Distr'Action. Lien vers `communityos.srv767464.hstgr.cloud`, sans promettre de
  domaine définitif.
- **Vignette capturée depuis la page publique** par `scripts/captures/capture.mjs`
  (cible `communityos` ajoutée ; `npm i --no-save playwright` pour la faire tourner, le
  paquet n'étant volontairement pas une dépendance). Aucune donnée personnelle, pas de
  formulaire de connexion sur l'image.
- **Défaut trouvé au contrôle navigateur** : la section « Ce que ça change » n'était
  rendue par React **que si la fiche portait au moins une métrique**. Le HTML serveur la
  servait, le navigateur la cachait — pour CommunityOS mais aussi pour Audityo,
  DreamOracle, le chat du site et L'Artpéro, dont le texte de résultats n'a donc jamais
  été visible. `RealisationDetailPage.tsx` affiche désormais le paragraphe dès que la
  locale en a un ; la grille de chiffres garde son propre garde.
- Deux déploiements, l'ordre tenu à chaque fois : commit des sources, build (garde-fou
  `public/` conforme à HEAD), manifeste commité et **poussé d'abord** (215 entrées),
  `netlify deploy --prod`, **215/215 vérifiées une à une sur le CDN**, `compose-exact
  ainspiration-web up -d --force-recreate web`, conteneur reparti sur « Frontend: 215
  files downloaded ». `tsc` propre, lint 0 avertissement, 84/84 tests, 138 tests backend,
  CI verte sur les deux pushs, **contrôle de santé 27/27**. Asset absent toujours en 404
  `text/plain`.

- **`paperclip.jpg` supprimé et redéployé** (sur instruction de Laurent, même soir) : l'image
  de la fiche retirée le 26/09 était restée dans `public/` et dans le manifeste, donc servie.
  Aucune référence ailleurs (grep sur `src`, locales, backend, scripts). Troisième déploiement,
  même ordre : manifeste à 214 entrées poussé d'abord, 214/214 sur le CDN, `--force-recreate`,
  « Frontend: 214 files downloaded ». En production, `/images/realisations/paperclip.jpg` rend
  **404 `text/plain`**. Le CDN Netlify, lui, répond 200 `text/html` — c'est son repli SPA vers
  `index.html`, pas le fichier : il n'existe plus dans le déploiement. Contrôle de santé 27/27,
  CI verte.

## Cassé

- Rien. Le premier déploiement a rendu la fiche sans son paragraphe de résultats pendant
  une vingtaine de minutes, le temps de trouver et corriger le garde ci-dessus.

## Reste

- **Le post du 29/09 à 8 h 30** : la fiche affirme qu'il est planifié depuis CommunityOS.
  Si la publication n'a pas lieu, corriger la fiche — pas de fait invérifiable en ligne.
- **La section « Ce que ça change » apparaît maintenant sur quatre autres fiches** (Audityo,
  DreamOracle, chat du site, L'Artpéro) : relire ces quatre paragraphes en production, ils
  n'avaient jamais été vus par un visiteur.
