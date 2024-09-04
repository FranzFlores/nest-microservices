import { Controller, Get, Post, Body, Param, Inject, ParseUUIDPipe, Query, Patch } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { CreateOrderDto } from './dto/create-order.dto';
import { NATS_SERVICE } from 'src/config';
import { OrderPaginationDto, UpdateOrderDto } from './dto';

@Controller('/orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy
  ) { }

  @Post('/create')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('createOrder', createOrderDto)
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Get('/all')
  findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    return this.client.send('findAllOrders', { orderPaginationDto })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Get('/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send('findOneOrder', { id })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Patch('/update/:id')
  changeStatus(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrderDto :UpdateOrderDto) {
    return this.client.send('hangeOrderStatus', { id, updateOrderDto })
    .pipe(
      catchError(err => { throw new RpcException(err) })
    );
  }

}
