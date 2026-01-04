import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { ToolsQueryDto, CreateToolDto, UpdateToolDto, CreateConditionDto } from './dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ToolsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: ToolsQueryDto) {
        const { page = 1, limit = 50, search, categoryId, status, maintenanceAlert } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ToolWhereInput = {};

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }

        if (categoryId) where.categoryId = categoryId;
        if (status) where.status = status;

        // Maintenance alert filter
        if (maintenanceAlert) {
            const today = new Date();
            where.OR = [
                { lastMaintenanceDate: null },
                {
                    AND: [
                        { maintenanceInterval: { not: null } },
                        { lastMaintenanceDate: { not: null } },
                    ],
                },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.tool.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: { select: { id: true, name: true } },
                    images: { orderBy: { displayOrder: 'asc' } },
                    documents: true,
                    conditions: {
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    },
                },
            }),
            this.prisma.tool.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string) {
        const tool = await this.prisma.tool.findUnique({
            where: { id },
            include: {
                category: true,
                images: { orderBy: { displayOrder: 'asc' } },
                documents: true,
                conditions: {
                    orderBy: { createdAt: 'desc' },
                    include: { attachments: true },
                },
            },
        });

        if (!tool) throw new NotFoundException('Tool not found');
        return tool;
    }

    async create(dto: CreateToolDto) {
        return this.prisma.tool.create({
            data: {
                title: dto.title,
                description: dto.description,
                categoryId: dto.categoryId,
                weeklyPrice: dto.weeklyPrice,
                purchasePrice: dto.purchasePrice,
                purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
                maintenanceImportance: dto.maintenanceImportance || 'low',
                maintenanceInterval: dto.maintenanceInterval,
                status: 'available',
            },
            include: { category: true, images: true },
        });
    }

    async update(id: string, dto: UpdateToolDto) {
        await this.findOne(id);

        const data: any = { ...dto };
        if (dto.lastMaintenanceDate) {
            data.lastMaintenanceDate = new Date(dto.lastMaintenanceDate);
        }

        if (dto.purchaseDate) {
            data.purchaseDate = new Date(dto.purchaseDate);
        }

        return this.prisma.tool.update({
            where: { id },
            data,
            include: { category: true, images: true },
        });
    }

    async remove(id: string) {
        const tool = await this.findOne(id);

        // Check if tool is currently rented
        const activeRental = await this.prisma.rental.findFirst({
            where: { toolId: id, status: { in: ['active', 'pending'] } },
        });

        if (activeRental) {
            throw new BadRequestException('Cannot delete tool with active rentals');
        }

        // Delete associated files
        for (const image of tool.images) {
            const filePath = path.join(process.cwd(), image.filePath);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        for (const doc of tool.documents) {
            const filePath = path.join(process.cwd(), doc.filePath);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        return this.prisma.tool.delete({ where: { id } });
    }

    async addImages(toolId: string, files: Express.Multer.File[], isPrimary = false) {
        await this.findOne(toolId);

        // If setting as primary, unset all others
        if (isPrimary) {
            await this.prisma.toolImage.updateMany({
                where: { toolId },
                data: { isPrimary: false },
            });
        }

        // Get current max display order
        const maxOrder = await this.prisma.toolImage.aggregate({
            where: { toolId },
            _max: { displayOrder: true },
        });

        let displayOrder = (maxOrder._max.displayOrder || 0) + 1;

        const images = await Promise.all(
            files.map(async (file, index) => {
                return this.prisma.toolImage.create({
                    data: {
                        toolId,
                        filePath: `/uploads/tools/images/${file.filename}`,
                        fileName: file.originalname,
                        fileSize: file.size,
                        mimeType: file.mimetype,
                        displayOrder: displayOrder + index,
                        isPrimary: isPrimary && index === 0,
                    },
                });
            }),
        );

        return { images };
    }

    async removeImage(toolId: string, imageId: string) {
        const image = await this.prisma.toolImage.findFirst({
            where: { id: imageId, toolId },
        });

        if (!image) throw new NotFoundException('Image not found');

        // Delete file
        const filePath = path.join(process.cwd(), image.filePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await this.prisma.toolImage.delete({ where: { id: imageId } });
        return { message: 'Image deleted' };
    }

    async addCondition(toolId: string, dto: CreateConditionDto, adminId: string) {
        await this.findOne(toolId);

        const condition = await this.prisma.toolCondition.create({
            data: {
                toolId,
                adminId,
                statusAtTime: dto.statusAtTime,
                comment: dto.comment,
                cost: dto.cost,
            },
        });

        // Update last maintenance date if maintenance
        if (dto.statusAtTime === 'maintenance' || dto.statusAtTime === 'available') {
            await this.prisma.tool.update({
                where: { id: toolId },
                data: { lastMaintenanceDate: new Date() },
            });
        }

        return condition;
    }

    async addDocuments(toolId: string, files: Express.Multer.File[], type = 'other') {
        await this.findOne(toolId);

        const documents = await Promise.all(
            files.map(async (file) => {
                return this.prisma.toolDocument.create({
                    data: {
                        toolId,
                        filePath: `/uploads/tools/documents/${file.filename}`,
                        name: file.originalname,
                        fileSize: file.size,
                        mimeType: file.mimetype,
                        type,
                    },
                });
            }),
        );

        return { documents };
    }

    async removeDocument(toolId: string, docId: string) {
        const doc = await this.prisma.toolDocument.findFirst({
            where: { id: docId, toolId },
        });

        if (!doc) throw new NotFoundException('Document not found');

        // Delete file
        const filePath = path.join(process.cwd(), doc.filePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await this.prisma.toolDocument.delete({ where: { id: docId } });
        return { message: 'Document deleted' };
    }
}
