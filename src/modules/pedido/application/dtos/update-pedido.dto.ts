import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { PedidoProdutoItemDto } from './pedido-produto-item.dto';

export class UpdatePedidoDto {
  @ApiPropertyOptional({ example: 1500.0 })
  @IsOptional()
  @IsNumber()
  valor?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  idMarceneiro?: number;

  @ApiPropertyOptional({ type: [PedidoProdutoItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Pedido deve ter ao menos um produto' })
  @ValidateNested({ each: true })
  @Type(() => PedidoProdutoItemDto)
  produtos?: PedidoProdutoItemDto[];
}
