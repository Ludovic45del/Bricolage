import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // CORS - Secure configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin',
  });

  // Security headers - Production ready
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
  } else {
    app.use(helmet({
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
  }

  // Rate limiting - Global
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15min (large pour ne pas gêner usage normal)
    message: 'Trop de requêtes, veuillez réessayer plus tard',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  // Rate limiting - Auth endpoints (stricter)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts max
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
    skipSuccessfulRequests: true, // Only count failed attempts
  });
  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);


  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Serve static files (uploads)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Swagger Configuration
  const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
  const config = new DocumentBuilder()
    .setTitle('AssoManager Pro API')
    .setDescription('The AssoManager Pro API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 4000;

  await app.listen(port);

  logger.log(`🚀 Backend running on http://localhost:${port}`);
  logger.log(`📚 API Base: http://localhost:${port}/api/v1`);
  logger.log(`📄 Swagger UI: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔒 CORS: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
}

bootstrap();
