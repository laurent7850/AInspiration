# AInspiration — ainspiration.eu

Site vitrine trilingue (FR par défaut, EN, NL) et CRM interne de Distr'Action SRL.
React 18 + Vite + Tailwind + i18next côté front, Express + PostgreSQL côté backend
(`docker/backend/`), déployé sur un VPS Hostinger derrière Traefik.

## Commandes

```bash
npm install            # dépendances front
npm run dev            # Vite en développement
npm run build          # build de production + régénération de docker/dist-manifest.txt
npm run lint           # ESLint (0 erreur ; les warnings sont un burn-down)
npx tsc --noEmit       # typecheck
npx vitest run         # tests front
node scripts/local-preview.cjs   # backend Express local servant le dernier build (sans base)

cd docker/backend && npm ci && npm test   # contrat d'autorisation (toute route hors liste blanche → 401)
```

## Où lire quoi

- `CLAUDE.md` — architecture, arbre de dépendances, procédure de déploiement et pièges connus. **À lire avant tout déploiement.**
- `PRODUCT.md` — ce que vend le site, audience, règle « aucune preuve fabriquée ».
- `DESIGN.md` — système de design « Aurora ».
- `docs/` — audits et briefs (réalisations, LinkedIn). `docs/archive-2026-01/` : documents de l'ère hébergement mutualisé, conservés pour l'historique, plus applicables.
- `docker/backend/files.txt` — liste des fichiers backend téléchargés par le conteneur au démarrage.

## Déploiement (résumé)

1. `npm run build` puis `npx netlify deploy --prod --dir=dist`
2. `git add docker/dist-manifest.txt && git commit && git push origin main`
3. Sur le VPS : `docker compose up -d --force-recreate web`

La CI (`.github/workflows/ci.yml`) doit être verte avant l'étape 2. Détails et garde-fous dans `CLAUDE.md`.
