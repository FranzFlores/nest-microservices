import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Payment-ms');
  
  const app = await NestFactory.create(AppModule);
  await app.listen(envs.port);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  logger.log(`Payment Microservicio en puerto ${envs.port}`);
}
bootstrap();
