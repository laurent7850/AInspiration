# Audit préalable — section « Réalisations »

> Phase 0 de `docs/PROMPT-realisations.md`. Aucun fichier de production n'a été modifié.
> Rapport établi le 3 septembre 2026 sur `feat/realisations`, base `main` @ `b88620e`.
>
> **Arbitrages déjà rendus par Laurent**
> 1. La section **complète** `/etudes-de-cas` — elle ne la remplace pas.
> 2. Le contenu est livré en **FR / EN / NL**.
> 3. Le projet n° 1 devient **le chat IA du site, en démo vivante** — le volet
>    « widget embarquable multi-clients » est abandonné (§4.7).
> 4. **TL Services entre dans la grille** comme treizième réalisation (§4.8).
> 6. **Rampa — le guide des enseignements** est signalé comme quinzième réalisation.
>    En ligne, mais **hors de portée d'ici** et sans dépôt localisé (§4.11).
> 5. « Brasspat » n'est **pas un chatbot** : c'est l'outil de réconciliation de caisse.
>    Projet d'origine chez la **Brasserie de la Patinoire**, redéployé en variante chez
>    **Saint Kilda**. Quatorzième réalisation, et la vraie preuve de réutilisation de la
>    vitrine (§4.10).

---

## 0. Résumé — ce qu'il faut lire même en diagonale

**Le dépôt est prêt à accueillir la section.** L'infrastructure que le brief demande de
construire (SEO par page, hreflang, JSON-LD, fil d'Ariane, sitemap, i18n trilingue,
composants Aurora) **existe déjà et est de bonne qualité**. Il n'y a rien à inventer :
il y a à consommer.

**Sept points du brief ne résistent pas à la vérification.** Ils sont détaillés en §4 et
récapitulés ici, parce qu'ils changent le travail :

| # | Le brief dit | La vérification montre |
|---|---|---|
| 1 | Audityo : « Supabase, Clerk » | **Prisma + PostgreSQL 16, Auth.js v5**. Ni Supabase ni Clerk. |
| 2 | Audityo : « avant l'échéance d'août 2026 » | L'échéance du **2 août 2026 est passée**. L'angle « anticipez » est mort. |
| 3 | Facturation : « Calendar → tarifs → Sheets → email » | Il manque **la moitié du produit** : le workflow calcule *aussi* la projection du mois en cours et envoie un tableau comparatif. |
| 4 | Facturation : cas client d'« un groupe radio francophone » | Le calendrier lu, les tarifs appliqués et le destinataire de l'email sont **ceux de Laurent**. C'est son propre système de facturation, pas une livraison client. |
| 5 | Enghien : « un livre de 1876 » | Le corpus contient **deux ouvrages**, dont un de 1998 **sous droits** (autorisation de l'ayant droit). |
| 6 | « Plus de 30 automatisations » | **36 workflows** sur l'instance — mais beaucoup sont internes (sauvegardes, healthchecks, error trigger). Le chiffre « livrées » n'est pas celui-là. |
| 7 | Chatbot embarquable « déjà déployé chez plusieurs clients » | **Aucune trace vérifiable** dans onze dépôts : pas d'`embed.html`, pas de captation de leads, aucun déploiement client. La « brasserie » du brief n'a **jamais eu de chatbot** : c'est le projet de réconciliation de caisse (§4.10). → **arbitré, §4.7**. |

**Deux décisions bloquantes** restent avant de coder : §7, questions 2 et 3.

---

## 1. Le dépôt et la chaîne de déploiement (§4.1)

### 1.1 Framework et outillage

| Point | Réalité |
|---|---|
| Framework | **Vite 5 + React 18 + TypeScript**, SPA côté client. Pas de Next.js, pas d'Astro, pas de SSG. |
| Routage | `react-router-dom` v6. Toutes les routes déclarées dans **`src/config/routes.ts`**, chargées en `lazy()` sauf `HomePage` (eager, pour le LCP). |
| TypeScript | `strict: true`, `noUnusedLocals`, `noUnusedParameters` (`tsconfig.app.json`). `npm run type-check` doit rester vert. |
| Lint | ESLint flat config, `--max-warnings 0`. Aucune tolérance. |
| Tests | **Vitest** + Testing Library. 6 fichiers de test, dont **`src/config/routes.test.ts`** et **`src/config/seoConfig.test.ts`**. Ils vérifient la *présence* de routes, pas l'exhaustivité : ajouter des routes ne les casse pas. |
| Node | `NODE_VERSION = "18"` (netlify.toml). Pas de champ `engines` dans `package.json`. |
| Gestionnaire | npm (`package-lock.json`, pas de yarn/pnpm). |
| Conventions de commit | Conventional Commits (`feat(scope):`, `fix(scope):`, `docs:`), sujets en anglais ou en français selon les auteurs. |
| Guides existants | `CLAUDE.md` (architecture, pièges, fichiers critiques), `DESIGN.md` (design system complet), `PRODUCT.md`, `PERFORMANCE_OPTIMIZATION.md`. **Pas de `CONTRIBUTING.md`.** |

### 1.2 Comment le contenu existant est produit

**Il n'existe aucun système de contenu à base de fichiers.** C'est le point structurant.

- **Les pages** sont des composants React. Le texte visible passe par **i18next**, jamais
  en dur : `public/locales/{fr,en,nl}/<namespace>.json`, un namespace par domaine
  (26 namespaces listés dans `src/i18n.ts`).
- **Le blog** ne vit pas dans le dépôt : les articles sont servis par **l'API Express**
  (`src/services/blogService.ts`, table `blog_posts`), rendus par `BlogPostPage` →
  `BlogArticleLayout`. Le sitemap va les chercher par HTTP au build
  (`scripts/vite-plugin-sitemap.ts`, `fetchBlogSlugs`).
- **`/etudes-de-cas`** est un composant qui lit 3 scénarios depuis le namespace
  `caseStudies` et les illustre avec des photos **Unsplash** (`src/pages/CaseStudiesPage.tsx:25`).

**Conséquence pour les fiches projets.** Le mécanisme du blog (base de données + API)
est le mauvais outil ici : il impose une dépendance serveur, une migration de schéma et
un back-office pour douze fiches qui bougeront deux fois par an. Le mécanisme des pages
(i18next + données typées dans le dépôt) est le bon. **Recommandation : un module de
données TypeScript versionné** (`src/data/realisations.ts`) portant la structure et les
identifiants, et les textes traduisibles dans un namespace `realisations`. Cela reste à
valider en Phase 1, mais aucune des deux options n'oblige à inventer un système.

> ⚠️ `public/robots.txt` contient `Disallow: /*.json$`. Un fichier de données JSON servi
> depuis `public/` et chargé à l'exécution serait invisible des moteurs. Autre raison de
> compiler les données dans le bundle plutôt que de les charger en HTTP.

### 1.3 Déploiement — une chaîne à deux étages

C'est le point le plus contre-intuitif du dépôt, et il conditionne la mise en ligne.

```
git push  →  Netlify build (npm run build → dist/ + postbuild manifest)
                                   │
                                   ▼
             VPS srv767464.hstgr.cloud : Traefik → container ainspiration-web
                                   │
             Express (docker/backend/server.js) sert dist/ + injecte le SEO serveur
```

- **Netlify** construit (`netlify.toml` : `npm run build`, publication `dist`), avec des
  contextes deploy-preview et branch-deploy déjà configurés — **une branche poussée
  produit donc une preview**, ce qui suffira à faire valider la Phase 1.
- **Le VPS sert la production.** Le container récupère le frontend et `docker cp` évite
  les 404 d'assets liés à la propagation CDN (`CLAUDE.md:322`).
- **Express injecte le SEO dans le HTML brut** pour les robots qui n'exécutent pas JS
  (`docker/backend/server.js:2728` et suivantes).

**Ce que cela impose : une nouvelle route se déclare à six endroits.**

| # | Fichier | Ce qu'il faut y ajouter |
|---|---|---|
| 1 | `src/config/routes.ts` | la route SPA (`/realisations`, `/realisations/:slug`) |
| 2 | `src/config/seoConfig.ts` | titre/description/keywords **× 3 langues** + le libellé de fil d'Ariane (`seoConfig.ts:795`) |
| 3 | `docker/backend/server.js` → `routeSEO` (l. 2421) | titre/description servis aux robots |
| 4 | `docker/backend/server.js` → `KNOWN_ROUTES` (l. 2453) | **sans quoi la page renvoie un vrai 404** |
| 5 | `scripts/vite-plugin-sitemap.ts` (l. 19) | l'entrée sitemap avec ses alternates hreflang |
| 6 | `src/i18n.ts` → `allNamespaces` | le namespace `realisations` + les 3 fichiers de locales |

**Deux pièges confirmés dans le code, à traiter en Phase 2 :**

1. `KNOWN_ROUTE_PREFIXES` (`server.js:2467`) ne couvre aujourd'hui que les détails CRM.
   Les fiches `/realisations/<slug>` **renverront 404 côté serveur** tant qu'un préfixe
   `/realisations/` n'y est pas ajouté.
2. `getSEOConfig` (`seoConfig.ts:610`) normalise les routes dynamiques en supprimant un
   UUID ou un suffixe numérique — **pas un slug**. Sans traitement dédié, les douze
   fiches retomberaient toutes sur le titre générique « AInspiration | Solutions IA ».
   Il faut soit 12 entrées explicites × 3 langues, soit une résolution par slug.

---

## 2. Le design system réel (§4.2)

**Il est documenté, à jour, et il faut le consommer tel quel.** `DESIGN.md` (243 lignes)
décrit le monde « Aurora », propagé à **toutes** les pages publiques par le commit
`b88620e` du 1er septembre. Ce n'est pas une intention : les jetons sont dans
`tailwind.config.js` et `src/index.css`.

### 2.1 Couleurs (valeurs exactes, extraites du code)

| Rôle | Jeton | Valeur | Emploi |
|---|---|---|---|
| Fond nuit | `night` | `#10102A` | sol de toute section sombre, header |
| Nuit surélevée | `night.soft` | `#181838` | rare |
| Filet sur nuit | `night.line` | `rgba(255,255,255,0.10)` | **toute** séparation sur fond sombre |
| Accent / CTA | `aurora.indigo` = `accent` | `#4F46E5` | **seule** couleur de CTA, focus, sélection |
| Survol CTA | `accent.light` | `#6366F1` | |
| Indigo profond | `accent.dark` | `#4338CA` | texte indigo sur fond clair |
| Violet dégradé | `aurora.violet` | `#6D5AE8` | **uniquement** dans les dégradés, jamais en aplat |
| Donnée | `aurora.teal` | `#2DD4BF` | chiffres, puces de confiance, numéros de process (sur nuit) |
| Donnée sur clair | `accent.teal` | `#14B8A6` | même rôle sur fond clair |
| Fond clair | `canvas` / `surface` | `#F9FAFB` / `#FFFFFF` | |
| Texte | `ink` / `secondary` / `muted` | `#18181B` / `#71717A` / `#94A3B8` | sur fond clair |
| Texte sur nuit | `text-indigo-100/85` | `rgba(224,231,255,0.85)` | **jamais du gris** |

**Quatre règles nommées, non négociables** (DESIGN.md) :
- *Three Grounds* : toute section sombre utilise `.bg-aurora`, `.bg-aurora-teal` ou
  `.bg-aurora-quiet`. Aucun dégradé composé à la main.
- *Two Voices* : l'indigo demande (CTA, liens, focus), le teal montre (données). Jamais l'inverse.
- *Hairline* : sur fond sombre, une séparation est un filet blanc 10 %. Jamais une boîte, jamais une bordure grise.
- *No Pure Purple* : aucun violet pur, nulle part.

### 2.2 Typographie

| Niveau | Fonte | Réglage |
|---|---|---|
| Display (h1 hero) | **Jost Variable** | weight **300**, `clamp(2.25rem, 6vw, 5.25rem)`, `line-height: 1.04`, `-0.01em` |
| Headline (titres de section) | Jost | weight 300, `text-3xl → text-6xl`, **aligné à gauche**, bloc `max-w-2xl` |
| Title (carte) | Outfit | 600, `1.125rem`, `tracking-tight` |
| Body | Outfit | 400, `1rem–1.25rem`, mesure **50–55ch** |
| Label | Outfit | 500, `0.75rem`, `tracking 0.2em`, majuscules — rare |

*Light Display Rule* : rien en `font-display` n'est gras. L'emphase vient de la taille.
**Plancher de taille : 12px**, exception unique et documentée du ® à 8px.

### 2.3 Formes, ombres, mouvement

- **Rayons** — pilule `9999px` (CTA), carte `1.5rem` (`rounded-card`), bandeau et cadre
  média `2rem` (`rounded-container`). Rien d'anguleux.
- **Ombres** — `lift` (repos clair) → `diffuse` (survol clair) ; sur nuit, ombres bleu-noir
  (`0 30px 60px -20px rgba(6,6,25,0.4)`), cadre média `0 45px 90px -25px rgba(6,6,25,0.85)`
  + `ring-1 ring-white/15`, lueur CTA `0 18px 45px -12px rgba(79,70,229,0.65)`.
- **Icônes** — Lucide, `strokeWidth={1.5}`.
- **Mouvement** — **une seule grammaire** : le composant `Reveal`
  (`src/components/ui/Reveal.tsx`), `opacity 0 → 1` + `translateY(24px) → 0`, `0.7s`,
  `cubic-bezier(0.16, 1, 0.3, 1)`, seuil 15 %, décalage de 90 ms dans une même rangée.
  `prefers-reduced-motion` est traité globalement dans `index.css`.

### 2.4 Composants réutilisables disponibles

| Composant | Fichier | Usage pour Réalisations |
|---|---|---|
| `ServiceHero` | `ui/ServiceHero.tsx` | **l'en-tête des deux pages** — 3 sols, 2 densités, highlight teal, CTA pilule + fantôme, cadre média flottant |
| `Reveal` | `ui/Reveal.tsx` | entrée de toutes les cartes |
| `OptimizedImage` | `ui/OptimizedImage.tsx` | images (voir la limite en §3.3) |
| `SEOHead` | `components/SEOHead.tsx` | métadonnées, OG, Twitter, hreflang, JSON-LD |
| `Breadcrumbs` | `layout/Breadcrumbs.tsx` | fil d'Ariane intégré au bandeau nuit |
| `RelatedServices` | `ui/RelatedServices.tsx` | maillage interne vers les pages d'offre (§9.3 du brief) |
| `SectionHeader` | `ui/SectionHeader.tsx` | ⚠️ **centré par défaut et en Outfit gras** — contredit la règle Aurora « titres alignés à gauche, Jost 300 ». À n'utiliser qu'en connaissance de cause. |
| `CallToAction` | `ui/CallToAction.tsx` | ⚠️ **génération précédente** (dégradés `from-indigo-600`, `rounded-2xl`, bouton `rounded-lg`). Le motif Aurora est le *bandeau CTA* décrit dans DESIGN.md, pas ce composant. |

**Aucun composant carte générique n'existe.** Il faudra créer `RealisationCard` — c'est
un ajout légitime, à documenter, en consommant strictement les jetons ci-dessus.

### 2.5 Incohérences relevées — signalées, non corrigées (comme demandé §4.2)

1. **`DESIGN.md` se contredit sur son propre périmètre.** Son encadré « Boundary » affirme
   qu'Aurora ne couvre que l'accueil et le shell, et que les autres pages publiques sont
   encore en « Premium Minimaliste ». Le commit `b88620e` a propagé Aurora **partout**.
   Le paragraphe est périmé.
2. **`DESIGN.md` affirme « the CSP forbids external assets ».** Faux pour les images : la
   CSP réelle (`server.js:47`) autorise `imgSrc: ['self', data:, https:, blob:]`.
   C'est vrai pour les scripts et les fontes. Des photos Unsplash sont d'ailleurs chargées
   sur `/etudes-de-cas`.
3. **Deux générations de composants cohabitent** dans `src/components/ui/` : `ServiceHero`
   et `Reveal` (Aurora) face à `CallToAction` et `SectionHeader` (Premium Minimaliste),
   sans que rien ne signale lesquels sont sortants.
4. **`menuItems` (`routes.ts:281`) est en français en dur**, alors que DESIGN.md impose de
   faire passer tout texte visible par i18next. Le menu n'est donc pas traduit.
5. **`DEPLOY.md` décrit une chaîne morte** (FTP, `public_html/`, PM2 sur hébergement
   mutualisé) sans rapport avec le déploiement réel décrit dans `CLAUDE.md`.
6. **`PERFORMANCE_OPTIMIZATION.md` pointe encore `aimagination.eu`**, l'ancien domaine.

Aucune de ces incohérences ne bloque la mission. Les corriger serait du « nettoyage au
passage », que le brief interdit (§10). Elles sont listées pour arbitrage séparé.

---

## 3. SEO, performance, analytics (§4.3)

### 3.1 Ce qui existe déjà — et qui est bon

`src/components/SEOHead.tsx` émet, pour **chaque** page : `<title>`, description,
keywords, robots, **canonical**, **hreflang fr/en/nl/x-default**, Open Graph complet
(dont `og:image` 1200×630 et `og:locale`), **Twitter Card `summary_large_image`**, et un
bloc **JSON-LD** combinant `Organization` (optionnel), `BreadcrumbList` (automatique hors
accueil) et `WebPage` — ou **`Article`** quand `article` est vrai.

Le brief (§9.3) demande un JSON-LD `CreativeWork`. `SEOHead` ne l'expose pas :
il accepte en revanche un `schema` libre en propriété. **`CreativeWork` s'ajoute donc
sans toucher au composant**, en le passant depuis la page.

`public/robots.txt` et le sitemap généré au build (`scripts/vite-plugin-sitemap.ts`,
alternates hreflang par URL) sont en place.

### 3.2 Performance de référence

**Il n'existe aucune mesure Lighthouse enregistrée.** `PERFORMANCE_OPTIMIZATION.md`
fixe des cibles (LCP < 2,5 s, CLS < 0,1, Performance > 90, SEO = 100) mais son tableau de
résultats est vide (« ? — 🔄 À tester »), et il vise l'ancien domaine.

**Conséquence :** l'exigence du brief « score ≥ celui d'une page comparable » n'a pas de
référence. Il faut **mesurer `/etudes-de-cas` avant** de commencer (Phase 1), et
comparer `/realisations` à cette mesure. Sans cela, l'engagement n'est pas vérifiable.

Les optimisations déjà en place et à ne pas casser : Outfit auto-hébergé en woff2 avec
`unicode-range`, `HomePage` en import direct, namespaces FR critiques inlinés dans le
bundle, cache `immutable` d'un an sur `/images/*` et `/assets/*`, `postbuild` qui
régénère le manifeste.

### 3.3 Limite réelle des images — à traiter

**`OptimizedImage` ne génère un `srcset` que pour les URL Unsplash**
(`ui/OptimizedImage.tsx:53`). Pour un fichier local — c'est-à-dire **toutes les captures
d'écran** de la mission — il ne produit ni `srcset` ni `sizes`.

Le brief (§8.2) exige 480 / 960 / 1440 px servis en `srcset`. Il y a donc un vrai écart à
combler : soit étendre `OptimizedImage` aux fichiers locaux (le plus propre, et bénéfique
au-delà de cette section), soit écrire un composant dédié. **Cet arbitrage est à rendre en
Phase 2**, il ne bloque pas la Phase 1.

Point favorable pour le CLS : le composant transmet déjà `width`/`height`.

### 3.4 Analytics

**GA4** via `src/components/Analytics.tsx` (`gtag`, chargé dynamiquement,
`page_view` sur changement de route). Les événements personnalisés que demande le brief
(vue de fiche, ouverture de la section technique, clic CTA, filtre utilisé) sont donc
possibles sans nouvelle dépendance.

---

## 4. Sources de contenu réellement disponibles (§4.4)

### 4.1 Ce à quoi j'ai accès, et ce que je n'ai pas

**Les worktrees `C:\Users\laure\.claude-worktrees\` cités par le brief n'existent pas
ici.** La session tourne dans un container cloud : je n'ai ni le disque de Laurent, ni les
dossiers `120 Min`, `Artpéro`, `Brasserie de la patinoire`, `FacturationAnim`, `Labo Nosta`,
`Ville-enghien`, `Youtubeextract`.

J'ai accès à : **les dépôts GitHub** du compte, et **l'instance n8n via MCP**.

**Limite n8n importante.** L'instance expose bien **36 workflows**, mais
`get_workflow_details` ne répond que pour ceux dont l'accès MCP est activé sur la carte du
workflow. **Deux sur trente-six** le sont aujourd'hui : `Facturation Radio - Mensuel`
et `chat Ainspiration - TEXT ONLY`. Tous les autres — dont **les deux playlists, le
120 min, l'audit de langue** — renvoient : *« Workflow is not available in MCP »*.
→ **Question 4 du §7.**

### 4.2 Inventaire projet par projet

Légende : ✅ vérifié dans le code · ⚠️ partiel · ❌ rien de vérifiable

| # | Projet | Source atteinte | État | Ce qui manque |
|---|---|---|---|---|
| 1 | **Widget de chat embarquable** *(retrouvé, voir §4.7)* | dépôt `laurent7850/DJLyricsNosta` (attaché) : `embed.html`, `src/App.tsx`, `GuideModal.tsx` | ⚠️ | **Le code est complet et conforme au brief.** Manque : la liste des clients en production, invisible depuis le VPS (seconde instance n8n). |
| 2 | Audityo | dépôt `laurent7850/audityo` (attaché) | ✅ | Rien — mais **la stack du brief est fausse** et **l'échéance est passée** (§4.3). |
| 3 | Facturation automatisée | workflow `mjZouVog4vArYBPI`, lu intégralement | ✅ | Le gain chiffré (« 6 h → 5 min ») n'a **aucune source**. Et le statut « client » est à revoir (§4.4). |
| 4 | DreamOracle | dépôt `laurent7850/DreamOracle` | ✅ | Rien de bloquant. Next.js 16, Prisma, PWA, transcription ElevenLabs, stats — conforme au brief. |
| 5 | Labo Nostalgie — playlists auditeurs | **dépôt `laurent7850/labo-nostalgie-ete` (attaché)** : export du workflow, pack RGPD, interface ; + `playlist-generator` | ✅ | **Débloqué sans MCP** (§4.12). Le JSON du workflow et les cinq documents RGPD sont dans le dépôt. |
| 6 | Générateur playlist Spotify | dépôt `laurent7850/spotify-playlist-generator` (attaché) ; workflow `lwTH2RIV2QmyTlLX` | ✅ | **Distinction avec le n° 5 confirmée sans ambiguïté** (§4.5). Le workflow lui-même reste illisible (MCP). |
| 7 | Chatbot RAG Enghien | dépôt `laurent7850/enghien-rag` | ⚠️ | Stack confirmée. **Le corpus a changé** et les chiffres (794 p., 262 000 mots, 4/18/46) ne figurent nulle part dans le dépôt. |
| 8 | L'Artpéro | dépôt `laurent7850/lartpero2` | ✅ | Production sur `lartpero.ainspiration.eu` — **capturable directement**. Stack conforme (React 18, Vite, shadcn/ui, Express, Stripe, Supabase). |
| 9 | Paperclip — 13 agents | — | ❌ | **Aucun dépôt de ce nom sur le compte.** Rien à lire, rien à capturer. |
| 10 | Baseline sécurité & RGPD | — | ❌ | **Aucun dépôt.** Les 13 sections ne sont pas localisées. |
| 11 | Préparation d'émission | workflow `bWQJiJlSMXQeMyyE` « 120 min 2026 » (actif) | ⚠️ | Existence confirmée, contenu illisible (MCP). |
| 12 | Veille YouTube → transcriptions | — | ❌ | **Aucun workflow YouTube parmi les 36.** Soit il est ailleurs, soit il n'est plus déployé. |
| **13** | **TL Services — site vitrine client** *(ajouté, voir §4.8)* | dépôt `laurent7850/tlservices` (attaché) | ✅ | Rien. En production sur `tlservices.distr-action.com`, capturable immédiatement. |
| **14** | **Réconciliation de caisse — 2 restaurants** *(ajouté, voir §4.10)* | dépôt `laurent7850/reconciliation-caisse` ; instances `caisses.` et `brasspat042026.distr-action.com` | ✅ | Rien de bloquant. **La vraie offre standardisée multi-clients de la vitrine.** |

| **15** | **Rampa — le guide des enseignements** *(ajouté, voir §4.11)* | URL de production fournie par Laurent | ❌ | **Tout.** Aucun dépôt localisé, site inatteignable depuis cette session. Objet du projet inconnu. |

**Bilan : 9 projets sur 15 sont documentés au point de pouvoir écrire une fiche honnête
aujourd'hui** (1, 2, 3, 4, 5, 8, 13, 14 — et 1 sous réserve de la liste clients).
Deux le deviennent si l'accès MCP est ouvert (6, 11), un si les chiffres sont fournis (7).
**Quatre n'ont aucune matière** (9, 10, 12, 15).

### 4.3 Audityo — deux corrections qui changent la fiche

Lu dans `audityo/README.md` et `audityo/ARCHITECTURE.md` :

- **Stack réelle** : Next.js 16, **Prisma ORM v6 + PostgreSQL 16**, **Auth.js v5**,
  Stripe, Claude (Sonnet) pour la classification et la génération documentaire,
  Puppeteer pour les PDF, Docker + Traefik. **Ni Supabase, ni Clerk.**
- **L'isolation multi-tenant existe bien** (`ARCHITECTURE.md:173`, scoping par
  utilisateur) — cette partie du brief tient.
- **L'échéance du 2 août 2026 est dépassée** (nous sommes le 3 septembre 2026). Écrire
  « avant l'échéance d'août 2026 » ferait daté et, pire, ferait douter du reste. L'angle
  juste devient : *le règlement s'applique déjà ; voici comment se mettre en règle*.

### 4.4 Facturation — le workflow dit autre chose que le brief

Workflow `mjZouVog4vArYBPI`, 12 nœuds, actif depuis le 7 janvier 2026, dernière
modification le 1er avril 2026, avec un workflow d'erreur rattaché.

**Ce que le brief décrit et qui est exact** : déclenchement mensuel (cron, le 1er à 6 h 05),
lecture Google Calendar, calcul des tarifs, écriture Google Sheets, envoi d'un email HTML.

**Ce que le brief omet — et qui est la moitié de la valeur** : le workflow lit **deux**
périodes, le mois écoulé (à facturer) **et le mois en cours (projection)**. Il crée deux
onglets (`AAAA-MM` et `AAAA-MM-PROJECTION`) et l'email contient **un tableau comparatif**
heures / prestations / total avec l'évolution entre les deux mois. Ce n'est pas un
automate de facturation, c'est un **tableau de bord mensuel d'activité**.

**Les règles métier réellement encodées** (nœud « Calcul facturation ») :
- horaires extraits **du titre de l'événement** par expression régulière ;
- week-end : événements groupés par semaine ISO, facturés **9 h forfaitaires**, 1 déplacement ;
- émission de nuit (00 h–03 h) : **4 h**, **sans** déplacement ;
- semaine : durée réelle **+ 1 h**, 1 déplacement ;
- événement « journée entière » sans horaire : 12 h–15 h par défaut ;
- total = prestations + frais administratifs + (nombre de déplacements × coût unitaire).

> ⚠️ **Le workflow contient des données réelles** : l'adresse du calendrier Google, le
> destinataire de l'email, l'identifiant du classeur maître et **les trois montants
> tarifaires**. Aucune capture ne doit montrer un panneau de paramètres ouvert, ni le code
> du nœud « Prépare période ». Le graphe seul est sûr.

> ⚠️ **Statut du projet à trancher.** Le calendrier lu appartient à Laurent, l'email part
> vers `divers@distr-action.com`, les tarifs sont les siens. Rien dans ce workflow ne
> désigne un client : **c'est l'automatisation de sa propre facturation**. La présenter
> comme une réalisation cliente serait exactement le « faux témoignage » que le commit
> `e4ff57e` a retiré du site. Elle reste une excellente preuve — à condition d'être
> formulée comme Audityo, en « chez nous » plutôt qu'en « chez un client ».
> → **Question 2 du §7.**

### 4.5 Playlists — la confusion 5 / 6 est levée, et elle était justifiée

Ce sont bien **deux réalisations distinctes**. Vérifié par les dépôts, pas par déduction :

| | **N° 5 — Labo Nostalgie** | **N° 6 — Spotify** |
|---|---|---|
| Entrée | formulaire web public (GitHub Pages) | thème saisi dans un front React/Vite |
| Chaîne | catalogue Sheets + liste noire → Claude → validation | webhook → Claude → **API Spotify** |
| Sortie | **un email HTML** envoyé à l'auditeur | **une playlist créée dans le compte Spotify** |
| Workflow | `8N7Vb3R8mrBK6DLl` (+ `Mrvg6cCeYZEcpv1y`, été, **inactif**) | `lwTH2RIV2QmyTlLX` |
| Dépôt | `playlist-generator` (+ `playlist-generator-ete`) | `spotify-playlist-generator` |

**Deux avertissements sur le n° 5 :**

1. **`playlist-generator/README.md` nomme la radio en toutes lettres, et le dépôt est
   public.** La page du formulaire est hébergée sur `laurent7850.github.io`. Toute capture
   de ce formulaire risque d'exposer la marque, dans l'URL comme dans l'habillage. À
   cadrer avec soin, ou à refaire sur une copie neutralisée.
2. **Le workflow « été » est inactif.** Le présenter au présent serait inexact.

**Sur le n° 6** : `README.md` expose l'URL complète du webhook de production
(`n8n.srv767464.hstgr.cloud/webhook/spotify-playlist-…`). Elle ne doit apparaître sur
**aucune** capture. Par ailleurs le dépôt contient un `netlify.toml`, alors que le brief
annonce un déploiement « Hostinger Horizons » — à confirmer avant d'écrire quoi que ce
soit sur l'hébergement.

L'idée de démo publique interactive (§6.6 du brief) est techniquement plausible : le front
n'appelle aucune API directement, tout passe par le webhook. Elle reste un arbitrage de
coût et d'abus. → **Question 8 du §7.**

### 4.6 Enghien — le corpus a grandi

`enghien-rag/README.md` : **deux ouvrages**, pas un.

| Ouvrage | Auteur | Année | Droits |
|---|---|---|---|
| Histoire de la ville d'Enghien | Ernest Matthieu | 1876 | domaine public |
| La région d'Enghien — Une géographie historique, t. I | Jacques Reygaerts | 1998 | **sous droits, autorisation de l'ayant droit** |

La stack annoncée est confirmée (Next.js 15, Supabase + pgvector, embeddings OpenAI
`text-embedding-3-small`, Claude Sonnet, VPS + PM2), ainsi que le découpage hiérarchique
livre / chapitre / section (`lib/citation.ts`, `lib/rag.ts`).

En revanche **les chiffres du brief — 794 pages, 262 000 mots, 4 livres / 18 chapitres /
46 sections — ne figurent nulle part dans le dépôt.** Ils deviennent des `[À VALIDER]`.

Le second ouvrage est une **meilleure** preuve commerciale que le premier : un fonds sous
droits exploité avec l'accord de l'ayant droit, c'est exactement la situation d'une PME
avec ses procédures internes. Mais le citer suppose de vérifier que l'autorisation couvre
la mention publique. → **Question 6 du §7.**

### 4.7 Projet n° 1 — le widget embarquable existe : je l'avais manqué

**Correction de ma conclusion précédente.** J'avais conclu que le widget décrit au §6.1 du
brief n'existait pas. C'était faux : il est dans le dépôt **`laurent7850/DJLyricsNosta`**,
dont le nom ne le laissait pas deviner et que je n'avais pas ouvert.

**Tout ce que le brief annonçait s'y trouve, vérifié ligne à ligne :**

| Élément du brief | Vérification |
|---|---|
| `embed.html` | présent, 260 lignes — **une page d'intégration** qui propose trois extraits à copier-coller : iframe responsive (recommandé), pleine largeur, dimensions fixes, avec bouton « Copier le code » et aperçu en direct |
| Captation progressive de leads | `UserProfile` dans `src/App.tsx:29` : **`email`, `firstName`, `phoneNumber`, `locality`**, plus les drapeaux `hasProvidedEmail` / `hasCompletedForm` |
| Consentement | champ **`acceptPrivacy`** dans le formulaire — le RGPD est traité dans le widget lui-même |
| Guide intégré | `src/components/GuideModal.tsx` |
| Gestion de session | persistance du profil entre les visites |
| Webhook n8n | `src/App.tsx:6`, avec repli si le webhook répond en erreur |

**C'est donc bien une offre standardisée, embarquable en trois lignes chez n'importe quel
client.** La pièce maîtresse annoncée par le brief tient debout.

> ### 🔑 Il existe une **seconde instance n8n**
>
> Le webhook du widget pointe vers **`distr-action.app.n8n.cloud`** — une instance
> **n8n Cloud**, distincte de `n8n.srv767464.hstgr.cloud` (le VPS) à laquelle mon accès MCP
> est connecté.
>
> **C'est l'explication de mon erreur** : je cherchais les workflows clients sur la mauvaise
> instance. Les 36 workflows que j'ai inventoriés ne sont que ceux du VPS. Les chatbots
> clients vivent ailleurs, et je ne les vois pas. → **question 18.**

**Ce qui reste à établir** : la liste des clients qui l'utilisent réellement en production,
avec leurs URLs. C'est la seule pièce manquante — et elle conditionne la formulation
« déployé chez plusieurs clients ».

> ⚠️ **Pour les captures** : l'URL complète du webhook est en clair dans `src/App.tsx:6`.
> Elle ne doit apparaître sur aucune capture ni dans aucun extrait de code publié.

> ⚠️ **Ce qui reste vrai de mon audit précédent** : la « Brasserie du Hainaut » de
> `docker/seed-demo.sql` est bien une **donnée de démonstration fictive** du CRM (gérant
> inventé, opportunité « Chatbot réservations — 299 € — won »). À ne jamais citer ni
> capturer. Et la décision `e4ff57e` du 29 août — *« Client decision: no real clients exist
> yet »* — encadre toujours la section : elle a retiré du site les témoignages inventés et
> les statistiques agrégées. Le témoignage « Thierry — restaurateur » de
> `TESTIMONIAL_THIERRY.md` a été transformé en scénario anonyme ; **ce fichier décrit une
> version supprimée, ne pas s'en servir comme source.**

**Arbitrage à reprendre.** Laurent avait tranché « le chat du site en démo vivante » sur la
base de ma conclusion erronée. La démo vivante reste une excellente idée — elle ne coûte
rien et se vérifie d'elle-même — mais elle peut désormais **accompagner** la fiche du widget
embarquable plutôt que la remplacer. → **question 19.**

### 4.8 TL Services — treizième réalisation, ajoutée par Laurent

Trouvée en cherchant le chatbot. **Un vrai site client, en production.**

| Point | Vérifié dans `laurent7850/tlservices` |
|---|---|
| Activité | rénovation et petits travaux, sud de Bruxelles |
| Production | **`https://tlservices.distr-action.com`** — capturable immédiatement, sans compte |
| Stack | Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind v3 |
| Hébergement | VPS Hostinger + Docker Compose + Traefik (Let's Encrypt) |
| Pages | accueil, services (6 prestations), **réalisations (galerie de chantiers)**, à propos, contact, mentions légales, confidentialité RGPD, 404 personnalisée |
| SEO | **JSON-LD `LocalBusiness`** (services, communes desservies, horaires, géolocalisation), `sitemap.xml` et `robots.txt` auto-générés, **image OpenGraph 1200×630 générée** |
| Formulaire | validation stricte, **honeypot anti-bot**, limite 1 envoi/minute/IP, envoi SMTP + webhook optionnel |
| Sécurité | aucune clé en dur, `poweredByHeader: false` |

**L'angle** : c'est la preuve qu'AInspiration livre aussi des sites clients complets et
correctement référencés — pas seulement de l'automatisation. Le `LocalBusiness` JSON-LD et
la génération d'OG image sont exactement ce qu'un dirigeant de PME locale cherche sans
savoir le nommer : *être trouvé sur Google quand on cherche un artisan près de chez soi*.

**Deux points à trancher** (→ questions 11 et 12 du §7) :

1. **Le nom peut-il être affiché ?** Le site est public et porte la marque TL Services. Mais
   la décision `e4ff57e` interdit de nommer un client sans accord écrit. Le contact configuré
   est `thierry@tl-services.be`.
2. **Attention à ne pas confondre deux Thierry.** Celui de TL Services fait de la
   rénovation ; celui du témoignage retiré était **restaurateur à Bruxelles** (WhatsApp
   Business, réservations). Même prénom, activités différentes. Il existe par ailleurs une
   page d'article écrite à la main, `/blog/thierry-facturation-ia`, dont il faudra vérifier
   duquel des deux elle parle avant tout maillage interne.

### 4.9 Brasserie de la Patinoire — le site existe, mais il est hors de portée d'ici

Laurent a fourni l'URL : **`https://brasspat042026.distr-action.com/`**. Le projet existe
donc bien, en production, sur un sous-domaine du groupe.

**Il est inaccessible depuis cette session.** La politique réseau de l'environnement
d'exécution refuse la connexion (`403` du proxy sortant, `connect_rejected — policy
denial`). Je ne peux ni lire la page, ni vérifier la présence du widget de chat, ni
capturer quoi que ce soit.

> ### ⚠️ Conséquence majeure : **aucune capture n'est réalisable depuis cet environnement**
>
> J'ai testé les sept cibles de la mission. **Toutes sont bloquées** :
>
> | Cible | Résultat |
> |---|---|
> | `brasspat042026.distr-action.com` | bloqué |
> | `tlservices.distr-action.com` | bloqué |
> | `ainspiration.eu` | bloqué |
> | `lartpero.ainspiration.eu` | bloqué |
> | `dreamoracle.eu` | bloqué |
> | `audityo.eu` | bloqué |
> | `laurent7850.github.io/playlist-generator` | bloqué |
>
> Seuls GitHub, npm et les serveurs MCP passent. **La Phase 4 (captures Playwright) ne peut
> pas s'exécuter ici**, quelle que soit la qualité du script.
>
> Trois issues possibles, à arbitrer (question 14) :
> 1. **J'écris le script, tu l'exécutes.** Le §8.1 du brief exige de toute façon un script
>    versionné et rejouable dans `scripts/captures/`. Je le livre avec sa configuration par
>    projet ; tu lances `npm run captures` en local et tu commites les images. C'est le
>    chemin le plus simple et il respecte le brief à la lettre.
> 2. **Ouvrir la politique réseau** de l'environnement aux sept domaines ci-dessus.
> 3. **Travailler depuis ta machine** avec Claude Code en local — où se trouvent d'ailleurs
>    les worktrees introuvables ici (Paperclip, Baseline sécurité, veille YouTube).
>
> Les phases 1, 2, 3, 5 et 6 ne sont **pas** concernées : architecture, modèle de données,
> gabarits, rédaction des 13 fiches, SEO et accessibilité se font intégralement ici.

**Si le chat de la brasserie tourne bien sur ce site**, le projet n° 1 peut redevenir
« déployé chez un client » plutôt que « notre propre chat » — c'est nettement plus vendeur.
Il faut juste que quelqu'un puisse le constater. → **question 14.**

### 4.10 Réconciliation de caisse — la vraie offre standardisée multi-clients

**Correction de Laurent, et elle est structurante.** « Brasspat » n'est pas un chatbot :
c'est un **outil de réconciliation des tickets de caisse pour la comptabilité des
restaurants**. Le brief avait mélangé deux projets distincts.

Ce que cela révèle : **le même outil est déployé chez deux restaurants.**

| Rang | Restaurant | Domaine | Source |
|---|---|---|---|
| **Projet d'origine** | Brasserie de la Patinoire | `brasspat042026.distr-action.com` | fourni par Laurent — **code non trouvé sur GitHub** |
| **Variante** | Saint Kilda | `caisses.distr-action.com` | dépôt `laurent7850/reconciliation-caisse` |

**L'ordre compte pour la fiche.** L'outil a été conçu pour un premier restaurant, puis
redéployé chez un second : c'est une trajectoire de produit, pas un doublon. Le dépôt que
je peux lire (`reconciliation-caisse`) est donc **la variante**, ce qui explique qu'il porte
« Saint Kilda » en dur dans son interface (`src/App.tsx:143`) — c'est un fork adapté, pas
un socle paramétrable.

> ⚠️ **Conséquence sur l'argumentaire.** « Redéployable en quelques jours » ne se dit pas de
> la même façon selon qu'on duplique un dépôt ou qu'on change un fichier de configuration.
> Ici c'est un fork par client. La formulation honnête est celle du sur-mesure réutilisable :
> *un socle éprouvé chez un premier restaurant, adapté au plan comptable du suivant* — ce qui
> reste très vendeur, et évite une promesse d'industrialisation que le code ne tient pas.

**C'est l'offre standardisée que le brief cherchait au projet n° 1** — un produit conçu
une fois, redéployé par client — sauf qu'elle appartient à ce projet-ci, pas au chatbot.
Elle mérite d'être placée haut dans la grille.

**Ce que fait l'outil** (`src/reconcile.ts`, `src/xlsxPatcher.ts`) : il rapproche les
rapports Z du caissier (`ReportZStats`, N° Z, date, CA TTC, ventilation TVA) et le détail
des paiements (`CA_1_*` : espèces, carte, virement) avec le récapitulatif annuel Excel du
restaurant. Il détecte le mois et le jour depuis la date d'ouverture du Z, remplit la ligne
correspondante et régénère le classeur.

**Trois détails d'ingénierie qui valent un argumentaire** :

1. **Aucune donnée ne quitte le navigateur.** L'application est 100 % côté client
   (Vite + React, dépendances `exceljs` et `jszip`, aucun backend, aucune API, aucune base).
   Les fichiers comptables sont lus, traités et régénérés localement. Pour un restaurateur
   qui hésite à confier sa comptabilité à un outil en ligne, c'est *l'*argument.
2. **Édition chirurgicale du XLSX.** Le classeur est traité comme le ZIP qu'il est : seules
   les cellules visées sont modifiées dans le XML de la feuille. Le reste du fichier —
   formules, mise en forme, onglets — survit intact.
3. **Aucune écrasure silencieuse.** « Les cellules déjà remplies ne sont jamais écrasées. »
   C'est la garantie qui permet de faire confiance à un automate sur de la comptabilité.

**Pour la capture, c'est le projet le plus simple de toute la vitrine** : rien n'étant
envoyé à un serveur, il suffit de fabriquer un classeur de démonstration et deux exports Z
fictifs pour produire une capture parfaitement propre — un avant / après de réconciliation,
qui raconte immédiatement l'histoire.

> ⚠️ **Deux réserves.** (a) Les deux instances sont derrière une **authentification basique
> Traefik** : identifiants nécessaires pour toute capture en ligne — mais le point précédent
> permet de s'en passer en lançant l'app localement. (b) Le hash bcrypt du compte `admin`
> est **commité dans `docker-compose.prod.yml`**. C'est un hash, pas un mot de passe en
> clair, et le dépôt est privé — mais il ne devrait pas s'y trouver. Signalé, non corrigé
> (hors périmètre de cette mission).

> ❓ **Il me manque le projet d'origine.** Le code de `brasspat042026` n'est sur aucun dépôt
> du compte `laurent7850`. Or c'est lui la première livraison, et c'est de lui que la fiche
> doit parler en premier. → **question 16.**

### 4.11 Rampa — le guide des enseignements

Signalé par Laurent. **URL de production : `https://rampa.srv767464.hstgr.cloud/`.**

Ce que l'URL apprend à elle seule : le projet tourne sur **`srv767464.hstgr.cloud`**,
c'est-à-dire **le même VPS Hostinger que l'instance n8n et le site AInspiration**. C'est
donc un déploiement maison du groupe, servi par le Traefik du VPS, et non un hébergement
tiers. Le sous-domaine est brut (pas de domaine de marque), ce qui suggère un projet encore
interne ou en préproduction plutôt qu'une livraison client finalisée.

**Rien d'autre n'est vérifiable :**

- aucun dépôt contenant « rampa » sur le compte `laurent7850` ;
- aucun des 36 workflows n8n ;
- aucune occurrence dans les treize dépôts clonés ;
- le site est **inatteignable depuis cette session** (politique réseau, cf. §4.9).

**Ce qu'il me faut** (→ question 17) : un dépôt à attacher, ou à défaut une description —
« le guide des enseignements », est-ce un référentiel de formations, un RAG sur un corpus
pédagogique, un outil pour un établissement scolaire ? Pour quel client, et à quel stade ?
Sans cela je ne peux qu'écrire une paraphrase, ce que le §7.1 du brief interdit.

### 4.12 Labo Nostalgie — débloqué, et le brief se trompe sur l'essentiel

Le dépôt **`laurent7850/labo-nostalgie-ete`** contient ce que je croyais inaccessible :
`n8n/labo-nostalgie-ete-playlist.json` (l'export du workflow, 15 nœuds), un dossier
`rgpd/`, un dossier `data/` et l'`interface/`. **Plus besoin d'accès MCP pour cette fiche.**

**Le pack RGPD existe bel et bien** — cinq documents, exactement comme annoncé :
`POLITIQUE_CONFIDENTIALITE.md`, `REGISTRE_TRAITEMENTS.md`, `FORMULAIRE_CONSENTEMENT.md`,
`ATTESTATION_CONFORMITE.md`, `CHANGELOG_RGPD.md`.

**La chaîne réelle** (15 nœuds) : webhook → chargement du catalogue et de la liste noire
(Google Sheets) → fusion → préparation → **Claude via OpenRouter** → extraction →
**test de validité** → *si invalide*, **second appel de correction** → sauvegarde de la
liste noire → email Gmail → réponse au webhook.

**Contraintes vérifiées dans le code :**

- **Liste noire à 21 jours** — confirmée (`if (diffDays <= 21)`), sur la paire artiste-titre.
- **Quotas croisés langue × décennie** — bien plus précis que le « 40/40/20 » du brief :
  une matrice de comptes explicites (FR 80s/90s/2000s, INT 70s/80s/90s/2000s…).
- **25 titres** par playlist — et non « 25 artistes uniques minimum ».

> ### ⚠️ Correction majeure : **le modèle ne choisit pas les titres**
>
> Le prompt envoyé à Claude est sans ambiguïté :
> *« NE MODIFIE PAS les titres, artistes, annees ou categories. Ajoute SEULEMENT les
> justifications. »*
>
> La sélection est faite **de façon déterministe par le code n8n**, à partir du catalogue,
> des quotas et de la liste noire. Le modèle n'intervient qu'ensuite, pour **rédiger la
> justification** de chaque choix. Et si sa réponse ne valide pas, un second appel la
> corrige.
>
> **C'est une bien meilleure histoire que celle du brief**, et elle est vraie : *les règles
> métier décident, l'IA explique*. Pour un dirigeant qui redoute qu'une IA « invente », c'est
> exactement la démonstration qu'il attend — et c'est un argument qu'aucun concurrent ne peut
> copier sans l'avoir construit.

> ⚠️ **Anonymisation.** Le `README.md` de ce dépôt nomme la radio en toutes lettres, comme
> celui de `playlist-generator`. Ces noms ne doivent apparaître ni dans la fiche, ni dans une
> capture, ni dans un nom de fichier image.

### 4.13 Autres réalisations trouvées pendant le balayage

Non intégrées à la grille — signalées pour arbitrage (→ question 20) :

| Projet | Dépôt | Ce que c'est |
|---|---|---|
| **VoxStudio** | `laurent7850/voxstudio` (attaché) | Synthèse vocale ElevenLabs, Next.js + Prisma + PostgreSQL, déployé sur `voxstudio.srv767464.hstgr.cloud`. **Adossé à la page `/audio` du site**, qui n'a aujourd'hui aucune preuve. |
| **Minutage NRJ+** | `laurent7850/minutage-NR` (attaché) | Analyse d'un conducteur radio au format PDF pour en extraire le minutage des heures. Cas « lire un document métier et en sortir des données » très transposable. |
| **AutoSEO / SEOPilot** | `laurent7850/autoseo`, `laurent7850/seopilot` | Hub d'automatisation SEO déployé sur `seopilot.srv767464.hstgr.cloud`, relié aux workflows « Publish from AutoSEO » des trois marques. |

---

## 5. Ce que la mission peut réellement produire aujourd'hui

Pour être franc sur le calendrier, sans rien réduire de la commande :

- **Fiches écrivables tout de suite, sur sources vérifiées** : Widget embarquable, Audityo,
  Facturation, DreamOracle, **Labo Nostalgie**, L'Artpéro, **TL Services**,
  **Réconciliation de caisse**. Huit.
- **Fiches écrivables dès l'accès MCP n8n ouvert** : Spotify, Préparation d'émission. Deux.
- **Fiche écrivable dès que Laurent fournit les chiffres** : Enghien. Une.
- **Fiches sans matière** : Paperclip, Baseline sécurité, Veille YouTube. Trois.

Le multiplicateur trilingue s'applique à tout : **15 fiches × 3 langues = 45 rédactions**,
plus l'index. C'est le poste de travail le plus lourd de la mission, largement devant le
code.

---

## 6. Ce que je propose pour la Phase 1 (à valider avec le reste)

Sans écrire une ligne de code, voici le parti que je défendrai :

- **Complémentarité avec `/etudes-de-cas`** : cette page garde les *scénarios* (« ce que
  l'IA peut faire pour un profil comme le vôtre »), Réalisations porte les *preuves*
  (« ce qui a été construit, et qui tourne »). Deux liens réciproques, deux promesses
  distinctes, aucun recouvrement de mots-clés.
- **Sol Aurora** : `.bg-aurora` pour l'index (surface de persuasion, comme les pages
  Solutions) et `.bg-aurora-quiet` pour les fiches (surface de lecture, comme le blog).
- **Maquette de Phase 1** : la fiche Facturation, comme prévu au brief — c'est le seul
  projet dont je connais le mécanisme ligne à ligne, donc le seul que je peux maquetter
  sans inventer.

---

## 7. Questions bloquantes — réponses nécessaires avant de coder

1. ~~**Chatbot embarquable (projet n° 1).**~~ **Réglé** : le projet devient le chat IA du
   site, en démo vivante (§4.7). **Reste ouvert : la Brasserie de la Patinoire
   (« brasspat »).** Elle n'est atteignable nulle part — aucun dépôt sur le compte
   GitHub (`brass`, `pat` : zéro résultat), **aucun des 36 workflows n8n** (`brass`,
   `patinoire` : zéro résultat), aucune mention dans les onze dépôts clonés. Où vit ce
   projet ? Si le chatbot de la brasserie tourne réellement en production, son URL
   publique en ferait une preuve immédiatement capturable, et le projet n° 1 pourrait
   redevenir « déployé chez un client » plutôt que « notre propre chat ».

2. ~~**Facturation : « chez nous » ou « chez un client » ?**~~ **Tranché par Laurent :
   cas client.** La fiche présentera « un groupe radio francophone ». Précaution de
   rédaction, une seule fois et sans y revenir : le workflow prouve que **des prestations
   sont facturées à un client radio**, ce qui est exact ; il ne prouve pas que ce client ait
   commandé l'outil. La formulation retenue décrira donc la facturation *d'*un client radio,
   sans affirmer que la réalisation a été livrée *à* ce client.

3. **Audityo : quel angle maintenant que le 2 août 2026 est passé ?** « Mise en conformité
   d'un règlement déjà applicable » plutôt que « anticipez l'échéance » ?

4. **Accès n8n.** Peux-tu activer « available in MCP » sur `8N7Vb3R8mrBK6DLl`,
   `Mrvg6cCeYZEcpv1y`, `RYWMDjWiSoK8C72O`, `lwTH2RIV2QmyTlLX` et `bWQJiJlSMXQeMyyE` ?
   Sans cela, quatre fiches resteront des paraphrases du brief, ce qui est précisément ce
   que la mission interdit. **Et pour les captures de graphes : puis-je accéder à
   l'interface n8n, ou me fournis-tu les exports d'écran ?**

5. **Projets 9, 10 et 12** (Paperclip, Baseline sécurité, Veille YouTube). Aucun dépôt,
   aucun workflow. Où sont-ils ? S'ils ne sont pas récupérables, faut-il les retirer de la
   grille — auquel cas la vitrine passe de 12 à 9 fiches ?

6. **Enghien.** (a) Les chiffres 794 pages / 262 000 mots / 4 livres / 18 chapitres /
   46 sections viennent-ils d'une source que tu peux produire ? (b) La Ville d'Enghien
   a-t-elle donné son accord pour être citée ? (c) L'autorisation de l'ayant droit sur
   l'ouvrage de 1998 couvre-t-elle une mention publique sur le site ?

7. **URLs capturables.** Sont publiquement accessibles aujourd'hui, à ma connaissance :
   `dreamoracle.eu`, `lartpero.ainspiration.eu`, `audityo.eu`,
   `laurent7850.github.io/playlist-generator`. Confirmes-tu, et lesquelles demandent un
   **compte de démonstration** (Audityo, L'Artpéro espace membre, DreamOracle journal) ?
   Où est déployé le chat RAG Enghien ?

8. **Démo Spotify publique.** Techniquement faisable. Coût d'API et risque d'abus à
   arbitrer. On la garde comme simple capture, ou on l'instruit ?

9. **Chiffres de résultat.** Pour chacun des projets retenus : durée réelle, année de
   livraison, gain constaté — même approximatif. Une fourchette validée vaut mieux qu'un
   chiffre inventé, et sans cela chaque fiche partira avec trois `[À VALIDER]` visibles.

10. **Deux points de méthode.** (a) Le brief demande des commits en français ; le dépôt
    est en Conventional Commits, sujets majoritairement en anglais. Je propose
    `feat(realisations):` avec sujet français — ça te va ? (b) `L'Artpéro` peut-il être
    nommé, ou faut-il l'anonymiser aussi ?

11. **TL Services : le nom peut-il être affiché ?** Le site est public et porte la marque,
    mais la décision `e4ff57e` interdit de nommer un client sans accord écrit. As-tu son
    accord, ou passe-t-on par « un artisan de la périphérie bruxelloise » ?

12. **TL Services : quels chiffres ?** Durée du projet, date de mise en ligne, et un
    résultat constaté (demandes reçues via le formulaire, position sur une requête locale
    du type « rénovation + commune »). Sans cela la fiche décrira un beau site sans dire
    ce qu'il a rapporté — exactement le piège du §13 du brief.

13. ~~**Saint Kilda entre-t-il dans la grille ?**~~ **Réglé** : oui, et il ne s'agit pas
    d'un cas isolé — c'est le même outil que « brasspat », déployé chez deux restaurants
    (§4.10). Devient la quatorzième réalisation.

14. **Captures : comment on procède ?** Aucune des sept cibles n'est joignable depuis cet
    environnement (§4.9). Ma recommandation : **je livre le script Playwright rejouable,
    tu l'exécutes en local** — c'est ce que le §8.1 du brief demande de toute façon.
    L'alternative est d'ouvrir la politique réseau, ou de passer en local. À trancher avant
    la Phase 4, pas avant la Phase 1.

15. **Les deux restaurants acceptent-ils d'être nommés ?** Le brief prévoyait
    « une brasserie ». Saint Kilda et la Brasserie de la Patinoire peuvent-ils apparaître,
    ou reste-t-on sur « deux restaurants bruxellois » ? Et as-tu un gain constaté à me
    donner — temps de rapprochement mensuel avant / après, par exemple ?

17. **Rampa : c'est quoi, et où est le code ?** L'URL ne me dit que l'hébergement (§4.11).
    Un dépôt à attacher, ou une description : nature du projet, client, stade d'avancement.
    Et le sous-domaine technique laisse penser à un projet interne — est-il assez abouti
    pour figurer dans une vitrine commerciale ?

16. **Où est le code de la Brasserie de la Patinoire ?** C'est le projet d'origine — Saint
    Kilda en est la variante — donc c'est lui que la fiche doit raconter en premier. Or il
    n'est sur aucun dépôt du compte `laurent7850`. Dépôt privé ailleurs, autre compte, ou
    seulement sur ton disque ? Sans lui je n'ai que le fork pour décrire l'original.

---

## 8. Livrables de cette phase

- [x] `docs/audit-realisations.md` — ce document
- [ ] Phase 1 — architecture + maquette de la fiche Facturation : **en attente de
      validation et des réponses 2, 3 et 4**

**Aucun fichier de production n'a été modifié.** Seuls `docs/PROMPT-realisations.md` et ce
rapport ont été ajoutés sur `feat/realisations`.

---

## 9. Questions ouvertes par le balayage complet des dépôts

Après revue de **26 des 37 dépôts** du compte (les 21 publics, plus `audityo`, `tlservices`,
`distr-action2026`, `voxstudio`, `autoseo`, `labo-nostalgie-ete`, `djlyricsnosta`,
`songtastic` — vide — et `minutage-NR`) :

18. **Peux-tu me donner accès à la seconde instance n8n ?** Le widget embarquable pointe
    vers `distr-action.app.n8n.cloud`, que je ne vois pas. C'est là que doivent vivre les
    workflows des chatbots clients — donc la preuve du « déployé chez plusieurs clients ».

19. **Widget embarquable : quels clients, quelles URLs ?** Le code est complet et conforme
    au brief. Il ne manque que la liste des déploiements en production. Et confirmes-tu que
    la démo vivante du chat du site **accompagne** cette fiche plutôt que de la remplacer ?

20. **VoxStudio, Minutage NRJ+ et AutoSEO entrent-ils dans la grille ?** Trois projets réels
    trouvés en chemin (§4.13). VoxStudio en particulier donnerait enfin une preuve à la page
    `/audio`, qui n'en a aucune.

21. **Rampa et brasspat restent introuvables.** Ni dans les 26 dépôts revus, ni parmi les
    36 workflows du VPS, ni dans aucun fichier accessible. Leurs URLs indiquent qu'ils sont
    déployés sur le VPS, mais leur code n'est nulle part où je peux aller. Trois dépôts
    privés n'ont pas encore été ouverts — `minutage-NO`, `Time2invoice2`, `Time2invoice3` —
    mais leurs noms rendent peu probable qu'ils les contiennent. **Sont-ils sur un autre
    compte GitHub, ou seulement sur ton disque ?**

---

## 10. Recherche exhaustive de Rampa et de brasspat — méthode et résultat

Reprise complète après une première recherche insuffisante (elle m'avait déjà fait manquer
`DJLyricsNosta`). Cette fois, quatre pistes ont été épuisées.

### 10.1 GitHub — fermé

- **`list_repos` renvoie 37 dépôts, `has_more: false`, tous sous `laurent7850`.** Aucune
  organisation, aucun second compte, aucun dépôt tiers dans la portée autorisée.
- **Toutes les branches de tous les dépôts** ont été listées (`git ls-remote --heads`).
  Aucune branche `rampa` ni `brasspat`.
- **Le dépôt AInspiration a six branches** (`main`, `developpement`, `production`,
  `jovial-vaughan`, `claude/vigorous-greider`, `pre-security-baseline-2026-05`) : toutes
  récupérées et fouillées. Rien — une seule correspondance, sur le mot « renseignements ».
- **Contenu fouillé dans 27 dépôts.** Cinq sont vides (`lartpero`, `Time2Invoice4`,
  `Time2invoice`, `songtastic`) ; `Time2invoice2` et `Time2invoice3` écartés par Laurent.
- **Aucun autre hébergeur git** n'est cité nulle part : ni GitLab, ni Bitbucket, ni Gitea.

### 10.2 n8n (VPS) — fermé

`search_projects` renvoie **un seul projet** (`Maréchal Laurent`), les projets d'équipe
n'étant pas activés sur l'instance. Les **36 workflows** inventoriés sont donc bien la
totalité. Aucun ne porte « rampa » ni « brasspat » dans son nom.

*Réserve honnête* : la recherche n8n ne porte que sur les noms et descriptions. Le contenu
des workflows reste illisible pour 34 d'entre eux (accès MCP non activé).

### 10.3 Système de fichiers — fermé

`find / -xdev` sur l'ensemble du disque : **aucun fichier** contenant « rampa »,
« brasspat », « patinoire » ou « enseignement ». Les seuls volumes montés sont ceux du
système (`/opt/claude-code`, `/mnt/skills`…). **La machine de Laurent n'est pas montée** —
cette session s'exécute dans un conteneur isolé.

> ⚠️ **Fausse piste, corrigée.** Un premier balayage avait fait apparaître
> `rampa.srv767464.hstgr.cloud` « cité dans un dépôt ». C'était **ce rapport lui-même**
> (§4.11), pas une source. Les sous-domaines VPS réellement cités par le code sont :
> `ainspiration`, `dreams`, `enghien`, `n8n`, `paperclip-zjyk`, `seopilot`, `voxstudio`.

### 10.4 Conclusion

**Rampa et le brasspat d'origine sont déployés sur le VPS sans être versionnés sur GitHub.**
C'est cohérent avec le reste : le fork Saint Kilda de la réconciliation de caisse est sur
GitHub, l'original ne l'est pas. Les deux ont donc un front-end en ligne, mais pas de code
atteignable d'ici.

**Le seul angle mort qui subsiste** est la **seconde instance n8n**
(`distr-action.app.n8n.cloud`), invisible depuis cette session — c'est là que vivent les
workflows des chatbots clients, et peut-être d'autres pièces.

### 10.5 Ce que la piste « front-end » a débloqué : Paperclip

En cherchant les front-ends des projets manquants, **Paperclip (projet n° 9) est sorti de
l'ombre** : `CLAUDE.md:374-377`.

| Point | Le brief dit | `CLAUDE.md` dit |
|---|---|---|
| Nombre d'agents | **13** (CEO, CTO, CPO, CMO, CFO, CLO + 7 spécialistes) | **10 agents comité de direction**, avec des `AGENTS.md` personnalisés |
| Statut | « backlog initial de 18 tâches » | **« Premier comité lancé (acquisition 10 premiers clients) »** |
| Front-end | non mentionné | **`https://paperclip-zjyk.srv767464.hstgr.cloud`** — l'interface existe et tourne |

Le projet a donc bien une interface capturable, et son statut réel est meilleur que
« R&D interne » : un premier comité a effectivement tourné sur un objectif commercial.
**Le chiffre « 13 agents » devient un `[À VALIDER]`** — deux sources internes se
contredisent.

**Reste sans front-end, par nature :** la Baseline sécurité & RGPD (projet n° 10) est un
référentiel documentaire, et la veille YouTube (n° 12) produit un Google Sheet. Ces deux-là
ne se capturent pas comme une application — le brief le pressentait déjà pour le n° 10 en
proposant un encart transversal plutôt qu'une carte projet.
