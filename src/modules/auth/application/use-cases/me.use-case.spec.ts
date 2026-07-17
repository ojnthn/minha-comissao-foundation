import { UnauthorizedException } from '../../../../shared/exceptions/domain.exception';
import { Usuario } from '../../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../../domain/repositories/usuario.repository.interface';
import { MeUseCase } from './me.use-case';

describe('MeUseCase', () => {
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;
  let useCase: MeUseCase;

  const usuario = Usuario.create({
    id: 1,
    nome: 'Jonathan',
    email: 'jonathan19ricardo@gmail.com',
    senha: 'hash-armazenado',
  });
  if (!usuario.ok) {
    throw new Error('Fixture inválida');
  }

  beforeEach(() => {
    usuarioRepository = { findByEmail: jest.fn(), findById: jest.fn() };
    useCase = new MeUseCase(usuarioRepository);
  });

  it('retorna nome e email do usuário logado', async () => {
    usuarioRepository.findById.mockResolvedValue(usuario.value);

    const result = await useCase.execute({ userId: 1 });

    expect(result).toEqual({
      nome: 'Jonathan',
      email: 'jonathan19ricardo@gmail.com',
    });
  });

  it('lança UnauthorizedException quando usuário não existe', async () => {
    usuarioRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 999 })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
