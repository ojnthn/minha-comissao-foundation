# {NomeDto}

## Objetivo

Definir e validar os dados de entrada da operação `{acao}` antes que cheguem ao use case.

---

## Responsabilidades

- Declarar os campos esperados na requisição HTTP
- Validar formato e tipo via `class-validator`
- Documentar campos para o Swagger via `@ApiProperty`

---

## Campos

| Campo | Tipo | Obrigatório | Validação | Exemplo |
|---|---|---|---|---|
| `{campo}` | `string` | Sim | `@IsString()`, `@IsNotEmpty()` | `'{exemplo}'` |
| `{outro}` | `string` | Sim | `@IsEmail()` | `'usuario@exemplo.com'` |

---

## Estrutura interna

```typescript
// application/dtos/{nome}.dto.ts

export class {NomeDto} {
  @ApiProperty({ example: '{exemplo}', description: '{descrição}' })
  @Is{Validacao}({}, { message: '{mensagem de erro em português}' })
  {campo}!: {tipo};

  @ApiProperty({ example: '{exemplo}', description: '{descrição}' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;
}
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `class-validator` | Decorators de validação (`@IsString`, `@IsEmail`, etc.) |
| `@nestjs/swagger` | Documentação automática via `@ApiProperty` |

---

## Como Utilizar

### Receber no controller

```typescript
@Post()
async {metodo}(@Body() dto: {NomeDto}): Promise<{RetornoDto}> {
  return this.{nomeUseCase}.execute(dto);
}
```

> O `ValidationPipe` global (configurado em `main.ts`) valida e transforma o DTO automaticamente antes de chegar ao método.

---

## Exemplos

### Request válido

```json
{
  "{campo}": "{valor válido}",
  "email": "usuario@exemplo.com"
}
```

### Response de validação inválida (HTTP 400)

```json
{
  "statusCode": 400,
  "message": ["{campo} é obrigatório", "Email inválido"],
  "error": "Bad Request"
}
```

---

## Observações

- Propriedades declaradas com `!` (definite assignment assertion) — obrigatório para `class-validator`
- Sem `any` — todos os campos tipados explicitamente
- DTOs não contêm lógica de negócio — apenas declaração de campos e decorators
- Mensagens de erro em português
