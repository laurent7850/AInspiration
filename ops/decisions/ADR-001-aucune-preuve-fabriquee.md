# ADR-001 — Aucune preuve fabriquée

**Date** : 2026-08-29 (appliquée par purges les 2026-08-29, 09-01 et 09-08)
**Statut** : **acceptée**
**Décidée par** : Laurent, après constat sur le site en production

## Contexte

Le site affichait des clients qui n'existent pas. Témoignages nominatifs (Thierry, Sophie,
Marc), sociétés inventées (CommerceXpress, TechnoServic, MobiliFrance, MediPharma), logos,
étoiles d'avis avec un schéma `Review`/`AggregateRating`, et des statistiques agrégées
(« 50+ PME accompagnées », « 98 % de satisfaction »).

Les faits au moment de la décision : **aucun client réel**. Aucune de ces preuves n'avait
de source. Le blog en portait autant que les pages : sur 93 articles scannés, **43 ont dû
être corrigés** — faux personas, « nos clients PME constatent +35 % », citations d'études
attribuées à McKinsey, Gartner, Forrester, Salesforce, HubSpot, qu'aucune de ces maisons
n'a publiées.

## Options examinées

| Option | Pour | Contre |
|---|---|---|
| A — Garder, en étiquetant « exemple » en petit | Rien à réécrire, la page reste « vendeuse » | Un faux avis étiqueté reste un faux avis au sens de la directive Omnibus ; le schéma `Review` ne connaît pas l'étiquette |
| B — Tout retirer et ne rien mettre à la place | Honnête, immédiat | La page ne prouve plus rien du tout |
| C — Remplacer par des **scénarios assumés** et des **faits vérifiables** | Honnête et il reste quelque chose à montrer | Coûte une réécriture complète, pages et 93 articles |

## Décision

**C.** Aucune preuve fabriquée, nulle part. Les récits deviennent des « scénarios
illustratifs » explicitement étiquetés, les chiffres deviennent des objectifs (« jusqu'à… »,
« objectif type »), et les seules affirmations factuelles autorisées sont vérifiables :
délais de service, hébergement EU/RGPD, et le cas réel du site lui-même — blog auto-généré,
CRM maison, trois langues.

## Pourquoi

Deux raisons, et la seconde est la plus lourde.

D'abord le droit : faux avis et schéma `Review` sont interdits par la directive Omnibus,
transposée en Belgique, et exposent le domaine à une action manuelle Google.

Ensuite la cohérence du groupe. **Distr'Action vend de la conformité IA** — c'est l'objet
d'Audityo et de l'offre O5. Une société qui vend de la conformité ne peut pas fonder sa
propre vitrine sur des preuves inventées : le jour où un prospect le voit, ce n'est pas une
page qui tombe, c'est le pitch produit.

## Positions minoritaires

Aucune consignée. La règle n'a pas été contestée une fois posée.

## Conséquences

- Le prompt de l'auto-blog porte une règle anti-fabrication, et un **contrôle qualité**
  renvoie en `draft` tout article citant une source nominative ou formulant un résultat
  « constaté ». C'est ce filtre qui tient la règle dans la durée, pas la vigilance humaine.
- Tant qu'il n'y a pas de client réel consentant, le site n'aura **aucune** preuve sociale.
  C'est un coût commercial accepté.
- Le tarif fondateur (−20 % pour les trois premiers clients **en échange d'un témoignage**)
  est le mécanisme prévu pour sortir de cette situation par le haut.
- **Reste ouvert, relevé le 12/09 et jamais tranché** : la section « Notre Histoire » de
  `/a-propos` raconte une chronologie 2019–2026 (« Création d'AInspiration » en 2019,
  « Expansion internationale » en 2022) alors que le JSON-LD déclare
  `foundingDate: "2025"`. Les deux sont servis en clair aux robots, qui les recoupent.
  Soit la chronologie est réelle et `foundingDate` est faux, soit l'inverse → chantier C23.

## Révision

Elle ne se révise pas : c'est une règle, pas un arbitrage. Ce qui changera, c'est son
application — dès qu'un client réel accepte d'être cité, un témoignage véritable devient
possible, avec son consentement écrit.
