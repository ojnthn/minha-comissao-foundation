# CONTEXT — Auth

## Responsabilidade

`AuthModule` autentica um `Usuario` já cadastrado (email + senha) e emite um JWT de curta duração.

> SRP: este módulo tem exatamente uma razão para mudar — regras de autenticação.

---

## Escopo

### Dentro do escopo

- Login por email/senha, retornando um JWT
- Verificação de senha via hash (bcrypt)
- Emissão de JWT contendo o `id` do usuário, expirando em 15 minutos
- Retornar nome/email do usuário logado (`GET /auth`), a partir do id extraído do JWT

### Fora do escopo

- Cadastro/registro de usuário (não existe endpoint de signup ainda — `Usuario.senha` deve já estar populado com hash bcrypt via seed/migration)
- Refresh token / logout / revogação de token

---

## Casos de Uso

| Use Case | Arquivo | Rota |
|---|---|---|
| `LoginUseCase` | `application/use-cases/login.use-case.ts` | `POST /auth/login` |
| `MeUseCase` | `application/use-cases/me.use-case.ts` | `GET /auth` (protegida por `JwtAuthGuard`) |

`JwtAuthGuard` (não é use case, mas protege rotas de outros módulos): `infrastructure/guards/jwt-auth.guard.ts`. Extrai o Bearer token do header `Authorization`, chama `JwtTokenService.verify()` e popula `request.user = { id: payload.sub }`. Usado via `@UseGuards(JwtAuthGuard)` + decorator `@CurrentUser()` (`infrastructure/decorators/current-user.decorator.ts`).

---

## Entidades de Domínio

### Usuario

| Campo | Tipo | Invariante |
|---|---|---|
| `id` | `number` | Gerado pelo banco (auto-incremento); imutável |
| `nome` | `string` | Obrigatório |
| `email` | `string` | Obrigatório, único (constraint no banco) |
| `senha` | `string` | Obrigatório; hash bcrypt armazenado, nunca texto plano |

> Entidade usa constructor privado + factory `create()` que retorna `Result<T>` (mesmo padrão de `Produto`).

## Value Objects

Não se aplica — validação de formato de email é feita no DTO (`class-validator`), não na entidade.

---

## Interface do Repositório

```typescript
// domain/repositories/usuario.repository.interface.ts

export const USUARIO_REPOSITORY = 'USUARIO_REPOSITORY';

export interface IUsuarioRepository {
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: number): Promise<Usuario | null>;
}
```

---

## Contrato da API

### `POST /auth/login`

**Request body:**
```json
{ "email": "jonathan19ricardo@gmail.com", "senha": "123" }
```

**Response (200):**
```json
{ "token": "jwt-token" }
```

**Response (401):**
```json
{ "statusCode": 401, "message": "Credenciais inválidas" }
```

### `GET /auth`

**Request headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{ "nome": "Jonathan", "email": "jonathan19ricardo@gmail.com" }
```

**Response (401):**
```json
{ "statusCode": 401, "message": "Token inválido ou expirado" }
```

---

## Erros Esperados

| Exceção | Código HTTP | Quando ocorre |
|---|---|---|
| `UnauthorizedException` | `401` | Email não encontrado OU senha não confere (mensagem genérica igual nos dois casos, para não vazar quais emails existem) |
| `UnauthorizedException` (via `JwtAuthGuard`) | `401` | Rota protegida chamada sem header `Authorization: Bearer <token>`, ou com token inválido/expirado |
| `UnauthorizedException` | `401` | `GET /auth`: id do JWT não corresponde a nenhum usuário existente (usuário removido após emissão do token) |

---

## Fluxo de Execução

### LoginUseCase

```
1. Controller recebe LoginDto → chama LoginUseCase.execute(input)
2. UseCase busca usuário via IUsuarioRepository.findByEmail()
3. [Se não existe] → throw UnauthorizedException('Credenciais inválidas') → HTTP 401
4. UseCase compara senha recebida com hash armazenado via PasswordHasherService.compare()
5. [Se não confere] → throw UnauthorizedException('Credenciais inválidas') → HTTP 401
6. [Se confere] → JwtTokenService.generate({ sub: usuario.id }) → retorna { token }
```

### MeUseCase

```
1. JwtAuthGuard já validou o token e populou request.user = { id }
2. Controller extrai o id via @CurrentUser() → chama MeUseCase.execute({ userId })
3. UseCase busca usuário via IUsuarioRepository.findById()
4. [Se não existe] → throw UnauthorizedException('Usuário não encontrado') → HTTP 401
5. [Se existe] → retorna { nome, email }
```

---

## Limites

- Não acessa banco diretamente — apenas via `IUsuarioRepository` (DIP)
- Não conhece `PrismaUsuarioRepository` (OCP)
- Domain não importa `@nestjs/*`, Prisma, `class-validator`, `bcrypt` ou `jsonwebtoken`
- Controller não contém lógica de negócio
- Use case não importa `bcrypt`/`jsonwebtoken` diretamente — depende das abstrações `shared/crypto/password-hasher.service.ts` e `shared/jwt/jwt-token.service.ts`

---

## Regras Obrigatórias

- JWT expira em 15 minutos (`JWT_EXPIRATION` em `.env`, default `15m` — regra de negócio da spec, não deve ser alterado sem atualizar a spec primeiro)
- Payload do JWT contém `sub` (id do usuário)
- Senha comparada apenas via hash (bcrypt) — nunca em texto plano
- Mensagem de erro de credenciais inválidas é sempre genérica (não revela se o email existe)

---

## O que é Proibido

- Importar `@nestjs/*`, Prisma, `bcrypt` ou `jsonwebtoken` no domínio
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Retornar mensagens de erro diferentes para "email não existe" vs "senha errada"
- Logar senha (mesmo em erro) ou o token gerado

---

## Dependências Permitidas

| Camada | Pode depender de |
|---|---|
| `domain` | Apenas `shared/types` (`Result<T>`) |
| `application` | `domain/`, `shared/exceptions`, `shared/types`, `shared/crypto`, `shared/jwt` |
| `infrastructure` | `domain/`, `@nestjs/*`, `@prisma/client` |
| `presentation` | `application/dtos`, use cases via DI, `@nestjs/*` |

---

## Dependências Proibidas

| Camada | Proibido |
|---|---|
| `domain` | `@nestjs/*`, Prisma, `class-validator`, `bcrypt`, `jsonwebtoken` |
| `application` | `@prisma/client`, `PrismaClient`, `bcrypt`/`jsonwebtoken` diretos (usar abstrações `shared/`) |
| `presentation` | Repositórios diretamente; lógica de negócio |

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Chave usada para assinar/verificar o JWT |
| `JWT_EXPIRATION` | Não (default `15m`) | Tempo de expiração do token — regra de negócio da spec fixa em 15 minutos |

---

## Convenções

| Artefato | Arquivo | Classe |
|---|---|---|
| Entidade | `domain/entities/usuario.entity.ts` | `Usuario` |
| Interface repositório | `domain/repositories/usuario.repository.interface.ts` | `IUsuarioRepository` |
| Token DI | mesmo arquivo da interface | `USUARIO_REPOSITORY` |
| Use case | `application/use-cases/login.use-case.ts` | `LoginUseCase` |
| Use case | `application/use-cases/me.use-case.ts` | `MeUseCase` |
| DTO | `application/dtos/login.dto.ts` | `LoginDto` |
| Repositório Prisma | `infrastructure/repositories/prisma-usuario.repository.ts` | `PrismaUsuarioRepository` |
| Controller | `presentation/controllers/auth.controller.ts` | `AuthController` |
| Abstração JWT (shared) | `shared/jwt/jwt-token.service.ts` | `JwtTokenService` |
| Abstração hash (shared) | `shared/crypto/password-hasher.service.ts` | `PasswordHasherService` |
| Guard JWT | `infrastructure/guards/jwt-auth.guard.ts` | `JwtAuthGuard` |
| Decorator usuário atual | `infrastructure/decorators/current-user.decorator.ts` | `CurrentUser` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `shared/exceptions/domain.exception` | Use case lança `UnauthorizedException` |
| `shared/types/result` | `Usuario.create()` retorna `Result<Usuario>` |
| `shared/jwt/jwt-token.service` | Emite/valida JWT — usado por `LoginUseCase` |
| `shared/crypto/password-hasher.service` | Compara senha em texto plano com hash bcrypt |
| `produtos` módulo | Importa `AuthModule` para usar `JwtAuthGuard` + `@CurrentUser()` nas rotas `POST /produtos` e `DELETE /produtos/:id`, em vez de receber `idUsuarioCadastro`/`idUsuarioExclusao` no body |

---

## Decisões Técnicas

- **bcrypt em vez de argon2/scrypt**: escolhido explicitamente pelo usuário (ver spec) — padrão de mercado, boa integração com Nest/Node, sem complicação de build nativo (argon2 tem binding C mais problemático em Docker).
- **`jsonwebtoken` direto em vez de `@nestjs/jwt`**: a spec pede explicitamente uma "abstração do jwt dentro de shared" — envolver `jsonwebtoken` num serviço próprio (`JwtTokenService`) atende isso diretamente, sem depender de outro pacote Nest que já é, ele mesmo, uma abstração sobre `jsonwebtoken`.
- **Campos `email`/`senha` em vez de `user`/`pass`**: a spec original usa nomes genéricos de template (`user`/`pass`); seguindo o mesmo precedente já documentado em `produtos/CONTEXT.md` (spec em inglês vs domínio em português), adotados os nomes consistentes com o schema Prisma (`Usuario.email`, `Usuario.senha`).
- **`JWT_EXPIRATION` default `15m`**: a spec exige expiração de 15 minutos como regra de negócio. `.env.example` já tinha `JWT_EXPIRATION="30m"` (resquício de configuração anterior) — atualizado para `15m` para não contradizer a spec. A variável continua configurável via ambiente, mas o valor de referência do projeto é 15 minutos.
- **Sem endpoint de registro**: fora do escopo da spec — assume-se que `Usuario.senha` já está populado (hash bcrypt) via seed/migration/outro processo.

---

## Evolução Futura

- Migrar futuros módulos (ex.: `pedidos`, `marceneiros`) para usar `@CurrentUser()` assim que existirem, em vez de receber id de usuário no body
- Endpoint de registro de usuário, se necessário (usaria `PasswordHasherService` — método `hash()` ainda não existe, adicionar quando houver caso de uso real)

---

## O que NÃO Fazer Neste Módulo

- Não implementar cadastro de usuário aqui sem solicitação explícita
- Não usar `bcrypt`/`jsonwebtoken` fora das abstrações em `shared/`
- Não retornar mensagens de erro que diferenciem "email inexistente" de "senha errada"
- Não acessar `PrismaClient` fora de `infrastructure/repositories/`
