# {NomeEntidade}

## Objetivo

Representar `{conceito de domínio}` com suas regras de negócio encapsuladas, garantindo que instâncias inválidas nunca existam.

---

## Responsabilidades

- Encapsular as regras de negócio de `{conceito}`
- Garantir invariantes via factory method `create()` com retorno `Result<T>`
- Expor dados via propriedades `readonly` — sem setters públicos

---

## Invariantes

| Campo | Regra |
|---|---|
| `{campo}` | {Regra que este campo deve satisfazer sempre} |
| `{outro campo}` | {Outra regra} |

> Uma entidade com invariante violada nunca é instanciada.

---

## Fluxo de Criação

```
{NomeEntidade}.create(props) → valida value objects → Result<{NomeEntidade}>
       ↓ ok: false                      ↓ ok: true
  fail('motivo')              new {NomeEntidade}(props validadas)
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `{NomeVO}` | Value object para {campo} com validação própria |
| `Result<T>` | Retorno tipado que representa sucesso ou falha |

---

## Estrutura interna

```typescript
// domain/entities/{nome}.entity.ts

export interface {Nome}Props {
  id: string;
  {campo}: {tipo};
  createdAt: Date;
  updatedAt: Date;
}

export class {NomeEntidade} {
  private constructor(private readonly props: {Nome}Props) {}

  static create(props: {Nome}Props): Result<{NomeEntidade}> {
    const {campo}Result = {NomeVO}.create(props.{campo});
    if (!{campo}Result.ok) return fail({campo}Result.error);

    return ok(new {NomeEntidade}(props));
  }

  get id(): string { return this.props.id; }
  get {campo}(): {tipo} { return this.props.{campo}; }
  // ...

  {metodoDeNegocio}(): boolean {
    return this.props.{campo} === '{valor}';
  }
}
```

---

## Como Utilizar

### Criar instância

```typescript
const result = {NomeEntidade}.create({
  id: uuid(),
  {campo}: {valor},
  createdAt: new Date(),
  updatedAt: new Date(),
});

if (!result.ok) return fail(result.error);
const entidade = result.value;
```

### Reconstruir do banco (repositório)

```typescript
private toDomain(raw: Prisma{Tipo}): {NomeEntidade} {
  const result = {NomeEntidade}.create({ ...raw });
  if (!result.ok) throw new Error(`Inconsistência no banco: ${result.error}`);
  return result.value;
}
```

---

## Exemplos

### Verificar estado

```typescript
if (!entidade.{metodoDeNegocio}()) {
  throw new {NomeException}();
}
```

---

## Observações

- Constructor é privado — nunca instanciar com `new {NomeEntidade}()` diretamente
- Sem `@nestjs/*`, Prisma ou qualquer lib externa no arquivo
- Métodos de negócio ficam na entidade — nunca no use case ou controller
