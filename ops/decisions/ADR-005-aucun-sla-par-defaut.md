# ADR-005 — Aucun engagement de niveau de service par défaut

**Date** : 2026-09-18, complétée le 2026-09-22 (sort du document SLA v1.0)
**Statut** : **acceptée**
**Décidée par** : Laurent

## Contexte

La section 11 des CGV portait des engagements chiffrés : **99 % de disponibilité**,
**24 h** de délai, **5 jours ouvrés**, **4 h**. Elle renvoyait à un document autonome,
`SLA-AInspiration-v1.0-2026-04-04.md` (dépôt Paperclip, avril 2026).

Deux problèmes, de nature différente.

Le premier est factuel : ces chiffres décrivaient l'offre abandonnée le 16/09 — audit
gratuit, Pack Express — et contredisaient la grille O1–O5. Un prospect lisant les CGV avant
de signer y trouvait une prestation qui n'existe plus, avec une clause de responsabilité
sur un rapport qui ne se produit plus.

Le second est structurel, et c'est lui qui a fondé la décision : **un document SLA autonome
est, par construction, un engagement qui s'applique par défaut**. Sa seule existence
oblige, quelle que soit la prestation vendue.

## Options examinées

| Option | Pour | Contre |
|---|---|---|
| A — Réécrire le SLA sur la nouvelle offre | La continuité ; un document existe et rassure | Reconduit un engagement par défaut sur cinq prestations dont quatre sont ponctuelles — « 99 % de disponibilité » ne veut rien dire pour un atelier d'une journée |
| B — Vider la section 11 et **ne pas** rédiger de successeur | Chaque engagement se prend au devis, prestation par prestation, en connaissance de cause | Plus aucun engagement affiché — un prospect pourra le demander, il faudra répondre |
| C — Un SLA limité à O4 (le seul abonnement) | Engagement là où il a un sens | Suppose des chiffres que Laurent n'a pas encore fixés |

## Décision

**B**, avec **C** en réserve explicite.

La section 11 des CGV ne porte plus aucun chiffre, et dit :

> *« Aucun engagement de niveau de service ne s'applique par défaut en dehors de ce qui est
> écrit au devis. »*

Le renvoi au document SLA est retiré. Le **22/09**, le sort du document lui-même a été
tranché : **archivé sans successeur**, il n'est pas « à refaire ».

## Pourquoi

Parce que la prochaine action inscrite jusqu'au 22/09 — « refaire le document SLA » — était
fautive : elle demandait de reconstruire ce que la refonte contractuelle venait de
démonter, quatre jours plus tôt. C'est le genre d'erreur qu'une liste de tâches propage
sans qu'on la relise.

Et parce qu'un engagement de disponibilité n'a de sens que sur une prestation continue.
Sur O1, O2, O3 et O5 — un diagnostic, un atelier, un sprint, un audit de conformité — il
n'en a aucun : ce qui compte est une date de livraison, qui se fixe au devis. **O4 est la
seule prestation où un chiffre voudrait dire quelque chose**, et c'est pourquoi l'option C
reste ouverte plutôt qu'écartée.

## Positions minoritaires

Aucune consignée sur le fond. Le seul point de friction était de méthode : la position
antérieure supposait qu'un document contractuel obsolète se remplace, jamais qu'il se
supprime. C'est cette habitude, et non un argument, qui avait maintenu « refaire le SLA »
en prochaine action pendant quatre jours.

## Conséquences

- **Ce qu'un client obtient dépend désormais entièrement de la qualité du devis.** C'est le
  prix de cette décision : il n'y a plus de filet contractuel par défaut.
- Un SLA neuf ne se rédigera que **limité à O4**, avec des chiffres donnés par Laurent, et
  **la section 11 devra alors le référencer à nouveau** — sans ce renvoi, il ne s'applique
  pas. Ne pas en rédiger un sans cet arbitrage.
- **Le DPA, lui, n'est pas concerné et reste vivant** : la section 12 des CGV le référence
  toujours (« disponible sur demande à info@ainspiration.eu »), et ce renvoi n'a **pas**
  été retiré. Il porte sur l'article 28 du RGPD, pas sur l'offre commerciale — mais
  personne ne l'a relu depuis avril (chantier C12).
- Le fichier SLA vit dans le dépôt **Paperclip** : il ne se touche pas depuis une session
  AInspiration. Consigne prête dans `docs/chantiers/sla-obsolete-paperclip.md`.

## Révision

Si Laurent veut tenir des niveaux chiffrés sur O4, ou à la demande d'un premier client
sous abonnement. Dans les deux cas : document neuf, limité à O4, et section 11 modifiée
dans le même geste.
