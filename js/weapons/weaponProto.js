import * as THREE from 'three';
import { BUILD, setOV } from './arsenalModels.js';
import { mergeStatic } from './weaponOpt.js';
import { ARSENAL_BY_ID } from '/shared/arsenalData.js';
// PROTÓTIPOS DAS ARMAS: cada arma (+ acessórios) é montada UMA vez (peças fixas já fundidas por material) e guardada; quem precisa de uma arma recebe uma CÓPIA
// que compartilha geometria e materiais (copiar custa ~1 ms; montar custava 10–50 ms e travava a cada troca de arma). Dá para montar tudo antes da partida (tela de carregamento).
const RAW = new Map();
const keyOf = (id, att) => id + '|' + (att?.op || 'def') + '|' + (att?.tip || 'def') + '|' + (att?.mag | 0);   // só o que muda o modelo (o laser entra depois, na cópia)
export const isDualId = (id) => id.startsWith('dual') || ARSENAL_BY_ID[id]?.cls === 'dual';
export function rawWeapon(id, att = {}) {
  const key = keyOf(id, att); let m = RAW.get(key); if (m) return m;
  setOV({ op: att.op && att.op !== 'def' ? att.op : undefined, tip: att.tip && att.tip !== 'def' ? att.tip : undefined, mag: att.mag | 0 });
  m = BUILD[id]();
  try { if (isDualId(id)) { for (const c of m.children) if (c.userData.mz) mergeStatic(c); } else mergeStatic(m); } catch (e) { console.warn('[arma] otimizador desativado:', e.message); }
  m.traverse((o) => { if (o.isMesh) { o.userData.shared = 1; } });   // geometria compartilhada: nunca descartar (dispose) uma cópia
  RAW.set(key, m); return m;
}
// cópia profunda que mantém as âncoras (boca, olho da mira, corpo da luneta, ejeção...) apontando para os nós da CÓPIA
export function cloneArs(src) {
  const sl = []; src.traverse((o) => sl.push(o));
  const saved = sl.map((o) => o.userData);
  sl.forEach((o) => { const u = {}; for (const k in o.userData) { const v = o.userData[k]; if (v === null || typeof v !== 'object') u[k] = v; } o.userData = u; });   // Object3D.clone() serializa userData em JSON: referências circulares não passam
  let c; try { c = src.clone(true); } finally { sl.forEach((o, i) => { o.userData = saved[i]; }); }
  const cl = []; c.traverse((o) => cl.push(o)); const map = new Map(sl.map((o, i) => [o, cl[i]]));
  const rm = (v) => (v && v.isObject3D ? (map.get(v) || v) : v && v.isVector3 ? v.clone() : Array.isArray(v) ? v.map(rm) : v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v);
  sl.forEach((o, i) => { for (const k in saved[i]) { const v = saved[i][k]; if (v !== null && typeof v === 'object') { try { cl[i].userData[k] = rm(v); } catch { cl[i].userData[k] = v; } } } });
  return c;
}
