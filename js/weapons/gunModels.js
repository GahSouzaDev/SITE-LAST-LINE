import * as THREE from 'three';
import { addLaser, laserUpdate } from './laserSight.js';
import { BUILD, setOV } from './arsenalModels.js';
import { buildWeapon } from './weaponBuilder.js';
import { rawWeapon, cloneArs } from './weaponProto.js';
import { ARSENAL_BY_ID } from '/shared/arsenalData.js';
import { ITEMS } from '/shared/items.js';

// Normaliza os modelos do Arsenal para o jogo: cano para -Z, origem no centro da arma, escala em
// METROS REAIS (len em arsenalData.js) para casar com o jogador de 1,8 m. Anchors: muzzle (boca),
// eye (alinhamento da mira/ADS), grip (mão da arma), support (mão de apoio), eject (cápsulas).
const cache = new Map();
const key = (id, att) => id + '|' + JSON.stringify(att || {});

function build(id, att = {}) {
  if (!ITEMS[id]?.gun) {
    const b = buildWeapon(id);
    return { ...b, scale: 1, sight: null, dual: false, real: true };
  }
  const w = ARSENAL_BY_ID[id];
  const model = cloneArs(rawWeapon(id, att));   // cópia do protótipo (montado e fundido uma vez só)
  const holder = new THREE.Group(); holder.add(model);
  model.rotation.y = Math.PI / 2;                 // cano +X -> -Z
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(holder);
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const scale = w.len / Math.max(size.x, size.z);
  const root = new THREE.Group(); root.add(holder);
  holder.position.sub(c); root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const wrap = new THREE.Group(); wrap.add(root);
  if (att.laser && !(id.startsWith('dual') || ARSENAL_BY_ID[id]?.cls === 'dual')) { try { const L = addLaser(model, att.laser); if (L) { wrap.updateMatrixWorld(true); laserUpdate(L, null, 30); } } catch { /* sem laser */ } }   // MIRA LASER também na SUA arma (primeira pessoa)
  const toLocal = (obj) => { const p = obj.getWorldPosition(new THREE.Vector3()); return wrap.worldToLocal(p); };
  wrap.updateMatrixWorld(true);
  const mzObj = model.userData.mz?.[0];
  const mz = mzObj ? toLocal(mzObj) : new THREE.Vector3(0, 0.02, -w.len / 2);
  const eyeObj = model.userData.eye;
  const eye = eyeObj ? toLocal(eyeObj) : new THREE.Vector3(0, 0.07, 0);
  const lenZ = size.x * scale, hgt = size.y * scale;
  const muzzle = new THREE.Object3D(); muzzle.position.copy(mz); wrap.add(muzzle);
  const eject = new THREE.Object3D(); eject.position.set(0.03, 0.02, -lenZ * 0.05); wrap.add(eject);
  const flash = new THREE.Object3D(); flash.position.copy(mz); flash.position.y -= 0.02; wrap.add(flash);
  if (model.userData.hide) model.userData.hide.name = '__hide';   // referência por NOME (sobrevive ao clone)
  const sight = model.userData.sight ? JSON.parse(JSON.stringify({ fov: model.userData.sight.fov, n: model.userData.sight.n, k: model.userData.sight.k })) : null;
  // Object3D.clone() serializa userData em JSON: remove referências circulares (mz/eye/g) deixadas pelo Arsenal
  wrap.traverse((o) => {
    if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; }
    for (const k of Object.keys(o.userData)) { const v = o.userData[k]; if (v && typeof v === 'object' && !(Array.isArray(v) && v.every((x) => typeof x !== 'object'))) delete o.userData[k]; }
  });
  return {
    group: wrap, muzzle, eject, flash, eye, scale, sight, dual: id.startsWith('dual') || ARSENAL_BY_ID[id]?.cls === 'dual',
    grip: new THREE.Vector3(0, -hgt * 0.22, lenZ * 0.2), support: new THREE.Vector3(0, -hgt * 0.12, -lenZ * 0.18),
    adsY: -eye.y, length: lenZ, height: hgt, kind: 'gun', real: false
  };
}
const _eh = { group: null }; const EMPTY_HANDS = () => (_eh.group ? _eh : Object.assign(_eh, { group: new THREE.Group(), muzzle: new THREE.Object3D(), eject: new THREE.Object3D(), flash: new THREE.Object3D(), muzzles: [], sight: null, scale: 1, dual: false, grip: new THREE.Vector3(0, 0, 0), support: new THREE.Vector3(0, 0, 0), eye: new THREE.Vector3(0, 0.06, 0), length: 0.5 }));
export function getModel(id, att) { if (id === 'claws') return EMPTY_HANDS();   // o zumbi bate com as MÃOS: nada na mão (nada de faca)
 const k = key(id, att); if (!cache.has(k)) cache.set(k, build(id, att)); return cache.get(k); }
// cópia independente (uma por jogador remoto) — compartilha geometrias/materiais
export function cloneModel(id, att) {
  const t = getModel(id, att);
  const group = t.group.clone(true);
  const find = (src) => { const p = new THREE.Object3D(); p.position.copy(src.position); group.add(p); return p; };
  return { ...t, group, muzzle: find(t.muzzle), eject: find(t.eject), flash: find(t.flash) };
}
