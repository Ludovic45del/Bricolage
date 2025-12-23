import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma';

describe('Rentals E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let memberToken: string;
  let testToolId: string;
  let testUserId: string;

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

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create admin user
    const adminResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Admin Test',
        email: 'admin-test@test.com',
        badgeNumber: 'ADM001',
        password: 'Password123!',
        role: 'admin',
        membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

    // Login admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        identifier: 'admin-test@test.com',
        password: 'Password123!',
      });

    adminToken = adminLogin.body.tokens.accessToken;

    // Create member user
    const memberResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Member Test',
        email: 'member-test@test.com',
        badgeNumber: 'MEM001',
        password: 'Password123!',
        membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

    testUserId = memberResponse.body.id;

    // Login member
    const memberLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        identifier: 'member-test@test.com',
        password: 'Password123!',
      });

    memberToken = memberLogin.body.tokens.accessToken;

    // Create test category
    const category = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Category',
        description: 'For E2E tests',
      });

    // Create test tool
    const tool = await request(app.getHttpServer())
      .post('/api/v1/tools')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test Drill',
        description: 'For testing rentals',
        categoryId: category.body.id,
        weeklyPrice: 10.0,
        status: 'available',
      });

    testToolId = tool.body.id;
  }

  async function cleanupTestData() {
    await prisma.rental.deleteMany({
      where: { OR: [{ userId: testUserId }] },
    });
    await prisma.tool.deleteMany({ where: { title: 'Test Drill' } });
    await prisma.category.deleteMany({ where: { name: 'Test Category' } });
    await prisma.user.deleteMany({
      where: { email: { in: ['admin-test@test.com', 'member-test@test.com'] } },
    });
  }

  describe('POST /api/v1/rentals', () => {
    it('should create a rental successfully', async () => {
      // Get next Friday
      const nextFriday = getNextFriday();
      const endFriday = getNextFriday(new Date(nextFriday.getTime() + 7 * 24 * 60 * 60 * 1000));

      const response = await request(app.getHttpServer())
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          userId: testUserId,
          toolId: testToolId,
          startDate: nextFriday.toISOString(),
          endDate: endFriday.toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
      expect(response.body.toolId).toBe(testToolId);
      expect(response.body.userId).toBe(testUserId);
    });

    it('should reject non-Friday start date', async () => {
      const monday = new Date();
      monday.setDate(monday.getDate() + ((1 + 7 - monday.getDay()) % 7 || 7));

      await request(app.getHttpServer())
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          userId: testUserId,
          toolId: testToolId,
          startDate: monday.toISOString(),
          endDate: monday.toISOString(),
        })
        .expect(400);
    });

    it('should prevent double booking', async () => {
      const nextFriday = getNextFriday();
      const endFriday = getNextFriday(new Date(nextFriday.getTime() + 7 * 24 * 60 * 60 * 1000));

      // Create first rental
      await request(app.getHttpServer())
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: testUserId,
          toolId: testToolId,
          startDate: nextFriday.toISOString(),
          endDate: endFriday.toISOString(),
        })
        .expect(201);

      // Try to create conflicting rental
      await request(app.getHttpServer())
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          userId: testUserId,
          toolId: testToolId,
          startDate: nextFriday.toISOString(),
          endDate: endFriday.toISOString(),
        })
        .expect(400);
    });

    it('should update user debt on rental creation', async () => {
      const nextFriday = getNextFriday();
      const endFriday = getNextFriday(new Date(nextFriday.getTime() + 7 * 24 * 60 * 60 * 1000));

      // Get user before
      const userBefore = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      const initialDebt = Number(userBefore.totalDebt);

      // Create rental
      const rental = await request(app.getHttpServer())
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          userId: testUserId,
          toolId: testToolId,
          startDate: nextFriday.toISOString(),
          endDate: endFriday.toISOString(),
        })
        .expect(201);

      // Get user after
      const userAfter = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      expect(Number(userAfter.totalDebt)).toBeGreaterThan(initialDebt);
      expect(Number(userAfter.totalDebt)).toBe(initialDebt + Number(rental.body.totalPrice));
    });
  });

  describe('PATCH /api/v1/rentals/:id', () => {
    it('should allow admin to approve rental', async () => {
      const nextFriday = getNextFriday();
      const endFriday = getNextFriday(new Date(nextFriday.getTime() + 7 * 24 * 60 * 60 * 1000));

      // Create rental as member
      const rental = await request(app.getHttpServer())
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          userId: testUserId,
          toolId: testToolId,
          startDate: nextFriday.toISOString(),
          endDate: endFriday.toISOString(),
        })
        .expect(201);

      // Approve as admin
      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/rentals/${rental.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'active',
        })
        .expect(200);

      expect(updated.body.status).toBe('active');

      // Verify tool status changed
      const tool = await prisma.tool.findUnique({
        where: { id: testToolId },
      });
      expect(tool.status).toBe('rented');
    });

    it('should prevent member from updating rental', async () => {
      const nextFriday = getNextFriday();
      const endFriday = getNextFriday(new Date(nextFriday.getTime() + 7 * 24 * 60 * 60 * 1000));

      const rental = await request(app.getHttpServer())
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: testUserId,
          toolId: testToolId,
          startDate: nextFriday.toISOString(),
          endDate: endFriday.toISOString(),
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/rentals/${rental.body.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          status: 'active',
        })
        .expect(403);
    });
  });

  describe('GET /api/v1/rentals', () => {
    it('should return only own rentals for members', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/rentals')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      // All rentals should belong to the member
      response.body.data.forEach((rental) => {
        expect(rental.userId).toBe(testUserId);
      });
    });

    it('should return all rentals for admins', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/rentals')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });
  });
});

// Helper function
function getNextFriday(from: Date = new Date()): Date {
  const date = new Date(from);
  const day = date.getDay();
  const diff = (5 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + diff);
  date.setHours(12, 0, 0, 0);
  return date;
}
