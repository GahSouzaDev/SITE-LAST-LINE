/* LASTLINE — site oficial. Endereços ficam em config.js · textos em content.js */
(() => {
'use strict';
const D = window.LL_DATA, GAME = window.LASTLINE_GAME_URL, API = (window.LASTLINE_API_URL || GAME).replace(/\/$/, ''), P = window.LASTLINE_PREMIERE;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const q = new URLSearchParams(location.search), T0 = Date.now();
const NOW = () => (q.get('now') ? Date.parse(q.get('now')) + (Date.now() - T0) : Date.now());   // ?now=2026-10-17T12:00:00-03:00 só para testar datas
const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const br = (ts = NOW()) => { const d = new Date(ts - 3 * 3600e3); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, ym: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`, last: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(), day: d.getUTCDate() }; };
const PS = Date.parse(P.start), PE = Date.parse(P.end);
const EVM = Object.fromEntries(EV.map((e) => [e.ym, e]));
const ymTxt = (ym) => { const [y, m] = ym.split('-'); return `${MES[m - 1]} de ${y}`; };
const img = (src, alt = '', extra = '') => `<img src="${src}" alt="${esc(alt)}" ${extra}>`;

/* ---- links do jogo, autor ---- */
$$('.play-link').forEach((a) => { a.href = GAME; });
const au = window.LASTLINE_AUTHOR; if (au) { $('#au-name').textContent = au.name; const l = $('#au-link'); l.href = au.site; l.textContent = au.siteLabel; }

/* ---- lightbox ---- */
const lightbox = (src) => { const d = document.createElement('div'); d.className = 'lb'; d.innerHTML = `<img src="${src}" alt="">`; d.onclick = () => d.remove(); document.body.append(d); };
document.addEventListener('click', (e) => { const l = e.target.closest('[data-lb]'); if (l) lightbox(l.dataset.lb); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.lb').forEach((x) => x.remove()); });

/* ---- contagem ---- */
const cnt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return [['dias', Math.floor(s / 86400)], ['horas', Math.floor(s / 3600) % 24], ['min', Math.floor(s / 60) % 60], ['seg', s % 60]].map(([l, v]) => `<div><b>${String(v).padStart(2, '0')}</b><small>${l}</small></div>`).join(''); };

/* ---- temporadas (iguais às do jogo) ---- */
const seasonOf = (ts = NOW()) => { const d = new Date(ts - 3 * 3600e3), n = Math.max(1, (d.getUTCFullYear() - 2026) * 4 + Math.floor(d.getUTCMonth() / 3) - 3 + 1), idx = n - 1 + 3, y = 2026 + Math.floor(idx / 4), qq = idx % 4, s = Date.UTC(y, qq * 3, 1) + 3 * 3600e3, e = Date.UTC(y, qq * 3 + 3, 1) + 3 * 3600e3; return { n, label: `${MS[qq * 3]}–${MS[qq * 3 + 2]} ${y}`, daysLeft: Math.max(0, Math.ceil((e - ts) / 864e5)), pct: Math.max(0, Math.min(1, (ts - s) / (e - s))) }; };

/* ============ HERO ============ */
function slides(id, list) { const box = $(id); box.innerHTML = list.map((s) => `<div style="background-image:url('${s}')"></div>`).join(''); const els = $$('div', box); let i = 0; els[0].classList.add('on'); setInterval(() => { els[i].classList.remove('on'); i = (i + 1) % els.length; els[i].classList.add('on'); }, 6000); }
slides('#slides', ['img/maps/ilha.jpg', 'img/maps/favela.jpg', 'img/maps/lua.jpg', 'img/maps/porto.jpg', 'img/maps/cidade.jpg']); slides('#slides2', ['img/maps/laboratorio.jpg', 'img/maps/montanha-de-gelo.jpg', 'img/maps/deserto.jpg']);
$$('[data-count]').forEach((el) => { const to = +el.dataset.count, t0 = performance.now(); const f = (t) => { const k = Math.min(1, (t - t0) / 1300); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + (k === 1 && el.dataset.plus ? '+' : ''); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); });

function phase() { const n = NOW(); return n < PS ? 'pre' : n <= PE ? 'live' : 'post'; }
function renderHero() { return;   // o início do site é o hero clássico (sem card)
  /*
  const n = NOW(), ph = phase(), b = br(n), ev = EVM[b.ym], c = $('#hero-card');
  if (ph !== 'post') {
    c.innerHTML = `<span class="hc-tag ${ph === 'live' ? 'live' : ''}">${ph === 'live' ? 'Estreia · no ar' : 'Lançamento'}</span>${img('img/banners/estreia.jpg', 'A estreia do LASTLINE', 'class="hc-art" data-lb="img/banners/estreia.jpg" width="1400" height="560"')}<div class="hc-body"><h3>${ph === 'live' ? 'A estreia <em>começou!</em>' : 'A estreia é <em>16/10 às 18:00</em>'}</h3><div class="count" data-to="${ph === 'live' ? PE : PS}">${cnt((ph === 'live' ? PE : PS) - n)}</div><p>${ph === 'live' ? 'Crie sua conta até 18/10 às 23:45 e leve o baú da estreia.' : 'Crie sua conta na janela da estreia e ganhe o baú com skins e personagem exclusivos.'}</p></div>`;
  } else if (ev && ART.has(ev.ym)) {
    c.innerHTML = `<span class="hc-tag">Evento do mês</span>${img(ev.img, 'Evento ' + ev.n, 'class="hc-art tall" data-lb="' + ev.img + '"')}<div class="hc-body"><h3>${esc(ev.n)}</h3><p>${esc(ev.desc)}</p></div>`;
  } else { const s = seasonOf(); c.innerHTML = `<span class="hc-tag">Temporada ${s.n}</span>${img(`img/seasons/season-${Math.min(5, s.n)}.jpg`, 'Temporada ' + s.n, 'class="hc-art" data-lb="img/seasons/season-' + Math.min(5, s.n) + '.jpg"')}<div class="hc-body"><h3>Temporada <em>${s.n}</em> no ar</h3><p>${s.daysLeft} dias para o fim. Suba no ranking.</p></div>`; }
}
*/ }
renderHero();

/* ============ ESTREIA ============ */
function renderLaunch() {
  const n = NOW(), ph = phase(), sec = $('#estreia'), link = $('#nav-estreia');
  if (ph === 'post') { sec.hidden = true; link.hidden = true; return; }
  sec.hidden = false; link.hidden = false;
  $('#est-lead').textContent = ph === 'live' ? 'Está valendo agora. Crie sua conta antes que a janela feche.' : 'Quem criar a conta de 16/10 às 18:00 até 18/10 às 23:45 leva o baú da estreia.';
  $('#est-title').innerHTML = ph === 'live' ? 'A estreia <em>está no ar</em>' : 'A estreia do <em>LASTLINE</em>';
  $('#est-count').dataset.to = ph === 'live' ? PE : PS; $('#est-count').innerHTML = cnt((ph === 'live' ? PE : PS) - n);
  $('#est-when').innerHTML = ph === 'live' ? 'Termina em <b>18/10 às 23:45</b> (horário de Brasília).' : 'Começa em <b>16/10 às 18:00</b> (horário de Brasília) e vai até <b>18/10 às 23:45</b>.';
}
renderLaunch();
setInterval(() => { $$('.count[data-to]').forEach((c) => { c.innerHTML = cnt(+c.dataset.to - NOW()); }); const p = phase(); if (p !== (renderLaunch.last || p)) { renderHero(); renderLaunch(); renderShowcase(sel); } renderLaunch.last = p; }, 1000);

/* ============ BANNERS DOS EVENTOS — vêm do JOGO (painel Admin › Eventos): o site não guarda nada, só lê ============
   Leve para o servidor: 1 requisição pequena com ETag (resposta 304 quando nada mudou), a cada 5 min só com a aba visível;
   as imagens têm ?v=carimbo (cache do navegador por tempo longo) e só são baixadas de novo quando o admin troca a arte. */
const BN = {};
const bnAbs = (u) => (/^https?:/.test(u) ? u : API + u);
const hasArt = (ym) => (BN[ym] ? !!BN[ym].show : ART.has(ym));
const artSrc = (ym, e) => (BN[ym]?.url ? bnAbs(BN[ym].url) : (e?.img || `img/banners/${ym}.jpg`));
try { for (const b of JSON.parse(localStorage.getItem('ll.bn') || '[]')) BN[b.ym] = b; } catch { /* sem cache */ }
let bnSig = JSON.stringify(BN);
async function loadBanners() {
  try {
    const r = await fetch(API + '/api/event-banners', { cache: 'no-cache' }); if (!r.ok) return; const j = await r.json(), list = j.list || [];
    const sig = JSON.stringify(list.map((b) => [b.ym, b.show, b.url])); if (sig === bnSig) return; bnSig = sig;
    for (const k of Object.keys(BN)) delete BN[k]; for (const b of list) BN[b.ym] = b;
    try { localStorage.setItem('ll.bn', JSON.stringify(list)); } catch { /* ok */ }
    if (typeof renderCal === 'function') { renderCal(); renderShowcase(sel);
loadBanners(); setInterval(() => { if (!document.hidden) loadBanners(); }, 300000); document.addEventListener('visibilitychange', () => { if (!document.hidden) loadBanners(); }); }
  } catch { /* sem rede: segue com o que tem */ }
}
/* ============ CAMPANHA: vitrine + calendário ============ */
let sel = br().ym; if (!EVM[sel]) sel = EV[EV.length - 1].ym;
function renderShowcase(ym) {
  sel = ym; const e = EVM[ym], b = br(), stt = ym === b.ym ? 'now' : ym < b.ym ? 'past' : 'next', has = hasArt(ym);
  const left = b.last - b.day + 1, tx = { now: ['st now', 'Valendo agora'], past: ['st past', 'Encerrado'], next: ['st next', 'Em breve'] }[stt];
  $('#showcase').innerHTML = `<div class="poster ${has ? '' : 'ph'}" ${has ? `data-lb="${artSrc(ym, e)}"` : ''}>${has ? img(artSrc(ym, e), 'Evento ' + e.n) : `<div><b>${esc(e.n)}</b><span>ARTE EM BREVE</span></div>`}</div><div class="sc-info"><span class="${tx[0]}">${tx[1]}</span><div class="kick">${ymTxt(ym)}</div><h3>${esc(e.n)}</h3><p>${esc(e.desc)}</p><div class="chips"><span class="chip">Missão <b>${e.goal} partidas de 5 min ou mais</b></span><span class="chip">Mapa <b>${esc(e.map)}</b></span><span class="chip">Skin <b>${esc(e.skin)}</b></span>${stt === 'now' ? `<span class="chip">Faltam <b>${left} ${left === 1 ? 'dia' : 'dias'}</b></span>` : ''}</div>${stt === 'now' ? `<div class="bar"><i style="width:${Math.round(100 * (b.day - 1) / b.last)}%"></i></div>` : ''}<p class="mini">${stt === 'past' ? 'Esse evento só existia nesse mês.' : 'A recompensa é exclusiva do mês: quem não completar a missão até o último dia perde. Os itens aparecem bloqueados para todos, no Arsenal e na seleção de personagem.'}</p><div class="cta"><a class="btn play-link" href="${GAME}" target="_blank" rel="noopener">▶ ${stt === 'now' ? 'Jogar o evento' : 'Jogar'}</a></div></div>`;
  $$('#cal .cm').forEach((x) => x.classList.toggle('sel', x.dataset.ym === ym));
}
function renderCal() {
  const b = br(), items = [...EV.map((e) => e.ym), ...SOON];
  $('#cal').innerHTML = items.map((ym) => { const e = EVM[ym]; if (!e) return `<div class="cm">${hasArt(ym) ? img(artSrc(ym, null), 'Em breve', 'loading="lazy"') : '<div class="ph"><b>Em breve</b></div>'}<span>${ymLabel(ym)}<small>a anunciar</small></span></div>`; return `<button class="cm ${ym === b.ym ? 'now' : ym < b.ym ? 'past' : ''}" data-ym="${ym}">${hasArt(ym) ? img(artSrc(ym, e), e.n, 'loading="lazy"') : `<div class="ph"><b>${esc(e.n)}</b></div>`}<span>${esc(e.n)}<small>${ymLabel(ym)}</small></span></button>`; }).join('');
  $('#cal').onclick = (ev) => { const b2 = ev.target.closest('.cm[data-ym]'); if (b2) renderShowcase(b2.dataset.ym); };
  const cur = $('#cal .cm.now'); if (cur) $('#cal').scrollLeft = Math.max(0, cur.offsetLeft - 20);
}
renderCal(); renderShowcase(sel);
$$('[data-rail]').forEach((bt) => { bt.onclick = () => { const r = $('#' + bt.dataset.rail); r.scrollBy({ left: bt.dataset.dir * r.clientWidth * .8, behavior: 'smooth' }); }; });
function renderSeason() {
  const s = seasonOf(), ban = `img/seasons/season-${Math.min(5, s.n)}.jpg`;
  $('#season-box').innerHTML = `${img(ban, 'Temporada ' + s.n, `data-lb="${ban}"`)}<div class="sb"><span class="tag" style="margin-bottom:6px">// Ranqueado</span><h3>Temporada ${s.n} · ${s.label}</h3><p>O ranqueado tem <b>4 temporadas por ano</b>, de 3 meses cada. No fim de cada uma o ranking é reiniciado de forma suave: você volta alguns elos abaixo e precisa jogar para reconquistar. Quem fechar com pelo menos 5 partidas ganha moedas pelo elo final.</p><div class="bar" style="max-width:none"><i style="width:${Math.round(s.pct * 100)}%"></i></div><p class="mini">${s.daysLeft} dias para o fim da temporada · 2027 termina na Temporada 5</p></div>`;
}
renderSeason();

/* ============ MODOS / GALERIA ============ */
$('#modes').innerHTML = MODES.map(([id, n, s, d, hot]) => `<article class="mode ${hot ? 'hot' : ''}"><div class="im">${img('img/modes/' + id + '.jpg', n, 'loading="lazy"')}</div><div class="mi"><small>${s}</small><h4>${n}</h4><p>${d}</p></div></article>`).join('');
$('#gallery').innerHTML = SH.map(([f, t]) => `<figure class="shot" data-lb="img/shots/${f}.jpg">${img('img/shots/' + f + '.jpg', t, 'loading="lazy"')}<span>${t}</span></figure>`).join('');

/* ============ MAPAS ============ */
let mapSel = D.maps.find((m) => m.id === 'ilha') || D.maps[0], szSel = 'Todos';
function showMap(m) { mapSel = m; $('#mapview').dataset.lb = 'img/maps/' + m.i; $('#mapview').innerHTML = `${img('img/maps/' + m.i, m.n)}<div class="mv"><h3>${esc(m.n)}</h3><p>${esc(m.d)}</p><div class="chips"><span class="chip">Tamanho <b>${esc(m.s)}</b></span><span class="chip">Até <b>${m.p} jogadores</b></span></div></div>`; $$('#thumbs .th').forEach((t) => t.classList.toggle('sel', t.dataset.id === m.id)); }
function renderThumbs() { const list = D.maps.filter((m) => szSel === 'Todos' || m.s === szSel); $('#thumbs').innerHTML = list.map((m) => `<button class="th" data-id="${m.id}">${img('img/maps/' + m.i, m.n, 'loading="lazy"')}<span>${esc(m.n)}</span></button>`).join(''); $('#thumbs').onclick = (e) => { const t = e.target.closest('.th'); if (t) showMap(D.maps.find((m) => m.id === t.dataset.id)); }; showMap(mapSel); }
const sizes = ['Todos', ...new Set(D.maps.map((m) => m.s))];
$('#map-filters').innerHTML = sizes.map((s) => `<button class="${s === 'Todos' ? 'on' : ''}">${s}</button>`).join('');
$('#map-filters').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; szSel = b.textContent; $$('#map-filters button').forEach((x) => x.classList.toggle('on', x === b)); renderThumbs(); };
renderThumbs();

/* ============ ARSENAL / PERSONAGENS ============ */
const CATS = [...new Set(D.weapons.map((w) => w.cat))].concat('Todas'); let catSel = CATS[0];
const renderGuns = () => { $('#guns').innerHTML = D.weapons.filter((w) => catSel === 'Todas' || w.cat === catSel).map((w) => `<div class="gun">${img('img/weapons/' + w.id + '.png', w.n, 'loading="lazy"')}<b>${esc(w.n)}</b><small>${esc(w.sub || w.cat)}</small></div>`).join(''); };
$('#gun-filters').innerHTML = CATS.map((c) => `<button class="${c === catSel ? 'on' : ''}">${c}${c === 'Todas' ? ' (' + D.weapons.length + ')' : ''}</button>`).join('');
$('#gun-filters').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; catSel = b.textContent.replace(/ \(\d+\)$/, ''); $$('#gun-filters button').forEach((x) => x.classList.toggle('on', x === b)); renderGuns(); };
renderGuns();
const RC = { Rara: '#4aa8ff', 'Épica': '#b45cff', 'Lendária': '#ffb020', 'Mítica': '#ff4a7a' };
$('#chars').innerHTML = D.chars.map((c) => `<div class="chc" style="--rc:${RC[c.r] || '#8b97a8'}">${img('img/chars/' + c.id + '.png', c.n, 'loading="lazy"')}<b>${esc(c.n)}</b><em>${c.r}</em></div>`).join('');

/* ============ COMO JOGAR / PROGRESSÃO / HISTÓRIA ============ */
const tabs = Object.keys(HOW);
$('#how-tabs').innerHTML = tabs.map((t, i) => `<button class="${i ? '' : 'on'}">${t}</button>`).join('');
const showHow = (t) => { $('#how-pane').innerHTML = HOW[t](); }; showHow(tabs[0]);
$('#how-tabs').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; $$('#how-tabs button').forEach((x) => x.classList.toggle('on', x === b)); showHow(b.textContent); };
$('#levels').innerHTML = LV.map(([i, n, l]) => `<div>${img('img/levels/' + i + '.png', n, 'loading="lazy"')}${n}<small>nível ${l}</small></div>`).join('');
$('#ranks').innerHTML = EL.map(([i, n, rp]) => `<div>${img('img/ranks/' + i + '.png', n, 'loading="lazy"')}${n}<small>${rp}+ RP</small></div>`).join('');
$('#medals').innerHTML = MD.map(([i, n]) => `<div>${img('img/medals/' + i + '.png', n, 'loading="lazy"')}${n}</div>`).join('');
$('#story').innerHTML = CH.map(([m, t, pl, d], i) => `<article class="ch8">${img('img/maps/' + m + '.jpg', t, 'loading="lazy"')}<span class="n">0${i + 1}</span><div class="mi"><small>${pl}</small><h4>${t}</h4><p>${d}</p></div></article>`).join('');

/* ============ API: status + ranking ============ */
const j = async (p) => { const r = await fetch(API + p, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return r.json(); };
function setSrv(on, txt) { const c = $('#srv-chip'); c.className = 'srv ' + (on ? 'on' : 'off'); document.querySelector('.tag-pill')?.classList.toggle('off', !on); $('b', c).textContent = txt; }
async function loadStatus() {
  try { const s = await j('/api/public/status'); setSrv(true, `${s.online} online`); $('#stats').innerHTML = [[s.online, 'jogadores online'], [s.playersInMatch, 'em partida agora'], [s.matches, 'partidas ativas'], [s.accounts, 'contas criadas']].map(([n, l]) => `<div class="stat"><b>${n}</b><small>${l}</small></div>`).join(''); }
  catch { setSrv(false, 'offline'); $('#stats').innerHTML = '<p class="mut" style="grid-column:1/-1">Servidor indisponível no momento. Tente novamente em instantes.</p>'; }
}
async function loadRank() {
  try {
    const r = await j('/api/public/ranking'), body = $('#rank-body');
    $('#rank-lead').textContent = r.top.length ? `Temporada ${r.season.n} · ${r.top.length} ${r.top.length === 1 ? 'jogador no topo' : 'jogadores no topo'}` : `Temporada ${r.season.n} · a disputa está aberta`;
    body.innerHTML = r.top.length ? r.top.map((u) => `<tr class="${u.pos <= 3 ? 'top' : ''}"><td>${u.pos}</td><td class="nk">${esc(u.nick)}</td><td><div class="el"><img src="img/ranks/${esc(u.tier)}.png" alt="">${esc(u.tierName)}${u.division ? ' ' + 'I'.repeat(u.division) : ''}</div></td><td>${u.rp}</td><td>${u.level}</td><td>${u.wins}</td></tr>`).join('') : '<tr><td colspan="6" class="mut">Ninguém classificado ainda. Jogue 5 partidas ranqueadas e entre na lista!</td></tr>';
  } catch { $('#rank-body').innerHTML = '<tr><td colspan="6" class="mut">Ranking indisponível no momento.</td></tr>'; }
}
async function loadModes() {   // MELHORES POR MODO: só aparece o modo que já tem vencedor
  const box = $('#modes-rank'); if (!box) return;
  try { const r = await j('/api/public/modes'); box.innerHTML = r.modes.length ? r.modes.map((g) => `<div class="panel mrk"><h4>${esc(g.name)}</h4>${g.rows.slice(0, 5).map((u) => `<div class="mr p${u.pos}"><i>${u.pos}</i><b>${esc(u.nick)}</b><span>${u.wins} vit. · ${u.kills} abates</span></div>`).join('')}</div>`).join('') : '<p class="mut c">Os campeões de cada modo aparecem aqui assim que as primeiras partidas terminarem.</p>'; } catch { box.innerHTML = ''; }
}
loadStatus(); loadRank(); loadModes(); setInterval(loadStatus, 30000); setInterval(loadRank, 60000); setInterval(loadModes, 90000);

/* ============ UI geral ============ */
const nav = $('#nav'), fab = $('.fab');
const onScroll = () => { nav.classList.toggle('sc', scrollY > 30); fab.classList.toggle('show', scrollY > innerHeight * .8); };
addEventListener('scroll', onScroll, { passive: true }); onScroll();
$('#burger').onclick = () => { const o = $('#menu').classList.toggle('open'); $('#burger').setAttribute('aria-expanded', o); };
$('#menu').onclick = (e) => { if (e.target.tagName === 'A') $('#menu').classList.remove('open'); };
const links = $$('#menu a'), spy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
$$('section[id]').forEach((s) => spy.observe(s));
$$('.sh,.panel,.showcase,.gallery,.modes,.story').forEach((e) => e.classList.add('reveal'));
})();
