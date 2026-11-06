// VEÍCULOS ABERTOS: quem está dentro fica À MOSTRA (visível, atingível e pode atirar). Servidor e cliente usam as MESMAS posições dos bancos.
// Tipos (índice em vehFx TYPES): 0 Sedã, 1 SUV, 2 Esportivo, 3 Picape, 4 Jipe, 5 Van, 6 Buggy, 7 Militar. Abertos: 4, 6, 7.
export const VEH_TYPES = 8;
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
