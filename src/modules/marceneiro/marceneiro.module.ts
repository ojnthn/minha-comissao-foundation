import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuthModule } from '../auth/auth.module';
import { MarceneiroController } from './presentation/controllers/marceneiro.controller';
import { CreateMarceneiroUseCase } from './application/use-cases/create-marceneiro.use-case';
import { ListMarceneirosUseCase } from './application/use-cases/list-marceneiros.use-case';
import { SearchMarceneirosByNomeUseCase } from './application/use-cases/search-marceneiros-by-nome.use-case';
import { UpdateMarceneiroUseCase } from './application/use-cases/update-marceneiro.use-case';
import { DeleteMarceneiroUseCase } from './application/use-cases/delete-marceneiro.use-case';
import { PrismaMarceneiroRepository } from './infrastructure/repositories/prisma-marceneiro.repository';
import { MARCENEIRO_REPOSITORY } from './domain/repositories/marceneiro.repository.interface';

@Module({
  imports: [AuthModule],
  controllers: [MarceneiroController],
  providers: [
    { provide: PrismaClient, useValue: new PrismaClient() },
    CreateMarceneiroUseCase,
    ListMarceneirosUseCase,
    SearchMarceneirosByNomeUseCase,
    UpdateMarceneiroUseCase,
    DeleteMarceneiroUseCase,
    { provide: MARCENEIRO_REPOSITORY, useClass: PrismaMarceneiroRepository },
  ],
})
export class MarceneiroModule {}
