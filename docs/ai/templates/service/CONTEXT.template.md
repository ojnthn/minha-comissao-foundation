# CONTEXT — {Nome}Service

## Responsabilidade

`{Nome}Service` encapsula toda a comunicação com `{serviço externo}` e expõe uma interface tipada para os use cases consumirem.

---

## Escopo

### Dentro do escopo

- Realizar chamadas HTTP ao serviço externo `{nome}`
- Mapear respostas externas para tipos internos do projeto
- Encapsular variáveis de ambiente relacionadas à integração

### Fora do escopo

- Regras de negócio sobre os dados retornados — responsabilidade dos use cases e entidades
- Cache dos resultados — responsabilidade de camada dedicada
- Tratamento de exceções HTTP — responsabilidade do `GlobalExceptionFilter`

---

## Limites

- Tipos externos (respostas da API) não vazam para fora do service (ISP)
- Use cases dependem da interface `I{Nome}Service`, nunca da implementação concreta (DIP)
- Não acessa banco de dados — apenas serviço externo

---

## Regras Obrigatórias

- Interface `I{Nome}Service` definida junto à implementação ou em `domain/` se for contrato de domínio (DIP)
- Erros do serviço externo convertidos em `DomainException` ou subclasse antes de propagar
- Variáveis de ambiente acessadas apenas via `ConfigService` — nunca `process.env` diretamente
- Retornos sempre tipados — proibido `any`

---

## O que é Proibido

- Retornar tipos crus da API externa para use cases (`any`, tipos gerados externamente)
- Acessar `process.env` diretamente — usar `ConfigService`
- Conter regras de negócio
- Acessar banco de dados ou repositórios

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `HttpService` ou cliente HTTP | Chamadas ao serviço externo |
| `ConfigService` | Variáveis de ambiente |
| `@nestjs/common` (`@Injectable`) | Registro como provider |
| `shared/exceptions` | Converter erros externos em exceções de domínio |

---

## Dependências Proibidas

- Repositórios (`I{Nome}Repository`) — service não acessa banco
- Entidades de domínio como dependência (pode retornar dados para entidades, mas não as instancia)
- Use cases — service não conhece use cases

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Interface | `infrastructure/services/{nome}.service.interface.ts` ou `domain/` | `I{Nome}Service` |
| Implementação | `infrastructure/services/{nome}.service.ts` | `{Nome}Service` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `{Acao}UseCase` | Consome via interface — nunca conhece a implementação |
| `ConfigService` | Lê credenciais e URL base do serviço externo |
| `shared/exceptions` | Converte erros externos em `DomainException` |

---

## Evolução Futura

- Novos endpoints do serviço externo → novos métodos na interface antes da implementação (OCP)
- Cache: adicionar decorator de cache no método, não alterar o service diretamente
