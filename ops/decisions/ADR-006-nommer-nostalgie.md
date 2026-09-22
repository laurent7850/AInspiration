# ADR-006 — Nostalgie est nommée, l'anonymat reste le défaut

**Date** : 2026-09-22
**Statut** : **acceptée**
**Décidée par** : Laurent, en session, confirmée trois fois

## Contexte

La règle n°2 du `HANDOFF.md` était écrite « non négociable » : *« Clients anonymisés par
défaut. Le nom de la radio, en particulier, ne sort jamais. »* Elle a été durcie après le
19/09, où une capture non anonymisée est repartie trente minutes en production.

En face, un fait que [ADR-001](ADR-001-aucune-preuve-fabriquee.md) a créé sans jamais le
combler : **le site n'a plus aucune preuve sociale.** La purge du 29/08 a retiré les faux
témoignages ; rien de vrai n'est venu à leur place. Les quinze réalisations montrent du
travail sans montrer que quelqu'un l'a voulu.

Et les meilleurs chiffres du portefeuille appartiennent précisément à la relation qu'on
s'interdisait de nommer : `1 h → 13 s`, `1 h → 70 s`, `2 h → 3 min`, sur trois fiches.

Fait établi en séance, et qui change la nature de la relation : **Laurent est prestataire
indépendant chez Nostalgie depuis vingt-cinq ans.** Ce n'est pas un bénéficiaire de travail
offert, c'est sa relation commerciale la plus ancienne.

## Options examinées

| Option | Pour | Contre |
|---|---|---|
| A — Anonymat total maintenu | Aucun risque relationnel ; la règle reste simple | La vitrine continue de ne rien prouver, et les trois meilleures fiches restent muettes |
| B — Nommer **uniquement** sur accord écrit du client | La preuve est incontestable et opposable | Repousse tout à l'obtention des accords, que personne n'a encore demandés |
| C — Nommer Nostalgie maintenant, sur décision de Laurent, l'anonymat restant le défaut ailleurs | Débloque immédiatement la preuve la plus forte | L'accord de publication appartient au client ; il est ici présumé, pas écrit |

## Décision

**C.** Nostalgie est nommée sur ses trois fiches, avec un lien vers `nostalgie.be`, **sans
logo** (restriction explicite de Laurent).

**L'anonymat reste le défaut pour tous les autres.** Le mécanisme n'est pas déclaratif, il
est technique : le champ `clientUrl` de `src/data/realisations.ts` matérialise l'accord, et
l'interface n'affiche le commanditaire **que** s'il est présent. Une fiche sans ce champ
reste anonyme sans qu'on ait à y penser.

## Pourquoi

Parce qu'une vitrine sans nom ne vend pas. Un prospect qui lit « un groupe radio
francophone » n'a aucun moyen de vérifier quoi que ce soit — la fiche lui demande de croire
sur parole, ce qui est exactement ce qu'ADR-001 voulait éviter.

Et parce que le risque n'est pas symétrique ici : Nostalgie est un client de vingt-cinq ans,
pas un inconnu. Laurent connaît la maison et en assume la décision.

Le choix de faire porter l'accord par un **champ de données** plutôt que par une consigne
écrite est délibéré : la règle précédente était « non négociable » et a quand même été
enfreinte le 19/09. Une garde qu'on peut oublier n'est pas une garde.

## Positions minoritaires

**La mienne, et elle est maintenue** : l'accord de publication appartient au client, pas au
prestataire. En l'absence de confirmation écrite de Nostalgie, ce nom est publié sur la
seule décision de Laurent. J'ai soulevé le point deux fois ; il a tranché deux fois. Si une
confirmation écrite arrive, elle doit être notée ici — elle vaudra mieux que « décidé en
session » le jour où quelqu'un posera la question.

## Conséquences

- La règle n°2 du `HANDOFF.md` est réécrite : l'anonymat reste le défaut, l'exception est
  nommée et datée. Elle ne peut pas rester en l'état pendant que le site publie le nom.
- **Le logo reste interdit.** Nommer n'est pas utiliser une marque.
- **Mamie l'IA n'entre pas dans `/realisations`.** Première animatrice radio générée par IA
  en Europe, lancée le 26/08/2024 de 19h à 20h, couverte par quatre médias belges — mais
  **aucun de ces articles ne nomme de prestataire externe**, et L'Avenir cite le coanimateur
  disant « nos équipes techniques ont créé de toutes pièces une mamie ». Laurent indique
  qu'il était seul derrière cette formule, qu'il a proposé la solution, créé la voix et
  produit l'émission. Ce n'est pas une prestation commandée : cela relève du **parcours**,
  donc de `/a-propos`, où la partie publique est corroborée par la presse et où le rôle
  personnel est assumé comme tel. L'écrire en réalisation cliente ferait pointer une preuve
  qui contredit ce qu'elle prouve.
- L'occasion de traiter le chantier **C23** : remplacer la chronologie 2019–2026 de
  « Notre Histoire », qui contredit le `foundingDate: "2025"` du JSON-LD, par des faits
  datés et sourçables.
- Le nom apparaît dans le bloc SEO serveur (qui lit la même clé de traduction) ; **le lien,
  lui, n'est rendu que dans l'interface**. Choix délibéré : le faire descendre côté serveur
  imposerait de dupliquer l'URL dans les locales et de toucher `routes/seo.js`, fichier à
  pièges. À reconsidérer si d'autres clients sont nommés.

## Révision

Immédiate et sans discussion si Nostalgie demande le retrait. Sinon, à l'arrivée d'accords
écrits d'autres clients — le champ `clientUrl` est déjà prêt à les accueillir.
