import * as THREE from 'three';
import { BUILD, MT } from './arsenalModels.js';
// ARMAS DA LOJA, VERSÃO 2 (18/11/2026): cada uma é uma ARMA DE VERDADE do arsenal (mesmo kit de peças: ferrolho, guarda-mão, coronha, carregador, miras, bocal) pintada com a paleta do tema
// e com peças temáticas coladas (cabeça de cobra, bico de tucano, dentes de piranha, chifres, fogo, cristais…). Assim têm a mesma construção, escala e acessórios do resto do arsenal.
// Eixo do cano = +X, cano em y = 0 (igual aos modelos do arsenal). Materiais pintados ficam em cache por arma (1 material por peça de cor, sem clonar por quadro).
const T = THREE, V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z), mat = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.5, metalness: o.m ?? 0.2, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, side: o.s ?? 0 });
const mesh = (g, geo, m, p, r, s) => { const k = new T.Mesh(geo, m); k.position.set(...p); if (r) k.rotation.set(...r); if (s) k.scale.set(...s); k.castShadow = k.receiveShadow = true; g.add(k); return k; };
const bx = (g, w, h, d, p, m, r) => mesh(g, new T.BoxGeometry(w, h, d), m, p, r);
const cy = (g, r1, r2, l, p, m, ax = 'x', sg = 10) => mesh(g, new T.CylinderGeometry(r1, r2, l, sg), m, p, ax === 'x' ? [0, 0, -Math.PI / 2] : ax === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]);
const sp = (g, r, p, m, s) => mesh(g, new T.SphereGeometry(r, 10, 8), m, p, null, s);
const co = (g, r, l, p, m, ax = 'x', sg = 7) => mesh(g, new T.ConeGeometry(r, l, sg), m, p, ax === 'x' ? [0, 0, -Math.PI / 2] : ax === 'nx' ? [0, 0, Math.PI / 2] : ax === 'ny' ? [Math.PI, 0, 0] : [0, 0, 0]);
const tor = (g, R, r, p, m, ax = 'x') => mesh(g, new T.TorusGeometry(R, r, 6, 14), m, p, ax === 'x' ? [0, Math.PI / 2, 0] : ax === 'z' ? [0, 0, 0] : [Math.PI / 2, 0, 0]);
const glow = (c, ei = 2.4) => mat(c, { e: c, ei, r: 0.3 });
// pinta: troca cada material do kit (steel, blued, black, poly, wood…) por um da paleta da arma; pal[slot] = [cor, metal, rugosidade, emissivo?, intensidade?]
const rev = new Map(); const slotOf = (m) => { if (!rev.size) for (const [k, v] of Object.entries(MT)) rev.set(v, k); return rev.get(m); };
function paint(g, id, pal) {
  const cache = new Map();
  g.traverse((o) => { if (!o.isMesh) return; const k = slotOf(o.material), p = k && pal[k]; if (!p) return; let m = cache.get(k); if (!m) { m = o.material.clone(); m.color.setHex(p[0]); if (p[1] != null) m.metalness = p[1]; if (p[2] != null) m.roughness = p[2]; if (p[3]) { m.emissive.setHex(p[3]); m.emissiveIntensity = p[4] ?? 1.2; } if (m.map) m.map = null; if (m.bumpMap) m.bumpMap = null; cache.set(k, m); } o.material = m; });
}
const themed = (id, base, pal, decor) => () => {
  const g = BUILD[base](); paint(g, id, pal); const b = new T.Box3().setFromObject(g);
  try { decor?.(g, { x0: b.min.x, x1: b.max.x, y0: b.min.y, y1: b.max.y, cx: (b.min.x + b.max.x) / 2 }); } catch (e) { console.warn('[arma loja] ' + id, e.message); }
  return g;
};
const P = (c, m = 0.3, r = 0.5, e, ei) => [c, m, r, e, ei];
const spots = (g, n, x0, x1, y, zs, m, r = 0.035, seed = 7) => { let s = seed; const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); for (let i = 0; i < n; i++) sp(g, r * (0.7 + R() * 0.6), [x0 + R() * (x1 - x0), y + (R() - 0.5) * 0.12, zs * (R() < 0.5 ? 1 : -1)], m, [1, 1, 0.35]); };
const ring = (g, x, y, R, r, m, n = 1) => { for (let i = 0; i < n; i++) tor(g, R, r, [x + i * 0.09, y, 0], m, 'x'); };

export const STORE_GUNS_BUILD = {
  // ----- SMGs -----
  trovao: themed('trovao', 'tommy', { blued: P(0x1c4fd8, 0.3, 0.45), steel: P(0xffd21a, 0.6, 0.35), black: P(0x0f6a30, 0.3, 0.5), wood: P(0x13a04a, 0.1, 0.5), gold: P(0xffd21a, 0.6, 0.3) }, (g, b) => {   // Trovão do Surdo: tambor de surdo (carregador de tambor) verde/amarelo/azul + baquetas cruzadas
    const stick = mat(0xf1e7cc, { r: 0.6 }), bead = mat(0xd8321f, { r: 0.5 }); for (const s of [-1, 1]) { const k = cy(g, 0.012, 0.012, 0.46, [b.cx, b.y1 + 0.05, 0], stick, 'x'); k.rotation.y = s * 0.35; sp(g, 0.025, [b.cx + 0.23 * Math.cos(0.35), b.y1 + 0.05, -s * 0.23 * Math.sin(0.35)], bead); }
    for (const x of [b.x0 + 0.1, b.cx - 0.05]) tor(g, 0.075, 0.008, [x, b.y0 + 0.12, 0], mat(0xffd21a, { m: 0.6, r: 0.3 }), 'z'); }),
  arraia: themed('arraia', 'vector', { tan: P(0xff3d6e, 0.2, 0.45), blued: P(0x19a0e8, 0.4, 0.4), black: P(0x1b1f24), steel: P(0xf2f2f2, 0.5, 0.3), poly: P(0xffd23d, 0.1, 0.6) }, (g, b) => {   // Arraia de Cerol: pipa em losango como mira, linha com carretel
    const cols = [0xff3d6e, 0x19a0e8, 0xffd23d, 0x2fbf4f]; cols.forEach((c, i) => { const q = bx(g, 0.2, 0.2, 0.012, [b.cx + 0.05, b.y1 + 0.2, 0], mat(c, { s: 2, r: 0.7 }), [0, 0, Math.PI / 4]); q.scale.set(i < 2 ? 0.5 : 0.5, 0.5, 1); q.position.x += (i % 2 ? 1 : -1) * 0.052; q.position.y += (i < 2 ? 1 : -1) * 0.052; });
    cy(g, 0.004, 0.004, 0.18, [b.cx + 0.05, b.y1 + 0.04, 0], mat(0xffffff), 'y'); cy(g, 0.04, 0.04, 0.05, [b.x0 + 0.18, b.y0 + 0.14, 0.07], mat(0x19a0e8, { m: 0.3 }), 'z', 12); tor(g, 0.045, 0.01, [b.x0 + 0.18, b.y0 + 0.14, 0.095], mat(0xffd23d), 'z'); }),
  trioel: themed('trioel', 'mp5', { black: P(0x1c1c24, 0.3, 0.5), poly: P(0x2a2a36, 0.1, 0.7), steel: P(0xc9c9d8, 0.7, 0.3) }, (g, b) => {   // Trio Elétrico: caixas de som e luzes de LED
    const sc = mat(0x15151c, { r: 0.6 }), cone = mat(0xc9c9d8, { m: 0.6, r: 0.3 }); for (const s of [-1, 1]) { cy(g, 0.1, 0.1, 0.04, [b.cx, 0.02, s * 0.075], sc, 'z', 14); cy(g, 0.06, 0.03, 0.045, [b.cx, 0.02, s * 0.095], cone, 'z', 12); cy(g, 0.032, 0.032, 0.04, [b.cx - 0.2, 0.0, s * 0.075], sc, 'z', 12); }
    [0xff3d9a, 0x19f0e0, 0xffe14a, 0x5cff8a, 0x9a5cff].forEach((c, i) => bx(g, 0.07, 0.022, 0.05, [b.cx - 0.22 + i * 0.1, b.y1 + 0.02, 0], glow(c, 2.2))); }),
  // ----- Rifles -----
  sucuri: themed('sucuri', 'ak', { blued: P(0x1a6b34, 0.35, 0.4), steel: P(0x3fb34a, 0.4, 0.4), black: P(0x0e3a1c), wood: P(0x2a8a3f, 0.15, 0.45), gold: P(0xffd21a, 0.6, 0.3) }, (g, b) => {   // Sucuri Real: escamas verdes, cabeça de cobra no bocal e voltas de cobra no guarda-mão
    const sk = mat(0x3fb34a, { m: 0.2, r: 0.4 }), bl = mat(0xffd21a, { r: 0.4 }), eye = glow(0xffe14a, 1.6);
    sp(g, 0.075, [b.x1 + 0.06, 0, 0], sk, [1.5, 0.8, 1]); co(g, 0.05, 0.12, [b.x1 + 0.16, 0, 0], sk, 'x'); for (const s of [-1, 1]) { sp(g, 0.02, [b.x1 + 0.07, 0.04, s * 0.045], eye); co(g, 0.012, 0.05, [b.x1 + 0.16, -0.03, s * 0.025], mat(0xffffff), 'ny'); }
    bx(g, 0.07, 0.006, 0.014, [b.x1 + 0.26, -0.005, 0], mat(0xd8321f));
    for (let i = 0; i < 4; i++) { tor(g, 0.065, 0.016, [b.cx + 0.12 + i * 0.075, 0, 0], i % 2 ? sk : bl, 'x'); } }),
  boitata: themed('boitata', 'ak', { blued: P(0x6a1a08, 0.35, 0.45), steel: P(0xff6a10, 0.4, 0.35, 0xff3a00, 0.35), black: P(0x2a0d05), wood: P(0xff9a1a, 0.1, 0.4, 0xff5a00, 0.5), gold: P(0xffd21a, 0.6, 0.3) }, (g, b) => {   // Boitatá: cobra de fogo, olhos de fogo-fátuo azuis e chamas
    const fl = mat(0xff8a1a, { e: 0xff5a00, ei: 1.6, r: 0.4 }), fl2 = mat(0xffd21a, { e: 0xffb000, ei: 1.8, r: 0.4 }), eye = glow(0x40ffc0, 3);
    for (let i = 0; i < 5; i++) tor(g, 0.062, 0.017, [b.cx + 0.08 + i * 0.07, 0, 0], i % 2 ? fl : fl2, 'x');
    sp(g, 0.07, [b.x1 + 0.05, 0, 0], fl, [1.4, 0.8, 1]); for (const s of [-1, 1]) sp(g, 0.025, [b.x1 + 0.06, 0.035, s * 0.04], eye); co(g, 0.05, 0.14, [b.x1 + 0.17, 0, 0], fl2, 'x');
    for (let i = 0; i < 3; i++) co(g, 0.035 - i * 0.008, 0.16 + i * 0.03, [b.x0 - 0.05 - i * 0.04, 0.02 + i * 0.03, 0], fl2, 'nx'); }),
  cuca: themed('cuca', 'battle', { tan: P(0x3a7a2a, 0.2, 0.55), blued: P(0x1f4a1a, 0.4, 0.4), black: P(0x14240f), wood: P(0x2d6a2a, 0.1, 0.6), steel: P(0x9a6adf, 0.6, 0.35) }, (g, b) => {   // Cuca: jacaré de bruxa — dentes no bocal, chapéu roxo, olhos amarelos
    const tooth = mat(0xf4f1e6, { r: 0.4 }), gr = mat(0x3a7a2a, { r: 0.5 }), hat = mat(0x6a2fb8, { r: 0.6 }); for (const s of [-1, 1]) for (let i = 0; i < 5; i++) co(g, 0.012, 0.045, [b.x1 - 0.02 - i * 0.045, -0.035, s * 0.05], tooth, 'ny');
    bx(g, 0.18, 0.05, 0.13, [b.x1 - 0.05, 0.05, 0], gr); for (const s of [-1, 1]) sp(g, 0.022, [b.x1 - 0.1, 0.085, s * 0.05], glow(0xffe14a, 1.6));
    cy(g, 0.1, 0.1, 0.012, [b.cx, b.y1 + 0.03, 0], hat, 'y', 14); co(g, 0.07, 0.17, [b.cx, b.y1 + 0.12, 0], hat, 'y', 12); tor(g, 0.07, 0.01, [b.cx, b.y1 + 0.05, 0], mat(0xffd21a), 'y'); }),
  saci: themed('saci', 'bullpup', { od: P(0x7a1f1f, 0.2, 0.55), steel: P(0x4a3a2a, 0.4, 0.5), black: P(0x1a1410), gold: P(0xd4a017, 0.6, 0.3) }, (g, b) => {   // Saci Pererê: carapuça vermelha, cachimbo e redemoinho
    const red = mat(0xd8321f, { r: 0.55 }); co(g, 0.07, 0.2, [b.cx - 0.05, b.y1 + 0.1, 0], red, 'y', 10); tor(g, 0.062, 0.016, [b.cx - 0.05, b.y1 + 0.01, 0], red, 'y');
    cy(g, 0.012, 0.012, 0.16, [b.x0 + 0.02, 0.0, 0.07], mat(0x3a2410), 'x'); cy(g, 0.03, 0.026, 0.05, [b.x0 - 0.06, 0.02, 0.07], mat(0x3a2410), 'y'); for (let i = 0; i < 3; i++) sp(g, 0.014 + i * 0.008, [b.x0 - 0.06 + i * 0.01, 0.07 + i * 0.05, 0.07 + i * 0.012], mat(0xcfcfcf, { r: 0.9 }));
    for (let i = 0; i < 3; i++) tor(g, 0.045 + i * 0.02, 0.006, [b.x1 + 0.03 + i * 0.05, 0, 0], mat(0xdfe8f0, { r: 0.4 }), 'x'); }),
  iara: themed('iara', 'ghost', { black: P(0x0f6a6a, 0.4, 0.35), blued: P(0x19c8c0, 0.5, 0.3), poly: P(0x7a5cd1, 0.2, 0.5), steel: P(0xe8fffa, 0.6, 0.25) }, (g, b) => {   // Iara: sereia — cauda de peixe na coronha, pérolas e bolhas
    const sc = mat(0x19c8c0, { m: 0.4, r: 0.3, s: 2 }), pearl = mat(0xfaf6ff, { m: 0.5, r: 0.2, e: 0xaaaaff, ei: 0.25 }); for (let i = 0; i < 5; i++) { const f = bx(g, 0.012, 0.14, 0.05, [b.x0 - 0.03, 0.0, (i - 2) * 0.035], sc, [0, 0, (i - 2) * 0.28]); f.position.y += Math.abs(i - 2) * -0.01; }
    for (let i = 0; i < 6; i++) sp(g, 0.017, [b.cx - 0.1 + i * 0.1, b.y1 - 0.03, 0.045], pearl); for (let i = 0; i < 5; i++) sp(g, 0.012 + (i % 3) * 0.006, [b.x1 + 0.04 + i * 0.05, 0.02 + (i % 2) * 0.035, ((i * 37) % 5 - 2) * 0.012], mat(0xbff6ff, { m: 0.1, r: 0.1, e: 0x66e8ff, ei: 0.5 })); }),
  onca: themed('onca', 'carbine', { tan: P(0xe0a21a, 0.15, 0.55), poly: P(0xe0a21a, 0.1, 0.6), black: P(0x1a1208), steel: P(0x6a5a3a, 0.5, 0.4), blued: P(0x2a2010, 0.4, 0.4) }, (g, b) => {   // Fuzil Onça-Pintada: pelagem amarela com rosetas pretas
    const sm = mat(0x1a1208, { r: 0.7 }); spots(g, 16, b.x0 + 0.05, b.x1 - 0.1, 0.0, 0.052, sm, 0.04); spots(g, 6, b.x0 + 0.02, b.x0 + 0.3, -0.05, 0.05, sm, 0.034, 3);
    co(g, 0.025, 0.06, [b.x1 + 0.03, 0.05, 0], mat(0xe0a21a), 'x'); for (const s of [-1, 1]) co(g, 0.02, 0.05, [b.x0 + 0.02, 0.1, s * 0.05], mat(0xe0a21a), 'y'); }),
  cangaco: themed('cangaco', 'lever', { wood: P(0x6a3d1c, 0.1, 0.7), steel: P(0xc9a24a, 0.7, 0.3), blued: P(0x3a2412, 0.3, 0.6), gold: P(0xd4a017, 0.7, 0.3) }, (g, b) => {   // Fuzil do Cangaço: couro, estrela de cangaceiro e cartucheira
    const leather = mat(0x7a4a22, { r: 0.8 }), gold = mat(0xd4a017, { m: 0.7, r: 0.3 }); bx(g, 0.42, 0.045, 0.012, [b.cx - 0.05, -0.04, 0.062], leather, [0, 0, -0.15]); for (let i = 0; i < 6; i++) cy(g, 0.012, 0.012, 0.045, [b.cx - 0.2 + i * 0.07, -0.04 + i * -0.0105, 0.07], gold, 'y');
    for (let i = 0; i < 6; i++) { const t = bx(g, 0.05, 0.012, 0.01, [b.cx + 0.05, 0.03, 0.056], gold, [0, 0, i * Math.PI / 3]); } tor(g, 0.04, 0.006, [b.cx + 0.05, 0.03, 0.058], gold, 'z'); }),
  tamandua: themed('tamandua', 'hunter', { tan: P(0x8a6a4a, 0.1, 0.7), wood: P(0x6a4a2a, 0.1, 0.7), black: P(0x2a2018), blued: P(0x3a2a1c, 0.3, 0.5), steel: P(0xb8a888, 0.4, 0.5) }, (g, b) => {   // Tamanduá-Bandeira: focinho comprido, faixa preta e rabo peludo
    const fur = mat(0x8a6a4a, { r: 0.85 }), blk = mat(0x1a1410, { r: 0.8 }); co(g, 0.055, 0.34, [b.x1 + 0.15, 0, 0], fur, 'x', 8); sp(g, 0.018, [b.x1 + 0.3, 0, 0], blk);
    for (let i = 0; i < 4; i++) bx(g, 0.05, 0.16, 0.014, [b.cx - 0.1 + i * 0.045, 0.0, 0.056], blk, [0, 0, 0.5]);
    for (let i = 0; i < 6; i++) co(g, 0.03 - i * 0.003, 0.2 - i * 0.02, [b.x0 - 0.05 - i * 0.04, 0.03 + i * 0.012, 0], fur, 'nx'); }),
  cristal: themed('cristal', 'phantom', { black: P(0x23305a, 0.4, 0.3), blued: P(0x3a4a8a, 0.5, 0.25), poly: P(0xaee0ff, 0.1, 0.15, 0x4aa8ff, 0.3), steel: P(0xe8f4ff, 0.8, 0.15) }, (g, b) => {   // Fuzil Cristal de Minas: aglomerados de cristal brilhando
    const q = [mat(0xaee0ff, { m: 0.1, r: 0.1, e: 0x4aa8ff, ei: 0.7 }), mat(0xffb3e6, { m: 0.1, r: 0.1, e: 0xff4fb3, ei: 0.6 }), mat(0xc8ffe8, { m: 0.1, r: 0.1, e: 0x2affb0, ei: 0.6 })];
    for (let i = 0; i < 9; i++) { const x = b.x0 + 0.1 + (i / 8) * (b.x1 - b.x0 - 0.2), h = 0.08 + (i % 3) * 0.05, k = co(g, 0.025, h, [x, b.y1 - 0.01 + h / 2 - 0.02, 0], q[i % 3], 'y', 5); k.rotation.z = (i % 2 ? 1 : -1) * 0.25; }
    for (let i = 0; i < 4; i++) co(g, 0.02, 0.09, [b.cx - 0.1 + i * 0.12, -0.07, 0.04 * (i % 2 ? 1 : -1)], q[(i + 1) % 3], 'ny', 5); }),
  lobisomem: themed('lobisomem', 'ar', { poly: P(0x0e0e11, 0.05, 0.96), black: P(0x0a0a0c, 0.05, 0.96), steel: P(0x1c1c21, 0.25, 0.92), blued: P(0x121216, 0.1, 0.94), tan: P(0x15151a, 0.05, 0.96), od: P(0x0d0d10, 0.05, 0.96), gold: P(0x2c2c32, 0.35, 0.85), navy: P(0x0d0d10, 0.05, 0.96) }, (g, b) => {   // Fuzil Lobisomem: pelo cinza, lua cheia, garras
    sp(g, 0.07, [b.cx - 0.05, b.y1 + 0.1, 0], mat(0xf4f1e6, { r: 0.6, e: 0xfff2c0, ei: 0.7 })); sp(g, 0.06, [b.cx - 0.03, b.y1 + 0.11, 0.01], mat(0x14141c, { r: 0.8 }), [1, 1, 0.3]).visible = false;
    for (let i = 0; i < 3; i++) bx(g, 0.012, 0.16, 0.012, [b.cx + 0.04 + i * 0.035, 0, 0.056], glow(0xd8321f, 1.6), [0, 0, 0.45]);
    for (let i = 0; i < 7; i++) co(g, 0.02, 0.09, [b.x0 + 0.03 + i * 0.05, 0.05 + (i % 2) * 0.015, 0.04 * (i % 2 ? 1 : -1)], mat(0x5a5a68, { r: 0.9 }), 'nx'); }),
  berimbau: themed('berimbau', 'lever', { wood: P(0x8a5a2c, 0.1, 0.65), steel: P(0xd4a017, 0.6, 0.3), blued: P(0x3a2410, 0.3, 0.6), gold: P(0xffd21a, 0.6, 0.3) }, (g, b) => {   // Berimbau de Guerra: verga curva com arame e cabaça
    const wire = mat(0xdfe8f0, { m: 0.9, r: 0.2 }), cab = mat(0xe8a23a, { r: 0.55 }); const n = 6, pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push(V(b.x0 + 0.05 + t * (b.x1 - b.x0 - 0.1), -0.06 - Math.sin(t * Math.PI) * 0.22, 0.07)); }
    for (let i = 0; i < n; i++) { const a = pts[i], c = pts[i + 1], d = c.clone().sub(a), m = mesh(g, new T.CylinderGeometry(0.014, 0.014, d.length(), 6), mat(0x8a5a2c, { r: 0.7 }), a.clone().add(c).multiplyScalar(0.5).toArray()); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }
    cy(g, 0.004, 0.004, b.x1 - b.x0 - 0.1, [b.cx, -0.06, 0.07], wire, 'x'); sp(g, 0.07, [b.cx - 0.1, -0.2, 0.07], cab); cy(g, 0.03, 0.03, 0.02, [b.cx - 0.1, -0.2, 0.135], mat(0x2a1a0a), 'z');
    [0xd8321f, 0x1c4fd8, 0x13a04a].forEach((c, i) => bx(g, 0.012, 0.09, 0.012, [b.x0 + 0.08 + i * 0.03, -0.1, 0.07], mat(c), [0, 0, 0.2])); }),
  // ----- Escopetas -----
  piranha: themed('piranha', 'shotgun', { steel: P(0xb8c4d0, 0.75, 0.3), blued: P(0x7a8a9a, 0.6, 0.35), black: P(0x3a4a5a, 0.4, 0.45), wood: P(0xd83030, 0.1, 0.45), gold: P(0xffffff, 0.3, 0.4) }, (g, b) => {   // Escopeta Piranha: mandíbula de dentes no cano, barbatana dorsal e cauda
    const tooth = mat(0xfaf6ee, { r: 0.35 }), jaw = mat(0xb8c4d0, { m: 0.7, r: 0.3 }), red = mat(0xd83030, { r: 0.5 });
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { co(g, 0.012, 0.05, [b.x1 - 0.03 - i * 0.04, -0.04 * 0 + 0.045, s * 0.03], tooth, 'ny', 4); co(g, 0.012, 0.045, [b.x1 - 0.04 - i * 0.04, -0.045, s * 0.03], tooth, 'y', 4); }
    bx(g, 0.26, 0.015, 0.09, [b.x1 - 0.14, 0.07, 0], jaw); bx(g, 0.26, 0.015, 0.09, [b.x1 - 0.14, -0.07, 0], red);
    const fin = mesh(g, new T.CylinderGeometry(0.0, 0.1, 0.012, 3), jaw, [b.cx, b.y1 + 0.03, 0], [0, 0, 0], [1, 1, 1]); fin.rotation.set(Math.PI / 2, 0, Math.PI / 2); fin.scale.set(1.6, 1, 1);
    for (let i = 0; i < 3; i++) bx(g, 0.012, 0.14, 0.05, [b.x0 - 0.03, 0.0, (i - 1) * 0.045], jaw, [0, 0, (i - 1) * 0.35]);
    sp(g, 0.022, [b.x1 - 0.2, 0.05, 0.05], mat(0xffffff)); sp(g, 0.011, [b.x1 - 0.2, 0.05, 0.065], mat(0x111111)); }),
  tucano: themed('tucano', 'pump', { steel: P(0xffa31a, 0.3, 0.45), black: P(0x15171a), wood: P(0xffd21a, 0.1, 0.5), blued: P(0x2a2a30, 0.4, 0.4) }, (g, b) => {   // Tucano Trapalhão: bico enorme laranja e amarelo com ponta vermelha, olho branco
    const bill = mat(0xffa31a, { r: 0.45 }), bill2 = mat(0xffd21a, { r: 0.45 }), tip = mat(0xd8321f, { r: 0.5 });
    mesh(g, new T.SphereGeometry(0.11, 12, 8), bill, [b.x1 - 0.02, 0.01, 0], null, [3.2, 0.85, 0.9]); mesh(g, new T.SphereGeometry(0.09, 12, 8), bill2, [b.x1 + 0.02, -0.035, 0], null, [3, 0.55, 0.8]); sp(g, 0.04, [b.x1 + 0.28, 0.01, 0], tip, [1.2, 0.8, 0.8]);
    for (const s of [-1, 1]) { sp(g, 0.035, [b.x1 - 0.26, 0.07, s * 0.07], mat(0xffffff)); sp(g, 0.018, [b.x1 - 0.255, 0.07, s * 0.095], mat(0x111111)); } tor(g, 0.07, 0.014, [b.x1 - 0.32, 0.0, 0], mat(0x1a1a1a), 'x'); }),
  mula: themed('mula', 'dbl', { black: P(0x1a1a1a, 0.4, 0.45), steel: P(0x6a6a6a, 0.7, 0.35), wood: P(0x3a2412, 0.1, 0.7), blued: P(0x24242a, 0.4, 0.4) }, (g, b) => {   // Mula Sem Cabeça: duplo cano em chamas e ferraduras
    const f1 = mat(0xff8a1a, { e: 0xff5a00, ei: 1.8, r: 0.4 }), f2 = mat(0xffd21a, { e: 0xffb000, ei: 2, r: 0.4 }), shoe = mat(0xd4a017, { m: 0.8, r: 0.3 });
    for (let i = 0; i < 5; i++) co(g, 0.04 - (i % 3) * 0.008, 0.14 + (i % 2) * 0.07, [b.x1 + 0.05 + (i % 3) * 0.03, 0.03 * (i - 2) * 0.6, (i - 2) * 0.014], i % 2 ? f1 : f2, 'x', 6);
    for (let i = 0; i < 2; i++) { const t = tor(g, 0.045, 0.01, [b.x0 + 0.14 + i * 0.12, 0.0, 0.068], shoe, 'z'); t.rotation.z = Math.PI; } for (const x of [b.cx - 0.12, b.cx + 0.12]) tor(g, 0.065, 0.008, [x, 0, 0], f1, 'x'); }),
  // ----- Pistolas -----
  vitoria: themed('vitoria', 'pistol', { blued: P(0x2a8a4a, 0.4, 0.4), black: P(0x1f5a3a), poly: P(0xff9ccb, 0.1, 0.5), steel: P(0xf2e0ea, 0.5, 0.35) }, (g, b) => {   // Pistola Vitória-Régia: flor de lótus rosa sobre a vitória-régia verde
    const pad = mat(0x2a8a4a, { r: 0.6, s: 2 }), pet = mat(0xff9ccb, { r: 0.5 }), pet2 = mat(0xffd9ea, { r: 0.5 }); cy(g, 0.12, 0.12, 0.01, [b.cx, b.y0 + 0.01, 0.0], pad, 'y', 14);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, k = co(g, 0.03, 0.1, [b.cx + Math.cos(a) * 0.04, b.y1 + 0.05, Math.sin(a) * 0.04], i % 2 ? pet : pet2, 'y', 4); k.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); } sp(g, 0.02, [b.cx, b.y1 + 0.03, 0], mat(0xffd21a, { e: 0xffb000, ei: 0.6 })); }),
  malandro: themed('malandro', 'beretta', { blued: P(0xf0f0f0, 0.3, 0.4), black: P(0x1a1a1a), steel: P(0xd4a017, 0.7, 0.3), poly: P(0x111111, 0.1, 0.6) }, (g, b) => {   // Pistola do Malandro: terno branco, chapéu panamá e gravata vermelha
    const hat = mat(0xf4f1e6, { r: 0.6 }); cy(g, 0.055, 0.06, 0.05, [b.cx, b.y1 + 0.04, 0], hat, 'y', 14); cy(g, 0.11, 0.11, 0.008, [b.cx, b.y1 + 0.015, 0], hat, 'y', 16); tor(g, 0.058, 0.009, [b.cx, b.y1 + 0.03, 0], mat(0x111111), 'y');
    bx(g, 0.02, 0.06, 0.014, [b.x0 + 0.06, b.y0 + 0.1, 0.045], mat(0xd8321f), [0, 0, 0.1]); bx(g, 0.03, 0.02, 0.012, [b.x0 + 0.06, b.y0 + 0.14, 0.045], mat(0xd8321f)); }),
  boibumba: themed('boibumba', 'revolver', { steel: P(0x1a1a1a, 0.6, 0.35), wood: P(0xf0e6c8, 0.1, 0.55), blued: P(0x2a2a2a, 0.5, 0.4), gold: P(0xd4a017, 0.7, 0.3) }, (g, b) => {   // Revólver Boi-Bumbá: chifres de boi, manchas pretas e brancas e fitas de festa
    const horn = mat(0xf4f1e6, { r: 0.45 }), blk = mat(0x111111, { r: 0.7 }); for (const s of [-1, 1]) { const h = co(g, 0.025, 0.14, [b.x0 + 0.1, b.y1 + 0.05, s * 0.06], horn, 'y', 6); h.rotation.x = s * 0.9; h.position.z = s * 0.1; }
    spots(g, 6, b.x0 + 0.1, b.x1 - 0.2, 0.0, 0.035, blk, 0.03, 5); [0xd8321f, 0x1c4fd8, 0xffd21a].forEach((c, i) => bx(g, 0.012, 0.1, 0.01, [b.x0 + 0.05 + i * 0.03, b.y0 + 0.05, 0.04], mat(c), [0, 0, 0.15])); }),
  // ----- Pesada e precisão -----
  diabo: themed('diabo', 'hmg', { black: P(0x2a0505, 0.4, 0.45), steel: P(0x8a1010, 0.6, 0.35), blued: P(0x1a0505, 0.5, 0.35), od: P(0x4a0a0a, 0.2, 0.5), gold: P(0xffd21a, 0.6, 0.3) }, (g, b) => {   // Metralhadora do Diabo: chifres, tridente e brasas
    const horn = mat(0xd8321f, { m: 0.3, r: 0.4 }), fl = mat(0xff8a1a, { e: 0xff5a00, ei: 2, r: 0.4 }); for (const s of [-1, 1]) { const h = co(g, 0.035, 0.22, [b.cx, b.y1 + 0.1, s * 0.07], horn, 'y', 8); h.rotation.x = -s * 0.5; }
    for (let i = 0; i < 4; i++) co(g, 0.03, 0.1, [b.x1 + 0.02, 0, (i - 1.5) * 0.04], fl, 'x', 5); sp(g, 0.04, [b.cx + 0.2, b.y1 + 0.02, 0], glow(0xff3a10, 2)); }),
  dragao: themed('dragao', 'dmr', { od: P(0x1f7a3a, 0.3, 0.4), blued: P(0x0d3a1c, 0.5, 0.35), black: P(0x0a1f10), steel: P(0xffd21a, 0.7, 0.3), camo: P(0x1f7a3a, 0.3, 0.4) }, (g, b) => {   // Sniper do Dragão: escamas verdes, espinhos nas costas e cabeça de dragão
    const sc = mat(0x0d3a1c, { m: 0.4, r: 0.4 }), gold = mat(0xffd21a, { m: 0.7, r: 0.3 }); for (let i = 0; i < 9; i++) co(g, 0.02, 0.07 + (i % 3) * 0.02, [b.x0 + 0.1 + i * ((b.x1 - b.x0 - 0.2) / 8), b.y1 + 0.02, 0], gold, 'y', 4);
    bx(g, 0.2, 0.07, 0.09, [b.x1 + 0.02, 0, 0], sc); co(g, 0.045, 0.09, [b.x1 + 0.15, 0, 0], sc, 'x'); for (const s of [-1, 1]) { co(g, 0.015, 0.11, [b.x1 - 0.02, 0.07, s * 0.04], gold, 'y', 5).rotation.z = 0.5; sp(g, 0.018, [b.x1 + 0.06, 0.03, s * 0.047], glow(0xff3a10, 2)); } }),
  boto: themed('boto', 'sniper', { od: P(0xff8fc4, 0.2, 0.5), blued: P(0xe8559c, 0.4, 0.4), black: P(0x5a2a46), steel: P(0xffd0e6, 0.6, 0.3), gold: P(0xffffff, 0.4, 0.4) }, (g, b) => {   // Boto Encantado: golfinho rosa — nadadeira, focinho e chapéu do boto
    const pk = mat(0xff8fc4, { r: 0.45 }), pk2 = mat(0xe8559c, { r: 0.45 }); const fin = mesh(g, new T.ConeGeometry(0.06, 0.16, 3), pk2, [b.cx - 0.1, b.y1 + 0.02, 0]); fin.rotation.z = Math.PI / 2 + 0.3; fin.scale.set(1, 1, 0.3);
    sp(g, 0.06, [b.x1 + 0.03, 0, 0], pk, [1.6, 0.9, 0.9]); sp(g, 0.025, [b.x1 + 0.13, -0.005, 0], pk2, [1.5, 0.8, 0.8]); for (const s of [-1, 1]) sp(g, 0.014, [b.x1 + 0.01, 0.03, s * 0.05], mat(0x111111));
    const hat = mat(0xffffff, { r: 0.6 }); cy(g, 0.05, 0.055, 0.04, [b.cx - 0.1, b.y1 + 0.14, 0], hat, 'y', 12); cy(g, 0.09, 0.09, 0.008, [b.cx - 0.1, b.y1 + 0.12, 0], hat, 'y', 14); }),
  // ----- Lança-foguetes -----
  rojaosp: themed('rojaosp', 'rpg', { steel: P(0xd4a017, 0.7, 0.35), black: P(0xd8321f, 0.1, 0.6), blued: P(0x13a04a, 0.2, 0.5), od: P(0x1c4fd8, 0.1, 0.6), gold: P(0xffd21a, 0.6, 0.3) }, (g, b) => {   // Rojão de São João: tubos de papel colorido, pavio e fitas de bandeirinha
    const cols = [0x13a04a, 0xffd21a, 0x1c4fd8, 0xd8321f]; cols.forEach((c, i) => cy(g, 0.03, 0.03, b.x1 - b.x0 - 0.3, [b.cx, 0.06 * Math.sin(i * 1.57) , 0.06 * Math.cos(i * 1.57)], mat(c, { r: 0.7 }), 'x', 8));
    cy(g, 0.006, 0.006, 0.12, [b.x1 - 0.1, b.y1 + 0.04, 0], mat(0x222222), 'x'); sp(g, 0.012, [b.x1 - 0.04, b.y1 + 0.04, 0], glow(0xff7a00, 2.5)); for (let i = 0; i < 6; i++) bx(g, 0.05, 0.05, 0.006, [b.x0 + 0.1 + i * 0.1, b.y1 + 0.04 - (i % 2) * 0.01, 0], mat(cols[i % 4], { s: 2 }), [0, 0, 0.3]); }),
  arara: themed('arara', 'bazooka', { steel: P(0xd8321f, 0.3, 0.4), blued: P(0x1c4fd8, 0.3, 0.4), black: P(0xffd21a, 0.2, 0.5), od: P(0x13a04a, 0.2, 0.5), gold: P(0xffffff, 0.4, 0.4) }, (g, b) => {   // Lançador Arara: penas vermelhas, azuis e amarelas, bico curvo e olho
    const beak = mat(0xf4f1e6, { r: 0.4 }), dk = mat(0x1a1a1a, { r: 0.5 }); co(g, 0.06, 0.16, [b.x1 + 0.05, 0.03, 0], beak, 'x', 8).rotation.z = -Math.PI / 2 - 0.4; co(g, 0.05, 0.1, [b.x1 + 0.02, -0.03, 0], dk, 'x', 8).rotation.z = -Math.PI / 2 + 0.35;
    for (const s of [-1, 1]) { sp(g, 0.03, [b.x1 - 0.12, 0.07, s * 0.07], mat(0xffffff)); sp(g, 0.015, [b.x1 - 0.115, 0.07, s * 0.095], mat(0x111111)); }
    [0xd8321f, 0xffd21a, 0x1c4fd8, 0x13a04a].forEach((c, i) => { for (const s of [-1, 1]) { const f = bx(g, 0.28 - i * 0.03, 0.02, 0.05, [b.x0 - 0.02 - i * 0.04, 0.0, s * (0.06 + i * 0.02)], mat(c, { r: 0.6 }), [0, s * 0.18, 0]); } }); }),
};

// ---- versões mais fortes dos temas mais citados (peças maiores, legíveis em jogo e no ícone da loja) ----
const fin3 = (g, r, h, p, m, ry = 0) => { const k = co(g, r, h, p, m, 'y', 3); k.scale.z = 0.14; k.rotation.y = ry; return k; };
Object.assign(STORE_GUNS_BUILD, {
  piranha: themed('piranha', 'shotgun', { steel: P(0xb8c4d0, 0.75, 0.3), blued: P(0x7a8a9a, 0.6, 0.35), black: P(0x3a4a5a, 0.4, 0.45), wood: P(0xd83030, 0.1, 0.45), gold: P(0xffffff, 0.3, 0.4) }, (g, b) => {   // Piranha: cabeça de peixe de boca aberta no cano, dentes, guelras, barbatana e cauda
    const tooth = mat(0xfaf6ee, { r: 0.35 }), silver = mat(0xc4cfda, { m: 0.7, r: 0.28 }), red = mat(0xd83030, { r: 0.5 }), dk = mat(0x14202c, { r: 0.5 });
    mesh(g, new T.SphereGeometry(0.15, 14, 10), silver, [b.x1 - 0.1, 0.02, 0], null, [1.5, 0.85, 0.95]);
    bx(g, 0.36, 0.03, 0.18, [b.x1 + 0.03, 0.12, 0], silver, [0, 0, 0.1]); bx(g, 0.36, 0.03, 0.18, [b.x1 + 0.03, -0.1, 0], red, [0, 0, -0.1]);
    for (let i = 0; i < 7; i++) { const x = b.x1 + 0.17 - i * 0.05; for (const s of [-1, 1]) { co(g, 0.024, 0.09, [x, 0.07, s * 0.07], tooth, 'ny', 4); co(g, 0.024, 0.08, [x, -0.05, s * 0.07], tooth, 'y', 4); } }
    for (const s of [-1, 1]) { sp(g, 0.05, [b.x1 - 0.16, 0.09, s * 0.11], mat(0xffffff)); sp(g, 0.027, [b.x1 - 0.145, 0.09, s * 0.135], dk); for (let i = 0; i < 3; i++) bx(g, 0.012, 0.1, 0.012, [b.x1 - 0.3 - i * 0.035, 0, s * 0.145], red, [0, 0, 0.4]); }
    fin3(g, 0.12, 0.26, [b.cx, b.y1 + 0.1, 0], silver, 0); fin3(g, 0.08, 0.16, [b.cx + 0.2, b.y1 + 0.06, 0], silver, 0);
    for (let i = 0; i < 4; i++) bx(g, 0.012, 0.2, 0.07, [b.x0 - 0.05, 0, (i - 1.5) * 0.05], i % 2 ? silver : red, [0, 0, (i - 1.5) * 0.3]); }),
  boitata: themed('boitata', 'ak', { blued: P(0x6a1a08, 0.35, 0.45), steel: P(0xff6a10, 0.4, 0.35, 0xff3a00, 0.35), black: P(0x2a0d05), wood: P(0xff9a1a, 0.1, 0.4, 0xff5a00, 0.5), gold: P(0xffd21a, 0.6, 0.3) }, (g, b) => {   // Boitatá: cobra de fogo enrolada no guarda-mão, cabeça com olhos de fogo-fátuo, chamas
    const fl = mat(0xff8a1a, { e: 0xff5a00, ei: 1.8, r: 0.4 }), fl2 = mat(0xffd21a, { e: 0xffb000, ei: 2, r: 0.4 }), eye = glow(0x40ffc0, 3.5), dk = mat(0x4a1004, { r: 0.6 });
    for (let i = 0; i < 6; i++) tor(g, 0.085, 0.024, [b.cx + 0.05 + i * 0.075, 0, 0], i % 2 ? fl : fl2, 'x');
    mesh(g, new T.SphereGeometry(0.1, 12, 8), fl, [b.x1 + 0.06, 0, 0], null, [1.6, 0.85, 1]); co(g, 0.07, 0.2, [b.x1 + 0.24, 0, 0], fl2, 'x'); for (const s of [-1, 1]) { sp(g, 0.032, [b.x1 + 0.06, 0.05, s * 0.07], eye); co(g, 0.016, 0.07, [b.x1 + 0.0, 0.08, s * 0.05], dk, 'y', 4); }
    for (let i = 0; i < 5; i++) co(g, 0.045 - i * 0.006, 0.2 + (i % 2) * 0.08, [b.x0 - 0.05 - i * 0.05, 0.02 + (i - 2) * 0.03, (i - 2) * 0.02], i % 2 ? fl : fl2, 'nx', 6);
    for (let i = 0; i < 4; i++) co(g, 0.025, 0.12, [b.cx + i * 0.12, b.y1 + 0.03, 0], fl, 'y', 5); }),
  cuca: themed('cuca', 'battle', { tan: P(0x3a7a2a, 0.2, 0.55), blued: P(0x1f4a1a, 0.4, 0.4), black: P(0x14240f), wood: P(0x2d6a2a, 0.1, 0.6), steel: P(0x9a6adf, 0.6, 0.35) }, (g, b) => {   // Cuca: cabeça de jacaré no cano (dentes, olhos amarelos), chapéu de bruxa roxo e verrugas
    const tooth = mat(0xf4f1e6, { r: 0.4 }), gr = mat(0x3a7a2a, { r: 0.5 }), gr2 = mat(0x2a5a1a, { r: 0.55 }), hat = mat(0x6a2fb8, { r: 0.6 }), band = mat(0xffd21a, { r: 0.5 });
    mesh(g, new T.SphereGeometry(0.1, 12, 8), gr, [b.x1 - 0.05, 0.03, 0], null, [1.5, 0.9, 1.1]); bx(g, 0.32, 0.035, 0.15, [b.x1 + 0.06, 0.0, 0], gr, [0, 0, 0.06]); bx(g, 0.3, 0.03, 0.14, [b.x1 + 0.05, -0.07, 0], gr2, [0, 0, -0.08]);
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { co(g, 0.016, 0.06, [b.x1 + 0.2 - i * 0.045, -0.025, s * 0.062], tooth, 'ny', 4); co(g, 0.016, 0.055, [b.x1 + 0.19 - i * 0.045, -0.04, s * 0.062], tooth, 'y', 4); }
    for (const s of [-1, 1]) { sp(g, 0.034, [b.x1 - 0.1, 0.1, s * 0.07], glow(0xffe14a, 2)); sp(g, 0.015, [b.x1 - 0.095, 0.1, s * 0.092], mat(0x111111)); }
    cy(g, 0.17, 0.17, 0.014, [b.cx, b.y1 + 0.04, 0], hat, 'y', 16); co(g, 0.1, 0.3, [b.cx, b.y1 + 0.2, 0], hat, 'y', 12); tor(g, 0.1, 0.015, [b.cx, b.y1 + 0.07, 0], band, 'y'); sp(g, 0.025, [b.x1 - 0.12, 0.06, 0.04], gr2); sp(g, 0.02, [b.cx + 0.1, 0.07, 0.06], gr2); }),
  saci: themed('saci', 'bullpup', { od: P(0x7a1f1f, 0.2, 0.55), steel: P(0x4a3a2a, 0.4, 0.5), black: P(0x1a1410), gold: P(0xd4a017, 0.6, 0.3) }, (g, b) => {   // Saci Pererê: gorro vermelho com pompom, cachimbo com fumaça, redemoinho no cano
    const red = mat(0xd8321f, { r: 0.55 }), pipe = mat(0x3a2410, { r: 0.6 }), smoke = mat(0xe6e6e6, { r: 0.9, s: 2 }), wind = mat(0xdfe8f0, { r: 0.35, e: 0x88aaff, ei: 0.3 });
    co(g, 0.1, 0.3, [b.cx - 0.05, b.y1 + 0.17, 0], red, 'y', 10).rotation.z = 0.35; tor(g, 0.092, 0.024, [b.cx - 0.05, b.y1 + 0.03, 0], red, 'y'); sp(g, 0.03, [b.cx + 0.07, b.y1 + 0.33, 0], red);
    cy(g, 0.016, 0.016, 0.22, [b.x0 + 0.0, 0.01, 0.09], pipe, 'x'); cy(g, 0.05, 0.04, 0.09, [b.x0 - 0.12, 0.05, 0.09], pipe, 'y'); for (let i = 0; i < 4; i++) sp(g, 0.022 + i * 0.012, [b.x0 - 0.12 + i * 0.02, 0.13 + i * 0.07, 0.09 + (i % 2) * 0.02], smoke);
    for (let i = 0; i < 4; i++) tor(g, 0.06 + i * 0.03, 0.01, [b.x1 + 0.04 + i * 0.06, 0, 0], wind, 'x'); }),
  arara: themed('arara', 'bazooka', { steel: P(0xd8321f, 0.3, 0.4), blued: P(0x1c4fd8, 0.3, 0.4), black: P(0xffd21a, 0.2, 0.5), od: P(0x13a04a, 0.2, 0.5), gold: P(0xffffff, 0.4, 0.4) }, (g, b) => {   // Arara: cabeça de arara no cano (bico curvo, olho), asas abertas de penas coloridas e cauda longa
    const beak = mat(0xf4f1e6, { r: 0.4 }), dk = mat(0x1a1a1a, { r: 0.5 }), cols = [0xd8321f, 0xffd21a, 0x1c4fd8, 0x13a04a];
    mesh(g, new T.SphereGeometry(0.13, 12, 8), mat(0xd8321f, { r: 0.5 }), [b.x1 - 0.06, 0.02, 0], null, [1.2, 1, 1]); const up = co(g, 0.085, 0.24, [b.x1 + 0.1, -0.03, 0], beak, 'x', 8); up.rotation.z = -Math.PI / 2 - 0.5; co(g, 0.06, 0.12, [b.x1 + 0.1, -0.1, 0], dk, 'x', 8).rotation.z = -Math.PI / 2 + 0.3;
    for (const s of [-1, 1]) { sp(g, 0.05, [b.x1 - 0.1, 0.08, s * 0.1], mat(0xffffff)); sp(g, 0.026, [b.x1 - 0.085, 0.08, s * 0.125], dk); cols.forEach((c, i) => { bx(g, 0.34 - i * 0.04, 0.012, 0.075, [b.cx - 0.1 - i * 0.05, 0.03 + i * 0.01, s * (0.15 + i * 0.045)], mat(c, { r: 0.6 }), [0, s * (0.35 + i * 0.1), 0]); }); }
    cols.forEach((c, i) => bx(g, 0.34, 0.014, 0.05, [b.x0 - 0.12, (i - 1.5) * 0.04, 0], mat(c, { r: 0.6 }), [0, 0, (i - 1.5) * 0.12])); }),
  tucano: themed('tucano', 'pump', { steel: P(0xffa31a, 0.3, 0.45), black: P(0x15171a), wood: P(0xffd21a, 0.1, 0.5), blued: P(0x2a2a30, 0.4, 0.4) }, (g, b) => {   // Tucano: cabeça preta com bico gigante laranja/amarelo e ponta vermelha, olho azul e peito branco
    const bill = mat(0xffa31a, { r: 0.45 }), bill2 = mat(0xffd21a, { r: 0.45 }), tip = mat(0xd8321f, { r: 0.5 }), blk = mat(0x14161a, { r: 0.6 });
    mesh(g, new T.SphereGeometry(0.14, 12, 9), blk, [b.x1 - 0.2, 0.02, 0], null, [1.1, 1, 1]); mesh(g, new T.SphereGeometry(0.1, 12, 8), mat(0xffffff, { r: 0.7 }), [b.x1 - 0.25, -0.1, 0], null, [1, 0.8, 1]);
    mesh(g, new T.SphereGeometry(0.12, 14, 9), bill, [b.x1 + 0.02, 0.02, 0], null, [3.1, 0.9, 0.85]); mesh(g, new T.SphereGeometry(0.1, 14, 9), bill2, [b.x1 + 0.04, -0.05, 0], null, [3.0, 0.55, 0.8]); sp(g, 0.05, [b.x1 + 0.4, 0.02, 0], tip, [1.3, 0.9, 0.8]);
    for (const s of [-1, 1]) { sp(g, 0.045, [b.x1 - 0.22, 0.07, s * 0.11], mat(0x2a8ad8)); sp(g, 0.022, [b.x1 - 0.2, 0.07, s * 0.14], mat(0x111111)); } }),
});
