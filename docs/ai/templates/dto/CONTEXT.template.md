# CONTEXT — {NomeDto}

## Responsabilidade

`{NomeDto}` define e valida os campos de entrada da operação `{acao}` na camada de apresentação, antes que os dados cheguem ao use case.

---

## Escopo

### Dentro do escopo

- Declaração de campos esperados na requisição
- Validação de formato e tipo (`@IsEmail`, `@IsString`, `@Matches`, etc.)
- Documentação Swagger via `@ApiProperty`

### Fora do escopo

- Regras de negócio — responsabilidade de use cases e entidades
- Validação de unicidade ou estado — responsabilidade do use case com repositório
- Persistência — responsabilidade do repositório

---

## Limites

- Não contém lógica de negócio — apenas decorators declarativos
- Não acessa banco de dados ou serviços externos
- Valida apenas formato — não valida invariantes de domínio

---

## Regras Obrigatórias

- Toda propriedade usa `!` (definite assignment assertion) para compatibilidade com `class-validator`
- Toda propriedade tem ao menos um decorator de validação e um `@ApiProperty`
- Mensagens de erro em português e descritivas
- Nenhum `any` explícito
- Validação de formato (tipo, regex) fica no DTO — validação de negócio (unicidade, estado) fica no use case

---

## O que é Proibido

- Lógica de negócio (condicionais, chamadas a serviços)
- Acesso a repositórios ou use cases
- `any` como tipo de propriedade
- Omitir `@ApiProperty` em qualquer propriedade pública
- Duplicar validação de regra de negócio (unicidade, estado) — isso é do use case

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `class-validator` | Decorators de validação HTTP |
| `@nestjs/swagger` | Documentação automática via `@ApiProperty` |

---

## Dependências Proibidas

- `@prisma/client`
- Repositórios, use cases, entidades de domínio
- Qualquer lib de lógica de negócio

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| DTO | `application/dtos/{nome}.dto.ts` | `{Nome}Dto` (PascalCase + `Dto`) |

### Decorators usados no projeto

| Decorator | Uso |
|---|---|
| `@IsString()` | Campo deve ser string |
| `@IsNotEmpty()` | Campo não pode ser vazio |
| `@IsEmail()` | Validação de formato email |
| `@MinLength(n)` | Comprimento mínimo |
| `@Matches(regex)` | Validação por expressão regular |
| `@ApiProperty()` | Documentação Swagger |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `ValidationPipe` (global) | Valida e transforma o body para a classe do DTO automaticamente |
| `{NomeController}` | Recebe o DTO via `@Body()` e repassa ao use case |
| `{Acao}UseCase` | Recebe os dados do DTO como input — nunca o DTO diretamente |
| `GlobalExceptionFilter` | Captura `ValidationException` do `ValidationPipe` → HTTP 400 |

---

## Evolução Futura

- Novos campos → adicionar com decorator de validação e `@ApiProperty`
- Se um campo for opcional em uma versão futura, usar `@IsOptional()` + `?` no tipo
