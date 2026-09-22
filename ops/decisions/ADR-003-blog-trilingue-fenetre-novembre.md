# ADR-003 — Le blog reste trilingue, avec une fenêtre de décision datée

**Date** : 2026-09-16
**Statut** : **acceptée**
**Décidée par** : Laurent

## Contexte

Six mois de production sans jamais mesurer. Le seul contrôle existant vérifiait qu'un
article avait été **publié**, pas qu'il avait été **lu**.

Les chiffres, relevés dans la base SEOPilot (Search Console et GA4 y sont connectés) :

| | |
|---|---|
| Articles publiés (31 sujets × 3 langues) | 93 |
| Mots-clés positionnés | 18 |
| Impressions | 41 |
| Clics | **1** |
| Position moyenne | 41 |

Deux faits éclairent ces chiffres. D'abord les sujets du blog **ne se positionnent pas**
(« prompt ia », « bibliothèque de prompts » : positions 60 à 71) alors que les termes
commerciaux, eux, sont en page 1-2 (« audit ia gratuit » : 11, « audit ia pme » : 11) —
mais ce sont les **pages de service** qui les portent, pas les articles. Ensuite le blog
n'est indexable que depuis le **13/08/2026**, date du correctif de rendu serveur : il n'a
donc eu qu'un mois de chance réelle.

## Options examinées

| Option | Pour | Contre |
|---|---|---|
| A — Arrêter le blog | Libère le budget LLM et le temps de relecture | Un mois d'indexabilité ne suffit pas à conclure ; on jetterait 93 articles sur une mesure prématurée |
| B — Le réduire au français | Divise par trois le coût et la surface de panne | Les versions EN/NL existent déjà ; l'économie est marginale, le signal perdu ne l'est pas |
| C — Le garder en trois langues, avec un **critère et une date fixés d'avance** | Laisse au blog sa chance réelle, et protège de la tentation de déplacer la barre | Trois mois de plus à payer avant de savoir |

## Décision

**C.** Le blog reste en trois langues. Fenêtre de décision : **fin novembre 2026**, soit
trois mois pleins d'indexabilité. Critère fixé **d'avance** :

> **500 impressions et 15 clics sur 28 jours.** En dessous, changer de format ou arrêter.

Et, posée dans le même geste : **ce critère ne se renégocie pas après coup.**

Décision jointe : le **pool de sujets est réorienté** vers le terrain gagnable — audit IA,
PME, Hainaut, Bruxelles, Belgique, conformité EU AI Act — et abandonne les généralités
mondiales sur des termes où le domaine n'a aucune autorité.

## Pourquoi

Parce que la question n'était pas « le blog marche-t-il ? » mais « saurons-nous le dire ? ».
Six mois durant, la réponse était non : rien ne mesurait la lecture.

Un critère fixé après coup n'est pas un critère, c'est une justification. En écrivant le
seuil et la date **avant** d'avoir les chiffres, on s'interdit la sortie par le haut qui
consiste à trouver le résultat encourageant quel qu'il soit. C'est la partie de cette
décision qui vaut d'être conservée — les 500 impressions sont un ordre de grandeur, la
règle du « fixé d'avance » est le fond.

## Positions minoritaires

**Le maintien des trois langues est une décision de Laurent, prise contre l'analyse.** Les
termes anglais réellement accrochés — « ai aspiration », « automating your invoices in
talentia » — n'ont aucune valeur commerciale pour une société qui vend en Belgique
francophone. L'argument inverse, retenu : couper une langue avant la fin de la fenêtre
reviendrait à décider maintenant ce qu'on a justement choisi de décider en novembre.

## Conséquences

- Un **rapport SEO mensuel automatique** (workflow n8n `3q20oRVZK1YGGV6f`, script sur le
  VPS le 1er du mois à 7h) alimente la décision. Sans lui, novembre arriverait sans données.
- Le coût du blog continue de courir : appels LLM des trois langues, relecture des
  brouillons recalés par le contrôle qualité.
- **Corollaire opérationnel** : on ne touche pas aux auto-blogs avant fin novembre — les
  modifier reviendrait à déplacer la barre après coup. Cela gèle l'étape (3) du chantier
  C11 sur la communication multicanale.
- **Échéance non couverte par cette décision** : le pool de sujets s'épuise vers
  **février 2027**. La garde anti-redondance bloquera alors la republication sans remplir
  le pool, et ces semaines-là ne publieront rien (chantier C21).

## Révision

**Fin novembre 2026**, sur les chiffres du rapport mensuel. Trois issues : poursuivre,
changer de format, arrêter. Pas de quatrième.
