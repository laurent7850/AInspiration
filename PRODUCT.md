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
- Deux couleurs, échantillonnées au pixel sur `public/logo-ainspiration.png` : le bleu
  **#4540D0** (le cerveau et le « AI ») et le navy **#1E293B** (le mot-marque). Le « AI »
  d'« AInspiration » est toujours dans le bleu, le reste du mot dans le navy.
- #4540D0 = couleur de marque primaire et **accent unique** ; aucune seconde couleur d'accent
  (le teal d'Aurora a été supprimé pour cette raison). Le violet pur reste banni.
- ⚠️ **Le fichier logo est défectueux** : `logo-ainspiration.png` est amputé du « i »
  d'« inspiration » (la lettre n'est pas dessinée) et lit « AInsp ration ». Le mot-marque est
  donc **re-composé en Outfit 700 + tracking-tight**, calé sur le ratio largeur / hauteur de
  capitale de l'original (7,95). `logo-ainspiration.svg` n'est qu'un JPEG embarqué ;
  `white_logo_-_no_background.svg` est un vrai vectoriel mais porte une AUTRE identité.
  Remplacer le lettrage par l'asset dès qu'un fichier propre existe.
- Le ® affiché dans l'en-tête ne figure pas sur le logo — statut de dépôt à confirmer.
- Monde visuel courant : « **Atelier clair** » (2026-09-10) — fond craie #FFFFFF, panneaux
  #F8F8FA, filets #E4E4EA, arrondis généreux, aucune ombre décorative, aucun dégradé, une
  seule famille (Outfit). Voir DESIGN.md.

## Contraintes techniques
React 18 + Vite + Tailwind, i18next (fr/en/nl — tout texte visible passe par les locales),
Express + PostgreSQL sur VPS. CSP stricte : aucun asset externe (fonts auto-hébergées).
Perf : hero = LCP critique (image stable montée sous la vidéo). Baseline sécurité Distr'Action
applicable (RGPD, rate limiting, validation serveur).

## Périmètre design
Mode Persuade sur tout le site public, entièrement migré en Atelier clair (accueil, coque,
services, blog, contact, réalisations, pages légales) ; le CRM interne (Operate) reste hors
de ce monde tant que non demandé.
