---
date: 2026-09-18
projet: AInspiration
ou: Claude Code
type: Incident
notion: non
prochaine-action: Ouvrir un ticket Hostinger en joignant les quatre ct_set_limits du 17/09 et la courbe CPU à 100 %
---

## Fait

Diagnostic parti d'un symptôme trompeur : « https://brasspat042026.distr-action.com/
ne démarre plus ». Le conteneur n'était pas tombé, et le `401` de l'URL est la basic
auth Traefik configurée sur ce domaine — pas une panne. La page était **lente**, pas
éteinte, et elle est revenue d'elle-même pendant la session.

**Le VPS entier est bridé par Hostinger depuis le 17/09.**

Trois mesures concordantes, prises depuis la machine :

| Mesure | Valeur |
|---|---|
| Load average (4 vCPU) | 20 → 22 → 49 en dix minutes |
| Steal time (`vmstat` **et** delta `/proc/stat`) | 91 % — user 2,9 %, idle 0 % |
| Steal cumulé depuis le boot | 90,6 % des 27 h d'uptime |
| RAM / disque / iowait | 3,1 Go sur 16 · 50 % · 0 % |

Ce n'est pas un pic : depuis le redémarrage du 17/09, la machine tourne en permanence
sur environ **9 % de ses 4 cœurs**. RAM, disque et I/O sont sains — c'est purement du
CPU refusé par l'hyperviseur.

L'historique de l'API Hostinger donne la décision et sa cause :

```
17/09 08:00 UTC   ct_set_limits
17/09 09:00 UTC   ct_set_limits
17/09 10:00 UTC   ct_set_limits
17/09 11:00 UTC   ct_set_limits
17/09 12:41 UTC   ct_restart     <- exactement le boot actuel
```

Et la courbe CPU vue par Hostinger :

- jusqu'au **15/09 ~06:00** : ~8,5 %
- **15/09 06:16** : marche nette à **34,5 %**, puis plat pendant deux jours
- **17/09 05:30 → 08:00** : 65 % → 85 % → 90 % → **100 %**
- 08:00 : Hostinger commence à poser des limites. Depuis, 99,8 % en continu.

Ça touche **tout le VPS** — AInspiration, Audityo, CommunityOS, n8n, les 45 conteneurs.
Pas seulement brasspat.

Côté charge, deux contributeurs identifiés :

- **n8n est le premier consommateur CPU cumulé** (23 485 s, le double du suivant). Sur
  les dernières heures il n'a exécuté **qu'un seul workflow** : « Distr-Action — Auto
  Blog » (`QSzmS1gzyQjvCwtc`), qui porte **deux** déclencheurs. Le second,
  `Chaque 5 min : vérifier file EN`, part 288 fois par jour et met 2 à 12 s à constater
  une file vide. C'est délibéré (file de reprise des traductions anglaises), mais c'est
  cher pour un no-op.
- **La file d'exécution est saturée de `runc init` et de `pg_isready`** : ~45 conteneurs,
  dont **12 PostgreSQL**, chacun relançant un exec de conteneur toutes les 10-30 s.
  C'est auto-amplifiant — plus la machine est lente, plus chaque healthcheck dure, plus
  ils coûtent collectivement.

## Cassé

- **Le VPS tourne à ~9 % de sa capacité nominale.** Tous les services y sont lents.
- **`audityo-postgres` est `Exited (128)` depuis le reboot du 17/09.** `audityo-web` est
  up et healthy, mais sa base est à terre depuis 27 h. Découvert en passant, non traité.

## Reste

- Ouvrir le ticket Hostinger. La limite est de leur côté : rien en interne ne la lèvera.
- **Faire baisser la demande avant**, sinon ils rebrideront : sondage de la file EN de
  5 min à 30-60 min, healthchecks PostgreSQL à 2-5 min au lieu de 10-30 s, élagage des
  exécutions n8n (47 909 enregistrées).
- Traiter `audityo-postgres`.
- **Non élucidé : la marche du 15/09 à 06:16** (8,5 % → 34,5 %). Le workflow de
  surveillance a été créé à 07:57 ce jour-là, donc *après* — ce n'est pas lui. Les
  compteurs internes ayant été remis à zéro par le reboot, l'historique d'avant n'est
  plus lisible depuis la machine. Seul Hostinger a encore cette donnée.
- Dette structurelle de fond : 12 instances PostgreSQL pour ~10 projets sur 4 cœurs.

## Note de méthode

`docker stats` **ment quand l'hôte est saturé** : il rapportait tous les conteneurs
entre 50 et 130 % de CPU, ce qui est impossible sur 4 cœurs. La mesure fiable est un
delta de `cpu.stat` (`usage_usec`) par cgroup sur 30 s. De même, `ps %CPU` est cumulé
sur la vie du processus et donne n'importe quoi sur les processus courts — c'est la
deuxième itération de `top -b` qui vaut quelque chose.
