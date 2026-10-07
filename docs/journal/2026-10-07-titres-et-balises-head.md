---
date: 2026-10-07
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Faire valider par Laurent les quatre sections ajoutées aux mentions légales (§8 à §11)
---

## Fait

- Titres de page : une seule source, `seoConfig.ts`. 27 pages imposaient leur propre titre
  par une prop de `SEOHead`, souvent différent de celui du serveur (`/audit`, `/transformation`,
  `/crm`, pages du CRM). Retiré ; seules les pages dynamiques gardent le leur (article,
  fiche réalisation, 404). Tous les titres servis font désormais 60 caractères au plus
  (guide, audio, vidéo et page Hainaut en néerlandais raccourcis). Mentions légales en
  néerlandais : « Wettelijke Vermeldingen ».
- Fiche réalisation : le titre après chargement était « X | Réalisations | Ce que nous
  avons construit | AInspiration » ; il suit maintenant le serveur, « X | AInspiration ».
- Déployé dans l'ordre habituel (215/215 sur le CDN, conteneur recréé), contrôle de santé
  27/27, CI verte. Vérifié dans un navigateur sur six pages, plus une navigation interne :
  un seul titre, un seul canonique dans la bonne langue, aucune balise en double.
- Deuxième passage : plus aucune page n'impose ses mots-clés (`/crm`, `/realisations`) ;
  `/linkedin`, `/blog-admin` et `/newsletter-admin` ont désormais leur entrée dans
  `seoConfig`, en trois langues, et un `noindex, nofollow`. 12 clés de locales mortes
  retirées. Vérifié en production : HTML servi des trois pages, `robots.txt`, et dans un
  navigateur les mots-clés de `/crm` et `/nl/realisations`. Les pages d'administration
  exigent une connexion : leur rendu après chargement n'a pas été vérifié dans un
  navigateur, seulement par le code, le typage et les tests.

## Cassé

- En traitant les titres, trois défauts de la même famille, tous invisibles dans le HTML
  brut et donc dans tous les contrôles existants :
- **Le canonique des pages `/en` et `/nl` pointait vers la page française** dès qu'une page
  passait un chemin à `SEOHead` (`canonical="/audio"`), émis tel quel. Résolu dans la langue
  de la page.
- **Après chargement, toute la tête de page était en double** : React 19 pose les balises de
  `SEOHead` sans retirer celles du serveur. Deux titres, deux canoniques (dont le français
  ci-dessus), deux jeux Open Graph et Twitter. `src/utils/serverHead.ts` met les balises du
  serveur de côté avant le démarrage de React et retire chacune dès que React a posé son
  équivalent. S'il était chargé trop tard, il ne retirerait rien.
- **Le serveur ne réécrivait jamais `twitter:title` et `twitter:description`** : toutes les
  pages, dans toutes les langues, annonçaient le titre et le texte français de l'accueil aux
  robots sans JavaScript. Et `og:locale` restait `fr_BE` en anglais et en néerlandais.
- `/blog` portait deux `SEOHead`, la page et le composant `Blog` ; celui du composant
  l'emportait, avec ses propres textes. La description néerlandaise corrigée le 05/10
  n'était donc pas celle affichée.
- `SEOHead` imposait une couleur de thème `#4f46e5` (l'ancien indigo) par-dessus celle
  d'`index.html` (`#10102A`) : retirée.
- `/newsletter-admin` n'avait aucun `SEOHead` : la page gardait les balises de la page
  d'où l'on venait.
- `/linkedin` n'avait ni `noindex` ni ligne `Disallow` dans `robots.txt`, contrairement à
  toutes les autres pages privées. Les deux ajoutés.
- Mon propre piège du 05/10 m'a rattrapé : une correction de script passée par le shell
  a été dénaturée (antislashes mangés). Reprise par l'outil d'écriture.

## Reste

- Les pages du CRM (`/contacts`, `/opportunities`…) n'ont pas de `noindex`, et `robots.txt`
  n'exclut que leur forme française : `/en/contacts` et `/nl/contacts` ne le sont nulle part.
  Exposition faible (connexion obligatoire), mais incohérent avec les autres pages privées.
