import { PER_SHELL } from '/shared/weaponStats.js';
import * as THREE from 'three';
import { createCharacter } from './characterRig.js';
import { BUILD, setOV } from '../weapons/arsenalModels.js';
import { applySkin } from '../weapons/skins.js';
import { buildWeapon } from '../weapons/weaponBuilder.js';
import { addLaser } from '../weapons/laserSight.js';
import { ARSENAL_BY_ID } from '/shared/arsenalData.js';
import { PLAYER_HEIGHT } from '/shared/constants.js';
import { ITEMS } from '/shared/items.js';
import { MELEE } from '/shared/melee.js';
import { POSE } from '../weapons/viewmodel.js';

// Avatar = personagem (rig do criador) + arma de verdade nas mãos, com IK dos braços.
// Escala: o rig tem 1,8 m com height=1; o jogo usa 1,6 m (PLAYER_HEIGHT).
const SCALE = PLAYER_HEIGHT / 1.8;
// TIPO DE RECARGA de cada arma (cada classe recarrega de um jeito: ver Avatar.update)
const BOLTS = new Set(['scout', 'amr', 'hunter', 'santa', 'mosquete', 'dragao', 'cangaco']), PUMPS = new Set(['pump', 'spas', 'champ', 'confete', 'tucano', 'piranha', 'mula']), REVS = new Set(['revolver', 'deagle', 'coyote', 'assombrado', 'sawed', 'boibumba']);
function reloadKind(id) { const c = ARSENAL_BY_ID[id]?.cls; if (REVS.has(id)) return 'revolver'; if (PUMPS.has(id) || PER_SHELL.has(id)) return 'pump'; if (BOLTS.has(id)) return 'bolt'; if (c === 'pistol') return 'pistol'; if (c === 'lmg') return 'lmg'; if (c === 'launcher') return 'launcher'; if (c === 'energy' || c === 'special') return 'cell'; return 'mag'; }
const wkey = (k) => { const c = ARSENAL_BY_ID[k]?.cls; return /^(pistol|deagle|revolver)$/.test(k) || (c === 'pistol' && !k.startsWith('dual')) ? 'pistol' : /^(smg|pdw|px90|dualsmg|dualpistol|dualrev)$/.test(k) || c === 'smg' ? 'smg' : /^(lmg|m60)$/.test(k) || c === 'lmg' ? 'lmg' : 'rifle'; };   // pela CLASSE da arma: toda pistola/SMG/metralhadora é segurada do jeito certo

// Personagem BASE: Urban (camiseta e calça), nada na cabeça. A aparência física é livre; o que se desbloqueia são roupas/corpos/estilos.
export const URBAN = { outfit: 'tshirt', helmet: 'none', goggles: 'none', headset: 'none', mask: 'none', vest: 'none', pack: 'none', gloves: 'off', kneepads: 'off', camo: 'urban', weapon: 'none', special: 'none', pose: 'aim' };

export class Avatar {
  static env = null;                                   // mapa de ambiente (RoomEnvironment) para os metais, como o scene.environment do base.html
  constructor(look = {}) {
    this.char = createCharacter({ ...URBAN, ...look });
    this.group = new THREE.Group();
    this.char.root.rotation.y = Math.PI;                 // o rig olha para +Z; o jogo olha para -Z
    this.group.add(this.char.root); this.group.scale.setScalar(SCALE);
    this.fp = 0; this.fall = 0; this.dead = false; this.rec = 0; this.crouchV = 0; this.weaponId = null; this.weapon = null; this.side = 'R'; this.holder = null; this.attKey = '';
  }
  // golpe do corpo (3ª pessoa e para os outros jogadores): punho = soco · arma de fogo = coronhada · faca = corte/corte diagonal/estocada · 'heavy' = golpe forte
  melee(kind) {
    if (this._mUntil && performance.now() < this._mUntil) return;   // golpe em andamento: o próximo só depois que o movimento terminar
    const id = this.weaponId, it = ITEMS[id], knife = it?.cls === 'melee' && !['fists', 'claws', 'train'].includes(id);
    this.mN = (this.mN || 0) + 1;
    // MESMA sequência de golpes da 1ª pessoa (POSE em viewmodel.js): cada arma tem o seu jeito (lança só estoca, machado/martelo descem de cima, motosserra serra…)
    const seq = POSE[id]?.seq || ['slash', 'slashD', 'stab'];
    const k = kind === 'heavy' && knife ? 'heavy' : knife ? (kind === 'butt' ? 'butt' : seq[(this.mN - 1) % seq.length]) : this.weapon ? 'butt' : 'punch';
    const wt = knife ? Math.min(1.9, Math.max(0.7, (MELEE[id]?.cd || 0.55) / 0.55)) : 1;   // arma pesada = golpe mais lento
    const dur = { heavy: 0.82, butt: 0.52, punch: 0.28, slash: 0.34, slashD: 0.37, stab: 0.32, slashU: 0.36, chop: 0.42, saw: 0.5 }[k] * (k === 'heavy' ? Math.max(0.9, wt) : wt);
    this._mUntil = performance.now() + dur * 1000; this.char.swing(k, dur);
  }
  pour(sec = 1.8) { this.char.swing('pour', sec); }   // abastecendo: inclina o tronco e estende os braços
  setLook(look) { Object.assign(this.char.S, look); this.char.rebuild(); const w = this.weaponId, a = this.att; this.weaponId = null; this.weapon = null; this.holder = null; if (w) this.hold(w, a, this.side); }

  // PRIMEIRA PESSOA (como o base.html): só braços e arma ficam visíveis; câmera na cabeça do mesmo personagem
  // modos (setBody do base.html): 0 = corpo inteiro (3ª pessoa) · 1 = SÓ BRAÇOS + arma (1ª pessoa) · 2 = SÓ A ARMA (mirando)
  setFP(mode) { mode = mode | 0; if (this.fp === mode) return; this.fp = mode; this.applyFP(); }
  applyFP() {
    const keep = new Set(), rig = this.char.rig;
    for (const g of this.fp === 2 ? [this.holder] : [rig.aL, rig.aR, this.holder]) g?.traverse((o) => keep.add(o));
    this.group.traverse((o) => { if (o.isMesh) o.visible = o.userData.isOutline ? false : (!this.fp || keep.has(o)); });
  }
  setDead(on) { if (on && !this.dead) { const r = Math.random(); this.fdir = r < 0.4 ? 'f' : r < 0.75 ? 'b' : (r < 0.88 ? 'l' : 'r'); } this.dead = on; }
  // direção do CANO no mundo (para alinhar o cano com a visão ao mirar, como o ADS do base.html)
  barrelDir(out) { if (!this.model) return null; this.model.updateWorldMatrix(true, false); return out.set(1, 0, 0).transformDirection(this.model.matrixWorld); }   // cano do Arsenal = +X
  weaponUp(out) { return this.model ? out.set(0, 1, 0).transformDirection(this.model.matrixWorld) : null; }
  // recuo do base.html: rec = min(0,3, rec + rc) (decai ×5e-4^dt). Partes móveis: pump (.45 s), ferrolho (.9 s), tambor gira 60°.
  kick(rc = 0.08) { this.rec = Math.min(0.3, this.rec + rc); }
  kickParts(mech) { for (const o of this.parts || []) { const u = o.userData; if (u.role === 'drum') u.tr = (u.tr || 0) + Math.PI / 3; else if (u.role === 'pump') { u.t = 0.45; mech?.('pump', o); } else if (u.role === 'bolt') { u.t = 0.9; mech?.('bolt', o); } } }
  // posição do olho da mira (âncora do Arsenal) em coordenadas de mundo: a câmera vai para lá ao mirar (ADS do base.html)
  eyeWorld(out) { if (!this.weapon?.eyeObj || this.weapon.model?.userData?.noads) return null; this.weapon.eyeObj.updateWorldMatrix(true, false); return this.weapon.eyeObj.getWorldPosition(out); }
  unhold() { if (this.holder) { this.model?.traverse((o) => o.geometry?.dispose?.()); this.holder.parent?.remove(this.holder); this.holder = null; } this.laser = null; this.weapon = null; this.model = null; this.agroup = null; this.parts = []; this.char.rig.weps = []; }
  // segura a arma `id`: CÓPIA do attach() do base.html (modelo BRUTO do Arsenal ×0,3, mesmo ponto de empunhadura, mesmas mãos).
  // side: 'R' destro / 'L' canhoto (troca o lado da arma e das mãos)
  hold(id, att = {}, side = 'R', skin = 'base') {
    const key = id + JSON.stringify(att) + side + (skin || 'base');
    if (key === this.attKey && this.holder) return;
    this.attKey = key; this.weaponId = id; this.att = att; this.side = side;
    this.unhold();
    if ((ITEMS[id]?.cls === 'melee' && !['fists', 'claws', 'train'].includes(id)) || id === 'bomb') {            // arma branca na mão direita
      try { const info = buildWeapon(id), holder = new THREE.Group(); try { applySkin(info.group, skin, id); } catch { /* sem skin */ } if (id === 'bomb') holder.add(info.group); else {   // ARMA BRANCA: cabo na mão e lâmina SEMPRE para a frente (cada modelo vem com a lâmina para um lado), levemente erguida
          const bb = new THREE.Box3().setFromObject(info.group), GZ = 0.06, fwd = (bb.max.z - GZ) >= (GZ - bb.min.z), pivot = new THREE.Group(); pivot.rotation.set(-0.32, fwd ? 0 : Math.PI, 0); info.group.position.z -= GZ; pivot.add(info.group); holder.add(pivot); }
        const nm = info.muzzle;
        if (id === 'bomb') { this.char.rig.weps = [{ g: holder, grips: [['R', [0, 0, 0.06]]], type: 'pistol', side }]; this.char.rig.spine.add(holder); }
        else { const sd = side === 'L' ? 'L' : 'R'; { const P = POSE[id] || POSE.knife, t = P.t; this.char.rig.weps = [{ g: holder, grips: [], type: 'melee', side: sd, hand: true, elev: Math.atan2(t[1], -t[2]), two: ['spear', 'tridente', 'chainsaw', 'hammer', 'axe', 'foice'].includes(id) }]; }   /* postura 3ª pessoa = a da 1ª: inclinação da lâmina e, nas armas longas/pesadas, a outra mão segura o cabo */ this.char.rig['f' + sd].add(holder); holder.position.set(0, -0.3, 0); holder.rotation.set(0.9 + (1.5708 - this.char.rig.weps[0].elev) / 0.76, 0, 0); }   // ARMA BRANCA: presa à MÃO (antebraço), não flutuando perto do corpo; os golpes movem o braço e a arma vai junto
        this.holder = holder; this.model = info.group; this.agroup = id === 'bomb' ? holder : null; this.shotN = 0; this.parts = []; /* arma branca: o rig (characterRig) move a arma junto com a mão; o bloco de recarga NÃO pode mexer nela */ this.weapon = { group: holder, model: info.group, muzzle: nm, muzzles: [nm], nextMuzzle() { return nm; }, eject: new THREE.Object3D(), flash: nm, dual: false, eyeObj: null, hide: null };
        this.char.S.pose = 'aim'; if (this.fp) this.applyFP(); } catch (e) { this.char.S.pose = 'idle'; } return; }
    if (!id || !ITEMS[id]?.gun || !BUILD[id]) { this.char.S.pose = 'idle'; return; }
    const dual = id.startsWith('dual') || ARSENAL_BY_ID[id]?.cls === 'dual', pist = wkey(id) === 'pistol' && !dual, T = Math.PI;
    setOV({ op: att.op && att.op !== 'def' ? att.op : undefined, tip: att.tip && att.tip !== 'def' ? att.tip : undefined, mag: att.mag | 0 });
    const model = BUILD[id](), agroup = new THREE.Group(); applySkin(model, skin, id);                                           // = renderWeapon() do base.html:
    { const c = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3()); model.position.sub(c); }   //   model.position.sub(centro da caixa) — o modelo é CENTRADO antes do attach
    agroup.add(model);
    const orient = new THREE.Group(), holder = new THREE.Group(); holder.add(orient);
    const b0 = new THREE.Box3().setFromObject(model), mlen = b0.getSize(new THREE.Vector3()).x * 0.3, mz = model.userData.mz[0].getWorldPosition(new THREE.Vector3()), z0 = -0.09;
    // PROPORÇÃO REAL: as pistolas/revólveres do modelo são muito maiores (até 2×) que na vida real e a PDW menor; normaliza ao comprimento real quando foge de ±20%
    const real = ARSENAL_BY_ID[id]?.len, rr = real ? mlen / real : 1, f = rr > 1.2 || rr < 0.8 ? 1 / rr : 1, len = mlen * f;
    orient.scale.setScalar(0.3 * f); orient.rotation.set(0, -T / 2, 0); orient.add(agroup); orient.position.set(0, -mz.y * 0.3 * f, z0 + len / 2);
    const tmp = new THREE.Group(); tmp.add(holder); holder.position.set(0, 0, 0); holder.rotation.set(0, 0, 0); tmp.updateMatrixWorld(true);
    const gr = (c, two) => { const bb = new THREE.Box3().setFromObject(c), cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2, zl = bb.max.z - bb.min.z, zn = bb.min.z;
      return two ? [['R', [cx, cy - 0.08, zn + zl * 0.27]], ['L', [cx, cy - 0.03, zn + zl * 0.62]]] : [[cx > 0 ? 'L' : 'R', [cx, cy - 0.07, zn + zl * (pist ? 0.22 : 0.3)]]]; };
    let grips = [];
    if (dual) model.children.filter((c) => c.userData.mz).forEach((c) => grips.push(...gr(c, false))); else grips = gr(model, !pist);
    if (pist) { const [sd, p] = grips[0]; grips = [[sd, p], [sd === 'R' ? 'L' : 'R', [p[0] + (sd === 'R' ? -0.014 : 0.014), p[1] + 0.012, p[2] - 0.02]]]; }   // PISTOLA SIMPLES: a outra mão fica JUNTO da que segura (empunhadura de duas mãos)
    if (side === 'L') grips = grips.map(([sd, p]) => [sd === 'R' ? 'L' : 'R', p]);
    grips = grips.map(([sd, p], i) => (dual || i === 0) ? [sd, [p[0] + (sd === 'R' ? -0.03 : 0.03), p[1], p[2]]] : [sd, p]);   // mão do gatilho um pouco PARA FORA: segura a arma em vez de ficar enterrada nela
    this.char.WP.dual = [[0, 0.35, 0.34], [0, 0.55, 0.34]];
    this.char.rig.weps = [{ g: holder, grips, type: dual ? 'dual' : wkey(id), side }];
    this._rk = reloadKind(id);
    this._sup = !dual && grips.length > 1 ? { g: grips[1], base: grips[1][1].slice() } : null;   // mão de apoio: é ela que puxa o pente na recarga
    this.char.rig.spine.add(holder);
    // âncoras para o jogo (mira, cano, ejeção, partes móveis)
    const mzs = model.userData.mz, g0 = mzs[0].userData.g || model, ejObj = new THREE.Object3D(); if (g0.userData.ej) ejObj.position.copy(g0.userData.ej); g0.add(ejObj);
    this.holder = holder; this.model = model; this.agroup = agroup; this.shotN = 0;
    this.parts = []; model.traverse((o) => { if (o.userData.role) { o.userData.bx = o.userData.bx ?? o.position.x; this.parts.push(o); } });
    if (Avatar.env) model.traverse((o) => { if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m?.isMeshStandardMaterial && m.envMap !== Avatar.env) { m.envMap = Avatar.env; m.envMapIntensity = 0.6; m.needsUpdate = true; } });   // metais iluminados como no base.html (scene.environment)
    const self = this;
    this.weapon = { group: holder, model, muzzle: mzs[0], get muzzles() { return mzs; }, nextMuzzle() { return mzs[self.shotN++ % mzs.length]; }, eject: ejObj, flash: mzs[0], dual, eyeObj: model.userData.eye, hide: model.userData.hide || null };
    this.laser = att.laser && !dual ? addLaser(model, att.laser) : null;          // MIRA A LASER (feixe medido por quadro em game.js)
    if (this.fp) this.applyFP();
    this.char.S.pose = 'aim';
  }
  update(dt, { spd = 0, sgn = 1, pitch = 0, air = false, crouch = false, aiming = false, sliding = false, reload = 0, run = false } = {}) {
    if (sliding) { spd = 0; crouch = true; }              // SLIDE: corpo abaixa e as PERNAS FICAM PARADAS (não é corrida agachada)
    this.crouchV += ((crouch ? 1 : 0) - this.crouchV) * Math.min(1, dt * 12);
    this.char.setCrouch(this.crouchV);
    this.char.S.pose = this.weapon ? (run ? 'armed' : 'aim') : 'idle';       // padrão: SEMPRE mirando · correndo sem atirar: arma em outra posição (abaixada); atirou -> volta à mira       // POSIÇÃO PADRÃO = SEMPRE MIRANDO (como no base.html): arma erguida, encaixada na tela, parado, andando, correndo ou atirando
    this.char.animate(dt, spd, sgn, pitch, air);
    // === movimento da arma IDÊNTICO ao base.html: group.position.x = -rec · group.rotation.z = rec*.35 - tilt(recarga) · (unidades do Arsenal ×0,3)
    this.rec *= Math.pow(5e-4, dt); if (this.rec < 1e-4) this.rec = 0;
    if (this.agroup) {
      // RECARGA em etapas: inclina a arma → mão de apoio desce e puxa o pente → mão baixa (pente fora) → sobe com o novo → BATE no pente (tranco) → puxa o ferrolho → volta
      const p = reload > 0 ? 1 - reload : 0, seg = (a, b) => Math.min(1, Math.max(0, (p - a) / (b - a))), ez = (x) => x * x * (3 - 2 * x);
      const K = this._rk || 'mag', R = reload > 0, fr = (x) => x - Math.floor(x), pu = (a, b) => (p > a && p < b ? Math.sin(Math.PI * seg(a, b)) : 0);
      let tilt = R ? ez(seg(0, 0.16)) * (1 - ez(seg(0.82, 1))) : 0, out = ez(seg(0.1, 0.26)) * (1 - ez(seg(0.5, 0.68))), slap = pu(0.66, 0.78), bolt = pu(0.8, 0.94), roll = 0, shake = 0, supZ = 0, supY = 0, lift = 0;
      if (R && K === 'pistol') { tilt = 0.75 * ez(seg(0, 0.14)) * (1 - ez(seg(0.88, 1))); out = ez(seg(0.08, 0.24)) * (1 - ez(seg(0.38, 0.52))); slap = pu(0.52, 0.64); bolt = pu(0.7, 0.86) * 1.6; }   // pistola: pente cai, pente novo, TRANCO e o ferrolho/ carro é puxado
      else if (R && K === 'pump') { const c = seg(0.12, 0.76) * Math.max(1, this._rn || 2), ph = fr(c), act = p > 0.12 && p < 0.76 ? 1 : 0; tilt = 0.35 * ez(seg(0, 0.1)) * (1 - ez(seg(0.9, 1))); out = act * Math.sin(Math.PI * ph); slap = act * Math.pow(Math.sin(Math.PI * ph), 10) * 0.8; bolt = pu(0.8, 0.96) * 2.2; roll = 0.12 * tilt; }   // espingarda de ação manual: 5 cartuchos UM A UM pela janela + bombeada (a mão corre o fuste)
      else if (R && K === 'bolt') { tilt = 0.45 * ez(seg(0, 0.12)) * (1 - ez(seg(0.9, 1))); const c = seg(0.14, 0.62) * 2, ph = fr(c), act = p > 0.14 && p < 0.62 ? 1 : 0; out = act * Math.sin(Math.PI * ph); slap = act * Math.pow(Math.sin(Math.PI * ph), 8) * 0.6; bolt = pu(0.7, 0.92) * 2; roll = 0.45 * pu(0.68, 0.94); }   // ferrolho: 2 balas por cima, depois levanta/puxa/empurra o ferrolho (arma rola)
      else if (R && K === 'revolver') { tilt = 1.1 * ez(seg(0, 0.14)) * (1 - ez(seg(0.88, 1))); out = ez(seg(0.14, 0.28)) * (1 - ez(seg(0.58, 0.68))); slap = pu(0.68, 0.8) * 1.6; bolt = 0; roll = 0.9 * ez(seg(0.06, 0.2)) * (1 - ez(seg(0.74, 0.86))); shake = p > 0.3 && p < 0.52 ? Math.sin(p * 70) * 0.07 : 0; }   // revólver: tambor abre para o lado, sacode o estojo, cartuchos, fecha com um giro
      else if (R && K === 'lmg') { tilt = 0.95 * ez(seg(0, 0.14)) * (1 - ez(seg(0.88, 1))); out = ez(seg(0.1, 0.3)) * (1 - ez(seg(0.58, 0.74))); slap = pu(0.74, 0.84) * 1.7; bolt = pu(0.86, 0.97) * 1.5; supY = 0.06 * bolt; lift = 0.012 * out; }   // metralhadora: caixa grande, troca lenta, tranco forte e puxa a alavanca
      else if (R && K === 'launcher') { tilt = 0.5 * ez(seg(0, 0.14)) * (1 - ez(seg(0.88, 1))); out = 0; supZ = 0.26 * ez(seg(0.14, 0.4)) * (1 - ez(seg(0.62, 0.74))); supY = -0.04 * supZ / 0.26; slap = pu(0.62, 0.8) * 1.2; bolt = 0; lift = 0.02 * ez(seg(0, 0.2)) * (1 - ez(seg(0.85, 1))); }   // lançador: a mão vai à boca do tubo, enfia o projétil e volta com um tranco
      else if (R && K === 'cell') { tilt = 0.5 * ez(seg(0, 0.16)) * (1 - ez(seg(0.84, 1))); out = ez(seg(0.1, 0.26)) * (1 - ez(seg(0.5, 0.66))); supY = 0.0; slap = pu(0.66, 0.78); bolt = 0; lift = 0.015 * tilt; roll = 0.3 * pu(0.2, 0.6); }   // arma de energia: gira e troca a célula
      this.agroup.position.x = -this.rec + (R ? 0.01 * slap : 0); this.agroup.rotation.z = this.rec * 0.35 - 0.42 * tilt + 0.05 * slap - roll; this.agroup.rotation.x = R ? 0.12 * tilt - 0.08 * slap + shake - (K === 'launcher' ? 0.2 * tilt : 0) : 0; this.agroup.position.y = R ? -0.04 * out + lift : 0;
      if (this._sup) { const b = this._sup.base, g = this._sup.g[1]; g[0] = b[0]; g[1] = (K === 'cell' ? b[1] + 0.12 * out : b[1] - 0.17 * out) + 0.015 * slap + supY; g[2] = b[2] + (K === 'launcher' ? supZ : 0.1 * out - 0.07 * bolt); }
    }
    for (const o of this.parts || []) {                                                       // animação das partes móveis (loop do base.html)
      const u = o.userData;
      if (u.role === 'drum') o.rotation.x += ((u.tr || 0) - o.rotation.x) * (1 - Math.exp(-dt * 16));
      else if (u.t > 0) { u.t = Math.max(0, u.t - dt); if (u.role === 'pump') o.position.x = u.bx - 0.32 * Math.sin(Math.PI * (1 - u.t / 0.45)); else if (u.role === 'bolt') { const p = 1 - u.t / 0.9, lift = p < 0.2 ? p / 0.2 : p > 0.8 ? (1 - p) / 0.2 : 1, pull = p < 0.2 ? 0 : p < 0.5 ? (p - 0.2) / 0.3 : p < 0.7 ? 1 - (p - 0.5) / 0.2 : 0; o.rotation.x = -1.3 * lift; o.position.x = u.bx - 0.3 * pull; } }
    }
    // queda ao morrer (corpo cai para trás e fica no chão)
    this.fall += ((this.dead ? 1 : 0) - this.fall) * (1 - Math.exp(-dt * (this.dead ? 7 : 20)));
    { const f = this.fall, d = this.fdir || 'f'; this.group.rotation.x = d === 'f' ? f * 1.5 : d === 'b' ? -f * 1.45 : f * 0.25; this.group.rotation.z = d === 'l' ? f * 1.45 : d === 'r' ? -f * 1.45 : 0; this.group.position.y = -f * (d === 'b' ? 0.1 : 0.04); }
  }
  dispose() {                                            // as geometrias/materiais da ARMA são compartilhados: unhold() antes
    this.unhold();
    const mats = new Set();
    this.group.traverse((o) => { if (!o.isMesh) return; o.geometry?.dispose?.(); for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m) mats.add(m); });
    for (const m of mats) { for (const k of Object.keys(m)) if (m[k]?.isTexture && k !== 'envMap') m[k].dispose(); m.dispose(); }
  }
}
