# PRODUCT.md — AInspiration

## Ce que c'est
Cabinet belge (Distr'Action SRL) de solutions IA pour PME francophones : audit gratuit en 24h,
automatisation de processus (n8n), chatbots/assistants, génération de contenu, analyse de données,
CRM. Site vitrine multilingue (fr défaut, en, nl) + CRM interne derrière login.

## Audience
Dirigeants de PME en Belgique et France (restaurateurs, e-commerçants, agences, artisans,
professions libérales). Non techniques, pressés, méfiants envers le battage IA. Scène d'usage :
bureau ou mobile, en journée, décision rapide.

## Action attendue (Persuade)
Demander l'audit IA gratuit (formulaire 4 étapes) — le seul tunnel de conversion.
Secondaire : contact, newsletter.

## Preuve honnête — contrainte absolue
**Aucun client réel à ce jour. Aucune preuve fabriquée, jamais** (décision 2026-08-28, purge
commit e4ff57e) : pas de faux témoignages, faux avis schema.org, fausses stats agrégées, faux
logos. La preuve autorisée : scénarios explicitement étiquetés « illustratifs », objectifs
chiffrés présentés comme des cibles (« jusqu'à… », « objectif type »), et le cas réel du site
lui-même (blog auto-généré n8n 50+ articles, CRM maison, pipeline d'audit automatisé,
3 langues). Toute stat affichée doit être un fait de service vérifiable (24h audit, 48h mise
en place, données EU/RGPD).

## Engagements de marque
- « AI » dans « AInspiration » toujours en indigo (composant `<BrandName />`) — indigo-600 sur
  clair, indigo-400 sur fond sombre.
- Indigo = couleur de marque primaire ; le violet pur est banni.
- Monde visuel courant : « Aurora » (2026-08-29, épinglé par le client sur le template Wix
  « Suite » 3081) — navy #10102A, aurores radiales indigo→teal, Jost light en display,
  Outfit en body, sections blanches aérées en alternance. Voir DESIGN.md.

## Contraintes techniques
React 18 + Vite + Tailwind, i18next (fr/en/nl — tout texte visible passe par les locales),
Express + PostgreSQL sur VPS. CSP stricte : aucun asset externe (fonts auto-hébergées).
Perf : hero = LCP critique (image stable montée sous la vidéo). Baseline sécurité Distr'Action
applicable (RGPD, rate limiting, validation serveur).

## Périmètre design
Mode Persuade sur tout le site public ; le CRM interne (Operate) n'est pas concerné par le
monde Aurora tant que non demandé.
