---
date: 2026-09-18
projet: AInspiration
ou: Claude Code
type: Incident
notion: https://app.notion.com/p/3dffb662f4aa81ffb09bcf32879b5c1a
prochaine-action: Attendre le signe de vie du lundi 22/09 7h ; son absence prouverait que la veille est morte
---

## Fait

**Résolu le jour même.** Diagnostic parti d'un symptôme trompeur — « brasspat042026
ne démarre plus » — qui a mené à un incident touchant tout le VPS.

### Le symptôme n'était pas le problème

Le conteneur `brasspat042026` n'était jamais tombé, et le `401` de son URL est la basic
auth Traefik configurée sur ce domaine. La page était **lente**, pas éteinte.

### Cause réelle : `dockerd` tournait en rond sur un cœur entier

Le VPS était bridé par Hostinger depuis le 17/09 (quatre `ct_set_limits` entre 08:00 et
11:00 UTC, puis `ct_restart` à 12:41), après que sa charge soit montée à 100 %. Steal à
91 % : la machine ne disposait plus que d'environ 9 % de ses 4 cœurs.

La charge venait de **`dockerd` lui-même**, à **103 % de CPU en continu** — quatre threads
en boucle. Les conteneurs, eux, ne consommaient que ~2 % de la machine à eux tous : c'est
cet écart (1,2 cœur introuvable dans les cgroups) qui a mis sur la piste.

Le déclencheur est une désynchronisation `dockerd` / `containerd` sur `audityo-postgres` :

```
Error setting up exec command: container <ID> is not running
cleanup: failed to delete container from containerd: NotFound
Cannot restart container: failed to create task: AlreadyExists: task <ID> already exists
```

Le démon croit que la tâche existe, containerd dit que le conteneur n'existe pas.

**Ce qui a transformé un incident ponctuel en 27 heures de cœur brûlé** :
`/root/audityo/health-check.sh`, en cron toutes les 5 minutes, contient

```bash
PG_OK=$(docker exec audityo-postgres pg_isready -U audityo 2>/dev/null | grep -c 'accepting')
if [ "$PG_OK" != "1" ]; then
  docker restart audityo-postgres 2>/dev/null
fi
```

Aucun recul, aucun compteur, et un `2>/dev/null` qui masque tout. Chaque tentative rejouait
le conflit et laissait le démon un peu plus bloqué.

### Ce que `sysstat` a montré

`sysstat` tournait déjà et garde l'historique **d'avant le reboot** (`/var/log/sysstat/sa10`
à `sa18`). C'est cette source qui a tout tranché.

| Moment | %user | %system | %idle |
|---|---|---|---|
| 14/09 (référence saine) | 4 | 3 | 90 |
| **15/09 05:30** — premier palier | 16 | 16 | 64 |
| **17/09 04:50** — second palier | 44 | 44,6 | 6,7 |
| 17/09 08:10 — Hostinger bride | 36,6 | 35,7 | steal 5 → 21 % |
| **18/09 après correctif** | **2-6** | **2-5** | **91-96** |

Et `sar -w` : le `proc/s` reste **plat à 41** pendant toute la montée, tandis que le
`cswch/s` triple (7 100 → 19 900). Ce n'était donc pas une création de processus mais des
threads tournant à vide — signature de `dockerd`, confirmée après coup.

### Le correctif, en trois temps

1. **Purger la tâche fantôme** : `docker rm -f audityo-postgres` puis `docker compose up -d`.
   Le volume nommé `audityo_audityo-pgdata` est préservé — `rm` sans `-v` n'y touche pas.
   **Nécessaire mais pas suffisant** : `dockerd` est resté à 103 % après, l'état bloqué
   survit à la disparition de sa cause.
2. **Activer `live-restore`** dans `/etc/docker/daemon.json` (sauvegarde en `.bak`), puis
   `systemctl reload docker` pour l'armer **sans** redémarrer, et vérifier
   `docker info --format '{{.LiveRestoreEnabled}}'` = `true` avant d'aller plus loin.
3. **`systemctl restart docker`** — avec `live-restore` armé, les 43 conteneurs ont continué
   de tourner. Filet de sécurité vérifié au préalable : tous ont une politique de
   redémarrage, donc même un échec de `live-restore` les aurait fait revenir seuls.

### Résultat

| | avant | après |
|---|---|---|
| `dockerd` | 103 % | **1,7 %** |
| `user + sys` | 32 % | **5-8 %** |
| `idle` | 65 % | **91-96 %** |
| load (1 min) | 2,03 | **0,28** |
| brasspat042026 | 1,28 s | **0,165 s** |

**Les deux paliers ont disparu**, y compris celui du 15/09 : `dockerd` était bien la cause
des deux. Sites vérifiés : ainspiration.eu 200 en 0,17 s, son blog 200 en 0,16 s,
audityo.eu 200 en 0,39 s, distr-action.com 301 en 0,24 s.

`live-restore` reste activé : un futur redémarrage du démon ne coupera plus les conteneurs.

## Cassé

- **`/opt/uptime-check.sh` n'a jamais envoyé une seule alerte de son existence.** Découvert
  en branchant la notification : il postait sur `http://localhost:5678`, or **n8n ne publie
  aucun port sur l'hôte**. La surveillance de 10 domaines était donc totalement muette
  depuis sa création. Corrigé le 18/09.
- **Sa liste de domaines était fausse** : `lartpero.be`, `seopilot.be`, `theevent-linkedin.be`
  et `enghien-rag.be` ne résolvent pas (domaines publics jamais mis en service), et
  `delijn.be` **appartient à un tiers**. Remplacée par les 17 domaines réellement déclarés
  dans Traefik.
- **La base SQLite de n8n fait 993 Mo** (+13 Mo de WAL) pour 47 909 exécutions, sans réglage
  de rétention. Coût de fond réel, sans rapport avec cet incident.

## Reste

- ~~Borner `/root/audityo/health-check.sh`~~ — **fait le 18/09** (voir ci-dessous).
- Configurer la rétention des exécutions n8n.
- Réduire le sondage `Chaque 5 min : vérifier file EN` de l'auto-blog Distr'Action
  (`QSzmS1gzyQjvCwtc`) à `*/30 * * * *`. 288 exécutions/jour pour constater une file vide —
  inefficace, mais **ce n'était pas la cause**.
- Surveiller : `sar` et `sar -w`. Empreintes — `user+sys` durablement au-dessus de 40 %, ou
  `cswch/s` au-dessus de 10 000. Le bridage datait du 17/09 et a été découvert le 18 par
  hasard ; c'est ce délai-là qui reste le vrai défaut.

## Le garde-fou posé dans la foulée

`/root/audityo/health-check.sh` réécrit et installé (sauvegarde `health-check.sh.bak-20260918`,
cron inchangé). Deux règles, écrites en tête du script pour qu'on ne les défasse pas :

1. **On ne retente jamais indéfiniment.** `MAX_TRIES=3` par cible, compteurs dans
   `/var/lib/audityo-health/`, remis à zéro dès le retour à la normale. Au-delà, un unique
   `ABANDON ... INTERVENTION MANUELLE REQUISE` avec la commande de réarmement, puis silence.
2. **On ne jette jamais la sortie d'erreur d'une reprise.** C'est ce `2>/dev/null` qui a
   coûté 27 heures.

Vérifié sur une copie isolée où toutes les commandes `docker` étaient remplacées par un
échec, sans rien toucher en production : sur 6 exécutions consécutives, chaque cible est
tentée exactement 3 fois, puis un seul message d'abandon. Appliqué à l'incident réel :
3 tentatives et une alerte explicite dans la demi-heure, au lieu de 324 tentatives muettes.

## La surveillance, mise en place dans la foulée

Laurent : « je ne veux plus de panne silencieuse, je veux être prévenu ». Trois briques,
toutes vérifiées de bout en bout (mails reçus).

**Le canal** — nouveau workflow n8n « Distr'Action — Alerte VPS (générique) »
(`cJP1FcQVkUwrBNht`), webhook `vps-alert` → Gmail. Créé à part plutôt que de détourner le
workflow uptime existant, dont le corps de message est codé en dur pour les sites down.

**`/opt/vps-watchdog.sh`** (cron `*/15`) — la veille qui manquait totalement. Surveille la
**machine**, pas les sites : steal > 20 % (détecte un bridage hébergeur), user+sys > 50 %,
un processus au-dessus de 80 % (aurait nommé `dockerd`), disque > 85 %, mémoire < 10 %, et
tout conteneur à terre malgré un `restart=always` (aurait attrapé `audityo-postgres`).
Chaque seuil est calé sur quelque chose qui s'est réellement produit.

**`health-check.sh`** — son `ABANDON` envoie désormais un mail contenant la marche à suivre
complète, y compris la commande de réarmement.

**`/opt/uptime-check.sh`** — réécrit : URL corrigée, 17 vrais domaines, `401` et `307`
reconnus comme sains, fenêtre de silence par domaine et message de retour à la normale.

Copies de référence dans `docs/ops/vps/` — la baseline de sécurité exige qu'un runbook
n'existe pas uniquement sur le serveur qu'il surveille.

**Le piège rencontré en chemin** : bash ne développe pas les `
` entre guillemets doubles,
et `jq --arg` prend la valeur telle quelle — les mails affichaient des `
` littéraux. La
correction est `printf '%b'` **avant** `jq`, pas un `gsub` côté jq : les niveaux
d'échappement bash/jq/regex ne s'alignent pas. Essayé, mesuré, corrigé.

## Quatre erreurs commises en route, et ce qu'elles apprennent

1. **« La charge s'aggrave en direct, load 20 → 49 »** — c'étaient mes propres commandes de
   diagnostic. Sous plafond CPU, la charge moyenne compte les processus en attente : elle
   monte sans que rien ne consomme davantage. **Regarder `%user`/`%system`, jamais le load seul.**
2. **« Essaim de healthchecks auto-amplifiant »** — démenti par le `proc/s` plat à 41. Les
   `runc init` vus dans la file d'exécution étaient de l'activité normale, sur-interprétée.
3. **« La charge est retombée à 4,4 %, sous la référence saine »** — artefact du bridage.
   Avec 91 % de steal, `user+sys` **ne peut pas** dépasser ~9 %, quelle que soit la demande.
   **Un plafond masque le travail, il ne prouve pas son absence.** C'est cette erreur qui a
   failli faire conclure trop tôt.
4. **« La boucle Audityo pèse 0,25 % de la machine »** — estimé au nombre de tentatives, sans
   voir que chacune laissait le démon en vrille. Elle était la source de charge principale.

## Note de méthode

- **`docker stats` ment quand l'hôte est saturé** : il rapportait tous les conteneurs entre
  50 et 130 % sur 4 cœurs. Mesure fiable : delta de `cpu.stat` (`usage_usec`) par cgroup.
  `ps %CPU` est cumulé sur la vie du processus et ne vaut rien sur les processus courts.
- **Comparer la somme des cgroups au total système.** C'est l'écart — 2 % côté conteneurs
  contre 32 % côté machine — qui a désigné un processus de l'hôte, donc `dockerd`.
- **`sysstat` était là depuis le début.** Avant de conclure qu'un historique est perdu,
  vérifier `/var/log/sysstat/`.
- **Un `2>/dev/null` dans un script de surveillance** a caché 324 échecs consécutifs.
