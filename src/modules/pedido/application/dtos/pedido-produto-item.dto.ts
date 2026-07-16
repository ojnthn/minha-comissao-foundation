import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class PedidoProdutoItemDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  idProduto!: number;

  @ApiProperty({ example: 800 })
  @IsInt()
  valorProduto!: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  valorPorcentagem!: number;
}
