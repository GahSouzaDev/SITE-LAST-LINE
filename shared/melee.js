// ARMAS BRANCAS: equilibradas por "dano × velocidade × alcance". Quanto mais forte, mais lenta e mais pesada (menos velocidade de corrida).
// dmg = dano por golpe · cd = intervalo entre golpes (s) · range = alcance (m) · speed = multiplicador de velocidade ao empunhar · lv = nível que libera
export const MELEE = {
  knife:    { id: 'knife',    name: 'LASTLINE Knife',     sub: 'Faca tática',          lv: 1,  dmg: 55, cd: 0.55, range: 2.3, speed: 1.00, desc: 'Equilibrada: rápida, leve e confiável. Mata em 2 golpes.' },
  machete:  { id: 'machete',  name: 'Facão corta-cana',   sub: 'Facão',                lv: 6,  dmg: 62, cd: 0.68, range: 2.4, speed: 0.98, desc: 'Lâmina larga: um pouco mais de dano, golpe um pouco mais lento.' },
  karambit: { id: 'karambit', name: 'Karambit',           sub: 'Faca curva',           lv: 12, dmg: 46, cd: 0.38, range: 2.0, speed: 1.06, desc: 'A mais rápida e leve: corre mais, mas o alcance é curto.' },
  katana:   { id: 'katana',   name: 'Katana',             sub: 'Espada longa',         lv: 20, dmg: 68, cd: 0.80, range: 2.9, speed: 0.97, desc: 'Alcance longo e dano alto, mas a recuperação é lenta.' },
  sword:    { id: 'sword',    name: 'Espada larga',       sub: 'Espada',               lv: 27, dmg: 82, cd: 0.95, range: 2.7, speed: 0.94, desc: 'Pesada: derruba em 2 golpes, mas é lenta de girar.' },
  hammer:   { id: 'hammer',   name: 'Marreta de guerra',  sub: 'Martelo',              lv: 15, dmg: 95, cd: 1.05, range: 2.5, speed: 0.93, desc: 'Cabeça de aço enorme: esmaga em 2 golpes, mas é lenta e cansa.' },
  spear:    { id: 'spear',    name: 'Lança de guerra',    sub: 'Lança',                lv: 24, dmg: 64, cd: 0.85, range: 3.4, speed: 0.97, desc: 'O MAIOR alcance entre as armas brancas: acerte de longe com a estocada.' },
  bat:      { id: 'bat',      name: 'Taco pregado',       sub: 'Taco com pregos',      lv: 30, dmg: 72, cd: 0.7,  range: 2.3, speed: 0.99, desc: 'Madeira, fita e pregos. Brutal, rápido e sem frescura.' },
  plasma:   { id: 'plasma',   name: 'Lâmina de plasma',   sub: 'Espada de energia',    lv: 45, dmg: 78, cd: 0.45, range: 2.6, speed: 1.02, desc: 'Lâmina de energia: corta rápido, leve de empunhar e muito cara em nível.' },
  chainsaw: { id: 'chainsaw', name: 'Motosserra',         sub: 'Motosserra de combate', lv: 55, dmg: 130, cd: 1.4, range: 2.2, speed: 0.85, desc: 'DANO ABSURDO, mas lentíssima e pesada: um golpe derruba, errar custa caro.' },
  axe:      { id: 'axe',      name: 'Machado de batalha', sub: 'Machado',              lv: 33, dmg: 100, cd: 1.15, range: 2.5, speed: 0.92, desc: 'O golpe mais forte do jogo (derruba em 1 golpe pesado + 1) e o mais demorado.' }
};
import { EVT_MELEE } from './arsenalMore.js';
Object.assign(MELEE, EVT_MELEE);   // armas brancas de EVENTO (visíveis para todos, só quem ganha no evento usa)
// ALCANCE REAL: antes era medido do olho até a superfície e passava de 2 m (acertava de longe). Agora ~2/3 disso: só acerta o que a lâmina realmente alcança.
for (const m of Object.values(MELEE)) m.range = Math.round(m.range * 0.68 * 100) / 100;
export const MELEE_IDS = Object.keys(MELEE);
