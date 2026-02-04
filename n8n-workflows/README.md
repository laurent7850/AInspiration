# Workflow n8n - CRM Intelligent AInspiration

Ce dossier contient le workflow n8n pour le CRM Intelligent propulsé par l'IA.

## Fichiers disponibles

| Fichier | Description | Compatibilité |
|---------|-------------|---------------|
| `crm-ai-workflow-http.json` | **Recommandé** - Utilise HTTP Request | n8n v1.x, v2.x |
| `crm-ai-workflow.json` | Utilise nœuds LangChain/OpenAI | n8n avec modules AI |

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
