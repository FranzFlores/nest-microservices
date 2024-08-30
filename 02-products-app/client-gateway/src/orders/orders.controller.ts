import { Controller, Get, Post, Body, Param, Inject, ParseUUIDPipe, Query, Patch } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_SERVICE } from 'src/config';
import { OrderPaginationDto, UpdateOrderDto } from './dto';

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
  findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    return this.ordersClient.send('findAllOrders', { orderPaginationDto })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Get('/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersClient.send('findOneOrder', { id })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Patch('/update/:id')
  changeStatus(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrderDto :UpdateOrderDto) {
    return this.ordersClient.send('hangeOrderStatus', { id, updateOrderDto })
    .pipe(
      catchError(err => { throw new RpcException(err) })
    );
  }

}
