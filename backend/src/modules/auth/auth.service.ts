import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma';
import { RegisterDto, LoginDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if email already exists
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingEmail) {
            throw new ConflictException('Email already registered');
        }

        // Check if badge number already exists
        const existingBadge = await this.prisma.user.findUnique({
            where: { badgeNumber: dto.badgeNumber },
        });
        if (existingBadge) {
            throw new ConflictException('Badge number already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Calculate membership expiry (1 year from now)
        const membershipExpiry = new Date();
        membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 1);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                badgeNumber: dto.badgeNumber,
                phone: dto.phone,
                employer: dto.employer,
                passwordHash,
                membershipExpiry,
                role: 'member',
                status: 'active',
            },
            select: {
                id: true,
                name: true,
                email: true,
                badgeNumber: true,
                role: true,
                status: true,
                membershipExpiry: true,
                totalDebt: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt,
            },
        });

        return {
            user,
            tokens,
        };
    }

    async login(dto: LoginDto) {
        // Find user by email or badge number
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.identifier },
                    { badgeNumber: dto.identifier },
                ],
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status !== 'active') {
            throw new UnauthorizedException('Account is suspended or archived');
        }

        if (!user.passwordHash) {
            throw new UnauthorizedException('Password not set. Please contact admin.');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt,
            },
        });

        // Return user without password
        const { passwordHash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify<JwtPayload>(refreshToken);

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Invalid token type');
            }

            // Check if token exists in database and is not revoked
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true },
            });

            if (!storedToken || storedToken.isRevoked) {
                throw new UnauthorizedException('Token is invalid or revoked');
            }

            if (new Date() > storedToken.expiresAt) {
                throw new UnauthorizedException('Token has expired');
            }

            const user = storedToken.user;

            if (!user || user.status !== 'active') {
                throw new UnauthorizedException('User not found or inactive');
            }

            // Generate new tokens (rotation)
            const newTokens = await this.generateTokens(user.id, user.email, user.role);

            // Revoke old refresh token and mark replacement
            await this.prisma.refreshToken.update({
                where: { token: refreshToken },
                data: {
                    isRevoked: true,
                    revokedAt: new Date(),
                    replacedBy: newTokens.refreshToken,
                },
            });

            // Store new refresh token
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

            await this.prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    token: newTokens.refreshToken,
                    expiresAt,
                },
            });

            return newTokens;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const accessPayload = { sub: userId, email, role, type: 'access' } as Record<string, unknown>;
        const refreshPayload = { sub: userId, email, role, type: 'refresh' } as Record<string, unknown>;

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessPayload, { expiresIn: 3600 }), // 1 hour
            this.jwtService.signAsync(refreshPayload, { expiresIn: 604800 }), // 7 days
        ]);

        return { accessToken, refreshToken };
    }
}
