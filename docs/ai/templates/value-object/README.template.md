# {NomeVO}

## Objetivo

Encapsular `{campo}` com suas regras de validação, garantindo que valores inválidos nunca existam no domínio.

---

## Responsabilidades

- Validar `{campo}` segundo as regras `{lista de regras}`
- Normalizar o valor ({ex: lowercase, trim}) antes de armazenar
- Expor o valor via método `toString()` ou getter

---

## Regras de validação

| Regra | Condição |
|---|---|
| {Regra 1} | {Condição — ex: não pode ser vazio} |
| {Regra 2} | {Condição — ex: deve ter 32 caracteres hexadecimais} |

---

## Fluxo

```
{NomeVO}.create(raw) → valida regras → Result<{NomeVO}>
       ↓ inválido               ↓ válido
  fail('{mensagem}')    ok(new {NomeVO}(normalizado))
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `Result<T>` | Retorno tipado que representa sucesso ou falha |

---

## Estrutura interna

```typescript
// domain/value-objects/{nome}.vo.ts

export class {NomeVO} {
  private constructor(private readonly value: {tipo}) {}

  static create(raw: {tipo}): Result<{NomeVO}> {
    if (!raw || !/{regex}/.test(raw)) {
      return fail('{mensagem de erro em português}');
    }
    return ok(new {NomeVO}(raw.{normalização}));
  }

  toString(): {tipo} {
    return this.value;
  }
}
```

---

## Como Utilizar

### Dentro de uma entidade

```typescript
static create(props: Props): Result<{NomeEntidade}> {
  const {campo}Result = {NomeVO}.create(props.{campo});
  if (!{campo}Result.ok) return fail({campo}Result.error);

  return ok(new {NomeEntidade}({ ...props, {campo}: {campo}Result.value }));
}
```

---

## Exemplos

### Criação válida

```typescript
const result = {NomeVO}.create('{valor válido}');
// result.ok === true
// result.value.toString() === '{valor normalizado}'
```

### Criação inválida

```typescript
const result = {NomeVO}.create('{valor inválido}');
// result.ok === false
// result.error === '{mensagem de erro}'
```

---

## Observações

- Constructor é privado — nunca instanciar com `new {NomeVO}()` diretamente
- Value objects são imutáveis — sem setters
- Sem `@nestjs/*`, Prisma ou qualquer lib externa
