-- Rode uma vez no SQL Editor do Neon (ou pelo terminal) ANTES do deploy da história 7 (liberar votação).
-- open: votação liberada na rodada atual. Salas que já existem ficam bloqueadas até liberar.
-- creator: nome de quem criou a sala (o facilitador). Salas antigas ficam sem criador e qualquer um libera.
alter table rooms add column if not exists open boolean not null default false;
alter table rooms add column if not exists creator text;
