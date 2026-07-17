import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ComissaoPorcentagemController } from './presentation/controllers/comissao-porcentagem.controller';
import { ListComissaoPorcentagemUseCase } from './application/use-cases/list-comissao-porcentagem.use-case';
import { PrismaComissaoPorcentagemRepository } from './infrastructure/repositories/prisma-comissao-porcentagem.repository';
import { COMISSAO_PORCENTAGEM_REPOSITORY } from './domain/repositories/comissao-porcentagem.repository.interface';

@Module({
  controllers: [ComissaoPorcentagemController],
  providers: [
    { provide: PrismaClient, useValue: new PrismaClient() },
    ListComissaoPorcentagemUseCase,
    {
      provide: COMISSAO_PORCENTAGEM_REPOSITORY,
      useClass: PrismaComissaoPorcentagemRepository,
    },
  ],
})
export class ComissaoPorcentagemModule {}
