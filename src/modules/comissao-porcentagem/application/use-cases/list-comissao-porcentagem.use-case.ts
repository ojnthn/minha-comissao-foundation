import { Inject, Injectable } from '@nestjs/common';
import { COMISSAO_PORCENTAGEM_REPOSITORY } from '../../domain/repositories/comissao-porcentagem.repository.interface';
import type { IComissaoPorcentagemRepository } from '../../domain/repositories/comissao-porcentagem.repository.interface';

export interface ListComissaoPorcentagemInput {
  page: number;
  limit: number;
}

export interface ListComissaoPorcentagemOutput {
  pagination: {
    current: number;
    next: number | null;
  };
  detalhes: Array<{
    id: number;
    descricao: string;
    valor: number;
  }>;
}

@Injectable()
export class ListComissaoPorcentagemUseCase {
  constructor(
    @Inject(COMISSAO_PORCENTAGEM_REPOSITORY)
    private readonly comissaoPorcentagemRepository: IComissaoPorcentagemRepository,
  ) {}

  async execute(
    input: ListComissaoPorcentagemInput,
  ): Promise<ListComissaoPorcentagemOutput> {
    const { comissoes, hasNext } =
      await this.comissaoPorcentagemRepository.findAll(input.page, input.limit);

    return {
      pagination: {
        current: input.page,
        next: hasNext ? input.page + 1 : null,
      },
      detalhes: comissoes.map((comissao) => ({
        id: comissao.id,
        descricao: comissao.nome,
        valor: comissao.valor,
      })),
    };
  }
}
