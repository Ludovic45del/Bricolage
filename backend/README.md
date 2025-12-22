# AssomanagerPro - Backend API

Backend NestJS sécurisé pour l'application de gestion d'association de bricolage.

## 🚀 Installation

```bash
# Install dependencies
npm install

# Setup database (requires PostgreSQL running)
npx prisma generate
npx prisma db push  # or: npx prisma migrate dev

# Seed test data
npx ts-node prisma/seed.ts

# Start development server
npm run start:dev
```

## 📋 Configuration

Copier `.env.example` vers `.env` et configurer :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/assomanager"
JWT_SECRET="your-secret-key-min-32-chars"
FRONTEND_URL="http://localhost:3000"
```

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@assomanager.fr | Admin123! |
| Member | membre@test.fr | Member123! |

## 📡 API Endpoints

Base URL: `http://localhost:4000/api/v1`

### Auth (Public)
- `POST /auth/register` - Create account
- `POST /auth/login` - Authenticate
- `POST /auth/refresh` - Refresh token

### Users (Admin only)
- `GET /users` - List all members
- `GET /users/:id` - Get member details
- `PATCH /users/:id` - Update member
- `POST /users/:id/renew` - Renew membership

### Tools (Protected)
- `GET /tools` - List tools
- `GET /tools/:id` - Tool details
- `POST /tools` - Create tool (Admin)
- `PATCH /tools/:id` - Update tool (Admin)
- `DELETE /tools/:id` - Delete tool (Admin)
- `POST /tools/:id/images` - Upload images (Admin)
- `POST /tools/:id/conditions` - Add maintenance log (Admin)

### Rentals (Protected)
- `GET /rentals` - List rentals
- `GET /rentals/:id` - Rental details
- `POST /rentals` - Create rental
- `PATCH /rentals/:id` - Update status (Admin)

### Transactions (Admin only)
- `GET /transactions` - List transactions
- `POST /transactions` - Create payment

### Categories (Protected)
- `GET /categories` - List categories
- `POST /categories` - Create category (Admin)

## 🔒 Security Features

- ✅ bcrypt password hashing (10 rounds)
- ✅ JWT access/refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Request validation (class-validator)
- ✅ Rate limiting (100 req/15min)
- ✅ Security headers (helmet.js)
- ✅ CORS protection
- ✅ File upload validation

## 📁 Project Structure

```
src/
├── modules/
│   ├── auth/         # JWT authentication
│   ├── users/        # Member management
│   ├── tools/        # Tool CRUD + images
│   ├── rentals/      # Rental management
│   ├── transactions/ # Financial records
│   └── categories/   # Tool categories
├── common/
│   ├── guards/       # JWT & Roles guards
│   └── decorators/   # Custom decorators
├── prisma/           # Database service
└── main.ts           # App entry point
```

## 🧪 Testing

```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

## 📦 Production

```bash
npm run build
npm run start:prod
```
