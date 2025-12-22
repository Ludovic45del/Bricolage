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

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, email: true, role: true, status: true },
            });

            if (!user || user.status !== 'active') {
                throw new UnauthorizedException('User not found or inactive');
            }

            // Generate new access token only
            const accessToken = this.jwtService.sign(
                { sub: user.id, email: user.email, role: user.role, type: 'access' } as Record<string, unknown>,
                { expiresIn: 3600 }, // 1 hour in seconds
            );

            return { accessToken };
        } catch {
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
