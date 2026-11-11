-- Rode este arquivo uma vez no SQL Editor do Neon.

create table if not exists rooms (
  code       text primary key,
  story      text not null default '',
  revealed   boolean not null default false,
  round      integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists players (
  room_code text not null references rooms(code) on delete cascade,
  name      text not null,
  vote      text,
  joined_at timestamptz not null default now(),
  primary key (room_code, name)
);
