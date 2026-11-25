# API: /api/room

Uma rota só. Todas as respostas de sucesso devolvem o **estado da sala** (ver o fim do arquivo). Erros voltam como `{ "error": "mensagem" }` com o status HTTP indicado.

## GET /api/room?code=ABCD
Devolve o estado da sala. Sala que não existe: 404.

## POST /api/room
Corpo em JSON com o campo `action`:

| action | Recebe | O que faz | Erros |
| --- | --- | --- | --- |
| create | `name`, `story` (opcional) | Cria a sala (votação bloqueada), grava `name` como criador (facilitador) e devolve o estado com o código de 4 letras | 400 nome vazio ou maior que 20 |
| join | `code`, `name`, `rejoin` (opcional) | Entra na sala com código e nome. `rejoin: true` é usado pela tela só para reconectar quem recarregou a página | 404 sala não encontrada; 400 nome inválido; 409 nome já está na sala (sem `rejoin`) |
| release | `code`, `name` | **Sprint 2 (#7), regra do criador na Sprint 3 (#9).** Só o criador da sala libera a votação; as cartas habilitam para todos ao mesmo tempo. Salas antigas, sem criador gravado, aceitam qualquer jogador | 403 quem pede não é o criador; 400 sem nome; 409 se os votos já foram revelados |
| vote | `code`, `name`, `value` (1, 2, 3, 5, 8, 13, 21 ou ?) | Registra ou troca o voto. O valor só volta depois de revelar | 409 votação ainda não liberada; 409 votos já revelados; 400 carta inválida; 404 jogador não entrou na sala |
| reveal | `code`, `name` | **Sprint 3 (#9).** Só o criador revela todos os votos; calcula o resumo | 403 quem pede não é o criador; 400 sem nome; 409 se ninguém votou ainda |
| reset | `code`, `name`, `story` (opcional) | **Sprint 3 (#9).** Só o criador abre nova rodada: apaga os votos, esconde os valores, **bloqueia a votação de novo**, soma 1 à rodada e troca a história se `story` vier. O histórico não é apagado | 403 quem pede não é o criador; 400 sem nome; 404 sala não encontrada |
| confirm | `code`, `name`, `points` (1, 2, 3, 5, 8, 13 ou 21) | **Sprint 3 (#10).** Só o criador confirma os pontos finais da rodada depois de revelar; grava no histórico (rodada, história, pontos). Confirmar de novo na mesma rodada corrige o valor | 403 quem pede não é o criador; 409 votos ainda não revelados; 400 pontos fora da escala |
| story | `code`, `story` | Define a história da rodada (até 200 caracteres) | 404 sala não encontrada |

## Estado da sala (resposta)
```json
{
  "code": "ABCD",
  "story": "Como time, quero...",
  "revealed": false,
  "open": false,
  "creator": "Ana",
  "round": 1,
  "players": [{ "name": "Ana", "voted": true, "vote": null }],
  "history": [{ "round": 1, "story": "Como time, quero...", "points": 5 }],
  "summary": { "mean": 5.25, "median": 5, "min": 3, "max": 8, "suggested": 5, "divergent": false, "questionMarks": 1, "count": 5 }
}
```
- `open`: `true` quando a votação foi liberada na rodada atual. Começa `false` na sala nova e em cada nova rodada.
- `creator`: nome de quem criou a sala (o facilitador). A tela só mostra o botão "Liberar votação" para ele.
- `players[].vote`: só vem preenchido depois de `revealed: true`.
- `history`: pontos finais confirmados nas rodadas anteriores (e na atual, se já confirmada). Vem do banco, por isso continua depois de recarregar a página.
- `summary`: só existe depois de revelar. Votos "?" não entram na conta.

## Banco
A Sprint 2 acrescentou `rooms.open` (boolean, padrão `false`) e `rooms.creator` (texto, nome de quem criou a sala). Em banco já criado, rodar uma vez `db/migracao-sprint-2.sql` no SQL Editor do Neon antes do deploy.

A Sprint 3 acrescentou a tabela `history` (uma linha por rodada confirmada). Em banco já criado, rodar uma vez `db/migracao-sprint-3.sql` no Neon **antes** de juntar o PR na `main`: sem a tabela, a API falha ao montar o estado da sala.
