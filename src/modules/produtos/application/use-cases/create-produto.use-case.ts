import { Inject, Injectable } from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '../../domain/repositories/produto.repository.interface';
import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface';

export interface CreateProdutoInput {
  nome: string;
  valorPorM2: number;
  idComissaoPorcentagemPadrao: number;
  idUsuarioCadastro: number;
}

export interface CreateProdutoOutput {
  id: number;
  nome: string;
  valorPorM2: number;
  idComissaoPorcentagemPadrao: number;
}

@Injectable()
export class CreateProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(input: CreateProdutoInput): Promise<CreateProdutoOutput> {
    const produto = await this.produtoRepository.create({
      nome: input.nome,
      valorPorM2: input.valorPorM2,
      idComissaoPorcentagemPadrao: input.idComissaoPorcentagemPadrao,
      logIdUsuarioCadastro: input.idUsuarioCadastro,
    });

    return {
      id: produto.id,
      nome: produto.nome,
      valorPorM2: produto.valorPorM2,
      idComissaoPorcentagemPadrao: produto.idComissaoPorcentagemPadrao,
    };
  }
}
