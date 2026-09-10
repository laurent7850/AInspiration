---
name: AInspiration — Atelier clair
description: Monde clair « Craie » construit sur les deux couleurs du logo — bleu #4540D0 et navy #1E293B — pour le site public AInspiration.
colors:
  canvas: "#FFFFFF"
  surface: "#F8F8FA"
  ink: "#1E293B"
  text-secondary: "#6B7280"
  text-muted: "#9AA1AC"
  line: "#E4E4EA"
  accent: "#4540D0"
  accent-light: "#5F58DA"
  accent-dark: "#3A35B8"
  accent-wash: "#EEEDFC"
  success: "#10B981"
  error: "#EF4444"
  warning: "#F59E0B"
typography:
  display:
    fontFamily: "Outfit, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  lede:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  mono:
    fontFamily: "JetBrains Mono, Geist Mono, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  prose:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.75
  prose-h1:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  prose-h2:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  prose-h3:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  prose-h4:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  code: "0.375rem"
  soft: "0.875rem"
  card: "1.375rem"
  button: "9999px"
spacing:
  card-gap: "16px"
  card-padding: "32px"
  band-padding: "40px 56px"
  section-y: "64px"
  section-y-lg: "96px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.button}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.accent-dark}"
    textColor: "#FFFFFF"
    rounded: "{rounded.button}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "14px 24px"
  button-inverse:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.accent-dark}"
    rounded: "{rounded.button}"
    padding: "16px 32px"
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "32px"
  card-featured:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "32px"
  band-accent:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.card}"
    padding: "40px 56px"
  chip-wash:
    backgroundColor: "{colors.accent-wash}"
    textColor: "{colors.accent-dark}"
    rounded: "{rounded.button}"
    padding: "4px 12px"
---

# Design System : AInspiration — Atelier clair

> **Périmètre.** Atelier clair couvre **tout le site public** : page d'accueil,
> coque globale (Header/NavMenu, Footer), pages services, blog, contact,
> réalisations, pages légales. Plus aucune classe Aurora ne subsiste dans
> `src/`. Le **CRM derrière le login est explicitement hors de ce monde** — ne pas
> le restyler depuis ce fichier.

## Overview

**Creative North Star : « L'atelier sous la verrière »**

Un atelier éclairé au jour : les murs sont blancs, les établis d'un gris à peine
plus sombre, et un seul outil est peint en bleu — celui avec lequel on travaille.
Rien n'est mis en scène, rien n'est éclairé artificiellement. Ce qui se voit, ce
sont les pièces et les mesures, pas le décor.

Les deux couleurs de la marque sont échantillonnées au pixel sur
`public/logo-ainspiration.png` : le bleu `#4540D0` (le cerveau et le « AI ») et le
navy `#1E293B` (le mot-marque). Tout le reste est neutre. Le fond « Craie » —
blanc franc, panneaux en très léger retrait — a été retenu par le client après
comparaison de six fonds candidats (sable, lin, bleuté, vert-de-gris, craie,
nuit).

Anti-référence confirmée : **Aurora**, la génération précédente (nuit `#10102A`,
dégradés radiaux indigo→violet, accent teal, CTA en pilule ombrée de couleur).
Ses trois défauts sont interdits de retour — un accent dédoublé qui aplatit la
hiérarchie, une teinte qui ne vient d'aucune réalité de la marque, et un rayon
unique appliqué partout.

**Key Characteristics :**

- Fond blanc, panneaux `#F8F8FA`, séparation par filets `#E4E4EA` — jamais par une ombre
- Un seul accent : le bleu du logo, réservé à l'action
- Arrondis généreux et assumés (22 px sur les blocs, pilule pleine sur les actions)
- Une seule famille typographique (Outfit) à plusieurs graisses, titres en 700
- Aucun dégradé, aucune ombre décorative

## Colors

Deux couleurs de marque et une échelle de neutres légèrement froids. Aucune
troisième teinte n'entre dans le monde ; les couleurs sémantiques (succès,
erreur, alerte) ne servent qu'aux états de formulaire.

### Primary

- **Bleu Cerveau** (`#4540D0`) : la couleur du logo. Remplit les CTA, colore le
  « AI » de la marque, les puces, les compteurs d'étape,
  l'anneau de focus, la sélection de texte et la scrollbar. Survol :
  **Bleu Encre** (`#3A35B8`). **Bleu Clair** (`#5F58DA`) sert aux états
  secondaires et aux liens sur fond sombre.
- **Voile Bleu** (`#EEEDFC`) : fond des pastilles, des états sélectionnés et des
  survols de ligne. Ne porte jamais de texte à lui seul — il est toujours associé
  à l'encre ou au bleu encre.

La rampe `indigo` de Tailwind est **recentrée sur cette couleur** dans
`tailwind.config.js` (600 = `#4540D0`) : plus de 1100 occurrences de `indigo-*`
existaient dans le code, les recentrer valait mieux que de les réécrire une à une.
Une classe `indigo-*` reste donc acceptable, elle tombe dans la marque.

### Neutral

- **Craie** (`#FFFFFF`) : le sol de la page.
- **Établi** (`#F8F8FA`) : panneaux, sections en alternance, cartes en retrait.
- **Navy Marque** (`#1E293B`) : le navy du logo, couleur de tout le texte courant.
- **Gris Atelier** (`#6B7280`) : texte d'appui, libellés, descriptions.
- **Gris Mention** (`#9AA1AC`) : légendes, mentions légales, placeholders.
- **Filet** (`#E4E4EA`) : la bordure — seul outil de séparation.

### Named Rules

**La règle des deux couleurs.** Toute couleur visible vient du logo ou est un
neutre de cette liste. Introduire une troisième teinte demande de modifier ce
fichier, pas un composant.

**La règle du seul bleu.** L'accent ne colore que ce sur quoi on clique. Une
preuve, un chiffre, une date, un libellé se lisent en encre. Test : si un élément
bleu n'est pas cliquable, il est en trop.

## Typography

**Display :** Outfit (repli `system-ui`, `-apple-system`, `sans-serif`)
**Body :** Outfit — la même famille
**Mono :** JetBrains Mono, uniquement dans le CRM et les blocs de code du blog

**Caractère :** une géométrique large et ronde, lisible en petites tailles et
franche en gros titres. Auto-hébergée en woff2 (`public/fonts/`) pour ne pas payer
un aller-retour Google Fonts sur le LCP. Jost, mentionné par la génération
précédente, n'a jamais été chargé — ni `@font-face` ni `<link>` — et a été retiré
de la pile.

### Hierarchy

- **Display** (700, `clamp(2.25rem, 6vw, 4.5rem)`, 1.08, `-0.035em`) : le titre du
  hero, un par page.
- **Headline** (700, `clamp(1.875rem, 4vw, 3rem)`, 1.1, `-0.035em`) : les titres de
  section.
- **Title** (600, 1.125rem, 1.4, `-0.02em`) : titres de cartes et de questions.
- **Lede** (400, 1.125rem, 1.65) : le chapô sous un titre, ≤ 50 caractères par ligne.
- **Body** (400, 1rem, 1.625) : le texte courant, ≤ 64 caractères par ligne.
- **Label / kicker** (600, 0.875rem) : le surtitre, à l'accent, précédé d'un trait
  de 28 × 3 px. Il remplace les petites capitales espacées d'Aurora — pas de
  `uppercase`, pas de `tracking-[0.2em]`.

Les chiffres qui se comparent — prix, durées, compteurs — sont en `tabular-nums`.

### Named Rules

**La règle des deux tailles.** Deux niveaux de titre qui s'opposent franchement
valent mieux que trois qui se ressemblent. Entre Display et Title, il n'y a rien.

**La règle du trait unique.** `.underline-hand` souligne **un seul mot** du titre
principal, une fois par page. Le mot vient de la traduction (`hero.titleAccent`)
pour que les trois langues restent justes ; si la clé manque ou ne figure pas dans
le titre, le titre s'affiche sans trait plutôt que de casser.

## Layout

Conteneur à `1400px` maximum, gouttières `px-4 / sm:px-6 / lg:px-8`. Le hero suit
une grille asymétrique de 12 colonnes (texte 7, visuel 5) ; les sections courantes
alternent 1, 3 et 4 colonnes selon le contenu, jamais une grille imposée.

Rythme vertical : `64px` de padding vertical par section, `96px` à partir de `lg`.
L'espacement n'est pas uniforme — serré à l'intérieur d'un bloc (`8–16px`), large
entre les blocs (`64px`) : c'est l'écart qui fait le groupement.

Points de rupture Tailwind par défaut (`sm 640`, `md 768`, `lg 1024`, `xl 1280`).
Tout est vérifié à 375 px ; les cibles tactiles ne descendent jamais sous 44 px,
y compris les lignes de FAQ.

### Named Rules

**La règle de l'alternance.** Deux sections voisines ne portent jamais le même
fond. Craie, puis Établi, puis Craie.

## Elevation & Depth

**Le système est plat.** La profondeur vient d'un changement de valeur — Craie
contre Établi — et d'un filet d'un pixel. Aucun élément en flux ne porte d'ombre.

Les ombres restent définies pour les seules surfaces qui flottent réellement
au-dessus du document : menus déroulants du header, popovers, modales.

### Shadow Vocabulary

- **`shadow-diffuse`** (`0 20px 40px -15px rgba(0,0,0,0.05)`) : la seule ombre du
  système. Menus déroulants du header, popovers. Rien d'autre.

`shadow-lift`, `shadow-diffuse-lg` et `shadow-inner-glow` ont été supprimés du token
layer le 10/09/2026, une fois leurs derniers usages convertis en bordures.


### Named Rules

**La règle du filet.** Un bloc se détache par une bordure, jamais par une
élévation. Au survol, la bordure fonce (`border-ink/25`) : on ne déplace pas le
bloc, on ne l'agrandit pas, on ne l'éclaire pas.

## Shapes

Le rayon est le trait le plus reconnaissable de ce monde, et il est franc :

- **`rounded-button`** (pilule, `9999px`) : toute action, sans exception.
- **`rounded-card`** (`1.375rem` / 22 px) : cartes, panneaux, bandes CTA, cadres
  média.
- **`rounded-soft`** (`0.875rem` / 14 px) : petits blocs internes, pastilles
  carrées, vignettes d'icône.

Les bordures font 1 px (`line`), 2 px uniquement pour désigner l'élément mis en
avant d'une série, et sur les quatre côtés.

### Named Rules

**La règle de la pilule.** Toute action est une pilule ; tout bloc est à 22 px.
Un `rounded-lg` à 8 px dans ce monde est une erreur, pas une nuance.

**La règle des quatre côtés.** Une bordure colorée entoure ou n'existe pas. Un
filet épais sur un seul bord — la « tranche » d'accent — est banni : c'est la
signature la plus reconnaissable d'une interface générée.

## Components

### Buttons

- **Forme :** pilule pleine (`9999px`), hauteur minimale 44 px.
- **Primary :** fond accent, texte blanc, `16px 32px`. Survol : `accent-dark`.
  `active` descend d'un pixel (`translate-y-px`) — pas de `scale`.
- **Inverse :** sur une bande accent, fond blanc et texte `accent-dark`.
- **Outline :** fond transparent, bordure `line`, texte encre. Survol : bordure
  encre, fond `surface`.
- **Focus :** anneau de 2 px à l'accent, décalé de 4 px sur les boutons pleins.

### Cards / Containers

- **Coins :** 22 px. **Fond :** Craie sur une section Établi, et inversement.
- **Bordure :** filet 1 px. **Ombre :** aucune.
- **Padding interne :** 32 px (`lg:40px` sur les bandes).
- **Mise en avant :** bordure accent de 2 px sur les quatre côtés, plus une
  pastille `chip-wash` — jamais un fond sombre ni un fond plein.

### Navigation

Header fixe, fond `canvas/90` avec `backdrop-blur`, filet bas `line`. Liens en
`Gris Atelier`, encre au survol. Le CTA d'audit est la seule pilule pleine de la
barre. Le mot-marque porte « AI » à l'accent et « nspiration » en encre.

### Inputs / Fields

Fond Craie, bordure `line`, rayon `soft`. Focus : bordure accent + anneau de 2 px.
Erreur : bordure `error` et message sous le champ, jamais un simple bord rouge.

### Prose d'article (`.blog-prose`)

La seule surface du site avec sa propre échelle typographique (`prose`,
`prose-h1` à `prose-h4`) : un article se lit, il ne se scanne pas. Colonne de
42 rem, interlignage 1.75.

- **Titres** : filet `line` d'un pixel sous les `h2`, rien sous les autres.
- **Citation** : panneau `surface` cerné d'un filet sur les quatre côtés, rayon
  `soft`. Pas de bandeau latéral, pas de dégradé.
- **Encadré** : fond `accent-wash`, filet sur les quatre côtés, rayon `soft`.
- **Code** : en ligne sur `surface` au rayon `code` (0.375rem — un chip de 14 px
  ne peut pas porter le rayon `soft`), en bloc sur `ink`. Liens à l'accent.

### Bande CTA

Aplat accent plein, rayon 22 px, texte blanc, bouton inverse. **Une seule par
écran** : c'est le seul endroit où le monde hausse la voix.

## Do's and Don'ts

### Do:

- **Do** réserver l'accent à ce sur quoi on clique — un chiffre de preuve se lit en encre.
- **Do** séparer par un filet `#E4E4EA` et un changement de fond.
- **Do** utiliser `rounded-button` pour toute action et `rounded-card` pour tout bloc.
- **Do** alterner les fonds Craie et Établi d'une section à la suivante.
- **Do** mettre `tabular-nums` sur tout chiffre qui se compare à un autre.
- **Do** faire varier l'espacement selon le groupement (8–16 px dedans, 64 px entre).
- **Do** vérifier chaque page à 375 px avant de la considérer finie.

### Don't:

- **Don't** ajouter un second accent — le teal d'Aurora a été retiré pour cette raison.
- **Don't** poser un dégradé, où que ce soit.
- **Don't** mettre une ombre sur un élément en flux (`shadow-lift`, `shadow-diffuse`).
- **Don't** poser un filet épais sur un seul bord d'un bloc.
- **Don't** agrandir ou déplacer un bloc au survol (`hover:scale`, translation).
- **Don't** écrire un titre en `font-light` : les titres sont en 700.
- **Don't** réutiliser `.bg-aurora`, `.bg-aurora-teal`, `.bg-aurora-quiet` ni la
  couleur `night` — elles ne survivent que pour les pages pas encore migrées et
  disparaissent avec la dernière.
