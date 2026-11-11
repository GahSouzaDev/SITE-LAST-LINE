import * as THREE from 'three';
import { TANK_INFO } from '/shared/tankStats.js';
import { fxFor, sceneOf, glowTex, lightPool } from '../effects/particles.js';
import { mergeStatic } from '../weapons/weaponOpt.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
// TANQUE (Batalha de Tanques): modelo low-poly feito em código, 8 variantes. Frente = -Z (como o resto do jogo). Tem o mesmo "contrato" de um Avatar/FaunaAv
// para o resto do jogo (jogadores remotos, mortes, tela final): group, update, setDead, melee, hurt, setFP, hold, dispose, kick, rec, barrelDir, eyeWorld.
// O casco gira com o yaw do grupo; a TORRE gira à parte (setTurret) e o CANO sobe e desce (pitch). Tamanho: casco 3,2 m × 6,6 m — o dobro de um carro.
const SHAPE = {   // hH altura do casco, hW largura, tW/tL torre, bL/bR cano, extras
  onca: { hH: 0.8, hW: 2.8, tW: 1.8, tL: 2.2, bL: 4.2, bR: 0.12, skirts: false, extra: 'antenna', stripe: 0xffd23d },
  anta: { hH: 1.15, hW: 3.3, tW: 2.7, tL: 3.0, bL: 3.6, bR: 0.23, skirts: true, extra: 'plow', stripe: 0xd8d2b8 },
  tatu: { hH: 1.0, hW: 3.2, tW: 2.5, tL: 2.7, bL: 3.4, bR: 0.2, skirts: true, extra: 'plates', dome: true, stripe: 0xe8e0c0 },
  gaviao: { hH: 0.8, hW: 2.9, tW: 1.7, tL: 2.4, bL: 5.0, bR: 0.14, skirts: false, extra: 'wings', stripe: 0xff5a3a },
  jacare: { hH: 0.95, hW: 3.1, tW: 2.2, tL: 2.7, bL: 4.0, bR: 0.18, skirts: false, extra: 'ridge', stripe: 0xe8e0c0 },
  tucano: { hH: 0.9, hW: 3.0, tW: 2.1, tL: 2.5, bL: 5.4, bR: 0.17, skirts: false, extra: 'beak', stripe: 0xff8a1a },
  lobo: { hH: 0.8, hW: 2.7, tW: 1.9, tL: 2.4, bL: 4.4, bR: 0.13, skirts: false, extra: 'ears', stripe: 0xf2e6c8 },
  tamandua: { hH: 1.0, hW: 3.2, tW: 2.3, tL: 2.8, bL: 4.8, bR: 0.19, skirts: true, extra: 'snout', stripe: 0xd8c8ee }
};
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.78, metalness: 0.15, flatShading: true, ...o });
const box = (p, w, h, l, x, y, z, m) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); o.position.set(x, y, z); p.add(o); return o; };
const cyl = (p, r1, r2, h, x, y, z, m, rz = 0, rx = 0, seg = 10) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); o.position.set(x, y, z); o.rotation.z = rz; o.rotation.x = rx; p.add(o); return o; };
// ESTEIRA: um só bloco por lado; os elos são listras desenhadas no shader e ROLAM com a velocidade (em vez de dezenas de caixinhas)
const trackMat = (col) => {
  const m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.95, metalness: 0.1, flatShading: true }), u = { value: 0 }; m.userData.scroll = u;
  m.onBeforeCompile = (sh) => { sh.uniforms.uScroll = u; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vTp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvTp=position;'); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vTp;uniform float uScroll;').replace('#include <color_fragment>', '#include <color_fragment>\nfloat stp=fract((vTp.z+uScroll)*3.2);float cl=smoothstep(.0,.08,stp)*(1.-smoothstep(.6,.7,stp));diffuseColor.rgb*=mix(.45,1.3,cl);'); };
  m.customProgramCacheKey = () => 'tankTrack'; return m;
};
const _tv = new THREE.Vector3(), _td = new THREE.Vector3(), _lq = new THREE.Quaternion(), _lm = new THREE.Matrix4(), _lp = new THREE.Vector3(), _lx = new THREE.Vector3(1, 0, 0), _l1 = new THREE.Vector3(1, 1, 1);
// ELOS DA ESTEIRA (um InstancedMesh por lado = 1 desenho): as placas correm de verdade em volta das rodas (em cima para frente, embaixo para trás), na velocidade do tanque
let LINKG = null; const linkGeo = () => LINKG ||= (() => { const a = new THREE.BoxGeometry(0.86, 0.06, 0.27), b = new THREE.BoxGeometry(0.86, 0.045, 0.05); b.translate(0, 0.05, 0); const c = new THREE.BoxGeometry(0.2, 0.05, 0.2); c.translate(0, -0.05, 0); return mergeGeometries([a, b, c]); })();
export class TankAv {
  constructor(id, scale = 1) {
    const sh = SHAPE[id] || SHAPE.jacare, inf = TANK_INFO[id] || TANK_INFO.jacare;
    this.id = id; this.scale = 1.6; this.group = new THREE.Group(); this.dead = false; this.isFauna = true; this.isTank = true; this.weapon = null; this.mats = [];
    const body = mat(inf.col), dark = mat(inf.col2), track = mat(0x1a1c1f, { roughness: 0.95 }), metal = mat(0x2b2f33, { metalness: 0.55, roughness: 0.55 }), accent = mat(sh.stripe), light = mat(0xfff3c0, { emissive: 0xfff3c0, emissiveIntensity: 0.7 }), rubber = mat(0x0e0f11, { roughness: 1 });
    const tail = mat(0x7a0c0c, { emissive: 0xff1a1a, emissiveIntensity: 0.3 }), trkL = trackMat(0x1a1c1f), trkR = trackMat(0x1a1c1f); this.linkM = mat(0x25282c, { roughness: 0.85, metalness: 0.4 }); this.mats.push(body, dark, track, metal, accent, rubber, trkL, trkR, this.linkM); this.tm = [trkL, trkR]; this.tailM = tail; this.headM = light; light.emissiveIntensity = 0.5; const g = this.group, root = new THREE.Group(); g.add(root); this.root = root;
    const L = 6.6, hy = 0.55, top = hy + sh.hH + 0.25;
    // ---- casco: caixa principal, placa inclinada na frente (glacis), traseira com grade do motor e escapamentos
    box(root, sh.hW - 0.9, sh.hH, L - 0.5, 0, hy + sh.hH / 2 + 0.25, 0, body);
    { const gl = box(root, sh.hW - 1.0, 0.16, 1.5, 0, top - 0.02, -L / 2 + 0.55, dark); gl.rotation.x = 0.32; }
    box(root, sh.hW - 1.1, 0.5, 1.7, 0, hy + 0.55, L / 2 - 0.45, dark);
    for (let i = 0; i < 5; i++) box(root, sh.hW - 1.3, 0.05, 0.06, 0, hy + 0.82, L / 2 - 0.05 - i * 0.28, metal);   // grade do motor
    for (const sd of [-1, 1]) { cyl(root, 0.1, 0.1, 0.9, sd * (sh.hW / 2 - 0.9), top + 0.25, L / 2 - 0.35, metal, 0, 0); cyl(root, 0.13, 0.1, 0.12, sd * (sh.hW / 2 - 0.9), top + 0.74, L / 2 - 0.35, dark); }   // escapamentos
    box(root, sh.hW - 0.9, 0.09, 0.06, 0, hy + sh.hH * 0.62, -L / 2 + 0.02, accent);   // faixa na frente
    for (const sd of [-1, 1]) { box(root, 0.22, 0.14, 0.1, sd * (sh.hW / 2 - 1.0), top - 0.05, -L / 2 - 0.02, light); }   // faróis
    // ---- esteiras: bloco escuro, elos (frestas) em cima e embaixo, rodas com cubo, roda-guia e roda-motriz maiores, para-lamas
    this.wheels = [];
    for (const sd of [-1, 1]) {
      const x = sd * (sh.hW / 2 - 0.35), zc = L / 2 - 0.5, Rl = 0.53, yc = 0.56; box(root, 0.78, 0.98, L - 1.0, x, 0.55, 0, sd < 0 ? trkL : trkR);
      for (const zz of [-zc, zc]) cyl(root, 0.5, 0.5, 0.8, x, 0.55, zz, rubber, Math.PI / 2);   // pontas arredondadas da esteira
      { const Ls = 2 * zc, Pl = 2 * Ls + 2 * Math.PI * Rl, n = Math.round(Pl / 0.3), im = new THREE.InstancedMesh(linkGeo(), this.linkM, n); im.userData.keep = 1; im.castShadow = false; im.boundingSphere = new THREE.Sphere(new THREE.Vector3(x, 0.55, 0), L / 2 + 1.2); root.add(im); (this._links ||= []).push({ mesh: im, n, P: Pl, Ls, zc, R: Rl, yc, x }); }
      for (let i = 0; i < 10; i++) cyl(root, 0.045, 0.045, 0.05, x + sd * 0.4, 0.95, -L / 2 + 0.5 + i * 0.62, metal, Math.PI / 2, 0, 6);   // parafusos da lateral
      for (let i = 0; i < 6; i++) { const w = cyl(root, 0.42, 0.42, 0.84, x, 0.46, -L / 2 + 0.8 + i * ((L - 1.6) / 5), metal, Math.PI / 2); this.wheels.push(w); cyl(root, 0.17, 0.17, 0.9, x, 0.46, -L / 2 + 0.8 + i * ((L - 1.6) / 5), accent, Math.PI / 2, 0, 6); }
      this.wheels.push(cyl(root, 0.5, 0.5, 0.84, x, 0.62, -L / 2 + 0.25, metal, Math.PI / 2)); this.wheels.push(cyl(root, 0.52, 0.52, 0.84, x, 0.62, L / 2 - 0.25, metal, Math.PI / 2));
      box(root, 0.92, 0.07, L - 0.4, x, 1.16, 0, dark);   // para-lama
      if (sh.skirts) for (let i = 0; i < 6; i++) box(root, 0.1, 0.72, 0.95, x + sd * 0.46, 0.92, -L / 2 + 0.7 + i * 1.04, body);   // saias de blindagem em placas
    }
    // ---- torre
    const tur = new THREE.Group(); tur.position.set(0, hy + sh.hH + 0.35, 0.3); root.add(tur); this.turret = tur;
    if (sh.dome) { const d = new THREE.Mesh(new THREE.SphereGeometry(sh.tW * 0.55, 12, 7, 0, Math.PI * 2, 0, Math.PI / 2), body); d.scale.set(1, 0.72, sh.tL / sh.tW); tur.add(d); } else { box(tur, sh.tW, 0.85, sh.tL, 0, 0.42, 0, body); const sl = box(tur, sh.tW - 0.2, 0.2, 1.1, 0, 0.62, -sh.tL / 2 - 0.02, body); sl.rotation.x = -0.45; }
    box(tur, sh.tW - 0.5, 0.18, sh.tL - 0.7, 0, 0.92, 0.12, dark); box(tur, sh.tW + 0.04, 0.05, sh.tL + 0.04, 0, 0.1, 0, accent);   // teto + friso na base da torre
    for (const sd of [-1, 1]) box(tur, 0.3, 0.5, 0.9, sd * (sh.tW / 2 + 0.14), 0.45, 0.4, dark);   // caixas de equipamento nas laterais
    box(tur, 0.7, 0.4, 0.5, 0, 0.5, sh.tL / 2 + 0.2, dark);   // caixa na traseira da torre
    // cúpula do comandante: anel, tampa e periscópios
    { const cu = new THREE.Group(); this._cu = cu; cu.position.set(-sh.tW * 0.22, 1.02, 0.55); tur.add(cu); cyl(cu, 0.34, 0.38, 0.22, 0, 0, 0, metal); cyl(cu, 0.3, 0.3, 0.08, 0.0, 0.16, 0, dark); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; box(cu, 0.1, 0.07, 0.06, Math.cos(a) * 0.32, 0.1, Math.sin(a) * 0.32, light); } }
    const gun = new THREE.Group(); gun.position.set(0, 0.5, -sh.tL / 2 + 0.1); tur.add(gun); this.gun = gun;                              // pivô do cano (sobe/desce)
    box(gun, 0.95, 0.85, 0.5, 0, 0, 0.05, dark);                                                                                            // mantelete (escudo do canhão)
    const bar = cyl(gun, sh.bR, sh.bR * 1.05, sh.bL, 0, 0, -sh.bL / 2, metal, 0, Math.PI / 2); this.barrel = bar;
    cyl(gun, sh.bR * 1.35, sh.bR * 1.35, sh.bL * 0.22, 0, 0, -sh.bL * 0.45, dark, 0, Math.PI / 2); cyl(gun, sh.bR * 1.3, sh.bR * 1.3, sh.bL * 0.16, 0, 0, -sh.bL * 0.15, dark, 0, Math.PI / 2);   // luvas de proteção do cano
    cyl(gun, sh.bR * 1.55, sh.bR * 1.55, 0.45, 0, 0, -sh.bL - 0.1, dark, 0, Math.PI / 2);                                                  // freio de boca
    this.muzzle = new THREE.Object3D(); this.muzzle.position.set(0, 0, -sh.bL - 0.4); gun.add(this.muzzle);
    this.flash = { visible: false };   // o clarão da boca agora é feito de partículas (fogo + fumaça), não de um cone
    // metralhadora no teto da torre, com escudo
    const mg = new THREE.Group(); mg.position.set(sh.tW * 0.25, 1.05, 0.0); tur.add(mg); this.mg = mg; box(mg, 0.22, 0.22, 0.55, 0, 0, 0, metal); cyl(mg, 0.04, 0.04, 1.0, 0, 0, -0.75, metal, 0, Math.PI / 2); box(mg, 0.4, 0.3, 0.05, 0, 0.05, -0.28, dark);
    // detalhes de cada tanque
    const E = sh.extra;
    if (E === 'antenna' || E === 'ears') for (const sd of E === 'ears' ? [-1, 1] : [1]) { cyl(tur, 0.03, 0.02, 2.4, sd * (sh.tW / 2 - 0.2), 2.0, 0.95, metal); box(tur, 0.2, 0.2, 0.2, sd * (sh.tW / 2 - 0.2), 0.8, 0.95, dark); }
    if (E === 'plow') { box(root, sh.hW - 0.4, 0.85, 0.4, 0, 0.62, -L / 2 - 0.12, dark); for (let k = -2; k <= 2; k++) box(root, 0.08, 0.7, 0.45, k * 0.55, 0.62, -L / 2 - 0.14, accent); }
    if (E === 'plates') for (let i = 0; i < 4; i++) box(root, sh.hW - 0.6, 0.08, 0.55, 0, top + 0.07, -L / 2 + 1.1 + i * 1.1, accent);
    if (E === 'wings') for (const sd of [-1, 1]) { const f = box(root, 1.1, 0.1, 1.8, sd * (sh.hW / 2 + 0.25), top + 0.1, L / 2 - 1.2, body); f.rotation.z = -sd * 0.25; box(root, 0.8, 0.06, 0.2, sd * (sh.hW / 2 + 0.3), top + 0.18, L / 2 - 1.8, accent); }
    if (E === 'ridge') for (let i = 0; i < 7; i++) cyl(root, 0.0, 0.2, 0.5, 0, top + 0.28, L / 2 - 0.7 - i * 0.55, accent);
    if (E === 'beak') cyl(gun, sh.bR * 1.9, sh.bR * 0.6, 0.9, 0, 0, -sh.bL - 0.45, mat(sh.stripe), 0, Math.PI / 2);
    if (E === 'snout') cyl(gun, sh.bR * 1.35, sh.bR * 0.7, sh.bL * 0.55, 0, 0, -sh.bL * 0.25, dark, 0, Math.PI / 2);
    // caixas de ferramentas e rolo de lona na traseira do casco
    box(root, 0.8, 0.3, 0.5, -sh.hW * 0.22, top + 0.12, L / 2 - 1.4, dark); cyl(root, 0.18, 0.18, 1.1, sh.hW * 0.2, top + 0.2, L / 2 - 1.5, rubber, Math.PI / 2);
    // ---- mais detalhes: rebites, escotilha do motorista, ganchos de reboque, tambores de combustível, lança-fumígenos, anel da torre, frestas de visão
    for (let i = 0; i < 10; i++) for (const sd of [-1, 1]) cyl(root, 0.04, 0.04, 0.06, sd * (sh.hW / 2 - 0.45), hy + sh.hH * 0.62, -L / 2 + 0.6 + i * 0.58, metal, Math.PI / 2, 0, 6);
    cyl(root, 0.3, 0.3, 0.08, -sh.hW * 0.2, top + 0.04, -L / 2 + 1.7, dark); box(root, 0.22, 0.1, 0.1, -sh.hW * 0.2, top + 0.12, -L / 2 + 1.45, metal);
    for (const sd of [-1, 1]) { box(root, 0.16, 0.16, 0.26, sd * (sh.hW / 2 - 0.55), hy + 0.5, -L / 2 - 0.1, metal); box(root, 0.5, 0.26, 0.2, sd * (sh.hW / 2 - 1.0), top - 0.05, -L / 2 - 0.02, dark); }
    for (const sd of [-1, 1]) { cyl(root, 0.26, 0.26, 0.85, sd * 0.5, top + 0.35, L / 2 - 0.9, mat(0x3a4a2e, { roughness: 0.7 })); cyl(root, 0.27, 0.27, 0.06, sd * 0.5, top + 0.55, L / 2 - 0.9, metal); cyl(root, 0.27, 0.27, 0.06, sd * 0.5, top + 0.2, L / 2 - 0.9, metal); }
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) cyl(tur, 0.065, 0.065, 0.34, sd * (sh.tW / 2 + 0.06), 0.62, -0.5 + i * 0.13, metal, 0, Math.PI / 2, 8);
    cyl(tur, sh.tW * 0.58, sh.tW * 0.6, 0.12, 0, 0.04, 0, metal, 0, 0, 16); for (const sd of [-1, 1]) box(tur, 0.5, 0.05, 0.05, sd * (sh.tW * 0.26), 0.62, -sh.tL / 2 + 0.05, dark);
    for (const sd of [-1, 1]) box(root, 0.22, 0.14, 0.06, sd * (sh.hW / 2 - 1.0), hy + 0.6, L / 2 + 0.43, tail);   // lanternas traseiras (acendem ao frear)
    // luz: brilho redondo nos faróis/lanternas e mancha de luz no chão à frente
    { const gp = new Float32Array(4 * 3), gc = new Float32Array(4 * 4), gg = new THREE.BufferGeometry(), px = sh.hW / 2 - 1.0, pts = [[-px, top - 0.05, -L / 2 - 0.2], [px, top - 0.05, -L / 2 - 0.2], [-px, hy + 0.6, L / 2 + 0.5], [px, hy + 0.6, L / 2 + 0.5]];
      pts.forEach((q, i) => gp.set(q, i * 3)); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); gg.setAttribute('color', new THREE.BufferAttribute(gc, 4));
      this.glow = new THREE.Points(gg, new THREE.PointsMaterial({ size: 1.4, map: glowTex(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); this.glow.frustumCulled = false; root.add(this.glow);
      const lp = lightPool(); this.pool = new THREE.Mesh(lp.geo, lp.mat); this.pool.position.set(0, 0.08, -L / 2 - 6.6); this.pool.scale.set(1.25, 1, 1.15); this.pool.frustumCulled = false; this.pool.renderOrder = 2; root.add(this.pool); }
    this.loff = 0; this.placeLinks(0);
    this.L = L; this.hW = sh.hW; this.hy = hy; this.topY = top; this.fs = 0; this.pfs = 0; this.brk = 0; this.dust = 0; this.exh = 0; this.lit = 0; this.litT = 0;   // faróis começam apagados: a tecla L liga/desliga
    this.hullYaw = 0; this.spin = 0; this.rcoil = 0; this.flashT = 0; this.hurtT = 0;
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
    this.pool.castShadow = false; bar.userData.keep = 1;
    this.pool.visible = false; this.glow.visible = false; this.headM.emissiveIntensity = 0.12; this.tailM.emissiveIntensity = 0.25;   // nasce com os faróis APAGADOS (a tecla L liga)
    // OTIMIZAÇÃO: casco/esteiras, torre, cano (sem o tubo que recua), metralhadora e cúpula viram 1 malha por material cada; só o tubo do canhão fica solto (recuo)
    this.wheels = []; try { mergeStatic(root, [tur, gun, mg, this._cu]); } catch (e) { console.warn('[tanque] otimizador desativado:', e.message); }
  }
  // INCLINAÇÃO: o tanque acompanha o terreno como os carros (pitch = subida à frente, roll = lado mais alto); suave
  setTilt(pitch, roll, dt = 0.016) {
    const fd = this.flipDir || 0, k = Math.min(1, dt * (fd ? 3.2 : 7)), tP = fd ? 0 : pitch, tR = fd ? fd * Math.PI : roll;   // CAPOTADO: gira de ponta-cabeça (o servidor manda)
    this.tp = (this.tp || 0) + (tP - (this.tp || 0)) * k; this.tr = (this.tr || 0) + (tR - (this.tr || 0)) * k; this.root.rotation.set(this.tp, 0, this.tr);
    this.root.position.y = 2.3 * Math.max(0, Math.min(1, (Math.abs(this.tr) - 0.5) / 1.6));   // de cabeça para baixo o casco fica acima do chão (apoiado na torre)
  }
  // posiciona os elos ao longo do contorno (reta de cima → arco da frente → reta de baixo → arco de trás); off = metros andados
  placeLinks(offL, offR = offL) {
    for (const lk of this._links || []) {
      const { n, P, Ls, zc, R, yc, x } = lk, arc = Math.PI * R, off = x < 0 ? offL : offR;
      for (let i = 0; i < n; i++) {
        let s = (i * P / n + off) % P; if (s < 0) s += P; let y, z, a;
        if (s < Ls) { z = zc - s; y = yc + R; a = 0; } else if (s < Ls + arc) { const f = (s - Ls) / R; z = -zc - R * Math.sin(f); y = yc + R * Math.cos(f); a = -f; } else if (s < 2 * Ls + arc) { z = -zc + (s - Ls - arc); y = yc - R; a = Math.PI; } else { const f = (s - 2 * Ls - arc) / R; z = zc + R * Math.sin(f); y = yc - R * Math.cos(f); a = Math.PI - f; }
        _lq.setFromAxisAngle(_lx, a); lk.mesh.setMatrixAt(i, _lm.compose(_lp.set(x, y, z), _lq, _l1));
      }
      lk.mesh.instanceMatrix.needsUpdate = true;
    }
  }
  setFlip(d) { if (d !== (this.flipDir || 0)) { this.flipDir = d; this.flipT = 0; } }   // d: 0 normal · 1/-1 capotado para cada lado
  // a torre fica na direção ABSOLUTA ay (mira); o grupo gira com o casco
  setTurret(ay, ap, hullYaw) { this.turret.rotation.y = ay - hullYaw; this.gun.rotation.x = ap; }
  setLights(on) { this.litT = on ? 1 : 0; }   // faróis do tanque (a tecla L manda; vale para todos os jogadores)
  update(dt, st = {}) {
    const sp = st.spd || 0, v = sp * (st.sgn || 1), L = this.L, fx = this.fxs || (this.fxs = (() => { const sc = sceneOf(this.group); return sc ? fxFor(sc) : null; })());
    // GIRO NO PRÓPRIO EIXO: cada esteira anda por si — ao virar, uma vai para frente e a outra para trás (velocidade do casco ± giro × meia-bitola)
    { const yaw = this.group.rotation.y; let dyw = yaw - (this._py ?? yaw); dyw = Math.atan2(Math.sin(dyw), Math.cos(dyw)); this._py = yaw; const yr0 = st.spd === undefined || dt <= 0 ? 0 : dyw / dt; this.yr = (this.yr || 0) + (yr0 - (this.yr || 0)) * Math.min(1, dt * 10); }
    const hwd = this.hW / 2 - 0.35, vL = v - this.yr * hwd, vR = v + this.yr * hwd; this.tm[0].userData.scroll.value += vL * dt * 0.62; this.tm[1].userData.scroll.value += vR * dt * 0.62;   // a esteira rola junto com o tanque
    if (Math.abs(vL) > 0.01 || Math.abs(vR) > 0.01) { this.loffL = (this.loffL || 0) + vL * dt; this.loffR = (this.loffR || 0) + vR * dt; this.placeLinks(this.loffL, this.loffR); }   // e os elos correm em volta das rodas
    if (st.ay != null && st.hy != null) this.setTurret(st.ay, st.pitch || 0, st.hy);
    if (this.rcoil > 0) { this.rcoil = Math.max(0, this.rcoil - dt * 2.4); this.barrel.position.z = -this.barrel.geometry.parameters.height / 2 + this.rcoil * 0.5; } else this.barrel.position.z = -this.barrel.geometry.parameters.height / 2;
    if (this.flashT > 0) { this.flashT -= dt; this.flash.visible = this.flashT > 0; }
    // frenagem: a velocidade cai rápido -> lanternas traseiras acendem forte e sai poeira da frente das esteiras
    this.fs += (sp - this.fs) * Math.min(1, dt * 10); const dec = dt > 0 ? (this.pfs - this.fs) / dt : 0; this.pfs = this.fs; if (dec > 4 && sp > 0.4) this.brk = 0.35; this.brk = Math.max(0, this.brk - dt);
    this.lit += (this.litT - this.lit) * Math.min(1, dt * 10); const live = !this.dead; this.tailM.emissiveIntensity = !live ? 0 : this.brk > 0 ? 4 : 0.25 + 0.65 * this.lit; this.headM.emissiveIntensity = live ? 0.12 + 1.9 * this.lit : 0.05;
    if (this.glow) { const a = this.glow.geometry.attributes.color, c = a.array, set = (i, r, g, b, al) => { c[i * 4] = r; c[i * 4 + 1] = g; c[i * 4 + 2] = b; c[i * 4 + 3] = al; }; for (let i = 0; i < 2; i++) { set(i, 1, 0.95, 0.75, live ? 0.7 * this.lit : 0); set(2 + i, 1, 0.1, 0.08, !live ? 0 : this.brk > 0 ? 0.95 : 0.4 * this.lit); } a.needsUpdate = true; this.pool.visible = live && this.lit > 0.05; this.glow.visible = live && (this.lit > 0.05 || this.brk > 0); }
    if (this.flipDir && this.flipT != null) this.flipT += dt;
    if (fx) {
      fx.tick();
      if (this.flipDir && this.flipT > 2.3 && !this.dead) { this.root.updateMatrixWorld(); _tv.set(0, 1.4, 0); this.root.localToWorld(_tv); this.fl2 = (this.fl2 || 0) - dt; if (this.fl2 < 0) { this.fl2 = 0.07; fx.norm.spawn(_tv.x + (Math.random() - 0.5) * 2, _tv.y, _tv.z + (Math.random() - 0.5) * 2, 0, 1.6 + Math.random(), 0, 1.6, 1.4, 4.2, 0.1, 0.1, 0.11, 0.55, 0.4); if (Math.random() < 0.5) fx.add.spawn(_tv.x + (Math.random() - 0.5) * 2.4, _tv.y - 0.4, _tv.z + (Math.random() - 0.5) * 2.4, 0, 1.4, 0, 0.7, 1.2, 2.2, 1, 0.5, 0.1, 0.9, 0.2); } }   // depois de 2,3 s de ponta-cabeça: fumaça e fogo this.root.updateMatrixWorld(); _td.set(0, 0, -1).transformDirection(this.root.matrixWorld);
      if (live && (sp > 1.2 || Math.abs(this.yr || 0) > 0.4)) {   // poeira levantada pelas esteiras (mais forte rápido ou freando)
        this.dust -= dt * (5 + sp * 1.6) * (this.brk > 0 ? 2 : 1); while (this.dust < 0) { this.dust += 1; const sd = Math.random() < 0.5 ? -1 : 1; _tv.set(sd * (this.hW / 2 - 0.35), 0.2, (st.sgn || 1) >= 0 ? L / 2 - 0.2 : -L / 2 + 0.2); this.root.localToWorld(_tv);
          fx.norm.spawn(_tv.x + (Math.random() - 0.5) * 0.4, _tv.y, _tv.z + (Math.random() - 0.5) * 0.4, -_td.x * v * 0.12 + (Math.random() - 0.5) * 1.6, 0.6 + Math.random() * 1.0, -_td.z * v * 0.12 + (Math.random() - 0.5) * 1.6, 1.0 + Math.random() * 0.8, 0.8, 2.6, 0.6, 0.54, 0.44, 0.22 + 0.1 * Math.min(1, sp / 8), 1.1); } }
      if (live) { this.exh -= dt * (sp > 1 ? 12 : 5); while (this.exh < 0) { this.exh += 1; for (const sd of [-1, 1]) { _tv.set(sd * (this.hW / 2 - 0.9), this.topY + 0.8, L / 2 - 0.35); this.root.localToWorld(_tv); fx.norm.spawn(_tv.x, _tv.y, _tv.z, -_td.x * 0.8, 0.9, -_td.z * 0.8, 1.0, 0.25, 1.1, 0.2, 0.2, 0.22, sp > 1 ? 0.4 : 0.22, 1.2); } } }
    }
  }
  setDead(d) { d = !!d; if (d === this.dead) return; this.dead = d; if (d) this.pool.visible = false; for (const m of this.mats) m.color.multiplyScalar(d ? 0.35 : 1 / 0.35); this.turret.rotation.z = d ? 0.12 : 0; this.gun.rotation.x = d ? -0.2 : this.gun.rotation.x; }
  melee(k, big = false) {
    this.rcoil = 1; this.flashT = big ? 0.12 : 0.08; this.flash.visible = true;
    // clarão e fumaça da boca do canhão: fogo aditivo curto + nuvem cinza que sai na direção do cano
    const fx = this.fxs || (sceneOf(this.group) ? fxFor(sceneOf(this.group)) : null); if (!fx) return; this.group.updateMatrixWorld(true); const m = this.muzzleWorld(), d = this.barrelDir(), n = big ? 1 : 0.35;
    for (let i = 0; i < 7 * n + 2; i++) fx.add.spawn(m.x + d.x * Math.random() * 0.6, m.y + d.y * Math.random() * 0.6, m.z + d.z * Math.random() * 0.6, d.x * (6 + Math.random() * 8) + (Math.random() - 0.5) * 2, d.y * 8 + Math.random() * 2, d.z * (6 + Math.random() * 8) + (Math.random() - 0.5) * 2, 0.14 + Math.random() * 0.1, 1.2 * (big ? 1.6 : 1), 3.4 * (big ? 1.6 : 1), 1, 0.62 + Math.random() * 0.25, 0.15, 0.95, 3);
    for (let i = 0; i < 9 * n + 2; i++) fx.norm.spawn(m.x + d.x * Math.random() * 0.5, m.y + d.y * Math.random() * 0.5, m.z + d.z * Math.random() * 0.5, d.x * (2 + Math.random() * 5) + (Math.random() - 0.5) * 1.5, d.y * 2 + 0.6 + Math.random() * 1.2, d.z * (2 + Math.random() * 5) + (Math.random() - 0.5) * 1.5, 1.1 + Math.random() * 0.8, 0.9, 3.4 * (big ? 1.3 : 0.8), 0.5, 0.5, 0.52, 0.45, 1.4);
  }
  fire() { this.melee('cannon', true); }
  hurt() {}
  setFP() {} hold() {} dispose() {} kick() {} rec() {}
  barrelDir() { const v = new THREE.Vector3(); this.muzzle.getWorldDirection(v); return v.negate(); }
  muzzleWorld() { return this.muzzle.getWorldPosition(new THREE.Vector3()); }
  eyeWorld() { return this.group.getWorldPosition(new THREE.Vector3()); }
}
