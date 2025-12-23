# Test Complet Frontend - Bricolage App

## 🎯 Objectif
1. Vérifier que CHAQUE fonctionnalité frontend fonctionne correctement
2. Vérifier que CHAQUE appel API est correctement connecté au backend
3. Identifier les bugs, erreurs, et problèmes de connexion
4. Créer des tests automatisés pour chaque composant critique

## 🔍 Problèmes Critiques Identifiés

### ❌ **Problèmes Critiques**

#### 1. **Refresh Token Non Implémenté** 🚨
- **Backend**: Implémente la rotation des refresh tokens
- **Frontend**: Ne stocke que `access_token`, pas de `refreshToken`
- **Impact**: Utilisateur déconnecté après 1h (expiration access token) au lieu de renouvellement automatique
- **Fichiers**: `src/services/api/client.ts:16`, `src/context/AuthContext.tsx:50`

#### 2. **Intercepteur 401 Simpliste** 🚨
- **Comportement actuel**: Redirection immédiate vers `/login` sur 401
- **Attendu**: Tenter refresh token avant déconnexion
- **Fichier**: `src/services/api/client.ts:28-42`

#### 3. **Aucune Intégration des Nouvelles Fonctionnalités** ⚠️
- ❌ Pas d'UI pour exports PDF/CSV
- ❌ Pas d'affichage des notifications email
- ❌ Pas de dashboard metrics/Prometheus
- ❌ Endpoints `/exports/*` et `/metrics` non utilisés

#### 4. **Tests Frontend Inexistants** ⚠️
- **Tests trouvés**: 1 seul (`src/utils.test.ts`)
- **Tests manquants**:
  - Composants (0 tests)
  - Pages (0 tests)
  - Context (0 tests)
  - API Services (0 tests)
  - Intégration (0 tests)

#### 5. **Types Désynchronisés** ⚠️
- Backend a `RefreshToken`, `deletedAt` → Frontend n'a pas ces types
- Nouveaux champs schema Prisma non reflétés dans `src/types/index.ts`

#### 6. **Configuration CORS/URL** 📋
- `VITE_API_URL` par défaut: `http://localhost:4000/api/v1`
- Besoin de vérifier si backend répond sur ce port
- CORS configuré côté backend pour `FRONTEND_URL`

#### 7. **Gestion d'Erreurs Limitée** 📋
- Pas de retry logic
- Pas de feedback utilisateur sur erreurs réseau
- Pas de gestion offline/connexion perdue

---

## 📋 Checklist de Tests

### 1. **Authentification** (CRITIQUE)
- [ ] Login avec email fonctionne
- [ ] Login avec badge number fonctionne
- [ ] Logout fonctionne et nettoie localStorage
- [ ] Token JWT est bien envoyé dans les headers
- [ ] Redirection après login vers dashboard
- [ ] Protection des routes (accès sans token → redirect login)
- [ ] **NOUVEAU**: Refresh token automatique quand access token expire
- [ ] **NOUVEAU**: Gestion du refreshToken dans localStorage
- [ ] Gestion erreur 401 avec tentative de refresh avant logout

**Fichiers à tester**:
- `src/context/AuthContext.tsx`
- `src/pages/LoginPage.tsx`
- `src/services/api/auth.ts`
- `src/services/api/client.ts` (intercepteurs)

**Tests à créer**:
```typescript
// src/context/AuthContext.test.tsx
describe('AuthContext', () => {
  test('login stores access_token and refresh_token');
  test('logout clears all tokens');
  test('auto-refresh on 401 before logout');
  test('isAdmin returns true for admin role');
});

// src/services/api/client.test.ts
describe('API Client Interceptors', () => {
  test('adds Bearer token to requests');
  test('attempts refresh on 401');
  test('redirects to login after failed refresh');
});
```

### 2. **Gestion des Outils (Inventory)**
- [ ] Liste des outils s'affiche correctement
- [ ] Filtres par catégorie fonctionnent
- [ ] Recherche fonctionne
- [ ] Création d'outil (admin seulement)
- [ ] Modification d'outil (admin seulement)
- [ ] Suppression d'outil (vérifier qu'on ne peut pas supprimer outil loué)
- [ ] Upload d'images fonctionne
- [ ] Upload de documents fonctionne
- [ ] Historique de maintenance s'affiche
- [ ] Soft delete : les outils supprimés n'apparaissent plus

**Fichiers à tester**:
- `src/pages/InventoryPage.tsx`
- `src/context/InventoryContext.tsx`
- `src/services/api/tools.service.ts`

**Tests API Backend à vérifier**:
```bash
# Liste des outils
GET /api/v1/tools?page=1&limit=50

# Créer outil (admin only)
POST /api/v1/tools
{
  "title": "Perceuse",
  "categoryId": "cat-id",
  "weeklyPrice": 10.00
}

# Supprimer outil (doit échouer si loué)
DELETE /api/v1/tools/:id
```

### 3. **Gestion des Locations (Rentals)**
- [ ] Liste des locations s'affiche
- [ ] Création de location (membres uniquement vendredis)
- [ ] Validation : erreur si date début ≠ vendredi
- [ ] Validation : erreur si outil déjà loué
- [ ] Validation : erreur si adhésion expirée
- [ ] Approbation de location (admin)
- [ ] Retour de location avec commentaire
- [ ] Historique des locations
- [ ] Calcul automatique du prix total
- [ ] Statuts : pending → active → completed

**Fichiers à tester**:
- `src/pages/RentalsPage.tsx`
- `src/context/RentalsContext.tsx`
- `src/services/api/rentals.service.ts`
- `src/components/features/rentals/components/RentalBookingForm.tsx`

**Scénarios de test critiques**:
```typescript
describe('Rental Validations', () => {
  test('rejects rental if start date is not Friday');
  test('rejects rental if tool already rented for period');
  test('rejects rental if user membership expired');
  test('calculates total price correctly');
  test('only admin can approve rentals');
});
```

### 4. **Gestion des Membres (Users)**
- [ ] Liste des membres s'affiche
- [ ] Création de membre (registration)
- [ ] Modification de membre
- [ ] Renouvellement d'adhésion
- [ ] Gestion de la dette (totalDebt)
- [ ] Filtres par statut (active, suspended, archived)
- [ ] Rôles : admin, member

**Fichiers à tester**:
- `src/pages/MembersPage.tsx`
- `src/context/MembersContext.tsx`
- `src/services/api/users.ts`

### 5. **Finances et Transactions**
- [ ] Liste des transactions s'affiche
- [ ] Création de transaction
- [ ] Types : Rental, MembershipFee, RepairCost, Payment
- [ ] Workflow de validation
- [ ] Calcul des totaux
- [ ] Filtres par date

**Fichiers à tester**:
- `src/pages/FinancePage.tsx`
- `src/context/FinanceContext.tsx`
- `src/services/api/finance.service.ts`

### 6. **Dashboard**
- [ ] Statistiques affichées correctement
- [ ] Graphiques se chargent
- [ ] Données en temps réel

**Fichiers à tester**:
- `src/pages/DashboardPage.tsx`

### 7. **NOUVELLES FONCTIONNALITÉS À INTÉGRER** 🆕

#### 7a. Exports PDF/CSV
**À IMPLÉMENTER** :
```typescript
// src/services/api/exports.service.ts
export const exportsApi = {
  exportRentals: async (format: 'pdf' | 'csv', filters?: ExportFilters) => {
    const response = await apiClient.get(`/exports/rentals`, {
      params: { format, ...filters },
      responseType: 'blob',
    });

    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rentals-${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportTools: async (format: 'pdf' | 'csv') => { /* ... */ },
  exportTransactions: async (format: 'pdf' | 'csv', filters?: ExportFilters) => { /* ... */ }
};
```

**Tests à faire** :
- [ ] Bouton "Exporter PDF" sur page Rentals
- [ ] Bouton "Exporter CSV" sur page Inventory
- [ ] Téléchargement automatique du fichier
- [ ] Filtres date/statut appliqués correctement
- [ ] Admin only (401 si member)

#### 7b. Notifications Email
**À AFFICHER** :
- Toast/notification après registration : "Email de bienvenue envoyé"
- Toast après création rental : "Email de confirmation envoyé"
- Indicateur dans UI si email envoyé

**Tests à faire** :
- [ ] Vérifier logs backend après registration
- [ ] Vérifier logs backend après rental confirmation
- [ ] (Optionnel) Interface admin pour voir historique emails

#### 7c. Métriques Prometheus
**À CRÉER** (optionnel) :
```typescript
// src/pages/MetricsDashboardPage.tsx
// Afficher métriques en temps réel depuis /metrics
```

**Tests à faire** :
- [ ] Endpoint `/metrics` accessible
- [ ] Format Prometheus valide
- [ ] Métriques s'incrémentent correctement

### 8. **Tests d'Intégration Backend**

**Vérifier tous les endpoints** :
```bash
# Authentication
POST   /api/v1/auth/login              ✅ Existe
POST   /api/v1/auth/register           ✅ Existe
POST   /api/v1/auth/refresh            ❓ À vérifier (nouveau)

# Rentals
GET    /api/v1/rentals                 ✅ Existe
POST   /api/v1/rentals                 ✅ Existe
PATCH  /api/v1/rentals/:id             ✅ Existe
POST   /api/v1/rentals/:id/return      ✅ Existe

# Tools
GET    /api/v1/tools                   ✅ Existe
POST   /api/v1/tools                   ✅ Existe
PATCH  /api/v1/tools/:id               ✅ Existe
DELETE /api/v1/tools/:id               ✅ Existe

# Users
GET    /api/v1/users                   ✅ Existe
POST   /api/v1/users                   ✅ Existe
PATCH  /api/v1/users/:id               ✅ Existe

# Exports (NOUVEAUX)
GET    /api/v1/exports/rentals         ❓ À tester
GET    /api/v1/exports/tools           ❓ À tester
GET    /api/v1/exports/transactions    ❓ À tester

# Metrics (NOUVEAU)
GET    /api/v1/metrics                 ❓ À tester
```

**Tests CORS** :
```bash
# Depuis frontend (http://localhost:5173), tester :
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@test.com","password":"password"}'

# Vérifier headers response:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Credentials: true
```

### 9. **Tests Automatisés à Créer**

#### Tests Unitaires
```typescript
// src/utils/validation.test.ts
describe('Validation Utils', () => {
  test('isFriday returns true for Fridays only');
  test('isToolAvailable checks date conflicts');
  test('isMembershipValid checks expiry date');
});

// src/utils/dates.test.ts
describe('Date Utils', () => {
  test('getNextFriday returns correct date');
  test('formatDateForAPI uses ISO format');
});
```

#### Tests de Composants
```typescript
// src/components/features/rentals/components/RentalBookingForm.test.tsx
describe('RentalBookingForm', () => {
  test('renders form fields correctly');
  test('validates Friday start date');
  test('shows error for non-Friday date');
  test('submits form with correct data');
  test('disables submit if tool unavailable');
});
```

#### Tests de Context
```typescript
// src/context/RentalsContext.test.tsx
describe('RentalsContext', () => {
  test('fetchRentals loads data from API');
  test('createRental calls API and updates state');
  test('approveRental only works for admin');
  test('filters rentals by status');
});
```

#### Tests d'Intégration
```typescript
// src/integration/rental-flow.test.tsx
describe('Complete Rental Flow', () => {
  test('member can create rental on Friday');
  test('admin can approve rental');
  test('member can return rental');
  test('rental shows in history after completion');
});
```

---

## 🚀 Actions Prioritaires

### PRIORITÉ 1 (CRITIQUE) 🔥

#### 1. Implémenter Refresh Token Rotation
**Fichier** : `src/services/api/client.ts`
```typescript
// Ajouter queue pour éviter multiple refresh simultanés
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token, logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

        processQueue(null, accessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

**Fichier** : `src/context/AuthContext.tsx`
```typescript
const login = async (identifier: string, password: string): Promise<Member> => {
  const response = await authApi.login({ identifier, password });

  if (!response.tokens || !response.tokens.accessToken) {
    throw new Error('Invalid response from server: Missing tokens');
  }

  // Store BOTH tokens
  localStorage.setItem('access_token', response.tokens.accessToken);
  localStorage.setItem('refresh_token', response.tokens.refreshToken); // ← AJOUTER

  localStorage.setItem('assomanager_user', JSON.stringify(response.user));

  const user = response.user as unknown as Member;
  setCurrentUser(user);
  return user;
};
```

#### 2. Créer Tests Critiques
**Priorité absolue** :
- `src/context/AuthContext.test.tsx`
- `src/services/api/client.test.ts`
- `src/components/features/rentals/components/RentalBookingForm.test.tsx`

### PRIORITÉ 2 (IMPORTANTE) ⚠️

#### 3. Intégrer Exports PDF/CSV
**Créer** : `src/services/api/exports.service.ts` (voir code ci-dessus)

**Modifier** : `src/pages/RentalsPage.tsx`
```typescript
import { exportsApi } from '@/services/api/exports.service';

const handleExport = async (format: 'pdf' | 'csv') => {
  try {
    await exportsApi.exportRentals(format, {
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    toast.success(`Export ${format.toUpperCase()} téléchargé`);
  } catch (error) {
    toast.error('Erreur lors de l\'export');
  }
};

// Dans le JSX
<Button onClick={() => handleExport('pdf')}>📄 Export PDF</Button>
<Button onClick={() => handleExport('csv')}>📊 Export CSV</Button>
```

#### 4. Afficher Notifications Email
**Modifier** : `src/context/AuthContext.tsx`
```typescript
const register = async (data: RegisterDTO) => {
  const response = await authApi.register(data);
  toast.success('Compte créé ! Email de bienvenue envoyé 📧');
  return response;
};
```

### PRIORITÉ 3 (AMÉLIORATION) 📋

#### 5. Synchroniser Types Frontend/Backend
**Modifier** : `src/types/index.ts`
```typescript
export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  badgeNumber: string;
  employer?: string;
  membershipExpiry: string;
  totalDebt: number;
  role: MemberRole;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
  passwordHash?: string;
  deletedAt?: string; // ← AJOUTER (soft delete)
}

export interface RefreshToken { // ← AJOUTER
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  isRevoked: boolean;
  replacedBy?: string;
  createdAt: string;
  revokedAt?: string;
}
```

#### 6. Améliorer Gestion d'Erreurs
**Créer** : `src/utils/errorHandler.ts`
```typescript
export const handleApiError = (error: any) => {
  if (error.response) {
    // Erreur HTTP
    const status = error.response.status;
    const message = error.response.data?.message || 'Une erreur est survenue';

    switch (status) {
      case 400:
        toast.error(`Erreur de validation: ${message}`);
        break;
      case 401:
        toast.error('Session expirée, reconnectez-vous');
        break;
      case 403:
        toast.error('Accès refusé');
        break;
      case 404:
        toast.error('Ressource introuvable');
        break;
      case 500:
        toast.error('Erreur serveur, veuillez réessayer');
        break;
      default:
        toast.error(message);
    }
  } else if (error.request) {
    // Pas de réponse du serveur
    toast.error('Serveur inaccessible, vérifiez votre connexion');
  } else {
    // Erreur autre
    toast.error('Une erreur inattendue est survenue');
  }
};
```

---

## 📊 Critères de Succès

### Tests
- ✅ Couverture de tests > 70%
- ✅ Tous les tests passent
- ✅ Aucune erreur console

### Fonctionnalités
- ✅ Login/Logout fonctionnent
- ✅ Refresh token automatique fonctionne
- ✅ CRUD outils/rentals/membres fonctionnent
- ✅ Validations métier respectées (Friday, double booking, etc.)
- ✅ Exports PDF/CSV fonctionnels
- ✅ Emails envoyés correctement

### Performance
- ✅ Page load < 2s
- ✅ API calls < 500ms
- ✅ Pas de memory leaks

### Sécurité
- ✅ Tokens stockés de manière sécurisée
- ✅ Refresh automatique avant expiration
- ✅ CORS configuré correctement
- ✅ Pas de données sensibles en console

---

## 🔧 Commandes de Test

```bash
# Démarrer le backend (terminal 1)
cd backend
npm run start:dev

# Démarrer le frontend (terminal 2)
npm run dev

# Lancer les tests (terminal 3)
npm test

# Lancer les tests avec coverage
npm run test:coverage

# Build production
npm run build

# Preview build
npm run preview
```

---

## 📝 Rapport de Test Attendu

Après les tests, fournir un rapport avec :

### ✅ Fonctionnalités OK
```
- Login/Logout : ✅
- Liste outils : ✅
- Création rental (Friday validation) : ✅
...
```

### ❌ Bugs Trouvés
```
1. Refresh token non géré → utilisateur déconnecté après 1h
2. Export PDF retourne 404 → endpoint manquant
3. Upload image échoue → CORS issue
...
```

### ⚠️ Fonctionnalités Manquantes
```
1. Exports PDF/CSV non intégrés frontend
2. Dashboard metrics inexistant
3. Tests automatisés absents
...
```

### 🔧 Actions Correctives
```
1. Implémenter refresh token rotation (4h)
2. Créer service exports frontend (2h)
3. Ajouter tests unitaires (8h)
...
```

---

## 🎯 Timeline Suggérée

**Jour 1-2** : Refresh Token + Tests Critiques
**Jour 3** : Exports PDF/CSV + Notifications
**Jour 4-5** : Tests Complets + Corrections Bugs
**Jour 6** : Documentation + Rapport Final

---

**Total estimé** : 6 jours pour tests complets + corrections + implémentations manquantes
