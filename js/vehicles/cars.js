import * as THREE from 'three';
import { OPEN_TY, seatPos, VEH_NITRO, VEH_SPEED } from '/shared/vehSeats.js';
import { fxFor, glowTex, lightPool } from '../effects/particles.js';
import { mergeStatic } from '../weapons/weaponOpt.js';
// VEÍCULOS (visual): o servidor dirige; aqui só se desenha, suavizando entre os pacotes. Frente do modelo = -Z (igual ao jogador).
const COLORS = [0xd9412f, 0x2f6fd9, 0xe0b020, 0xeeeeee, 0x2a2a2e, 0x2fa05a];
const lam = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.35, ...o });
let shared = null, beamG = null; const BEAM = () => (beamG ||= new THREE.ConeGeometry(2.1, 12, 14, 1, true));
const HPK = [1, 1.25, 0.85, 1.1, 1.15, 1.4, 0.8, 1.35, 1.0, 1.3, 1.5, 3.0, 1.0];   // vida de cada tipo (Caveirão = blindado)
function geos() {
  return shared ||= {
    body: new THREE.BoxGeometry(2.0, 0.62, 4.2), cab: new THREE.BoxGeometry(1.7, 0.56, 2.1), glass: new THREE.BoxGeometry(1.74, 0.4, 2.14),
    wheel: new THREE.CylinderGeometry(0.4, 0.4, 0.3, 14), lamp: new THREE.BoxGeometry(0.4, 0.16, 0.08), bump: new THREE.BoxGeometry(2.05, 0.16, 0.2),
    rim: new THREE.CylinderGeometry(0.22, 0.22, 0.32, 10), rimM: lam(0xb8bec6, { roughness: 0.3, metalness: 0.9 }), mirror: new THREE.BoxGeometry(0.12, 0.1, 0.2), tyre: lam(0x15171a, { roughness: 0.9, metalness: 0.05 }), glassM: lam(0x1b2a38, { roughness: 0.15, metalness: 0.8 }), head: new THREE.MeshBasicMaterial({ color: 0xfff2c0 }), tail: new THREE.MeshBasicMaterial({ color: 0xff2a2a }), wreck: lam(0x1a1a1c, { roughness: 1, metalness: 0.1 })
  };
}
// perfis laterais [z,y] (frente = -Z) extrudados na largura: cada tipo de carro tem silhueta própria
const TYPES = [
  { n: 'Corisco', k: 'Sedã', tub: [[-2.1, .4], [-2.12, .8], [-1.0, .95], [1.4, .95], [2.1, .88], [2.1, .4]], cab: [[-.95, .95], [-.4, 1.5], [1.0, 1.5], [1.6, .95]], cw: 1.7 },
  { n: 'Tracajá', k: 'SUV', tub: [[-2.1, .5], [-2.12, 1.0], [-1.1, 1.08], [2.1, 1.08], [2.1, .5]], cab: [[-1.0, 1.08], [-.7, 1.8], [1.95, 1.8], [2.05, 1.08]], cw: 1.84, rack: 1, off: 1 },
  { n: 'Escorpião', k: 'Esportivo', tub: [[-2.1, .34], [-2.12, .62], [-.9, .78], [1.5, .86], [2.1, .8], [2.1, .34]], cab: [[-.35, .8], [.3, 1.2], [1.1, 1.2], [1.65, .84]], cw: 1.5, spoiler: 1, wide: 1.1 },
  { n: 'Roceira', k: 'Picape', tub: [[-2.1, .5], [-2.12, 1.0], [-.8, 1.1], [2.1, 1.1], [2.1, .5]], cab: [[-.85, 1.1], [-.55, 1.72], [.45, 1.72], [.75, 1.1]], cw: 1.78, bed: 1, off: 1 },
  { n: 'Trilheiro', k: 'Jipe', tub: [[-2.0, .5], [-2.0, .95], [2.0, .95], [2.0, .5]], cab: null, open: { hood: .95, side: .8, deck: .9 }, roll: 1, spare: 1, big: 1.12 },
  { n: 'Perua', k: 'Van', tub: [[-2.1, .42], [-2.12, .95], [-1.55, 1.25], [2.1, 1.25], [2.1, .42]], cab: [[-1.5, 1.25], [-1.25, 2.15], [2.0, 2.15], [2.1, 1.25]], cw: 1.9 },
  { n: 'Duna', k: 'Buggy', tub: [[-2.0, .45], [-2.0, .7], [2.0, .7], [2.0, .45]], cab: null, open: { hood: .7, side: .56, deck: .8 }, cage: 1, big: 1.22 },
  { n: 'Tatu', k: 'Militar', tub: [[-2.0, .5], [-2.0, 1.0], [2.0, 1.0], [2.0, .5]], cab: null, open: { hood: 1.0, side: .9, deck: .95 }, roll: 1, spare: 1, big: 1.2, mil: 1 },
  // NOVOS
  { n: 'Astronave', k: 'Hatch esportivo', tub: [[-2.05, .4], [-2.08, .74], [-1.1, .88], [1.3, .9], [2.05, .84], [2.05, .4]], cab: [[-.9, .88], [-.3, 1.4], [1.0, 1.4], [1.8, .9]], cw: 1.64, spoiler: 1, fixed: 0xc3c9d1, silver: 1, wide: 1.04 },
  { n: 'Bicho', k: 'Sedã de luxo', tub: [[-2.4, .42], [-2.43, .9], [-1.3, 1.02], [1.7, 1.02], [2.4, .98], [2.4, .42]], cab: [[-1.05, 1.02], [-.5, 1.6], [1.2, 1.6], [1.9, 1.02]], cw: 1.8, fixed: 0x0a0a0c, lux: 1, wb: 1.62, W: 2.06 },
  { n: 'Van Umbra', k: 'Van UMBRA', tub: [[-2.45, .45], [-2.48, 1.05], [-1.9, 1.35], [2.45, 1.35], [2.45, .45]], cab: [[-1.85, 1.35], [-1.5, 2.35], [2.35, 2.35], [2.45, 1.35]], cw: 2.0, fixed: 0x0b0e0d, umbra: 1, wb: 1.65, W: 2.1 },
  { n: 'Caveirão', k: 'Blindado', tub: [[-2.3, .55], [-2.3, 1.45], [2.3, 1.45], [2.3, .55]], cab: [[-1.6, 1.45], [-1.3, 2.2], [1.7, 2.2], [2.1, 1.45]], cw: 2.0, fixed: 0x161c24, armor: 1, big: 1.3, wb: 1.55, W: 2.16, off: 1 },
  { n: 'OGBB', k: 'Lenda', tub: [[-1.95, .42], [-1.97, .8], [-1.2, .9], [1.15, .9], [1.95, .8], [1.95, .42]], cab: [[-.85, .9], [-.4, 1.42], [1.0, 1.42], [1.55, .9]], cw: 1.56, fixed: 0xf6f8fa, ogbb: 1, spoiler: 1 }
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
const POOLM = () => lightPool(), GLOWT = glowTex;
let poolGeo = null, poolMat = null;
const spokeGeo = new THREE.BoxGeometry(0.035, 0.36, 0.07), treadGeo = new THREE.BoxGeometry(0.3, 0.1, 0.12), treadRoad = new THREE.BoxGeometry(0.27, 0.035, 0.14), archGeo = new THREE.TorusGeometry(0.5, 0.045, 5, 14, Math.PI), hubGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.36, 8);
function build(ci, ty = 0) {
  const G = geos(), T = TYPES[ty % TYPES.length], g = new THREE.Group(), paint = lam(T.fixed ?? (T.mil ? 0x4f5d2f : COLORS[ci % COLORS.length]), { roughness: T.mil ? 0.8 : T.armor ? 0.7 : T.ogbb ? 0.55 : T.silver ? 0.3 : T.lux ? 0.2 : 0.32, metalness: T.mil ? 0.15 : T.armor ? 0.3 : T.ogbb ? 0.05 : T.silver ? 0.6 : T.lux ? 0.7 : 0.6 }), dark = lam(0x20242a, { roughness: 0.6, metalness: 0.4 }), chrome = lam(0xc9d0d8, { roughness: 0.2, metalness: 0.95 });
  const head = new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xfff2c0, emissiveIntensity: 0.12, roughness: 0.2, metalness: 0.1 }), tail = new THREE.MeshStandardMaterial({ color: 0x7a0c0c, emissive: 0xff1a1a, emissiveIntensity: 0.25, roughness: 0.3 }), rev = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.3 }), plate = lam(0xeeeeee, { roughness: 0.6, metalness: 0.1 }), red = lam(0xc02020, { roughness: 0.4 });
  const W = T.W || (T.big ? 2.05 : 1.98);
  let tub, cab = null;
  if (T.open) ({ tub, cab } = openBody(T, W, paint, dark, G)); else { tub = ext(T.tub, W, paint); g.add(tub); }
  if (T.open) { g.add(tub, cab); openExtras(g, T, paint, dark, G); }
  else if (T.cab) { cab = ext(T.cab, T.cw, paint); g.add(cab); if (!T.armor) { const gl = ext(T.cab.map(([z, y]) => [z * 0.98, y * 0.985 + 0.01]), T.cw + 0.03, G.glassM); gl.scale.set(1, 0.74, 1); gl.position.y = T.cab[0][1] * 0.26 + 0.04; g.add(gl);
      const wsM = (G.wsM ||= new THREE.MeshStandardMaterial({ color: 0x3a5d78, roughness: 0.08, metalness: 0.65, side: THREE.DoubleSide })), n = T.cab.length;   // PARA-BRISA e VIDRO TRASEIRO: uma placa de vidro em cada face inclinada da cabine (antes ficavam escondidos dentro da lataria)
      for (const [i0, i1] of [[0, 1], [n - 2, n - 1]]) { const [z0, y0] = T.cab[i0], [z1, y1] = T.cab[i1], dz = z1 - z0, dy = y1 - y0, L = Math.hypot(dz, dy) || 1, n3 = new THREE.Vector3(0, dz / L, -dy / L), pl = new THREE.Mesh(new THREE.PlaneGeometry(T.cw * 0.84, L * 0.78), wsM); pl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n3); pl.position.set(0, (y0 + y1) / 2 + n3.y * 0.016, (z0 + z1) / 2 + n3.z * 0.016); g.add(pl); } } }
  else if (!T.open) { const ws = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.06), G.glassM); ws.position.set(0, 1.35, -0.55); ws.rotation.x = -0.25; g.add(ws); }
  const top = T.cab ? Math.max(...T.cab.map((p) => p[1])) : 1.1;
  if (T.rack) for (const z of [-0.2, 0.7, 1.5]) g.add(bx(1.7, 0.05, 0.07, dark, 0, top + 0.06, z));
  if (T.spoiler) { g.add(bx(1.6, 0.06, 0.38, dark, 0, 1.12, 1.95)); for (const x of [-0.6, 0.6]) g.add(bx(0.06, 0.28, 0.12, dark, x, 0.96, 1.95)); }
  if (T.bed) { g.add(bx(1.9, 0.38, 0.06, paint, 0, 1.28, 2.06)); for (const x of [-0.96, 0.96]) g.add(bx(0.06, 0.38, 1.3, paint, x, 1.28, 1.44)); g.add(bx(1.86, 0.05, 1.3, dark, 0, 1.11, 1.44)); }
  if (T.roll && !T.open) { for (const x of [-0.85, 0.85]) { const rb = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.95, 8), dark); rb.position.set(x, 1.55, 0.3); g.add(rb); const fr = rb.clone(); fr.position.set(x, 1.45, -0.72); fr.scale.y = .8; g.add(fr); } const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8), dark); bar.rotation.z = Math.PI / 2; bar.position.set(0, 2.02, 0.3); g.add(bar); for (const x of [-0.5, 0.5]) g.add(bx(0.5, 0.18, 0.5, dark, x, 1.15, 0.5)); }
  if (T.spare) { const sw = new THREE.Mesh(G.wheel, G.tyre); sw.rotation.x = Math.PI / 2; sw.scale.setScalar(1.15); sw.position.set(0, 0.95, 2.18); g.add(sw); const hb = new THREE.Mesh(G.rim, G.rimM); hb.rotation.x = Math.PI / 2; hb.position.set(0, 0.95, 2.2); hb.scale.set(1.1, 0.6, 1.1); g.add(hb); }
  const zF = T.tub[0][0], zR = T.tub[T.tub.length - 1][0], lampY = T.tub[1][1] - 0.2, th = T.tub[1][1];
  g.add(bx(1.1, 0.18, 0.05, dark, 0, T.tub[1][1] - 0.22, zF - 0.03));
  for (let i = 0; i < 3; i++) g.add(bx(1.0, 0.018, 0.03, chrome, 0, T.tub[1][1] - 0.27 + i * 0.05, zF - 0.06));   // ripas da grade
  // ---- rodas: pivô (esterça) > grupo que GIRA (pneu com blocos de banda, aro, cubo e 5 raios — dá para ver girar); freio e para-lama ficam parados
  const off = !!(T.big || T.off), wheels = [], spins = [], steers = [], wr = (T.big || (off ? 1.08 : 0.93)) * (T.wide || 1), wb = T.wb || 1.38, zf = -wb, zr = wb, wx = W / 2 + 0.01;   // pneu de ESTRADA (baixo, banda lisa) nos carros de rua; OFF-ROAD (alto, banda grossa) só nos jipes, buggy, picape, SUV e blindado
  for (const [x, z] of [[-wx, zf], [wx, zf], [-wx, zr], [wx, zr]]) {
    const w = new THREE.Mesh(G.wheel, G.tyre); w.rotation.z = Math.PI / 2; w.scale.set(wr, 1, wr);
    const rim = new THREE.Mesh(G.rim, G.rimM); rim.rotation.z = Math.PI / 2; rim.position.x = x > 0 ? 0.04 : -0.04; rim.scale.set(wr * (off ? 1 : 1.12), 1, wr * (off ? 1 : 1.12));
    const sg = new THREE.Group(), pv = new THREE.Group(); pv.position.set(x, 0.4 * wr, z); pv.add(sg); sg.add(w, rim);
    const o = x > 0 ? 0.1 : -0.1; for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(spokeGeo, G.rimM); s.rotation.x = k * Math.PI * 2 / 5; s.position.x = o; s.scale.y = wr; sg.add(s); }
    const hub = new THREE.Mesh(hubGeo, G.rimM); hub.rotation.z = Math.PI / 2; hub.position.x = o * 1.1; hub.scale.set(wr, 0.5, wr); sg.add(hub);
    if (off) for (let k = 0; k < 16; k++) { const a = k * Math.PI * 2 / 16, t = new THREE.Mesh(off ? treadGeo : treadRoad, G.tyre); t.position.set(0, Math.cos(a) * (0.4 * wr + (off ? 0.03 : 0.008)), Math.sin(a) * (0.4 * wr + (off ? 0.03 : 0.008))); t.rotation.x = -a; sg.add(t); }
    const dsk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * wr, 0.2 * wr, 0.03, 12), dark); dsk.rotation.z = Math.PI / 2; dsk.position.x = x > 0 ? -0.1 : 0.1; pv.add(dsk); pv.add(bx(0.07, 0.12, 0.1, red, x > 0 ? -0.1 : 0.1, 0.06 * wr, 0.12));   // disco e pinça de freio
    const arch = new THREE.Mesh(archGeo, dark); arch.rotation.y = Math.PI / 2; arch.scale.set(wr * 1.12, wr * 1.12, 1.2); arch.position.set(x + (x > 0 ? 0.04 : -0.04), 0.4 * wr, z); g.add(arch);   // moldura do para-lama
    g.add(pv); wheels.push(w); spins.push(sg); if (z < 0) steers.push(pv);
  }
  if (T.ogbb) {   // OGBB: o Grande Búfalo Branco — letras pretas com contorno dourado nas portas e atrás, faixa dourada
    const c2 = document.createElement('canvas'); c2.width = 512; c2.height = 160; const x2 = c2.getContext('2d'); x2.clearRect(0, 0, 512, 160); x2.font = '900 120px Arial Black, Impact, sans-serif'; x2.textAlign = 'center'; x2.textBaseline = 'middle'; x2.lineWidth = 9; x2.strokeStyle = '#e8b53a'; x2.strokeText('OGBB', 256, 84); x2.fillStyle = '#15171b'; x2.fillText('OGBB', 256, 84);
    const tx = new THREE.CanvasTexture(c2); tx.colorSpace = THREE.SRGBColorSpace; const om = new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    for (const sd of [-1, 1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.4), om); pl.rotation.y = sd * Math.PI / 2; pl.position.set(sd * (W / 2 + 0.02), 0.66, 0.1); g.add(pl); }
    const pb = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.28), om); pb.rotation.y = Math.PI; pb.position.set(0, 0.95, zR + 0.018); g.add(pb);
    const gold = lam(0xe8b53a, { roughness: 0.4, metalness: 0.1 }); for (const sd of [-1, 1]) g.add(bx(0.02, 0.05, 3.3, gold, sd * (W / 2 + 0.015), 0.5, 0.05));
  }
  if (T.umbra) {   // texto UMBRA em verde nas duas laterais (e atrás), letras de verdade (textura)
    const c2 = document.createElement('canvas'); c2.width = 512; c2.height = 128; const x2 = c2.getContext('2d'); x2.fillStyle = 'rgba(0,0,0,0)'; x2.clearRect(0, 0, 512, 128); x2.font = '900 104px Arial Black, Impact, sans-serif'; x2.textAlign = 'center'; x2.textBaseline = 'middle'; x2.shadowColor = '#16ff6a'; x2.shadowBlur = 18; x2.fillStyle = '#1fdc62'; x2.fillText('UMBRA', 256, 68);
    const tx = new THREE.CanvasTexture(c2); tx.colorSpace = THREE.SRGBColorSpace; const um = new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.5, emissive: 0x0e9a3e, emissiveMap: tx, emissiveIntensity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    for (const sd of [-1, 1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), um); pl.rotation.y = sd * Math.PI / 2; pl.position.set(sd * (T.cw / 2 + 0.014), 1.0, 0.2); g.add(pl); }
    const pb = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.375), um); pb.rotation.y = Math.PI; pb.position.set(0, 1.7, zR + 0.018); g.add(pb);
    for (const sd of [-1, 1]) g.add(bx(0.04, 0.5, 2.0, dark, sd * (T.cw / 2 + 0.004), 0.98, 0.2));   // faixa escura atrás do texto
  }
  if (T.lux) {   // sedã de luxo: grade cromada larga, frisos cromados, faróis finos
    g.add(bx(1.5, 0.3, 0.06, chrome, 0, T.tub[1][1] - 0.2, zF - 0.05)); for (const sd of [-1, 1]) { g.add(bx(0.03, 0.04, 4.2, chrome, sd * (W / 2 + 0.012), 0.72, 0.1)); g.add(bx(0.03, 0.03, 3.0, chrome, sd * (T.cw / 2 + 0.01), T.cab[1][1] - 0.05, 0.4)); } g.add(bx(1.2, 0.04, 0.04, chrome, 0, 0.68, zR + 0.02));
  }
  if (T.armor) {   // blindado: placas, seteiras, rebites, para-choque de aço, escotilha e giroflex no teto, caveira nas portas
    const steel = lam(0x2a323c, { roughness: 0.6, metalness: 0.5 });
    for (const sd of [-1, 1]) { for (let i = 0; i < 4; i++) g.add(bx(0.06, 0.5, 0.95, steel, sd * (W / 2 + 0.03), 1.0, -1.4 + i * 1.05)); for (let i = 0; i < 3; i++) g.add(bx(T.cw + 0.04 > 0 ? 0.06 : 0, 0.12, 0.7, G.glassM, sd * (T.cw / 2 + 0.02), 1.8, -0.5 + i * 0.95)); }   // placas laterais e seteiras
    g.add(bx(T.cw - 0.2, 0.16, 0.06, G.glassM, 0, 1.8, T.cab[0][0] + 0.18));   // seteira do para-brisa
    g.add(bx(2.3, 0.22, 0.4, steel, 0, 0.5, zF - 0.22)); g.add(bx(1.9, 0.5, 0.1, steel, 0, 0.95, zF - 0.1));   // para-choque e grade blindados
    const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.18, 12), steel); hatch.position.set(0.3, T.cab[1][1] + 0.1, 0.2); g.add(hatch); g.add(bx(0.7, 0.1, 0.7, steel, -0.5, T.cab[1][1] + 0.05, 0.9));
    for (const [cx, col] of [[-0.4, 0xff2a2a], [0.4, 0x2a6aff]]) g.add(bx(0.7, 0.14, 0.2, lam(col, { emissive: col, emissiveIntensity: 0.9 }), cx, T.cab[1][1] + 0.12, -0.9));   // giroflex
    const c3 = document.createElement('canvas'); c3.width = c3.height = 128; const x3 = c3.getContext('2d'); x3.fillStyle = '#f2f2f2'; x3.beginPath(); x3.arc(64, 54, 36, 0, Math.PI * 2); x3.fill(); x3.fillRect(44, 80, 40, 28); x3.fillStyle = '#10151b'; x3.beginPath(); x3.arc(50, 54, 9, 0, 7); x3.arc(78, 54, 9, 0, 7); x3.fill(); x3.fillRect(60, 66, 8, 10); for (let i = 0; i < 4; i++) x3.fillRect(48 + i * 10, 88, 3, 18);
    const tk = new THREE.CanvasTexture(c3); tk.colorSpace = THREE.SRGBColorSpace; const sk = new THREE.MeshStandardMaterial({ map: tk, transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    for (const sd of [-1, 1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), sk); pl.rotation.y = sd * Math.PI / 2; pl.position.set(sd * (W / 2 + 0.065), 1.12, 0.35); g.add(pl); }
  }
  const rz = zR + 0.01;
  for (const x of [-0.7, 0.7]) {
    g.add(bx(0.5, 0.24, 0.07, dark, x, lampY, zF - 0.01)); g.add(bx(0.4, 0.16, 0.05, head, x, lampY, zF - 0.035)); g.add(bx(0.5, 0.24, 0.07, dark, x, lampY, rz - 0.01)); g.add(bx(0.4, 0.16, 0.05, tail, x, lampY, rz + 0.02));
    g.add(bx(0.14, 0.08, 0.04, rev, x * 1.15, lampY - 0.17, rz + 0.01)); g.add(bx(0.12, 0.06, 0.04, head, x * 1.05, lampY - 0.16, zF - 0.02));   // luz de ré e farol de milha
    if (T.cab) { const mr = new THREE.Mesh(G.mirror, paint); mr.position.set(x > 0 ? 1.02 : -1.02, top > 1.4 ? 1.2 : 1.05, -0.55); g.add(mr); }
  }
  g.add(bx(1.2, 0.05, 0.04, tail, 0, lampY, rz + 0.012));   // faixa de luz traseira ligando as lanternas
  g.add(bx(0.52, 0.14, 0.02, plate, 0, lampY - 0.12, rz + 0.025)); g.add(bx(0.52, 0.14, 0.02, plate, 0, lampY - 0.28, zF - 0.045));   // placas
  g.add(bx(2.05, 0.16, 0.2, dark, 0, 0.42, zF - 0.02)); g.add(bx(2.05, 0.16, 0.2, dark, 0, 0.42, zR));   // para-choques
  if (!T.open) {
    const sh = th - 0.12; for (const sd of [-1, 1]) { g.add(bx(0.03, sh - 0.55, 0.012, dark, sd * (W / 2 + 0.01), (sh + 0.55) / 2, -0.2)); g.add(bx(0.03, sh - 0.55, 0.012, dark, sd * (W / 2 + 0.01), (sh + 0.55) / 2, 0.8)); g.add(bx(0.03, 0.04, 0.14, chrome, sd * (W / 2 + 0.02), sh - 0.1, 0.0)); g.add(bx(0.06, 0.1, 2.4, dark, sd * (W / 2 + 0.01), 0.5, 0.2)); }   // portas, maçanetas e soleira
    if (T.cab) { const an = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.5, 4), dark); an.position.set(0.6, top + 0.25, 1.1); g.add(an); }
  }
  { const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8), chrome); ex.rotation.x = Math.PI / 2; ex.position.set(-0.6, 0.3, zR + 0.1); g.add(ex); }   // escapamento
  // ---- luz: brilho redondo nas lanternas (cor/alfa por vértice) + mancha de luz no chão à frente; só aparecem com os faróis/freio acionados
  const gp = new Float32Array(8 * 3), gc = new Float32Array(8 * 4), gg = new THREE.BufferGeometry(), lp = [[-0.7, lampY, zF - 0.1], [0.7, lampY, zF - 0.1], [-0.7, lampY, rz + 0.1], [0.7, lampY, rz + 0.1], [-0.86, lampY - 0.17, rz + 0.08], [0.86, lampY - 0.17, rz + 0.08], [-0.74, lampY - 0.16, zF - 0.1], [0.74, lampY - 0.16, zF - 0.1]];
  lp.forEach((p, i) => gp.set(p, i * 3)); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); gg.setAttribute('color', new THREE.BufferAttribute(gc, 4));
  const glow = new THREE.Points(gg, new THREE.PointsMaterial({ size: 1.1, map: GLOWT(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); glow.frustumCulled = false; g.add(glow);
  const lp2 = lightPool(), pool = new THREE.Mesh(lp2.geo, lp2.mat); pool.position.set(0, 0.07, zF - 6.4); pool.visible = false; pool.frustumCulled = false; pool.renderOrder = 2; g.add(pool);
  g.userData = { wb, wx, wheels, spins, steers, paint, extra: [], beams: [pool], mats: { head, tail, rev }, glow, pool, zF, rz, lampY };
  // NITRO: duas chamas atrás (cones aditivos na cor do modelo), só aparecem enquanto o nitro está ligado
  { const NT = VEH_NITRO[ty % TYPES.length]; if (NT) { const fm = new THREE.MeshBasicMaterial({ color: NT.col, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }), fl = []; for (const sx of [-0.45, 0.45]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.11, 1.1, 8, 1, true), fm); c.rotation.x = Math.PI / 2; c.position.set(sx, 0.36, zR + 0.55); c.userData.role = 'nitro'; c.visible = false; c.frustumCulled = false; g.add(c); fl.push(c); } g.userData.nit = fl; g.userData.nitK = 0; } }
  g.updateMatrixWorld(true); try { mergeStatic(g, spins); } catch (e) { console.warn('[carro] otimizador desativado:', e.message); }
  const pm = []; g.traverse((o) => { if (o.isMesh && o.material === paint) pm.push(o); }); g.userData.body = g.userData.cab = pm[0] || tub;
  const casters = []; g.traverse((o) => { if (o.isMesh) { o.castShadow = o !== pool; if (o !== pool) casters.push(o); } }); g.userData.casters = casters;
  return g;
}

export { OPEN_TY, build as buildCar, TYPES as CAR_TYPES, HPK as CAR_HPK };   // modelos dos carros (gerado do jogo por tools/sincronizarSite.mjs: sem o som e sem a classe que anima)
