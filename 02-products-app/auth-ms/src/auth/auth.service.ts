import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { RegisterUserDto } from './dto';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger('Auth Service');

    onModuleInit() {
        this.$connect();
        this.logger.log('MongoDB Conectado');
    }

    async registerUser(registerUserDto: RegisterUserDto) {
        const { email, name, password } = registerUserDto;
        try {
            const user = await this.user.findUnique({
                where: {
                    email: email
                }
            });

            if (user) {
                throw new RpcException({
                    status: 400,
                    message: 'El usuario ya existe'
                });
            }

            const newUser = await this.user.create({
                data: {
                    email: email,
                    name: name,
                    password: bcrypt.hashSync(password, 10)
                }
            });

            const { password: __, ...rest } = newUser;

            return { user: rest }
        } catch (error) {
            console.log(error);
            throw new RpcException({
                status: 400,
                message: error.message
            });
        }
    }

}
