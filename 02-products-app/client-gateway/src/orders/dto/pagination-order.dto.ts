import { IsEnum, IsOptional } from "class-validator";

import { PaginationDto } from "src/common/dto";
import { OrderStatus, OrderStatusList } from "../enum/order.enum";

export class OrderPaginationDto extends PaginationDto {
    @IsOptional()
    @IsEnum(OrderStatusList, { message: `Los valores válidos son ${OrderStatusList}` })
    status: OrderStatus;
}