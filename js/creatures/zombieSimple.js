// ZUMBI PROCEDURAL (sem depender do resto do jogo): usado no Bestiário do SITE (onde o personagem completo do jogo não existe).
// Mesma interface dos bichos: group, sp, height, setMotion(v), update(dt), attack(), roar(), dispose(). Olha para +Z, como os bichos.
// 4 tipos do jogo: walker (Infectado), runner (Corredor, magro), brute (Brutamontes, largo), tank (Tanque, enorme, com placas de pele rachada).
import * as THREE from 'three';
import { INFECTADOS } from '../../../shared/bestiary.js';
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0.02, flatShading: true, ...o });
const box = (p, sx, sy, sz, x, y, z, m, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; p.add(o); return o; };
const grp = (p, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
const LOOK = {
  walker: { skin: '#7a9a78', shirt: '#6b5d3a', pants: '#2f3640', w: 1, hunch: 0.28 },
  runner: { skin: '#8aa684', shirt: '#7a2a2a', pants: '#3a3f4a', w: 0.85, hunch: 0.4 },
  brute: { skin: '#6f8a6c', shirt: '#3d4a36', pants: '#2a2a2a', w: 1.35, hunch: 0.3 },
  tank: { skin: '#5f7a5c', shirt: '#2a2a2f', pants: '#1c1c20', w: 1.6, hunch: 0.22 }
};
export class SimpleZombie {
  constructor(id) {
    const T = INFECTADOS[id], L = LOOK[id] || LOOK.walker; this.id = id; this.sp = T; this.group = new THREE.Group(); this.root = grp(this.group); this.t = Math.random() * 10; this.spd = 0; this.want = 0; this.atk = -1;
    const skin = M(L.skin), shirt = M(L.shirt), pants = M(L.pants), blood = M('#6e0f16', { roughness: 0.6 }), vein = M('#3b5a50'), eye = M('#d9d26a', { emissive: '#8a7a10', emissiveIntensity: 0.6 }), dark = M('#14110f'), bone = M('#cfc6aa');
    const w = L.w, s = T.h, bw = 0.5 * w, th = 0.62;
    const body = this.body = grp(this.root, 0, 0.95 * s, 0); body.rotation.x = L.hunch;
    box(body, bw * 1.5, th * 1.2, bw * 0.8, 0, 0.35 * s, 0, shirt);
    box(body, bw * 1.52, 0.2, bw * 0.82, 0, 0.58 * s, 0, blood); box(body, 0.18, 0.4, 0.04, -bw * 0.5, 0.3 * s, bw * 0.42, blood, 0, 0, 0.3); box(body, 0.22, 0.3, 0.04, bw * 0.4, 0.5 * s, bw * 0.42, M('#201a14'));   // rasgos e sangue na camisa
    if (id === 'tank' || id === 'brute') for (let i = 0; i < 5; i++) box(body, 0.34 * w, 0.12, 0.3, (i - 2) * 0.22 * w, 0.62 * s + (i % 2) * 0.05, -0.05, skin, 0.2, 0, (i - 2) * 0.1);   // ombros e costas inchados
    for (let i = 0; i < 6; i++) box(body, 0.03, 0.2, 0.03, (i - 2.5) * 0.12 * w, 0.62 * s, bw * 0.3, vein, 0, 0, 0.5 * (i % 2 ? 1 : -1));   // veias no pescoço
    const neck = grp(body, 0, 0.72 * s, 0.05), head = this.head = grp(neck, 0, 0.1, 0.06); head.rotation.x = 0.22;
    box(head, 0.36 * w, 0.4, 0.38 * w, 0, 0.12, 0, skin); const jaw = this.jaw = grp(head, 0, -0.1, 0.1); box(jaw, 0.3 * w, 0.1, 0.3 * w, 0, 0, 0.04, skin);
    for (const sd of [-1, 1]) { box(head, 0.08, 0.07, 0.04, sd * 0.1 * w, 0.18, 0.19 * w, eye); box(head, 0.1, 0.05, 0.04, sd * 0.1 * w, 0.24, 0.19 * w, dark); box(jaw, 0.03, 0.06, 0.03, sd * 0.07, 0.07, 0.17 * w, bone); }
    box(head, 0.4 * w, 0.1, 0.4 * w, 0, 0.34, -0.02, M('#2a1c14'));   // cabelo ralo
    box(head, 0.12, 0.16, 0.05, 0.1 * w, 0.1, 0.2 * w, blood, 0, 0, 0.5);   // ferida no rosto
    this.arms = []; for (const sd of [-1, 1]) { const sh = grp(body, sd * (bw * 0.88), 0.58 * s, 0.02); box(sh, 0.16 * w, 0.46, 0.16 * w, 0, -0.23, 0, shirt); const el = grp(sh, 0, -0.46, 0); box(el, 0.14 * w, 0.46, 0.14 * w, 0, -0.23, 0, skin); box(el, 0.15 * w, 0.18, 0.04, 0, -0.5, 0.0, blood); for (let k = 0; k < 3; k++) box(el, 0.03, 0.1, 0.03, (k - 1) * 0.045, -0.54, 0.02, bone); sh.rotation.x = -1.35; el.rotation.x = -0.25; this.arms.push({ sh, el, sd }); }   // braços esticados à frente
    this.legs = []; for (const sd of [-1, 1]) { const hip = grp(this.root, sd * bw * 0.4, 0.95 * s, 0); box(hip, 0.2 * w, 0.48 * s, 0.2 * w, 0, -0.24 * s, 0, pants); const kn = grp(hip, 0, -0.48 * s, 0); box(kn, 0.17 * w, 0.46 * s, 0.17 * w, 0, -0.23 * s, 0, pants); box(kn, 0.2 * w, 0.1, 0.34 * w, 0, -0.5 * s, 0.07, dark); this.legs.push({ hip, kn, sd }); }
    this.height = 1.9 * s;
  }
  setMotion(v) { this.want = Math.max(0, v); }
  attack() { this.atk = 0; } roar() { this.atk = 0; }
  update(dt) {
    dt = Math.min(0.1, dt); this.t += dt; this.spd += (this.want - this.spd) * Math.min(1, dt * 6); const t = this.t, mv = Math.min(1, this.spd / 2), ph = t * (2 + this.spd * 1.1), sw = Math.sin(ph);
    for (const l of this.legs) { const o = l.sd > 0 ? 0 : Math.PI, q = Math.sin(ph + o); l.hip.rotation.x = q * 0.7 * mv; l.kn.rotation.x = Math.max(0, -Math.cos(ph + o)) * 0.9 * mv; }
    let ar = 0; if (this.atk >= 0) { this.atk += dt; const u = this.atk / 0.7; if (u >= 1) this.atk = -1; else ar = Math.sin(u * Math.PI); }
    for (const a of this.arms) { a.sh.rotation.x = -1.35 - ar * 0.5 + Math.sin(ph + (a.sd > 0 ? 0 : Math.PI)) * 0.25 * mv + Math.sin(t * 1.6 + a.sd) * 0.05; a.el.rotation.x = -0.25 - ar * 0.6; }
    this.body.position.y = 0.95 * this.sp.h + Math.abs(sw) * 0.04 * mv - ar * 0.02; this.body.rotation.x = 0.28 + ar * 0.35 + Math.sin(t * 1.3) * 0.02; this.head.rotation.x = 0.22 + Math.sin(t * 2.1) * 0.06 + ar * 0.25; this.head.rotation.z = Math.sin(t * 0.9) * 0.08; this.jaw.rotation.x = 0.1 + ar * 0.7 + Math.max(0, Math.sin(t * 1.7)) * 0.12;
  }
  dispose() {}
}
