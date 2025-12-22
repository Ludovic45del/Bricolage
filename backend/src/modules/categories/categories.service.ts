import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { tools: true } },
            },
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { tools: true } } },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async create(dto: CreateCategoryDto) {
        // Check for duplicate name (case-insensitive)
        const existing = await this.prisma.category.findFirst({
            where: { name: { equals: dto.name } },
        });

        if (existing) {
            throw new ConflictException('Category with this name already exists');
        }

        return this.prisma.category.create({ data: dto });
    }

    async update(id: string, dto: UpdateCategoryDto) {
        await this.findOne(id); // Throws if not found

        if (dto.name) {
            const existing = await this.prisma.category.findFirst({
                where: {
                    name: { equals: dto.name },
                    id: { not: id },
                },
            });

            if (existing) {
                throw new ConflictException('Category with this name already exists');
            }
        }

        return this.prisma.category.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.category.delete({ where: { id } });
    }
}
