#!/bin/sh
# Rotate JWT_SECRET on the VPS: the value is generated here and never printed.
# - .env gets the new value (single source of truth)
# - docker-compose.yml line 56 stops carrying a literal and reads ${JWT_SECRET}
# - web container recreated, then a 365-day admin token for n8n is signed inside it
set -eu
cd /docker/ainspiration
stamp=$(date +%Y%m%d-%H%M%S)
cp docker-compose.yml "docker-compose.yml.bak-$stamp"
cp .env ".env.bak-$stamp"
chmod 600 ".env.bak-$stamp" .env
new=$(openssl rand -hex 32)
# .env: replace the JWT_SECRET line (keep other keys untouched)
awk -v v="$new" 'BEGIN{done=0} /^JWT_SECRET=/{print "JWT_SECRET=" v; done=1; next} {print} END{if(!done) print "JWT_SECRET=" v}' .env > .env.tmp && mv .env.tmp .env && chmod 600 .env
# compose: line 56 must be the JWT_SECRET mapping
line56=$(sed -n 56p docker-compose.yml)
case "$line56" in
  *JWT_SECRET*) sed -i '56s|^\( *\)JWT_SECRET:.*$|\1JWT_SECRET: ${JWT_SECRET}|' docker-compose.yml ;;
  *) echo "line 56 is not JWT_SECRET, abort"; exit 1 ;;
esac
sed -n 56p docker-compose.yml
# resolved config must carry a 64-char value without printing it
len=$(docker compose config 2>/dev/null | grep -E '^\s+JWT_SECRET:' | head -1 | sed -E 's/.*JWT_SECRET: *//; s/"//g' | tr -d '\n' | wc -c)
echo "resolved JWT_SECRET length: $len"
[ "$len" = "64" ] || { echo "unexpected length, restoring"; cp "docker-compose.yml.bak-$stamp" docker-compose.yml; cp ".env.bak-$stamp" .env; exit 1; }
docker compose up -d --force-recreate web >/dev/null 2>&1
for i in $(seq 1 40); do sleep 5; if docker logs ainspiration-web 2>&1 | grep -q "Secure server on 3000"; then echo "booted after $((i*5))s"; break; fi; done
docker logs ainspiration-web 2>&1 | grep -iE "fatal|error" | tail -2 || true
# fresh n8n token (admin, 365 d) — the only line printed that must be treated as a secret
docker exec ainspiration-web node -e "const jwt=require('jsonwebtoken');console.log('TOKEN='+jwt.sign({id:'9e780e88-6f47-472b-a37b-5d93207c9dfd',email:'admin@ainspiration.eu',role:'admin',iss:'n8n-auto-blog'},process.env.JWT_SECRET,{expiresIn:'365d'}))"
