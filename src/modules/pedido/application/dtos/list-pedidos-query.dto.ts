import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import type { OrdemListagemPedidos } from '../../domain/repositories/pedido.repository.interface';

export class ListPedidosQueryDto {
  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idMarceneiro?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Filtra somente os pedidos cadastrados pelo usuário logado',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  porUsuario?: boolean;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'mais-novo',
    enum: ['mais-antigo', 'mais-novo'],
    description: 'Ordena pela data de cadastro do pedido',
  })
  @IsOptional()
  @IsIn(['mais-antigo', 'mais-novo'])
  ordem?: OrdemListagemPedidos;
}
