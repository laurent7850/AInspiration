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
| `/etudes-de-cas` | CaseStudiesPage | caseStudies |
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
| contactService | `/contacts`, `/contacts/:id`, `/contacts/search`, `/contacts/stats` | ContactList, ContactDetail, ContactForm, DashboardView |
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

---

## Déploiement - Ne pas casser

### Ordre de déploiement frontend

1. `npm run build` (dans AInspiration/)
2. `npx netlify deploy --prod --dir=dist`
3. `docker cp` le dist dans le container (PAS docker restart!)

### Pourquoi pas docker restart ?

Le container télécharge le frontend depuis Netlify au démarrage. Le CDN Netlify peut servir un index.html qui référence des chunks JS pas encore propagés → **erreur 404 sur les assets**. `docker cp` évite ce problème.

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

### Variables d'environnement requises (backend)

- `DATABASE_URL` ou `DB_HOST` + `DB_PORT` + `DB_NAME` + `DB_USER` + `DB_PASSWORD`
- `JWT_SECRET`
- `PORT` (3001)

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
- Mot de passe réinitialisé le 5 avril 2026
