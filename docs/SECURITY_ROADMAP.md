# 🔒 Roadmap Sécurité 10/10

## Phase 1 : Authentification 2FA

### Installation
```bash
npm install --save speakeasy qrcode @types/qrcode
```

### Backend - Endpoints 2FA
```typescript
// backend/src/modules/auth/auth.controller.ts
@Post('2fa/generate')
async generate2FA(@CurrentUser() user: User) {
  const secret = speakeasy.generateSecret({ name: 'Bricolage' });
  await this.usersService.update(user.id, {
    twoFactorSecret: secret.base32
  });

  const qrCode = await qrcode.toDataURL(secret.otpauth_url);
  return { qrCode, secret: secret.base32 };
}

@Post('2fa/verify')
async verify2FA(@Body() dto: Verify2FADto, @CurrentUser() user: User) {
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: dto.code
  });

  if (verified) {
    await this.usersService.update(user.id, {
      twoFactorEnabled: true
    });
  }

  return { verified };
}

@Post('login')
async login(@Body() dto: LoginDto) {
  const user = await this.authService.validateUser(dto);

  if (user.twoFactorEnabled) {
    // Envoyer token temporaire, attendre code 2FA
    return { requires2FA: true, tempToken: '...' };
  }

  return this.authService.login(user);
}
```

### Prisma Schema
```prisma
model User {
  // ... existing fields
  twoFactorSecret  String?  @map("two_factor_secret")
  twoFactorEnabled Boolean  @default(false) @map("two_factor_enabled")
}
```

---

## Phase 2 : Refresh Token Rotation

### Implementation
```typescript
// backend/src/modules/auth/auth.service.ts
async refreshTokens(refreshToken: string) {
  // 1. Vérifier le refresh token
  const payload = this.jwtService.verify(refreshToken, {
    secret: process.env.JWT_REFRESH_SECRET
  });

  // 2. Invalider l'ancien refresh token (blacklist Redis)
  await this.redis.set(
    `blacklist:${refreshToken}`,
    'true',
    'EX',
    604800 // 7 jours
  );

  // 3. Générer nouveaux tokens
  const tokens = await this.generateTokens(payload.userId);

  return tokens;
}
```

---

## Phase 3 : Secrets Management (Vault)

### Option 1 : HashiCorp Vault (Production)
```bash
# docker-compose.yml
services:
  vault:
    image: vault:latest
    ports:
      - "8200:8200"
    environment:
      VAULT_DEV_ROOT_TOKEN_ID: myroot
    cap_add:
      - IPC_LOCK
```

```typescript
// backend/src/config/vault.service.ts
import * as vault from 'node-vault';

export class VaultService {
  private vault = vault({
    endpoint: process.env.VAULT_ADDR,
    token: process.env.VAULT_TOKEN
  });

  async getSecret(path: string): Promise<string> {
    const result = await this.vault.read(path);
    return result.data.value;
  }
}

// Usage
const jwtSecret = await this.vaultService.getSecret('secret/jwt');
```

### Option 2 : AWS Secrets Manager (Cloud)
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async getSecret(secretName: string) {
  const client = new SecretsManagerClient({ region: 'eu-west-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  return JSON.parse(response.SecretString);
}
```

---

## Phase 4 : HTTPS Enforcement

### Nginx Configuration
```nginx
# Force HTTPS redirect
server {
    listen 80;
    server_name bricolage.votreasso.fr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bricolage.votreasso.fr;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/bricolage.votreasso.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bricolage.votreasso.fr/privkey.pem;

    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ... rest of config
}
```

### Backend - Force HTTPS
```typescript
// backend/src/main.ts
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## Phase 5 : Security Headers

### Helmet Configuration Complète
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'same-origin' },
  noSniff: true,
  xssFilter: true,
}));
```

---

## Phase 6 : Audit de Sécurité

### 1. Scan de Vulnérabilités
```bash
# NPM Audit
npm audit --production

# Snyk (gratuit pour open source)
npm install -g snyk
snyk test
snyk monitor

# OWASP Dependency Check
docker run --rm -v $(pwd):/src owasp/dependency-check --scan /src
```

### 2. Penetration Testing
- [OWASP ZAP](https://www.zaproxy.org/) pour tests automatisés
- Checklist OWASP Top 10

### 3. Security Checklist
- [ ] 2FA implémenté
- [ ] Refresh token rotation
- [ ] Secrets dans vault
- [ ] HTTPS enforced
- [ ] Security headers configurés
- [ ] Rate limiting strict
- [ ] SQL injection impossible (Prisma ORM)
- [ ] XSS protection (Helmet + sanitization)
- [ ] CSRF protection
- [ ] Audit logging complet

---

## Résultat Attendu : 10/10 Sécurité

**Timeline : 2-3 jours**
**Impact : Application de niveau entreprise**
