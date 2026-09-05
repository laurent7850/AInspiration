## Instructions de déploiement pour ainspiration.eu

### 1. Préparation

1. Vérifier que tous les fichiers sont présents :
   ```
   public_html/
   ├── index.html
   ├── assets/
   ├── .htaccess
   └── api/
       └── .htaccess

   private/
   ├── .env
   ├── .htaccess
   ├── .user.ini
   └── server/
       ├── index.js
       ├── setup.js
       ├── test-db.js
       └── ecosystem.config.js
   ```

### 2. Configuration du serveur

1. Se connecter au panneau d'hébergement
2. Activer Node.js
3. Configurer PM2 avec ecosystem.config.js
4. Vérifier que mod_rewrite est activé

### 3. Base de données

1. Créer la base de données si nécessaire
2. Exécuter setup.js pour vérifier la structure :
   ```bash
   cd private/server
   node setup.js
   ```
3. Tester la connexion :
   ```bash
   node test-db.js
   ```

### 4. Déploiement

1. Transférer les fichiers via FTP en respectant la structure
2. Vérifier les permissions :
   - public_html : 755 pour les dossiers, 644 pour les fichiers
   - private : 750 pour les dossiers, 640 pour les fichiers
3. Démarrer le serveur Node.js :
   ```bash
   cd private/server
   pm2 start ecosystem.config.js
   ```

### 5. Vérification

1. Tester l'accès HTTPS : https://ainspiration.eu
2. Vérifier l'API : https://ainspiration.eu/api/health
3. Tester la connexion à la base de données via l'interface
4. Vérifier les redirections et le routing

### 6. Maintenance

- Surveiller les logs : `pm2 logs ainspiration-api`
- Redémarrer l'API : `pm2 restart ainspiration-api`
- Mettre à jour : `pm2 reload ecosystem.config.js`

### Support

En cas de problème :
1. Vérifier les logs Node.js
2. Tester la connexion base de données
3. Vérifier les permissions des fichiers
4. Contacter le support de l'hébergeur si nécessaire