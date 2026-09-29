---
date: 2026-09-29
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Vérifier la conservation des exécutions du workflow n8n du chat, avant de laisser « Rien n'est stocké au-delà de la conversation » en ligne
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

- **Relecture des quatre paragraphes « Ce que ça change »** visibles depuis le 28/09
  (Audityo, DreamOracle, chat du site, L'Artpéro), lus tels que la production les sert,
  en fr, en et nl, et vérifiés dans le navigateur. Aucun chiffre, aucune promesse de
  conformité. Le chat : rien à redire. Trois points à trancher, **rien modifié** :
  - Audityo dit « un produit **du groupe** » (EN « group product », NL « van de groep ») :
    Distr'Action est une seule SRL, pas un groupe.
  - L'Artpéro dit « jusqu'au **paiement encaissé** » : le paiement Stripe est câblé dans
    l'application, mais rien de visible depuis l'extérieur ne prouve qu'il tourne en mode
    réel ni qu'un paiement a été encaissé. L'anglais « the payment landing » est maladroit.
  - DreamOracle ne dit rien de vérifiable (« la démonstration d'une capacité ») ; le
    néerlandais dit « het bewijs », plus fort que le français.

- **Les trois formulations corrigées et déployées**, sur décision de Laurent, dans les
  trois langues :
  - Audityo : « un produit **de Distr'Action**, en service ».
  - L'Artpéro : « jusqu'au **paiement en ligne** » ; l'anglais devient « to paying online ».
  - DreamOracle : « En ligne, installable sur téléphone, ouvert au public. » Les trois faits
    vérifiés sur le site : il répond, son manifeste déclare une application autonome,
    l'inscription est ouverte avec un essai gratuit.
  Même chaîne de déploiement, manifeste de nouveau inchangé (214). Vérifié dans le HTML
  brut des neuf pages (nouvelle phrase présente, ancienne absente) et au navigateur.
  Contrôle de santé 27/27, CI verte.

- **Fiche AutoSEO** : « les trois marques du groupe » devient « les trois marques de
  Distr'Action », en fr, en et nl, sur décision de Laurent ; l'accord fautif de la phrase
  anglaise est corrigé au passage. Plus aucune occurrence de « groupe » dans les locales, le
  code ni le backend. Même chaîne de déploiement, manifeste inchangé (214), 214/214 sur le
  CDN, vérifié dans le HTML brut des trois langues et au navigateur, contrôle de santé
  27/27, CI verte.

- **Article de blog du 25/09 sur l'automatisation SEO, en base** (trois lignes fr, en, nl) :
  Distr'Action n'y est plus « un groupe », sur décision de Laurent. Dix remplacements, en
  texte littéral (`replace()`, jamais d'expression régulière), dans une seule transaction qui
  refusait tout si une phrase d'origine n'apparaissait pas exactement une fois :
  « groupe spécialisé » → « société spécialisée » (et « a company », « een bedrijf »),
  « marque du groupe » → « marque de Distr'Action », « groupes multi-marques » →
  « structures multi-marques », et l'extrait français affiché sur l'accueil. « Doelgroepen »
  (publics cibles) laissé tel quel. Sauvegarde des trois lignes avant modification :
  `/root/backups/blog-seo-25-09-before-20260929_113427.csv` sur le VPS, lisible par root
  seulement. Vérifié : HTML brut des trois articles à leur adresse canonique, extrait de
  l'accueil, API publique, rendu navigateur ; contrôle de santé 27/27.

## Cassé

- Rien.

## Reste

- **Le fil d'Ariane reste en français sur les pages anglaises** (« Accueil »,
  « Réalisations » sur `/en/realisations/autoseo`). Défaut antérieur, vu en relisant.
- **Le chat affirme « Rien n'est stocké au-delà de la conversation »** : à confronter au
  réglage de conservation des exécutions du workflow n8n, qui peut garder les messages.
