import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { CreatePedidoDto } from '../../application/dtos/create-pedido.dto';
import { UpdatePedidoDto } from '../../application/dtos/update-pedido.dto';
import { ListPedidosQueryDto } from '../../application/dtos/list-pedidos-query.dto';
import { CreatePedidoUseCase } from '../../application/use-cases/create-pedido.use-case';
import { ListPedidosUseCase } from '../../application/use-cases/list-pedidos.use-case';
import { UpdatePedidoUseCase } from '../../application/use-cases/update-pedido.use-case';
import { DeletePedidoUseCase } from '../../application/use-cases/delete-pedido.use-case';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';

@ApiTags('pedidos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidoController {
  constructor(
    private readonly createPedidoUseCase: CreatePedidoUseCase,
    private readonly listPedidosUseCase: ListPedidosUseCase,
    private readonly updatePedidoUseCase: UpdatePedidoUseCase,
    private readonly deletePedidoUseCase: DeletePedidoUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado' })
  @ApiResponse({ status: 400, description: 'Marceneiro ou produto inválido' })
  create(@Body() dto: CreatePedidoDto, @CurrentUser() userId: number) {
    return this.createPedidoUseCase.execute({
      valor: dto.valor,
      idMarceneiro: dto.idMarceneiro,
      produtos: dto.produtos,
      idUsuarioCadastro: userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lista pedidos com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista paginada de pedidos' })
  list(@Query() query: ListPedidosQueryDto, @CurrentUser() userId: number) {
    return this.listPedidosUseCase.execute({
      idMarceneiro: query.idMarceneiro,
      porUsuario: query.porUsuario,
      idUsuarioLogado: userId,
      dataInicio: query.dataInicio ? new Date(query.dataInicio) : undefined,
      dataFim: query.dataFim ? new Date(query.dataFim) : undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ordem: query.ordem,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um pedido existente' })
  @ApiResponse({ status: 200, description: 'Pedido atualizado' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePedidoDto) {
    return this.updatePedidoUseCase.execute({
      id,
      valor: dto.valor,
      idMarceneiro: dto.idMarceneiro,
      produtos: dto.produtos,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove (soft delete) um pedido' })
  @ApiResponse({ status: 204, description: 'Pedido removido' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ): Promise<void> {
    await this.deletePedidoUseCase.execute({
      id,
      idUsuarioExclusao: userId,
    });
  }
}
