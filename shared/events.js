// EVENTOS MENSAIS: um por mês, baseado em datas do Brasil. A missão é jogar N partidas num mapa durante o mês.
// A recompensa é EXCLUSIVA do mês em que foi jogada (skins evt01..evt12 não saem de caixa, nem de nível, nem de loot).
// Skins de arma ganham sniper + pistola + faca. Personagem especial só onde existe (Natal: Papai Noel · Páscoa: Coelhinho).
export const EVENT_RULES = { minMs: 5 * 60 * 1000 };   // ajustável pelo admin (minutos mínimos por partida)
export const EVENT_MIN_MS = 5 * 60 * 1000;   // só conta partida de 5 MINUTOS ou mais (qualquer modo, no mapa do evento)
export const EVENT_GROUPS = ['sniper', 'pistol', 'melee'];
export const EVENTS = [
  { m: 1, id: 'evt01', n: 'Ano Novo', skin: 'Fogos de Réveillon', sw: '#ffd84a', c1: 0x1a1a3a, c2: 0xffd84a, map: 'plataforma', goal: 8, char: 'reveillon', desc: 'Brinde o ano novo com fogos e brilho dourado.' },
  { m: 2, id: 'evt02', n: 'Carnaval', skin: 'Confete e Serpentina', sw: '#ff3de0', c1: 0x7a1fd1, c2: 0x2ee86a, map: 'parque', goal: 8, char: 'folia', desc: 'A folia chegou ao parque de diversões.' },
  { m: 3, id: 'evt03', n: 'Dia do Circo', skin: 'Grande Circo', sw: '#ff4a3a', c1: 0xd62828, c2: 0xfff1d0, map: 'parque', goal: 8, char: 'palhaco', desc: 'Respeitável público: listras vermelhas e brancas.' },
  { m: 4, id: 'evt04', n: 'Páscoa', skin: 'Ovo de Páscoa', sw: '#c98a4a', c1: 0x5a3a1e, c2: 0xff9fd0, map: 'floresta', goal: 8, char: 'coelho', desc: 'Chocolate, laços e cores de Páscoa — e o Coelhinho da Páscoa!' },
  { m: 5, id: 'evt05', n: 'Florista', skin: 'Pele de Flores', sw: '#ff7aa8', c1: 0xffd1e0, c2: 0xe0457b, map: 'litoral', goal: 8, char: 'florista', desc: 'Flores e rosa para homenagear quem manda em casa.' },
  { m: 6, id: 'evt06', n: 'Festa Junina', skin: 'Arraiá', sw: '#ff9a2e', c1: 0xc0392b, c2: 0xf1c40f, map: 'sertaozinho', goal: 8, char: 'sanfoneiro', desc: 'Xadrez junino, fogueira e bandeirinhas.' },
  { m: 7, id: 'evt07', n: 'Férias de Julho', skin: 'Verão no Litoral', sw: '#2ec4ff', c1: 0x0a7ea4, c2: 0xffe08a, map: 'litoral', goal: 8, char: 'surfista', desc: 'Sol, mar e areia dourada.' },
  { m: 8, id: 'evt08', n: 'Folclore Brasileiro', skin: 'Lenda da Mata', sw: '#3ddc6a', c1: 0x1d4d2a, c2: 0xff7a1a, map: 'floresta', goal: 8, char: 'iara', desc: 'Curupira, Iara e Saci: o Brasil das lendas.' },
  { m: 9, id: 'evt09', n: 'Independência', skin: 'Verde e Amarelo', sw: '#2ecc40', c1: 0x0c8f3c, c2: 0xffdf00, map: 'montanha-de-gelo', goal: 8, char: 'patriota', chars: ['patriota', 'petista'], desc: 'Orgulho nas cores do Brasil.' },
  { m: 10, id: 'evt10', n: 'Halloween', skin: 'Noite das Abóboras', sw: '#ff7a00', c1: 0x1a0a22, c2: 0xff7a00, map: 'laboratorio', goal: 7, char: 'abobora', desc: 'Abóboras, teias e luz laranja no escuro.' },
  { m: 11, id: 'evt11', n: 'República', skin: 'Bandeira da República', sw: '#ffd700', c1: 0x1f5fbf, c2: 0xfff2a8, map: 'porto', goal: 8, char: 'marechal', desc: 'Azul e dourado para o mês da República.' },
  { m: 12, id: 'evt12', n: 'Natal', skin: 'Bengala Doce', sw: '#e8222e', c1: 0xe8222e, c2: 0xffffff, map: 'montanha-de-gelo', goal: 8, char: 'noel', coins: 30, crates: 3, desc: 'Conjunto de Natal completo, com o Papai Noel, na Montanha de Gelo.' }
];
export const eventOfMonth = (m) => EVENTS.find((e) => e.m === m) || EVENTS[0];
// mês no horário de Brasília (UTC-3)
export const brNow = (ts = Date.now()) => { const d = new Date(ts - 3 * 3600e3); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, ym: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}` }; };
export const EVENT_SKIN_IDS = new Set(EVENTS.map((e) => e.id));

// CALENDÁRIO REAL DOS EVENTOS: cada evento acontece UMA vez por mês, em ordem. Começa em out/2026 (Halloween), nov/2026 (República), dez/2026 (Natal) e
// segue jan/2027 (Ano Novo) … set/2027 (Independência). Out, nov e dez de 2027 aparecem como EM BREVE (ainda não existem). Quem não completa no mês perde a recompensa.
export const EVENT_SCHEDULE = [['2026-10', 'evt10'], ['2026-11', 'evt11'], ['2026-12', 'evt12'], ['2027-01', 'evt01'], ['2027-02', 'evt02'], ['2027-03', 'evt03'], ['2027-04', 'evt04'], ['2027-05', 'evt05'], ['2027-06', 'evt06'], ['2027-07', 'evt07'], ['2027-08', 'evt08'], ['2027-09', 'evt09']].map(([ym, id]) => ({ ym, id }));
export const EVENT_SOON = [];   // os 12 eventos se repetem todo ano: nada fica "em breve"
// o evento depende SÓ do mês (jan = Ano Novo … dez = Natal) e se repete todo ano a partir de out/2026; o admin pode desligar cada um (e.off)
export const eventOfYm = (ym) => { if (!ym || ym < '2026-10') return null; const e = EVENTS.find((x) => x.m === Number(ym.slice(5))); return e && !e.off ? e : null; };
export const ymOfEvent = (id) => EVENT_SCHEDULE.find((x) => x.id === id)?.ym || null;
export const CAL_YMS = EVENT_SCHEDULE.map((x) => x.ym);   // chaves dos banners/artes: o ciclo base out/2026–set/2027
export const baseYm = (ym) => { const m = String(ym).slice(5, 7); return `${Number(m) >= 10 ? 2026 : 2027}-${m}`; };   // qualquer ano usa a arte/configuração do mesmo mês do ciclo base
export const cycleYms = (ts = Date.now()) => { const n = brNow(ts), k = Math.max(0, Math.floor(((n.y * 12 + n.m - 1) - (2026 * 12 + 9)) / 12)), out = []; for (let i = 0; i < 12; i++) { const t = 2026 * 12 + 9 + k * 12 + i, y = Math.floor(t / 12), m = t % 12 + 1; out.push(`${y}-${String(m).padStart(2, '0')}`); } return out; };   // os 12 meses do ciclo atual
// banner de cada mês: /assets/events/AAAA-MM.jpg (para trocar a arte basta salvar outra imagem com o mesmo nome)
export const bannerOf = (ym) => `/assets/events/${baseYm(ym)}.jpg`;
