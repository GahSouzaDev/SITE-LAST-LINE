// VEÍCULOS ABERTOS: quem está dentro fica À MOSTRA (visível, atingível e pode atirar). Servidor e cliente usam as MESMAS posições dos bancos.
// Tipos (índice em vehFx TYPES): 0 Corisco (sedã), 1 Tracajá (SUV), 2 Escorpião (esportivo), 3 Roceira (picape), 4 Trilheiro (jipe), 5 Perua (van), 6 Duna (buggy), 7 Tatu (militar), 8 Astronave, 9 Bicho (sedã de luxo), 10 Van Umbra, 11 Caveirão (blindado). Abertos: 4, 6, 7.
export const VEH_TYPES = 13;   // 12 = OGBB ("O Grande Búfalo Branco"): hatch branco estilo Palio, carro LENDA
export const BASE_TYPES = 8;   // os 8 de sempre (aparecem na mesma proporção de antes); os 4 novos entram à parte (ver server/rooms/vehicle.js › pickType)
export const VEH_HP = [1, 1.25, 0.85, 1.1, 1.15, 1.4, 0.8, 1.35, 1.0, 1.3, 1.5, 3.0, 1.0];   // multiplicador de vida
export const VEH_SPEED = [1, 0.95, 1.2, 1, 1.05, 0.88, 1.2, 0.9, 1.3, 1.12, 0.85, 0.78, 1.35];   // Astronave (1,30) e OGBB (1,35) são os mais rápidos do jogo   // multiplicador da velocidade máxima
export const VEH_ARMOR = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9, 0.9, 0.3, 1];
// NITRO (Shift ao dirigir): só os modelos listados aqui têm. use = quanto da barra gasta por segundo (1 = barra cheia), regen = quanto recarrega por segundo (depois de 0,9 s sem usar), acc = multiplicador da aceleração, max = multiplicador da velocidade máxima, col = cor da chama.
export const VEH_NITRO = {
  0: { n: 'Corisco', use: 0.34, regen: 0.09, acc: 1.8, max: 1.3, col: 0xffa030 },       // laranja
  1: { n: 'Tracajá', use: 0.36, regen: 0.09, acc: 1.7, max: 1.28, col: 0xffd22e },        // amarela
  2: { n: 'Escorpião', use: 0.32, regen: 0.1, acc: 2.0, max: 1.34, col: 0xb06bff },      // roxa
  3: { n: 'Roceira', use: 0.36, regen: 0.09, acc: 1.7, max: 1.28, col: 0xff6a1a },        // laranja-fogo
  4: { n: 'Trilheiro', use: 0.35, regen: 0.09, acc: 1.8, max: 1.3, col: 0xb6ff3a },     // lima
  5: { n: 'Perua', use: 0.38, regen: 0.08, acc: 1.9, max: 1.3, col: 0x7fb8ff },         // azul-claro
  6: { n: 'Duna', use: 0.32, regen: 0.1, acc: 2.0, max: 1.32, col: 0x20ffc8 },           // turquesa
  7: { n: 'Tatu', use: 0.36, regen: 0.09, acc: 1.7, max: 1.28, col: 0xffb300 },           // âmbar
  8: { n: 'Astronave', use: 0.3, regen: 0.1, acc: 2.4, max: 1.45, col: 0x38d8ff },       // chama azul-ciano (lenda)
  9: { n: 'Bicho', use: 0.32, regen: 0.1, acc: 2.0, max: 1.35, col: 0xff3040 },          // vermelha
  10: { n: 'Van Umbra', use: 0.36, regen: 0.07, acc: 1.7, max: 1.28, col: 0x39ff6a },    // verde
  11: { n: 'Caveirão', use: 0.4, regen: 0.07, acc: 2.0, max: 1.26, col: 0xff2a2a },      // vermelho-sangue (pesado: ganha pouco)
  12: { n: 'OGBB', use: 0.27, regen: 0.09, acc: 2.6, max: 1.5, col: 0xff40e0 }            // chama rosa-magenta (lenda)
};
// ESTABILIDADE na curva (1 = normal; menor = mais alto/instável, maior = baixo e firme). Só entra no desequilíbrio/capotamento
export const VEH_STAB = [1, 0.85, 1.15, 0.9, 0.9, 0.75, 1.2, 1, 1.1, 1, 0.7, 0.65, 1];   // dano de tiro que PASSA (Caveirão: só 30%)
export const OPEN_TY = new Set([4, 6, 7]);
export const isOpenTy = (ty) => OPEN_TY.has(ty);
// [x lateral (+direita), z (+para trás)] por banco: 0 motorista, 1 carona, 2 e 3 banco de trás
const SEATS = { 4: [[-0.45, -0.15], [0.45, -0.15], [-0.45, 0.95], [0.45, 0.95]], 6: [[-0.4, -0.05], [0.4, -0.05], [-0.4, 0.95], [0.4, 0.95]], 7: [[-0.5, -0.2], [0.5, -0.2], [-0.5, 1.0], [0.5, 1.0]] };
const FLOOR = { 4: 0.46, 6: 0.34, 7: 0.52 };      // altura do assoalho (pés do passageiro)
// posição do banco `i` no mundo (v: {x,y,z,yaw,ty}); carros fechados: centro do carro
export function seatPos(v, i) {
  const s = SEATS[v.ty]; if (!s) return { x: v.x, y: v.y + 0.05, z: v.z };
  const [sx, sz] = s[i] || s[0], c = Math.cos(v.yaw), n = Math.sin(v.yaw);
  return { x: v.x + c * sx + n * sz, y: v.y + FLOOR[v.ty], z: v.z - n * sx + c * sz };
}
