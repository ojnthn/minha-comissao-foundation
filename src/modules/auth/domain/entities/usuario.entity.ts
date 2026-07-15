import { fail, ok, Result } from '../../../../shared/types/result';

export interface UsuarioProps {
  id: number;
  nome: string;
  email: string;
  senha: string;
}

export class Usuario {
  private constructor(private readonly props: UsuarioProps) {}

  static create(props: UsuarioProps): Result<Usuario> {
    if (!props.email || !props.email.trim()) {
      return fail('Email do usuário é obrigatório');
    }
    if (!props.senha || !props.senha.trim()) {
      return fail('Senha do usuário é obrigatória');
    }
    return ok(new Usuario(props));
  }

  get id(): number {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get email(): string {
    return this.props.email;
  }

  get senha(): string {
    return this.props.senha;
  }
}
