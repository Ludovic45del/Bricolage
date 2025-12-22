# 🚀 Guide de Déploiement Production - Bricolage

Guide complet pour déployer Bricolage en production sur différentes plateformes.

---

## 📋 Checklist Pré-Déploiement

### ✅ Sécurité

- [ ] Généré un JWT_SECRET fort (32+ caractères aléatoires)
- [ ] Changé tous les mots de passe par défaut
- [ ] Configuré CORS avec l'URL exacte du frontend
- [ ] Vérifié que rate limiting est activé
- [ ] Helmet configuré pour production

### ✅ Configuration

- [ ] Variables d'environnement définies (.env.production)
- [ ] DATABASE_URL configuré
- [ ] FRONTEND_URL configuré
- [ ] Ports appropriés (4000 backend, 80 frontend)

### ✅ Infrastructure

- [ ] Docker et docker-compose installés
- [ ] Backup automatique configuré
- [ ] Monitoring configuré (UptimeRobot minimum)
- [ ] Domaine configuré (optionnel mais recommandé)

---

## 🌐 Option 1 : VPS Hetzner (Recommandé - 4.50€/mois)

### Avantages
- ✅ Prix imbattable (4.50€/mois)
- ✅ Serveurs en Allemagne (RGPD-friendly)
- ✅ Performances excellentes
- ✅ Contrôle total

### 1. Créer le VPS

1. Aller sur [hetzner.com/cloud](https://www.hetzner.com/cloud)
2. Créer un compte
3. "Create Project" → Nom : "Bricolage"
4. "Add Server"
   - **Location** : Nuremberg (Allemagne)
   - **Image** : Ubuntu 22.04
   - **Type** : CX11 (1 vCPU, 2GB RAM) - **4.50€/mois**
   - **Volume** : Aucun (pas nécessaire)
   - **Network** : Par défaut
   - **SSH Key** : Ajouter votre clé publique
   - **Backups** : Activer (+20% = 0.90€/mois) **RECOMMANDÉ**

5. "Create & Buy now"

### 2. Configuration Initiale

```bash
# Se connecter au serveur
ssh root@VOTRE_IP

# Mettre à jour le système
apt update && apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer docker-compose
apt-get install docker-compose-plugin -y

# Installer git et autres outils
apt-get install git curl wget nano htop -y

# Vérifier les installations
docker --version
docker compose version
```

### 3. Déployer l'Application

```bash
# Créer le dossier app
mkdir -p /app
cd /app

# Cloner le projet
git clone https://github.com/VOTRE_USERNAME/bricolage.git
cd bricolage

# Créer les dossiers de données
mkdir -p backend/data backend/uploads backups

# Configuration
cp .env.production.example .env.production
nano .env.production
```

**Éditer .env.production :**
```bash
JWT_SECRET=$(openssl rand -base64 32)  # Générer automatiquement
FRONTEND_URL=http://VOTRE_IP  # Ou votre domaine
```

```bash
# Builder et démarrer
docker compose -f docker-compose.yml --env-file .env.production up -d --build

# Attendre 30 secondes que tout démarre
sleep 30

# Initialiser la base de données
docker compose exec backend sh -c "npx prisma generate && npx prisma migrate deploy && npx prisma db seed"

# Vérifier les logs
docker compose logs -f
```

### 4. Configurer le Firewall

```bash
# Installer UFW
apt-get install ufw -y

# Autoriser SSH (IMPORTANT : avant d'activer !)
ufw allow 22/tcp

# Autoriser HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Autoriser le backend
ufw allow 4000/tcp

# Activer le firewall
ufw enable

# Vérifier
ufw status
```

### 5. Configurer les Backups

```bash
# Rendre le script exécutable
chmod +x /app/bricolage/scripts/backup.sh

# Test manuel
/app/bricolage/scripts/backup.sh

# Vérifier que ça marche
ls -lh /app/bricolage/backups/

# Configurer crontab
crontab -e
```

Ajouter :
```cron
# Backup quotidien à 2h du matin
0 2 * * * cd /app/bricolage && ./scripts/backup.sh >> /var/log/bricolage-backup.log 2>&1

# Nettoyage des vieux logs le lundi à 4h
0 4 * * 1 find /var/log -name "bricolage-*.log" -mtime +30 -delete
```

### 6. (Optionnel) Configurer un Domaine

Si vous avez un domaine (ex: bricolage.votreasso.fr) :

```bash
# Installer Nginx
apt-get install nginx certbot python3-certbot-nginx -y

# Créer config Nginx
nano /etc/nginx/sites-available/bricolage
```

Contenu :
```nginx
server {
    listen 80;
    server_name bricolage.votreasso.fr;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }
}
```

```bash
# Activer le site
ln -s /etc/nginx/sites-available/bricolage /etc/nginx/sites-enabled/

# Tester la config
nginx -t

# Redémarrer Nginx
systemctl restart nginx

# Obtenir certificat SSL (HTTPS)
certbot --nginx -d bricolage.votreasso.fr

# Le renouvellement auto est configuré
```

### 7. Vérification Finale

```bash
# Statut Docker
docker compose ps

# Logs
docker compose logs --tail=50

# Test backend
curl http://localhost:4000/api/v1

# Test frontend
curl http://localhost

# Si domaine configuré
curl https://bricolage.votreasso.fr
```

---

## 🚂 Option 2 : Railway.app (Plus Simple - 5$/mois)

### Avantages
- ✅ Zéro configuration serveur
- ✅ Deploy automatique depuis GitHub
- ✅ HTTPS gratuit
- ✅ Scaling automatique

### Déploiement

1. **Créer compte** sur [railway.app](https://railway.app)

2. **Nouveau projet**
   - "New Project"
   - "Deploy from GitHub repo"
   - Autoriser Railway à accéder à votre repo
   - Sélectionner `bricolage`

3. **Configuration Backend**
   - Railway détecte automatiquement NestJS
   - Aller dans "Variables"
   - Ajouter :
     ```
     NODE_ENV=production
     JWT_SECRET=<générer avec openssl rand -base64 32>
     DATABASE_URL=file:./data/production.db
     PORT=4000
     ```

4. **Configuration Frontend**
   - Railway détecte automatiquement Vite
   - Ajouter variable :
     ```
     VITE_API_URL=https://bricolage-backend.up.railway.app/api/v1
     ```

5. **Initialiser DB**
   - Terminal Railway → Backend
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   ```

6. **Custom Domain (Optionnel)**
   - Settings → Networking → "Generate Domain"
   - Ou connecter votre propre domaine

---

## 🐘 Option 3 : OVH VPS (3.50€/mois HT)

### Configuration similaire à Hetzner

```bash
# Se connecter
ssh ubuntu@VOTRE_IP

# Suivre les mêmes étapes que Hetzner (section 2-7)
```

**Différences :**
- Interface OVH différente
- Serveurs en France (latence légèrement meilleure pour FR)
- Support OVH en français

---

## 📊 Comparaison des Options

| Critère | Hetzner VPS | Railway.app | OVH VPS |
|---------|-------------|-------------|---------|
| **Prix** | 4.50€/mois | 5$/mois (~4.75€) | 3.50€/mois HT |
| **Contrôle** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Simplicité** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | Excellente | Bonne | Bonne |
| **HTTPS** | Manuel (Certbot) | Gratuit inclus | Manuel |
| **Backups** | +0.90€/mois | Inclus | Payant |
| **Location** | 🇩🇪 Allemagne | 🇺🇸 USA | 🇫🇷 France |
| **Support** | Email (EN/DE) | Discord (EN) | Ticket (FR) |

### Recommandation

- **Débutant** → Railway.app (le plus simple)
- **Budget serré + contrôle** → Hetzner VPS
- **Besoin FR + support FR** → OVH VPS

---

## 🔄 Mise à Jour en Production

### Avec Git (Méthode recommandée)

```bash
# Se connecter au serveur
ssh root@VOTRE_IP
cd /app/bricolage

# Sauvegarder avant mise à jour
./scripts/backup.sh

# Récupérer les changements
git pull origin main

# Rebuild et redémarrer
docker compose down
docker compose up -d --build

# Appliquer migrations DB si nécessaire
docker compose exec backend npx prisma migrate deploy

# Vérifier
docker compose logs -f
```

### Avec CI/CD (GitHub Actions)

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app/bricolage
            git pull origin main
            docker compose down
            docker compose up -d --build
            docker compose exec -T backend npx prisma migrate deploy
```

Configurer les secrets GitHub :
- `SERVER_IP` : IP de votre serveur
- `SSH_PRIVATE_KEY` : Votre clé SSH privée

---

## 🔍 Monitoring & Alertes

### UptimeRobot (Gratuit)

1. Créer compte sur [uptimerobot.com](https://uptimerobot.com)
2. "Add New Monitor"
   - **Type** : HTTP(s)
   - **Name** : Bricolage Backend
   - **URL** : `http://VOTRE_IP:4000/api/v1`
   - **Monitoring Interval** : 5 minutes
3. "Create Monitor"
4. Configurer alertes (Email)

### Logs Centralisés (Optionnel)

```bash
# Installer Loki + Promtail (si besoin avancé)
# Voir : https://grafana.com/docs/loki/latest/
```

---

## 🆘 Support & Troubleshooting

### Problèmes Courants

#### 1. Application ne démarre pas
```bash
# Vérifier les logs
docker compose logs backend
docker compose logs frontend

# Vérifier les variables d'environnement
docker compose exec backend printenv

# Regénérer Prisma
docker compose exec backend npx prisma generate
```

#### 2. Erreur 502 Bad Gateway
```bash
# Backend pas démarré, vérifier :
docker compose ps
docker compose restart backend
```

#### 3. Base de données locked
```bash
# Redémarrer le backend
docker compose restart backend
```

#### 4. Espace disque plein
```bash
# Vérifier l'espace
df -h

# Nettoyer Docker
docker system prune -a

# Nettoyer vieux backups
find /app/bricolage/backups -mtime +60 -delete
```

### Obtenir de l'Aide

- 📧 Email : support@votre-asso.fr
- 🐛 GitHub Issues : https://github.com/VOTRE_USERNAME/bricolage/issues
- 💬 Discord : [Lien vers votre serveur Discord]

---

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation Prisma](https://www.prisma.io/docs/)
- [Hetzner Cloud Docs](https://docs.hetzner.com/cloud/)
- [Railway Docs](https://docs.railway.app/)

---

**🎉 Bon déploiement !**
