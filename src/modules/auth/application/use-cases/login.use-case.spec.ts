import { UnauthorizedException } from '../../../../shared/exceptions/domain.exception';
import { PasswordHasherService } from '../../../../shared/crypto/password-hasher.service';
import { JwtTokenService } from '../../../../shared/jwt/jwt-token.service';
import { Usuario } from '../../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../../domain/repositories/usuario.repository.interface';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase', () => {
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;
  let passwordHasher: jest.Mocked<PasswordHasherService>;
  let jwtTokenService: jest.Mocked<
    Pick<JwtTokenService, 'generate' | 'verify'>
  >;
  let useCase: LoginUseCase;

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
    usuarioRepository = { findByEmail: jest.fn() };
    passwordHasher = { compare: jest.fn() };
    jwtTokenService = {
      generate: jest.fn(),
      verify: jest.fn(),
    };

    useCase = new LoginUseCase(
      usuarioRepository,
      passwordHasher,
      jwtTokenService as unknown as JwtTokenService,
    );
  });

  it('retorna um token quando credenciais são válidas', async () => {
    usuarioRepository.findByEmail.mockResolvedValue(usuario.value);
    passwordHasher.compare.mockResolvedValue(true);
    jwtTokenService.generate.mockReturnValue('jwt-token');

    const result = await useCase.execute({
      email: 'jonathan19ricardo@gmail.com',
      senha: '123',
    });

    expect(result).toEqual({ token: 'jwt-token' });
    expect(jwtTokenService.generate).toHaveBeenCalledWith({ sub: 1 });
  });

  it('lança UnauthorizedException quando usuário não existe', async () => {
    usuarioRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'inexistente@x.com', senha: '123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lança UnauthorizedException quando senha é inválida', async () => {
    usuarioRepository.findByEmail.mockResolvedValue(usuario.value);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'jonathan19ricardo@gmail.com',
        senha: 'errada',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
