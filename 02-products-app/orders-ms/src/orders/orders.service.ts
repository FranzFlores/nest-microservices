import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto';
import { NATS_SERVICE} from 'src/config';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService');

  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Base de datos conectada');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const productIds = createOrderDto.items.map(x => x.productId)
      const products = await firstValueFrom(this.client.send({ cmd: 'validate-products' }, productIds));

      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const price = products.find(product => product.id === orderItem.productId).price;
        return price * orderItem.quantity;
      }, 0);

      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          orderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                price: products.find(product => product.id === orderItem.productId).price
              }))
            }
          }
        },
        include: {
          orderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true
            }
          }
        }
      });

      return {
        ...order,
        OrderItem: order.orderItem.map((orderItem) => ({
          ...orderItem,
          name: products.find(product => product.id === orderItem.productId).name
        }))
      }

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Mirar Logs'
      });
    }
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
      where: { id },
      include: {
        orderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true
          }
        }
      }
    });

    if (!order) {
      throw new RpcException({ status: HttpStatus.NOT_FOUND, message: 'Order not found' });
    }

    const productIds = order.orderItem.map(orderItem => orderItem.productId);
    const products = await firstValueFrom(
      this.client.send({ cmd: 'validate-products' }, productIds)
    );

    return {
      ...order,
      OrderItem: order.orderItem.map(orderItem => ({
        ...orderItem,
        name: products.find(x => x.id === orderItem.productId).name
      }))
    };
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const { id: __, ...data } = updateOrderDto;
    const order = await this.findOne(id);

    return this.order.update({ where: { id }, data: data });
  }
}
