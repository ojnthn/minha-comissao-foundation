import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import { PRODUTO_REPOSITORY } from '../../domain/repositories/produto.repository.interface';
import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface';

export interface UpdateProdutoInput {
  id: number;
  nome?: string;
  valorPorM2?: number;
  idComissaoPorcentagemPadrao?: number;
}

export interface UpdateProdutoOutput {
  id: number;
  nome: string;
  valorPorM2: number;
  idComissaoPorcentagemPadrao: number;
}

@Injectable()
export class UpdateProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(input: UpdateProdutoInput): Promise<UpdateProdutoOutput> {
    const existente = await this.produtoRepository.findById(input.id);
    if (!existente || existente.isExcluido()) {
      throw new NotFoundException('Produto não encontrado');
    }

    const produto = await this.produtoRepository.update(input.id, {
      nome: input.nome,
      valorPorM2: input.valorPorM2,
      idComissaoPorcentagemPadrao: input.idComissaoPorcentagemPadrao,
    });

    return {
      id: produto.id,
      nome: produto.nome,
      valorPorM2: produto.valorPorM2,
      idComissaoPorcentagemPadrao: produto.idComissaoPorcentagemPadrao,
    };
  }
}
