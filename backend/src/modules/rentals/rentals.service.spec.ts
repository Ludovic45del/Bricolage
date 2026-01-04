import { Test, TestingModule } from '@nestjs/testing';
import { RentalsService } from './rentals.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
    rental: {
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
    },
    tool: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    rentalHistory: {
        create: jest.fn(),
    },
    transaction: {
        create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

describe('RentalsService', () => {
    let service: RentalsService;
    let prisma: PrismaService;

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

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a rental', async () => {
            const rentalDto = {
                userId: 'user1',
                toolId: 'tool1',
                startDate: '2023-01-06', // Friday
                endDate: '2023-01-13',   // Friday
                totalPrice: 100
            };
            const expectedRental = {
                id: '1',
                ...rentalDto,
                status: 'pending',
                tool: { title: 'Drill' }
            };

            // Mock tool validation
            mockPrismaService.tool.findUnique.mockResolvedValue({ id: 'tool1', status: 'available' });

            // Mock user validation
            mockPrismaService.user.findUnique.mockResolvedValue({
                id: 'user1',
                membershipExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Next year
            });

            // Mock no conflicting rentals
            mockPrismaService.rental.findFirst.mockResolvedValue(null);

            // Mock rental creation
            mockPrismaService.rental.create.mockResolvedValue(expectedRental);

            // Mock updates inside transaction
            mockPrismaService.tool.update.mockResolvedValue({});
            mockPrismaService.user.update.mockResolvedValue({});
            mockPrismaService.transaction.create.mockResolvedValue({});
            mockPrismaService.rentalHistory.create.mockResolvedValue({});

            // Mock transaction execution
            mockPrismaService.$transaction.mockImplementation(async (callback) => {
                return callback(mockPrismaService);
            });

            const currentUser = { id: 'user1', role: 'member' };
            const result = await service.create(rentalDto, currentUser);

            expect(result).toEqual(expectedRental);
            // Verify calls in validation pipeline
            expect(prisma.tool.findUnique).toHaveBeenCalledWith({ where: { id: rentalDto.toolId } });

            // Verify calls inside transaction
            expect(prisma.rental.create).toHaveBeenCalled();
            expect(prisma.tool.update).not.toHaveBeenCalled(); // Member creates pending rental, so tool update (to 'rented') is skipped
            expect(prisma.user.update).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return paginated rentals', async () => {
            const expectedRentals = [{ id: '1', userId: 'user1', toolId: 'tool1' }];
            const query = { page: 1, limit: 10 };
            const currentUser = { id: 'user1', role: 'ADMIN' };

            mockPrismaService.rental.findMany.mockResolvedValue(expectedRentals);
            mockPrismaService.rental.count.mockResolvedValue(1);

            const result = await service.findAll(query, currentUser);

            expect(result.data).toEqual(expectedRentals);
            expect(result.meta.total).toBe(1);
            expect(result.meta.page).toBe(1);
        });
    });
});
