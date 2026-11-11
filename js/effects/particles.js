import * as THREE from 'three';
// PARTÍCULAS BARATAS (poeira, fumaça, fogo): 1 objeto Points por tipo de mistura (normal / aditiva) para a cena inteira, tudo atualizado numa passada.
// Cada partícula tem posição, velocidade, tamanho (cresce ao longo da vida), cor e alfa (some); o desenho é 1 chamada por pool, não importa quantas.
let TEX = null;
const tex = () => {
  if (TEX) return TEX; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.6)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  TEX = new THREE.CanvasTexture(c); TEX.colorSpace = THREE.SRGBColorSpace; return TEX;
};
const VS = 'attribute float size;attribute vec4 color;uniform float uScale;varying vec4 vC;void main(){vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*uScale/max(0.1,-mv.z);gl_Position=projectionMatrix*mv;}';
const FS = 'uniform sampler2D map;varying vec4 vC;void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(vC.rgb,vC.a*t.a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}';
class Pool {
  constructor(scene, max, add) {
    this.n = max; this.i = 0; const n = max;
    this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 4); this.siz = new Float32Array(n);
    this.vel = new Float32Array(n * 3); this.age = new Float32Array(n).fill(9); this.dur = new Float32Array(n).fill(1); this.s0 = new Float32Array(n); this.s1 = new Float32Array(n); this.a0 = new Float32Array(n); this.rgb = new Float32Array(n * 3); this.drag = new Float32Array(n);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(this.col, 4)); geo.setAttribute('size', new THREE.BufferAttribute(this.siz, 1));
    this.u = { value: 600 };
    this.pts = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: { map: { value: tex() }, uScale: this.u }, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending }));
    this.pts.frustumCulled = false; this.pts.renderOrder = 5; scene.add(this.pts); this.live = 0;
  }
  spawn(x, y, z, vx, vy, vz, dur, s0, s1, r, g, b, a, drag = 0.6) {
    const i = this.i; this.i = (i + 1) % this.n; const p = i * 3;
    this.pos[p] = x; this.pos[p + 1] = y; this.pos[p + 2] = z; this.vel[p] = vx; this.vel[p + 1] = vy; this.vel[p + 2] = vz; this.age[i] = 0; this.dur[i] = dur; this.s0[i] = s0; this.s1[i] = s1; this.a0[i] = a; this.rgb[p] = r; this.rgb[p + 1] = g; this.rgb[p + 2] = b; this.drag[i] = drag;
  }
  update(dt) {
    const { pos, vel, age, dur, col, siz, rgb } = this; let live = 0;
    for (let i = 0; i < this.n; i++) {
      if (age[i] >= dur[i]) { if (siz[i]) { siz[i] = 0; col[i * 4 + 3] = 0; } continue; }
      age[i] += dt; const k = age[i] / dur[i], p = i * 3, dg = Math.max(0, 1 - this.drag[i] * dt);
      if (k >= 1) { siz[i] = 0; col[i * 4 + 3] = 0; continue; }
      live++; vel[p] *= dg; vel[p + 1] *= dg; vel[p + 2] *= dg; pos[p] += vel[p] * dt; pos[p + 1] += vel[p + 1] * dt; pos[p + 2] += vel[p + 2] * dt;
      siz[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * k; col[i * 4] = rgb[p]; col[i * 4 + 1] = rgb[p + 1]; col[i * 4 + 2] = rgb[p + 2]; col[i * 4 + 3] = this.a0[i] * (1 - k) * Math.min(1, k * 8);
    }
    this.live = live; const a = this.pts.geometry.attributes; a.position.needsUpdate = a.color.needsUpdate = a.size.needsUpdate = true; this.pts.visible = live > 0 || this._was; this._was = live > 0;
  }
}
const BY = new WeakMap();
// efeitos da cena: quem emite chama fxFor(cena).tick() — roda no máximo 1 vez por quadro
export function fxFor(scene) {
  let f = BY.get(scene); if (f) return f;
  f = { norm: new Pool(scene, 520, false), add: new Pool(scene, 160, true), last: 0,
    tick() { const now = performance.now(); if (now === this.last) return; const dt = Math.min(0.1, Math.max(0.001, (now - (this.last || now - 16)) / 1000)); this.last = now; const s = (typeof innerHeight === 'number' ? innerHeight : 800) * 0.6; this.norm.u.value = this.add.u.value = s; this.norm.update(dt); this.add.update(dt); } };
  BY.set(scene, f); return f;
}
export function sceneOf(o) { let s = o; while (s?.parent) s = s.parent; return s?.isScene ? s : null; }

// brilho redondo de lanterna e mancha de luz de farol no chão (aditivos) — compartilhados por carros e tanques
let GLOW = null, POOL = null, POOLG = null;
export const glowTex = () => {
  if (GLOW) return GLOW; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  GLOW = new THREE.CanvasTexture(c); GLOW.colorSpace = THREE.SRGBColorSpace; return GLOW;
};
export function lightPool() {
  if (POOL) return { geo: POOLG, mat: POOL }; const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d');
  x.translate(32, 108); x.scale(1, 1.9); const g = x.createRadialGradient(0, 0, 2, 0, 0, 32); g.addColorStop(0, 'rgba(255,246,215,1)'); g.addColorStop(0.4, 'rgba(255,238,190,.45)'); g.addColorStop(1, 'rgba(255,230,170,0)'); x.fillStyle = g; x.fillRect(-32, -60, 64, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; POOLG = new THREE.PlaneGeometry(5.6, 12); POOLG.rotateX(-Math.PI / 2);
  POOL = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  return { geo: POOLG, mat: POOL };
}
