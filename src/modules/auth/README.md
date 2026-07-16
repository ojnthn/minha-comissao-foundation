# Auth

## Objetivo

Autenticar um usuário já cadastrado (email + senha) e retornar um token JWT válido por 15 minutos.

---

## Responsabilidades

- Validar email/senha contra o `Usuario` cadastrado no banco
- Emitir um JWT contendo o `id` do usuário
- Proteger rotas de outros módulos via `JwtAuthGuard` + `@CurrentUser()`

> Cadastro de usuário não faz parte deste módulo ainda.

---

## Casos de Uso

| Use Case | Descrição | Rota HTTP |
|---|---|---|
| `LoginUseCase` | Autentica usuário e emite JWT | `POST /auth/login` |

---

## Fluxo Principal

```
Cliente → AuthController → LoginUseCase → PrismaUsuarioRepository → MySQL
                          ↓
              PasswordHasherService.compare() (bcrypt)
                          ↓
              JwtTokenService.generate() (jsonwebtoken)
                          ↓
                UnauthorizedException (em caso de falha)
                          ↓
               GlobalExceptionFilter → Resposta HTTP
```

---

## Estrutura Interna

```
auth/
├── CONTEXT.md
├── README.md
├── domain/
│   ├── entities/
│   │   └── usuario.entity.ts
│   └── repositories/
│       └── usuario.repository.interface.ts
├── application/
│   ├── use-cases/
│   │   ├── login.use-case.ts
│   │   └── login.use-case.spec.ts
│   └── dtos/
│       └── login.dto.ts
├── infrastructure/
│   ├── repositories/
│   │   └── prisma-usuario.repository.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── decorators/
│       └── current-user.decorator.ts
├── presentation/
│   └── controllers/
│       └── auth.controller.ts
└── auth.module.ts
```

Abstrações compartilhadas usadas por este módulo (em `src/shared/`):

```
shared/
├── crypto/
│   └── password-hasher.service.ts   # bcrypt.compare()
└── jwt/
    └── jwt-token.service.ts         # jsonwebtoken sign/verify
```

---

## Dependências

### Módulos NestJS importados

| Módulo | Finalidade |
|---|---|
| `ConfigModule` (global, via `AppModule`) | Acesso a `JWT_SECRET`/`JWT_EXPIRATION` |

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Chave de assinatura do JWT |
| `JWT_EXPIRATION` | Não (default `15m`) | Expiração do token |

---

## Como Utilizar

### Registrar no AppModule

```typescript
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
```

### Chamar a API

```http
POST /auth/login
Content-Type: application/json

{ "email": "jonathan19ricardo@gmail.com", "senha": "123" }
```

---

## Exemplos

### Login (happy path)

**Request:**
```http
POST /auth/login
Content-Type: application/json

{ "email": "jonathan19ricardo@gmail.com", "senha": "123" }
```

**Response (200):**
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

### Credenciais inválidas (erro esperado)

**Response (401):**
```json
{ "statusCode": 401, "message": "Credenciais inválidas" }
```

---

## Erros Comuns

| Código HTTP | Mensagem | Causa |
|---|---|---|
| `400` | `["Email inválido", "Senha é obrigatória"]` | Validação de DTO falhou |
| `401` | `Credenciais inválidas` | Email não encontrado ou senha não confere |

---

## Como Testar

```bash
npm run test -- --testPathPatterns=auth
npm run test:e2e
```

---

## Observações

- Não há endpoint de registro — a senha do `Usuario` já deve estar armazenada como hash bcrypt (seed/migration).
- Rotas protegidas usam `@UseGuards(JwtAuthGuard)` + `@CurrentUser()` (ex.: `POST /produtos`, `DELETE /produtos/:id`). O client deve enviar `Authorization: Bearer <token>`.
- Módulos que precisam proteger rotas devem importar `AuthModule` (exporta `JwtTokenService` e `JwtAuthGuard`).
