// @nestjs/typeorm@11 uses globalThis.crypto which is only auto-exposed in Node 19+.
// Polyfill it from the built-in module so Node 18 works without upgrading.
import { webcrypto } from 'node:crypto';
if (!('crypto' in globalThis)) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
}

import {ClassSerializerInterceptor, ValidationPipe} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector))
  )

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('HomeKit API')
    .setDescription(
      'HomeKit monorepo API. Includes auth, users, AI, F1, and plans (Simkl anime/TV/movie calendars with watchlists).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
