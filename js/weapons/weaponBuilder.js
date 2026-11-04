import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ITEMS } from '/shared/items.js';
import { MELEE } from '/shared/melee.js';

// Montagem MODULAR das armas em Three.js (metros, cano para -Z, origem no centro do receiver):
// Receiver, Barrel, Muzzle, Handguard, Stock, Grip, Magazine, Sight, Rail, Trigger, Selector,
// Flashlight, Laser, Energy core. As variações vêm de ITEMS[id].model — e os acessórios do
// Arsenal (mira, cano, boca, carregador...) trocam peças sem refazer a arma.
const MAT = {};
function mat(key, color, metalness, roughness, extra = {}) {
  if (!MAT[key]) { MAT[key] = new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra }); MAT[key].userData.k = key; }   // userData.k: ponte para as skins (armas brancas usam estes materiais)
  return MAT[key];
}
const M = {
  metal: () => mat('metal', 0x30353b, 0.85, 0.36),
  steel: () => mat('steel', 0x5a6168, 0.9, 0.3),
  poly: () => mat('poly', 0x1c1e22, 0.1, 0.72),
  grip: () => mat('grip', 0x25282c, 0.05, 0.9),
  accent: () => mat('accent', 0x8a6a3a, 0.2, 0.6),
  glassRed: () => mat('glassRed', 0xff2a1a, 0, 0.1, { emissive: 0xff2a1a, emissiveIntensity: 1.6 }),
  lens: () => mat('lens', 0x7fb6d6, 0.6, 0.05, { transparent: true, opacity: 0.55 }),
  lamp: () => mat('lamp', 0xfff2c0, 0, 0.1, { emissive: 0xfff2c0, emissiveIntensity: 1.2 }),
  glow: (c) => mat('glow' + c, c, 0, 0.2, { emissive: c, emissiveIntensity: 2.2 })
};

function put(m, x, y, z, rx = 0, ry = 0, rz = 0) { m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = false; return m; }
const rb = (w, h, l, material, x, y, z, rx, ry, rz, r = 0.0035) => put(new THREE.Mesh(new RoundedBoxGeometry(w, h, l, 2, Math.min(r, w / 2.2, h / 2.2, l / 2.2)), material), x, y, z, rx, ry, rz);
const bx = (w, h, l, material, x, y, z, rx, ry, rz) => put(new THREE.Mesh(new THREE.BoxGeometry(w, h, l), material), x, y, z, rx, ry, rz);
function cylZ(r, len, material, x, y, z, seg = 14) { const g = new THREE.CylinderGeometry(r, r, len, seg); g.rotateX(Math.PI / 2); return put(new THREE.Mesh(g, material), x, y, z); }
function cylX(r, len, material, x, y, z, seg = 18) { const g = new THREE.CylinderGeometry(r, r, len, seg); g.rotateZ(Math.PI / 2); return put(new THREE.Mesh(g, material), x, y, z); }
function cylY(r, len, material, x, y, z, seg = 14) { return put(new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), material), x, y, z); }

export function buildWeapon(id, opts = {}) {
  const it = ITEMS[id];
  const g = new THREE.Group();
  g.name = id;
  const info = { group: g, muzzle: new THREE.Object3D(), eject: new THREE.Object3D(), flash: new THREE.Object3D(), grip: new THREE.Vector3(0, -0.06, 0.06), support: new THREE.Vector3(0, -0.03, -0.2), adsY: -0.075, length: 0.6, kind: 'gun' };
  if (id === 'knife') return buildKnife(info);
  if (MELEE[id]) return buildMelee(info, id);
  if (id === 'fists') return buildFists(info);
  if (id === 'claws') return buildClaws(info);
  if (id.startsWith('grenade_')) return buildGrenade(info, id.slice(8));
  if (id === 'bomb') return buildBomb(info);
  const m = it?.model || {};
  const R = m.receiver, rl = R.len, rh = R.h, rw = R.w;
  const metal = M.metal(), poly = M.poly();

  // ---- Receiver (+ detalhes) ----
  g.add(rb(rw, rh, rl, m.pistol ? metal : poly, 0, 0, 0));
  g.add(bx(rw * 1.04, 0.004, rl * 0.82, metal, 0, rh * 0.18, 0));                 // linha de separação upper/lower
  if (m.pistol) { // ---- pistola: slide + armação ----
    g.add(rb(rw * 0.98, rh * 0.62, rl, metal, 0, rh * 0.32, 0, 0, 0, 0, 0.005));
    g.add(rb(rw * 0.9, rh * 0.5, rl * 0.92, poly, 0, -rh * 0.22, 0.01));
    for (let i = 0; i < 6; i++) g.add(bx(rw * 1.02, rh * 0.5, 0.0035, poly, 0, rh * 0.32, rl * 0.28 + i * 0.008)); // serrilha traseira
  }

  // ---- Barrel + Muzzle ----
  const B = m.barrel, tipZ = -(rl / 2 + B.len);
  g.add(cylZ(B.r, B.len + 0.04, metal, 0, rh * 0.18, -(rl / 2 + B.len / 2) + 0.02));
  let muzzleLen = 0;
  switch (m.muzzle) {
    case 'brake': g.add(cylZ(B.r * 1.55, 0.055, metal, 0, rh * 0.18, tipZ - 0.02)); for (let i = 0; i < 3; i++) g.add(bx(B.r * 3.4, 0.004, 0.006, poly, 0, rh * 0.18, tipZ - 0.008 - i * 0.014)); muzzleLen = 0.05; break;
    case 'suppressor': g.add(cylZ(B.r * 2.5, 0.17, poly, 0, rh * 0.18, tipZ - 0.06)); g.add(cylZ(B.r * 2.6, 0.01, metal, 0, rh * 0.18, tipZ + 0.02)); muzzleLen = 0.14; break;
    case 'flash': { const c = new THREE.Mesh(new THREE.CylinderGeometry(B.r * 2.2, B.r * 1.3, 0.06, 10, 1, true), metal); c.rotation.x = -Math.PI / 2; g.add(put(c, 0, rh * 0.18, tipZ - 0.02, -Math.PI / 2)); muzzleLen = 0.05; break; }
    case 'emitter': g.add(cylZ(B.r * 1.5, 0.05, metal, 0, rh * 0.18, tipZ - 0.015)); { const t = new THREE.Mesh(new THREE.TorusGeometry(B.r * 1.9, 0.004, 8, 20), M.glow(m.core || 0x4fc3ff)); put(t, 0, rh * 0.18, tipZ - 0.045); g.add(t); } muzzleLen = 0.05; break;
    default: g.add(cylZ(B.r * 1.15, 0.012, metal, 0, rh * 0.18, tipZ - 0.004)); muzzleLen = 0.01;
  }
  info.muzzle.position.set(0, rh * 0.18, tipZ - muzzleLen - 0.02);
  g.add(info.muzzle);

  // ---- Handguard ----
  if (m.handguard) {
    const H = m.handguard, hz = -(rl / 2 + H.len / 2) + 0.012;
    if (H.style === 'pump') {
      g.add(cylZ(0.0115, H.len + 0.12, metal, 0, -rh * 0.3, hz - 0.02));                  // tubo do carregador
      g.add(rb(H.w, H.h, H.len * 0.62, mat('wood', 0x5a3d26, 0.05, 0.7), 0, -rh * 0.22, hz + 0.02));// pump
      for (let i = 0; i < 5; i++) g.add(bx(H.w * 1.02, H.h * 0.7, 0.003, poly, 0, -rh * 0.22, hz - 0.03 + i * 0.012));
    } else if (H.style === 'shroud') {
      g.add(cylZ(H.h * 0.62, H.len, metal, 0, rh * 0.1, hz)); for (let i = 0; i < 7; i++) g.add(bx(H.w * 0.72, 0.012, 0.012, poly, 0, rh * 0.1 + H.h * 0.46, hz + H.len / 2 - 0.02 - i * 0.04));
    } else {
      g.add(rb(H.w, H.h, H.len, style(H.style, metal, poly), 0, -0.002, hz));
      if (H.style === 'vent') for (let i = 0; i < 5; i++) for (const s of [-1, 1]) g.add(bx(0.003, H.h * 0.38, 0.018, M.glow(0x000000), s * (H.w / 2 + 0.0005), 0, hz + H.len / 2 - 0.045 - i * 0.045));
      if (H.style === 'energy') { g.add(bx(0.012, 0.012, H.len * 0.9, M.glow(m.core || 0x4fc3ff), 0, H.h * 0.52, hz)); for (const s of [-1, 1]) g.add(bx(0.003, 0.012, H.len * 0.8, M.glow(m.core || 0x4fc3ff), s * (H.w / 2 + 0.001), 0, hz)); }
    }
    info.support.set(0, -0.045, hz + 0.02);
  }

  // ---- Rail superior (picatinny) ----
  if (m.rail) {
    const len = rl + (m.handguard ? m.handguard.len : 0) * 0.9, z0 = -(len - rl) / 2;
    g.add(bx(0.018, 0.006, len, metal, 0, rh / 2 + 0.003, z0));
    for (let i = 0; i < Math.floor(len / 0.013); i++) g.add(bx(0.02, 0.004, 0.006, poly, 0, rh / 2 + 0.008, z0 + len / 2 - 0.006 - i * 0.013));
  }

  // ---- Stock ----
  const S = m.stock;
  if (S && !m.pistol) {
    const sz = rl / 2 + S.len / 2 - 0.01;
    if (S.type === 'wire') { for (const s of [-1, 1]) g.add(cylZ(0.004, S.len, metal, s * 0.014, -0.004, sz)); g.add(rb(0.04, 0.07, 0.014, poly, 0, -0.004, rl / 2 + S.len)); }
    else if (S.type === 'skeleton') { g.add(rb(0.03, 0.025, S.len, poly, 0, 0.01, sz)); g.add(rb(0.03, 0.03, S.len * 0.8, poly, 0, -0.06, sz + 0.02, 0.15)); g.add(rb(0.036, 0.1, 0.02, mat('pad', 0x111214, 0, 0.95), 0, -0.02, rl / 2 + S.len)); g.add(rb(0.04, 0.045, 0.1, poly, 0, 0.02, rl / 2 + 0.02)); }
    else { g.add(rb(0.04, 0.085, S.len, poly, 0, -0.012, sz, 0.06)); g.add(rb(0.044, 0.1, 0.022, mat('pad', 0x111214, 0, 0.95), 0, -0.02, rl / 2 + S.len - 0.005, 0.06)); }
  }

  // ---- Grip + gatilho + proteção ----
  if (m.grip !== 'none') {
    const gz = rl * (m.pistol ? 0.34 : 0.24);
    g.add(rb(0.03, m.pistol ? 0.1 : 0.11, 0.04, M.grip(), 0, -rh / 2 - (m.pistol ? 0.04 : 0.05), gz, -0.3));
    info.grip.set(0, -rh / 2 - 0.04, gz + 0.012);
  } else info.grip.set(0, -rh / 2 - 0.03, rl * 0.28);
  g.add(bx(0.004, 0.022, 0.05, metal, 0, -rh / 2 - 0.012, rl * 0.04));
  g.add(bx(0.004, 0.004, 0.05, metal, 0, -rh / 2 - 0.026, rl * 0.04 - 0.005));
  g.add(bx(0.006, 0.02, 0.006, metal, 0, -rh / 2 - 0.01, rl * 0.06, 0.4));
  if (m.selector) g.add(rb(0.006, 0.012, 0.022, metal, rw / 2 + 0.002, 0.0, rl * 0.18));

  // ---- Magazine ----
  const G = m.mag;
  if (G) {
    const mz = m.pistol ? rl * 0.3 : -0.02;
    if (G.type === 'curved') { g.add(rb(rw * 0.7, G.h, G.len, metal, 0, -rh / 2 - G.h / 2 + 0.01, mz, 0.22)); g.add(rb(rw * 0.72, 0.012, G.len + 0.004, poly, 0, -rh / 2 - G.h + 0.012, mz - 0.017, 0.22)); }
    else if (G.type === 'straight') { g.add(rb(rw * 0.7, G.h, G.len, metal, 0, -rh / 2 - G.h / 2 + 0.01, mz, m.pistol ? 0 : 0.03)); g.add(rb(rw * 0.74, 0.01, G.len + 0.004, poly, 0, -rh / 2 - G.h + 0.012, mz, m.pistol ? 0 : 0.03)); }
    else if (G.type === 'drum') { const d = cylX(G.h * 0.85, G.len * 0.8, metal, 0, -rh / 2 - G.h * 0.7, mz, 24); g.add(d); g.add(cylX(G.h * 0.55, G.len * 0.85, poly, 0, -rh / 2 - G.h * 0.7, mz, 24)); }
    else if (G.type === 'box') { g.add(rb(rw * 0.8, G.h, G.len, metal, 0, -rh / 2 - G.h / 2 + 0.01, mz)); }
    else if (G.type === 'cell') { g.add(rb(rw * 0.7, G.h, G.len, metal, 0, -rh / 2 - G.h / 2 + 0.01, mz)); g.add(bx(0.004, G.h * 0.7, G.len * 0.6, M.glow(m.core || 0x4fc3ff), rw * 0.36, -rh / 2 - G.h / 2, mz)); }
  }

  // ---- Sight ----
  let sightH = 0.04;
  const top = rh / 2 + (m.rail ? 0.011 : 0);
  if (m.sight === 'iron') {
    g.add(bx(0.004, 0.022, 0.004, metal, 0, top + 0.011, rl / 2 - 0.02));
    g.add(bx(0.016, 0.01, 0.006, metal, -0.008, top + 0.005, rl / 2 - 0.02)); g.add(bx(0.016, 0.01, 0.006, metal, 0.008, top + 0.005, rl / 2 - 0.02));
    g.add(bx(0.003, 0.026, 0.003, metal, 0, rh * 0.18 + B.r + 0.013, tipZ + 0.03));
    sightH = 0.022;
  } else if (m.sight === 'red') {
    g.add(rb(0.03, 0.045, 0.06, poly, 0, top + 0.024, 0.0)); g.add(bx(0.024, 0.032, 0.002, M.lens(), 0, top + 0.03, -0.028)); g.add(bx(0.003, 0.003, 0.002, M.glassRed(), 0, top + 0.03, -0.029));
    sightH = 0.04;
  } else if (m.sight === 'scope') {
    g.add(cylZ(0.024, 0.28, poly, 0, top + 0.04, -0.04, 20)); g.add(cylZ(0.031, 0.05, poly, 0, top + 0.04, -0.2, 20)); g.add(cylZ(0.029, 0.04, poly, 0, top + 0.04, 0.1, 20));
    g.add(cylZ(0.028, 0.002, M.lens(), 0, top + 0.04, -0.226, 20));
    for (const z of [-0.12, 0.04]) g.add(rb(0.012, 0.03, 0.014, metal, 0, top + 0.012, z));
    g.add(cylX(0.008, 0.012, metal, 0.03, top + 0.04, -0.04, 10));
    sightH = 0.056;
  }
  info.adsY = -(top + sightH + 0.012);

  // ---- Flashlight / Laser / Bipod / alça / núcleo ----
  if (m.flashlight && m.handguard) { const z = -(rl / 2 + m.handguard.len) + 0.03; g.add(cylZ(0.011, 0.055, metal, 0, -m.handguard.h / 2 - 0.006, z)); g.add(cylZ(0.0095, 0.004, M.lamp(), 0, -m.handguard.h / 2 - 0.006, z - 0.029)); info.flash.position.set(0, -m.handguard.h / 2 - 0.006, z - 0.035); g.add(info.flash); }
  else { info.flash.position.copy(info.muzzle.position); info.flash.position.y -= 0.02; g.add(info.flash); }
  if (m.laser && m.handguard) { g.add(rb(0.014, 0.014, 0.04, poly, m.handguard.w / 2 + 0.008, 0, -(rl / 2 + m.handguard.len) + 0.05)); g.add(bx(0.003, 0.003, 0.002, M.glassRed(), m.handguard.w / 2 + 0.008, 0, -(rl / 2 + m.handguard.len) + 0.03)); }
  if (m.bipod) for (const s of [-1, 1]) g.add(cylZ(0.003, 0.15, metal, s * 0.014, -0.03, -(rl / 2 + 0.2), 6)).rotation.x = 0.05;
  if (m.handle) { g.add(rb(0.014, 0.04, 0.12, metal, 0, rh / 2 + 0.02, -0.02)); }
  if (m.core && !m.handguard) g.add(cylZ(0.01, rl * 0.7, M.glow(m.core), 0, rh / 2 + 0.01, 0));
  if (m.core && m.handguard) g.add(cylZ(0.008, rl * 0.6, M.glow(m.core), 0, rh / 2 + 0.006, 0));

  info.eject.position.set(rw / 2 + 0.01, rh * 0.2, -0.02); g.add(info.eject);
  info.length = rl + B.len + (m.handguard ? 0 : 0) + (S ? S.len : 0);
  g.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  return info;
}
function style(s, metal, poly) { return s === 'slim' || s === 'vent' ? poly : s === 'energy' ? metal : poly; }

function buildKnife(info) {
  const g = info.group, steel = bladeMat(); g.scale.setScalar(1.3);   // lâmina clara e maior: enxerga-se bem na mão
  const sh = new THREE.Shape(); sh.moveTo(0, 0.012); sh.lineTo(-0.2, 0.014); sh.lineTo(-0.235, 0.0); sh.lineTo(-0.2, -0.008); sh.lineTo(0, -0.012); sh.closePath();
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.003, bevelEnabled: false }), steel);
  blade.rotation.set(0, Math.PI / 2, 0); blade.position.set(-0.0015, 0.0, 0);
  const b2 = blade; b2.rotation.y = Math.PI / 2; // lâmina aponta para -Z
  g.add(b2); g.add(rb(0.004, 0.02, 0.012, M.metal(), 0, 0, -0.005)); g.add(cylZ(0.011, 0.11, M.grip(), 0, 0, 0.06, 10));
  g.add(cylZ(0.013, 0.012, M.metal(), 0, 0, 0.12, 10));
  info.kind = 'knife'; info.grip.set(0, 0, 0.06); info.support.set(0, -0.1, 0.1); info.adsY = -0.05; info.length = 0.34;
  info.muzzle.position.set(0, 0, -0.25); g.add(info.muzzle);
  return info;
}
// ===== ARMAS BRANCAS: lâmina clara (levemente luminosa) para aparecer bem na mão =====
function bladeMat() { return mat('blade', 0xe9eff4, 0.9, 0.14, { emissive: 0x2a3f55, emissiveIntensity: 0.5 }); }
function bladeShape(pts, depth = 0.005, y = 0, z = 0) { const sh = new THREE.Shape(); pts.forEach(([x, yy], i) => (i ? sh.lineTo(x, yy) : sh.moveTo(x, yy))); sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }), bladeMat()); m.rotation.y = Math.PI / 2; m.position.set(-depth / 2, y, z); return m; }
function buildMelee(info, id) {
  const g = info.group, wood = mat('mwood', 0x5a3a22, 0.05, 0.8), dark = mat('mdark', 0x1d1f24, 0.4, 0.5), red = mat('mred', 0x9a1c1c, 0.1, 0.7), gold = mat('mgold', 0xd9a72b, 0.9, 0.3);
  let len = 0.4;
  if (id === 'machete') {
    g.add(bladeShape([[0, 0.02], [0.3, 0.036], [0.46, 0.038], [0.5, 0.0], [0.46, -0.012], [0.3, -0.01], [0, -0.012]], 0.006, 0, -0.01)); g.add(cylZ(0.014, 0.13, wood, 0, 0, 0.07, 10)); g.add(cylZ(0.017, 0.012, dark, 0, 0, 0.0, 10)); len = 0.65;
  } else if (id === 'karambit') {
    g.add(bladeShape([[0, 0.012], [0.05, 0.034], [0.11, 0.058], [0.16, 0.05], [0.19, 0.022], [0.2, -0.02], [0.17, -0.008], [0.12, 0.004], [0.06, 0.0], [0, -0.01]], 0.005, 0, -0.01)); g.add(cylZ(0.012, 0.09, dark, 0, 0, 0.05, 10));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 6, 16), mat('mring', 0xc0c6cc, 0.9, 0.2)); ring.position.set(0, 0, 0.115); ring.rotation.y = Math.PI / 2; g.add(ring); len = 0.32;
  } else if (id === 'katana') {
    g.add(bladeShape([[0, 0.013], [0.3, 0.017], [0.62, 0.014], [0.78, 0.004], [0.8, -0.003], [0.62, -0.012], [0.3, -0.012], [0, -0.012]], 0.004, 0.0, -0.02)); const ts = cylZ(0.04, 0.005, gold, 0, 0, -0.02, 18); g.add(ts);
    g.add(cylZ(0.013, 0.26, red, 0, 0, 0.12, 10)); g.add(cylZ(0.016, 0.014, gold, 0, 0, 0.255, 10)); len = 1.05;
  } else if (id === 'sword') {
    g.add(bladeShape([[0, 0.027], [0.5, 0.029], [0.64, 0.0], [0.5, -0.029], [0, -0.027]], 0.006, 0, -0.02)); g.add(rb(0.26, 0.022, 0.024, gold, 0, 0, -0.02)); g.add(cylZ(0.015, 0.16, dark, 0, 0, 0.07, 10)); { const pm = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), gold); pm.position.set(0, 0, 0.16); g.add(pm); } len = 0.9;
  } else if (id === 'axe') {
    g.add(cylZ(0.017, 0.72, wood, 0, 0, 0.0, 10)); g.add(cylZ(0.021, 0.04, dark, 0, 0, 0.34, 10));
    const head = bladeShape([[0, 0.034], [0.05, 0.038], [0.1, 0.11], [0.15, 0.135], [0.17, 0.0], [0.15, -0.135], [0.1, -0.11], [0.05, -0.038], [0, -0.034]], 0.034, 0, -0.3); g.add(head); g.add(rb(0.05, 0.05, 0.05, dark, 0, 0, -0.3)); len = 0.8;
  }
  else if (id === 'hammer') {
    g.add(cylZ(0.02, 0.62, wood, 0, 0, 0.0, 10)); g.add(rb(0.1, 0.1, 0.24, mat('hstl', 0x8a929a, 0.9, 0.3), 0, 0, -0.3)); g.add(rb(0.04, 0.04, 0.26, dark, 0, 0, -0.3)); len = 0.62;
  } else if (id === 'spear') {
    g.add(cylZ(0.014, 1.3, wood, 0, 0, 0.0, 10)); g.add(bladeShape([[0, 0.032], [0.12, 0.036], [0.26, 0.0], [0.12, -0.036], [0, -0.032]], 0.008, 0, -0.65)); g.add(cylZ(0.02, 0.05, dark, 0, 0, -0.62, 10)); len = 1.0;
  } else if (id === 'bat') {
    g.add(cylZ(0.024, 0.62, wood, 0, 0, -0.1, 12)); g.add(cylZ(0.034, 0.3, wood, 0, 0, -0.34, 12)); g.add(cylZ(0.016, 0.14, dark, 0, 0, 0.26, 10));
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; g.add(cylZ(0.006, 0.05, mat('nail', 0xb8bec4, 0.9, 0.3), Math.cos(a) * 0.036, Math.sin(a) * 0.036, -0.28 - (i % 3) * 0.05, 5)); } len = 0.58;
  } else if (id === 'plasma') {
    const gl = new THREE.MeshStandardMaterial({ color: 0x9be8ff, emissive: 0x2aa8ff, emissiveIntensity: 3, metalness: 0.1, roughness: 0.3 }); g.add(bladeShape([[0, 0.02], [0.5, 0.022], [0.7, 0.0], [0.5, -0.022], [0, -0.02]], 0.01, 0, -0.04)); g.add(cylZ(0.016, 0.16, dark, 0, 0, 0.08, 10)); g.add(rb(0.07, 0.02, 0.03, gold, 0, 0, -0.03)); g.children[0].material = gl; len = 0.8;
  } else if (id === 'xknife') {
    const wh = mat('xwh', 0xf6f8fb, 0.05, 0.7), rd = mat('xrd', 0xd62a33, 0.2, 0.5);
    g.add(bladeShape([[0, 0.02], [0.22, 0.022], [0.32, 0.0], [0.22, -0.016], [0, -0.016]], 0.004, 0, -0.01)); g.add(rb(0.07, 0.022, 0.016, gold, 0, 0, 0.0));
    for (let i = 0; i < 6; i++) g.add(cylZ(0.016, 0.021, i % 2 ? wh : rd, 0, 0, 0.026 + i * 0.021, 10)); g.add(cylZ(0.019, 0.02, gold, 0, 0, 0.16, 10));
    g.add(rb(0.02, 0.02, 0.02, rd, 0.012, -0.03, 0.17)); len = 0.34;
  } else if (id === 'cenoura') {
    const car = mat('carrot', 0xff8a1a, 0.05, 0.7), lf = mat('cleaf', 0x2fa05a, 0.05, 0.7);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.5, 14), car); cone.rotation.x = -Math.PI / 2; cone.position.set(0, 0, -0.22); g.add(cone);
    for (let i = 0; i < 5; i++) g.add(cylZ(0.0425 - i * 0.005, 0.012, mat('crng', 0xd96a0c, 0.05, 0.8), 0, 0, -0.04 - i * 0.07, 14));
    for (let i = 0; i < 3; i++) { const lv = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.14, 6), lf); lv.rotation.x = Math.PI / 2; lv.position.set((i - 1) * 0.02, (i % 2) * 0.015, 0.1); lv.rotation.z = (i - 1) * 0.25; g.add(lv); } len = 0.55;
  } else if (id === 'foice') {
    const bn = mat('fbone', 0x3a2a4a, 0.3, 0.6), pur = mat('fpur', 0x9d4dff, 0.3, 0.3, { emissive: 0x6a2cc0, emissiveIntensity: 1.2 });
    g.add(cylZ(0.016, 0.95, wood, 0, 0, 0.0, 10)); g.add(cylZ(0.022, 0.05, dark, 0, 0, 0.44, 10)); g.add(cylZ(0.022, 0.04, dark, 0, 0, -0.4, 10));
    g.add(bladeShape([[0, 0.02], [0.1, 0.1], [0.24, 0.17], [0.4, 0.13], [0.28, 0.1], [0.14, 0.06], [0, -0.01]], 0.006, 0, -0.44)); g.add(bladeShape([[0.02, 0.0], [0.12, 0.034], [0.26, 0.09], [0.34, 0.1]], 0.004, 0, -0.44)); g.add(rb(0.02, 0.07, 0.03, pur, 0, 0.03, -0.43)); len = 1.0;
  } else if (id === 'facacurupira') {
    const em = mat('fcem', 0xff7a1a, 0.3, 0.3, { emissive: 0xff4a00, emissiveIntensity: 1.6 }), wd2 = mat('fcwd', 0x4a2a12, 0.05, 0.8), hair = mat('fchr', 0xff3300, 0.1, 0.5, { emissive: 0xff3300, emissiveIntensity: 2 });
    g.add(bladeShape([[0, 0.022], [0.3, 0.03], [0.5, 0.05], [0.62, 0.03], [0.6, -0.012], [0.3, -0.014], [0, -0.014]], 0.007, 0, -0.02).clone()); g.children[g.children.length - 1].material = em;
    g.add(rb(0.07, 0.03, 0.02, gold, 0, 0, 0.0)); g.add(cylZ(0.016, 0.14, wd2, 0, 0, 0.08, 10));
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.07, 5), hair); f.rotation.x = Math.PI / 2; f.position.set((i - 1.5) * 0.012, 0.012 * (i % 2), 0.18 + i * 0.006); g.add(f); } len = 0.62;
  } else if (id === 'tridente') {
    const wt = mat('trwd', 0x2a4a5a, 0.5, 0.4), aq = mat('traq', 0x2ac8ff, 0.3, 0.2, { emissive: 0x2ac8ff, emissiveIntensity: 1.4 }), gm = mat('trgm', 0xaaf0ff, 0.2, 0.2, { emissive: 0x44ccff, emissiveIntensity: 2 });
    g.add(cylZ(0.014, 1.35, wt, 0, 0, 0.0, 10)); for (const z of [0.42, 0.0, -0.3]) g.add(cylZ(0.02, 0.03, gold, 0, 0, z, 10));
    g.add(rb(0.2, 0.02, 0.026, gold, 0, 0, -0.62));
    for (const x of [-0.09, 0, 0.09]) { g.add(cylZ(0.008, 0.2, aq, x, 0, -0.74, 8)); const c = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.08, 6), aq); c.rotation.x = -Math.PI / 2; c.position.set(x, 0, -0.88); g.add(c); }
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), gm); gem.position.set(0, 0, -0.62); g.add(gem); len = 1.0;
  } else if (id === 'caipora') {
    const lf = mat('cplf', 0x2ac84a, 0.3, 0.3, { emissive: 0x0a8a2a, emissiveIntensity: 0.9 }), cip = mat('cpwd', 0x5a3a22, 0.05, 0.8), fly = mat('cpfl', 0xfff07a, 0, 0.3, { emissive: 0xffee55, emissiveIntensity: 3 });
    g.add(bladeShape([[0, 0.012], [0.08, 0.04], [0.2, 0.055], [0.32, 0.03], [0.36, 0.0], [0.2, -0.03], [0.08, -0.02], [0, -0.012]], 0.005, 0, -0.01)); g.children[g.children.length - 1].material = lf;
    g.add(cylZ(0.012, 0.12, cip, 0, 0, 0.07, 8)); for (let i = 0; i < 4; i++) g.add(cylZ(0.0135, 0.008, mat('cpv', 0x2b6a2b, 0.05, 0.7), 0, 0, 0.03 + i * 0.03, 8));
    for (const [x, y, z] of [[0.05, 0.05, -0.1], [-0.05, 0.03, -0.2], [0.04, -0.04, -0.28]]) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 5), fly); f.position.set(x, y, z); g.add(f); } len = 0.38;
  } else if (id === 'navalha') {
    const ch = mat('nvch', 0xd8dee4, 0.95, 0.12, { emissive: 0x223344, emissiveIntensity: 0.3 }), bn = mat('nvbn', 0xf0e6c8, 0.05, 0.6), rub = mat('nvrb', 0xd8102a, 0.2, 0.3, { emissive: 0xff1030, emissiveIntensity: 1.4 });
    g.add(bladeShape([[0, 0.016], [0.22, 0.022], [0.3, 0.012], [0.3, -0.008], [0.22, -0.012], [0, -0.012]], 0.004, 0, -0.01)); g.add(rb(0.03, 0.026, 0.14, bn, 0, 0, 0.09)); g.add(rb(0.034, 0.012, 0.02, gold, 0, 0, 0.0));
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), rub); r.position.set(0, 0.015, 0.1); g.add(r); len = 0.34;
  } else if (id === 'paje') {
    const bn = mat('pjbn', 0xf0e6c8, 0.05, 0.5, { emissive: 0x2a5a66, emissiveIntensity: 0.4 }), rn = mat('pjrn', 0x66ddff, 0.1, 0.3, { emissive: 0x44ccff, emissiveIntensity: 2.4 });
    g.add(bladeShape([[0, 0.016], [0.18, 0.028], [0.3, 0.0], [0.18, -0.024], [0, -0.016]], 0.006, 0, -0.01)); g.children[g.children.length - 1].material = bn;
    for (let i = 0; i < 3; i++) g.add(rb(0.004, 0.012, 0.014, rn, 0.0, 0.0, -0.08 - i * 0.06));
    g.add(cylZ(0.013, 0.12, mat('pjcd', 0xa8442a, 0.05, 0.8), 0, 0, 0.07, 8)); for (const [i, c] of [0xff3030, 0x30c0ff, 0xffd21a].entries()) g.add(cylZ(0.0035, 0.07, mat('pjf' + i, c, 0.05, 0.7), 0.016 + i * 0.006, -0.03, 0.16, 5));
    len = 0.34;
  } else if (id === 'chainsaw') {
    const mt2 = mat('csaw', 0xd9731a, 0.2, 0.5); g.add(rb(0.12, 0.14, 0.26, mt2, 0, 0, 0.05)); g.add(rb(0.05, 0.1, 0.08, dark, 0, -0.1, 0.1)); g.add(bladeShape([[0, 0.03], [0.45, 0.034], [0.5, 0.0], [0.45, -0.034], [0, -0.03]], 0.012, 0, -0.1)); g.add(rb(0.014, 0.016, 0.5, mat('chn', 0x9aa2aa, 0.9, 0.3), 0, 0.0, -0.36)); len = 0.62;
  }
  info.kind = 'knife'; info.grip.set(0, 0, 0.06); info.support.set(0, -0.1, 0.1); info.adsY = -0.05; info.length = len;
  info.muzzle.position.set(0, 0, -len * 0.8); g.add(info.muzzle);
  return info;
}
// BOMBA C4: bloco de plástico oliva com 3 tijolos de explosivo, fios, visor com números e LED vermelho piscante
export function buildBomb(info) {
  const g = info.group, olive = mat('c4o', 0x4d5a36, 0.1, 0.75), dark = mat('c4d', 0x16181c, 0.3, 0.5), lcd = mat('c4l', 0x2b6d3a, 0, 0.3, { emissive: 0x3dff6a, emissiveIntensity: 1.1 });
  g.add(rb(0.17, 0.05, 0.1, dark, 0, 0, 0));
  for (let i = 0; i < 3; i++) g.add(rb(0.05, 0.034, 0.09, olive, -0.056 + i * 0.056, 0.04, 0, 0, 0, 0, 0.004));
  g.add(rb(0.07, 0.016, 0.05, dark, 0.04, 0.066, 0)); g.add(bx(0.052, 0.004, 0.026, lcd, 0.04, 0.076, 0));
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 8, 6), mat('c4led', 0xff2a1a, 0.1, 0.3, { emissive: 0xff2a1a, emissiveIntensity: 2.4 })); led.position.set(-0.05, 0.062, 0.03); led.name = '__led'; g.add(led);
  for (const [x, c] of [[-0.02, 0xd8261a], [0, 0x2d6cdf], [0.02, 0xf2c200]]) g.add(cylZ(0.0025, 0.07, mat('w' + c, c, 0.1, 0.6), x, 0.064, -0.05, 6));
  g.scale.setScalar(0.62);
  info.kind = 'grenade'; info.grip.set(0, 0, 0); info.support.set(0, -0.1, 0.1); info.adsY = -0.05; info.length = 0.11;
  info.muzzle.position.set(0, 0, 0); g.add(info.muzzle); return info;
}
function buildGrenade(info, kind = 'frag') {
  const g = info.group;
  if (kind === 'smoke') {     // lata cilíndrica cinza com tampa e faixa
    g.add(cylY(0.03, 0.13, mat('gsm', 0x7d8791, 0.5, 0.45), 0, 0, 0, 14)); g.add(cylY(0.026, 0.022, M.metal(), 0, 0.075, 0, 12)); g.add(cylY(0.0315, 0.02, mat('gsb', 0x2a2f36, 0.3, 0.6), 0, 0.02, 0, 14)); g.add(rb(0.008, 0.07, 0.014, M.steel(), 0.026, 0.07, 0, 0, 0, -0.1));
    info.kind = 'grenade'; info.grip.set(0, 0, 0); info.support.set(0, -0.1, 0.1); info.adsY = -0.05; info.length = 0.13; return info;
  }
  if (kind === 'flash') {     // cilindro curto claro com faixas amarelas
    g.add(cylY(0.026, 0.1, mat('gfl', 0xdfe5ea, 0.4, 0.4), 0, 0, 0, 14)); for (const y of [-0.025, 0.025]) g.add(cylY(0.0275, 0.014, mat('gfy', 0xf5b800, 0.2, 0.5), 0, y, 0, 14)); g.add(cylY(0.022, 0.02, M.metal(), 0, 0.06, 0, 12));
    info.kind = 'grenade'; info.grip.set(0, 0, 0); info.support.set(0, -0.1, 0.1); info.adsY = -0.05; info.length = 0.1; return info;
  }
  if (kind === 'mine') {      // disco achatado com luz vermelha e antena
    g.add(cylY(0.085, 0.03, mat('gmn', 0x3d4a2e, 0.3, 0.7), 0, 0, 0, 20)); g.add(cylY(0.05, 0.012, mat('gmd', 0x1d1f24, 0.4, 0.5), 0, 0.02, 0, 16));
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), mat('gml', 0xff2a1a, 0.1, 0.4, { emissive: 0xff2a1a, emissiveIntensity: 2.2 })); led.position.set(0, 0.034, 0); g.add(led); g.add(cylY(0.003, 0.05, M.steel(), 0.05, 0.03, 0, 6));
    info.kind = 'grenade'; info.grip.set(0, 0, 0); info.support.set(0, -0.1, 0.1); info.adsY = -0.05; info.length = 0.17; return info;
  }
  if (kind === 'impact') {    // esfera lisa com faixa laranja e topo vermelho
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.034, 14, 10), mat('gim', 0x2f3a46, 0.3, 0.55))); const band = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.006, 6, 20), mat('gib', 0xff7a18, 0.2, 0.5, { emissive: 0xff5a00, emissiveIntensity: 0.6 })); band.rotation.x = Math.PI / 2; g.add(band);
    g.add(cylY(0.016, 0.02, mat('gic', 0xc0261c, 0.2, 0.6), 0, 0.04, 0, 12));
    info.kind = 'grenade'; info.grip.set(0, 0, 0); info.support.set(0, -0.1, 0.1); info.adsY = -0.05; info.length = 0.09; return info;
  }
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.036, 1), mat('gren', 0x4b5a3a, 0.2, 0.7)));
  g.add(cylY(0.013, 0.014, M.metal(), 0, 0.04, 0, 10)); g.add(rb(0.008, 0.07, 0.014, M.steel(), 0.026, 0.02, 0, 0, 0, -0.1));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.0025, 6, 14), M.steel()); put(ring, -0.014, 0.05, 0, 0, Math.PI / 2, 0); g.add(ring);
  info.kind = 'grenade'; info.grip.set(0, 0, 0); info.support.set(0, -0.1, 0.1); info.adsY = -0.05; info.length = 0.1;
  info.muzzle.position.set(0, 0, 0); g.add(info.muzzle);
  return info;
}

// Cache de modelos (clones compartilham geometrias/materiais).
const cache = {};
export function getWeaponTemplate(id) { return (cache[id] ||= buildWeapon(id)); }
export function cloneWeapon(id) {
  const t = getWeaponTemplate(id);
  const c = t.group.clone(true);
  const find = (n) => { let r = null; c.traverse((o) => { if (!r && o.uuid && o.parent && t.group.children.length) { /* placeholder */ } }); return r; };
  void find;
  // âncoras: recalcula a partir das posições do template
  const mk = (src) => { const o = new THREE.Object3D(); o.position.copy(src.position); c.add(o); return o; };
  return { group: c, muzzle: mk(t.muzzle), eject: mk(t.eject), flash: mk(t.flash), grip: t.grip, support: t.support, adsY: t.adsY, length: t.length, kind: t.kind };
}

function buildFists(info) {
  info.kind = 'fists'; info.grip.set(0, 0, 0); info.support.set(0, 0, 0); info.adsY = -0.05; info.length = 0.1;
  info.muzzle.position.set(0, 0, -0.1); info.group.add(info.muzzle); info.noHands = true; return info;
}
function buildClaws(info) {
  const g = info.group, c = mat('claw', 0xd9d2c0, 0.2, 0.5);
  for (let i = -1; i <= 1; i++) { const k = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.22, 6), c); k.rotation.x = -Math.PI / 2 - 0.15; k.position.set(i * 0.03, 0, -0.14); g.add(k); }
  info.kind = 'claws'; info.grip.set(0, 0, 0); info.support.set(0, 0, 0); info.adsY = -0.05; info.length = 0.25;
  info.muzzle.position.set(0, 0, -0.26); g.add(info.muzzle); info.noHands = false; return info;
}
