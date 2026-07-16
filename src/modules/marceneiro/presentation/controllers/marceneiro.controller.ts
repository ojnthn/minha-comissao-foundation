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
import { CreateMarceneiroDto } from '../../application/dtos/create-marceneiro.dto';
import { UpdateMarceneiroDto } from '../../application/dtos/update-marceneiro.dto';
import { ListMarceneirosQueryDto } from '../../application/dtos/list-marceneiros-query.dto';
import { CreateMarceneiroUseCase } from '../../application/use-cases/create-marceneiro.use-case';
import { ListMarceneirosUseCase } from '../../application/use-cases/list-marceneiros.use-case';
import { SearchMarceneirosByNomeUseCase } from '../../application/use-cases/search-marceneiros-by-nome.use-case';
import { UpdateMarceneiroUseCase } from '../../application/use-cases/update-marceneiro.use-case';
import { DeleteMarceneiroUseCase } from '../../application/use-cases/delete-marceneiro.use-case';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';

@ApiTags('marceneiro')
@Controller('marceneiro')
export class MarceneiroController {
  constructor(
    private readonly createMarceneiroUseCase: CreateMarceneiroUseCase,
    private readonly listMarceneirosUseCase: ListMarceneirosUseCase,
    private readonly searchMarceneirosByNomeUseCase: SearchMarceneirosByNomeUseCase,
    private readonly updateMarceneiroUseCase: UpdateMarceneiroUseCase,
    private readonly deleteMarceneiroUseCase: DeleteMarceneiroUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista marceneiros com paginação' })
  @ApiResponse({ status: 200, description: 'Lista paginada de marceneiros' })
  list(@Query() query: ListMarceneirosQueryDto) {
    return this.listMarceneirosUseCase.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }

  @Get(':nome')
  @ApiOperation({ summary: 'Pesquisa marceneiros pelo nome' })
  @ApiResponse({ status: 200, description: 'Lista paginada de marceneiros' })
  searchByNome(
    @Param('nome') nome: string,
    @Query() query: ListMarceneirosQueryDto,
  ) {
    return this.searchMarceneirosByNomeUseCase.execute({
      nome,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um novo marceneiro' })
  @ApiResponse({ status: 201, description: 'Marceneiro criado' })
  create(@Body() dto: CreateMarceneiroDto, @CurrentUser() userId: number) {
    return this.createMarceneiroUseCase.execute({
      nome: dto.nome,
      idUsuarioCadastro: userId,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um marceneiro existente' })
  @ApiResponse({ status: 200, description: 'Marceneiro atualizado' })
  @ApiResponse({ status: 404, description: 'Marceneiro não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMarceneiroDto,
  ) {
    return this.updateMarceneiroUseCase.execute({
      id,
      nome: dto.nome,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove (soft delete) um marceneiro' })
  @ApiResponse({ status: 200, description: 'Marceneiro removido' })
  @ApiResponse({ status: 404, description: 'Marceneiro não encontrado' })
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.deleteMarceneiroUseCase.execute({
      id,
      idUsuarioExclusao: userId,
    });
  }
}
