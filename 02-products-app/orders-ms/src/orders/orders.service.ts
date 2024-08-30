import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Base de datos conectada');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({ data: createOrderDto });
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status
      }
    });

    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;

    const orders = this.order.findMany({
      skip: (currentPage - 1) * perPage,
      take: perPage,
      where: {
        status: orderPaginationDto.status
      }
    });

    return {
      data: orders,
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage)
      }
    }
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id }
    });

    if (!order) {
      throw new RpcException({ status: HttpStatus.NOT_FOUND, message: 'Order not found' });
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const { id: __, ...data } = updateOrderDto;
    const order = await this.findOne(id);

    return this.order.update({ where: { id }, data: data });
  }
}
