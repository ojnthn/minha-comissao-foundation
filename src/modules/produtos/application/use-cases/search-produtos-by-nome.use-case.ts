import { Inject, Injectable } from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '../../domain/repositories/produto.repository.interface';
import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface';

export interface SearchProdutosByNomeInput {
  nome: string;
  page: number;
  limit: number;
}

export interface SearchProdutosByNomeOutput {
  pagination: {
    current: number;
    next: number | null;
  };
  details: Array<{
    id: number;
    nome: string;
    valorPorM2: number;
    idComissaoPorcentagemPadrao: number;
  }>;
}

@Injectable()
export class SearchProdutosByNomeUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(
    input: SearchProdutosByNomeInput,
  ): Promise<SearchProdutosByNomeOutput> {
    const { produtos, hasNext } = await this.produtoRepository.findByNome(
      input.nome,
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
        valorPorM2: produto.valorPorM2,
        idComissaoPorcentagemPadrao: produto.idComissaoPorcentagemPadrao,
      })),
    };
  }
}
