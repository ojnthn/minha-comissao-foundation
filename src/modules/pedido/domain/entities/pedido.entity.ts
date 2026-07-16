import { fail, ok, Result } from '../../../../shared/types/result';

export interface PedidoProdutoProps {
  idProduto: number;
  valorProduto: number;
  valorPorcentagem: number;
}

export interface PedidoProps {
  id: number;
  valor: number;
  idMarceneiro: number;
  produtos: PedidoProdutoProps[];
  logDataCadastro: Date;
  logIdUsuarioCadastro: number;
  logDataExclusao: Date | null;
  logIdUsuarioExclusao: number | null;
}

export class Pedido {
  private constructor(private readonly props: PedidoProps) {}

  static create(props: PedidoProps): Result<Pedido> {
    if (typeof props.valor !== 'number' || props.valor <= 0) {
      return fail('Valor do pedido é obrigatório');
    }
    if (!Number.isInteger(props.idMarceneiro) || props.idMarceneiro <= 0) {
      return fail('Marceneiro do pedido é obrigatório');
    }
    if (!props.produtos || props.produtos.length === 0) {
      return fail('Pedido deve ter ao menos um produto');
    }
    return ok(new Pedido(props));
  }

  get id(): number {
    return this.props.id;
  }

  get valor(): number {
    return this.props.valor;
  }

  get idMarceneiro(): number {
    return this.props.idMarceneiro;
  }

  get produtos(): PedidoProdutoProps[] {
    return this.props.produtos;
  }

  get logDataCadastro(): Date {
    return this.props.logDataCadastro;
  }

  get logIdUsuarioCadastro(): number {
    return this.props.logIdUsuarioCadastro;
  }

  get logDataExclusao(): Date | null {
    return this.props.logDataExclusao;
  }

  get logIdUsuarioExclusao(): number | null {
    return this.props.logIdUsuarioExclusao;
  }

  isExcluido(): boolean {
    return this.props.logDataExclusao !== null;
  }
}
