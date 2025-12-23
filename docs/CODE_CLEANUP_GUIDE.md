# Guide de Nettoyage du Code - Bricolage App

## 🎯 Objectif
Nettoyer le code pour éliminer :
- 🗑️ Code mort (dead code)
- 🔄 Duplications et répétitions
- 📦 Dépendances inutilisées
- 🐛 Anti-patterns et code smell
- 📝 Commentaires obsolètes
- 🎨 Inconsistances de style

---

## 📋 Checklist de Nettoyage

### 1. **Code Mort (Dead Code)** 🗑️

#### Identifier le Code Inutilisé
```bash
# Backend - Trouver imports non utilisés
cd backend
npx ts-prune

# Frontend - Trouver imports non utilisés
npx ts-prune

# Trouver fonctions/variables non utilisées
npx eslint . --ext .ts,.tsx --no-eslintrc --plugin unused-imports
```

**À vérifier** :
- [ ] Imports non utilisés
- [ ] Fonctions/méthodes jamais appelées
- [ ] Variables déclarées mais jamais lues
- [ ] Composants React non référencés
- [ ] Routes/endpoints dépréciés
- [ ] Fichiers orphelins (pas d'imports)

**Exemple de code mort à supprimer** :
```typescript
// ❌ AVANT - Import non utilisé
import { useState, useEffect, useMemo } from 'react'; // useMemo jamais utilisé

// ✅ APRÈS
import { useState, useEffect } from 'react';

// ❌ AVANT - Fonction jamais appelée
const calculateOldPrice = (tool: Tool) => {
  return tool.purchasePrice * 0.8; // Jamais utilisée
};

// ✅ APRÈS - Supprimer complètement
```

---

### 2. **Duplications et Répétitions** 🔄

#### Identifier les Duplications
```bash
# Utiliser jscpd pour détecter duplications
npx jscpd backend/src frontend/src --min-lines 5 --min-tokens 50
```

**Patterns de duplication courants** :

#### A. Logique de Validation Dupliquée
```typescript
// ❌ AVANT - Duplication dans RentalsService et RentalsController
// rentals.service.ts
if (new Date(startDate).getDay() !== 5) {
  throw new BadRequestException('Start date must be a Friday');
}

// rentals.controller.ts (validation dupliquée)
if (new Date(dto.startDate).getDay() !== 5) {
  throw new BadRequestException('Start date must be a Friday');
}

// ✅ APRÈS - Créer un utilitaire partagé
// utils/date-validators.ts
export const validateFriday = (date: Date | string) => {
  const d = new Date(date);
  if (d.getDay() !== 5) {
    throw new BadRequestException('Start date must be a Friday');
  }
};

// Utiliser partout
validateFriday(startDate);
```

#### B. Appels API Répétés
```typescript
// ❌ AVANT - Même pattern répété
export const toolsApi = {
  findAll: async () => {
    try {
      const response = await apiClient.get('/tools');
      return response.data;
    } catch (error) {
      console.error('Error fetching tools:', error);
      throw error;
    }
  },

  findOne: async (id: string) => {
    try {
      const response = await apiClient.get(`/tools/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tool:', error);
      throw error;
    }
  },
};

// ✅ APRÈS - Créer helper générique
const apiRequest = async <T>(method: string, url: string, data?: any): Promise<T> => {
  try {
    const response = await apiClient[method](url, data);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${url}:`, error);
    throw error;
  }
};

export const toolsApi = {
  findAll: () => apiRequest('get', '/tools'),
  findOne: (id: string) => apiRequest('get', `/tools/${id}`),
};
```

#### C. Validation Dupliquée
```typescript
// ❌ AVANT - Même validation partout
// rental-form.tsx
if (!startDate || !endDate || !toolId) {
  setError('All fields are required');
  return;
}

// rental-modal.tsx (duplication)
if (!startDate || !endDate || !toolId) {
  toast.error('All fields are required');
  return;
}

// ✅ APRÈS - Créer validator réutilisable
// validators/rental.validator.ts
export const validateRentalData = (data: CreateRentalDTO): ValidationResult => {
  const errors: string[] = [];

  if (!data.startDate) errors.push('Start date is required');
  if (!data.endDate) errors.push('End date is required');
  if (!data.toolId) errors.push('Tool is required');

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Utiliser partout
const validation = validateRentalData(formData);
if (!validation.isValid) {
  toast.error(validation.errors.join(', '));
  return;
}
```

---

### 3. **Dépendances Inutilisées** 📦

#### Analyser les Dépendances
```bash
# Backend
cd backend
npx depcheck

# Frontend (root)
npx depcheck

# Trouver dépendances obsolètes
npm outdated
```

**À vérifier** :
- [ ] Packages dans `package.json` jamais importés
- [ ] DevDependencies en production
- [ ] Versions multiples du même package
- [ ] Dépendances obsolètes

**Exemple** :
```json
// ❌ AVANT - package.json avec dépendances inutilisées
{
  "dependencies": {
    "axios": "^1.13.2",
    "lodash": "^4.17.21",  // ← Jamais utilisé
    "moment": "^2.29.4",   // ← Remplacé par date-fns
    "jquery": "^3.6.0"     // ← WTF, pourquoi jQuery ??
  }
}

// ✅ APRÈS - Nettoyer
{
  "dependencies": {
    "axios": "^1.13.2",
    "date-fns": "^4.1.0"
  }
}
```

---

### 4. **Anti-patterns et Code Smell** 🐛

#### A. God Objects / Classes Trop Grandes
```typescript
// ❌ AVANT - Service avec trop de responsabilités
@Injectable()
export class ToolsService {
  // 50+ méthodes différentes
  async findAll() { }
  async create() { }
  async uploadImage() { }
  async sendEmail() { }           // ← Pas sa responsabilité
  async calculateStatistics() { } // ← Pas sa responsabilité
  async exportPDF() { }           // ← Pas sa responsabilité
}

// ✅ APRÈS - Séparer les responsabilités
@Injectable()
export class ToolsService {
  async findAll() { }
  async create() { }
  async uploadImage() { }
}

@Injectable()
export class ToolsEmailService {
  async sendToolNotification() { }
}

@Injectable()
export class ToolsStatsService {
  async calculateStatistics() { }
}

@Injectable()
export class ToolsExportService {
  async exportPDF() { }
}
```

#### B. Callbacks Hell
```typescript
// ❌ AVANT - Callback hell
fetchUser(userId, (user) => {
  fetchRentals(user.id, (rentals) => {
    fetchTools(rentals[0].toolId, (tool) => {
      updateUI(user, rentals, tool);
    });
  });
});

// ✅ APRÈS - Async/await
const user = await fetchUser(userId);
const rentals = await fetchRentals(user.id);
const tool = await fetchTools(rentals[0].toolId);
updateUI(user, rentals, tool);
```

#### C. Magic Numbers
```typescript
// ❌ AVANT - Magic numbers
if (user.totalDebt > 100) {
  return 'blocked';
}

if (new Date().getDay() === 5) {
  // ...
}

// ✅ APRÈS - Constants explicites
const MAX_DEBT_ALLOWED = 100;
const FRIDAY = 5;

if (user.totalDebt > MAX_DEBT_ALLOWED) {
  return 'blocked';
}

if (new Date().getDay() === FRIDAY) {
  // ...
}
```

#### D. Boolean Flags Excessifs
```typescript
// ❌ AVANT - Trop de flags
function processRental(
  rental: Rental,
  isAdmin: boolean,
  isPending: boolean,
  isLate: boolean,
  sendEmail: boolean,
  updateInventory: boolean
) {
  // Complexité combinatoire : 2^5 = 32 chemins possibles
}

// ✅ APRÈS - Options object
interface ProcessRentalOptions {
  userRole: 'admin' | 'member';
  status: RentalStatus;
  actions: {
    sendEmail?: boolean;
    updateInventory?: boolean;
  };
}

function processRental(rental: Rental, options: ProcessRentalOptions) {
  // Plus lisible et extensible
}
```

#### E. Nested Ternaries
```typescript
// ❌ AVANT - Ternaires imbriqués illisibles
const status = rental.status === 'active'
  ? rental.isLate
    ? 'late'
    : 'on-time'
  : rental.status === 'pending'
    ? 'waiting'
    : 'unknown';

// ✅ APRÈS - If/else ou map
const getStatus = (rental: Rental) => {
  if (rental.status === 'active') {
    return rental.isLate ? 'late' : 'on-time';
  }
  if (rental.status === 'pending') {
    return 'waiting';
  }
  return 'unknown';
};

const status = getStatus(rental);
```

---

### 5. **Commentaires Obsolètes** 📝

#### Identifier Commentaires Inutiles
```typescript
// ❌ AVANT - Commentaires inutiles/obsolètes
// Function to get all tools
export const getAllTools = async () => { // ← Nom explicite, commentaire inutile
  // TODO: Add pagination (← Déjà fait, commentaire obsolète)
  return await toolsApi.findAll();
};

// Old implementation (← Code commenté à supprimer)
// const oldGetTools = () => { ... }

// ✅ APRÈS - Code auto-documenté
export const getAllTools = async (page: number, limit: number) => {
  return await toolsApi.findAll({ page, limit });
};
```

**Types de commentaires à supprimer** :
- [ ] Commentaires évidents (nom = commentaire)
- [ ] TODOs complétés
- [ ] Code commenté (utiliser Git)
- [ ] Commentaires mensongers (code modifié, commentaire pas mis à jour)

---

### 6. **Inconsistances de Style** 🎨

#### A. Nommage Incohérent
```typescript
// ❌ AVANT - Styles mélangés
const user_id = '123';           // snake_case
const UserId = '456';            // PascalCase
const USERID = '789';            // UPPER_CASE
const userId2 = 'abc';           // camelCase avec chiffre

// ✅ APRÈS - Style uniforme (camelCase pour variables)
const userId = '123';
const adminUserId = '456';
const currentUserId = '789';
const temporaryUserId = 'abc';
```

#### B. Imports Désordonnés
```typescript
// ❌ AVANT - Imports non triés
import { Tool } from '@/types';
import React from 'react';
import { apiClient } from './client';
import { useState } from 'react';
import axios from 'axios';

// ✅ APRÈS - Triés par type
// 1. External libraries
import React, { useState } from 'react';
import axios from 'axios';

// 2. Internal services
import { apiClient } from './client';

// 3. Types
import { Tool } from '@/types';
```

#### C. Formatage Inconsistant
```bash
# Utiliser Prettier pour uniformiser
npx prettier --write "src/**/*.{ts,tsx,js,jsx}"
npx prettier --write "backend/src/**/*.{ts,js}"
```

---

### 7. **Structures de Données Inefficaces** 📊

#### A. Boucles Imbriquées Inutiles
```typescript
// ❌ AVANT - O(n²)
const findUserRentals = (userId: string, rentals: Rental[]) => {
  return rentals.filter(rental => {
    return users.find(u => u.id === userId).rentals.includes(rental.id);
  });
};

// ✅ APRÈS - O(n) avec Map
const rentalsByUser = new Map<string, Rental[]>();
rentals.forEach(r => {
  if (!rentalsByUser.has(r.userId)) {
    rentalsByUser.set(r.userId, []);
  }
  rentalsByUser.get(r.userId).push(r);
});

const findUserRentals = (userId: string) => rentalsByUser.get(userId) || [];
```

#### B. Mutations Multiples
```typescript
// ❌ AVANT - Mutations répétées
let tool = getTool();
tool.status = 'rented';
tool.lastRentedAt = new Date();
tool.rentalCount = tool.rentalCount + 1;
tool.availability = false;

// ✅ APRÈS - Mutation unique avec spread
const tool = getTool();
const updatedTool = {
  ...tool,
  status: 'rented',
  lastRentedAt: new Date(),
  rentalCount: tool.rentalCount + 1,
  availability: false,
};
```

---

### 8. **Sécurité et Fuites** 🔒

#### A. Logs Sensibles
```typescript
// ❌ AVANT - Données sensibles en logs
console.log('User logged in:', user); // contient passwordHash
console.log('Payment:', payment);     // contient card number

// ✅ APRÈS - Logs sanitized
console.log('User logged in:', { id: user.id, email: user.email });
console.log('Payment:', { id: payment.id, amount: payment.amount });
```

#### B. Tokens en Dur
```typescript
// ❌ AVANT - Secrets hardcodés
const JWT_SECRET = 'my-super-secret-key';
const API_KEY = 'abc123def456';

// ✅ APRÈS - Variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}
```

---

## 🔧 Outils Recommandés

### Analyse Statique
```bash
# ESLint - Détection problèmes
npx eslint . --ext .ts,.tsx

# TSLint - Types TypeScript
npx tsc --noEmit

# SonarQube - Analyse complète
docker run -d -p 9000:9000 sonarqube
```

### Détection Duplications
```bash
# jscpd - Copy-paste detector
npx jscpd backend/src frontend/src

# PMD CPD
pmd cpd --minimum-tokens 50 --files src/
```

### Dépendances
```bash
# depcheck - Dépendances inutilisées
npx depcheck

# npm-check - Mise à jour dépendances
npx npm-check -u
```

### Formatage
```bash
# Prettier - Formatage uniforme
npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"

# ESLint --fix - Corrections auto
npx eslint . --ext .ts,.tsx --fix
```

---

## 📊 Métriques de Qualité

### Avant Nettoyage
```
Code Coverage: 45%
Duplications: 8.5%
Technical Debt: 12 jours
Code Smells: 127
Bugs: 23
Vulnerabilities: 5
```

### Objectif Après Nettoyage
```
Code Coverage: > 80%
Duplications: < 3%
Technical Debt: < 3 jours
Code Smells: < 30
Bugs: 0
Vulnerabilities: 0
```

---

## 🚀 Plan d'Action

### Phase 1 : Nettoyage Rapide (2-3h)
1. Supprimer imports non utilisés
2. Supprimer code commenté
3. Supprimer TODOs obsolètes
4. Formater avec Prettier

### Phase 2 : Refactoring Moyen (1-2 jours)
5. Éliminer duplications
6. Extraire constantes magiques
7. Simplifier fonctions complexes
8. Uniformiser nommage

### Phase 3 : Refactoring Profond (3-5 jours)
9. Restructurer architecture
10. Séparer responsabilités
11. Optimiser structures données
12. Ajouter tests manquants

---

## ✅ Checklist Finale

### Backend
- [ ] Tous les imports utilisés
- [ ] Aucune duplication > 5 lignes
- [ ] Aucune dépendance inutilisée
- [ ] Tests coverage > 80%
- [ ] Aucun secret hardcodé
- [ ] Logs sanitizés
- [ ] ESLint sans warnings
- [ ] TSC sans erreurs

### Frontend
- [ ] Tous les imports utilisés
- [ ] Aucun composant orphelin
- [ ] Aucune duplication > 5 lignes
- [ ] Tests coverage > 70%
- [ ] Pas de console.log en production
- [ ] Prettier appliqué partout
- [ ] Build sans warnings

### Documentation
- [ ] README à jour
- [ ] API docs générées
- [ ] Commentaires pertinents seulement
- [ ] Guide de contribution

---

## 🎯 Commandes Rapides

```bash
# Nettoyage complet backend
cd backend
npx ts-prune | grep -v 'used in module'
npx depcheck
npx eslint . --ext .ts --fix
npx prettier --write "src/**/*.ts"
npm run test:cov

# Nettoyage complet frontend
cd ..
npx ts-prune | grep -v 'used in module'
npx depcheck
npx eslint . --ext .ts,.tsx --fix
npx prettier --write "src/**/*.{ts,tsx}"
npm run test:coverage

# Rapport qualité
npx jscpd backend/src src/ --reporters html
open html-report/index.html
```

---

**Résultat attendu** : Code propre, maintenable, performant, sans duplication ni code mort.
