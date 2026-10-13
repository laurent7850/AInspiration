# Workflows n8n - AInspiration

Ce dossier contient les workflows n8n pour AInspiration.

> Les quatre exports `crm-ai-*.json` (CRM Intelligent : scoring, insights, relances) ont été
> retirés le 13/10/2026 avec les composants du tableau de bord qui les appelaient ; le
> workflow n8n `aGgcACVcaP4XwYnu` est désactivé et renommé « [ARCHIVÉ 2026-10-13] ».
> L'historique git garde les fichiers.

## Fichiers disponibles

| Fichier | Description | Compatibilité |
|---------|-------------|---------------|
| `newsletter-automation.json` | **Newsletter automatique** - Envoi hebdomadaire jeudi 15h | n8n v1.x |

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
- Footer avec coordonnées (Chaussée Brunehault 27, 7041 Givry)
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

## Support

- Email : support@ainspiration.eu
- Site : https://ainspiration.eu
