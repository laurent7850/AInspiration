#!/bin/bash

# Création des dossiers
echo "Création des dossiers..."
mkdir -p public_html/assets
mkdir -p private/server

# Copie des fichiers de build
echo "Copie des fichiers de build..."
cp -r dist/* public_html/
cp -r dist/assets/* public_html/assets/

# Copie des fichiers serveur
echo "Copie des fichiers serveur..."
cp server/index.js private/server/
cp server/test-db.js private/server/
cp private/server/pm2.config.js private/server/

# Copie des fichiers de configuration
echo "Copie des fichiers de configuration..."
cp .env private/
cp .htaccess public_html/
cp private/.htaccess private/
cp private/.user.ini private/
cp public_html/api/.htaccess public_html/api/

echo "Déploiement terminé!"