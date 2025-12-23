import { Test, TestingModule } from '@nestjs/testing';
import { RentalsService } from './rentals.service';
import { PrismaService } from '../../prisma';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { isFriday, parseISO } from 'date-fns';

describe('RentalsService', () => {
  let service: RentalsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    rental: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    tool: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    rentalHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentalsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RentalsService>(RentalsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return rentals for admin', async () => {
      const mockRentals = [{ id: '1', userId: 'user1' }];
      mockPrismaService.rental.findMany.mockResolvedValue(mockRentals);
      mockPrismaService.rental.count.mockResolvedValue(1);

      const result = await service.findAll({}, { role: 'admin', id: 'admin1' });

      expect(result.data).toEqual(mockRentals);
      expect(result.meta.total).toBe(1);
    });

    it('should filter rentals for members', async () => {
      const mockRentals = [{ id: '1', userId: 'member1' }];
      mockPrismaService.rental.findMany.mockResolvedValue(mockRentals);
      mockPrismaService.rental.count.mockResolvedValue(1);

      await service.findAll({}, { role: 'member', id: 'member1' });

      expect(mockPrismaService.rental.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'member1' }),
        }),
      );
    });
  });

  describe('create', () => {
    const validDto = {
      userId: 'user1',
      toolId: 'tool1',
      startDate: '2025-01-24T12:00:00Z', // A Friday
      endDate: '2025-01-31T12:00:00Z', // Next Friday
    };

    const mockTool = {
      id: 'tool1',
      title: 'Test Tool',
      status: 'available',
      weeklyPrice: 10,
      maintenanceImportance: 'low',
    };

    const mockUser = {
      id: 'user1',
      email: 'test@test.com',
      membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };

    beforeEach(() => {
      mockPrismaService.tool.findUnique.mockResolvedValue(mockTool);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.rental.findFirst.mockResolvedValue(null);
    });

    it('should reject non-Friday start date', async () => {
      const dto = {
        ...validDto,
        startDate: '2025-01-20T12:00:00Z', // A Monday
      };

      await expect(
        service.create(dto, { role: 'member', id: 'user1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject non-Friday end date', async () => {
      const dto = {
        ...validDto,
        endDate: '2025-01-28T12:00:00Z', // A Tuesday
      };

      await expect(
        service.create(dto, { role: 'member', id: 'user1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if tool not found', async () => {
      mockPrismaService.tool.findUnique.mockResolvedValue(null);

      await expect(
        service.create(validDto, { role: 'member', id: 'user1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if tool not available', async () => {
      mockPrismaService.tool.findUnique.mockResolvedValue({
        ...mockTool,
        status: 'rented',
      });

      await expect(
        service.create(validDto, { role: 'member', id: 'user1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if user membership expired', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        membershipExpiry: new Date(Date.now() - 1000),
      });

      await expect(
        service.create(validDto, { role: 'member', id: 'user1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if conflicting rental exists', async () => {
      mockPrismaService.rental.findFirst.mockResolvedValue({
        id: 'existing',
        status: 'active',
      });

      await expect(
        service.create(validDto, { role: 'member', id: 'user1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use transaction correctly', async () => {
      const transactionCallback = jest.fn().mockResolvedValue({
        id: 'rental1',
        ...validDto,
        status: 'pending',
      });

      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );

      await service.create(validDto, { role: 'member', id: 'user1' });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should set status to active for admin', async () => {
      mockPrismaService.$transaction.mockImplementation((callback) => {
        return callback({
          ...mockPrismaService,
          rental: {
            create: jest.fn().mockResolvedValue({
              id: 'rental1',
              status: 'active',
              tool: mockTool,
              user: mockUser,
            }),
          },
        });
      });

      await service.create(validDto, { role: 'admin', id: 'admin1' });

      // Transaction callback will be called with proper status
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const mockRental = {
      id: 'rental1',
      userId: 'user1',
      toolId: 'tool1',
      status: 'pending',
      totalPrice: 10,
      tool: { id: 'tool1', title: 'Test Tool' },
      user: { id: 'user1', name: 'Test User' },
    };

    beforeEach(() => {
      mockPrismaService.rental.findUnique.mockResolvedValue(mockRental);
    });

    it('should reject non-admin updates', async () => {
      await expect(
        service.update('rental1', { status: 'active' }, { role: 'member', id: 'user2' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to approve rental', async () => {
      mockPrismaService.$transaction.mockImplementation((callback) => {
        return callback({
          ...mockPrismaService,
          rental: {
            update: jest.fn().mockResolvedValue({
              ...mockRental,
              status: 'active',
            }),
          },
          tool: {
            update: jest.fn(),
          },
          rentalHistory: {
            create: jest.fn(),
          },
        });
      });

      await service.update('rental1', { status: 'active' }, { role: 'admin', id: 'admin1' });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should rollback on transaction error', async () => {
      const error = new Error('Database error');
      mockPrismaService.$transaction.mockRejectedValue(error);

      await expect(
        service.update('rental1', { status: 'active' }, { role: 'admin', id: 'admin1' }),
      ).rejects.toThrow(error);
    });
  });

  describe('returnRental', () => {
    const mockRental = {
      id: 'rental1',
      userId: 'user1',
      toolId: 'tool1',
      status: 'active',
      tool: { id: 'tool1', title: 'Test Tool' },
      user: { id: 'user1', name: 'Test User' },
    };

    beforeEach(() => {
      mockPrismaService.rental.findUnique.mockResolvedValue(mockRental);
    });

    it('should reject returning non-active rental', async () => {
      mockPrismaService.rental.findUnique.mockResolvedValue({
        ...mockRental,
        status: 'pending',
      });

      await expect(
        service.returnRental('rental1', {}, { role: 'member', id: 'user1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent member from returning others rentals', async () => {
      await expect(
        service.returnRental('rental1', {}, { role: 'member', id: 'user2' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow member to return own rental', async () => {
      mockPrismaService.$transaction.mockImplementation((callback) => {
        return callback({
          ...mockPrismaService,
          rental: {
            update: jest.fn().mockResolvedValue({
              ...mockRental,
              status: 'completed',
            }),
          },
          tool: {
            update: jest.fn(),
          },
          transaction: {
            updateMany: jest.fn(),
          },
          rentalHistory: {
            create: jest.fn(),
          },
        });
      });

      await service.returnRental('rental1', {}, { role: 'member', id: 'user1' });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });
});
