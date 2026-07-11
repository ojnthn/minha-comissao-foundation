---
description: Roda testes, commita, faz push e abre PR contra a main
---

Execute o seguinte fluxo, na ordem, parando imediatamente se qualquer etapa falhar:

1. Rode os testes unitários (`npm run test`). Se falharem, pare aqui e me mostre o erro — não prossiga para commit.
2. Crie uma branch baseada na `main` com o nome seguindo o padrão `feat/${DESCRICAO EM UMA FRASE DA ALTERAÇÃO}` (sendo então o NOME DA BRANCH DE FEATURE);
3. Mostre o `git status` e `git diff --stat` para eu confirmar o que será commitado;
4. Faça `git add .` e `git commit` com uma mensagem de commit seguindo o padrão;
5. Abra uma nova branch baseada na `main` com o nome seguindo o padrão `merge-main/${NOME DA BRANCH DE FEATURE}`;
6. Faça um merge da feature na branch de merge usando o comando `git merge origin/${NOME DA BRANCH DE FEATURE}`;
6. Abra um PR contra `main` usando `gh pr create --base main --fill`;
7. Me mostre o link do PR criado.

Não faça merge do PR — apenas abra. A aprovação é manual, pelo GitHub.