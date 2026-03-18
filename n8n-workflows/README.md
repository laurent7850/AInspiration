# Workflows n8n - AInspiration

Ce dossier contient les workflows n8n pour AInspiration.

## Fichiers disponibles

| Fichier | Description | Compatibilité |
|---------|-------------|---------------|
| `newsletter-automation.json` | **Newsletter automatique** - Envoi hebdomadaire jeudi 15h | n8n v1.x |
| `crm-ai-workflow-http.json` | **CRM IA** - Utilise HTTP Request | n8n v1.x, v2.x |
| `crm-ai-workflow.json` | CRM IA - Utilise nœuds LangChain/OpenAI | n8n avec modules AI |
| `crm-ai-simple.json` | CRM IA simplifié | n8n v1.x |
| `crm-ai-fixed.json` | CRM IA avec corrections | n8n v1.x |

---

## Newsletter Automation

**Workflow ID** : `36K717g1IpDdihEQ`
**Statut** : Actif
**Instance** : `https://n8n.srv767464.hstgr.cloud`

### Architecture

Le workflow a 3 chemins d'exécution :

```
1. CRON AUTOMATIQUE (chaque jeudi 15h)
   Chaque Jeudi 15h
    -> Récupérer Abonnés Actifs (Supabase)
    -> Générer Contenu (OpenRouter / Claude 3.5 Sonnet)
    -> Formater Newsletter (Code: markdown->HTML)
    -> Sauvegarder Newsletter (Supabase)
    -> Préparer Emails (Code: 1 email par abonné)
    -> Envoyer Email (Gmail OAuth2)
    -> Logger Envoi (Supabase)
    -> Mettre à jour statut (Supabase)

2. WEBHOOK GENERATE (génération manuelle depuis l'admin)
   POST /webhook/newsletter-generate
    -> Générer Contenu Manuel (OpenRouter)
    -> Formater Manuel
    -> Répondre Generate (JSON: subject + content)

3. WEBHOOK SEND (envoi manuel depuis l'admin)
   POST /webhook/newsletter-send
    -> Préparer Emails Webhook (extrait données du body)
    -> Envoyer Email Webhook (Gmail OAuth2)
    -> Logger Envoi Webhook (Supabase)
    -> Mettre à jour statut Webhook (Supabase)
    -> Répondre Send (JSON: success)
```

### Backend proxy

Le backend Express (`docker/backend/server.js`) forwarde les requêtes du frontend vers n8n :

- `POST /api/webhook/newsletter-send` -> `N8N_BASE/newsletter-send`
- `POST /api/webhook/newsletter-generate` -> `N8N_BASE/newsletter-generate`

Variable d'environnement : `N8N_BASE=https://n8n.srv767464.hstgr.cloud/webhook`

### Contenu IA

Le prompt IA est configuré pour générer des newsletters en accord avec les services AInspiration :
- Audit IA gratuit 24h, Automatisation intelligente, Assistants virtuels IA
- CRM intelligent, Création visuelle IA, Rédaction IA
- Analyse IA avancée, Conseil stratégique IA, Formation IA
- Pack Express Automatisation (1490 EUR HTVA)

Secteurs cibles : restaurants, e-commerce, agences marketing, cabinets conseil, artisans, indépendants, PME 5-50+ employés.

Le prompt varie automatiquement les thèmes chaque semaine et mentionne les services de manière naturelle.

### Template email HTML

- Header avec logo AInspiration
- Conversion automatique markdown vers HTML (titres, listes, gras)
- CTA avec gradient vers l'audit gratuit
- Footer avec coordonnées (Grand Place 50, 7850 Enghien)
- Lien de désinscription personnalisé par abonné (`{{UNSUBSCRIBE_URL}}`)

### Credentials nécessaires

| Credential | Type | Usage |
|-----------|------|-------|
| `Supabase account` | Supabase API | Lecture abonnés, sauvegarde newsletters, logs |
| `OpenRouter account` | OpenRouter API | Génération contenu IA (Claude 3.5 Sonnet) |
| `Gmail account` | Gmail OAuth2 | Envoi des emails (reply-to: info@ainspiration.eu) |

### Dépannage newsletter

| Problème | Solution |
|----------|----------|
| Newsletter pas envoyée le jeudi | Vérifier que le workflow est actif dans n8n |
| Erreur 502 depuis l'admin | Vérifier que n8n est accessible et le workflow actif |
| Emails pas reçus | Vérifier le credential Gmail OAuth2 (expiration token) |
| Contenu vide | Vérifier le credential OpenRouter (solde API) |
| Pas d'abonnés | Vérifier la table `newsletter_subscribers` dans Supabase |

### Historique des corrections (2026-03-18)

- **Backend** : webhooks stub remplacés par de vrais proxies vers n8n
- **Webhook Send** : connecté au pipeline complet d'envoi (avant: renvoyait juste `{ success: true }`)
- **Prompt IA** : mis à jour avec tous les services réels d'AInspiration
- **Template HTML** : amélioré avec conversion markdown et meilleur design
- **Workflow** : activé (`active: true`)

---

## Installation rapide (Version HTTP)

### Étape 1 : Créer le credential HTTP Header Auth

1. Dans n8n, aller dans **Settings > Credentials**
2. Cliquer sur **Add Credential**
3. Chercher **Header Auth**
4. Configurer :
   - **Credential Name**: `OpenRouter API Key`
   - **Name**: `Authorization`
   - **Value**: `Bearer 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`

### Étape 2 : Importer le workflow

1. Dans n8n, aller dans **Workflows**
2. Cliquer sur **Import from File**
3. Sélectionner `crm-ai-workflow-http.json`
4. Le workflow s'ouvre

### Étape 3 : Associer les credentials

1. Double-cliquer sur chaque nœud **OpenRouter ...**
2. Dans **Credential to connect with**, sélectionner `OpenRouter API Key`
3. Sauvegarder chaque nœud

### Étape 4 : Activer le workflow

1. Cliquer sur le toggle en haut à droite pour activer
2. L'URL webhook sera : `https://n8n.srv767464.hstgr.cloud/webhook/crm-ai`

---

## Installation alternative (Version OpenAI/LangChain)

### Étape 1 : Configurer les credentials OpenRouter (format OpenAI)

1. Dans n8n, aller dans **Settings > Credentials**
2. Cliquer sur **Add Credential**
3. Chercher **OpenAI**
4. Configurer :
   - **Credential Name**: `OpenRouter`
   - **API Key**: `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`
   - **Base URL**: `https://openrouter.ai/api/v1`

### Étape 2 : Importer et configurer

1. Importer `crm-ai-workflow.json`
2. Associer le credential `OpenRouter` à chaque nœud IA
3. Activer le workflow

---

## Architecture du workflow

```
Webhook CRM (POST /webhook/crm-ai)
    │
    ▼
Router Actions ─────────────────────────────────────────┐
    │                                                   │
    ├── calculate_lead_score ──► OpenRouter IA ─────────┤
    │                                                   │
    ├── get_ai_insights ──► OpenRouter IA ──────────────┤
    │                                                   │
    ├── get_followup_suggestions ──► OpenRouter IA ─────┤
    │                                                   │
    ├── analyze_opportunity ──► OpenRouter IA ──────────┤
    │                                                   │
    └── track_event ──► Track Event ──► Respond         │
                                                        │
                              Parse Response ◄──────────┘
                                      │
                                      ▼
                              Respond to Webhook
```

## Actions API

### 1. `calculate_lead_score`
Calcule un score de lead (0-100) basé sur engagement, récence, valeur et fit.

```bash
curl -X POST https://n8n.srv767464.hstgr.cloud/webhook/crm-ai \
  -H "Content-Type: application/json" \
  -d '{
    "action": "calculate_lead_score",
    "data": {
      "contact": {
        "id": "123",
        "first_name": "Jean",
        "last_name": "Dupont",
        "email": "jean@example.com",
        "company_name": "Acme Corp"
      },
      "opportunities": [],
      "activities": [],
      "activityCount": 5,
      "totalOpportunityValue": 15000,
      "lastActivityDate": "2026-01-10T10:00:00Z"
    },
    "timestamp": "2026-01-13T12:00:00Z"
  }'
```

**Réponse :**
```json
{
  "contactId": "123",
  "score": 65,
  "factors": {
    "engagement": 20,
    "recency": 15,
    "value": 15,
    "fit": 15
  },
  "recommendation": "Contact prometteur - Envoyer une proposition personnalisée",
  "priority": "warm"
}
```

### 2. `get_ai_insights`
Génère des insights actionnables pour le dashboard.

```bash
curl -X POST https://n8n.srv767464.hstgr.cloud/webhook/crm-ai \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get_ai_insights",
    "data": {
      "opportunities": [...],
      "tasks": [...],
      "contacts": [...],
      "stats": {
        "totalOpportunities": 25,
        "activeOpportunities": 18,
        "pendingTasks": 12,
        "overdueTasks": 3,
        "totalContacts": 150
      }
    },
    "timestamp": "2026-01-13T12:00:00Z"
  }'
```

### 3. `get_followup_suggestions`
Suggère des actions de relance pour les contacts inactifs.

### 4. `analyze_opportunity`
Analyse détaillée d'une opportunité avec recommandations.

### 5. `track_event`
Enregistre un événement CRM (deal won, task completed, etc.)

## Configuration Netlify

Pour la production, ajouter ces variables dans Netlify :

```
VITE_N8N_WEBHOOK_URL=https://n8n.srv767464.hstgr.cloud/webhook/crm-ai
VITE_OPENROUTER_API_KEY=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
```

## Modèles IA

Le workflow utilise **Claude 3 Haiku** (`anthropic/claude-3-haiku`) par défaut :
- Rapide (< 2s)
- Économique (~$0.25/million tokens)
- Suffisant pour les analyses CRM

Alternatives disponibles :
- `anthropic/claude-3-sonnet` - Plus puissant
- `anthropic/claude-3.5-sonnet` - Encore meilleur
- `openai/gpt-4-turbo` - Alternative OpenAI

Pour changer : modifier le champ `model` dans le body JSON de chaque nœud HTTP Request.

## Dépannage

### Erreur 401 Unauthorized
- Vérifier le credential Header Auth
- Le format doit être : `Bearer sk-or-v1-...`

### Erreur "Webhook not found"
- S'assurer que le workflow est **activé** (toggle vert)
- Vérifier l'URL dans le nœud Webhook

### Réponse vide
- Vérifier les logs d'exécution dans n8n
- Le nœud "Parse Response" extrait automatiquement le JSON

### CORS errors
- Les headers CORS sont configurés dans le nœud Respond
- Vérifier que `Access-Control-Allow-Origin: *` est présent

## Support

- Email : support@ainspiration.eu
- Site : https://ainspiration.eu
