#!/bin/bash
# Veille machine du VPS - cron toutes les 15 minutes
#
# POURQUOI CE SCRIPT EXISTE
# Les 17 et 18/09/2026, dockerd a brule un coeur entier pendant 27 heures, Hostinger
# a bride le VPS a 91 % de steal, et personne ne l'a su. Rien ne surveillait la
# MACHINE : uniquement la reponse HTTP des sites, qui restait a 200 pendant que tout
# ralentissait. Recit : docs/journal/2026-09-18-vps-bride-par-hostinger.md (AInspiration).
#
# TROIS REGLES A NE PAS DEFAIRE
#  1. Silence quand tout va bien, SAUF un signe de vie le lundi matin. Un moniteur
#     mort en silence reproduit exactement le defaut qu'il est cense detecter.
#  2. Une alerte par condition toutes les 6 h au maximum, et un message de retour a
#     la normale. Une sonnette qui hurle en boucle devient une sonnette qu'on ignore.
#  3. Chaque seuil correspond a quelque chose qui s'est REELLEMENT produit. On
#     n'ajoute pas un seuil "au cas ou" : on ajoute un seuil quand une panne l'a merite.
#
# ATTENTION : n8n ne publie AUCUN port sur l'hote. Passer par localhost:5678 ne
# fonctionne pas et n'a jamais fonctionne. L'appel doit sortir par Traefik.

set -u

WEBHOOK="https://n8n.srv767464.hstgr.cloud/webhook/vps-alert"
EMAIL="divers@distr-action.com"
STATE="/var/lib/vps-watchdog"
LOG="/var/log/vps-watchdog.log"
COOLDOWN=21600          # 6 h entre deux alertes d'une meme condition

# Seuils, tous cales sur l'incident du 17/09
STEAL_MAX=20            # steal > 20 % = l'hebergeur nous bride (il etait a 91 %)
BUSY_MAX=50             # user+sys soutenu (le pic du 17/09 etait a 88 %)
PROC_MAX=80             # un seul processus au-dessus de 80 % (dockerd etait a 103 %)
DISK_MAX=85             # % d'occupation de /
MEM_MIN_PCT=10          # % de memoire disponible en dessous duquel on alerte

# Conteneurs arretes volontairement, a ne pas signaler. Un par ligne, nom exact.
EXCLUS="paperclip-zjyk-paperclip-1 root-init-speaks-1 the-event-migration-1"

mkdir -p "$STATE"
NOW=$(date +%s)

ts()      { date '+%Y-%m-%d %H:%M:%S'; }
logline() { echo "[$(ts)] $*" >> "$LOG"; }

# Envoi reel. Journalise le resultat : si l'alerte elle-meme echoue, ca se voit.
#
# Le printf '%b' n'est pas cosmetique : bash ne developpe PAS les \n entre
# guillemets doubles, et jq --arg prend la valeur telle quelle. Sans lui, les
# mails afficheraient des "\n" litteraux au lieu de sauter des lignes. Ne pas
# tenter de le remplacer par un gsub cote jq : les niveaux d'echappement
# bash/jq/regex ne s'alignent pas, essaye et verifie.
notify() {
  _subject="$1"; _body="$2"; _src="$3"
  _body=$(printf '%b' "$_body")
  _payload=$(jq -nc --arg e "$EMAIL" --arg s "$_subject" --arg b "$_body" \
                    --arg src "$_src" --arg l "$LOG" \
             '{email:$e, subject:$s, body:$b, source:$src, log:$l}')
  _code=$(curl -s -o /dev/null -w '%{http_code}' -m 25 \
               -X POST "$WEBHOOK" -H 'Content-Type: application/json' -d "$_payload")
  if [ "$_code" = "200" ]; then
    logline "ALERTE ENVOYEE [$_src] $_subject"
  else
    logline "ECHEC D ENVOI (HTTP $_code) [$_src] $_subject"
  fi
}

# Alerte avec fenetre de silence. Ne renvoie rien tant que COOLDOWN n'est pas ecoule.
alert() {
  _key="$1"; _subject="$2"; _body="$3"
  _stamp="$STATE/$_key.last"
  _last=$(cat "$_stamp" 2>/dev/null || echo 0)
  case "$_last" in *[!0-9]*|'') _last=0 ;; esac
  if [ "$_last" -ne 0 ] && [ $((NOW - _last)) -lt "$COOLDOWN" ]; then
    logline "$_key toujours en alerte, notification differee (fenetre de silence)"
    return
  fi
  echo "$NOW" > "$_stamp"
  notify "$_subject" "$_body" "$_key"
}

# Retour a la normale : ne previent que si une alerte avait ete envoyee.
clear_alert() {
  _key="$1"; _label="$2"
  _stamp="$STATE/$_key.last"
  if [ -f "$_stamp" ]; then
    rm -f "$_stamp"
    logline "$_key revenu a la normale"
    notify "[VPS OK] $_label : retour a la normale" \
           "La condition suivante n'est plus remplie :\n\n  $_label\n\nAucune action requise." \
           "$_key"
  fi
}

contexte_cpu() {
  echo "Processus les plus consommateurs :"
  LC_ALL=C ps -eo pcpu,pmem,etimes,comm --sort=-pcpu 2>/dev/null | head -6 | sed 's/^/  /'
  echo
  echo "Charge : $(cat /proc/loadavg)"
}

# ---------------------------------------------------------------- mesure CPU
# Moyenne sur 10 s. On ignore la premiere ligne de vmstat : c'est un cumul depuis
# le boot, pas un instantane. Colonnes : 13=us 14=sy 15=id 16=wa 17=st
CPU=$(LC_ALL=C vmstat 5 3 2>/dev/null | tail -2 \
      | awk '{u+=$13; s+=$14; st+=$17; n++} END {if(n>0) printf "%d %d %d", u/n, s/n, st/n; else print "0 0 0"}')
US=$(echo "$CPU" | cut -d' ' -f1)
SY=$(echo "$CPU" | cut -d' ' -f2)
ST=$(echo "$CPU" | cut -d' ' -f3)
BUSY=$((US + SY))

# 1. L'hebergeur nous bride
if [ "$ST" -gt "$STEAL_MAX" ]; then
  alert steal "[VPS ALERTE] L hebergeur bride la machine (steal ${ST}%)" \
    "Le steal time est a ${ST}% (seuil ${STEAL_MAX}%).\n\nCela signifie que l hyperviseur Hostinger refuse du CPU a la machine. Tout ce qui tourne dessus est ralenti, quelle que soit la sante des applications.\n\nC est exactement ce qui s est produit du 17 au 18/09/2026, ou la machine a tourne a 9 % de ses 4 coeurs pendant 27 heures sans que personne ne le sache.\n\nA faire : identifier ce qui consomme (voir ci-dessous), corriger, puis demander a Hostinger de lever la limite.\n\n$(contexte_cpu)"
else
  clear_alert steal "steal time eleve"
fi

# 2. Charge CPU soutenue
if [ "$BUSY" -gt "$BUSY_MAX" ]; then
  alert busy "[VPS ALERTE] Charge CPU soutenue (user+sys ${BUSY}%)" \
    "user=${US}% sys=${SY}% (somme ${BUSY}%, seuil ${BUSY_MAX}%).\n\nA surveiller : si cela dure, Hostinger bride la machine. Le 17/09, la charge est montee a 88 % et la limite est tombee quatre heures plus tard.\n\nReflexe utile : comparer la somme des cgroups Docker au total systeme. Si les conteneurs ne rendent pas compte de la charge, le coupable est un processus de l hote (le 17/09, c etait dockerd).\n\n$(contexte_cpu)"
else
  clear_alert busy "charge CPU soutenue"
fi

# 3. Un processus emballe
TOP=$(LC_ALL=C top -b -n 2 -d 3 2>/dev/null | awk '/^ *PID/{n++} n==2 && $1 ~ /^[0-9]+$/ {print int($9)" "$12; exit}')
TOP_PCT=$(echo "$TOP" | cut -d' ' -f1)
TOP_CMD=$(echo "$TOP" | cut -d' ' -f2-)
case "${TOP_PCT:-}" in ''|*[!0-9]*) TOP_PCT=0 ;; esac

if [ "$TOP_PCT" -gt "$PROC_MAX" ]; then
  alert runaway "[VPS ALERTE] Processus emballe : $TOP_CMD (${TOP_PCT}%)" \
    "Le processus \"$TOP_CMD\" consomme ${TOP_PCT}% d un coeur (seuil ${PROC_MAX}%).\n\nLe 17/09, c etait dockerd a 103 %, bloque sur une desynchronisation avec containerd, entretenue par un cron sans borne de reprise. Un redemarrage du demon (avec live-restore arme, deja configure) avait suffi.\n\n$(contexte_cpu)"
else
  clear_alert runaway "processus emballe"
fi

# 4. Disque
DISK=$(df --output=pcent / 2>/dev/null | tail -1 | tr -dc '0-9')
case "${DISK:-}" in ''|*[!0-9]*) DISK=0 ;; esac
if [ "$DISK" -gt "$DISK_MAX" ]; then
  alert disk "[VPS ALERTE] Disque a ${DISK}%" \
    "La partition / est occupee a ${DISK}% (seuil ${DISK_MAX}%).\n\n$(df -h / | sed 's/^/  /')\n\nPistes : images Docker inutilisees, logs, sauvegardes."
else
  clear_alert disk "disque presque plein"
fi

# 5. Memoire
MEM=$(free | awk '/^Mem:/ {printf "%d", $7*100/$2}')
case "${MEM:-}" in ''|*[!0-9]*) MEM=100 ;; esac
if [ "$MEM" -lt "$MEM_MIN_PCT" ]; then
  alert mem "[VPS ALERTE] Memoire disponible a ${MEM}%" \
    "Il ne reste que ${MEM}% de memoire disponible (seuil ${MEM_MIN_PCT}%).\n\n$(free -h | sed 's/^/  /')"
else
  clear_alert mem "memoire disponible faible"
fi

# 6. Conteneur tombe qui aurait du se relever
TOMBES=""
for c in $(docker ps -a --format '{{.Names}}' 2>/dev/null); do
  skip=0
  for e in $EXCLUS; do [ "$c" = "$e" ] && skip=1; done
  [ "$skip" = "1" ] && continue
  etat=$(docker inspect "$c" --format '{{.State.Status}}|{{.HostConfig.RestartPolicy.Name}}' 2>/dev/null)
  st=${etat%%|*}; pol=${etat##*|}
  if [ "$st" != "running" ] && { [ "$pol" = "always" ] || [ "$pol" = "unless-stopped" ]; }; then
    TOMBES="$TOMBES  $c (etat=$st, politique=$pol)\n"
  fi
done

if [ -n "$TOMBES" ]; then
  alert containers "[VPS ALERTE] Conteneur a terre malgre sa politique de redemarrage" \
    "Ces conteneurs devraient tourner et ne tournent pas :\n\n$TOMBES\nUn conteneur avec restart=always qui reste a terre signale un probleme que Docker ne sait pas resoudre seul - typiquement une desynchronisation avec containerd (AlreadyExists), comme audityo-postgres le 17/09.\n\nSi c est un arret volontaire, ajoute le nom a la variable EXCLUS de /opt/vps-watchdog.sh."
else
  clear_alert containers "conteneur a terre"
fi

# ------------------------------------------------- signe de vie hebdomadaire
# Sans lui, un moniteur mort ne se distingue pas d'un moniteur silencieux.
if [ "$(date +%u)" = "1" ] && [ "$(date +%H)" = "07" ]; then
  SEMAINE="$STATE/heartbeat.$(date +%G-%V)"
  if [ ! -f "$SEMAINE" ]; then
    rm -f "$STATE"/heartbeat.* 2>/dev/null
    : > "$SEMAINE"
    notify "[VPS] Signe de vie hebdomadaire - tout va bien" \
      "La veille machine fonctionne. Ce message arrive chaque lundi a 7h ; son absence est elle-meme une alerte.\n\nEtat courant :\n  user=${US}%  sys=${SY}%  steal=${ST}%\n  disque=${DISK}%  memoire disponible=${MEM}%\n  processus le plus actif : $TOP_CMD (${TOP_PCT}%)\n  conteneurs actifs : $(docker ps -q 2>/dev/null | wc -l)\n\nCharge : $(cat /proc/loadavg)" \
      "heartbeat"
  fi
fi

# --------------------------------------------------- rotation du journal
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt 2000 ]; then
  tail -1000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi
