// MODELOS E ANIMAÇÕES DA FAUNA DA ZONA UMBRA: 8 dinossauros bípedes (braços de verdade, com garras) e 8 mamíferos pré-históricos, TODOS quadrúpedes.
// Tudo procedural (caixas, cones e esferas baixas, no mesmo estilo do jogo) e pronto para qualquer modo: new Creature('trex') → c.group na cena; a cada quadro c.update(dt).
//   c.setMotion(velocidadeEmM/s, humor)   humor: 'calm' | 'alert' | 'flee'     (as pernas acompanham a velocidade: parado, andando ou correndo)
//   c.attack(tipo?)  c.hurt()  c.roar()  c.die()  c.revive()                    (tipos de ataque de cada espécie estão em shared/fauna.js › atk)
// O animal olha para +Z; a origem é o chão embaixo dele. c.height / c.radius / c.eye servem para colisão e mira.
import * as THREE from 'three';
import { FAUNA } from '../../../shared/fauna.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export const CREATURE_CFG = { stand: false };   // true só no modo Caçada: lá os bichos correm em pé nas duas patas (engraçado); nos outros modos correm de quatro patas
export const CREATURE_OPT = { on: true, beauty: true };   // beauty: caixas com quinas chanfradas (pegam luz nas arestas, bem menos 'quadradas')   // false = sem a fusão por esqueleto (serve para comparar o visual)
let BONES = null;   // as juntas do animal que está sendo montado viram ossos (esqueleto do otimizador)

const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sm = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
// trapézio suave: sobe de a até b, segura até c, desce até d
const env = (p, a, b, c, d) => (p < a || p > d ? 0 : p < b ? sm((p - a) / (b - a)) : p <= c ? 1 : 1 - sm((p - c) / (d - c)));
const matCache = new Map();
const M = (c, o = {}) => { const k = c + JSON.stringify(o); let m = matCache.get(k); if (!m) { m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.86, metalness: 0.02, flatShading: true, ...o }); matCache.set(k, m); } return m; };
const G = { box: new Map(), cone: new Map() };
// caixa chanfrada: 26 faces (6 faces + 12 chanfros + 8 cantos), 44 triângulos; sombreamento chapado como o resto do jogo
function chamferBox(X, Y, Z, c) {
  const hx = X / 2, hy = Y / 2, hz = Z / 2, P = [], sg = [-1, 1], A = {}, B = {}, C = {};
  for (const sx of sg) for (const sy of sg) for (const sz of sg) { const k = sx + ',' + sy + ',' + sz; A[k] = [sx * hx, sy * (hy - c), sz * (hz - c)]; B[k] = [sx * (hx - c), sy * hy, sz * (hz - c)]; C[k] = [sx * (hx - c), sy * (hy - c), sz * hz]; }
  const tri = (a, b, d) => { const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]], n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], cx = (a[0] + b[0] + d[0]) / 3, cy = (a[1] + b[1] + d[1]) / 3, cz = (a[2] + b[2] + d[2]) / 3; if (n[0] * cx + n[1] * cy + n[2] * cz < 0) P.push(...a, ...d, ...b); else P.push(...a, ...b, ...d); };
  const quad = (a, b, d, e) => { tri(a, b, d); tri(a, d, e); };
  for (const sx of sg) quad(A[sx + ',-1,-1'], A[sx + ',1,-1'], A[sx + ',1,1'], A[sx + ',-1,1']);
  for (const sy of sg) quad(B['-1,' + sy + ',-1'], B['1,' + sy + ',-1'], B['1,' + sy + ',1'], B['-1,' + sy + ',1']);
  for (const sz of sg) quad(C['-1,-1,' + sz], C['1,-1,' + sz], C['1,1,' + sz], C['-1,1,' + sz]);
  for (const sx of sg) for (const sy of sg) quad(A[sx + ',' + sy + ',-1'], A[sx + ',' + sy + ',1'], B[sx + ',' + sy + ',1'], B[sx + ',' + sy + ',-1']);   // arestas ao longo de z
  for (const sx of sg) for (const sz of sg) quad(A[sx + ',-1,' + sz], A[sx + ',1,' + sz], C[sx + ',1,' + sz], C[sx + ',-1,' + sz]);   // ao longo de y
  for (const sy of sg) for (const sz of sg) quad(B['-1,' + sy + ',' + sz], B['1,' + sy + ',' + sz], C['1,' + sy + ',' + sz], C['-1,' + sy + ',' + sz]);   // ao longo de x
  for (const sx of sg) for (const sy of sg) for (const sz of sg) { const k = sx + ',' + sy + ',' + sz; tri(A[k], B[k], C[k]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(P.length / 3 * 2), 2)); g.computeVertexNormals(); return g;
}
const boxG = (x, y, z) => { const mn = Math.min(x, y, z), ch = CREATURE_OPT.beauty && mn >= 0.12, k = `${x}|${y}|${z}|${ch ? 1 : 0}`; let g = G.box.get(k); if (!g) G.box.set(k, g = ch ? chamferBox(x, y, z, Math.min(0.2, mn * 0.2)) : new THREE.BoxGeometry(x, y, z)); return g; };
const coneG = (r, h, n = 6) => { const k = `${r}|${h}|${n}`; let g = G.cone.get(k); if (!g) G.cone.set(k, g = new THREE.ConeGeometry(r, h, n)); return g; };
function put(p, g, m, x, y, z, rx = 0, ry = 0, rz = 0) { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; p.add(o); return o; }
const bx = (p, sx, sy, sz, x, y, z, m, rx, ry, rz) => put(p, boxG(sx, sy, sz), m, x, y, z, rx, ry, rz);
const cn = (p, r, h, x, y, z, m, rx, ry, rz, n) => put(p, coneG(r, h, n), m, x, y, z, rx, ry, rz);   // cone aponta para +Y; rx=π/2 → +Z (frente); rx=π → para baixo
const grp = (p, x = 0, y = 0, z = 0) => { const g = BONES ? new THREE.Bone() : new THREE.Group(); if (BONES) BONES.push(g); g.position.set(x, y, z); p.add(g); return g; };

// perna de 2 ossos: coxa (pivô no quadril) + canela (pivô no joelho) + pé
function leg(p, x, y, z, len1, len2, t, m, dark) {
  const hip = grp(p, x, y, z); bx(hip, t, len1, t, 0, -len1 / 2, 0, m);
  const knee = grp(hip, 0, -len1, 0); bx(knee, t * 0.8, len2, t * 0.8, 0, -len2 / 2, 0, m);
  const ankle = grp(knee, 0, -len2, 0); bx(ankle, t * 1.05, t * 0.42, t * 1.5, 0, t * 0.21, t * 0.3, dark);
  return { hip, knee, ankle, len1, len2 };
}

const h01 = (i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;   // número 'aleatório' fixo por peça (o animal sempre sai igual)
const VC = new Map();
const vcMat = (rq, mq) => { const k = rq + '_' + mq; let m = VC.get(k); if (!m) { m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rq / 5, metalness: mq / 4, flatShading: true }); m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', 'outgoingLight+=pow(1.-saturate(dot(normalize(normal),normalize(vViewPosition))),3.)*vec3(.2,.26,.34)*.5;\n#include <opaque_fragment>'); }; m.customProgramCacheKey = () => 'crrim'; VC.set(k, m); } return m; };
export class Creature {
  constructor(id) {
    const sp = FAUNA[id]; if (!sp) throw new Error(`espécie desconhecida: ${id}`);
    this.id = id; this.sp = sp; this.group = new THREE.Group(); this.group.name = `fauna_${id}`;
    const c = sp.colors; this.mats = { sk: M(c.sk), bl: M(c.bl), ac: M(c.ac), dark: M('#1b1612'), tooth: M('#efe8d6', { roughness: 0.5 }), eye: M('#ffd23a', { emissive: '#ffb300', emissiveIntensity: 0.9 }), claw: M('#2a221b', { roughness: 0.5 }) };
    this.t = Math.random() * 10; this.ph = 0; this.spd = 0; this.want = 0; this.mood = 'calm'; this.alertK = 0; this.fleeK = 0; this.atk = null; this.hurtT = -1; this.roarT = -1; this.dyingT = -1; this.dead = false;
    this.tails = []; this.fx = []; this.arms = []; this.legs = []; this.trunk = [];
    BONES = this.bones = []; this.root = grp(this.group);
    if (sp.rig === 'biped') this.buildBiped(); else this.buildQuad();
    (FEATURES[id] || (() => {}))(this);
    this.group.traverse((o) => { if (o.isMesh) o.matrixAutoUpdate = true; });
    this.group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.group); this.height = +(box.max.y - box.min.y).toFixed(2); this.radius = sp.hit?.r ?? Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2; this.eye = +(this.height * 0.86).toFixed(2);
    BONES = null; if (CREATURE_OPT.on) { try { this.optimize(); } catch (e) { console.warn('[criatura] otimizador desativado:', e.message); } }
    this.update(0.001);
  }

  // ------------------------------------------------------------------ bípede (dinossauros)
  buildBiped() {
    const sp = this.sp, m = this.mats, { legL, bodyL, bodyH, w, neckL, headL, tailL, armL } = sp, A = 0.4, B = 0.9, L1 = legL * 0.556, L2 = legL * 0.556, t = Math.max(0.2, w * 0.5);
    this.a0 = A; this.b0 = B; this.hipY = legL + bodyH * 0.12;   // os quadris ficam 12% da altura do tronco abaixo do centro dele
    const body = this.body = grp(this.root, 0, this.hipY, 0); this.torso = bx(body, w, bodyH, bodyL, 0, bodyH * 0.1, 0, m.sk);
    this.belly = bx(body, w * 0.86, bodyH * 0.4, bodyL * 0.82, 0, -bodyH * 0.26, 0.02 * bodyL, m.bl);
    for (const sd of [-1, 1]) this.legs.push({ ...leg(body, sd * w * 0.42, -bodyH * 0.12, -bodyL * 0.04, L1, L2, t, m.sk, m.dark), sd });
    const neck = this.neckA = grp(body, 0, bodyH * 0.25, bodyL * 0.44); neck.rotation.x = -0.62; bx(neck, w * 0.46, w * 0.5, neckL, 0, 0, neckL / 2, m.sk);
    const neck2 = this.neckB = grp(neck, 0, 0, neckL); neck2.rotation.x = 0.55; bx(neck2, w * 0.4, w * 0.42, neckL * 0.55, 0, 0, neckL * 0.27, m.sk);
    const head = this.head = grp(neck2, 0, 0, neckL * 0.5); this.buildHead(head, headL, w);
    let seg = grp(body, 0, bodyH * 0.1, -bodyL / 2), n = 6; const sL = tailL / n;
    for (let i = 0; i < n; i++) { const k = 1 - i / n * 0.85, g = i === 0 ? seg : grp(seg, 0, 0, -sL); bx(g, w * 0.62 * k, bodyH * 0.55 * k, sL * 1.08, 0, 0, -sL / 2, i % 3 === 2 ? m.ac : m.sk); this.tails.push(g); seg = g; }
    this.tails[0].rotation.x = 0;
    for (const sd of [-1, 1]) {   // braços: ombro → cotovelo → mão com garras (curtos no T-Rex, longos no Espinossauro e no Terizinossauro)
      const sh = grp(body, sd * w * 0.52, bodyH * 0.05, bodyL * 0.4), u = armL * 0.5, f = armL * 0.5, th = Math.max(0.09, w * 0.13 * (0.6 + sp.armK * 0.5)); bx(sh, th, u, th, 0, -u / 2, 0, m.sk);
      const el = grp(sh, 0, -u, 0); bx(el, th * 0.85, f, th * 0.85, 0, -f / 2, 0, m.sk); const hand = grp(el, 0, -f, 0); bx(hand, th * 1.1, th * 0.9, th * 1.3, 0, -th * 0.2, th * 0.3, m.sk);
      const nc = sp.armK < 0.6 ? 2 : 3, cl = 0.12 + armL * 0.22 * (sp.id === 'teri' ? 1.6 : 1); for (let i = 0; i < nc; i++) cn(hand, 0.025 + th * 0.12, cl, (i - (nc - 1) / 2) * th * 0.55, -th * 0.55, th * 0.75, m.claw, Math.PI * 0.62);
      sh.rotation.set(-0.5, 0, sd * 0.12); this.arms.push({ sh, el, sd, base: -0.5 });
    }
  }
  buildHead(head, L, w) {
    const m = this.mats, h = w * 0.7; bx(head, h * 1.0, h * 0.85, L * 0.62, 0, 0, L * 0.3, m.sk); bx(head, h * 0.72, h * 0.55, L * 0.5, 0, -h * 0.08, L * 0.72, m.sk);
    const jaw = this.jaw = grp(head, 0, -h * 0.38, L * 0.12); bx(jaw, h * 0.78, h * 0.22, L * 0.78, 0, 0, L * 0.4, m.bl);
    const nt = Math.round(3 + L * 2); for (let i = 0; i < nt; i++) for (const sd of [-1, 1]) { const z = L * 0.28 + i * (L * 0.62 / nt); cn(head, 0.018 + h * 0.03, 0.05 + h * 0.18, sd * h * 0.34, -h * 0.5, z, m.tooth, Math.PI); cn(jaw, 0.016 + h * 0.025, 0.04 + h * 0.15, sd * h * 0.3, h * 0.18, z - L * 0.1, m.tooth, 0); }
    for (const sd of [-1, 1]) { bx(head, 0.05 + h * 0.08, 0.05 + h * 0.08, 0.06 + h * 0.1, sd * h * 0.52, h * 0.22, L * 0.34, m.eye); bx(head, 0.03 + h * 0.05, 0.03 + h * 0.05, 0.03 + h * 0.05, sd * h * 0.22, h * 0.06, L * 0.98, m.dark); }
    this.headW = h;
  }

  // ------------------------------------------------------------------ quadrúpede (mamíferos)
  buildQuad() {
    const sp = this.sp, m = this.mats, { legL, bodyL, bodyH, bodyW, neckL, headL, tailL } = sp, fk = 1, hk = 1;
    const t = Math.max(0.16, Math.min(bodyW * 0.24, legL * 0.3)), by = legL * 1.08 + bodyH * 0.38; this.hipY = by;   // a base da pata encosta no chão (y = 0)
    const body = this.body = grp(this.root, 0, by, 0); this.torso = bx(body, bodyW, bodyH, bodyL, 0, 0, 0, m.sk); this.belly = bx(body, bodyW * 0.86, bodyH * 0.4, bodyL * 0.84, 0, -bodyH * 0.3, 0, m.bl);
    const lyF = -bodyH * 0.38, lyH = lyF;
    const mk = (x, z, k, ph, front) => { const total = legL * k * 1.08; return { ...leg(body, x, lyF, z, total * 0.5, total * 0.5, t, m.sk, m.dark), ph, front, k }; };
    this.legs = [mk(bodyW * 0.36, bodyL * 0.33, fk, 0, true), mk(-bodyW * 0.36, bodyL * 0.33, fk, Math.PI, true), mk(bodyW * 0.36, -bodyL * 0.33, hk, Math.PI, false), mk(-bodyW * 0.36, -bodyL * 0.33, hk, 0, false)];
    for (const l of this.legs) l.baseY = l.hip.position.y;
    const up = { mamute: -0.05, smilo: 0.1, pregui: -0.1, glipto: 0, elasmo: 0.05, mega: 1.0, gigan: 0.3, macro: 1.05 }[sp.id] ?? 0.2;
    const neck = this.neckA = grp(body, 0, bodyH * 0.18, bodyL / 2 - 0.1); neck.rotation.x = -up; bx(neck, bodyW * 0.5, bodyW * 0.5 * (sp.id === 'mega' || sp.id === 'macro' ? 0.5 : 1), neckL, 0, 0, neckL / 2, m.sk);
    const neck2 = this.neckB = grp(neck, 0, 0, neckL); neck2.rotation.x = up * (sp.id === 'mega' || sp.id === 'macro' ? 0.7 : 0.2);
    if (sp.id === 'mega' || sp.id === 'macro') bx(neck2, bodyW * 0.4, bodyW * 0.4, neckL * 0.4, 0, 0, neckL * 0.2, m.sk);
    const head = this.head = grp(neck2, 0, 0, neckL * (sp.id === 'mega' || sp.id === 'macro' ? 0.35 : 0.1)); const hw = bodyW * 0.55; this.headW = hw;
    bx(head, hw, hw * 0.9, headL * 0.6, 0, 0, headL * 0.3, m.sk); bx(head, hw * 0.7, hw * 0.55, headL * 0.5, 0, -hw * 0.1, headL * 0.68, m.sk);
    const jaw = this.jaw = grp(head, 0, -hw * 0.38, headL * 0.14); bx(jaw, hw * 0.62, hw * 0.2, headL * 0.62, 0, 0, headL * 0.3, m.bl);
    for (const sd of [-1, 1]) { bx(head, 0.06 + hw * 0.05, 0.06 + hw * 0.05, 0.06 + hw * 0.05, sd * hw * 0.5, hw * 0.2, headL * 0.36, m.dark); bx(head, 0.04, 0.04, 0.04, sd * hw * 0.2, hw * 0.05, headL * 0.98, m.dark); }
    if (tailL > 0.05) { let seg = grp(body, 0, bodyH * 0.2, -bodyL / 2), n = 4; const sL = tailL / n; for (let i = 0; i < n; i++) { const g = i === 0 ? seg : grp(seg, 0, 0, -sL), k = 1 - i / n * 0.6; bx(g, bodyW * 0.22 * k + 0.05, bodyW * 0.22 * k + 0.05, sL * 1.08, 0, 0, -sL / 2, i === n - 1 && sp.id === 'smilo' ? m.ac : m.sk); this.tails.push(g); seg = g; } this.tails[0].rotation.x = 0.45; }
  }

  // ------------------------------------------------------------------ controle
  setMotion(speed, mood = 'calm') { this.want = Math.max(0, speed); this.mood = mood; }
  attack(kind, big = false) { const k = kind || this.sp.atk[0]; if (!k || this.dead) return false; const dur = ({ bite: 0.9, claw: 1.0, headbutt: 1.0, gore: 1.2, pounce: 1.3, swat: 1.0 }[k] ?? 1) * (big ? 1.25 : 1); this.atk = { k, t: 0, dur, big: !!big }; return true; }   // golpe RÁPIDO = curto e seco; golpe FORTE = o bicho recua a cabeça e ataca com o corpo todo
  hurt() { this.hurtT = 0; }
  roar() { if (!this.dead) this.roarT = 0; }
  die() { if (this.sp.kind !== 'mamifero' && !this.dead) { this.dead = true; this.dyingT = 0; this.atk = null; } }   // mamíferos não morrem
  revive() { this.dead = false; this.dyingT = -1; }
  leap(sec) { this.leapLeft = sec; }   /* PULÃO (peido): pernas da frente para a frente, as de trás para trás (cômico) */
  look(sec) { this.lookLeft = sec; }   /* OLHAR EM VOLTA: a cabeça vira para um lado e para o outro (a presa da Caçada usa no Q) */
  graze(sec) { this.grazeLeft = sec; }   // PASTAR: baixa a cabeça e mastiga (herbívoros tranquilos)

  update(dt) {
    const sp = this.sp, legL = sp.legL; dt = Math.min(0.1, Math.max(0, dt)); this.t += dt;
    const t = this.t, biped = sp.rig === 'biped';
    this.spd += (this.want - this.spd) * Math.min(1, dt * 6); if (this.dead) this.spd = 0;
    const walk = sp.walk, mv = clamp(this.spd / (walk * 0.9)), runK = clamp((this.spd - walk) / Math.max(0.5, sp.run - walk));
    this.ph += dt * Math.PI * 2 * (this.spd / (legL * 2.2 + 0.5)) * (1 + runK * 0.25);
    this.alertK += ((this.mood === 'alert' ? 1 : 0) - this.alertK) * Math.min(1, dt * 5); this.fleeK += ((this.mood === 'flee' ? 1 : 0) - this.fleeK) * Math.min(1, dt * 7);
    const ph = this.ph, amp = lerp(0.38, 0.78, runK) * mv, breath = Math.sin(t * 1.8);
    // ---- envelopes das ações ----
    const bg = this.atk?.big ? 1.7 : 1; let atkP = 0, A = null; if (this.atk) { this.atk.t += dt; atkP = this.atk.t / this.atk.dur; if (atkP >= 1) this.atk = null; else A = this.atk.k; }
    let hurtE = 0; if (this.hurtT >= 0) { this.hurtT += dt; if (this.hurtT > 0.5) this.hurtT = -1; else hurtE = (1 - this.hurtT / 0.5); }
    let roarE = 0; if (this.roarT >= 0) { this.roarT += dt; if (this.roarT > 1.7) this.roarT = -1; else roarE = env(this.roarT / 1.7, 0, 0.2, 0.75, 1); }
    let dieE = 0; if (this.dead) { this.dyingT += dt; dieE = sm(this.dyingT / 1.3); }
    let neckAdd = 0, lunge = 0, jawOpen = 0, bodyPitch = 0, hop = 0, armSwing = 0, crouch = 0, frontSwat = 0, tailYaw = 0;
    if (A === 'bite') { const up = env(atkP, 0, 0.3, 0.34, 0.46), dn = env(atkP, 0.34, 0.46, 0.54, 0.9); neckAdd = (-0.5 * up + 0.85 * dn) * bg; lunge = dn * sp.legL * 0.28 * bg; jawOpen = env(atkP, 0.1, 0.34, 0.5, 0.62) * (bg > 1 ? 1.4 : 1); bodyPitch = dn * 0.1 * bg - (bg > 1 ? up * 0.12 : 0); }
    else if (A === 'claw') { const up = env(atkP, 0, 0.3, 0.34, 0.46), dn = env(atkP, 0.34, 0.46, 0.54, 0.9); armSwing = (-1.5 * up + 1.7 * dn) * bg; lunge = dn * sp.legL * 0.15 * bg; neckAdd = 0.25 * dn * bg; frontSwat = armSwing; }
    else if (A === 'headbutt') { const bk = env(atkP, 0, 0.3, 0.34, 0.5), fw = env(atkP, 0.34, 0.46, 0.55, 0.9); neckAdd = -0.3 * bk + 0.7 * fw; lunge = fw * sp.legL * 0.4; bodyPitch = fw * 0.15; }
    else if (A === 'gore') { const dn = env(atkP, 0, 0.3, 0.38, 0.45), tossE = env(atkP, 0.4, 0.5, 0.56, 0.9); neckAdd = 0.75 * dn - 1.0 * tossE; lunge = (dn * 0.5 + tossE) * sp.legL * 0.22; bodyPitch = dn * 0.08 - tossE * 0.1; }
    else if (A === 'pounce') { const cr = env(atkP, 0, 0.25, 0.32, 0.4), lp = env(atkP, 0.32, 0.5, 0.62, 0.92); crouch = cr * 0.35; lunge = lp * sp.legL * 2.2; hop = Math.sin(clamp((atkP - 0.32) / 0.45) * Math.PI) * sp.legL * 0.7; jawOpen = env(atkP, 0.4, 0.55, 0.68, 0.8); bodyPitch = -lp * 0.12; frontSwat = -1.2 * env(atkP, 0.4, 0.55, 0.65, 0.85); }
    else if (A === 'swat') { const up = env(atkP, 0, 0.3, 0.34, 0.46), dn = env(atkP, 0.34, 0.46, 0.54, 0.9); frontSwat = -1.7 * up + 1.9 * dn; neckAdd = -0.2 * up + 0.2 * dn; lunge = dn * sp.legL * 0.12; }
    this.leapLeft = (this.leapLeft || 0) - dt; this.leapK = (this.leapK || 0) + ((this.leapLeft > 0 ? 1 : 0) - (this.leapK || 0)) * Math.min(1, dt * 12);
    { const stT = CREATURE_CFG.stand && !biped && !this.dead && sp.kind !== 'monstro' && this.spd > 4.8 ? 1 : 0; this.standK = (this.standK || 0) + (stT - (this.standK || 0)) * Math.min(1, dt * 6); bodyPitch -= this.standK * 0.55; }   /* CORRIDA: o bicho levanta o peito e corre meio de pé (cômico); MONSTROS (Mula) correm com as quatro patas, sem graça: é terror */
    this.lookLeft = (this.lookLeft || 0) - dt; const lookY = this.lookLeft > 0 ? Math.sin(t * 2.6) * 0.9 * Math.min(1, this.lookLeft) : 0;
    this.grazeLeft = (this.grazeLeft || 0) - dt; this.grazeK = (this.grazeK || 0) + (((this.grazeLeft > 0 && this.spd < 0.3 && !A ? 1 : 0)) - (this.grazeK || 0)) * Math.min(1, dt * 2.5); if (this.grazeK > 0.01) { neckAdd += this.grazeK * (0.95 + Math.sin(t * 5) * 0.07); jawOpen = Math.max(jawOpen, this.grazeK * (0.12 + 0.1 * Math.max(0, Math.sin(t * 5)))); }
    jawOpen = Math.max(jawOpen, roarE * 0.9, dieE * 0.5);
    const alertUp = this.alertK * 0.22 + roarE * 0.5 + this.fleeK * 0.2;
    // ---- corpo ----
    const bob = Math.abs(Math.sin(ph)) * 0.05 * legL * mv * (1 + runK), crouchY = (this.fleeK * 0.06 + crouch) * legL;
    this.body.position.set(0, this.hipY + bob - crouchY + hop - dieE * legL * 0.62, lunge * 0.9);
    this.body.rotation.set(bodyPitch + (biped ? 0.04 + Math.sin(ph * 2) * 0.02 * mv : Math.sin(ph * 2) * 0.012 * mv) - roarE * 0.12 + hurtE * Math.sin(this.hurtT * 50) * 0.05, Math.sin(ph) * 0.03 * mv, dieE * 1.5 + (biped ? Math.sin(ph) * 0.03 * mv : Math.sin(ph) * 0.025 * mv) + hurtE * Math.sin(this.hurtT * 42) * 0.04);
    this.torso.scale.y = 1 + breath * 0.018 * (1 - dieE);
    // ---- pernas ----
    this.legs.forEach((L, i) => {
      if (biped) {
        const s = Math.sin(ph + (L.sd > 0 ? 0 : Math.PI)), c = Math.cos(ph + (L.sd > 0 ? 0 : Math.PI));
        L.hip.rotation.x = -this.a0 - s * amp * 0.8 + dieE * -0.7; L.knee.rotation.x = this.b0 + Math.max(0, c) * 0.9 * mv + (crouch + this.fleeK * 0.12) * 0.9 + dieE * 1.2; L.ankle.rotation.x = -(L.hip.rotation.x + L.knee.rotation.x);
        L.hip.rotation.z = dieE * 0.2;
      } else {
        const off = L.ph, s = Math.sin(ph + off), c = Math.cos(ph + off); let swing = -s * amp * 0.9, bend = Math.max(0, c) * (L.front ? 1.0 : 0.8) * mv * 1.0 + (crouch * 1.2 + this.fleeK * 0.1);
        if (L.front && i === 0) swing += frontSwat * 0.5; if (L.front && i === 1) swing += frontSwat * 0.15;
        L.hip.rotation.x = swing + (L.front ? 0 : 0.12) - dieE * 0.5; L.knee.rotation.x = bend * (L.front ? 0.9 : -0.6) + (L.front ? 0 : 0.3 * (crouch + 0.0)); L.ankle.rotation.x = -(L.hip.rotation.x + L.knee.rotation.x) * 0.9;
        L.hip.position.y = L.baseY;
        if (this.leapK > 0.01 || (this.standK || 0) > 0.01) { const lk = Math.max(this.leapK, (this.standK || 0) * 0.5), tg = L.front ? -0.95 : 0.95; L.hip.rotation.x += (tg - L.hip.rotation.x) * lk; L.knee.rotation.x *= 1 - lk * 0.7; L.ankle.rotation.x = -(L.hip.rotation.x + L.knee.rotation.x) * 0.9; }   /* no pulão: frente pra frente, trás pra trás */
      }
    });
    // ---- pescoço e cabeça ----
    const idleLook = Math.sin(t * 0.7) * 0.2 * (1 - mv) * (1 - this.alertK), r = Math.max(0, Math.sin(t * 0.6)) ** 3;
    const baseN = biped ? -0.62 : (this.neckA.userData.base ??= this.neckA.rotation.x), baseN2 = biped ? 0.55 : (this.neckB.userData.base ??= this.neckB.rotation.x);
    this.neckA.rotation.x = baseN - alertUp + neckAdd * 0.7 + Math.sin(ph * 2) * 0.03 * mv - r * 0.05 + dieE * 0.5 + hurtE * -0.3; this.neckA.rotation.y = idleLook * 0.5 + lookY * 0.6 + Math.sin(ph) * 0.05 * mv; this.neckB.rotation.x = baseN2 + neckAdd * 0.5 - alertUp * 0.3 + dieE * 0.5; this.neckB.rotation.y = idleLook * 0.5 + lookY * 0.4;
    this.jaw.rotation.x = jawOpen * 0.85 + r * 0.05 * (1 - dieE);
    // ---- cauda ----
    this.tails.forEach((s, i) => { s.rotation.y = Math.sin(t * (1.4 + runK) - i * 0.5 + ph * 0.5) * (0.1 + 0.05 * i) * (0.5 + mv * 0.7) + tailYaw * i * 0.1; if (i > 0) s.rotation.x = (biped ? 0.03 : 0.12) * (1 - this.fleeK * 1.4) - dieE * 0.1; else s.rotation.x = (biped ? -0.02 + runK * 0.04 : 0.45 - this.fleeK * 0.4); });
    // ---- braços (bípedes) ----
    for (const a of this.arms) { a.sh.rotation.x = a.base + armSwing * 0.8 - Math.sin(ph + (a.sd > 0 ? Math.PI : 0)) * 0.25 * mv + Math.sin(t * 2.2 + a.sd) * 0.04 + dieE * 0.7; a.el.rotation.x = -0.6 - Math.max(0, -armSwing) * 0.2 + Math.sin(t * 2.2) * 0.05; }
    for (const f of this.fx) f(t, { mv, runK, roarE, atkP, A, dieE, alert: this.alertK, hurtE });
    this.group.updateMatrixWorld(false);
  }

  // ------------------------------------------------------------------ OTIMIZADOR
  // 1) descobre as peças que se mexem SOZINHAS (respirar, fogo, nadadeiras...) rodando as animações em vários estados; essas ficam soltas
  // 2) o resto vira SkinnedMesh: 1 malha por material (cor por vértice com sombreado de oclusão e variação leve por peça), o esqueleto são as juntas
  optimize() {
    const g0 = this.group, sp = this.sp, all = [], nodes = []; g0.traverse((o) => { if (o === g0) return; all.push(o); if (!o.isBone) nodes.push(o); });
    const rest = all.map((o) => [o.position.clone(), o.quaternion.clone(), o.scale.clone(), o.visible]);
    const ms = (o) => { const m = o.material; return o.isMesh && m && !Array.isArray(m) ? `${m.emissiveIntensity}|${m.opacity}|${m.color.getHex()}` : ''; };
    const snap = () => nodes.map((o) => [o.position.x, o.position.y, o.position.z, o.rotation.x, o.rotation.y, o.rotation.z, o.scale.x, o.scale.y, o.scale.z, o.visible ? 1 : 0, ms(o)].join());
    const S = []; const step = (n = 3, dt = 0.2) => { for (let i = 0; i < n; i++) this.update(dt); S.push(snap()); };
    step(); this.setMotion(sp.walk, 'calm'); step(8); this.setMotion(sp.run, 'flee'); step(8); this.setMotion(0, 'alert'); this.roar(); step(4); this.hurt(); step(2);
    for (const k of sp.atk || []) { this.attack(k, false); step(3, 0.25); this.attack(k, true); step(3, 0.25); }
    this.setMotion(0, 'calm'); this.leap(0.6); step(2); this.look(0.6); step(2); this.graze(0.6); step(3); { this.die(); step(8, 0.2); this.revive(); step(1); }
    const moving = new Set(); nodes.forEach((o, i) => { for (let k = 1; k < S.length; k++) if (S[k][i] !== S[0][i]) { moving.add(o); break; } });
    all.forEach((o, i) => { o.position.copy(rest[i][0]); o.quaternion.copy(rest[i][1]); o.scale.copy(rest[i][2]); o.visible = rest[i][3]; });
    Object.assign(this, { ph: 0, spd: 0, want: 0, mood: 'calm', alertK: 0, fleeK: 0, atk: null, hurtT: -1, roarT: -1, dyingT: -1, dead: false, leapK: 0, standK: 0, grazeK: 0, lookLeft: 0, grazeLeft: 0, leapLeft: 0 });
    const under = (o) => { for (let a = o; a && a !== g0 && !a.isBone; a = a.parent) if (moving.has(a)) return true; return false };
    const rb = new THREE.Bone(); g0.add(rb); const bl = [rb, ...this.bones], bi = new Map(bl.map((b, i) => [b, i]));
    g0.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(g0.matrixWorld).invert(), H = Math.max(0.5, this.height);
    const own = (o) => { for (let a = o; a && a !== g0; a = a.parent) if (!a.visible) return -1; for (let a = o.parent; a && a !== g0; a = a.parent) if (a.isBone) return bi.get(a); return 0; };
    const ent = new Map(), meshes = []; g0.traverse((o) => { if (o.isMesh) meshes.push(o); });
    let idx = 0;
    for (const o of meshes) {
      idx++; if (under(o) || Array.isArray(o.material) || o.children.length) continue; const mt = o.material; if (mt.transparent || mt.alphaMap || mt.map) continue; const b = own(o); if (b < 0) continue;
      const lit = (mt.emissive ? mt.emissive.getHex() : 0) !== 0, fold = !lit && mt.metalness < 0.5, rq = Math.round(mt.roughness * 5), mq = Math.round((mt.metalness || 0) * 4), k = (fold ? 'vc' + rq + '_' + mq : [mt.type, mt.color.getHex(), mt.roughness, mt.metalness, mt.emissive.getHex(), mt.emissiveIntensity, mt.side, mt.flatShading].join('|')) + '|' + (o.castShadow ? 1 : 0);
      const m4 = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), c = o.geometry.clone(); if (!c.index) c.setIndex(Array.from({ length: c.attributes.position.count }, (_, i) => i));
      for (const a of Object.keys(c.attributes)) if (!['position', 'normal', 'uv'].includes(a)) c.deleteAttribute(a);
      const n = c.attributes.position.count; if (!c.attributes.uv) c.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
      c.applyMatrix4(m4); if (m4.determinant() < 0) { const ix = c.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } }
      const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4); for (let i = 0; i < n; i++) { si[i * 4] = b; sw[i * 4] = 1; }
      c.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); c.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
      if (fold) {   // BELEZA: sombra de oclusão (embaixo mais escuro, em cima mais claro), gradiente de altura e variação leve de tom por peça — tudo assado na cor do vértice (custo zero na GPU)
        const col = new Float32Array(n * 3), nn = c.attributes.normal, pp = c.attributes.position, jit = 0.93 + 0.14 * h01(idx), hue = h01(idx * 1.7) - 0.5;
        for (let i = 0; i < n; i++) { const ao = 0.66 + 0.34 * (nn.getY(i) * 0.5 + 0.5), hy = Math.min(1, Math.max(0, pp.getY(i) / H)), gr = 0.9 + 0.2 * hy, q = ao * gr * jit; col[i * 3] = Math.min(1, mt.color.r * q * (1 + hue * 0.08)); col[i * 3 + 1] = Math.min(1, mt.color.g * q); col[i * 3 + 2] = Math.min(1, mt.color.b * q * (1 - hue * 0.08)); }
        c.setAttribute('color', new THREE.BufferAttribute(col, 3));
      }
      const e = ent.get(k) || ent.set(k, { mat: fold ? vcMat(rq, mq) : mt, g: [], o: [], cs: o.castShadow }).get(k); e.g.push(c); e.o.push(o);
    }
    if (!ent.size) { g0.remove(rb); return; }
    const sk = new THREE.Skeleton(bl), made = [];
    for (const e of ent.values()) { const mg = e.g.length > 1 ? mergeGeometries(e.g) : e.g[0]; if (!mg) continue; if (e.g.length > 1) e.g.forEach((c) => c.dispose()); const sm = new THREE.SkinnedMesh(mg, e.mat); sm.castShadow = e.cs; sm.receiveShadow = true; sm.frustumCulled = false; e.o.forEach((o) => o.parent.remove(o)); g0.add(sm); made.push(sm); }   // (as geometrias das peças são COMPARTILHADAS entre os animais: não se descarta nada)
    g0.updateMatrixWorld(true); made.forEach((m) => m.bind(sk));
  }
  dispose() { this.group.removeFromParent(); }   // geometrias e materiais são compartilhados entre os animais: nada para liberar aqui
}

// ======================================================================== detalhes de cada espécie
// FOGO/FUMAÇA BARATOS: em vez de dezenas de malhas, 1 Points por tipo (sprite redondo, cor+alfa por partícula) — mesma ideia do neon dos personagens
let SPR = null; const _V = new THREE.Vector3(), _I = new THREE.Matrix4();
function fxPoints(c, n, size, add) {
  if (!SPR && typeof document !== 'undefined') { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); SPR = new THREE.CanvasTexture(cv); SPR.colorSpace = THREE.SRGBColorSpace; }
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 4);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 4));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size, map: SPR, vertexColors: true, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending })); pts.frustumCulled = false; c.group.add(pts);
  return { pts, begin() { c.group.updateMatrixWorld(true); _I.copy(c.group.matrixWorld).invert(); },
    set(i, bone, x, y, z, hex, a) { _V.set(x, y, z); bone.localToWorld(_V); _V.applyMatrix4(_I); pos[i * 3] = _V.x; pos[i * 3 + 1] = _V.y; pos[i * 3 + 2] = _V.z; col[i * 4] = ((hex >> 16) & 255) / 255; col[i * 4 + 1] = ((hex >> 8) & 255) / 255; col[i * 4 + 2] = (hex & 255) / 255; col[i * 4 + 3] = a; },
    flush() { geo.attributes.position.needsUpdate = geo.attributes.color.needsUpdate = true; } };
}
const FEATURES = {
  // MAPINGUARI: gigante peludo de um olho só e uma boca enorme na barriga (a lenda amazônica); solta um fedor verde
  mapinguari(c) {
    const m = c.mats, sp = c.sp, fur = M(sp.colors.ac), eye = M('#ff3b1a', { emissive: '#ff2200', emissiveIntensity: 1.3 });
    for (let i = 0; i < 26; i++) { const a = i * 2.39, k = (i % 9) / 8; cn(c.body, 0.16, 0.7 + (i % 4) * 0.12, Math.sin(a) * sp.w * 0.52, sp.bodyH * 0.18 + Math.abs(Math.cos(a)) * sp.bodyH * 0.34, -sp.bodyL * 0.46 + k * sp.bodyL * 0.92, fur, Math.sin(a) * 0.7, 0, Math.cos(a) * 0.5); }   // pelo comprido e emaranhado
    for (const a of c.arms) for (let i = 0; i < 5; i++) cn(a.el, 0.12, 0.5, (i - 2) * 0.1, -sp.armL * 0.18, -0.1, fur, Math.PI, 0, 0);
    const big = put(c.head, new THREE.SphereGeometry(c.headW * 0.34, 8, 6), eye, 0, c.headW * 0.2, sp.headL * 0.5); big.scale.set(1, 1, 0.7);   // olho único na testa
    // BOCA NA BARRIGA: enorme, na frente do tronco (aparece de lado e de frente), com dentes em cima e embaixo e a língua vermelha; abre e fecha mastigando
    const bz = sp.bodyL * 0.5 + 0.03, by = -sp.bodyH * 0.18, bw = sp.w * 0.82, bh = sp.bodyH * 0.46, gut = M('#2a0a0a'), tongue = M('#c8323c', { roughness: 0.6 });
    bx(c.body, bw * 1.08, bh * 1.12, 0.12, 0, by, bz - 0.05, fur); bx(c.body, bw, bh, 0.1, 0, by, bz, gut); const tg = bx(c.body, bw * 0.5, 0.16, 0.5, 0, by - bh * 0.18, bz + 0.2, tongue);
    const upper = [], lower = []; for (let i = 0; i < 9; i++) { const x = (i / 8 - 0.5) * bw * 0.9; upper.push(cn(c.body, 0.07, 0.34, x, by + bh * 0.44, bz + 0.12, m.tooth, Math.PI, 0, 0)); lower.push(cn(c.body, 0.07, 0.3, x, by - bh * 0.44, bz + 0.12, m.tooth, 0, 0, 0)); }
    c.fx.push((t) => { const o = 0.5 + 0.5 * Math.sin(t * 2.4); tg.position.z = bz + 0.2 + o * 0.18; upper.forEach((q) => { q.position.y = by + bh * 0.44 - o * 0.05; }); lower.forEach((q) => { q.position.y = by - bh * 0.44 + o * 0.05; }); });
    const gas = fxPoints(c, 4, 3.2, false);
    { const red = new THREE.PointLight(0xff1a1a, 7, 24, 1.5); red.position.set(0, sp.bodyH * 0.9, 0.3); c.body.add(red); c.fx.push(() => { red.intensity = 7; }); }   /* luz VERMELHA de terror: o Mapinguari clareia o chão em volta */
    c.fx.push((t) => { gas.begin(); for (let i = 0; i < 4; i++) { const a = t * 0.6 + i * 1.57; gas.set(i, c.root, Math.cos(a) * 1.4, 0.8 + 0.5 * Math.sin(t * 1.3 + i), Math.sin(a) * 1.4, 0x8fd35a, 0.22 + 0.06 * Math.sin(t * 2 + i)); } gas.flush(); });   // nuvem fedorenta em volta (pontos)
  },
  // MULA SEM CABEÇA (versão assustadora): égua carbonizada e enorme, costelas à mostra, rachaduras de brasa no corpo, coto de pescoço com osso e uma FOGUEIRA no lugar da cabeça,
  // crina e cauda em chamas, ferraduras em brasa que soltam fogo a cada passada, brasas subindo e luz laranja pulsando
  mula(c) {
    const m = c.mats, sp = c.sp; for (const o of [...c.head.children]) o.visible = false;   // sem cabeça
    const ember = M('#ff5a10', { emissive: '#ff4a00', emissiveIntensity: 1.9, roughness: 0.5 }), hot = M('#ffe27a', { emissive: '#ffd23a', emissiveIntensity: 2.2, roughness: 0.4 }), red = M('#c4200a', { emissive: '#e0360a', emissiveIntensity: 1.5, transparent: true, opacity: 0.88, roughness: 0.4 }), bone = M('#d8ccb0', { roughness: 0.7 }), char = M('#120c0a', { roughness: 1 });
    for (let i = 0; i < 16; i++) { const a = i * 2.1, k = i / 16; bx(c.body, 0.05, 0.08 + (i % 3) * 0.05, 0.5 + (i % 4) * 0.25, Math.sin(a) * sp.bodyW * 0.52, sp.bodyH * 0.12 * Math.cos(a), -sp.bodyL * 0.44 + k * sp.bodyL * 0.88, ember, 0, 0, Math.sin(a) * 0.5); }   // rachaduras de brasa na pele queimada
    for (const sd of [-1, 1]) for (let i = 0; i < 7; i++) bx(c.body, 0.07, sp.bodyH * 0.62, 0.09, sd * (sp.bodyW * 0.5 + 0.03), -sp.bodyH * 0.02, -sp.bodyL * 0.3 + i * sp.bodyL * 0.1, bone, 0, 0, sd * 0.18);   // costelas expostas
    for (let i = 0; i < 6; i++) bx(c.body, 0.1, 0.1, 0.1, 0, sp.bodyH * 0.52, -sp.bodyL * 0.4 + i * sp.bodyL * 0.15, bone);   // coluna aparente
    bx(c.head, sp.bodyW * 0.55, sp.bodyW * 0.55, 0.4, 0, 0, 0.1, char); bx(c.head, 0.2, 0.2, 0.7, 0, 0.02, 0.42, bone); bx(c.head, 0.3, 0.3, 0.14, 0, 0.02, 0.8, bone);   // coto do pescoço com a vértebra de fora
    const flames = [];   // (a fogueira da cabeça agora é de bolinhas de fogo + fumaça, igual ao capô do carro pegando fogo: ver 'fogoCabeca' abaixo)
    const mkF = (mat, r, h, n, spread, y0) => { for (let i = 0; i < n; i++) { const a = i * 2.4, f = put(c.head, coneG(r * (0.8 + (i % 3) * 0.18), h * (0.8 + (i % 4) * 0.2), 7), mat, Math.cos(a) * spread, y0, 0.85 + Math.sin(a) * spread * 0.8); f.userData.ph = i * 1.7; f.userData.h = h; flames.push(f); } };
    const manes = []; for (const g of [c.neckA, c.neckB]) for (let i = 0; i < 5; i++) { manes.push({ g, x: 0, y: sp.bodyW * 0.3, z: (g === c.neckA ? 0.15 : 0.1) + i * (sp.neckL * 0.18), ph: i * 1.3, hot: i % 2, h: 0.7 + (i % 2) * 0.3 }); }   // crina em chamas (pontos)
    for (const g of c.tails) manes.push({ g, x: 0, y: 0.1, z: -0.2, ph: Math.random() * 6, hot: 0, h: 0.9, tail: 1 });   // cauda em chamas (pontos)
    const hooves = []; for (const l of c.legs) { bx(l.ankle, 0.5, 0.07, 0.56, 0, 0.05, 0.12, M('#ff7a2a', { emissive: '#ff5a10', emissiveIntensity: 2, metalness: 0.4, roughness: 0.4 })); hooves.push({ g: l.ankle, ph: Math.random() * 6 }); }   // ferraduras em brasa e fogo nas patas
    const glow = new THREE.PointLight(0xff1a1a, 7, 24, 1.5);   /* luz VERMELHA de terror: clareia em volta da Mula */ glow.position.set(0, 0.8, 1.0); c.head.add(glow);
    const pool = put(c.root, new THREE.CylinderGeometry(2.8, 2.8, 0.03, 20), new THREE.MeshBasicMaterial({ color: 0xff2410, transparent: true, opacity: 0.2, depthWrite: false }), 0, 0.03, 0);   // brilho no chão em volta
    // FOGO DA CABEÇA = o do CAPÔ DO CARRO PEGANDO FOGO (client/js/effects/vehFx.js › _puff): bolinhas que sobem e somem — fogo laranja/amarelo (aditivo, 0,7 s) misturado com fumaça preta e cinza (1,6–2,4 s)
    const fogoCabeca = []; for (let i = 0; i < 44; i++) fogoCabeca.push({ fire: i < 26, ph: (i * 0.6180339) % 1, u0: 9, ox: 0, oz: 0, c: 0, hex: 0xff6a10 });
    const fireB = fxPoints(c, 26, 2.0, true), smoke = fxPoints(c, 18, 3.2, false), fireS = fxPoints(c, manes.length * 2 + hooves.length * 3, 1.0, true), pend = [...manes, ...hooves];
    c.fx.push((t) => {
      fireB.begin(); smoke.begin(); fireS.begin(); let fi = 0, si = 0;
      fogoCabeca.forEach((u) => { const life = u.fire ? 0.7 : 1.6 + u.c * 0.8, k = ((t / life + u.ph) % 1);   // k = idade 0..1 (volta ao zero = nasce de novo)
        if (k < u.u0) { u.ox = (Math.random() - 0.5) * 0.9; u.oz = (Math.random() - 0.5) * 0.8; u.c = Math.random() < 0.25 ? 1 : 0; u.hex = u.fire ? (Math.random() < 0.5 ? 0xff6a10 : 0xffc030) : (u.c ? 0x1c1c1c : 0x666a70); }
        u.u0 = k; const K = 1.6, vy = u.fire ? 1.6 : 1.2 + u.c * 0.4, a0 = u.fire ? 0.95 : 0.5, x = u.ox * K * 0.6 + 0.25 * k * life, y = 0.1 + vy * k * life * K, z = 0.85 + u.oz * K * 0.6;
        if (u.fire) fireB.set(fi++, c.head, x, y, z, u.hex, a0 * (1 - k)); else smoke.set(si++, c.head, x, y + 0.4, z, u.hex, a0 * (1 - k)); });
      let qi = 0; for (const p of manes) { const s0 = 0.7 + 0.5 * Math.abs(Math.sin(t * 2.6 + p.ph)); fireS.set(qi++, p.g, p.x, p.y, p.z, p.hot ? 0xff7a1a : 0xff3a10, 0.85); fireS.set(qi++, p.g, p.x, p.y + p.h * s0 * 0.5, p.z, 0xffb030, 0.55 * s0); }
      for (const p of hooves) { const s0 = 0.5 + 0.9 * Math.abs(Math.sin(t * 3.4 + p.ph)); for (let j = 0; j < 3; j++) fireS.set(qi++, p.g, 0, 0.2 + j * 0.2 * s0, 0.1, j ? 0xffb030 : 0xff5a10, 0.9 - j * 0.25); }
      fireB.flush(); smoke.flush(); fireS.flush();
      glow.intensity = 7;   /* luz de ponto vermelha, parada (sem piscar) */ pool.material.opacity = 0.2;
    });
  },
  trex(c) {
    const m = c.mats, sp = c.sp, w = sp.w; for (let i = 0; i < 9; i++) cn(c.body, 0.07 + w * 0.04, 0.2 + w * 0.1, 0, sp.bodyH * 0.6, -sp.bodyL * 0.42 + i * (sp.bodyL * 0.84 / 8), m.ac, 0);
    bx(c.head, c.headW * 1.04, c.headW * 0.3, c.sp.headL * 0.5, 0, c.headW * 0.5, c.sp.headL * 0.4, m.ac);
  },
  raptor(c) {
    const m = c.mats, sp = c.sp; for (const l of c.legs) cn(l.knee, 0.07, 0.42, 0, -l.len2 + 0.1, 0.18, m.claw, Math.PI * 0.35 + 0.4, 0, 0);          // garra de foice
    for (let i = 0; i < 7; i++) cn(c.head, 0.03, 0.26 + (i % 2) * 0.08, (i - 3) * 0.03, c.headW * 0.5, c.sp.headL * 0.22 - i * 0.03, i % 2 ? m.ac : m.sk, -0.9 - i * 0.05, 0, 0);   // crista de penas
    const tip = c.tails[c.tails.length - 1]; for (let i = 0; i < 5; i++) bx(tip, 0.05, 0.02, 0.5 + (i % 2) * 0.1, (i - 2) * 0.1, 0, -0.45, i % 2 ? m.ac : m.sk, 0, (i - 2) * 0.12, 0);
    for (const a of c.arms) for (let i = 0; i < 5; i++) bx(a.el, 0.02, 0.4 + i * 0.03, 0.12, a.sd * 0.1, -0.25 - i * 0.02, -0.05, i % 2 ? m.ac : m.sk, 0, 0, a.sd * (i - 2) * 0.1);
  },
  dilo(c) {
    const m = c.mats, ac = M(c.sp.colors.ac, { emissive: c.sp.colors.ac, emissiveIntensity: 0.4 }), frill = grp(c.neckB, 0, 0.05, c.sp.neckL * 0.25); const disc = put(frill, new THREE.CylinderGeometry(0.55, 0.5, 0.04, 14), ac, 0, 0, 0, Math.PI / 2 + 0.25, 0, 0); disc.scale.set(0.2, 1, 0.2);
    for (const sd of [-1, 1]) bx(c.head, 0.04, 0.3, 0.5, sd * 0.1, c.headW * 0.9, c.sp.headL * 0.4, ac, -0.2, 0, sd * 0.12);
    const spit = put(c.jaw, new THREE.SphereGeometry(0.05, 6, 4), M('#9cff4a', { emissive: '#9cff4a', emissiveIntensity: 1.6 }), 0, 0.08, c.sp.headL * 0.7);
    c.fx.push((t, s) => { const o = 0.2 + 0.8 * Math.max(s.roarE, s.atkP > 0.15 && s.atkP < 0.7 ? 1 : 0, s.alert * 0.5); disc.scale.set(0.2 + o * 0.9, 1, 0.2 + o * 0.9); spit.visible = s.roarE > 0.3 || s.A === 'bite'; });
  },
  carno(c) {
    const m = c.mats, sp = c.sp; for (const sd of [-1, 1]) { cn(c.head, 0.09, 0.45, sd * c.headW * 0.5, c.headW * 0.65, sp.headL * 0.34, m.tooth, -0.2, 0, sd * 0.35); bx(c.head, c.headW * 0.35, 0.1, 0.3, sd * c.headW * 0.4, c.headW * 0.42, sp.headL * 0.36, m.ac); }
    for (let i = 0; i < 7; i++) cn(c.body, 0.06, 0.18, 0, sp.bodyH * 0.6, -sp.bodyL * 0.4 + i * (sp.bodyL * 0.8 / 6), m.ac, 0);
  },
  spino(c) {
    const m = c.mats, sp = c.sp, glow = M(sp.colors.ac, { emissive: sp.colors.ac, emissiveIntensity: 0.9 }), fins = [];
    for (let i = 0; i < 11; i++) { const u = (i + 0.5) / 11, h = 0.5 + 1.6 * Math.sin(u * Math.PI), f = bx(c.body, 0.07, h, 0.2, 0, sp.bodyH * 0.5 + h / 2 - 0.1, sp.bodyL * 0.46 - u * sp.bodyL * 0.95, glow); f.material = glow.clone(); fins.push(f); }
    bx(c.body, 0.04, 1.6, sp.bodyL * 0.8, 0, sp.bodyH * 0.5 + 0.9, 0, M(sp.colors.ac, { transparent: true, opacity: 0.4, emissive: sp.colors.ac, emissiveIntensity: 0.3, side: THREE.DoubleSide }));
    c.fx.push((t) => fins.forEach((f, i) => { f.material.emissiveIntensity = 0.5 + 0.9 * Math.max(0, Math.sin(t * 3 - i * 0.7)); }));
  },
  teri(c) {
    const m = c.mats, sp = c.sp; cn(c.head, 0.12, 0.3, 0, -c.headW * 0.1, sp.headL * 0.95, M('#d9c9a0', { roughness: 0.6 }), Math.PI / 2 + 0.15, 0, 0);
    for (let i = 0; i < 16; i++) { const a = i * 2.4; bx(c.body, 0.34, 0.26, 0.34, Math.sin(a) * sp.w * 0.46, sp.bodyH * 0.1 + Math.abs(Math.cos(a * 1.3)) * sp.bodyH * 0.45, ((i % 8) - 3.5) * sp.bodyL * 0.11, i % 2 ? M('#b89a6a') : m.sk, a, a * 0.5, 0); }
    for (const a of c.arms) { for (let i = 0; i < 3; i++) cn(a.el, 0.045, 0.85, (i - 1) * 0.11, -sp.armL * 0.5 - 0.25, 0.28, m.claw, Math.PI * 0.55); }   // garras de foice gigantes
  },
  pachy(c) {
    const m = c.mats, sp = c.sp; const dome = put(c.head, new THREE.SphereGeometry(c.headW * 0.62, 8, 6), M(sp.colors.ac, { roughness: 0.55 }), 0, c.headW * 0.32, sp.headL * 0.32); dome.scale.set(1, 0.85, 1.15);
    for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * Math.PI * 1.2; cn(c.head, 0.045, 0.16 + (i % 2) * 0.08, Math.sin(a) * (c.headW * 0.7), c.headW * 0.1, sp.headL * 0.1 - Math.cos(a) * 0.12, m.tooth, 0, 0, -a); }
  },
  ovi(c) {
    const m = c.mats, sp = c.sp; cn(c.head, 0.2, 0.34, 0, -c.headW * 0.06, sp.headL * 0.9, M('#f1c40f', { roughness: 0.5 }), Math.PI / 2 + 0.2, 0, 0); bx(c.head, 0.08, 0.5, 0.5, 0, c.headW * 0.55 + 0.2, sp.headL * 0.2, m.ac, -0.15, 0, 0);
    const tip = c.tails[c.tails.length - 1]; for (let i = 0; i < 7; i++) bx(tip, 0.05, 0.02, 0.55, (i - 3) * 0.1, 0, -0.5, i % 2 ? m.ac : m.sk, 0, (i - 3) * 0.14, 0);
    for (const a of c.arms) for (let i = 0; i < 5; i++) bx(a.el, 0.02, 0.5 + i * 0.04, 0.14, a.sd * 0.1, -0.35, -0.05, i % 2 ? m.ac : m.sk, 0, 0, a.sd * (i - 2) * 0.1);
  },
  // ---------------- mamíferos ----------------
  mamute(c) {
    const m = c.mats, sp = c.sp, hw = c.headW; bx(c.head, hw * 0.9, hw * 0.5, hw * 0.9, 0, hw * 0.55, sp.headL * 0.22, m.sk);            // testa alta
    for (const sd of [-1, 1]) { bx(c.head, 0.08, hw * 1.0, hw * 0.9, sd * hw * 0.62, hw * 0.1, sp.headL * 0.18, m.sk, 0, sd * 0.3, 0); const tk = grp(c.head, sd * hw * 0.34, -hw * 0.28, sp.headL * 0.62); let p = tk; for (let i = 0; i < 5; i++) { const s = grp(p, 0, 0, i === 0 ? 0 : 0.5); s.rotation.set(i === 0 ? 0.5 : -0.3, sd * 0.07, sd * -0.1); bx(s, 0.17 - i * 0.015, 0.17 - i * 0.015, 0.55, 0, 0, 0.27, m.tooth); p = s; } }
    let p = grp(c.head, 0, -hw * 0.1, sp.headL * 0.92); for (let i = 0; i < 5; i++) { const s = grp(p, 0, i === 0 ? 0 : -0.32, 0); bx(s, 0.34 - i * 0.04, 0.4, 0.34 - i * 0.04, 0, -0.18, 0, m.sk); c.trunk.push(s); p = s; }
    c.fx.push((t, s) => c.trunk.forEach((g, i) => { g.rotation.x = Math.sin(t * 1.3 - i * 0.55) * 0.14 + (i === 0 ? 0.2 : 0) - (s.roarE * 0.5) * (i / 4) - (s.A === 'gore' ? 0.3 : 0); g.rotation.z = Math.sin(t * 0.8 + i) * 0.05; }));
    for (let i = 0; i < 18; i++) { const sd = i % 2 ? 1 : -1; bx(c.body, 0.4, 1.0 + (i % 3) * 0.2, 0.5, sd * sp.bodyW * 0.5, -sp.bodyH * 0.48, -sp.bodyL * 0.45 + Math.floor(i / 2) * (sp.bodyL * 0.9 / 8), c.mats.bl, 0, 0, sd * 0.15); }     // pelos longos ("saia") do mamute
    bx(c.body, sp.bodyW * 0.8, 0.7, sp.bodyL * 0.3, 0, sp.bodyH * 0.55, sp.bodyL * 0.22, m.sk);
    for (const sd of [-1, 1]) { const ear = grp(c.head, sd * hw * 0.55, hw * 0.25, sp.headL * 0.06); bx(ear, 0.07, hw * 0.7, hw * 0.7, sd * 0.1, 0, -0.1, m.bl); c.fx.push((t) => { ear.rotation.y = sd * (0.3 + Math.sin(t * 2 + sd) * 0.2); }); }
  },
  smilo(c) {
    const m = c.mats, sp = c.sp, hw = c.headW; for (const sd of [-1, 1]) { cn(c.head, 0.07, 0.62, sd * hw * 0.28, -hw * 0.3 - 0.15, sp.headL * 0.78, m.tooth, Math.PI + 0.12, 0, 0); bx(c.head, 0.1, 0.2, 0.12, sd * hw * 0.34, hw * 0.55, sp.headL * 0.1, m.sk); }
    for (let i = 0; i < 7; i++) for (const sd of [-1, 1]) bx(c.body, 0.04, 0.45, 0.1, sd * sp.bodyW * 0.5, sp.bodyH * 0.05, -sp.bodyL * 0.38 + i * (sp.bodyL * 0.76 / 6), m.ac, 0, 0, sd * 0.1);
    bx(c.body, sp.bodyW * 0.7, 0.2, sp.bodyL * 0.6, 0, sp.bodyH * 0.5, 0, m.ac);
  },
  pregui(c) {
    const m = c.mats, sp = c.sp; for (const l of c.legs.filter((q) => q.front)) for (let i = 0; i < 3; i++) cn(l.ankle, 0.07, 0.75, (i - 1) * 0.16, 0.1, 0.35, M('#e8dcc0', { roughness: 0.5 }), Math.PI * 0.58);   // garras enormes
    for (let i = 0; i < 14; i++) bx(c.body, 0.5, 0.9, 0.5, ((i % 7) - 3) * sp.bodyW * 0.17, sp.bodyH * 0.3 + (i % 2) * 0.12, -sp.bodyL * 0.4 + Math.floor(i / 3.5) * (sp.bodyL * 0.2), i % 3 ? m.sk : m.bl, 0.2, i, 0);
    bx(c.body, sp.bodyW * 0.7, sp.bodyH * 0.5, sp.bodyL * 0.34, 0, sp.bodyH * 0.45, sp.bodyL * 0.15, m.bl); c.neckA.rotation.x = 0.15;
  },
  glipto(c) {
    const m = c.mats, sp = c.sp, shell = put(c.body, new THREE.SphereGeometry(1, 9, 6), M(sp.colors.sk, { roughness: 0.7 }), 0, sp.bodyH * 0.2, -0.05); shell.scale.set(sp.bodyW * 0.62, sp.bodyH * 0.78, sp.bodyL * 0.58);
    for (let i = 0; i < 8; i++) bx(c.body, sp.bodyW * (0.6 - Math.abs(i - 3.5) * 0.05), 0.12, 0.25, 0, sp.bodyH * (0.62 - Math.abs(i - 3.5) * 0.1), -sp.bodyL * 0.38 + i * (sp.bodyL * 0.76 / 7), M(sp.colors.bl, { roughness: 0.6 }));
    const tip = c.tails[c.tails.length - 1]; const club = put(tip, new THREE.SphereGeometry(0.42, 7, 5), M(sp.colors.ac), 0, 0, -0.45); for (let i = 0; i < 8; i++) { const a = i * 0.8; cn(club, 0.07, 0.3, Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0, m.tooth, 0, 0, a - Math.PI / 2); }
    c.fx.push((t, s) => { shell.scale.y = sp.bodyH * 0.78 * (1 + Math.sin(t * 1.5) * 0.01); });
  },
  elasmo(c) {
    const m = c.mats, sp = c.sp, hw = c.headW; // o chifre: um só, enorme, nascendo da TESTA (entre os olhos, em cima do crânio), base grossa e ponta para cima, inclinada um pouco para frente
    bx(c.head, hw * 0.62, 0.3, sp.headL * 0.3, 0, hw * 0.5, sp.headL * 0.3, m.bl); cn(c.head, 0.3, 0.8, 0, hw * 0.56, sp.headL * 0.3, m.bl, 0.15, 0, 0, 8); cn(c.head, 0.2, 1.7, 0, hw * 0.56 + 0.5, sp.headL * 0.3 + 0.07, m.tooth, 0.22, 0, 0, 8);
    bx(c.body, sp.bodyW * 0.8, 0.8, sp.bodyL * 0.28, 0, sp.bodyH * 0.55, sp.bodyL * 0.26, m.sk);
    for (const sd of [-1, 1]) bx(c.head, 0.07, hw * 0.5, hw * 0.5, sd * hw * 0.5, hw * 0.55, -0.05, m.bl, 0, 0, sd * 0.3);
    for (let i = 0; i < 6; i++) bx(c.body, 0.35, 0.55, 0.45, ((i % 2) * 2 - 1) * sp.bodyW * 0.5, -sp.bodyH * 0.2, -sp.bodyL * 0.3 + Math.floor(i / 2) * 0.9, m.bl, 0, 0, ((i % 2) * 2 - 1) * 0.2);
  },
  mega(c) {
    const m = c.mats, sp = c.sp, hw = c.headW, ant = M(sp.colors.ac, { roughness: 0.7 });
    for (const sd of [-1, 1]) { const a = grp(c.head, sd * hw * 0.35, hw * 0.45, sp.headL * 0.1); a.rotation.set(-0.3, 0, sd * 0.5); bx(a, 0.1, 0.1, 1.0, sd * 0.1, 0, 0.5, ant); const palm = grp(a, sd * 0.1, 0.05, 1.0); palm.rotation.set(-0.15, sd * 0.25, sd * 0.1); bx(palm, 1.5, 0.07, 1.1, sd * 0.75, 0.15, 0.4, ant); for (let i = 0; i < 4; i++) bx(palm, 0.1, 0.1, 0.6 + (i % 2) * 0.2, sd * (0.3 + i * 0.36), 0.2, 1.05, ant, -0.2, 0, 0); }
    bx(c.body, sp.bodyW * 0.7, 0.35, sp.bodyL * 0.5, 0, sp.bodyH * 0.45, 0, m.bl);
    for (const sd of [-1, 1]) bx(c.head, 0.06, hw * 0.55, hw * 0.4, sd * hw * 0.55, hw * 0.4, -0.1, m.sk, 0, 0, sd * 0.5);
  },
  gigan(c) {
    const m = c.mats, sp = c.sp, hw = c.headW; bx(c.head, hw * 0.8, hw * 0.55, hw * 0.55, 0, -hw * 0.05, sp.headL * 0.78, m.bl); bx(c.head, hw * 1.1, 0.18, 0.3, 0, hw * 0.28, sp.headL * 0.45, m.ac);   // rosto escuro e sobrancelha
    bx(c.body, sp.bodyW * 1.25, sp.bodyH * 0.6, sp.bodyL * 0.45, 0, sp.bodyH * 0.35, sp.bodyL * 0.2, m.sk); for (let i = 0; i < 16; i++) bx(c.body, 0.25, 0.7, 0.3, ((i % 8) - 3.5) * sp.bodyW * 0.15, sp.bodyH * 0.5 + (i % 2) * 0.1, -sp.bodyL * 0.3 + Math.floor(i / 8) * sp.bodyL * 0.5, m.ac, 0.3, i, 0);
    for (const l of c.legs) bx(l.ankle, 0.5, 0.16, 0.4, 0, 0.1, 0.1, m.bl);   // mãos de apoio nos nós dos dedos
  },
  macro(c) {
    const m = c.mats, sp = c.sp, hw = c.headW; bx(c.head, hw * 0.35, hw * 0.35, hw * 0.8, 0, -hw * 0.35, sp.headL * 0.95, m.bl, 0.5, 0, 0);   // focinho curto de tromba
    for (const sd of [-1, 1]) bx(c.head, 0.05, hw * 0.55, hw * 0.4, sd * hw * 0.5, hw * 0.5, 0.0, m.sk, 0, 0, sd * 0.4);
    bx(c.body, sp.bodyW * 0.8, 0.4, sp.bodyL * 0.5, 0, sp.bodyH * 0.5, -sp.bodyL * 0.05, m.ac);
  }
};
export const makeCreature = (id) => new Creature(id);
