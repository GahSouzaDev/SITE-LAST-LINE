// BATALHA DE TANQUES (PvP): cada jogador é um tanque. 8 tanques, cada um com 30 PONTOS divididos em CASCO (vida), MOTOR (velocidade e giro) e CANHÃO (dano do tiro).
// 10/10/10 = o equilíbrio; cada ponto a mais vale +step% naquele atributo, e o ponto que sobe em um sai de outro: nenhum tanque é melhor que os outros, só diferente.
// Os números base vêm do admin (Jogo › Batalha de Tanques) e ficam em TANK_CFG (o servidor atualiza em gamecfg.apply).
// O mesmo arquivo roda no cliente e no servidor: o cliente usa para prever o movimento e mostrar recargas; o servidor decide o dano.
export const TANK_CFG = { hp: 500, speed: 8, shell: 150, mg: 28, step: 5, reload: 4000, mgCd: 300, splash: 4.5, range: 260 };   // vida 500 · tiro do canhão 150 (área de 4,5 m) · metralhadora 28 por tiro, 1 tiro a cada 0,3 s · recarga do canhão 4 s
export const TANK_PTS = {
  onca: { hp: 8, spd: 13, dmg: 9 },        // ONÇA: ágil, frágil: foge e contorna
  anta: { hp: 13, spd: 7, dmg: 10 },       // ANTA: pesada, lenta, aguenta muito
  tatu: { hp: 12, spd: 8, dmg: 10 },       // TATU: blindado, bem lento
  gaviao: { hp: 7, spd: 11, dmg: 12 },     // GAVIÃO: rápido e com canhão forte, mas de papel
  jacare: { hp: 10, spd: 10, dmg: 10 },    // JACARÉ: o equilibrado
  tucano: { hp: 9, spd: 9, dmg: 12 },      // TUCANO: canhão forte, casco mediano
  lobo: { hp: 10, spd: 11, dmg: 9 },       // LOBO-GUARÁ: rápido, canhão fraco
  tamandua: { hp: 11, spd: 8, dmg: 11 }    // TAMANDUÁ: forte de frente, devagar
};
export const TANK_IDS = Object.keys(TANK_PTS);
/* SUPERAQUECIMENTO da metralhadora (munição infinita, mas com barra de calor): cada tiro enche 20% (≈7 tiros seguidos enchem), esfria 12%/s soltando o gatilho; ao encher TRAVA e só volta a atirar quando esfriar TUDO (35%/s, ~3 s). Cliente e servidor usam esta mesma conta. */
export const MG_HEAT = { shot: 0.09, cool: 0.12, overCool: 0.35 };   // ~28 tiros seguidos antes de superaquecer (eram ~7)
export function mgHeatStep(h, over, dt) { if (over) { h -= MG_HEAT.overCool * dt; if (h <= 0) return { h: 0, over: false }; return { h, over: true }; } return { h: Math.max(0, h - MG_HEAT.cool * dt), over: false }; }
export const TANK_INFO = {
  onca: { name: 'Onça', desc: 'Leve e ágil. Gira rápido e foge dos tiros, mas aguenta pouco.', col: '#c9a227', col2: '#3a2a10' },
  anta: { name: 'Anta', desc: 'Pesada e lenta, com muita vida. Um muro andando.', col: '#6b6f5a', col2: '#2b2e24' },
  tatu: { name: 'Tatu', desc: 'Blindagem em placas. A mais resistente depois da Anta.', col: '#8a7a64', col2: '#35291d' },
  gaviao: { name: 'Gavião', desc: 'Rápido e com o canhão mais forte, mas de papel.', col: '#5a6f86', col2: '#1d2733' },
  jacare: { name: 'Jacaré', desc: 'O equilibrado: vida, velocidade e canhão no meio termo.', col: '#4f7a3a', col2: '#1c2d14' },
  tucano: { name: 'Tucano', desc: 'Canhão comprido e forte, casco mediano.', col: '#b55d2a', col2: '#2b1608' },
  lobo: { name: 'Lobo-guará', desc: 'Veloz e esguio, canhão mais fraco.', col: '#a0522d', col2: '#2a160c' },
  tamandua: { name: 'Tamanduá', desc: 'Casco forte e canhão bom, mas devagar.', col: '#7a6a8a', col2: '#262030' }
};
export const tankName = (id) => TANK_INFO[id]?.name || id;
const RUN = 4.05;   // velocidade de andar do jogador (balance.player.walkSpeed): o speedMul do corpo = velocidade / RUN
export const TANK_TIMING = { turret: 1.7 };   // giro da torre (rad/s): a torre demora um pouco para acompanhar a câmera
export function tankStats(id, c = TANK_CFG) {
  const p = TANK_PTS[id] || { hp: 10, spd: 10, dmg: 10 }, k = (n) => 1 + (c.step / 100) * (n - 10);
  const speed = +(c.speed * k(p.spd)).toFixed(2);
  return { id, pts: p, hp: Math.round(c.hp * k(p.hp)), speed, speedMul: +(speed / RUN).toFixed(3), turn: +(1.15 * k(p.spd)).toFixed(3), turret: TANK_TIMING.turret, shell: Math.round(c.shell * k(p.dmg)), reload: c.reload, mg: c.mg, mgCd: c.mgCd, splash: c.splash, range: c.range };
}
// TAMANHO: o tanque tem ~2x o comprimento de um carro (o carro tem ~4 m). Casco 3,2 m x 6,6 m (raio de colisão do casco: TANK_R).
export const TANK_R = 1.5, TANK_SCALE = 1;
// TIRO DO CANHÃO = parábola (como a granada, só que mais rápida): saída da boca com velocidade V na direção da mira, e a gravidade puxa.
export const SHELL = { v: 62, g: 17, life: 6 };
// ponto da trajetória em t segundos (mesma conta no cliente — linha de mira — e no servidor — o tiro de verdade)
export function shellAt(o, dir, t) { return { x: o.x + dir.x * SHELL.v * t, y: o.y + dir.y * SHELL.v * t - 0.5 * SHELL.g * t * t, z: o.z + dir.z * SHELL.v * t }; }
