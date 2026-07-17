import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListComissaoPorcentagemQueryDto } from '../../application/dtos/list-comissao-porcentagem-query.dto';
import { ListComissaoPorcentagemUseCase } from '../../application/use-cases/list-comissao-porcentagem.use-case';

@ApiTags('comissao-porcentagem')
@Controller('comissao-porcentagem')
export class ComissaoPorcentagemController {
  constructor(
    private readonly listComissaoPorcentagemUseCase: ListComissaoPorcentagemUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista as porcentagens de comissão' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de porcentagens de comissão',
  })
  list(@Query() query: ListComissaoPorcentagemQueryDto) {
    return this.listComissaoPorcentagemUseCase.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }
}
