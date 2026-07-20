import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProdutoDto } from '../../application/dtos/create-produto.dto';
import { UpdateProdutoDto } from '../../application/dtos/update-produto.dto';
import { ListProdutosQueryDto } from '../../application/dtos/list-produtos-query.dto';
import { CreateProdutoUseCase } from '../../application/use-cases/create-produto.use-case';
import { GetProdutoUseCase } from '../../application/use-cases/get-produto.use-case';
import { ListProdutosUseCase } from '../../application/use-cases/list-produtos.use-case';
import { SearchProdutosByNomeUseCase } from '../../application/use-cases/search-produtos-by-nome.use-case';
import { UpdateProdutoUseCase } from '../../application/use-cases/update-produto.use-case';
import { DeleteProdutoUseCase } from '../../application/use-cases/delete-produto.use-case';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';

@ApiTags('produtos')
@Controller('produtos')
export class ProdutosController {
  constructor(
    private readonly createProdutoUseCase: CreateProdutoUseCase,
    private readonly getProdutoUseCase: GetProdutoUseCase,
    private readonly listProdutosUseCase: ListProdutosUseCase,
    private readonly searchProdutosByNomeUseCase: SearchProdutosByNomeUseCase,
    private readonly updateProdutoUseCase: UpdateProdutoUseCase,
    private readonly deleteProdutoUseCase: DeleteProdutoUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista produtos com paginação, opcionalmente filtrando por nome' })
  @ApiResponse({ status: 200, description: 'Lista paginada de produtos' })
  list(@Query() query: ListProdutosQueryDto) {
    if (query.nome && query.nome.trim()) {
      return this.searchProdutosByNomeUseCase.execute({
        nome: query.nome,
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      });
    }
    return this.listProdutosUseCase.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um produto pelo ID' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.getProdutoUseCase.execute({ id });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado' })
  create(@Body() dto: CreateProdutoDto, @CurrentUser() userId: number) {
    return this.createProdutoUseCase.execute({
      nome: dto.nome,
      valorPorM2: dto.valorPorM2,
      idComissaoPorcentagemPadrao: dto.idComissaoPorcentagemPadrao,
      idUsuarioCadastro: userId,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um produto existente' })
  @ApiResponse({ status: 200, description: 'Produto atualizado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProdutoDto) {
    return this.updateProdutoUseCase.execute({
      id,
      nome: dto.nome,
      valorPorM2: dto.valorPorM2,
      idComissaoPorcentagemPadrao: dto.idComissaoPorcentagemPadrao,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove (soft delete) um produto' })
  @ApiResponse({ status: 200, description: 'Produto removido' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.deleteProdutoUseCase.execute({
      id,
      idUsuarioExclusao: userId,
    });
  }
}
