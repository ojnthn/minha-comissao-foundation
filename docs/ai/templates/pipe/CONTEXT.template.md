# CONTEXT — {NomePipe}

## Responsabilidade

`{NomePipe}` valida {e/ou transforma} `{dado}` de entrada antes que chegue ao handler, garantindo que {condição de formato ou tipo}.

---

## Escopo

### Dentro do escopo

- Validação de formato ou tipo do dado (`{campo}`)
- Transformação para o tipo esperado pelo handler

### Fora do escopo

- Regras de negócio — responsabilidade de use cases e entidades de domínio
- Validação de unicidade ou estado — responsabilidade do use case com repositório
- Autenticação/autorização — responsabilidade de guards

---

## Limites

- Não acessa banco de dados ou serviços externos
- Não conhece use cases, entidades de domínio ou regras de negócio
- Lança apenas `BadRequestException` (HTTP 400) em caso de validação inválida

---

## Regras Obrigatórias

- Implementa `PipeTransform<TEntrada, TSaída>` com tipos explícitos (sem `any`)
- Lança `BadRequestException` com mensagem em português descrevendo o problema
- Localizado em `shared/pipes/{nome}/{nome}.pipe.ts` se for reutilizável
- O `ValidationPipe` global (configurado em `main.ts`) cobre DTOs — criar pipe customizado apenas quando o `ValidationPipe` não for suficiente

---

## O que é Proibido

- Conter lógica de negócio
- Acessar banco de dados ou serviços externos
- Lançar exceções de domínio (`DomainException`) — pipes lançam apenas `BadRequestException`
- Usar `any` como tipo de entrada ou saída

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `PipeTransform` | Interface base NestJS |
| `BadRequestException` | Exceção HTTP padrão para dados inválidos |
| `Injectable` | Registro como provider |

---

## Dependências Proibidas

- Repositórios, use cases, services
- `@prisma/client`
- `shared/exceptions/domain.exception` (use cases lançam exceções de domínio, não pipes)

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Pipe reutilizável | `shared/pipes/{nome}/{nome}.pipe.ts` | `{Nome}Pipe` |
| Pipe de módulo específico | `modules/{module}/application/pipes/{nome}.pipe.ts` | `{Nome}Pipe` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `ValidationPipe` (global) | Complementa — pipes customizados cobrem o que `ValidationPipe` não alcança |
| Controllers | Aplicam o pipe via `@Param()`, `@Body()`, `@UsePipes()` |
| `GlobalExceptionFilter` | Captura `BadRequestException` lançada pelo pipe |

---

## Evolução Futura

- Se a validação precisar de acesso a banco, mover a lógica para o use case
- {Extensão prevista}
