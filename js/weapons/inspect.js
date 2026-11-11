// INSPECIONAR a arma (tecla R com a arma cheia): a animaçãozinha de cada categoria, em curvas por tempo (0..1). Usada pela 1ª pessoa (viewmodel.js) e pela 3ª (avatar.js → characterRig.js).
// Canais (metros / radianos): lift (sobe), fwd (frente), pitch (+ = boca do cano para cima), roll (gira em volta do cano), yaw (+ = cano para o lado de dentro),
// sup (0..1: a mão de apoio sai da arma), supF (a mão de apoio vai à frente), arm/twirl/tilt (armas brancas: braço, giro do cabo, inclinação).
import { ARSENAL_BY_ID } from '../../../shared/arsenalData.js';
import { ITEMS } from '../../../shared/items.js';
const sm = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const kf = (p, pts) => { if (p <= pts[0][0]) return pts[0][1]; for (let i = 0; i < pts.length - 1; i++) { const [t0, v0] = pts[i], [t1, v1] = pts[i + 1]; if (p < t1) return v0 + (v1 - v0) * sm((p - t0) / (t1 - t0)); } return pts[pts.length - 1][1]; };
const BOLTS = new Set(['scout', 'amr', 'hunter', 'santa', 'mosquete', 'dragao', 'cangaco', 'sniper']), PUMPS = new Set(['pump', 'spas', 'champ', 'confete', 'tucano', 'piranha', 'mula']);
export function inspectKind(id) {
  const it = ITEMS[id]; if (!it) return 'rifle';
  if (it.cls === 'melee') { if (id === 'chainsaw') return 'chainsaw'; if (['spear', 'tridente'].includes(id)) return 'polearm'; if (['axe', 'hammer', 'bat', 'foice'].includes(id)) return 'big'; if (['knife', 'xknife', 'karambit', 'caipora', 'navalha', 'paje', 'cenoura'].includes(id)) return 'knife'; return 'blade'; }
  if (it.slot === 'grenade' || id === 'bomb') return 'grenade';
  const c = ARSENAL_BY_ID[id]?.cls;
  if (BOLTS.has(id)) return 'bolt'; if (PUMPS.has(id) || c === 'shotgun') return 'shotgun';
  if (c === 'pistol' || c === 'dual') return 'pistol'; if (c === 'smg') return 'smg'; if (c === 'lmg') return 'lmg'; if (c === 'launcher') return 'launcher'; if (c === 'energy' || c === 'special') return 'energy'; if (c === 'sniper') return 'bolt';
  return 'rifle';
}
export const DUR = { pistol: 3.0, smg: 3.2, rifle: 3.4, shotgun: 3.4, bolt: 3.8, lmg: 3.8, launcher: 3.4, energy: 3.2, knife: 2.8, blade: 3.2, big: 3.4, polearm: 3.2, chainsaw: 3.6, grenade: 2.4 };
// barulhos no tempo certo (nome → audio.inspect): move = roupa/couro · tap = tapa no pente · click = trava do pente · rack = ferrolho/ ação · spin = giro no ar · ping = lâmina tinindo · rev = motosserra
export const EVENTS = {
  pistol: [[0.1, 'move'], [0.34, 'spin'], [0.56, 'spin'], [0.76, 'rack'], [0.9, 'click']], smg: [[0.1, 'move'], [0.3, 'spin'], [0.52, 'tap'], [0.62, 'click'], [0.84, 'rack']], rifle: [[0.1, 'move'], [0.3, 'spin'], [0.5, 'tap'], [0.58, 'click'], [0.84, 'rack']],
  shotgun: [[0.1, 'move'], [0.34, 'pump'], [0.56, 'pump'], [0.8, 'click']], bolt: [[0.1, 'move'], [0.3, 'spin'], [0.5, 'bolt'], [0.62, 'bolt'], [0.86, 'click']], lmg: [[0.1, 'move'], [0.34, 'tap'], [0.48, 'click'], [0.66, 'rack'], [0.86, 'move']],
  launcher: [[0.1, 'move'], [0.4, 'thunk'], [0.62, 'tap'], [0.85, 'click']], energy: [[0.08, 'hum'], [0.35, 'spin'], [0.62, 'hum'], [0.85, 'click']],
  knife: [[0.14, 'flip'], [0.34, 'flip'], [0.58, 'ping'], [0.76, 'flip']], blade: [[0.14, 'ping'], [0.38, 'flip'], [0.62, 'ping'], [0.84, 'move']], big: [[0.14, 'move'], [0.4, 'thunk'], [0.64, 'move'], [0.84, 'thunk']], polearm: [[0.14, 'move'], [0.4, 'spin'], [0.66, 'thunk']], chainsaw: [[0.1, 'move'], [0.3, 'rev'], [0.48, 'rev'], [0.72, 'rev'], [0.92, 'click']], grenade: [[0.2, 'move'], [0.5, 'click'], [0.8, 'move']],
};
const MELEE_KINDS = new Set(['knife', 'blade', 'big', 'polearm', 'chainsaw']);
export const isMeleeKind = (k) => MELEE_KINDS.has(k);
const A = {   // armas de fogo
  pistol: { lift: [[0, 0], [0.14, 0.06], [0.86, 0.06], [1, 0]], fwd: [[0, 0], [0.14, -0.06], [0.86, -0.06], [1, 0]], pitch: [[0, 0], [0.14, 0.4], [0.7, 0.3], [0.9, 0.1], [1, 0]], roll: [[0, 0], [0.22, 0], [0.38, 1.55], [0.5, 1.55], [0.64, -1.4], [0.74, -1.4], [0.86, 0], [1, 0]], yaw: [[0, 0], [0.2, 0.3], [0.7, 0.3], [0.9, 0]], sup: [[0, 0], [0.7, 0], [0.76, 1], [0.86, 1], [0.94, 0]], supF: [[0, 0], [0.7, 0], [0.76, -0.04], [0.82, 0.05], [0.9, 0]] },
  smg: { lift: [[0, 0], [0.14, 0.05], [0.86, 0.05], [1, 0]], fwd: [[0, 0], [0.14, -0.08], [0.86, -0.08], [1, 0]], pitch: [[0, 0], [0.14, 0.3], [0.8, 0.22], [1, 0]], roll: [[0, 0], [0.2, 0], [0.34, 1.35], [0.48, 1.35], [0.6, -1.2], [0.74, -1.2], [0.88, 0], [1, 0]], yaw: [[0, 0], [0.2, 0.35], [0.8, 0.3], [1, 0]], sup: [[0, 0], [0.4, 0], [0.46, 1], [0.64, 1], [0.7, 0], [0.8, 0], [0.84, 0.5], [0.9, 0]], supF: [[0, 0], [0.8, 0], [0.84, -0.06], [0.9, 0]] },
  rifle: { lift: [[0, 0], [0.14, 0.05], [0.86, 0.05], [1, 0]], fwd: [[0, 0], [0.14, -0.09], [0.86, -0.09], [1, 0]], pitch: [[0, 0], [0.14, 0.32], [0.8, 0.22], [1, 0]], roll: [[0, 0], [0.2, 0], [0.34, 1.3], [0.5, 1.3], [0.62, -1.15], [0.76, -1.15], [0.9, 0], [1, 0]], yaw: [[0, 0], [0.2, 0.4], [0.8, 0.3], [1, 0]], sup: [[0, 0], [0.4, 0], [0.47, 1], [0.64, 1], [0.7, 0], [0.8, 0], [0.84, 0.6], [0.9, 0]], supF: [[0, 0], [0.8, 0], [0.84, -0.07], [0.9, 0]] },
  shotgun: { lift: [[0, 0], [0.14, 0.05], [0.86, 0.05], [1, 0]], fwd: [[0, 0], [0.14, -0.08], [0.86, -0.08], [1, 0]], pitch: [[0, 0], [0.14, 0.42], [0.82, 0.3], [1, 0]], roll: [[0, 0], [0.2, 0], [0.3, 0.7], [0.5, 0.7], [0.62, -0.7], [0.78, 0], [1, 0]], yaw: [[0, 0], [0.2, 0.3], [0.8, 0.3], [1, 0]], sup: [[0, 0], [0.3, 0], [0.34, 0.5], [0.4, 0.5], [0.56, 0.5], [0.62, 0.3], [0.8, 0], [1, 0]], supF: [[0, 0], [0.3, 0], [0.34, 0.1], [0.4, -0.12], [0.46, 0.1], [0.52, -0.12], [0.58, 0.1], [0.66, 0], [1, 0]] },
  bolt: { lift: [[0, 0], [0.14, 0.06], [0.86, 0.06], [1, 0]], fwd: [[0, 0], [0.14, -0.08], [0.86, -0.08], [1, 0]], pitch: [[0, 0], [0.14, 0.35], [0.85, 0.2], [1, 0]], roll: [[0, 0], [0.2, 0], [0.34, 1.1], [0.46, 1.1], [0.66, 0.9], [0.8, -0.8], [0.92, 0], [1, 0]], yaw: [[0, 0], [0.2, 0.45], [0.8, 0.3], [1, 0]], sup: [[0, 0], [0.4, 0], [0.46, 0.8], [0.7, 0.8], [0.76, 0], [1, 0]], supF: [[0, 0], [0.46, 0], [0.5, 0.1], [0.56, -0.12], [0.62, 0.1], [0.68, -0.05], [0.76, 0], [1, 0]] },
  lmg: { lift: [[0, 0], [0.14, 0.08], [0.86, 0.08], [1, 0]], fwd: [[0, 0], [0.14, -0.1], [0.86, -0.1], [1, 0]], pitch: [[0, 0], [0.14, 0.3], [0.8, 0.2], [1, 0]], roll: [[0, 0], [0.2, 0], [0.36, 0.9], [0.52, 0.9], [0.66, -0.7], [0.82, 0], [1, 0]], yaw: [[0, 0], [0.2, 0.3], [0.8, 0.25], [1, 0]], sup: [[0, 0], [0.34, 0], [0.4, 1], [0.58, 1], [0.66, 0], [1, 0]], supF: [[0, 0], [0.4, 0], [0.5, 0.06], [0.6, 0], [1, 0]] },
  launcher: { lift: [[0, 0], [0.16, 0.1], [0.84, 0.1], [1, 0]], fwd: [[0, 0], [0.16, -0.12], [0.84, -0.12], [1, 0]], pitch: [[0, 0], [0.16, 0.55], [0.84, 0.4], [1, 0]], roll: [[0, 0], [0.3, 0.4], [0.6, -0.3], [0.84, 0], [1, 0]], yaw: [[0, 0], [0.2, 0.3], [0.84, 0.2], [1, 0]], sup: [[0, 0], [0.36, 0], [0.42, 0.7], [0.66, 0.7], [0.72, 0], [1, 0]], supF: [[0, 0], [0.42, 0.1], [0.6, 0.1], [0.72, 0], [1, 0]] },
  energy: { lift: [[0, 0], [0.14, 0.06], [0.86, 0.06], [1, 0]], fwd: [[0, 0], [0.14, -0.1], [0.86, -0.1], [1, 0]], pitch: [[0, 0], [0.14, 0.28], [0.8, 0.2], [1, 0]], roll: [[0, 0], [0.2, 0], [0.36, 1.0], [0.56, 1.0], [0.7, -0.9], [0.86, 0], [1, 0]], yaw: [[0, 0], [0.2, 0.4], [0.8, 0.3], [1, 0]], sup: [[0, 0], [0.42, 0], [0.5, 0.7], [0.66, 0.7], [0.72, 0], [1, 0]], supF: [[0, 0], [0.5, 0.06], [0.66, 0.06], [0.72, 0], [1, 0]] },
};
// armas brancas: arm = braço sobe (+) · out = braço para o lado · twirl = giro do cabo (rad) · tilt = inclina para o lado · fore = antebraço
const M = {
  knife: { arm: [[0, 0], [0.14, 0.5], [0.8, 0.5], [1, 0]], out: [[0, 0], [0.14, 0.15], [0.8, 0.15], [1, 0]], twirl: [[0, 0], [0.14, 0], [0.34, 6.28], [0.5, 6.28], [0.58, 6.28], [0.72, 6.28 + 0.9], [0.8, 6.28 + 0.9], [0.9, 6.28], [1, 6.28]], tilt: [[0, 0], [0.45, 0], [0.58, 0.9], [0.72, -0.4], [0.86, 0], [1, 0]], fore: [[0, 0], [0.14, 0.3], [0.8, 0.3], [1, 0]] },
  blade: { arm: [[0, 0], [0.16, 0.4], [0.84, 0.4], [1, 0]], out: [[0, 0], [0.2, 0.2], [0.84, 0.2], [1, 0]], twirl: [[0, 0], [0.2, 0], [0.4, 0.5], [0.52, -0.3], [0.66, 0.9], [0.8, 0], [1, 0]], tilt: [[0, 0], [0.4, 0], [0.5, 1.2], [0.7, 1.2], [0.84, 0], [1, 0]], fore: [[0, 0], [0.16, 0.2], [0.84, 0.2], [1, 0]] },
  big: { arm: [[0, 0], [0.18, 0.55], [0.82, 0.55], [1, 0]], out: [[0, 0], [0.2, 0.2], [0.82, 0.2], [1, 0]], twirl: [[0, 0], [0.2, 0], [0.4, 0.35], [0.62, -0.25], [0.8, 0.0], [1, 0]], tilt: [[0, 0], [0.4, 0], [0.54, 0.7], [0.74, -0.5], [0.88, 0], [1, 0]], fore: [[0, 0], [0.18, 0.25], [0.82, 0.25], [1, 0]] },
  polearm: { arm: [[0, 0], [0.16, 0.45], [0.86, 0.45], [1, 0]], out: [[0, 0], [0.2, 0.1], [0.86, 0.1], [1, 0]], twirl: [[0, 0], [0.2, 0], [0.42, 0.4], [0.64, -0.3], [0.84, 0], [1, 0]], tilt: [[0, 0], [0.3, 0], [0.5, 0.8], [0.7, -0.8], [0.86, 0], [1, 0]], fore: [[0, 0], [0.16, 0.2], [0.86, 0.2], [1, 0]] },
  chainsaw: { arm: [[0, 0], [0.12, 0.3], [0.9, 0.3], [1, 0]], out: [[0, 0], [0.12, 0.1], [0.9, 0.1], [1, 0]], twirl: [[0, 0], [0.12, 0], [0.3, -0.5], [0.4, -0.5], [0.46, 0.2], [0.72, 0.2], [0.8, 0], [1, 0]], tilt: [[0, 0], [0.5, 0], [0.64, 0.25], [0.78, -0.2], [0.9, 0], [1, 0]], fore: [[0, 0], [0.12, 0.2], [0.9, 0.2], [1, 0]], shake: [[0, 0], [0.28, 0], [0.34, 1], [0.5, 1], [0.54, 0], [0.7, 0], [0.74, 1], [0.9, 1], [0.94, 0]] },
  grenade: { arm: [[0, 0], [0.2, 0.3], [0.8, 0.3], [1, 0]], out: [[0, 0], [0.2, 0.1], [0.8, 0.1], [1, 0]], twirl: [[0, 0], [0.5, 1.2], [1, 0]], tilt: [[0, 0], [0.5, 0.6], [1, 0]], fore: [[0, 0], [0.2, 0.2], [0.8, 0.2], [1, 0]] },
};
const OUT = {};
export function inspectSample(kind, p) {
  const o = OUT;
  if (MELEE_KINDS.has(kind) || kind === 'grenade') { const t = M[kind]; o.melee = true; for (const k of ['arm', 'out', 'twirl', 'tilt', 'fore']) o[k] = kf(p, t[k]); o.shake = t.shake ? kf(p, t.shake) : 0; return o; }
  const t = A[kind] || A.rifle; o.melee = false; for (const k of ['lift', 'fwd', 'pitch', 'roll', 'yaw', 'sup', 'supF']) o[k] = kf(p, t[k]); return o;
}
