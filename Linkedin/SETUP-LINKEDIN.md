# Configuration LinkedIn Auto-Publishing pour AInspiration

## 1. Creer une application LinkedIn Developer

1. Va sur https://developer.linkedin.com/
2. Connecte-toi avec ton compte LinkedIn (laurent-marechal-3b76a9b)
3. Clique sur **"Create app"**
4. Remplis :
   - **App name** : AInspiration
   - **LinkedIn Page** : Cree ou selectionne une page LinkedIn Company (ou utilise ton profil)
   - **App logo** : Logo AInspiration
   - **Legal agreement** : Accepte
5. Clique **"Create app"**

## 2. Configurer les permissions (Products)

Dans l'onglet **Products** de ton app :
1. Demande l'acces a **"Share on LinkedIn"** (w_member_social)
2. Demande l'acces a **"Sign In with LinkedIn using OpenID Connect"** (openid, profile)
3. Attends la validation (generalement instantanee pour Share on LinkedIn)

## 3. Configurer le Redirect URI

Dans l'onglet **Auth** :
1. Sous **"Authorized redirect URLs for your app"**, ajoute :
   ```
   https://ainspiration.eu/api/linkedin/callback
   ```
2. Sauvegarde

## 4. Recuperer les credentials

Toujours dans l'onglet **Auth** :
- **Client ID** : copie la valeur
- **Client Secret** : clique "Show" et copie la valeur

## 5. Configurer les variables d'environnement sur le VPS

Connecte-toi au VPS Hostinger et configure les variables :

```bash
# Via l'API Hostinger ou en editant le projet Docker Compose :
LINKEDIN_CLIENT_ID=ton_client_id_ici
LINKEDIN_CLIENT_SECRET=ton_client_secret_ici
ENCRYPTION_KEY=une_cle_de_32_caracteres_minimum
```

Pour generer une cle de chiffrement securisee :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0,32))"
```

## 6. Redemarrer le container

Apres avoir configure les variables, redemarre le projet Docker :
- Via l'API Hostinger : delete + create project
- Ou via SSH : `docker compose down && docker compose up -d`

## 7. Connecter LinkedIn

1. Va sur https://ainspiration.eu
2. Connecte-toi en admin
3. Appelle l'API : `GET /api/linkedin/connect`
4. Tu seras redirige vers LinkedIn pour autoriser l'application
5. Apres autorisation, tu reviens sur ainspiration.eu avec `?linkedin_connected=true`
6. Verifie : `GET /api/linkedin/status` → `{ "connected": true, ... }`

## 8. Tester la generation

```bash
# Generer un post manuellement
curl -X POST https://ainspiration.eu/api/linkedin/posts/generate \
  -H "Authorization: Bearer TON_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Voir les posts generes
curl https://ainspiration.eu/api/linkedin/posts \
  -H "Authorization: Bearer TON_JWT_TOKEN"

# Publier un post
curl -X POST https://ainspiration.eu/api/linkedin/posts/POST_ID/publish \
  -H "Authorization: Bearer TON_JWT_TOKEN"
```

## 9. Configurer n8n (publication automatique)

1. Va sur https://n8n.srv767464.hstgr.cloud
2. Importe le workflow : `docker/n8n/linkedin-weekly-post.json`
3. Active le workflow
4. Le post sera genere automatiquement chaque **jeudi a 10h00** (Brussels)

## 10. Activer la publication automatique

Par defaut, les posts sont en mode `review_pending` (approbation manuelle).
Pour activer la publication automatique :

```bash
curl -X PUT https://ainspiration.eu/api/linkedin/settings \
  -H "Authorization: Bearer TON_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "linkedin_config", "value": {"publish_enabled": true, "auto_publish": true, "manual_approval": false}}'
```

---

## API Endpoints Reference

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/linkedin/connect | URL OAuth LinkedIn |
| GET | /api/linkedin/callback | Callback OAuth (redirect) |
| GET | /api/linkedin/status | Statut connexion |
| GET | /api/linkedin/posts | Liste des posts |
| POST | /api/linkedin/posts/generate | Generer un post AI |
| POST | /api/linkedin/posts/:id/publish | Publier un post |
| POST | /api/linkedin/posts/:id/approve | Approuver un post |
| PUT | /api/linkedin/posts/:id | Modifier un post |
| DELETE | /api/linkedin/posts/:id | Supprimer un post |
| GET | /api/linkedin/settings | Config editoriale |
| PUT | /api/linkedin/settings | Modifier config |
| POST | /api/webhook/linkedin-post | Webhook n8n |

## Notes importantes

- Les tokens LinkedIn expirent apres ~60 jours. Il faudra reconnecter.
- Le webhook utilise le meme secret que les autres webhooks : `WEBHOOK_SECRET`
- Les tokens OAuth sont chiffres en AES-256-GCM dans la base de donnees
- La similarite des posts est verifiee sur les 90 derniers jours
