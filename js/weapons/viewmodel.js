import * as THREE from 'three';
import { cloneModel } from './gunModels.js';
import { chainAnim, chainOf } from './weaponBuilder.js';
import { inspectKind, inspectSample, DUR as INSP_DUR, EVENTS as INSP_EV } from './inspect.js';
import { drawSample, DRAW_DUR, DRAW_EVENTS } from './draw.js';
import { applySkin } from './skins.js';
import { ITEMS } from '/shared/items.js';
import { MELEE } from '/shared/melee.js';

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const SKIN = 0xc8946a, SLEEVE = 0x2b3139;

// Arma/mãos em primeira pessoa, renderizadas numa 2ª cena (câmera própria, FOV fixo, sem atravessar paredes).
// Recuo por mola, balanço ao andar, recarga, troca, corpo a corpo, arremesso, mira (ADS) e ESPELHO (lado esquerdo).
// PEGADA E GOLPES POR ARMA (convenções dos FPS: CS/CoD/Far Cry/Dying Light). t = para onde a LÂMINA/CABEÇA aponta na vista (x dir, y cima, -z frente);
// seq = ordem dos golpes. facas: lâmina à frente e um pouco acima (cortes e estocada) · facão/machado/martelo: lâmina PARA CIMA, golpe de cima para baixo
// espadas: lâmina para cima inclinada, cortes diagonais · lança: à frente, estocada · taco: em pé, giro horizontal · motosserra: à frente, empurra e serra
export const POSE = {
  knife: { t: [-0.5, 0.3, -1], seq: ['slash', 'slashD', 'stab', 'slashU', 'slashD'] }, xknife: { t: [-0.5, 0.3, -1], seq: ['slash', 'slashD', 'stab', 'slashU'] }, cenoura: { t: [-0.1, 0.35, -1], seq: ['slash', 'stab', 'slashD'] },
  karambit: { t: [-0.4, 0.25, -1], seq: ['slashD', 'slash', 'slashU', 'slashD'] },
  machete: { t: [-0.15, 0.75, -0.85], seq: ['chop', 'slashD', 'chop', 'slash'] }, axe: { hold: 0.18, t: [-0.1, 0.8, -0.75], seq: ['chop', 'chop', 'slashD'] }, foice: { hold: 0.12, t: [-0.1, 0.6, -0.9], seq: ['slashD', 'slash', 'chop'] },
  katana: { t: [-0.15, 0.8, -0.85], seq: ['slashD', 'slash', 'slashU', 'chop'] }, sword: { t: [-0.15, 0.8, -0.85], seq: ['slashD', 'slash', 'chop', 'slashU'] }, plasma: { t: [-0.15, 0.8, -0.85], seq: ['slashD', 'slash', 'slashU'] },
  hammer: { hold: -0.3, hip: [0.24, -0.06, -0.5], t: [-0.2, 0.8, -0.65], seq: ['chop'] }, bat: { hold: 0.12, t: [-0.2, 0.8, -0.65], seq: ['slash', 'slashD', 'slash'] },
  facacurupira: { t: [-0.15, 0.75, -0.85], seq: ['chop', 'slashD', 'chop', 'slash'] }, tridente: { hold: 0.3, t: [0, 0.12, -1], seq: ['stab'] }, caipora: { t: [-0.5, 0.3, -1], seq: ['slash', 'slashD', 'stab', 'slashU'] }, navalha: { t: [-0.5, 0.3, -1], seq: ['slash', 'slashU', 'stab', 'slashD'] }, paje: { t: [-0.5, 0.3, -1], seq: ['slash', 'stab', 'slashD', 'slashU'] },
  spear: { hold: 0.3, t: [0, 0.12, -1], seq: ['stab'] }, chainsaw: { t: [0, 0.05, -1], seq: ['saw'] },
};
export class ViewModel {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.01, 10);
    this.scene.add(this.camera, new THREE.HemisphereLight(0xdfe8ff, 0x445060, 2.0));
    const d = new THREE.DirectionalLight(0xfff0d8, 2.2); d.position.set(1, 2, 1.5); this.scene.add(d);
    this.rig = new THREE.Group(); this.scene.add(this.rig);
    this.mirror = new THREE.Group(); this.mirror.scale.setScalar(1); this.rig.add(this.mirror);
    this.VM_SCALE = 0.62;             // arma de mão levemente reduzida (padrão de FPS) — o tamanho real fica no mundo/3ª pessoa
    this.holder = new THREE.Group(); this.mirror.add(this.holder);
    this.side = 1; this.id = null; this.model = null; this.mode = 'gun';
    this.kz = 0; this.kzv = 0; this.kp = 0; this.kpv = 0; this.kr = 0; this.krv = 0;
    this.iT = -1; this.dT = -1; this.dK = 'rifle'; this.dDur = 0.7; this.dLast = 0; this._cp = 0; this._chain = null; this.bob = 0; this.ads = 0; this.rT = -1; this.rDur = 1; this.sT = 1; this.mT = -1; this.tT = -1; this.swayX = 0; this.swayY = 0; this.vis = true;
    this.handMat = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.8 }); this.sleeveMat = new THREE.MeshStandardMaterial({ color: SLEEVE, roughness: 0.9 });
  }
  setSide(s) { this.side = s === 'left' ? -1 : 1; this.mirror.scale.set(this.side * this.VM_SCALE, this.VM_SCALE, this.VM_SCALE); }
  setSkin(skin, sleeve) { if (skin != null) this.handMat.color.setHex(skin); if (sleeve != null) this.sleeveMat.color.setHex(sleeve); }
  resize(w, h) { this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }

  setWeapon(id, att, skin = null) {
    this.id = id; this.att = att || {};
    while (this.holder.children.length) { const c = this.holder.children[0]; this.holder.remove(c); c.traverse((o) => { if (o.userData.own) o.geometry.dispose(); }); }   // braços têm geometria própria; a arma é compartilhada
    this.supArm = null; this._supSlap = 0;
    this.model = cloneModel(id, att);
    const it = ITEMS[id]; this.mode = it?.gun ? 'gun' : (it?.slot === 'grenade' || id === 'bomb') ? 'grenade' : (it?.cls === 'melee' && !['fists', 'claws', 'train'].includes(id)) ? 'knife' : id;
    if (skin && skin !== 'base' && (this.mode === 'knife' || this.mode === 'gun')) { try { applySkin(this.model.group, skin, id); } catch { /* sem skin */ } }   // skin da faca / arma branca
    this.holder.add(this.model.group);
    // mãos
    const m = this.model;
    if (!m.noHands) {
      this.rArm = this.arm(m.grip, new THREE.Vector3(0.1, -0.28, 0.42), true); this.holder.add(this.rArm);
      const small = m.length < 0.34 && !m.dual;     // pistola/revólver/deagle: as DUAS mãos juntas no punho
      this.supArm = null;
      if (this.mode === 'gun' && !m.dual && !small) { this.supArm = this.arm(m.support, new THREE.Vector3(-0.1, -0.3, 0.12), false); this.holder.add(this.supArm); }
      if (small) this.holder.add(this.arm(m.grip.clone().add(new THREE.Vector3(-0.028, 0.0, -0.012)), new THREE.Vector3(-0.12, -0.3, 0.34), false));
      if (m.dual) { this.holder.add(this.arm(m.grip.clone().add(new THREE.Vector3(-m.length * 0.0, 0, 0)), new THREE.Vector3(-0.1, -0.3, 0.3), false)); }
    }
    this.hideObj = this.model.group.getObjectByName('__hide') || null; if (this.hideObj) this.hideObj.visible = true;
    this.sT = 1; this.rT = -1; this.mT = -1; this.tT = -1; this.iT = -1; this._chain = null;
    this.dK = inspectKind(id); this.dDur = DRAW_DUR[this.dK] || 0.7; this.dT = 0; this.dLast = -1;   // SACAR: cada categoria tem a sua animação (draw.js)
    const eye = m.eye || new THREE.Vector3(0, 0.06, 0);
    this.hip = new THREE.Vector3(0.2, -0.2, -0.42).divideScalar(this.VM_SCALE).sub(m.grip);
    if (id === 'seeker') this.hip.add(new THREE.Vector3(0.1, -0.1, -0.3).divideScalar(this.VM_SCALE));   // lançador largo: mais à frente, para baixo e para a direita, para não tampar a mira
    if (m.dual) this.hip.x = 0.0 / this.VM_SCALE - m.grip.x;   // armas duplas: o PAR fica centralizado na tela, uma de cada lado (espelhado), como nos FPS
    this.adsPos = new THREE.Vector3(0, 0, -0.30).divideScalar(this.VM_SCALE).sub(eye);
    if (this.mode === 'knife' || this.mode === 'fists' || this.mode === 'claws') this.hip.set(0.24, -0.2, -0.5);
    // PEGADA da arma branca: descobre para onde a lâmina aponta (do cabo ao centro da caixa do modelo) e gira o conjunto, em torno do cabo, para frente e levemente para cima/dentro
    this.baseQ = null; this.pivot = null;
    if (this.mode === 'knife') {
      this.holder.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(this.model.group), c = this.holder.worldToLocal(box.getCenter(new THREE.Vector3())), dir = c.clone().sub(m.grip);
      if (dir.length() > 0.02) { const P = POSE[id] || POSE.knife; if (P.hip) this.hip.set(...P.hip); this.mSeq = P.seq; const gE = m.grip.clone().addScaledVector(dir.clone().normalize(), (P.hold || 0) * dir.length() * 2); this.pivot = gE; const tgt = new THREE.Vector3(...P.t).normalize(); this.baseQ = new THREE.Quaternion().setFromUnitVectors(dir.normalize(), tgt); this.baseRot = { x: 0, y: 0, z: 0 };
        // MÃO FECHADA em volta do cabo (como segurar um martelo/facão de verdade): o antebraço continua vindo de baixo, mas os dedos CRUZAM o cabo em vez de acompanhá-lo
        if (this.rArm) { this.holder.remove(this.rArm); const sh0 = new THREE.Vector3(0.1, -0.28, 0.42), shL = gE.clone().add(sh0.clone().sub(m.grip).applyQuaternion(this.baseQ.clone().invert())); this.rArm = this.fist(gE, shL, dir); this.holder.add(this.rArm); } }
    }
    if (this.mode === 'grenade') this.hip.set(0.22, -0.26, -0.5);
    if (id === 'bomb') this.hip.set(0.08, -0.17, -0.46);   // bomba: mais ao centro e mais alta, bem visível
    this.adsPos.x = Math.max(-0.2, Math.min(0.2, this.adsPos.x));
  }
  /** punho fechado: u = eixo do cabo (no espaço do modelo), os dedos formam fileira ao longo de u e envolvem o cabo pelo lado de fora */
  fist(hand, shoulder, u) {
    const g = new THREE.Group(), f = shoulder.clone().sub(hand), len = f.length(); f.normalize(); const uu = u.clone().normalize().addScaledVector(f, -u.clone().normalize().dot(f)).normalize(), w = new THREE.Vector3().crossVectors(uu, f).normalize();
    const mk = (sx, sy, sz, mat) => { const o = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat); o.userData.own = true; return o; };
    const fore = mk(0.058, 0.058, len, this.handMat); fore.position.copy(hand).addScaledVector(f, len * 0.5); fore.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(), f.clone().negate(), uu)); g.add(fore);
    const cuff = mk(0.066, 0.066, len * 0.28, this.sleeveMat); cuff.position.copy(hand).addScaledVector(f, len * 0.86); cuff.quaternion.copy(fore.quaternion); g.add(cuff);
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(w, uu, f)), fistG = new THREE.Group(); fistG.position.copy(hand); fistG.quaternion.copy(q); g.add(fistG);
    const palm = mk(0.085, 0.1, 0.06, this.handMat); fistG.add(palm);
    for (let i = 0; i < 4; i++) { const fg = mk(0.07, 0.022, 0.034, this.handMat); fg.position.set(0.0, -0.038 + i * 0.025, -0.045); fistG.add(fg); }   // dedos cruzando o cabo, do lado oposto ao antebraço
    const th = mk(0.03, 0.05, 0.03, this.handMat); th.position.set(-0.05, 0.03, -0.01); fistG.add(th);
    return g;
  }
  arm(hand, shoulder, right) {
    const g = new THREE.Group();
    const dir = shoulder.clone().sub(hand), len = dir.length();
    const fore = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.058, len), this.handMat); fore.userData.own = true;
    fore.position.copy(hand).addScaledVector(dir, 0.5); fore.lookAt(shoulder); g.add(fore);
    const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.066, len * 0.28), this.sleeveMat); cuff.userData.own = true; cuff.position.copy(hand).addScaledVector(dir, 0.86); cuff.lookAt(shoulder); g.add(cuff);
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.095), this.handMat); palm.userData.own = true; palm.position.copy(hand); g.add(palm);
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.014, 0.05), this.handMat); f.userData.own = true; f.position.copy(hand).add(new THREE.Vector3(-0.024 + i * 0.016, 0.02, -0.045)); g.add(f); }
    return g;
  }

  // Recuo: deslocamento que decai exponencialmente (SEM mola/oscilação): a arma volta seca ao lugar
  kick(power = 1, melee = false) { if (melee) return; this.kz = Math.min(1.6, this.kz + 0.9 * power); this.kp = Math.min(2.2, this.kp + 1.2 * power); this.kr += (Math.random() - 0.5) * 0.7 * power; }
  reload(ms, shells = 0) { this.rT = 0; this.rDur = Math.max(0.3, ms / 1000); this.rN = shells | 0; }
  cancelReload() { this.rT = -1; }
  // corpo a corpo com VARIAÇÃO: faca alterna corte horizontal → corte diagonal → estocada; arma de fogo dá COronhada; punho dá soco
  melee(kind) {
    if (this.mT >= 0 && this.mT < 1) return;   // golpe em andamento: só começa outro quando o movimento terminar
    this.mT = 0; this.mN = (this.mN || 0) + 1;
    this.mK = kind === 'heavy' && this.mode === 'knife' ? 'heavy' : (this.mode === 'gun' || (kind === 'butt' && this.mode === 'knife')) ? 'butt' : (this.mode === 'fists' || this.mode === 'claws') ? 'punch' : (this.mSeq || ['slash', 'slashD', 'stab'])[(this.mN - 1) % (this.mSeq || [1, 2, 3]).length];
    const wt = this.mode === 'knife' ? Math.min(1.9, Math.max(0.7, (MELEE[this.id]?.cd || 0.55) / 0.55)) : 1;   // arma pesada = golpe mais lento (e mais forte no servidor)
    this.mWt = wt; this.mDur = { heavy: 0.82, butt: 0.52, punch: 0.28, slash: 0.34, slashD: 0.37, stab: 0.32, slashU: 0.36, chop: 0.42, saw: 0.5 }[this.mK] * (this.mK === 'heavy' ? Math.max(0.9, wt) : wt);
  }
  // INSPECIONAR (R com a arma cheia): animação da categoria; onInspectSfx(nome, tipo) toca os sons; cancelInspect() corta na hora
  inspect(slow = 1) { if (!this.model || this.iT >= 0 || this.dT >= 0 || this.rT >= 0 || this.mT >= 0 || this.tT >= 0 || this.ads > 0.1) return false; const kind = inspectKind(this.id); this.iK = kind; this.iDur = (INSP_DUR[kind] || 3) * slow; this.iT = 0; this.iLast = 0; return true; }
  cancelInspect() { this.iT = -1; }
  get inspecting() { return this.iT >= 0; }
  throwIt() { this.tT = 0; }
  muzzleLocal() { this.rig.updateMatrixWorld(true); return this.model.muzzle.getWorldPosition(new THREE.Vector3()); }
  ejectLocal() { return this.model.eject.getWorldPosition(new THREE.Vector3()); }
  get stages() { return this.model?.sight?.fov?.length || 1; }
  // FOV da câmera ao mirar: os estágios do Arsenal (graus numa câmera de 36°) viram ZOOM relativo (36°/fov) aplicado ao FOV do jogo
  adsFovFor(baseFov, stage = 0) { const f = this.model?.sight?.fov; if (!f) return baseFov * 0.8; const v = f[Math.min(stage, f.length - 1)], zoom = Math.tan(THREE.MathUtils.degToRad(18)) / Math.tan(THREE.MathUtils.degToRad(v / 2)); return 2 * THREE.MathUtils.radToDeg(Math.atan(Math.tan(THREE.MathUtils.degToRad(baseFov / 2)) / zoom)); }
  get sightKind() { return this.model?.sight?.k || 'irons'; }

  update(dt, st) {
    if (!this.model) return;
    // recuo rígido (decai rápido, sem oscilar); ADS com resposta imediata
    const dk = Math.exp(-dt * 22); this.kz *= dk; this.kp *= dk; this.kr *= dk;
    this.ads = lerp(this.ads, st.ads ? 1 : 0, 1 - Math.exp(-dt * 24));
    const a = ease(this.ads);
    if (this.hideObj) this.hideObj.visible = a < 0.55;              // corpo da mira some ao mirar (como no base.html)
    this.bob += dt * (st.speed > 0.3 && st.onGround ? 4 + st.speed * 1.9 : 1.2);
    const mv = Math.min(1, st.speed / 5.4) * (st.onGround ? 1 : 0.2) * (1 - a * 0.9);
    const bx = Math.sin(this.bob) * 0.006 * mv, by = Math.abs(Math.cos(this.bob)) * 0.006 * mv;

    let px = lerp(this.hip.x, this.adsPos.x, a), py = lerp(this.hip.y, this.adsPos.y, a), pz = lerp(this.hip.z, this.adsPos.z, a);
    let rx = 0, ry = 0, rz = 0;
    // troca (levanta a arma)
    if (this.sT < 1) { this.sT = Math.min(1, this.sT + dt / 0.28); const e = 1 - ease(this.sT); py -= 0.32 * e; rx -= 0.9 * e; }
    // recarga em etapas (como nos FPS): inclina a arma e a mão de apoio puxa o pente para baixo → mão livre fica baixa (pente fora) → sobe com o pente novo → BATE na base do pente (tranco) → puxa o ferrolho e volta
    let sup = 0, supZ = 0;
    if (this.rT >= 0) { this.rT += dt / this.rDur; const p = this.rT; if (p >= 1) this.rT = -1; else {
      const seg = (a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
      let tilt = ease(seg(0, 0.16)) * (1 - ease(seg(0.82, 1))), out = ease(seg(0.1, 0.26)) * (1 - ease(seg(0.5, 0.68))), slap = p > 0.66 && p < 0.78 ? Math.sin(Math.PI * seg(0.66, 0.78)) : 0, bolt = p > 0.8 && p < 0.94 ? Math.sin(Math.PI * seg(0.8, 0.94)) : 0;
      if (this.rN > 0) {   // CARTUCHO A CARTUCHO: a mão de apoio vai ao bolso e volta com UM cartucho por ciclo (N = balas que faltam), e no fim bombeia
        const n = this.rN, a0 = 0.1, a1 = 0.78, c = seg(a0, a1) * n, ph = c - Math.floor(Math.min(c, n - 1e-6)), act = p > a0 && p < a1;
        tilt = 0.7 * ease(seg(0, 0.1)) * (1 - ease(seg(0.9, 1))); out = act ? Math.sin(Math.PI * ph) : 0; slap = act ? Math.pow(Math.sin(Math.PI * ph), 10) * 0.8 : 0; bolt = p > 0.8 && p < 0.96 ? Math.sin(Math.PI * seg(0.8, 0.96)) * 1.6 : 0;
      }
      rz += 0.5 * tilt * this.side; rx -= 0.22 * tilt; py -= 0.05 * tilt + 0.03 * out; px -= 0.03 * tilt; ry += 0.12 * tilt * this.side;
      pz += 0.05 * slap; rx += 0.1 * slap; py += 0.012 * slap; pz += 0.03 * bolt;
      sup = out; supZ = bolt; this._supSlap = slap;
    } }
    if (this.supArm) { this.supArm.position.set(0, -0.2 * sup + 0.02 * (this._supSlap || 0), 0.12 * sup - 0.05 * supZ); this.supArm.rotation.x = 0.5 * sup; }
    // corpo a corpo
    if (this.mT >= 0) {
      this.mT += dt / (this.mDur || 0.32); const p = this.mT, k = this.mK || 'slash';
      if (p >= 1) this.mT = -1; else {
        const w = Math.sin(Math.PI * p), s = this.side;
        if (k === 'butt') {                                   // CORONHADA: puxa a arma para trás e para cima, depois desce o cano e bate com a coronha para a frente
          const wind = p < 0.36 ? ease(p / 0.36) : 0, strike = p < 0.36 ? 0 : p < 0.62 ? ease((p - 0.36) / 0.26) : 1 - ease((p - 0.62) / 0.38);
          pz += 0.12 * wind - 0.4 * strike; py += 0.06 * wind - 0.07 * strike; px += -0.06 * s * wind + 0.05 * s * strike; rx += 0.6 * wind - 1.0 * strike; ry += 0.3 * s * strike; rz += -0.3 * s * wind + 0.15 * s * strike;
        } else if (k === 'heavy') {                           // GOLPE PESADO: ergue a arma bem alto e para trás (lento), depois desce com tudo e recupera devagar
          const wind = p < 0.42 ? ease(p / 0.42) : 0, strike = p < 0.42 ? 0 : p < 0.56 ? ease((p - 0.42) / 0.14) : 1 - ease((p - 0.56) / 0.44);
          px += (0.12 * wind - 0.22 * strike) * s; py += 0.2 * wind - 0.26 * strike; pz += 0.16 * wind - 0.34 * strike; rx += 0.9 * wind - 1.5 * strike; ry += 0.4 * s * strike; rz += (-0.7 * wind + 1.1 * strike) * s;
        } else if (k === 'chop') {                            // GOLPE DE CIMA PARA BAIXO (facão, machado, martelo, espada): ergue por trás do ombro, desce rápido e recupera
          const wind = p < 0.34 ? ease(p / 0.34) : 0, strike = p < 0.34 ? 0 : p < 0.56 ? ease((p - 0.34) / 0.22) : 1 - ease((p - 0.56) / 0.44);
          px += s * (0.06 * wind - 0.1 * strike); py += 0.08 * wind - 0.26 * strike; pz += 0.1 * wind - 0.32 * strike; rx += 0.45 * wind - 1.5 * strike; rz += s * (-0.25 * wind + 0.35 * strike); ry += s * 0.15 * strike;
        } else if (k === 'saw') {                             // MOTOSSERRA: empurra para a frente e serra de um lado ao outro (vibra)
          const t = Math.sin(Math.PI * Math.min(1, p * 1.2)); pz -= 0.3 * t; py += 0.02 * t; ry += s * 0.35 * Math.sin(p * Math.PI * 3) * t; rx -= 0.1 * t; px += 0.01 * Math.sin(p * 90);
        } else if (k === 'stab') {                            // ESTOCADA: recua e dispara a lâmina para a frente
          const t = p < 0.3 ? -ease(p / 0.3) * 0.4 : p < 0.55 ? -0.4 + 1.4 * ease((p - 0.3) / 0.25) : 1 - ease((p - 0.55) / 0.45);
          pz -= 0.5 * t; py -= 0.03 * t; rx -= 0.25 * t; px += 0.03 * s * t;
        } else if (k === 'slashD') {                          // CORTE DIAGONAL: de cima/esquerda para baixo/direita
          const e = ease(p); px += (0.24 - 0.5 * e) * s * w * 1.2; py += (0.14 - 0.3 * e) * w; pz -= 0.2 * w; rz += (-0.9 + 1.8 * e) * s * w; rx -= 0.5 * w; ry += 0.6 * w * s;
        } else if (k === 'slashU') {                          // CORTE ASCENDENTE (de baixo para cima, costas da mão): recolhe para a direita e sobe cortando para dentro
          const wd = p < 0.25 ? ease(p / 0.25) : 0, up = p < 0.25 ? 0 : p < 0.62 ? ease((p - 0.25) / 0.37) : 1 - ease((p - 0.62) / 0.38);
          px += s * (0.12 * wd - 0.34 * up); py += -0.12 * wd + 0.2 * up; pz -= 0.18 * up; rx += 0.25 * wd - 0.7 * up; ry += s * (-0.3 * wd + 0.8 * up); rz += s * (0.6 * wd - 1.0 * up);
        } else if (k === 'punch') {                           // SOCO reto
          const t = Math.sin(Math.PI * Math.min(1, p * 1.5)); pz -= 0.38 * t; py += 0.03 * t; rx -= 0.15 * t; px += 0.04 * s * t;
        } else {                                              // CORTE HORIZONTAL
          const wd = p < 0.28 ? ease(p / 0.28) : 0, st2 = p < 0.28 ? 0 : p < 0.66 ? ease((p - 0.28) / 0.38) : 1 - ease((p - 0.66) / 0.34);   // arma abre para FORA e corta PARA DENTRO (em direção ao centro)
          px += s * (0.22 * wd - 0.3 * st2); pz -= 0.2 * st2; py -= 0.03 * st2; rx -= 0.35 * st2; ry += s * (-0.35 * wd + 0.95 * st2); rz += s * (-0.35 * wd + 0.45 * st2);
        }
      }
    }
    // INSPECIONAR: gira/levanta a arma, a mão de apoio vai ao pente/ação e a arma branca gira na mão
    if (this.iT >= 0) {
      if (this.rT >= 0 || this.mT >= 0 || this.tT >= 0 || this.ads > 0.1 || st.sprint || st.sliding || !st.onGround) this.iT = -1; else {
        this.iT += dt / this.iDur; const p = this.iT; if (p >= 1) this.iT = -1; else {
          const s = inspectSample(this.iK, p), sd = this.side, K = 1 / this.VM_SCALE;
          if (s.melee) { py += 0.06 * s.arm; px += -0.04 * sd * s.out; rx += s.twirl; rz += s.tilt * sd; ry += -0.2 * s.fore * sd; if (s.shake) { px += (Math.random() - 0.5) * 0.008 * s.shake; py += (Math.random() - 0.5) * 0.008 * s.shake; } }
          else { py += s.lift * K; pz -= s.fwd * K; rx += s.pitch; rz += s.roll * sd; ry += s.yaw * sd; sup = Math.max(sup, s.sup); supZ = Math.min(supZ, -s.supF * 2.5); px += -0.02 * sd * s.sup; }
          this.iLast = p;   /* inspecionar fica SEM som (o som da troca de arma continua) */ } } }
    // SACAR (trocou de arma): a animação fixa da categoria (draw.js), com os barulhos dela; ficar parado não é exigido, mas disparar/recarregar/golpear a encerra
    if (this.dT >= 0) {
      if (this.rT >= 0 || this.mT >= 0 || this.tT >= 0) this.dT = -1; else {
        this.dT += dt / this.dDur; const p = this.dT; if (p >= 1) this.dT = -1; else {
          const s = drawSample(this.dK, p), sd = this.side, K = 1 / this.VM_SCALE;
          if (s.melee) { py += 0.06 * s.arm; px += -0.04 * sd * s.out; rx += s.twirl; rz += s.tilt * sd; ry += -0.2 * s.fore * sd; if (s.shake) { px += (Math.random() - 0.5) * 0.008 * s.shake; py += (Math.random() - 0.5) * 0.008 * s.shake; } }
          else { py += s.lift * K; pz -= s.fwd * K; rx += s.pitch; rz += s.roll * sd; ry += s.yaw * sd; sup = Math.max(sup, s.sup); supZ = Math.min(supZ, -s.supF * 2.5); px += -0.02 * sd * s.sup; }
          for (const [t, nm] of DRAW_EVENTS[this.dK] || []) if (this.dLast < t && p >= t) this.onInspectSfx?.(nm, this.dK); this.dLast = p; } } }
    if ((this.iT >= 0 || this.dT >= 0) && this.supArm) { this.supArm.position.set(0, -0.2 * sup, 0.12 * sup - 0.05 * supZ); this.supArm.rotation.x = 0.5 * sup; }   // a mão de apoio acompanha o inspecionar
    // arremesso de granada: braço para trás e à frente
    if (this.tT >= 0) { this.tT += dt / 0.4; const p = this.tT; if (p >= 1) this.tT = -1; else { const w = p < 0.45 ? -ease(p / 0.45) : ease((p - 0.45) / 0.55) * 1.2 - 1; pz += w * 0.14; py += (p < 0.45 ? -0.04 : 0.1) * Math.sin(Math.PI * p); rx += -w * 0.6; } }
    // deslize/corrida: arma abaixada
    if (st.sliding) { rz += 0.25 * this.side; py -= 0.05; rx -= 0.2; }
    else if (st.sprint) { rx -= 0.35 * (1 - a); ry += 0.25 * this.side * (1 - a); py -= 0.04 * (1 - a); }

    this.holder.position.set(px + bx, py + by, pz + this.kz * 0.05);
    const br = this.baseRot || { x: 0, y: 0, z: 0 }, idle = this.mode === 'knife' && this.mT < 0 ? Math.sin(this.bob * 0.5) * 0.02 : 0;
    this.holder.rotation.set(rx + br.x + idle + this.kp * 0.045, ry + br.y, rz + br.z + this.kr * 0.03);
    if (this.baseQ) { const E = this.holder.quaternion.clone(), gp = this.pivot || this.model.grip || new THREE.Vector3(); this.holder.position.add(gp.clone().sub(gp.clone().applyQuaternion(this.baseQ)).applyQuaternion(E)); this.holder.quaternion.copy(E.multiply(this.baseQ)); }
    if (this.id === 'chainsaw') { this._chain = this._chain || chainOf(this.model.group); if (this._chain) { const hit = this.mT >= 0; this._cp = (this._cp + dt * (hit ? 7 : 1.6)) % 1; chainAnim(this._chain, this._cp); this.chainRev = hit ? 1 : 0.3; if (!hit) this.holder.position.x += Math.sin(performance.now() * 0.09) * 0.002; else this.holder.position.x += Math.sin(performance.now() * 0.09) * 0.006; } }   // MOTOSSERRA: corrente correndo e vibração
    this.mirror.position.z = 0;
    if (this.mode === 'gun' || this.mode === 'knife') this.model.group.visible = true;
    this.rig.visible = this.vis;
  }
  render(renderer) {
    if (!this.vis || !this.model) return;
    // IMPORTANTE: com autoClear ligado, o 2º render APAGAVA o mundo (só a arma sobrava = tela preta em 1ª pessoa)
    const ac = renderer.autoClear; renderer.autoClear = false; renderer.clearDepth(); renderer.render(this.scene, this.camera); renderer.autoClear = ac;
  }
  /** MIRA A LASER na 1ª pessoa: o feixe sai do emissor e CONVERGE para o ponto que a câmera está mirando (onde o tiro vai); o pontinho fica ali, no que for atingido. */
  aimLaser(D, hit) {
    const L = this.model?.group?.getObjectByName('__laser'); if (!L || !L.parent) return;
    this.scene.updateMatrixWorld(true); const o = L.getWorldPosition(new THREE.Vector3()), T = new THREE.Vector3(0, 0, -Math.max(0.6, D)), dir = T.clone().sub(o), len = dir.length(); dir.normalize();
    const pq = L.parent.getWorldQuaternion(new THREE.Quaternion()).invert(); L.quaternion.copy(pq.multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir))); L.updateMatrixWorld(true);
    const ws = L.parent.getWorldScale(new THREE.Vector3()).x || 1, beam = L.getObjectByName('__beam'), dot = L.getObjectByName('__dot');
    if (beam) beam.scale.x = len / ws; if (dot) { dot.visible = !!hit; dot.position.set((beam?.position.x || 0) + len / ws, 0, 0); dot.scale.setScalar(0.022 / ws + D * 0.0006 / ws); }
  }
  dispose() { this.scene.clear(); }
}
