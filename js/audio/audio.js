import { settings, onSettings } from '../core/settings.js';

// Áudio do jogo (Web Audio): música do menu, sons sintetizados (reserva) e sons POSICIONAIS 3D.
// Sons padrão de evento: se existir /assets/sounds/events/<nome>.mp4 ele é usado; senão sintetiza.
class AudioEngine {
  constructor() { this.ctx = null; this.buffers = new Map(); this.filesExt = []; this.files = new Set(); this.music = null; this.inGame = false; }
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC(); this.ctx.onstatechange = () => this.wake();
    this.master = this.ctx.createGain(); this.sfx = this.ctx.createGain(); this.voice = this.ctx.createGain(); this.uiGain = this.ctx.createGain();
    this.sfx.connect(this.master); this.voice.connect(this.master); this.uiGain.connect(this.master);
    const comp = this.ctx.createDynamicsCompressor(); this.master.connect(comp); comp.connect(this.ctx.destination);
    this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate * 1.5, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.applyVolumes();
    this.loadHs();
    fetch('/api/sounds').then((r) => r.json()).then((j) => { for (const f of j.files || []) this.files.add(f.replace(/\.(mp4|mp3|ogg|wav|m4a|webm)$/i, '')); this.filesExt = j.files || []; }).catch(() => {});
  }
  // SOM QUE SOME: o navegador suspende o áudio (aba em segundo plano, troca de fone/saída, economia de energia, 'interrupted' no Safari) e antes ele nunca voltava. Agora qualquer clique/tecla/foco, a volta à aba e uma checagem a cada 2 s religam sozinhos; um contexto fechado é recriado.
  wake() {
    const c = this.ctx; if (!c) return;
    if (c.state === 'closed') { this.ctx = null; this.hsBuf = null; this._hsLoading = false; try { this.init(); this.refreshMusic?.(); } catch { /* sem áudio */ } return; }
    if (c.state !== 'running') { try { c.resume().catch(() => {}); } catch { /* ok */ } }
  }
  // SOM DE HEADSHOT RECEBIDO (/sfx/levando-hs.mp3): decodificado e guardado na memória assim que o áudio liga, então sai NA HORA do tiro.
  // Só a vítima recebe a mensagem 'dmg' com head; cada headshot toca o arquivo uma vez (se um novo chegar durante o som, reinicia — nunca empilha).
  loadHs() {
    if (!this.ctx || this.hsBuf || this._hsLoading) return; this._hsLoading = true;
    fetch('/sfx/levando-hs.mp3').then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then((ab) => this.ctx.decodeAudioData(ab)).then((b) => { this.hsBuf = b; this._hsLoading = false; })
      .catch(() => { this._hsLoading = false; setTimeout(() => this.loadHs(), 3000); });
  }
  playHs() {
    if (!this.ctx) { this.init(); if (!this.ctx) return; }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (!this.hsBuf) { this.ui('headpop'); this.loadHs(); return; }              // por segurança: se o arquivo ainda não carregou, toca o estalo sintetizado
    try { this._hsSrc?.stop(); } catch { /* já terminou */ }
    const s = this.ctx.createBufferSource(), g = this.ctx.createGain(); s.buffer = this.hsBuf; g.gain.value = 1; s.connect(g); g.connect(this.uiGain); s.start(); this._hsSrc = s;
  }
  setLoadMute(on) { this.loadMute = !!on; if (this.ctx) this.applyVolumes(); }   // tela de carregamento: o jogo fica MUDO até a partida de fato começar
  applyVolumes() {
    if (!this.ctx) return;
    this.master.gain.value = this.loadMute ? 0 : settings.volMaster; this.sfx.gain.value = settings.volSfx; this.voice.gain.value = settings.volVoice; this.uiGain.gain.value = settings.volSfx;
    if (this.music) this.music.volume = this._horror ? 0 : this.musicShouldPlay() ? Math.min(1, settings.volMusic * settings.volMaster * 0.55) : 0;
    if (this.horror && this._horror) this.horror.volume = Math.min(1, 0.33 * settings.volMaster);
  }
  /* MÚSICA DE TERROR da Caçada (Deep Pressure): carregada ANTES, quando a partida abre (não na hora de tocar, para não travar o jogo); toca a 33% quando anoitece e some quando o dia volta */
  horrorPreload() { if (this.horror) return; try { const a = new Audio('/assets/sounds/deep-pressure.mp3'); a.preload = 'auto'; a.loop = true; a.volume = 0; a.load(); this.horror = a; } catch { /* sem áudio */ } }
  horrorStart() {
    this.horrorPreload(); const a = this.horror; if (!a) return; clearInterval(this._hFade); this._horror = true; try { a.currentTime = 0; } catch { /* ainda carregando */ }
    a.volume = Math.min(1, 0.33 * settings.volMaster); a.play().catch(() => {}); if (this.music) this.music.volume = 0;   /* a música normal abaixa enquanto o terror toca */
  }
  horrorStop(ms = 2500) {
    const a = this.horror; if (!a || !this._horror) return; this._horror = false; clearInterval(this._hFade); const v0 = a.volume, t0 = performance.now();
    if (ms <= 0) { a.pause(); this.applyVolumes(); return; }
    this._hFade = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); a.volume = v0 * (1 - k); if (k >= 1) { clearInterval(this._hFade); a.pause(); this.applyVolumes(); } }, 60);
  }
  musicShouldPlay() { return settings.musicOn && (!this.inGame || settings.musicInGame); }
  startMusic() {
    if (!this.music) { this.music = new Audio('/assets/sounds/music.mp3'); this.music.loop = true; }
    this.applyVolumes();
    if (this.musicShouldPlay()) this.music.play().catch(() => {});
  }
  refreshMusic() { if (!this.music) return this.startMusic(); this.applyVolumes(); if (this.musicShouldPlay()) this.music.play().catch(() => {}); else this.music.pause(); }
  // clique de interface com som de tiro: só FORA da partida, volume proporcional ao da música (nunca alto)
  uiShot() {
    if (!settings.uiClick || this.inGame) return; this.init(); if (!this.ctx) return;
    const now = performance.now(); if (now - (this._uc || 0) < 90) return; this._uc = now;
    if (!this.clickG) { this.clickG = this.ctx.createGain(); this.clickG.connect(this.master); }
    this.clickG.gain.value = Math.min(0.5, settings.volMusic * 0.45 * (settings.musicOn ? 1 : 0.6));
    const w = settings.uiClickWeapon || 'rifle'; this.shot(w, null, { dest: this.clickG, noiseScale: 0.6 });
  }
  setInGame(v) { this.inGame = v; if (!v) this.horrorStop(0); this.refreshMusic(); }

  listener(cam) {
    if (!this.ctx) return;
    const l = this.ctx.listener, p = cam.position;
    const V = cam.position.constructor, f = (this._f || (this._f = new V())).set(0, 0, -1).applyQuaternion(cam.quaternion), u = (this._u || (this._u = new V())).set(0, 1, 0).applyQuaternion(cam.quaternion);
    if (l.positionX) { const t = this.ctx.currentTime; l.positionX.setValueAtTime(p.x, t); l.positionY.setValueAtTime(p.y, t); l.positionZ.setValueAtTime(p.z, t); l.forwardX.setValueAtTime(f.x, t); l.forwardY.setValueAtTime(f.y, t); l.forwardZ.setValueAtTime(f.z, t); l.upX.setValueAtTime(u.x, t); l.upY.setValueAtTime(u.y, t); l.upZ.setValueAtTime(u.z, t); }
    else { l.setPosition(p.x, p.y, p.z); l.setOrientation(f.x, f.y, f.z, u.x, u.y, u.z); }
  }
  // nó de saída: posicional (HRTF, volume cai com a distância) ou direto (UI)
  out(pos, dest = this.sfx, ref = 2, roll = 1.2) {
    if (!pos) return dest;
    const pn = this.ctx.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = ref; pn.rolloffFactor = roll; pn.maxDistance = 400;
    if (pn.positionX) { pn.positionX.value = pos.x; pn.positionY.value = pos.y; pn.positionZ.value = pos.z; } else pn.setPosition(pos.x, pos.y, pos.z);
    pn.connect(dest); return pn;
  }
  nz(dest, t, { dur = 0.2, f = 2000, q = 0.7, type = 'lowpass', g = 0.5, f2 = null, att = 0.002, wet = 0 }) {
    const s = this.ctx.createBufferSource(); s.buffer = this.noise; const fl = this.ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q;
    const gn = this.ctx.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(g, t + att); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(gn); gn.connect(dest); if (wet > 0) { const w = this.ctx.createGain(); w.gain.value = wet; gn.connect(w); w.connect(this.verb()); } s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  // som de JATO: lança-chamas ruge, extintor chia (cada disparo emenda no seguinte)
  stream(kind, pos) {
    // jato CONTÍNUO: cada disparo é uma "lufada" longa e suave de ruído filtrado que se emenda na seguinte (sem estalos de metralhadora)
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos || null, this.sfx, 6, 1.0);
    if (kind === 'extinguisher') { this.nz(d, t, { dur: 0.34, f: 5200, q: 0.4, type: 'highpass', g: 0.16, att: 0.08 }); this.nz(d, t, { dur: 0.3, f: 2600, q: 0.5, type: 'bandpass', g: 0.1, att: 0.08 }); }
    else if (kind === 'torch') { this.nz(d, t, { dur: 0.34, f: 3200, f2: 2400, q: 0.5, type: 'bandpass', g: 0.16, att: 0.08 }); this.nz(d, t, { dur: 0.3, f: 500, q: 0.4, type: 'lowpass', g: 0.14, att: 0.08 }); }
    else { this.nz(d, t, { dur: 0.36, f: 700, f2: 480, q: 0.4, type: 'lowpass', g: 0.3, att: 0.09 }); this.nz(d, t, { dur: 0.3, f: 1800, q: 0.5, type: 'bandpass', g: 0.1, att: 0.09 }); }
  }
  // ===== ARMAS DE ENERGIA / ESPECIAIS =====
  // zumbido CONTÍNUO enquanto o gatilho está apertado (feixe ION, raio TESLA, giro da minigun). Cada chamada renova ~0,16 s; sem chamadas, o som some.
  hold(kind, pos, k = 1) {
    if (!this.ctx) return; const ctx = this.ctx, t = ctx.currentTime; this._hold ||= {}; let h = this._hold[kind];
    if (!h) {
      const g = ctx.createGain(); g.gain.value = 0.0001; const dest = this.out(pos || null, this.sfx, 6, 1.0); g.connect(dest); const nodes = [];
      const osc = (type, f, gain) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = f; og.gain.value = gain; o.connect(og); og.connect(g); o.start(); nodes.push(o); return o; };
      const noise = (ft, f, q, gain) => { const s = ctx.createBufferSource(); s.buffer = this.noise; s.loop = true; const fl = ctx.createBiquadFilter(); fl.type = ft; fl.frequency.value = f; fl.Q.value = q; const ng = ctx.createGain(); ng.gain.value = gain; s.connect(fl); fl.connect(ng); ng.connect(g); s.start(); nodes.push(s); return fl; };
      const lfo = (target, f, depth) => { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = f; lg.gain.value = depth; l.connect(lg); lg.connect(target); l.start(); nodes.push(l); };
      if (kind === 'tesla') { noise('bandpass', 2400, 1.2, 0.5); noise('highpass', 5000, 0.5, 0.25); const o = osc('sawtooth', 55, 0.25); lfo(o.frequency, 31, 40); lfo(g.gain, 47, 0.06); }
      else if (kind === 'spin') { const o = osc('sawtooth', 70, 0.22); osc('triangle', 140, 0.15); noise('bandpass', 900, 0.8, 0.12); h = { g, nodes, o, peak: 0.28 }; this._hold[kind] = h; }
      else { const o = osc('sawtooth', 150, 0.2); osc('sine', 300, 0.22); osc('square', 75, 0.08); noise('bandpass', 3200, 1.5, 0.08); lfo(o.frequency, 9, 6); }
      h = this._hold[kind] || { g, nodes, peak: kind === 'tesla' ? 0.3 : 0.26 }; this._hold[kind] = h; h.peak = kind === 'tesla' ? 0.3 : kind === 'spin' ? 0.28 : 0.26;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(h.peak, t + 0.05);
    }
    if (h.o && kind === 'spin') h.o.frequency.setTargetAtTime(60 + 120 * k, t, 0.05);
    h.until = t + 0.17; clearTimeout(h.to); h.to = setTimeout(() => this._holdEnd(kind), 190);
  }
  _holdEnd(kind) {
    const h = this._hold?.[kind]; if (!h || !this.ctx) return; const t = this.ctx.currentTime;
    if (t < h.until - 0.001) { h.to = setTimeout(() => this._holdEnd(kind), 60); return; }
    h.g.gain.cancelScheduledValues(t); h.g.gain.setTargetAtTime(0.0001, t, 0.05); const nodes = h.nodes; delete this._hold[kind]; setTimeout(() => { for (const n of nodes) { try { n.stop(); } catch { /* já parou */ } } try { h.g.disconnect(); } catch { /* ok */ } }, 400);
  }
  // CARREGANDO: zumbido que sobe de tom até o tiro
  chargeStart() {
    if (!this.ctx || this._ch) return; const ctx = this.ctx, t = ctx.currentTime, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth'; o2.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(1100, t + 1.1); o2.frequency.setValueAtTime(240, t); o2.frequency.exponentialRampToValueAtTime(2400, t + 1.1);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16, t + 1.0); o.connect(g); o2.connect(g); g.connect(this.sfx); o.start(t); o2.start(t); this._ch = { o, o2, g };
  }
  chargeStop() {
    const c = this._ch; if (!c || !this.ctx) return; this._ch = null; const t = this.ctx.currentTime; c.g.gain.cancelScheduledValues(t); c.g.gain.setTargetAtTime(0.0001, t, 0.03); try { c.o.stop(t + 0.15); c.o2.stop(t + 0.15); } catch { /* ok */ }
  }
  // disparo carregado: estalo grave + descarga
  chargeShot(pos, frac = 1) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos || null, this.sfx, 6, 0.9);
    this.tn(d, t, { f: 900, f2: 70, dur: 0.35, type: 'sawtooth', g: 0.35 }); this.tn(d, t, { f: 120, f2: 40, dur: 0.4, g: 0.7 * (0.5 + 0.5 * frac) }); this.nz(d, t, { dur: 0.25, f: 6000, f2: 800, type: 'bandpass', q: 0.8, g: 0.45 });
  }
  overheat() { if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(null, this.sfx, 2, 1.0); this.nz(d, t, { dur: 0.8, f: 6000, type: 'highpass', g: 0.3, att: 0.03 }); this.tn(d, t, { f: 900, f2: 200, dur: 0.4, type: 'square', g: 0.12 }); }
  // LANÇAMENTO de foguete: estouro surdo + "fuuush" do motor
  rocket(pos) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos || null, this.sfx, 6, 0.9);
    this.tn(d, t, { f: 110, f2: 38, dur: 0.35, g: 0.9 }); this.nz(d, t, { dur: 0.08, f: 3000, type: 'highpass', g: 0.35 });
    this.nz(d, t + 0.02, { dur: 1.1, f: 500, f2: 2600, q: 0.7, type: 'bandpass', g: 0.5, att: 0.12 }); this.nz(d, t + 0.05, { dur: 1.3, f: 900, f2: 200, q: 0.4, g: 0.35, att: 0.1 });
  }
  tn(dest, t, { f = 440, f2 = null, dur = 0.2, type = 'sine', g = 0.3, wet = 0 }) {
    const o = this.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const gn = this.ctx.createGain(); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(gn); gn.connect(dest); if (wet > 0) { const w = this.ctx.createGain(); w.gain.value = wet; gn.connect(w); w.connect(this.verb()); } o.start(t); o.stop(t + dur + 0.02);
  }

  // ----- sons de jogo (sintetizados) -----
  // REVERB de ambiente (uma só para todo o jogo): cauda curta de eco, gerada uma vez; dá "corpo" e distância aos tiros e explosões
  verb() {
    if (this._verb) return this._verb; const c = this.ctx, len = Math.floor(c.sampleRate * 1.1), ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) { const x = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - x, 3.2) * (x < 0.012 ? x / 0.012 : 1); } }
    const cv = c.createConvolver(); cv.buffer = ir; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3800; const g = c.createGain(); g.gain.value = 0.55; cv.connect(lp); lp.connect(g); g.connect(this.sfx); return (this._verb = cv);
  }
  // TIRO em camadas: estalo (supersônico) + corpo + pancada grave + som mecânico + cauda de eco. Cada classe tem a sua "assinatura".
  shot(cls, pos, { supp = false, big = false, energy = false, noiseScale = 1, dest = null } = {}) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, dest || this.sfx, supp ? 1.2 : 4, 1.0);
    const R = (a, b) => a + Math.random() * (b - a), j = R(0.94, 1.06);   // pequena variação: dois tiros nunca soam iguais
    if (energy) { this.tn(d, t, { f: 1500 * j, f2: 160, dur: 0.24, type: 'sawtooth', g: 0.2 }); this.tn(d, t, { f: 760 * j, f2: 80, dur: 0.32, type: 'sine', g: 0.34, wet: 0.3 }); this.tn(d, t + 0.01, { f: 3200, f2: 900, dur: 0.12, type: 'triangle', g: 0.1 }); this.nz(d, t, { dur: 0.12, f: 5500, type: 'highpass', g: 0.12 }); this.nz(d, t + 0.02, { dur: 0.5, f: 2400, f2: 300, g: 0.12, wet: 0.5 }); return; }
    const C = { pistol: { cr: 5200, bd: 2600, bl: 0.14, th: 190, tl: 0.1, tail: 0.3, gain: 0.85 }, dual: { cr: 5000, bd: 2500, bl: 0.15, th: 180, tl: 0.1, tail: 0.32, gain: 0.9 }, smg: { cr: 5600, bd: 3000, bl: 0.12, th: 160, tl: 0.09, tail: 0.28, gain: 0.8 },
      rifle: { cr: 4800, bd: 2800, bl: 0.2, th: 130, tl: 0.15, tail: 0.5, gain: 1 }, lmg: { cr: 4200, bd: 2300, bl: 0.24, th: 105, tl: 0.2, tail: 0.6, gain: 1.1 }, shotgun: { cr: 3600, bd: 2000, bl: 0.3, th: 80, tl: 0.28, tail: 0.75, gain: 1.15 },
      sniper: { cr: 6200, bd: 2600, bl: 0.3, th: 90, tl: 0.3, tail: 1.1, gain: 1.25 }, special: { cr: 4800, bd: 2600, bl: 0.2, th: 130, tl: 0.15, tail: 0.5, gain: 1 } }[cls] || { cr: 4800, bd: 2700, bl: 0.2, th: 130, tl: 0.15, tail: 0.5, gain: 1 };
    const v = (supp ? 0.2 : 1) * C.gain * (big ? 1.15 : 1);
    if (supp) {   // SILENCIADOR: "pfft" abafado + estalo mecânico do ferrolho + pouca cauda
      this.nz(d, t, { dur: 0.1, f: 2300 * j, f2: 700, type: 'bandpass', q: 0.9, g: 0.55 }); this.tn(d, t, { f: 110, f2: 55, dur: 0.1, g: 0.35 });
      this.nz(d, t + 0.012, { dur: 0.03, f: 3800, type: 'bandpass', q: 3, g: 0.22 }); this.tn(d, t + 0.015, { f: 900, f2: 450, dur: 0.025, type: 'square', g: 0.07 }); this.nz(d, t + 0.02, { dur: 0.22, f: 1200, f2: 250, g: 0.07, wet: 0.2 }); return;
    }
    this.nz(d, t, { dur: 0.035, f: C.cr * j, type: 'highpass', g: 0.62 * v, att: 0.0008 });                                   // estalo seco
    this.nz(d, t, { dur: C.bl, f: C.bd * j, f2: 260, g: 0.85 * v, q: 0.85, att: 0.001 });                                     // corpo da explosão
    this.nz(d, t + 0.004, { dur: 0.09, f: 1300 * j, type: 'bandpass', q: 1.3, g: 0.4 * v });                                  // "soco" médio
    this.tn(d, t, { f: C.th * j * 1.5, f2: C.th * 0.38, dur: C.tl, type: 'sine', g: 1.0 * v, wet: 0.18 });                    // pancada grave (queda de tom)
    this.tn(d, t, { f: C.th * 0.9, f2: C.th * 0.3, dur: C.tl * 1.4, type: 'triangle', g: 0.4 * v });
    this.nz(d, t + 0.025, { dur: C.tail, f: 1500, f2: 120, g: 0.2 * v, q: 0.4, att: 0.02, wet: 0.55 });                       // cauda/eco do ambiente
    if (cls === 'shotgun') { this.nz(d, t + 0.01, { dur: 0.42, f: 700, f2: 90, g: 0.5 * v, att: 0.004, wet: 0.35 }); this.tn(d, t + 0.34, { f: 340, f2: 160, dur: 0.05, type: 'square', g: 0.12 }); this.nz(d, t + 0.4, { dur: 0.05, f: 1900, type: 'bandpass', q: 3, g: 0.25 }); }
    if (cls === 'sniper') { this.nz(d, t, { dur: 0.06, f: 7500, type: 'highpass', g: 0.35 }); this.nz(d, t + 0.05, { dur: 1.2, f: 800, f2: 70, g: 0.16, att: 0.05, wet: 0.7 }); }
    if (cls === 'lmg') this.tn(d, t + 0.05, { f: 140, f2: 60, dur: 0.12, g: 0.25 });
  }
  impact(surf, pos) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 2, 1.4);
    if (surf === 1) { this.tn(d, t, { f: 2600 + Math.random() * 900, f2: 1800, dur: 0.14, type: 'triangle', g: 0.25 }); this.nz(d, t, { dur: 0.05, f: 7000, type: 'highpass', g: 0.25 }); }
    else if (surf === 2) { this.nz(d, t, { dur: 0.09, f: 900, f2: 300, g: 0.5 }); this.tn(d, t, { f: 220, f2: 110, dur: 0.08, g: 0.2 }); }
    else if (surf === 3) { this.nz(d, t, { dur: 0.12, f: 1500, f2: 400, g: 0.35 }); }
    else { this.nz(d, t, { dur: 0.08, f: 2400, f2: 600, g: 0.4 }); this.tn(d, t, { f: 300, f2: 120, dur: 0.07, g: 0.15 }); }
  }
  explosion(pos) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 8, 0.9);
    this.nz(d, t, { dur: 0.06, f: 6000, type: 'highpass', g: 0.7, att: 0.001 });                                                 // estalo inicial
    this.nz(d, t, { dur: 1.7, f: 2200, f2: 60, g: 1.25, q: 0.5, att: 0.004, wet: 0.5 });                                         // rugido
    this.tn(d, t, { f: 110, f2: 22, dur: 1.5, g: 1.45, wet: 0.2 }); this.tn(d, t + 0.02, { f: 55, f2: 20, dur: 1.2, type: 'triangle', g: 0.7 }); // sub-grave
    this.nz(d, t + 0.08, { dur: 0.5, f: 4600, f2: 900, type: 'bandpass', q: 0.7, g: 0.28 });                                      // estilhaços
    for (let i = 0; i < 7; i++) this.tn(d, t + 0.35 + Math.random() * 0.9, { f: 1800 + Math.random() * 2200, f2: 700, dur: 0.05, type: 'triangle', g: 0.05 });   // pedaços caindo
    this.nz(d, t + 0.5, { dur: 1.8, f: 700, f2: 90, g: 0.22, att: 0.3, wet: 0.8 });                                              // eco distante
    const o = this.ctx.createOscillator(), gn = this.ctx.createGain(); o.frequency.value = 3100; gn.gain.setValueAtTime(0.03, t + 0.05); gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.1); o.connect(gn); gn.connect(this.sfx); o.start(t + 0.05); o.stop(t + 1.15);   // apito no ouvido
  }
  // EXPLOSÃO GRANDE (bomba do modo tático, foguetes, explosões de raio grande): outra categoria sonora, bem mais grave, longa e ampla que a granada. k = escala (1 = foguete, 1.5 = bomba). Camadas: estalo, impacto, queda de graves, rugido, reverberação e ecos. O volume é limitado pelo compressor do mestre.
  // NITRO: chiado de ar + rugido subindo (turbo)
  nitro() {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.sfx;
    this.nz(d, t, { dur: 0.9, f: 800, f2: 5200, type: 'bandpass', q: 1.2, g: 0.5, att: 0.03 }); this.tn(d, t, { f: 120, f2: 380, dur: 0.8, type: 'sawtooth', g: 0.22 }); this.nz(d, t + 0.05, { dur: 0.5, f: 7000, type: 'highpass', g: 0.25, att: 0.01 });
  }
  bigExplosion(pos, k = 1) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 14, 0.7), L = 1 + (k - 1) * 0.8;
    this.nz(d, t, { dur: 0.05, f: 7000, type: 'highpass', g: 0.55, att: 0.001 });                                                      // estalo seco
    this.nz(d, t, { dur: 0.35, f: 900, f2: 120, g: 1.5, q: 0.4, att: 0.002 });                                                         // pancada (impacto)
    this.tn(d, t, { f: 70, f2: 16, dur: 2.6 * L, g: 1.9, wet: 0.3 }); this.tn(d, t + 0.03, { f: 42, f2: 14, dur: 3.2 * L, type: 'triangle', g: 1.1 });   // queda de graves (sub)
    this.nz(d, t + 0.05, { dur: 3.0 * L, f: 1400, f2: 45, g: 1.3, q: 0.6, att: 0.01, wet: 0.7 });                                       // rugido longo
    this.nz(d, t + 0.25, { dur: 2.4 * L, f: 500, f2: 70, g: 0.5, att: 0.4, wet: 0.9 });                                                // reverberação / trovão distante
    for (let i = 0; i < 4; i++) this.nz(d, t + 0.7 + i * 0.5 + Math.random() * 0.3, { dur: 0.9, f: 420 - i * 60, f2: 70, g: 0.22 / (i + 1), att: 0.05, wet: 0.9 });   // ecos
    for (let i = 0; i < 10; i++) this.tn(d, t + 0.4 + Math.random() * 1.6, { f: 1500 + Math.random() * 2500, f2: 600, dur: 0.06, type: 'triangle', g: 0.05 });   // destroços caindo
  }
  step(pos, metal = false, own = false) { if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 1.5, 1.8); this.nz(d, t, { dur: 0.07, f: metal ? 2200 : 700, f2: 200, g: own ? 0.04 : 0.1 }); this.tn(d, t, { f: metal ? 300 : 120, f2: 60, dur: 0.06, g: own ? 0.02 : 0.05 }); }
  mech(kind, pos) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 1.5, 1.8), R = (a, b) => a + Math.random() * (b - a);
    const click = (dt, f, g = 0.3) => { this.tn(d, t + dt, { f, f2: f * 0.5, dur: 0.05, type: 'square', g }); this.nz(d, t + dt, { dur: 0.04, f: 4500, type: 'highpass', g: g * 0.6 }); };
    if (kind === 'swap') { click(0, 700, 0.22); click(0.07, 1100, 0.18); this.nz(d, t, { dur: 0.1, f: 1500, f2: 500, type: 'bandpass', q: 1, g: 0.12 }); }
    else if (kind === 'empty') { click(0, 1500, 0.3); this.tn(d, t, { f: 260, f2: 140, dur: 0.05, type: 'triangle', g: 0.12 }); }
    else if (kind === 'melee') { this.nz(d, t, { dur: 0.2, f: 900, f2: 4200, g: 0.28, type: 'bandpass', q: 1.4, att: 0.05 }); this.nz(d, t + 0.1, { dur: 0.12, f: 3800, f2: 800, g: 0.14, type: 'bandpass', q: 2 }); }   // golpe cortando o ar
    else if (kind === 'hit_blade') { this.nz(d, t, { dur: 0.09, f: 2600, f2: 900, type: 'bandpass', q: 2, g: 0.5 }); this.tn(d, t, { f: 3100, f2: 2200, dur: 0.14, type: 'triangle', g: 0.14 }); this.nz(d, t + 0.02, { dur: 0.1, f: 500, f2: 160, g: 0.4 }); this.tn(d, t + 0.02, { f: 150, f2: 60, dur: 0.1, g: 0.35 }); }   // lâmina: corte metálico + carne
    else if (kind === 'hit_blunt') { this.nz(d, t, { dur: 0.08, f: 420, f2: 120, g: 0.6 }); this.tn(d, t, { f: 110, f2: 45, dur: 0.16, g: 0.7 }); this.tn(d, t + 0.015, { f: 240, f2: 90, dur: 0.1, type: 'triangle', g: 0.3 }); }   // pancada pesada (taco, marreta, soco)
    else if (kind === 'hit_saw') { this.nz(d, t, { dur: 0.35, f: 1800, f2: 900, type: 'bandpass', q: 1.2, g: 0.45 }); this.tn(d, t, { f: 90, f2: 70, dur: 0.35, type: 'sawtooth', g: 0.3 }); this.nz(d, t, { dur: 0.12, f: 500, f2: 150, g: 0.4 }); }   // motosserra cortando
    else if (kind === 'stab') { this.nz(d, t, { dur: 0.1, f: 700, f2: 200, g: 0.5 }); this.tn(d, t, { f: 180, f2: 70, dur: 0.1, g: 0.4 }); this.tn(d, t + 0.01, { f: 2800, f2: 1900, dur: 0.12, type: 'triangle', g: 0.1 }); }
    else if (kind === 'pin') { click(0, 2100, 0.22); this.tn(d, t + 0.05, { f: 4200, f2: 3600, dur: 0.35, type: 'sine', g: 0.07 }); this.nz(d, t + 0.1, { dur: 0.05, f: 5200, type: 'bandpass', q: 5, g: 0.2 }); this.tn(d, t + 0.16, { f: 2600, f2: 2100, dur: 0.18, type: 'triangle', g: 0.09 }); }   // pino saindo + a alavanca "ping"
    else if (kind === 'bounce') { this.tn(d, t, { f: 240, f2: 120, dur: 0.08, g: 0.4 }); this.nz(d, t, { dur: 0.05, f: 2600, f2: 700, g: 0.3 }); }
    else if (kind === 'hiss') { this.nz(d, t, { dur: 1.6, f: 5200, f2: 3000, type: 'bandpass', q: 0.6, g: 0.3, att: 0.06 }); }
  }
  // SOM DE RECARGA/MANEJO — em CAMADAS e na duração REAL da animação (dur, s): soltar o pente, pente saindo, pente entrando (batida + clique), puxar/soltar o ferrolho.
  mechSound(kind, pos = null, dur = 1.6) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 2, 1.4), D = Math.max(0.5, dur), R = (a, b) => a + Math.random() * (b - a);
    const clk = (dt, f, g = 0.5) => { this.nz(d, t + dt, { dur: 0.03, f, type: 'bandpass', q: 5, g: g * 1.3 }); this.tn(d, t + dt, { f: f * 0.45, f2: f * 0.22, dur: 0.04, type: 'square', g: g * 0.22 }); };   // clique metálico
    const thud = (dt, g = 0.5) => { this.tn(d, t + dt, { f: 170, f2: 70, dur: 0.1, type: 'sine', g }); this.nz(d, t + dt, { dur: 0.05, f: 1100, f2: 400, g: g * 0.6 }); };      // encaixe com corpo
    const slide = (dt, len, f1, f2, g = 0.2) => this.nz(d, t + dt, { dur: len, f: f1, f2, type: 'bandpass', q: 1.2, g, att: len * 0.3 });                                            // deslizar de metal/polímero
    if (kind === 'pump') { slide(0.04, 0.12, 1400, 2400, 0.28); clk(0.14, 1500, 0.55); thud(0.15, 0.3); slide(0.27, 0.1, 2400, 1200, 0.25); clk(0.36, 1100, 0.6); thud(0.37, 0.35); }
    else if (kind === 'bolt') { clk(0.12, 1700, 0.55); slide(0.18, 0.2, 1000, 2200, 0.22); clk(0.42, 1300, 0.55); slide(0.5, 0.16, 2200, 1000, 0.2); clk(0.68, 1900, 0.5); thud(0.7, 0.3); }
    else if (kind === 'shell') { this.tn(d, t, { f: R(380, 460), f2: 200, dur: 0.05, type: 'square', g: 0.14 }); this.nz(d, t, { dur: 0.035, f: 2600, type: 'bandpass', q: 3, g: 0.3 }); thud(0.02, 0.15); }
    else if (kind === 'lmg') { clk(0.05 * D, 900, 0.6); this.tn(d, t + 0.05 * D, { f: 520, f2: 260, dur: 0.12, type: 'triangle', g: 0.18 }); slide(0.2 * D, 0.3 * D, 700, 1500, 0.2); for (let i = 0; i < 6; i++) clk(0.25 * D + i * 0.04, R(1800, 3200), 0.15); thud(0.62 * D, 0.7); clk(0.7 * D, 800, 0.55); slide(0.82 * D, 0.1, 1500, 2600, 0.28); clk(0.9 * D, 1500, 0.6); thud(0.91 * D, 0.35); }
    else { // pente padrão: solta (clique) → pente cai/desliza → novo pente entra (batida) → carrega (desliza + clack)
      clk(0.06 * D, 1700, 0.5); slide(0.13 * D, 0.14 * D, 900, 450, 0.2); this.tn(d, t + 0.27 * D, { f: R(240, 320), f2: 90, dur: 0.07, type: 'triangle', g: 0.14 });
      slide(0.47 * D, 0.1 * D, 600, 1400, 0.2); thud(0.6 * D, 0.65); clk(0.61 * D, 2100, 0.45);
      slide(0.84 * D, 0.07, 1600, 2800, 0.3); clk(0.9 * D, 1300, 0.6); thud(0.91 * D, 0.28); }
  }
  reloadSound(cls, dur, pos = null, shells = 0) {   // shells > 0: recarga cartucho a cartucho — UM som de inserção por bala que falta + a bombeada no fim
    if (!this.ctx) return; const D = Math.max(0.3, dur || 1.6);
    if (shells > 0) { const base = Math.min(0.3, D * 0.3), tail = Math.min(0.32, D * 0.25), per = Math.max(0.05, (D - base - tail) / shells); for (let i = 0; i < shells; i++) setTimeout(() => this.mechSound('shell', pos), (base + per * (i + 0.5)) * 1000); setTimeout(() => this.mechSound('pump', pos), Math.max(0.2, D - tail) * 1000); return; }
    if (cls === 'shotgun') { const n = 2; for (let i = 0; i < n; i++) setTimeout(() => this.mechSound('shell', pos), (0.2 + i * 0.3) * D * 1000); setTimeout(() => this.mechSound('pump', pos), 0.9 * D * 1000); }
    else if (cls === 'sniper') this.mechSound('bolt', pos, D);
    else if (cls === 'lmg') this.mechSound('lmg', pos, D);
    else this.mechSound('reload', pos, D);
  }
  // ABASTECIMENTO: gluglu de líquido caindo no tanque (~1,7 s) + tampa + 'toc' do galão; vol 0..1 já considera a distância
  fuel(vol = 1) {
    if (!this.ctx || vol <= 0.02) return; const t = this.ctx.currentTime, d = this.uiGain, v = Math.min(1, vol);
    this.nz(d, t, { dur: 0.07, f: 900, f2: 500, type: 'bandpass', q: 2, g: 0.35 * v });                                      // tampa abrindo
    for (let i = 0; i < 9; i++) { const k = t + 0.18 + i * 0.17 + (i % 2) * 0.03; this.tn(d, k, { f: 260 + (i % 3) * 70, f2: 150 + (i % 3) * 40, dur: 0.13, type: 'sine', g: (0.26 - i * 0.012) * v }); this.nz(d, k, { dur: 0.15, f: 1200 + (i % 4) * 300, f2: 700, type: 'bandpass', q: 1.4, g: 0.14 * v }); }   // glug glug
    this.nz(d, t + 0.2, { dur: 1.5, f: 2400, f2: 1500, type: 'bandpass', q: 0.8, g: 0.08 * v, att: 0.2 });                  // fio de líquido
    this.tn(d, t + 1.82, { f: 340, f2: 200, dur: 0.12, type: 'triangle', g: 0.3 * v }); this.nz(d, t + 1.82, { dur: 0.06, f: 1800, f2: 900, type: 'bandpass', q: 1.2, g: 0.3 * v });   // tampa fechando
  }
  ui(kind) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.uiGain;
    if (kind === 'hit') this.tn(d, t, { f: 1800, f2: 1200, dur: 0.06, type: 'triangle', g: 0.22 });
    else if (kind === 'head') { this.tn(d, t, { f: 2600, dur: 0.18, type: 'sine', g: 0.3 }); this.tn(d, t + 0.05, { f: 3900, dur: 0.22, type: 'sine', g: 0.25 }); }
    else if (kind === 'kill') { this.tn(d, t, { f: 520, f2: 880, dur: 0.12, type: 'square', g: 0.14 }); this.tn(d, t + 0.1, { f: 880, f2: 1320, dur: 0.18, type: 'square', g: 0.14 }); }
    else if (kind === 'headpop') { this.nz(d, t, { dur: 0.06, f: 3200, f2: 1400, type: 'bandpass', q: 0.9, g: 0.55 }); this.tn(d, t, { f: 520, f2: 190, dur: 0.1, type: 'triangle', g: 0.6 }); this.tn(d, t, { f: 120, f2: 60, dur: 0.14, type: 'sine', g: 0.5 }); this.tn(d, t + 0.02, { f: 2900, f2: 2500, dur: 0.16, type: 'sine', g: 0.16 }); }   // 'POP' seco na cabeça: estalo agudo + corpo médio (audível até em caixinha de notebook); só a VÍTIMA recebe
    else if (kind === 'hurt') { this.nz(d, t, { dur: 0.18, f: 600, f2: 120, g: 0.6 }); this.tn(d, t, { f: 90, f2: 50, dur: 0.2, g: 0.5 }); }
    else if (kind === 'streak') { for (let i = 0; i < 4; i++) this.tn(d, t + i * 0.07, { f: 440 * 2 ** (i / 4), dur: 0.2, type: 'sawtooth', g: 0.12 }); }
    else if (kind === 'big') { this.tn(d, t, { f: 110, f2: 55, dur: 0.6, g: 0.5 }); for (let i = 0; i < 5; i++) this.tn(d, t + i * 0.08, { f: 330 * 2 ** (i / 5), dur: 0.3, type: 'sawtooth', g: 0.12 }); }
    else if (kind === 'alert') { this.tn(d, t, { f: 300, f2: 200, dur: 0.5, type: 'sawtooth', g: 0.25 }); this.tn(d, t + 0.55, { f: 300, f2: 200, dur: 0.5, type: 'sawtooth', g: 0.25 }); }
    else if (kind === 'cd') this.tn(d, t, { f: 523, dur: 0.14, type: 'triangle', g: 0.2 });   /* contagem regressiva: 5, 4, 3, 2 = tom médio */
    else if (kind === 'cd1') this.tn(d, t, { f: 587, dur: 0.22, type: 'triangle', g: 0.24 });
    else if (kind === 'go') { this.tn(d, t, { f: 784, dur: 0.4, type: 'triangle', g: 0.3 }); this.tn(d, t, { f: 1175, dur: 0.5, type: 'sine', g: 0.16 }); this.tn(d, t + 0.08, { f: 1568, dur: 0.45, type: 'triangle', g: 0.14 }); }   /* VALENDO: acorde que sobe, mais agudo e longo que a contagem */
    else if (kind === 'tick') { this.tn(d, t, { f: 440, dur: 0.07, type: 'square', g: 0.1 }); this.tn(d, t, { f: 880, dur: 0.05, type: 'sine', g: 0.08 }); }   /* segundos finais da partida: tique seco */
    else if (kind === 'tick3') { this.tn(d, t, { f: 698, dur: 0.12, type: 'square', g: 0.16 }); this.tn(d, t, { f: 1396, dur: 0.1, type: 'triangle', g: 0.12 }); }   /* últimos 3 s: mais agudo e forte */
    else if (kind === 'horn') { this.tn(d, t, { f: 220, f2: 196, dur: 1.1, type: 'sawtooth', g: 0.2 }); this.tn(d, t, { f: 330, f2: 294, dur: 1.1, type: 'square', g: 0.08 }); }   /* fim do tempo */   /* o 1 final: um pouquinho mais agudo */
    else if (kind === 'call_ok') { [660, 880].forEach((f, i) => this.tn(d, t + i * 0.1, { f, dur: 0.22, type: 'triangle', g: 0.18 })); }   // selo de aviso bom (zona segura, área)
    else if (kind === 'call_up') { this.tn(d, t, { f: 300, f2: 900, dur: 0.45, type: 'sine', g: 0.2 }); }   // reanimar / ressurgir: varredura subindo
    else if (kind === 'tac_go') { this.tn(d, t, { f: 440, dur: 0.16, type: 'square', g: 0.12 }); this.tn(d, t + 0.14, { f: 660, dur: 0.16, type: 'square', g: 0.12 }); this.tn(d, t + 0.28, { f: 880, dur: 0.32, type: 'square', g: 0.14 }); }   // LUTAR: três notas subindo
    else if (kind === 'tac_win') { [523, 659, 784].forEach((f, i) => this.tn(d, t + i * 0.12, { f, dur: 0.34, type: 'triangle', g: 0.2 })); this.tn(d, t + 0.36, { f: 1047, dur: 0.6, type: 'triangle', g: 0.2 }); }   // round vencido: acorde alegre
    else if (kind === 'tac_lose') { [392, 349, 294].forEach((f, i) => this.tn(d, t + i * 0.2, { f, dur: 0.4, type: 'triangle', g: 0.18 })); }   // round perdido: três notas descendo
    else if (kind === 'tac_draw') { this.tn(d, t, { f: 440, dur: 0.3, type: 'sine', g: 0.16 }); this.tn(d, t + 0.25, { f: 440, dur: 0.3, type: 'sine', g: 0.14 }); }
    else if (kind === 'beep') this.tn(d, t, { f: 1000, dur: 0.1, type: 'square', g: 0.12 });
    else if (kind === 'monster') { this.tn(d, t, { f: 70, f2: 38, dur: 1.4, type: 'sawtooth', g: 0.6 }); this.nz(d, t, { dur: 1.2, f: 300, f2: 90, g: 0.4 }); }
    else if (kind === 'drums') {                                           // TAMBORES DE GUERRA: aviso de horda chegando (ritmo BUM-BUM · ba-BUM)
      const hit = (dt, f, g) => { this.tn(d, t + dt, { f, f2: f * 0.5, dur: 0.38, type: 'sine', g }); this.nz(d, t + dt, { dur: 0.09, f: 260, f2: 90, g: g * 0.5 }); };
      [[0, 78, 0.9], [0.5, 78, 0.8], [1.0, 104, 0.6], [1.25, 78, 0.9], [1.75, 98, 0.65], [2.0, 70, 1.0], [2.5, 70, 0.9], [3.0, 104, 0.6], [3.25, 78, 0.9], [3.75, 62, 1.0]].forEach(([dt, f, g]) => hit(dt, f, g));
    }
    else if (kind === 'level') { for (let i = 0; i < 6; i++) this.tn(d, t + i * 0.09, { f: 392 * 2 ** (i / 6), dur: 0.35, type: 'triangle', g: 0.18 }); }
  }
  // som de CONFIRMAÇÃO ao equipar: clack metálico + acorde ascendente
  equipSound() { if (!this.ctx) return; const t = this.ctx.currentTime, d = this.sfx; this.nz(d, t, { dur: 0.05, f: 1900, type: 'bandpass', q: 5, g: 0.5 }); this.nz(d, t + 0.09, { dur: 0.06, f: 900, type: 'bandpass', q: 4, g: 0.55 }); for (const [f, dt] of [[523, 0.16], [659, 0.22], [784, 0.28]]) this.tn(d, t + dt, { f, f2: f, dur: 0.28, g: 0.12 }); }
  ring(ms) { if (!this.ctx) return; const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.frequency.value = 3100; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.18, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.6, ms / 1000)); o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + ms / 1000 + 0.2); }   // zumbido no ouvido
  /* CAÇADA: barulhos que SÓ as presas (jogadores) fazem — mastigar ao comer e a barriga roncando. Saem da posição do bicho (som 3D): o caçador ouve de onde vem. Bichos do computador não fazem. */
  creatureVoice(pos, id, kind = 'call', vol = 0.8) {   // voz sintetizada da espécie (som 3D): ronco/rugido dos bichos no jogo
    if (!this.ctx || !id) return; import('./creatureVoice.js').then((m) => { try { m.playVoice(id, kind, { ctx: this.ctx, dest: this.out(pos, this.sfx, 9, 1.4), vol }); } catch { /* sem som */ } }).catch(() => {});
  }
  huntSnd(pos, kind) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 9, 1.4);
    if (kind === 'munch') for (let i = 0; i < 5; i++) { this.nz(d, t + i * 0.34, { dur: 0.16, f: 700, f2: 300, type: 'lowpass', g: 0.5 }); this.tn(d, t + i * 0.34, { f: 140, f2: 90, dur: 0.1, g: 0.18 }); }
    else if (kind === 'belly') { for (let i = 0; i < 3; i++) { const u = t + i * 0.42; this.tn(d, u, { f: 62 + i * 9, f2: 38, dur: 0.38, type: 'sawtooth', g: 0.2 }); this.nz(d, u, { dur: 0.36, f: 220 + i * 40, f2: 90, type: 'lowpass', g: 0.3 }); } }   /* barriga roncando: gorgolejo grave, sem voz de bicho */
    else if (kind === 'scan') { this.tn(d, t, { f: 1320, dur: 0.09, type: 'square', g: 0.12 }); this.tn(d, t + 0.14, { f: 1760, dur: 0.12, type: 'square', g: 0.12 }); }   /* bip do rastreador */
    else if (kind === 'scream') { this.tn(d, t, { f: 260, f2: 980, dur: 0.5, type: 'sawtooth', g: 0.3 }); this.tn(d, t + 0.45, { f: 980, f2: 180, dur: 0.7, type: 'sawtooth', g: 0.26 }); this.nz(d, t, { dur: 1.1, f: 1800, f2: 400, type: 'bandpass', g: 0.35 }); }   /* grito do monstro */
    else if (kind === 'fart') { this.tn(d, t, { f: 150, f2: 62, dur: 0.55, type: 'sawtooth', g: 0.34 }); this.tn(d, t + 0.05, { f: 118, f2: 70, dur: 0.5, type: 'square', g: 0.16 }); this.nz(d, t, { dur: 0.5, f: 420, f2: 120, type: 'lowpass', g: 0.5 }); this.tn(d, t + 0.4, { f: 90, f2: 48, dur: 0.18, type: 'sawtooth', g: 0.22 }); }   /* pffffrt sintetizado (som nosso) */
    else this.tn(d, t, { f: 85, f2: 48, dur: 0.9, type: 'sawtooth', g: 0.3 }), this.nz(d, t, { dur: 0.8, f: 260, f2: 90, type: 'lowpass', g: 0.35 });
  }
  fireworkBoom(pos) { if (!this.ctx) return; const t = this.ctx.currentTime + 0.4, d = this.out(pos, this.sfx, 14, 0.5); this.nz(d, t, { dur: 0.9, f: 260, type: 'lowpass', g: 0.35 }); this.tn(d, t, { f: 70, f2: 30, dur: 0.5, g: 0.22 }); }   // estouro distante
  tink(pos) { if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 2, 1.6), f = 3000 + Math.random() * 900; for (let i = 0; i < 3; i++) { const dt = i === 0 ? 0 : 0.07 * i + i * i * 0.03; this.tn(d, t + dt, { f: f * (1 - i * 0.12), f2: f * (0.75 - i * 0.1), dur: 0.05, g: 0.1 / (1 + i * 0.8) }); this.nz(d, t + dt, { dur: 0.025, f: 6500, type: 'highpass', g: 0.05 / (1 + i) }); } }   // cápsula quicando no chão (3 batidas)

  // ----- PARQUE: valsa de parque (mesma melodia do software), BAIXA — equilibrada com tiros, passos e trem -----
  parkStart() {
    if (!this.ctx || this.park) return;
    const MEL = [[72, 76, 79], [77, 72, 69], [74, 71, 67], [72, 67, 72], [69, 72, 76], [74, 77, 74], [71, 74, 79], [84, 79, 72]], CH = [[48, 4], [53, 4], [55, 4], [48, 4], [57, 3], [50, 3], [55, 4], [48, 4]], hz = (m) => 440 * 2 ** ((m - 69) / 12);
    const bus = this.ctx.createGain(); bus.gain.value = 0.16; bus.connect(this.sfx); const st = { bus, beat: 0, next: this.ctx.currentTime + 0.2 };
    const tone = (f, t, d, type, pk) => { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + 0.015); g.gain.exponentialRampToValueAtTime(0.001, t + d); o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.05); };
    st.timer = setInterval(() => { const bt = 0.36; while (st.next < this.ctx.currentTime + 0.5) { const bar = (st.beat / 3 | 0) % 8, k = st.beat % 3, t = st.next, [r, th] = CH[bar]; tone(hz(MEL[bar][k]), t, bt * 0.95, 'triangle', 0.22); tone(hz(MEL[bar][k] + 12), t, bt * 0.5, 'sine', 0.06); if (!k) tone(hz(r - 12), t, bt * 1.2, 'sine', 0.3); else { tone(hz(r + 12 + th), t, bt * 0.3, 'square', 0.05); tone(hz(r + 19), t, bt * 0.3, 'square', 0.05); } st.next += bt; st.beat++; } }, 200);
    this.park = st;
  }
  parkStop() { if (!this.park) return; clearInterval(this.park.timer); this.park.bus.disconnect(); this.park = null; }

  // ----- TREM: ronco contínuo posicional + 'chuf-chuf' + buzina (sintetizados; ligados ao mapa Deserto) -----
  trainStart() {
    if (!this.ctx || this.tr) return;
    const c = this.ctx, src = c.createBufferSource(); src.buffer = this.noise; src.loop = true;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 170; lp.Q.value = 0.8;
    const g = c.createGain(); g.gain.value = 0.9;
    const pn = c.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = 5; pn.rolloffFactor = 1.0; pn.maxDistance = 400;
    src.connect(lp); lp.connect(g); g.connect(pn); pn.connect(this.sfx); src.start();
    this.tr = { src, lp, g, pn, next: 0, clack: 0 };
  }
  trainUpdate(pos, dt, dist) {
    if (!this.ctx || !this.tr) return;
    const tr = this.tr, t = this.ctx.currentTime;
    if (tr.pn.positionX) { tr.pn.positionX.setValueAtTime(pos.x, t); tr.pn.positionY.setValueAtTime(pos.y, t); tr.pn.positionZ.setValueAtTime(pos.z, t); } else tr.pn.setPosition(pos.x, pos.y, pos.z);
    tr.lp.frequency.setTargetAtTime(150 + Math.max(0, 1 - dist / 60) * 160, t, 0.2);   // mais "aberto" quando o trem está perto
    tr.next -= dt; tr.clack -= dt;
    if (tr.next <= 0) { tr.next = 0.46; const d = this.out(pos, this.sfx, 6, 0.9); this.nz(d, t, { dur: 0.2, f: 520, f2: 140, g: 0.9, att: 0.004 }); this.tn(d, t, { f: 70, f2: 38, dur: 0.16, g: 0.7 }); }
    if (tr.clack <= 0) { tr.clack = 0.19; const d = this.out(pos, this.sfx, 5, 1.0); this.nz(d, t, { dur: 0.05, f: 2600, type: 'bandpass', q: 3, g: 0.12 }); }   // juntas dos trilhos
  }
  // barramento dos sons de MAPA (buzinas, sirene): ao sair da partida é cortado de uma vez, mesmo com nota ainda tocando
  mapBus() { if (!this.ctx) return null; if (!this._mb) { this._mb = this.ctx.createGain(); this._mb.gain.value = 1; this._mb.connect(this.sfx); } return this._mb; }
  mapStop() {
    if (this._mb) { try { this._mb.gain.value = 0; this._mb.disconnect(); } catch { /* ok */ } this._mb = null; }
    if (this.sir) { try { this.sir.o.stop(); this.sir.lfo.stop(); this.sir.g.disconnect(); } catch { /* ok */ } this.sir = null; }
  }
  // PERFIL DE MOTOR POR MODELO (cada carro tem voz própria): b = ralenti (Hz), r = quanto sobe até o limite, w = [serra, quadrada, seno], f = [filtro base, quanto abre], tr = [Hz, profundidade] da trepidação, d = desafino do 2º osc., g = volume, pop = estouros ao soltar o acelerador
  static ENG = [
    { b: 31, r: 80, w: [0.5, 0.2, 0.5], f: [380, 1500], tr: [0, 0], d: 2.01, g: 1 },                       // 0 Corisco: sedã 4 cilindros, redondo
    { b: 25, r: 70, w: [0.45, 0.3, 0.6], f: [320, 1300], tr: [0, 0], d: 1.5, g: 1.05 },                    // 1 Tracajá: SUV V6, mais grave
    { b: 40, r: 110, w: [0.7, 0.35, 0.3], f: [520, 2600], tr: [0, 0], d: 2.02, g: 1, pop: 1 },             // 2 Escorpião: esportivo, rouco e agudo
    { b: 21, r: 52, w: [0.3, 0.6, 0.5], f: [260, 900], tr: [13, 0.28], d: 1.99, g: 1.1 },                   // 3 Roceira: picape diesel, batucada
    { b: 24, r: 66, w: [0.55, 0.45, 0.4], f: [300, 1200], tr: [9, 0.16], d: 2.04, g: 1.05 },                // 4 Trilheiro: jipe, áspero
    { b: 27, r: 54, w: [0.2, 0.15, 0.85], f: [260, 800], tr: [0, 0], d: 1.5, g: 0.9 },                      // 5 Perua: van, macio e abafado
    { b: 46, r: 120, w: [0.65, 0.5, 0.2], f: [650, 3000], tr: [0, 0], d: 2.5, g: 0.95 },                    // 6 Duna: buggy dois tempos, zumbido
    { b: 19, r: 48, w: [0.35, 0.7, 0.45], f: [240, 760], tr: [11, 0.34], d: 1.98, g: 1.2 },                 // 7 Tatu: militar diesel, estrondo
    { b: 70, r: 190, w: [0.1, 0.05, 0.9], f: [900, 5200], tr: [0, 0], d: 3.0, g: 0.85 },                    // 8 Astronave: turbina elétrica, assobio
    { b: 23, r: 74, w: [0.5, 0.15, 0.7], f: [340, 1700], tr: [0, 0], d: 2.0, g: 1.05 },                     // 9 Bicho: V8 de luxo, fundo e liso
    { b: 17, r: 40, w: [0.25, 0.3, 0.9], f: [200, 600], tr: [3.2, 0.4], d: 1.51, g: 1.1 },                  // 10 Van Umbra: zumbido sinistro, pulsando
    { b: 15, r: 38, w: [0.3, 0.8, 0.5], f: [190, 560], tr: [7, 0.3], d: 1.97, g: 1.25 },                    // 11 Caveirão: diesel pesadíssimo
    { b: 36, r: 98, w: [0.75, 0.3, 0.35], f: [480, 2300], tr: [0, 0], d: 2.03, g: 1, pop: 1 }              // 12 OGBB: 4 cilindros envenenado, ronco e estouros
  ];
  /* MOTOR DOS CARROS (som 3D contínuo, sintetizado): cada carro ligado/andando tem seu motor — os 3 mais próximos (até 90 m) tocam. Tom = RPM (marcha virtual calculada em vehFx: sobe, cai na troca, mais esforço na subida). list: {id,x,y,z,sp,dead,on,ty,rpm,thr,lab,sh,shNow,nit} */
  vehEngines(list) {
    if (!this.ctx) return; const L = this.ctx.listener, cp = L.positionX ? { x: L.positionX.value, y: L.positionY.value, z: L.positionZ.value } : { x: 0, y: 0, z: 0 }, t = this.ctx.currentTime, E = (this._eng ||= new Map()), want = [], PF = this.constructor.ENG;
    for (const v of list) { if (v.dead || !(v.on || Math.abs(v.sp) > 0.4)) continue; const d = Math.hypot(v.x - cp.x, v.y - cp.y, v.z - cp.z); if (d < 90) want.push([d, v]); }
    want.sort((a, b) => a[0] - b[0]); const use = new Set(want.slice(0, 3).map(([, v]) => v.id));
    for (const [id, e] of E) if (!use.has(id)) { try { e.g.gain.setTargetAtTime(0, t, 0.15); const o1 = e.o1, o2 = e.o2, o3 = e.o3, lf = e.lf, pn = e.pn, g = e.g; setTimeout(() => { try { o1.stop(); o2.stop(); o3.stop(); lf?.stop(); g.disconnect(); pn.disconnect(); } catch { /* já parou */ } }, 600); } catch { /* ok */ } E.delete(id); }
    for (const [, v] of want.slice(0, 3)) {
      const P = PF[v.ty % PF.length] || PF[0]; let e = E.get(v.id);
      if (!e) {
        const pn = this.ctx.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = 6; pn.rolloffFactor = 1.3; pn.maxDistance = 200; pn.connect(this.sfx);
        const g = this.ctx.createGain(); g.gain.value = 0; const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2; lp.connect(g); g.connect(pn);
        const mk = (type, gain) => { const o = this.ctx.createOscillator(); o.type = type; const og = this.ctx.createGain(); og.gain.value = gain; o.connect(og); og.connect(lp); o.start(); return o; };
        let lf = null, tg = null; if (P.tr[0] > 0) { lf = this.ctx.createOscillator(); lf.frequency.value = P.tr[0]; tg = this.ctx.createGain(); tg.gain.value = 0; lf.connect(tg); tg.connect(g.gain); lf.start(); }   // trepidação (diesel/van): modula o volume
        e = { pn, g, lp, tg, lf, o1: mk('sawtooth', P.w[0]), o2: mk('square', P.w[1] * 0.45), o3: mk('sine', P.w[2]), nit: false, popAt: 0, ty: v.ty }; E.set(v.id, e);
      }
      const rpm = Math.max(0, Math.min(1.1, v.rpm ?? Math.min(1, Math.abs(v.sp) / 26))), lab = v.lab || 0, nt = v.nit ? 1.18 : 1, base = (P.b + P.r * rpm) * nt * (1 - 0.14 * lab), shd = (v.sh ?? 9) < 0.14 ? 0.35 : 1;   // troca de marcha: o som "engasga" por um instante
      e.o1.frequency.setTargetAtTime(base, t, 0.05); e.o2.frequency.setTargetAtTime(base * P.d, t, 0.05); e.o3.frequency.setTargetAtTime(base * 0.5, t, 0.05);
      e.lp.frequency.setTargetAtTime((P.f[0] + P.f[1] * rpm) * (1 + 0.25 * (v.thr > 0 ? v.thr : 0)) * (v.nit ? 1.3 : 1), t, 0.07); e.g.gain.setTargetAtTime((0.12 + 0.2 * Math.min(1, rpm * 0.7 + (v.thr > 0 ? v.thr * 0.35 : 0))) * P.g * shd * (1 + 0.25 * lab), t, 0.05);
      if (e.tg) e.tg.gain.setTargetAtTime(P.tr[1] * 0.12 * (0.4 + rpm), t, 0.1);
      if (e.pn.positionX) { e.pn.positionX.setTargetAtTime(v.x, t, 0.05); e.pn.positionY.setTargetAtTime(v.y + 0.8, t, 0.05); e.pn.positionZ.setTargetAtTime(v.z, t, 0.05); } else e.pn.setPosition(v.x, v.y + 0.8, v.z);
      const pos = { x: v.x, y: v.y + 0.7, z: v.z };
      if (v.nit && !e.nit) this.nitroBlast(pos);   // NITRO acabou de ligar: estouro + rugido subindo (para quem está perto)
      if (v.nit && t - (e.nzAt || 0) > 0.12) { e.nzAt = t; const d = this.out(pos, this.sfx, 8, 1.1); this.nz(d, t, { dur: 0.26, f: 3400, f2: 1100, type: 'bandpass', q: 0.9, g: 0.34, att: 0.02 }); this.nz(d, t, { dur: 0.2, f: 400, f2: 220, type: 'lowpass', g: 0.3, att: 0.02 }); }   // chiado contínuo do turbo
      e.nit = !!v.nit;
      if (v.shNow) this.gearShift(pos, v.shNow > 0, !!P.pop || !!v.nit);
      if (P.pop && v.thr < -0.25 && rpm > 0.55 && t - e.popAt > 0.18 && Math.random() < 0.09) { e.popAt = t; const d = this.out(pos, this.sfx, 6, 1.2); this.nz(d, t, { dur: 0.07, f: 1800, f2: 500, type: 'bandpass', q: 1.1, g: 0.5 }); this.tn(d, t, { f: 160, f2: 80, dur: 0.08, type: 'square', g: 0.18 }); }   // estouro no escapamento ao soltar o pé
    }
  }
  // troca de marcha: "tchuf" da válvula/embreagem + estalo (mais forte em carro esportivo ou com nitro)
  // INSPECIONAR a arma: barulhinhos de cada momento (pos = 3D para os outros jogadores; sem pos = o próprio, no ouvido). nome: move, spin, tap, click, rack, pump, bolt, thunk, flip, ping, rev, hum
  inspect(nm, pos = null) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 2.2, 1.6), c = (dt, f, g = 0.25) => { this.tn(d, t + dt, { f, f2: f * 0.5, dur: 0.05, type: 'square', g }); this.nz(d, t + dt, { dur: 0.04, f: 4200, type: 'highpass', g: g * 0.6 }); };
    if (nm === 'move') { this.nz(d, t, { dur: 0.22, f: 900, f2: 1900, type: 'bandpass', q: 0.7, g: 0.07, att: 0.06 }); }
    else if (nm === 'spin') { this.nz(d, t, { dur: 0.26, f: 500, f2: 2600, type: 'bandpass', q: 1.1, g: 0.1, att: 0.08 }); }
    else if (nm === 'tap') { this.tn(d, t, { f: 210, f2: 120, dur: 0.07, type: 'sine', g: 0.3 }); this.nz(d, t, { dur: 0.05, f: 1500, f2: 600, type: 'bandpass', q: 0.9, g: 0.14 }); }
    else if (nm === 'click') { c(0, 1500, 0.28); c(0.05, 1000, 0.18); }
    else if (nm === 'rack') { c(0, 700, 0.3); this.nz(d, t + 0.02, { dur: 0.09, f: 3000, f2: 900, type: 'bandpass', q: 1, g: 0.2 }); c(0.14, 1300, 0.26); }
    else if (nm === 'pump') { c(0, 520, 0.3); this.nz(d, t, { dur: 0.1, f: 1800, f2: 600, type: 'bandpass', q: 0.9, g: 0.2 }); c(0.17, 900, 0.34); }
    else if (nm === 'bolt') { c(0, 650, 0.3); this.nz(d, t + 0.03, { dur: 0.12, f: 2600, f2: 800, type: 'bandpass', q: 1.1, g: 0.18 }); c(0.2, 1200, 0.26); }
    else if (nm === 'thunk') { this.tn(d, t, { f: 120, f2: 60, dur: 0.14, type: 'sine', g: 0.4 }); this.nz(d, t, { dur: 0.06, f: 700, f2: 250, type: 'lowpass', g: 0.2 }); }
    else if (nm === 'flip') { this.nz(d, t, { dur: 0.2, f: 1100, f2: 4200, type: 'bandpass', q: 1.4, g: 0.12, att: 0.04 }); this.tn(d, t + 0.16, { f: 2600, f2: 2000, dur: 0.05, type: 'triangle', g: 0.08 }); }
    else if (nm === 'ping') { this.tn(d, t, { f: 3400, f2: 3300, dur: 0.5, type: 'sine', g: 0.1 }); this.tn(d, t, { f: 5100, f2: 5000, dur: 0.3, type: 'sine', g: 0.05 }); this.nz(d, t, { dur: 0.04, f: 6000, type: 'highpass', g: 0.1 }); }
    else if (nm === 'rev') { this.nz(d, t, { dur: 0.38, f: 300, f2: 900, type: 'bandpass', q: 1.2, g: 0.22, att: 0.04 }); this.tn(d, t, { f: 55, f2: 150, dur: 0.38, type: 'sawtooth', g: 0.2 }); for (let i = 0; i < 5; i++) c(i * 0.06, 800 + i * 150, 0.1); }
    else if (nm === 'hum') { this.tn(d, t, { f: 180, f2: 260, dur: 0.5, type: 'sine', g: 0.12 }); this.tn(d, t, { f: 360, f2: 520, dur: 0.5, type: 'triangle', g: 0.05 }); }
  }
  // MOTOSSERRA ligada: motor 2 tempos que fica em ralenti (borbulhando) e ACELERA ao serrar, com a corrente zunindo. list: {id,x,y,z,rev (0..1),own}. Só as 3 mais próximas (até 40 m).
  chainsaws(list) {
    if (!this.ctx) return; const t = this.ctx.currentTime, E = (this._csw ||= new Map()), L = this.ctx.listener, cp = L.positionX ? { x: L.positionX.value, y: L.positionY.value, z: L.positionZ.value } : { x: 0, y: 0, z: 0 };
    const want = list.map((v) => [Math.hypot(v.x - cp.x, v.y - cp.y, v.z - cp.z), v]).filter(([d]) => d < 40).sort((a, b) => a[0] - b[0]).slice(0, 3), use = new Set(want.map(([, v]) => v.id));
    for (const [id, e] of E) if (!use.has(id)) { try { e.g.gain.setTargetAtTime(0, t, 0.12); const o1 = e.o1, o2 = e.o2, lf = e.lf, ns = e.ns, g = e.g, pn = e.pn; setTimeout(() => { try { o1.stop(); o2.stop(); lf.stop(); ns.stop(); g.disconnect(); pn.disconnect(); } catch { /* já parou */ } }, 500); } catch { /* ok */ } E.delete(id); }
    for (const [, v] of want) {
      let e = E.get(v.id);
      if (!e) {
        const pn = this.ctx.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = 3; pn.rolloffFactor = 1.4; pn.maxDistance = 80; pn.connect(this.sfx);
        const g = this.ctx.createGain(); g.gain.value = 0; g.connect(pn); const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3; lp.connect(g);
        const mk = (type, gain) => { const o = this.ctx.createOscillator(); o.type = type; const og = this.ctx.createGain(); og.gain.value = gain; o.connect(og); og.connect(lp); o.start(); return o; };
        const o1 = mk('sawtooth', 0.55), o2 = mk('square', 0.3), lf = this.ctx.createOscillator(); lf.type = 'square'; lf.frequency.value = 22; const lg = this.ctx.createGain(); lg.gain.value = 0.35; lf.connect(lg); lg.connect(g.gain); lf.start();   // trepidação do 2 tempos
        const ns = this.ctx.createBufferSource(); ns.buffer = this.noise; ns.loop = true; const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.8; const ng = this.ctx.createGain(); ng.gain.value = 0.07; ns.connect(bp); bp.connect(ng); ng.connect(g); ns.start();   // zunido da corrente
        e = { pn, g, lp, o1, o2, lf, ns, bp, ng, rev: 0 }; E.set(v.id, e);
      }
      e.rev += ((v.rev ?? 0.3) - e.rev) * 0.25; const r = e.rev, f = 52 + 70 * r;
      e.o1.frequency.setTargetAtTime(f, t, 0.05); e.o2.frequency.setTargetAtTime(f * 1.5, t, 0.05); e.lp.frequency.setTargetAtTime(500 + 2600 * r, t, 0.06); e.lf.frequency.setTargetAtTime(18 + 26 * r, t, 0.08); e.bp.frequency.setTargetAtTime(1800 + 2600 * r, t, 0.08); e.ng.gain.setTargetAtTime(0.05 + 0.2 * r, t, 0.08);
      e.g.gain.setTargetAtTime((v.own ? 0.16 : 0.26) * (0.45 + 0.75 * r), t, 0.06);
      if (e.pn.positionX) { e.pn.positionX.setTargetAtTime(v.x, t, 0.05); e.pn.positionY.setTargetAtTime(v.y, t, 0.05); e.pn.positionZ.setTargetAtTime(v.z, t, 0.05); } else e.pn.setPosition(v.x, v.y, v.z);
    }
  }
  // BOLA chutada: baque surdo de couro (mais forte = mais grave e longo), 3D
  ballKick(pos, k = 0.5) { if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 5, 1.3); this.tn(d, t, { f: 150 + 60 * (1 - k), f2: 60, dur: 0.12 + 0.1 * k, type: 'sine', g: 0.35 + 0.4 * k }); this.nz(d, t, { dur: 0.06, f: 900, f2: 260, type: 'bandpass', q: 0.8, g: 0.25 + 0.2 * k }); }
  // FERROLHO: puxa (clac) … e fecha (clic-clac); os tempos acompanham a duração da ação
  bolt(ms) { if (!this.ctx) return; const mk = (dt, f, g) => { setTimeout(() => { if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(null, this.sfx, 1, 1); this.tn(d, t, { f, f2: f * 0.45, dur: 0.07, type: 'square', g }); this.nz(d, t, { dur: 0.05, f: 3800, type: 'highpass', g: g * 0.7 }); this.tn(d, t, { f: f * 0.3, f2: f * 0.15, dur: 0.09, type: 'triangle', g: g * 0.6 }); }, dt); }; mk(ms * 0.22, 1100, 0.3); mk(ms * 0.38, 700, 0.22); mk(ms * 0.7, 900, 0.26); mk(ms * 0.84, 1400, 0.3); }
  gearShift(pos, up, loud) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 5, 1.3), k = loud ? 1 : 0.55;
    this.nz(d, t, { dur: 0.11, f: 2600, f2: 900, type: 'bandpass', q: 0.8, g: 0.3 * k, att: 0.004 }); this.tn(d, t, { f: up ? 150 : 210, f2: up ? 90 : 140, dur: 0.1, type: 'triangle', g: 0.22 * k });
    if (loud) this.nz(d, t + 0.02, { dur: 0.06, f: 1500, f2: 400, type: 'bandpass', q: 1.2, g: 0.35 });
  }
  // NITRO ligando: estouro agudo + rugido que sobe
  nitroBlast(pos) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 9, 1.0);
    this.nz(d, t, { dur: 0.7, f: 600, f2: 6000, type: 'bandpass', q: 1.1, g: 0.65, att: 0.02 }); this.tn(d, t, { f: 90, f2: 420, dur: 0.7, type: 'sawtooth', g: 0.3 }); this.nz(d, t, { dur: 0.16, f: 5200, type: 'highpass', g: 0.5, att: 0.004 }); this.tn(d, t, { f: 300, f2: 60, dur: 0.25, type: 'sine', g: 0.5 });
  }
  /* ===== BATALHA DE TANQUES: sons de impacto (todos 3D, saem da posição de quem atirou / de onde bateu) ===== */
  // CANHÃO: estouro enorme (queda grave + ruído) + estalo metálico da culatra + eco distante
  tankCannon(pos) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 14, 0.9);
    this.tn(d, t, { f: 120, f2: 28, dur: 0.9, type: 'sine', g: 0.9 }); this.tn(d, t, { f: 70, f2: 24, dur: 1.1, type: 'sawtooth', g: 0.35 });
    this.nz(d, t, { dur: 0.7, f: 2400, f2: 180, type: 'lowpass', g: 0.95 }); this.nz(d, t + 0.02, { dur: 0.25, f: 3800, f2: 900, type: 'bandpass', q: 0.8, g: 0.55 });
    this.tn(d, t + 0.14, { f: 520, f2: 260, dur: 0.18, type: 'square', g: 0.18 }); this.tn(d, t + 0.17, { f: 1450, f2: 900, dur: 0.12, type: 'triangle', g: 0.14 });   // culatra: "CLANK"
    this.nz(d, t + 0.35, { dur: 1.4, f: 420, f2: 90, type: 'lowpass', g: 0.28 });   // eco/cauda grave
  }
  // METRALHADORA do tanque: estalo seco e curto (cada tiro)
  tankMg(pos) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 9, 1.2);
    this.nz(d, t, { dur: 0.09, f: 3200, f2: 700, type: 'bandpass', q: 0.9, g: 0.7 }); this.tn(d, t, { f: 210, f2: 110, dur: 0.07, type: 'square', g: 0.3 }); this.tn(d, t + 0.01, { f: 95, f2: 60, dur: 0.1, type: 'sine', g: 0.35 });
  }
  // BATIDA NA LATARIA: sino metálico que demora a morrer (barras inarmônicas) + "toc" grave. kind 'shell' = pancada gigante com o casco inteiro soando; 'mg' = tinido de bala
  tankHit(pos, kind = 'mg') {
    if (!this.ctx) return; const t = this.ctx.currentTime, big = kind === 'shell', d = this.out(pos, this.sfx, big ? 16 : 8, 1.1);
    const f0 = big ? 150 : 520; for (const [m, g, dur] of [[1, 0.5, big ? 1.5 : 0.35], [2.76, 0.32, big ? 1.1 : 0.25], [5.4, 0.2, big ? 0.7 : 0.16], [8.93, 0.12, 0.3]]) this.tn(d, t, { f: f0 * m * (0.97 + Math.random() * 0.06), f2: f0 * m * 0.985, dur, type: 'sine', g: g * (big ? 0.85 : 0.6) });
    this.nz(d, t, { dur: big ? 0.4 : 0.07, f: big ? 1600 : 4200, f2: 600, type: 'bandpass', q: 1.2, g: big ? 0.8 : 0.45 }); this.tn(d, t, { f: big ? 90 : 220, f2: big ? 38 : 120, dur: big ? 0.5 : 0.1, type: 'sine', g: big ? 0.85 : 0.35 });
    if (big) { this.nz(d, t + 0.05, { dur: 0.8, f: 800, f2: 120, type: 'lowpass', g: 0.5 }); for (let i = 0; i < 4; i++) this.tn(d, t + 0.18 + i * 0.07, { f: 1800 + Math.random() * 1400, f2: 900, dur: 0.05, type: 'triangle', g: 0.07 }); }   // estilhaços de lata caindo
  }
  // METRALHADORA SUPERAQUECIDA: chiado de vapor + estalo seco
  tankOverheat() { if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(null, this.sfx, 1, 1); this.nz(d, t, { dur: 0.7, f: 6500, f2: 2200, type: 'highpass', g: 0.35 }); this.tn(d, t, { f: 300, f2: 90, dur: 0.12, type: 'square', g: 0.2 }); }
  // ASSISTÊNCIA: sininho de dois toques (sobe) — diferente do estalo da kill e do headshot
  assist() { if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(null, this.sfx, 1, 1); this.tn(d, t, { f: 784, f2: 784, dur: 0.14, type: 'triangle', g: 0.26 }); this.tn(d, t + 0.12, { f: 1175, f2: 1175, dur: 0.3, type: 'triangle', g: 0.3 }); this.tn(d, t + 0.12, { f: 2350, f2: 2350, dur: 0.2, type: 'sine', g: 0.08 }); }
  // canhão RECARREGADO: a culatra fecha ("CLUNK" + trava)
  tankReload() { if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(null, this.sfx, 1, 1); this.tn(d, t, { f: 180, f2: 70, dur: 0.12, type: 'square', g: 0.25 }); this.tn(d, t + 0.1, { f: 900, f2: 520, dur: 0.1, type: 'triangle', g: 0.2 }); this.nz(d, t, { dur: 0.05, f: 2600, f2: 800, type: 'bandpass', g: 0.35 }); }
  /* TANQUES (som 3D de verdade, cada um com seu painner HRTF): motor grave sempre ligado + ESTEIRAS (ruído filtrado cortado em "tchak-tchak" cujo ritmo acompanha a velocidade) + o ronco aumenta ao andar.
     Os 4 tanques mais perto (até 120 m) tocam; os outros ficam mudos. list = [{ id, x, y, z, sp, dead }] */
  tankTracks(list) {
    if (!this.ctx) return; const L = this.ctx.listener, cp = L.positionX ? { x: L.positionX.value, y: L.positionY.value, z: L.positionZ.value } : { x: 0, y: 0, z: 0 }, t = this.ctx.currentTime, E = (this._tkE ||= new Map()), want = [];
    for (const v of list) { if (v.dead) continue; const d = Math.hypot(v.x - cp.x, v.y - cp.y, v.z - cp.z); if (d < 120) want.push([d, v]); }
    want.sort((a, b) => a[0] - b[0]); const use = new Set(want.slice(0, 4).map(([, v]) => v.id));
    for (const [id, e] of E) if (!use.has(id)) { try { e.g.gain.setTargetAtTime(0, t, 0.15); const nodes = e.nodes, g = e.g, pn = e.pn; E.delete(id); setTimeout(() => { try { for (const n of nodes) { n.stop?.(); } g.disconnect(); pn.disconnect(); } catch { /* já parou */ } }, 700); } catch { /* ok */ } }
    for (const [, v] of want.slice(0, 4)) {
      let e = E.get(v.id);
      if (!e) {
        const ctx = this.ctx, pn = ctx.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = 8; pn.rolloffFactor = 1.2; pn.maxDistance = 220; pn.connect(this.sfx);
        const g = ctx.createGain(); g.gain.value = 0; g.connect(pn);
        // motor: serra grave + quadrada, filtrados
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 1.5; const eg = ctx.createGain(); eg.gain.value = 0.5; lp.connect(eg); eg.connect(g);
        const mk = (type, gain) => { const o = ctx.createOscillator(); o.type = type; const og = ctx.createGain(); og.gain.value = gain; o.connect(og); og.connect(lp); o.start(); return o; };
        const o1 = mk('sawtooth', 0.55), o2 = mk('square', 0.25);
        // esteiras: ruído em laço → passa-faixa → ganho cortado por um oscilador (o "tchak-tchak")
        if (!this._tkNoise) { const sr = ctx.sampleRate, buf = ctx.createBuffer(1, sr * 2, sr), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this._tkNoise = buf; }
        const src = ctx.createBufferSource(); src.buffer = this._tkNoise; src.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 1.1; const tg = ctx.createGain(); tg.gain.value = 0.5; const lfo = ctx.createOscillator(); lfo.type = 'sawtooth'; lfo.frequency.value = 6; const ld = ctx.createGain(); ld.gain.value = 0.5; lfo.connect(ld); ld.connect(tg.gain); const sg = ctx.createGain(); sg.gain.value = 0; src.connect(bp); bp.connect(tg); tg.connect(sg); sg.connect(g); src.start(); lfo.start();
        e = { pn, g, lp, eg, o1, o2, src, lfo, sg, bp, nodes: [o1, o2, src, lfo] }; E.set(v.id, e);
      }
      const k = Math.min(1, Math.abs(v.sp) / 9), base = 30 + 22 * k;   // ralenti ~30 Hz → ~52 Hz na velocidade máxima
      e.o1.frequency.setTargetAtTime(base, t, 0.1); e.o2.frequency.setTargetAtTime(base * 1.5, t, 0.1); e.lp.frequency.setTargetAtTime(220 + 520 * k, t, 0.12); e.eg.gain.setTargetAtTime(0.5 + 0.5 * k, t, 0.12);
      e.lfo.frequency.setTargetAtTime(3 + 9 * k, t, 0.1); e.bp.frequency.setTargetAtTime(700 + 700 * k, t, 0.1); e.sg.gain.setTargetAtTime(Math.min(1, k * 1.4) * 0.55, t, 0.1);   // esteira só faz barulho ANDANDO
      e.g.gain.setTargetAtTime(0.16 + 0.12 * k, t, 0.12);
      if (e.pn.positionX) { e.pn.positionX.setTargetAtTime(v.x, t, 0.05); e.pn.positionY.setTargetAtTime(v.y + 1.0, t, 0.05); e.pn.positionZ.setTargetAtTime(v.z, t, 0.05); } else e.pn.setPosition(v.x, v.y + 1.0, v.z);
    }
  }
  /* PORTA DO CARRO (som 3D): entrar = abrir + fechar a porta + o motor pegando; sair = abrir, passos e fechar */
  carDoor(pos, enter = true) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.sfx, 5, 1.1);
    const thud = (at, f, g) => { this.tn(d, t + at, { f, f2: f * 0.45, dur: 0.12, type: 'triangle', g }); this.nz(d, t + at, { dur: 0.07, f: 1800, f2: 400, g: g * 0.8, type: 'bandpass', q: 0.9 }); };
    this.nz(d, t, { dur: 0.1, f: 900, f2: 2400, g: 0.25, type: 'bandpass', q: 2 });   // maçaneta/trinco
    thud(0.12, 150, 0.55);   // porta fecha: tum
    if (enter) { this.tn(d, t + 0.45, { f: 55, f2: 120, dur: 0.55, type: 'sawtooth', g: 0.22 }); this.nz(d, t + 0.45, { dur: 0.5, f: 500, f2: 900, g: 0.18, type: 'lowpass' }); }   // partida do motor
    else { this.nz(d, t + 0.28, { dur: 0.06, f: 1200, f2: 600, g: 0.28, type: 'bandpass', q: 1 }); this.nz(d, t + 0.4, { dur: 0.06, f: 1100, f2: 550, g: 0.26, type: 'bandpass', q: 1 }); }   // pés no chão
  }
  trainHorn(pos, k = 1) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.mapBus(), 14, 0.55), K = k;
    for (const [f, g] of [[233, 0.22], [293, 0.2], [466, 0.08]]) { const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const gn = this.ctx.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(g * K, t + 0.08); gn.gain.setValueAtTime(g * K, t + 1.0); gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.8); o.connect(gn); gn.connect(d); o.start(t); o.stop(t + 1.9); }
  }
  // BUZINA DE NAVIO (Porto): dois tons graves e longos, ouvida de longe
  shipHorn(pos) {
    if (!this.ctx) return; const t = this.ctx.currentTime, d = this.out(pos, this.mapBus(), 30, 0.5), K = 0.45;
    for (const [f, g, dly] of [[82, 0.36, 0], [110, 0.3, 0], [165, 0.12, 0], [82, 0.3, 2.9], [123, 0.26, 2.9]]) { const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; const gn = this.ctx.createGain(); const t0 = t + dly;
      gn.gain.setValueAtTime(0.0001, t0); gn.gain.linearRampToValueAtTime(g * K, t0 + 0.25); gn.gain.setValueAtTime(g * K, t0 + 2.1); gn.gain.linearRampToValueAtTime(0.0001, t0 + 2.7); o.connect(lp); lp.connect(gn); gn.connect(d); o.start(t0); o.stop(t0 + 2.8); }
  }
  // SIRENE DO LABORATÓRIO (alarme): varre de grave a agudo sozinha (LFO), liga/desliga suave
  siren(on) {
    if (!this.ctx) return; if (!this.sir) { const c = this.ctx, o = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), g = c.createGain(), lp = c.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 760; lfo.type = 'sine'; lfo.frequency.value = 0.6; lg.gain.value = 300; lp.type = 'lowpass'; lp.frequency.value = 2200; g.gain.value = 0;
      lfo.connect(lg); lg.connect(o.frequency); o.connect(lp); lp.connect(g); g.connect(this.mapBus()); o.start(); lfo.start(); this.sir = { g, o, lfo }; }
    if (!this.sir) return; this.sir.g.gain.setTargetAtTime(on ? 0.012 : 0, this.ctx.currentTime, on ? 0.15 : 0.35);
  }
  trainStop() { if (!this.tr) return; try { this.tr.src.stop(); } catch { /* já parou */ } this.tr = null; }

  // som da medalha: /assets/medals-audio/<id>.mp3|mp4|… (mesmo nome da imagem). Sem arquivo, usa o sintetizado de reserva.
  async medal(name, fallback) {
    if (!this.ctx) return;
    const ext = (this.filesExt || []).find((f) => f.replace(/\.[^.]+$/, '') === name);
    if (ext) {
      try {
        let buf = this.buffers.get(name);
        if (!buf) { const ab = await (await fetch('/assets/medals-audio/' + ext)).arrayBuffer(); buf = await this.ctx.decodeAudioData(ab); this.buffers.set(name, buf); }
        const s = this.ctx.createBufferSource(); s.buffer = buf; s.connect(this.uiGain); s.start(); return;
      } catch { /* cai no sintetizado */ }
    }
    if (fallback) this.ui(fallback);
  }
  event(name, fallback) { return this.medal(name, fallback); }
  // PRÉ-CARGA dos sons de medalha: baixar + decodificar no PRIMEIRO uso travava o quadro no meio da partida (kill dupla, headshot…). Agora é feito aos poucos, logo no começo.
  preloadMedals(names) { if (!this.ctx || this._pm) return; this._pm = true; const todo = [...names]; const step = async () => { const name = todo.pop(); if (!name) return; const ext = (this.filesExt || []).find((f) => f.replace(/.[^.]+$/, '') === name); if (ext && !this.buffers.has(name)) { try { const ab = await (await fetch('/assets/medals-audio/' + ext)).arrayBuffer(); this.buffers.set(name, await this.ctx.decodeAudioData(ab)); } catch { /* ok */ } } setTimeout(step, 250); }; setTimeout(step, 1500); }
}
export const audio = new AudioEngine();
export const sharedCtx = () => { try { audio.init(); const c = audio.ctx; if (c && c.state === 'suspended') c.resume(); return c; } catch { return null; } };   /* efeitos de loja/presente/caixa usam o MESMO contexto do jogo */
onSettings(() => audio.applyVolumes());
addEventListener('pointerdown', () => audio.init(), { once: true });
addEventListener('keydown', () => audio.init(), { once: true });
for (const ev of ['pointerdown', 'keydown', 'focus', 'visibilitychange']) addEventListener(ev, () => audio.wake(), true);
setInterval(() => audio.wake(), 2000);
try { navigator.mediaDevices?.addEventListener?.('devicechange', () => audio.wake()); } catch { /* sem mediaDevices */ }
