import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DeleteProdutoDto {
  @ApiProperty({
    example: 1,
    description:
      'ID do usuário responsável pela exclusão (temporário até o módulo de autenticação existir)',
  })
  @IsInt()
  @Min(1)
  idUsuarioExclusao!: number;
}
