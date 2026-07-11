# Arquitetura

## Modelo

Clean Architecture com princípios SOLID. Cada módulo organizado em quatro camadas:

```
domain         → regras de negócio puras (sem dependências externas)
application    → use cases (orquestram o domínio)
infrastructure → implementações concretas (Prisma, guards, HTTP clients)
presentation   → controllers (interface HTTP)
```

## Regra de Dependência

```
presentation → application → domain
infrastructure → domain (implementa interfaces do domínio)
```

As dependências sempre apontam para dentro. `domain` nunca depende de nada externo.

## Responsabilidades por Camada

### domain

- Entidades com regras de negócio encapsuladas
- Value objects com validação própria — retornam `Result<T>`, nunca lançam exceções
- Interfaces de repositório (contratos sem implementação)
- **Proibido:** importar `@nestjs/*`, Prisma, `class-validator` ou qualquer lib de terceiros

### application

- Um use case por operação (`AuthUseCase`, `RegisterUseCase`, `GetPopularMoviesUseCase`)
- Recebe interfaces do domínio via injeção de dependência — nunca implementações concretas
- Lança `DomainException` (ou subclasse) em falha — nunca retorna `null` silenciosamente
- **Proibido:** acessar banco diretamente; conter lógica de apresentação

### infrastructure

- Implementações concretas de repositórios (ex: `PrismaUserRepository`, `TmdbMoviesRepository`)
- Guards e strategies de autenticação
- Mapper `toDomain()` entre modelo Prisma e entidade de domínio — isolado no repositório
- Clientes HTTP externos consomem `RestClient` de `shared/http`
- **Proibido:** vazar tipos Prisma para camadas superiores

### presentation

- Controllers que recebem request, delegam ao use case e retornam resposta
- DTOs com validação via `class-validator`
- Documentação Swagger por rota (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- **Proibido:** conter lógica de negócio; acessar repositórios diretamente

## SOLID Aplicado

| Princípio | Aplicação |
|---|---|
| SRP | Cada use case executa uma única operação de negócio |
| OCP | Repositórios são interfaces — trocar Prisma não afeta o domínio |
| LSP | `PrismaUserRepository` é substituível por qualquer `IUserRepository` |
| ISP | Interfaces pequenas e focadas por responsabilidade |
| DIP | Camadas superiores dependem de abstrações, não de implementações |

## Injeção de Dependência

Repositórios injetados via token string do NestJS:

```typescript
// Definição do token (domain)
export const USER_REPOSITORY = 'USER_REPOSITORY';

// Injeção no use case (application)
@Inject(USER_REPOSITORY)
private readonly userRepository: IUserRepository

// Registro no módulo (infrastructure)
{ provide: USER_REPOSITORY, useClass: PrismaUserRepository }
```

> `MoviesRepository` e `RestClient` são `abstract class` — usadas diretamente como token DI sem string constant separado.

## Globais Registrados no AppModule

| Token | Classe | Responsabilidade |
|---|---|---|
| `APP_FILTER` | `GlobalExceptionFilter` | Captura todas as exceções não tratadas |
| `APP_GUARD` | `JwtAuthGuard` | Protege todas as rotas por padrão |
| `APP_INTERCEPTOR` | `LoggingInterceptor` | Loga método, URL e tempo de resposta |

## Estrutura de Pastas

### Raiz

```
movie-db-foundation/
├── src/                    # código-fonte da aplicação
├── prisma/                 # schema e migrations
├── docker/                 # Dockerfile e docker-compose.yml
├── test/                   # testes e2e
├── docs/ai/                # documentação de contexto para IA (ver CLAUDE.md)
└── CLAUDE.md               # entrada de contexto do Claude Code
```

### src/

```
src/
├── main.ts                 # bootstrap (ValidationPipe, Swagger, porta)
├── app.module.ts           # módulo raiz (globais: filter, guard, interceptor)
├── app.controller.ts       # GET /health
├── config/
│   ├── database.config.ts  # namespace 'database'
│   └── jwt.config.ts       # namespace 'jwt'
├── modules/
│   └── {module-name}/      # ver docs/ai/modules.md
└── shared/
    ├── ai/                 # AiService, AiModule (Anthropic Claude)
    ├── cache/              # CacheService, CacheModule (Redis)
    ├── decorators/         # @Public(), @CurrentUser()
    ├── exceptions/         # DomainException e subclasses
    ├── filters/            # GlobalExceptionFilter
    ├── http/               # RestClient, HttpModule
    ├── interceptors/       # LoggingInterceptor
    └── types/              # Result<T>
```

### shared/

Infraestrutura transversal. Nada em `shared/` conhece domínio específico de nenhum módulo.

- Nada em `shared/` importa de `src/modules/`
- Só adicionar aqui o que for genuinamente reutilizável por dois ou mais módulos
- Componentes em `shared/` não recebem `CONTEXT.md` nem `README.md`

## O que é Proibido

- `domain` importar `@nestjs/*`, Prisma ou qualquer lib de terceiros
- Use cases acessarem banco diretamente
- Controllers conterem lógica de negócio
- Tipos Prisma (`PrismaUser`, etc.) vazarem para fora dos repositórios de infraestrutura
- Criar novos padrões arquiteturais sem atualizar a documentação primeiro
