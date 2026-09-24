#!/bin/bash
# Pose les nouvelles cles OpenRouter dans les .env du VPS. C20.
#
# Ce script N'AFFICHE JAMAIS une valeur de cle et NE REDEMARRE AUCUN CONTENEUR.
# Il ecrit des fichiers, c'est tout. Les recreate sont faits ensuite, un par un,
# avec verification.
#
# Les valeurs sont lues sur l'entree standard en mode silencieux : elles ne
# passent ni par un argument de ligne de commande (visible dans `ps`), ni par
# l'historique du shell, ni par une conversation.
#
# Entree vide = on saute cette cle, rien n'est touche.
#
# Usage :
#   poser-cles-openrouter.sh              -> demande les six
#   poser-cles-openrouter.sh brasspat-prod -> ne demande que celle-la

set -u

# nom_de_cle:fichier_env
CIBLES="
n8n-prod:/root/.env
ainspiration-prod:/docker/ainspiration/.env
audityo-prod:/root/audityo/.env
communityos-staging:/docker/communityos/.env
theevent-prod:/docker/the-event/.env
brasspat-prod:/docker/brasspat042026/.env
"

DATE=$(date +%Y%m%d-%H%M)
poses=0
sautes=0

echo
echo "=== Pose des cles OpenRouter — $DATE ==="
echo "Colle la valeur puis Entree. Rien ne s'affiche, c'est voulu."
echo "Entree vide = passer cette cle."
echo
echo "NOTE : audityo-dev n'est pas dans la liste. Son fichier .env n'existe plus"
echo "       (chantier C29) — le conteneur ne redemarrerait pas. Garde sa cle"
echo "       dans 1Password, elle sera posee depuis une session Audityo."
echo

FILTRE=${1:-}
if [ -n "$FILTRE" ]; then
  echo "Filtre : seule la cle \"$FILTRE\" sera demandee."
  echo
fi

for ligne in $CIBLES; do
  nom=${ligne%%:*}
  fichier=${ligne##*:}

  if [ -n "$FILTRE" ] && [ "$nom" != "$FILTRE" ]; then
    continue
  fi

  printf '%-22s -> %s\n' "$nom" "$fichier"

  if [ ! -f "$fichier" ]; then
    echo "   IGNORE : le fichier n'existe pas. A signaler."
    sautes=$((sautes + 1))
    echo
    continue
  fi

  printf '   valeur : '
  read -rs K
  echo

  if [ -z "$K" ]; then
    echo "   saute."
    sautes=$((sautes + 1))
    echo
    continue
  fi

  # Garde-fous : on refuse plutot que d'ecrire n'importe quoi dans un .env de prod.
  case "$K" in
    sk-or-v1-*) ;;
    *) echo "   REFUSE : ne commence pas par sk-or-v1- . Rien ecrit."; sautes=$((sautes + 1)); echo; continue ;;
  esac
  if [ ${#K} -lt 60 ] || [ ${#K} -gt 90 ]; then
    echo "   REFUSE : longueur ${#K}, attendu ~73. Rien ecrit."
    sautes=$((sautes + 1)); echo; continue
  fi

  # Garde-fou 1 : la valeur collee est-elle differente de celle deja en place ?
  # C est le piege du 24/09 : un presse-papier perime reecrit la meme cle et le
  # script rapporte "posee" en toute bonne foi.
  ancienne=$(grep -m1 "^OPENROUTER_API_KEY=" "$fichier" | cut -d= -f2-)
  if [ "$K" = "$ancienne" ]; then
    echo "   REFUSE : valeur identique a celle deja dans le fichier. Rien ecrit."
    echo "            (verifie que 1Password porte bien la NOUVELLE cle)"
    sautes=$((sautes + 1)); unset K; echo; continue
  fi

  # Garde-fou 2 : OpenRouter la reconnait-elle, et son plafond est-il journalier ?
  rep=$(curl -s -H "Authorization: Bearer $K" https://openrouter.ai/api/v1/key)
  case "$rep" in
    *\"limit_reset\":\"daily\"*) echo "   cle vivante, plafond journalier." ;;
    *\"limit\"*) echo "   ATTENTION : cle vivante mais plafond NON journalier (a vie)." ;;
    *) echo "   REFUSE : OpenRouter ne reconnait pas cette cle. Rien ecrit."
       sautes=$((sautes + 1)); unset K; echo; continue ;;
  esac

  cp -p "$fichier" "$fichier.bak-$DATE"
  # Retire l'ancienne ligne, ajoute la neuve. Pas de sed sur la valeur.
  grep -v '^OPENROUTER_API_KEY=' "$fichier" > "$fichier.tmp-$$"
  printf 'OPENROUTER_API_KEY=%s\n' "$K" >> "$fichier.tmp-$$"
  mv "$fichier.tmp-$$" "$fichier"
  chmod 600 "$fichier"

  # Preuve sans secret : empreinte et longueur.
  emp=$(printf %s "$K" | sha256sum | cut -c1-8)
  echo "   ecrit. empreinte=$emp longueur=${#K} sauvegarde=$fichier.bak-$DATE"
  poses=$((poses + 1))
  unset K
  echo
done

echo "=== $poses posee(s), $sautes sautee(s) ==="
echo
echo "AUCUN conteneur n'a ete touche : les conteneurs tournent encore avec"
echo "l'ancienne cle. Rien ne change tant qu'ils ne sont pas recrees."
echo
echo "Empreintes actuellement EN SERVICE dans les conteneurs :"
for c in $(docker ps --format '{{.Names}}'); do
  v=$(docker exec "$c" printenv OPENROUTER_API_KEY 2>/dev/null) || continue
  [ -n "$v" ] && printf '  %-28s %s\n' "$c" "$(printf %s "$v" | sha256sum | cut -c1-8)"
done
echo
echo "Compare-les avec les empreintes ci-dessus : elles doivent encore differer."
