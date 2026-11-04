import { MELEE } from '/shared/melee.js';
import * as THREE from 'three';
import { MT } from './arsenalModels.js';
import { applyRare, RARE_FX } from './rareSkins.js';
import { applyPack } from './skinsPack.js';
// SKINS DE ARMA — porta do skinMap()/applySkin() do base.html: cada skin troca os materiais do modelo (metal, polímero, ouro, brilho...).
const Mt = (c, m, r, o = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r, ...o });
let desT = null; const cache = {};
function desertTex() {
  if (desT) return desT; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#c4a874'; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 30; i++) { x.fillStyle = ['#9a7f52', '#e0cc9a', '#7a6a48'][i % 3]; x.beginPath(); x.ellipse(Math.random() * 128, Math.random() * 128, 6 + Math.random() * 18, 4 + Math.random() * 10, Math.random() * 3, 0, 7); x.fill(); }
  desT = new THREE.CanvasTexture(c); desT.colorSpace = THREE.SRGBColorSpace; return desT;
}
function skinMap(k) {
  if (cache[k]) return cache[k]; const mp = new Map(), set = (ks, mat) => ks.forEach((x) => { if (MT[x]) mp.set(MT[x], mat); });
  if (k === 'gold') { const a = Mt(0xffcf4d, 1, 0.14), b = Mt(0xc8921f, 1, 0.22); set(['steel', 'chrome', 'tan', 'camo', 'gold'], a); set(['blued', 'poly', 'od', 'navy'], b); set(['black', 'red'], Mt(0x3a2a10, 0.6, 0.4)); }
  else if (k === 'ww2') { set(['steel', 'chrome'], Mt(0x3b3e3a, 0.75, 0.5)); set(['blued'], Mt(0x2a2d29, 0.7, 0.5)); set(['black'], Mt(0x1c1e1c, 0.6, 0.55)); set(['poly', 'tan'], MT.wood); set(['od', 'navy', 'camo'], Mt(0x4a5236, 0.1, 0.7)); set(['gold'], Mt(0x9c7a2f, 0.8, 0.35)); }
  else if (k === 'desert') { set(['steel', 'chrome'], Mt(0x7a705c, 0.6, 0.55)); set(['blued'], Mt(0x4e4636, 0.6, 0.5)); set(['black'], Mt(0x3a3528, 0.5, 0.6)); set(['poly', 'od', 'navy', 'tan'], Mt(0xc9ae7c, 0.1, 0.7)); set(['camo'], Mt(0xffffff, 0.1, 0.7, { map: desertTex() })); set(['wood'], Mt(0x9a7448, 0.1, 0.6)); set(['gold'], Mt(0x6a5a3a, 0.8, 0.4)); }
  else if (k === 'neon') { set(['steel', 'chrome'], Mt(0x1a2032, 0.9, 0.2)); set(['blued'], Mt(0x10162a, 0.9, 0.2)); set(['black'], Mt(0x0a0e1c, 0.8, 0.25)); set(['poly'], Mt(0x151b30, 0.3, 0.3)); set(['tan', 'od', 'navy', 'camo'], Mt(0x20204a, 0.5, 0.3)); set(['gold'], Mt(0xff3de0, 0.3, 0.2, { emissive: 0xff1fcf, emissiveIntensity: 2.6 })); set(['red'], Mt(0x3de0ff, 0.3, 0.2, { emissive: 0x1fc0ff, emissiveIntensity: 2.6 })); }
  else if (k === 'obsidian') { set(['steel', 'chrome', 'blued', 'black', 'poly', 'tan', 'od', 'navy', 'camo'], Mt(0x08090c, 0.95, 0.08)); set(['gold', 'red'], MT.glowR); }
  else if (k === 'ice') { set(['steel', 'chrome'], Mt(0xdff0ff, 1, 0.08)); set(['blued'], Mt(0x9cc8ee, 0.9, 0.12)); set(['black'], Mt(0x3d6a96, 0.6, 0.2)); set(['poly'], Mt(0x7fb6e8, 0.2, 0.15)); set(['tan', 'od', 'navy', 'camo'], Mt(0xbfe0ff, 0.4, 0.2)); set(['wood'], Mt(0xdff0ff, 0.2, 0.1)); set(['gold'], MT.glow); }
  else if (k === 'olive') { set(['steel', 'chrome'], Mt(0x5b6648, 0.7, 0.4)); set(['blued', 'black'], Mt(0x2b3022, 0.6, 0.45)); set(['poly', 'tan'], Mt(0x3d4630, 0.2, 0.7)); set(['od', 'navy', 'camo'], Mt(0x6b7a4c, 0.1, 0.7)); }
  else if (k === 'sand') { set(['steel', 'chrome'], Mt(0xb59f73, 0.6, 0.45)); set(['blued', 'black'], Mt(0x3a3426, 0.6, 0.5)); set(['poly', 'tan', 'od', 'navy'], Mt(0xc9b27c, 0.1, 0.7)); }
  else if (k === 'crimsonwood') { set(['steel', 'chrome'], Mt(0x5a2a2a, 0.8, 0.35)); set(['blued', 'black'], Mt(0x1d1010, 0.7, 0.4)); set(['poly', 'tan'], Mt(0x7a2a22, 0.15, 0.6)); set(['od', 'navy', 'camo'], Mt(0x3a1a18, 0.2, 0.6)); }
  else if (k === 'lava') { set(['steel', 'chrome'], Mt(0x4a3a36, 0.8, 0.4)); set(['blued'], Mt(0x2a1d1b, 0.8, 0.4)); set(['black'], Mt(0x120b0a, 0.6, 0.5)); set(['poly'], Mt(0x1d1210, 0.2, 0.7)); set(['tan', 'od', 'navy', 'camo'], Mt(0x2a1a16, 0.3, 0.6)); set(['gold', 'red'], MT.glow2); }
  else if (RARE[k]) { set(['steel', 'chrome', 'tan', 'camo', 'gold'], Mt(0x14181d, 0.95, 0.18)); set(['blued', 'black', 'poly', 'od', 'navy'], Mt(0x0a0c10, 0.9, 0.25)); set(['red', 'glow', 'glow2', 'glowR'], Mt(RARE[k], 0.3, 0.3, { emissive: RARE[k], emissiveIntensity: 2.4 })); }
  return (cache[k] = mp);
}
const RARE = { plasma: 0x28d8ff, inferno: 0xff7a18, void: 0xb04dff };
// tubos de energia luminosos ao longo da arma (a forma da arma NÃO muda)
function addTubes(model, color) {
  const b = new THREE.Box3().setFromObject(model), L = b.max.x - b.min.x, H = b.max.y - b.min.y, mat = Mt(color, 0.2, 0.3, { emissive: color, emissiveIntensity: 3 }), g = new THREE.CylinderGeometry(H * 0.022, H * 0.022, L * 0.62, 8);
  for (const [dy, dz] of [[0.18, 0.16], [0.18, -0.16], [-0.1, 0.2], [-0.1, -0.2]]) { const t = new THREE.Mesh(g, mat); t.rotation.z = Math.PI / 2; t.position.set(b.min.x + L * 0.5, b.min.y + H * (0.5 + dy), (b.max.z + b.min.z) / 2 + (b.max.z - b.min.z) * dz); t.userData.fx = 'mesh'; t.userData.baseOp = 1; model.userData.hasFx = true; model.add(t); }
}
// look PRÓPRIO das armas novas (usam o modelo de uma arma-base): quando a skin é 'base' vale este visual
const VARIANT = { scout: 'olive', vector: 'sand', pump: 'crimsonwood' };
export function applySkin(model, skin, wid = null) {
  if ((!skin || skin === 'base') && VARIANT[wid]) skin = VARIANT[wid];
  if (RARE_FX.includes(skin)) { applyRare(model, skin, !!MELEE[wid]); return; }
  if (skin && skin !== 'base' && applyPack(model, skin, !!MELEE[wid])) { if (model.userData.wantTubes) addTubes(model, model.userData.wantTubes); return; }
  if (!skin || skin === 'base') return; const mp = skinMap(skin); if (!mp.size) return;
  model.traverse((o) => { if (o.isMesh && mp.has(o.material)) o.material = mp.get(o.material); });
  if (RARE[skin]) addTubes(model, RARE[skin]);
}
