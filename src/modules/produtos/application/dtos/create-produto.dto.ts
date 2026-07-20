import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty({ example: 'Chapa MDF Branco 15mm' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome!: string;

  @ApiProperty({ example: 89.9, description: 'Valor do m² da chapa' })
  @IsNumber()
  valorPorM2!: number;

  @ApiProperty({
    example: 1,
    description: 'ID da comissão percentual padrão do produto',
  })
  @IsInt()
  @Min(1)
  idComissaoPorcentagemPadrao!: number;
}
