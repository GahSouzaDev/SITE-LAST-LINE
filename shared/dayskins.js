// SKINS DE DIA ESPECIAL: quem ENTRAR no jogo no dia (horário de Brasília) ganha na hora. Cada skin é de UMA arma, UMA arma branca ou UM personagem
// (nada de categoria inteira). Só existem assim, não saem de caixa nem nível — e podem ser VENDIDAS ou TROCADAS no Mercado.
// date: 'MM-DD' fixo · { easter: n } dias a partir da Páscoa · { friday13: true } · { nth: [mês, diaSemana(0=dom), n] } · { after: [mês, dow, n, +dias] }
// kind: 'w' arma · 'm' arma branca · 'c' personagem (id em SPECIALS). value = valor especulado inicial (moedas) · rar = raridade de mercado.
export const DAY_SKINS = [
  { id: 'dia_cinzas',    d: { easter: -46 }, kind: 'w', t: 'tommy',    n: 'Tommy das Cinzas',        sw: '#8d8d8d', c1: 0x5a5a5a, c2: 0xd9d4c8, fx: ['ember'],         day: 'Quarta-feira de Cinzas',   value: 120, rar: 'Épica' },
  { id: 'dia_sexta13',   d: { friday13: true }, kind: 'w', t: 'scout', n: 'Sentinela Sexta-13',      sw: '#b30000', c1: 0x120808, c2: 0xb30000, fx: ['void'],           day: 'Sexta-feira 13',           value: 210, rar: 'Lendária' },
  { id: 'dia_gotinha',   d: '01-30',          kind: 'c', t: 'gotinha',  n: 'Agente Gotinha',          sw: '#35c2ff', day: 'Dia da Saúde Pública',     value: 140, rar: 'Épica' },
  { id: 'dia_mulher',    d: '03-08',          kind: 'w', t: 'pistol',   n: 'Viper Lilás',             sw: '#b36bff', c1: 0x8e44ff, c2: 0xffd6f2, fx: ['petal'],          day: 'Dia Internacional da Mulher', value: 80, rar: 'Rara' },
  { id: 'dia_circo',     d: '03-27',          kind: 'w', t: 'dualpistol', n: 'Malabares Duplos',      sw: '#ff3d6e', c1: 0xff3d6e, c2: 0xffd23d, fx: ['spark'],          day: 'Dia do Circo',             value: 130, rar: 'Épica' },
  { id: 'dia_trabalho',  d: '05-01',          kind: 'm', t: 'hammer',   n: 'Marreta do Operário',     sw: '#f2a900', c1: 0xf2a900, c2: 0x2b2b2b, fx: [],                 day: 'Dia do Trabalho',          value: 70, rar: 'Rara' },
  { id: 'dia_ambiente',  d: '06-05',          kind: 'w', t: 'bullpup',  n: 'Storm Folha Viva',        sw: '#3fbf4f', c1: 0x2f9e44, c2: 0xcff5d2, fx: ['petal'],          day: 'Dia do Meio Ambiente',     value: 80, rar: 'Rara' },
  { id: 'dia_namorados', d: '06-12',          kind: 'c', t: 'cupido',   n: 'Cupido',                  sw: '#ff5c93', day: 'Dia dos Namorados',        value: 250, rar: 'Lendária' },
  { id: 'dia_chocolate', d: '07-07',          kind: 'm', t: 'machete',  n: 'Facão de Chocolate',      sw: '#6b3a1e', c1: 0x5a2f14, c2: 0xffc9a1, fx: ['bubble'],         day: 'Dia Mundial do Chocolate', value: 60,  rar: 'Rara' },
  { id: 'dia_rock',      d: '07-13',          kind: 'w', t: 'phantom',  n: 'Phantom Heavy Metal',     sw: '#ff2fd0', c1: 0x15151b, c2: 0xff2fd0, fx: ['elec'],           day: 'Dia Mundial do Rock',      value: 150, rar: 'Épica' },
  { id: 'dia_avos',      d: '07-26',          kind: 'w', t: 'revolver', n: 'Hammer da Vovó',          sw: '#e8b4c8', c1: 0xe8b4c8, c2: 0xfff2e0, fx: [],                 day: 'Dia dos Avós',             value: 50,  rar: 'Incomum' },
  { id: 'dia_folclore',  d: '08-22',          kind: 'c', t: 'bruxa',    n: 'Bruxa do Pântano',        sw: '#6fcf3a', day: 'Dia do Folclore',          value: 160, rar: 'Épica' },
  { id: 'dia_soldado',   d: '08-25',          kind: 'w', t: 'battle',   n: 'Raven Soldado do Brasil', sw: '#5b6a3f', c1: 0x4d5b32, c2: 0xe6d9a8, fx: [],                 day: 'Dia do Soldado',           value: 90, rar: 'Rara' },
  { id: 'dia_gamer',     d: '08-29',          kind: 'w', t: 'volt',     n: 'Volt Player One',         sw: '#27ffd0', c1: 0x1a1030, c2: 0x27ffd0, fx: ['elec', 'spark'],  day: 'Dia do Gamer',             value: 180, rar: 'Lendária' },
  { id: 'dia_arvore',    d: '09-21',          kind: 'm', t: 'axe',      n: 'Machado do Guardião',     sw: '#2f8f46', c1: 0x2f8f46, c2: 0x6b4a2a, fx: ['petal'],          day: 'Dia da Árvore',            value: 110, rar: 'Épica' },
  { id: 'dia_criancas',  d: '10-12',          kind: 'w', t: 'micro',    n: 'Micro-9 de Brinquedo',    sw: '#ff7a1a', c1: 0xff4fa3, c2: 0x27c2ff, fx: ['bubble'],         day: 'Dia das Crianças',         value: 70, rar: 'Rara' },
  { id: 'dia_professor', d: '10-15',          kind: 'm', t: 'knife',    n: 'Régua do Professor',      sw: '#f2d21b', c1: 0xf2d21b, c2: 0x1b1b1b, fx: [],                 day: 'Dia do Professor',         value: 90, rar: 'Épica' },
  { id: 'dia_servidor',  d: '10-28',          kind: 'c', t: 'servidor', n: 'Servidor Público',        sw: '#8aa1b8', day: 'Dia do Servidor Público',  value: 90, rar: 'Rara' },
  { id: 'dia_finados',   d: '11-02',          kind: 'c', t: 'catrina',  n: 'Catrina',                 sw: '#ff9f2e', day: 'Dia de Finados',           value: 170, rar: 'Épica' },
  { id: 'dia_bandeira',  d: '11-19',          kind: 'w', t: 'ar',       n: 'Vanguard Bandeira',       sw: '#ffdf00', c1: 0x1f9d3a, c2: 0xffdf00, fx: ['spark'],          day: 'Dia da Bandeira',          value: 120, rar: 'Épica' },
  { id: 'dia_blackfriday', d: { after: [11, 4, 4, 1] }, kind: 'w', t: 'deagle', n: 'Goliath Black Friday', sw: '#111111', c1: 0x0b0b0b, c2: 0xf2c14e, fx: ['spark'], day: 'Black Friday',          value: 230, rar: 'Lendária' },
  { id: 'dia_samba',     d: '12-02',          kind: 'c', t: 'sambista', n: 'Sambista de Terno Branco', sw: '#f4f1e8', day: 'Dia do Samba',            value: 110, rar: 'Rara' },
  { id: 'dia_pais',      d: { nth: [8, 0, 2] }, kind: 'w', t: 'lever', n: 'Mustang do Papai',       sw: '#7a4a22', c1: 0x7a4a22, c2: 0xe0c28a, fx: [],                 day: 'Dia dos Pais',             value: 80, rar: 'Rara' },
  { id: 'dia_programador', d: '09-13',        kind: 'c', t: 'dev',      n: 'Dev da Madrugada',        sw: '#2fe08a', day: 'Dia do Programador',       value: 130, rar: 'Épica' },
];
export const DAY_BY_ID = Object.fromEntries(DAY_SKINS.map((s) => [s.id, s]));
export const DAY_CHARS = DAY_SKINS.filter((s) => s.kind === 'c');
// Páscoa (algoritmo de Meeus/Jones/Butcher)
export function easter(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return [mo, da]; }
const dow = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
function nthDow(y, m, wd, n) { const first = dow(y, m, 1); return 1 + ((wd - first + 7) % 7) + (n - 1) * 7; }
export function isToday(s, y, m, d) {
  const r = s.d;
  if (typeof r === 'string') return r === `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  if (r.easter != null) { const [em, ed] = easter(y), t = new Date(Date.UTC(y, em - 1, ed + r.easter)); return t.getUTCMonth() + 1 === m && t.getUTCDate() === d; }
  if (r.friday13) return d === 13 && dow(y, m, d) === 5;
  if (r.nth) return m === r.nth[0] && d === nthDow(y, m, r.nth[1], r.nth[2]);
  if (r.after) { const t = new Date(Date.UTC(y, r.after[0] - 1, nthDow(y, r.after[0], r.after[1], r.after[2]) + r.after[3])); return t.getUTCMonth() + 1 === m && t.getUTCDate() === d; }
  return false;
}
export const brDate = (ts = Date.now()) => { const t = new Date(ts - 3 * 3600e3); return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()]; };
export const dayItemsToday = (ts) => { const [y, m, d] = brDate(ts); return DAY_SKINS.filter((s) => isToday(s, y, m, d)); };
// próxima data de cada skin (para a vitrine "quando vem a próxima")
export function nextDate(s, ts = Date.now()) { for (let i = 0; i < 400; i++) { const [y, m, d] = brDate(ts + i * 864e5); if (isToday(s, y, m, d)) return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`; } return ''; }
