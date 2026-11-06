import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildCar, CAR_TYPES, CAR_HPK } from '../vehicles/cars.js';
import { TankAv } from '../creatures/tankAv.js';
import { TANK_IDS, TANK_INFO, TANK_PTS, tankStats, TANK_CFG } from '../../../shared/tankStats.js';
// CATÁLOGO DE VEÍCULOS (jogo): carros, tanques e aviões em 3D, com os números de cada um. Usa o mesmo visual do Bestiário (classes bx-*).
// Veículos novos entram em ENTRIES (um modelo + um texto) e aparecem aqui sozinhos. O site tem o mesmo catálogo (site/js/ui/vehicleCatalog.js).
function bodyBox(o) { const bb = new THREE.Box3(), t = new THREE.Box3(); o.updateMatrixWorld(true); o.traverse((m) => { if (!m.isMesh || !m.geometry) return; for (let p = m; p; p = p.parent) if (p.visible === false) return; if (m.material?.blending === THREE.AdditiveBlending) return; if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); t.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld); bb.union(t); }); return bb; }
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CAR_DESC = {
  'Sedã': 'O carro de rua comum: confortável, estável e fácil de dirigir. Cabem 4.', 'SUV': 'Alto e largo, com bagageiro no teto. Aguenta mais batida que o sedã.', 'Esportivo': 'Baixo, com aerofólio. O mais rápido de curva, o mais frágil de batida.',
  'Picape': 'Caçamba aberta atrás e cabine curta. Bom para carregar o que achar no mapa.', 'Jipe': 'Aberto, com santo-antônio e estepe. Quem está dentro dá para ver — e para acertar.', 'Van': 'A mais alta e pesada dos carros civis. Aguenta muito, vira devagar.',
  'Buggy': 'Gaiola aberta e rodas grandes: leve, ágil e sem proteção nenhuma.', 'Militar': 'Verde-oliva, aberto, com estepe e arco de proteção. O mais resistente da frota.'
};
const PLANE = [
  { id: 'plane-lastline', name: 'Avião LASTLINE', file: '/assets/planes/lastline.glb', thumb: '/assets/vehicles/plane-lastline.png', desc: 'O cargueiro de quatro motores que leva todo mundo ao mapa no Battle Royale e abre a campanha. Salte, abra o paraquedas com ESPAÇO e escolha onde cair.', info: [['Tipo', 'Cargueiro (4 motores)'], ['Onde aparece', 'Battle Royale e Modo História'], ['Pilotável', 'Ainda não'], ['Paraquedas', 'ESPAÇO para abrir']] },
  { id: 'plane-umbra', name: 'Avião UMBRA', file: '/assets/planes/umbra.glb', thumb: '/assets/vehicles/plane-umbra.png', desc: 'O jato bimotor da UMBRA, usado em algumas missões e partidas. Mais rápido e menor que o cargueiro.', info: [['Tipo', 'Jato (2 motores)'], ['Onde aparece', 'Battle Royale e campanha'], ['Pilotável', 'Ainda não'], ['Paraquedas', 'ESPAÇO para abrir']] }
];
const ENTRIES = () => [
  ...CAR_TYPES.map((T, i) => ({ id: 'car-' + i, kind: 'car', cat: 'CARRO', name: T.n, num: i + 1, build: () => { const c = buildCar(i % 6, i); for (const b of c.userData.beams || []) b.visible = false; return c; }, desc: CAR_DESC[T.n] || '', info: [['Vida', Math.round(600 * CAR_HPK[i])], ['Lugares', 4], ['Velocidade máx.', '94 km/h'], ['Combustível', 'Galão de gasolina (+45)'], ['Entrar / sair', 'T perto do carro']], bars: [['VIDA', Math.round(CAR_HPK[i] * 10)], ['VELOC.', 10], ['PESO', Math.round(5 + CAR_HPK[i] * 3)]] })),
  ...TANK_IDS.map((id, i) => { const st = tankStats(id, TANK_CFG), p = TANK_PTS[id]; return { id: 'tank-' + id, kind: 'tank', cat: 'TANQUE', name: 'Tanque ' + TANK_INFO[id].name, num: i + 1, build: () => new TankAv(id).group, desc: TANK_INFO[id].desc, info: [['Vida', st.hp], ['Velocidade', st.speed + ' m/s'], ['Canhão', st.shell + ' de dano (área)'], ['Recarga do canhão', (st.reload / 1000).toFixed(1) + ' s'], ['Metralhadora', st.mg + ' por tiro'], ['Modo', 'Batalha de Tanques']], bars: [['VIDA', p.hp], ['VELOC.', p.spd], ['CANHÃO', p.dmg]] }; }),
  ...PLANE.map((p, i) => ({ id: p.id, kind: 'plane', cat: 'AVIÃO', name: p.name, num: i + 1, glb: p.file, thumb: p.thumb, desc: p.desc, info: p.info, bars: [['VELOC.', i ? 10 : 7], ['TAMANHO', i ? 6 : 10]] }))
];
const FILT = { all: null, car: 'car', tank: 'tank', plane: 'plane' };
function shell(list) {
  return `<div class="bx"><header class="bx-top"><button type="button" class="bx-x" data-x>← FECHAR</button><div class="bx-logo"><b>🚙 CATÁLOGO DE VEÍCULOS</b><small>Carros, tanques e aviões do jogo</small></div></header>
    <div class="bx-filter"><button type="button" class="on" data-f="all">🚙 TODOS</button><button type="button" data-f="car">🚗 CARROS</button><button type="button" data-f="tank">🪖 TANQUES</button><button type="button" data-f="plane">✈ AVIÕES</button></div>
    <div class="bx-main"><aside class="bx-list">${list.map((e) => `<button type="button" class="bx-c ${e.kind}" data-vid="${e.id}"><img alt="" src=""><span class="n">${e.cat}</span><b>${esc(e.name)}</b></button>`).join('')}</aside>
    <section class="bx-stage"><canvas></canvas><div class="bx-name"><div class="bx-no"></div><h2></h2><div class="bx-chips"></div></div>
      <div class="bx-tools"><button type="button" data-tool="zin" title="Aproximar">＋</button><button type="button" data-tool="zout" title="Afastar">－</button><button type="button" data-tool="reset" title="Voltar a câmera">⬢</button></div>
      <button type="button" class="bx-nav prev" data-step="-1" aria-label="Anterior">‹</button><button type="button" class="bx-nav next" data-step="1" aria-label="Próximo">›</button></section>
    <aside class="bx-info"><div class="bx-sec"><h3>ATRIBUTOS</h3><div class="bx-attr"></div></div><div class="bx-sec bx-sec2"><div class="bx-tab"></div></div></aside></div></div>`;
}
export function createVehicleCatalog() {
  const t = document.createElement('template'); t.innerHTML = '<div id="vehicles" class="modal hidden"><div class="bsm"></div></div>';
  const root = t.content.firstChild; document.body.append(root); const body = root.querySelector('.bsm'); let stop = null, lastId = null;
  function mount(first) {
    const E = ENTRIES(), box = body, cv = box.querySelector('canvas'); let r = null; try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch { box.querySelector('.bx-tab').textContent = 'Seu navegador não conseguiu abrir o 3D.'; }
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(34, 1.4, 0.1, 200); sc.add(new THREE.HemisphereLight(0xffffff, 0x6a7a8a, 1.25)); const dl = new THREE.DirectionalLight(0xfff0d0, 2.4); dl.position.set(-6, 10, 8); sc.add(dl);
    const gc = document.createElement('canvas'); gc.width = gc.height = 128; const g = gc.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; sc.add(shadow);
    let dim = { w: 4, h: 2 }, REF = null, cur = null, model = null, ang = 0.7, zoom = 1, drag = null, raf = 0, last = performance.now(), alive = true, filt = 'all', R = 6; const gl = new GLTFLoader(), cache = new Map();
    const size = () => { if (!r) return; const w = cv.clientWidth || 600, h = cv.clientHeight || 400; r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1)); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    const fit = (o) => { o.updateMatrixWorld(true); const bb = bodyBox(o), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3()); o.position.sub(new THREE.Vector3(c.x, bb.min.y, c.z));   /* centraliza no chão: a câmera orbita o CENTRO do modelo */ dim = { w: Math.max(s.x, s.z), h: s.y }; R = Math.max(s.x, s.z) * 1.6; const sh = Math.max(s.x, s.z) * 1.6; shadow.scale.setScalar(sh / 30 * 1.4); };
    async function show(id) {
      const e = E.find((x) => x.id === id) || E[0]; cur = e; lastId = e.id; if (model) { sc.remove(model); model = null; }
      let m = cache.get(e.id); if (!m) { if (e.glb) { try { const gl2 = await gl.loadAsync(e.glb); m = gl2.scene; } catch { m = new THREE.Group(); } } else m = e.build(); cache.set(e.id, m); }
      if (cur !== e) return; model = m; sc.add(model); model.position.set(0, 0, 0); model.rotation.set(0, 0, 0); fit(model); zoom = 1;
      box.querySelectorAll('[data-vid]').forEach((b) => b.classList.toggle('on', b.dataset.vid === e.id));
      box.querySelector('.bx-no').textContent = e.cat + ' Nº ' + String(e.num).padStart(2, '0'); box.querySelector('h2').textContent = e.name.toUpperCase(); box.querySelector('.bx-chips').innerHTML = `<span>${esc(e.cat)}</span>`;
      box.querySelector('.bx-attr').innerHTML = e.bars.map(([n, v]) => `<div class="bx-bar"><span>${n}</span><i><u style="width:${Math.min(100, v * 7)}%"></u></i><em>${v}</em></div>`).join('');
      box.querySelector('.bx-tab').innerHTML = `<p>${esc(e.desc)}</p><div class="bx-kv">${e.info.map(([k, v]) => `<div><i>▸</i><small>${esc(k).toUpperCase()}</small><b>${esc(v)}</b></div>`).join('')}</div>`;
    }
    const vis = () => E.filter((e) => !FILT[filt] || e.kind === FILT[filt]).map((e) => e.id);
    const thumbs = () => { try { const tr = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); tr.setSize(240, 100); const ts = new THREE.Scene(); ts.add(new THREE.HemisphereLight(0xffffff, 0x6a7a8a, 1.3)); const d = new THREE.DirectionalLight(0xfff0d0, 2.2); d.position.set(-6, 10, 8); ts.add(d); const tc = new THREE.PerspectiveCamera(30, 2.4, 0.1, 200);
      for (const e of E) { if (e.glb) { const im0 = box.querySelector(`[data-vid="${e.id}"] img`); if (im0 && e.thumb) im0.src = e.thumb; continue; } const m = e.build(); ts.add(m); m.updateMatrixWorld(true); const bb = bodyBox(m), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3()); m.position.sub(c); m.rotation.y = 0.6; const dist = Math.max(s.x, s.z, s.y * 2) * 1.05; tc.position.set(0, s.y * 0.3, dist); tc.lookAt(0, 0, 0); tr.render(ts, tc); const im = box.querySelector(`[data-vid="${e.id}"] img`); if (im) im.src = tr.domElement.toDataURL('image/png'); ts.remove(m); }
      tr.dispose(); } catch { /* sem miniaturas */ } };
    function frame(now) { if (!alive) return; raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!r) return; if (!drag) ang += dt * 0.5;
      const D = cur?.kind === 'plane' || !REF ? dim : REF, tv = Math.tan(cam.fov * Math.PI / 360), th = tv * cam.aspect, rr = Math.max(D.h * 1.5 / (2 * tv), D.w * 1.05 / (2 * th)) * zoom,   /* carros e tanques usam o MESMO enquadramento (o do maior deles): o tamanho relativo é o de verdade; aviões têm o seu */
       h = rr * 0.26 + dim.h * 0.2; cam.position.set(Math.sin(ang) * rr, h, Math.cos(ang) * rr); cam.lookAt(0, dim.h * 0.38, 0);   /* enquadra pelo tamanho do modelo E pela proporção da tela (largo ou estreito) */ size(); r.render(sc, cam); }
    box.addEventListener('click', (e) => { const b = e.target.closest('[data-vid]'); if (b) return show(b.dataset.vid); const f = e.target.closest('[data-f]'); if (f) { filt = f.dataset.f; box.querySelectorAll('[data-f]').forEach((x) => x.classList.toggle('on', x === f)); const v = new Set(vis()); box.querySelectorAll('[data-vid]').forEach((x) => { x.style.display = v.has(x.dataset.vid) ? '' : 'none'; }); return; }
      const s = e.target.closest('[data-step]'); if (s) { const v = vis(), i = v.indexOf(cur?.id); show(v[(i + Number(s.dataset.step) + v.length) % v.length]); return; } const tl = e.target.closest('[data-tool]')?.dataset.tool; if (tl === 'zin') zoom = Math.max(0.4, zoom * 0.85); else if (tl === 'zout') zoom = Math.min(2.2, zoom / 0.85); else if (tl === 'reset') { zoom = 1; ang = 0.7; } });
    cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX }; cv.setPointerCapture(e.pointerId); }); cv.addEventListener('pointermove', (e) => { if (drag) { ang -= (e.clientX - drag.x) * 0.01; drag.x = e.clientX; } }); cv.addEventListener('pointerup', () => { drag = null; }); cv.addEventListener('wheel', (e) => { e.preventDefault(); zoom = Math.max(0.4, Math.min(2.2, zoom * (e.deltaY > 0 ? 1.1 : 0.9))); }, { passive: false });
    { REF = { w: 1, h: 1 }; for (const e of E) { if (e.glb) continue; const bb = bodyBox(e.build()), z = bb.getSize(new THREE.Vector3()); REF.w = Math.max(REF.w, z.x, z.z); REF.h = Math.max(REF.h, z.y); } }
    size(); show(first || E[0].id); raf = requestAnimationFrame(frame); setTimeout(thumbs, 60);
    return () => { alive = false; cancelAnimationFrame(raf); try { r?.dispose(); } catch { /* ok */ } };
  }
  const close = () => { stop?.(); stop = null; body.innerHTML = ''; root.classList.add('hidden'); };
  root.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) close(); });
  addEventListener('keydown', (e) => { if (root.classList.contains('hidden')) return; if (e.key === 'Escape') { e.stopPropagation(); close(); } else if (e.key === 'ArrowRight') body.querySelector('[data-step="1"]')?.click(); else if (e.key === 'ArrowLeft') body.querySelector('[data-step="-1"]')?.click(); }, true);
  return { open(id) { stop?.(); body.innerHTML = shell(ENTRIES()); root.classList.remove('hidden'); stop = mount(id || lastId); }, close, get isOpen() { return !root.classList.contains('hidden'); } };
}
