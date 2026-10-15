/* LASTLINE — site oficial. Tudo que muda de endereço está em config.js. */
(() => {
'use strict';
const D = window.LL_DATA, GAME = window.LASTLINE_GAME_URL, API = (window.LASTLINE_API_URL || GAME).replace(/\/$/, ''), P = window.LASTLINE_PREMIERE;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// "agora" (aceita ?now=2026-10-17T12:00:00-03:00 só para você testar os banners por data)
const q = new URLSearchParams(location.search), NOW = () => (q.get('now') ? Date.parse(q.get('now')) + (Date.now() - T0) : Date.now()), T0 = Date.now();
const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'], MS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const br = (ts = NOW()) => { const d = new Date(ts - 3 * 3600e3); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, ym: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`, last: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(), day: d.getUTCDate() }; };
const PS = Date.parse(P.start), PE = Date.parse(P.end);

/* ---------- links de jogo ---------- */
$$('.play-link').forEach((a) => { a.href = GAME; });
const au = window.LASTLINE_AUTHOR; if (au) { $('#au-name').textContent = au.name; const l = $('#au-link'); l.href = au.site; l.textContent = au.siteLabel; }

/* ---------- eventos (calendário real do jogo) ---------- */
const EV = [
  ['2026-10', 'Halloween', 'Noite das Abóboras', 'Abóboras, teias e luz laranja no escuro.', 'Laboratório', 10],
  ['2026-11', 'República', 'Bandeira da República', 'Azul e dourado para o mês da República.', 'Porto de Santos', 10],
  ['2026-12', 'Natal', 'Bengala Doce', 'Conjunto de Natal com o Papai Noel, 30 moedas e 3 caixas.', 'Montanha de Gelo', 10],
  ['2027-01', 'Ano Novo', 'Fogos de Réveillon', 'Brinde o ano novo com fogos e brilho dourado.', 'Plataforma de Petróleo', 10],
  ['2027-02', 'Carnaval', 'Confete e Serpentina', 'A folia chegou ao parque de diversões.', 'Parque de Diversões', 10],
  ['2027-03', 'Dia do Circo', 'Grande Circo', 'Respeitável público: listras vermelhas e brancas.', 'Parque de Diversões', 8],
  ['2027-04', 'Páscoa', 'Ovo de Páscoa', 'Chocolate, laços e cores de Páscoa, com o Coelhinho.', 'Floresta', 10],
  ['2027-05', 'Dia das Mães', 'Jardim em Flor', 'Flores e rosa para homenagear quem manda em casa.', 'Litoral', 10],
  ['2027-06', 'Festa Junina', 'Arraiá', 'Xadrez junino, fogueira e bandeirinhas.', 'Sertãozinho', 10],
  ['2027-07', 'Férias de Julho', 'Verão no Litoral', 'Sol, mar e areia dourada.', 'Litoral', 10],
  ['2027-08', 'Folclore Brasileiro', 'Lenda da Mata', 'Curupira, Iara e Saci: o Brasil das lendas.', 'Floresta', 10],
  ['2027-09', 'Independência', 'Verde e Amarelo', 'Orgulho nas cores do Brasil.', 'Montanha de Gelo', 10]
].map(([ym, n, skin, desc, map, goal]) => ({ ym, n, skin, desc, map, goal, img: `img/banners/${ym}.jpg` }));
const SOON = ['2027-10', '2027-11', '2027-12'];
const ymLabel = (ym) => { const [y, m] = ym.split('-'); return `${MS[m - 1]}/${y.slice(2)}`; };

/* ---------- temporadas (iguais às do jogo: 1 por trimestre, T1 = out–dez/2026) ---------- */
const seasonOf = (ts = NOW()) => { const d = new Date(ts - 3 * 3600e3), n = Math.max(1, (d.getUTCFullYear() - 2026) * 4 + Math.floor(d.getUTCMonth() / 3) - 3 + 1), idx = n - 1 + 3, y = 2026 + Math.floor(idx / 4), qq = idx % 4, s = Date.UTC(y, qq * 3, 1) + 3 * 3600e3, e = Date.UTC(y, qq * 3 + 3, 1) + 3 * 3600e3; return { n, label: `${MS[qq * 3]}–${MS[qq * 3 + 2]} ${y}`, startTs: s, endTs: e, daysLeft: Math.max(0, Math.ceil((e - ts) / 864e5)), pct: Math.max(0, Math.min(1, (ts - s) / (e - s))) }; };
let SEASON = seasonOf();

/* ---------- HERO / slides ---------- */
const slideImgs = ['img/maps/ilha.jpg', 'img/maps/favela.jpg', 'img/maps/lua.jpg', 'img/maps/laboratorio.jpg', 'img/maps/cidade.jpg'];
function slides(id, list) { const box = $(id); box.innerHTML = list.map((s) => `<div style="background-image:url('${s}')"></div>`).join(''); const els = $$('div', box); let i = 0; els[0].classList.add('on'); setInterval(() => { els[i].classList.remove('on'); i = (i + 1) % els.length; els[i].classList.add('on'); }, 6500); }
slides('#slides', slideImgs); slides('#slides2', ['img/maps/cidade.jpg', 'img/maps/ilha.jpg', 'img/maps/porto.jpg']);
function countUp(el) { const to = +el.dataset.count, t0 = performance.now(); const f = (t) => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + (k === 1 && el.dataset.plus ? '+' : ''); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
$$('[data-count]').forEach(countUp);

/* ---------- CAMPANHA DO MOMENTO (por data de Brasília) ---------- */
const lightbox = (src) => { const d = document.createElement('div'); d.className = 'lb'; d.innerHTML = `<img src="${src}" alt="">`; d.onclick = () => d.remove(); document.body.append(d); };
const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return [['DIAS', Math.floor(s / 86400)], ['HORAS', Math.floor(s / 3600) % 24], ['MIN', Math.floor(s / 60) % 60], ['SEG', s % 60]].map(([l, v]) => `<div><b>${String(v).padStart(2, '0')}</b><small>${l}</small></div>`).join(''); };
function renderCamp() {
  const now = NOW(), b = br(now), ev = EV.find((e) => e.ym === b.ym), box = $('#camp'), chip = (k, v) => `<span class="chip">${k} <b>${v}</b></span>`;
  let h = '', lead = '';
  if (now >= PS && now <= PE) { // durante a estreia
    lead = 'A estreia está no ar. Crie sua conta até 18/10 às 23:45 e leve o baú da estreia.';
    h = `<div class="poster" data-lb="img/banners/estreia.jpg"><img src="img/banners/estreia.jpg" alt="A estreia começa agora"></div><div class="info"><span class="kick">// ESTREIA · NO AR</span><h3>A ESTREIA COMEÇOU!</h3><p>Contas criadas entre <b>16/10 às 18:00</b> e <b>18/10 às 23:45</b> (horário de Brasília) ganham o <b>baú da estreia</b>: o personagem <b>Operador da Estreia</b> e a skin <b>Estreia LASTLINE</b> para metralhadora, submetralhadora, sniper e pistola.</p><div class="count" data-to="${PE}">${fmt(PE - now)}</div><div class="chips">${chip('Termina em', '18/10 · 23:45')}${chip('Custo', 'grátis')}</div><a class="btn btn-xl play-link" href="${GAME}" target="_blank" rel="noopener"><span>▶ CRIAR CONTA E JOGAR</span></a></div>`;
  } else if (ev) {
    const left = b.last - b.day + 1, pre = now < PS;
    lead = pre ? 'A estreia chega em breve. Enquanto isso, o evento do mês já está valendo.' : `Evento de ${MES[b.m - 1]}: complete a missão antes do mês acabar.`;
    h = `<div class="poster" data-lb="${ev.img}"><img src="${ev.img}" alt="Evento ${esc(ev.n)}" onerror="this.closest('.camp').classList.add('wide');this.closest('.poster').remove()"></div><div class="info"><span class="kick">// EVENTO DO MÊS · ${MES[b.m - 1].toUpperCase()} ${b.y}</span><h3>${esc(ev.n)}</h3><p>${esc(ev.desc)}</p>${pre ? `<p><b>Estreia em:</b></p><div class="count" data-to="${PS}">${fmt(PS - now)}</div>` : ''}<div class="chips">${chip('Missão', `${ev.goal} partidas`)}${chip('Mapa', esc(ev.map))}${chip('Skin', esc(ev.skin))}${chip('Faltam', left + (left === 1 ? ' dia' : ' dias'))}</div><p class="mini">A recompensa é exclusiva do mês. Quem não completar a missão até o último dia perde. Os itens aparecem bloqueados para todos, no Arsenal e na seleção de personagem.</p><a class="btn play-link" href="${GAME}" target="_blank" rel="noopener">▶ JOGAR O EVENTO</a></div>`;
  } else { // depois do último evento: mostra a temporada
    lead = 'Novos eventos estão a caminho.';
    h = `<div class="poster" data-lb="img/seasons/season-${SEASON.n > 5 ? 5 : SEASON.n}.jpg"><img src="img/seasons/season-${Math.min(5, SEASON.n)}.jpg" alt=""></div><div class="info"><span class="kick">// EM BREVE</span><h3>NOVOS EVENTOS</h3><p>O calendário de eventos continua. Enquanto isso, suba no ranking da temporada.</p></div>`;
  }
  box.innerHTML = h; $('#camp-lead').textContent = lead;
  $$('[data-lb]', box).forEach((e) => { e.onclick = () => lightbox(e.dataset.lb); });
  $$('.play-link', box).forEach((a) => { a.href = GAME; });
}
renderCamp();
setInterval(() => { $$('.count[data-to]').forEach((c) => { c.innerHTML = fmt(+c.dataset.to - NOW()); }); if (NOW() > PE && NOW() - PE < 2000) renderCamp(); }, 1000);

/* ---------- temporada + calendário ---------- */
function renderSeason() {
  SEASON = seasonOf(); const s = SEASON, img = `img/seasons/season-${Math.min(5, s.n)}.jpg`;
  $('#season-box').innerHTML = `<img src="${img}" alt="Temporada ${s.n}" style="cursor:zoom-in" data-lb="${img}"><div class="sb"><h3>TEMPORADA ${s.n} · ${s.label.toUpperCase()}</h3><p>O ranqueado é dividido em <b>4 temporadas por ano</b> de 3 meses. No fim de cada uma, o ranking é reiniciado de forma suave: você volta alguns elos abaixo e precisa jogar para reconquistar. Quem terminou com pelo menos 5 partidas ganha moedas pelo elo final.</p><div class="bar"><i style="width:${Math.round(s.pct * 100)}%"></i></div><p class="mini">${s.daysLeft} dias para o fim da temporada · 2027 termina na Temporada 5</p></div>`;
}
renderSeason();
function renderCal() {
  const cur = br().ym;
  $('#cal').innerHTML = EV.map((e) => { const st = e.ym === cur ? 'now' : e.ym < cur ? 'past' : ''; return `<div class="cm ${st}" data-lb="${e.img}" title="${esc(e.n)}"><img loading="lazy" src="${e.img}" alt=""><span>${esc(e.n)}<br><small style="color:var(--mut)">${ymLabel(e.ym)}</small></span></div>`; }).join('') + SOON.map((ym) => `<div class="cm soon"><b>EM BREVE<br><small>${ymLabel(ym)}</small></b></div>`).join('');
}
renderCal();

/* ---------- modos ---------- */
const MODES = [
  ['royale', 'Battle Royale', 'ATÉ 16 JOGADORES', 'Salte do avião, escolha onde pousar, saqueie, dirija carros e fique dentro da zona. Só um sobrevive.', 1],
  ['tatico', 'Tático', 'ECONOMIA · 1 A 5 POR TIME', 'Rodadas com economia: ganhe créditos, compre armas e equipamentos a cada rodada. Cada vida conta.', 0],
  ['bomba', 'Modo Bomba', 'ATACA × DEFENDE', 'Plante a bomba no ponto A ou B, ou impeça. Disponível nos mapas táticos.', 1],
  ['x1', 'X1', 'DUELO 1 CONTRA 1', 'Você contra um adversário. Mira, reflexo e mais nada.', 0],
  ['team', 'PvP em times', '1 A 5 POR TIME', 'Times A e B disputando o placar. Combine com os amigos e domine o mapa.', 0],
  ['ffa', 'Todos contra todos', '2 A 10 JOGADORES', 'Cada um por si. Quem tiver mais abates ao fim do tempo vence.', 0],
  ['arms', 'Corrida Armamentista', 'ESCADA DE ARMAS', 'Cada abate troca sua arma pela próxima da escada. Quem matar com a faca vence.', 0],
  ['apoc', 'Apocalipse', 'MATA-MATA + ZUMBIS', 'Mata-mata (ou em times) com hordas de zumbis no meio da briga. Ninguém está seguro.', 0],
  ['surv', 'Survival', 'CO-OP · ATÉ 10', 'Cooperem contra ondas cada vez maiores de infectados. Quanto tempo vocês aguentam?', 0],
  ['monstro', 'Monstro', 'HUMANOS × SUPER ZUMBIS', 'O zumbi pula mais alto, corre mais e dá o dobro de dano. Morreu para ele? Você vira zumbi.', 0],
  ['off', 'Campanha solo', 'OFFLINE · 8 CAPÍTULOS', 'A história da UMBRA, do Brasil à Lua. Sem internet e sem pressa.', 0]
];
$('#modes').innerHTML = MODES.map(([id, n, s, d, hot]) => `<article class="mode ${hot ? 'hot' : ''}" tabindex="0"><img loading="lazy" src="img/modes/${id}.jpg" alt=""><div class="mi"><small>${s}</small><h4>${n}</h4><p>${d}</p></div></article>`).join('');
const SH = [['battle-royale', 'Battle Royale'], ['modo-bomba', 'Modo Bomba'], ['tatico', 'Tático: loja da rodada'], ['inventario', 'Arsenal e inventário'], ['elo', 'Elos e temporada'], ['menu', 'Menu principal']];
const shots = (id, list) => { $(id).innerHTML = list.map(([f, t]) => `<div class="shot" data-lb="img/shots/${f}.jpg"><img loading="lazy" src="img/shots/${f}.jpg" alt="${t}"><span>${t}</span></div>`).join(''); };
shots('#shots-modes', SH.slice(0, 3)); shots('#shots-prog', SH.slice(3));

/* ---------- mapas ---------- */
const SZ = ['Todos', 'Mínimo', 'Pequeno', 'Médio', 'Gigante'];
let szSel = 'Todos';
function renderMaps() {
  const list = D.maps.filter((m) => szSel === 'Todos' || m.s === szSel || (szSel === 'Gigante' && m.s === 'Colossal'));
  $('#maps').innerHTML = list.map((m) => `<div class="map" data-lb="img/maps/${m.i}"><img loading="lazy" src="img/maps/${m.i}" alt="${esc(m.n)}"><div class="mi"><h4>${esc(m.n)}</h4><div class="mt"><span class="sz">${esc(m.s)}</span><span>até ${m.p} jog.</span></div><p>${esc(m.d)}</p></div></div>`).join('');
}
const sizes = ['Todos', ...new Set(D.maps.map((m) => m.s))];
$('#map-filters').innerHTML = sizes.map((s) => `<button class="${s === 'Todos' ? 'on' : ''}">${s}</button>`).join('');
$('#map-filters').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; szSel = b.textContent; $$('#map-filters button').forEach((x) => x.classList.toggle('on', x === b)); renderMaps(); };
renderMaps();

/* ---------- arsenal ---------- */
const CATS = ['Todas', ...new Set(D.weapons.map((w) => w.cat))];
let catSel = 'Todas';
function renderGuns() { $('#guns').innerHTML = D.weapons.filter((w) => catSel === 'Todas' || w.cat === catSel).map((w) => `<div class="gun"><img loading="lazy" src="img/weapons/${w.id}.png" alt=""><b>${esc(w.n)}</b><small>${esc(w.sub || w.cat)}</small></div>`).join(''); }
$('#gun-filters').innerHTML = CATS.map((c) => `<button class="${c === 'Todas' ? 'on' : ''}">${c}</button>`).join('');
$('#gun-filters').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; catSel = b.textContent; $$('#gun-filters button').forEach((x) => x.classList.toggle('on', x === b)); renderGuns(); };
renderGuns();
const chr = D.chars.map((c) => `<div class="ch"><img loading="lazy" src="img/chars/${c.id}.png" alt=""><small>${esc(c.n)}</small><em class="r-${c.r}">${c.r}</em></div>`).join('');
$('#marq-chars').innerHTML = chr + chr;

/* ---------- como jogar ---------- */
const K = (k) => `<kbd>${k}</kbd>`;
const KEYS = [['Andar', 'W A S D'], ['Correr', 'Shift'], ['Pular', 'Espaço'], ['Agachar / devagar', 'X'], ['Deslizar', 'C'], ['Atirar', 'Mouse esq.'], ['Mirar', 'Mouse dir.'], ['Recarregar', 'R'], ['Corpo a corpo', 'Clique na rolagem'], ['Primária ↔ Faca', 'E'], ['Primária ↔ Secundária', 'Q'], ['Slots', '1 · 2 · 3'], ['Granada', '4'], ['Bomba especial (fumaça, luz, mina)', '5'], ['Bomba (Modo Bomba)', '6'], ['Pegar item / desarmar bomba', 'T'], ['Largar item', 'G'], ['Lanterna', 'L'], ['Usar cura (Battle Royale)', 'H'], ['Construir barricada', 'N'], ['Marcar ponto (ping)', 'Z'], ['Loja / Arsenal / Mochila', 'B'], ['Placar', 'Tab'], ['Câmera 1ª / 3ª pessoa', 'V'], ['Estou preso', 'U'], ['Jogadores online / amigos', 'O']];
const HOW = {
  'Controles': () => `<h3>Controles</h3><p>Você pode trocar qualquer tecla em <b>Configurações → Controles</b>. No celular, a tela mostra os botões de toque.</p><div class="keys">${KEYS.map(([n, k]) => `<div class="k">${k.split(' ').length > 1 && k.length < 9 ? k.split(' ').map(K).join('') : K(k)}<span>${n}</span></div>`).join('')}</div>`,
  'Chat e comandos': () => `<h3>Chat e atalhos</h3><div class="two"><div><p><b>Enter</b> abre o chat na partida: nos modos de time, a mensagem vai para o seu time; nos modos sem time, vai para todos.</p><p><b>Shift + Enter</b> (ou Alt + Enter) manda direto para <b>todos</b>.</p><p>Nos modos sem time, o prefixo <code>/all</code> fica fixo. Nos modos de time, você pode apagá-lo.</p></div><div><p><b>Comandos</b> (não aparecem no chat para ninguém):</p><div class="cmd"><code>/mute</code><span>desliga o chat</span></div><div class="cmd"><code>/unmute</code><span>liga de novo</span></div><div class="cmd"><code>/lanterna</code><span>liga a lanterna</span></div><div class="cmd"><code>/limpar</code><span>limpa o histórico</span></div><div class="cmd"><code>/ajuda</code><span>lista de comandos</span></div></div></div>`,
  'Battle Royale': () => `<h3>Battle Royale</h3><ul><li>Todos começam no <b>avião</b>. Escolha o momento do salto e abra o <b>paraquedas</b> (dá para cortá-lo perto do chão).</li><li>Saqueie <b>armas, munição, curas e equipamentos</b> pelo mapa. A munição aparece perto das armas compatíveis.</li><li>Há <b>carros</b> para atravessar o mapa depressa, mas fazem barulho.</li><li>A <b>zona</b> encolhe: ficar fora dela machuca.</li><li>Use <b>H</b> para se curar e o <b>ping (Z)</b> para avisar o esquadrão.</li></ul>`,
  'Tático e Bomba': () => `<h3>Tático e Modo Bomba</h3><ul><li>Cada rodada começa na <b>fase de compra</b>: gaste seus créditos em armas, coletes e granadas (tecla <b>B</b>).</li><li>Vencer rodadas rende mais créditos; perder, menos. Pense na economia do time.</li><li><b>Modo Bomba:</b> o ataque leva a bomba (slot <b>6</b>) e planta no ponto <b>A</b> ou <b>B</b>. A defesa evita a plantagem ou <b>desarma</b> segurando <b>T</b>.</li><li>O Tático e o Modo Bomba usam mapas próprios, pensados para cobertura e rotação.</li></ul>`,
  'Mecânicas': () => `<h3>Mecânicas do jogo</h3><ul><li><b>Deslizar e agachar:</b> o deslize dá impulso e tem recarga. Agachado você anda devagar e mira melhor.</li><li><b>Munição e recarga:</b> cada arma tem pente, reserva e tempo de recarga próprios.</li><li><b>Anexos:</b> miras, silenciadores e empunhaduras mudam o comportamento da arma.</li><li><b>Armas especiais:</b> energia, arco, besta, lança-chamas, minigun e lançadores têm regras próprias.</li><li><b>Granadas:</b> fragmentação, fumaça, luz e mina. Use os slots 4 e 5.</li><li><b>Barricadas:</b> no Survival e nos modos com zumbis, construa proteção (N).</li><li><b>Zumbis:</b> corredores, brutamontes e tanques exigem posicionamento.</li><li><b>Vitórias e derrotas</b> dão XP e moedas; as moedas compram caixas de skins.</li></ul>`,
  'Progressão': () => `<h3>Progressão</h3><ul><li><b>Nível 1 a 100:</b> a cada 10 níveis você sobe de patente, de Recruta a Comandante.</li><li><b>Prestígio:</b> ao chegar ao topo, recomece com título exclusivo.</li><li><b>Ranqueado:</b> calibre em 5 partidas e suba de elo. Cada temporada dura 3 meses.</li><li><b>Missões e eventos:</b> um evento por mês, com skins que só existem no mês.</li><li><b>Roleta e caixas:</b> prêmios com raridades Rara, Épica, Lendária e Mítica.</li><li><b>Tudo visível:</b> itens bloqueados aparecem para todos, com pré-visualização 3D, para você saber pelo que está jogando.</li></ul>`
};
const tabs = Object.keys(HOW);
$('#how-tabs').innerHTML = tabs.map((t, i) => `<button class="${i ? '' : 'on'}">${t}</button>`).join('');
const showHow = (t) => { $('#how-pane').innerHTML = HOW[t](); }; showHow(tabs[0]);
$('#how-tabs').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; $$('#how-tabs button').forEach((x) => x.classList.toggle('on', x === b)); showHow(b.textContent); };

/* ---------- progressão ---------- */
const LV = [['recruta', 'Recruta', 1], ['soldado', 'Soldado', 11], ['cabo', 'Cabo', 21], ['sargento', 'Sargento', 31], ['sargento-mor', 'Sargento-Mor', 41], ['tenente', 'Tenente', 51], ['capitao', 'Capitão', 61], ['major', 'Major', 71], ['coronel', 'Coronel', 81], ['comandante', 'Comandante', 91]];
$('#levels').innerHTML = LV.map(([i, n, l]) => `<div class="rk"><img loading="lazy" src="img/levels/${i}.png" alt="">${n}<small>nível ${l}</small></div>`).join('');
const EL = [['ferro', 'Ferro', 1000], ['bronze', 'Bronze', 1300], ['prata', 'Prata', 1600], ['ouro', 'Ouro', 1900], ['platina', 'Platina', 2200], ['diamante', 'Diamante', 2500], ['grao-mestre', 'Grão-Mestre', 2800], ['lenda', 'Lenda', 3100]];
$('#ranks').innerHTML = EL.map(([i, n, rp]) => `<div class="rk"><img loading="lazy" src="img/ranks/${i}.png" alt="">${n}<small>${rp}+ RP</small></div>`).join('');
const MD = [['kill', 'Abate'], ['headshot', 'Headshot'], ['doublekill', 'Duplo'], ['triplekill', 'Triplo'], ['quadrakill', 'Quádruplo'], ['pentakill', 'Penta'], ['killingspree', 'Sequência'], ['dominating', 'Dominando'], ['megakill', 'Mega'], ['rampage', 'Rampage'], ['unstoppable', 'Imparável'], ['ace', 'Ace']];
$('#medals').innerHTML = MD.map(([i, n]) => `<div><img loading="lazy" src="img/medals/${i}.png" alt="">${n}</div>`).join('');

/* ---------- história ---------- */
const CH = [['plataforma', 'P-07: O primeiro sinal', 'Plataforma P-UMBRA 07 · Bacia de Santos', 'A plataforma parou de responder ao rádio. Você chegou antes do helicóptero cair.'], ['montanha-de-gelo', 'Estação Gelo-Sul', 'Base de pesquisa · Antártida', 'Um sinal de socorro vindo do gelo e uma estação secreta ao lado da base brasileira.'], ['porto', 'Porto sem volta', 'Porto de Santos · contêineres da UMBRA', 'O navio atracou ontem. Segure o cais até a carga ser contida.'], ['favela', 'Morro das amostras', 'Favela · beco sem saída', 'Todo mundo sumiu de uma vez. Ache as amostras escondidas pelas vielas.'], ['deserto', 'O trem da cura', 'Deserto · linha férrea abandonada', 'Um trem parado carrega exatamente o que o mundo precisa.'], ['laboratorio', 'Núcleo do reator', 'Laboratório UMBRA · setor do reator', 'As luzes piscam, a contenção falhou e só aqui existe o registro completo.'], ['floresta', 'Folha Prateada', 'Laboratório escondido · Amazônia', 'A cura viria de uma planta que só existe na floresta.'], ['lua', 'Bandeira na Lua', 'Base brasileira · Superfície Lunar', 'Baixa gravidade, armas de energia e infectados que não são deste mundo.']];
$('#story').innerHTML = CH.map(([m, t, pl, d], i) => `<article class="ch8"><img loading="lazy" src="img/maps/${m}.jpg" alt=""><span class="n">0${i + 1}</span><div class="mi"><small>${pl}</small><h4>${t}</h4><p>${d}</p></div></article>`).join('');

/* ---------- API: status + ranking ---------- */
const j = async (p) => { const r = await fetch(API + p, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return r.json(); };
function setSrv(on, txt) { const c = $('#srv-chip'); c.className = 'srv ' + (on ? 'on' : 'off'); $('b', c).textContent = txt; }
async function loadStatus() {
  try {
    const s = await j('/api/public/status'); setSrv(true, `${s.online} ONLINE`);
    $('#stats').innerHTML = [[s.online, 'jogadores online'], [s.playersInMatch, 'em partida agora'], [s.matches, 'partidas ativas'], [s.accounts, 'contas criadas']].map(([n, l]) => `<div class="st"><b>${n}</b><small>${l}</small></div>`).join('');
    if (s.season) { SEASON = { ...SEASON, ...s.season }; renderSeason(); }
  } catch { setSrv(false, 'OFFLINE'); $('#stats').innerHTML = '<p class="mut">Servidor indisponível no momento. Tente novamente em instantes.</p>'; }
}
async function loadRank() {
  try {
    const r = await j('/api/public/ranking'), body = $('#rank-body');
    $('#rank-lead').textContent = r.top.length ? `Temporada ${r.season.n} · ${r.top.length} ${r.top.length === 1 ? 'jogador classificado' : 'jogadores no topo'}` : `Temporada ${r.season.n} · a disputa está aberta`;
    body.innerHTML = r.top.length ? r.top.map((u) => `<tr class="${u.pos <= 3 ? 'top' : ''}"><td>${u.pos}</td><td><div class="nk">${esc(u.nick)}</div></td><td><div class="el"><img src="img/ranks/${esc(u.tier)}.png" alt="">${esc(u.tierName)}${u.division ? ' ' + 'I'.repeat(u.division) : ''}</div></td><td>${u.rp}</td><td>${u.level}</td><td>${u.wins}</td></tr>`).join('') : '<tr><td colspan="6" class="mut">Ninguém classificado ainda. Jogue 5 partidas ranqueadas e entre na lista!</td></tr>';
  } catch { $('#rank-body').innerHTML = '<tr><td colspan="6" class="mut">Ranking indisponível no momento.</td></tr>'; }
}
loadStatus(); loadRank(); setInterval(loadStatus, 30000); setInterval(loadRank, 60000);

/* ---------- UI geral ---------- */
document.addEventListener('click', (e) => { const l = e.target.closest('[data-lb]'); if (l && !l.closest('.camp')) lightbox(l.dataset.lb); });
const nav = $('#nav'), fab = $('.fab');
const onScroll = () => { nav.classList.toggle('sc', scrollY > 30); fab.classList.toggle('show', scrollY > innerHeight * .7); };
addEventListener('scroll', onScroll, { passive: true }); onScroll();
$('#burger').onclick = () => { const o = $('#menu').classList.toggle('open'); $('#burger').setAttribute('aria-expanded', o); };
$('#menu').onclick = (e) => { if (e.target.tagName === 'A') $('#menu').classList.remove('open'); };
const secs = $$('main section[id], section.sec[id]'), links = $$('#menu a');
const spy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
secs.forEach((s) => spy.observe(s));
const rv = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } }), { threshold: .08 });
$$('.reveal').forEach((r) => rv.observe(r));
})();
