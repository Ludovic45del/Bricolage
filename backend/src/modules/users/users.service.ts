import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { UsersQueryDto, UpdateUserDto, RenewMembershipDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: UsersQueryDto) {
        const { page = 1, limit = 50, search, status, membershipFilter } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {};

        // Search filter
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { badgeNumber: { contains: search } },
            ];
        }

        // Status filter
        if (status) {
            where.status = status;
        }

        // Membership filter
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        if (membershipFilter === 'active') {
            where.membershipExpiry = { gt: now };
        } else if (membershipFilter === 'expired') {
            where.membershipExpiry = { lte: now };
        } else if (membershipFilter === 'expiring_soon') {
            where.membershipExpiry = { gt: now, lte: thirtyDaysFromNow };
        }

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    badgeNumber: true,
                    employer: true,
                    membershipExpiry: true,
                    totalDebt: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                badgeNumber: true,
                employer: true,
                membershipExpiry: true,
                totalDebt: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async update(id: string, dto: UpdateUserDto, currentUser: any) {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Members can only update their own profile (limited fields)
        if (currentUser.role !== 'admin' && currentUser.id !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }

        // Members cannot change status
        if (currentUser.role !== 'admin' && dto.status) {
            throw new ForbiddenException('Only admins can change user status');
        }

        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                badgeNumber: true,
                employer: true,
                membershipExpiry: true,
                totalDebt: true,
                role: true,
                status: true,
                updatedAt: true,
            },
        });
    }

    async renewMembership(userId: string, dto: RenewMembershipDto, adminId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const previousExpiry = user.membershipExpiry;
        const newExpiry = new Date(previousExpiry);
        newExpiry.setMonth(newExpiry.getMonth() + (dto.durationMonths || 12));

        // Use transaction to ensure data consistency
        const result = await this.prisma.$transaction(async (tx) => {
            // Update user membership
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    membershipExpiry: newExpiry,
                    totalDebt: { increment: dto.amount },
                },
                select: {
                    id: true,
                    name: true,
                    membershipExpiry: true,
                    totalDebt: true,
                },
            });

            // Create renewal record
            const renewal = await tx.membershipRenewal.create({
                data: {
                    userId,
                    adminId,
                    previousExpiry,
                    newExpiry,
                    amount: dto.amount,
                    paymentMethod: dto.paymentMethod,
                },
            });

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId,
                    amount: dto.amount,
                    type: 'MembershipFee',
                    method: dto.paymentMethod,
                    description: `Cotisation annuelle - ${newExpiry.getFullYear()}`,
                    status: 'pending',
                },
            });

            return { user: updatedUser, renewal };
        });

        return result.user;
    }

    async remove(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Potential logic for related records (rentals, etc.)
        // For now, simple delete.
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }
}
