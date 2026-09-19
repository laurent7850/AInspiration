---
date: 2026-09-19
projet: AInspiration
ou: Claude Code
type: Décision
notion: https://app.notion.com/p/3e0fb662f4aa81a8a713c18346825dbd
synchro: 2026-09-19
prochaine-action: Vérifier en fin de prochaine session que `git log origin/main..main` est bien vide avant de rendre la main
---

## Fait

- **Les trois commits Cowork du 18/09 sont poussés** (`6d32bde`, `b50eefe`, `7979c79` →
  `origin/main` à `7979c79`). Ils n'existaient que dans le clone local depuis la veille :
  dépôt à passer en privé, trois notes du 18/09 remontées dans Notion, deux lignes du
  handoff qui se contredisaient. Avance rapide, aucune divergence, que de la documentation.
- **Règle inscrite : Cowork n'écrit plus dans ce dépôt** (`HANDOFF.md` section 6). Il n'a
  pas d'identifiants GitHub — ses commits restent locaux, sans jamais partir, et le premier
  réalignement de `main` les emporterait sans un mot. Cowork réfléchit, laisse ses notes
  dans Notion et dicte ; Claude Code écrit, commite et pousse.
- **Piège ajouté** (section 5) : avant de déplacer `main` — réalignement, `reset`, `rebase`,
  bascule de branche — lancer `git log origin/main..main` et pousser ce qui s'y trouve.
  C'est le geste qui aurait rendu la journée de sursis impossible.
- **« Pousser » entre dans le rituel**, quatrième geste, aux trois endroits qui le décrivent :
  `HANDOFF.md` section 6, `.claude/commands/handoff.md` et `CLAUDE.md`. La commande disait
  jusqu'ici l'inverse — « ne pousse pas sans qu'on te le demande ».

## Cassé

- **La commande `/handoff` n'avait pas le droit de pousser.** Son `allowed-tools` listait
  `git status`, `log`, `add`, `commit`, `diff` — pas `push`. L'étape 4 aurait buté sur une
  demande d'autorisation à chaque fin de session. `Bash(git push:*)` ajouté. Une consigne
  écrite dans une commande ne vaut que si la commande a les droits de l'exécuter.
- Les trois endroits décrivant le rituel ne bougeaient pas ensemble : `CLAUDE.md` annonçait
  « trois gestes » quand `HANDOFF.md` en comptait quatre. Corrigé dans la foulée — c'est
  exactement la contradiction que le commit `7979c79` de la veille venait de réparer
  ailleurs.

## Reste

- **Le hook `SessionStart` ne signale pas les commits non poussés.** Il donne la branche,
  le HEAD et l'état de l'arbre de travail, mais pas l'écart avec `origin/main`. La règle
  repose donc encore sur la lecture du handoff, pas sur une vérification mécanique. Une
  ligne dans `.claude/hooks/session-start.mjs` fermerait le sujet pour de bon.
- Deux fichiers image non commités traînent dans l'arbre de travail
  (`public/images/realisations/playlists-auditeurs.jpg` modifié,
  `playlists-auditeurs-MSI.jpg` non suivi). Ils viennent d'une autre session, je n'y ai pas
  touché et ne les ai pas commités — à trancher par qui les a produits.
