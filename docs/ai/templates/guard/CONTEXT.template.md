# CONTEXT — {NomeGuard}

## Responsabilidade

`{NomeGuard}` protege rotas verificando {JWT / permissão / condição} antes de conceder acesso ao handler. É o único ponto de decisão de {autenticação/autorização} no fluxo HTTP.

---

## Escopo

### Dentro do escopo

- Verificar validade do {token / permissão}
- Ler metadados de rota via `Reflector` para determinar se a rota é pública
- Liberar ou bloquear o acesso ao handler

### Fora do escopo

- Lógica de negócio — guards só decidem acesso
- Tratamento de exceções de domínio — responsabilidade do `GlobalExceptionFilter`
- Extração de dados do usuário para uso no handler — responsabilidade do `@CurrentUser()`

---

## Limites

- Não acessa banco de dados diretamente
- Não conhece use cases ou repositórios
- Não manipula o corpo da requisição ou resposta

---

## Regras Obrigatórias

- Registrado globalmente via `APP_GUARD` — não aplicar via `@UseGuards()` em controllers
- Todas as rotas são protegidas por padrão — `@Public()` é a exceção
- Usa `Reflector.getAllAndOverride()` para respeitar metadados em nível de handler E classe
- Estratégia de autenticação definida em `{NomeStrategy}` — guard não repete essa lógica

---

## O que é Proibido

- Conter lógica de negócio
- Acessar `PrismaClient` ou repositórios diretamente
- Lançar exceções de domínio — retornar `false` ou deixar o Passport lançar `UnauthorizedException`
- Verificar permissões específicas de recurso (autorização de domínio) — isso é responsabilidade do use case

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `Reflector` | Leitura de metadados (`@Public()`, etc.) |
| `AuthGuard` (Passport) | Delegação da validação JWT à estratégia |
| `@nestjs/common` | `Injectable`, `ExecutionContext` |

---

## Dependências Proibidas

- Repositórios, use cases, services
- `@prisma/client`
- Lógica de negócio de qualquer módulo

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Guard | `infrastructure/guards/{nome}.guard.ts` | `{Nome}Guard` (PascalCase + `Guard`) |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `@Public()` decorator | Guard lê o metadado `IS_PUBLIC_KEY` para isentar a rota |
| `{NomeStrategy}` | Guard delega a validação do token à strategy |
| `AppModule` | Registra via `APP_GUARD` |
| `{NomeModulo}Module` | Exporta o guard para que `AppModule` consiga registrá-lo |
| `@CurrentUser()` | Extrai o payload preenchido pela strategy após o guard liberar |

---

## Evolução Futura

- Novos tipos de proteção (ex: roles, scopes) → criar guard específico — não adicionar ao guard JWT
- {Extensão prevista}
