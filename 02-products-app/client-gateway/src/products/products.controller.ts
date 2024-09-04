import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { PaginationDto } from 'src/common/dto';
import { PRODUCT_SERVICE } from 'src/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('/products')
export class ProductsController {
  constructor(
    @Inject(PRODUCT_SERVICE)
    private readonly client: ClientProxy
  ) { }

  @Post('/create')
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.client.send({ cmd: 'create_product' }, createProductDto)
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Get('/all')
  findAllProducts(@Query() paginationDto: PaginationDto) {
    return this.client.send({ cmd: 'all_products' }, paginationDto)
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Get('/:id')
  async findOneProducts(@Param('id', ParseIntPipe) id: number) {
    return this.client.send({ cmd: 'one_product' }, { id })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Patch('/update/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.client.send({ cmd: 'update_product' }, { id, ...updateProductDto })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }

  @Delete('/delete/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.client.send({ cmd: 'delete_product' }, { id })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      );
  }
}
