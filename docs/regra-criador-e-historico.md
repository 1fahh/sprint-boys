# Regras: criador da sala e histórico (histórias 9 e 10)

Rascunho para o Gustavo (PO) revisar e assumir. Se algo não for o que o time quer, a regra muda aqui antes do código.

## Quem controla a rodada (história 9)
- **Criador:** quem criou a sala. O sistema grava o nome dele em `rooms.creator`.
- **Só o criador** libera a votação, revela os votos, abre nova rodada e confirma os pontos finais.
- **Quem não é o criador** não vê os botões e, se tentar pela API, recebe 403 com a mensagem "Só o facilitador (quem criou a sala) pode ...".
- **Todos** continuam podendo entrar, votar e ver resultado e histórico.
- **Salas antigas** (sem criador gravado) continuam como antes: qualquer jogador age.
- **Limite conhecido:** o criador é identificado pelo nome, sem senha. Alguém que saiba o nome do criador pode agir como ele.

## Histórico (história 10)
- Depois de **revelar**, o criador confirma os **pontos finais** da rodada (a tela sugere a pontuação calculada).
- Só vale número da escala (1, 2, 3, 5, 8, 13, 21). "?" não fecha estimativa.
- Cada rodada confirmada vira uma linha: rodada, história e pontos, com o total no fim.
- Confirmar de novo na mesma rodada **corrige** a linha, sem duplicar.
- Nova rodada **não apaga** o histórico. Ele fica no banco e volta ao recarregar a página.

## Como conferir (à mão no site)
1. Sala nova com dois navegadores: o segundo (quem entrou) não vê Liberar, Revelar nem Nova rodada.
2. Criador libera, os dois votam, o criador revela e o segundo vê o resultado sem o bloco de confirmar.
3. Criador confirma os pontos: a linha aparece no histórico dos dois.
4. Recarregar a página: o histórico continua.
5. Nova rodada: o resultado antigo some e o histórico fica.
