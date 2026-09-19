#!/bin/bash
# Script de Mise à Jour Automatique du Serveur BourseFi (Production)
set -e

echo "🚀 [BourseFi] Mise à jour du serveur en cours..."

# 1. Pull la dernière version depuis GitHub
echo "📥 Récupération des modifications Git..."
git pull origin main

# 2. Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# 3. Mettre à jour Prisma
echo "🗄️ Génération du client Prisma et mise à jour BDD..."
npx prisma generate
npx prisma db push

# 4. Build de production Nuxt
echo "🔨 Compilation de l'application (npm run build)..."
npm run build

# 5. Redémarrer PM2
echo "🔄 Redémarrage du processus PM2..."
pm2 restart boursefi || pm2 restart all

echo "✅ [BourseFi] Déploiement terminé avec succès ! Le site est en ligne et à jour."
