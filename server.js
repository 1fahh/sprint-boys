// Servidor simples em Node para hospedar o site e a API fora da Vercel (ex.: Render).
// Serve a pasta public/ e encaminha /api/room para a mesma função usada na Vercel.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './api/room.js';

const PUBLIC_DIR = join(fileURLToPath(new URL('.', import.meta.url)), 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function serveStatic(pathname, res) {
  const file = pathname === '/' ? '/index.html' : pathname;
  const full = normalize(join(PUBLIC_DIR, file));
  if (!full.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Acesso negado');
    return;
  }
  try {
    const data = await readFile(full);
    res.writeHead(200, { 'Content-Type': TYPES[extname(full)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Não encontrado');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/room') {
    req.query = Object.fromEntries(url.searchParams);
    req.body = req.method === 'POST' ? await readBody(req) : undefined;
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(data));
    };
    await handler(req, res);
    return;
  }
  await serveStatic(url.pathname, res);
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Sprint Boys Poker em http://localhost:${port}`));
