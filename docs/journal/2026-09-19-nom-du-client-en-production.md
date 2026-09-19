---
date: 2026-09-19
projet: AInspiration
ou: Claude Code
type: Incident
notion: non
prochaine-action: Au prochain déploiement, vérifier que la ligne « [public-check] N fichiers conformes » apparaît bien avant le manifeste
---

## Fait

- **Le nom du client est resté visible en production une trentaine de minutes**, dans la
  capture d'écran de la fiche « playlists-auditeurs » : « Radio Nostalgie Belgique » au
  lieu de « Une radio nationale francophone ». C'est la **règle non négociable n° 2** du
  handoff, et c'est moi qui l'ai enfreinte — mes deux déploiements du soir ont empaqueté un
  fichier qui n'était pas celui du dépôt.
- **Cause : un conflit de synchronisation OneDrive.** Le 18/09 à 13 h 44, OneDrive a trouvé
  deux versions du fichier, a gardé celle de la machine MSI sous le nom
  `playlists-auditeurs-MSI.jpg`, et a **remis l'ancienne — celle du 4 septembre, non
  anonymisée — sous le nom d'origine**. Git voyait donc « fichier modifié + fichier non
  suivi », ce que j'ai pris pendant toute la session pour deux images de Laurent qui
  traînaient. Je les ai signalées trois fois sans jamais les ouvrir.
- **Réparé** : fichier suivi restauré depuis HEAD, copie de conflit supprimée (empreinte
  SHA-256 identique au bit près à la version commitée — rien de perdu), `dist/` vidé,
  rebuild, déploiement, `--force-recreate`. La production sert de nouveau la version
  anonymisée (`bc53030…`, 102 766 octets), vérifié par empreinte.
- **Fenêtre d'exposition datée par les permaliens Netlify** : les déploiements de 13 h 34
  et 13 h 51 UTC portent l'image non anonymisée, celui de 14 h 02 ne l'a plus. Avant, le
  déploiement du 18/09 à 18 h 42 était propre. Le site a donc servi le nom du client de
  **13 h 36 à 14 h 06 UTC environ**, le temps que le conteneur retélécharge.
- **Un fichier parasite était aussi parti en ligne** : la copie `-MSI` elle-même, embarquée
  dans `dist/` et listée dans le manifeste — d'où les **210** entrées au lieu de 209. Le
  manifeste est revenu à 209.

## Cassé

- **J'ai déployé trois fois sans jamais regarder ce que contenait l'arbre de travail.**
  Deux fichiers modifiés apparaissaient à chaque `git status`, je les ai écartés d'un
  « ce ne sont pas les miens » au lieu de les ouvrir. Une image modifiée sur une fiche
  client, ça se regarde **avant** de construire, pas après.
- **Le contrôle de santé n'a rien vu, et ne pouvait rien voir.** Il vérifie des codes de
  retour, du HTML brut, des liens, des en-têtes. Le nom d'un client à l'intérieur d'un JPEG
  échappe à tout ça. Il n'existe aucun test qui protège la règle n° 2.
- **Le manifeste à 210 entrées aurait dû m'alerter.** `main` en portait 209 ; j'ai vu le
  chiffre passer à 210, je l'ai noté dans un message, et je n'ai pas cherché **quel**
  fichier s'ajoutait. Un décompte qui change sans raison connue est une question, pas une
  observation.

- **Les deux déploiements Netlify qui hébergeaient encore l'image ont été supprimés**, sur
  accord de Laurent : `6aae8f698aa7ec9f6eb3cd7a` (13 h 34) et `6aae937fa66ab6a979ad14a2`
  (13 h 51). Les quatorze déploiements restants ont été resondés un à un : plus aucun ne
  sert la version non anonymisée. Le déploiement publié (14 h 06) n'a pas été touché, et la
  production répond toujours 200 sur l'accueil, la vitrine et la fiche.

- **Le garde-fou est posé** : `scripts/check-public-matches-head.mjs`, branché sur
  `postbuild` et `postbuild:prod`. Un build de production **échoue** si `public/` n'est
  pas propre, si un fichier commité de `public/` diffère de sa copie dans `dist/`, ou si
  `dist/` porte un fichier qui ne vient d'aucun commit. Comparaison par empreinte de blob
  git, 0,22 s sur les 129 fichiers. Le build de dev n'est pas touché : travailler sur une
  image pas encore commitée reste libre.
- **Vérifié sur les quatre défauts, pas seulement sur le cas passant** : copie non suivie
  dans `public/`, fichier suivi modifié, intrus dans `dist/`, `dist/` périmé. Le build de
  production sort en code 1 sur le scénario exact de l'incident. Un garde-fou qu'on n'a
  jamais vu se déclencher n'est pas un garde-fou, c'est une décoration.
- Un défaut trouvé en l'écrivant : `git status --porcelain` rend « ` M chemin` » avec une
  espace de tête, et un `trim()` sur la sortie entière décalait tous les chemins d'un
  caractère. L'alerte nommait `ublic/images/…`. **Une alerte qui se trompe de chemin est
  une alerte qu'on ne suit pas.**

## Reste

- Rien pour l'instant sur ce sujet.
