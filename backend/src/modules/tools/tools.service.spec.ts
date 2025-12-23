import { Test, TestingModule } from '@nestjs/testing';
import { ToolsService } from './tools.service';
import { PrismaService } from '../../prisma';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');

describe('ToolsService', () => {
  let service: ToolsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    tool: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    toolImage: {
      updateMany: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    toolCondition: {
      create: jest.fn(),
    },
    rental: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ToolsService>(ToolsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const mockTools = [
      {
        id: 'tool1',
        title: 'Test Tool',
        category: { id: 'cat1', name: 'Test Category' },
        images: [],
        documents: [],
        conditions: [],
      },
    ];

    beforeEach(() => {
      mockPrismaService.tool.findMany.mockResolvedValue(mockTools);
      mockPrismaService.tool.count.mockResolvedValue(1);
    });

    it('should return paginated tools', async () => {
      const result = await service.findAll({ page: 1, limit: 50 });

      expect(result.data).toEqual(mockTools);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by search term', async () => {
      await service.findAll({ search: 'drill' });

      expect(mockPrismaService.tool.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'drill' } },
              { description: { contains: 'drill' } },
            ],
          }),
        }),
      );
    });

    it('should filter by categoryId', async () => {
      await service.findAll({ categoryId: 'cat1' });

      expect(mockPrismaService.tool.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 'cat1' }),
        }),
      );
    });

    it('should filter by status', async () => {
      await service.findAll({ status: 'available' });

      expect(mockPrismaService.tool.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'available' }),
        }),
      );
    });

    it('should filter maintenance alerts', async () => {
      await service.findAll({ maintenanceAlert: true });

      expect(mockPrismaService.tool.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      await service.findAll({ page: 2, limit: 10 });

      expect(mockPrismaService.tool.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    const mockTool = {
      id: 'tool1',
      title: 'Test Tool',
      category: { id: 'cat1', name: 'Test' },
      images: [],
      documents: [],
      conditions: [],
    };

    it('should return tool by id', async () => {
      mockPrismaService.tool.findUnique.mockResolvedValue(mockTool);

      const result = await service.findOne('tool1');

      expect(result).toEqual(mockTool);
      expect(mockPrismaService.tool.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tool1' },
          include: expect.any(Object),
        }),
      );
    });

    it('should throw NotFoundException if tool not found', async () => {
      mockPrismaService.tool.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      title: 'New Tool',
      description: 'Test description',
      categoryId: 'cat1',
      weeklyPrice: 10,
      purchasePrice: 100,
      purchaseDate: '2025-01-01',
      maintenanceImportance: 'medium' as const,
      maintenanceInterval: 30,
    };

    const createdTool = {
      id: 'new-tool',
      ...createDto,
      status: 'available',
      category: { id: 'cat1', name: 'Test' },
      images: [],
    };

    it('should create tool with default status available', async () => {
      mockPrismaService.tool.create.mockResolvedValue(createdTool);

      const result = await service.create(createDto);

      expect(result).toEqual(createdTool);
      expect(mockPrismaService.tool.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'available',
            title: 'New Tool',
          }),
        }),
      );
    });

    it('should set default maintenanceImportance to low', async () => {
      const dto = { ...createDto };
      delete dto.maintenanceImportance;
      mockPrismaService.tool.create.mockResolvedValue(createdTool);

      await service.create(dto);

      expect(mockPrismaService.tool.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            maintenanceImportance: 'low',
          }),
        }),
      );
    });

    it('should handle purchaseDate conversion', async () => {
      mockPrismaService.tool.create.mockResolvedValue(createdTool);

      await service.create(createDto);

      expect(mockPrismaService.tool.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            purchaseDate: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('update', () => {
    const mockTool = {
      id: 'tool1',
      title: 'Test Tool',
      category: { id: 'cat1' },
      images: [],
      documents: [],
      conditions: [],
    };

    beforeEach(() => {
      mockPrismaService.tool.findUnique.mockResolvedValue(mockTool);
    });

    it('should update tool successfully', async () => {
      const updateDto = { title: 'Updated Tool' };
      mockPrismaService.tool.update.mockResolvedValue({
        ...mockTool,
        ...updateDto,
      });

      const result = await service.update('tool1', updateDto);

      expect(result.title).toBe('Updated Tool');
      expect(mockPrismaService.tool.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tool1' },
          data: updateDto,
        }),
      );
    });

    it('should throw NotFoundException if tool does not exist', async () => {
      mockPrismaService.tool.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid', {})).rejects.toThrow(NotFoundException);
    });

    it('should handle lastMaintenanceDate conversion', async () => {
      const updateDto = { lastMaintenanceDate: '2025-01-20' };
      mockPrismaService.tool.update.mockResolvedValue(mockTool);

      await service.update('tool1', updateDto);

      expect(mockPrismaService.tool.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lastMaintenanceDate: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    const mockTool = {
      id: 'tool1',
      title: 'Test Tool',
      images: [{ id: 'img1', filePath: '/uploads/test.jpg' }],
      documents: [{ id: 'doc1', filePath: '/uploads/test.pdf' }],
      category: { id: 'cat1' },
      conditions: [],
    };

    beforeEach(() => {
      mockPrismaService.tool.findUnique.mockResolvedValue(mockTool);
      mockPrismaService.rental.findFirst.mockResolvedValue(null);
    });

    it('should delete tool and associated files', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      mockPrismaService.tool.delete.mockResolvedValue(mockTool);

      await service.remove('tool1');

      expect(fs.unlinkSync).toHaveBeenCalledTimes(2); // 1 image + 1 document
      expect(mockPrismaService.tool.delete).toHaveBeenCalledWith({
        where: { id: 'tool1' },
      });
    });

    it('should throw BadRequestException if tool has active rentals', async () => {
      mockPrismaService.rental.findFirst.mockResolvedValue({
        id: 'rental1',
        status: 'active',
      });

      await expect(service.remove('tool1')).rejects.toThrow(BadRequestException);
      await expect(service.remove('tool1')).rejects.toThrow(
        'Cannot delete tool with active rentals',
      );
    });

    it('should handle files that do not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      mockPrismaService.tool.delete.mockResolvedValue(mockTool);

      await service.remove('tool1');

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockPrismaService.tool.delete).toHaveBeenCalled();
    });

    it('should prevent deletion if tool has pending rentals', async () => {
      mockPrismaService.rental.findFirst.mockResolvedValue({
        id: 'rental1',
        status: 'pending',
      });

      await expect(service.remove('tool1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addImages', () => {
    const mockFiles = [
      {
        filename: 'image1.jpg',
        originalname: 'test1.jpg',
        size: 1024,
        mimetype: 'image/jpeg',
      },
      {
        filename: 'image2.jpg',
        originalname: 'test2.jpg',
        size: 2048,
        mimetype: 'image/jpeg',
      },
    ] as Express.Multer.File[];

    beforeEach(() => {
      mockPrismaService.tool.findUnique.mockResolvedValue({ id: 'tool1' });
      mockPrismaService.toolImage.aggregate.mockResolvedValue({
        _max: { displayOrder: 0 },
      });
    });

    it('should add multiple images with correct display order', async () => {
      mockPrismaService.toolImage.create.mockResolvedValue({ id: 'img1' });

      await service.addImages('tool1', mockFiles);

      expect(mockPrismaService.toolImage.create).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.toolImage.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({
            displayOrder: 1,
            fileName: 'test1.jpg',
          }),
        }),
      );
      expect(mockPrismaService.toolImage.create).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({
            displayOrder: 2,
            fileName: 'test2.jpg',
          }),
        }),
      );
    });

    it('should set first image as primary when isPrimary is true', async () => {
      mockPrismaService.toolImage.create.mockResolvedValue({ id: 'img1' });

      await service.addImages('tool1', mockFiles, true);

      expect(mockPrismaService.toolImage.updateMany).toHaveBeenCalledWith({
        where: { toolId: 'tool1' },
        data: { isPrimary: false },
      });

      expect(mockPrismaService.toolImage.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({ isPrimary: true }),
        }),
      );
      expect(mockPrismaService.toolImage.create).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({ isPrimary: false }),
        }),
      );
    });

    it('should continue display order from existing images', async () => {
      mockPrismaService.toolImage.aggregate.mockResolvedValue({
        _max: { displayOrder: 5 },
      });
      mockPrismaService.toolImage.create.mockResolvedValue({ id: 'img1' });

      await service.addImages('tool1', mockFiles);

      expect(mockPrismaService.toolImage.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({ displayOrder: 6 }),
        }),
      );
    });

    it('should throw NotFoundException if tool does not exist', async () => {
      mockPrismaService.tool.findUnique.mockResolvedValue(null);

      await expect(service.addImages('invalid', mockFiles)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeImage', () => {
    const mockImage = {
      id: 'img1',
      toolId: 'tool1',
      filePath: '/uploads/test.jpg',
    };

    it('should delete image and file', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      mockPrismaService.toolImage.findFirst.mockResolvedValue(mockImage);
      mockPrismaService.toolImage.delete.mockResolvedValue(mockImage);

      const result = await service.removeImage('tool1', 'img1');

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockPrismaService.toolImage.delete).toHaveBeenCalledWith({
        where: { id: 'img1' },
      });
      expect(result.message).toBe('Image deleted');
    });

    it('should throw NotFoundException if image not found', async () => {
      mockPrismaService.toolImage.findFirst.mockResolvedValue(null);

      await expect(service.removeImage('tool1', 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle file that does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      mockPrismaService.toolImage.findFirst.mockResolvedValue(mockImage);
      mockPrismaService.toolImage.delete.mockResolvedValue(mockImage);

      await service.removeImage('tool1', 'img1');

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockPrismaService.toolImage.delete).toHaveBeenCalled();
    });
  });

  describe('addCondition', () => {
    const conditionDto = {
      statusAtTime: 'maintenance' as const,
      comment: 'Routine maintenance',
      cost: 50,
    };

    beforeEach(() => {
      mockPrismaService.tool.findUnique.mockResolvedValue({ id: 'tool1' });
    });

    it('should add condition successfully', async () => {
      const mockCondition = { id: 'cond1', ...conditionDto };
      mockPrismaService.toolCondition.create.mockResolvedValue(mockCondition);
      mockPrismaService.tool.update.mockResolvedValue({ id: 'tool1' });

      const result = await service.addCondition('tool1', conditionDto, 'admin1');

      expect(result).toEqual(mockCondition);
      expect(mockPrismaService.toolCondition.create).toHaveBeenCalledWith({
        data: {
          toolId: 'tool1',
          adminId: 'admin1',
          statusAtTime: 'maintenance',
          comment: 'Routine maintenance',
          cost: 50,
        },
      });
    });

    it('should update lastMaintenanceDate for maintenance status', async () => {
      mockPrismaService.toolCondition.create.mockResolvedValue({ id: 'cond1' });
      mockPrismaService.tool.update.mockResolvedValue({ id: 'tool1' });

      await service.addCondition('tool1', conditionDto, 'admin1');

      expect(mockPrismaService.tool.update).toHaveBeenCalledWith({
        where: { id: 'tool1' },
        data: { lastMaintenanceDate: expect.any(Date) },
      });
    });

    it('should update lastMaintenanceDate for available status', async () => {
      const dto = { ...conditionDto, statusAtTime: 'available' as const };
      mockPrismaService.toolCondition.create.mockResolvedValue({ id: 'cond1' });
      mockPrismaService.tool.update.mockResolvedValue({ id: 'tool1' });

      await service.addCondition('tool1', dto, 'admin1');

      expect(mockPrismaService.tool.update).toHaveBeenCalled();
    });

    it('should not update lastMaintenanceDate for other statuses', async () => {
      const dto = { ...conditionDto, statusAtTime: 'broken' as const };
      mockPrismaService.toolCondition.create.mockResolvedValue({ id: 'cond1' });

      await service.addCondition('tool1', dto, 'admin1');

      expect(mockPrismaService.tool.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if tool does not exist', async () => {
      mockPrismaService.tool.findUnique.mockResolvedValue(null);

      await expect(
        service.addCondition('invalid', conditionDto, 'admin1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
