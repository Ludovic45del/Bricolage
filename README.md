# 🛠️ Bricolage - Gestionnaire d'Outils Associatif

Application web fullstack pour gérer une association de prêt d'outils entre membres.

## 📋 Table des Matières

- [Caractéristiques](#caractéristiques)
- [Stack Technique](#stack-technique)
- [Installation Locale](#installation-locale)
- [Déploiement Production](#déploiement-production)
- [Backup & Restauration](#backup--restauration)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)

---

## ✨ Caractéristiques

- 👥 **Gestion des Membres** : Inscriptions, cotisations, statuts
- 🔧 **Inventaire d'Outils** : 250+ outils avec photos, documents, maintenance
- 📅 **Système de Location** : Réservations, approbations, retours
- 💰 **Gestion Financière** : Transactions, dettes, paiements
- 📊 **Rapports** : Statistiques d'usage, financières, maintenance
- 🔐 **Sécurité** : JWT, RBAC (admin/member), rate limiting
- 🐳 **Production-Ready** : Docker, backups automatiques, monitoring

---

## 🚀 Stack Technique

### Backend
- **Framework** : NestJS 11 + TypeScript
- **Base de données** : SQLite (via Prisma ORM)
- **Authentication** : JWT + Passport
- **Validation** : class-validator
- **Documentation** : Swagger/OpenAPI

### Frontend
- **Framework** : React 19 + TypeScript
- **Build Tool** : Vite 6
- **Styling** : Tailwind CSS 4
- **State Management** : React Query + Context API
- **Routing** : React Router 7

### DevOps
- **Containerisation** : Docker + docker-compose
- **Reverse Proxy** : Nginx (frontend)
- **Backup** : Scripts automatisés (SQLite + uploads)

---

## 💻 Installation Locale

### Prérequis

- Node.js 20+ et npm
- Git

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/bricolage.git
cd bricolage
```

### 2. Backend Setup

```bash
cd backend

# Installer les dépendances
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# Générer Prisma Client
npx prisma generate

# Créer la base de données
npx prisma migrate dev

# Peupler avec des données de test
npx prisma db seed

# Démarrer le serveur de développement
npm run start:dev
```

Le backend sera accessible sur `http://localhost:4000`

### 3. Frontend Setup

```bash
cd .. # Retour à la racine

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

### 4. Tester l'application

Utilisateurs de test créés par le seed :

- **Admin** : `admin@bricolage.fr` / `admin123`
- **Membre** : `member@bricolage.fr` / `member123`

---

## 🐳 Déploiement Production

### Option 1 : Docker Compose (Recommandé)

#### 1. Préparer l'environnement

```bash
# Copier le fichier d'environnement
cp .env.production.example .env.production

# Éditer avec vos valeurs
nano .env.production
```

Variables importantes :
```bash
JWT_SECRET=CHANGEZ_CETTE_VALEUR_PAR_UN_SECRET_FORT_32_CHARS_MIN
FRONTEND_URL=http://votre-domaine.com
```

#### 2. Builder et démarrer

```bash
# Builder les images
docker-compose build

# Démarrer en arrière-plan
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

#### 3. Initialiser la base de données

```bash
# Entrer dans le container backend
docker-compose exec backend sh

# Générer Prisma Client
npx prisma generate

# Créer les tables
npx prisma migrate deploy

# (Optionnel) Peupler avec données de test
npx prisma db seed

# Sortir du container
exit
```

#### 4. Vérifier que tout fonctionne

```bash
# Backend
curl http://localhost:4000/api/v1

# Frontend
curl http://localhost

# Health check
docker-compose ps
```

**Pour un guide de déploiement détaillé, voir [DEPLOYMENT.md](DEPLOYMENT.md)**

---

## 💾 Backup & Restauration

### Backup Automatique

#### Configuration Cron

```bash
# Installer la crontab
crontab -e

# Ajouter (adapter les chemins) :
0 2 * * * cd /app/bricolage && ./scripts/backup.sh >> /var/log/bricolage-backup.log 2>&1
```

#### Backup Manuel

```bash
# Depuis la racine du projet
./scripts/backup.sh

# Vérifier les backups
ls -lh backups/
```

Les backups incluent :
- Base de données SQLite (compressée)
- Fichiers uploadés (images, documents)
- Rétention : 30 jours par défaut

### Restauration

#### Lister les backups disponibles

```bash
./scripts/restore.sh
```

#### Restaurer un backup

```bash
# Restaurer le backup du 22 janvier 2025 à 14h
./scripts/restore.sh 20250122_140000

# Redémarrer l'application
docker-compose restart
```

---

## ⚙️ Configuration

### Variables d'Environnement

#### Backend (.env)

```bash
# Database
DATABASE_URL="file:./data/production.db"

# JWT (IMPORTANT : Changez ces valeurs !)
JWT_SECRET="votre-secret-minimum-32-caracteres-aleatoires"
JWT_ACCESS_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="7d"

# Server
PORT=4000
NODE_ENV=production

# CORS
FRONTEND_URL="http://votre-domaine.com"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=5
```

#### Frontend (.env)

```bash
# API URL
VITE_API_URL=http://votre-domaine.com:4000/api/v1
```

### Générer un JWT Secret Sécurisé

```bash
# Option 1 : OpenSSL
openssl rand -base64 32

# Option 2 : Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📖 API Documentation

### Accès Swagger UI

Une fois l'application démarrée :

**Local** : http://localhost:4000/api/docs
**Production** : http://votre-domaine.com:4000/api/docs

### Endpoints Principaux

#### Authentification
```
POST /api/v1/auth/register    - Créer un compte
POST /api/v1/auth/login       - Se connecter
POST /api/v1/auth/refresh     - Rafraîchir le token
```

#### Utilisateurs (Admin)
```
GET    /api/v1/users          - Liste paginée
GET    /api/v1/users/:id      - Détails utilisateur
PATCH  /api/v1/users/:id      - Modifier utilisateur
POST   /api/v1/users/:id/renew - Renouveler cotisation
```

#### Outils
```
GET    /api/v1/tools          - Liste avec filtres
GET    /api/v1/tools/:id      - Détails complet
POST   /api/v1/tools          - Créer (admin)
PATCH  /api/v1/tools/:id      - Modifier (admin)
DELETE /api/v1/tools/:id      - Supprimer (admin)
POST   /api/v1/tools/:id/images - Upload images
POST   /api/v1/tools/:id/conditions - Ajouter maintenance
```

#### Locations
```
GET    /api/v1/rentals        - Liste (filtered by role)
GET    /api/v1/rentals/:id    - Détails + historique
POST   /api/v1/rentals        - Créer réservation
PATCH  /api/v1/rentals/:id    - Modifier statut (admin)
POST   /api/v1/rentals/:id/return - Retourner outil
```

### Rate Limiting

- **Global** : 100 requêtes / 15 minutes
- **Auth (login/register)** : 10 tentatives / 15 minutes

---

## 🔧 Maintenance

### Logs

#### Docker

```bash
# Logs en temps réel
docker-compose logs -f

# Logs backend uniquement
docker-compose logs -f backend

# Logs frontend uniquement
docker-compose logs -f frontend
```

### Health Checks

```bash
# Backend health
curl http://localhost:4000/api/v1

# Docker health status
docker-compose ps
```

### Mise à jour

```bash
# Arrêter l'application
docker-compose down

# Récupérer les changements
git pull

# Rebuild et redémarrer
docker-compose up -d --build

# Appliquer migrations DB si nécessaire
docker-compose exec backend npx prisma migrate deploy
```

---

## 📊 Capacité & Performance

### Configuration Actuelle

L'application est optimisée pour :

- **500 utilisateurs** maximum
- **250 outils** dans l'inventaire
- **10 utilisateurs simultanés**
- **50 requêtes par jour**

### Performance Attendue

| Opération | Temps Moyen |
|-----------|-------------|
| Connexion | 100-200ms |
| Liste outils | 20-50ms |
| Créer location | 50-150ms |
| Upload image | 200-500ms |

### Évolutivité

La stack actuelle peut supporter jusqu'à **20x la charge** prévue sans modification.

Pour plus de détails, voir l'audit architectural complet dans le repository.

---

## 🐛 Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Regénérer Prisma Client
docker-compose exec backend npx prisma generate
```

### Frontend ne charge pas

```bash
# Vérifier que le backend est accessible
curl http://localhost:4000/api/v1

# Rebuild
docker-compose up -d --build frontend
```

### Erreurs CORS

```bash
# Vérifier FRONTEND_URL dans backend/.env
docker-compose exec backend printenv FRONTEND_URL
```

---

## 📄 Licence

MIT License

---

## 👥 Support

Pour toute question ou problème :
- 📧 Email : support@votre-association.fr
- 🐛 Issues : https://github.com/votre-username/bricolage/issues
- 📖 Guide complet : [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Fait avec ❤️ pour la communauté du bricolage**
