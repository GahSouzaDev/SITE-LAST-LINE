// VOZES DAS FERAS (Bestiário e jogo): tudo sintetizado na hora com WebAudio, sem arquivo de áudio (zero download).
// Cada espécie tem uma "assinatura" (tom, timbre, rouquidão) e uma lista de sons: chamado, rugido, hurt, morte e um som para cada tipo de ataque
// (mordida rápida/forte, garra, tapa, cabeçada, chifrada, bote). O tamanho do bicho define o quão grave ele soa.
import { FAUNA } from '../../../shared/fauna.js';
import { INFECTADOS } from '../../../shared/bestiary.js';

let CTX = null, NOISE = null;
export function voiceCtx() {
  if (!CTX) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; try { CTX = new A(); } catch { return null; } }
  if (CTX.state === 'suspended') CTX.resume?.().catch(() => {});
  return CTX;
}
const noiseBuf = (c) => { if (!NOISE || NOISE.sampleRate !== c.sampleRate) { const n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); let s = 1; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; } NOISE = b; } return NOISE; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---- assinaturas: f0 = tom base (Hz) · wave = timbre · rasp = rouquidão (ruído) · form = formantes [Hz, Q] · vib/am = vibrato e tremor · call/roar = formato dos sons ---- */
const SIG = {
  trex:  { f0: 62, wave: 'sawtooth', rasp: 0.5, form: [[300, 3], [820, 4]], am: [26, 0.45], roar: [1.9, 0.78, 1.15], call: [0.9, 0.8, 1], big: 1.2 },
  raptor:{ f0: 520, wave: 'sawtooth', rasp: 0.55, form: [[1500, 5], [2900, 5]], vib: [34, 0.08], roar: [1.0, 1.7, 0.7], call: [0.35, 1.5, 0.9], chirp: 3, big: 0.6 },
  dilo:  { f0: 330, wave: 'sawtooth', rasp: 0.75, form: [[1100, 4], [2300, 5]], vib: [22, 0.06], roar: [1.3, 1.5, 0.65], call: [0.5, 1.3, 0.8], big: 0.7 },
  carno: { f0: 78, wave: 'sawtooth', rasp: 0.45, form: [[420, 3], [900, 3]], am: [18, 0.35], roar: [1.7, 0.85, 1.1], call: [0.9, 0.85, 1], big: 1.1 },
  spino: { f0: 95, wave: 'sawtooth', rasp: 0.85, form: [[500, 3], [1500, 4]], am: [12, 0.3], roar: [2.2, 1.0, 0.55], call: [1.2, 1.1, 0.7], big: 1.0 },
  teri:  { f0: 170, wave: 'triangle', rasp: 0.2, form: [[600, 5], [1200, 4]], vib: [9, 0.05], roar: [1.2, 1.25, 0.7], call: [0.7, 1.4, 0.9], big: 0.8 },
  pachy: { f0: 120, wave: 'sawtooth', rasp: 0.3, form: [[500, 4], [1000, 4]], vib: [7, 0.04], roar: [1.4, 1.1, 0.8], call: [0.8, 1.15, 0.9], big: 0.9 },
  ovi:   { f0: 760, wave: 'square', rasp: 0.25, form: [[1900, 6], [3200, 5]], vib: [28, 0.12], roar: [0.7, 1.6, 0.8], call: [0.25, 1.8, 0.9], chirp: 4, big: 0.4 },
  mamute:{ f0: 300, wave: 'sawtooth', rasp: 0.25, form: [[420, 6], [1100, 5]], vib: [7, 0.03], roar: [1.8, 1.9, 1.2], call: [1.1, 1.6, 1.0], trumpet: true, big: 1.3 },
  smilo: { f0: 92, wave: 'sawtooth', rasp: 0.6, form: [[360, 3], [900, 3]], am: [30, 0.5], roar: [1.5, 0.82, 1.2], call: [0.8, 1.0, 0.8], big: 1.0 },
  pregui:{ f0: 118, wave: 'triangle', rasp: 0.15, form: [[400, 5]], vib: [5, 0.04], roar: [1.0, 0.9, 0.6], call: [0.6, 0.95, 0.5], big: 0.6 },
  glipto:{ f0: 150, wave: 'square', rasp: 0.3, form: [[520, 4], [1400, 4]], am: [14, 0.5], roar: [0.7, 0.8, 0.8], call: [0.35, 0.9, 0.7], big: 0.6 },
  elasmo:{ f0: 105, wave: 'sawtooth', rasp: 0.55, form: [[380, 4], [900, 4]], am: [10, 0.3], roar: [1.3, 1.05, 1.0], call: [0.7, 1.1, 0.9], snort: true, big: 1.0 },
  mega:  { f0: 70, wave: 'sawtooth', rasp: 0.5, form: [[320, 3], [760, 4]], am: [20, 0.4], roar: [1.6, 0.9, 1.1], call: [0.9, 0.9, 0.9], big: 1.1 },
  gigan: { f0: 130, wave: 'sawtooth', rasp: 0.4, form: [[700, 5], [1300, 5]], vib: [6, 0.06], roar: [1.5, 1.4, 1.1], call: [0.9, 1.3, 0.9], big: 1.0 },
  macro: { f0: 240, wave: 'sawtooth', rasp: 0.2, form: [[650, 6], [1500, 5]], vib: [18, 0.1], roar: [1.1, 1.1, 0.8], call: [0.7, 1.2, 0.9], big: 0.8 },
  mapinguari: { f0: 52, wave: 'sawtooth', rasp: 0.9, form: [[280, 3], [700, 3], [1600, 4]], am: [22, 0.5], roar: [2.4, 0.7, 1.3], call: [1.2, 0.8, 1.1], big: 1.4 },
  mula:  { f0: 640, wave: 'sawtooth', rasp: 0.5, form: [[900, 5], [2200, 5]], vib: [14, 0.07], roar: [1.4, 0.6, 1.1], call: [0.9, 0.7, 1.0], neigh: true, big: 1.0 },
  walker:{ f0: 110, wave: 'sawtooth', rasp: 0.6, form: [[700, 6], [1200, 6]], vib: [5, 0.12], roar: [1.5, 0.8, 0.7], call: [1.0, 0.85, 0.7], human: true, big: 0.5 },
  runner:{ f0: 190, wave: 'sawtooth', rasp: 0.7, form: [[900, 6], [1700, 6]], vib: [9, 0.1], roar: [1.1, 1.3, 0.8], call: [0.6, 1.15, 0.8], human: true, big: 0.4 },
  brute: { f0: 78, wave: 'sawtooth', rasp: 0.7, form: [[500, 5], [1000, 5]], vib: [4, 0.1], roar: [1.7, 0.8, 1.0], call: [1.1, 0.8, 0.9], human: true, big: 0.9 },
  tank:  { f0: 58, wave: 'sawtooth', rasp: 0.8, form: [[380, 5], [820, 5]], am: [9, 0.3], roar: [2.0, 0.75, 1.2], call: [1.3, 0.75, 1.0], human: true, big: 1.3 }
};
const sigOf = (id) => {
  if (SIG[id]) return SIG[id]; const f = FAUNA[id] || INFECTADOS[id], size = clamp((f?.hit?.h || 2) / 4.5, 0.2, 1.2);   // espécie sem assinatura própria: o tamanho decide o tom
  return { f0: 330 - size * 250, wave: 'sawtooth', rasp: 0.4, form: [[600, 4], [1300, 4]], vib: [8, 0.05], roar: [1.3, 1.0, 0.9], call: [0.7, 1.0, 0.8], big: size };
};

/* ---- peças ---- */
function voice(c, dest, t, S, { dur = 1, pitch = 1, end = 1, g = 0.5, att = 0.04, rel = 0.25, rasp = 1, am = true } = {}) {
  const out = c.createGain(); out.gain.setValueAtTime(0.0001, t); out.gain.linearRampToValueAtTime(g, t + att); out.gain.setTargetAtTime(0.0001, t + Math.max(att, dur - rel), rel / 3);
  const src = c.createGain(); src.connect(out); out.connect(dest);
  const f0 = S.f0 * pitch, osc = c.createOscillator(); osc.type = S.wave; osc.frequency.setValueAtTime(f0, t); osc.frequency.exponentialRampToValueAtTime(Math.max(20, f0 * end), t + dur);
  if (S.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = S.vib[0]; lg.gain.value = f0 * S.vib[1]; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.1); }
  if (S.chirp) { const l = c.createOscillator(), lg = c.createGain(); l.type = 'square'; l.frequency.value = S.chirp * 4; lg.gain.value = f0 * 0.22; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.1); }   // trinados rápidos (aves e raptores)
  osc.start(t); osc.stop(t + dur + 0.1);
  const bank = S.form.length ? S.form : [[1000, 2]];   // formantes: dão a "vogal" da fera
  const mix = c.createGain(); mix.gain.value = 1 / Math.sqrt(bank.length); bank.forEach(([f, q]) => { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.setValueAtTime(f * (0.9 + 0.1 * pitch), t); b.frequency.linearRampToValueAtTime(f * (0.8 + 0.2 * end), t + dur); b.Q.value = q; osc.connect(b); b.connect(mix); });
  const dry = c.createGain(); dry.gain.value = 0.35; osc.connect(dry); dry.connect(mix);
  if (am && S.am) { const a = c.createGain(); a.gain.value = 1; const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = S.am[0]; lg.gain.value = S.am[1] * 0.5; l.connect(lg); lg.connect(a.gain); a.gain.value = 1 - S.am[1] * 0.5; l.start(t); l.stop(t + dur + 0.1); mix.connect(a); a.connect(src); } else mix.connect(src);
  const r = S.rasp * rasp; if (r > 0.02) { const n = c.createBufferSource(); n.buffer = noiseBuf(c); n.loop = true; const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = Math.max(300, f0 * 5); nf.Q.value = 0.8; const ng = c.createGain(); ng.gain.value = r * 0.55; n.connect(nf); nf.connect(ng); ng.connect(src); n.start(t, Math.random()); n.stop(t + dur + 0.1); }
  return out;
}
function burst(c, dest, t, { dur = 0.1, f = 2000, f2 = null, q = 0.8, type = 'bandpass', g = 0.4 } = {}) {
  const n = c.createBufferSource(); n.buffer = noiseBuf(c); const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q;
  const gn = c.createGain(); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); n.connect(fl); fl.connect(gn); gn.connect(dest); n.start(t, Math.random()); n.stop(t + dur + 0.05);
}
function thump(c, dest, t, { f = 110, f2 = 40, dur = 0.2, g = 0.7 } = {}) { const o = c.createOscillator(), gn = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + dur + 0.05); }

/* ---- os sons ---- */
export const VOICE_KINDS = ['call', 'roar', 'hurt', 'die', 'bite', 'strong', 'claw', 'swat', 'headbutt', 'gore', 'pounce'];
export function playVoice(id, kind = 'call', opts = {}) {
  const c = opts.ctx || voiceCtx(); if (!c) return 0; const dest = opts.dest || c.destination, S = sigOf(id), big = S.big, t = c.currentTime + 0.02, vol = (opts.vol ?? 1);
  const master = c.createGain(); master.gain.value = vol * 0.9; master.connect(dest);
  const R = (a, b) => a + Math.random() * (b - a);
  const vocal = (spec, extra = {}) => voice(c, master, t + (extra.at || 0), S, { dur: spec[0] * (extra.dur || 1), pitch: spec[1] * (extra.pitch || 1) * R(0.96, 1.04), end: spec[2], g: 0.55 * (extra.g || 1), ...extra });
  let len = 1;
  if (S.trumpet && (kind === 'call' || kind === 'roar')) {   // mamute: o barrito (sobe forte e cai)
    const d = kind === 'roar' ? 1.9 : 1.1; voice(c, master, t, S, { dur: d, pitch: 0.8, end: 1.5, g: 0.5, att: 0.12, rel: 0.5 }); voice(c, master, t + d * 0.45, S, { dur: d * 0.6, pitch: 1.55, end: 0.7, g: 0.35, att: 0.03, rel: 0.4 }); len = d + 0.6;
  } else if (S.neigh && (kind === 'call' || kind === 'roar')) {   // mula sem cabeça: relincho com chama
    const d = kind === 'roar' ? 1.5 : 0.9; voice(c, master, t, S, { dur: d, pitch: 0.9, end: 0.55, g: 0.5, att: 0.03 }); voice(c, master, t + 0.18, S, { dur: d * 0.7, pitch: 1.5, end: 0.6, g: 0.28 }); burst(c, master, t, { dur: d, f: 1800, f2: 400, q: 0.5, g: 0.3 }); len = d + 0.3;
  } else if (kind === 'call') { vocal(S.call); len = S.call[0] + 0.3; }
  else if (kind === 'roar') { vocal(S.roar, { g: 1 }); if (big > 0.9) vocal(S.roar, { pitch: 0.5, g: 0.6, at: 0.03 }); burst(c, master, t, { dur: S.roar[0] * 0.8, f: 2400, f2: 500, q: 0.4, g: 0.12 * S.rasp }); len = S.roar[0] + 0.3; }
  else if (kind === 'hurt') { vocal([0.45, 1.5, 0.55], { g: 0.9, att: 0.01 }); len = 0.7; }
  else if (kind === 'die') { vocal([1.6, 1.1, 0.3], { g: 0.8, att: 0.02, rel: 0.7 }); len = 2; }
  else if (kind === 'bite') { burst(c, master, t, { dur: 0.07, f: 3200, f2: 1200, q: 1, g: 0.5 }); thump(c, master, t + 0.03, { f: 140 * (1.4 - big * 0.5), f2: 60, dur: 0.12, g: 0.5 }); vocal([0.32, 1.1, 0.8], { g: 0.7, at: 0.0, att: 0.01 }); len = 0.5; }
  else if (kind === 'strong') { vocal([0.45, 0.9, 0.7], { g: 0.9, att: 0.02 }); burst(c, master, t + 0.28, { dur: 0.13, f: 2600, f2: 700, q: 0.9, g: 0.7 }); thump(c, master, t + 0.3, { f: 120, f2: 36, dur: 0.3, g: 0.95 }); burst(c, master, t + 0.34, { dur: 0.2, f: 900, f2: 300, q: 0.6, g: 0.35 }); len = 0.9; }
  else if (kind === 'claw' || kind === 'swat') { burst(c, master, t, { dur: 0.26, f: 700, f2: kind === 'swat' ? 2200 : 3600, q: 0.7, g: 0.45 }); vocal([0.3, 1.2, 0.7], { g: 0.6, at: 0.05, att: 0.01 }); if (kind === 'swat') thump(c, master, t + 0.18, { f: 100, f2: 50, dur: 0.15, g: 0.5 }); len = 0.5; }
  else if (kind === 'headbutt') { vocal([0.3, 0.9, 0.7], { g: 0.5, att: 0.02 }); thump(c, master, t + 0.2, { f: 95, f2: 34, dur: 0.28, g: 1 }); burst(c, master, t + 0.2, { dur: 0.1, f: 600, f2: 200, q: 0.6, g: 0.4 }); len = 0.7; }
  else if (kind === 'gore') { vocal([0.4, 0.95, 0.8], { g: 0.7, att: 0.02 }); thump(c, master, t + 0.28, { f: 130, f2: 40, dur: 0.25, g: 0.9 }); burst(c, master, t + 0.3, { dur: 0.09, f: 3000, f2: 1000, q: 2, g: 0.5 }); vocal([0.5, 0.8, 0.5], { g: 0.5, at: 0.45, att: 0.03 }); len = 1; }
  else if (kind === 'pounce') { burst(c, master, t, { dur: 0.35, f: 500, f2: 2500, q: 0.6, g: 0.3 }); vocal(S.roar, { dur: 0.6, g: 0.8, att: 0.02 }); thump(c, master, t + 0.5, { f: 110, f2: 38, dur: 0.3, g: 0.85 }); len = 1; }
  setTimeout(() => { try { master.disconnect(); } catch { /* já solto */ } }, (len + 1.5) * 1000);
  return len;
}
/* qual som toca para o ataque de cada tipo: dino (rápido/forte), mamífero e infectado (o tipo de ataque da espécie) */
export const ATTACK_SOUND = (kind, big = false) => (kind === 'bite' ? (big ? 'strong' : 'bite') : kind || 'bite');
