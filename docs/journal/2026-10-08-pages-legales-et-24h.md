---
date: 2026-10-08
projet: AInspiration
ou: Claude Code
type: Décision
notion: non
prochaine-action: Soumettre le formulaire d'accès Community Management de LinkedIn avant le 9 octobre
---

## Fait

- **Pages légales indexables** (décision de Laurent). Mentions légales, CGV et CGU
  portaient un `noindex` posé par la page après chargement, alors que le serveur les servait
  indexables et que le sitemap les listait : signal contradictoire. Retiré. Vérifié dans un
  navigateur : `index, follow` sur `/mentions-legales` et `/en/cgv`.
- **Plus aucune promesse de réponse sous 24 h** (décision de Laurent) : sous-titre de
  `/pme-hainaut-bruxelles`, FAQ de `/contact` et description de `/contact` pour Google, en
  fr/en/nl, plus la description de secours du serveur. La question de la FAQ demandait « en
  combien de temps » : reformulée en « Comment ma demande est-elle traitée ? », la réponse
  garde le créneau de trente minutes et la réponse par e-mail ou téléphone.
- Gardés volontairement : les « 24h/24 » des chatbots (disponibilité d'un assistant, pas un
  engagement de Laurent) et les « 24 heures » de conservation des données LinkedIn dans la
  politique de confidentialité (règle RGPD).
- L'accusé de réception n8n du formulaire de contact (`wZuJtzIyeU4aVK4g`) ne promettait aucun
  délai (« dans les plus brefs délais ») : rien à changer.
- Déployé (215/215 sur le CDN, conteneur recréé), vérifié dans un navigateur sur six pages.

## Cassé

- **`/audit` affichait « 50+ — PME accompagnées »**, chiffre inventé — la règle « aucune
  preuve fabriquée » du 29/08 le cite pourtant nommément ; il avait échappé à la purge.
  Avec lui, « 24h — Délai de livraison », reste de l'audit gratuit abandonné. Remplacés par
  des faits que le site affirme déjà : 30 min de rendez-vous de découverte, 0 €, et 2 400 €
  pour le Diagnostic IA si l'on va plus loin.
- **`/recommandations`** (et le composant d'analyse) affichait « 24h » sous le libellé « Pour
  en parler trente minutes » : le défaut corrigé à l'accueil le 26/09, resté ailleurs.
  Passé à « 30 min », comme à l'accueil.

## Reste

- **Pages `/audio` et `/video` conservées telles quelles, décision de Laurent** : ces
  services existent, vendus via distr-action.com. Leurs chiffres (« 24h » de livraison,
  « -70 % » vs studio) restent en place. Ne pas proposer à nouveau de les retirer ni de les
  rediriger.
