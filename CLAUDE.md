# À lire en premier

**Le contexte de ce projet vit dans `HANDOFF.md`**, à la racine du dépôt : état réel,
décisions déjà tranchées, chantiers ouverts, pièges connus. Un hook l'injecte
automatiquement à l'ouverture de la session — si tu ne l'as pas vu passer, lis-le.

Le fichier ci-dessous est l'arbre de dépendances technique. Il dit *comment le code
est fait*. `HANDOFF.md` dit *où on en est*. Les deux sont nécessaires.

## Avant de rendre la main

Quand tu as fait du vrai travail, trois gestes, dans cet ordre :

1. Mettre `HANDOFF.md` à jour (état, chantiers, date en tête).
2. Écrire une note dans `docs/journal/AAAA-MM-JJ-sujet.md`, format dans
   `docs/journal/README.md`, champ `notion: non`.
3. Commiter les deux.

La commande `/handoff` fait le tour de la question. Un hook te le rappelle une fois
si tu l'oublies.

**Tu ne remontes jamais rien dans Notion toi-même** — c'est la session Cowork qui lit
les notes `notion: non` et les pousse. Écris le fichier, c'est tout.

---

# AInspiration - Arbre de dépendances

## Architecture globale

```
[Navigateur] → [Traefik (HTTPS)] → [Nginx (frontend)] → fichiers statiques (dist/)
                                  → [Express (backend)] → [PostgreSQL]
                                  → [N8N webhooks]
```

**VPS:** srv767464.hstgr.cloud (193.203.191.251)
**Container:** ainspiration-web (node:20-alpine)
**Frontend:** Vite/React SPA déployé via Netlify → copié dans container via `docker cp`
**Backend:** Express server.js dans /app/
**BDD:** PostgreSQL 16-alpine

---

## Routing & Pages

### Pages publiques (pas d'auth)

| Route | Page | Namespace i18n |
|-------|------|----------------|
| `/` | HomePage | common, features, collaboration, training, content, support |
| `/login` | LoginPage | crm (section auth) |
| `/audit` | AuditPage | audit |
| `/analyse-ia` | AnalyseIAPage | analysis |
| `/transformation` | TransformationPage | transformation |
| `/creation-ia` | CreationIAPage | content |
| `/solutions` | SolutionsPage | common |
| `/produits` | ProductsPage | common |
| `/pme-hainaut-bruxelles` | LocalPage | local (page locale Hainaut/Bruxelles, 05/09/2026 ; `/etudes-de-cas` → 301 `/realisations`) |
| `/newsletter-confirmee` | NewsletterConfirmPage | forms (atterrissage du lien de confirmation newsletter, noindex) |
| `/a-propos` | AboutPage | about |
| `/contact` | ContactPage | forms |
| `/prompts` | PromptOptimizationPage | common |
| `/automatisation` | AutomationPage | common |
| `/assistants` | VirtualAssistantsPage | common |
| `/conseil` | ConsultingPage | common |
| `/formation` | FormationPage | common |
| `/accompagnement` | CustomSupportPage | common |
| `/blog` | BlogPage | blog |
| `/blog/thierry-facturation-ia` | ThierryBlogPage | blog |
| `/blog/:slug` | BlogPostPage | blog |
| `/crm` | CRMSolutionPage | crm |
| `/privacy` | PrivacyPolicyPage | legal |
| `/mentions-legales` | MentionsLegalesPage | legal |
| `/cgv` | CGVPage | legal |
| `/cgu` | CGUPage | legal |

### Pages CRM protégées (auth requise)

Toutes ces pages sont wrappées dans `<PrivateRoute><CrmLayout>...</CrmLayout></PrivateRoute>`.
**Si tu oublies un de ces wrappers, la page perd le sidebar CRM ou devient accessible sans login.**

| Route | Page | Namespace i18n | Composants CRM clés |
|-------|------|----------------|---------------------|
| `/crm-dashboard` | CrmDashboardPage | crm | DashboardView, AdvancedStats, AIInsights, LeadScoring |
| `/opportunities` | OpportunitiesPage | crm | OpportunityList, OpportunityKanban, OpportunityStats |
| `/contacts` | ContactsPage | crm | ContactList, ContactDetail, ContactForm |
| `/companies` | CompaniesPage | crm | CompanyList, CompanyDetail, CompanyForm |
| `/products` | ProductsPage | crm | ProductList, ProductDetail, ProductForm |
| `/tasks` | TasksPage | crm | TaskList, TaskForm |
| `/reports` | ReportsPage | crm | ReportsDashboard, ContactsReport, OpportunitiesReport |
| `/messages` | MessagesPage | crm | ContactMessagesList, ContactMessageDetail |
| `/newsletter-admin` | NewsletterAdminPage | common | Newsletter management |
| `/linkedin` | LinkedinPage | crm | linkedinService |
| `/blog-admin` | BlogAdminPage | crm (section blogAdmin) | File de relecture de l'auto-blog : brouillons retenus par le contrôle qualité n8n, publication/archivage des 3 langues (PUT partiel `/api/blog-posts/:id`) |

### Préfixes langue

- Pas de préfixe = **français** (défaut)
- `/en/*` = anglais
- `/nl/*` = néerlandais
- Détection: path → querystring → navigator (PAS cookie/localStorage)

---

## Arbre de dépendances des composants

### Layout principal (pages publiques)

```
App.tsx
├── AppContextProvider (AuthProvider → NotificationProvider → HelmetProvider)
├── LanguageSync (sync i18n ↔ URL)
├── Analytics (GA4)
├── MainLayout
│   ├── Header (+ NavMenu avec sélecteur langue)
│   ├── Footer
│   ├── HomeButton
│   ├── ScrollToTop
│   ├── CookieBanner (lazy)
│   ├── ChatbotN8n (lazy)
│   ├── PopupNewsletter (lazy)
│   └── Breadcrumbs
└── <Routes> (lazy-loaded pages)
```

### Layout CRM (pages protégées)

```
<PrivateRoute>          ← vérifie JWT, redirige vers /login si absent
  <CrmLayout>           ← sidebar avec navigation CRM
    <Page CRM>          ← contenu de la page
  </CrmLayout>
</PrivateRoute>
```

### Composants CRM partagés (ne pas supprimer sans vérifier les usages)

```
CrmLayout.tsx          → TOUTES les pages CRM (sidebar)
CrmQuickLinks.tsx      → CrmDashboardPage
DashboardView.tsx      → CrmDashboardPage
  ├── AdvancedStats
  ├── OpportunityStats
  ├── LeadScoring      → n8nService (webhook)
  ├── AIInsights       → n8nService (webhook)
  ├── ActivityFeed     → activityService
  ├── FollowUpSuggestions → n8nService
  └── SmartRecommendations
ContactList/Detail/Form → ContactsPage, liens depuis Opportunities, Tasks
CompanyList/Detail/Form → CompaniesPage, liens depuis Contacts
ProductList/Detail/Form → ProductsPage, liens depuis Opportunities
OpportunityList/Kanban  → OpportunitiesPage
TaskList/Form           → TasksPage
ContactMessagesList     → MessagesPage
ReportsDashboard        → ReportsPage
  ├── ContactsReport
  ├── OpportunitiesReport
  ├── ProductsReport
  ├── TasksReport
  ├── ReportFilters
  ├── ReportExporter
  └── DateRangePicker
```

### Composants cross-référencés (attention aux suppressions)

```
ContactLink.tsx    → utilisé dans OpportunityDetail, TaskList
CompanyLink.tsx    → utilisé dans ContactDetail, OpportunityDetail
ProductLink.tsx    → utilisé dans OpportunityDetail
BulkActions.tsx    → ContactList
PipelineChart.tsx  → DashboardView, ReportsDashboard
SalesPerformanceChart.tsx → DashboardView
```

---

## Services & API

### Chaîne de dépendances frontend → backend

```
Composant React
  → Service (src/services/*.ts)
    → api.ts (utils/api.ts) — ajoute JWT, gère erreurs
      → fetch(`${VITE_API_URL}/api/...`)
        → Express server.js (VPS)
          → PostgreSQL (pool.query)
```

### Services et leurs endpoints

| Service | Endpoints API | Utilisé par |
|---------|---------------|-------------|
| contactService | `/contacts`, `/contacts/:id` | ContactList, ContactDetail, ContactForm, DashboardView |
| companyService | `/companies`, `/companies/:id`, `/companies/search`, `/companies/stats` | CompanyList, CompanyDetail, CompanyForm |
| opportunityService | `/opportunities`, `/opportunities/:id` | OpportunityList, OpportunityKanban, OpportunityDetail |
| productService | `/products`, `/products/:id` | ProductList, ProductDetail, ProductForm |
| taskService | `/tasks`, `/tasks/:id` | TaskList, TaskForm |
| activityService | `/activities` | ActivityFeed, DashboardView |
| contactMessageService | `/contact-messages`, `/contact-messages/stats` | ContactMessagesList, NotificationContext |
| blogService | `/blog-posts` (fetch direct, pas api.ts) | BlogPage, BlogPostPage, BlogSidebar |
| newsletterService | `/newsletter-subscribers`, `/newsletter-stats` | NewsletterAdminPage, PopupNewsletter |
| accessLogService | `/access-logs` | AuthContext (login/logout tracking) |
| n8nService | Webhooks N8N externes | LeadScoring, AIInsights, FollowUpSuggestions |
| linkedinService | `/api/linkedin/*` (ou service externe) | LinkedinPage |
| openRouterService | OpenRouter API (externe) | Génération contenu IA |

---

## i18n - Fichiers de traduction

### Structure des fichiers

```
public/locales/
├── fr/
│   ├── common.json      ← navigation, boutons, labels génériques
│   ├── crm.json         ← TOUT le CRM (menu, pages, composants, auth)
│   ├── features.json
│   ├── audit.json
│   ├── analysis.json
│   ├── blog.json
│   ├── legal.json
│   ├── about.json
│   ├── forms.json
│   ├── caseStudies.json
│   ├── transformation.json
│   ├── content.json
│   ├── ... (21 namespaces)
├── en/ (mêmes fichiers)
└── nl/ (mêmes fichiers)
```

### Points critiques i18n

1. **crm.json** est le plus gros fichier — contient menu, auth, pages CRM, composants. Un JSON invalide (virgule manquante) casse TOUT le CRM.
2. **Les namespaces sont chargés par HTTP** (sauf fr/common bundlé). Un namespace manquant = clés brutes affichées.
3. **`useTranslation('crm')`** : toujours spécifier le namespace dans les pages CRM, sinon les clés ne se chargent pas au premier rendu.
4. **Pas de préfixe `crm:` dans les clés** quand on est déjà dans le namespace crm (ex: `t('menu.dashboard')` pas `t('crm:menu.dashboard')`).

---

## Base de données - Relations

```
users
  ├── 1:N → activities (user_id)
  └── 1:N → opportunities (owner_id)

companies
  ├── 1:N → contacts (company_id)
  ├── 1:N → opportunities (company_id)
  └── 1:N → tasks (company_id)

contacts
  ├── 1:N → opportunities (contact_id)
  └── 1:N → tasks (contact_id)

opportunities
  └── 1:N → tasks (opportunity_id)

contact_messages (pas de FK vers users/contacts — messages du site web)
products (pas de FK — catalogue indépendant)
```

### Données démo

- **User démo:** `a0000000-0000-0000-0000-000000000001` / `demo@ainspiration.eu`
- **Auto-reset:** après 15min d'inactivité, `resetDemoData()` dans server.js nettoie et re-seed
- **IDs fixes:** companies `c0000000-*`, contacts `d0000000-*`, products `e0000000-*`, opportunities `f0000000-*`, tasks `b0000000-*`, messages `a1000000-*`
- **Le seed utilise `ON CONFLICT (id) DO UPDATE`** — safe à re-exécuter

### Cloisonnement démo / données réelles (14/09/2026) — ne pas défaire

Les identifiants du compte démo sont **publics** (affichés sur `/login`). Tout ce qui
n'est pas cloisonné est donc lisible par n'importe quel visiteur.

- **Ne jamais supprimer « ce qui n'est pas du seed ».** `resetDemoData()` contenait
  cinq `DELETE ... WHERE id NOT LIKE '<plage seed>'` : appliqués à toute la base, sans
  regarder le propriétaire, ils effaçaient les contacts, sociétés, produits et messages
  réels. Le nettoyage se borne aux plages d'IDs du seed, ou à `owner_id = DEMO_USER_ID`.
- **`id` est de type `uuid` : toujours `id::text LIKE '...'`.** `uuid LIKE texte` lève une
  erreur. Avec les `.catch(() => {})` d'origine, le nettoyage échouait en silence et le
  re-seed n'aboutissait jamais — d'où des tâches en retard depuis mai et des contacts
  sans société dans la démo. Les catch loguent désormais.
- **Le compte démo ne doit JAMAIS avoir `role = 'admin'`.** Forcé par `migration-005`.
  (Historiquement, `ownerScope()` rendait `NULL` pour un admin — « voit tout » — et un
  démo admin annulait donc tout le cloisonnement. Ce n'est plus le mécanisme depuis le
  16/09/2026, voir ci-dessous, mais la règle reste : un compte public n'est pas admin.)
- **Depuis le 16/09/2026, `ownerScope()` ne fait plus d'exception pour l'administrateur :
  chaque compte ne voit que ses propres lignes.** L'admin voyait les fiches de
  démonstration mêlées aux siennes. Rien n'a été supprimé — la démo publique continue de
  voir les siennes, ce sont elles qui la font vivre.
  - Un appelant **sans identité** (secret de service) reçoit désormais un identifiant qui
    ne correspond à aucune ligne : il ne voit **rien** au lieu de **tout**. Une route
    scopée posée par erreur derrière `requireAuthOrService` ne s'ouvre plus toute seule.
  - Les créations écrivent `req.user.id` en direct, jamais `ownerScope()` : aucune ligne
    sans propriétaire n'est fabriquée. **Si un jour il en existait une, plus personne ne
    la verrait** — c'est le prix assumé du sens sûr.
  - `tasks` n'a pas de colonne `owner_id` : elle se filtre par `assigned_to`.
  - Les messages du site sont attribués à l'administrateur dès l'insertion
    (`routes/crm.js`), ils restent donc visibles après ce changement.
- **Chaque lecture ET chaque écriture porte `($N::uuid IS NULL OR owner_col = $N)`.** Un
  seul endpoint oublié suffit. `migration-005` ajoute `owner_id` à `companies`,
  `products` et `contact_messages` (la 003 ne couvrait que contacts/opportunités/
  tâches/activités) ; `routes/crm.js` filtre désormais ces trois tables, les
  access-logs (le `?user_id=` libre exposait les connexions d'autrui) et
  l'enrichissement des activités.
- **Ordre de déploiement obligatoire : la migration AVANT le code.** Le code référence
  `owner_id` sur trois tables qui ne l'ont pas encore — déployer d'abord = 500 partout.
- **Test de non-régression manuel :** créer une fiche depuis le compte admin, se
  connecter en démo, vérifier qu'elle est invisible.

### Les workflows n8n ne portent plus de JWT (15/09/2026)

Le blog est resté muet 18 jours sans que personne le voie. Cause unique : la
credential n8n « AInspiration - Blog API Key » contenait un **jeton admin JWT
valable un an, collé à la main**. La rotation de `JWT_SECRET` du 08/09 s'est
terminée à moitié — le jeton reposé était signé avec un autre secret que celui
que le conteneur faisait tourner — et `POST /api/blog-posts` a répondu 401 dès
le lendemain. L'auto-blog (09/09 et 15/09) et la newsletter (10/09) sont tombés
ensemble, les articles étant générés puis perdus à l'étape de publication.

Le défaut n'était pas la rotation, c'était le couplage : **un workflow n'est pas
un humain et n'a rien à faire avec un JWT.**

- **`SERVICE_SECRET`** porte désormais l'authentification machine, sur la forme
  exacte d'`INGEST_SECRET` : en-tête `x-service-secret`, comparaison en temps
  constant, **fermé par défaut** si la variable manque. Une rotation de
  `JWT_SECRET` ne casse plus ni l'auto-blog ni la newsletter, et il n'y a plus
  d'expiration à surveiller.
- **Il n'ouvre que deux routes** : `POST /api/blog-posts` et
  `GET /api/newsletter-subscribers` — les seules dont n8n a besoin. `PUT` et
  `DELETE` sur un article restent réservés à un humain authentifié : la relecture
  éditoriale de `/blog-admin` n'est pas une opération de machine.
- **`requireAuthOrService` ne doit JAMAIS être posé sur une route scopée par
  propriétaire.** Un appelant porteur du secret n'a pas d'identité : `req.user`
  reste absent, et `ownerScope()` rend alors `null`, c'est-à-dire « voit tout »,
  exactement comme pour un admin. Sur une route scopée, le secret gagnerait donc
  silencieusement la portée d'un admin. Les deux routes ouvertes ne lisent ni
  `owner_id` ni `ownerScope`.
- **`GET /api/ingest/probe`** remplace la relecture de la fiche de sonde par
  `GET /api/contacts/:id` : la surveillance exigeait un accès CRM complet pour
  lire une date. La route rend `{ exists, updated_at }` pour une adresse figée
  dans le code, sous le secret d'ingestion que la sonde porte déjà.
- Verrouillé par `docker/backend/test/service-auth.test.mjs` (`npm test`) :
  le secret ouvre les deux routes, n'ouvre pas le CRM, et une variable absente
  ferme la porte au lieu de l'ouvrir.

**Ordre de déploiement :** le code accepte JWT **ou** secret, il est donc
rétrocompatible et peut partir en premier. Ensuite `SERVICE_SECRET` dans le
`.env` du VPS **et** dans le compose, recreate, puis seulement après le
basculement des credentials n8n. Tant que la variable n'est pas dans
l'environnement du conteneur, le secret est refusé — c'est voulu.

### Ingestion des prospects (15/09/2026)

Avant cette date, les formulaires n'écrivaient que dans Gmail : le prospect n'existait
nulle part et rien ne pouvait être relancé ni compté.

- **`docker/backend/ingest.js`** porte la création de fiche, partagée par deux appelants.
  Fichier backend, donc **présent dans `files.txt`** — sans quoi le conteneur ne démarre pas.
- **`POST /api/ingest/contact`** (dans `routes/webhooks.js`) : authentifié par l'en-tête
  `x-ingest-secret` comparé en temps constant, **fermé par défaut** si `INGEST_SECRET` est
  absent de l'environnement. Idempotent sur l'email, insensible à la casse. 201 fiche créée,
  200 fiche mise à jour, 400 email invalide, 401 secret absent ou faux. Quatre workflows n8n
  l'appellent (formulaires AInspiration, Distr'Action, Audityo, audit gratuit).
- **La newsletter n'y passe pas par n8n.** La fiche naît dans le handler
  `GET /api/newsletter-subscribers/confirm`, jamais avant : le workflow n8n
  `Mi8VlalnAIyx6bre` s'exécute à l'**inscription**, y placer l'appel créerait une fiche sur
  un consentement non confirmé. L'appel est hors du `try` principal et dans le sien —
  l'abonnement est déjà acquis, un CRM en panne ne doit ni le perdre ni retarder la
  redirection.
- **Les fiches appartiennent toujours à l'administrateur**, jamais au compte démo : c'est ce
  qui les rend invisibles depuis la démo publique.
- **`source` (migration-006) est la provenance**, affichée dans la liste et la fiche contact,
  et alimentant `LeadSourceChart`. Sur une fiche existante, l'ingestion conserve la
  **première** provenance connue ; `PUT /api/contacts/:id` la protège par `COALESCE`, un
  client qui ne l'envoie pas ne l'efface pas. Elle s'appelait `lead_source` côté frontend,
  sans colonne correspondante : le champ, le graphique et le rapport étaient morts depuis
  toujours.
- **Les notes ne sont ajoutées que si elles n'y figurent pas déjà.** Sans cela, un prospect
  qui soumet trois fois le même formulaire voit son message recopié trois fois.

### Antislashes parasites — pourquoi les traductions EN/NL échouaient (16/09/2026)

Le modèle échappe parfois ses guillemets et apostrophes **à l'intérieur du HTML** qu'il
produit : `href=\"...\"`, `aujourd'hui`. Un seul défaut, deux dégâts :

1. les antislashes s'affichent tels quels sur la page publiée ;
2. recopiés dans le prompt de traduction, ils font produire au traducteur un **JSON
   malformé** — `Parser EN` et `Parser NL` lèvent, et il n'y a plus ni version anglaise
   ni version néerlandaise.

**Ne pas confondre avec une troncature.** Le 16/09, la traduction était complète
(`finish_reason: 'stop'`, 1915 tokens sur 8000 autorisés) et pourtant impossible à parser.
Augmenter `max_tokens` — le réflexe, déjà appliqué le 01/09 — ne corrige rien ici.

Correctif à la source dans `Parser FR` : `a.content.replace(/\+(["'])/g, '$1')`, avant
tout autre traitement. Une seule fois, pour les trois langues.

Deux articles sur 95 étaient touchés (un d'avril, un du 16/09), nettoyés en base.

**Pour nettoyer ce genre de chose, utiliser `split/join`, jamais une expression régulière
écrite au travers d'un tube shell.** Le motif `/\+(["'])/` traverse le heredoc local,
ssh, le heredoc distant et `docker exec` : il y arrive mangé, et le script rapporte
tranquillement « 0 nettoyé » alors que deux articles étaient à corriger. Voir aussi
[[patch-scripts-dollar-trap]].

**Et pour compter des balises dans le HTML brut : `grep -o '<h2' | wc -l`, pas
`grep -c '<h2>'`.** Le second compte des LIGNES contenant exactement cette chaîne — sur un
HTML d'une seule ligne avec des attributs, il renvoie 1 et fait croire à une régression SEO
inexistante.

### Mesure du blog — ce que valent réellement les articles (16/09/2026)

Pendant six mois, on a produit sans jamais mesurer. Le seul contrôle existant vérifiait
qu'un article avait été **publié**, pas qu'il avait été **lu**.

Les chiffres, lus dans la base SEOPilot (Search Console + GA4 y sont connectés pour
`ainspiration.eu`, site `cmmci6qe70008yktie4k880i5`) :

| | |
|---|---|
| Articles publiés (31 sujets × 3 langues) | 93 |
| Mots-clés positionnés | 18 |
| Impressions (fenêtre GSC) | 41 |
| Clics | 1 |
| Position moyenne | 41 |

- **Les sujets du blog ne se positionnent pas** : « prompt ia », « ia prompts »,
  « bibliothèque de prompts » sortaient en position 60 à 71.
- **Les termes commerciaux, eux, sont en page 1-2** : « audit stratégie intelligence
  artificielle pour pme » (9), « audit ia gratuit » (11), « audit ia pme » (11). Ce sont
  les pages de service qui les portent, pas les articles.
- **Le blog n'est indexable que depuis le 13/08/2026** (correctif du rendu serveur). Toute
  donnée antérieure ne veut rien dire, et il n'a donc eu qu'un mois de chance réelle.

Décisions prises le 16/09 :

1. **Pool de sujets réécrit** dans `Jour de publication ?` de l'auto-blog, vers le terrain
   gagnable : audit IA, PME, Hainaut, Bruxelles, Belgique, conformité EU AI Act. Fini les
   généralités mondiales sur des termes sans autorité.
2. **Fenêtre de décision datée : fin novembre 2026**, soit trois mois pleins
   d'indexabilité. Critère fixé **d'avance** pour ne pas déplacer la barre après coup :
   **500 impressions et 15 clics sur 28 jours**. En dessous, changer de format ou arrêter.
3. **Trois langues conservées** (décision de Laurent), malgré des termes anglais accrochés
   sans valeur commerciale (« ai aspiration », « automating your invoices in talentia »).

**Rapport mensuel automatique** — workflow n8n « AInspiration — Rapport SEO mensuel »
(`3q20oRVZK1YGGV6f`), alimenté par `/root/seo-monthly-report.sh` sur le VPS (cron le 1er du
mois à 7h, log dans `/var/log/seo-monthly-report.log`).

- **Pourquoi un script sur l'hôte et non un nœud n8n** : `seopilot-postgres` vit sur le
  réseau `autoseo_seopilot_default`, n8n sur `root_default` — n8n ne peut pas le joindre.
  Le `docker exec` depuis l'hôte n'exige aucun mot de passe, ce qui évite en prime de
  recopier une credential de base dans n8n.
- **Le secret d'authentification n'est stocké qu'à un seul endroit** : le script relit
  `SEOPILOT_WEBHOOK_SECRET` dans le conteneur n8n **à l'exécution**. Il n'apparaît ni dans
  le script, ni dans le cron, ni dans une credential dupliquée.
- **Un secret faux arrête le workflow en silence (`return []`), il ne lève pas.** Le
  webhook répond 200 avant que le contrôle ne tourne (`responseMode: onReceived`) : il est
  donc appelable par n'importe qui. Si un secret faux levait une erreur, chaque appel
  déclencherait l'`Error trigger` et donc un mail — la porte resterait fermée, mais la
  sonnette deviendrait un outil de harcèlement. Un secret **absent de n8n**, en revanche,
  lève : c'est une faute de configuration qu'il faut voir.

### Surveillance des parcours métier (15/09/2026)

Quatre pannes majeures ont été découvertes en deux jours, **toutes par hasard, aucune
signalée par le système** : formulaire de contact d'Audityo muet depuis deux semaines,
auto-blog et newsletter muets depuis une semaine (jeton invalidé par la rotation du 8/09),
toutes les fiches de la démonstration en 400 après une montée de version de Zod,
intégration continue rouge pendant 24 h. Le contrôle hebdomadaire existant ne vérifiait
que la réponse des pages — un 200 ne prouve rien.

Workflow n8n **« AInspiration — Surveillance parcours métier »** (`ydW4SMHaeQQ58O4v`),
tous les jours à 6h15, rattaché à l'`Error trigger` (`qoHCxT04kuGtqRf7`).

Six contrôles, en série, chacun en `continueRegularOutput` pour que le verdict voie tout :

| Contrôle | Attendu | Détecte |
|---|---|---|
| Sonde d'ingestion | 200/201 | la chaîne d'écriture du CRM est rompue |
| Relecture de la fiche | 200 + `updated_at` du jour | l'écriture n'a pas persisté |
| Secret d'ingestion (corps invalide) | **400** | `INGEST_SECRET` tourné sans être propagé |
| Jeton CRM | 200 | le jeton de l'auto-blog et de la newsletter est mort |
| Fraîcheur du contenu | < 10 jours | la chaîne éditoriale est à l'arrêt |
| Liens d'articles dans le **HTML brut** | ≥ 5 | régression SEO invisible en HTTP 200 |

Points à ne pas défaire :

- **La fiche de sonde ne doit pas être supprimée.** `sonde-parcours@surveillance.ainspiration.eu`,
  `source = sonde-surveillance`. L'ingestion étant idempotente sur l'email, il n'y en aura
  jamais qu'une : c'est elle qui prouve que la chaîne écrit réellement en base.
- **Un 400 attendu vaut succès** sur le contrôle du secret : c'est la preuve que
  l'authentification passe alors que le corps est refusé. Un 401 est l'alerte.
- **Avec `responseFormat: 'text'`, n8n place le corps dans `data`, pas dans `body`.** Lire
  la mauvaise clé donnait 0 lien et une fausse alerte SEO quotidienne.
- **Silence quand tout va bien, sauf un signe de vie le lundi.** Un moniteur mort en
  silence reproduit exactement le défaut qu'il est censé détecter — l'absence de message
  le lundi est donc elle-même une alerte.
- Le webhook de déclenchement manuel est **temporaire** : l'ajouter pour tester, le retirer
  ensuite. Laissé en place, il permettrait à quiconque de déclencher la sonde et les mails.

Pour ajouter un contrôle : un nœud HTTP avec `fullResponse` + `neverError` (pour lire le
code de statut sans faire échouer la chaîne), inséré dans la série, puis une branche dans
le nœud `Verdict` qui empile un message dans `echecs` ou dans `ok`.

---

## Analytics — trafic local envoyé en production (13/08/2026)

La propriété GA4 de production reçoit des vues depuis `localhost` : **7 vues sur 30 jours**,
constatées via l'API GA4 depuis le projet AutoSEO.

La garde `isProd` de `src/components/Analytics.tsx` ne suffit pas : `import.meta.env.PROD`
vaut `true` dès qu'il s'agit d'un **build** de production, y compris servi localement
(`vite preview`, ou un `dist/` ouvert en local). Elle distingue le mode de build, pas la
machine.

Correctif : exclure aussi l'hôte local, en plus de `isProd`.

```ts
const isLocalHost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
if (!isProd || isLocalHost || !env.analyticsEnabled) return;
```

Sans cela, les statistiques mélangent visiteurs réels et sessions de test — sur de petits
volumes, la distorsion est majeure. Distr'Action a exactement le même problème.

## SEO serveur — le blog invisible (13/08/2026)

Cinquante articles publiés entre mai et août, aucun indexé. Le site répondait 200 partout
et paraissait sain : le défaut n'était visible qu'en récupérant le HTML **sans exécuter de
JavaScript**. C'est le seul test qui compte pour cette classe de bug.

```bash
curl -s https://ainspiration.eu/blog/<slug> | grep -c "<h2>"
```

Un crawler qui n'exécute pas JS voit exactement ça. Google sait rendre du JS, mais met les
domaines sans autorité dans une file d'attente de rendu — en pratique, du contenu absent du
HTML brut n'existe pas.

### Les quatre pièges, tous dans `docker/backend/server.js`

- **`express.static` sert `/` depuis le disque.** Son option `index` vaut `index.html` par
  défaut : la homepage n'atteignait **jamais** le handler SEO en fin de fichier. Elle gardait
  donc la liste d'articles écrite à la main dans `index.html`, dont les slugs ne
  correspondaient plus à rien. `index: false` est indispensable — et invisible à la lecture
  du code, seul un test le révèle.
- **Le `<main>` servi ne contenait pas les articles.** Le corps vivait dans le bundle React.
  Toute donnée qui doit être indexée doit être injectée dans le HTML par le serveur.
- **Le SPA-fallback répondait 200 à toute URL inconnue**, y compris aux liens morts, ce qui
  fabrique une duplication illimitée de la homepage. La liste blanche des routes vient de
  `src/config/routes.ts` : **la tenir à jour quand une route est ajoutée**, sinon la nouvelle
  page renverra 404.
- **Aucun lien interne dans le HTML brut.** Une liste rendue côté client ne maille rien.

### Contraintes à respecter en modifiant ce handler

- **Assainir le contenu injecté.** Les corps d'articles sont du HTML stocké et la CSP autorise
  `'unsafe-inline'` pour les scripts : injecter `content` brut serait un XSS stocké. La liste
  blanche est dans `sanitizeArticleHtml`.
- **Distinguer « slug absent » de « base injoignable ».** `getBlogPost` renvoie `null` pour
  le premier cas et `undefined` pour le second. Seul `null` autorise un 404 — sinon une
  coupure de base délisterait tous les articles d'un coup.
- **Ne jamais remettre un `catch` muet** sur le chemin de rendu. C'est ce silence qui a laissé
  le problème durer trois mois.
- **Ne jamais masquer `#seo-fallback` par un attribut.** Tout ce que ce handler injecte vit
  dans ce conteneur, et c'est la seule chose que voient les robots des moteurs génératifs.
  Tant qu'il portait `style="display:none"` et `aria-hidden="true"` (jusqu'au 12/09/2026), les
  extracteurs de texte — Readability, trafilatura, et les pipelines d'ingestion LLM qui s'en
  servent — l'écartaient comme contenu masqué : la page leur paraissait vide, alors que le
  serveur y injecte tout. Le masquage appartient à la feuille de styles (`#seo-fallback` dans
  `src/index.css`), que ces robots ne chargent pas et que les navigateurs appliquent avant le
  premier paint. Verrouillé par `src/test/seo-fallback.test.ts`.
- **Ne pas passer de chaîne de remplacement à `String.replace`** sur ce chemin. `$&`, `$'`,
  `` $` `` et `$1` y sont interprétés, et `escHtml` ne protège ni le `$` ni l'apostrophe : un
  article citant « 100$ » ou un extrait de shell `$'
'` recopiait la portion capturée au
  milieu de la page, sans la moindre erreur. Passer par le helper `literal()`, ou par une
  fonction quand une capture est nécessaire.

## Déploiement - Ne pas casser

### Ordre de déploiement frontend

1. `npm run build` (dans AInspiration/) — régénère **automatiquement** `docker/dist-manifest.txt` via le hook `postbuild` (`scripts/generate-dist-manifest.mjs`). Ne jamais éditer le manifeste à la main.
2. `npx netlify deploy --prod --dir=dist`
3. `git add docker/dist-manifest.txt && git commit` — le manifeste doit refléter EXACTEMENT le dernier build, sinon le container télécharge une liste de chunks obsolète.
4. Recréer le container : `docker cp` le dist complet dans le container, OU `docker compose up -d --force-recreate web` (PAS un simple `docker restart`).

⚠️ **Ne jamais déployer si le `git diff` du manifeste après build est non vide et non committé** — c'est le signe d'un build dont les chunks n'ont pas été propagés (cause de l'incident du 2026-06-08, site entièrement HS).

### Pourquoi pas docker restart ?

Le container télécharge le frontend depuis Netlify au démarrage selon `docker/dist-manifest.txt`. Le CDN Netlify peut servir un index.html qui référence des chunks JS pas encore propagés → **erreur 404 sur les assets**. `docker cp` évite ce problème.

### Garde-fou : un déploiement partiel échoue bruyamment (depuis 2026-06-08)

- **Express ne sert plus jamais le SPA-fallback `index.html` pour un asset manquant.** Toute requête `/assets/*` ou tout fichier hashé avec extension (`.js`/`.css`/`.woff2`/…) absent du disque renvoie un **404** au lieu d'un `200 + text/html`. Avant ce fix, un chunk manquant renvoyait `index.html` avec le mauvais MIME type → `Failed to load module script` et tout le site HS en silence (seul l'accueil eager fonctionnait). Voir la section "STATIC FILES + SPA FALLBACK" dans `docker/backend/server.js`. Le SPA-fallback ne s'applique qu'aux routes de navigation (extension-less).
- **Le manifeste est régénéré automatiquement** après chaque build (hook `postbuild`), il ne peut plus diverger silencieusement du contenu de `dist/`.

### Fichiers critiques à ne jamais casser

| Fichier | Impact si cassé |
|---------|-----------------|
| `src/i18n.ts` | Toutes les traductions cassées |
| `src/config/routes.ts` | Navigation cassée, pages inaccessibles |
| `src/context/AuthContext.tsx` | Login/logout cassé, pages protégées inaccessibles |
| `src/context/AppContext.tsx` | App entière cassée (root provider) |
| `src/utils/api.ts` | Toutes les requêtes API cassées |
| `src/components/crm/CrmLayout.tsx` | Sidebar CRM disparaît de toutes les pages |
| `src/components/PrivateRoute.tsx` | Pages CRM accessibles sans auth ou inaccessibles |
| `public/locales/*/crm.json` | CRM affiche des clés brutes partout |
| `docker/backend/server.js` (GitHub) | Backend cassé au prochain restart container |
| `docker/backend/routes/*.js` + `docker/backend/files.txt` | Depuis le 05/09/2026 le backend est découpé en modules ; le conteneur télécharge la liste `files.txt` au boot. **Un fichier ajouté dans `docker/backend/` doit être ajouté à `files.txt`**, sinon `require` échoue au démarrage. `cd docker/backend && npm test` = contrat d'autorisation (toute route hors liste blanche → 401). |

### Variables d'environnement requises (backend)

- `DATABASE_URL` ou `DB_HOST` + `DB_PORT` + `DB_NAME` + `DB_USER` + `DB_PASSWORD`
- `JWT_SECRET`
- `PORT` (3001)
- `INGEST_SECRET` — ingestion des prospects et sonde de surveillance
- `SERVICE_SECRET` — publication de l'auto-blog et lecture des abonnés par n8n

---

## Formulaires publics

- **AuditForm** — Formulaire audit en 4 étapes. Utilisé par: Hero, Header, AuditPage, AuditSection, WhyAI, AIAnalysis, SmartRecommendations, Testimonials, ForWhoAIPage, ThierryBlogPage
- **StartForm** — Formulaire contact générique. Utilisé par: CRMSolutionPage, Formation, Automation, Consulting, Tools, VirtualAssistants, CustomSupport, Creativity, PromptOptimization, TransformationPage, AnalyseIAPage, CreationVisuellePage, BlogCTA

**Ne pas renommer ces composants sans mettre à jour tous les imports.**

---

## Corrections appliquées — 4-5 avril 2026

### Bugs corrigés
- **Pipeline audit** : modèle IA obsolète `claude-3.5-sonnet` → `claude-sonnet-4.6` (OpenRouter)
- **CRM Intelligent** : 4 nodes mis à jour `claude-3-haiku` → `claude-haiku-3.5`
- **`/api/auth/me`** : réponse wrappée dans `{ user: ... }` pour matcher le destructuring de l'AuthContext. Sans ce fix, tout rechargement de page (y compris retour OAuth) redirige vers /login.
- **LinkedIn OAuth callback** : redirect vers `/linkedin` au lieu de `/` après autorisation
- **LinkedIn client_secret** : secret expiré remplacé dans la config Docker (.env)

### Documents légaux créés
- **SLA v1.0** : `Paperclip/legal/SLA-AInspiration-v1.0-2026-04-04.md` + page Notion
- **DPA v1.0** : `Paperclip/legal/DPA-AInspiration-v1.0-2026-04-04.md` + page Notion
- **CGV** : sections 11 (SLA) et 12 (DPA) ajoutées dans `public/locales/fr/legal.json`

### Paperclip
- 10 agents comité de direction configurés avec AGENTS.md personnalisés
- URL : https://paperclip-zjyk.srv767464.hstgr.cloud
- Premier comité lancé (acquisition 10 premiers clients)

### LinkedIn
- Reconnecté le 5 avril 2026 (profil : Laurent Marechal)
- Token OAuth valide ~60 jours (expiration estimée : début juin 2026)
- Client ID : 78kcbcs6pe3b46
- Redirect URI : https://ainspiration.eu/api/linkedin/callback

### Admin CRM
- Email : admin@ainspiration.eu
- **Le compte n'a eu aucun mot de passe du 5 avril au 16 septembre 2026.** `init.sql`
  crée l'administrateur **sans** `password_hash` (`ON CONFLICT (email) DO NOTHING`), et
  rien ne lui en posait ensuite. `POST /api/auth/login` répondait donc
  `Account not configured for password login` — aucun mot de passe n'aurait fonctionné,
  et la note « réinitialisé le 5 avril » était fausse.
- **Il n'existe aucune route de réinitialisation** (`routes/auth.js` n'expose que
  `register`, `login`, `logout`, `me`). Pour poser un mot de passe : le hacher dans le
  conteneur et écrire `users.password_hash` directement. Ne jamais faire transiter le mot
  de passe par un chat, un log ou un argument de ligne de commande (visible dans `ps`) —
  le passer par l'entrée standard.
- Mot de passe posé le 16/09/2026, rangé dans 1Password. Jamais noté ici.
