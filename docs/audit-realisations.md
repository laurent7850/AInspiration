# Audit préalable — section « Réalisations »

> Phase 0 de `docs/PROMPT-realisations.md`. Aucun fichier de production n'a été modifié.
> Rapport établi le 3 septembre 2026 sur `feat/realisations`, base `main` @ `b88620e`.
>
> **Arbitrages déjà rendus par Laurent** : la section **complète** `/etudes-de-cas`
> (elle ne la remplace pas) ; le contenu est livré en **FR / EN / NL**.

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
| 7 | Chatbot embarquable « déjà déployé chez plusieurs clients » | **Aucune trace vérifiable** : pas d'`embed.html` dans les dépôts accessibles, pas de workflow client sur l'instance n8n. C'est la pièce maîtresse de la vitrine et c'est le projet le moins documenté. |

**Trois décisions bloquantes** avant de coder : §7, questions 1, 2 et 3.

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
| 1 | Chatbot embarquable multi-clients | `ainspiration/src/components/ChatbotN8n.tsx` ; workflows `oz9stSLsjRtRFA8F`, `ZroPJAjhPmWkj2sI` | ❌ | **Pas d'`embed.html`, pas de captation progressive de leads, aucun déploiement client vérifiable.** Le widget du site n'est pas le produit décrit. |
| 2 | Audityo | dépôt `laurent7850/audityo` (attaché) | ✅ | Rien — mais **la stack du brief est fausse** et **l'échéance est passée** (§4.3). |
| 3 | Facturation automatisée | workflow `mjZouVog4vArYBPI`, lu intégralement | ✅ | Le gain chiffré (« 6 h → 5 min ») n'a **aucune source**. Et le statut « client » est à revoir (§4.4). |
| 4 | DreamOracle | dépôt `laurent7850/DreamOracle` | ✅ | Rien de bloquant. Next.js 16, Prisma, PWA, transcription ElevenLabs, stats — conforme au brief. |
| 5 | Labo Nostalgie — playlists auditeurs | dépôt `laurent7850/playlist-generator` ; workflows `8N7Vb3R8mrBK6DLl` (actif) et `Mrvg6cCeYZEcpv1y` (**inactif**) | ⚠️ | Workflows illisibles (MCP). **Les contraintes métier 40/40/20, 30 % francophone, 25 artistes, la liste noire à 21 jours et le pack RGPD sont pour l'instant invérifiables.** |
| 6 | Générateur playlist Spotify | dépôt `laurent7850/spotify-playlist-generator` (attaché) ; workflow `lwTH2RIV2QmyTlLX` | ✅ | **Distinction avec le n° 5 confirmée sans ambiguïté** (§4.5). Le workflow lui-même reste illisible (MCP). |
| 7 | Chatbot RAG Enghien | dépôt `laurent7850/enghien-rag` | ⚠️ | Stack confirmée. **Le corpus a changé** et les chiffres (794 p., 262 000 mots, 4/18/46) ne figurent nulle part dans le dépôt. |
| 8 | L'Artpéro | dépôt `laurent7850/lartpero2` | ✅ | Production sur `lartpero.ainspiration.eu` — **capturable directement**. Stack conforme (React 18, Vite, shadcn/ui, Express, Stripe, Supabase). |
| 9 | Paperclip — 13 agents | — | ❌ | **Aucun dépôt de ce nom sur le compte.** Rien à lire, rien à capturer. |
| 10 | Baseline sécurité & RGPD | — | ❌ | **Aucun dépôt.** Les 13 sections ne sont pas localisées. |
| 11 | Préparation d'émission | workflow `bWQJiJlSMXQeMyyE` « 120 min 2026 » (actif) | ⚠️ | Existence confirmée, contenu illisible (MCP). |
| 12 | Veille YouTube → transcriptions | — | ❌ | **Aucun workflow YouTube parmi les 36.** Soit il est ailleurs, soit il n'est plus déployé. |

**Bilan : 4 projets sur 12 sont documentés au point de pouvoir écrire une fiche honnête
aujourd'hui** (2, 3, 4, 8). Quatre autres le deviennent si l'accès MCP est ouvert (5, 6, 11)
ou si les chiffres sont fournis (7). **Quatre n'ont aucune matière** (1, 9, 10, 12) — dont
la pièce maîtresse annoncée.

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

---

## 5. Ce que la mission peut réellement produire aujourd'hui

Pour être franc sur le calendrier, sans rien réduire de la commande :

- **Fiches écrivables tout de suite, sur sources vérifiées** : Audityo, Facturation,
  DreamOracle, L'Artpéro. Quatre.
- **Fiches écrivables dès l'accès MCP n8n ouvert** : Labo Nostalgie, Spotify,
  Préparation d'émission. Trois.
- **Fiche écrivable dès que Laurent fournit les chiffres** : Enghien. Une.
- **Fiches sans matière** : Chatbot embarquable, Paperclip, Baseline sécurité, Veille
  YouTube. Quatre — et la première est annoncée comme pièce maîtresse.

Le multiplicateur trilingue s'applique à tout : **12 fiches × 3 langues = 36 rédactions**,
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

1. **Chatbot embarquable (projet n° 1).** Aucune trace dans les dépôts accessibles ni sur
   l'instance n8n. Où vit le code (`embed.html`, widget React) ? Et surtout : **quels
   clients l'utilisent réellement en production aujourd'hui**, avec quelle URL publique ?
   Sans réponse, la pièce maîtresse annoncée ne peut pas être écrite — et il faudra
   reclasser la grille.

2. **Facturation : « chez nous » ou « chez un client » ?** Le workflow automatise ta
   propre facturation (ton calendrier, tes tarifs, ton email). Le présenter comme une
   livraison cliente serait un faux. Je propose de le formuler comme Audityo (« nos
   propres outils »), ce qui reste très vendeur. Confirmes-tu ? Et si un déploiement
   client existe par ailleurs, où est-il ?

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

---

## 8. Livrables de cette phase

- [x] `docs/audit-realisations.md` — ce document
- [ ] Phase 1 — architecture + maquette de la fiche Facturation : **en attente de
      validation et des réponses 2, 3 et 4**

**Aucun fichier de production n'a été modifié.** Seuls `docs/PROMPT-realisations.md` et ce
rapport ont été ajoutés sur `feat/realisations`.
