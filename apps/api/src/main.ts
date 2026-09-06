import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.APP_ENV === 'production'
      ? ['https://admin.guptamobile.com']
      : ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  app.use(helmet());
  app.setGlobalPrefix('api/v1');

  // Global validation pipe with Zod
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('APP_PORT') ?? 3000;

  await app.listen(port);
  logger.log(`🚀 Application running on port ${port}`);
  logger.log(`📖 Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();