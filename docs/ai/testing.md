# Testes

## Comandos

```bash
npm run test        # unit tests
npm run test:e2e    # e2e tests
npm run test:cov    # cobertura
```

## Unit Tests (Use Cases)

- Arquivo spec no mesmo diretório do use case: `{acao}.use-case.spec.ts`
- Repositório mockado — nunca usar banco real em unit tests
- Testar: happy path, falha de regra de negócio, exceção esperada

### Estrutura padrão

```typescript
describe('AuthUseCase', () => {
  let useCase: AuthUseCase;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    repository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    useCase = new AuthUseCase(repository, jwtService);
  });

  it('deve retornar token para credenciais válidas', async () => { ... });
  it('deve lançar UnauthorizedException para email não encontrado', async () => { ... });
  it('deve lançar UnauthorizedException para senha inválida', async () => { ... });
});
```

## E2E Tests

- Localizados em `test/`
- Usam o app NestJS completo (via `docker-compose`)
- Cobrem: happy path + pelo menos dois casos de erro por endpoint

```
test/
├── jest-e2e.json
├── app.e2e-spec.ts       # GET /health
└── auth.e2e-spec.ts      # POST /auth, POST /auth/register
```

## Critérios de Aceite

- [ ] Unit test do use case com repositório mockado
- [ ] E2E test cobrindo happy path e pelo menos dois casos de erro
- [ ] `npm run test` passando sem falhas
- [ ] `npm run test:e2e` passando sem falhas
- [ ] Sem `console.log` em arquivos de teste
- [ ] Sem testes `skip`ados sem justificativa

## O que é Proibido

- Usar banco real em unit tests
- Mockar repositórios em testes E2E — devem usar infraestrutura real
- Testes que cobrem apenas o happy path sem casos de erro
- `console.log` em arquivos de spec
