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
- Troisième passage : les 14 pages privées (CRM, administration, connexion,
  désinscription) sortent de l'index dans les trois langues. `noindex, nofollow` dans le
  HTML servi par le serveur et après chargement, 84 lignes `Disallow` ajoutées à
  `robots.txt` pour les formes `/en` et `/nl`, plus de `hreflang` sur ces pages. Nouveau
  contrôle `private` dans le contrôle de santé : 15 échecs contre la production avant le
  déploiement, 0 après (28/28). Pages publiques voisines vérifiées intactes (`/contact`,
  `/produits` : pas de `noindex`, 4 `hreflang`).

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
- Aucune page privée ne portait de consigne de non-indexation dans le HTML servi, et
  `robots.txt` n'excluait que leurs formes françaises : `/en/contacts` ou `/nl/contacts`
  n'étaient exclues nulle part. `/dashboard` n'avait pas de `SEOHead`.
- Mon propre piège du 05/10 m'a rattrapé : une correction de script passée par le shell
  a été dénaturée (antislashes mangés). Reprise par l'outil d'écriture.

## Reste

- `PRIVATE_ROUTES` (serveur) et le bloc privé de `robots.txt` sont deux listes à tenir
  alignées à la main ; le contrôle `private` n'en échantillonne que trois routes.
