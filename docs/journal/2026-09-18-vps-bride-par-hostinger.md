---
date: 2026-09-18
projet: AInspiration
ou: Claude Code
type: Incident
notion: non
prochaine-action: Relancer audityo-postgres et borner les reprises de /root/audityo/health-check.sh, avant de lever le bridage
---

## Fait

Diagnostic parti d'un symptôme trompeur : « https://brasspat042026.distr-action.com/
ne démarre plus ». Le conteneur n'était pas tombé, et le `401` de l'URL est la basic
auth Traefik configurée sur ce domaine — pas une panne. La page était **lente**, pas
éteinte.

**Le VPS entier est bridé par Hostinger depuis le 17/09.**

Depuis la machine, au 18/09 16:32 UTC : steal **91,6 %**, user 2,7 %, sys 3,5 %,
idle 0 %. Confirmé deux fois, par `vmstat` et par un delta de `/proc/stat`. RAM
(3,1 Go sur 16), disque (50 %) et iowait (0 %) sont sains : c'est purement du CPU
refusé par l'hyperviseur.

L'historique de l'API Hostinger donne la décision :

```
17/09 08:00 UTC   ct_set_limits
17/09 09:00 UTC   ct_set_limits
17/09 10:00 UTC   ct_set_limits
17/09 11:00 UTC   ct_set_limits
17/09 12:41 UTC   ct_restart     <- exactement le boot actuel (uptime -s = 12:42:02)
```

Ça touche **tout le VPS** — AInspiration, Audityo, CommunityOS, n8n, les 45 conteneurs.
Pas seulement brasspat.

### Ce que `sysstat` a permis d'établir

`sysstat` tourne sur la machine et garde l'historique **d'avant le reboot**, que je
croyais perdu. Les fichiers `/var/log/sysstat/sa10` à `sa18` couvrent le 10 au 18/09.
C'est cette source qui a tout tranché, et qui a corrigé deux hypothèses fausses.

Deux paliers, pas une dérive :

| Moment | %user | %system | %idle |
|---|---|---|---|
| 15/09 jusqu'à 05:20 | 4 | 3 | 90 |
| **15/09 05:30** | 13,6 | 13,3 | 70 |
| 15/09 05:40 → 17/09 04:40 | **16** | **16** | 64 |
| **17/09 04:50** | 37,7 | 37,8 | 19,6 |
| 17/09 05:30 → 08:00 | **44** | **44,6** | 6,7 |
| 17/09 08:10 (Hostinger pose les limites) | 36,6 | 35,7 | 6,1 — steal passe de 5 à 21 % |
| **17/09 après le reboot, et 18/09** | **2,5** | **1,9** | — steal 81-93 % |

La nature de la charge, via `sar -w` :

| | proc/s | cswch/s |
|---|---|---|
| 14/09 (référence saine) | 41,3 | 4 032 |
| 17/09 04:00 (avant le palier) | 41,1 | 7 100 |
| 17/09 05:30 (palier haut) | 44,9 | **19 900** |
| 18/09 (aujourd'hui) | 26,0 | **2 116** |

**Le `proc/s` ne bouge pas.** Ce n'était donc pas une création massive de processus :
c'est le **taux de changements de contexte** qui triple. Signature de threads qui
tournent à vide ou se disputent un verrou, pas de forks.

**La cause est morte au reboot du 17/09 12:42 et n'est pas revenue en 27 h**, y compris
en retraversant ce matin les créneaux 04:50 et 05:30. Aucun conteneur n'a été créé aux
heures des deux paliers, et tous les `RestartCount` sont à 0.

**Ce que c'était reste inconnu.** sysstat ne garde pas d'historique par processus, et
les compteurs internes ont été remis à zéro par le reboot.

### La boucle Audityo

`audityo-postgres` s'est arrêté proprement le 17/09 à 13:27. Le `restart: always` a
ensuite buté sur `AlreadyExists: task already exists` — une tâche fantôme containerd,
pas une corruption. Les données sont intactes dans le volume nommé `audityo_audityo-pgdata`.

Mais `/root/audityo/health-check.sh`, en cron toutes les 5 minutes, contient :

```bash
PG_OK=$(docker exec audityo-postgres pg_isready -U audityo 2>/dev/null | grep -c 'accepting')
if [ "$PG_OK" != "1" ]; then
  docker restart audityo-postgres 2>/dev/null
fi
```

Depuis 27 heures il retente un `docker restart` **toutes les 5 minutes**, qui échoue à
chaque fois. Le `2>/dev/null` fait que personne n'a rien vu. Le script n'a **aucun
recul ni compteur** : il rejouera la même boucle sur n'importe quelle panne durable.

Chaîne confirmée : `audityo-web` → `audityo-pgbouncer` → `audityo-postgres`. La base
d'Audityo est donc réellement injoignable — le « healthy » du conteneur web ne la teste pas.

### Deux hypothèses que j'ai émises puis retirées

- **« La charge s'aggrave en direct, load 20 → 49 »** : faux. C'étaient mes propres
  commandes de diagnostic. Entre 16:10 et 16:20, `%user` n'a bougé que de 2,32 à 2,82 —
  mais le steal a sauté de 82,9 à 92,1 et l'idle est tombé de 13 à 2,9. **Sous un plafond
  dur, quelques processus suffisent à faire exploser la charge moyenne**, sans que la
  consommation réelle augmente. La demande était plate toute la journée.
- **« Essaim de healthchecks auto-amplifiant »** : démenti par le `proc/s` plat à 41.
  Les `runc init` et `pg_isready` vus dans la file d'exécution étaient de l'activité
  normale, sur-interprétée. Aucune recréation de conteneur n'est donc nécessaire.

## Cassé

- **Le VPS tourne à ~9 % de sa capacité nominale.** Tous les services y sont lents.
- **`audityo-postgres` est à terre depuis le 17/09 13:27**, avec une boucle de reprise
  qui tourne toujours toutes les 5 minutes.
- **La base SQLite de n8n fait 993 Mo** (+13 Mo de WAL), sans aucun réglage de rétention
  dans l'environnement du conteneur, pour 47 909 exécutions. Coût de fond réel, mais ce
  n'est pas ce qui a provoqué le pic.

## Reste

- **Avant de lever le bridage** : relancer `audityo-postgres` et **borner les reprises**
  de `/root/audityo/health-check.sh`. C'est la seule pathologie encore vivante.
- Lever le bridage (Laurent le fait à la main côté Hostinger).
- **Surveiller après** : `sar -w` et `sar`. Empreintes à guetter — `cswch/s` durablement
  au-dessus de ~10 000, ou `user+sys` au-dessus de 40 %. Ce sont les signatures exactes
  des 15 et 17/09. sysstat collecte déjà, rien à installer. Le bridage date du 17/09 et
  a été découvert le 18 par hasard : c'est ce délai-là qu'il faut supprimer.
- Réduire le sondage `Chaque 5 min : vérifier file EN` de l'auto-blog Distr'Action
  (`QSzmS1gzyQjvCwtc`) à `*/30 * * * *` — 288 exécutions/jour pour constater une file vide.
- Configurer la rétention des exécutions n8n.

## Note de méthode

- **`docker stats` ment quand l'hôte est saturé** : il rapportait tous les conteneurs
  entre 50 et 130 % de CPU, impossible sur 4 cœurs. La mesure fiable est un delta de
  `cpu.stat` (`usage_usec`) par cgroup. De même, `ps %CPU` est cumulé sur la vie du
  processus et ne vaut rien sur les processus courts.
- **La charge moyenne n'est pas une mesure de consommation** sous plafond CPU. Elle
  compte les processus en attente ; avec 91 % de steal, elle monte sans que rien ne
  consomme davantage. Regarder `%user`/`%system`, jamais le load seul.
- **`sysstat` était là depuis le début.** Réflexe à garder : avant de conclure qu'un
  historique est perdu, vérifier `/var/log/sysstat/`.
