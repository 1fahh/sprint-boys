// Função serverless da Vercel: uma única rota /api/room.
//   GET  /api/room?code=ABCD          -> estado da sala
//   POST /api/room  { action, ... }   -> create | join | vote | reveal | reset | story
//
// Os votos só saem do servidor depois que a sala é revelada.

import { neon } from '@neondatabase/serverless';
import { isValidVote, isValidName, makeCode, normalizeCode, summarize } from '../lib/poker.js';

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new HttpError(500, 'Banco não configurado: falta a variável DATABASE_URL.');
  }
  return neon(process.env.DATABASE_URL);
}

async function loadState(sql, code) {
  const rooms = await sql`select code, story, revealed, round from rooms where code = ${code}`;
  if (rooms.length === 0) return null;
  const room = rooms[0];
  const players = await sql`
    select name, vote from players where room_code = ${code} order by joined_at, name`;

  const state = {
    code: room.code,
    story: room.story,
    revealed: room.revealed,
    round: room.round,
    players: players.map((p) => ({
      name: p.name,
      voted: p.vote !== null,
      vote: room.revealed ? p.vote : null,
    })),
  };
  if (room.revealed) {
    state.summary = summarize(players.map((p) => p.vote).filter((v) => v !== null));
  }
  return state;
}

function cleanName(value) {
  if (!isValidName(value)) throw new HttpError(400, 'Informe um nome de 1 a 20 caracteres.');
  return value.trim();
}

function cleanStory(value) {
  return String(value || '').trim().slice(0, 200);
}

async function requireRoom(sql, code) {
  const rows = await sql`select code, revealed from rooms where code = ${code}`;
  if (rows.length === 0) throw new HttpError(404, 'Sala não encontrada. Confira o código.');
  return rows[0];
}

async function handlePost(sql, body) {
  const action = body.action;

  if (action === 'create') {
    const name = cleanName(body.name);
    let code = null;
    for (let i = 0; i < 8 && !code; i++) {
      const candidate = makeCode();
      const inserted = await sql`
        insert into rooms (code, story) values (${candidate}, ${cleanStory(body.story)})
        on conflict do nothing returning code`;
      if (inserted.length) code = candidate;
    }
    if (!code) throw new HttpError(500, 'Não foi possível gerar um código de sala. Tente de novo.');
    await sql`insert into players (room_code, name) values (${code}, ${name})`;
    return code;
  }

  const code = normalizeCode(body.code);
  const room = await requireRoom(sql, code);

  if (action === 'join') {
    const name = cleanName(body.name);
    await sql`
      insert into players (room_code, name) values (${code}, ${name})
      on conflict do nothing`;
  } else if (action === 'vote') {
    const name = cleanName(body.name);
    if (!isValidVote(body.value)) throw new HttpError(400, 'Carta inválida.');
    if (room.revealed) throw new HttpError(409, 'Os votos já foram revelados. Comece uma nova rodada.');
    const updated = await sql`
      update players set vote = ${body.value}
      where room_code = ${code} and name = ${name} returning name`;
    if (updated.length === 0) throw new HttpError(404, 'Você ainda não entrou nesta sala.');
  } else if (action === 'reveal') {
    await sql`update rooms set revealed = true where code = ${code}`;
  } else if (action === 'reset') {
    await sql`update players set vote = null where room_code = ${code}`;
    await sql`update rooms set revealed = false, round = round + 1 where code = ${code}`;
    if (body.story !== undefined) {
      await sql`update rooms set story = ${cleanStory(body.story)} where code = ${code}`;
    }
  } else if (action === 'story') {
    await sql`update rooms set story = ${cleanStory(body.story)} where code = ${code}`;
  } else {
    throw new HttpError(400, 'Ação desconhecida.');
  }
  return code;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const sql = getDb();
    let code;
    if (req.method === 'GET') {
      code = normalizeCode(req.query.code);
    } else if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      code = await handlePost(sql, body);
    } else {
      throw new HttpError(405, 'Método não permitido.');
    }
    const state = await loadState(sql, code);
    if (!state) throw new HttpError(404, 'Sala não encontrada. Confira o código.');
    res.status(200).json(state);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof HttpError ? err.message : 'Erro interno. Tente de novo.';
    if (!(err instanceof HttpError)) console.error(err);
    res.status(status).json({ error: message });
  }
}
