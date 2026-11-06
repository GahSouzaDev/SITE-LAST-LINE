import * as THREE from 'three';
import { TANK_INFO } from '/shared/tankStats.js';
// TANQUE (Batalha de Tanques): modelo low-poly feito em código, 8 variantes. Frente = -Z (como o resto do jogo). Tem o mesmo "contrato" de um Avatar/FaunaAv
// para o resto do jogo (jogadores remotos, mortes, tela final): group, update, setDead, melee, hurt, setFP, hold, dispose, kick, rec, barrelDir, eyeWorld.
// O casco gira com o yaw do grupo; a TORRE gira à parte (setTurret) e o CANO sobe e desce (pitch). Tamanho: casco 3,2 m × 6,6 m — o dobro de um carro.
const SHAPE = {   // hullH, hullW, turW, turL, barL, barR, extras
  onca: { hH: 0.8, hW: 2.8, tW: 1.8, tL: 2.2, bL: 4.2, bR: 0.12, skirts: false, extra: 'antenna' },
  anta: { hH: 1.15, hW: 3.3, tW: 2.7, tL: 3.0, bL: 3.6, bR: 0.23, skirts: true, extra: 'plow' },
  tatu: { hH: 1.0, hW: 3.2, tW: 2.5, tL: 2.7, bL: 3.4, bR: 0.2, skirts: true, extra: 'plates', dome: true },
  gaviao: { hH: 0.8, hW: 2.9, tW: 1.7, tL: 2.4, bL: 5.0, bR: 0.14, skirts: false, extra: 'wings' },
  jacare: { hH: 0.95, hW: 3.1, tW: 2.2, tL: 2.7, bL: 4.0, bR: 0.18, skirts: false, extra: 'ridge' },
  tucano: { hH: 0.9, hW: 3.0, tW: 2.1, tL: 2.5, bL: 5.4, bR: 0.17, skirts: false, extra: 'beak' },
  lobo: { hH: 0.8, hW: 2.7, tW: 1.9, tL: 2.4, bL: 4.4, bR: 0.13, skirts: false, extra: 'ears' },
  tamandua: { hH: 1.0, hW: 3.2, tW: 2.3, tL: 2.8, bL: 4.8, bR: 0.19, skirts: true, extra: 'snout' }
};
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.78, metalness: 0.15, flatShading: true, ...o });
const box = (p, w, h, l, x, y, z, m) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); o.position.set(x, y, z); p.add(o); return o; };
const cyl = (p, r1, r2, h, x, y, z, m, rz = 0, rx = 0, seg = 10) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); o.position.set(x, y, z); o.rotation.z = rz; o.rotation.x = rx; p.add(o); return o; };
export class TankAv {
  constructor(id, scale = 1) {
    const sh = SHAPE[id] || SHAPE.jacare, inf = TANK_INFO[id] || TANK_INFO.jacare;
    this.id = id; this.scale = 1.6; this.group = new THREE.Group(); this.dead = false; this.isFauna = true; this.isTank = true; this.weapon = null; this.mats = [];
    const body = mat(inf.col), dark = mat(inf.col2), track = mat(0x1d1f22, { roughness: 0.95 }), metal = mat(0x2b2f33, { metalness: 0.5 }), accent = mat(0xe8e0c0);
    this.mats.push(body, dark, track, metal, accent); const g = this.group, root = new THREE.Group(); g.add(root); this.root = root;
    const L = 6.6, hy = 0.55;   // comprimento do casco e altura do chão ao fundo do casco
    box(root, sh.hW - 0.9, sh.hH, L - 0.5, 0, hy + sh.hH / 2 + 0.25, 0, body);                                   // casco
    box(root, sh.hW - 1.1, 0.12, 1.2, 0, hy + sh.hH + 0.3, -L / 2 + 0.7, dark);                                    // glacis (placa da frente)
    box(root, sh.hW - 1.2, 0.5, 1.6, 0, hy + 0.55, L / 2 - 0.5, dark);                                          // grade do motor
    // esteiras e rodas
    this.wheels = [];
    for (const sd of [-1, 1]) {
      const x = sd * (sh.hW / 2 - 0.35); box(root, 0.75, 0.95, L, x, 0.55, 0, track);
      for (let i = 0; i < 6; i++) { const w = cyl(root, 0.42, 0.42, 0.8, x, 0.46, -L / 2 + 0.7 + i * ((L - 1.4) / 5), metal, Math.PI / 2); this.wheels.push(w); }
      if (sh.skirts) box(root, 0.12, 0.7, L - 0.8, x + sd * 0.42, 0.95, 0, body);                                  // saias de blindagem
    }
    // torre
    const tur = new THREE.Group(); tur.position.set(0, hy + sh.hH + 0.35, 0.3); root.add(tur); this.turret = tur;
    if (sh.dome) { const d = new THREE.Mesh(new THREE.SphereGeometry(sh.tW * 0.55, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), body); d.scale.set(1, 0.7, sh.tL / sh.tW); tur.add(d); } else box(tur, sh.tW, 0.85, sh.tL, 0, 0.42, 0, body);
    box(tur, sh.tW - 0.5, 0.18, sh.tL - 0.7, 0, 0.9, 0.1, dark);
    const gun = new THREE.Group(); gun.position.set(0, 0.5, -sh.tL / 2 + 0.1); tur.add(gun); this.gun = gun;                                // pivô do cano (sobe/desce)
    box(gun, 0.6, 0.6, 0.7, 0, 0, 0.15, dark);
    const bar = cyl(gun, sh.bR, sh.bR * 1.05, sh.bL, 0, 0, -sh.bL / 2, metal, 0, Math.PI / 2); this.barrel = bar;
    cyl(gun, sh.bR * 1.5, sh.bR * 1.5, 0.45, 0, 0, -sh.bL - 0.1, dark, 0, Math.PI / 2);                                              // freio de boca
    this.muzzle = new THREE.Object3D(); this.muzzle.position.set(0, 0, -sh.bL - 0.4); gun.add(this.muzzle);
    this.flash = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.8, 8), new THREE.MeshBasicMaterial({ color: 0xffb040, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })); this.flash.rotation.x = -Math.PI / 2; this.flash.position.z = -0.9; this.flash.visible = false; this.muzzle.add(this.flash);
    // metralhadora no teto da torre
    const mg = new THREE.Group(); mg.position.set(sh.tW * 0.25, 1.05, 0.2); tur.add(mg); this.mg = mg; box(mg, 0.2, 0.2, 0.5, 0, 0, 0, metal); cyl(mg, 0.04, 0.04, 1.0, 0, 0, -0.7, metal, 0, Math.PI / 2);
    // detalhes de cada tanque
    const E = sh.extra;
    if (E === 'antenna' || E === 'ears') for (const sd of E === 'ears' ? [-1, 1] : [1]) cyl(tur, 0.03, 0.02, 2.2, sd * (sh.tW / 2 - 0.2), 1.9, 0.9, metal);
    if (E === 'plow') box(root, sh.hW - 0.4, 0.8, 0.35, 0, 0.6, -L / 2 - 0.1, dark);
    if (E === 'plates') for (let i = 0; i < 4; i++) box(root, sh.hW - 0.6, 0.08, 0.55, 0, hy + sh.hH + 0.32, -L / 2 + 1.0 + i * 1.2, accent);
    if (E === 'wings') for (const sd of [-1, 1]) { const f = box(root, 1.0, 0.1, 1.8, sd * (sh.hW / 2 + 0.2), hy + sh.hH + 0.4, L / 2 - 1.2, body); f.rotation.z = -sd * 0.25; }
    if (E === 'ridge') for (let i = 0; i < 7; i++) { const sp = cyl(root, 0.0, 0.2, 0.5, 0, hy + sh.hH + 0.5, L / 2 - 0.6 - i * 0.55, accent); sp.scale.set(1, 1, 1); }
    if (E === 'beak') { const bk = cyl(gun, sh.bR * 1.9, sh.bR * 0.6, 0.9, 0, 0, -sh.bL - 0.45, mat(0xff8a1a), 0, Math.PI / 2); void bk; }
    if (E === 'snout') cyl(gun, sh.bR * 1.35, sh.bR * 0.7, sh.bL * 0.55, 0, 0, -sh.bL * 0.25, dark, 0, Math.PI / 2);
    this.hullYaw = 0; this.spin = 0; this.rcoil = 0; this.flashT = 0; this.hurtT = 0;
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  }
  // a torre fica na direção ABSOLUTA ay (mira); o grupo gira com o casco
  setTurret(ay, ap, hullYaw) { this.turret.rotation.y = ay - hullYaw; this.gun.rotation.x = ap; }
  update(dt, st = {}) {
    this.spin += (st.spd || 0) * (st.sgn || 1) * dt / 0.42; for (const w of this.wheels) w.rotation.x = this.spin;
    if (st.ay != null && st.hy != null) this.setTurret(st.ay, st.pitch || 0, st.hy);
    if (this.rcoil > 0) { this.rcoil = Math.max(0, this.rcoil - dt * 2.4); this.barrel.position.z = -this.barrel.geometry.parameters.height / 2 + this.rcoil * 0.5; } else this.barrel.position.z = -this.barrel.geometry.parameters.height / 2;
    if (this.flashT > 0) { this.flashT -= dt; this.flash.visible = this.flashT > 0; }
  }
  setDead(d) { d = !!d; if (d === this.dead) return; this.dead = d; for (const m of this.mats) m.color.multiplyScalar(d ? 0.35 : 1 / 0.35); this.turret.rotation.z = d ? 0.12 : 0; this.gun.rotation.x = d ? -0.2 : this.gun.rotation.x; }
  melee(k, big = false) { this.rcoil = 1; this.flashT = big ? 0.12 : 0.08; this.flash.visible = true; }
  fire() { this.melee('cannon', true); }
  hurt() {}
  setFP() {} hold() {} dispose() {} kick() {} rec() {}
  barrelDir() { const v = new THREE.Vector3(); this.muzzle.getWorldDirection(v); return v.negate(); }
  muzzleWorld() { return this.muzzle.getWorldPosition(new THREE.Vector3()); }
  eyeWorld() { return this.group.getWorldPosition(new THREE.Vector3()); }
}
