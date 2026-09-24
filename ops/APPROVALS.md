# En attente de validation humaine

> Toute action irréversible ou touchant la production s'inscrit ici **au lieu**
> de s'exécuter : déploiement, envoi d'e-mail à des clients, migration de base,
> publication, dépense, activation d'un workflow.
>
> Règle *fail secure* de la baseline Distr'Action : dans le doute, refuser plutôt
> que permettre. Une session qui bute sur une de ces actions s'arrête et le dit.

| Demandé le | Chantier | Action attendue | Pourquoi ça ne peut pas être automatique | Statut |
|---|---|---|---|---|
| 2026-09-22 | C3 | **Revoquer la cle « Chat distr'action 2026 »** dans OpenRouter (un clic, Delete sur la ligne), puis je retire ses trois occurrences de `n8n-workflows/README.md`. | **Mesure le 24/09 : la revocation ne casse rien.** Aucun des 13 conteneurs porteurs d'une cle OpenRouter ne l'utilise, ni le shell de Laurent, ni le bundle de production ; dernier usage il y a 8 mois. La reserve d'origine — « revoquer coupe les workflows qui s'en servent » — est levee. Reste que supprimer une cle est irreversible et appartient au titulaire du compte. | **en attente d'un clic** |

**Statuts** : `en attente` · `validé le AAAA-MM-JJ` · `refusé le AAAA-MM-JJ (raison)`

Une ligne validée puis exécutée se déplace dans le journal du jour, pas ici.
