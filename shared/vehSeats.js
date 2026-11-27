// VEÍCULOS ABERTOS: quem está dentro fica À MOSTRA (visível, atingível e pode atirar). Servidor e cliente usam as MESMAS posições dos bancos.
// Tipos (índice em vehFx TYPES): 0 Corisco (sedã), 1 Tracajá (SUV), 2 Escorpião (esportivo), 3 Roceira (picape), 4 Trilheiro (jipe), 5 Perua (van), 6 Duna (buggy), 7 Tatu (militar), 8 Astronave, 9 Bicho (sedã de luxo), 10 Van Umbra, 11 Caveirão (blindado). Abertos: 4, 6, 7.
export const VEH_TYPES = 18;   // 13 = Fórmula 1 · 14 Lambreta · 15 Trilheira · 16 Relâmpago (esportiva) · 17 Estradeira (cruiser)
export const isBike = (ty) => ty >= 14;
export const VEH_SEATS = { 13: 1, 14: 2, 15: 2, 16: 2, 17: 2 };   // quantos bancos (o resto tem 4)
// MOTOS: inclinação máxima (rad) e quão rápido ela acompanha o guidão (1/s); a curva usa a física real: aceleração lateral = g·tan(inclinação), taxa de giro = aceleração ÷ velocidade
// (quanto mais rápido, mais a moto precisa deitar e menos ela consegue virar). hx/hz = meia-largura/meio-comprimento para batidas.
export const VEH_BIKE = { 14: { lean: 0.62, k: 6.5, bar: 2.3, hx: 0.4, hz: 0.95 }, 15: { lean: 0.78, k: 5.2, bar: 2.0, hx: 0.42, hz: 1.05 }, 16: { lean: 0.9, k: 4.4, bar: 1.7, hx: 0.42, hz: 1.05 }, 17: { lean: 0.68, k: 3.2, bar: 1.5, hx: 0.5, hz: 1.2 } };   // 12 = OGBB ("O Grande Búfalo Branco"): hatch branco estilo Palio, carro LENDA
export const BASE_TYPES = 8;   // os 8 de sempre (aparecem na mesma proporção de antes); os 4 novos entram à parte (ver server/rooms/vehicle.js › pickType)
export const VEH_HP = [1, 1.11, 0.93, 1.05, 1.07, 1.18, 0.91, 1.16, 1, 1.14, 1.23, 1.9, 1, 0.91, 0.73, 0.78, 0.8, 0.87];   /* EQUILÍBRIO (25/11/2026): a diferença de vida entre os veículos encolheu (era 0,4 a 3,0): continua havendo diferença, mas pequena (OGBB segue o mais resistente) */   // multiplicador de vida
/* EQUILÍBRIO (18/11/2026): a potência do motor é parecida em todos (0,92 a 1,10): o carro mais rápido é só UM POUCO mais rápido, porque o nitro multiplica essa diferença. O resto da personalidade
   (capotar, drift, suspensão macia/dura, raio de curva) vem de VEH_STAB e dos outros parâmetros. Antes ia de 0,78 a 1,35 (o mais rápido era 73% mais veloz que o mais lento). */
export const VEH_SPEED = [1, 0.97, 1.08, 0.99, 1.02, 0.95, 1.06, 0.96, 1.1, 1.04, 0.95, 0.92, 1.1, 1.1, 0.72, 0.98, 1.1, 0.95];   // multiplicador da velocidade máxima (13 F1 · 14–17 motos) (Astronave e OGBB, as lendas, são os mais rápidos)
export const VEH_ARMOR = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9, 0.9, 0.3, 1, 1, 1, 1, 1, 1];
// NITRO (Shift ao dirigir): só os modelos listados aqui têm. use = quanto da barra gasta por segundo (1 = barra cheia), regen = quanto recarrega por segundo (depois de 0,9 s sem usar), acc = multiplicador da aceleração, max = multiplicador da velocidade máxima, col = cor da chama.
export const VEH_NITRO = {
  0: { n: 'Corisco', use: 0.34, regen: 0.09, acc: 1.8, max: 1.3, col: 0xffa030 },       // laranja
  1: { n: 'Tracajá', use: 0.36, regen: 0.09, acc: 1.8, max: 1.3, col: 0xffd22e },        // amarela
  2: { n: 'Escorpião', use: 0.32, regen: 0.1, acc: 2, max: 1.32, col: 0xb06bff },      // roxa
  3: { n: 'Roceira', use: 0.36, regen: 0.09, acc: 1.8, max: 1.3, col: 0xff6a1a },        // laranja-fogo
  4: { n: 'Trilheiro', use: 0.35, regen: 0.09, acc: 1.85, max: 1.3, col: 0xb6ff3a },     // lima
  5: { n: 'Perua', use: 0.38, regen: 0.08, acc: 1.8, max: 1.3, col: 0x7fb8ff },         // azul-claro
  6: { n: 'Duna', use: 0.32, regen: 0.1, acc: 2, max: 1.32, col: 0x20ffc8 },           // turquesa
  7: { n: 'Tatu', use: 0.36, regen: 0.09, acc: 1.8, max: 1.3, col: 0xffb300 },           // âmbar
  8: { n: 'Astronave', use: 0.3, regen: 0.1, acc: 2.1, max: 1.34, col: 0x38d8ff },       // chama azul-ciano (lenda)
  9: { n: 'Bicho', use: 0.32, regen: 0.1, acc: 2, max: 1.32, col: 0xff3040 },          // vermelha
  10: { n: 'Van Umbra', use: 0.36, regen: 0.07, acc: 1.8, max: 1.3, col: 0x39ff6a },    // verde
  11: { n: 'Caveirão', use: 0.4, regen: 0.07, acc: 1.8, max: 1.28, col: 0xff2a2a },      // vermelho-sangue (pesado: ganha pouco)
  12: { n: 'OGBB', use: 0.27, regen: 0.09, acc: 2.1, max: 1.34, col: 0xff40e0 },           // chama rosa-magenta (lenda)
  13: { n: 'Fórmula', use: 0.3, regen: 0.1, acc: 2.1, max: 1.34, col: 0xff3a2a }            // F1: chama vermelha
};
// ESTABILIDADE na curva (1 = normal; menor = mais alto/instável, maior = baixo e firme). Só entra no desequilíbrio/capotamento
export const VEH_STAB = [1, 0.85, 1.15, 0.9, 0.9, 0.75, 1.2, 1, 1.1, 1, 0.7, 0.65, 1, 1.3, 1, 1, 1, 1];   // dano de tiro que PASSA (Caveirão: só 30%)
export const OPEN_TY = new Set([4, 6, 7, 13, 14, 15, 16, 17]);   // abertos: quem está dentro fica à mostra (F1 e motos também)
export const isOpenTy = (ty) => OPEN_TY.has(ty);
// [x lateral (+direita), z (+para trás)] por banco: 0 motorista, 1 carona, 2 e 3 banco de trás
const SEATS = { 13: [[0, 0.1]], 14: [[0, -0.1], [0, 0.55]], 15: [[0, -0.12], [0, 0.6]], 16: [[0, -0.05], [0, 0.55]], 17: [[0, -0.05], [0, 0.7]], 4: [[-0.45, -0.15], [0.45, -0.15], [-0.45, 0.95], [0.45, 0.95]], 6: [[-0.4, -0.05], [0.4, -0.05], [-0.4, 0.95], [0.4, 0.95]], 7: [[-0.5, -0.2], [0.5, -0.2], [-0.5, 1.0], [0.5, 1.0]] };
const FLOOR = { 4: 0.46, 6: 0.34, 7: 0.52, 13: 0.34, 14: 0.3, 15: 0.5, 16: 0.4, 17: 0.34 };      // altura do assoalho (pés do passageiro)
// posição do banco `i` no mundo (v: {x,y,z,yaw,ty}); carros fechados: centro do carro
export function seatPos(v, i) {
  const s = SEATS[v.ty]; if (!s) return { x: v.x, y: v.y + 0.05, z: v.z };
  let [sx, sz] = s[i] || s[0]; const c = Math.cos(v.yaw), n = Math.sin(v.yaw);
  if (v.ty >= 14 && v.roll) sx -= FLOOR[v.ty] * 1.9 * Math.sin(v.roll);   // MOTO inclinada: o piloto acompanha o corpo para o lado da curva (roll>0 = lado direito mais alto → corpo vai para a esquerda)
  return { x: v.x + c * sx + n * sz, y: v.y + FLOOR[v.ty], z: v.z - n * sx + c * sz };
}
