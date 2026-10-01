---
date: 2026-10-01
projet: AInspiration
ou: Claude Code
type: Point de situation
notion: non
prochaine-action: Laurent choisit entre isoler les aperçus Netlify, monter une préproduction, ou les deux
---

## Fait

- Vérifié, à la demande de Laurent, s'il existe un environnement de développement
  séparé de la production. **Réponse : non.**
- Branches `production` (dernier commit 26/02/2026) et `developpement` (25/03/2026)
  abandonnées ; tout le travail passe par `main`, qui est la production.
- Le conteneur de production télécharge backend, `files.txt` et migrations depuis
  `main` sur GitHub au démarrage : un push sur `main` part en production au prochain
  recreate, sans étape intermédiaire.
- Sur le VPS : `ainspiration-web` et `ainspiration-postgres` seulement. Audityo a un
  jumeau `audityo-dev-*`, AInspiration non.

## Cassé

- Rien de cassé, mais un risque trouvé : les deploy previews et branch deploys Netlify
  ne redéfinissent pas `VITE_API_URL` dans `netlify.toml`. Ils appellent donc
  `https://ainspiration.eu/api` — un formulaire testé sur un aperçu écrit dans la base
  de production.

## Reste

- Isoler les aperçus de l'API de production (petit).
- Préproduction complète sur le modèle d'Audityo (gros) — vérifier d'abord la marge
  CPU/RAM du VPS.
- Supprimer les branches `production` et `developpement`.
- Rien n'a été modifié : en attente de l'arbitrage de Laurent (chantier 10 du HANDOFF).
