import { ZT } from '/shared/survival.js';
import { FaunaAv } from '../creatures/faunaAv.js';
import { TankAv } from '../creatures/tankAv.js';
import { lampHex } from '/shared/grenadeColors.js';
import * as THREE from 'three';
import { FAUNA } from '/shared/fauna.js';
import { PLAYER_HEIGHT } from '/shared/constants.js';
import { ITEM_IDS } from '/shared/items.js';
import { Avatar } from './avatar.js';
import { audio } from '../audio/audio.js';
import { Ragdoll, Slide, canRag } from '../effects/ragdoll.js';

// Jogadores no mundo: personagem do criador (rig + IK) com a arma de verdade nas mãos. Interpolação ~100 ms.
const INTERP_DELAY_MS = 90;   // servidor envia a 30 Hz (economia de banda): 90 ms de buffer cobre 2 pacotes (mínimo)
const INTERP_MAX_MS = 220;    // internet ruim: o buffer cresce sozinho com a oscilação medida dos pacotes (sobe rápido, desce devagar) — menos 'teleporte' dos outros jogadores
const ALLY_COL = '#7fb4ff';   // aliados SEMPRE azuis (nome e vida) e inimigos sempre vermelhos, não importa o lado do time
const TEAM_SHIRT = { A: '#2f6bd1', B: '#d2392f' };
const FFA_SHIRTS = ['#e0a31b', '#3a7d44', '#8a4bd1', '#d1478f', '#1fa6a6', '#c9b23a', '#5a63e0', '#e07a2f', '#7fb02a', '#2aa0c9'];
const SKINS = ['#f0c8a0', '#d9a577', '#b9805f', '#8d5a3d', '#5e3a26'];
const HAIRS = ['short', 'crew', 'ponytail', 'bun', 'curly', 'afro', 'mohawk', 'long'];
const HAIRCOL = ['#2a1d18', '#111111', '#6b3a1e', '#c9a24a', '#8b2d1a', '#3a3a3a'];
const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,248,215,1)'); r.addColorStop(0.3, 'rgba(255,240,190,.55)'); r.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const outlineMat = new THREE.MeshBasicMaterial({ color: 0xff2a2a, side: THREE.BackSide, depthTest: true, depthWrite: false });

function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
// Aparência: a do jogador (criador) se existir; senão uma combinação estável pelo nome. A camisa segue o time (leitura rápida).
// SUPER ZUMBI (Monstro): pele esverdeada, olhos vermelhos, roupa rasgada e escura, pose de zumbi (braços à frente)
const ZP = { zSkin: ['verde', 'palido', 'cinza', 'roxo', 'podre', 'queimado'], zBlood: ['medio', 'muito', 'muito', 'banho'], zMouth: ['sangue', 'aberta', 'aberta_sangue'], zEyes: ['amarelo', 'branco', 'vermelho', 'vazado'], zWound: ['mordidas', 'cortes', 'tiros', 'tudo'], zBones: ['none', 'costelas', 'braco', 'tripas', 'tudo', 'none'], zHead: ['normal', 'normal', 'aberto', 'machado', 'furo'] };
// INFECTADO (Monstro): cada zumbi tem um visual próprio (pele, sangue, ferimentos, ossos, cabeça), sorteado de forma FIXA pelo id do jogador
const zombieLook = (id) => { let h = (Number(id) * 2654435761) >>> 0; const o = { mode: 'zombie', special: 'none', zBloodCol: '#8a0f18', zVeins: 'on', zTorn: 'on' }; for (const [k, list] of Object.entries(ZP)) { h = (Math.imul(h ^ (h >>> 15), 2246822519) + 3266489917) >>> 0; o[k] = list[h % list.length]; } return o; };
export function lookFor(info, idx) {
  const h = hash(info?.username || 'x'), pick = (a, n) => a[(h >> n) % a.length];
  const base = { gender: (h & 1) ? 'male' : 'female', skin: pick(SKINS, 3), hairStyle: pick(HAIRS, 5), hair: pick(HAIRCOL, 8), eyes: ['#4b7a8c', '#5b4a32', '#3a5a3a'][(h >> 11) % 3], pants: '#2f3640' };
  const look = { ...base, ...(info?.look || {}) };
  if (info?.zombie) Object.assign(look, info.zalien ? { special: 'alien', chroma: 'vermelho', mode: 'player' } : zombieLook(info.id), { lowDetail: true });   // infectado/alien da horda: visual simples (sem relevo nem rosto detalhado)   // na Lua os infectados são ALIENÍGENAS
  look.shirt = info?.team ? TEAM_SHIRT[info.team] : FFA_SHIRTS[(idx ?? 0) % FFA_SHIRTS.length];
  return look;
}
// vida do inimigo: ROSQUINHA vermelha que vai diminuindo; sem nenhuma outra cor no lado vazio (transparente)
// LOD DOS ZUMBIS: cada zumbi tem ~190 malhas (83% são minúsculas: veias, ferimentos, dedos, ossos — raio < 5 cm). Cada malha é uma chamada de desenho: 12 zumbis = ~2300 chamadas por quadro, o que derrubava o FPS (11 FPS no PC fraco).
// A partir de 12 m somem as minúsculas; a partir de 25 m, quase tudo que não é corpo. Visualmente igual (5 cm a 12 m = menos de 1 pixel).
// distâncias² por nível de gráfico (zq): [some o minúsculo, some quase tudo que não é corpo, distância máxima de desenho]. 0 = zumbi SIMPLES (poucas peças, sempre) · 1 = padrão · 2 = completo (todos os detalhes de perto)
// VISÃO JUSTA: nenhum gráfico esconde zumbi/jogador antes de ~330 m (o que muda é o DETALHE, não o alcance). Níveis: 0 corpo completo · 1 sem minúsculos · 2 só o corpo · 3 só as 12 maiores peças (silhueta barata para longe)
// [dist² do nível 1, do nível 2, do nível 3, distância máxima²]. Gráfico baixo (zq 0): sem o nível 0 (sempre ao menos "sem minúsculos" = ~22 peças em vez de ~190)
const ZLOD = [[0, 40 * 40, 100 * 100, 200 * 200], [12 * 12, 25 * 25, 100 * 100, 330 * 330], [30 * 30, 60 * 60, 140 * 140, 400 * 400]];
const _sc = new THREE.Vector3(), _q = new THREE.Quaternion(), _p = new THREE.Vector3();
function lodParts(av) { if (av._lod) return av._lod; av.group.updateMatrixWorld(true); const L = []; av.group.traverse((o) => { if (!o.isMesh) return; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.matrixWorld.decompose(_p, _q, _sc); L.push({ o, r: o.geometry.boundingSphere.radius * Math.max(_sc.x, _sc.y, _sc.z), v0: o.visible, tier: o.userData.lodTier }); }); [...L].sort((a, b) => b.r - a.r).forEach((p, i) => { p.rank = i; }); return (av._lod = L); }
function setLod(e, lvl) { if (e.lodL === lvl) return; e.lodL = lvl; for (const p of lodParts(e.av)) p.o.visible = p.v0 && (p.tier !== undefined ? !((p.tier === 0 && lvl >= 1) || (p.tier === 1 && lvl >= 2) || (p.tier === 2 && lvl >= 3)) : !(lvl >= 1 && p.r < 0.05) && !(lvl >= 2 && p.r < 0.12) && !(lvl >= 3 && p.rank >= 12)); }   // infectado fundido em malhas por CAMADA (0 minúsculo · 1 pequeno · 2 corpo · 3 silhueta): mesma regra do LOD por peça, com muito menos chamadas de desenho
function drawDonut(cv, f, col) {   /* col: cor do ALIADO (a mesma do nome); sem col = vermelho */   // vida sobre o jogador: mesmo tamanho, mais VISÍVEL (trilho escuro + vermelho luminoso com brilho)
  const g = cv.getContext('2d'); g.clearRect(0, 0, 64, 64); if (f <= 0) return; g.lineCap = 'butt';
  g.lineWidth = 14; g.strokeStyle = 'rgba(0,0,0,.65)'; g.beginPath(); g.arc(32, 32, 24, 0, Math.PI * 2); g.stroke();
  g.shadowColor = col || '#ff3a2e'; g.shadowBlur = 10; g.lineWidth = 10; g.strokeStyle = col || '#ff4a3d'; g.beginPath(); g.arc(32, 32, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, f)); g.stroke();
  g.shadowBlur = 0; g.lineWidth = 2.5; g.strokeStyle = col ? '#fff' : 'rgba(255,225,215,.9)'; g.beginPath(); g.arc(32, 32, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, f)); g.stroke();
}
/* altura dos rótulos: humano = PLAYER_HEIGHT; dinossauro = a altura do bicho (nome e vida ficam ACIMA da cabeça, não dentro do corpo) */
function labelH(info) { if (info?.tank) return 3.4; const f = info?.dino && FAUNA[info.dino]; return f ? Math.max(PLAYER_HEIGHT, (f.hit?.h || 2) * (info.dscale || 1)) : PLAYER_HEIGHT; }
function nameSprite(text, color, depth = false) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const g = cv.getContext('2d');
  g.font = 'bold 30px Segoe UI, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = '#000'; g.strokeText(text, 128, 34); g.fillStyle = color; g.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: depth })); spr.scale.set(1.4, 0.35, 1); spr.renderOrder = 999; return spr;   /* depthTest off só para o ALIADO (aparece pelas paredes); o INIMIGO usa depth: o nome some atrás de árvores e objetos, igual à vida */
}
function lerpAngle(a, b, t) { const d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; }

// REPLAY DA MORTE: amostras [t, x, y, z, yaw, pitch, flags, vx, vz, arma] (t em ms, negativo = antes da morte) → pose interpolada no instante t
export function sampleReplay(list, t) {
  if (!list?.length) return null; const mk = (a) => ({ x: a[1], y: a[2], z: a[3], yaw: a[4], pitch: a[5], flags: a[6], vx: a[7], vz: a[8], w: a[9], ads: a[10] | 0, fc: a[11] | 0, hy: a[12] ?? a[4] });
  if (t <= list[0][0]) return mk(list[0]); if (t >= list[list.length - 1][0]) return mk(list[list.length - 1]);
  let i = 1; while (i < list.length - 1 && list[i][0] < t) i++; const a = list[i - 1], c = list[i], k = (t - a[0]) / Math.max(1, c[0] - a[0]);
  return { x: a[1] + (c[1] - a[1]) * k, y: a[2] + (c[2] - a[2]) * k, z: a[3] + (c[3] - a[3]) * k, yaw: lerpAngle(a[4], c[4], k), pitch: a[5] + (c[5] - a[5]) * k, flags: c[6], vx: c[7], vz: c[8], w: c[9], ads: a[10] | 0, fc: a[11] | 0, hy: a[12] != null && c[12] != null ? lerpAngle(a[12], c[12], k) : (c[12] ?? c[4]) };
}
export class RemotePlayers {
  constructor(scene, selfId) { this.scene = scene; this.selfId = selfId; this.roster = new Map(); this.entities = new Map(); this.zpool = []; this.selfTeam = null; this.ffaIndex = new Map(); this.handSide = 'R'; this.getCol = null; this.hints = new Map(); }
  // CORPO DE PANO: de onde veio o tiro que matou (direção e força), para o corpo ser empurrado ao morrer
  hint(id, dir, str, head) { this.hints.set(id, { dir, str, head, t: performance.now() }); if (this.hints.size > 64) this.hints.delete(this.hints.keys().next().value); }
  startRag(e, vx = 0, vz = 0) {
    const col = this.getCol?.(); if (e.rd || !col?.bvh || e.replay || e.av.isTank || !canRag()) return;
    const h = this.hints.get(e.id), hit = h && performance.now() - h.t < 2500 ? h : null, rd = e.av.cr ? new Slide(col, e.group) : new Ragdoll(col, e.group);
    rd.start(hit?.dir || null, hit?.str ?? 2, !!hit?.head, e.av.cr ? null : { x: vx * 0.6, y: 0, z: vz * 0.6 }); this.hints.delete(e.id); e.rd = rd; if (!e.av.cr) e.av.rag = rd;
  }
  // EXPLOSÃO: empurra para longe do centro, mais forte perto e em explosão maior (granada < foguete < bomba); acorda corpos já caídos
  explode(p, r, power) {
    for (const e of this.entities.values()) {
      if (!e.rd || e.rd.stop === undefined) continue; const g = e.group.position, dx = g.x - p.x, dy = g.y + 0.9 - p.y, dz = g.z - p.z, dist = Math.hypot(dx, dy, dz), R = Math.max(r * 1.25, 4); if (dist > R) continue;
      const f = Math.pow(1 - dist / R, 1.2), s = Math.min(14, power * f + 0.4), hl = Math.hypot(dx, dz) || 1; e.rd.kick?.(dx / hl, dz / hl, s, e.av.cr ? 0 : 1);
    }
    this.lastBoom = { x: p.x, y: p.y, z: p.z, r, power, t: performance.now() };
  }
  endRag(e) { e.rd?.stop?.(); e.rd = null; e.av.rag = null; e.group.rotation.set(0, 0, 0); }

  setRoster(players) {
    this.roster = new Map(players.map((p) => [p.id, p]));
    for (const [id, e] of this.entities) { const info0 = this.roster.get(id); if (info0 && !info0.npc && ((e.dinoSig ?? null) !== (info0.dino ?? null) || ((e.tankSig ?? null) !== (info0.tank ?? null) && !(this.keepTanks && e.tankSig && !info0.tank)) || (e.lookSig ?? null) !== (info0.look?.special ?? null))) { this.remove(id, e); continue; }   /* virou outro bicho/monstro (rodada nova, transformação): recria o corpo */
      const info = info0; if (info && !!info.zombie !== !!e.zombie) {   // virou zumbi (ou ressuscitou): troca o corpo
      e.group.remove(e.av.group); e.av = new Avatar({ ...lookFor(info, this.ffaIndex.get(id)), noAura: true }); e.group.add(e.av.group); e.av.group.traverse((o) => { if (o.isMesh) o.castShadow = true; }); e.zombie = !!info.zombie; e.wIdx = -2; e.weapon = null; } }
    this.selfTeam = this.roster.get(this.selfId)?.team ?? null;
    players.forEach((p) => { if (!this.ffaIndex.has(p.id)) this.ffaIndex.set(p.id, this.ffaIndex.size); });
    for (const [id, e] of this.entities) if (!this.roster.has(id)) this.remove(id, e);
  }

  // AQUECIMENTO: cria um zumbi de cada tipo fora da tela e compila os materiais UMA vez (a primeira aparição não trava)
  warm(renderer, camera) {
    try { const tmp = new THREE.Group(); tmp.position.set(0, -400, 0); this.scene.add(tmp); for (const [i, t] of ['walker', 'runner', 'brute', 'tank'].entries()) { const av = new Avatar(lookFor({ username: 'w' + i, zombie: true, ztype: t, id: 9000 + i, look: {} }, i)); av.group.position.set(i * 2, 0, 0); tmp.add(av.group); } renderer.compile(this.scene, camera); setTimeout(() => this.scene.remove(tmp), 400); } catch { /* sem aquecimento */ }
  }
  // POOL DE ZUMBIS: montar um personagem (~200 malhas) custa 20–80 ms e travava o quadro quando a horda aparecia (principalmente dirigindo, que revela zumbis novos o tempo todo).
  // Eles são montados ANTES (aos poucos, no começo da partida) e reaproveitados quando um zumbi some.
  // lista de tarefas (uma por zumbi) para o aquecimento da tela de carregamento: monta o pool inteiro ANTES da partida
  poolJobs(plan = { walker: 17, runner: 6, brute: 3, tank: 2 }) {
    const jobs = []; for (const [t, n] of Object.entries(plan)) for (let i = 0; i < n; i++) jobs.push(() => { if (this.disposed) return; const k = (this._pi = (this._pi || 0) + 1); this.zpool.push({ type: t, av: new Avatar({ ...lookFor({ username: 'pool' + k, zombie: true, ztype: t, id: 9100 + k * 7, look: {} }, k), noAura: true }) }); });
    return jobs;
  }
  fillPool(plan = { walker: 18, runner: 6, brute: 3, tank: 2 }) {
    const todo = []; for (const [t, n] of Object.entries(plan)) for (let i = 0; i < n; i++) todo.push(t);
    const step = () => { const t = todo.pop(); if (!t || this.disposed) return; try { const i = (this._pi = (this._pi || 0) + 1); this.zpool.push({ type: t, av: new Avatar({ ...lookFor({ username: 'pool' + i, zombie: true, ztype: t, id: 9100 + i * 7, look: {} }, i), noAura: true }) }); } catch { /* sem pool */ } setTimeout(step, 40); };
    setTimeout(step, 200);
  }
  // reposição do pool: cada zumbi tirado do pool manda montar outro em segundo plano (um por vez, com folga entre eles) — assim a próxima horda também encontra zumbis prontos e não monta 20 personagens de uma vez no meio do tiroteio
  topUp(type) {
    (this._tq ||= []).push(type); if (this._tt) return;
    const run = () => { this._tt = 0; const t = this._tq.shift(); if (!t || this.disposed) return; if (this.zpool.length < 40) { try { const i = (this._pi = (this._pi || 0) + 1); this.zpool.push({ type: t, av: new Avatar({ ...lookFor({ username: 'pool' + i, zombie: true, ztype: t, id: 9100 + i * 7, look: {} }, i), noAura: true }) }); } catch { /* sem pool */ } } if (this._tq.length) this._tt = setTimeout(run, 140); };
    this._tt = setTimeout(run, 160);
  }
  takePooled(info) { if (!info?.npc || !info.ztype || info.zalien || info.fauna) return null; const i = this.zpool.findIndex((p) => p.type === info.ztype); if (i < 0) { this.topUp(info.ztype); return null; } const av = this.zpool.splice(i, 1)[0].av; if (this.zpool.length < 8) this.topUp(info.ztype); return av; }   // só repõe quando o pool está acabando (montar um zumbi custa dezenas de ms)
  create(id) {
    const info = this.roster.get(id), av = info?.tank ? new TankAv(info.tank) : info?.dino ? Object.assign(new FaunaAv(info.dino, info.dscale || 1), { animK: 0.46 }) : info?.fauna && info.ztype ? new FaunaAv(info.ztype.slice(2), info.dscale || 1) : (this.takePooled(info) || new Avatar({ ...lookFor(info, this.ffaIndex.get(id)), noAura: true }));
    if (info?.dino) { const ls = []; av.group.traverse((o) => { if (o.isLight) ls.push(o); }); for (const l of ls) l.parent?.remove(l); }   /* junta as luzes ANTES de remover (remover durante o traverse quebrava o quadro: o bicho nunca virava monstro) */   /* a luz vermelha dos monstros vem de um pool fixo (game.js): luz nova no rig travava ao recompilar */
    const group = new THREE.Group(); group.add(av.group);
    let sprite = null;
    if (info?.team && info.team === this.selfTeam && id !== this.selfId) { sprite = nameSprite(info.username, ALLY_COL); sprite.userData.col = ALLY_COL; sprite.position.y = labelH(info) + ((info?.dino || info?.tank) ? 1.0 : 0.68); if (info?.dino || info?.tank) sprite.scale.multiplyScalar(1.6); group.add(sprite); }
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const bar = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); bar.scale.set(0.36, 0.36, 1); bar.position.y = labelH(info) + ((info?.dino || info?.tank) ? 0.5 : 0.34); if (info?.dino || info?.tank) bar.scale.multiplyScalar(1.7); bar.visible = false; group.add(bar);
    let alertSp = null;
    if (info?.npc) { const ac = document.createElement('canvas'); ac.width = ac.height = 64; const g = ac.getContext('2d'); g.font = 'bold 54px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 7; g.strokeStyle = '#000'; g.strokeText('!', 32, 34); g.fillStyle = '#ff3b30'; g.fillText('!', 32, 34); const at = new THREE.CanvasTexture(ac); at.colorSpace = THREE.SRGBColorSpace; alertSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: at, transparent: true, depthWrite: false, depthTest: false })); alertSp.scale.set(0.3, 0.3, 1); alertSp.position.y = PLAYER_HEIGHT + 0.62; alertSp.visible = false; alertSp.renderOrder = 10; group.add(alertSp); }
    const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff1d0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); lamp.scale.set(0.55, 0.55, 1); lamp.visible = false; group.add(lamp);
    group.visible = false; this.scene.add(group);
    av.group.traverse((o) => { if (o.isMesh) o.castShadow = !info?.npc; });   // zumbis NPC não projetam sombra (dezenas de corpos × sombra = o que mais pesava)
    if (info?.ztype && ZT[info.ztype]) { const T = ZT[info.ztype]; group.scale.set(T.b, T.h, T.b); }   // brutamontes e tanques são maiores
    const e = { dinoSig: info?.dino ?? null, tankSig: info?.tank ?? null, lookSig: info?.look?.special ?? null, zombie: !!info?.zombie, id, group, av, sprite, lamp, light: false, pitch: 0, buf: [], wIdx: -2, weapon: null, bar, alertSp, npc: !!info?.npc && !info.companion, hpMax: 1, ztype0: info?.npc && info.ztype && !info.zalien && !info.fauna ? info.ztype : null, aggro: false, barCv: cv, barTex: tex, lastHp: -1, vis: false, outline: null, lastShot: -9, alive: true };
    this.entities.set(id, e); return e;
  }
  get entityList() { return [...this.entities.values()]; }

  setWeapon(e, idx) {
    if (e.wIdx === idx && e.side === this.handSide) return;
    e.wIdx = idx; e.side = this.handSide;
    const id = ITEM_IDS[idx];
    const info = this.roster.get(e.id);
    try { e.av.hold(id, info?.att?.[id] || {}, this.handSide, info?.skin?.[id]); } catch (err) { console.error('[arma remota]', err.message); }
    e.weapon = e.av.weapon;
    if (e.drawn) { if (!e.av.onInspectSfx) e.av.onInspectSfx = (nm) => { try { audio.inspect(nm, e.group.position); } catch { /* sem som */ } }; try { e.av.draw?.(); } catch { /* sem animação */ } } e.drawn = true;   // SACAR: troca de arma de outro jogador (a 1ª arma, ao entrar, não anima)
    e.outlineDirty = true;   // só os contornos da arma nova serão criados (os do corpo são reaproveitados)
  }
  shot(id) { const e = this.entities.get(id); if (e) e.lastShot = performance.now(); }

  // jogador local (3ª pessoa): posição direta, sem interpolação
  poseSelf(id, pose, idx, vel, pitch, aiming, dt, extra = {}) {
    const e = this.entities.get(id) || this.create(id); if (e.replay) return e;   // durante o replay da morte quem manda na pose é o replay
    if (extra.dead && !e.rd) { e.group.position.set(pose.x, pose.y, pose.z); e.group.rotation.y = pose.yaw; this.startRag(e, vel.x, vel.z); } else if (!extra.dead && e.rd) this.endRag(e);
    if (e.rd) e.rd.step(dt); else { e.group.position.set(pose.x, pose.y, pose.z); e.group.rotation.y = pose.yaw; }
    this.setWeapon(e, idx);
    const fx = -Math.sin(pose.yaw), fz = -Math.cos(pose.yaw), chute = !!(e.fl & 256), spd = chute ? 0 : Math.hypot(vel.x, vel.z);   // de paraquedas: pernas paradas (só mexem quando pisa no chão)
    e.av.update(dt, { spd, sgn: vel.x * fx + vel.z * fz >= -0.2 ? 1 : -1, pitch, air: !chute && !pose.onGround, crouch: pose.crouch, aiming, sliding: !!pose.sliding, reload: extra.reload || 0, run: !!extra.run });
    e.av.setDead(!!extra.dead);
    return e;
  }

  remove(id, e = this.entities.get(id)) {
    if (!e) return;
    this.scene.remove(e.group); e.lamp?.material.dispose(); e.sprite?.material.map.dispose(); e.sprite?.material.dispose(); e.barTex.dispose(); e.bar.material.dispose();
    if (e.npc && e.ztype0 && this.zpool.length < 40 && !this.disposed) { try { const av = e.av; av.group.removeFromParent(); av.setDead(false); av.fall = 0; if (av._lod) for (const p of av._lod) p.o.visible = p.v0; av.group.position.set(0, 0, 0); av.group.rotation.set(0, 0, 0); this.zpool.push({ type: e.ztype0, av }); } catch { try { e.av.dispose(); } catch { /* ok */ } } }
    else { try { e.av.dispose(); } catch { /* ok */ } }
    this.entities.delete(id);
  }

  onSnap(players, now) {
    if (this._la) { const d = Math.min(500, now - this._la); this._ia = this._ia === undefined ? d : this._ia * 0.9 + d * 0.1; this._jit = (this._jit || 0) * 0.9 + Math.abs(d - this._ia) * 0.1;
      const want = Math.max(INTERP_DELAY_MS, Math.min(INTERP_MAX_MS, this._ia * 1.5 + this._jit * 3)), cur = this.delay ?? INTERP_DELAY_MS; this.delay = cur + (want - cur) * (want > cur ? 0.15 : 0.01); }
    this._la = now;
    for (const p of players) {
      const id = p[0];
      if (id === this.selfId || !this.roster.has(id)) continue;
      let e = this.entities.get(id); if (!e) { if (now - (this._lastCreate || 0) < 160) continue; this._lastCreate = now; e = this.create(id); }   // no máximo 1 personagem novo a cada ~160 ms: nada de travadinha quando a horda aparece
      e.buf.push({ t: now, x: p[1], y: p[2], z: p[3], yaw: p[4], pitch: p[5], flags: p[6], vx: p[7], vz: p[9], ay: p[12] });
      if (e.buf.length > 20) e.buf.shift();
      this.setWeapon(e, p[11] ?? -1); e.hp = p[10]; e.alive = !!(p[6] & 8); e.fl = p[6]; e.light = !!(p[6] & 32); e.lampC = (p[6] >> 12) & 7; if (e.lampC !== e._lc) { e._lc = e.lampC; e.lamp.material.color.setHex(lampHex(e.lampC)); } e.aggro = !!(p[6] & 128); if (e.npc && p[10] > e.hpMax) e.hpMax = p[10];
    }
  }

  update(now, dt = 0.016) {
    const rt = now - (this.delay ?? INTERP_DELAY_MS);
    for (const e of this.entities.values()) {
      if (e.replay) { const s = sampleReplay(e.replay.list, e.replay.t()); if (s) { if (e.rd) this.endRag(e); e.deadAt = 0; if (!e.av.isTank) this.setWeapon(e, s.w ?? -1); e.alive = true; e.av.setDead(false); e.group.visible = true; e.group.position.set(s.x, s.y, s.z); const bodyY = (e.av.isTank || e.av.cr) ? s.hy : s.yaw; e.group.rotation.set(0, bodyY, 0); e.pitch = s.pitch; if (e.av.isTank) e.av.setTurret(s.yaw, s.pitch, s.hy); if (e.av.setUpright) e.av.setUpright(false, dt);   /* corpo de pé e na direção certa: encerra o corpo de pano (antes o personagem ficava torto/de lado), o casco/bicho usa a direção do corpo e a torre a da mira */ e.lamp.visible = false; const fx = -Math.sin(s.yaw), fz = -Math.cos(s.yaw), spd = Math.hypot(s.vx || 0, s.vz || 0); e.av.update(dt, { spd, sgn: (s.vx || 0) * fx + (s.vz || 0) * fz >= -0.2 ? 1 : -1, pitch: s.pitch, air: !(s.flags & 2), crouch: !!(s.flags & 1), aiming: e.replay.aim, sliding: !!(s.flags & 16), reload: 0, run: false }); } continue; }
      const b = e.buf; if (!b.length) continue;
      while (b.length > 2 && b[1].t <= rt) b.shift();
      let s;
      if (b.length === 1 || rt <= b[0].t) s = b[0]; else if (rt >= b[b.length - 1].t) s = b[b.length - 1];
      else { const a = b[0], c = b[1], k = (rt - a.t) / Math.max(1, c.t - a.t); s = { x: a.x + (c.x - a.x) * k, y: a.y + (c.y - a.y) * k, z: a.z + (c.z - a.z) * k, yaw: lerpAngle(a.yaw, c.yaw, k), pitch: a.pitch + (c.pitch - a.pitch) * k, ay: a.ay != null && c.ay != null ? lerpAngle(a.ay, c.ay, k) : c.ay, flags: c.flags, vx: c.vx, vz: c.vz }; }
      if (e.alive === false) { if (!e.deadAt) { e.deadAt = now; try { this.onDeath?.(e); } catch { /* sem som */ } e.group.position.set(s.x, s.y, s.z); e.group.rotation.y = s.yaw; this.startRag(e, s.vx, s.vz); } e.av.setDead(true); e.group.visible = now - e.deadAt < 9000; } else { e.deadAt = 0; if (e.rd) this.endRag(e); e.av.setDead(false); e.group.visible = !(e.fl & 2048); }
      if (e.rd) e.rd.step(dt); else { e.group.position.set(s.x, s.y, s.z); e.group.rotation.y = s.yaw; } e.pitch = s.pitch; if (e.av.isTank) e.av.setTurret(s.ay ?? s.yaw, s.pitch, s.yaw); if (e.av.setUpright) e.av.setUpright(!!(s.flags & 65536), dt);   /* tanque: torre e cano atualizam sempre (a animação por distância só vale para as esteiras) */
      if (e.av.isTank && e.id !== this.selfId) e.av.setLights?.(e.light && e.alive !== false);   // tanque: a lanterna (L) liga os faróis do casco
      e.lamp.visible = e.light && e.alive !== false && !e.av.isTank; if (e.lamp.visible) { const cp = Math.cos(s.pitch); e.lamp.position.set(0, PLAYER_HEIGHT * 0.9, 0).add(new THREE.Vector3(-Math.sin(s.yaw) * cp, Math.sin(s.pitch), -Math.cos(s.yaw) * cp).multiplyScalar(0.3)); e.lamp.position.x -= 0; }
      const fx = -Math.sin(s.yaw), fz = -Math.cos(s.yaw), chute = !!(e.fl & 256), spd = chute ? 0 : Math.hypot(s.vx || 0, s.vz || 0);   // de paraquedas: pernas paradas
      let ddt = dt; { const cp = this._cp, d2 = cp ? (cp.x - s.x) ** 2 + (cp.z - s.z) ** 2 : 0;   // ANIMAÇÃO POR DISTÂNCIA: longe quase não se vê o esqueleto mexer — perto 100%, médio a cada 3 quadros, muito longe congela
        if (d2 > 150 * 150) continue; if (d2 > 25 * 25) { const div = d2 > 50 * 50 ? 4 : 2; e._ad = (e._ad || 0) + dt; if ((e._af = ((e._af || 0) + 1) % div) !== 0) continue; ddt = e._ad; e._ad = 0; } }   // animação por distância: >25 m a cada 2 quadros, >50 m a cada 4
      e.av.update(ddt, { spd, sgn: (s.vx || 0) * fx + (s.vz || 0) * fz >= -0.2 ? 1 : -1, pitch: s.pitch, air: !chute && !(s.flags & 2), crouch: !!(s.flags & 1), aiming: now - e.lastShot < 1500, sliding: !!(s.flags & 16), reload: e.rl ? Math.max(0, 1 - (performance.now() - e.rl.t0) / e.rl.tot) : 0, run: spd > 5.4 && now - e.lastShot > 600 });
    }
  }

  ensureOutline(e) {
    if (e.outline && !e.outlineDirty) return;
    const attached = (o) => { for (let p = o; p; p = p.parent) if (p === e.group) return true; return false; };
    e.outline = (e.outline || []).filter(attached);                     // descarta contornos de armas que já saíram da mão
    const meshes = []; e.av.group.traverse((o) => { if (o.isMesh && !o.userData.isOutline && !o.userData.hasOutline) meshes.push(o); });
    for (const m of meshes) { const o = new THREE.Mesh(m.geometry, outlineMat); o.userData.isOutline = true; o.position.copy(m.position); o.quaternion.copy(m.quaternion); o.scale.copy(m.scale).multiplyScalar(1.06); o.visible = false; m.parent.add(o); m.userData.hasOutline = true; e.outline.push(o); }
    e.outlineDirty = false;
  }

  // Visibilidade REAL (sem wallhack): contorno/vida só de inimigos no campo de visão e SEM parede no meio.
  // nível 1 = contorno + vida · nível 2 = só vida · nível 3 = nada.
  updateVision(camera, collider, level, teams, selfTeam, frame, diff = 1) {
    const ray = this._ray || (this._ray = new THREE.Ray()), fr = this._fr || (this._fr = new THREE.Frustum()), m4 = this._m4 || (this._m4 = new THREE.Matrix4()), sph = this._sph || (this._sph = new THREE.Sphere(new THREE.Vector3(), 1.1)), tv = this._tv || (this._tv = new THREE.Vector3()), dv = this._dv || (this._dv = new THREE.Vector3());
    this._cp = camera.position; m4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); fr.setFromProjectionMatrix(m4);
    for (const [id, e] of this.entities) {
      if (id === this.selfId) continue;
      if (e.npc) {                                                                  // ZUMBIS: vida sobre a cabeça só no Fácil/Normal (sempre, sem depender de linha de visão) · "!" quando em aggro
        { const p = e.group.position, dd = camera.position.distanceToSquared(p), Z = ZLOD[this.zq ?? 1]; if (e.alive !== false) { let v = dd < Z[3]; if (v && dd > 625) { sph.center.set(p.x, p.y + 1, p.z); sph.radius = 2 + Math.sqrt(dd) * 0.07; v = fr.intersectsSphere(sph); sph.radius = 1.1; } e.group.visible = v; } setLod(e, dd > Z[2] ? 3 : dd > Z[1] ? 2 : dd > Z[0] ? 1 : 0); }   // zumbi longe demais nem é desenhado
        const alive = e.alive !== false && e.group.visible, near = camera.position.distanceToSquared(e.group.position) < 55 * 55;
        e.bar.visible = alive && diff <= 1 && near && !this.huntMode; if (e.alertSp) e.alertSp.visible = alive && !!e.aggro && near && !this.huntMode;   /* Caçada: bicho do mapa não tem barra de vida nem '!' (senão entregaria quem é jogador) */
        if (e.bar.visible && e.lastHp !== e.hp) { e.lastHp = e.hp; drawDonut(e.barCv, Math.max(0, Math.min(1, (e.hp ?? 1) / Math.max(1, e.hpMax)))); e.barTex.needsUpdate = true; }
        e.vis = false; if (e.outline) e.outline.forEach((o) => { o.visible = false; }); continue;
      }
      const info = this.roster.get(id), enemy = !info?.companion && !this.huntAllies?.has(id) && !(teams && info?.team && info.team === selfTeam) && !(info?.squad && info.squad === this.roster.get(this.selfId)?.squad), alive = e.alive !== false && e.group.visible, show = enemy && alive && level === 2;
      // NOME E VIDA (configuração da sala): 2 = todos veem nome e vida de todos · 4 = só aliados · 3 = ninguém (aliados continuam com o nome)
      if (!e.sprite && info?.username && (!enemy || level === 2)) { e.nameCol = enemy ? null : ALLY_COL; e.sprite = nameSprite(info.username, enemy ? '#ff4a3d' : e.nameCol, enemy); e.sprite.position.y = labelH(info) + ((info?.dino || info?.tank) ? 1.0 : 0.68); if (info?.dino || info?.tank) e.sprite.scale.multiplyScalar(1.6); e.group.add(e.sprite); }
      if (e.sprite) e.sprite.visible = enemy ? (show && !!e.vis) : alive;
      if (!enemy) { const nearA = alive && level !== 3 && camera.position.distanceToSquared(e.group.position) < 60 * 60; e.bar.visible = nearA; if (nearA && e.lastHp !== e.hp) { e.lastHp = e.hp; drawDonut(e.barCv, Math.max(0, Math.min(1, (e.hp ?? 100) / (info?.companion ? 280 : 100))), e.nameCol || e.sprite?.userData?.col); e.barTex.needsUpdate = true; } continue; }   // ALIADO: nome (sempre) + vida (níveis 2 e 4)
      const seeBar = this.huntMode && ((this.huntRole === 'hunter' && info?.hrole === 'monster') || (this.huntRole === 'monster' && info?.hrole === 'hunter'));   /* Caçada: o caçador vê a VIDA dos monstros e os monstros veem a do caçador (para saber o dano que estão causando) */
      if (!show || (this.hideNames && !seeBar)) { e.bar.visible = false; e.vis = false; if (e.sprite) e.sprite.visible = false; continue; }
      if (frame % 3 === ((id % 3) + 3) % 3) {   /* id de bot é NEGATIVO: sem o ajuste só 1 em cada 3 bots atualizava nome e vida */
        const p = e.group.position; sph.center.set(p.x, p.y + 0.8, p.z);
        let vis = fr.intersectsSphere(sph);
        if (vis) { vis = false; const lh = labelH(info), hs = (info?.dino || info?.tank) ? [lh * 0.95, lh * 0.6, lh * 0.3] : [1.35, 0.8, 0.3]; for (const h of hs) { tv.set(p.x, p.y + h, p.z); dv.subVectors(tv, camera.position); const len = dv.length(); dv.normalize(); ray.origin.copy(camera.position); ray.direction.copy(dv); if (!collider.bvh.raycastFirst(ray, THREE.DoubleSide, 0, len - 0.25)) { vis = true; break; } } }
        e.vis = vis;
      }
      if (e.outline) e.outline.forEach((o) => { o.visible = false; });
      e.bar.visible = e.vis;
      if (e.vis && e.lastHp !== e.hp) { e.lastHp = e.hp; const f = Math.max(0, Math.min(1, (e.hp ?? 100) / 100)); drawDonut(e.barCv, f); e.barTex.needsUpdate = true; }
    }
  }

  dispose() { this.disposed = true; for (const [id, e] of [...this.entities]) this.remove(id, e); for (const p of this.zpool) { try { p.av.dispose(); } catch { /* ok */ } } this.zpool = []; }
}
