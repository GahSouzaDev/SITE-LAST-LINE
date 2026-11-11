import * as THREE from 'three';
// OTIMIZADOR DE ARMAS: as peças fixas da arma (corpo, cano, trilhos, coronha...) viram UMA malha por material (mesmo material = skins continuam trocando normal).
// Ficam soltas só as peças que se mexem (userData.role: tambor, ferrolho, bomba, alavanca...) e os efeitos. A luneta (userData.hide) funde dentro do próprio grupo, então esconder a luneta na mira continua funcionando.
export const WEAPON_OPT = { on: true };
export function mergeStatic(root, hosts = []) {   // hosts: outros grupos que fundem as próprias peças (roda que gira, torre, cano...)
  root.updateMatrixWorld(true);
  const dyn = (o) => { for (let a = o; a && a !== root; a = a.parent) if (a.userData.role || a.userData.fx || a.userData.keep || a.visible === false) return true; return false; };
  const hide = root.userData.hide, hostSet = new Set(hosts), buckets = new Map(), meshes = [];
  root.traverse((o) => { if (o.isMesh) meshes.push(o); });
  const invs = new Map(); const invOf = (h) => { let m = invs.get(h); if (!m) invs.set(h, m = new THREE.Matrix4().copy(h.matrixWorld).invert()); return m; };
  for (const o of meshes) {
    if (dyn(o) || Array.isArray(o.material) || o.children.length || !o.material) continue;
    let host = root; for (let a = o.parent; a && a !== root; a = a.parent) if (a === hide || hostSet.has(a)) { host = a; break; }
    const k = host.id + '|' + o.material.uuid + '|' + (o.renderOrder | 0);
    const e = buckets.get(k) || buckets.set(k, { host, mat: o.material, g: [], o: [], ro: o.renderOrder }).get(k); e.g.push({ g: o.geometry, m: new THREE.Matrix4().multiplyMatrices(invOf(host), o.matrixWorld) }); e.o.push(o);
  }
  for (const e of buckets.values()) {
    const mg = bake(e.g); if (!mg) continue;
    const sm = new THREE.Mesh(mg, e.mat); sm.castShadow = sm.receiveShadow = true; sm.renderOrder = e.ro; e.o.forEach((o) => o.parent.remove(o)); e.host.add(sm);
  }
}
// funde as geometrias direto nos vetores finais (posição e normal já transformadas, índice com a mão certa) — sem clonar nem mesclar uma por uma
function bake(items) {
  let V = 0, I = 0; for (const it of items) { const g = it.g; V += g.attributes.position.count; I += g.index ? g.index.count : g.attributes.position.count; }
  if (!V) return null;
  const P = new Float32Array(V * 3), N = new Float32Array(V * 3), U = new Float32Array(V * 2), IX = V > 65535 ? new Uint32Array(I) : new Uint16Array(I), nm = new THREE.Matrix3(); let vo = 0, io = 0;
  for (const it of items) {
    const g = it.g, pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv, n = pa.count, m = it.m.elements, ne = nm.getNormalMatrix(it.m).elements;
    for (let i = 0; i < n; i++) {
      const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), o = vo + i, p = o * 3;
      P[p] = m[0] * x + m[4] * y + m[8] * z + m[12]; P[p + 1] = m[1] * x + m[5] * y + m[9] * z + m[13]; P[p + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      if (na) { const a = na.getX(i), b = na.getY(i), c = na.getZ(i); let X = ne[0] * a + ne[3] * b + ne[6] * c, Y = ne[1] * a + ne[4] * b + ne[7] * c, Z = ne[2] * a + ne[5] * b + ne[8] * c; const l = Math.hypot(X, Y, Z) || 1; N[p] = X / l; N[p + 1] = Y / l; N[p + 2] = Z / l; }
      if (ua) { U[o * 2] = ua.getX(i); U[o * 2 + 1] = ua.getY(i); }
    }
    const ix = g.index, cnt = ix ? ix.count : n, flip = it.m.determinant() < 0;
    for (let k = 0; k < cnt; k += 3) { const a = ix ? ix.getX(k) : k; let b = ix ? ix.getX(k + 1) : k + 1, c = ix ? ix.getX(k + 2) : k + 2; if (flip) { const t = b; b = c; c = t; } IX[io++] = a + vo; IX[io++] = b + vo; IX[io++] = c + vo; }
    vo += n;
  }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(P, 3)); mg.setAttribute('normal', new THREE.BufferAttribute(N, 3)); mg.setAttribute('uv', new THREE.BufferAttribute(U, 2)); mg.setIndex(new THREE.BufferAttribute(IX, 1)); return mg;
}
