// BESTIÁRIO: tela cheia, estilo "Pokédex" do LAST LINE (menu, fila e sala). 16 feras da Zona UMBRA em 3D, sem rolagem.
import * as THREE from 'three';
import { Creature } from '../creatures/creatureRig.js';
import { FAUNA, DINOS, MAMMALS } from '../../../shared/fauna.js';
import { BESTIARY, BESTIARY_INTRO, BESTIARY_HABITAT } from '../../../shared/bestiary.js';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const ALL = Object.values(FAUNA), NUM = Object.fromEntries(ALL.map((s, i) => [s.id, String(i + 1).padStart(2, '0')]));
const MX = (k) => Math.max(...ALL.map((s) => s[k] || 0));
const MAX = { hp: MX('hp'), run: MX('run'), hear: MX('hear'), sight: MX('sight'), dmg: MX('dmg') };
const TEMPER = { agressivo: ['AGRESSIVO', 'ag'], arisco: ['ARISCO', 'ar'], manso: ['MANSO', 'ma'] };
const RARITY = ['', 'COMUM', 'INCOMUM', 'RARA', 'ÉPICA', 'LENDÁRIA'], THREAT = ['', 'BAIXA', 'MODERADA', 'ALTA', 'MUITO ALTA', 'EXTREMA'];
const ATK = { bite: 'mordida', claw: 'garra', headbutt: 'cabeçada', gore: 'chifrada', pounce: 'bote', swat: 'tapa' };
// ---- miniaturas: cada fera é desenhada uma vez e guardada ----
const THUMBS = {}, POSES = {};
function lightRig(sc) { sc.add(new THREE.HemisphereLight(0xdfe8ff, 0x445060, 1.7)); const sun = new THREE.DirectionalLight(0xfff0d8, 2.4); sun.position.set(6, 10, 7); sc.add(sun); }
function frame(cam, cr, ang, zoom = 1) { const d = (Math.max(cr.height * 1.9, (cr.sp.bodyL + (cr.sp.tailL || 0) * 0.6) * 0.95) + cr.sp.legL * 0.5 + 3) * Math.max(1, 1.45 / (cam.aspect || 1.4)) * zoom; cam.position.set(Math.sin(ang) * d, cr.height * 0.55 + 1.2, Math.cos(ang) * d); cam.lookAt(0, cr.height * 0.45, 0); }
function thumbRig(w, h) {
  let r = null; try { r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch { return null; }
  r.setSize(w, h, false); const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(36, w / h, 0.1, 100); lightRig(sc); return { r, sc, cam, free() { r.dispose(); r.forceContextLoss?.(); } };
}
export function makeThumbs() {
  if (Object.keys(THUMBS).length === ALL.length) return;
  const t = thumbRig(220, 160); if (!t) return;
  for (const s of ALL) { const cr = new Creature(s.id); t.sc.add(cr.group); cr.update(0.016); frame(t.cam, cr, 0.75); t.r.render(t.sc, t.cam); THUMBS[s.id] = t.r.domElement.toDataURL('image/png'); t.sc.remove(cr.group); cr.dispose?.(); }
  t.free();
}
// as 5 poses da fileira ANIMAÇÕES (parado, andar, correr, atacar, rugir) desenhadas da própria fera
function makePoses(id) {
  if (POSES[id]) return POSES[id]; const t = thumbRig(180, 120); if (!t) return null; const sp = FAUNA[id], out = {};
  for (const k of ['idle', 'walk', 'run', 'attack', 'roar']) {
    const cr = new Creature(id); t.sc.add(cr.group); cr.setMotion(k === 'walk' ? sp.walk : k === 'run' ? sp.run : 0, k === 'run' ? 'flee' : 'calm');
    if (k === 'attack') { if (sp.atk.length) cr.attack(sp.atk[0]); else cr.roar(); } else if (k === 'roar') cr.roar();
    const steps = k === 'attack' ? 22 : k === 'roar' ? 28 : 90; for (let i = 0; i < steps; i++) cr.update(0.016);
    frame(t.cam, cr, 0.75); t.r.render(t.sc, t.cam); out[k] = t.r.domElement.toDataURL('image/png'); t.sc.remove(cr.group); cr.dispose?.();
  }
  t.free(); return (POSES[id] = out);
}
// ---- radar de 5 atributos ----
function radar(sp) {
  const v = [['VIDA', sp.hp ? sp.hp / MAX.hp : 1], ['VELOC.', sp.run / MAX.run], ['AUDIÇÃO', sp.hear / MAX.hear], ['VISÃO', (sp.sight || 0) / MAX.sight], ['DANO', (sp.dmg || 0) / MAX.dmg]];
  const pt = (i, k) => { const a = -Math.PI / 2 + i * (Math.PI * 2 / 5); return [Math.cos(a) * 80 * k, Math.sin(a) * 80 * k]; };
  const ring = (k) => v.map((_, i) => pt(i, k).join(',')).join(' '), poly = v.map(([, k], i) => pt(i, Math.max(0.08, k)).join(',')).join(' ');
  return `<svg class="bx-radar" viewBox="-115 -100 230 205" aria-hidden="true">${[0.33, 0.66, 1].map((k) => `<polygon points="${ring(k)}" class="g"/>`).join('')}${v.map((_, i) => `<line x1="0" y1="0" x2="${pt(i, 1)[0]}" y2="${pt(i, 1)[1]}" class="g"/>`).join('')}<polygon points="${poly}" class="p"/>${v.map(([, k], i) => { const [x, y] = pt(i, Math.max(0.08, k)); return `<circle cx="${x}" cy="${y}" r="3.2" class="d"/>`; }).join('')}${v.map(([n], i) => { const [x, y] = pt(i, 1.22); return `<text x="${x}" y="${y + 3}" text-anchor="middle">${n}</text>`; }).join('')}</svg>`;
}
const row = (ic, l, v) => `<div class="r"><i>${ic}</i><span>${l}</span><b>${v}</b></div>`;
function attrHtml(sp) {
  return `${radar(sp)}<div class="bx-rows">${row('❤', 'VIDA', sp.hp || '∞ não morre')}${row('⚡', 'CORRE', sp.run + ' m/s')}${row('💥', 'DANO', sp.dmg ? sp.dmg + ' por golpe' : '—')}${row('👂', 'OUVE A', sp.hear + ' m')}${row('👁', 'ENXERGA A', (sp.sight || 0) + ' m')}${row('🦶', 'POSTURA', sp.rig === 'biped' ? 'Bípede' : 'Quadrúpede')}${row('⚔', 'ATAQUES', sp.atk.length ? sp.atk.map((a) => ATK[a] || a).join(' · ') : 'nenhum')}</div>`;
}
function infoHtml(id, tab) {
  const sp = FAUNA[id], b = BESTIARY[id] || {}, h = BESTIARY_HABITAT[id] || {};
  if (tab === 'hist') return `<h4>NO QUE VIROU</h4><p>${esc(b.virou || '')}</p><h4>HISTÓRIA</h4><p>${esc(b.historia || '')}</p>`;
  return `<p>${esc(b.era || '')}</p><div class="bx-kv"><div><i>⛰</i><small>HABITAT</small><b>${esc(h.habitat || '')}</b></div><div><i>🍃</i><small>ALIMENTAÇÃO</small><b>${esc(h.dieta || '')}</b></div><div><i>🐾</i><small>COMPORTAMENTO</small><b>${esc(b.comportamento || '')}</b></div></div><div class="bx-thr"><i>⚠</i><small>AMEAÇA</small><u><s style="width:${(b.perigo || 1) * 20}%"></s></u><b>${THREAT[b.perigo || 1]}</b></div>`;
}
export function bestiaryHtml() {
  return `<div class="bx"><header class="bx-top"><button type="button" class="bx-x" data-x>← FECHAR</button><div class="bx-logo"><svg class="bk" viewBox="0 0 48 40" width="46" height="38" aria-hidden="true"><path d="M24 8C18 3 9 3 2 6v30c7-3 16-3 22 2 6-5 15-5 22-2V6c-7-3-16-3-22 2z" fill="#f5b400"/><path d="M24 8v30M7 11c5-1 11 0 15 3M7 19c5-1 11 0 15 3M41 11c-5-1-11 0-15 3M41 19c-5-1-11 0-15 3" stroke="#111" stroke-width="2" fill="none"/></svg><div><b>BESTIÁRIO</b><small>FAUNA DA ZONA UMBRA · <em class="bx-cnt"></em></small></div></div>
    <div class="bx-filter"><button type="button" class="on" data-f="all">🐾 TODOS</button><button type="button" data-f="dino">🦖 DINOSSAUROS</button><button type="button" data-f="mam">🦣 MAMÍFEROS</button></div></header>
    <div class="bx-main"><aside class="bx-list">${ALL.map((s) => `<button type="button" class="bx-c ${s.kind}" data-bs="${s.id}"><img alt="" src="${THUMBS[s.id] || ''}"><span class="n">${NUM[s.id]}</span><b>${esc(s.name)}</b><i>${stars((BESTIARY[s.id] || {}).perigo || 1)}</i></button>`).join('')}</aside>
    <section class="bx-stage"><canvas></canvas><div class="bx-name"><div class="bx-no"></div><h2></h2><div class="bx-chips"></div></div>
      <div class="bx-tools"><button type="button" data-tool="zin" title="Aproximar (ou use a rodinha do mouse)">＋</button><button type="button" data-tool="zout" title="Afastar (ou use a rodinha do mouse)">－</button><button type="button" data-tool="reset" title="Voltar a câmera">⬢</button><button type="button" data-tool="spin" class="on" title="Girar sozinho: ligar/desligar">⟳</button></div>
      <button type="button" class="bx-nav prev" data-step="-1" aria-label="Anterior">‹</button><button type="button" class="bx-nav next" data-step="1" aria-label="Próxima">›</button>
      <div class="bx-anim"><b>▶ ANIMAÇÕES</b><div class="bx-poses"></div></div></section>
    <aside class="bx-info"><div class="bx-sec"><h3>ATRIBUTOS</h3><div class="bx-attr"></div></div><div class="bx-sec bx-sec2"><div class="bx-tabs"><button type="button" class="on" data-t="info">INFORMAÇÕES</button><button type="button" data-t="hist">HISTÓRIA</button></div><div class="bx-tab"></div></div></aside></div></div>`;
}
// liga o 3D dentro de `box`; devolve uma função que desliga tudo (chame ao fechar a tela)
export function mountBestiary(box, first = 'trex') {
  const cv = box.querySelector('canvas'), tabEl = box.querySelector('.bx-tab'); if (!cv) return () => {};
  let r = null; try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch { tabEl.textContent = 'Seu navegador não conseguiu abrir o 3D.'; }
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(34, 1.4, 0.1, 100); lightRig(sc);
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; const g = gc.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; sc.add(shadow);
  let cr = null, id = null, run = true, spd = 0, ang = 0.6, raf = 0, last = performance.now(), drag = null, filt = 'all', tab = 'info', spin = true, zoom = 1;
  const stage = box.querySelector('.bx-stage');
  const size = () => { if (!r) return; const w = cv.clientWidth || 600, h = cv.clientHeight || 400; r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1)); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  const visible = () => ALL.filter((s) => filt === 'all' || (filt === 'dino' ? s.kind === 'dino' : s.kind !== 'dino')).map((s) => s.id);
  const paintTab = () => { tabEl.innerHTML = infoHtml(id, tab); box.querySelectorAll('[data-t]').forEach((x) => x.classList.toggle('on', x.dataset.t === tab)); };
  const LB = { idle: 'PARADO', walk: 'ANDAR', run: 'CORRER', attack: 'ATACAR', roar: 'RUGIR' };
  function paintPoses() { const p = makePoses(id) || {}; box.querySelector('.bx-poses').innerHTML = Object.entries(LB).map(([k, n]) => `<button type="button" data-ac="${k}"><img alt="" src="${p[k] || ''}"><span>${n}</span></button>`).join(''); setAct('idle'); }
  function setAct(k) { box.querySelectorAll('[data-ac]').forEach((x) => x.classList.toggle('on', x.dataset.ac === k)); }
  function show(k) {
    if (cr) { sc.remove(cr.group); cr.dispose?.(); } id = k; cr = new Creature(k); sc.add(cr.group); spd = 0; const sp = FAUNA[k], b = BESTIARY[k] || {}, t = TEMPER[sp.temper] || ['', ''];
    box.querySelector('.bx-no').textContent = 'Nº ' + NUM[k]; box.querySelector('.bx-name h2').textContent = sp.name;
    box.querySelector('.bx-chips').innerHTML = `<span class="ch rar r${b.perigo || 1}">ESPÉCIE ${RARITY[b.perigo || 1]}</span><span class="ch st">${stars(b.perigo || 1)}</span><span class="ch ${t[1]}">${t[0]}</span><span class="ch ${sp.kind}">${sp.kind === 'dino' ? 'DINOSSAURO' : 'MAMÍFERO'}</span>`;
    box.querySelector('.bx-attr').innerHTML = attrHtml(sp);
    box.querySelectorAll('.bx-c').forEach((x) => x.classList.toggle('on', x.dataset.bs === k)); paintTab(); paintPoses();
  }
  function applyFilter() {
    const ok = new Set(visible()), list = box.querySelector('.bx-list'); box.querySelectorAll('.bx-c').forEach((x) => x.classList.toggle('hidden', !ok.has(x.dataset.bs)));
    list.style.setProperty('--rows', Math.ceil(ok.size / 2)); box.querySelectorAll('[data-f]').forEach((x) => x.classList.toggle('on', x.dataset.f === filt)); box.querySelector('.bx-cnt').textContent = ok.size + ' ESPÉCIES DESCOBERTAS'; if (!ok.has(id)) show([...ok][0]);
  }
  const onClick = (e) => {
    const f = e.target.closest('[data-f]'); if (f) { filt = f.dataset.f; return applyFilter(); }
    const tb = e.target.closest('[data-t]'); if (tb) { tab = tb.dataset.t; return paintTab(); }
    const st = e.target.closest('[data-step]'); if (st) { const v = visible(), i = v.indexOf(id); return show(v[(i + Number(st.dataset.step) + v.length) % v.length]); }
    const tl = e.target.closest('[data-tool]'); if (tl) {
      const k = tl.dataset.tool;
      if (k === 'reset') { ang = 0.6; zoom = 1; } else if (k === 'zin') zoom = Math.max(0.35, zoom * 0.8); else if (k === 'zout') zoom = Math.min(2.5, zoom * 1.25); else if (k === 'spin') { spin = !spin; tl.classList.toggle('on', spin); }
      return;
    }
    const b = e.target.closest('[data-bs]'); if (b) return show(b.dataset.bs);
    const a = e.target.closest('[data-ac]'); if (!a || !cr) return; const k = a.dataset.ac; setAct(k);
    if (k === 'idle') spd = 0; else if (k === 'walk') spd = cr.sp.walk; else if (k === 'run') spd = cr.sp.run; else if (k === 'attack') { spd = 0; if (cr.sp.atk.length) cr.attack(cr.sp.atk[Math.floor(Math.random() * cr.sp.atk.length)]); else cr.roar(); } else if (k === 'roar') { spd = 0; cr.roar(); }
  };
  box.addEventListener('click', onClick);
  // arrastar para a direita gira a fera para a direita (a câmera anda no sentido contrário)
  const down = (e) => { drag = { x: e.clientX, a: ang }; }, move = (e) => { if (drag) ang = drag.a - (e.clientX - drag.x) * 0.012; }, up = () => { drag = null; };
  const wheel = (e) => { e.preventDefault(); zoom = Math.max(0.35, Math.min(2.5, zoom * (e.deltaY < 0 ? 0.9 : 1.1))); }; cv.addEventListener('wheel', wheel, { passive: false }); cv.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up);
  function loop(now) {
    // a tela pode abrir antes do layout fechar: o tamanho é conferido a cada quadro (primeira linha abaixo)
    if (!run) return; raf = requestAnimationFrame(loop); if (!cv.isConnected) return stop(); if (r && cv.clientWidth && Math.abs(cv.width / Math.min(1.5, devicePixelRatio || 1) - cv.clientWidth) > 6) size(); const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (cr && r) { if (!drag && spin) ang -= dt * 0.25; cr.setMotion(spd, spd > cr.sp.walk * 1.2 ? 'flee' : 'calm'); cr.update(dt); frame(cam, cr, ang, zoom); r.render(sc, cam); }
  }
  function stop() { run = false; cancelAnimationFrame(raf); box.removeEventListener('click', onClick); cv.removeEventListener('wheel', wheel); cv.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up); if (r) { r.dispose(); r.forceContextLoss?.(); r = null; } }
  size(); show(FAUNA[first] ? first : 'trex'); applyFilter(); raf = requestAnimationFrame(loop); return stop;
}
// janela do Bestiário: abre pelo menu, pela fila e pela sala (já não fica dentro do SOBRE)
export function createBestiaryUI() {
  const t = document.createElement('template'); t.innerHTML = '<div id="bestiary" class="modal hidden"><div class="bsm"></div></div>';
  const root = t.content.firstChild; document.body.append(root); const body = root.querySelector('.bsm'); let stop = null, lastId = 'trex';
  const close = () => { stop?.(); stop = null; body.innerHTML = ''; root.classList.add('hidden'); };
  root.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) close(); else { const b = e.target.closest('[data-bs]'); if (b) lastId = b.dataset.bs; } });
  addEventListener('keydown', (e) => {
    if (root.classList.contains('hidden')) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); } else if (e.key === 'ArrowRight') body.querySelector('[data-step="1"]')?.click(); else if (e.key === 'ArrowLeft') body.querySelector('[data-step="-1"]')?.click();
  }, true);
  return { open(id) { stop?.(); makeThumbs(); body.innerHTML = bestiaryHtml(); root.classList.remove('hidden'); stop = mountBestiary(body, id || lastId); }, close, get isOpen() { return !root.classList.contains('hidden'); } };
}
