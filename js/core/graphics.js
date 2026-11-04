// GRÁFICOS / DESEMPENHO. Começa em AUTOMÁTICO: mede o FPS e sobe/desce o nível de qualidade sozinho (escala de renderização, sombras, partículas…).
// Tudo pode ser configurado à mão em CONFIGURAÇÕES → VÍDEO (predefinições Baixo/Médio/Alto/Ultra ou Personalizado). Salvo por dispositivo.
const KEY = 'lastline.gfx';
export const SHADOW_Q = { off: { on: false }, low: { on: true, res: 1024, ext: 40 }, med: { on: true, res: 2048, ext: 50 }, high: { on: true, res: 2048, ext: 70 }, ultra: { on: true, res: 4096, ext: 90 }, extreme: { on: true, res: 4096, ext: 130 } };
export const PRESETS = {
  vlow: { scale: 0.55, shadows: 'off', aa: false, clouds: false, particles: 0.3, view: 350, zq: 0 },   // MUITO BAIXO: para PC fraco (igual ao nível mais leve do automático)
  low: { scale: 0.7, shadows: 'low', aa: false, clouds: false, particles: 0.4, view: 400, zq: 0 },
  med: { scale: 0.85, shadows: 'med', aa: true, clouds: true, particles: 0.7, view: 900, zq: 1 },
  high: { scale: 1, shadows: 'high', aa: true, clouds: true, particles: 1, view: 1800, zq: 2 },
  ultra: { scale: 1.25, shadows: 'ultra', aa: true, clouds: true, particles: 1, view: 3000, zq: 2 },
  extreme: { scale: 1.6, shadows: 'extreme', aa: true, clouds: true, particles: 1.5, view: 4000, env: true, zq: 2 }   // EXTREMO: para PC potente — máxima resolução, sombras amplas e suaves, REFLEXOS do céu nos metais, mais partículas
};
// níveis do modo AUTOMÁTICO (0 = mais leve … 4 = mais bonito)
export const TIERS = [
  { scale: 0.55, shadows: 'off', aa: false, clouds: false, particles: 0.3, view: 350, zq: 0 }, { scale: 0.7, shadows: 'low', aa: false, clouds: true, particles: 0.5, view: 600, zq: 0 },
  { scale: 0.85, shadows: 'med', aa: true, clouds: true, particles: 0.7, view: 1000, zq: 1 }, { scale: 1, shadows: 'high', aa: true, clouds: true, particles: 1, view: 1800, zq: 2 }, { scale: 1.2, shadows: 'ultra', aa: true, clouds: true, particles: 1, view: 3000, zq: 2 }
];
export const TIER_NAMES = ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Ultra'];
const AUTO_MAX = 3;   // o automático nunca passa do ALTO (Ultra/Extremo só à mão): subir até o máximo é o que engasgava
const gpuName = () => { try { const c = document.createElement('canvas'), g = c.getContext('webgl') || c.getContext('experimental-webgl'); const e = g?.getExtension('WEBGL_debug_renderer_info'); const n = e ? String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)) : ''; g?.getExtension('WEBGL_lose_context')?.loseContext(); return n; } catch { return ''; } };
// nível INICIAL pelo hardware (CPU, memória e placa de vídeo): placa integrada/fraca começa no Baixo, placa dedicada boa no Médio/Alto; depois o jogo mede o FPS de verdade
const detectTier = () => {
  const touch = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent), cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4, gpu = gpuName();
  if (/SwiftShader|llvmpipe|Basic Render|Software/i.test(gpu)) return 0;
  if (touch) return 1;
  let t = cores <= 4 || mem <= 2 ? 1 : 2;
  if (/RTX|GTX 1[0-9]{3}|GTX 16|RX [5-9][0-9]{2,3}|Arc A|Apple M|Radeon Pro/i.test(gpu)) t = cores <= 4 ? 2 : 3;
  else if (/Intel|UHD|HD Graphics|Iris|Vega \d+ Graphics|Radeon\(TM\) Graphics|Radeon Graphics|Mali|Adreno|PowerVR/i.test(gpu) && !/Arc A/i.test(gpu)) t = 1;
  return Math.min(AUTO_MAX, t);
};
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
const saved = load(), fresh = saved.autoV !== 2;
export const gfx = { preset: 'auto', fps: 0, meter: false, dmgNums: true, custom: { ...PRESETS.high }, ...saved, ...(fresh ? { tier: detectTier(), cap: AUTO_MAX, settled: false, autoV: 2 } : {}) };   // autoV 2: o automático novo (conservador e que TRAVA) recalibra uma vez quem usava o antigo
export const autoReset = () => ({ tier: detectTier(), cap: AUTO_MAX, settled: false, autoV: 2 });   // escolher "Automático" de novo = medir tudo outra vez
const listeners = new Set(); export const onGfx = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export function setGfx(patch) { Object.assign(gfx, patch); try { localStorage.setItem(KEY, JSON.stringify(gfx)); } catch { /* ignora */ } for (const fn of listeners) fn(gfx); }
export function effective() {
  const base = gfx.preset === 'auto' ? TIERS[Math.max(0, Math.min(4, gfx.tier))] : gfx.preset === 'custom' ? gfx.custom : (PRESETS[gfx.preset] || PRESETS.high);
  const out = { ...PRESETS.high, ...base, fps: gfx.fps || 0 }; if (gfx.preset !== 'auto' && protectMul < 1) out.scale = Math.max(0.4, out.scale * protectMul);   /* proteção de FPS: resolução reduzida só enquanto o jogo engasga */
  return out;
}
// ---- ajuste automático (histerese: desce rápido quando engasga, sobe devagar quando sobra FPS) ----
let acc = 0, n = 0, cool = 10, good = 0, bad = 0, protectMul = 1, pLow = 0, pHigh = 0;   // cool: ignora os primeiros segundos (carregar o mapa sempre engasga)
// PROTEÇÃO DE FPS (predefinição manual: Baixo/Médio/Alto/Ultra/Personalizado): se o FPS cair muito (ex.: dentro de prédio/torre, com zumbis perto), a resolução baixa sozinha em passos de 12% (nunca abaixo de 55%) e volta devagar quando o FPS sobra.
// Só mexe na RESOLUÇÃO (nada de recompilar sombras/shaders), então não gera travadinha.
function protect(dt) {
  acc += dt; n++; if (acc < 1.5) return false; const fps = n / acc, goal = gfx.fps ? Math.min(gfx.fps, 60) : 60; acc = 0; n = 0; if (document.hidden || fps < 3) return false;
  if (fps < Math.min(goal * 0.55, 32) ) { pLow++; pHigh = 0; if (pLow >= 2 && protectMul > 0.55) { protectMul = Math.max(0.55, protectMul * 0.88); pLow = 0; return true; } }
  else if (fps >= goal * 0.92) { pHigh++; pLow = 0; if (pHigh >= 5 && protectMul < 1) { protectMul = Math.min(1, protectMul * 1.1); pHigh = 0; return true; } }
  else { pLow = 0; pHigh = 0; }
  return false;
}
// AUTOMÁTICO: começa pelo nível do hardware, SOBE devagar só se sobrar muito FPS e, ao primeiro engasgo sustentado, desce e TRAVA naquele nível (guardado no aparelho). Nada de ficar subindo e descendo (cada troca recompila sombras e dá uma travadinha).
export function autoTick(dt) {
  if (gfx.preset !== 'auto') return protect(dt); acc += dt; n++; if (acc < 2.5) return false;
  const fps = n / acc, goal = gfx.fps ? Math.min(gfx.fps, 60) : 60; acc = 0; n = 0; if (document.hidden || fps < 3) return false;
  if (cool > 0) { cool -= 2.5; return false; }
  const cap = Math.min(AUTO_MAX, gfx.cap ?? AUTO_MAX);
  if (fps < goal * 0.8 && gfx.tier > 0) { good = 0; if (++bad >= 2) { bad = 0; cool = 5; setGfx({ tier: gfx.tier - 1, cap: Math.min(cap, gfx.tier - 1), settled: true }); return true; } return false; }   // engasgou por 2 medições seguidas: desce e este passa a ser o limite
  bad = 0; if (gfx.settled) return false;
  if (gfx.tier >= cap) { setGfx({ settled: true }); return false; }
  // NUNCA SOBE NÍVEL NO MEIO DA PARTIDA: cada troca recompila sombras e shaders e dava a travada de ~1 min depois do começo. Com FPS bom por 10 s o nível atual (já escolhido pelo hardware) fica travado.
  if (fps >= goal * 0.97) { if (++good >= 4) { good = 0; setGfx({ settled: true }); } } else good = 0;
  return false;
}
export const lastFps = { v: 0 };
