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
#  4. Une mesure se prend a un moment CHOISI, et jamais avec un outil qui cumule
#     depuis le demarrage du processus. Les deux defauts corriges le 21/09/2026
#     etaient des defauts de mesure, pas des pannes : la machine allait bien.
#     Voir les commentaires des sections "mesure CPU" et "contexte_cpu".
#
# ATTENTION : n8n ne publie AUCUN port sur l'hote. Passer par localhost:5678 ne
# fonctionne pas et n'a jamais fonctionne. L'appel doit sortir par Traefik.

set -u

WEBHOOK="https://n8n.srv767464.hstgr.cloud/webhook/vps-alert"
EMAIL="divers@distr-action.com"
STATE="/var/lib/vps-watchdog"
LOG="/var/log/vps-watchdog.log"
COOLDOWN=21600          # 6 h entre deux alertes d'une meme condition

# Hysteresis, ajoutee le 18/09/2026 apres une alerte toutes les 15 minutes : le
# steal oscillait autour du seuil et chaque bascule rearmait la sonnette. Avec
# le cron toutes les 15 min, 3 passages = 45 minutes soutenues.
HITS_BEFORE_ALERT=3     # passages consecutifs au-dessus du seuil avant d'alerter
MISSES_BEFORE_CLEAR=3   # passages consecutifs en dessous avant de dire que c'est fini

# Seuils, tous cales sur l'incident du 17/09
STEAL_MAX=20            # steal > 20 % = l'hebergeur nous bride (il etait a 91 %)
STEAL_SAR_MIN=10        # corroboration sar : moyenne 10 min a depasser aussi (cf. controle 1)
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
# Lit un compteur, en tolerant un fichier absent ou abime.
compteur() {
  _v=$(cat "$1" 2>/dev/null || echo 0)
  case "$_v" in *[!0-9]*|'') _v=0 ;; esac
  echo "$_v"
}

# Alerte avec DEUX garde-fous, et ils traitent deux problemes differents.
#
#  1. Hysteresis : la condition doit tenir HITS_BEFORE_ALERT passages
#     consecutifs. Un pic isole ne reveille personne. C'est ce qui manquait le
#     18/09, ou le steal oscillait autour du seuil et produisait une alerte
#     toutes les 15 minutes.
#  2. Fenetre de silence : une fois alertee, une condition se tait pendant
#     COOLDOWN. Une sonnette qui hurle en boucle devient une sonnette qu'on
#     ignore.
alert() {
  _key="$1"; _subject="$2"; _body="$3"
  _stamp="$STATE/$_key.last"
  _hits="$STATE/$_key.hits"
  _misses="$STATE/$_key.misses"

  rm -f "$_misses"
  _n=$(( $(compteur "$_hits") + 1 ))
  echo "$_n" > "$_hits"

  if [ "$_n" -lt "$HITS_BEFORE_ALERT" ]; then
    logline "$_key au-dessus du seuil ($_n/$HITS_BEFORE_ALERT) — on attend confirmation"
    return
  fi

  _last=$(compteur "$_stamp")
  if [ "$_last" -ne 0 ] && [ $((NOW - _last)) -lt "$COOLDOWN" ]; then
    logline "$_key toujours en alerte, notification differee (fenetre de silence)"
    return
  fi
  echo "$NOW" > "$_stamp"
  notify "$_subject" "$_body" "$_key"
}

# Retour a la normale : ne previent que si une alerte avait ete envoyee.
# Retour a la normale, lui aussi soumis a hysteresis.
#
# Supprimer l'horodatage des le premier passage sous le seuil annulait la
# fenetre de silence, et c'est ce qui a produit le spam du 18/09 : une seule
# mesure en dessous suffisait a rearmer l'alerte suivante. Il faut desormais
# MISSES_BEFORE_CLEAR passages consecutifs pour declarer que c'est fini.
clear_alert() {
  _key="$1"; _label="$2"
  _stamp="$STATE/$_key.last"
  _hits="$STATE/$_key.hits"
  _misses="$STATE/$_key.misses"

  rm -f "$_hits"

  # Jamais alertee : rien a annoncer, on nettoie et on se tait.
  if [ ! -f "$_stamp" ]; then
    rm -f "$_misses"
    return
  fi

  _n=$(( $(compteur "$_misses") + 1 ))
  echo "$_n" > "$_misses"
  if [ "$_n" -lt "$MISSES_BEFORE_CLEAR" ]; then
    logline "$_key sous le seuil ($_n/$MISSES_BEFORE_CLEAR) — retour a la normale non confirme"
    return
  fi

  rm -f "$_stamp" "$_misses"
  logline "$_key revenu a la normale"
  notify "[VPS OK] $_label : retour a la normale" \
         "La condition suivante n'est plus remplie :\n\n  $_label\n\nAucune action requise." \
         "$_key"
}

# Le tableau vient de la SECONDE iteration de top (variable TOPRAW, plus bas),
# jamais de "ps --sort=-pcpu".
#
# POURQUOI - mails d'alerte du 20/09/2026. Le %CPU de "ps" est cumule sur la VIE
# du processus : pour un processus ne pendant la mesure (ELAPSED 0), c'est une
# division par presque zero. Les mails designaient donc des coupables
# imaginaires - "x2golistsession 90 %", "runc:[2:INIT] 100 %", et "ps" lui-meme
# a 200 % en tete de sa propre liste. Tous avaient ELAPSED 0. Cette liste a fait
# chercher du cote de x2go, dont le seul vrai processus est a 0,2 %.
#
# La seconde iteration de top, elle, est un delta sur l'intervalle : une mesure.
contexte_cpu() {
  echo "Processus les plus consommateurs (delta sur 3 s, pas un cumul) :"
  if [ -n "${TOPRAW:-}" ]; then
    echo "$TOPRAW" | head -5 | awk '{printf "  %6s %%  %s\n", $9, $12}'
  else
    echo "  (instantane indisponible)"
  fi
  echo
  echo "Charge : $(cat /proc/loadavg)"
  echo
  echo "Rappel de lecture : la charge moyenne n est PAS une consommation, et"
  echo "sous bridage user+sys est plafonne. Comparer la somme des cgroups Docker"
  echo "au total systeme : si les conteneurs ne rendent pas compte de la charge,"
  echo "le coupable est un processus de l hote."
}

# ---------------------------------------------------------------- mesure CPU
#
# DECALAGE OBLIGATOIRE - mesure du 21/09/2026, ne pas le retirer.
#
# Le steal de cette machine n'est pas continu : il est confine aux secondes 01 a
# 05 de CHAQUE minute. 0 a 2 % le reste du temps, 5 a 64 % pendant ces quatre
# secondes. Verifie seconde par seconde sur plusieurs frontieres de minute.
# La contention vient de l'hote partage, pas de nous : la meme charge lancee
# hors frontiere n'en produit aucune (uptime-check.sh a la main a 06:52:15 ->
# us=22 sy=11, steal=4 %).
#
# Or cron lance ce script a :00:00, et "vmstat 5 3" retenait comme premier
# echantillon les secondes 0 a 5 - exactement la fenetre du pic. Le watchdog
# echantillonnait donc les 5 pires secondes de la minute, puis les moyennait
# avec 5 secondes calmes : (45+2)/2 = 23 %, juste au-dessus du seuil de 20.
# D'ou "steal 29 %" toute la nuit du 20 au 21/09, sur une machine dont sar
# mesure 3 % de moyenne journaliere et qui est a 90 % idle.
#
# On attend donc la seconde 15, et on mesure de 15 a 45. Ne jamais ramener
# cette fenetre au debut de la minute : ce serait reintroduire le defaut.
_s=$(date +%-S)
if   [ "$_s" -lt 15 ]; then sleep $((15 - _s))
elif [ "$_s" -gt 15 ]; then sleep $((75 - _s))
fi

# Moyenne sur 30 s. On ignore la premiere ligne de vmstat : c'est un cumul depuis
# le boot, pas un instantane. Colonnes : 13=us 14=sy 15=id 16=wa 17=st
CPU=$(LC_ALL=C vmstat 10 4 2>/dev/null | tail -3 \
      | awk '{u+=$13; s+=$14; st+=$17; n++} END {if(n>0) printf "%d %d %d", u/n, s/n, st/n; else print "0 0 0"}')
US=$(echo "$CPU" | cut -d' ' -f1)
SY=$(echo "$CPU" | cut -d' ' -f2)
ST=$(echo "$CPU" | cut -d' ' -f3)
BUSY=$((US + SY))

# Instantane des processus, pris UNE fois et reutilise par contexte_cpu et par
# le controle 3. "top -b -n 2" : la premiere iteration est un cumul depuis le
# demarrage de chaque processus, la seconde est un delta sur l'intervalle. On
# ne garde que la seconde. Colonnes : 9=%CPU 12=COMMAND.
TOPRAW=$(LC_ALL=C top -b -n 2 -d 3 -w 200 2>/dev/null \
         | awk '/^ *PID/{n++} n==2 && $1 ~ /^[0-9]+$/')

# 1. L'hebergeur nous bride
#
# DEUX barrieres, parce qu'elles disent deux choses differentes : la fenetre de
# 30 s dit "maintenant", sar dit "sur la derniere tranche de 10 minutes". Le
# bridage qu'on veut attraper a tenu 27 heures (26 % puis 59 % de moyenne
# JOURNALIERE les 17 et 18/09) : il franchit les deux sans difficulte. Un pic
# de quatre secondes ne franchit ni l'une ni l'autre.
#
# Pas de LC_ALL=C sur sar : il le fait basculer en format AM/PM, ce qui ajoute
# un champ et decale les colonnes. On repere la ligne par le champ "all" et on
# lit depuis la fin (NF-1 = %steal, NF = %idle). La ligne "Average:" est
# ecartee : c'est la moyenne depuis minuit, pas la derniere tranche.
#
# Si sar est muet (sysstat arrete, fichier du jour absent), son silence ne doit
# PAS etouffer l'alerte : la mesure vmstat decide alors seule. Une donnee
# manquante ne ferme pas la bouche du moniteur.
ST_SAR=$(sar -u 2>/dev/null | awk '$1 ~ /^[0-9]/ && $0 ~ /[ \t]all[ \t]/ {v=$(NF-1)} END {if(v!="") printf "%d", v}')
case "${ST_SAR:-}" in ''|*[!0-9]*) ST_SAR=-1 ;; esac

if [ "$ST_SAR" -ge 0 ]; then
  ST_SAR_TXT="Moyenne sar sur la derniere tranche de 10 min : ${ST_SAR}% (seuil de corroboration ${STEAL_SAR_MIN}%)."
else
  ST_SAR_TXT="Moyenne sar indisponible (sysstat muet) : alerte sur la seule mesure instantanee."
fi

if [ "$ST" -gt "$STEAL_MAX" ] && { [ "$ST_SAR" -lt 0 ] || [ "$ST_SAR" -gt "$STEAL_SAR_MIN" ]; }; then
  alert steal "[VPS ALERTE] L hebergeur bride la machine (steal ${ST}%)" \
    "Le steal time est a ${ST}% (seuil ${STEAL_MAX}%), moyenne sur 30 s prise entre les secondes 15 et 45 de la minute.\n${ST_SAR_TXT}\n\nCela signifie que l hyperviseur Hostinger refuse du CPU a la machine. Tout ce qui tourne dessus est ralenti, quelle que soit la sante des applications.\n\nC est exactement ce qui s est produit du 17 au 18/09/2026, ou la machine a tourne a 9 % de ses 4 coeurs pendant 27 heures sans que personne ne le sache.\n\nA faire : identifier ce qui consomme (voir ci-dessous), corriger, puis demander a Hostinger de lever la limite.\n\n$(contexte_cpu)"
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

# 3. Un processus emballe - lu dans le meme instantane que contexte_cpu, au lieu
# de relancer un top a soi. Une seule mesure, donc le seuil et le mail parlent
# forcement du meme moment.
TOP=$(echo "${TOPRAW:-}" | awk 'NR==1 {print int($9)" "$12}')
TOP_PCT=$(echo "$TOP" | cut -d' ' -f1)
TOP_CMD=$(echo "$TOP" | cut -d' ' -f2-)
case "${TOP_PCT:-}" in ''|*[!0-9]*) TOP_PCT=0 ;; esac
[ -n "$TOP_CMD" ] || TOP_CMD="(inconnu)"

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
