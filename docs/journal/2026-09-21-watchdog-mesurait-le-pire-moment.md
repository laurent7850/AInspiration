---
date: 2026-09-21
projet: AInspiration
ou: Claude Code
type: Incident
notion: non
prochaine-action: Vérifier dans /var/log/vps-watchdog.log que plus aucune ligne « steal au-dessus du seuil » n'apparaît sur 24 h
---

## Fait

Alerte reçue à 01h30 : « L hébergeur bride la machine (steal 29 %) », avec
`x2golistsession` à 90 % en tête des processus. Deux autres mails la même nuit
(41 % à 21h00, retour à la normale à 23h45). La machine allait bien : c'est la
sonde qui mesurait mal, de deux façons indépendantes.

**1. Le processus accusé n'existait pas.** `contexte_cpu()` listait les processus
avec `ps -eo pcpu --sort=-pcpu`. Le `%CPU` de `ps` est cumulé sur la *vie* du
processus : pour un processus né pendant la mesure (`ELAPSED 0`), c'est une
division par presque zéro. Le mail de 21h00 le démontre tout seul — `ps` y figure
**lui-même à 200 %**, et `runc:[2:INIT]` à 100 %, tous avec `ELAPSED 0`. Le seul
vrai processus x2go de la machine, `x2gocleansessions`, est à 0,2 % cumulé sur
trois jours. La liste envoyait sur une fausse piste à chaque alerte. C'est le
piège n°3 de `vps-cpu-mesure-sous-plafond`, que le script reproduisait.

**2. La sonde échantillonnait les pires secondes de la minute.** Mesure seconde
par seconde sur plusieurs frontières de minute : le steal de cette machine est
confiné aux **secondes 01 à 05 de chaque minute** — 0 à 2 % le reste du temps,
5 à 64 % pendant ces quatre secondes.

```
06:49:59  st=0
06:50:00  st=9     ← frontière de minute
06:50:01  st=41
06:50:02  st=63
06:50:03  st=64
06:50:04  st=41
06:50:05  st=37
06:50:06  st=21
06:50:07  st=6
  ...     st=1     (le reste de la minute)
```

Or cron lance le watchdog à `:00:00`, et `vmstat 5 3` retenait comme premier
échantillon les secondes 0 à 5 — exactement la fenêtre du pic — puis le moyennait
avec 5 secondes calmes : `(45+2)/2 ≈ 23 %`, juste au-dessus du seuil de 20. D'où
une oscillation autour du seuil **à chaque passage, toute la nuit**, visible dans
le journal du watchdog.

**La contention ne vient pas de nous.** `uptime-check.sh` lancé à la main à
06:52:15, hors frontière de minute, a chargé la machine (`us=22 sy=11`) en
produisant **4 %** de steal. La même charge à `:00` en produit 40 à 64. Le pic
est également présent quand notre charge est au repos (`us=4`, steal 14 % à
56:01) : il vient de l'hôte partagé, synchronisé sur la minute ronde — vraisembla-
blement les cron de toutes les VM voisines réveillés au même instant, hypothèse
que je ne peux pas vérifier de l'intérieur. Nos propres tâches, toutes alignées
sur `*/5` et `*/15`, réclament du CPU précisément à la seconde où il est le plus
rare : à 06:55:03, tick `*/5`, le steal est monté à 49 %.

**Coût réel agrégé, moyennes `sar` :** 3,04 % / 2,84 % / 3,19 % les 19, 20 et 21.
À comparer aux 26,07 % et 59,12 % des 17 et 18/09. Rien à voir avec l'incident du
bridage, et la machine est à 90 % idle.

### Corrections posées dans `/opt/vps-watchdog.sh`

- **Décalage de la mesure** : attente jusqu'à la seconde 15, puis `vmstat 10 4`
  (fenêtre 15→45 s au lieu de 0→10 s).
- **Corroboration `sar`** : l'alerte steal exige désormais *aussi* que la dernière
  tranche de 10 minutes dépasse 10 %. Un bridage de 27 heures franchit les deux
  barrières ; un pic de quatre secondes n'en franchit aucune. Si `sar` est muet,
  son silence n'étouffe pas l'alerte — la mesure `vmstat` décide seule.
- **Liste de processus refaite** : instantané pris une seule fois via la *seconde*
  itération de `top -b -n 2` (un delta, pas un cumul), réutilisé par `contexte_cpu`
  et par le contrôle « processus emballé ». Vérifié : `top` s'y affiche désormais
  à 1,0 % au lieu de 200 %.
- **Quatrième règle** ajoutée à l'en-tête du script : une mesure se prend à un
  moment choisi, jamais avec un outil qui cumule depuis le démarrage du processus.

Vérification au même instant, en se plaçant comme cron à `:00:00` :

| | steal mesuré |
|---|---|
| ancienne méthode (`vmstat 5 3`, secondes 00→10) | 6 % |
| nouvelle méthode (`vmstat 10 4`, secondes 15→45) | 1 % |
| référence `sar` (dernière tranche de 10 min) | 2 % |

La nouvelle méthode colle à la référence indépendante ; l'ancienne gonflait d'un
facteur 3 à 6 sur cette minute-là.

Sauvegarde de l'ancien script sur le VPS : `/opt/vps-watchdog.sh.bak-2026-09-21`.
Miroir du dépôt (`docs/ops/vps/vps-watchdog.sh`) mis à jour — il était en phase
avant modification.

## Cassé

Rien. Le script tourne (exécution réelle vérifiée, 1 min 08 s, bien en deçà du
cron de 15 min) et le signe de vie hebdomadaire du lundi 7h est parti normalement.

## Reste

- **`x2goserver` est `enabled` et actif** sur une machine sans usage bureau, avec
  une douzaine de paquets installés. Surface d'attaque gratuite au sens de la
  baseline, et source du bruit dans les listes de processus. Décision à prendre :
  désinstaller ou justifier sa présence. Rien ne l'utilise aujourd'hui.
- **43 conteneurs, tous porteurs d'un healthcheck**, plusieurs à 5 s d'intervalle
  (`ainspiration-postgres`, `dreamoracle-postgres-1`, `seopilot-postgres`,
  `theevent-postgres`, `seopilot-redis`). Chacun crée un `runc exec`. Ce n'est pas
  la cause du steal, mais c'est un flux continu de création de processus qui se
  groupe sur les secondes rondes. À regarder si la machine se charge un jour.
- **Nos trois cron sont tous alignés sur la minute ronde** (`*/5`, `*/15`), donc
  sur le moment où le CPU de l'hôte est le plus disputé. Les décaler (`2-59/5`)
  coûterait une ligne et rendrait leurs exécutions plus rapides.
