# ADR-002 — La grille O1–O5 est la seule stratégie commerciale

**Date** : 2026-09-13, complétée le 2026-09-16 (abandon explicite de l'offre précédente)
**Statut** : **acceptée**
**Décidée par** : Laurent

## Contexte

Deux offres coexistaient, et l'une n'était écrite nulle part de façon opposable.

D'un côté, les décisions des comités de direction consignées dans Notion : **audit IA
gratuit comme produit d'appel** et **Pack Automatisation Express à 1 490 €**. De l'autre,
le volet 2 du plan de lancement, qui proposait cinq prestations chiffrées.

Les faits : **aucun client**, et donc aucune donnée pour départager les deux. Ce qui était
mesurable, en revanche, c'est que le produit d'appel gratuit tournait depuis des mois sans
rien produire, et que l'audit gratuit était un livrable complet — deux jours de travail —
offert à des prospects non qualifiés.

## Options examinées

| Option | Pour | Contre |
|---|---|---|
| A — Garder l'audit gratuit + Pack Express | Barrière d'entrée nulle, déjà outillé (pipeline n8n) | Un livrable de deux jours offert à des inconnus ; n'a rien converti ; le « gratuit » décrédibilise une offre de conseil |
| B — Grille O1–O5, un prix affiché par prestation | Chaque prestation se vend pour ce qu'elle coûte ; lisible ; le prix fait le tri | Barrière d'entrée réelle ; il faut réécrire tout le site |
| C — Les deux en parallèle | Personne ne perd son offre | Le site aurait raconté deux stratégies — exactement l'incohérence qu'on cherchait à supprimer |

## Décision

**B.** La grille **O1–O5** est la seule référence commerciale, et **le seul temps offert
est le rendez-vous de découverte de trente minutes**.

| | | |
|---|---|---|
| O1 | Diagnostic IA, deux jours | 2 400 € |
| O2 | Atelier, demi-journée / journée | 900 € / 1 500 € |
| O3 | Sprint automatisation | 3 500 – 6 000 € |
| O4 | Pilote IA, abonnement | 590 €/mois, engagement 6 mois |
| O5 | Check AI Act | 990 € |

Tarif fondateur : **−20 % pour les trois premiers clients**, en échange d'un témoignage.
Objectif : **3 000 €/mois**.

## Pourquoi

Parce que le gratuit ne qualifiait rien. Un audit offert attire des curieux, pas des
acheteurs, et il consomme le seul stock réellement rare du projet : le temps de Laurent.
Un prix affiché fait ce tri avant le premier rendez-vous.

Et parce qu'une offre doit tenir dans une phrase. « Audit gratuit puis peut-être un pack »
n'en est pas une ; cinq prestations nommées et chiffrées, si.

Le **16/09** a tranché ce qui restait : les décisions Notion sont **abandonnées**, et non
« mises en veille ». La nuance compte — tant qu'elles étaient en veille, elles revenaient
dans les textes, et c'est exactement ce qui s'est passé jusqu'au 18/09.

## Positions minoritaires

Les comités de direction consignés dans Notion défendaient l'audit gratuit et le Pack
Express. Leur argument — abaisser la barrière d'entrée pour obtenir les dix premiers
clients — n'a jamais été démenti par des chiffres : il n'a simplement rien produit dans
les mois où il était en place. **Si la grille O1–O5 ne convertit pas davantage, c'est cet
argument-là qu'il faudra réexaminer, pas l'inventer à neuf.**

Renoncement daté du même jour, et qui appartient à la même famille : le **Pool d'experts IA
de Start IA**, à réexaminer une fois des missions clients livrées.

## Conséquences

- Tout le site a dû être réécrit, **textes contractuels compris** : CGV, politique de
  confidentialité, grilles du CRM et de la création visuelle, un article de blog retiré
  avec un 301. Fait et vérifié le 18/09, zéro occurrence en HTML brut sur quinze URL des
  trois langues.
- Deux décisions en découlent directement : [ADR-004](ADR-004-crm-pas-un-produit.md) et
  [ADR-005](ADR-005-aucun-sla-par-defaut.md).
- Le pipeline d'audit automatisé perd sa raison d'être commerciale. Il n'a pas été
  démonté.
- **Le tunnel d'entrée est le rendez-vous de découverte — et il est actuellement muré** :
  `VITE_BOOKING_URL` est vide en production, donc les boutons sont masqués (chantier C18).

## Révision

À l'obtention des trois premiers clients, ou si l'objectif de 3 000 €/mois n'est pas
approché après une campagne LinkedIn menée à son terme. Les prix eux-mêmes se réexaminent
dès que le coût de revient sera chiffré — il ne l'est pas, et c'est le trou principal de
`ops/CONTEXTE.md`.
