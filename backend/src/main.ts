import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  app.useStaticAssets(join(process.cwd(), '..', 'uploads'), { prefix: '/uploads/videos' });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
