// SKINS DE ARMA: catálogo do Arsenal do usuário (arsenal.html) + Tempestade, Palhaço e Arco-íris (efeitos próprios). 100% cosméticas.
// Liberam por NÍVEL (comuns cedo, míticas só no 96+) e também podem ser ganhas nas CAIXAS (qualquer raridade, sorteio por peso).
export const RAR = {"com": {"n": "Comum", "c": "#9aa5ae", "w": 45}, "inc": {"n": "Incomum", "c": "#5fd16a", "w": 28}, "rar": {"n": "Rara", "c": "#4aa3ff", "w": 14}, "epi": {"n": "Épica", "c": "#b45cff", "w": 8}, "len": {"n": "Lendária", "c": "#ff9f2e", "w": 4}, "mit": {"n": "Mítica", "c": "#ff2e63", "w": 1.2}};
export const SKIN_PACK = {
  base: { n: "Padrão", r: 'com', sw: '#8a95a0', lv: 1, fx: [] },
  ww2: { n: "2ª Guerra", r: 'com', sw: '#5a6140', lv: 3, fx: [] },
  desert: { n: "Deserto", r: 'com', sw: '#c9ae7c', lv: 5, fx: [] },
  digi: { n: "Camuflagem Digital", r: 'com', sw: '#4b5a3a', lv: 8, fx: [] },
  rust: { n: "Ferrugem", r: 'com', sw: '#9a5a2a', lv: 11, fx: [] },
  carbon: { n: "Fibra de Carbono", r: 'inc', sw: '#2a2d33', lv: 14, fx: [] },
  bronze: { n: "Bronze Antigo", r: 'inc', sw: '#b27a3c', lv: 18, fx: [] },
  chrome: { n: "Cromo Espelho", r: 'inc', sw: '#eef3f8', lv: 22, fx: [] },
  marble: { n: "Mármore Real", r: 'inc', sw: '#e9e6df', lv: 26, fx: [] },
  neon: { n: "Neon", r: 'rar', sw: '#ff3de0', lv: 30, fx: [] },
  obsidian: { n: "Obsidiana", r: 'rar', sw: '#d81f2f', lv: 34, fx: [] },
  ice: { n: "Gelo", r: 'rar', sw: '#8fd0ff', lv: 38, fx: [] },
  lava: { n: "Magma", r: 'rar', sw: '#ff6a1a', lv: 42, fx: ["ember"] },
  sakura: { n: "Sakura", r: 'rar', sw: '#ff9fc4', lv: 46, fx: ["petal"] },
  toxic: { n: "Tóxico", r: 'epi', sw: '#7dff1a', lv: 52, fx: ["bubble"] },
  matrix: { n: "Matrix", r: 'epi', sw: '#00ff66', lv: 58, fx: [] },
  plasma: { n: "Tempestade", r: 'epi', sw: '#ffe14d', lv: 61, fx: [] },
  circuit: { n: "Circuito", r: 'epi', sw: '#00e5ff', lv: 64, fx: [] },
  clown: { n: "Palhaço", r: 'epi', sw: '#ff4fa3', lv: 70, fx: [] },
  gold: { n: "Ouro Maciço", r: 'len', sw: '#f2c14e', lv: 76, fx: ["spark"] },
  inferno: { n: "Inferno", r: 'len', sw: '#ff4a10', lv: 80, fx: ["fire", "ember"] },
  frost: { n: "Geada Eterna", r: 'len', sw: '#aee4ff', lv: 84, fx: ["crystal", "frost", "spark"] },
  volt: { n: "Voltagem", r: 'len', sw: '#ffe34a', lv: 88, fx: ["elec"] },
  laser: { n: "Tubos de Laser", r: 'len', sw: '#00e5ff', lv: 91, fx: ["tube"] },
  rainbow: { n: "Arco-íris", r: 'len', sw: '#ff9a3d', lv: 94, fx: [] },
  dragon: { n: "Dragão Ancestral", r: 'mit', sw: '#e0401c', lv: 96, fx: ["ember", "fire"] },
  galaxy: { n: "Galáxia", r: 'mit', sw: '#9a5cff', lv: 97, fx: ["spark"] },
  void: { n: "Abismo", r: 'mit', sw: '#8a1fff', lv: 99, fx: ["void"] },
  prism: { n: "Prismático", r: 'mit', sw: '#ff5fa0', lv: 100, fx: ["spark"] },
  holo: { n: "Holograma", r: 'mit', sw: '#7fffe8', lv: 100, fx: ["spark"] },
};
// SKINS DE EVENTO MENSAL (shared/events.js): só vêm da missão do mês. Fora das caixas, do loot e do nível.
import { EVENTS } from './events.js';
for (const e of EVENTS) SKIN_PACK[e.id] = { n: e.skin, r: 'mit', sw: e.sw, lv: 9999, fx: ['spark'], evt: true, c1: e.c1, c2: e.c2 };

// SKIN DO KIT DA ESTREIA (shared/premiere.js): amarelo + branco. Só vem do baú da estreia.
// CONJUNTO LEGADO 7 (amarelo, a cor-tema do jogo): vem junto do personagem 'legado7'. Quem tem o personagem pode usar a skin em TODAS as armas, mesmo sem ele equipado; sem o personagem a skin não aparece.
// COMBATENTE 65: vermelho Ferrari para TODAS as armas; só vale para quem tem o croma c65 do Combatente 7 (kitChroma). Combatente 54: azul sólido para todas, junto do personagem (kit).
SKIN_PACK.ferrari65 = { n: 'Ferrari 65', r: 'mit', sw: '#d40000', lv: 9999, fx: ['spark'], evt: true, kitChroma: ['legado7', 'c65'], c1: 0xd40000, c2: 0x15161a };
SKIN_PACK.azul54 = { n: 'Azul 54', r: 'mit', sw: '#1e5ad6', lv: 9999, fx: ['spark'], evt: true, kit: 'c54', c1: 0x1e5ad6, c2: 0x0b1530 };
SKIN_PACK.legado7 = { n: 'Legado 7', r: 'mit', sw: '#ffc400', lv: 9999, fx: ['spark'], evt: true, kit: 'legado7', c1: 0xffc400, c2: 0x15161a };
SKIN_PACK.estreia = { n: 'Estreia LASTLINE', r: 'mit', sw: '#f2c200', lv: 9999, fx: ['spark'], evt: true, prem: true, c1: 0xf2c200, c2: 0xf4f4ee };

// SKINS DE DIA ESPECIAL (shared/dayskins.js): cada uma vale para UMA arma/arma branca (uni). Só vêm de entrar no jogo no dia ou do Mercado.
import { DAY_SKINS } from './dayskins.js';
import { STORE_SKINS } from './storeskins.js';
for (const d of STORE_SKINS) SKIN_PACK[d.id] = { n: d.n, r: 'rar', sw: d.sw, lv: 9999, fx: [], evt: true, day: true, uni: d.t, c1: d.c1, c2: d.c2, store: true };   // skins de loja (Rosa Choque / Fogo): só da loja ou do admin
for (const d of DAY_SKINS) if (d.kind !== 'c') SKIN_PACK[d.id] = { n: d.n, r: 'mit', sw: d.sw, lv: 9999, fx: d.fx || [], evt: true, day: true, uni: d.t, c1: d.c1, c2: d.c2 };
