---
date: 2026-09-22
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Décider du sort de la clé OpenRouter en clair dans n8n-workflows/README.md (ops/APPROVALS.md)
---

## Fait

- **Carnet de bord `ops/` posé dans le dépôt**, sur la branche `ops/carnet-de-bord`, par
  `/direction:carnet init`. Six fichiers : `README.md`, `CONTEXTE.md`, `BACKLOG.md`,
  `APPROVALS.md`, `decisions/ADR-000-modele.md`, `journal/.gitkeep`. L'équipe virtuelle
  des dix spécialistes étant passée d'un dépôt voisin à un plugin utilisateur
  (`direction@distraction`), ses fiches sont désormais génériques : **c'est
  `ops/CONTEXTE.md` qui porte les chiffres d'AInspiration**.
- **`ops/CONTEXTE.md` rempli à partir de ce dépôt seul** — `CLAUDE.md`, `PRODUCT.md`,
  `README.md`, `HANDOFF.md`, `package.json`, les composes, `database.sql`,
  `n8n-workflows/`, `pricing.json`, `legal.json`. Grille O1–O5 avec ses prix, objectif
  de 3 000 €/mois, critère blog de fin novembre contre le relevé GSC du 16/09, rétention
  de 12 mois, règle de déploiement en quatre temps, secrets machine par usage.
- **`ops/BACKLOG.md` amorcé à 17 chantiers**, tous tirés des sections 3 et 4 de
  `HANDOFF.md`, statut `todo`, colonne Auto à `non` partout. Aucun chantier deviné : un
  `grep TODO/FIXME` sur `src/`, `scripts/` et `docker/backend/` hors `node_modules` ne
  rend **rien**.
- **Trousseau complété** : bloc `permissions` fusionné dans `.claude/settings.json`, les
  deux hooks intacts. `docker restart` en `deny` et `docker cp` en `ask` — le conteneur
  retélécharge son frontend au boot, un `restart` peut donc casser le site en silence là
  où `docker cp` pousse des fichiers qu'on a sous la main.

## Cassé

- **Une clé OpenRouter `sk-or-v1-…` vit en clair dans `n8n-workflows/README.md`**,
  4 occurrences, fichier **suivi par git**, dans un dépôt que le handoff donne pour
  **public** depuis le 19/09. Rien n'a été touché : révoquer coupe les workflows qui s'en
  servent encore, et la valeur resterait de toute façon dans l'historique. Ligne ouverte
  dans `ops/APPROVALS.md`, chantier `C3` en `blocked`.
- **Trois fichiers du dépôt décrivent une architecture qui n'existe plus**, et deux
  d'entre eux peuvent tromper une session qui les lirait de bonne foi :
  le `docker-compose.yml` de la racine décrit un frontend **nginx**, alors que la
  production tourne sur `ainspiration-web` en `node:20-alpine` où **Express** sert le
  front et porte le rendu SEO ; `database.sql` fait 13 lignes et ne contient que `users`,
  quand le schéma réel est `docker/init.sql` plus les migrations 001→007 ; et
  `n8n-workflows/` ne contient que des exports anciens (Supabase, Claude 3 Haiku, Pack
  Express à 1 490 €). J'ai d'abord recopié le « nginx » dans `CONTEXTE.md` avant de le
  corriger — la mise en garde est désormais écrite dans le fichier.

## Reste

- Sept données restent `— à compléter` dans `ops/CONTEXTE.md`, toutes économiques ou
  réglementaires, aucune trouvable dans ce dépôt : coût de revient et marge par offre,
  seuil d'alerte, montants VPS / Netlify / OpenRouter, cible chiffrée de premiers clients,
  rétention hors données de contact, registre des traitements art. 30, dates d'application
  de l'EU AI Act opposables aux clients — c'est pourtant l'argument de vente d'O5 — et
  volumétrie GA4 hors blog.
- Rien n'est commité : la branche `ops/carnet-de-bord` attend le feu vert de Laurent.
