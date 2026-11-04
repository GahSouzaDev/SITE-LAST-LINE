import { FAUNA } from './fauna.js';
// DINOSSAURO × DINOSSAURO (PvP): cada espécie tem 30 PONTOS divididos em VIDA, VELOCIDADE e DANO (10/10/10 = o equilíbrio). A diferença entre elas é SUTIL:
// cada ponto a mais vale +step% (padrão 3%) naquele atributo; os pontos que sobem em um atributo saem de outro, então nenhuma espécie é melhor que as outras, só diferente.
// Os números base e o step vêm do admin (Jogo › Dinossauro × Dinossauro) e ficam em DINO_CFG (o servidor atualiza em gamecfg.apply).
export const DINO_CFG = { hp: 200, speed: 11, fast: 30, strong: 90, step: 3 };   // vida 200 (o DOBRO do jogador) · mordida rápida 30 · forte 90 (por mordida, na vida do alvo)   // speed = m/s CORRENDO (jogador a pé corre a 6,8)
export const DINO_PTS = {
  trex: { hp: 11, spd: 8, dmg: 11 }, raptor: { hp: 8, spd: 12, dmg: 10 }, dilo: { hp: 9, spd: 10, dmg: 11 }, carno: { hp: 11, spd: 9, dmg: 10 },
  spino: { hp: 10, spd: 9, dmg: 11 }, teri: { hp: 12, spd: 8, dmg: 10 }, pachy: { hp: 11, spd: 10, dmg: 9 }, ovi: { hp: 8, spd: 11, dmg: 11 }
};
export const DINO_IDS = Object.keys(DINO_PTS);
export const MONSTER_PTS = { mapinguari: { hp: 14, spd: 7, dmg: 12 }, mula: { hp: 9, spd: 14, dmg: 10 } };   // monstros da Caçada: não entram na escolha do PvP
const RUN = 4.05;   // andar do jogador (walkSpeed): o dinossauro SEMPRE anda na velocidade dele, sem precisar correr   // runSpeed do jogador (shared/balance.js): o speedMul do corpo = velocidade / RUN
export const DINO_TIMING = { fastMs: [240, 200], strongMs: [360, 260], fastCd: 560, strongCd: 1050 };   // [espera até a boca fechar, janela em que o dano pode acontecer] e recarga
export function dinoStats(id, c = DINO_CFG) {
  const p = DINO_PTS[id] || MONSTER_PTS[id] || { hp: 10, spd: 10, dmg: 10 }, k = (n) => 1 + (c.step / 100) * (n - 10);
  const speed = +(c.speed * k(p.spd)).toFixed(2);
  return { id, pts: p, hp: Math.round(c.hp * k(p.hp)), speed, speedMul: +(speed / RUN).toFixed(3), fast: Math.round(c.fast * k(p.dmg)), strong: Math.round(c.strong * k(p.dmg)), ...DINO_TIMING };
}
// todas as espécies ficam do MESMO tamanho (altura ≈ 2,5 m): tamanho de corpo não pode ser vantagem
export const dinoScale = (id) => { const h = FAUNA[id]?.hit?.h || 2.5; return +Math.max(0.7, Math.min(1.6, 2.5 / h)).toFixed(3); };
export const dinoName = (id) => FAUNA[id]?.name || id;
