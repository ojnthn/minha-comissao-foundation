import { Inject, Injectable } from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '../../domain/repositories/produto.repository.interface';
import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface';

export interface ListProdutosInput {
  page: number;
  limit: number;
}

export interface ListProdutosOutput {
  pagination: {
    current: number;
    next: number | null;
  };
  details: Array<{
    id: number;
    nome: string;
    idComissaoPorcentagemPadrao: number;
  }>;
}

@Injectable()
export class ListProdutosUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(input: ListProdutosInput): Promise<ListProdutosOutput> {
    const { produtos, hasNext } = await this.produtoRepository.findAll(
      input.page,
      input.limit,
    );

    return {
      pagination: {
        current: input.page,
        next: hasNext ? input.page + 1 : null,
      },
      details: produtos.map((produto) => ({
        id: produto.id,
        nome: produto.nome,
        idComissaoPorcentagemPadrao: produto.idComissaoPorcentagemPadrao,
      })),
    };
  }
}
