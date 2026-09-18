---
date: 2026-09-18
projet: AInspiration
ou: Claude Code
type: Avancée
notion: https://app.notion.com/p/3dffb662f4aa81569648c46c44b104aa
prochaine-action: Refaire le document SLA dans Notion — il décrit toujours l'ancienne offre
---

## Fait

- **Chantier 0 exécuté et déployé** (PR #35). Le site ne contredit plus l'offre O1–O5,
  textes contractuels compris.
- **CGV** : section 3 réécrite pour le rendez-vous de découverte, sans renuméroter. Le point
  de fond, c'est que l'entretien ne donne lieu à **aucun livrable** : la clause de
  responsabilité ne pouvait donc plus porter sur « les recommandations formulées dans le
  rapport d'audit ». Elle porte désormais sur les livrables réels des prestations payantes,
  définis au devis. La clause RGPD décrit le flux qui existe : les formulaires alimentent
  le CRM depuis le 15/09.
- **Section 11 vidée de ses engagements chiffrés** — 99 % de disponibilité, 24h pour les
  audits, 5 jours ouvrés pour les Packs Express, 4h sur incident critique — et du renvoi au
  document SLA. Laurent a tranché « retire ». Je n'ai pas réécrit de niveaux : ce sont des
  engagements opposables, et il n'avait pas dit ce qu'il voulait tenir. Tout renvoie au
  devis, avec une phrase explicite : *aucun engagement de niveau de service ne s'applique
  par défaut*.
- **Politique de confidentialité** : conservation de 12 mois gardée — c'est une vraie clause
  RGPD — phrase sur le rapport d'audit retirée, section réécrite pour les formulaires et le CRM.
- **Article « Thierry » retiré**, 301 serveur et client vers `/realisations`. Le retrait
  était plus propre que prévu : absent de la base, absent du sitemap généré, aucun lien
  interne depuis un composant.
- **Grille tarifaire du CRM retirée entièrement** (arbitrage de Laurent) : 29/49 € par
  utilisateur et par mois, Enterprise sur mesure, « 150+ intégrations », applications
  mobiles. Un produit qui n'est pas en vente. Même traitement pour la création visuelle.
- Déployé dans l'ordre : build → Netlify → vérification des 209 entrées sur le CDN → commit
  du manifeste → recréation du conteneur. Vérifié en production sur le HTML brut, motif
  large et insensible à la casse, sur quinze URL des trois langues : **zéro occurrence**.
  `scripts/health-check.mjs` : 23 vérifications vertes.

## Cassé

- **Mon « zéro occurrence » du matin était faux.** Je cherchais « audit gratuit » ; le texte
  disait « audit **IA** gratuit ». Trois formes ont traversé toutes les passes de la journée
  pour cette seule raison : `audit IA gratuit`, `Free AI audit`, `Gratis AI-audit`. Elles
  vivaient dans la **seconde carte SEO du backend** (`routeSEO` dans `seo.js`, que je ne
  savais pas distincte de `seo-routes.json`), dans les liens de service injectés dans le HTML
  brut de chaque page, dans les titres `/audit` et `/contact` des trois langues, et dans les
  six gabarits de posts LinkedIn prévus pour la campagne. Conséquence concrète : `/contact`
  affichait encore « Contact | Audit IA Gratuit Belgique » quand j'ai ouvert la PR.
- **Deux fichiers m'ont fait viser à côté.** `public/sitemap.xml` est écrasé à chaque build
  par `scripts/vite-plugin-sitemap.ts` : la note de cadrage demandait d'y corriger une entrée,
  alors que rien de ce fichier n'est servi. Et `CreationVisuellePage.tsx` n'avait ni route ni
  import, mais portait une troisième grille tarifaire complète. Les deux sont supprimés.
- J'ai d'abord écrit le texte des CGV avec des `**` de markdown, qui se seraient affichés tels
  quels : la page rend le texte brut, sans interprétation. Rattrapé avant la PR.

## Reste

- **Le document SLA dans Notion décrit toujours l'ancienne offre.** Le renvoi « disponible sur
  demande » a été retiré des CGV, donc plus personne ne peut le réclamer sur la foi du site —
  mais le document existe et reste à refaire. Hors dépôt.
- **Si Laurent veut tenir des niveaux de service chiffrés sur O4**, la section 11 est prête à
  les accueillir : il n'y a qu'à les écrire. Aujourd'hui elle n'en promet aucun.
- La publication du **lundi 21/09** reste le seul vrai test en attente : l'article du 16/09
  n'a toujours ni EN ni NL, et le contrôle de santé le signale par ses 0 hreflang. C'est le
  seul échec restant.
- **Le VPS est bridé par Hostinger** (diagnostic de la session Cowork, chantier 6) : pendant le
  déploiement, la charge est montée de 20 à 38 et le contrôle de santé a signalé deux fois des
  pages injoignables qui répondaient en moins de deux secondes au test direct. Ce n'est pas une
  régression applicative — mais tant que le bridage dure, un contrôle vert demande parfois deux
  passages.
