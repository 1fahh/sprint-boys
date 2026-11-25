-- Rode uma vez no SQL Editor do Neon (ou pelo terminal) ANTES do deploy da Sprint 3.
-- Sem esta tabela a API falha ao montar o estado da sala, então rode ANTES de juntar o PR na main.
-- history: uma linha por rodada confirmada (história 10). Apagar a sala apaga o histórico dela.
create table if not exists history (
  room_code  text not null references rooms(code) on delete cascade,
  round      integer not null,
  story      text not null default '',
  points     integer not null,
  created_at timestamptz not null default now(),
  primary key (room_code, round)
);
