# ADR-004 — Le CRM n'est pas un produit en vente

**Date** : 2026-09-18
**Statut** : **acceptée**
**Décidée par** : Laurent

## Contexte

La page `/crm` affichait une grille tarifaire complète : **Essentiel 29 €** par utilisateur
et par mois, **Business 49 €**, **Enterprise sur mesure**, un **essai gratuit de 14 jours**,
et des arguments de vente — « 150+ intégrations », « applications mobiles iOS et Android ».

Aucun de ces éléments n'existe. Il n'y a ni intégrations au catalogue, ni application
mobile, ni facturation par utilisateur, ni la moindre capacité à servir un client externe.
Le CRM est l'outil interne qui sert tout le portefeuille Distr'Action.

Le même jour, un constat identique sur la **création visuelle** : une grille à 1 € l'image,
49 €/mois, 199 €/mois, sur une page orpheline. Et une troisième grille morte a été trouvée
en chemin, dans un composant que plus rien n'importait.

## Options examinées

| Option | Pour | Contre |
|---|---|---|
| A — Garder la grille comme « ballon d'essai » | Mesure l'intérêt du marché sans rien construire | Vend un produit inexistant : même faute que les faux témoignages d'ADR-001, en pire — ici on encaisserait |
| B — Retirer la grille, garder la page vitrine et la démo | Honnête ; le compte de démonstration remplit déjà le rôle de l'essai gratuit, et lui existe | Perd un argument « produit » de la vitrine |
| C — Construire réellement le SaaS | Un produit de plus | Aucun client sur l'offre de conseil ; ouvrir un second front sans avoir gagné le premier |

## Décision

**B.** Grille tarifaire du CRM retirée, essai gratuit de 14 jours retiré avec elle. `/crm`
reste une **page vitrine publique avec accès démo**. Même traitement pour la création
visuelle, qui **entre dans O3** quand elle est commandée.

La seule grille commerciale de référence reste O1–O5.

## Pourquoi

Une société qui vend de la conformité IA ne peut pas afficher un catalogue de produits qui
n'existent pas. C'est exactement la règle d'[ADR-001](ADR-001-aucune-preuve-fabriquee.md),
appliquée au commerce au lieu de la preuve sociale — et la faute serait plus lourde ici,
puisqu'un prix affiché appelle un paiement.

L'essai gratuit méritait sa propre ligne de raisonnement : il promettait une mise à
disposition qu'on ne sait pas servir, alors que **le compte de démonstration public fait
déjà le travail et fonctionne réellement**. Remplacer une promesse par une chose qui
existe, c'est la même opération qu'au blog et sur la page d'accueil.

## Positions minoritaires

Aucune consignée. La grille n'avait pas d'auteur identifié au moment du retrait — elle
datait d'une phase où le CRM était envisagé comme produit, et personne ne l'a défendue.

## Conséquences

- Le CRM reste **un seul CRM pour tout le portefeuille**, prospects des autres projets
  compris (Audityo notamment), distingués par le champ `source`.
- Le cloisonnement démo / données réelles devient une exigence de premier ordre : les
  identifiants de la démo sont **publics**, affichés sur `/login`. Tout ce qui n'est pas
  cloisonné est lisible par n'importe quel visiteur. Ne jamais « simplifier » `ownerScope()`.
- Le module LinkedIn du CRM, lui, n'a jamais rien publié — 0 ligne pour 1 263 lignes de
  code, 12 endpoints, un `client_secret` et un callback OAuth public à maintenir. Son
  retrait est tranché mais **ordonné** : après que CommunityOS ait prouvé, jamais avant
  (chantier C11).

## Révision

Si un client demande explicitement à utiliser le CRM et accepte d'en payer le
développement. Pas sur une intuition de marché, et pas avant que l'offre de conseil ait
ses premiers clients.
