import { fail, ok, Result } from '../../../../shared/types/result';

export interface ProdutoProps {
  id: number;
  nome: string;
  idComissaoPorcentagemPadrao: number;
  logDataCadastro: Date;
  logIdUsuarioCadastro: number;
  logDataExclusao: Date | null;
  logIdUsuarioExclusao: number | null;
}

export class Produto {
  private constructor(private readonly props: ProdutoProps) {}

  static create(props: ProdutoProps): Result<Produto> {
    if (!props.nome || !props.nome.trim()) {
      return fail('Nome do produto é obrigatório');
    }
    if (
      !Number.isInteger(props.idComissaoPorcentagemPadrao) ||
      props.idComissaoPorcentagemPadrao <= 0
    ) {
      return fail('Comissão padrão do produto é obrigatória');
    }
    return ok(new Produto(props));
  }

  get id(): number {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get idComissaoPorcentagemPadrao(): number {
    return this.props.idComissaoPorcentagemPadrao;
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
