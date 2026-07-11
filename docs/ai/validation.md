# Validação

## Camadas de Validação

Duas camadas de validação independentes:

| Camada | Onde | Mecanismo |
|---|---|---|
| HTTP (apresentação) | DTOs | `class-validator` + `ValidationPipe` |
| Domínio | Value objects e entidades | `Result<T>` com `fail()` |

## ValidationPipe (Global)

Configurado em `main.ts` e aplicado a todas as rotas:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // remove campos não declarados no DTO
    forbidNonWhitelisted: true,   // retorna erro 400 se campo extra for enviado
    transform: true,              // transforma o body para a classe do DTO
  }),
);
```

## DTOs

- Localizados em `application/dtos/`
- Anotados com decorators de `class-validator` e `@nestjs/swagger`
- Propriedades com `!` (definite assignment) — obrigatório para compatibilidade com class-validator
- Toda propriedade deve ter ao menos um decorator de validação e um `@ApiProperty`

### Decorators usados no projeto

| Decorator | Uso |
|---|---|
| `@IsEmail()` | Validação de email |
| `@IsString()` | Tipo string |
| `@IsNotEmpty()` | Campo obrigatório (não vazio) |
| `@MinLength(n)` | Comprimento mínimo |
| `@Matches(regex)` | Validação por regex |
| `@ApiProperty()` | Documentação Swagger |

### Exemplo (padrão do projeto)

```typescript
export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name!: string;

  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({ example: '5f4dcc3b5aa765d61d8327deb882cf99', description: 'Hash MD5 da senha' })
  @Matches(/^[a-f0-9]{32}$/i, { message: 'A senha deve ser um hash MD5 válido (32 caracteres hexadecimais)' })
  password!: string;
}
```

## Validação de Domínio (Value Objects)

Value objects validam seus próprios invariantes retornando `Result<T>`:

```typescript
static create(raw: string): Result<Email> {
  if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    return fail('Email inválido');
  }
  return ok(new Email(raw.toLowerCase().trim()));
}
```

- Nunca lançam exceções — retornam `fail(mensagem)`
- A entidade `User.create()` agrega os resultados dos value objects e propaga falhas

## Resposta de Erro de Validação HTTP

Quando o `ValidationPipe` rejeita o body:

```json
{
  "statusCode": 400,
  "message": ["Email inválido", "..."],
  "error": "Bad Request"
}
```

## Regras

- DTOs não contêm lógica de negócio — apenas declaração de campos e decorators
- Validação de formato (regex, tipo) fica no DTO
- Validação de regra de negócio (unicidade, estado) fica no use case ou entidade
- Nunca duplicar a mesma validação entre DTO e domínio
- Mensagens de erro em português, claras e descritivas
