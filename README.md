<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  # AssoManager Pro 🚀
  
  **La solution ultime pour la gestion de matériel associatif.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Common](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-10-E0234E.svg)](https://nestjs.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.0-black.svg)](https://www.prisma.io/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC.svg)](https://tailwindcss.com/)

  <p align="center">
    <a href="#-fonnalités">Fonctionnalités</a> •
    <a href="#-installation">Installation</a> •
    <a href="#-identifiants-de-test">Identifiants</a> •
    <a href="#-technologies">Technologies</a>
  </p>
</div>

---

## 🌟 Introduction

**AssoManager Pro** est une application web moderne conçue pour simplifier la gestion des locations de matériel au sein d'une association. Elle offre une interface élégante "Glassmorphism" pour les membres et un tableau de bord puissant pour les administrateurs.

## ✨ Fonctionnalités Clés

- 🛠 **Catalogue interactif** : Consultation et recherche de matériel avec filtres.
- 📅 **Réservations en ligne** : Système de calendrier pour planifier les emprunts.
- 💳 **Gestion Financière** : Suivi des paiements, des dettes et des transactions.
- 📊 **Rapports & Statistiques** : Vues analytiques pour l'administration.
- 🔐 **Rôles & Permissions** : Accès différencié Membre / Administrateur.
- 📱 **Responsive Design** : Accessible sur mobile, tablette et desktop.

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js (v18+)
- PostgreSQL (Docker recommandé)

### 1. Installation des dépendances

```bash
# À la racine du projet (Frontend & Backend)
npm install

# Dans le dossier backend
cd backend
npm install
```

### 2. Configuration de la Base de Données

Assurez-vous d'avoir un fichier `.env` dans le dossier `backend` avec votre `DATABASE_URL`.

```bash
# Dans le dossier backend
# Lancer la base de données via Docker (si applicable)
docker-compose up -d

# Appliquer les migrations et le seed (données de test)
npx prisma migrate dev
npx prisma db seed
```

### 3. Lancer l'Application

Vous devez lancer le backend et le frontend simultanément.

**Backend (Port 4000) :**
```bash
cd backend
npm run start:dev
```

**Frontend (Port 3000) :**
```bash
# À la racine
npm run dev
```

Accédez à l'application sur : [http://localhost:3000](http://localhost:3000)

---

## 🔑 Identifiants de Test

Utilisez ces comptes pour explorer les différentes fonctionnalités de l'application.

| Rôle | Email | Mot de Passe | Description |
| :--- | :--- | :--- | :--- |
| **👑 Administrateur** | `admin@assomanager.fr` | `Admin123!` | Accès complet : gestion membres, stocks, finances, rapports. |
| **👤 Membre** | `membre1@test.fr` | `Member123!` | Accès limité : catalogue, mes locations, mon profil. |
| **👤 Membre (Autre)** | `membre2@test.fr` | `Member123!` | Pour tester les conflits de réservation. |

> **Note :** La base de données est réinitialisée à chaque fois que vous lancez `npx prisma db seed`.

---

## 🛠 Technologies

Ce projet utilise une stack technique moderne et robuste :

- **Frontend** : React, Vite, TailwindCSS, Lucide Icons, Framer Motion.
- **Backend** : NestJS, Prisma ORM, PostgreSQL, Passport (JWT), Helmet.
- **Qualité de Code** : ESLint, Prettier, Husky, Jest (Tests Unitaires).
- **Design** : Approche "Glassmorphism", Dark Mode natif.

---

<div align="center">
  <sub>Fait avec ❤️ par l'équipe AssoManager Pro.</sub>
</div>
