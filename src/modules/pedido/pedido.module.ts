import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuthModule } from '../auth/auth.module';
import { PedidoController } from './presentation/controllers/pedido.controller';
import { CreatePedidoUseCase } from './application/use-cases/create-pedido.use-case';
import { ListPedidosUseCase } from './application/use-cases/list-pedidos.use-case';
import { UpdatePedidoUseCase } from './application/use-cases/update-pedido.use-case';
import { DeletePedidoUseCase } from './application/use-cases/delete-pedido.use-case';
import { PrismaPedidoRepository } from './infrastructure/repositories/prisma-pedido.repository';
import { PEDIDO_REPOSITORY } from './domain/repositories/pedido.repository.interface';

@Module({
  imports: [AuthModule],
  controllers: [PedidoController],
  providers: [
    { provide: PrismaClient, useValue: new PrismaClient() },
    CreatePedidoUseCase,
    ListPedidosUseCase,
    UpdatePedidoUseCase,
    DeletePedidoUseCase,
    { provide: PEDIDO_REPOSITORY, useClass: PrismaPedidoRepository },
  ],
})
export class PedidoModule {}
