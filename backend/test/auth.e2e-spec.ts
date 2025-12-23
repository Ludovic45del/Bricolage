import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma';

describe('Authentication E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: '@e2e-test.com' } },
    });
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@e2e-test.com',
          badgeNumber: 'TEST001',
          password: 'Password123!',
          membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@e2e-test.com');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'User 1',
          email: 'duplicate@e2e-test.com',
          badgeNumber: 'DUP001',
          password: 'Password123!',
          membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        })
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'User 2',
          email: 'duplicate@e2e-test.com',
          badgeNumber: 'DUP002',
          password: 'Password123!',
          membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        })
        .expect(400);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'incomplete@e2e-test.com',
          // Missing required fields
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeAll(async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Login Test',
          email: 'login@e2e-test.com',
          badgeNumber: 'LOGIN001',
          password: 'Password123!',
          membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
    });

    it('should login with email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          identifier: 'login@e2e-test.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
    });

    it('should login with badge number', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          identifier: 'LOGIN001',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.badgeNumber).toBe('LOGIN001');
    });

    it('should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          identifier: 'login@e2e-test.com',
          password: 'WrongPassword!',
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          identifier: 'nonexistent@e2e-test.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('JWT Token Validation', () => {
    it('should protect routes with JWT', async () => {
      // Try to access protected route without token
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(401);
    });

    it('should reject invalid tokens', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should accept valid tokens', async () => {
      // Register and login
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Token Test',
          email: 'token@e2e-test.com',
          badgeNumber: 'TOK001',
          password: 'Password123!',
          role: 'admin',
          membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });

      const login = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          identifier: 'token@e2e-test.com',
          password: 'Password123!',
        });

      const token = login.body.tokens.accessToken;

      // Access protected route
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login', async () => {
      // Make 11 failed login attempts (limit is 10)
      const promises = Array.from({ length: 11 }, () =>
        request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            identifier: 'ratelimit@e2e-test.com',
            password: 'WrongPassword!',
          }),
      );

      const responses = await Promise.all(promises);

      // Last request should be rate limited
      const rateLimited = responses.some((r) => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});
