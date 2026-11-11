// SACAR A ARMA (troca de arma): cada categoria tem a SUA animação fixa, como nos FPS (não é a mesma subida para todas). Usada pela 1ª pessoa (viewmodel.js) e pela 3ª (avatar.js → characterRig.js).
// Mesmos canais do inspecionar (inspect.js): armas de fogo = lift (sobe, − = abaixada), fwd (frente), pitch (+ = cano para cima), roll, yaw, sup (mão de apoio sai da arma 0..1), supF (mão de apoio à frente);
// armas brancas = arm (braço sobe), out, twirl (giro do cabo), tilt, fore, shake. TODOS os canais terminam em 0 (a arma chega exatamente na posição de repouso).
// Cada categoria também tem seus barulhos no tempo certo (nomes de audio.inspect): move (roupa/couro), click (trava), tap (tapa no pente), rack (ferrolho/ação), pump, bolt, thunk (peso), hum, flip, ping (lâmina), rev (motosserra), spin.
import { inspectKind } from './inspect.js';
const sm = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const kf = (p, pts) => { if (p <= pts[0][0]) return pts[0][1]; for (let i = 0; i < pts.length - 1; i++) { const [t0, v0] = pts[i], [t1, v1] = pts[i + 1]; if (p < t1) return v0 + (v1 - v0) * sm((p - t0) / (t1 - t0)); } return pts[pts.length - 1][1]; };
export const drawKind = inspectKind;
// duração (s) de cada saque: pistola e faca são rápidas; metralhadora, lançador e motosserra, pesadas
export const DRAW_DUR = { pistol: 0.5, smg: 0.55, rifle: 0.8, shotgun: 0.85, bolt: 1.0, lmg: 1.0, launcher: 1.0, energy: 0.7, knife: 0.62, blade: 0.78, big: 0.92, polearm: 0.82, chainsaw: 1.0, grenade: 0.42 };
export const DRAW_EVENTS = {
  pistol: [[0.0, 'move'], [0.6, 'click']], smg: [[0.0, 'move'], [0.58, 'tap'], [0.74, 'click']], rifle: [[0.0, 'move'], [0.64, 'rack'], [0.86, 'click']], shotgun: [[0.0, 'move'], [0.6, 'pump'], [0.8, 'click']],
  bolt: [[0.0, 'move'], [0.62, 'bolt'], [0.8, 'bolt']], lmg: [[0.0, 'move'], [0.55, 'thunk'], [0.8, 'rack']], launcher: [[0.0, 'move'], [0.58, 'thunk'], [0.8, 'click']], energy: [[0.04, 'hum'], [0.62, 'click']],
  knife: [[0.12, 'flip'], [0.42, 'flip'], [0.72, 'ping']], blade: [[0.1, 'ping'], [0.5, 'move'], [0.7, 'ping']], big: [[0.1, 'move'], [0.66, 'thunk']], polearm: [[0.1, 'move'], [0.34, 'spin'], [0.66, 'thunk']],
  chainsaw: [[0.05, 'move'], [0.4, 'rev'], [0.58, 'rev'], [0.78, 'rev']], grenade: [[0.05, 'move'], [0.56, 'click']],
};
const Z = [[0, 0], [1, 0]];
const G = {   // armas de fogo
  pistol: { lift: [[0, -0.3], [0.5, 0.02], [0.72, -0.006], [1, 0]], fwd: [[0, 0.06], [0.5, -0.02], [1, 0]], pitch: [[0, -0.9], [0.5, 0.28], [0.74, -0.05], [1, 0]], roll: [[0, 0.5], [0.6, -0.06], [1, 0]], yaw: [[0, 0.3], [1, 0]], sup: [[0, 0], [0.5, 0], [0.62, 1], [0.8, 0], [1, 0]], supF: Z },
  smg: { lift: [[0, -0.32], [0.5, 0.02], [0.78, 0], [1, 0]], fwd: [[0, 0.08], [0.5, -0.04], [1, 0]], pitch: [[0, -0.7], [0.5, 0.18], [0.8, -0.03], [1, 0]], roll: [[0, 1.0], [0.55, -0.12], [0.8, 0.03], [1, 0]], yaw: [[0, 0.35], [1, 0]], sup: [[0, 0], [0.5, 0], [0.58, 1], [0.7, 1], [0.76, 0], [1, 0]], supF: [[0, 0], [0.7, 0], [0.74, -0.05], [0.8, 0], [1, 0]] },
  rifle: { lift: [[0, -0.36], [0.55, 0.03], [0.8, -0.005], [1, 0]], fwd: [[0, 0.1], [0.55, -0.05], [1, 0]], pitch: [[0, -0.75], [0.55, 0.2], [0.82, -0.02], [1, 0]], roll: [[0, 1.2], [0.55, -0.15], [0.8, 0.02], [1, 0]], yaw: [[0, 0.4], [0.55, 0.15], [1, 0]], sup: [[0, 0], [0.5, 0], [0.58, 1], [0.84, 1], [0.92, 0], [1, 0]], supF: [[0, 0], [0.58, 0], [0.64, -0.09], [0.74, 0.05], [0.84, 0], [1, 0]] },
  shotgun: { lift: [[0, -0.36], [0.55, 0.03], [0.82, 0], [1, 0]], fwd: [[0, 0.1], [0.55, -0.06], [1, 0]], pitch: [[0, -0.85], [0.55, 0.3], [0.85, 0.0], [1, 0]], roll: [[0, 0.8], [0.55, -0.1], [1, 0]], yaw: [[0, 0.35], [0.55, 0.15], [1, 0]], sup: [[0, 0], [0.5, 0], [0.56, 0.6], [0.82, 0.6], [0.9, 0], [1, 0]], supF: [[0, 0], [0.54, 0], [0.6, 0.12], [0.66, -0.13], [0.74, 0.04], [0.82, 0], [1, 0]] },
  bolt: { lift: [[0, -0.4], [0.6, 0.04], [0.9, 0], [1, 0]], fwd: [[0, 0.12], [0.6, -0.07], [1, 0]], pitch: [[0, -1.0], [0.6, 0.3], [0.92, 0.0], [1, 0]], roll: [[0, 1.4], [0.6, -0.1], [0.82, 0.8], [0.92, 0], [1, 0]], yaw: [[0, 0.5], [0.6, 0.2], [1, 0]], sup: [[0, 0], [0.5, 0], [0.56, 0.8], [0.88, 0.8], [0.95, 0], [1, 0]], supF: [[0, 0], [0.56, 0], [0.62, 0.11], [0.7, -0.12], [0.78, 0.1], [0.84, -0.04], [0.92, 0], [1, 0]] },
  lmg: { lift: [[0, -0.45], [0.5, 0.03], [0.6, -0.04], [0.78, 0.0], [1, 0]], fwd: [[0, 0.14], [0.5, -0.07], [1, 0]], pitch: [[0, -0.6], [0.5, 0.2], [0.62, -0.1], [0.82, 0], [1, 0]], roll: [[0, 0.5], [0.5, -0.1], [1, 0]], yaw: [[0, 0.4], [0.5, 0.15], [1, 0]], sup: [[0, 0], [0.5, 0], [0.56, 1], [0.86, 1], [0.94, 0], [1, 0]], supF: [[0, 0], [0.7, 0], [0.76, 0.07], [0.86, 0], [1, 0]] },
  launcher: { lift: [[0, -0.42], [0.55, 0.05], [0.72, -0.02], [1, 0]], fwd: [[0, 0.14], [0.55, -0.08], [1, 0]], pitch: [[0, -1.1], [0.5, 0.5], [0.78, 0.0], [1, 0]], roll: [[0, 0.6], [0.6, -0.15], [1, 0]], yaw: [[0, 0.3], [0.55, 0.15], [1, 0]], sup: [[0, 0], [0.5, 0], [0.58, 0.7], [0.82, 0.7], [0.9, 0], [1, 0]], supF: [[0, 0], [0.6, 0.1], [0.82, 0.1], [0.9, 0], [1, 0]] },
  energy: { lift: [[0, -0.3], [0.5, 0.03], [0.8, 0], [1, 0]], fwd: [[0, 0.08], [0.5, -0.06], [1, 0]], pitch: [[0, -0.5], [0.5, 0.15], [0.8, 0], [1, 0]], roll: [[0, 1.6], [0.6, -0.2], [0.85, 0], [1, 0]], yaw: [[0, 0.4], [0.6, 0.1], [1, 0]], sup: [[0, 0], [0.45, 0], [0.55, 0.7], [0.7, 0.7], [0.78, 0], [1, 0]], supF: [[0, 0], [0.55, 0.06], [0.7, 0.06], [0.78, 0], [1, 0]] },
};
// armas brancas: faca = FLIP (gira no ar e volta à mão) · lâmina (katana/espada/facão/plasma) = saca em diagonal e tine · pesada (machado/marreta/taco) = levanta com esforço e apoia · lança = levanta e gira a ponta · motosserra = puxa a partida e vibra
const M = {
  knife: { arm: [[0, -0.5], [0.4, 0.35], [0.7, 0], [1, 0]], out: [[0, 0.3], [0.5, 0.1], [1, 0]], twirl: [[0, -6.4], [0.62, 0.35], [0.8, -0.05], [1, 0]], tilt: [[0, 0.5], [0.6, -0.15], [1, 0]], fore: [[0, -0.4], [0.5, 0.15], [1, 0]], shake: Z },
  blade: { arm: [[0, -1.0], [0.5, 0.3], [0.78, 0], [1, 0]], out: [[0, 0.5], [0.5, 0.0], [1, 0]], twirl: [[0, -1.3], [0.5, 0.55], [0.72, -0.12], [1, 0]], tilt: [[0, 1.2], [0.5, -0.35], [0.75, 0.1], [1, 0]], fore: [[0, -0.5], [0.5, 0.2], [1, 0]], shake: Z },
  big: { arm: [[0, -1.1], [0.55, 0.3], [0.72, -0.1], [1, 0]], out: [[0, 0.4], [0.6, 0.1], [1, 0]], twirl: [[0, -1.0], [0.55, 0.35], [0.7, -0.08], [1, 0]], tilt: [[0, 0.5], [0.6, -0.1], [1, 0]], fore: [[0, -0.6], [0.58, 0.25], [0.72, -0.05], [1, 0]], shake: [[0, 0], [0.64, 0], [0.7, 0.6], [0.8, 0]] },
  polearm: { arm: [[0, -0.95], [0.6, 0.25], [1, 0]], out: [[0, 0.3], [0.6, 0.1], [1, 0]], twirl: [[0, -0.7], [0.6, 0.3], [0.82, -0.04], [1, 0]], tilt: [[0, 0.8], [0.35, -0.5], [0.65, -0.2], [1, 0]], fore: [[0, -0.4], [0.6, 0.2], [1, 0]], shake: Z },
  chainsaw: { arm: [[0, -1.0], [0.5, 0.3], [1, 0]], out: [[0, 0.3], [0.5, 0.1], [1, 0]], twirl: [[0, -0.8], [0.5, 0.15], [1, 0]], tilt: [[0, 0.4], [0.5, 0], [1, 0]], fore: [[0, -0.5], [0.5, 0.2], [1, 0]], shake: [[0, 0], [0.4, 0], [0.46, 1], [0.54, 0.2], [0.58, 1], [0.66, 0.2], [0.78, 1], [1, 0.1]] },
  grenade: { arm: [[0, -0.7], [0.55, 0.15], [1, 0]], out: [[0, 0.3], [0.6, 0.05], [1, 0]], twirl: [[0, -0.5], [0.6, 0.15], [1, 0]], tilt: [[0, 0.4], [1, 0]], fore: [[0, -0.4], [0.6, 0.1], [1, 0]], shake: Z },
};
const MELEE_K = new Set(['knife', 'blade', 'big', 'polearm', 'chainsaw', 'grenade']);
const OUT = {};
export function drawSample(kind, p) {
  const o = OUT;
  if (MELEE_K.has(kind)) { const t = M[kind]; o.melee = true; for (const k of ['arm', 'out', 'twirl', 'tilt', 'fore', 'shake']) o[k] = kf(p, t[k]); return o; }
  const t = G[kind] || G.rifle; o.melee = false; for (const k of ['lift', 'fwd', 'pitch', 'roll', 'yaw', 'sup', 'supF']) o[k] = kf(p, t[k]); return o;
}
