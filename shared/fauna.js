// FAUNA DA ZONA UMBRA: 8 dinossauros (bípedes) e 8 mamíferos pré-históricos (TODOS quadrúpedes). Dados usados pelo modelo (client/js/creatures/creatureRig.js) e, depois, pela IA no servidor.
// Medidas em metros (o jogador tem 1,8 m). Z+ = frente do animal. Os números de jogo (vida, dano, audição, visão) já seguem as regras combinadas:
//  · DINOSSAUROS: vida mínima 2× a do jogador (100), dano baixo (a partir de ~um soco) para dar chance de correr e atirar, OUVEM tiros como os zumbis e enxergam mais longe.
//  · MAMÍFEROS: NÃO MORREM; têm mais medo de você do que você deles. "agressivo" ataca quem chega perto, mas foge quando levam tiro; "arisco" ouve tiros e foge para o lado OPOSTO; "manso" só se afasta.
export const FAUNA_KINDS = { dino: 'Dinossauro', mamifero: 'Mamífero pré-histórico', monstro: 'Monstro do folclore' };
// rig 'biped' = duas pernas, cauda de equilíbrio e braços; rig 'quad' = quatro patas.
// biped: legL = altura do quadril, bodyL/bodyH = tronco, neckL/headL, tailL, armL (braço), w = largura do corpo
// quad:  legL = comprimento da pata, bodyL/bodyH/bodyW = tronco, neckL/headL, tailL
export const DINOS = {
  trex:   { id: 'trex',   name: 'Tiranossauro', kind: 'dino', rig: 'biped', temper: 'agressivo', colors: { sk: '#5f7a3a', bl: '#cdbb82', ac: '#26361a' }, legL: 2.5, bodyL: 4.2, bodyH: 2.0, w: 1.5, neckL: 1.3, headL: 1.7, tailL: 4.4, armL: 0.7, armK: 0.55,
    hp: 650, walk: 2.6, run: 7.5, dmg: 18, reach: 3.4, cd: 2.4, hear: 90, sight: 110, atk: ['bite'], hit: { r: 1.4, h: 3.8 } },
  raptor: { id: 'raptor', name: 'Velociraptor', kind: 'dino', rig: 'biped', temper: 'agressivo', colors: { sk: '#c9772a', bl: '#f0dcae', ac: '#1d1a16' }, legL: 1.0, bodyL: 1.6, bodyH: 0.62, w: 0.5, neckL: 0.55, headL: 0.62, tailL: 1.9, armL: 0.55, armK: 0.9,
    hp: 220, walk: 3.2, run: 9.5, dmg: 8, reach: 1.7, cd: 1.3, hear: 70, sight: 95, atk: ['bite', 'claw'], hit: { r: 0.55, h: 1.5 } },
  dilo:   { id: 'dilo',   name: 'Dilofossauro', kind: 'dino', rig: 'biped', temper: 'agressivo', colors: { sk: '#3f9a6a', bl: '#d9e8b0', ac: '#d9302a' }, legL: 1.2, bodyL: 1.9, bodyH: 0.7, w: 0.55, neckL: 0.75, headL: 0.7, tailL: 2.2, armL: 0.55, armK: 0.8,
    hp: 240, walk: 3, run: 8.5, dmg: 8, reach: 1.9, cd: 1.5, hear: 70, sight: 95, atk: ['bite'], hit: { r: 0.6, h: 1.9 }, frill: true },
  carno:  { id: 'carno',  name: 'Carnotauro', kind: 'dino', rig: 'biped', temper: 'agressivo', colors: { sk: '#a8321f', bl: '#e0b98a', ac: '#1a1a1a' }, legL: 2.0, bodyL: 3.4, bodyH: 1.7, w: 1.2, neckL: 1.0, headL: 1.3, tailL: 3.4, armL: 0.5, armK: 0.25,
    hp: 420, walk: 2.8, run: 8, dmg: 14, reach: 2.8, cd: 2.1, hear: 85, sight: 105, atk: ['bite'], hit: { r: 1.1, h: 3.1 } },
  spino:  { id: 'spino',  name: 'Espinossauro', kind: 'dino', rig: 'biped', temper: 'agressivo', colors: { sk: '#2f6f8a', bl: '#cfe0c0', ac: '#e07a1f' }, legL: 2.2, bodyL: 4.6, bodyH: 1.7, w: 1.1, neckL: 1.5, headL: 1.9, tailL: 5.0, armL: 1.1, armK: 0.9,
    hp: 520, walk: 2.5, run: 7, dmg: 15, reach: 3.2, cd: 2.3, hear: 85, sight: 105, atk: ['bite', 'claw'], hit: { r: 1.2, h: 3.6 }, sail: true },
  teri:   { id: 'teri',   name: 'Terizinossauro', kind: 'dino', rig: 'biped', temper: 'agressivo', colors: { sk: '#8a6a4a', bl: '#d9c9a0', ac: '#3a2a1a' }, legL: 1.9, bodyL: 3.0, bodyH: 1.9, w: 1.4, neckL: 2.3, headL: 0.8, tailL: 1.8, armL: 1.5, armK: 1.4,
    hp: 380, walk: 2.4, run: 6.5, dmg: 12, reach: 3.0, cd: 2.2, hear: 75, sight: 100, atk: ['claw'], hit: { r: 1.2, h: 4.2 } },
  pachy:  { id: 'pachy',  name: 'Paquicefalossauro', kind: 'dino', rig: 'biped', temper: 'agressivo', colors: { sk: '#7a5a8a', bl: '#d9c0a0', ac: '#2a1a30' }, legL: 1.1, bodyL: 1.9, bodyH: 0.9, w: 0.75, neckL: 0.5, headL: 0.55, tailL: 1.8, armL: 0.5, armK: 0.55,
    hp: 360, walk: 2.8, run: 7.5, dmg: 12, reach: 1.8, cd: 2.0, hear: 70, sight: 90, atk: ['headbutt'], hit: { r: 0.8, h: 1.8 } },
  ovi:    { id: 'ovi',    name: 'Oviraptor', kind: 'dino', rig: 'biped', temper: 'agressivo', colors: { sk: '#e0902a', bl: '#fff0d0', ac: '#12b8b0' }, legL: 1.1, bodyL: 1.5, bodyH: 0.62, w: 0.5, neckL: 0.7, headL: 0.5, tailL: 1.5, armL: 0.7, armK: 0.8,
    hp: 200, walk: 3.4, run: 9, dmg: 7, reach: 1.6, cd: 1.2, hear: 70, sight: 95, atk: ['bite'], hit: { r: 0.5, h: 1.9 } }
};
export const MAMMALS = {
  mamute: { id: 'mamute', name: 'Mamute-Lanoso', kind: 'mamifero', rig: 'quad', temper: 'agressivo', colors: { sk: '#6b4a2e', bl: '#9a7a52', ac: '#e8dec0' }, legL: 2.0, bodyL: 4.0, bodyH: 2.1, bodyW: 1.9, neckL: 0.9, headL: 1.5, tailL: 0.9,
    walk: 2.2, run: 6.5, dmg: 10, reach: 3.0, cd: 2.6, hear: 55, sight: 60, flee: 38, atk: ['gore'], hit: { r: 1.6, h: 3.6 } },
  smilo:  { id: 'smilo',  name: 'Tigre-Dente-de-Sabre', kind: 'mamifero', rig: 'quad', temper: 'agressivo', colors: { sk: '#c99a52', bl: '#efe0b8', ac: '#3a2412' }, legL: 0.85, bodyL: 1.9, bodyH: 0.8, bodyW: 0.75, neckL: 0.5, headL: 0.6, tailL: 0.7,
    walk: 3.2, run: 11, dmg: 10, reach: 1.9, cd: 1.6, hear: 60, sight: 70, flee: 30, atk: ['pounce', 'bite'], hit: { r: 0.6, h: 1.3 } },
  pregui: { id: 'pregui', name: 'Preguiça-Gigante', kind: 'mamifero', rig: 'quad', temper: 'manso', colors: { sk: '#6a5a3a', bl: '#9a8a5a', ac: '#e8dcc0' }, legL: 1.3, bodyL: 2.8, bodyH: 1.6, bodyW: 1.4, neckL: 0.6, headL: 0.7, tailL: 1.6,
    walk: 1.6, run: 5, dmg: 8, reach: 2.4, cd: 2.4, hear: 45, sight: 45, flee: 24, atk: ['swat'], hit: { r: 1.1, h: 2.2 } },
  glipto: { id: 'glipto', name: 'Gliptodonte Blindado', kind: 'mamifero', rig: 'quad', temper: 'arisco', colors: { sk: '#6a6a58', bl: '#b0a27a', ac: '#3a3a30' }, legL: 0.6, bodyL: 2.6, bodyH: 1.5, bodyW: 1.8, neckL: 0.3, headL: 0.5, tailL: 1.9,
    walk: 1.8, run: 5.5, dmg: 0, reach: 0, cd: 3, hear: 60, sight: 55, flee: 30, atk: [], hit: { r: 1.3, h: 1.7 } },
  elasmo: { id: 'elasmo', name: 'Elasmotério', kind: 'mamifero', rig: 'quad', temper: 'agressivo', colors: { sk: '#7a6a5a', bl: '#a89a88', ac: '#efe6d0' }, legL: 1.5, bodyL: 3.4, bodyH: 1.7, bodyW: 1.5, neckL: 0.8, headL: 1.2, tailL: 0.9,
    walk: 2.4, run: 8, dmg: 12, reach: 2.6, cd: 2.4, hear: 55, sight: 55, flee: 32, atk: ['gore'], hit: { r: 1.3, h: 2.7 } },
  mega:   { id: 'mega',   name: 'Megalóceros', kind: 'mamifero', rig: 'quad', temper: 'arisco', colors: { sk: '#8a5a32', bl: '#e8d8b8', ac: '#d9ceb0' }, legL: 1.5, bodyL: 2.3, bodyH: 0.95, bodyW: 0.8, neckL: 1.0, headL: 0.7, tailL: 0.3,
    walk: 3.0, run: 12, dmg: 0, reach: 0, cd: 3, hear: 80, sight: 90, flee: 50, atk: [], hit: { r: 0.7, h: 2.9 } },
  gigan:  { id: 'gigan',  name: 'Gigantopiteco', kind: 'mamifero', rig: 'quad', temper: 'agressivo', colors: { sk: '#a8581f', bl: '#2a2018', ac: '#2a2018' }, legL: 1.5, bodyL: 1.9, bodyH: 1.5, bodyW: 1.4, neckL: 0.4, headL: 0.7, tailL: 0,
    walk: 2.4, run: 8, dmg: 10, reach: 2.4, cd: 2.0, hear: 60, sight: 65, flee: 30, atk: ['swat', 'bite'], hit: { r: 1.0, h: 2.6 } },
  macro:  { id: 'macro',  name: 'Macrauquênia', kind: 'mamifero', rig: 'quad', temper: 'arisco', colors: { sk: '#b08a5a', bl: '#e8d8b0', ac: '#5a4028' }, legL: 1.3, bodyL: 2.0, bodyH: 0.9, bodyW: 0.75, neckL: 1.3, headL: 0.6, tailL: 0.5,
    walk: 2.8, run: 10.5, dmg: 0, reach: 0, cd: 3, hear: 85, sight: 90, flee: 48, atk: [], hit: { r: 0.7, h: 2.8 } }
};
// MONSTROS DO FOLCLORE (terror): lendas brasileiras que a floresta da Zona UMBRA despertou. Morrem como os dinossauros e cada um tem um PODER (server/rooms/fauna.js › poderes).
export const MONSTROS = {
  mapinguari: { id: 'mapinguari', name: 'Mapinguari', kind: 'monstro', rig: 'biped', temper: 'agressivo', colors: { sk: '#7b3a24', bl: '#b9805a', ac: '#2e140c' }, legL: 1.7, bodyL: 2.4, bodyH: 2.4, w: 1.7, neckL: 0.5, headL: 0.8, tailL: 0.5, armL: 2.3, armK: 1.2,
    hp: 900, walk: 2.4, run: 6.6, dmg: 22, reach: 3.6, cd: 2.3, hear: 100, sight: 95, atk: ['claw', 'bite'], hit: { r: 1.5, h: 3.6 }, power: 'fedor' },
  mula: { id: 'mula', name: 'Mula sem Cabeça', kind: 'monstro', rig: 'quad', temper: 'agressivo', colors: { sk: '#2e2420', bl: '#5a4639', ac: '#ff7a1a' }, legL: 1.55, bodyL: 2.4, bodyH: 1.05, bodyW: 0.9, neckL: 1.0, headL: 0.2, tailL: 1.7,
    hp: 620, walk: 3.4, run: 12.5, dmg: 19, reach: 2.6, cd: 1.7, hear: 90, sight: 85, atk: ['pounce', 'swat'], hit: { r: 0.9, h: 2.7 }, power: 'fogo' }
};
export const FAUNA = { ...DINOS, ...MAMMALS, ...MONSTROS };
export const hunts = (sp) => sp?.kind === 'dino' || sp?.kind === 'monstro';   // quem caça (dinossauros e monstros) × quem foge (mamíferos)
export const FAUNA_IDS = Object.keys(FAUNA);
export const isDino = (id) => FAUNA[id]?.kind === 'dino';
export const isMammal = (id) => FAUNA[id]?.kind === 'mamifero';
// animações que o modelo sabe tocar (nomes usados pelo servidor/cliente)
export const FAUNA_ANIMS = ['idle', 'walk', 'run', 'attack', 'hurt', 'roar', 'die'];
// estados de ânimo: calmo, alerta (levanta a cabeça), fugindo (corpo baixo, cauda para cima)
export const FAUNA_MOODS = ['calm', 'alert', 'flee'];
// ZONAS DO MAPA e PLANOS DE NASCIMENTO da fauna (a quantidade pode ser ajustada no admin: Jogo › Fauna; os pontos de nascer, em Spawns › História).
// kind: 'mam' ou 'dino' · ids: espécies sorteadas · n: quantos · zone: onde (forest | pens | village | city | strip)
import { WORLD, CITY, ZONES } from './zonaumbraData.js';
export const FAUNA_ZONES = {
  any: () => true,   // Survival com dinossauro em qualquer mapa: em todo lugar (longe de quem joga)
  forest: (x, z) => x > WORLD.x0 + 140 && x < WORLD.x1 - 140 && z > WORLD.z0 + 140 && z < WORLD.z1 - 140 && !(x > CITY.x0 - 30 && x < CITY.x1 + 30 && z > CITY.z0 - 30 && z < CITY.z1 + 30) && !(x > ZONES.pens.x0 - 20 && x < ZONES.pens.x1 + 20 && z > ZONES.pens.z0 - 20 && z < ZONES.pens.z1 + 20),
  pens: (x, z) => x > ZONES.pens.x0 + 10 && x < ZONES.pens.x1 - 10 && z > ZONES.pens.z0 + 10 && z < ZONES.pens.z1 - 10,
  village: (x, z) => Math.hypot(x - ZONES.village.cx, z - ZONES.village.cz) < ZONES.village.r + 110 && Math.hypot(x - ZONES.village.cx, z - ZONES.village.cz) > 22,
  city: (x, z) => x > CITY.x0 + 30 && x < CITY.x1 - 30 && z > CITY.z0 + 30 && z < CITY.z1 - 30,
  strip: (x, z) => Math.hypot(x - (ZONES.strip.x0 + ZONES.strip.x1) / 2, z - (ZONES.strip.z0 + ZONES.strip.z1) / 2) < 230 && !(x > ZONES.strip.x0 - 60 && x < ZONES.strip.x0 + 60)
};
const MAM_F = ['macro', 'mega', 'pregui', 'glipto'], MAM_R = ['mamute', 'pregui', 'glipto', 'elasmo', 'smilo', 'gigan'], DIN_S = ['raptor', 'dilo', 'ovi'], DIN_M = ['raptor', 'ovi', 'pachy', 'teri', 'dilo'], DIN_B = ['carno', 'spino', 'trex', 'raptor'];
export const FAUNA_PLANS = {
  // quantidades ~60% maiores que a primeira versão (o mapa parecia vazio); ainda ajustável no admin (Jogo › Fauna › quantidade)
  default: [{ kind: 'mam', ids: [...MAM_F, 'mamute', 'gigan'], n: 14, zone: 'forest' }, { kind: 'dino', ids: DIN_M, n: 8, zone: 'forest' }],
  z1: [{ kind: 'mam', ids: MAM_F, n: 12, zone: 'forest' }, { kind: 'dino', ids: DIN_S, n: 6, zone: 'forest' }],
  z2: [{ kind: 'mam', ids: MAM_R, n: 14, zone: 'pens' }],
  z3: [{ kind: 'mam', ids: ['mega', 'macro', 'gigan'], n: 7, zone: 'village' }, { kind: 'dino', ids: DIN_M, n: 9, zone: 'village' }],
  z4: [{ kind: 'dino', ids: ['raptor', 'dilo', 'carno', 'teri'], n: 8, zone: 'city' }],
  z5: [{ kind: 'mam', ids: [...MAM_F, 'mamute'], n: 13, zone: 'strip' }, { kind: 'dino', ids: DIN_B, n: 6, zone: 'strip' }]
};
