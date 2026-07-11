# CONTEXT — I{Nome}Repository / Prisma{Nome}Repository

## Responsabilidade

A interface `I{Nome}Repository` define o contrato de acesso a dados para `{NomeEntidade}`.
`Prisma{Nome}Repository` é a implementação concreta que traduz operações de domínio em queries Prisma.

---

## Escopo

### Dentro do escopo

- Definir métodos de consulta e persistência de `{NomeEntidade}`
- Converter modelos Prisma em entidades de domínio (mapper privado)
- Garantir que detalhes do banco não vazem para camadas superiores

### Fora do escopo

- Regras de negócio — responsabilidade das entidades e use cases
- Validação de dados de entrada — responsabilidade dos DTOs e value objects
- Tratamento de exceções HTTP — responsabilidade do `GlobalExceptionFilter`

---

## Limites

- Nenhum tipo Prisma (`PrismaUser`, etc.) vaza para fora do repositório (LSP, ISP)
- O repositório só conhece entidades de domínio — nunca DTOs ou tipos de apresentação
- `PrismaClient` é injetado via constructor — nunca instanciado diretamente no repositório
- Sem SQL raw — apenas API Prisma (`this.prisma.{model}.findUnique()`, etc.)

---

## Regras Obrigatórias

- A interface fica em `domain/repositories/{nome}.repository.interface.ts` (DIP)
- O token de DI `{NOME}_REPOSITORY` é exportado no mesmo arquivo da interface
- `Prisma{Nome}Repository` implementa `I{Nome}Repository` (LSP)
- O mapper `toDomain()` é privado e pertence exclusivamente ao repositório
- Se o mapper falhar: `throw new Error('Inconsistência no banco: {motivo} (id={id})')`
- Toda operação de banco é `async/await`

---

## O que é Proibido

- Importar tipos Prisma (`PrismaUser`, etc.) fora do repositório
- Acessar `PrismaClient` em use cases ou controllers
- Expor modelos Prisma como tipo de retorno de métodos públicos
- SQL raw sem justificativa documentada
- Lançar `DomainException` no repositório — exceções de negócio são dos use cases

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `{NomeEntidade}` (domain) | Tipo de retorno dos métodos públicos |
| `PrismaClient` | Acesso ao banco via ORM |
| `@nestjs/common` (`@Injectable`) | Registro como provider NestJS |

---

## Dependências Proibidas

- `shared/exceptions` — repositório não lança exceções de domínio
- Use cases ou controllers — repositório não conhece camadas superiores
- Outros repositórios diretamente — se necessário, compor via use case

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Interface | `domain/repositories/{nome}.repository.interface.ts` | `I{Nome}Repository` |
| Token DI | mesmo arquivo da interface | `{NOME}_REPOSITORY` (SCREAMING_SNAKE_CASE) |
| Implementação | `infrastructure/repositories/prisma-{nome}.repository.ts` | `Prisma{Nome}Repository` |
| Mapper | método privado `toDomain()` na implementação | — |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `{NomeEntidade}` | Tipo de retorno — o repositório reconstrói entidades via `Entity.create()` |
| `{Acao}UseCase` | Consome a interface — nunca conhece a implementação concreta |
| `{module-name}.module.ts` | Registra o token e a classe concreta via `provide/useClass` |
| `PrismaClient` | Injetado via constructor; instanciado no módulo |

---

## Evolução Futura

- Novos métodos de consulta devem ser adicionados à interface antes da implementação
- Se o banco mudar (ex: MongoDB), apenas trocar `Prisma{Nome}Repository` — sem alterar use cases (OCP)
- {Método previsto para futuras features — ex: `findAllByStatus()`}
