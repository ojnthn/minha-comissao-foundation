import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import { PRODUTO_REPOSITORY } from '../../domain/repositories/produto.repository.interface';
import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface';

export interface GetProdutoInput {
  id: number;
}

export interface GetProdutoOutput {
  id: number;
  nome: string;
  idComissaoPorcentagemPadrao: number;
}

@Injectable()
export class GetProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(input: GetProdutoInput): Promise<GetProdutoOutput> {
    const produto = await this.produtoRepository.findById(input.id);

    if (!produto || produto.isExcluido()) {
      throw new NotFoundException('Produto não encontrado');
    }

    return {
      id: produto.id,
      nome: produto.nome,
      idComissaoPorcentagemPadrao: produto.idComissaoPorcentagemPadrao,
    };
  }
}
