# Spec: Auth

## Módulo
novo modulo de autenticacao

## Objetivo
realizar login de um usuário e retornar um token jwt válido

## Rota
POST /auth/login

## Request
- {
    "user": "jonathan19ricardo@gmail.com" ,
    "pass": "123" /// Sugira a melhor criptrafia, me pergunte qual escolher entre as mais usadas
}

## Response (sucesso)
```json
{
    "token": "jwt-token"
}
```

## Erros
- Erros padroes de autenticacao

## Repositório / Dependências
- Método novo: criar abstracao do jwt dentro de shared

## Regras específicas
- deve criar um jwt com expiracao de 15 minutos, e deve conter o id do usuário