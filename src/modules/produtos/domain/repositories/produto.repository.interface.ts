import { Produto } from '../entities/produto.entity';

export const PRODUTO_REPOSITORY = 'PRODUTO_REPOSITORY';

export interface FindAllProdutosResult {
  produtos: Produto[];
  hasNext: boolean;
}

export interface CreateProdutoData {
  nome: string;
  idComissaoPorcentagemPadrao: number;
  logIdUsuarioCadastro: number;
}

export interface UpdateProdutoData {
  nome?: string;
  idComissaoPorcentagemPadrao?: number;
}

export interface IProdutoRepository {
  create(data: CreateProdutoData): Promise<Produto>;
  update(id: number, data: UpdateProdutoData): Promise<Produto>;
  softDelete(id: number, idUsuarioExclusao: number): Promise<void>;
  findById(id: number): Promise<Produto | null>;
  findAll(page: number, limit: number): Promise<FindAllProdutosResult>;
}
