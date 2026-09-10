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
  kicker:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0"
rounded:
  button: "9999px"
  soft: "0.875rem"
  card: "1.375rem"
  container: "2rem"
  pill: "9999px"
spacing:
  card-padding: "32px"
  card-gap: "16px"
  section-y: "64px"
  section-y-lg: "96px"
  band-padding: "40px 56px"
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
    borderColor: "{colors.line}"
    rounded: "{rounded.button}"
    padding: "14px 24px"
  card:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.line}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "32px"
  card-featured:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.accent}"
    borderWidth: "2px"
    rounded: "{rounded.card}"
    padding: "32px"
  band-accent:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.card}"
    padding: "40px 56px"
---

# Design System : AInspiration — Atelier clair

> **Périmètre.** Atelier clair couvre la **page d'accueil et la coque globale**
> (Header/NavMenu, Footer, tokens, typographie, surfaces navigateur). Les autres
> pages publiques (services, blog, contact, réalisations) tournent encore sur la
> génération précédente « Aurora » et doivent être migrées, pas mélangées : quand
> on touche une page pas encore migrée, on la fait basculer dans Atelier clair
> plutôt que de laisser cohabiter les deux mondes sur une même surface. Le **CRM
> derrière le login est explicitement hors de ce monde** — ne pas le restyler
> depuis ce fichier.

## Vue d'ensemble

**Point de départ : les deux couleurs du logo, rien d'autre.**

Le bleu `#4540D0` (le cerveau et le « AI ») et le navy `#1E293B` (le mot-marque)
sont échantillonnés au pixel sur `public/logo-ainspiration.png`. Tout le reste de
la palette est neutre. Le fond « Craie » — blanc franc, cartes en très léger
retrait — a été retenu après comparaison de six fonds candidats (sable, lin,
bleuté, vert-de-gris, craie, nuit).

Ce que la direction remplace : Aurora, un monde nuit + dégradé indigo→violet +
accent teal. Ses trois défauts étaient un accent dédoublé (indigo pour l'action,
teal pour la donnée, donc aucune hiérarchie), un violet qui ne venait d'aucune
réalité de la marque, et un rayon unique appliqué partout qui aplatissait tout.

**Caractéristiques :**

- Fond blanc, panneaux `#F8F8FA`, séparation par filets `#E4E4EA` — jamais par
  une ombre.
- **Un seul accent.** Le bleu du logo porte l'action et rien d'autre. Une preuve,
  un chiffre, un libellé se lisent en encre.
- Arrondis généreux et assumés : 22 px sur les cartes, 14 px sur les petits blocs,
  pilule pleine sur les boutons.
- Une seule famille typographique (Outfit) à plusieurs graisses, titres en 700 et
  tracking serré.
- Aucune ombre décorative. `shadow-diffuse` ne sert plus qu'aux surfaces vraiment
  flottantes (menus déroulants).

## Couleurs

### Accent

- **Accent** `#4540D0` — la couleur du logo. Remplit les CTA, colore le « AI » de
  la marque, les puces, les compteurs d'étape, l'anneau de focus, la sélection et
  la scrollbar. Survol : `#3A35B8` (accent-dark). `#5F58DA` (accent-light) sert
  aux états secondaires.
- **Accent-wash** `#EEEDFC` — fond des pastilles et des états sélectionnés. Jamais
  du texte.

La rampe `indigo` de Tailwind est **recentrée sur cette couleur** dans
`tailwind.config.js` (600 = `#4540D0`) : plus de 1100 occurrences de `indigo-*`
existaient dans le code, les recentrer valait mieux que les réécrire une à une.
Une nouvelle classe `indigo-*` reste donc acceptable, elle tombe dans la marque.

### Neutres

- **Canvas** `#FFFFFF` — le sol de la page.
- **Surface** `#F8F8FA` — panneaux, sections en alternance, cartes en retrait.
- **Ink** `#1E293B` — le navy du logo, couleur de tout le texte courant.
- **Secondary** `#6B7280` — texte d'appui, libellés, descriptions.
- **Muted** `#9AA1AC` — mentions, légendes, placeholders.
- **Line** `#E4E4EA` — le filet, seul outil de séparation.

Le rythme des sections alterne canvas et surface. Deux sections voisines ne
portent jamais le même fond.

## Typographie

Outfit, une seule famille, auto-hébergée en woff2 (`public/fonts/`) pour ne pas
payer un aller-retour Google Fonts sur le LCP. Jost, mentionné par l'ancienne
génération, n'a jamais été chargé et a été retiré de la pile.

- Les titres d'affichage sont en **700**, `letter-spacing: -0.035em`. Aurora les
  voulait légers et aérés : c'est l'inverse exact.
- Le corps reste en 400 avec `leading-relaxed`, largeur maximale ~50 caractères
  pour les chapôs, 64 pour les réponses longues.
- Chiffres alignés (`tabular-nums`) partout où ils se comparent : prix, durées,
  compteurs.
- Le kicker (surtitre) est en 600, à l'accent, précédé d'un trait de 28 × 3 px.
  Il remplace les petites capitales espacées d'Aurora.

### Le trait dessiné

`.underline-hand` souligne **un seul mot** du titre principal d'une page, d'un
trait tracé à main levée en SVG. Un par page, jamais deux. Le mot vient de la
traduction (`hero.titleAccent`) pour que les trois langues restent justes ; si la
clé manque, le titre s'affiche sans trait plutôt que de casser.

Le trait reste dans la boîte de sa propre ligne (`bottom: 0.02em`) : le mot
souligné n'a pas de jambage, et un trait plus bas mord sur la ligne suivante dès
que le titre passe à la ligne.

## Formes et profondeur

- **Rayon** : `rounded-card` (22 px) pour les blocs, `rounded-soft` (14 px) pour
  les petits éléments, `rounded-button` (pilule) pour toute action. Pas de
  `rounded-lg` par défaut.
- **Bordure plutôt qu'ombre.** Un bloc se détache par un filet `line`, pas par une
  élévation. Au survol, la bordure fonce (`border-ink/25`) — on ne déplace pas le
  bloc, on ne l'agrandit pas.
- **Ombres** : réservées aux surfaces réellement flottantes (menus, popovers).
  Aucune ombre sur un élément en flux.
- **Un seul aplat d'accent par écran** : la bande CTA. Les boutons accent peuvent
  cohabiter avec elle, mais pas un second aplat plein.

## États

- `focus-visible` : anneau de 2 px à l'accent, décalé de 2 px. Jamais
  `outline-none`.
- Cibles tactiles ≥ 44 px, y compris les lignes de FAQ.
- Survol : changement de couleur uniquement (bordure ou fond), 180–200 ms,
  `ease-out`. Pas de `scale`, pas de translation verticale sauf `active`.
- `prefers-reduced-motion` coupe les animations globalement (`src/index.css`).

## Ce qu'on n'utilise plus

- `.bg-aurora`, `.bg-aurora-teal`, `.bg-aurora-quiet` et la couleur `night` :
  toujours définies pour les pages pas encore migrées, à supprimer quand la
  dernière page publique aura basculé.
- Le teal comme accent de données — il créait un second accent.
- `shadow-lift` / `shadow-diffuse` sur des cartes en flux.
- Les titres en `font-light`.
