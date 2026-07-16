import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMarceneiroDto {
  @ApiPropertyOptional({ example: 'João da Marcenaria' })
  @IsOptional()
  @IsString()
  nome?: string;
}
