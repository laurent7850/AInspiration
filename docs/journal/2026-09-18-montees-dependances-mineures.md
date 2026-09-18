---
date: 2026-09-18
projet: AInspiration
ou: Claude Code
type: Avancée
notion: https://app.notion.com/p/3dffb662f4aa81d59823d51424ae55e0
prochaine-action: Vérifier la publication du lundi 21/09 — les trois langues doivent sortir
---

## Fait

- Point de situation vérifié sur le dépôt, GitHub et la production plutôt que lu
  dans le handoff : site et API à 200, CI verte, arbre propre.
- Les deux PR Dependabot **mineures** regroupées dans une seule branche
  `chore/deps-2026-09` → **PR #34**, pour que la CI les vérifie ensemble et non
  isolément : react 19.2 → 19.3, vite 8.2 → 8.3, lucide-react 1.42 → 1.44,
  autoprefixer, les `@types`, et zod 4.5.4 → 4.6.2 côté backend.
- Vérifié en local avant de pousser : typecheck, lint à `--max-warnings 0`,
  84 tests front, 118 tests backend (dont celui qui verrouille `guid()` face au
  piège Zod 4), build, `npm audit` front et backend à 0 vulnérabilité.
  Toutes les vérifications de la CI repassent vertes sur la PR.
- Vite 8.3 signalait `__dirname` dans `vitest.config.ts` comme incompatible avec
  le chargeur de configuration natif, futur défaut. Aligné sur `vite.config.ts`,
  qui utilise déjà `import.meta.dirname`.
- **Le manifeste a été tenu hors de la PR, puis committé après le déploiement** (`9db1a5a`).
  Ces montées changent 72 hachages de chunks : un manifeste décrivant un build absent de
  Netlify casserait le site à la prochaine recréation du conteneur, exactement comme le 08/06.
  L'ordre n'est donc pas une précaution de style, c'est le seul ordre sûr.
- PR Dependabot #29 et #30 fermées d'elles-mêmes à la fusion, GitHub ayant reconnu leurs
  commits dans #34.
- **PR #34 fusionnée et déployée en production.** Dans l'ordre imposé : build (le hook
  `postbuild` régénère le manifeste, 211 entrées) → `netlify deploy --prod` → **vérification
  des 211 entrées une à une sur le CDN**, plus le contrôle que GitHub raw servait bien le
  nouveau manifeste → commit du manifeste → `docker compose up -d --force-recreate web`.
  Le conteneur a téléchargé 16 fichiers backend et 211 fichiers frontend, serveur démarré.
- Vérifié en production **sur le HTML brut, pas sur les codes de retour** : 8 liens d'articles
  sur l'accueil, 8 `<h2>` dans un article, `id="seo-fallback"` sans attribut de masquage,
  404 sur route inconnue et sur asset manquant (les deux garde-fous tiennent).
  `scripts/health-check.mjs` : 25 vérifications vertes.
- Chantier 1 du handoff corrigé : il annonçait « construire `/realisations` »
  alors que la page existe depuis le 04/09 — 16 fiches, pages détail comprises,
  et `/realisations/facturation-automatisee` répond 200 en production.

## Cassé

- **502 pendant environ trois minutes** après la recréation du conteneur, le temps que
  Traefik re-résolve la nouvelle adresse. Le serveur répondait 200 en interne pendant ce
  temps. Ce n'est pas une panne, c'est le coût normal d'un `--force-recreate` : le conteneur
  retélécharge 16 fichiers backend puis 211 fichiers frontend, **compter cinq à six minutes
  d'indisponibilité** et ne pas conclure à l'échec avant. Un `docker cp` du `dist/` évite
  cette fenêtre si un jour elle coûte trop cher.
- Une erreur de lecture de ma part, corrigée dans l'heure :
  j'ai annoncé quatre commits non poussés alors qu'ils l'étaient. La cause est
  que `git fetch origin main` ne met à jour que `FETCH_HEAD`, pas la référence
  de suivi `origin/main` — qui datait du 12/09. Piège ajouté au handoff.

## Reste

- Trois majeures Dependabot laissées de côté, chacune méritant son passage :
  Tailwind 4 (#32, le plus lourd), uuid 14 (#31), jsdom 30 (#33).
- La publication du lundi 21/09 reste le seul vrai test en attente : le correctif
  des antislashes n'a jamais été éprouvé, l'article du 16/09 n'a toujours ni EN ni NL.
  Le contrôle de santé le dit à sa façon — **0 hreflang** sur cet article, contre 4 sur un
  article qui a bien ses trois langues. C'est le seul échec restant, et il préexistait.
