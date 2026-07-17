import { ComissaoPorcentagem } from '../entities/comissao-porcentagem.entity';

export const COMISSAO_PORCENTAGEM_REPOSITORY =
  'COMISSAO_PORCENTAGEM_REPOSITORY';

export interface FindAllComissaoPorcentagemResult {
  comissoes: ComissaoPorcentagem[];
  hasNext: boolean;
}

export interface IComissaoPorcentagemRepository {
  findAll(
    page: number,
    limit: number,
  ): Promise<FindAllComissaoPorcentagemResult>;
}
