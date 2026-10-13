---
date: 2026-10-13
projet: AInspiration
ou: Claude Code
type: Abandon
notion: non
prochaine-action: Dans l'interface n8n, cliquer « Archiver » sur « [ARCHIVÉ 2026-10-13] CRM Intelligent » (seul geste que l'API publique n'offre pas)
---

## Fait

- **Décision de Laurent : archiver « CRM Intelligent » et retirer les trois composants**
  (suite de `2026-10-13-credential-crm-intelligent.md` : webhook en 500 et route backend
  absente, pipeline mort depuis la migration VPS, pas question de rouvrir un endpoint LLM
  public sans authentification).
- **n8n** : workflow `aGgcACVcaP4XwYnu` désactivé et renommé « [ARCHIVÉ 2026-10-13] CRM
  Intelligent - AInspiration (HTTP) ». L'API publique n'expose pas le drapeau d'archivage
  (le `DELETE` de l'API est une suppression définitive, pas un archivage) : le clic
  « Archiver » dans l'interface reste à faire pour le sortir de la liste, rien d'autre.
- **Code** (`8a69b13`) : supprimés `src/components/crm/AIInsights.tsx`, `LeadScoring.tsx`,
  `FollowUpSuggestions.tsx`, `src/services/n8nService.ts` (seul appelant de
  `/api/webhook/crm`) et les quatre exports `n8n-workflows/crm-ai-*.json`.
  `DashboardView.tsx` passe de 545 à 380 lignes : plus d'onglets (il n'en restait qu'un),
  plus de badge cerveau ni de sous-titre « Propulsé par l'Intelligence Artificielle » — le
  tableau de bord ne l'est plus, il ne doit pas le dire. Les trois libellés
  `dashboardView.tabs.*` inutilisés retirés des locales fr/en/nl. `CLAUDE.md` (arbre de
  dépendances, table des services) et `n8n-workflows/README.md` (195 lignes de doc
  d'installation du workflow) mis à jour.
- Typecheck, lint, `check:i18n`, 104 tests : verts. Build, manifeste `33a57ab`, Netlify en
  production, 215/215 fichiers vérifiés sur le CDN, recreate du conteneur (« Frontend: 215
  files downloaded »), contrôle de santé 28/28, CI verte. Chunk `CrmDashboardPage` servi par
  la production relu : aucune trace de « Lead Scoring », « Insights IA », « Propulsé par
  l'Intelligence » ni de `webhook/crm` ; nouveau sous-titre présent.

## Cassé

- Rien.

## Reste

- Un clic dans l'interface n8n : « Archiver » le workflow.
- **Credential « Header Auth account » (`DM6bbYVPNcmrmU3g`) supprimée** dans la foulée, sur
  demande de Laurent, après relecture de l'export des 42 workflows : zéro référence par
  identifiant comme par nom. Sa clé OpenRouter n'a jamais été identifiée ; si une clé de la
  console n'a plus de porteur connu, c'est probablement celle-là.
- `OpenRouter-AInspiration-Prod` ne sert plus que le chat du site et l'Audit IA Pipeline.
