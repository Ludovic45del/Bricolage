import { Module, CacheModule as NestCacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        if (isProduction && configService.get('REDIS_URL')) {
          // Production: Use Redis
          return {
            store: redisStore,
            url: configService.get('REDIS_URL'),
            ttl: 300, // 5 minutes default
          };
        }

        // Development: Use in-memory cache
        return {
          ttl: 300,
          max: 100,
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
