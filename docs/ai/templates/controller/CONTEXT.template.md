# CONTEXT — {NomeController}

## Responsabilidade

`{NomeController}` é o adaptador HTTP do recurso `{recurso}`. Recebe requisições, delega ao use case correspondente e retorna a resposta. Não contém lógica de negócio.

---

## Escopo

### Dentro do escopo

- Receber e deserializar o corpo da requisição via DTO
- Extrair parâmetros de rota, query e usuário autenticado
- Chamar o use case correto com os dados extraídos
- Retornar o resultado do use case com o status HTTP adequado
- Documentar as rotas via Swagger

### Fora do escopo

- Lógica de negócio de qualquer natureza
- Acesso direto a repositórios ou banco de dados
- Validação de regras de domínio
- Tratamento de exceções (responsabilidade do `GlobalExceptionFilter`)

---

## Limites

- Sem `if/else` de negócio — decisões ficam no use case
- Não acessa `PrismaClient` ou qualquer repositório
- Não lança exceções — exceções são responsabilidade do use case e filter
- Não lê `request.user` diretamente — usa `@CurrentUser()` (SRP, ISP)

---

## Regras Obrigatórias

- `@ApiTags`, `@ApiOperation`, `@ApiResponse` obrigatórios em toda rota
- Rotas protegidas usam `@ApiBearerAuth()` no Swagger
- Rotas públicas usam `@Public()` — padrão é protegido (guard global)
- Usuário autenticado extraído via `@CurrentUser()` — nunca `request.user` diretamente
- Nenhuma lógica de negócio no corpo dos métodos
- Método do controller deve ter no máximo: extrair dados → chamar use case → retornar resultado

---

## O que é Proibido

- Lógica de negócio (condicionais de domínio, validações de estado)
- Acesso direto a repositórios, `PrismaClient` ou banco
- `request.user` diretamente — usar `@CurrentUser()`
- Múltiplos use cases em um único método
- Retornar `null` — sempre retornar o output do use case

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| Use cases via constructor | Delegação de 100% da lógica |
| `@nestjs/common` | Decorators HTTP (`@Controller`, `@Get`, `@Post`, etc.) |
| `@nestjs/swagger` | Documentação automática |
| `@CurrentUser()` (shared) | Extração do payload JWT |
| `@Public()` (shared) | Marcar rotas públicas |
| DTOs de `application/dtos/` | Tipagem do body da requisição |

---

## Dependências Proibidas

- Repositórios (`I{Nome}Repository`, `Prisma{Nome}Repository`)
- `@prisma/client` ou qualquer tipo Prisma
- Entidades de domínio diretamente
- Outros controllers

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Controller | `presentation/controllers/{nome}.controller.ts` | `{Nome}Controller` (PascalCase + `Controller`) |

### Padrão de método

```typescript
async {metodo}(@Body() dto: {NomeDto}): Promise<{NomeOutput}> {
  return this.{nomeUseCase}.execute({ campo: dto.campo });
}
```

Um método = um use case. Nunca chamar múltiplos use cases no mesmo método.

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `{NomeUseCase}` | Recebe toda a lógica delegada pelo controller |
| `{NomeDto}` | Valida e tipifica o body da requisição |
| `@CurrentUser()` | Extrai o payload JWT de `request.user` |
| `@Public()` | Isenção do guard global para rotas públicas |
| `GlobalExceptionFilter` | Captura exceções lançadas pelo use case |
| `JwtAuthGuard` | Protege rotas por padrão — controller apenas declara exceções |

---

## Evolução Futura

- Nova rota → novo método + novo use case (SRP)
- Nunca adicionar lógica de negócio para "simplificar" — criar use case correspondente
- {Rota prevista para feature futura}
