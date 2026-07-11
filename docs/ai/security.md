# Segurança

## Mecanismo de Autenticação

JWT (JSON Web Token) via `@nestjs/jwt` e `passport-jwt`.

## Fluxo de Autenticação

1. Cliente envia credenciais (`email` + `password` como hash MD5) para `POST /auth`
2. `AuthUseCase` valida credenciais e emite JWT assinado
3. Cliente envia o token no header `Authorization: Bearer <token>` nas requisições subsequentes
4. `JwtStrategy` valida o token e popula `request.user` com o payload
5. `JwtAuthGuard` libera ou bloqueia o acesso

## Proteção de Rotas

`JwtAuthGuard` é registrado globalmente via `APP_GUARD` em `AppModule` — **todas as rotas são protegidas por padrão**.

Para tornar uma rota pública, usar o decorator `@Public()`:

```typescript
@Public()
@Post()
async login(@Body() dto: AuthDto) { ... }
```

## Payload do JWT

```typescript
interface JwtPayload {
  sub: string;    // UUID do usuário
  email: string;  // email do usuário
}
```

Gerado nos use cases. Validado pelo `JwtStrategy`. Acessível em controllers via `@CurrentUser()`.

## JwtStrategy

- Extrai token do header `Authorization: Bearer`
- Rejeita tokens expirados (`ignoreExpiration: false`)
- Usa `jwt.secret` do namespace de configuração via `ConfigService`
- Retorna `{ sub, email }` para `request.user`

## JwtAuthGuard

- Estende `AuthGuard('jwt')` do Passport
- Verifica se a rota tem metadata `isPublic` via `Reflector`
- Se pública, libera sem verificar token
- Se protegida, delega para `super.canActivate()`
- Exportado pelo `AuthModule` e registrado globalmente no `AppModule`

## Política de Senha

- A senha é recebida pelo cliente **já como hash MD5** (32 caracteres hexadecimais)
- O servidor **não aplica nenhum hash adicional** — armazena e compara o MD5 diretamente
- Esta é uma decisão de projeto — não deve ser alterada sem solicitação explícita

## Configuração JWT

| Variável | Obrigatória | Namespace de config |
|---|---|---|
| `JWT_SECRET` | Sim | `jwt.secret` |
| `JWT_EXPIRATION` | Sim | `jwt.expiration` (padrão: `30m`) |

## Status de Usuário

`UserStatus`: `'active' | 'inactive' | 'deleted'`

- Somente usuários com `status='active'` podem se autenticar
- Verificação feita em `AuthUseCase` via `user.isActive()`

## Resposta de Erro de Autenticação

- Email não encontrado, senha incorreta ou usuário inativo → mesmo erro `401` com mensagem genérica
- **Nunca** diferenciar na resposta se o erro foi no email ou na senha — evita enumeração de usuários

## O que é Proibido

- Armazenar senha em texto puro
- Aplicar hash adicional sobre a senha (já chega como MD5)
- Retornar dados do usuário além do token no response de auth
- Diferenciar o erro de "email não encontrado" do de "senha incorreta" na resposta HTTP
- Acessar `request.user` diretamente em controllers — usar `@CurrentUser()`
