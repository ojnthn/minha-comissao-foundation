# {NomePipe}

## Objetivo

{Uma frase: valida e/ou transforma {dado} antes de chegar ao handler.}

---

## Responsabilidades

- {Validar formato ou tipo do dado de entrada}
- {Transformar o dado para o tipo esperado pelo handler — se aplicável}

---

## Fluxo

```
Request → ValidationPipe (global) → {NomePipe} (se aplicado localmente) → Handler
                                         ↓
                               HTTP 400 Bad Request (se inválido)
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `PipeTransform` | Interface base do NestJS para pipes |
| `ArgumentMetadata` | Metadados sobre o parâmetro sendo transformado |

---

## Estrutura interna

```typescript
// shared/pipes/{nome}/{nome}.pipe.ts

@Injectable()
export class {NomePipe} implements PipeTransform<{TipoEntrada}, {TipoSaida}> {
  transform(value: {TipoEntrada}, metadata: ArgumentMetadata): {TipoSaida} {
    // validação ou transformação
    if ({condição de invalidade}) {
      throw new BadRequestException('{mensagem de erro}');
    }
    return {valor transformado};
  }
}
```

---

## Como Utilizar

### Global (AppModule)

```typescript
app.useGlobalPipes(new {NomePipe}());
```

### Por parâmetro

```typescript
@Get(':id')
async buscar(@Param('id', {NomePipe}) id: {TipoSaida}) { ... }
```

### Por rota

```typescript
@UsePipes({NomePipe})
@Post()
async criar(@Body() dto: {NomeDto}) { ... }
```

---

## Exemplos

### Transformação válida

```typescript
// Entrada: '123e4567-e89b-12d3-a456-426614174000'
// Saída: '123e4567-e89b-12d3-a456-426614174000' (validado)
```

### Entrada inválida → HTTP 400

```typescript
// Entrada: 'não-é-uuid'
// Lança: BadRequestException('{mensagem}')
// Response: { "statusCode": 400, "message": "{mensagem}" }
```

---

## Observações

- Pipes são responsáveis por validação de **formato** — nunca por regras de negócio
- Regras de negócio ficam nos use cases e entidades
- O `ValidationPipe` global cobre a maioria dos casos via `class-validator` — criar pipe customizado apenas quando necessário
