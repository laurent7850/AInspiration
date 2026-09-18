#!/bin/bash
# Audityo Health Check - runs every 5 minutes via cron
#
# GARDE-FOU pose le 18/09/2026 : les reprises sont BORNEES.
#
# Sans borne, une desynchronisation dockerd/containerd survenue le 17/09 a fait
# retenter "docker restart audityo-postgres" toutes les 5 minutes pendant 27 h.
# 324 echecs consecutifs, tous masques par un "2>/dev/null", pendant que dockerd
# brulait un coeur entier et que Hostinger bridait le VPS a 91 % de steal.
# Recit complet : docs/journal/2026-09-18-vps-bride-par-hostinger.md (depot AInspiration).
#
# Deux regles a ne pas defaire :
#   1. On ne retente JAMAIS indefiniment. Apres MAX_TRIES echecs consecutifs, on
#      arrete et on demande un humain. Une reprise automatique qui ne converge pas
#      est une panne qui s'aggrave, pas une panne qui se repare.
#   2. On ne jette JAMAIS la sortie d'erreur d'une commande de reprise. C'est ce
#      silence qui a coute 27 heures.

set -u

DOMAIN="https://audityo.eu"
LOG="/var/log/audityo-health.log"
STATE_DIR="/var/lib/audityo-health"
MAX_TRIES=3
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Canal d'alerte. ATTENTION : n8n ne publie AUCUN port sur l'hote, donc
# localhost:5678 ne marche pas et n'a jamais marche. Il faut sortir par Traefik.
WEBHOOK="https://n8n.srv767464.hstgr.cloud/webhook/vps-alert"
EMAIL="divers@distr-action.com"

mkdir -p "$STATE_DIR"

log() {
  echo "[$DATE] $*" >> "$LOG"
}

# Une panne qui ne previent personne est une panne qui dure. Celle du 17/09 a
# dure 27 h pour cette raison exacte.
notify() {
  _subject="$1"; _body="$2"
  _body=$(printf '%b' "$_body")
  _payload=$(jq -nc --arg e "$EMAIL" --arg s "$_subject" --arg b "$_body" \
                    --arg src "audityo-health-check" --arg l "$LOG" \
             '{email:$e, subject:$s, body:$b, source:$src, log:$l}')
  _code=$(curl -s -o /dev/null -w '%{http_code}' -m 25 \
               -X POST "$WEBHOOK" -H 'Content-Type: application/json' -d "$_payload")
  if [ "$_code" = "200" ]; then
    log "  alerte envoyee"
  else
    log "  ECHEC D ENVOI DE L ALERTE (HTTP $_code)"
  fi
}

# Reprise bornee. Journalise la sortie d'erreur au lieu de la jeter.
# Usage : try_recover <nom> <commande...>
try_recover() {
  name="$1"
  shift
  counter="$STATE_DIR/$name.fails"
  n=$(cat "$counter" 2>/dev/null || echo 0)
  case "$n" in *[!0-9]*|'') n=0 ;; esac
  n=$((n + 1))
  echo "$n" > "$counter"

  if [ "$n" -gt "$MAX_TRIES" ]; then
    if [ "$n" -eq $((MAX_TRIES + 1)) ]; then
      log "ABANDON: $name toujours KO apres $MAX_TRIES reprises. Plus aucune tentative."
      log "         INTERVENTION MANUELLE REQUISE. Pour rearmer : rm $counter"
      notify "[AUDITYO ALERTE] $name a terre, reprise automatique abandonnee" \
"La reprise automatique de \"$name\" a echoue $MAX_TRIES fois de suite. Le script arrete d essayer.\n\nDerniere commande tentee :\n  $*\n\nPourquoi il arrete : une reprise qui ne converge pas aggrave la panne au lieu de la reparer. Les 17 et 18/09/2026, ce meme script a retente un redemarrage toutes les 5 minutes pendant 27 heures ; dockerd a fini par bruler un coeur entier et Hostinger a bride le VPS.\n\nA faire :\n  1. ssh root@193.203.191.251\n  2. docker ps -a --filter name=audityo\n  3. Si l erreur est \"AlreadyExists: task already exists\", c est une desynchronisation dockerd/containerd :\n       cd /root/audityo && docker rm -f <conteneur> && docker compose up -d <conteneur>\n     Si dockerd reste au-dessus de 100 % de CPU apres cela :\n       systemctl restart docker   (live-restore est arme, les conteneurs ne tombent pas)\n\nUne fois repare, le compteur se remet a zero tout seul. Pour rearmer manuellement :\n  rm $counter"
    fi
    return 1
  fi

  log "reprise $n/$MAX_TRIES sur $name : $*"
  out=$("$@" 2>&1)
  rc=$?
  if [ "$rc" -ne 0 ]; then
    log "  ECHEC (rc=$rc) : $(echo "$out" | tail -2 | tr '\n' ' ')"
  else
    log "  commande acceptee"
  fi
  return 0
}

clear_fails() {
  counter="$STATE_DIR/$1.fails"
  if [ -f "$counter" ]; then
    log "$1 est revenu a la normale, compteur de reprises remis a zero"
    rm -f "$counter"
  fi
}

# --- Landing page ---
HTTP_CODE=$(curl -sk -o /dev/null -w '%{http_code}' -m 10 "$DOMAIN/")
if [ "$HTTP_CODE" != "200" ]; then
  log "ALERTE: Landing page retourne $HTTP_CODE"
  try_recover web docker restart audityo-web
else
  clear_fails web
fi

# --- API ---
API_CODE=$(curl -sk -o /dev/null -w '%{http_code}' -m 10 "$DOMAIN/api/waitlist")
if [ "$API_CODE" = "000" ]; then
  log "ALERTE: API injoignable"
fi

# --- PostgreSQL ---
if docker exec audityo-postgres pg_isready -U audityo 2>/dev/null | grep -q 'accepting'; then
  clear_fails postgres
else
  log "ALERTE: PostgreSQL down"
  try_recover postgres docker restart audityo-postgres
fi

# --- Statut du conteneur web ---
WEB_STATUS=$(docker inspect audityo-web --format='{{.State.Status}}' 2>/dev/null || echo "absent")
if [ "$WEB_STATUS" != "running" ]; then
  log "ALERTE: audityo-web status=$WEB_STATUS"
  try_recover webstart docker start audityo-web
else
  clear_fails webstart
fi

# --- Rotation du log : garder les 1000 dernieres lignes ---
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt 1000 ]; then
  tail -500 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi
