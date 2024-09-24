import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Payment-ms');

  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });
  

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers
    }
  });

  await app.startAllMicroservices();
  await app.listen(envs.port);
  logger.log(`Payment Microservicio en puerto ${envs.port}`);
}
bootstrap();
