// CORES DAS GRANADAS (só visual): a fumaça, o clarão da granada de luz e a explosão ganham a cor escolhida. Cada cor libera por nível.
export const GCOL = {
  orange: { n: 'Laranja (padrão)', hex: '#ff8a1a', lv: 1, kinds: ['frag'] }, white: { n: 'Branco (padrão)', hex: '#e8eef4', lv: 1, kinds: ['smoke', 'flash', 'lamp'] },
  blue: { n: 'Azul', hex: '#3da5ff', lv: 5, kinds: ['frag', 'smoke', 'flash', 'lamp'] }, green: { n: 'Verde', hex: '#3dff6a', lv: 10, kinds: ['frag', 'smoke', 'flash', 'lamp'] }, pink: { n: 'Rosa', hex: '#ff5fbf', lv: 15, kinds: ['frag', 'smoke', 'flash', 'lamp'] },
  red: { n: 'Vermelho', hex: '#ff3b3b', lv: 20, kinds: ['frag', 'smoke', 'flash', 'lamp'] }, purple: { n: 'Roxo', hex: '#a54dff', lv: 26, kinds: ['frag', 'smoke', 'flash', 'lamp'] }, yellow: { n: 'Amarelo', hex: '#ffe14d', lv: 32, kinds: ['frag', 'smoke', 'flash', 'lamp'] },
  cyan: { n: 'Ciano', hex: '#3df0ff', lv: 38, kinds: ['frag', 'smoke', 'flash', 'lamp'] }, black: { n: 'Preto', hex: '#2a2a33', lv: 45, kinds: ['smoke'] }
};
export const GDEFAULT = { frag: 'orange', smoke: 'white', flash: 'white', lamp: 'white' };
export const LAMPS = ['white', 'blue', 'green', 'pink', 'red', 'purple', 'yellow', 'cyan'];   // cor da LANTERNA (índice vai nos bits 12-14 do estado do jogador)
export const lampIdx = (id) => Math.max(0, LAMPS.indexOf(id));
export const gkind = (k) => (k === 'smoke' || k === 'flash' ? k : 'frag');   // impacto e mina usam a cor da explosão
export const gcolRgb = (id) => { const c = GCOL[id]?.hex || '#ffffff'; return [parseInt(c.slice(1, 3), 16) / 255, parseInt(c.slice(3, 5), 16) / 255, parseInt(c.slice(5, 7), 16) / 255]; };
export const LAMP_LV = { white: 1, yellow: 25, blue: 30, green: 35, red: 40, cyan: 45, pink: 50, purple: 50 };   // a lanterna libera uma cor a cada 5 níveis
export const lampLv = (id) => LAMP_LV[id] ?? 50;
export function sanitizeGcolor(raw = {}, level = 1) { const out = {}; for (const k of ['frag', 'smoke', 'flash', 'lamp']) { const id = raw?.[k]; out[k] = GCOL[id] && GCOL[id].kinds.includes(k) && (k === 'lamp' ? lampLv(id) : GCOL[id].lv) <= level ? id : GDEFAULT[k]; } return out; }

export const lampHex = (i) => (i > 0 && LAMPS[i] ? parseInt(GCOL[LAMPS[i]].hex.slice(1), 16) : 0xfff1d0);   // 0 = branco quente (padrão)
