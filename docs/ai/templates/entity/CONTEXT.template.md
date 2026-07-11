# CONTEXT — {NomeEntidade}

## Responsabilidade

`{NomeEntidade}` representa `{conceito de domínio}` com invariantes encapsuladas. É a única fonte de verdade sobre o que constitui um `{conceito}` válido.

---

## Escopo

### Dentro do escopo

- Encapsular as regras de negócio de `{conceito}`
- Garantir que invariantes sejam respeitadas na criação
- Expor comportamentos de domínio como métodos

### Fora do escopo

- Persistência — responsabilidade do repositório
- Validação de formato HTTP — responsabilidade dos DTOs
- Orquestração de fluxo — responsabilidade dos use cases

---

## Limites

- Sem importações de `@nestjs/*`, Prisma, `class-validator` ou qualquer lib externa (DIP)
- Propriedades expostas apenas como `readonly` — sem setters públicos
- Constructor privado — instância criada exclusivamente via `create()` (SRP)
- Nunca lança exceções — retorna `Result<T>` com `fail()` (ISP)

---

## Invariantes

| Campo | Invariante |
|---|---|
| `{campo}` | {Condição que deve ser verdadeira sempre} |
| `{outro campo}` | {Outra condição} |

---

## Regras Obrigatórias

- Constructor privado + factory method estático `create()` que retorna `Result<{NomeEntidade}>`
- Propriedades expostas apenas via getters — nunca campos públicos ou setters
- Value objects usados para campos com validação própria
- Métodos de negócio na entidade — nunca nos use cases
- `create()` agrega resultados dos value objects e propaga falhas via `fail()`

---

## O que é Proibido

- `new {NomeEntidade}()` fora da própria classe
- `throw` dentro da entidade — retornar `fail()` ao invés
- Importar `@nestjs/*`, Prisma, `class-validator` ou qualquer lib de terceiros
- Setters públicos ou propriedades públicas mutáveis
- Lógica de persistência ou acesso a banco dentro da entidade

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `Result<T>` (`shared/types/result`) | Retorno tipado de `create()` |
| `{NomeVO}` (value objects do mesmo domínio) | Validação de campos com regras próprias |

---

## Dependências Proibidas

- `@nestjs/*`
- `@prisma/client`
- `class-validator` / `class-transformer`
- Qualquer lib de terceiros

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Entidade | `domain/entities/{nome}.entity.ts` | `{Nome}` (PascalCase) |
| Props interface | mesmo arquivo | `{Nome}Props` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `{NomeVO}` | Usados dentro de `create()` para validar campos |
| `I{Nome}Repository` | Repositório persiste e reconstrói entidades |
| `{Acao}UseCase` | Instancia e consome entidades — nunca acessa props diretamente |
| `Result<T>` | Encapsula sucesso ou falha da criação |

---

## Evolução Futura

- Novas regras de negócio → novos métodos na entidade, não nos use cases
- Novos campos com validação própria → criar value object correspondente
- {Campo previsto para feature futura}
