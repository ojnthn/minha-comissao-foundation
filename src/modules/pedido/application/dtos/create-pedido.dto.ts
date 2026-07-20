import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { PedidoProdutoItemDto } from './pedido-produto-item.dto';

export class CreatePedidoDto {
  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @Min(0.01, { message: 'Valor do pedido deve ser maior que zero' })
  valor!: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  idMarceneiro!: number;

  @ApiProperty({ type: [PedidoProdutoItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Pedido deve ter ao menos um produto' })
  @ValidateNested({ each: true })
  @Type(() => PedidoProdutoItemDto)
  produtos!: PedidoProdutoItemDto[];
}
