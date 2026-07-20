import { fail, ok, Result } from '../../../../shared/types/result';

export interface MarceneiroProps {
  id: number;
  nome: string;
  telefone: string | null;
  logDataCadastro: Date;
  logIdUsuarioCadastro: number;
  logDataExclusao: Date | null;
  logIdUsuarioExclusao: number | null;
}

export class Marceneiro {
  private constructor(private readonly props: MarceneiroProps) {}

  static create(props: MarceneiroProps): Result<Marceneiro> {
    if (!props.nome || !props.nome.trim()) {
      return fail('Nome do marceneiro é obrigatório');
    }
    return ok(new Marceneiro(props));
  }

  get id(): number {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get telefone(): string | null {
    return this.props.telefone;
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
