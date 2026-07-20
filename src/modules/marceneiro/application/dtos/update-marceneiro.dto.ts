import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMarceneiroDto {
  @ApiPropertyOptional({ example: 'João da Marcenaria' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: '(11) 98765-4321' })
  @IsOptional()
  @IsString()
  telefone?: string;
}
