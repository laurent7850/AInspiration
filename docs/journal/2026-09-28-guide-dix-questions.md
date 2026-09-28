---
date: 2026-09-28
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Laurent épingle le PDF ou le lien /guide dans la « Sélection » de son profil LinkedIn, puis programme le post (texte prêt, lien https://ainspiration.eu/guide)
---

## Fait

- **`https://ainspiration.eu/guide` publié et vérifié en production**, en fr/en/nl :
  titre, deux phrases du guide, bouton « Télécharger le guide (PDF, 3 pages) », les dix
  questions, lien de réservation cal.com. Les pages en/nl disent que le document est en
  français.
- **Le PDF est servi sur `/guides/dix-questions-avant-d-automatiser.pdf`** (200,
  `application/pdf`, identique octet pour octet au fichier du dépôt). `/guide/` → 301 →
  `/guide`, une seule redirection. Le HTML brut porte le titre et les questions en `h2`
  (13), `/en/guide` sert `lang="en"` et son titre anglais, l'URL est au sitemap.
- **Le PDF n'avait plus de source** : le script du 16/09 n'a jamais été gardé.
  `scripts/guides/dix_questions.py` le reconstruit à l'identique (texte, Poppins, tailles et
  couleurs relevés dans le flux de l'original) — vérifié **ligne pour ligne** : 39, 42 et
  36 lignes, comme l'original. Polices Poppins (OFL) jointes.
- **Pied de page et signature : Givry, et non Enghien.** Le siège est à Givry
  (`ops/CONTEXTE.md`) et le site dit « Basé à Givry » partout.
- Déploiement dans l'ordre imposé : commit des sources, build (garde-fou : 133 fichiers de
  `public/` conformes à HEAD), commit + push du manifeste, Netlify (214 entrées sur 214
  servies par `ainspiration2026.netlify.app`), CI verte, puis
  `compose-exact ainspiration-web up -d --force-recreate web`. 502 pendant ~90 s au
  démarrage du conteneur, puis 200.

## Cassé

- Rien en production. Un fichier `__pycache__` commité par erreur puis retiré, ignoré
  désormais.

## Reste

- **Pourquoi la page LinkedIn de Laurent était « vide »** : le plan du 16/09
  (`Documents/Distr'Action/commercial/linkedin-banniere-et-selection.md`) prévoyait
  d'épingler ce PDF comme **Document** dans la section « Sélection » du profil — une
  action manuelle que l'API LinkedIn ne permet pas, jamais cochée. La bannière décrite
  dans ce même fichier dit elle aussi « Enghien ».
- Un post LinkedIn présentant les dix questions, avec le lien `/guide`, est rédigé (session
  du 28/09) ; à programmer dans CommunityOS, qui publie sur le profil membre.
- Pour régénérer le PDF : `python -m pip install reportlab` puis
  `python scripts/guides/dix_questions.py`, et commiter avant `npm run build`.
