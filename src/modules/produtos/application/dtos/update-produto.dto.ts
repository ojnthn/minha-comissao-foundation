import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProdutoDto {
  @ApiPropertyOptional({ example: 'Chapa MDF Branco 18mm' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: 94.5, description: 'Valor do m² da chapa' })
  @IsOptional()
  @IsNumber()
  valorPorM2?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'ID da comissão percentual padrão do produto',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  idComissaoPorcentagemPadrao?: number;
}
