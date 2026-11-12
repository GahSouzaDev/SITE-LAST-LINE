// Sistema de controles reconfiguráveis: ações -> até 2 entradas (teclado, botão do mouse, rolagem).
// Salvo em localStorage e na conta (servidor). Tudo no jogo consulta AÇÕES, nunca teclas fixas.
export const ACTIONS = [
  { id: 'forward', name: 'Andar para frente', cat: 'Movimento', def: ['KeyW'] },
  { id: 'back', name: 'Andar para trás', cat: 'Movimento', def: ['KeyS'] },
  { id: 'left', name: 'Andar para a esquerda', cat: 'Movimento', def: ['KeyA'] },
  { id: 'right', name: 'Andar para a direita', cat: 'Movimento', def: ['KeyD'] },
  { id: 'run', name: 'Correr', cat: 'Movimento', def: ['ShiftLeft'] },
  { id: 'crouch', name: 'Agachar e andar devagar', cat: 'Movimento', def: ['KeyX'] },
  { id: 'slide', name: 'Deslizar (agacha + impulso, tem recarga) · Presa na Caçada: DISPARADA · câmera livre: descer', cat: 'Movimento', def: ['KeyC'] },
  { id: 'turn', name: 'Girar 180° (olhar para trás)', cat: 'Movimento', def: [] },
  { id: 'jump', name: 'Pular · câmera livre (morto na Caçada): subir', cat: 'Movimento', def: ['Space'] },
  { id: 'camera', name: 'Alternar 1ª / 3ª pessoa (também na Caçada e no Dinossauro)', cat: 'Câmera', def: ['KeyV'] },
  { id: 'fire', name: 'Atirar · Dinossauro/Monstro: mordida rápida · Tanque: canhão · Presa na Caçada: SEGURAR = correr em pé', cat: 'Combate', def: ['Mouse0'] },
  { id: 'aim', name: 'Mirar / golpe pesado (arma branca) · Dinossauro/Monstro: mordida forte · Tanque: SEGURAR para ver a linha de mira', cat: 'Combate', def: ['Mouse2'] },
  { id: 'reload', name: 'Recarregar', cat: 'Combate', def: ['KeyR'] },
  { id: 'mg', name: 'Metralhadora do tanque (Batalha de Tanques; segurar)', cat: 'Combate', def: ['KeyF'] },
  { id: 'melee', name: 'Coronhada / corpo a corpo (clique na rolagem)', cat: 'Combate', def: ['Mouse1'] },
  { id: 'primary', name: 'Primária ↔ Faca (sem tecla; use 1, 2, 3)', cat: 'Armas', def: [] },
  { id: 'secondary', name: 'Troca rápida: primária ↔ secundária ↔ faca (Q) · Presa: olhar em volta · Monstro: grito', cat: 'Armas', def: ['KeyQ'] },
  { id: 'special', name: 'Bomba especial: fumaça / luz / mina (5: vai e volta)', cat: 'Armas', def: ['Digit5'] },
  { id: 'grenade', name: 'Granada (4: vai e volta) · Caçador: rastreador · Presa: sentido', cat: 'Armas', def: ['Digit4'] },
  { id: 'ping', name: 'Marcar ponto para o esquadrão (ping) · Caçador: plantar SENSOR no chão', cat: 'Equipamento', def: ['KeyZ'] },
  { id: 'unstuck', name: 'Estou preso (volta ao último ponto seguro)', cat: 'Equipamento', def: ['KeyU'] },
  { id: 'heal', name: 'Usar cura (Battle Royale)', cat: 'Equipamento', def: ['KeyH'] },
  { id: 'build', name: 'Construir barricada / palete de madeira (gasta 2)', cat: 'Equipamento', def: ['KeyN'] },
  { id: 'drop', name: 'Largar o item da mão (G)', cat: 'Armas', def: ['KeyG'] },
  { id: 'vehicle', name: 'Interagir (T): entrar/sair do carro · reviver aliado · desarmar a bomba', cat: 'Armas', def: ['KeyT'] },
  { id: 'interact', name: 'Pegar item do chão (E) · Presa na Caçada: comer / beber', cat: 'Armas', def: ['KeyE'] },
  { id: 'slot1', name: 'Slot 1 — Primária', cat: 'Armas', def: ['Digit1'] },
  { id: 'slot2', name: 'Slot 2 — Secundária', cat: 'Armas', def: ['Digit2'] },
  { id: 'slot3', name: 'Slot 3 — Faca', cat: 'Armas', def: ['Digit3'] },
  { id: 'slot6', name: 'Slot 6 — Bomba (modo Bomba: quem leva)', cat: 'Armas', def: ['Digit6'] },
  { id: 'next', name: 'Próxima arma (rolagem)', cat: 'Armas', def: ['WheelDown'] },
  { id: 'prev', name: 'Arma anterior (rolagem)', cat: 'Armas', def: ['WheelUp'] },
  { id: 'flashlight', name: 'Lanterna', cat: 'Equipamento', def: ['KeyL'] },
  { id: 'shop', name: 'Loja / Arsenal / Mochila (conforme o modo)', cat: 'Equipamento', def: ['KeyB'] },
  { id: 'scoreboard', name: 'Placar', cat: 'Interface', def: ['Tab'] },
  { id: 'online', name: 'Lista de jogadores online / amigos', cat: 'Interface', def: ['KeyO'] }
];
export const BY_ID = Object.fromEntries(ACTIONS.map((a) => [a.id, a]));
const KEY = 'lastline.keys';
const FIXED = new Set(['Escape']); // ESC é sempre o menu

export function codeLabel(c) {
  if (!c) return '—';
  const map = { Space: 'ESPAÇO', ShiftLeft: 'SHIFT', ShiftRight: 'SHIFT D', ControlLeft: 'CTRL', ControlRight: 'CTRL D', AltLeft: 'ALT', Tab: 'TAB', Enter: 'ENTER', Backquote: '`',
    Mouse0: 'MOUSE ESQ.', Mouse1: 'MOUSE MEIO', Mouse2: 'MOUSE DIR.', Mouse3: 'MOUSE 4', Mouse4: 'MOUSE 5', WheelUp: 'ROLAGEM ↑', WheelDown: 'ROLAGEM ↓',
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', CapsLock: 'CAPS' };
  if (map[c]) return map[c];
  if (c.startsWith('Key')) return c.slice(3);
  if (c.startsWith('Digit')) return c.slice(5);
  if (c.startsWith('Numpad')) return 'NUM ' + c.slice(6);
  return c.toUpperCase();
}

class Controls extends EventTarget {
  constructor() {
    super();
    this.map = {};          // id -> [c1, c2]
    this.down = new Set();  // códigos pressionados agora
    this.byCode = new Map();
    this.enabled = false;   // só captura durante a partida (pointer lock)
    this.typing = false;    // digitando no chat: as teclas do jogo ficam desligadas
    this.virt = new Set();  // ações seguradas por toque/gamepad
    this.load();
  }

  load(extra) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { saved = {}; }
    if (extra && typeof extra === 'object') saved = { ...saved, ...extra };
    if (saved.drop?.[0] === 'KeyT' && saved.interact?.[0] === 'KeyG') { saved.drop = ['KeyG', saved.drop[1] || null]; saved.interact = ['KeyT', saved.interact[1] || null]; }   // migra o padrão antigo (T largar / G pegar)
    try { if (!localStorage.getItem('lastline.pickE')) { localStorage.setItem('lastline.pickE', '1'); if (saved.primary?.[0] === 'KeyE') saved.primary = [null, saved.primary[1] || null]; if (!saved.interact || saved.interact[0] === 'KeyT') saved.interact = ['KeyE', saved.interact?.[1] || null]; } } catch { /* ignora */ }   // E agora pega itens (T e a troca primária↔faca saíram)
    try { if (!localStorage.getItem('lastline.turn15')) { localStorage.setItem('lastline.turn15', '1'); if (saved.turn?.[0] === 'KeyF') saved.turn = [null, saved.turn[1] || null]; } } catch { /* ignora */ }   // build 15: F não vira mais 180° sozinho (era o 'giro aleatório'); quem quiser religa em Configurações
    if (saved.interact?.[0] === 'KeyT') saved.interact = ['KeyE', saved.interact[1] || null];   // T é SÓ do carro (entrar/sair); pegar item é E (configuração antiga/sincronizada da conta deixava o T nos dois)
    if (saved.interact?.[1] === 'KeyT') saved.interact = [saved.interact[0], null];
    for (const a of ACTIONS) if (a.id !== 'interact' && Array.isArray(saved[a.id])) saved[a.id] = saved[a.id].map((k) => (k === 'KeyE' ? null : k));   // E é EXCLUSIVO de pegar item: nenhuma outra ação (troca de arma etc.) pode usar o E, nem por configuração antiga
    this.map = {};
    for (const a of ACTIONS) this.map[a.id] = Array.isArray(saved[a.id]) ? [saved[a.id][0] || null, saved[a.id][1] || null] : [a.def[0] || null, a.def[1] || null];
    this.rebuild();
  }
  rebuild() { this.byCode.clear(); for (const [id, cs] of Object.entries(this.map)) for (const c of cs) if (c) { if (!this.byCode.has(c)) this.byCode.set(c, []); this.byCode.get(c).push(id); } }
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.map)); } catch { /* ignora */ } this.dispatchEvent(new Event('change')); }
  exportMap() { return JSON.parse(JSON.stringify(this.map)); }

  get(id) { return this.map[id] || [null, null]; }
  // NOME DA ENTRADA conforme o aparelho em uso (teclado, gamepad ou celular): é o que as dicas na tela mostram
  hint(id) { try { if (window.__touch && this.touchName) return this.touchName(id) || this.label(id).split(' / ')[0]; if (this.device === 'pad' && this.padName) return this.padName(id) || this.label(id).split(' / ')[0]; } catch { /* usa o teclado */ } return this.label(id).split(' / ')[0]; }
  label(id) { const cs = this.get(id).filter(Boolean); return cs.length ? cs.map(codeLabel).join(' / ') : 'SEM TECLA'; }
  bound(id) { return this.get(id).some(Boolean); }
  isDown(id) { return !this.typing && (this.virt?.has(id) || this.get(id).some((c) => c && this.down.has(c))); }   // virt: botões de toque/gamepad

  // define uma entrada; retorna a ação que perdeu a tecla (conflito) para avisar o jogador
  set(id, slot, code) {
    if (FIXED.has(code)) return { error: 'ESC é reservado para o menu.' };
    let lost = null;
    if (code) for (const [oid, cs] of Object.entries(this.map)) {
      if (oid === id) continue;
      const i = cs.indexOf(code);
      if (i >= 0) { cs[i] = null; lost = oid; }
    }
    this.map[id][slot] = code || null;
    this.rebuild(); this.save();
    return { lost };
  }
  reset(id) { const a = BY_ID[id]; this.map[id] = [a.def[0] || null, a.def[1] || null]; this.rebuild(); this.save(); }
  resetAll() { for (const a of ACTIONS) this.map[a.id] = [a.def[0] || null, a.def[1] || null]; this.rebuild(); this.save(); }

  // ----- entrada bruta -> eventos de ação -----
  attach() {
    if (this.attached) return;
    this.attached = true;
    const fire = (code, down) => {
      const ids = this.byCode.get(code);
      if (!ids) return false;
      for (const id of ids) this.dispatchEvent(new CustomEvent(down ? 'press' : 'release', { detail: id }));
      return true;
    };
    // EM PARTIDA o navegador não pode usar Tab (pular de botão em botão e selecionar tudo, inclusive ao SEGURAR: o evento repetido escapava do filtro) nem Alt sozinho
    // (ativa o menu do navegador e solta o mouse da mira; muita gente usa Alt para falar no Discord). Vale enquanto não se digita (chat/campos).
    const inGame = () => document.body.classList.contains('ingame') && !this.typing;
    const browserKey = (e) => (e.code === 'Tab' || e.code === 'AltLeft' || e.code === 'AltRight') && inGame();
    addEventListener('keydown', (e) => {
      this.device = 'kb';
      if (browserKey(e)) { e.preventDefault(); if (e.code === 'Tab') document.activeElement?.blur?.(); }
      if (!this.enabled || e.repeat || this.typing) return;
      if (this.byCode.has(e.code) && (document.pointerLockElement || window.__touch)) e.preventDefault();
      this.down.add(e.code); fire(e.code, true);
    });
    addEventListener('keyup', (e) => { if (browserKey(e)) e.preventDefault(); this.down.delete(e.code); if (this.enabled) fire(e.code, false); });
    addEventListener('mousedown', (e) => { if (!window.__touch) this.device = 'kb'; if (!this.enabled || this.typing) return; const c = 'Mouse' + e.button; this.down.add(c); if (fire(c, true)) e.preventDefault(); });
    addEventListener('mouseup', (e) => { const c = 'Mouse' + e.button; this.down.delete(c); if (this.enabled) fire(c, false); });
    addEventListener('wheel', (e) => { if (!this.enabled || (!document.pointerLockElement && !window.__touch)) return; const c = e.deltaY > 0 ? 'WheelDown' : 'WheelUp'; if (fire(c, true)) e.preventDefault(); fire(c, false); }, { passive: false });
    addEventListener('blur', () => this.down.clear());
    addEventListener('contextmenu', (e) => { if (this.enabled) e.preventDefault(); });
  }
}
export const controls = new Controls();
controls.attach();
