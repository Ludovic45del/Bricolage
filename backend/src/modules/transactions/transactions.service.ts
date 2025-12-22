import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { TransactionsQueryDto, CreateTransactionDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: TransactionsQueryDto) {
        const { page = 1, limit = 50, userId, type, status, dateFrom, dateTo } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.TransactionWhereInput = {};

        if (userId) where.userId = userId;
        if (type) where.type = type;
        if (status) where.status = status;

        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom) where.date.gte = new Date(dateFrom);
            if (dateTo) where.date.lte = new Date(dateTo);
        }

        const [data, total, summary] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, badgeNumber: true } },
                },
            }),
            this.prisma.transaction.count({ where }),
            this.prisma.transaction.groupBy({
                by: ['status'],
                where,
                _sum: { amount: true },
            }),
        ]);

        const summaryData = {
            totalPending: summary.find((s) => s.status === 'pending')?._sum.amount || 0,
            totalPaid: summary.find((s) => s.status === 'paid')?._sum.amount || 0,
        };

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            summary: summaryData,
        };
    }

    async findOne(id: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: { user: { select: { id: true, name: true, badgeNumber: true } } },
        });

        if (!transaction) throw new NotFoundException('Transaction not found');
        return transaction;
    }

    async create(dto: CreateTransactionDto) {
        // Check user exists
        const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        if (!user) throw new NotFoundException('User not found');

        const result = await this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    userId: dto.userId,
                    amount: dto.amount,
                    type: dto.type,
                    method: dto.method,
                    description: dto.description,
                    status: dto.type === 'Payment' ? 'paid' : 'pending',
                },
                include: { user: { select: { id: true, name: true } } },
            });

            // If it's a payment, reduce user's debt
            if (dto.type === 'Payment') {
                await tx.user.update({
                    where: { id: dto.userId },
                    data: { totalDebt: { decrement: dto.amount } },
                });
            }

            return transaction;
        });

        return result;
    }

    async update(id: string, dto: { status?: 'pending' | 'paid'; workflowStep?: string; method?: string }) {
        const transaction = await this.prisma.transaction.findUnique({ where: { id } });
        if (!transaction) throw new NotFoundException('Transaction not found');

        const updateData: { status?: string; workflowStep?: string; method?: string } = {};

        if (dto.workflowStep) {
            updateData.workflowStep = dto.workflowStep;
        }

        if (dto.status) {
            updateData.status = dto.status;
        }

        if (dto.method) {
            updateData.method = dto.method;
        }

        // If marking as paid and it was pending, reduce user's debt
        if (updateData.status === 'paid' && transaction.status === 'pending') {
            await this.prisma.$transaction(async (tx) => {
                await tx.transaction.update({
                    where: { id },
                    data: updateData,
                });

                await tx.user.update({
                    where: { id: transaction.userId },
                    data: { totalDebt: { decrement: transaction.amount } },
                });
            });
        } else {
            await this.prisma.transaction.update({
                where: { id },
                data: updateData,
            });
        }

        return this.findOne(id);
    }
}
