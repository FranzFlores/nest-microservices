import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { envs } from './config';


async function bootstrap() {
  const logger = new Logger('Orders-Main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, 
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers
      }
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
    })
  );
 
  logger.log(`Microservicio de orders ejecutando en el puerto ${envs.port}`);
}
bootstrap();
