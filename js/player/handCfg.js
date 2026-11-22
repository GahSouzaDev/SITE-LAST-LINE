// AJUSTE DAS MÃOS POR ARMA (Configurações › MÃOS): posição (cm) e ângulo (graus) da mão de TRÁS (gatilho) e da mão da FRENTE (apoio) de cada arma.
// Valores somados ao que o jogo já calcula; ficam salvos neste navegador e valem para todos os personagens. Exportar/Importar em JSON.
const KEY = 'lastline.handcfg';
export const HC = { ver: 0, data: {} };
try { HC.data = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { HC.data = {}; }
const ZERO = () => ({ x: 0, y: 0, z: 0, r: 0, a: 0, b: 0, c: 0 });   // x lateral · y altura · z frente (cm) · r giro da mão em volta do antebraço · a/b/c inclinação do pulso (graus)
export const HAND_KEYS = [['x', 'Esquerda ↔ direita (cm)', -12, 12, 0.5], ['y', 'Baixo ↔ cima (cm)', -12, 12, 0.5], ['z', 'Trás ↔ frente (cm)', -20, 20, 0.5], ['r', 'Girar a mão (°)', -180, 180, 5], ['a', 'Inclinar pulso — eixo 1 (°)', -90, 90, 5], ['b', 'Inclinar pulso — eixo 2 (°)', -90, 90, 5], ['c', 'Inclinar pulso — eixo 3 (°)', -90, 90, 5]];
export const getHC = (id) => HC.data[id] || null;
export const readHC = (id, role) => ({ ...ZERO(), ...(HC.data[id]?.[role] || {}) });
function save() { HC.ver++; try { localStorage.setItem(KEY, JSON.stringify(HC.data)); } catch { /* sem armazenamento */ } }
export function setHC(id, role, key, val) { const o = (HC.data[id] ||= {}); (o[role] ||= ZERO())[key] = Number(val) || 0; save(); }
export function resetHC(id) { delete HC.data[id]; save(); }
export function copyHC(from, to) { if (!HC.data[from]) return; HC.data[to] = JSON.parse(JSON.stringify(HC.data[from])); save(); }
export const exportHC = () => JSON.stringify(HC.data, null, 1);
export function importHC(txt) { const o = JSON.parse(txt); if (!o || typeof o !== 'object') throw new Error('JSON inválido'); HC.data = o; save(); }
