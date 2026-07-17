import { fail, ok, Result } from '../../../../shared/types/result';

export interface ComissaoPorcentagemProps {
  id: number;
  nome: string;
  valor: number;
}

export class ComissaoPorcentagem {
  private constructor(private readonly props: ComissaoPorcentagemProps) {}

  static create(props: ComissaoPorcentagemProps): Result<ComissaoPorcentagem> {
    if (!props.nome || !props.nome.trim()) {
      return fail('Nome da comissão percentual é obrigatório');
    }
    if (typeof props.valor !== 'number' || Number.isNaN(props.valor)) {
      return fail('Valor da comissão percentual é obrigatório');
    }
    return ok(new ComissaoPorcentagem(props));
  }

  get id(): number {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get valor(): number {
    return this.props.valor;
  }
}
