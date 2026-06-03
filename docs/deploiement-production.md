# Guide de Déploiement Complet de BourseFi (Nuxt + PostgreSQL + Prisma + PM2 + Nginx + SSL)

## 1. Objectif

Déployer une application Nuxt en production sur un VPS Linux avec :

* Nom de domaine personnalisé
* PostgreSQL
* Prisma ORM
* PM2 pour la gestion des processus
* Nginx comme reverse proxy
* HTTPS avec Let's Encrypt

### Architecture finale :

```text
Internet
   ↓
boursefi.sn
   ↓
Nginx (ports 80/443)
   ↓
PM2 (gestionnaire de processus)
   ↓
Nuxt (.output/server/index.mjs)
   ↓
Prisma (ORM)
   ↓
PostgreSQL (Base de données)
```

---

## 2. Préparation du VPS

**Connexion SSH :**
```bash
ssh root@IP_DU_VPS
```

**Mise à jour du système :**
```bash
apt update && apt upgrade -y
```

**Installation des outils nécessaires :**
```bash
apt install nginx certbot python3-certbot-nginx git curl unzip -y
```

**Installation de Node.js (via NodeSource) :**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install nodejs -y
```

**Vérification :**
```bash
node -v
npm -v
```

---

## 3. Installation de PostgreSQL

**Installation :**
```bash
apt install postgresql postgresql-contrib -y
```

**Connexion et configuration de la base de données :**
```bash
sudo -u postgres psql
```

**Dans la console PostgreSQL :**
```sql
CREATE DATABASE boursefi;
CREATE USER seynabou WITH PASSWORD 'votre_mot_de_passe_robuste';
GRANT ALL PRIVILEGES ON DATABASE boursefi TO seynabou;
\q
```

---

## 4. Déploiement du projet

**Cloner le projet :**
```bash
cd /var/www
git clone URL_DU_REPO BourseFi
cd BourseFi
```

**Installer les dépendances :**
```bash
npm install
```

**Configurer le fichier `.env` :**
```bash
nano .env
```
Ajoutez la ligne suivante (adaptez le mot de passe) :
```env
DATABASE_URL="postgresql://seynabou:votre_mot_de_passe_robuste@localhost:5432/boursefi"
```

---

## 5. Prisma

**Générer le client :**
```bash
npx prisma generate
```

**Synchroniser le schéma (créer les tables) :**
```bash
npx prisma db push
```

**Importer les données initiales (Seed) :**
```bash
node prisma/seed.mjs
```

> **Résultat attendu :** `Seed catalogue partenaires / ecoles / programmes termine.`

---

## 6. Build Nuxt

**Construire l'application pour la production :**
```bash
npm run build
```

L'application compilée se trouvera dans le dossier `.output/`.

---

## 7. Installation et Configuration de PM2

**Installation globale :**
```bash
npm install -g pm2
```

**Lancement de l'application :**
```bash
pm2 start .output/server/index.mjs --name boursefi
```

**Activation au démarrage du serveur :**
```bash
pm2 save
pm2 startup
```
*(Exécutez la commande générée par `pm2 startup` pour finaliser l'activation)*

**Commandes utiles :**
```bash
pm2 list          # Lister les apps
pm2 logs boursefi # Voir les logs en temps réel
pm2 restart boursefi # Redémarrer
```

---

## 8. Vérification locale

**Tester si Nuxt répond en local (port 3000) :**
```bash
curl http://127.0.0.1:3000
```

**Vérifier que le port est bien en écoute :**
```bash
ss -tulpn | grep 3000
```

---

## 9. Configuration Nginx

**Créer le fichier de configuration :**
```bash
nano /etc/nginx/sites-available/boursefi
```

**Configuration recommandée :**
```nginx
server {
    listen 80;
    server_name boursefi.sn www.boursefi.sn;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Activation du site :**
```bash
ln -s /etc/nginx/sites-available/boursefi /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

## 10. Configuration DNS (Exemple OVH)

Vérifiez vos entrées DNS pour faire pointer le domaine vers l'IP du VPS :

1. **Entrée A** : `@` → `IP_DU_VPS`
2. **Entrée A** : `www` → `IP_DU_VPS`

> [!IMPORTANT]
> **IPv6 (AAAA) :** Pensez à supprimer les anciennes entrées `AAAA` (IPv6) si elles pointent encore vers les serveurs par défaut d'OVH. Cela peut provoquer l'affichage d'une page "Site en construction".

---

## 11. Certificat SSL (HTTPS) avec Let's Encrypt

**Génération du certificat :**
```bash
certbot --nginx -d boursefi.sn -d www.boursefi.sn
```

**Vérification de la redirection HTTPS :**
```bash
curl -I https://boursefi.sn
```

---

## 12. Problèmes rencontrés et Solutions

| Problème | Cause | Solution |
| :--- | :--- | :--- |
| Domaine ne répond pas | Propagation DNS en cours | Utiliser `dig` pour vérifier la résolution. |
| Page "Site en construction" | Anciennes entrées IPv6 (AAAA) | Supprimer les enregistrements AAAA chez l'hébergeur DNS. |
| Erreur Let's Encrypt | IPv6 incorrecte pour ACME | Supprimer l'IPv6 et attendre la propagation. |

---

## 13. Checklist de Maintenance

- [ ] Vérifier le renouvellement auto du certificat : `certbot renew --dry-run`
- [ ] Sauvegardes de la base PostgreSQL : `pg_dump`
- [ ] Monitoring des performances avec `pm2 monit`
- [ ] Mises à jour régulières : `npm update` + `npm run build`

---

**Projet déployé avec succès :** https://boursefi.sn  
**Stack :** Nuxt 4, Prisma, PostgreSQL, PM2, Nginx, Let's Encrypt.
