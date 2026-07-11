# Spec: Listagem de reviews de filmes por usuário e por filmes

## Módulo
Review

## Objetivo
Listar as reviews do usuário

## Rota
GET - /review/movies/
GET - /review/movie/:id

## Response (sucesso)
body response de GET - /review/movies/
{
    "pagination": {
        "current": 1,
        "next": 2
    },
    "details": [
        {
            "movie_id": 1,
            "rate": 4.5 /// 0 à 5 estrelas,
            "loved": "bool"
            "review": "long-text?",
            "log_date": Datetime /// Data que o usuário assistiu
        }
    ]
}

body response de GET GET - /review/movie/:id
{
    "pagination": {
        "current": 1,
        "next": 2
    },
    "details": [
        {
            "user": {
                "id": 1,
                "name: "John Doe",
                "email": "john.doe@mail.com"
            }
            "rate": 4.5 /// 0 à 5 estrelas,
            "loved": "bool"
            "review": "long-text?",
            "log_date": Datetime /// Data que o usuário assistiu
        }
    ]
}