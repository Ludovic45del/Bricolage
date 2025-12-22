import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    type: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'dev-secret',
        });
    }

    async validate(payload: JwtPayload) {
        if (payload.type !== 'access') {
            throw new UnauthorizedException('Invalid token type');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                name: true,
                badgeNumber: true,
                role: true,
                status: true,
                membershipExpiry: true,
                totalDebt: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.status !== 'active') {
            throw new UnauthorizedException('User account is not active');
        }

        return user;
    }
}
