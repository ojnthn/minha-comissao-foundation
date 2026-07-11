# Padrões de Código

## TypeScript

- `strict: true` habilitado no `tsconfig.json`
- Nenhum `any` explícito — usar tipos precisos ou genéricos
- Preferir `type` para union types simples; `interface` para contratos extensíveis
- Importar tipos com `import type` quando o símbolo só é usado em posição de tipo
- Propriedades de classe inicializadas na declaração ou no constructor
- Usar `!` (definite assignment) apenas em DTOs com class-validator — nunca em entidades

## Entidades e Value Objects

Constructor privado + factory method estático `create()` que retorna `Result<T>`:

```typescript
export class Email {
  private constructor(private readonly value: string) {}

  static create(raw: string): Result<Email> {
    if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      return fail('Email inválido');
    }
    return ok(new Email(raw.toLowerCase().trim()));
  }

  toString(): string {
    return this.value;
  }
}
```

- Propriedades expostas apenas via `readonly` — nunca setters públicos em entidades
- Value objects seguem o mesmo padrão: constructor privado + `create()` estático

## Result\<T\>

Padrão para operações que podem falhar no domínio — sem `throw`:

```typescript
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = <T>(error: string): Result<T> => ({ ok: false, error });
```

- Usado em entidades e value objects
- Use cases **não** usam `Result<T>` — lançam `DomainException` diretamente

## Use Cases

- Método único: `execute(input: XInput): Promise<XOutput>`
- Input e output definidos como interfaces no mesmo arquivo do use case
- Dependências recebidas via constructor com `@Inject(TOKEN)`
- Sempre `async`, mesmo que internamente síncronos
- Nunca retornam `null` silenciosamente — lançam exceção ou retornam valor válido

```typescript
export interface AuthInput { email: string; password: string; }
export interface AuthOutput { token: string; }
```

## Controllers

- Todo controller usa `@ApiTags`, `@ApiOperation`, `@ApiResponse` para Swagger
- Rotas públicas usam `@Public()` (de `shared/decorators`)
- Rotas protegidas não precisam de anotação — `JwtAuthGuard` é global
- Usuário autenticado extraído via `@CurrentUser()` — retorna `JwtPayload: { sub, email }`
- Sem lógica de negócio — delegação 100% ao use case

## Async/Await

- Todo acesso a banco via Prisma é `async/await`
- Chamadas independentes a APIs externas devem ser paralelizadas com `Promise.all`

## Imports

- Imports relativos (`../../../../shared/...`) — sem path aliases configurados
- `import type` quando o símbolo não tem uso em runtime

## Boas Práticas

- Preferir composição à herança
- Nunca criar classes utilitárias gigantes
- Nunca usar métodos estáticos quando injeção de dependência for possível
- Sem `console.log` em código de produção — usar `Logger` do NestJS
- Sem código comentado no PR final
- Sem abstrações para uso hipotético futuro

## Nomenclatura

| Artefato | Padrão de arquivo | Classe | Exemplo |
|---|---|---|---|
| Entidade de domínio | `{name}.entity.ts` | PascalCase | `user.entity.ts` → `User` |
| Interface de repositório | `{name}.repository.interface.ts` | `I` + PascalCase | `IUserRepository` |
| Token de repositório | — | `SCREAMING_SNAKE_CASE` | `USER_REPOSITORY` |
| Use case | `{action}.use-case.ts` | PascalCase + `UseCase` | `AuthUseCase` |
| Spec de use case | `{action}.use-case.spec.ts` | — | — |
| Repositório Prisma | `prisma-{name}.repository.ts` | `Prisma` + PascalCase + `Repository` | `PrismaUserRepository` |
| Repositório externo | `{provider}-{name}.repository.ts` | PascalCase + `Repository` | `TmdbMoviesRepository` |
| Controller | `{name}.controller.ts` | PascalCase + `Controller` | `AuthController` |
| DTO | `{name}.dto.ts` | PascalCase + `Dto` | `AuthDto` |
| Guard | `{name}.guard.ts` | PascalCase + `Guard` | `JwtAuthGuard` |
| Strategy | `{name}.strategy.ts` | PascalCase + `Strategy` | `JwtStrategy` |
| Value Object | `{name}.vo.ts` | PascalCase | `Email` |
| Módulo | `{name}.module.ts` | PascalCase + `Module` | `AuthModule` |
| Filter | `{name}.filter.ts` | PascalCase + `Filter` | `GlobalExceptionFilter` |
| Interceptor | `{name}.interceptor.ts` | PascalCase + `Interceptor` | `LoggingInterceptor` |
| Decorator | `{name}.decorator.ts` | camelCase (função) | `CurrentUser` |

### Convenções gerais

- Nomes de arquivo: `kebab-case`
- Classes: `PascalCase`
- Interfaces: prefixo `I` + `PascalCase`
- Tokens DI string: `SCREAMING_SNAKE_CASE`
- Métodos e propriedades: `camelCase`
- Um arquivo, uma responsabilidade

## O que é Proibido

- `any` explícito no código novo
- Setters públicos em entidades de domínio
- Lógica de negócio em controllers
- Acesso direto ao banco em use cases
- Libs de terceiros no domínio
- `console.log` em produção
- `throw new Error()` diretamente em código de domínio — usar `Result<T>` ou `DomainException`
