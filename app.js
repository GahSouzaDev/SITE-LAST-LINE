(() => {
  const URL_GAME = window.LASTLINE_GAME_URL || '#';
  document.querySelectorAll('.play-link').forEach((a) => (a.href = URL_GAME));
  const $ = (s) => document.querySelector(s);

  const MAPS = [['porto','Porto de Santos','Gigante · Pôr do sol'],['floresta','Floresta','Gigante · Pôr do sol'],['lua','Superfície Lunar','Gigante · Espaço'],['parque','Parque de Diversões','Grande · Noite'],['deserto','Deserto','Grande · Pôr do sol'],['laboratorio','Laboratório','Grande · Interno'],['patio','Pátio Industrial','Grande · Dia'],['litoral','Litoral','Médio · Pôr do sol'],['plataforma','Plataforma de Petróleo','Médio · Pôr do sol'],['montanha-de-gelo','Montanha de Gelo','Médio · Pôr do sol'],['favela','Favela','Médio · Pôr do sol'],['pedreira','Pedreira','Médio · Pôr do sol'],['sertaozinho','Sertãozinho','Médio · Pôr do sol'],['galpao','Galpão','Pequeno · Dia'],['corredor','Corredor','Mínimo · Pôr do sol']];
  const MODES = [['x1','X1','Duelo 1 contra 1. Ranqueado ou casual.'],['team','PvP em times','Time azul contra time vermelho, de 1v1 a 5v5.'],['ffa','Todos contra todos','Cada um por si. Vence quem chegar primeiro ao limite de abates.'],['arms','Corrida Armamentista','Cada abate troca a sua arma. Vence quem matar com a faca.'],['apoc','Apocalipse','Mata-mata com ondas de zumbis no meio da briga.'],['surv','Survival','Co-op contra hordas, mochila de maleta e suprimentos do céu.'],['monstro','Monstro','Humanos contra um super zumbi que pula alto e infecta.'],['off','Modo História','Campanha solo offline da UMBRA em 8 capítulos.']];
  const CHARS = ['bope','ninja','astronaut','samurai','vampiro','saci','cyber','viking','ceifador','mago','pirata','cangaceiro','capoeira','cowboy','robo','alien','demonio','anjo','curupira','gaucho','indio','f1','chef','boxeador','rock','ze','malandro','bombeiro','esquimo','mergulhador','cavaleiro','marinheiro','samu','pm','gcm','selecao','coronel','caipira','fab','futuro'];
  const NAMES = { astronaut: 'Astronauta', ze: 'Zé', f1: 'Piloto F1', pm: 'PM', gcm: 'GCM', fab: 'FAB', samu: 'SAMU', bope: 'BOPE', robo: 'Robô', demonio: 'Demônio', indio: 'Índio', gaucho: 'Gaúcho', selecao: 'Seleção', ceifador: 'Ceifador', cavaleiro: 'Cavaleiro', mergulhador: 'Mergulhador' };
  const GUNS = [['ak','Fuzil'],['ar','Fuzil'],['carbine','Carabina'],['bullpup','Bullpup'],['aa12','Escopeta'],['hmg','Metralhadora'],['dmr','DMR'],['amr','Sniper'],['hunter','Caça'],['lever','Alavanca'],['deagle','Pistola'],['beretta','Pistola'],['crossbow','Besta'],['bazooka','Lançador'],['flame','Lança-chamas'],['ion','Ion'],['katana','Katana'],['karambit','Karambit'],['chainsaw','Motosserra']];
  const LEVELS = [['recruta','Recruta',1],['soldado','Soldado',11],['cabo','Cabo',21],['sargento','Sargento',31],['sargento-mor','Sargento-mor',41],['tenente','Tenente',51],['capitao','Capitão',61],['major','Major',71],['coronel','Coronel',81],['comandante','Comandante',91]];
  const RANKS = [['ferro','Ferro'],['bronze','Bronze'],['prata','Prata'],['ouro','Ouro'],['platina','Platina'],['diamante','Diamante'],['grao-mestre','Grão-mestre'],['lenda','Lenda']];
  const MEDALS = ['headshot','megakill','killingspree','rampage','dominating','unstoppable','pentakill','ace'];

  $('#modes').innerHTML = MODES.map(([f, n, d], i) => `<article class="mode reveal" tabindex="0"><img src="img/modes/${f}.jpg" alt="${n}" loading="lazy"><span class="n">0${i + 1}</span><div><h3>${n}</h3><p>${d}</p></div></article>`).join('');
  $('#maps').innerHTML = MAPS.map(([f, n, s], i) => `<article class="map reveal ${i < 3 ? 'big' : ''}"><img src="img/maps/${f}.jpg" alt="${n}" loading="lazy"><div><b>${n}</b><small>${s}</small></div></article>`).join('');
  const chs = CHARS.map((c) => `<div class="ch"><img src="img/chars/${c}.png" alt="" loading="lazy"><b>${NAMES[c] || c}</b></div>`).join('');
  $('#marq-chars').innerHTML = chs + chs;
  $('#guns').innerHTML = GUNS.map(([f, t]) => `<div class="gun reveal"><img src="img/weapons/${f}.png" alt="" loading="lazy"><small>${t}</small></div>`).join('');
  $('#levels').innerHTML = LEVELS.map(([f, n, l]) => `<div class="rk"><img src="img/levels/${f}.png" alt=""><small>${n}</small><i>nível ${l}</i></div>`).join('');
  $('#ranks').innerHTML = RANKS.map(([f, n]) => `<div class="rk"><img src="img/ranks/${f}.png" alt=""><small>${n}</small></div>`).join('');
  $('#medals').innerHTML = MEDALS.map((m) => `<img src="img/medals/${m}.png" alt="" loading="lazy">`).join('');

  // slideshow de mapas (hero + final)
  const show = (el, list, ms) => { el.innerHTML = list.map((m, i) => `<img src="img/maps/${m}.jpg" alt="" ${i ? 'loading="lazy"' : ''}>`).join(''); const im = [...el.children]; let i = 0; im[0].classList.add('on'); setInterval(() => { im[i].classList.remove('on'); i = (i + 1) % im.length; im[i].classList.add('on'); }, ms); };
  show($('#slides'), ['floresta', 'porto', 'lua', 'parque', 'deserto', 'plataforma', 'favela'], 6500);
  show($('#slides2'), ['litoral', 'montanha-de-gelo', 'laboratorio', 'patio'], 5000);

  // contadores
  const cnt = (id, to) => { const el = $(id); let n = 0; const t = setInterval(() => { n++; el.textContent = n; if (n >= to) clearInterval(t); }, 1100 / to); };
  cnt('#c1', 15); cnt('#c2', 8); cnt('#c3', 40); cnt('#c4', 70);

  // nav + botão flutuante + reveal
  const nav = $('#nav'), fab = $('.fab');
  const onScroll = () => { nav.classList.toggle('on', scrollY > 40); fab.classList.toggle('on', scrollY > innerHeight * 0.7); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 6) * 60 + 'ms'; io.observe(el); });
})();
