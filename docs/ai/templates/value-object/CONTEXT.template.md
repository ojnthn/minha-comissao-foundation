# CONTEXT — {NomeVO}

## Responsabilidade

`{NomeVO}` valida e encapsula o valor de `{campo}`, garantindo que nenhuma instância inválida deste tipo exista no domínio.

---

## Escopo

### Dentro do escopo

- Validar `{campo}` conforme regras: {lista de regras}
- Normalizar o valor ({ex: lowercase, trim})

### Fora do escopo

- Persistência — o repositório armazena o valor primitivo via `.toString()`
- Validação HTTP — responsabilidade do DTO com `class-validator`
- Regras de negócio que dependem de outros dados — responsabilidade da entidade

---

## Limites

- Imutável — sem setters; valor definido no constructor privado
- Sem efeitos colaterais — apenas valida e encapsula
- Nunca lança exceções — retorna `Result<{NomeVO}>`

---

## Regras de Validação

| Regra | Critério |
|---|---|
| {Regra 1} | {Expressão ou condição exata} |
| {Regra 2} | {Expressão ou condição exata} |

---

## Regras Obrigatórias

- Constructor privado + factory method estático `create()` retornando `Result<{NomeVO}>`
- `create()` usa `fail()` para erros — nunca `throw`
- Valor acessível via `toString()` — sem getter público expondo o tipo interno
- Normalização feita antes de armazenar (ex: `.toLowerCase().trim()`)

---

## O que é Proibido

- `new {NomeVO}()` fora da própria classe
- `throw` dentro do value object
- Importar `@nestjs/*`, Prisma ou qualquer lib de terceiros
- Setters ou propriedades públicas mutáveis
- Lógica de negócio que depende de outros objetos (isso é responsabilidade da entidade)

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `Result<T>` (`shared/types/result`) | Retorno tipado de `create()` |

---

## Dependências Proibidas

- `@nestjs/*`
- `@prisma/client`
- `class-validator`
- Qualquer lib de terceiros

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Value Object | `domain/value-objects/{nome}.vo.ts` | `{Nome}` (PascalCase) |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `{NomeEntidade}` | Instancia este VO dentro de `create()` e propaga `fail()` se inválido |
| `Result<T>` | Encapsula sucesso ou falha da criação |
| `I{Nome}Repository` | Armazena/recupera o valor primitivo via `.toString()` |

---

## Evolução Futura

- Se a regra de validação mudar, atualizar apenas `create()` — sem impacto nas entidades que usam o VO
- {Extensão prevista}
