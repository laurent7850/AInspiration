---
name: AInspiration — Aurora
description: Deep-navy aurora world (indigo→teal ambient light) for the AInspiration public site — the site itself is the AI demo.
colors:
  night: "#10102A"
  night-soft: "#181838"
  night-hairline: "rgba(255,255,255,0.10)"
  aurora-indigo: "#4F46E5"
  aurora-violet: "#6D5AE8"
  aurora-teal: "#2DD4BF"
  indigo-hover: "#6366F1"
  indigo-deep: "#4338CA"
  teal-data: "#14B8A6"
  canvas: "#F9FAFB"
  surface: "#FFFFFF"
  ink: "#18181B"
  text-secondary: "#71717A"
  text-muted: "#94A3B8"
  dark-body: "rgba(224,231,255,0.85)"
typography:
  display:
    fontFamily: "Jost Variable, Jost, Outfit, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 5.25rem)"
    fontWeight: 300
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Jost Variable, Jost, Outfit, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3.75rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.2em"
rounded:
  button: "0.5rem"
  card: "1.5rem"
  band: "2rem"
  pill: "9999px"
spacing:
  card-gap: "16px"
  card-padding: "32px"
  band-padding: "40px"
  section-y: "96px"
  header-gap: "64px"
components:
  button-primary:
    backgroundColor: "{colors.aurora-indigo}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.indigo-hover}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
  button-inverse:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.indigo-deep}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  card-light:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "32px"
  card-night:
    backgroundColor: "{colors.night}"
    textColor: "#FFFFFF"
    rounded: "{rounded.card}"
    padding: "32px"
  band-aurora:
    backgroundColor: "{colors.night}"
    textColor: "#FFFFFF"
    rounded: "{rounded.band}"
    padding: "40px 56px"
---

# Design System: AInspiration — Aurora

> **Boundary — where this system applies.** Aurora currently covers the **homepage and the global shell** (Header/NavMenu, Footer, global tokens, typography, browser surfaces). The other public pages (services, blog, contact, études de cas) still run the previous light "Premium Minimaliste" generation and are scheduled for propagation into Aurora. The **CRM app behind login is explicitly outside this world** — do not restyle it from this file. When touching a not-yet-propagated public page, migrate it into Aurora rather than mixing the two generations on one surface.

## Overview

**Creative North Star: "The Aurora Over the Workshop"**

The site is an AI partner whose own surface is the demo. The ground is a deep night navy (#10102A) lit by layered indigo→teal radial auroras — ambient light suggesting "new possibilities" rather than decoration. Against that night, the product is shown working: a floating media frame, live stats on a hairline, typed scenarios. Airy white interlude sections give the eye rest between dark acts, so the page alternates night → light → night like a day cycle rather than staying monotone dark. The world is brief-pinned (Wix "Suite" template 3081) adapted to the brand's indigo; it deliberately refuses the light SaaS template of scattered gradient cards.

Density is generous: a wide 1400px stage, asymmetric grids, big light-weight display type, and few competing elements per viewport. The voice is calm and confident — one promise, one CTA, one motion.

**Key Characteristics:**
- Deep navy ground with radial aurora gradients (pure CSS, no raster backgrounds)
- Jost light display type over Outfit body — geometric, airy, thin at large sizes
- Indigo pill CTAs; teal reserved for data and small accents
- White/10 hairlines instead of borders or boxes on dark
- One scroll-reveal motion grammar for the entire page
- Section headers left-aligned, never centered (interlude quote excepted)

## Colors

A night palette lit by two hues — indigo (the brand's voice) and teal (the data's voice) — resting between white interludes.

### Primary
- **Aurora Indigo** (#4F46E5): the brand accent and the only CTA color. Fills primary pill buttons, colors the "AI" in the brand name on light grounds, drives focus rings, scrollbar, selection, and caret. Hover lightens to Indigo Hover (#6366F1); deep text-on-white uses Indigo Deep (#4338CA). Indigo-400/#a5b4fc-range tints carry the "AI" mark and links on dark grounds.
- **Aurora Violet** (#6D5AE8): a gradient-only color — the middle nebula of `.bg-aurora`. It never appears as a fill, text, or border on its own.

### Secondary
- **Aurora Teal** (#2DD4BF): the data accent on dark grounds — trust dots, process numerals, icon strokes on night cards, the quiet section's hairline dividers. Its darker sibling **Teal Data** (#14B8A6, token `accent-teal`) carries the same role on light grounds. Teal is never a CTA color.

### Neutral
- **Night** (#10102A): the base ground of every dark section; also the header (`bg-night/85` + backdrop blur) and solo night cards.
- **Night Soft** (#181838): raised dark surface step (rarely needed; the aurora gradients usually do the layering).
- **Night Hairline** (rgba(255,255,255,0.10)): all rules and borders on dark — stat dividers, header underline. Media frames use a slightly brighter ring (white/15).
- **Canvas** (#F9FAFB): light section ground and card fill on white sections.
- **Surface** (#FFFFFF): white section ground and card fill on canvas sections.
- **Ink** (#18181B): headings and primary text on light.
- **Secondary** (#71717A) / **Muted** (#94A3B8): supporting and tertiary text on light.
- **Dark Body** (rgba(224,231,255,0.85), i.e. `text-indigo-100/85`): body text on dark grounds — indigo-tinted, never gray, so dark sections stay inside the aurora's light.

### Named Rules
**The Three Grounds Rule.** Dark sections use exactly one of three authored gradient grounds: `.bg-aurora` (hero, lead surfaces — indigo top-left, teal bottom-right), `.bg-aurora-teal` (CTA bands, closing sections — teal-tilted diagonal), `.bg-aurora-quiet` (interludes — barely lit). Never compose ad-hoc gradients on navy.

**The AI Mark Rule.** Every visible "AInspiration" renders "AI" in indigo — indigo-600 (#4F46E5) on light grounds, indigo-400 on dark. Pattern in code (no shared component exists yet): `<span className="text-indigo-400">AI</span><span className="text-white">nspiration</span>` on dark (see NavMenu.tsx, Footer.tsx), indigo-600 + ink on light. Never render the brand in a single flat color.

**The No Pure Purple Rule.** Pure purple is banned. The gradient may pass through Aurora Violet (#6D5AE8, an indigo-violet), but no purple fills, purple text, or purple accents anywhere.

**The Two Voices Rule.** Indigo asks (CTAs, links, focus); teal shows (data, process numbers, trust dots, dividers). Never swap the roles — a teal button or an indigo stat dot breaks the grammar.

## Typography

**Display Font:** Jost Variable (self-hosted via @fontsource-variable/jost; falls back to Outfit, system-ui)
**Body Font:** Outfit variable 100–900 (self-hosted woff2 in /fonts; system-ui fallback)
**Mono Font:** JetBrains Mono (code contexts only)

**Character:** A geometric light-weight display over a friendly geometric body — big headlines are thin and airy (weight 300), letting the aurora glow through; body copy is warm and legible. The pairing reads modern-European rather than SaaS-bold.

### Hierarchy
- **Display** (Jost 300, text-4xl → 5.25rem at lg, line-height 1.04): hero headline only. White on aurora.
- **Headline** (Jost 300, text-3xl → text-6xl at lg): section headers. Left-aligned in a `max-w-2xl` block with 64px below.
- **Title** (Outfit 600, 1.125rem, tracking-tight): card and item headings.
- **Body** (Outfit 400, 1rem–1.25rem, leading-relaxed): paragraphs capped near 50–55ch (`max-w-[50ch]`/`[55ch]`). Ink on light, Dark Body tint on dark.
- **Label** (Outfit 500, 0.75rem, tracking 0.2em, uppercase): rare — citation attribution in the quote interlude. Indigo-300 on dark.
- **Process numeral** (Jost 300, text-3xl, teal): the `/01`–`/04` display digits on process cards.

**Documented exception — the ® superscript.** The registered-trademark superscript beside the brand wordmark (NavMenu) renders at 8px (`text-[8px] text-zinc-500`), deliberately below the type-ramp floor: it is a legal glyph, not readable text. This is the only sanctioned sub-12px size; do not reuse 8px for any content.

### Named Rules
**The Light Display Rule.** Anything set in `font-display` is weight 300 with -0.01em tracking. Bold display type does not exist in this world; emphasis comes from size, not weight. (Sub-headings inside bands may use Outfit 700 at 2xl–3xl — that is body-family, not display.)

## Layout

The stage is a `max-w-[1400px]` container with `px-4 sm:px-6 lg:px-8` gutters. Vertical rhythm is `py-16 lg:py-24` per section; the hero adds top clearance for the fixed header (`pt-28 lg:pt-36`).

Grids are **12-column and asymmetric**: the hero splits 7/5 (text/media); scenario cards split 5/7 with a full-width 12 closer; the features bento is a 3-column grid where the lead card spans 2 columns. Card gaps are tight (16px, `gap-4`) so the grid reads as one composed surface. Section headers are left-aligned `max-w-2xl` blocks with `mb-16`; only the quote interlude centers.

The page alternates grounds: aurora hero → white/canvas working sections → quiet-aurora interlude → canvas → aurora CTA bands. Rounded 2rem "bands" inside light sections carry the dark CTAs, so the aurora reappears as an object before returning full-bleed.

## Elevation & Depth

A hybrid: **hairlines and gradient light do the layering on dark; soft diffuse shadows do it on light.** Dark surfaces never use light-world gray shadows — they cast deep navy-black offsets. Nothing hard-edged, nothing neobrutalist.

### Shadow Vocabulary
- **Lift** (`0 2px 8px rgba(0,0,0,0.04)`): resting state of light cards.
- **Diffuse** (`0 20px 40px -15px rgba(0,0,0,0.05)`): hover state of light cards; also `diffuse-lg` (0 30px 60px -20px, 0.08) for larger surfaces.
- **Night cast** (`0 30px 60px -20px rgba(6,6,25,0.4–0.5)`): dark cards sitting on light grounds.
- **Frame cast** (`0 45px 90px -25px rgba(6,6,25,0.85)`): the hero media frame floating over the aurora, plus its `ring-1 ring-white/15` hairline.
- **CTA glow** (`0 18px 45px -12px rgba(79,70,229,0.65)`): under the primary pill on dark — indigo light, not gray shadow.

### Named Rules
**The Hairline Rule.** On dark grounds, separation is a 1px white/10 line (white/15 for media rings) — never a box, never a filled divider, never a gray border.

## Shapes

Everything is soft-cornered, in three deliberate steps: **pills** (9999px) for CTAs and small dots; **cards** at 1.5rem (`rounded-card`); **bands and media frames** at 2rem (`rounded-[2rem]` / `rounded-container`). Small utility elements (badges, inline inputs) sit at 0.5–0.75rem. No sharp corners, no cut corners, no blob shapes. Icons are Lucide SVG strokes at `strokeWidth={1.5}` — thin-line, matching the light display weight.

## Components

### Buttons
- **Shape:** full pill (border-radius 9999px), `px-8 py-4`, Outfit 600 at text-lg.
- **Primary:** indigo-600 fill, white text, optional second line of subtext (`text-sm font-normal text-indigo-200`), trailing arrow in a `w-10 h-10` white/10 circle. On dark, carries the indigo CTA glow shadow.
- **Hover / Focus:** fill lightens to indigo-500, `scale-[1.02]` (active `scale-[0.98]`), 200ms; the arrow circle brightens to white/20. Focus-visible: 2px outline, offset — white outline on dark, indigo on light.
- **Inverse (on aurora bands):** white fill, indigo-700 text, hover indigo-50; same pill geometry and scale behavior.

### Cards / Containers
- **Corner Style:** 1.5rem (cards), 2rem (bands and featured containers).
- **Background:** four material tones stepped through the bento — `bg-aurora` lead card, `bg-night` solo dark card, `bg-teal-50` accent card, `bg-white`/`bg-canvas` default. Dark cards get white text with Dark Body copy; the teal card uses teal-700 icon and teal-900/85 copy.
- **Shadow Strategy:** light cards rest on Lift, hover to Diffuse with `-translate-y-1`; dark cards carry the Night cast (see Elevation).
- **Border:** none on light; hairline rings only on dark media frames.
- **Internal Padding:** `p-8 lg:p-10` (bands `p-10 lg:p-14`).
- **Hover affordance:** linked cards reveal an `ArrowUpRight` glyph top-right (fade + slide in, 300ms).

### Chips / Badges
- **Style:** pastel tint fill + deep-tone text (`bg-emerald-50 text-emerald-700`, `bg-sky-50 text-sky-700`, `bg-indigo-50 text-indigo-700`), `px-3 py-1.5 rounded-lg`, icon + text-xs medium. Flat — no gradients, no shadows.

### Inputs / Fields
- **Style:** light fields; **Focus:** `ring-2 ring-indigo-200` + `border-indigo-400` (global rule in index.css) — focus is always in the accent, never gray.

### Navigation
- **Style:** fixed header, `bg-night/85` with `backdrop-blur-xl`, bottom hairline `border-white/10`. The header stays night-toned over both dark and light sections — the shell belongs to the aurora even above white interludes. Brand wordmark uses the two-span AI Mark pattern with the 8px zinc-500 ® superscript (documented exception, see Typography).

### Signature: Aurora CTA band
A `rounded-[2rem]` `.bg-aurora` or `.bg-aurora-teal` container inside a light section: left side title (Outfit 700, white) + indigo-100 supporting line or `|`-separated badge list; right side one inverse white pill. This is the recurring conversion pattern — every section that asks for the audit ends in this band.

### Signature: Numbered process card
White `rounded-card` card opening with a Jost-light `/0n` numeral in Teal Data, then title + body. The slash-prefixed teal numeral is the process grammar.

### Motion: the Reveal grammar
One motion for the whole page: `Reveal` (src/components/ui/Reveal.tsx) wraps content in `.reveal` — start at `opacity: 0; translateY(24px)`, land over 0.7s on `cubic-bezier(0.16, 1, 0.3, 1)` when 15% enters the viewport, staggered in 90ms steps within a grid row. Count-up stats animate once on entry. Under `prefers-reduced-motion`: reveals are instant, count-ups render their final value, and the hero video is never mounted (the still image stays). Do not add other entrance animations.

## Do's and Don'ts

### Do:
- **Do** use the three authored grounds (`.bg-aurora`, `.bg-aurora-teal`, `.bg-aurora-quiet`) for every dark section — they are the only sanctioned gradients (The Three Grounds Rule).
- **Do** set the "AI" in "AInspiration" in indigo everywhere via the two-span pattern (The AI Mark Rule).
- **Do** keep display type at Jost weight 300; scale for emphasis, never embolden.
- **Do** tint body text on dark with indigo (`text-indigo-100/85`), never plain gray/white-alpha grays.
- **Do** self-host every font (Outfit woff2 in /public/fonts, Jost via @fontsource-variable) — the CSP forbids external assets.
- **Do** route all visible text through i18next (fr/en/nl); no hard-coded strings.
- **Do** honor `prefers-reduced-motion`: instant reveals, static stats, no mounted video.
- **Do** left-align section headers in a max-w-2xl block; cap body measure near 50–55ch.

### Don't:
- **Don't** use pure purple anywhere — fills, text, or accents (The No Pure Purple Rule).
- **Don't** put teal on a CTA or indigo on a data accent (The Two Voices Rule).
- **Don't** draw boxes or gray borders on dark grounds — hairlines only (The Hairline Rule).
- **Don't** fabricate proof: no invented client names, logos, testimonials, or metrics — scenario cards are explicitly typed as scenarios (see PRODUCT.md and the no-fabricated-proof rule).
- **Don't** center section headers (the quote interlude is the sole exception).
- **Don't** introduce a second motion grammar — everything enters through Reveal.
- **Don't** set any text below 12px — the sole exception is the 8px ® trademark superscript in the brand wordmark (documented exception in Typography).
- **Don't** apply Aurora to the CRM behind login, and don't mix Aurora tokens with the outgoing Premium Minimaliste light generation on the same surface — propagate a page fully or leave it.
