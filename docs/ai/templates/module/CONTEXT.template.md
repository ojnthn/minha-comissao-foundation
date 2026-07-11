# CONTEXT — {NomeModulo}

## Responsabilidade

{Uma frase exata descrevendo a única responsabilidade deste módulo.}

> SRP: este módulo tem exatamente uma razão para mudar.

---

## Escopo

### Dentro do escopo

- {O que este módulo FAZ — ação concreta}
- {Outra responsabilidade dentro do escopo}

### Fora do escopo

- {O que este módulo NÃO faz — evitar sobreposição com outros módulos}
- {Responsabilidade que pertence a outro módulo}

---

## Casos de Uso

| Use Case | Arquivo | Rota |
|---|---|---|
| `{NomeUseCase}` | `application/use-cases/{acao}.use-case.ts` | `{MÉTODO} /{rota}` |
| `{OutroUseCase}` | `application/use-cases/{outra-acao}.use-case.ts` | `{MÉTODO} /{rota}` |

---

## Entidades de Domínio

### {NomeEntidade}

| Campo | Tipo | Invariante |
|---|---|---|
| `id` | `string (UUID)` | Gerado automaticamente; imutável após criação |
| `{campo}` | `{tipo}` | {Regra de negócio que este campo deve satisfazer} |
| `createdAt` | `Date` | Definido na criação; imutável |
| `updatedAt` | `Date` | Atualizado automaticamente pelo Prisma |

> Entidades usam constructor privado + factory method estático `create()` que retorna `Result<T>`.

---

## Value Objects

| Value Object | Campo validado | Validações |
|---|---|---|
| `{NomeVO}` | `{campo}` | {Regras de formato ou negócio validadas no VO} |

---

## Interface do Repositório

```typescript
// domain/repositories/{nome}.repository.interface.ts

export const {NOME}_REPOSITORY = '{NOME}_REPOSITORY';

export interface I{Nome}Repository {
  {método}({param}: {tipo}): Promise<{retorno | null}>;
  // ...
}
```

---

## Contrato da API

### {MÉTODO} /{rota}

**Request body:**
```json
{
  "{campo}": "{tipo — ex: string, number}"
}
```

**Response ({código HTTP}):**
```json
{
  "{campo}": "{tipo}"
}
```

---

## Erros Esperados

| Exceção | Código HTTP | Quando ocorre |
|---|---|---|
| `UnauthorizedException` | `401` | {Cenário de autenticação inválida} |
| `ConflictException` | `409` | {Recurso já existe} |
| `NotFoundException` | `404` | {Recurso não encontrado} |
| `DomainException` | `422` | {Violação genérica de regra de negócio} |

---

## Fluxo de Execução

### {NomeUseCase}

```
1. Controller recebe {NomeDto} → chama {NomeUseCase}.execute(input)
2. UseCase chama I{Nome}Repository.{método}()
3. [Se regra violada] → throw {NomeException}
4. [Se sucesso] → retorna {NomeOutput}
5. Controller retorna HTTP {código}
```

---

## Limites

- Não acessa banco diretamente — apenas via interface `I{Nome}Repository` (DIP)
- Não conhece implementações concretas de infraestrutura (OCP)
- Domain não importa `@nestjs/*`, Prisma, `class-validator` ou qualquer lib externa
- Controllers não contêm lógica de negócio

---

## Regras Obrigatórias

- Regra de dependência: `presentation → application → domain ← infrastructure`
- Um use case por operação — nunca múltiplas ações em um único use case (SRP)
- Use cases lançam `DomainException` ou subclasse em falhas — nunca retornam `null` silenciosamente
- Controllers delegam 100% ao use case — sem lógica de negócio (SRP)
- Mapper entre modelo Prisma e entidade de domínio isolado dentro do repositório (ISP)
- {Regra específica deste módulo}

---

## O que é Proibido

- Importar `@nestjs/*`, Prisma ou libs externas no domínio
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Vazar tipos Prisma (`PrismaUser`, etc.) para fora do repositório
- Retornar `null` silenciosamente em use cases — lançar exceção
- Conter lógica de negócio em controllers
- {Proibição específica deste módulo}

---

## Dependências Permitidas

| Camada | Pode depender de |
|---|---|
| `domain` | Apenas `shared/types` (`Result<T>`) — nenhuma lib externa |
| `application` | `domain/`, `shared/exceptions`, `shared/types` |
| `infrastructure` | `domain/`, `@nestjs/*`, `@prisma/client` |
| `presentation` | `application/dtos`, use cases via token DI, `@nestjs/*`, `shared/decorators` |

---

## Dependências Proibidas

| Camada | Proibido |
|---|---|
| `domain` | `@nestjs/*`, Prisma, `class-validator`, qualquer lib de terceiros |
| `application` | `@prisma/client`, `PrismaClient` diretamente |
| `presentation` | Repositórios diretamente; lógica de negócio |

---

## Variáveis de Ambiente

| Variável | Namespace de config | Obrigatória |
|---|---|---|
| `{VARIAVEL}` | `{namespace}.{campo}` | Sim |

---

## Convenções

| Artefato | Arquivo | Classe |
|---|---|---|
| Entidade | `domain/entities/{nome}.entity.ts` | `{Nome}` |
| Interface repositório | `domain/repositories/{nome}.repository.interface.ts` | `I{Nome}Repository` |
| Token DI | mesmo arquivo da interface | `{NOME}_REPOSITORY` |
| Use case | `application/use-cases/{acao}.use-case.ts` | `{Acao}UseCase` |
| DTO | `application/dtos/{nome}.dto.ts` | `{Nome}Dto` |
| Repositório Prisma | `infrastructure/repositories/prisma-{nome}.repository.ts` | `Prisma{Nome}Repository` |
| Controller | `presentation/controllers/{nome}.controller.ts` | `{Nome}Controller` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `shared/exceptions/domain.exception` | Use cases lançam subclasses de `DomainException` |
| `shared/types/result` | Domain usa `Result<T>` em entidades e value objects |
| `shared/decorators/current-user` | Controllers usam `@CurrentUser()` para extrair payload JWT |
| `shared/decorators/public` | Controllers usam `@Public()` para rotas sem autenticação |
| `{OutroModulo}` | {Como este módulo interage com o outro} |

---

## Decisões Técnicas

- {Decisão 1}: {Justificativa arquitetural ou de negócio}
- {Decisão 2}: {Justificativa}

---

## Evolução Futura

- {Feature ou responsabilidade que pode ser adicionada a este módulo}
- {Ponto de extensão previsto — ex: novo use case, novo repositório}

---

## O que NÃO Fazer Neste Módulo

- Não {ação proibida concreta — ex: não chamar PrismaClient no use case}
- Não {outra ação proibida}
- Não criar lógica de negócio no controller — toda decisão vai para o use case
