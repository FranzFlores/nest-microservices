import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import { envs } from './config/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    })
  );

  await app.listen(envs.port);
  console.log(`Aplicación ejecutandose en el puerto ${envs.port}`);
  
}
bootstrap();
