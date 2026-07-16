import { Pedido } from '../entities/pedido.entity';

export const PEDIDO_REPOSITORY = 'PEDIDO_REPOSITORY';

export interface PedidoProdutoInput {
  idProduto: number;
  valorProduto: number;
  valorPorcentagem: number;
}

export interface CriarPedidoData {
  valor: number;
  idMarceneiro: number;
  logIdUsuarioCadastro: number;
  produtos: PedidoProdutoInput[];
}

export interface AtualizarPedidoData {
  valor?: number;
  idMarceneiro?: number;
  produtos?: PedidoProdutoInput[];
}

export interface ListarPedidosFiltro {
  idMarceneiro?: number;
  idUsuarioCadastro?: number;
  dataInicio?: Date;
  dataFim?: Date;
  page: number;
  limit: number;
}

export interface PedidoListagemProdutoItem {
  id: number;
  nome: string;
  valorProduto: number;
  valorPorcentagem: number;
}

export interface PedidoListagemItem {
  id: number;
  valor: number;
  idMarceneiro: number;
  marceneiroNome: string;
  usuarioCadastro: {
    id: number;
    nome: string;
  };
  produtos: PedidoListagemProdutoItem[];
}

export interface ListarPedidosResult {
  data: PedidoListagemItem[];
  total: number;
}

export interface IPedidoRepository {
  criar(data: CriarPedidoData): Promise<Pedido>;
  atualizar(id: number, data: AtualizarPedidoData): Promise<Pedido>;
  excluir(id: number, idUsuarioExclusao: number): Promise<void>;
  buscarPorId(id: number): Promise<Pedido | null>;
  listar(filtro: ListarPedidosFiltro): Promise<ListarPedidosResult>;
  marceneiroAtivoExiste(id: number): Promise<boolean>;
  produtosAtivosExistentes(ids: number[]): Promise<number[]>;
}
