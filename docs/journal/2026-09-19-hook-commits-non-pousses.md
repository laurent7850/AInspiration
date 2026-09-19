---
date: 2026-09-19
projet: AInspiration
ou: Claude Code
type: Avancée
notion: https://app.notion.com/p/3e0fb662f4aa819d8f7cecb7eb15ae62
synchro: 2026-09-19
prochaine-action: À la prochaine ouverture de session, vérifier que la ligne « Commits non poussés » apparaît bien dans le contexte injecté
---

## Fait

- **Le hook `SessionStart` compte et liste les commits non poussés.** C'était le « Reste »
  de la note du matin : la règle du 19/09 — pousser est le quatrième geste du rituel —
  reposait sur la lecture du handoff, donc sur la mémoire. Elle repose maintenant sur une
  ligne affichée à chaque ouverture, dans la section « État du dépôt ». Zéro commit en
  attente : une ligne sobre. Des commits en attente : le nombre en gras, les dix derniers
  listés (`%h %s`), « … et N de plus » au-delà, et le rappel de pousser.
- **Reporté à l'identique dans AutoSEO** (`.claude/hooks/session-start.mjs`) — depuis
  cette session, et c'était à tort, voir « Cassé ». Les deux hooks portent désormais le
  même bloc, au caractère près ; seule subsiste leur différence antérieure sur la lecture
  de `TASK_SECRET` (`.env.local` seul ici, `.env.local` puis
  `.env` là-bas). Le `CLAUDE.md` d'AutoSEO demandait explicitement un
  `git log origin/main..main` à la main avant de déplacer `main` : c'est fait pour soi
  désormais, à l'ouverture.
- **Échec ouvert, comme pour la lecture des tâches CRM.** Aucun `git fetch` n'est déclenché :
  le réseau au démarrage, c'est une session qui n'ouvre pas quand le remote tousse. Trois
  cas dégradés, chacun avec sa phrase, et la session continue dans tous :
  référence distante introuvable, comparaison impossible, référence non rafraîchie depuis
  plus d'un jour (l'écart est alors annoncé, pas tu).
- **La référence d'amont n'est pas codée en dur sur `origin/main`.** L'amont configuré de la
  branche d'abord, `origin/<branche>` ensuite, `origin/main` en dernier repli — sans quoi le
  compte serait faux dès qu'on travaille ailleurs que sur `main` — sur `developpement`, par exemple.
- **Sept cas vérifiés** dans des dépôts jetables, pas seulement le cas passant : sans remote,
  clone neuf, trois commits en avance, référence vieillie de neuf jours, trace de synchro
  absente, tout poussé, douze commits (troncature à dix).

## Cassé

- **Cette session a débordé sur AutoSEO : deux commits écrits hors du dépôt où elle était
  enracinée.** Le report du hook d'abord, puis l'inscription des URL Notion des deux notes
  du jour. Les deux ont été faits d'ici, dans le dépôt voisin, contre la règle « une session
  par dépôt — tout doit être distinct » : ni la session, ni le contexte, ni les fichiers
  touchés, ni les commits, ni les notes ne doivent traverser. Ce qu'il fallait faire :
  terminer ici, puis rendre la main avec la consigne prête à coller pour une session
  AutoSEO, qui aurait écrit sa propre note. AutoSEO a inscrit la provenance de son côté
  (`docs/journal/2026-09-19-provenance-des-deux-commits.md`, piège en section 5 de son
  handoff) ; sans cela, deux commits y racontaient un travail dont aucune de ses notes ne
  parlait, et le raisonnement n'était retrouvable que depuis ce dépôt-ci.
- **Première version : fausse alerte « périmée » sur un clone neuf.** Elle ne regardait que
  la date de `FETCH_HEAD`, qu'un clone n'a pas encore — le cas 2 du banc d'essai l'a montré
  avant tout commit. La fraîcheur se lit maintenant sur la plus récente de trois traces :
  `FETCH_HEAD` (fetch), le fichier de la référence distante (push), `packed-refs` (clone).
  Une alerte qui se trompe est une alerte qu'on cesse de lire.

## Reste

- Les deux fichiers image de l'arbre de travail traînent depuis la session précédente :
  `public/images/realisations/playlists-auditeurs.jpg` modifié et
  `playlists-auditeurs-MSI.jpg` non suivi. Toujours pas commités, toujours pas les miens.
