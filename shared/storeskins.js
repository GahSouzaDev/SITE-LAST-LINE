// SKINS DE ARMA DA LOJA (cada uma vale para UMA arma). Entram no Mercado como as skins de dia (kind 'w'), podem ser vendidas/trocadas e o admin dá para qualquer jogador.
// A aparência está em client/js/weapons/skinsPack.js (SKD) e a foto da loja é gerada com a própria skin (skinThumb). Raras.
//  · Rosa Choque (cor sólida, 222)  · Fogo (textura de fogo estática na arma inteira, 666) — Kalash-47, Glock-X Auto, Caçador .22
//  · Roxo (roxo e roxo claro, 456) — Specter SR-9, Hornet MP-9, Sentinel SR-3  ·  Azul Bebê (900) — Coach Sawed-Off
const mk = (t, nome, tipo, cor, sw, c1, c2, preco, rar = 'Rara') => ({ id: 'loja_' + tipo + '_' + t, kind: 'w', t, n: nome + ' ' + cor, sw, c1, c2, fx: [], day: 'Loja Oficial', value: preco, price: preco, rar, store: true });
// COLEÇÃO LITORAL NEON (inspirada no clima de praia tropical + neon, sem copiar nada oficial): UMA skin LENDÁRIA para cada categoria, cada uma com arte própria
// (a arte é desenhada em canvas em client/js/weapons/skinsPack.js e a foto da loja nasce da própria skin). 2026 moedas cada. Quem entra no jogo em 19/11/2026 ganha UMA delas sorteada.
const gta = (t, nome, cor, kind, sw, c1, c2) => ({ id: 'loja_gta_' + t, kind, t, n: nome + ' ' + cor, sw, c1, c2, fx: [], day: 'Loja Oficial', value: 2026, price: 2026, rar: 'Lendária', store: true });
export const GTA_SKINS = [
  gta('ak', 'Kalash-47', 'California', 'w', '#ff4d7e', 0xff3d8b, 0xffd23a),
  gta('pistol', 'Viper .40', 'Flamingo', 'w', '#ff9ccb', 0xffb3d1, 0x19c8c0),
  gta('dualpistol', 'Dual Viper .40', 'Palmeiral Neon', 'w', '#19f0e0', 0x19f0e0, 0x7a1fd0),
  gta('shotgun', 'Breach-12', 'Hibisco', 'w', '#ff3d9a', 0xff3d9a, 0x0b4a3f),
  gta('bazooka', 'Bazuca M-9', 'Ocean Neon', 'w', '#ffe14a', 0xffe14a, 0x19f0e0),
  gta('knife', 'Peixeira', 'Tropical', 'm', '#19e0d0', 0x19e0d0, 0xff3d9a)
];
// SORTEIO DO DIA: quem entra no jogo nesta data (horário de Brasília) ganha UMA das skins da coleção, sorteada (uma que ainda não tenha)
export const GTA_GIVEAWAY = { y: 2026, m: 11, d: 19, key: 'gta_sorteio_2026', ids: GTA_SKINS.map((s) => s.id) };
export const STORE_SKINS = [
  ...GTA_SKINS,
  ...[['ak', 'Kalash-47'], ['machpist', 'Glock-X Auto'], ['hunter', 'Caçador .22']].flatMap(([t, n]) => [mk(t, n, 'rosa', 'Rosa Choque', '#ff2d95', 0xff2d95, 0xc2186f, 222), mk(t, n, 'fogo', 'Fogo', '#ff5a00', 0xff5a00, 0xffc21a, 666)]),
  ...[['ghost', 'Specter SR-9'], ['mp5', 'Hornet MP-9'], ['scout', 'Sentinel SR-3']].map(([t, n]) => mk(t, n, 'roxo', 'Roxo', '#b388ff', 0xb388ff, 0x7c4dff, 456)),
  mk('sawed', 'Coach Sawed-Off', 'bebe', 'Azul Bebê', '#89cff0', 0x89cff0, 0x5fb5e6, 900, 'Épica')
];
