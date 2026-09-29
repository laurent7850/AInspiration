---
date: 2026-09-29
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Relire en production les paragraphes « Ce que ça change » d'Audityo, DreamOracle, du chat du site et de L'Artpéro, visibles depuis le 28/09
---

## Fait

- **La fiche `/realisations/communityos` dit désormais « publié le 29 septembre 2026 »**
  au lieu de « planifié pour le 29 septembre 2026 à 8 h 30 », en fr, en et nl. C'était le
  point ouvert par la note du 28/09 : ne rien laisser en ligne d'invérifiable.
- **Pourquoi l'heure disparaît** : l'envoi de 8 h 30 a été refusé par LinkedIn, et le post
  est parti le même matin après correction côté CommunityOS. « Planifié pour 8 h 30 »
  restait exact mais laissait croire à une publication à cette heure-là. Le fait vérifiable
  est la publication du 29/09, confirmée par le reçu en base de CommunityOS et par la page
  du post sur LinkedIn.
- Seul le paragraphe `items.communityos.results` des trois `realisations.json` portait
  l'heure (grep sur `src`, `public/locales`, `docker/backend`).
- Déployé dans l'ordre : commit des sources, build (garde-fou `public/` conforme à HEAD),
  **manifeste inchangé** (214 entrées : les locales ne portent pas d'empreinte, rien à
  commiter), push, `netlify deploy --prod`, **214/214 vérifiées sur le CDN** et texte
  corrigé servi par le CDN dans les trois langues, `--force-recreate`, « Frontend: 214 files
  downloaded ». Vérifié en production : HTML brut des trois langues (nouvelle phrase
  présente, ancienne heure absente) et rendu navigateur. Contrôle de santé 27/27, CI verte.

## Cassé

- Rien.

## Reste

- Relire en production les quatre paragraphes de résultats rendus visibles le 28/09
  (Audityo, DreamOracle, chat du site, L'Artpéro).
