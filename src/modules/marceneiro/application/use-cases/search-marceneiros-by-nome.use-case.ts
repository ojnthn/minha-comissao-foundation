import { Inject, Injectable } from '@nestjs/common';
import { MARCENEIRO_REPOSITORY } from '../../domain/repositories/marceneiro.repository.interface';
import type { IMarceneiroRepository } from '../../domain/repositories/marceneiro.repository.interface';

export interface SearchMarceneirosByNomeInput {
  nome: string;
  page: number;
  limit: number;
}

export interface SearchMarceneirosByNomeOutput {
  paginacao: {
    atual: number;
    proxima: number;
  };
  detalhes: Array<{
    id: number;
    nome: string;
  }>;
}

@Injectable()
export class SearchMarceneirosByNomeUseCase {
  constructor(
    @Inject(MARCENEIRO_REPOSITORY)
    private readonly marceneiroRepository: IMarceneiroRepository,
  ) {}

  async execute(
    input: SearchMarceneirosByNomeInput,
  ): Promise<SearchMarceneirosByNomeOutput> {
    const { marceneiros, hasNext } = await this.marceneiroRepository.findByNome(
      input.nome,
      input.page,
      input.limit,
    );

    return {
      paginacao: {
        atual: input.page,
        proxima: hasNext ? input.page + 1 : input.page,
      },
      detalhes: marceneiros.map((marceneiro) => ({
        id: marceneiro.id,
        nome: marceneiro.nome,
      })),
    };
  }
}
