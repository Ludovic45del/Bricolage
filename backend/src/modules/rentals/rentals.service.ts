import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { RentalsQueryDto, CreateRentalDto, UpdateRentalDto } from './dto';
import { Prisma } from '@prisma/client';
import { isFriday, differenceInWeeks, parseISO } from 'date-fns';

@Injectable()
export class RentalsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: RentalsQueryDto, currentUser: any) {
        const { page = 1, limit = 50, status, userId, toolId, startDateFrom, startDateTo } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.RentalWhereInput = {};

        // Members can only see their own rentals
        if (currentUser.role !== 'admin') {
            where.userId = currentUser.id;
        } else if (userId) {
            where.userId = userId;
        }

        if (status) where.status = status;
        if (toolId) where.toolId = toolId;

        if (startDateFrom || startDateTo) {
            where.startDate = {};
            if (startDateFrom) where.startDate.gte = new Date(startDateFrom);
            if (startDateTo) where.startDate.lte = new Date(startDateTo);
        }

        const [data, total] = await Promise.all([
            this.prisma.rental.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, badgeNumber: true, email: true } },
                    tool: { select: { id: true, title: true, weeklyPrice: true } },
                },
            }),
            this.prisma.rental.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string, currentUser: any) {
        const rental = await this.prisma.rental.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, badgeNumber: true, email: true } },
                tool: { select: { id: true, title: true, weeklyPrice: true } },
                history: {
                    orderBy: { createdAt: 'desc' },
                    include: { admin: { select: { name: true } } },
                },
            },
        });

        if (!rental) throw new NotFoundException('Rental not found');

        // Members can only view their own rentals
        if (currentUser.role !== 'admin' && rental.userId !== currentUser.id) {
            throw new ForbiddenException('Access denied');
        }

        return rental;
    }

    async create(dto: CreateRentalDto, currentUser: any) {
        const startDate = parseISO(dto.startDate);
        const endDate = parseISO(dto.endDate);

        // Validate Friday dates
        if (!isFriday(startDate)) {
            throw new BadRequestException('Start date must be a Friday');
        }
        if (!isFriday(endDate)) {
            throw new BadRequestException('End date must be a Friday');
        }
        if (endDate <= startDate) {
            throw new BadRequestException('End date must be after start date');
        }

        // Check tool availability (only block if maintenance or unavailable)
        const tool = await this.prisma.tool.findUnique({ where: { id: dto.toolId } });
        if (!tool) throw new NotFoundException('Tool not found');
        if (tool.status === 'maintenance') {
            throw new BadRequestException('Tool is currently in maintenance');
        }
        if (tool.status === 'unavailable') {
            throw new BadRequestException('Tool is not available');
        }

        // Check maintenance blocking
        if (tool.maintenanceImportance === 'high' && tool.maintenanceInterval) {
            const monthsSinceMaintenance = tool.lastMaintenanceDate
                ? Math.floor((Date.now() - tool.lastMaintenanceDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
                : Infinity;
            if (monthsSinceMaintenance > tool.maintenanceInterval) {
                throw new BadRequestException('Tool requires maintenance before rental');
            }
        }

        // Check user membership
        const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        if (!user) throw new NotFoundException('User not found');
        if (new Date(user.membershipExpiry) < new Date()) {
            throw new BadRequestException('User membership has expired');
        }

        // Check for conflicting rentals (date overlap check)
        const conflicting = await this.prisma.rental.findFirst({
            where: {
                toolId: dto.toolId,
                status: { in: ['active', 'pending'] },
                OR: [
                    // New rental starts during an existing rental
                    { startDate: { lte: startDate }, endDate: { gt: startDate } },
                    // New rental ends during an existing rental
                    { startDate: { lt: endDate }, endDate: { gte: endDate } },
                    // New rental completely contains an existing rental
                    { startDate: { gte: startDate }, endDate: { lte: endDate } },
                ],
            },
        });
        if (conflicting) {
            throw new BadRequestException('Tool is already reserved for this period');
        }

        // Calculate price if not provided
        const weeks = differenceInWeeks(endDate, startDate);
        const totalPrice = dto.totalPrice ?? Number(tool.weeklyPrice) * Math.max(1, weeks);

        // Determine initial status based on role
        const initialStatus = currentUser.role === 'admin' ? 'active' : 'pending';

        // Create rental with transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const rental = await tx.rental.create({
                data: {
                    userId: dto.userId,
                    toolId: dto.toolId,
                    startDate,
                    endDate,
                    totalPrice,
                    status: initialStatus,
                },
                include: {
                    user: { select: { id: true, name: true } },
                    tool: { select: { id: true, title: true } },
                },
            });

            // Update tool status if active
            if (initialStatus === 'active') {
                await tx.tool.update({
                    where: { id: dto.toolId },
                    data: { status: 'rented' },
                });
            }

            // Add to user's debt
            await tx.user.update({
                where: { id: dto.userId },
                data: { totalDebt: { increment: totalPrice } },
            });

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId: dto.userId,
                    amount: totalPrice,
                    type: 'Rental',
                    description: `Location: ${rental.tool.title}`,
                    status: 'pending',
                },
            });

            // Create history record
            await tx.rentalHistory.create({
                data: {
                    rentalId: rental.id,
                    adminId: currentUser.id,
                    action: 'created',
                    comment: `Location créée (${weeks} semaine(s))`,
                },
            });

            return rental;
        });

        return result;
    }

    async update(id: string, dto: UpdateRentalDto, currentUser: any) {
        const rental = await this.findOne(id, currentUser);

        // Only admin can update rentals
        if (currentUser.role !== 'admin') {
            throw new ForbiddenException('Only admins can update rentals');
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const updateData: any = {};

            if (dto.status) updateData.status = dto.status;
            if (dto.returnComment) updateData.returnComment = dto.returnComment;
            if (dto.actualReturnDate) updateData.actualReturnDate = new Date(dto.actualReturnDate);

            // Handle status changes
            if (dto.status === 'completed' || dto.status === 'rejected') {
                // Free up the tool
                await tx.tool.update({
                    where: { id: rental.toolId },
                    data: { status: 'available' },
                });

                if (dto.status === 'rejected') {
                    // Refund the debt
                    await tx.user.update({
                        where: { id: rental.userId },
                        data: { totalDebt: { decrement: Number(rental.totalPrice) || 0 } },
                    });

                    // Delete associated transaction
                    await tx.transaction.deleteMany({
                        where: {
                            userId: rental.userId,
                            type: 'Rental',
                            description: { contains: rental.tool.title },
                        },
                    });
                }

                // Set actual return date if completing
                if (dto.status === 'completed' && !dto.actualReturnDate) {
                    updateData.actualReturnDate = new Date();

                    // Update associated transaction workflow to 'tool_returned'
                    await tx.transaction.updateMany({
                        where: {
                            userId: rental.userId,
                            type: 'Rental',
                            description: { contains: rental.tool.title },
                        },
                        data: {
                            workflowStep: 'tool_returned',
                        },
                    });
                }
            } else if (dto.status === 'active' && rental.status === 'pending') {
                // Approve rental - mark tool as rented
                await tx.tool.update({
                    where: { id: rental.toolId },
                    data: { status: 'rented' },
                });
            }

            const updated = await tx.rental.update({
                where: { id },
                data: updateData,
                include: {
                    user: { select: { id: true, name: true } },
                    tool: { select: { id: true, title: true } },
                },
            });

            // Create history entry
            await tx.rentalHistory.create({
                data: {
                    rentalId: id,
                    adminId: currentUser.id,
                    action: dto.status === 'completed' ? 'returned' :
                        dto.status === 'rejected' ? 'rejected' : 'approved',
                    comment: dto.returnComment,
                },
            });

            return updated;
        });

        return result;
    }

    async returnRental(id: string, dto: { endDate?: string; comment?: string }, currentUser: any) {
        const rental = await this.findOne(id, currentUser);

        // Check that the rental can be returned
        if (rental.status !== 'active') {
            throw new BadRequestException('Only active rentals can be returned');
        }

        // Users can only return their own rentals
        if (currentUser.role !== 'admin' && rental.userId !== currentUser.id) {
            throw new ForbiddenException('You can only return your own rentals');
        }

        const actualReturnDate = dto.endDate ? new Date(dto.endDate) : new Date();

        const result = await this.prisma.$transaction(async (tx) => {
            // Update rental status to completed
            const updated = await tx.rental.update({
                where: { id },
                data: {
                    status: 'completed',
                    actualReturnDate,
                    returnComment: dto.comment,
                },
                include: {
                    user: { select: { id: true, name: true } },
                    tool: { select: { id: true, title: true } },
                },
            });

            // Free up the tool
            await tx.tool.update({
                where: { id: rental.toolId },
                data: { status: 'available' },
            });

            // Update associated transaction workflow to 'tool_returned'
            await tx.transaction.updateMany({
                where: {
                    userId: rental.userId,
                    type: 'Rental',
                    description: { contains: rental.tool.title },
                },
                data: {
                    workflowStep: 'tool_returned',
                },
            });

            // Create history entry
            await tx.rentalHistory.create({
                data: {
                    rentalId: id,
                    adminId: currentUser.id,
                    action: 'returned',
                    comment: dto.comment || 'Retour effectué',
                },
            });

            return updated;
        });

        return result;
    }

    async delete(id: string, currentUser: any) {
        const rental = await this.findOne(id, currentUser);

        // Only admin can delete rentals
        if (currentUser.role !== 'admin') {
            throw new ForbiddenException('Only admins can delete rentals');
        }

        await this.prisma.$transaction(async (tx) => {
            // Refund the debt if any
            if (rental.totalPrice) {
                await tx.user.update({
                    where: { id: rental.userId },
                    data: { totalDebt: { decrement: Number(rental.totalPrice) } },
                });
            }

            // Delete associated transactions
            await tx.transaction.deleteMany({
                where: {
                    userId: rental.userId,
                    type: 'Rental',
                    description: { contains: rental.tool.title },
                },
            });

            // Free up the tool if it was reserved
            await tx.tool.update({
                where: { id: rental.toolId },
                data: { status: 'available' },
            });

            // Delete rental history
            await tx.rentalHistory.deleteMany({
                where: { rentalId: id },
            });

            // Delete the rental
            await tx.rental.delete({
                where: { id },
            });
        });

        return { success: true, message: 'Rental deleted' };
    }
}
