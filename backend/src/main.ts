import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // CORS - Enable before other middlewars
  app.enableCors({
    origin: '*', // Allow all in dev to solve persistent CORS issues
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin',
  });

  // Security headers - Relaxed for development
  app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // Compression
  app.use(compression());


  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

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
}

bootstrap();
