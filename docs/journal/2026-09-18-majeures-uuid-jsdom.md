---
date: 2026-09-18
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Fusionner la PR #36 puis déployer en bloc
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
- **Tailwind 4 (#32) laissée dehors** : sa CI échoue, et ce n'est pas une montée de version mais
  une refonte de thème. Elle mérite sa propre session.

## Cassé

- Rien. Un `npm ci` a échoué une fois sur `EBUSY: resource busy or locked` — OneDrive tenait un
  fichier de `lucide-react` pendant sa synchronisation. Relancé, passé. À garder en tête : sur ce
  dépôt, un échec d'installation n'est pas forcément un problème de dépendances.

## Reste

- **La PR #36 n'est pas fusionnée et rien n'est déployé.**
- Vérifications faites en passant, toutes deux conformes à ce que la session voisine venait de
  corriger, et non des découvertes indépendantes : `audityo-postgres` est reparti le 18/09 à
  16:51 UTC (arrêt propre, redémarrage sans erreur), et le bridage du VPS est bien levé —
  steal à 2–6 % et load average à 0,75, contre 91 % et 38 quelques heures plus tôt.
