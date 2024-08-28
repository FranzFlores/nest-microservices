import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { envs } from './config';
import { RpcCustomeExceptionFilter } from './common/exceptions';


async function bootstrap() {
  const logger = new Logger('Main Gateway');

  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    })
  );

  app.useGlobalFilters(
    new RpcCustomeExceptionFilter()
  );

  await app.listen(envs.port);

  logger.log(`Gateway corriendo en el puerto ${envs.port}`);
}
bootstrap();
