# Contexte courant

> Ce fichier est la photographie du projet à l'instant T. Il se met à jour quand un
> chiffre change, pas à chaque session. Une donnée introuvable se note `— à compléter`,
> elle ne s'invente pas.

**Dernière mise à jour** : 2026-09-22 · amorcé à partir de `CLAUDE.md`, `PRODUCT.md`,
`README.md`, `HANDOFF.md`, `package.json`, `docker-compose.yml`, `database.sql`,
`n8n-workflows/`, `public/locales/fr/pricing.json` et `public/locales/fr/legal.json`.

## Identité
- Société : Distr'Action SRL (entité belge). Siège : Chaussée Brunehault 27, 7041 Givry.
- Produit / site : `ainspiration.eu` — site vitrine trilingue (FR par défaut, EN, NL)
  **et** CRM interne derrière login. Le CRM sert **tout le portefeuille** du groupe,
  pas seulement AInspiration (prospects distingués par le champ `source`).
- Mission en une phrase : division conseil et formation IA du groupe, et tremplin
  commercial — accompagner les PME francophones (Belgique, France) sur l'IA appliquée.

## Décisions structurantes

Cinq décisions cadrent tout le reste de ce fichier. Leur raisonnement — et surtout ce qui
a été écarté, par qui et sur quel argument — vit dans `ops/decisions/`, pas ici.

| | Décision | Date |
|---|---|---|
| [ADR-001](decisions/ADR-001-aucune-preuve-fabriquee.md) | Aucune preuve fabriquée | 29/08/2026 |
| [ADR-002](decisions/ADR-002-grille-o1-o5.md) | La grille O1–O5 est la seule stratégie commerciale | 13 et 16/09/2026 |
| [ADR-003](decisions/ADR-003-blog-trilingue-fenetre-novembre.md) | Blog trilingue, fenêtre de décision datée | 16/09/2026 |
| [ADR-004](decisions/ADR-004-crm-pas-un-produit.md) | Le CRM n'est pas un produit en vente | 18/09/2026 |
| [ADR-005](decisions/ADR-005-aucun-sla-par-defaut.md) | Aucun engagement de niveau de service par défaut | 18 et 22/09/2026 |

## Offres et prix

> Source unique : la grille **O1–O5** ([ADR-002](decisions/ADR-002-grille-o1-o5.md)), portée par
> `public/locales/fr/pricing.json`. Prix **hors TVA**.
> Les offres antérieures (audit gratuit comme produit d'appel, Pack Express 1 490 €,
> grille CRM 29/49 € par utilisateur et par mois) sont **abandonnées** depuis les
> décisions des 16 et 18/09/2026.

| Offre | Prix | Statut |
|---|---|---|
| Rendez-vous de découverte (30 min) | Offert | Actif — seul temps offert |
| O1 — Diagnostic IA (2 jours) | 2 400 € | Actif |
| O2 — Atelier (demi-journée / journée) | 900 € / 1 500 € | Actif |
| O3 — Sprint automatisation (1 workflow en production) | 3 500 – 6 000 € | Actif |
| O4 — Pilote IA (accompagnement continu) | 590 €/mois, engagement 6 mois | Actif |
| O5 — Check AI Act | 990 € | Actif |
| Tarif fondateur | −20 % pour les 3 premiers clients, contre témoignage | Actif |

**Aucun engagement de niveau de service par défaut** (décision du 18/09/2026) : délais,
support et disponibilité se fixent au devis, prestation par prestation. Le document
SLA v1.0 est archivé sans successeur (22/09/2026).

## Objectifs de la période

| Objectif | Cible | Où on en est |
|---|---|---|
| Chiffre d'affaires récurrent (décision 13/09) | 3 000 €/mois | **0 €** — aucun client réel à ce jour |
| Premiers clients | — à compléter (nombre et échéance non fixés) | 0 |
| Blog — fenêtre de décision fin novembre 2026 | 500 impressions et 15 clics sur 28 jours | 41 impressions, 1 clic, 18 mots-clés positionnés, position moyenne 41 (relevé GSC du 16/09) |
| Remplir le CRM en prospects réels | — à compléter | 1 fiche, et c'est la sonde de surveillance |
| Newsletter | Abandonnée comme canal | 0 abonné actif, 0 envoi en 9 mois |

## Économie

> Les offres O1–O5 se vendent en jours de Laurent : le **coût de revient est du temps**,
> et il n'est chiffré nulle part. C'est le trou principal de cette section.

- Coût de revient unitaire : — à compléter (taux journalier de référence non fixé)
- Marge par offre : — à compléter (découle du point précédent)
- Seuil d'alerte : — à compléter
- **OpenRouter** — compte *Distr'action SRL*, mutualisé avec tout le portefeuille :
  **17 clés**, solde **prépayé** d'environ 17 $, rechargé par tranches de 20 $.
  Les alertes de budget en pourcentage sont réservées à l'offre Enterprise ; ici les
  seuls garde-fous sont l'alerte de solde bas (seuil relevé à **10 $** le 17/09, vers
  `divers@distr-action.com`) et les **plafonds par clé**. Plafonds posés le 17/09 :
  `Maudios` (auto-blogs n8n) **3 $/jour**, `Paperclip` **6 $/jour**, **les 15 autres
  n'en ont aucun**. Pourquoi : l'auto-blog Distr'Action a brûlé **~46 $ en trois jours**
  (11–13/09) sans qu'aucun signal ne parte, découvert six jours plus tard.
  ⚠️ Un plafond dont « Reset limit » reste sur `N/A` est un plafond **à vie** — posé sur
  une clé déjà consommée, il la tue sur-le-champ.
- **Paperclip arrêté le 17/09** : il tournait à vide depuis des mois pour ~21 $/mois.
- Infrastructure : VPS Hostinger `srv767464` (montant — à compléter), Netlify (CDN du
  frontend, — à compléter), Hostinger Mail (— à compléter).

## Technique
- **Front** : React 19.3 + React Router 7, TypeScript, Vite 8, Tailwind 4, i18next 26 /
  react-i18next 17, lucide-react 1.x, TanStack Query 5. Tests Vitest 5 + Testing Library.
  Node ≥ 22 exigé côté front.
- **Back** : Express 5 + PostgreSQL 16, dans `docker/backend/` (conteneur node:20-alpine),
  auth JWT. Backend découpé en modules depuis le 05/09/2026 ; le conteneur télécharge la
  liste `docker/backend/files.txt` au démarrage — **un fichier backend absent de cette
  liste fait échouer le boot**.
- **Hébergement** : VPS Hostinger `srv767464.hstgr.cloud` (193.203.191.251), Docker
  Compose derrière Traefik (TLS Let's Encrypt). Conteneur `ainspiration-web`
  (`node:20-alpine`) : c'est **Express** qui sert le frontend, et c'est lui qui porte le
  rendu SEO côté serveur. Le frontend n'est pas dans l'image — il est **téléchargé depuis
  Netlify au démarrage du conteneur**, d'après `docker/dist-manifest.txt` (**209 entrées**
  au 22/09/2026). 43 conteneurs sur la machine, tous projets confondus.
  ⚠️ Le compose qui fait foi est `/docker/ainspiration/docker-compose.yml` **sur le VPS**.
  Ceux du dépôt ne sont que des références et **divergent** : celui de la racine décrit un
  frontend `nginx` qui ne tourne nulle part.
- **Règle de déploiement** — la règle de la maison, non négociable :
  1. `npm run build` — régénère `docker/dist-manifest.txt` par le hook `postbuild`.
     Ne jamais l'éditer à la main. Ne jamais déployer sur un arbre de travail sale :
     `scripts/check-public-matches-head.mjs` fait échouer le build de production.
  2. Commit **et push du manifeste d'abord**, CI verte exigée.
  3. `npx netlify deploy --prod --dir=dist`, puis **vérifier une à une** les 209 entrées
     du manifeste sur le CDN. Compter aussi les `<loc>` du sitemap servi : un build qui
     n'a pas joint l'API produit un sitemap amputé **sans qu'aucune étape n'échoue**.
  4. `docker compose up -d --force-recreate web` — **jamais `docker restart`** : le
     conteneur retélécharge son frontend au boot, et un CDN incomplet lui fait alors
     servir des chunks manquants (incident du 08/06/2026, site entier hors service).
- **Base de données** : 13+ tables dans `docker/init.sql` (`users`, `companies`,
  `contacts`, `opportunities`, `products`, `tasks`, `activities`, `contact_messages`,
  `newsletter_subscribers`, `blog_posts`, `publications`…) et migrations `migration-001`
  à `migration-007`. ⚠️ `database.sql` à la racine n'est **pas** le schéma de production
  (13 lignes, table `users` seule) — vestige ; le schéma réel est `docker/init.sql`.
  Cloisonnement par propriétaire : chaque compte ne voit que ses propres lignes
  (`ownerScope()`, depuis le 16/09) ; le compte démo est public et ne doit **jamais**
  être admin.
- **Automatisations n8n** : instance `https://n8n.srv767464.hstgr.cloud`, version
  **2.40.5** (montée le 22/09 — ⚠️ l'image n'est pas épinglée, elle suit `latest`),
  **32 workflows actifs**, **22 webhooks**. Principaux : auto-blog trilingue (parution
  le jeudi), ingestion des prospects des 4 formulaires, surveillance quotidienne des
  parcours métier (6h15), alerte VPS générique, rapport SEO mensuel, relais du
  formulaire Audityo. Authentification machine par secrets dédiés — `INGEST_SECRET`,
  `SERVICE_SECRET`, `TASK_SECRET` — **jamais par JWT** (incident du 15/09 : 18 jours de
  blog muet). Une variable de secret absente **ferme** la porte, elle ne l'ouvre pas.
  ⚠️ `n8n-workflows/` du dépôt ne contient que des exports **anciens** (Supabase,
  Claude 3 Haiku, Pack Express à 1 490 €) qui ne décrivent plus l'instance en production.
- **Chaîne éditoriale** : deux producteurs pour un seul blog — l'auto-blog n8n
  (`t8SuGsq3sOPuDfdV`, décision quotidienne à 7h30, une parution par semaine, une semaine
  sur deux en retour d'expérience sur une réalisation réelle) et AutoSEO/SEOPilot via
  `AInspiration — Publish from AutoSEO`. Un **contrôle qualité** renvoie en `draft` tout
  article sous 700 mots, citant une source nominative, formulant une preuve fabriquée ou
  manquant de liens internes ; la relecture se fait dans `/blog-admin`. Une table
  `publications` partagée par les 5 bases de sites rend un **409** si le sujet est déjà
  couvert — garde posée sur le chemin d'écriture, jamais chez l'appelant.
  ⚠️ **Le pool de sujets s'épuise vers février 2027** : le 409 bloquera alors la
  republication sans remplir le pool, et ces semaines-là ne publieront rien.
- **Sauvegardes** : `/opt/db-backup/backup.py` (cron 05:00) découvre seul les conteneurs
  postgres, `pg_dump` gzippé, rétention 7 quotidiens / 4 hebdomadaires / 6 mensuels,
  synchronisation vers un **rclone crypt hors-site**, alerte e-mail en cas d'échec et
  **test de restauration mensuel**. n8n n'était pas couvert (SQLite sur bind-mount) :
  comblé le 14/09 par `n8n-backup.sh` (dimanche 04:45), dont l'archive embarque le
  `config` qui porte **la clé de chiffrement des credentials** — sans elle, une base
  restaurée est inexploitable.
- **Surveillance — quatre dispositifs distincts, à ne pas confondre** :

  | Quoi | Où | Rythme |
  |---|---|---|
  | Qualité du **site** (HTML brut sans JS, sitemap, hreflang, TLS, Lighthouse) | GitHub Actions | lundi 06:00 UTC |
  | **Parcours métier** (écriture et relecture d'une fiche sonde, secrets, fraîcheur, liens) | n8n `ydW4SMHaeQQ58O4v` | tous les jours 6h15 |
  | **Disponibilité** des 17 domaines de Traefik | `/opt/uptime-check.sh` | toutes les 5 min |
  | Santé de la **machine** (steal, CPU, disque, mémoire, conteneurs) | `/opt/vps-watchdog.sh` | toutes les 15 min |

  Canal d'alerte unique : le webhook n8n `vps-alert` **par Traefik** — jamais
  `localhost:5678`, n8n ne publie aucun port. Fenêtre de silence de 6 h par condition et
  hystérésis sur les deux bords. **Signe de vie le lundi 7h : son absence est l'alerte.**
  Copies de référence des scripts dans `docs/ops/vps/` — **le VPS fait foi**, la copie
  du dépôt dérive.
- **Analytics** : GA4 propriété `527616733`, flux `G-FMCN24CNYW`. Le tag ne se charge
  qu'après consentement aux cookies analytiques, et les `page_view` sont envoyés à la
  main à chaque changement de route. ⚠️ **Les chiffres GA4 sont à prendre avec réserve
  tant que la Mesure améliorée n'est pas corrigée** : « Modifications de page basées sur
  les événements de l'historique » compte **deux** vues par navigation SPA depuis le
  13/08. Le trafic local était en outre envoyé en production jusqu'à cette date.
- **Principe transverse** : les pannes de ce système sont **silencieuses**. Un 200 ne
  prouve rien. On vérifie le parcours, jamais le code de retour.

## Conformité
- Pages publiées, dans les trois langues : `/privacy` (politique de confidentialité),
  `/mentions-legales`, `/cgv`, `/cgu`.
- **DPA v1.0** (avril 2026) toujours en vigueur et référencé par les CGV §12
  (« disponible sur demande à info@ainspiration.eu ») — **jamais relu depuis avril**.
  Il vit dans le dépôt Paperclip, il ne se touche pas depuis ici.
  **SLA v1.0** archivé sans successeur (22/09), et la section 11 des CGV ne porte plus
  aucun chiffre.
- Rétention : **12 mois** à compter du dernier échange pour les données de contact, sauf
  demande de suppression (politique de confidentialité). Rétention des autres traitements
  (CRM, journaux d'accès, exécutions n8n) : — à compléter.
- Registre des traitements (art. 30 RGPD) : — à compléter (exigé par la baseline).
- Échéances réglementaires : l'**EU AI Act** est l'objet commercial de l'offre O5.
  Les dates d'application opposables à nos clients : — à compléter.
- Hébergement EU (VPS Hostinger EU, Netlify). CSP stricte, aucun asset externe, polices
  auto-hébergées.
- **Aucune preuve fabriquée** (décision du 28/08/2026), contrainte absolue. Aucun client
  réel à ce jour : pas de faux témoignage, de faux avis schema.org, de statistique
  agrégée inventée ni de faux logo. Sont autorisés les scénarios explicitement étiquetés
  « illustratifs », les objectifs présentés comme des cibles, et les faits de service
  vérifiables. Clients anonymisés par défaut ; le nom de la radio ne sort jamais.

## Canaux et audience
- **Actifs** : le site vitrine trilingue et ses 4 formulaires, qui alimentent le CRM ;
  le blog auto-généré n8n (≈95 articles, 31 sujets × 3 langues, parution hebdomadaire le
  jeudi, indexable seulement depuis le 13/08/2026) ; la page locale
  `/pme-hainaut-bruxelles` ; la vitrine `/realisations` (15 fiches).
- **En cours d'ouverture** : LinkedIn, qui porte le GTM de la grille O1–O5. Bloqué à
  l'extérieur — publier sur une page entreprise exige la Community Management API de
  LinkedIn, soumise à revue, et la demande d'accès revient à Laurent. Le module LinkedIn
  du CRM **n'a jamais publié** (0 ligne dans `linkedin_posts`).
- **Abandonné** : la newsletter (0 abonné actif, 0 envoi en 9 mois). Capture retirée du
  site, workflow désactivé, mais **pages, routes et tables conservées** : un abonné en
  attente existe et ses droits RGPD doivent rester servis. Décision réversible.
- **Cible** : dirigeants de PME en Belgique (Hainaut et Bruxelles en priorité SEO) et en
  France — restaurateurs, e-commerçants, agences, artisans, professions libérales. Non
  techniques, pressés, méfiants envers le battage IA. Décision rapide, bureau ou mobile.
- **Conversion** : le rendez-vous de découverte de 30 minutes est le tunnel d'entrée.
  ⚠️ `VITE_BOOKING_URL` est vide en production — les boutons de réservation sont donc
  **masqués** tant que Laurent n'a pas fourni son lien.
- Volumétrie réelle des canaux (sessions GA4, impressions hors blog) : — à compléter.
