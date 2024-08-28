import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ORDER_SERVICE } from 'src/config';

@Controller('/orders')
export class OrdersController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly ordersClient: ClientProxy
  ) { }

  @Post('/create')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersClient.send('createOrder', createOrderDto)
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Get('/all')
  findAll() {
    return this.ordersClient.send('findAllOrders', {})
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Get('/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersClient.send('findOneOrder', { id })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

}
