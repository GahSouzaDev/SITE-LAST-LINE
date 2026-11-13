import { ARSENAL_BY_ID } from './arsenalData.js';

// Converte as estatísticas do Arsenal (a/b/e/m/r/c/rc/mo/ac/nz/rl) em números de jogabilidade
// (metros, radianos, ms) e aplica ACESSÓRIOS com trade-offs:
//   pente estendido: +30% balas, recarga +12%, mobilidade −4 pts · tambor: +70%, recarga +35%, mobilidade −12 pts
//   silenciador: ruído ×0,3, dano ×0,95, alcance ×0,95, recuo ×0,9 · freio: recuo ×0,8, ruído ×1,1 · compensador: recuo ×0,7
//   laser: precisão +10% no quadril, mas revela quem atira (ruído de luz — atrai zumbis)
export const RANGE_SCALE = 0.2;                     // unidades do Arsenal -> metros do jogo
export const MAG_OPTS = { 0: { cap: 1, reload: 1, mob: 0 }, 1: { cap: 1.3, reload: 1.12, mob: 0.04 }, 2: { cap: 1.7, reload: 1.35, mob: 0.12 } };   // mais realista: estendido +30%, tambor +70% (antes +50% / +150%)
export const MUZZLE_OPTS = { def: {}, supp: { noise: 0.3, dmg: 0.95, range: 0.95, recoil: 0.9 }, brake: { recoil: 0.8, noise: 1.1 }, comp: { recoil: 0.7 } };
export const SWAP_MS = { sniper: 650, lmg: 700, shotgun: 550, rifle: 450, energy: 450, smg: 350, pistol: 250, dual: 400, special: 500 };
// TROCA RÁPIDA: as armas de FERROLHO (as mesmas de BOLT_MS) cortam o ciclo do ferrolho trocando de arma e voltando (Q, Q). O custo é o tempo de troca (swapMs).
export const SWAP_CANCEL = new Set(['sniper', 'scout', 'amr', 'hunter', 'santa', 'mosquete', 'dragao', 'cangaco']);

function deriveRaw(id, att = {}) {
  const w = ARSENAL_BY_ID[id];
  if (!w) return null;
  const s = w.st, fx = w.fx;
  const mag = MAG_OPTS[att.mag | 0] || MAG_OPTS[0];
  const mu = MUZZLE_OPTS[att.tip || 'def'] || {};
  const continuous = s.r >= 2000;
  const rpm = continuous ? 800 : s.r;
  const scope = ['sniper', 'dmr'].includes(id);
  const tight = id === 'aa12' ? 0.6 : 1;   /* AA-12: chumbo mais fechado, para os 8 balins acertarem (era a pior escopeta do jogo) */
  const hip = (0.006 + (1 - s.ac) * 0.05 + (s.p > 1 ? 0.04 : 0)) * tight;
  const ads = ((scope ? 0.0003 : 0.0015 + (1 - s.ac) * 0.01) + (s.p > 1 ? 0.03 : 0)) * tight;
  const recoilMul = mu.recoil ?? 1;
  const dmgMul = mu.dmg ?? 1;
  const rangeMul = mu.range ?? 1;
  return {
    dmg: s.a * dmgMul, dmgMin: s.b * dmgMul,
    head: id === 'sniper' || id === 'dmr' ? 2.5 : s.p > 1 ? 1.4 : 2.0,
    rpm, auto: !fx.semi && !fx.charge && !fx.rocket && !fx.burst,
    mag: Math.round(s.c * (w.cls === 'lmg' ? Math.min(mag.cap, 1.25) : mag.cap)),   // metralhadora já tem pente enorme: acessório rende no máx. +25%
     reserve: w.cls === 'launcher' ? Math.min(s.c * 4, 4) : s.c * 4,   // lança-foguetes: no máx. 4 foguetes de reserva (nunca infinito)
    reloadMs: Math.round(s.rl * mag.reload * 1000),
    swapMs: SWAP_MS[w.cls] ?? 450,
    falloff: [s.e * RANGE_SCALE * rangeMul, s.m * RANGE_SCALE * rangeMul, Math.max(0.08, s.b / s.a)],
    range: s.m * RANGE_SCALE * rangeMul,
    pellets: s.p || 1,
    spread: { hip, ads, move: 0.002 + (1 - s.ac) * 0.006, air: 0.03, crouch: 0.7, bloom: s.rc * 0.004 },
    recoil: { v: s.rc * 0.022 * recoilMul, h: s.rc * 0.008 * recoilMul, recover: s.rc > 0.7 ? 5 : 7 },
    mobility: Math.max(0.05, s.mo - mag.mob),                  // 0..1 — vira multiplicador de velocidade
    speedMul: 0.7 + 0.3 * Math.max(0.05, s.mo - mag.mob),
    noise: s.nz * (mu.noise ?? 1) * RANGE_SCALE * 0.6,          // raio (m) em que zumbis/jogadores ouvem o tiro
    swapCancel: SWAP_CANCEL.has(id),
    fx: { tracer: fx.beam || id === 'crimson' ? 'beam' : 'bullet', color: fx.col || 0xffc860, tr: fx.tr || 0xffe4a3, big: fx.big || att.tip === 'brake', supp: fx.supp || att.tip === 'supp', tip: att.tip || 'def', beam: fx.beam, flame: fx.flame, charge: fx.charge, rocket: fx.rocket, burst: fx.burst || 0, bi: fx.bi || 0, spin: fx.spin || 0, oh: fx.oh || id === 'crimson', cd: fx.cd || 0 }
  };
}

// ===== BALANCEAMENTO: as armas de uma MESMA classe ficam mais parecidas (variação de atributos ~40% menor). =====
// A diferença entre armas continua existindo (e os acessórios continuam mudando o desempenho), só sem extremos absurdos.
const K = 0.6, _mean = {};
const NUM = (d) => ({ range: d.range, reloadMs: d.reloadMs, speedMul: d.speedMul, hip: d.spread.hip, ads: d.spread.ads, rv: d.recoil.v, rh: d.recoil.h, dps: d.dmg * d.rpm * (d.pellets || 1) });
function classMean(cls) {
  if (_mean[cls]) return _mean[cls]; const rows = Object.values(ARSENAL_BY_ID).filter((w) => w.cls === cls).map((w) => NUM(deriveRaw(w.id, {}))), m = {};
  for (const k of Object.keys(rows[0])) m[k] = rows.reduce((a, r) => a + r[k], 0) / rows.length; return (_mean[cls] = m);
}
export function deriveWeapon(id, att = {}) {
  const raw = deriveRaw(id, att), base = deriveRaw(id, {}), w = ARSENAL_BY_ID[id]; if (!w) return raw;
  const m = classMean(w.cls), b = NUM(base), r = NUM(raw), comp = {};
  for (const k of Object.keys(b)) { const c = m[k] + (b[k] - m[k]) * K; comp[k] = b[k] ? c * (r[k] / b[k]) : r[k]; }       // base comprimida × efeito dos acessórios
  // dano: comprime o DPS da classe sem mexer na cadência (ferrolho continua lento e forte; semiautomática continua rápida e mais fraca)
  const f = Math.max(0.72, Math.min(1.4, comp.dps / (r.dps || 1))), out = { ...raw, spread: { ...raw.spread }, recoil: { ...raw.recoil } };
  out.dmg = Math.max(1, Math.round(raw.dmg * f)); out.dmgMin = Math.max(1, Math.round(raw.dmgMin * f)); out.range = comp.range; if (raw.falloff) out.falloff = [raw.falloff[0] * comp.range / (raw.range || 1), comp.range, raw.falloff[2]];
  out.reloadMs = Math.round(comp.reloadMs); out.speedMul = comp.speedMul; out.spread.hip = comp.hip; out.spread.ads = comp.ads; out.recoil.v = comp.rv; out.recoil.h = comp.rh;
  return out;
}

// RECARGA POR CARTUCHO (só escopetas de bombeada/uma a uma): o tempo depende de QUANTAS balas faltam. Atirou 1 e recarregou 1 = rápido; vazia = recarga completa.
// As demais armas trocam o pente: tempo fixo, tanto faz quantas balas faltem. (Double-barrel, serrada e AA-12 também trocam tudo de uma vez.)
export const PER_SHELL = new Set(['shotgun', 'pump', 'spas', 'bulldog', 'champ', 'confete', 'tucano', 'piranha']);
export const SHELL_BASE_MS = 300;   // engatilhar/abrir o carregador antes da 1ª bala
export function reloadMsFor(id, def, mag) {
  if (!def) return 0; const full = def.reloadMs || 0; if (!PER_SHELL.has(id) || !(def.mag > 1)) return full;
  const miss = Math.max(1, Math.min(def.mag, def.mag - (mag | 0))), per = Math.max(120, (full - SHELL_BASE_MS) / def.mag); return Math.round(SHELL_BASE_MS + per * miss);
}

// Quantos cartuchos já entraram quando o jogador interrompe a recarga cartucho a cartucho (atirar no meio da recarga, como nos FPS de verdade).
export function shellsLoaded(id, def, mag, elapsedMs) {
  if (!def || !PER_SHELL.has(id) || !(def.mag > 1)) return 0; const n = Math.max(1, def.mag - (mag | 0)), total = reloadMsFor(id, def, mag), per = Math.max(60, (total - SHELL_BASE_MS) / n);
  return Math.max(0, Math.min(n, Math.floor((elapsedMs - SHELL_BASE_MS) / per)));
}
