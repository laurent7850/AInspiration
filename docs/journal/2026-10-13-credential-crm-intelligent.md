---
date: 2026-10-13
projet: AInspiration
ou: Claude Code
type: Décision
notion: non
prochaine-action: Laurent décide si « CRM Intelligent » doit revivre (il faudrait alors une route backend authentifiée et limitée devant le webhook) ou être archivé
---

## Fait

- **Question de Laurent : à quoi sert la clé OpenRouter `n8n-prod` ?** Relu dans l'export des
  42 workflows du conteneur `root-n8n-1` : c'est `$env.OPENROUTER_API_KEY`, lue par
  `Bearer {{ $env.OPENROUTER_API_KEY }}` dans les nœuds HTTP de quatre workflows actifs —
  les trois auto-blogs (AInspiration, Audityo, Distr-Action) et « Publish from AutoSEO » —
  pour la génération FR et les traductions EN/NL. Deux workflows inactifs y font référence
  (AI Speak Pre-Generator, DreamOracle Content Engine). Rien d'autre. Si elle meurt, les
  auto-blogs et la publication AutoSEO s'arrêtent ensemble ; chats et playlists continuent
  sur leurs credentials `OpenRouter-*-Prod`.
- **« CRM Intelligent - AInspiration (HTTP) » (`aGgcACVcaP4XwYnu`) appelait OpenRouter sous
  une credential générique « Header Auth account » (`DM6bbYVPNcmrmU3g`), clé inconnue.**
  À la demande de Laurent, les quatre nœuds HTTP (Lead Score, Insights, Follow-up,
  Analyze) sont passés sur `OpenRouter-AInspiration-Prod` (`A6DhXVagUC4jHDZt`) :
  `authentication: predefinedCredentialType`, `nodeCredentialType: openRouterApi`.
  Publié à la sauvegarde (nouvelle version active), validation sans erreur. L'ancienne
  credential n'est plus référencée par aucun workflow. Un `genericAuthType: httpHeaderAuth`
  résiduel reste dans les paramètres, inerte.

## Cassé

- **Rien par moi, mais ce workflow est mort depuis longtemps, sur deux plans** — constaté en
  voulant prouver le changement par un appel réel :
  1. Le webhook `crm-ai` répond 500 « Unused Respond to Webhook node found in the
     workflow » : le déclencheur n'est pas en `responseMode: responseNode`. L'instantané
     pris avant ma modification montre le même nœud, et la seule exécution en historique
     est mon test.
  2. Le backend Express n'a jamais eu la route `/api/webhook/crm` que
     `src/services/n8nService.ts` appelle (aucun commit de `docker/backend` ne l'a portée).
     LeadScoring, AIInsights et FollowUpSuggestions du tableau de bord CRM échouent donc en
     silence (erreur avalée par `logger.error`) depuis la migration Supabase → VPS.
- **Je ne l'ai pas réparé, volontairement.** Le webhook n8n est public et sans
  authentification : le remettre en état de marche ouvrirait un endpoint LLM gratuit à
  quiconque connaît l'URL (baseline « rate limiting sur tous les endpoints LLM »). Tel
  quel, il échoue avant de dépenser quoi que ce soit.

## Reste

- Décision de Laurent : faire revivre « CRM Intelligent » (alors : `responseNode` sur le
  webhook, une route backend `/api/webhook/crm` derrière `requireAuth` + limiteur, et un
  secret d'en-tête vers n8n) ou l'archiver avec les trois composants du tableau de bord.
  Mémoire : `openrouter-one-key-per-project.md`.
