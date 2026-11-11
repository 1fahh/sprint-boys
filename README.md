# Sprint Boys Poker

Planning Poker online do time Sprint Boys (Carlos, Enzo e Gustavo). Projeto M2 de Métodos Ágeis.

O time cria uma sala, passa o código de 4 letras, cada pessoa vota a estimativa em segredo e os votos são revelados juntos, com média, mediana, pontuação sugerida e alerta de divergência.

## Como funciona

- `public/index.html`: a tela. Consulta o servidor a cada 2 segundos.
- `api/room.js`: função serverless da Vercel. Todas as ações da sala passam por ela. O servidor só devolve os votos depois que a sala é revelada.
- `lib/poker.js`: regras puras (validação, código da sala, resumo dos votos). É a parte coberta por testes.
- `db/schema.sql`: as duas tabelas (`rooms` e `players`).
- `test/poker.test.js`: testes com o `node:test`.
- `.github/workflows/ci.yml`: roda os testes a cada commit.

## Colocar no ar (uma vez)

1. **Neon:** crie um projeto gratuito em neon.tech, abra o SQL Editor e rode o conteúdo de `db/schema.sql`. Copie a connection string.
2. **GitHub:** crie o repositório e envie estes arquivos.
3. **Vercel:** importe o repositório (Add New > Project). Em Settings > Environment Variables, crie `DATABASE_URL` com a connection string do Neon e faça um novo deploy.

Depois disso, cada commit na branch principal publica automaticamente (é o deploy automatizado pedido na disciplina).

A build da Vercel roda `npm test` antes de publicar (veja `vercel.json`). Se algum teste falhar, a Vercel não publica essa versão. O GitHub Actions (`.github/workflows/ci.yml`) roda os mesmos testes a cada commit, desde que a conta do GitHub esteja liberada para usar o Actions.

## Rodar na sua máquina

```bash
npm install
npm test
cp .env.example .env     # cole a DATABASE_URL do Neon
npx vercel dev           # abre em http://localhost:3000
```

Nunca coloque a connection string no repositório. O `.gitignore` já ignora o `.env`.

## Escopo por Sprint (sugestão)

- Sprint 1: criar sala, entrar, votar, revelar (já está neste código).
- Sprint 2: tratamento de erros, nova rodada e história, melhorias de tela e de testes.
- Sprint 3: histórico das estimativas (e comparação com o Cycle Time real), teste com alguém de fora.
