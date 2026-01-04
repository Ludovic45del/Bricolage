import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super();
    }

    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Database connected');
        } catch (error) {
            this.logger.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
