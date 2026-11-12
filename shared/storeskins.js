// SKINS DE ARMA DA LOJA (cada uma vale para UMA arma). Entram no Mercado como as skins de dia (kind 'w'), podem ser vendidas/trocadas e o admin dá para qualquer jogador.
// A aparência está em client/js/weapons/skinsPack.js (SKD) e a foto da loja é gerada com a própria skin (skinThumb). Raras.
//  · Rosa Choque (cor sólida, 222)  · Fogo (textura de fogo estática na arma inteira, 666) — Kalash-47, Glock-X Auto, Caçador .22
//  · Roxo (roxo e roxo claro, 456) — Specter SR-9, Hornet MP-9, Sentinel SR-3  ·  Azul Bebê (900) — Coach Sawed-Off
const mk = (t, nome, tipo, cor, sw, c1, c2, preco, rar = 'Rara') => ({ id: 'loja_' + tipo + '_' + t, kind: 'w', t, n: nome + ' ' + cor, sw, c1, c2, fx: [], day: 'Loja Oficial', value: preco, price: preco, rar, store: true });
export const STORE_SKINS = [
  ...[['ak', 'Kalash-47'], ['machpist', 'Glock-X Auto'], ['hunter', 'Caçador .22']].flatMap(([t, n]) => [mk(t, n, 'rosa', 'Rosa Choque', '#ff2d95', 0xff2d95, 0xc2186f, 222), mk(t, n, 'fogo', 'Fogo', '#ff5a00', 0xff5a00, 0xffc21a, 666)]),
  ...[['ghost', 'Specter SR-9'], ['mp5', 'Hornet MP-9'], ['scout', 'Sentinel SR-3']].map(([t, n]) => mk(t, n, 'roxo', 'Roxo', '#b388ff', 0xb388ff, 0x7c4dff, 456)),
  mk('sawed', 'Coach Sawed-Off', 'bebe', 'Azul Bebê', '#89cff0', 0x89cff0, 0x5fb5e6, 900, 'Épica')
];
