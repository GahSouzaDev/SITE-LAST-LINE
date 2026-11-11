// CORPO DE PANO: quando alguém morre, o corpo vira um corpo rígido com ~11 pontos de colisão (cabeça, ombros, peito, quadril, joelhos, pés).
// O tiro empurra o corpo (direção de quem atirou), ele tomba, bate no chão/parede (raios contra o mesmo BVH do mapa), rola ladeira abaixo e dorme.
// Braços e pernas balançam por molas (flop) seguindo a gravidade e as pancadas. Só roda enquanto o corpo se mexe (dorme depois); máx. 6 ao mesmo tempo.
import * as THREE from 'three';
import { BALANCE } from '../../../shared/balance.js';
const { Vector3, Quaternion, Ray, DoubleSide } = THREE;
const _ray = new Ray(), _o = new Vector3(), _d = new Vector3(), _pw = new Vector3(), _rr = new Vector3(), _vp = new Vector3(), _vt = new Vector3(), _n = new Vector3(), _a = new Vector3(), _qi = new Quaternion(), _dq = new Quaternion(), _g = new Vector3();
const UP = new Vector3(0, 1, 0);
// perfil humano: [x lado, y ao longo do corpo, z frente, raio] em volta do centro de massa (0,9 m acima dos pés em pé)
export const HUMAN = { com: 0.9, I: 0.34, pts: [[0, 0.85, 0, 0.15], [-0.22, 0.55, 0, 0.12], [0.22, 0.55, 0, 0.12], [0, 0.45, -0.13, 0.12], [0, 0.45, 0.13, 0.12], [-0.14, -0.05, 0, 0.15], [0.14, -0.05, 0, 0.15], [-0.12, -0.45, 0, 0.1], [0.12, -0.45, 0, 0.1], [-0.12, -0.86, 0, 0.1], [0.12, -0.86, 0, 0.1]] };
let ACTIVE = 0; export const ragActive = () => ACTIVE;
const MAX_ACTIVE = 6;

export class Ragdoll {
  constructor(col, root, prof = HUMAN) {
    this.col = col; this.root = root; this.prof = prof; this.pts = prof.pts.map((p) => ({ l: new Vector3(p[0], p[1], p[2]), r: p[3] }));
    this.p = new Vector3(); this.v = new Vector3(); this.q = new Quaternion(); this.w = new Vector3(); this.age = 0; this.rest = 0; this.asleep = false; this.cnt = 0;
    this.acc = new Vector3(); this._lv = new Vector3(); this.limb = { aL: [0, 0, 0, 0], aR: [0, 0, 0, 0], tL: [0, 0, 0, 0], tR: [0, 0, 0, 0], hd: [0, 0, 0, 0] };   // [angX, angZ, velX, velZ]
    ACTIVE++; this.counted = true;
  }
  // push: direção horizontal do tiro (de quem atirou para a vítima); str: m/s; head: tiro na cabeça (levanta mais); vel: velocidade que o corpo já tinha
  start(push, str = 3, head = false, vel = null) {
    const r = this.root; r.updateMatrixWorld(true); this.p.set(r.position.x, r.position.y + this.prof.com, r.position.z); this.q.setFromAxisAngle(UP, r.rotation.y);
    this.v.set(vel?.x || 0, vel?.y || 0, vel?.z || 0);
    const d = push && push.lengthSq() > 1e-6 ? _d.copy(push).setY(0).normalize() : _d.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    this.v.addScaledVector(d, str); this.v.y += head ? 1.4 + str * 0.1 : 0.5 + str * 0.05;
    _a.crossVectors(UP, d).normalize(); this.w.copy(_a).multiplyScalar(str * (head ? 1.5 : 1.15)); this.w.y += (Math.random() - 0.5) * 2.2; this.w.x += (Math.random() - 0.5) * 0.8;
    this.apply(0.0001);
  }
  stop() { if (this.counted) { ACTIVE--; this.counted = false; } }
  // empurrão de explosão: acorda o corpo e o lança (dx,dz = direção horizontal; s = m/s; lift = quanto sobe)
  kick(dx, dz, s, lift = 1) {
    if (this.asleep) { if (!canRag()) return; this.asleep = false; if (!this.counted) { ACTIVE++; this.counted = true; } this.age = Math.min(this.age, 8); this.rest = 0; this._lset = false; }
    this.v.x += dx * s; this.v.z += dz * s; this.v.y += (0.4 + s * 0.28) * lift; _a.crossVectors(UP, _d.set(dx, 0, dz)).multiplyScalar(s * 0.7); this.w.add(_a); this.w.y += (Math.random() - 0.5) * s * 0.4;
  }
  step(dt) {
    if (this.asleep) return;
    dt = Math.min(dt, 0.05); const n = Math.ceil(dt / 0.016), h = dt / n; this._lv.copy(this.v);
    for (let i = 0; i < n; i++) this.sub(h);
    this.acc.copy(this.v).sub(this._lv).multiplyScalar(1 / Math.max(dt, 1e-3));
    this.age += dt; const calm = this.v.lengthSq() < 0.04 && this.w.lengthSq() < 0.12 && this.cnt > 0;
    const up = _a.set(0, 1, 0).applyQuaternion(this.q).y; if (calm && up > 0.8 && this.age < 6) { this.w.x += (Math.random() - 0.5) * 3; this.w.z += (Math.random() - 0.5) * 3; this.v.y += 0.6; }   // em pé e parado: não pode dormir assim, tomba
    this.rest = calm && up < 0.8 ? this.rest + dt : 0; if (this.rest > 0.7 || this.age > 12 || this.p.y < (this.col?.killY ?? -400) + 1) { this.asleep = true; this.v.set(0, 0, 0); this.w.set(0, 0, 0); this.stop(); }
    this.apply(dt);
  }
  sub(h) {
    const col = this.col, g = BALANCE.player.gravity * (col?.gravityMul || 1) * 0.8, I = this.prof.I;
    this.v.y -= g * h; this.p.addScaledVector(this.v, h);
    _dq.set(this.w.x * h * 0.5, this.w.y * h * 0.5, this.w.z * h * 0.5, 0).multiply(this.q); this.q.set(this.q.x + _dq.x, this.q.y + _dq.y, this.q.z + _dq.z, this.q.w + _dq.w).normalize();
    this.cnt = 0; if (!col?.bvh) return;
    for (const pt of this.pts) {
      _rr.copy(pt.l).applyQuaternion(this.q); const L = _rr.length(); if (L < 1e-4) continue; _d.copy(_rr).multiplyScalar(1 / L);
      _ray.origin.copy(this.p); _ray.direction.copy(_d); let hit = col.bvh.raycastFirst(_ray, DoubleSide, 0, L + pt.r), pen = hit ? L + pt.r - hit.distance : 0;   // 1) do centro até o ponto: paredes e nada de atravessar
      let down = false; if (!hit || pen <= 0) { _pw.copy(this.p).addScaledVector(_d, L); _ray.origin.set(_pw.x, _pw.y + 0.3, _pw.z); _ray.direction.set(0, -1, 0); hit = col.bvh.raycastFirst(_ray, DoubleSide, 0, 0.3 + pt.r); if (!hit) continue; pen = 0.3 + pt.r - hit.distance; if (pen <= 0) continue; down = true; }   // 2) de cima para baixo no ponto: o chão sustenta o corpo deitado
      _n.copy(hit.face.normal); if (down ? _n.y < 0 : _n.dot(_d) > 0) _n.negate(); this.cnt++;
      _rr.copy(_d).multiplyScalar(L);   // ponto do corpo relativo ao centro de massa
      _vp.crossVectors(this.w, _rr).add(this.v); const vn = _vp.dot(_n);
      if (vn < 0) {
        _a.crossVectors(_rr, _n); const kN = 1 + _a.lengthSq() / I, e = vn < -4 ? 0.25 : 0, j = -(1 + e) * vn / kN;
        this.v.addScaledVector(_n, j); this.w.addScaledVector(_a, j / I);
        _vt.copy(_vp).addScaledVector(_n, -vn); const vtl = _vt.length();   // atrito: pára de deslizar, mas ladeira forte ainda rola
        if (vtl > 1e-4) { _vt.multiplyScalar(1 / vtl); _a.crossVectors(_rr, _vt); const kT = 1 + _a.lengthSq() / I, jt = Math.min(vtl / kT, 0.7 * j); this.v.addScaledVector(_vt, -jt); this.w.addScaledVector(_a, -jt / I); }
      }
      this.p.addScaledVector(_n, Math.min(pen, 0.2) * 0.7);
    }
    const dmp = Math.exp(-h * (this.cnt ? 1.6 : 0.15)); this.w.multiplyScalar(dmp); if (this.cnt) { this.v.x *= Math.exp(-h * 0.35); this.v.z *= Math.exp(-h * 0.35); }
  }
  apply(dt) {
    const r = this.root; r.quaternion.copy(this.q); _rr.set(0, this.prof.com, 0).applyQuaternion(this.q); r.position.copy(this.p).sub(_rr);
    // braços e pernas: molas que caem para onde a gravidade puxa (no referencial do corpo) e levam tranco das pancadas
    _qi.copy(this.q).invert(); _g.set(0, -1, 0).applyQuaternion(_qi); _a.copy(this.acc).applyQuaternion(_qi); const L = this.limb;
    const gx = -0.7 * Math.atan2(-_g.z, -_g.y), gz = Math.atan2(_g.x, -_g.y) * 0.7, cl = (x, a) => Math.max(-a, Math.min(a, x));
    const spr = (s, tx, tz, kx, kz) => { s[2] += (40 * (tx - s[0]) - 7 * s[2] + kx) * dt; s[3] += (40 * (tz - s[1]) - 7 * s[3] + kz) * dt; s[0] = cl(s[0] + s[2] * dt, 1.7); s[1] = cl(s[1] + s[3] * dt, 1.7); };
    spr(L.aL, cl(gx, 1.6), Math.max(-0.1, cl(gz, 1.6)), -_a.z * 0.5, -_a.x * 0.5); spr(L.aR, cl(gx, 1.6), Math.min(0.1, cl(gz, 1.6)), -_a.z * 0.5, -_a.x * 0.5);
    spr(L.tL, cl(gx, 1.2), Math.max(-0.05, cl(gz, 1.2)), -_a.z * 0.3, -_a.x * 0.3); spr(L.tR, cl(gx, 1.2), Math.min(0.05, cl(gz, 1.2)), -_a.z * 0.3, -_a.x * 0.3);
    spr(L.hd, cl(gx * 0.6, 0.8), cl(gz * 0.6, 0.8), -_a.z * 0.2, -_a.x * 0.2);
  }
  // aplica os ângulos das molas nas juntas do personagem (depois da animação normal)
  limbs(rig) {
    const L = this.limb; if (!rig) return;
    if (this.asleep && this._lset) return;   // dormindo: membros já assentados
    rig.aL?.rotation.set(L.aL[0], 0, L.aL[1]); rig.aR?.rotation.set(L.aR[0], 0, L.aR[1]); rig.tL?.rotation.set(L.tL[0], 0, L.tL[1]); rig.tR?.rotation.set(L.tR[0], 0, L.tR[1]);
    rig.fL?.rotation.set(-0.35, 0, 0); rig.fR?.rotation.set(-0.35, 0, 0); rig.sL?.rotation.set(0.25, 0, 0); rig.sR?.rotation.set(0.25, 0, 0); rig.head?.rotation.set(L.hd[0], 0, L.hd[1]);
    // COLISÃO DOS MEMBROS: braços e pernas não atravessam o chão. Mede a ponta de cada membro (mão/pé) contra o mapa; se estiver enterrada, o membro é recolhido para junto do corpo até emergir.
    const col = this.col; if (col?.bvh) { this.root.updateMatrixWorld(true);
      for (const [k, j, len] of [['aL', rig.aL, -0.62], ['aR', rig.aR, -0.62], ['tL', rig.tL, -0.9], ['tR', rig.tR, -0.9]]) { if (!j) continue; const s = L[k];
        for (let it = 0; it < 5; it++) { j.updateMatrixWorld(true); _pw.set(0, len, 0).applyMatrix4(j.matrixWorld); _ray.origin.set(_pw.x, _pw.y + 0.35, _pw.z); _ray.direction.set(0, -1, 0); if (!col.bvh.raycastFirst(_ray, DoubleSide, 0, 0.42)) break; s[0] *= 0.6; s[1] *= 0.6; j.rotation.set(s[0], 0, s[1]); } } }
    this._lset = true;
  }
}

// ANIMAIS E DINOSSAUROS: o corpo é empurrado pelo tiro, desliza e acompanha o relevo (ladeira), sem girar de pé; a animação de morte própria continua.
export class Slide {
  constructor(col, root) { this.col = col; this.root = root; this.v = new Vector3(); this.n = new Vector3(0, 1, 0); this.age = 0; this.asleep = false; this.rest = 0; this.yaw = root.rotation.y; ACTIVE++; this.counted = true; }
  kick(dx, dz, s) { if (this.asleep) { if (!canRag()) return; this.asleep = false; if (!this.counted) { ACTIVE++; this.counted = true; } this.age = 0; this.rest = 0; } this.v.x += dx * s; this.v.z += dz * s; this.v.y += 0.8 + s * 0.15; }
  start(push, str = 3) { const d = push && push.lengthSq() > 1e-6 ? _d.copy(push).setY(0).normalize() : _d.set(0, 0, 0); this.v.copy(d).multiplyScalar(str); this.v.y = 0.8 + str * 0.1; }
  stop() { if (this.counted) { ACTIVE--; this.counted = false; } }
  step(dt) {
    if (this.asleep) return; dt = Math.min(dt, 0.05); const col = this.col, g = BALANCE.player.gravity * (col?.gravityMul || 1) * 0.8, r = this.root, p = r.position;
    this.v.y -= g * dt; const sp = Math.hypot(this.v.x, this.v.z);
    if (col?.bvh && sp > 0.05) { _ray.origin.set(p.x, p.y + 0.7, p.z); _ray.direction.set(this.v.x / sp, 0, this.v.z / sp); const h = col.bvh.raycastFirst(_ray, DoubleSide, 0, sp * dt + 0.7); if (h) { _n.copy(h.face.normal).setY(0).normalize(); const vn = this.v.x * _n.x + this.v.z * _n.z; if (vn < 0) { this.v.x -= _n.x * vn * 1.2; this.v.z -= _n.z * vn * 1.2; } } }
    p.addScaledVector(this.v, dt);
    if (col?.bvh) { _ray.origin.set(p.x, p.y + 1.2, p.z); _ray.direction.set(0, -1, 0); const h = col.bvh.raycastFirst(_ray, DoubleSide, 0, 3.2);
      if (h) { const gy = p.y + 1.2 - h.distance; if (p.y <= gy + 0.02) { p.y = gy; if (this.v.y < 0) this.v.y = 0; _n.copy(h.face.normal); if (_n.y < 0) _n.negate(); this.n.lerp(_n, Math.min(1, dt * 8)).normalize();
        _a.set(0, -g, 0); _a.addScaledVector(_n, -_a.dot(_n)); this.v.addScaledVector(_a, dt * (_n.y < 0.95 ? 1 : 0)); const f = Math.exp(-dt * (_n.y > 0.8 ? 5 : 2)); this.v.x *= f; this.v.z *= f; } } }
    _qi.setFromAxisAngle(UP, this.yaw); _dq.setFromUnitVectors(UP, this.n); r.quaternion.copy(_dq).multiply(_qi);
    this.age += dt; this.rest = this.v.lengthSq() < 0.02 ? this.rest + dt : 0; if (this.rest > 0.6 || this.age > 8) { this.asleep = true; this.stop(); }
  }
}
export const canRag = () => ACTIVE < MAX_ACTIVE;
