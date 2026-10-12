---
date: 2026-10-12
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: le 13/10 après 10 h, ouvrir /crm-dashboard en admin et vérifier que « Dernière collecte » date du matin même — preuve que les lectures de 6 h et 10 h ont eu lieu
---

## Fait

- **Carte « Coûts OpenRouter » sur le tableau de bord CRM** (`/crm-dashboard`, onglet
  Vue d'ensemble, sous les accès rapides). Quatre chiffres (aujourd'hui, 7 jours, mois
  en cours, à refacturer), tendance du mois si la période précédente existe, cinq
  premières applications avec client et coût, mention des clés non rattachées, date
  de dernière collecte (heure de Bruxelles), lien « Ouvrir ORcosts » en nouvel onglet
  avec `rel="noopener noreferrer"`. Montants en `fr-BE` : « 1 234,56 € ». Textes en
  français, en dur, comme les cartes voisines du tableau de bord.
- **Le jeton ORcosts ne quitte jamais le serveur.** `docker/backend/orcosts.js` lit
  `ORCOSTS_API_TOKEN` et `ORCOSTS_API_URL` au moment de l'appel, pose un délai de 5 s,
  valide la réponse avec un schéma Zod **strict** (clé inconnue ou type inattendu =
  indisponible), tronque aux cinq premières applications **côté serveur**, et retient
  le résultat. **D'abord 5 minutes ; puis, sur décision de Laurent le soir même,
  quatre lectures par jour** — 6 h, 10 h, 14 h, 18 h heure de Bruxelles, le résultat
  retenu jusqu'au créneau suivant, les chiffres de 18 h affichés jusqu'à 6 h. Calcul
  dans le fuseau de Bruxelles ; les deux nuits de changement d'heure décalent la
  lecture de 6 h d'une heure, assumé. Un échec est retenu 60 s, ou le `Retry-After`
  d'un 429 (borné à 5 min), pour réessayer sans marteler un service qui vient de
  refuser. Côté navigateur, `staleTime` passe à 15 min.
  Des appels simultanés ne font qu'une requête. Variable absente = porte fermée,
  jamais un appel sans jeton. Les journaux portent le code HTTP et les chemins
  fautifs du schéma, jamais le jeton, l'URL interne ni les valeurs.
- **Une route, privée, admin seulement :** `GET /api/admin/orcosts-summary`.
  Anonyme → 401 (le contrat `auth-routes.test.mjs` la découvre et l'impose),
  authentifié non-admin → 403 : les identifiants du compte démo sont publics, ses
  chiffres ne le sont pas. Aucun paramètre accepté. Réponse `Cache-Control: private,
  no-store`. Le navigateur reçoit `{ available: true, totals, applications,
  unassignedKeys, lastCollectionAt, dashboardUrl }` ou `{ available: false, reason,
  dashboardUrl }` — jamais le message d'erreur d'origine.
- **Écart assumé à la consigne « la carte se rend côté serveur, pas de nouvelle route ».**
  L'admin AInspiration est une application React servie en statique : rien n'y est
  rendu sur le serveur, et toute donnée affichée passe par une requête. Ce qui est
  côté serveur, c'est tout ce qui compte (appel, jeton, validation, cache,
  troncature) ; la route ajoutée n'est pas publique. L'alternative — faire rendre un
  fragment HTML par Express et l'injecter dans React — aurait exigé une route tout
  autant, avec une surface XSS en plus.
- **Tests :** `docker/backend/test/orcosts.test.mjs` (20 cas : fixture de la consigne,
  schéma strict, cache, 401/429/503/réseau/délai, route contre un vrai `server.js`
  et un faux ORcosts local, 503 amont → 200 + indisponible sans le message) ;
  `src/components/crm/OpenRouterCostsCard.test.tsx` (9 cas : non-admin ne rend rien
  et n'appelle rien, chiffres et format belge, tendance nulle, pluriel des clés,
  indisponible pour `unauthorized`/`rate_limited`/`unavailable` et sur erreur de
  requête). `npm test` backend 162/162, `vitest` 104/104, `npm run lint` 0 erreur
  0 avertissement, `tsc` propre.
- `orcosts.js` et `routes/orcosts.js` ajoutés à `docker/backend/files.txt` ; la route
  est enregistrée dans `server.js` ; le script `npm test` du backend inclut le nouveau
  fichier ; variables documentées dans `CLAUDE.md`.

- **Déployé et vérifié le même jour, sur ordre de Laurent.** Push (CI verte), `npm run
  build` (manifeste `01abfc7`), Netlify en production, recreate de `web`
  (19 fichiers backend, 215 fichiers frontend). Contrôles : anonyme → 401 sur la
  route ; l'`index` servi est celui du build et le chunk `CrmDashboardPage` contient la
  carte ; dans le conteneur, les deux variables sont présentes et le **client de
  production** lit ORcosts en 200 par `http://orcosts-app-1:3000` — la réponse réelle
  passe le schéma strict (5 applications, 1 clé non rattachée, tendance chiffrée) ;
  contrôle de santé **28/28**.
- **Trouvé en déployant : le compose du VPS ne transmettait pas les variables.** Elles
  étaient dans `/docker/ainspiration/.env`, mais rien ne les passait au service `web`
  (le conteneur n'a pas ce `.env`, dotenv y lit `/app/.env`, vide). Ajoutées sur le
  modèle des autres secrets, `ORCOSTS_API_URL: ${ORCOSTS_API_URL}` et
  `ORCOSTS_API_TOKEN: ${ORCOSTS_API_TOKEN}`, sous `TASK_OWNER_EMAIL` ; sauvegarde
  `docker-compose.yml.bak-20261012-orcosts`. Sans cela la carte aurait dit
  « indisponible » (`not_configured`) et rien d'autre — c'est le comportement voulu,
  mais ça aurait été muet. Règle inchangée : **une variable vit dans le `.env` ET dans
  le compose**, voir la note de mémoire sur l'ingestion.

## Cassé

- Rien.

## Reste

- **`.env.example` complété par Laurent** (`ORCOSTS_API_URL=`, `ORCOSTS_API_TOKEN=`,
  vides) : la session refuse toute lecture et toute écriture sur `.env*`, la commande
  PowerShell lui a été fournie.
- **`.env.local` pour le développement** : valeur dans 1Password (coffre
  « Distr'Action SRL », entrée « ORcosts — API token »). Note : en dev, le proxy Vite
  envoie `/api` vers le VPS de production ; le backend local ne sert que si on le
  lance avec sa propre base.
- **Vérification visuelle faite par Laurent** dans son navigateur : la carte s'affiche
  connecté en admin, sous les accès rapides ; rien en démo. Chantier clos.
- Trouvé en relançant la suite backend : **les tests de route d'`orcosts` tiraient
  leurs ports dans 3700-3799, déjà pris par `audityo-probe` et `task-secret`** — huit
  échecs transitoires une fois. Déplacés en 3600-3699. (`audityo-probe` et
  `task-secret` se chevauchent toujours entre eux, préexistant, non touché.)
