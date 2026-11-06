import * as THREE from 'three';
import { OPEN_TY, seatPos } from '/shared/vehSeats.js';
// VEÍCULOS (visual): o servidor dirige; aqui só se desenha, suavizando entre os pacotes. Frente do modelo = -Z (igual ao jogador).
const COLORS = [0xd9412f, 0x2f6fd9, 0xe0b020, 0xeeeeee, 0x2a2a2e, 0x2fa05a];
const lam = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.35, ...o });
let shared = null, beamG = null; const BEAM = () => (beamG ||= new THREE.ConeGeometry(2.1, 12, 14, 1, true));
const HPK = [1, 1.25, 0.85, 1.1, 1.15, 1.4, 0.8, 1.35];
function geos() {
  return shared ||= {
    body: new THREE.BoxGeometry(2.0, 0.62, 4.2), cab: new THREE.BoxGeometry(1.7, 0.56, 2.1), glass: new THREE.BoxGeometry(1.74, 0.4, 2.14),
    wheel: new THREE.CylinderGeometry(0.4, 0.4, 0.3, 14), lamp: new THREE.BoxGeometry(0.4, 0.16, 0.08), bump: new THREE.BoxGeometry(2.05, 0.16, 0.2),
    rim: new THREE.CylinderGeometry(0.22, 0.22, 0.32, 10), rimM: lam(0xb8bec6, { roughness: 0.3, metalness: 0.9 }), mirror: new THREE.BoxGeometry(0.12, 0.1, 0.2), tyre: lam(0x15171a, { roughness: 0.9, metalness: 0.05 }), glassM: lam(0x1b2a38, { roughness: 0.15, metalness: 0.8 }), head: new THREE.MeshBasicMaterial({ color: 0xfff2c0 }), tail: new THREE.MeshBasicMaterial({ color: 0xff2a2a }), wreck: lam(0x1a1a1c, { roughness: 1, metalness: 0.1 })
  };
}
// perfis laterais [z,y] (frente = -Z) extrudados na largura: cada tipo de carro tem silhueta própria
const TYPES = [
  { n: 'Sedã', tub: [[-2.1, .4], [-2.12, .8], [-1.0, .95], [1.4, .95], [2.1, .88], [2.1, .4]], cab: [[-.95, .95], [-.4, 1.5], [1.0, 1.5], [1.6, .95]], cw: 1.7 },
  { n: 'SUV', tub: [[-2.1, .5], [-2.12, 1.0], [-1.1, 1.08], [2.1, 1.08], [2.1, .5]], cab: [[-1.0, 1.08], [-.7, 1.8], [1.95, 1.8], [2.05, 1.08]], cw: 1.84, rack: 1 },
  { n: 'Esportivo', tub: [[-2.1, .34], [-2.12, .62], [-.9, .78], [1.5, .86], [2.1, .8], [2.1, .34]], cab: [[-.35, .8], [.3, 1.2], [1.1, 1.2], [1.65, .84]], cw: 1.5, spoiler: 1, wide: 1.1 },
  { n: 'Picape', tub: [[-2.1, .5], [-2.12, 1.0], [-.8, 1.1], [2.1, 1.1], [2.1, .5]], cab: [[-.85, 1.1], [-.55, 1.72], [.45, 1.72], [.75, 1.1]], cw: 1.78, bed: 1 },
  { n: 'Jipe', tub: [[-2.0, .5], [-2.0, .95], [2.0, .95], [2.0, .5]], cab: null, open: { hood: .95, side: .8, deck: .9 }, roll: 1, spare: 1, big: 1.12 },
  { n: 'Van', tub: [[-2.1, .42], [-2.12, .95], [-1.55, 1.25], [2.1, 1.25], [2.1, .42]], cab: [[-1.5, 1.25], [-1.25, 2.15], [2.0, 2.15], [2.1, 1.25]], cw: 1.9 },
  { n: 'Buggy', tub: [[-2.0, .45], [-2.0, .7], [2.0, .7], [2.0, .45]], cab: null, open: { hood: .7, side: .56, deck: .8 }, cage: 1, big: 1.22 },
  { n: 'Militar', tub: [[-2.0, .5], [-2.0, 1.0], [2.0, 1.0], [2.0, .5]], cab: null, open: { hood: 1.0, side: .9, deck: .95 }, roll: 1, spare: 1, big: 1.2, mil: 1 }
];
function ext(pts, w, mat, dx = 0) {
  const sh = new THREE.Shape(); pts.forEach(([z, y], i) => (i ? sh.lineTo(z, y) : sh.moveTo(z, y))); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); geo.rotateY(-Math.PI / 2); geo.translate(w / 2 + dx, 0, 0);
  const m = new THREE.Mesh(geo, mat); return m;
}
const bx = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
// carro ABERTO (jipe/buggy/militar): capô + traseira + laterais baixas + bancos de verdade; dá para ver (e acertar) quem está dentro
function openBody(T, W, paint, dark, G) {
  const O = T.open, hood = bx(W, O.hood - 0.4, 1.35, paint, 0, 0.4 + (O.hood - 0.4) / 2, -1.33), deck = bx(W, O.deck - 0.4, 0.95, paint, 0, 0.4 + (O.deck - 0.4) / 2, 1.62);
    return { tub: hood, cab: deck };
}
function openExtras(g, T, paint, dark, G) {
  const O = T.open, seatM = lam(0x3b2f26, { roughness: 0.9, metalness: 0.05 });
  g.add(bx(W2(T) - 0.08, 0.1, 2.5, dark, 0, 0.36, 0.47));                                   // assoalho
  for (const x of [-1, 1]) g.add(bx(0.09, O.side - 0.4, 2.45, paint, x * (W2(T) / 2 - 0.045), 0.4 + (O.side - 0.4) / 2, 0.47));   // laterais baixas
  for (let i = 0; i < 4; i++) { const p = seatPos({ x: 0, y: 0, z: 0, yaw: 0, ty: T.n === 'Jipe' ? 4 : T.n === 'Buggy' ? 6 : 7 }, i); g.add(bx(0.5, 0.12, 0.46, seatM, p.x, p.y - 0.04, p.z + 0.1)); g.add(bx(0.5, 0.46, 0.09, seatM, p.x, p.y + 0.3, p.z + 0.36)); }   // bancos
  g.add(bx(1.8, 0.2, 0.26, dark, 0, O.hood + 0.02, -0.74));                                // painel
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 6, 14), dark); sw.position.set(-0.45, O.hood + 0.14, -0.58); sw.rotation.x = 1.0; g.add(sw);   // volante
  const bar = (len, x, y, z, rx = 0, rz = 0) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 6), dark); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); g.add(m); };
  if (T.roll || T.cage) {                                                                  // santo-antônio (arco de proteção) atrás dos bancos da frente + barra superior
    const top = T.cage ? 1.95 : 2.0, z0 = T.cage ? 0.42 : 0.45;
    for (const x of [-0.9, 0.9]) bar(top - O.side, x, (top + O.side) / 2, z0);
    bar(1.8, 0, top, z0, 0, Math.PI / 2);
    if (T.cage) { for (const x of [-0.9, 0.9]) { bar(1.55, x, 1.45, -0.7, 0.55); bar(1.2, x, (O.hood + 1.5) / 2, -0.52); } bar(1.8, 0, 1.55, -0.95, 0, Math.PI / 2); bar(1.8, 0, 1.45, 1.4, 0, Math.PI / 2); for (const x of [-0.9, 0.9]) bar(1.5, x, 1.15, 1.4); }
    else { const ws = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.46, 0.05), G.glassM); ws.position.set(0, O.hood + 0.28, -0.72); ws.rotation.x = -0.3; g.add(ws); for (const x of [-0.9, 0.9]) bar(0.5, x, O.hood + 0.26, -0.72, -0.3); }
  }
  if (T.mil) { const star = bx(0.5, 0.01, 0.5, lam(0xeeeeee), 0, O.hood + 0.005, -1.5); star.rotation.y = Math.PI / 4; g.add(star); g.add(bx(0.5, 0.02, 0.08, lam(0xeeeeee), 0, O.hood + 0.006, -1.5)); bar(1.0, 0.95, 1.05, 1.62); g.add(bx(0.3, 0.2, 0.5, dark, -0.5, O.deck + 0.12, 1.75)); }   // estrela e caixote
}
const W2 = (T) => (T.big ? 2.05 : 1.98);
function build(ci, ty = 0) {
  const G = geos(), T = TYPES[ty % TYPES.length], g = new THREE.Group(), paint = lam(T.mil ? 0x4f5d2f : COLORS[ci % COLORS.length], { roughness: T.mil ? 0.8 : 0.38, metalness: T.mil ? 0.15 : 0.55 }), dark = lam(0x20242a, { roughness: 0.6, metalness: 0.4 });
  const W = T.big ? 2.05 : 1.98;
  let tub, cab = null;
  if (T.open) ({ tub, cab } = openBody(T, W, paint, dark, G)); else { tub = ext(T.tub, W, paint); g.add(tub); }
  if (T.open) { g.add(tub, cab); openExtras(g, T, paint, dark, G); }
  else if (T.cab) { cab = ext(T.cab, T.cw, paint); g.add(cab); const gl = ext(T.cab.map(([z, y]) => [z * 0.98, y * 0.985 + 0.01]), T.cw + 0.03, G.glassM); gl.scale.set(1, 0.74, 1); gl.position.y = T.cab[0][1] * 0.26 + 0.04; g.add(gl); }
  else if (!T.open) { const ws = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.06), G.glassM); ws.position.set(0, 1.35, -0.55); ws.rotation.x = -0.25; g.add(ws); }
  const top = T.cab ? Math.max(...T.cab.map((p) => p[1])) : 1.1;
  if (T.rack) for (const z of [-0.2, 0.7, 1.5]) { const r = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 0.07), dark); r.position.set(0, top + 0.06, z); g.add(r); }
  if (T.spoiler) { const sp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.38), dark); sp.position.set(0, 1.12, 1.95); g.add(sp); for (const x of [-0.6, 0.6]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.12), dark); l.position.set(x, 0.96, 1.95); g.add(l); } }
  if (T.bed) { const bw = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.38, 0.06), paint); bw.position.set(0, 1.28, 2.06); g.add(bw); for (const x of [-0.96, 0.96]) { const sd = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 1.3), paint); sd.position.set(x, 1.28, 1.44); g.add(sd); } const fl = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.05, 1.3), dark); fl.position.set(0, 1.11, 1.44); g.add(fl); }
  if (T.roll && !T.open) { for (const x of [-0.85, 0.85]) { const rb = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.95, 8), dark); rb.position.set(x, 1.55, 0.3); g.add(rb); const fr = rb.clone(); fr.position.set(x, 1.45, -0.72); fr.scale.y = .8; g.add(fr); } const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8), dark); bar.rotation.z = Math.PI / 2; bar.position.set(0, 2.02, 0.3); g.add(bar); for (const x of [-0.5, 0.5]) { const sd = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), dark); sd.position.set(x, 1.15, 0.5); g.add(sd); } }
  if (T.spare) { const sw = new THREE.Mesh(G.wheel, G.tyre); sw.rotation.x = Math.PI / 2; sw.scale.setScalar(1.15); sw.position.set(0, 0.95, 2.18); g.add(sw); }
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 0.05), dark); grille.position.set(0, T.tub[1][1] - 0.22, T.tub[0][0] - 0.03); g.add(grille);
  const wheels = [], wr = (T.big || 1) * (T.wide || 1), zf = -1.38, zr = 1.38;
  for (const [x, z] of [[-1.0, zf], [1.0, zf], [-1.0, zr], [1.0, zr]]) { const w = new THREE.Mesh(G.wheel, G.tyre); w.rotation.z = Math.PI / 2; w.scale.set(wr, 1, wr); const rim = new THREE.Mesh(G.rim, G.rimM); rim.rotation.z = Math.PI / 2; rim.position.x = x > 0 ? 0.04 : -0.04; const pv = new THREE.Group(); pv.position.set(x, 0.4 * wr, z); pv.add(w, rim); g.add(pv); wheels.push(w); }
  const lampY = T.tub[1][1] - 0.2;
  for (const x of [-0.7, 0.7]) { const h = new THREE.Mesh(G.lamp, G.head); h.position.set(x, lampY, T.tub[0][0] - 0.02); g.add(h); const t = new THREE.Mesh(G.lamp, G.tail); t.position.set(x, lampY, 2.1); g.add(t); const mr = new THREE.Mesh(G.mirror, paint); mr.position.set(x > 0 ? 1.02 : -1.02, top > 1.4 ? 1.2 : 1.05, -0.55); if (T.cab) g.add(mr); }
  const bm = new THREE.Mesh(G.bump, dark); bm.position.set(0, 0.42, T.tub[0][0] - 0.02); g.add(bm); const bm2 = bm.clone(); bm2.position.z = 2.1; g.add(bm2);
  const beams = []; for (const x of [-0.7, 0.7]) { const bm = new THREE.Mesh(BEAM(), new THREE.MeshBasicMaterial({ color: 0xfff1c0, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })); bm.rotation.x = Math.PI / 2; bm.position.set(x, lampY, T.tub[0][0] - 6.1); bm.visible = false; bm.userData.beam = 1; g.add(bm); beams.push(bm); }
  const cab2 = cab || tub; g.userData = { body: tub, cab: cab2, wheels, paint, extra: [], beams };
  g.traverse((o) => { if (o.isMesh) { o.castShadow = !beams.includes(o); } });   // o cone do farol é só brilho: não projeta sombra
  return g;
}
   // o catálogo de veículos (ui/vehicleCatalog.js) usa os mesmos modelos

export { OPEN_TY, build as buildCar, TYPES as CAR_TYPES, HPK as CAR_HPK };   // modelos dos carros (cópia do jogo, sem o som e sem a classe que anima)
