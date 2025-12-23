# 🎯 Roadmap vers 10/10 - Bricolage

Guide complet pour transformer votre application en **solution de niveau entreprise**.

---

## 📊 État Actuel vs Objectif

| Critère | Actuel | Objectif | Temps | Priorité |
|---------|--------|----------|-------|----------|
| **Tests & Qualité** | 5/10 | 10/10 | 3-4j | 🔴 P0 |
| **Performance** | 8/10 | 10/10 | 2j | 🔴 P0 |
| **Sécurité** | 8/10 | 10/10 | 3j | 🟡 P1 |
| **Observabilité** | 8/10 | 10/10 | 2j | 🟡 P1 |
| **DevOps** | 8/10 | 10/10 | 2j | 🟡 P1 |
| Architecture | 8.5/10 | 10/10 | 3j | 🟢 P2 |
| Modèle Données | 9/10 | 10/10 | 1j | 🟢 P2 |
| Transactions | 9/10 | 10/10 | 2j | 🟢 P2 |
| Documentation | 7/10 | 10/10 | 1j | 🟢 P3 |
| Métier | 9/10 | 10/10 | 2j | 🟢 P3 |

**Temps total estimé : 3-4 semaines**

---

## 🔴 PHASE 1 : Tests & Qualité (5/10 → 10/10)

**Objectif : Coverage 80%+, Tests E2E complets**
**Temps : 3-4 jours**

### ✅ Déjà Fait

- ✅ Tests E2E Rentals (`backend/test/rentals.e2e-spec.ts`)
- ✅ Tests E2E Auth (`backend/test/auth.e2e-spec.ts`)
- ✅ Configuration Jest avec coverage 80%

### 📝 À Faire

#### 1. Tests E2E Complémentaires

**Créer `backend/test/tools.e2e-spec.ts` :**
```typescript
describe('Tools E2E', () => {
  it('should create tool with images')
  it('should prevent deleting tool with active rentals')
  it('should add maintenance condition')
});
```

**Créer `backend/test/users.e2e-spec.ts` :**
```typescript
describe('Users E2E', () => {
  it('should renew membership and update debt')
  it('should prevent member from modifying others')
  it('should filter by membership status')
});
```

#### 2. Tests Unitaires Services

**Créer `backend/src/modules/rentals/rentals.service.spec.ts` :**
```typescript
import { Test } from '@nestjs/testing';
import { RentalsService } from './rentals.service';
import { PrismaService } from '../../prisma';

describe('RentalsService', () => {
  let service: RentalsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RentalsService,
        {
          provide: PrismaService,
          useValue: {
            rental: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback(prisma)),
          },
        },
      ],
    }).compile();

    service = module.get<RentalsService>(RentalsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should rollback on transaction failure', async () => {
      // Mock transaction failure
      const error = new Error('DB Error');
      jest.spyOn(prisma, '$transaction').mockRejectedValue(error);

      await expect(service.create(validDto, adminUser))
        .rejects.toThrow(error);

      // Verify no partial data was committed
    });

    it('should validate Friday rule', async () => {
      const monday = new Date('2025-01-20'); // A Monday

      await expect(service.create({
        ...validDto,
        startDate: monday.toISOString(),
      }, user)).rejects.toThrow('must be a Friday');
    });
  });
});
```

**Répéter pour chaque service :**
- `tools.service.spec.ts`
- `users.service.spec.ts`
- `transactions.service.spec.ts`
- `categories.service.spec.ts`

#### 3. Lancer les Tests

```bash
# Tests unitaires
cd backend
npm test

# Tests E2E
npm run test:e2e

# Coverage (doit être >= 80%)
npm run test:cov
```

#### 4. CI/CD - Tests Automatiques

Voir Phase 5 pour l'intégration dans GitHub Actions.

---

## 🔴 PHASE 2 : Performance (8/10 → 10/10)

**Objectif : Redis cache, Full-text search, Index composites**
**Temps : 2 jours**

### ✅ Déjà Fait

- ✅ Module Cache créé (`backend/src/cache/cache.module.ts`)
- ✅ Decorator Cacheable créé

### 📝 À Faire

#### 1. Installer Redis

```bash
# Development : Docker Compose
# Ajouter à docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

```bash
# Backend dependencies
cd backend
npm install cache-manager cache-manager-redis-store redis @types/cache-manager
```

#### 2. Configurer le Cache Module

**Modifier `backend/src/app.module.ts` :**
```typescript
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    // ... autres imports
    CacheModule,
  ],
})
export class AppModule {}
```

#### 3. Utiliser le Cache dans les Services

**Exemple : `categories.service.ts` :**
```typescript
import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = 'categories:all';

    // Try cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Fetch from DB
    const categories = await this.prisma.category.findMany({
      include: {
        _count: { select: { tools: true } },
      },
    });

    // Store in cache for 1 hour
    await this.cacheManager.set(cacheKey, categories, { ttl: 3600 });

    return categories;
  }

  async create(dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({ data: dto });

    // Invalidate cache
    await this.cacheManager.del('categories:all');

    return category;
  }
}
```

**Appliquer le cache à :**
- ✅ Categories (ttl: 1h)
- ✅ Tools list par status (ttl: 5min)
- ✅ User stats (ttl: 15min)

#### 4. Index Composites Prisma

**Modifier `backend/prisma/schema.prisma` :**
```prisma
model Tool {
  // ... existing fields

  @@index([status, categoryId], name: "idx_tool_status_category")
  @@index([maintenanceImportance, lastMaintenanceDate], name: "idx_tool_maintenance")
}

model Rental {
  // ... existing fields

  @@index([userId, status], name: "idx_rental_user_status")
  @@index([toolId, status, startDate], name: "idx_rental_tool_availability")
}
```

```bash
# Créer migration
npx prisma migrate dev --name add_composite_indexes
```

#### 5. Full-Text Search (PostgreSQL uniquement)

**Si vous migrez vers PostgreSQL :**

```sql
-- Migration SQL
CREATE INDEX idx_tools_fulltext ON tools
USING gin(to_tsvector('french', title || ' ' || description));
```

```typescript
// tools.service.ts
async search(query: string) {
  return this.prisma.$queryRaw`
    SELECT * FROM tools
    WHERE to_tsvector('french', title || ' ' || description)
    @@ plainto_tsquery('french', ${query})
    ORDER BY ts_rank(
      to_tsvector('french', title || ' ' || description),
      plainto_tsquery('french', ${query})
    ) DESC
    LIMIT 50
  `;
}
```

**Pour SQLite (actuel) - Alternative simple :**
```typescript
// Utiliser LIKE optimisé avec index
const tools = await this.prisma.tool.findMany({
  where: {
    OR: [
      { title: { contains: query } },
      { description: { contains: query } },
    ],
  },
  take: 50,
});
```

#### 6. Tests de Performance

```bash
# Installer Artillery pour load testing
npm install -g artillery

# Créer backend/artillery.yml
artillery quick --count 100 --num 10 http://localhost:4000/api/v1/tools
```

---

## 🟡 PHASE 3 : Sécurité Avancée (8/10 → 10/10)

**Objectif : 2FA, Refresh token rotation, Secrets vault**
**Temps : 3 jours**

### 📝 À Faire

#### 1. Two-Factor Authentication (2FA)

```bash
npm install speakeasy qrcode @types/qrcode
```

**Ajouter au schema Prisma :**
```prisma
model User {
  // ... existing
  twoFactorSecret  String?  @map("two_factor_secret")
  twoFactorEnabled Boolean  @default(false) @map("two_factor_enabled")
}
```

**Créer `backend/src/modules/auth/dto/verify-2fa.dto.ts` :**
```typescript
export class Verify2FADto {
  @IsString()
  @Length(6, 6)
  code: string;
}
```

**Ajouter endpoints dans `auth.controller.ts` :**
```typescript
@Post('2fa/generate')
@UseGuards(JwtAuthGuard)
async generate2FA(@CurrentUser() user: User) {
  const secret = speakeasy.generateSecret({
    name: `Bricolage (${user.email})`,
    length: 32,
  });

  await this.usersService.update(user.id, {
    twoFactorSecret: secret.base32,
  });

  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode, // Scan avec Google Authenticator
  };
}

@Post('2fa/verify')
@UseGuards(JwtAuthGuard)
async verify2FA(@Body() dto: Verify2FADto, @CurrentUser() user: User) {
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: dto.code,
    window: 2, // Allow 2 time steps (60s each)
  });

  if (!verified) {
    throw new BadRequestException('Invalid 2FA code');
  }

  await this.usersService.update(user.id, {
    twoFactorEnabled: true,
  });

  return { success: true };
}

@Post('2fa/disable')
@UseGuards(JwtAuthGuard)
async disable2FA(@Body() dto: Verify2FADto, @CurrentUser() user: User) {
  // Verify code before disabling
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: dto.code,
  });

  if (!verified) {
    throw new BadRequestException('Invalid 2FA code');
  }

  await this.usersService.update(user.id, {
    twoFactorEnabled: false,
    twoFactorSecret: null,
  });

  return { success: true };
}
```

**Modifier le login pour gérer 2FA :**
```typescript
@Post('login')
async login(@Body() dto: LoginDto) {
  const user = await this.authService.validateUser(dto);

  if (user.twoFactorEnabled) {
    // Generate temporary token
    const tempToken = this.jwtService.sign(
      { userId: user.id, type: '2fa_pending' },
      { expiresIn: '5m' }
    );

    return {
      requires2FA: true,
      tempToken,
    };
  }

  return this.authService.login(user);
}

@Post('login/2fa')
async loginWith2FA(@Body() dto: { tempToken: string; code: string }) {
  // Verify temp token
  const payload = this.jwtService.verify(dto.tempToken);

  if (payload.type !== '2fa_pending') {
    throw new UnauthorizedException();
  }

  const user = await this.usersService.findOne(payload.userId);

  // Verify 2FA code
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: dto.code,
  });

  if (!verified) {
    throw new UnauthorizedException('Invalid 2FA code');
  }

  return this.authService.login(user);
}
```

#### 2. Refresh Token Rotation

**Problème actuel :** Refresh tokens ne sont pas invalidés après usage.

**Solution :**

```bash
# Utiliser Redis pour blacklist
npm install ioredis @types/ioredis
```

**Créer `backend/src/redis/redis.module.ts` :**
```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
```

**Modifier `auth.service.ts` :**
```typescript
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';

export class AuthService {
  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async refreshTokens(refreshToken: string) {
    // 1. Check if token is blacklisted
    const isBlacklisted = await this.redis.get(`blacklist:${refreshToken}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // 2. Verify token
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    // 3. Blacklist old refresh token
    await this.redis.setex(
      `blacklist:${refreshToken}`,
      604800, // 7 days (same as refresh token expiry)
      'true',
    );

    // 4. Generate new tokens
    const tokens = await this.generateTokens(payload.userId);

    return tokens;
  }

  async logout(refreshToken: string) {
    // Blacklist refresh token
    await this.redis.setex(
      `blacklist:${refreshToken}`,
      604800,
      'true',
    );
  }
}
```

#### 3. Secrets Management (Production)

**Option 1 : Variables d'environnement chiffrées**

```bash
# Utiliser sops pour chiffrer .env
brew install sops # ou apt-get install sops

# Créer .env.encrypted
sops encrypt .env > .env.encrypted

# Déchiffrer en production
sops decrypt .env.encrypted > .env
```

**Option 2 : HashiCorp Vault (Recommandé pour entreprise)**

```bash
# docker-compose.yml
services:
  vault:
    image: vault:latest
    ports:
      - "8200:8200"
    environment:
      VAULT_DEV_ROOT_TOKEN_ID: ${VAULT_ROOT_TOKEN}
      VAULT_DEV_LISTEN_ADDRESS: 0.0.0.0:8200
    cap_add:
      - IPC_LOCK
```

```bash
npm install node-vault
```

```typescript
// backend/src/vault/vault.service.ts
import * as vault from 'node-vault';

@Injectable()
export class VaultService {
  private vault = vault({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR || 'http://localhost:8200',
    token: process.env.VAULT_TOKEN,
  });

  async getSecret(path: string): Promise<any> {
    const result = await this.vault.read(path);
    return result.data;
  }

  async setSecret(path: string, data: any): Promise<void> {
    await this.vault.write(path, { data });
  }
}
```

**Utilisation :**
```typescript
// main.ts
async function bootstrap() {
  const vaultService = app.get(VaultService);

  const jwtSecret = await vaultService.getSecret('secret/data/jwt');
  process.env.JWT_SECRET = jwtSecret.secret;

  // ... rest
}
```

#### 4. Security Headers Complets

**Modifier `main.ts` :**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
}));
```

#### 5. Audit de Sécurité

```bash
# NPM audit
npm audit --production

# Fix vulnérabilités
npm audit fix

# Snyk (gratuit pour open source)
npm install -g snyk
snyk auth
snyk test
snyk monitor

# OWASP Dependency Check
docker run --rm \
  -v $(pwd):/src \
  owasp/dependency-check:latest \
  --scan /src \
  --format HTML \
  --out /src/dependency-check-report
```

---

## 🟡 PHASE 4 : Observabilité (8/10 → 10/10)

**Objectif : Métriques Prometheus, APM, Alerting**
**Temps : 2 jours**

### 📝 À Faire

#### 1. Métriques Prometheus

```bash
npm install @willsoto/nestjs-prometheus prom-client
```

**Créer `backend/src/metrics/metrics.module.ts` :**
```typescript
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
})
export class MetricsModule {}
```

**Ajouter métriques custom :**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class RentalsService {
  constructor(
    @InjectMetric('rentals_created_total')
    private rentalsCreatedCounter: Counter<string>,

    @InjectMetric('rental_creation_duration_seconds')
    private rentalCreationDuration: Histogram<string>,
  ) {}

  async create(dto: CreateRentalDto) {
    const timer = this.rentalCreationDuration.startTimer();

    try {
      const rental = await this.prisma.$transaction(/* ... */);

      this.rentalsCreatedCounter.inc({ status: 'success' });

      return rental;
    } catch (error) {
      this.rentalsCreatedCounter.inc({ status: 'error' });
      throw error;
    } finally {
      timer();
    }
  }
}
```

**Métriques à tracker :**
- ✅ Nombre total de locations créées
- ✅ Temps de réponse API par endpoint
- ✅ Nombre d'erreurs 4xx/5xx
- ✅ Nombre d'utilisateurs actifs
- ✅ Taux d'utilisation du cache
- ✅ Connexions DB actives

#### 2. Grafana Dashboard

**docker-compose.yml :**
```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  prometheus_data:
  grafana_data:
```

**prometheus.yml :**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'bricolage-backend'
    static_configs:
      - targets: ['backend:4000']
    metrics_path: '/metrics'
```

**Accès :**
- Prometheus : http://localhost:9090
- Grafana : http://localhost:3001 (admin/admin)

**Dashboard Grafana à créer :**
1. Request rate par endpoint
2. Response time percentiles (p50, p95, p99)
3. Error rate
4. Active users
5. Cache hit rate

#### 3. Application Performance Monitoring (APM)

**Option 1 : Sentry (Gratuit jusqu'à 5k events/mois)**

```bash
npm install @sentry/node @sentry/tracing
```

**main.ts :**
```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

**Option 2 : New Relic**

```bash
npm install newrelic
```

**newrelic.js :**
```javascript
exports.config = {
  app_name: ['Bricolage'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  }
};
```

**main.ts :**
```typescript
require('newrelic');
// ... rest
```

#### 4. Structured Logging avec Winston

```bash
npm install winston nest-winston
```

**logger.module.ts :**
```typescript
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    }),
  ],
})
export class LoggerModule {}
```

**Utilisation :**
```typescript
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export class RentalsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger,
  ) {}

  async create(dto: CreateRentalDto) {
    this.logger.info('Creating rental', {
      userId: dto.userId,
      toolId: dto.toolId,
      startDate: dto.startDate,
    });

    // ...
  }
}
```

#### 5. Alerting

**Prometheus Alertmanager :**

**alerts.yml :**
```yaml
groups:
  - name: bricolage
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"

      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "API response time is slow"
```

**Envoyer alertes par email/Slack :**
```yaml
route:
  receiver: 'team-emails'

receivers:
  - name: 'team-emails'
    email_configs:
      - to: 'devops@bricolage.fr'
        from: 'alerts@bricolage.fr'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@bricolage.fr'
        auth_password: '${SMTP_PASSWORD}'
```

---

## 🟡 PHASE 5 : DevOps Avancé (8/10 → 10/10)

**Objectif : CI/CD, Kubernetes, Infrastructure as Code**
**Temps : 2 jours**

### 📝 À Faire

#### 1. CI/CD avec GitHub Actions

**Créer `.github/workflows/ci.yml` :**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: bricolage_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install backend dependencies
        run: |
          cd backend
          npm ci

      - name: Run Prisma migrations
        run: |
          cd backend
          npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bricolage_test

      - name: Run linter
        run: |
          cd backend
          npm run lint

      - name: Run unit tests
        run: |
          cd backend
          npm run test

      - name: Run E2E tests
        run: |
          cd backend
          npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bricolage_test
          JWT_SECRET: test-secret-key-min-32-characters
          REDIS_URL: redis://localhost:6379

      - name: Check test coverage
        run: |
          cd backend
          npm run test:cov

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: backend/coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/bricolage-backend:latest
            ${{ secrets.DOCKER_USERNAME }}/bricolage-backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/bricolage-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/bricolage-frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app/bricolage
            git pull origin main
            docker-compose pull
            docker-compose up -d --no-deps --build
            docker-compose exec -T backend npx prisma migrate deploy

      - name: Verify deployment
        run: |
          sleep 30
          curl -f https://api.bricolage.fr/api/v1 || exit 1

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to production completed!'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

**Secrets GitHub à configurer :**
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `SERVER_IP`
- `SERVER_USER`
- `SSH_PRIVATE_KEY`
- `SLACK_WEBHOOK` (optionnel)

#### 2. Kubernetes (Pour scaling > 1000 users)

**k8s/deployment.yml :**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bricolage-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bricolage-backend
  template:
    metadata:
      labels:
        app: bricolage-backend
    spec:
      containers:
      - name: backend
        image: your-docker-username/bricolage-backend:latest
        ports:
        - containerPort: 4000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: bricolage-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: bricolage-secrets
              key: jwt-secret
        - name: REDIS_URL
          value: redis://redis-service:6379
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: bricolage-backend-service
spec:
  selector:
    app: bricolage-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 4000
  type: LoadBalancer

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bricolage-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bricolage-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**k8s/secrets.yml :**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: bricolage-secrets
type: Opaque
data:
  database-url: <base64-encoded-url>
  jwt-secret: <base64-encoded-secret>
```

```bash
# Encoder les secrets
echo -n "postgresql://..." | base64
echo -n "your-jwt-secret" | base64

# Appliquer
kubectl apply -f k8s/secrets.yml
kubectl apply -f k8s/deployment.yml

# Vérifier
kubectl get pods
kubectl get svc
kubectl logs -f deployment/bricolage-backend
```

#### 3. Infrastructure as Code (Terraform)

**terraform/main.tf :**
```hcl
terraform {
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_kubernetes_cluster" "bricolage" {
  name    = "bricolage-cluster"
  region  = "fra1"
  version = "1.28"

  node_pool {
    name       = "worker-pool"
    size       = "s-2vcpu-4gb"
    auto_scale = true
    min_nodes  = 2
    max_nodes  = 5
  }
}

resource "digitalocean_database_cluster" "postgres" {
  name       = "bricolage-db"
  engine     = "pg"
  version    = "16"
  size       = "db-s-1vcpu-1gb"
  region     = "fra1"
  node_count = 1
}

resource "digitalocean_spaces_bucket" "uploads" {
  name   = "bricolage-uploads"
  region = "fra1"
  acl    = "private"
}

output "cluster_endpoint" {
  value = digitalocean_kubernetes_cluster.bricolage.endpoint
}

output "database_uri" {
  value     = digitalocean_database_cluster.postgres.uri
  sensitive = true
}
```

```bash
# Initialiser
terraform init

# Planifier
terraform plan

# Appliquer
terraform apply

# Détruire (si besoin)
terraform destroy
```

---

## 🟢 PHASE 6 : Architecture Avancée (8.5/10 → 10/10)

**Temps : 3 jours**

### 📝 À Faire

#### 1. Repository Pattern

**Créer `backend/src/common/interfaces/repository.interface.ts` :**
```typescript
export interface IRepository<T> {
  findAll(params?: any): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
}
```

**Créer `backend/src/modules/tools/repositories/tools.repository.ts` :**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { Tool, Prisma } from '@prisma/client';
import { IRepository } from '../../../common/interfaces/repository.interface';

@Injectable()
export class ToolsRepository implements IRepository<Tool> {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ToolWhereInput;
    orderBy?: Prisma.ToolOrderByWithRelationInput;
    include?: Prisma.ToolInclude;
  }): Promise<Tool[]> {
    return this.prisma.tool.findMany(params);
  }

  async findOne(id: string): Promise<Tool | null> {
    return this.prisma.tool.findUnique({ where: { id } });
  }

  async create(data: Prisma.ToolCreateInput): Promise<Tool> {
    return this.prisma.tool.create({ data });
  }

  async update(id: string, data: Prisma.ToolUpdateInput): Promise<Tool> {
    return this.prisma.tool.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tool.delete({ where: { id } });
  }

  // Méthodes custom
  async findByStatus(status: string): Promise<Tool[]> {
    return this.prisma.tool.findMany({
      where: { status },
    });
  }

  async countByCategory(categoryId: string): Promise<number> {
    return this.prisma.tool.count({
      where: { categoryId },
    });
  }
}
```

**Modifier `tools.service.ts` pour utiliser le repository :**
```typescript
@Injectable()
export class ToolsService {
  constructor(
    private toolsRepository: ToolsRepository,
  ) {}

  async findAll(query: ToolsQueryDto) {
    const where: Prisma.ToolWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.toolsRepository.findAll({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          images: true,
        },
      }),
      this.toolsRepository.count({ where }),
    ]);

    return { data, meta: { total, page: query.page, limit: query.limit } };
  }
}
```

**Avantages :**
- ✅ Abstraction de la couche données
- ✅ Facilite les tests (mock du repository)
- ✅ Changement d'ORM facile
- ✅ Logique métier séparée de la persistence

#### 2. CQRS (Command Query Responsibility Segregation) - Optionnel

**Pour applications complexes uniquement**

```bash
npm install @nestjs/cqrs
```

**Créer commands et queries :**
```typescript
// commands/create-tool.command.ts
export class CreateToolCommand {
  constructor(public readonly dto: CreateToolDto) {}
}

// handlers/create-tool.handler.ts
@CommandHandler(CreateToolCommand)
export class CreateToolHandler implements ICommandHandler<CreateToolCommand> {
  constructor(private repository: ToolsRepository) {}

  async execute(command: CreateToolCommand): Promise<Tool> {
    return this.repository.create(command.dto);
  }
}

// queries/get-tool.query.ts
export class GetToolQuery {
  constructor(public readonly id: string) {}
}

// handlers/get-tool.handler.ts
@QueryHandler(GetToolQuery)
export class GetToolHandler implements IQueryHandler<GetToolQuery> {
  constructor(private repository: ToolsRepository) {}

  async execute(query: GetToolQuery): Promise<Tool> {
    return this.repository.findOne(query.id);
  }
}
```

---

## 🟢 PHASE 7 : Fonctionnalités Métier (9/10 → 10/10)

**Temps : 2 jours**

### 📝 À Faire

#### 1. Notifications Email

```bash
npm install @nestjs-modules/mailer nodemailer handlebars
```

**Créer `backend/src/mail/mail.module.ts` :**
```typescript
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
        defaults: {
          from: '"Bricolage" <no-reply@bricolage.fr>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
```

**Créer `backend/src/mail/mail.service.ts` :**
```typescript
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailer: MailerService) {}

  async sendRentalApproved(user: User, rental: Rental) {
    await this.mailer.sendMail({
      to: user.email,
      subject: 'Location approuvée',
      template: './rental-approved',
      context: {
        userName: user.name,
        toolName: rental.tool.title,
        startDate: rental.startDate,
        endDate: rental.endDate,
      },
    });
  }

  async sendMembershipExpiring(user: User) {
    const daysUntilExpiry = Math.ceil(
      (user.membershipExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    await this.mailer.sendMail({
      to: user.email,
      subject: 'Votre cotisation expire bientôt',
      template: './membership-expiring',
      context: {
        userName: user.name,
        daysUntilExpiry,
        renewalUrl: `${process.env.FRONTEND_URL}/renew`,
      },
    });
  }

  async sendToolReturnReminder(user: User, rental: Rental) {
    await this.mailer.sendMail({
      to: user.email,
      subject: 'Rappel : retour d\'outil',
      template: './tool-return-reminder',
      context: {
        userName: user.name,
        toolName: rental.tool.title,
        dueDate: rental.endDate,
      },
    });
  }
}
```

**Templates Handlebars :**

**`backend/src/mail/templates/rental-approved.hbs` :**
```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Location approuvée</title>
</head>
<body>
  <h1>Bonjour {{userName}},</h1>

  <p>Bonne nouvelle ! Votre location a été approuvée.</p>

  <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
    <h2>{{toolName}}</h2>
    <p><strong>Date de début :</strong> {{startDate}}</p>
    <p><strong>Date de fin :</strong> {{endDate}}</p>
  </div>

  <p>Vous pouvez venir récupérer l'outil aux horaires d'ouverture.</p>

  <p>Cordialement,<br>L'équipe Bricolage</p>
</body>
</html>
```

**Intégrer dans `rentals.service.ts` :**
```typescript
import { MailService } from '../mail/mail.service';

export class RentalsService {
  constructor(
    private mailService: MailService,
  ) {}

  async update(id: string, dto: UpdateRentalDto) {
    const updated = await this.prisma.$transaction(/* ... */);

    // Envoyer email si approuvé
    if (dto.status === 'active') {
      await this.mailService.sendRentalApproved(updated.user, updated);
    }

    return updated;
  }
}
```

**Cron job pour rappels :**

```bash
npm install @nestjs/schedule
```

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsScheduler {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendReturnReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rentals = await this.prisma.rental.findMany({
      where: {
        status: 'active',
        endDate: {
          gte: new Date(),
          lt: tomorrow,
        },
      },
      include: { user: true, tool: true },
    });

    for (const rental of rentals) {
      await this.mailService.sendToolReturnReminder(rental.user, rental);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async sendMembershipExpiryReminders() {
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const users = await this.prisma.user.findMany({
      where: {
        membershipExpiry: {
          gt: new Date(),
          lte: in30Days,
        },
      },
    });

    for (const user of users) {
      await this.mailService.sendMembershipExpiring(user);
    }
  }
}
```

#### 2. Exports PDF/CSV

```bash
npm install pdfmake papaparse @types/pdfmake
```

**Créer `backend/src/exports/exports.service.ts` :**
```typescript
import { Injectable } from '@nestjs/common';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { parse as parseCSV } from 'papaparse';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable()
export class ExportsService {
  async generateRentalsPDF(rentals: Rental[]): Promise<Buffer> {
    const docDefinition = {
      content: [
        { text: 'Rapport de Locations', style: 'header' },
        { text: `Généré le ${new Date().toLocaleDateString('fr-FR')}`, style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [
              ['Outil', 'Utilisateur', 'Début', 'Fin', 'Statut'],
              ...rentals.map(r => [
                r.tool.title,
                r.user.name,
                new Date(r.startDate).toLocaleDateString('fr-FR'),
                new Date(r.endDate).toLocaleDateString('fr-FR'),
                r.status,
              ]),
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 12,
          margin: [0, 0, 0, 20],
        },
      },
    };

    return new Promise((resolve, reject) => {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer) => {
        resolve(Buffer.from(buffer));
      });
    });
  }

  async generateRentalsCSV(rentals: Rental[]): Promise<string> {
    const data = rentals.map(r => ({
      'Outil': r.tool.title,
      'Utilisateur': r.user.name,
      'Email': r.user.email,
      'Début': new Date(r.startDate).toLocaleDateString('fr-FR'),
      'Fin': new Date(r.endDate).toLocaleDateString('fr-FR'),
      'Prix': r.totalPrice,
      'Statut': r.status,
    }));

    return parseCSV.unparse(data, {
      delimiter: ';',
      header: true,
    });
  }

  async generateInventoryPDF(tools: Tool[]): Promise<Buffer> {
    const totalValue = tools.reduce((sum, t) => sum + Number(t.purchasePrice || 0), 0);

    const docDefinition = {
      content: [
        { text: 'Inventaire des Outils', style: 'header' },
        { text: `Valeur totale : ${totalValue.toFixed(2)}€`, style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', 'auto', 'auto', 'auto'],
            body: [
              ['Titre', 'Catégorie', 'Prix/semaine', 'Prix achat', 'Statut'],
              ...tools.map(t => [
                t.title,
                t.category?.name || '-',
                `${t.weeklyPrice}€`,
                t.purchasePrice ? `${t.purchasePrice}€` : '-',
                t.status,
              ]),
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          margin: [0, 10, 0, 20],
        },
      },
    };

    return new Promise((resolve) => {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer) => {
        resolve(Buffer.from(buffer));
      });
    });
  }
}
```

**Ajouter endpoints dans `rentals.controller.ts` :**
```typescript
@Get('export/pdf')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async exportPDF(@Res() res: Response) {
  const rentals = await this.rentalsService.findAll({ limit: 1000 });
  const pdf = await this.exportsService.generateRentalsPDF(rentals.data);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=rentals.pdf',
  });

  res.send(pdf);
}

@Get('export/csv')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async exportCSV(@Res() res: Response) {
  const rentals = await this.rentalsService.findAll({ limit: 1000 });
  const csv = await this.exportsService.generateRentalsCSV(rentals.data);

  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename=rentals.csv',
  });

  res.send(csv);
}
```

---

## 📊 RÉSUMÉ & TIMELINE

### Phases Prioritaires (2 semaines)

**Semaine 1 :**
- ✅ Lundi-Mercredi : Tests E2E + Coverage 80% (Phase 1)
- ✅ Jeudi-Vendredi : Redis cache + Métriques (Phase 2 + 4)

**Semaine 2 :**
- ✅ Lundi-Mardi : CI/CD GitHub Actions (Phase 5)
- ✅ Mercredi-Jeudi : 2FA + Sécurité (Phase 3)
- ✅ Vendredi : Notifications email + Exports (Phase 7)

### Résultat Après 2 Semaines

| Critère | Note Finale |
|---------|-------------|
| Tests & Qualité | **10/10** |
| Performance | **10/10** |
| Sécurité | **9/10** (10/10 avec Vault en prod) |
| Observabilité | **10/10** |
| DevOps | **10/10** |

**NOTE GLOBALE : 9.5/10** 🎉

---

## 🎯 CHECKLIST FINALE

### Tests & Qualité ✅
- [ ] Tests E2E (rentals, auth, tools, users)
- [ ] Tests unitaires services (>80% coverage)
- [ ] Coverage >= 80%
- [ ] CI/CD avec tests automatiques

### Performance ✅
- [ ] Redis cache installé et configuré
- [ ] Categories cachées (1h)
- [ ] Tools list cachée (5min)
- [ ] Index composites Prisma
- [ ] Load testing (Artillery)

### Sécurité ✅
- [ ] 2FA implémenté
- [ ] Refresh token rotation
- [ ] Secrets dans variables d'env chiffrées
- [ ] Security headers complets (Helmet)
- [ ] Audit npm/Snyk

### Observabilité ✅
- [ ] Métriques Prometheus
- [ ] Dashboard Grafana
- [ ] APM (Sentry ou New Relic)
- [ ] Structured logging (Winston)
- [ ] Alerting configuré

### DevOps ✅
- [ ] CI/CD GitHub Actions
- [ ] Docker images optimisées
- [ ] Tests automatiques dans CI
- [ ] Deploy automatique

### Métier ✅
- [ ] Notifications email configurées
- [ ] Exports PDF/CSV
- [ ] Cron jobs pour rappels

---

## 💡 CONSEIL FINAL

**Commencez par Phase 1 (Tests)** car c'est la base de tout.
Sans tests, vous ne pouvez pas refactorer en toute confiance.

**Ensuite Phase 2 + 4** (Performance + Observabilité) pour voir les gains en temps réel.

**Puis Phase 5** (CI/CD) pour automatiser le tout.

**Enfin Phases 3 et 7** pour la sécurité avancée et les fonctionnalités métier.

---

**Temps total : 2-4 semaines selon le temps disponible**

**Besoin d'aide pour une phase spécifique ?** Référez-vous à ce document ! 🚀
