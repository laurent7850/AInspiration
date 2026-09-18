#!/bin/bash
# Surveillance de la disponibilite des sites - cron toutes les 5 minutes
#
# REECRIT LE 18/09/2026. Il etait muet et faux sur trois points :
#
#  1. Il appelait http://localhost:5678/webhook/uptime-alert. n8n ne publie AUCUN
#     port sur l'hote : rien n'ecoute sur 5678. TOUTES les alertes de ce script
#     partaient dans le vide depuis sa creation. L'appel sort par Traefik.
#  2. Il jetait le resultat du curl d'alerte (> /dev/null 2>&1) : un echec d'envoi
#     restait invisible. Le code HTTP est desormais journalise.
#  3. La liste des domaines etait perimee. Elle visait des domaines publics jamais
#     mis en service (lartpero.be, seopilot.be, theevent-linkedin.be, enghien-rag.be),
#     et surveillait delijn.be, qui appartient a un tiers et n'a rien a faire ici.
#     La liste ci-dessous vient des regles Host() reellement declarees dans Traefik.
#
# ET SURTOUT : une fenetre de silence par domaine. Sans elle, un site durablement
# a terre enverrait 288 mails par jour. Une sonnette qui hurle en boucle est une
# sonnette qu'on finit par ignorer - c'est-a-dire un retour au silence.
#
# Codes acceptes : 401 est SAIN (basic auth Traefik sur brasspat, caisses, minutage :
# le serveur repond et l'authentification fonctionne), 307 aussi (redirection).

LOG=/var/log/uptime-check.log
STATE=/var/lib/uptime-check
WEBHOOK="https://n8n.srv767464.hstgr.cloud/webhook/vps-alert"
EMAIL="divers@distr-action.com"
COOLDOWN=21600   # 6 h entre deux alertes pour un meme domaine

DOMAINS="ainspiration.eu audityo.eu distr-action.com dreamoracle.eu \
n8n.srv767464.hstgr.cloud communityos.srv767464.hstgr.cloud \
seopilot.srv767464.hstgr.cloud theevent.srv767464.hstgr.cloud \
enghien.srv767464.hstgr.cloud rampa.srv767464.hstgr.cloud \
voxstudio.srv767464.hstgr.cloud dreams.srv767464.hstgr.cloud \
brasspat042026.distr-action.com caisses.distr-action.com \
minutage.distr-action.com tlservices.distr-action.com \
lartpero.ainspiration.eu"

DATE=$(date "+%Y-%m-%d %H:%M:%S")
NOW=$(date +%s)
mkdir -p "$STATE"

logline() { echo "[$DATE] $*" >> "$LOG"; }

notify() {
  _subject="$1"; _body="$2"
  _body=$(printf '%b' "$_body")
  _payload=$(jq -nc --arg e "$EMAIL" --arg s "$_subject" --arg b "$_body" \
                    --arg src "uptime-check" --arg l "$LOG" \
             '{email:$e, subject:$s, body:$b, source:$src, log:$l}')
  _code=$(curl -s -o /dev/null -w "%{http_code}" -m 25 \
               -X POST "$WEBHOOK" -H "Content-Type: application/json" -d "$_payload")
  if [ "$_code" = "200" ]; then
    logline "  alerte envoyee"
  else
    logline "  ECHEC D ENVOI DE L ALERTE (HTTP $_code) - PERSONNE N A ETE PREVENU"
  fi
}

for domain in $DOMAINS; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://$domain/" 2>/dev/null)
  STAMP="$STATE/$domain.last"

  case "$STATUS" in
    200|301|302|307|308|401)
      # Sain. Si on avait alerte, on annonce le retour a la normale.
      if [ -f "$STAMP" ]; then
        rm -f "$STAMP"
        logline "$domain est revenu (HTTP $STATUS)"
        notify "[VPS OK] $domain est revenu" \
               "$domain repond de nouveau (HTTP $STATUS).\n\nAucune action requise."
      fi
      ;;
    *)
      logline "ALERTE: $domain: HTTP $STATUS"
      LAST=$(cat "$STAMP" 2>/dev/null || echo 0)
      case "$LAST" in *[!0-9]*|'') LAST=0 ;; esac
      if [ "$LAST" -ne 0 ] && [ $((NOW - LAST)) -lt "$COOLDOWN" ]; then
        logline "  toujours a terre, notification differee (fenetre de silence)"
      else
        echo "$NOW" > "$STAMP"
        notify "[VPS ALERTE] $domain injoignable (HTTP $STATUS)" \
               "$domain ne repond pas : HTTP $STATUS.\n\nUn code 000 signifie que la connexion n a pas pu etre etablie (DNS, TLS ou reseau), pas que le serveur a renvoye une erreur.\n\nCodes consideres comme sains : 200, 301, 302, 307, 308 et 401 (ce dernier est normal sur les domaines proteges par basic auth Traefik).\n\nProchaine notification pour ce domaine dans 6 h au plus tot, tant qu il reste a terre."
      fi
      ;;
  esac
done

# Rotation du journal
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt 2000 ]; then
  tail -1000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi
