# Minhas Vendas API

API de gerenciamento de pedidos e comissões para representantes de vendas de chapas de MDF. Fornece dados de produtos, percentuais de comissão e pedidos para o frontend React consumir.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS (TypeScript) |
| Banco de dados | MySQL 8.0 |
| Acesso a dados | Prisma ORM (`prisma/schema.prisma`, migrations versionadas) |
| Administração DB | phpMyAdmin |
| Containerização | Docker + Docker Compose |

## Regras Globais

- Documentação prevalece sobre código — em conflito, o código está errado, não a documentação
- Nunca criar novos padrões arquiteturais sem atualizar a documentação primeiro
- Nunca alterar arquitetura sem solicitação explícita
- Nunca renomear classes existentes nem quebrar contratos públicos sem solicitação
- Nunca adicionar dependências sem justificativa documentada
- Nunca usar