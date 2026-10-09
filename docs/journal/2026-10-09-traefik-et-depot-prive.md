---
date: 2026-10-09
projet: AInspiration
ou: Claude Code
type: Infra
notion: non
prochaine-action: Laurent crée le jeton GitHub (lecture seule, dépôt AInspiration) et le colle dans le .env du VPS ; ensuite recreate, bascule du dépôt en privé, second recreate
---

## Fait

- **C39 clos — Traefik n'expose plus les conteneurs par défaut.** Inventaire refait sur
  les 48 conteneurs actifs avant de toucher quoi que ce soit : même structure que le
  25/09, aucun conteneur ne déclare un routeur sans déclarer aussi `traefik.enable`
  (le seul cas, `scraping-belgique`, est déjà à `false`). Référence prise **avant** : code
  HTTP des 35 hôtes servis (`/root/traefik-hosts.txt`, `/root/traefik-baseline-before.txt`).
  Puis `--providers.docker.exposedByDefault=false` dans `/root/docker-compose.yml`
  (sauvegarde `docker-compose.yml.bak-20261009-c39`), recréation du seul service
  Traefik. **Après : 35/35 hôtes identiques à la référence**, zéro avertissement dans le
  journal Traefik, contrôle de santé AInspiration 28/28. Les 19 conteneurs sans label
  (bases, Redis, pgbouncer, Adminer, Traefik lui-même) sont sortis du champ.
- **C2 (dépôt privé) — le prérequis technique est posé, la bascule attend le jeton.**
  Le compose de `/docker/ainspiration` authentifie désormais ses 15 téléchargements
  depuis `raw.githubusercontent.com` (7 pour le service `web`, 8 pour `migration`) :
  - le jeton arrive par `GITHUB_RAW_TOKEN` (`.env` du VPS) et passe à curl par un
    **fichier de configuration** (`-K /tmp/gh.curlrc`, mode 0600), **jamais en argument**
    — un `-H` serait lisible dans `ps` depuis le conteneur ;
  - le script fait `unset GITHUB_RAW_TOKEN` avant `exec node` : le serveur n'hérite
    pas du jeton, il n'en a aucun usage ;
  - **variable absente = fichier vide = aucun en-tête** : un dépôt public continue de
    fonctionner sans la variable, c'est ce qui permet de poser le compose avant le
    jeton. Vérifié à blanc dans un conteneur jetable : backend téléchargé, `npm ci`,
    215 fichiers de frontend, `WOULD_START`. Le conteneur de production n'a pas été
    recréé — rien ne changerait tant que le dépôt est public ;
  - un manifeste de frontend introuvable **arrête le boot** au lieu de démarrer un
    serveur sans frontend (c'était silencieux) ;
  - le service `migration` passe de `sh -c "..."` replié à la forme liste, seule façon
    d'y mettre des guillemets.
  Sauvegarde : `/docker/ainspiration/docker-compose.yml.bak-20261009-c2`.
- Vérifié hors VPS : rien d'autre ne lit le dépôt en clair. Les workflows n8n (0 occurrence
  dans la base), les scripts de `/root` et `/usr/local/bin`, les autres composes du VPS ne
  visent que leurs propres dépôts. **GitHub Actions** : ≈62 minutes sur 30 jours (60 runs),
  loin des 2 000 incluses même en plan gratuit. **Netlify** : le site `ainspiration2026`
  est lié à `laurent7850/AInspiration`, branche `main`, `stop_builds: false` — il construit
  à chaque push, en plus des déploiements CLI. À vérifier au premier push après la bascule.

## Cassé

- Rien. Deux faux positifs du banc d'essai, pas de la production : `docker compose config`
  ré-échappe `$` en `$$`, le script extrait lisait donc « PID + `{GHRAW}` » (curl
  « globbe » les accolades, d'où l'hôte fantôme `1GHRAW`) ; et un `sed` dans une
  chaîne ssh n'a pas pris. Corrigé avec Python, relancé, concluant.

## Reste

- **Laurent** : jeton à grain fin, dépôt `AInspiration` seul, permission *Contents :
  Read-only*, expiration maximale (1 an) → à noter pour rotation. Dans 1Password. Puis
  la commande de collage donnée dans la conversation (lecture sur l'entrée standard,
  jamais en argument). Je recrée `web` **avant** la bascule pour prouver le jeton sur un
  dépôt encore public, puis **après**, et je vérifie qu'un `curl` sans jeton rend 404.
- Les copies `docker/docker-compose.yml` et `docker-compose.prod.yml` du dépôt datent
  d'avant le découpage du 05/09 (pas de `files.txt`) et n'ont pas été touchées : le
  compose qui fait foi est sur le VPS, c'est écrit dans `ops/CONTEXTE.md`. Les recopier
  depuis le VPS supposerait d'être sûr qu'il n'y reste aucun littéral secret.
- C5 (C17 newsletter) : **en sommeil**, décision de Laurent du 09/10.
