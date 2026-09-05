## Liste de vérification pour le déploiement

### Configuration du serveur
- [ ] Node.js est installé et configuré
- [ ] Les variables d'environnement sont correctement définies
- [ ] Les permissions des dossiers sont correctes
- [ ] Le module mod_rewrite d'Apache est activé

### Base de données
- [ ] La base de données est accessible
- [ ] Les identifiants sont corrects
- [ ] Les tables sont créées
- [ ] Le test de connexion réussit

### Sécurité
- [ ] HTTPS est activé
- [ ] Les en-têtes de sécurité sont configurés
- [ ] Le dossier private est protégé
- [ ] Les fichiers sensibles sont hors de public_html

### Application
- [ ] Le build de production est généré
- [ ] Les assets sont correctement chargés
- [ ] Le routing React fonctionne
- [ ] L'API est accessible

### Performance
- [ ] La compression GZIP est active
- [ ] Le cache est configuré
- [ ] Les images sont optimisées
- [ ] Les fichiers statiques sont mis en cache