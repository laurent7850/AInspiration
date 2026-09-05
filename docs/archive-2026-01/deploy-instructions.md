## Structure des dossiers sur le serveur FTP

```
public_html/               # Racine publique du site
├── index.html            # Point d'entrée principal
├── assets/              # Fichiers statiques compilés
├── .htaccess            # Configuration Apache
└── api/                 # Point d'entrée de l'API
    └── .htaccess        # Redirection vers Node.js

private/                 # Dossier privé (hors public_html)
├── .htaccess           # Protection du dossier
├── .user.ini           # Configuration PHP
├── .env               # Variables d'environnement
└── server/            # Scripts serveur
    ├── index.js       # Serveur Node.js
    └── test-db.js     # Utilitaire de test DB
```

## Instructions de déploiement

1. Construire l'application :
   ```bash
   npm run build
   ```

2. Transférer via FTP :
   - Tout le contenu du dossier `dist/` vers `public_html/`
   - Le dossier `server/` vers `private/server/`
   - Les fichiers de configuration (.env, .htaccess, etc.) aux emplacements appropriés

3. Sur le serveur :
   - Configurer le service Node.js (via le panneau d'hébergement)
   - Vérifier les permissions des dossiers
   - Tester la connexion à la base de données

4. Points de vérification :
   - HTTPS fonctionne correctement
   - L'API répond sur /api/health
   - Les routes React fonctionnent
   - La base de données est accessible