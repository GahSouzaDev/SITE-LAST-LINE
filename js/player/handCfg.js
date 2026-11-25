// AJUSTE DAS MÃOS POR ARMA: o ADMIN ajusta (painel admin › Mãos das armas) e o servidor entrega a todos os jogadores. Valores SOMADOS ao cálculo automático.
import { DEFAULT_HC } from '/shared/handDefaults.js';
const LSK = 'lastline.handcfg';
const cached = () => { try { const o = JSON.parse(localStorage.getItem(LSK) || 'null'); return o && typeof o === 'object' && Object.keys(o).length ? o : null; } catch { return null; } };
export const HC = { ver: 0, data: cached() || JSON.parse(JSON.stringify(DEFAULT_HC)) };   /* já nasce com o ÚLTIMO ajuste recebido do servidor (guardado no aparelho); sem ele, o padrão do jogo */   // já nasce com o PADRÃO do jogo (nada de piscar com o valor inicial)
const ZERO = () => ({ x: 0, y: 0, z: 0, r: 0, a: 0, b: 0, c: 0, t: 0 });   // x lateral · y altura · z frente (cm) · r giro da mão em volta do antebraço · a/b/c inclinação do pulso (graus)
export const HAND_KEYS = [['x', 'Esquerda ↔ direita (cm)', -12, 12, 0.5], ['y', 'Baixo ↔ cima (cm)', -12, 12, 0.5], ['z', 'Trás ↔ frente (cm)', -20, 20, 0.5], ['r', 'Girar a mão (°)', -180, 180, 5], ['a', 'Inclinar pulso — eixo 1 (°)', -90, 90, 5], ['b', 'Inclinar pulso — eixo 2 (°)', -90, 90, 5], ['c', 'Inclinar pulso — eixo 3 (°)', -90, 90, 5]];
export const GUN_KEYS = [['x', 'Esquerda ↔ direita (cm)', -30, 30, 0.5], ['y', 'Baixo ↔ cima (cm)', -30, 30, 0.5], ['z', 'Perto ↔ longe do corpo (cm)', -40, 40, 0.5], ['a', 'Inclinar cano para cima/baixo (°)', -45, 45, 1], ['b', 'Girar cano para os lados (°)', -45, 45, 1]];   // posição da ARMA no corpo (3ª pessoa)
export const MELEE_KEYS = [['x', 'Esquerda ↔ direita (cm)', -30, 30, 0.5], ['y', 'Baixo ↔ cima (cm)', -30, 30, 0.5], ['z', 'Trás ↔ frente (cm)', -40, 40, 0.5], ['a', 'Inclinar cabo — para cima/baixo (°)', -180, 180, 5], ['b', 'Girar a arma para os lados (°)', -180, 180, 5], ['c', 'Girar em volta do cabo — vira a lâmina (°)', -180, 180, 5], ['t', 'Outra mão: mais perto ↔ longe da cabeça (cm)', -30, 30, 1]];   // ARMA BRANCA na mão (3ª pessoa)
export const getHC = (id) => HC.data[id] || null;
export const readHC = (id, role) => ({ ...ZERO(), ...(HC.data[id]?.[role] || {}) });
export function setAllHC(o) { HC.data = o && typeof o === 'object' ? o : {}; HC.ver++; }
export function setHC(id, role, key, val) { const o = (HC.data[id] ||= {}); (o[role] ||= ZERO())[key] = Number(val) || 0; HC.ver++; }
export function resetHC(id) { delete HC.data[id]; HC.ver++; }
export function copyHC(from, to) { if (!HC.data[from]) return; HC.data[to] = JSON.parse(JSON.stringify(HC.data[from])); HC.ver++; }
export const exportHC = () => JSON.stringify(HC.data, null, 1);
export function importHC(txt) { const o = JSON.parse(txt); if (!o || typeof o !== 'object') throw new Error('JSON inválido'); setAllHC(o); }
export async function loadHC() { try { const r = await fetch('/api/handcfg', { cache: 'no-store' }); if (r.ok) { const c = (await r.json()).cfg; if (c && Object.keys(c).length) { const t = JSON.stringify(c); let old = null; try { old = localStorage.getItem(LSK); localStorage.setItem(LSK, t); } catch { /* sem armazenamento */ } if (old !== t) setAllHC(c); } } } catch { /* sem ajuste */ } }
