import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuthModule } from '../auth/auth.module';
import { ProdutosController } from './presentation/controllers/produtos.controller';
import { CreateProdutoUseCase } from './application/use-cases/create-produto.use-case';
import { GetProdutoUseCase } from './application/use-cases/get-produto.use-case';
import { ListProdutosUseCase } from './application/use-cases/list-produtos.use-case';
import { SearchProdutosByNomeUseCase } from './application/use-cases/search-produtos-by-nome.use-case';
import { UpdateProdutoUseCase } from './application/use-cases/update-produto.use-case';
import { DeleteProdutoUseCase } from './application/use-cases/delete-produto.use-case';
import { PrismaProdutoRepository } from './infrastructure/repositories/prisma-produto.repository';
import { PRODUTO_REPOSITORY } from './domain/repositories/produto.repository.interface';

@Module({
  imports: [AuthModule],
  controllers: [ProdutosController],
  providers: [
    { provide: PrismaClient, useValue: new PrismaClient() },
    CreateProdutoUseCase,
    GetProdutoUseCase,
    ListProdutosUseCase,
    SearchProdutosByNomeUseCase,
    UpdateProdutoUseCase,
    DeleteProdutoUseCase,
    { provide: PRODUTO_REPOSITORY, useClass: PrismaProdutoRepository },
  ],
})
export class ProdutosModule {}
