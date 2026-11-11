import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIB, isValidVote, isValidName, normalizeCode, makeCode, summarize } from '../lib/poker.js';

test('isValidVote aceita só cartas da escala', () => {
  for (const v of FIB) assert.equal(isValidVote(v), true);
  assert.equal(isValidVote('4'), false);
  assert.equal(isValidVote(''), false);
  assert.equal(isValidVote(5), false);
});

test('isValidName exige de 1 a 20 caracteres', () => {
  assert.equal(isValidName('Ana'), true);
  assert.equal(isValidName('   '), false);
  assert.equal(isValidName(''), false);
  assert.equal(isValidName('x'.repeat(21)), false);
  assert.equal(isValidName(undefined), false);
});

test('normalizeCode tira espaços e põe em maiúsculas', () => {
  assert.equal(normalizeCode('  abcd '), 'ABCD');
  assert.equal(normalizeCode(undefined), '');
});

test('makeCode gera 4 letras sem I, O e L', () => {
  for (let i = 0; i < 200; i++) {
    assert.match(makeCode(), /^[A-HJKM-NP-Z]{4}$/);
  }
});

test('summarize: votos próximos sugerem a mediana', () => {
  const r = summarize(['3', '5', '5']);
  assert.equal(r.median, 5);
  assert.equal(r.suggested, 5);
  assert.equal(r.divergent, false);
  assert.ok(Math.abs(r.mean - 13 / 3) < 1e-9);
});

test('summarize: mediana entre duas cartas fica na menor', () => {
  assert.equal(summarize(['3', '5']).suggested, 3);
});

test('summarize: votos muito distantes são divergentes', () => {
  const r = summarize(['1', '13']);
  assert.equal(r.divergent, true);
  assert.equal(r.min, 1);
  assert.equal(r.max, 13);
});

test('summarize: "?" não entra na conta, só é contado', () => {
  const r = summarize(['?', '3']);
  assert.equal(r.questionMarks, 1);
  assert.equal(r.median, 3);
  assert.equal(r.count, 2);
});

test('summarize: só "?" não sugere nada', () => {
  const r = summarize(['?', '?']);
  assert.equal(r.suggested, null);
  assert.equal(r.divergent, false);
});
