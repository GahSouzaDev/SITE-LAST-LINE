import { ARSENAL_BY_ID } from './arsenalData.js';
import { MELEE } from './melee.js';
import { FAUNA } from './fauna.js';
// ===== SURVIVAL / APOCALIPSE: zumbis, ondas (diretor), mochila em grade (estilo Resident Evil) =====
// Zumbis (NPC): tipos aparecem por onda. Atraídos por RUÍDO de tiro e por LUZ (lanterna acesa vê de mais longe).
export const ZT = {
  walker: { id: 'walker', n: 'Infectado', hp: 70, speed: 2.1, dmg: 11, cd: 1.1, range: 1.9, sight: 15, pts: 10, h: 1, b: 1 },
  runner: { id: 'runner', n: 'Corredor', hp: 45, speed: 4.9, dmg: 7, cd: 0.65, range: 1.9, sight: 20, pts: 15, h: 0.97, b: 0.9 },
  brute: { id: 'brute', n: 'Brutamontes', hp: 280, speed: 2.7, dmg: 28, cd: 1.3, range: 2.2, sight: 16, pts: 40, h: 1.12, b: 1.45 },
  tank: { id: 'tank', n: 'Tanque', hp: 850, speed: 3.4, dmg: 44, cd: 1.5, range: 2.5, sight: 22, pts: 200, h: 1.2, b: 1.7 }
};
// a FAUNA da Zona UMBRA também ganha uma entrada aqui (ztype 'f_<espécie>'): o resto do jogo (placar, abates, dano) já lê ZT. Mamíferos não morrem: vida enorme só por segurança.
for (const sp of Object.values(FAUNA)) ZT['f_' + sp.id] = { id: 'f_' + sp.id, n: sp.name, hp: sp.hp || 99999, speed: sp.run, dmg: sp.dmg || 0, cd: sp.cd || 2, range: sp.reach, sight: sp.sight, pts: sp.hp ? Math.round(sp.hp / 8) : 0, h: 1, b: 1, fauna: true };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// tamanho da onda: cresce a cada onda, proporcional ao MAPA e aos jogadores (mapa pequeno = onda pequena)
export const mapScale = (area) => clamp(Math.sqrt(area) / 70, 0.6, 2.2);
export const waveSize = (wave, area, humans, k = 1) => Math.max(3, Math.round((5 + wave * 2.6) * mapScale(area) * (0.75 + 0.25 * humans) * k));
export const maxAlive = (area, humans, wave) => clamp(Math.round(Math.sqrt(area) / 8 + humans * 2.5 + wave * 0.6), 6, 22);
export function waveTypes(wave, n, runMul = 1) {   // lista de tipos da onda (n zumbis)
  const out = [], tank = wave % 5 === 0 ? 1 + Math.floor(wave / 10) : 0, brute = wave >= 5 ? Math.floor(n * 0.12) : 0, runner = wave >= (runMul > 1 ? 1 : 3) ? Math.round(n * Math.min(runMul > 1 ? 0.8 : 0.45, (0.12 + wave * 0.03) * runMul)) : 0;   // runMul > 1 (ex.: favela): bem mais corredores
  for (let i = 0; i < tank; i++) out.push('tank'); for (let i = 0; i < brute; i++) out.push('brute'); for (let i = 0; i < runner; i++) out.push('runner'); while (out.length < n) out.push('walker'); return out.slice(0, Math.max(n, tank));
}
// ===== MOCHILA =====
export const BAGS = { pocket: { n: 'Maleta', w: 8, h: 6 }, small: { n: 'Mochila pequena', w: 9, h: 6 }, medium: { n: 'Mochila média', w: 10, h: 7 }, large: { n: 'Mochila grande', w: 12, h: 8 } };
export const HEAL = { bandage: { n: 'Bandagem', hp: 25, w: 1, h: 1, t: 1.2 }, pills: { n: 'Analgésico', hp: 40, w: 1, h: 1, t: 0.8 }, medkit: { n: 'Kit médico', hp: 75, w: 2, h: 1, t: 2.2 } };
export const AMMO_STACK = 120;   // máx. de munição em UM quadradinho
const GUN_CELLS = { pistol: [2, 1], dual: [3, 2], smg: [3, 2], rifle: [4, 2], shotgun: [4, 2], sniper: [5, 2], lmg: [5, 2], energy: [4, 2], special: [3, 2], launcher: [5, 2] };
export function itemCells(kind, item) {
  if (kind === 'gun') return GUN_CELLS[ARSENAL_BY_ID[item]?.cls] || [4, 2];
  if (kind === 'melee') return ['knife', 'karambit'].includes(item) ? [1, 2] : ['axe', 'hammer', 'chainsaw', 'sword'].includes(item) ? [2, 3] : MELEE[item] ? [1, 3] : [1, 2];
  if (kind === 'heal') return [HEAL[item]?.w || 1, HEAL[item]?.h || 1];
  if (kind === 'bag' || kind === 'quest') return [1, 1];
  return [1, 1];   // munição, granada
}
// recordes do Survival (por jogador)
export const RECORDS = [['kills', 'Zumbis mortos'], ['waves', 'Ondas sobrevividas'], ['time', 'Tempo vivo'], ['score', 'Pontuação']];
export const runScore = (r) => Math.round(r.kills * 10 + r.pts * 0.5 + r.waves * 150 + r.time * 1);

// RECORDES VIRAM SKINS: ao bater uma meta do Survival (melhor marca da conta), a conta ganha uma skin de arma para os fuzis, SMGs, escopetas e pistolas.
export const RECORD_SKINS = [
  { key: 'waves', goal: 5, skin: 'carbon', name: 'Fibra de Carbono' }, { key: 'waves', goal: 10, skin: 'neon', name: 'Neon' }, { key: 'waves', goal: 20, skin: 'toxic', name: 'Tóxica' }, { key: 'waves', goal: 35, skin: 'inferno', name: 'Inferno' },
  { key: 'kills', goal: 100, skin: 'marble', name: 'Mármore' }, { key: 'kills', goal: 300, skin: 'lava', name: 'Lava' }, { key: 'kills', goal: 700, skin: 'plasma', name: 'Plasma' }, { key: 'kills', goal: 1500, skin: 'volt', name: 'Volt' },
  { key: 'time', goal: 600, skin: 'chrome', name: 'Cromada' }, { key: 'time', goal: 1200, skin: 'ice', name: 'Gelo' }, { key: 'time', goal: 2400, skin: 'matrix', name: 'Matrix' }, { key: 'time', goal: 3600, skin: 'gold', name: 'Ouro' },
  { key: 'score', goal: 3000, skin: 'sakura', name: 'Sakura' }, { key: 'score', goal: 10000, skin: 'circuit', name: 'Circuito' }, { key: 'score', goal: 25000, skin: 'laser', name: 'Laser' }, { key: 'score', goal: 60000, skin: 'dragon', name: 'Dragão' }
];
export const RECORD_GROUPS = ['rifle', 'smg', 'shotgun', 'pistol'];
