import * as THREE from 'three';
// MOTOS do jogo (lambreta, trilha, esportiva e cruiser): modelos baixos em polígonos, feitos com caixas e cilindros (mesmo estilo dos carros), UM grupo por moto.
// Eixo: frente = -Z, direita = +X. A roda da frente e o guidão ficam no mesmo PIVÔ (userData.steers) — ele gira com a direção; a moto INCLINA inteira (rotation.z = roll vindo do servidor).
// Recebe de vehFx.js os ajudantes (X) para usar os mesmos materiais/luzes/brilhos/poças dos carros e entrar no mesmo sistema (faróis, freio, ré, poeira, sombra).
export const BIKES = {
  14: { n: 'Lambreta', k: 'Scooter', r: 0.21, wb: 1.12, seat: 0.78, wid: 0.26 },
  15: { n: 'Trilheira', k: 'Moto de trilha', r: 0.37, wb: 1.38, seat: 1.02, wid: 0.2 },
  16: { n: 'Relâmpago', k: 'Esportiva', r: 0.31, wb: 1.42, seat: 0.83, wid: 0.22, fair: 1 },
  17: { n: 'Estradeira', k: 'Cruiser', r: 0.33, wb: 1.72, seat: 0.7, wid: 0.3 }
};
const COLS = { 14: [0xf2b8c6, 0x7ed6c9, 0xf6e27a, 0xb8c8f2], 15: [0xe8520a, 0x2a6adf, 0xf0f0f0, 0x2fbf4f], 16: [0xd7141a, 0x14315a, 0xf7f7f7, 0x7a2cd1], 17: [0x151515, 0x6a1010, 0x1a3a5a, 0x3a3a3a] };
export function buildBike(X, ty, ci) {
  const S = BIKES[ty], { lam, bx, G } = X, g = new THREE.Group(), cols = COLS[ty], paint = lam(cols[ci % cols.length], { roughness: ty === 16 ? 0.25 : 0.45, metalness: ty === 17 ? 0.7 : 0.4 }),
    dark = lam(0x1d2026, { roughness: 0.6, metalness: 0.4 }), chrome = lam(0xc9d0d8, { roughness: 0.2, metalness: 0.9 }), seatM = lam(ty === 17 ? 0x3a2a1c : 0x15171a, { roughness: 0.85 }),
    head = new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xfff2c0, emissiveIntensity: 0.12, roughness: 0.2, metalness: 0.1 }), tail = new THREE.MeshStandardMaterial({ color: 0x7a0c0c, emissive: 0xff1a1a, emissiveIntensity: 0.25, roughness: 0.3 }), rev = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.3 });
  const r = S.r, wb = S.wb, zF = -wb / 2, zR = wb / 2, fat = ty === 17 ? 1.4 : ty === 15 ? 0.85 : 1, sp = [], steers = [];
  // ---- roda: pneu + aro + cubo (gira em torno de X); a da frente fica no pivô de direção
  const wheel = (z, front) => { const sg = new THREE.Group(), w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.14 * fat + (front ? 0 : 0.03 * fat), 14), G.tyre); w.rotation.z = Math.PI / 2; sg.add(w); const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.62, r * 0.62, 0.15 * fat + 0.03, 10), G.rimM); rim.rotation.z = Math.PI / 2; sg.add(rim);
    if (ty === 15) for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, t = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 0.07), G.tyre); t.position.set(0, Math.cos(a) * (r + 0.015), Math.sin(a) * (r + 0.015)); t.rotation.x = -a; sg.add(t); }   // pneu de barro
    for (let k = 0; k < 3; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, r * 1.1, 0.04), G.rimM); s.rotation.x = k * Math.PI / 3; sg.add(s); }
    sp.push(sg); const pv = new THREE.Group(); pv.position.set(0, r, z); pv.add(sg); return pv; };
  const fw = wheel(zF, true), rw = wheel(zR, false); steers.push(fw); g.add(rw);
  // ---- garfo + guidão (no pivô da roda da frente: giram juntos); o pivô fica na altura do eixo, então os pontos de cima são relativos a ele
  const fh = ty === 15 ? 0.95 : ty === 14 ? 0.78 : 0.8, bars = (w, y, z) => { fw.add(bx(w, 0.045, 0.045, ty === 16 ? dark : chrome, 0, y, z)); for (const sd of [-1, 1]) fw.add(bx(0.07, 0.07, 0.1, dark, sd * w / 2, y, z)); };
  for (const sd of [-1, 1]) { const f = bx(0.04, fh, 0.04, ty === 14 ? paint : chrome, sd * 0.09 * fat, fh / 2, 0.12 * fh); f.rotation.x = -0.32; fw.add(f); }
  fw.add(bx(0.24 * fat + 0.1, 0.06, 0.1, dark, 0, fh * 0.98, 0.1 * fh));                                                          // mesa do garfo
  if (ty === 14) { bars(0.62, fh + 0.18, 0.12); const sh = bx(0.5, 0.62, 0.07, paint, 0, 0.55, 0.13); sh.rotation.x = -0.28; fw.add(sh); fw.add(bx(0.34, 0.3, 0.22, paint, 0, fh + 0.05, 0.02)); }   // lambreta: escudo frontal e farol no carenado
  else if (ty === 15) { bars(0.82, fh + 0.2, 0.13); fw.add(bx(0.2, 0.2, 0.06, dark, 0, fh + 0.06, -0.1)); fw.add(bx(0.4, 0.12, 0.05, paint, 0, r + 0.14, -0.06)); }   // trilha: guidão alto, número na frente e paralama alto
  else if (ty === 16) { bars(0.5, fh + 0.06, 0.05); const fr = bx(0.46, 0.5, 0.62, paint, 0, fh * 0.62, -0.1); fr.rotation.x = 0.2; fw.add(fr); const ws = bx(0.4, 0.3, 0.04, X.G.glassM, 0, fh + 0.22, -0.26); ws.rotation.x = 0.7; fw.add(ws); }
  else { bars(0.98, fh + 0.28, 0.2); fw.add(bx(0.28, 0.3, 0.26, chrome, 0, fh + 0.0, -0.2)); for (const sd of [-1, 1]) fw.add(bx(0.03, 0.46, 0.03, chrome, sd * 0.38, fh + 0.1, 0.2)); }   // cruiser: guidão largo "ape hanger" e farol redondo grande
  // ---- quadro, motor, tanque, banco, escapamento
  const body = (w, h, d, m, x, y, z) => { const b = bx(w, h, d, m, x, y, z); g.add(b); return b; };
  if (ty === 14) {   // lambreta: piso baixo, tampa traseira arredondada, banco corrido
    body(0.34, 0.1, 0.78, paint, 0, r + 0.1, 0.05); body(0.5, 0.42, 0.62, paint, 0, r + 0.36, zR - 0.12); body(0.36, 0.1, 0.62, seatM, 0, r + 0.6, zR - 0.1); body(0.24, 0.5, 0.1, paint, 0, r + 0.28, zF + 0.2);
  } else if (ty === 15) {   // trilha: quadro fino, tanque curto, banco estreito, escapamento alto
    body(0.22, 0.24, 0.62, paint, 0, r + 0.62, -0.1); body(0.2, 0.08, 0.9, seatM, 0, r + 0.78, 0.38); body(0.2, 0.3, 0.46, dark, 0, r + 0.32, 0.0); const ex = bx(0.07, 0.07, 0.9, chrome, 0.16, r + 0.5, 0.3); ex.rotation.x = -0.22; g.add(ex); body(0.14, 0.05, 0.5, paint, 0, r + 0.78, zR + 0.12);
  } else if (ty === 16) {   // esportiva: carenagem completa, rabeta, escapamento sob o banco
    body(0.42, 0.42, 1.05, paint, 0, r + 0.3, -0.12); body(0.3, 0.08, 0.5, seatM, 0, r + 0.58, 0.3); const tl = body(0.24, 0.22, 0.6, paint, 0, r + 0.5, zR - 0.02); tl.rotation.x = -0.18; body(0.14, 0.14, 0.7, chrome, 0.2, r + 0.1, 0.25); body(0.3, 0.2, 0.34, dark, 0, r + 0.12, 0.0);
  } else {   // cruiser: tanque em gota, banco baixo com encosto, escapamentos cromados longos
    body(0.3, 0.26, 0.62, paint, 0, r + 0.5, -0.32); body(0.34, 0.1, 0.55, seatM, 0, r + 0.5, 0.2); body(0.3, 0.2, 0.26, seatM, 0, r + 0.6, 0.62); body(0.34, 0.32, 0.46, dark, 0, r + 0.22, 0.0); for (const sd of [-1, 1]) body(0.07, 0.07, 1.15, chrome, sd * 0.2, r + 0.1, 0.35);
    body(0.9, 0.06, 0.26, paint, 0, r + 0.34, zR + 0.05);
  }
  // paralama traseiro, luzes e placa
  body(0.22 * fat + 0.06, 0.05, 0.42, paint, 0, r + 0.26 + (ty === 15 ? 0.1 : 0), zR + 0.28);
  const lampY = r + 0.3; g.add(bx(0.2, 0.12, 0.05, head, 0, fh * 0.88 + r * 0.0 + 0.1, zF - 0.14 + 0.0)); g.add(bx(0.18, 0.09, 0.05, tail, 0, lampY + 0.06, zR + 0.5)); g.add(bx(0.07, 0.05, 0.04, rev, 0.1, lampY - 0.02, zR + 0.5)); g.add(bx(0.2, 0.1, 0.02, lam(0xeeeeee, { roughness: 0.6 }), 0, lampY - 0.05, zR + 0.53));
  // caixa/passageiro: apoio de pés e alças
  for (const sd of [-1, 1]) { g.add(bx(0.06, 0.04, 0.26, dark, sd * 0.2, r + 0.14, 0.14)); g.add(bx(0.06, 0.04, 0.2, dark, sd * 0.2, r + 0.2, 0.62)); }
  // ---- luz: brilho redondo nas lanternas + mancha de luz no chão (mesmo mecanismo dos carros: 8 vértices coloridos)
  const gp = new Float32Array(8 * 3), gc = new Float32Array(8 * 4), gg = new THREE.BufferGeometry(), hy = r + fh * 0.88 + 0.1 - r * 0, lp = [[0, hy, zF - 0.14], [0, hy, zF - 0.14], [0, lampY + 0.06, zR + 0.52], [0, lampY + 0.06, zR + 0.52], [0.1, lampY - 0.02, zR + 0.52], [-0.1, lampY - 0.02, zR + 0.52], [0, hy - 0.08, zF - 0.14], [0, hy - 0.08, zF - 0.14]];
  lp.forEach((p, i) => gp.set(p, i * 3)); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); gg.setAttribute('color', new THREE.BufferAttribute(gc, 4));
  const glow = new THREE.Points(gg, new THREE.PointsMaterial({ size: 0.9, map: X.glowTex(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); glow.frustumCulled = false; g.add(glow);
  const lp2 = X.lightPool(), pool = new THREE.Mesh(lp2.geo, lp2.mat); pool.position.set(0, 0.07, zF - 5.2); pool.scale.set(0.7, 1, 1); pool.visible = false; pool.frustumCulled = false; pool.renderOrder = 2; g.add(pool);
  g.add(fw);
  g.userData = { wb: wb / 2, wx: 0.05, wheels: [], spins: sp, steers, paint, extra: [], beams: [pool], mats: { head, tail, rev }, glow, pool, zF, rz: zR + 0.5, lampY: hy, bike: ty };
  const pm = []; g.traverse((o) => { if (o.isMesh && o.material === paint) pm.push(o); }); g.userData.body = g.userData.cab = pm[0] || fw;
  const casters = []; g.traverse((o) => { if (o.isMesh) { o.castShadow = o !== pool; if (o !== pool) casters.push(o); } }); g.userData.casters = casters;
  return g;
}
