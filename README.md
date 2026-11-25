# Sprint Boys Poker

Planning Poker online do time Sprint Boys (Projeto M2 - Métodos Ágeis). Site no ar: https://sprint-boys-poker.onrender.com (no plano gratuito demora cerca de 1 minuto para acordar).

## Arquivos
- `public/index.html`: estrutura da tela. `public/style.css`: visual. `public/app.js`: lógica da tela.
- `api/room.js`: API. Todas as ações da sala passam por ela. O servidor só devolve os votos depois que a sala é revelada.
- `lib/poker.js`: regras (validação, código da sala, resumo dos votos).
- `server.js`: servidor Node que serve a tela e a API.
- `db/schema.sql`: tabelas `rooms`, `players` e `history` (rodar uma vez no SQL Editor do Neon). Em banco já criado, rodar `db/migracao-sprint-2.sql` e `db/migracao-sprint-3.sql`.
- `render.yaml`: configuração do Render.

## Como rodar na sua máquina
1. Instale o Node 20 ou mais novo e rode `npm install`.
2. Copie `.env.example` para `.env` e cole a connection string do Neon em `DATABASE_URL`.
3. `npm start` abre em http://localhost:3000.

## Colocar no ar no Render
1. Crie o banco no Neon e rode `db/schema.sql`.
2. No Render, crie um Web Service ligado a este repositório. Build command: `npm install`. Start command: `npm start`.
3. Em Environment, crie `DATABASE_URL` com a connection string do Neon.

Cada commit na `main` publica sozinho.

## Sprints
- Sprint 1: criar sala, entrar, votar em segredo e revelar.
- Sprint 2: resumo, alerta de divergência, liberar votação e nova rodada.
- Sprint 3: só o criador controla a sala, histórico das estimativas e teste com alguém de fora.
