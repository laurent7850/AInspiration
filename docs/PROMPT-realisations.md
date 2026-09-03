# Mission Claude Code — Vitrine « Réalisations » pour ainspiration.eu

> **Comment utiliser ce fichier** : place-le à la racine du dépôt du site sous
> `docs/PROMPT-realisations.md`, puis lance Claude Code avec :
> `Lis docs/PROMPT-realisations.md et exécute la Phase 0. Ne code rien avant d'avoir livré le rapport d'audit et obtenu ma validation.`

---

## 1. Rôle

Tu es **lead développeur front-end + directeur artistique + copywriter B2B** sur le site
`ainspiration.eu`. Tu travailles pour Laurent (Distr'Action SRL, Enghien, Belgique).

Tu n'es pas seulement un exécutant technique : chaque décision doit être défendable
sur trois axes — **conversion commerciale**, **cohérence visuelle**, **crédibilité technique**.
Si un choix ne sert aucun des trois, ne le fais pas.

---

## 2. Contexte business

**AInspiration.eu** est l'activité de conseil et de formation IA pour PME belges et
françaises (marque du groupe Distr'Action SRL, qui porte aussi Audityo, DreamOracle,
Le Labo Nostalgie et AI Academy).

- **Promesse actuelle du site** : « Gagnez 10h par semaine grâce à l'IA »
- **Cible** : dirigeants et responsables de PME (10 à 250 personnes), non techniques,
  francophones (Belgique / France), qui doutent que l'IA soit applicable *chez eux*
- **Offres** : audit IA gratuit, automatisation intelligente, chatbots et assistants,
  génération de contenu, analyse de données et tableaux de bord, CRM intelligent, formation
- **Sections existantes** : Audit IA gratuit, Solutions IA, Automatisation, Formation IA,
  Blog (8 articles), Contact
- **Hébergement** : Netlify — chaîne exacte à confirmer en Phase 0
- **Couleur dominante observée** : bleu nuit `#10102A` — à confirmer par extraction

### Le problème à résoudre

Le site vend des promesses (« gagnez 10h par semaine ») sans **jamais montrer une seule
preuve**. Le prospect PME n'a aucun moyen de vérifier que l'agence sait faire.

### L'objectif de cette mission

Créer une section **Réalisations** qui transforme le doute en confiance :
faire comprendre en un coup d'œil, à un dirigeant non technique, **ce qui a été construit,
pour qui, et ce que ça lui a rapporté** — puis l'amener à demander l'audit gratuit.

**Critère de réussite** : un visiteur qui ne connaît pas Laurent doit pouvoir dire, après
90 secondes sur la page, ce que l'agence sait faire et pourquoi elle est crédible.

---

## 3. Décisions déjà prises (non négociables)

| Sujet | Décision |
|---|---|
| **Architecture** | Page index `/realisations` + une page détail par projet `/realisations/[slug]` |
| **Angle éditorial** | Résultats business chiffrés d'abord ; la technique ensuite, en second niveau |
| **Clients** | **Anonymisés par défaut.** Aucun nom de client, de marque radio ou d'enseigne sans autorisation écrite |
| **Captures d'écran** | Tu les produis toi-même, en pilotant un navigateur (voir §8) |
| **Périmètre design** | **Zéro refonte.** Tu respectes strictement le design system existant |
| **Chiffres** | **Aucune invention.** Tout chiffre non sourçable devient un marqueur `[À VALIDER : …]` |

---

## 4. Phase 0 — Audit avant toute ligne de code

**Tu ne modifies aucun fichier tant que la Phase 0 n'est pas livrée et validée.**

Produis `docs/audit-realisations.md` répondant à :

### 4.1 Le dépôt et la chaîne de déploiement
1. Quel framework ? (Next.js App Router / Pages Router, Astro, Vite+React, site statique, autre)
2. Comment sont générées les pages existantes (accueil, Solutions IA, Blog) ? Y a-t-il déjà
   un système de contenu (MDX, JSON, CMS headless, données en dur) ? **Réutilise-le plutôt
   que d'en inventer un.**
3. Comment le blog gère-t-il ses 8 articles ? Le même mécanisme peut-il porter les fiches projets ?
4. Comment se fait le déploiement (Netlify Git, build command, dossier de publication,
   variables d'environnement, previews de branche) ?
5. Y a-t-il un `CLAUDE.md`, un README, un guide de contribution, une convention de commit ?
6. Contraintes existantes : version Node, gestionnaire de paquets, lint, tests, TypeScript strict ?

### 4.2 Le design system réel
Ne te fie pas à ce que tu crois voir : **extrais** depuis le code.

- Palette complète (primaire, secondaire, accents, fonds, textes, états) avec les valeurs exactes
- Typographies : familles, graisses, échelle de tailles, hauteurs de ligne
- Échelle d'espacement, rayons de bordure, ombres, bordures
- Composants réutilisables déjà présents : boutons (toutes variantes), cartes, badges,
  sections, en-têtes de page, fil d'Ariane, CTA de fin de section
- Grille et points de rupture responsive
- Animations et transitions existantes (durées, courbes)
- Mode sombre / clair : géré ou non ?
- Icônes : quelle bibliothèque, quel style, quelle taille par défaut

Livre le résultat sous forme de tableau exploitable, et signale toute **incohérence**
(deux bleus presque identiques, trois tailles de bouton, etc.) sans la corriger de ta
propre initiative — propose-la en fin de rapport.

### 4.3 SEO et performance de référence
- Structure des métadonnées, Open Graph, Twitter Cards, sitemap, `robots.txt`
- Données structurées JSON-LD déjà présentes ?
- Scores Lighthouse actuels d'une page comparable (à conserver ou améliorer, jamais dégrader)
- Analytics / tracking en place (lequel, quels événements)

### 4.4 Sources de contenu disponibles localement
Les projets vivent principalement dans les worktrees Claude Code de Laurent :

```
C:\Users\laure\.claude-worktrees\
  ├─ 120 Min\                  → workflow n8n de préparation d'émission
  ├─ Artpéro\…\lartpero2\      → plateforme L'Artpéro (React/Supabase/Stripe)
  ├─ Brasserie de la patinoire\→ chatbot embarquable client
  ├─ Dreams\…\dream-oracle\    → DreamOracle (Next.js)
  ├─ FacturationAnim\workflows\→ facturation-radio-mensuel.json
  ├─ Labo Nosta\               → Le Labo Nostalgie : playlists auditeurs + pack RGPD
  ├─ Ville-enghien\…\enghien-rag\ → chatbot RAG Histoire d'Enghien
  └─ Youtubeextract\           → workflows n8n de transcription

C:\Users\laure\playlist-generator-deploy\  → formulaire d'entrée du Labo Nostalgie
                                             (dépôt GitHub laurent7850/playlist-generator)
```

**Instance n8n** : `n8n.srv767464.hstgr.cloud` — plus de 30 workflows. Identifiants utiles :

| Workflow | ID | Projet |
|---|---|---|
| Génération Playlist — CLASSIQUE (lundi-vendredi) | `8N7Vb3R8mrBK6DLl` | Le Labo Nostalgie (n° 5) |
| Génération Playlist — ÉTÉ (samedi, saisonnier) | `Mrvg6cCeYZEcpv1y` | Le Labo Nostalgie (n° 5) |
| AUDIT Langue FR-INT — catalogue playlist | `RYWMDjWiSoK8C72O` | Le Labo Nostalgie (n° 5) |
| Générateur playlist Spotify (webhook → Claude → Spotify) | `lwTH2RIV2QmyTlLX` | **Projet n° 6 — distinct** |
| Préparation d'émission hebdomadaire | `bWQJiJlSMXQeMyyE` | Projet n° 11 |
| Générateur de playlists (DJ Lyric, référence README) | `8N7Vb3R8mrBK6DLl` | Projet n° 5 |

⚠️ **Point de vigilance confirmé** : les projets n° 5 et n° 6 sont **deux réalisations
différentes** malgré des noms proches. Le n° 5 envoie un email de playlist à un auditeur
de radio ; le n° 6 crée une vraie playlist dans un compte Spotify. Vérifie les deux
workflows avant d'écrire une seule ligne les concernant, et ne réutilise pas le même
visuel ni le même argumentaire.

Recense pour chaque projet retenu (§6) ce que tu trouves réellement : README, `CLAUDE.md`,
`package.json`, JSON de workflows, captures existantes. **Signale explicitement les projets
pour lesquels tu manques de matière** — ne comble pas les trous par de l'invention.

### 4.5 Ce que tu dois demander à Laurent avant de coder
Termine le rapport par une liste numérotée de questions **bloquantes** (accès, URLs de
production, comptes de démonstration, arbitrages). Voir §12 pour celles déjà identifiées.

---

## 5. Architecture de la section

### 5.1 Page index `/realisations`

Ordre imposé, de haut en bas :

1. **En-tête** — titre + accroche + preuve de volume immédiate
   (ex. « Plus de 30 automatisations et applications livrées » — **chiffre à valider**)
2. **Bandeau de chiffres clés** — 3 ou 4 indicateurs consolidés, tous validés
3. **Filtres** — par type d'usage, formulés dans les mots du client, jamais en jargon :
   *Automatiser une tâche répétitive · Répondre aux clients 24 h/24 · Créer du contenu ·
   Exploiter mes données · Se mettre en conformité*
   → les filtres doivent aussi fonctionner sans JavaScript (liens `?filtre=` ou pages
   dédiées), et mettre à jour l'URL pour être partageables
4. **Grille de cartes projet** — voir §5.2
5. **Bloc de réassurance** — méthode de travail en 3 étapes (audit → prototype → mise en production),
   engagements (RGPD, hébergement européen, code livré au client) si exacts
6. **CTA final** — vers l'audit IA gratuit existant

### 5.2 Carte projet (index)

Chaque carte contient, dans cet ordre visuel :

- Une **capture d'écran** (ratio 16:10, coins arrondis cohérents avec le design system)
- Un **badge secteur/type** (couleur issue de la palette, jamais une couleur inventée)
- Le **titre du projet**
- Une **phrase de résultat** de 12 mots maximum, orientée bénéfice
  (« Facturation mensuelle : de 6 heures à 5 minutes »)
- 2 ou 3 **puces de technologies**, discrètes (taille réduite, couleur secondaire)
- Un lien « Voir le détail » (la carte entière est cliquable, mais un lien visible reste présent)

**Règle** : une carte doit rester lisible et convaincante même si la capture ne charge pas.

### 5.3 Page détail `/realisations/[slug]`

Structure imposée :

1. **En-tête** — titre, secteur, année, durée du projet, statut (en production / prototype)
2. **Le contexte** — 2 ou 3 phrases : la situation du client *avant*, écrite du point de vue du
   dirigeant, pas de l'ingénieur
3. **Le problème** — ce qui coûtait du temps, de l'argent ou des opportunités
4. **La solution** — ce qui a été construit, expliqué sans jargon ; une capture par idée clé
5. **Les résultats** — 3 indicateurs maximum, en gros caractères, chacun sourcé ou marqué à valider
6. **Comment ça marche** — section **repliable** : schéma d'architecture, stack, choix techniques.
   Repliée par défaut : le dirigeant ne la voit pas, le technicien la trouve.
7. **Galerie** — captures annotées, avec légendes qui expliquent *ce qu'on regarde et pourquoi
   c'est important*
8. **Ce que ça peut donner chez vous** — 2 ou 3 phrases de transposition à d'autres secteurs.
   **C'est la section la plus importante commercialement** : c'est là que le prospect se projette.
9. **CTA** — audit gratuit, avec le nom du projet pré-rempli dans le formulaire si possible
10. **Navigation** — projet précédent / suivant, retour à l'index

### 5.4 Modèle de données

Un fichier par projet, dans le format de contenu déjà utilisé par le site (à déterminer en
Phase 0). Schéma minimal — adapte les noms de champs aux conventions du dépôt :

```yaml
slug: facturation-automatisee
titre: "Facturation mensuelle automatisée"
resume: "De 6 heures de saisie manuelle à 5 minutes de vérification"
secteur: "Médias"                      # jamais le nom du client
clientAffiche: "Un groupe radio francophone"
clientReel: "…"                        # champ privé, jamais rendu dans le HTML
autorisationNom: false                 # true = le nom réel peut être affiché
categories: [automatisation, gain-de-temps]
annee: 2025
statut: production                     # production | prototype | interne
duree: "3 semaines"
technologies: [n8n, "Google Calendar API", "Google Sheets API", SMTP]
resultats:
  - valeur: "[À VALIDER : 6 h → 5 min]"
    libelle: "Temps de facturation mensuel"
  - valeur: "[À VALIDER : 0]"
    libelle: "Erreur de tarification depuis la mise en production"
imageCouverture: "/images/realisations/facturation/couverture.webp"
captures:
  - src: "…"
    alt: "…"
    legende: "…"
publie: false                          # passe à true seulement après validation de Laurent
```

**Règle absolue** : `clientReel` ne doit apparaître ni dans le HTML rendu, ni dans le JSON
exposé au navigateur, ni dans les métadonnées d'image. Vérifie-le dans le build final.

---

## 6. Les 12 réalisations à publier

Ordre de la grille = ordre ci-dessous (du plus vendeur au plus spécialisé).
Les descriptions sont un point de départ : **enrichis-les depuis les sources réelles**,
ne les recopie pas telles quelles.

### 1. Chatbot embarquable multi-clients — *pièce maîtresse*
Widget de chat React embarquable (`embed.html`) branché sur un webhook n8n, avec captation
progressive de leads (email, prénom, téléphone, localité), gestion de session et guide intégré.
**Déjà déployé chez plusieurs clients** : un lieu événementiel culturel, une brasserie,
une administration communale, une activité de services.
→ **Angle** : offre standardisée, déployable en quelques jours, qui transforme le trafic du
site client en contacts qualifiés. C'est la démonstration qu'AInspiration ne bricole pas au
cas par cas mais industrialise.
→ **Visuels** : le widget en situation sur trois sites différents (montage côte à côte),
une conversation type, le workflow n8n qui reçoit les leads.

### 2. Audityo — conformité EU AI Act
SaaS de mise en conformité au règlement européen sur l'IA, destiné aux PME, avant l'échéance
d'août 2026. Next.js, Supabase, Clerk, Stripe, isolation multi-tenant.
→ **Angle** : maîtrise d'un sujet réglementaire complexe, transformé en produit utilisable.
Rassure sur la conformité et le sérieux juridique.
→ **Attention** : ne présente pas Audityo comme une réalisation *cliente*, c'est un produit
du groupe. Le formuler ainsi (« nos produits »).

### 3. Facturation automatisée — *le cas ROI*
Google Calendar → calcul automatique des tarifs (week-end / semaine, prestations multi-jours,
déplacements, frais administratifs) → écriture Google Sheets → facture HTML envoyée par email.
Source : `FacturationAnim/…/workflows/facturation-radio-mensuel.json`.
→ **Angle** : le cas le plus transposable à n'importe quelle PME qui facture à la prestation.
C'est celui qui doit convertir.
→ **Anonymisation obligatoire** : « un groupe radio francophone », jamais le nom de l'antenne.

### 4. DreamOracle.eu — produit grand public complet
Plateforme B2C d'interprétation de rêves : Next.js, Supabase/Prisma, PWA, journal de rêves,
identité visuelle complète (suite de logos SVG dark/light/icône/compact), générateur de
storyboards en Python, campagne Meta Ads.
→ **Angle** : capacité à mener un produit de bout en bout — conception, design, développement,
acquisition. Le plus fort visuellement (nuit `#0a0a1a`, violet mystique `#8b5cf6`, or `#d4af37`).

### 5. Le Labo Nostalgie — playlists personnalisées pour auditeurs
> ⚠️ **Ne pas confondre avec le projet n° 6.** Ce sont deux réalisations distinctes,
> avec des workflows, des finalités et des livrables différents. Vérifie-le par toi-même
> avant de rédiger : si tu les fusionnes, la fiche perd tout son intérêt.

Système de génération de playlists personnalisées pour les **auditeurs d'une radio nationale
francophone**, à partir de leurs réponses à un formulaire.
- Workflow n8n `8N7Vb3R8mrBK6DLl` (« Génération Playlist — CLASSIQUE, lundi-vendredi »),
  décliné en variante saisonnière `Mrvg6cCeYZEcpv1y` (« ÉTÉ, samedi »)
- Chaîne : formulaire web → chargement du catalogue musical (Google Sheets) → chargement de la
  liste noire des titres diffusés sur 21 jours → fusion → préparation du prompt → Claude via
  OpenRouter → validation des contraintes → génération d'un **email HTML personnalisé** envoyé
  à l'auditeur, avec justification de chaque choix (v2.1)
- Contraintes métier encodées et vérifiées : répartition par catégorie 40 / 40 / 20,
  répartition par décennie, 30 % de titres francophones, 25 artistes uniques minimum,
  exclusion des titres déjà passés
- Workflow annexe d'audit de langue du catalogue (`RYWMDjWiSoK8C72O`)
- **Pack RGPD complet livré** : politique de confidentialité, registre des traitements,
  formulaire de consentement, attestation de conformité
- Formulaire d'entrée : dépôt `laurent7850/playlist-generator`, déployé séparément

→ **Angle** : l'IA sous contrainte métier, du formulaire jusqu'à l'email reçu par l'auditeur.
Démontre qu'on n'appelle pas simplement un modèle : on encode des règles professionnelles,
on les **valide**, et on livre la conformité RGPD avec.
→ **Anonymisation obligatoire** : aucune mention du nom de la radio.
→ **Visuel** : l'email HTML reçu (avec données de démonstration) est le meilleur visuel de
cette fiche — c'est le livrable que l'auditeur voit réellement.

### 6. Générateur de playlists Spotify — création automatique dans Spotify
> ⚠️ **Projet distinct du n° 5.** Autre workflow, autre finalité, autre livrable.

Génération de playlists thématiques **directement créées dans Spotify** à partir d'une simple
demande en langage naturel.
- Workflow n8n `lwTH2RIV2QmyTlLX` (« Générateur playlist Spotify : API webhook → Claude → Spotify »)
- Chaîne : webhook API → Claude via OpenRouter pour proposer les titres → API Spotify pour
  rechercher chaque morceau et créer la playlist dans le compte de l'utilisateur
- Front React/Vite au thème « night radio studio », déployé via Hostinger Horizons
- Enseignement technique documenté : le passage à des requêtes de recherche Spotify en texte
  libre a nettement amélioré le taux de correspondance des titres

→ **Angle** : de l'intention exprimée en une phrase au résultat utilisable en trois secondes,
dans un outil que tout le monde connaît. C'est la démonstration la plus immédiatement
compréhensible de toute la vitrine — même un dirigeant réfractaire à l'IA comprend
instantanément ce qui vient de se passer.
→ **Visuel** : avant / après — la demande saisie dans le front, puis la playlist réellement
créée dans l'interface Spotify. Cette paire d'images vaut tous les discours.
→ **Idée à proposer à Laurent** : c'est le seul projet de la liste qui pourrait devenir une
**démo interactive publique** sur le site. À arbitrer (coût d'API, abus possibles), mais à
signaler dans ton rapport.

### 7. Chatbot RAG « Histoire d'Enghien »
Chat RAG sur un livre de 1876 numérisé (Ernest Matthieu, 794 pages, 262 000 mots) :
Next.js 15, Supabase + pgvector, embeddings OpenAI, Claude en génération, découpage
intelligent respectant la hiérarchie 4 livres / 18 chapitres / 46 sections, déployé sur VPS.
→ **Angle** : interroger en langage naturel un fonds documentaire propriétaire — exactement ce
que veulent les PME pour leurs procédures, contrats et bases de connaissances internes.
Le patrimoine local rend la démonstration mémorable et sympathique.

### 8. L'Artpéro — plateforme de club privé
Site et application complets : React 18 + TypeScript + Vite, shadcn/ui, Supabase, Stripe,
gestion d'un club privé, d'événements et d'abonnements, design noir & blanc minimaliste.
→ **Angle** : livraison d'un site client abouti, pas seulement de l'automatisation.
Prouve la polyvalence design.

### 9. Paperclip — entreprise virtuelle IA — *le différenciateur*
Instance auto-hébergée sur VPS orchestrant une hiérarchie de **13 agents IA** occupant des
rôles d'entreprise (CEO, CTO, CPO, CMO, CFO, CLO + 7 spécialistes), avec descriptions de
postes et backlog initial de 18 tâches.
→ **Angle** : la vision. Personne d'autre sur ce marché ne montre ça.
À placer en fin de grille comme « ce vers quoi on va », pas comme une offre au catalogue.
→ **Prudence** : ne rien promettre de commercialisable ici. Section clairement identifiée
comme R&D interne.

### 10. Baseline sécurité & RGPD
Référentiel de sécurité en 13 sections : gestion des secrets, durcissement VPS, sécurisation
n8n, RGPD, sécurité spécifique aux LLM (injection de prompt, isolation multi-tenant),
règles de conduite pour les agents.
→ **Angle** : la principale objection d'un dirigeant de PME face à l'IA, c'est la sécurité et
les données. Ce n'est pas une « réalisation » sexy, c'est un **argument de confiance** —
présente-la comme telle, éventuellement dans un encart transversal plutôt qu'en carte projet
standard si le rendu est meilleur ainsi.

### 11. Préparation d'émission automatisée
Workflow n8n : planning Google Sheets → génération de récapitulatifs d'événements historiques
pour les deux jours du week-end → envoi par email, déclenché chaque samedi 9 h.
Source : `120 Min/…/120-min-2026-workflow.json`.
→ **Anonymisation obligatoire** : aucune mention du nom de l'émission ni de la radio.
Formuler « une émission hebdomadaire d'une radio nationale francophone ».
→ **Angle** : la préparation éditoriale récurrente, transposable à toute newsletter ou
revue de presse d'entreprise.

### 12. Veille automatisée YouTube → transcriptions
Workflow n8n : playlist YouTube → extraction des transcriptions (API gratuite, repli sur
ElevenLabs STT si absence de sous-titres) → nettoyage et normalisation → Google Sheets.
→ **Angle** : veille concurrentielle et comptes rendus automatiques. Cas d'usage immédiatement
compréhensible par un dirigeant.

### Hors périmètre
Le *Torchlight Infinite Build Planner* et les automatisations Plex/Synology sont
**exclus** : hors cible B2B.

---

## 7. Règles éditoriales

### 7.1 Interdits absolus

- ❌ **Inventer un chiffre.** Tout chiffre non vérifiable dans le code, un workflow ou une
  source explicite s'écrit `[À VALIDER : hypothèse]` et se retrouve dans la liste de §11.
- ❌ **Nommer un client** sans `autorisationNom: true`.
- ❌ **Publier une capture** contenant une donnée réelle : nom, email, téléphone, adresse,
  montant, clé d'API, identifiant de workflow, URL de webhook, IP de serveur.
- ❌ **Le jargon en première lecture** : « pipeline RAG », « vectorisation », « multi-tenant »,
  « orchestration », « embeddings » n'apparaissent que dans la section technique repliable.
- ❌ **Le superlatif creux** : « révolutionnaire », « cutting-edge », « solution innovante ».

### 7.2 Attendus

- **Voix** : celle du site actuel — directe, orientée résultat, chiffrée, tutoiement exclu,
  vouvoiement professionnel. Vérifie sur les pages existantes et aligne-toi.
- **Langue** : français de Belgique. Pas d'anglicismes évitables (« mise en production » plutôt
  que « déploiement en prod », « tableau de bord » plutôt que « dashboard »).
- **Chaque titre de section** doit être compréhensible hors contexte.
- **Une idée par paragraphe**, 3 phrases maximum.
- **Test systématique** : « un patron de PME de 30 personnes comprend-il cette phrase sans
  la relire ? » Si non, réécris.

### 7.3 Anonymisation — table de correspondance

| Réel | À afficher |
|---|---|
| Nostalgie / Radio Nostalgie Belgique / NRJ / nom d'antenne | « une radio nationale francophone » |
| Nom de l'émission | « une émission hebdomadaire » |
| « DJ Lyric », « Labo Nosta », « DJLyricsNosta » et autres noms de code internes | à ne jamais afficher tels quels — reformuler côté bénéfice |
| Brasserie de la Patinoire | « une brasserie » |
| L'Artpéro | à confirmer avec Laurent — probablement autorisé |
| Ville d'Enghien | « une administration communale belge » (à confirmer) |
| Prénoms de clients playlists | supprimés |
| Client restaurateur | « un restaurateur bruxellois » |

---

## 8. Protocole de captures d'écran

C'est le cœur visuel de la mission. Une capture ratée détruit plus de crédibilité qu'elle
n'en construit.

### 8.1 Outillage
- Playwright (Chromium) en script reproductible, versionné dans `scripts/captures/`
- Le script doit être **rejouable** : quand une app évolue, on régénère sans refaire à la main
- Un fichier de configuration listant, par projet, l'URL, les étapes et les zones à capturer

### 8.2 Spécifications techniques

| Paramètre | Valeur |
|---|---|
| Viewport bureau | 1440 × 900, `deviceScaleFactor: 2` |
| Viewport mobile | 390 × 844, `deviceScaleFactor: 3` |
| Format de sortie | WebP (qualité 85) + repli JPEG |
| Largeurs générées | 480 / 960 / 1440 px, servies en `srcset` |
| Poids maximum | 200 Ko par image après optimisation |
| Nommage | `/public/images/realisations/<slug>/<numero>-<description>.webp` |
| Chargement | `loading="lazy"` sauf l'image de couverture au-dessus de la ligne de flottaison |
| Dimensions | `width` et `height` toujours renseignés (zéro décalage de mise en page) |

### 8.3 Règles de composition

1. **Zéro donnée réelle.** Avant capture, remplace systématiquement par des données de
   démonstration cohérentes (« Société Martin SPRL », « contact@exemple.be », montants ronds).
2. **Ne capture jamais une page vide ou en cours de chargement.** Attends l'état stable,
   contenu peuplé.
3. **Cadre sur ce qui raconte quelque chose.** Une capture de formulaire vide ne prouve rien ;
   une capture de facture générée, si.
4. **Masque les barres de navigateur** — capture le contenu, pas le chrome du navigateur.
   Si un cadre de navigateur stylisé est ajouté, il l'est en CSS, uniformément.
5. **Annotations** : uniquement si elles apportent quelque chose. Style unique — flèche et
   pastille numérotée dans la couleur d'accent du site, jamais de rouge criard. Les annotations
   sont en HTML/CSS par-dessus l'image, **pas incrustées dans le fichier** (accessibilité,
   traduction, retouche).
6. **Workflows n8n** : capture le graphe complet, zoom ajusté pour que les noms de nœuds soient
   lisibles à la taille d'affichage réelle. **Masque les URLs de webhook, identifiants et
   noms d'hôtes.** Un workflow n8n bien cadré est extrêmement parlant — c'est probablement
   le visuel le plus convaincant de toute la vitrine.
7. **Cohérence de série** : même luminosité, même zoom, mêmes marges d'une capture à l'autre.
   Un jeu de captures hétérogène fait amateur.
8. **Mode sombre** : si l'app en dispose, choisis le mode qui s'accorde au fond de la fiche.

### 8.4 Cas particuliers
- Applications non déployées / locales : lance-les en local si possible, sinon signale-le et
  demande à Laurent (§12).
- Interfaces contenant des données clients : capture en environnement de démonstration
  uniquement. **Dans le doute, ne capture pas — demande.**
- Chaque capture livrée doit avoir un texte alternatif qui décrit *le contenu*, pas
  « capture d'écran de l'application ».

---

## 9. Exigences techniques

### 9.1 Design
- **Aucune nouvelle valeur de couleur, d'espacement ou de typographie.** Tu consommes les
  jetons existants. Si un besoin réel n'est pas couvert, tu le signales et tu attends un arbitrage.
- Réutilise les composants existants (boutons, cartes, sections). N'en crée un nouveau que si
  aucun ne convient, et documente pourquoi.
- Responsive : 320 px minimum jusqu'au grand écran, sans débordement horizontal.
- Grille : 1 colonne sur mobile, 2 sur tablette, 3 sur bureau (à ajuster selon la grille du site).
- Animations : sobres, cohérentes avec l'existant, désactivées sous `prefers-reduced-motion`.

### 9.2 Accessibilité (non négociable)
- Contraste WCAG AA minimum sur tout texte, y compris sur les badges et légendes
- Navigation complète au clavier, focus visible sur tous les éléments interactifs
- Hiérarchie de titres correcte (un seul `h1` par page, pas de saut de niveau)
- Textes alternatifs descriptifs sur toutes les images
- Filtres accessibles au lecteur d'écran (rôle, état, annonce du nombre de résultats)

### 9.3 SEO
- Métadonnées uniques par page (titre ≤ 60 caractères, description ≤ 155)
- Open Graph et Twitter Card par fiche projet, avec l'image de couverture
- JSON-LD `CreativeWork` (ou `Article` selon le mécanisme du blog) par fiche
- Fil d'Ariane avec balisage `BreadcrumbList`
- Ajout des nouvelles URLs au sitemap
- URLs stables et lisibles : `/realisations/facturation-automatisee`
- Maillage interne : depuis les pages Solutions IA et Automatisation vers les fiches pertinentes,
  et retour depuis les fiches vers les pages d'offre

### 9.4 Performance
- Score Lighthouse ≥ celui d'une page existante comparable, sur mobile
- CLS à 0 (dimensions d'images toujours déclarées)
- Aucune nouvelle dépendance lourde sans justification écrite
- Images optimisées et servies en `srcset`

### 9.5 Conversion
- Un CTA vers l'audit gratuit **toujours accessible** : en fin d'index, en fin de fiche, et
  idéalement en barre collante discrète sur mobile
- Si le formulaire d'audit le permet, pré-remplir un champ caché avec le projet d'origine,
  pour savoir quelle réalisation convertit
- Événements analytics (si un outil est en place) : vue de fiche, ouverture de la section
  technique, clic CTA, filtre utilisé

---

## 10. Méthode de travail

1. **Phase 0** — audit (§4), rapport livré, **stop et validation**
2. **Phase 1** — proposition d'architecture et maquette d'une fiche unique
   (celle de la facturation automatisée), en HTML statique dans le style du site.
   **Stop et validation.**
3. **Phase 2** — mise en place du modèle de données et des gabarits de page
4. **Phase 3** — rédaction des 12 fiches, marqueurs `[À VALIDER]` inclus
5. **Phase 4** — script de captures, génération, optimisation, intégration
6. **Phase 5** — SEO, accessibilité, performance, recette
7. **Phase 6** — livraison : liste des chiffres à valider, liste des autorisations clients à
   obtenir, note de mise en ligne

**Règles de conduite :**
- Une branche dédiée (`feat/realisations`), commits atomiques en français, messages explicites
- Rien n'est publié : `publie: false` par défaut sur toutes les fiches jusqu'à validation
- Tu ne modifies aucune page existante sans le dire explicitement au préalable
- Si tu bloques ou hésites entre deux partis pris, **tu demandes** — tu ne choisis pas en silence
- Tu ne « nettoies » pas de code existant au passage

---

## 11. Livrables

- [ ] `docs/audit-realisations.md` — rapport de Phase 0
- [ ] Page `/realisations` fonctionnelle, filtrable, responsive
- [ ] 12 fiches `/realisations/[slug]` complètes
- [ ] Jeu de captures optimisées + `scripts/captures/` rejouable
- [ ] `docs/a-valider.md` — **tous** les marqueurs `[À VALIDER]` regroupés, avec pour chacun :
      la fiche concernée, l'affirmation, la source manquante, l'hypothèse proposée
- [ ] `docs/autorisations-clients.md` — liste des clients dont l'accord écrit est nécessaire
      pour lever l'anonymat, avec un modèle d'email de demande prêt à envoyer
- [ ] Rapport de recette : Lighthouse avant/après, contrôle d'accessibilité, contrôle
      d'absence de données réelles dans le build final

---

## 12. Questions à poser à Laurent avant de coder

Pose-les **toutes en une fois**, en fin de Phase 0 :

1. Où se trouve exactement le dépôt du site (chemin local, dépôt distant) ? Y a-t-il un accès Git ?
2. Quelles URLs de production sont capturables aujourd'hui, et lesquelles nécessitent un
   compte de démonstration (identifiants à fournir) ?
3. Audityo est-il publiquement visible, ou faut-il un environnement de démonstration ?
4. L'instance n8n est-elle accessible pour capturer les graphes de workflows ?
5. Le nom « L'Artpéro » peut-il être affiché, ou faut-il l'anonymiser aussi ?
6. La Ville d'Enghien a-t-elle donné son accord pour être citée ?
7. Pour chaque projet : durée réelle, année de livraison, et le gain concret constaté
   (même approximatif, il vaut mieux une fourchette validée qu'un chiffre inventé)
8. Y a-t-il des témoignages clients exploitables, même courts ?
9. Faut-il prévoir les versions néerlandaise et anglaise dès maintenant, ou français seul ?
10. Un budget de temps ou une date de mise en ligne cible ?

---

## 13. Ce qui fait échouer cette mission

Pour être explicite sur les pièges :

- Une page magnifique mais qui ne dit pas ce que le client y gagne
- Des chiffres inventés qui ne survivent pas à la première question d'un prospect
- Des captures d'écran floues, vides, ou pleines de données réelles
- Du jargon technique en première lecture
- Un design qui s'écarte du reste du site et donne l'impression d'un site rapiécé
- Un nom de client publié sans autorisation
- Confondre les projets n° 5 et n° 6 (les deux systèmes de playlists) : ce sont deux
  réalisations distinctes, et les présenter comme une seule fait perdre une preuve entière
- Douze fiches interchangeables : chaque projet doit avoir **son** angle et **sa** raison d'être
  dans la vitrine

---

*Document préparé pour Laurent — Distr'Action SRL — septembre 2026*
