import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class PedidoProdutoItemDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  idProduto!: number;

  @ApiProperty({ example: 800.0 })
  @IsNumber()
  @Min(0.01, { message: 'Valor do produto deve ser maior que zero' })
  valorProduto!: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.01, { message: 'Percentual de comissão deve ser maior que zero' })
  valorPorcentagem!: number;
}
