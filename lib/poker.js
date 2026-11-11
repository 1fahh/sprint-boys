// Regras do Planning Poker. Funções puras: não acessam banco nem rede,
// por isso são fáceis de testar (TDD).

export const FIB = ['1', '2', '3', '5', '8', '13', '21', '?'];
const NUMEROS = [1, 2, 3, 5, 8, 13, 21];

// Letras sem I, O, L para o código da sala não ser confundido ao ser lido em voz alta.
const LETRAS = 'ABCDEFGHJKMNPQRSTUVWXYZ';

export function isValidVote(v) {
  return FIB.includes(v);
}

export function isValidName(nome) {
  return typeof nome === 'string' && nome.trim().length >= 1 && nome.trim().length <= 20;
}

export function normalizeCode(codigo) {
  return String(codigo || '').trim().toUpperCase();
}

export function makeCode(random = Math.random) {
  let codigo = '';
  for (let i = 0; i < 4; i++) {
    codigo += LETRAS[Math.floor(random() * LETRAS.length)];
  }
  return codigo;
}

// Recebe a lista de votos (strings de FIB) e devolve o resumo da rodada.
// Votos "?" não entram nas contas; só são contados.
export function summarize(votos) {
  const interrogacoes = votos.filter((v) => v === '?').length;
  const nums = votos
    .filter((v) => v !== '?')
    .map(Number)
    .sort((a, b) => a - b);

  if (nums.length === 0) {
    return {
      count: votos.length, questionMarks: interrogacoes,
      mean: null, median: null, min: null, max: null,
      suggested: null, divergent: false,
    };
  }

  const soma = nums.reduce((a, b) => a + b, 0);
  const media = soma / nums.length;
  const meio = Math.floor(nums.length / 2);
  const mediana = nums.length % 2 ? nums[meio] : (nums[meio - 1] + nums[meio]) / 2;

  // Em empate, fica o menor valor da escala (reduce com "<" estrito mantém o primeiro).
  const sugerido = NUMEROS.reduce((a, b) =>
    Math.abs(b - mediana) < Math.abs(a - mediana) ? b : a);

  const min = nums[0];
  const max = nums[nums.length - 1];
  // Divergente: os votos extremos estão 3 ou mais posições distantes na escala.
  const divergente = NUMEROS.indexOf(max) - NUMEROS.indexOf(min) >= 3;

  return {
    count: votos.length, questionMarks: interrogacoes,
    mean: media, median: mediana, min, max,
    suggested: sugerido, divergent: divergente,
  };
}
