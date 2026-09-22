# En attente de validation humaine

> Toute action irréversible ou touchant la production s'inscrit ici **au lieu**
> de s'exécuter : déploiement, envoi d'e-mail à des clients, migration de base,
> publication, dépense, activation d'un workflow.
>
> Règle *fail secure* de la baseline Distr'Action : dans le doute, refuser plutôt
> que permettre. Une session qui bute sur une de ces actions s'arrête et le dit.

| Demandé le | Chantier | Action attendue | Pourquoi ça ne peut pas être automatique | Statut |
|---|---|---|---|---|
| 2026-09-22 | C3 | **Révoquer la clé OpenRouter en clair dans `n8n-workflows/README.md`** (4 occurrences, fichier suivi par git, dépôt **public**), en créer une neuve côté OpenRouter, la reporter en credential n8n, puis retirer la valeur du fichier. | Révoquer une clé coupe tout workflow n8n qui s'en sert encore : il faut savoir lesquels avant, et la remplacer dans le même geste. Et la rotation seule ne suffit pas — la valeur reste dans l'historique git d'un dépôt public, la réécriture d'historique est une décision qui appartient à Laurent. | en attente |

**Statuts** : `en attente` · `validé le AAAA-MM-JJ` · `refusé le AAAA-MM-JJ (raison)`

Une ligne validée puis exécutée se déplace dans le journal du jour, pas ici.
