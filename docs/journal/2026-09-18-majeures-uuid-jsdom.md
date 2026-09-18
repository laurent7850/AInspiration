---
date: 2026-09-18
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Tailwind 4 (#32) dans une session dédiée — sa CI échoue, c'est une refonte de thème
---

## Fait

- **PR #36 ouverte, CI verte** : uuid 11 → 14 et jsdom 27 → 30, regroupées dans une seule
  branche pour que la CI les vérifie ensemble — même recette que la PR #34 pour les mineures.
- **uuid 14 était moins risqué qu'il n'y paraissait.** Le backend tourne **déjà** en 14.0.2 en
  production et y appelle `v4` dans `ingest.js` et `content-generator.js` : l'API n'a donc pas
  cassé, et c'est l'usage réel qui le prouve, pas une lecture de changelog. Côté frontend, uuid
  n'a qu'un consommateur, `ChatbotN8n.tsx`, pour l'identifiant de session et ceux des messages.
  Vérifié à l'exécution, sur les deux paquets, que `v4()` rend toujours un UUID conforme RFC.
- Vérifié en local avant de pousser : typecheck, lint `--max-warnings 0`, 84 tests front
  **sous jsdom 30**, build, `npm audit` à 0 vulnérabilité.
- **PR #36 fusionnée et déployée.** Build, Netlify, vérification des 209 entrées sur le CDN,
  commit du manifeste, recréation du conteneur. Le vérificateur a porté sur ce qui dépend
  vraiment d'uuid : le chunk `ChatbotN8n` se sert en 200 avec le bon type MIME et contient
  toujours sa logique de session. Contrôle de santé : 24 vérifications vertes, zéro avertissement.
- Sans le bridage, la recréation du conteneur a pris quelques minutes au lieu de traîner, et le
  contrôle de santé s'exécute en **7 secondes** contre une centaine ce matin.
- **Tailwind 4 (#32) laissée dehors** : sa CI échoue, et ce n'est pas une montée de version mais
  une refonte de thème. Elle mérite sa propre session.

## Cassé

- **J'ai fait disparaître 50 URL du sitemap, et je ne l'ai pas vu tout de suite.** Le build
  Netlify qui a suivi la fusion n'a pas pu joindre `/api/blog-posts` : `vite-plugin-sitemap.ts`
  va chercher les articles publiés **pendant** le build et, en cas d'échec, se contente d'un
  `console.warn` et produit le sitemap sans eux. Le fichier servi est passé de **89 à 39 URL**
  sans qu'aucune étape n'échoue, et le conteneur l'a fidèlement téléchargé.

  C'est `scripts/health-check.mjs` qui l'a attrapé, par un avertissement latéral : « 37/39
  lastmod equal today — git dates lost at build? ». Le symptôme qu'il décrivait n'était pas le
  bon, mais il a suffi à faire regarder. Sans lui, je déclarais le déploiement réussi.

  Corrigé en rejouant le déploiement, l'API répondant à nouveau, puis en poussant le seul
  `sitemap.xml` dans le conteneur — les hachages d'assets étaient identiques, une recréation
  complète pour un fichier n'avait pas de sens. **Règle qui en sort : après chaque déploiement,
  compter les `<loc>` du sitemap servi.** Un 200 ne prouve rien, encore une fois.
- Un `npm ci` a échoué deux fois sur `EBUSY: resource busy or locked` — OneDrive tenait un
  fichier de `lucide-react` pendant sa synchronisation. `rm -rf node_modules` puis relancer suffit.
  Sur ce dépôt, un échec d'installation n'est pas forcément un problème de dépendances.

## Reste

- **Tailwind 4 (#32)** est la dernière majeure. Sa CI échoue, et ce n'est pas une montée de
  version : c'est une refonte de thème, qui demande sa propre session.
- Vérifications faites en passant, toutes deux conformes à ce que la session voisine venait de
  corriger, et non des découvertes indépendantes : `audityo-postgres` est reparti le 18/09 à
  16:51 UTC (arrêt propre, redémarrage sans erreur), et le bridage du VPS est bien levé —
  steal à 2–6 % et load average à 0,75, contre 91 % et 38 quelques heures plus tôt.
