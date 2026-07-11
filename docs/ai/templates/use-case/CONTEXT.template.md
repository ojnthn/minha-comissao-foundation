# CONTEXT — {NomeUseCase}

## Responsabilidade

{Uma frase: este use case é responsável exclusivamente por...}

> SRP estrito: um use case executa uma única ação de negócio. Se executar duas, deve ser dividido em dois.

---

## Escopo

### Dentro do escopo

- {Validação específica de regra de negócio que este use case realiza}
- {Operação de persistência ou consulta que executa}

### Fora do escopo

- Validação de formato de campos — responsabilidade do DTO (`class-validator`)
- Conversão de exceção para resposta HTTP — responsabilidade do `GlobalExceptionFilter`
- Lógica de apresentação — responsabilidade do controller

---

## Limites

- Não acessa `PrismaClient` diretamente — apenas via `I{Nome}Repository` (DIP)
- Não conhece controllers, DTOs HTTP ou decorators do NestJS
- Não manipula `request` ou `response` HTTP
- Não loga dados sensíveis

---

## Regras Obrigatórias

- Método único `execute(input: {Nome}Input): Promise<{Nome}Output>`
- Lança `DomainException` (ou subclasse) em qualquer falha — nunca retorna `null`
- Recebe dependências via constructor com `@Inject({NOME}_REPOSITORY)` (DIP)
- Input e Output definidos como interfaces no mesmo arquivo do use case (ISP)
- Sempre `async`, mesmo que internamente síncrono

---

## O que é Proibido

- Acessar `PrismaClient` ou qualquer ORM diretamente
- Lançar `HttpException` ou subclasses do NestJS
- Conter lógica de validação de formato (regex, tipo) — isso é responsabilidade do DTO
- Retornar `null` ou `undefined` em caso de falha
- Executar mais de uma responsabilidade de negócio

---

## Dependências Permitidas

| Dependência | Como injetar |
|---|---|
| `I{Nome}Repository` | `@Inject({NOME}_REPOSITORY)` no constructor |
| `shared/exceptions/*` | Import direto — lançar subclasse de `DomainException` |
| `shared/types/result` | Import direto — consumir `Result<T>` retornado por entidades |

---

## Dependências Proibidas

- `@prisma/client` ou qualquer tipo Prisma
- `@nestjs/common` decorators de controller (`@Body`, `@Param`, `@Req`, etc.)
- Repositórios concretos (`Prisma{Nome}Repository`) — apenas interfaces
- Outros use cases diretamente — compor via repositório ou service se necessário

---

## Convenções

- Arquivo: `application/use-cases/{acao}.use-case.ts`
- Classe: `{Acao}UseCase` (PascalCase + `UseCase`)
- Spec: `application/use-cases/{acao}.use-case.spec.ts`
- Input: `{Acao}Input` (interface no mesmo arquivo)
- Output: `{Acao}Output` (interface no mesmo arquivo)

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `I{Nome}Repository` | Dependência principal — recebe via DI |
| `{NomeEntidade}` | Instancia ou consome entidades de domínio |
| `shared/exceptions` | Lança subclasses de `DomainException` |
| `{Nome}Controller` | É chamado pelo controller, não o contrário |
| `GlobalExceptionFilter` | Intercepta exceções lançadas e converte para HTTP |

---

## Evolução Futura

- Se uma nova ação de negócio relacionada for necessária, criar um novo use case — nunca adicionar método ao existente
- {Extensão prevista específica para este use case}
