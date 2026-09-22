# Carnet de bord

Ce dossier est la **mémoire du projet entre deux sessions**. Une session Claude Code
oublie tout à sa fermeture ; ce qui est écrit ici lui revient à la suivante.

La règle : toute session commence par lire ce carnet et finit par l'écrire.

| Fichier | À quoi ça sert |
|---|---|
| `CONTEXTE.md` | Les chiffres et l'état courants. Le point de départ de toute analyse. |
| `BACKLOG.md` | Les chantiers ouverts, qui en est responsable, où ils en sont. |
| `journal/` | Un fichier par jour : ce qui a été décidé et fait. |
| `decisions/` | Les décisions structurantes et leur raisonnement (ADR). |
| `APPROVALS.md` | Ce qui attend un feu vert humain avant exécution. |

Tout est versionné dans git : l'historique, le diff et le retour arrière sont gratuits.

**N'y mets jamais** de secret, de clé, ni de donnée personnelle de client.

Commandes : `/direction:carnet etat` · `/direction:comite-de-direction <sujet>` · `/direction:chantier <id>`
