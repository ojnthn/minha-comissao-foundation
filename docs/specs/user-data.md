# Spec: Informácoes do usuario logado

## Módulo
auth

## Objetivo
irá retornar os dados do usuario logado como nome, email

## Rota
GET - auth

## Request
headers: token jwt // irá ser usado para buscar as informacoes do usuario

## Response (sucesso)
```json
{
    "nome": "Nome usuário logado",
    "email": "email usuário logado"
}
```

## Erros
- {código}: {condição}

## Repositório / Dependências
- Método novo: {assinatura}
- Fonte externa: {endpoint, se houver}

## Regras específicas
- {qualquer regra de negócio que não está no CLAUDE.md do módulo}

## Fora do escopo
- {o que NÃO fazer aqui, evita o agente "ajudar demais"}