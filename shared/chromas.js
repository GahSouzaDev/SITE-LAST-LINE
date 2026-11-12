// CROMAS: variações de uma skin de personagem (mesma roupa, um detalhe diferente). `unique: true` = cada croma existe UMA vez no jogo inteiro (quem tem fica com o seu; não repete).
// Uma skin SEM entrada aqui funciona como sempre. Para criar cromas de outra skin (ex.: 'estreia', 'gaucho') basta incluir a skin abaixo com a lista:
//   a / b = cores do neon (só Cyberpunk) · lens = lente do óculos · p = o que muda no visual (qualquer opção do criador: hairStyle, hair, shoes, goggles, headset, mask, helmet, beard, eyes, skin, shirt, pants…).
// Os cromas são vendidos JUNTO com a skin (nunca separados) e valorizam o item no Mercado (chromaMult).
export const CHROMAS = {
  cyber: { unique: true, auto: true, list: [
    { id: 'moicano', n: 'Moicano Magenta', a: '#ff2fd0', b: '#7a2cff', p: { hairStyle: 'mohawk', hair: '#ff2fd0' } },
    { id: 'visor', n: 'Visor Laranja Fluorescente', a: '#ff7a00', b: '#ffd400', lens: '#ff8a00', p: { goggles: 'tac', hair: '#ff7a00', shoes: '#ff7a00' } },
    { id: 'headset', n: 'Headset Ciano', a: '#27e0ff', b: '#27e0ff', p: { headset: 'comms', hair: '#27e0ff', shoes: '#27e0ff' } },
    { id: 'tenis', n: 'Tênis Verde-Limão', a: '#ff2fd0', b: '#27e0ff', p: { shoes: '#d8ff00' } },
    { id: 'mascara', n: 'Máscara Branca', a: '#ffffff', b: '#27e0ff', p: { mask: 'bandana', hair: '#f2f2f2', shoes: '#ffffff' } },
    { id: 'prata', n: 'Cabelo Prata Violeta', a: '#a45bff', b: '#e8f0ff', p: { hairStyle: 'slick', hair: '#e8f0ff', shoes: '#a45bff' } },
    { id: 'bone', n: 'Boné Verde Tóxico', a: '#39ff14', b: '#27e0ff', p: { helmet: 'cap', hair: '#39ff14', shoes: '#39ff14' } },
    { id: 'olhos', n: 'Olhos Vermelhos', a: '#ff2a2a', b: '#ff7a7a', p: { eyes: '#ff2a2a', skin: '#e8dede', hair: '#1a0a0a', shoes: '#ff2a2a' } },
    { id: 'touca', n: 'Touca e Barba Azul', a: '#27a8ff', b: '#27e0ff', p: { helmet: 'beanie', beard: 'beard', hair: '#27a8ff', shoes: '#27a8ff' } },
    { id: 'dourado', n: 'Black Power Dourado', a: '#ffd54a', b: '#ffb52e', p: { hairStyle: 'afro', hair: '#ffd54a', shoes: '#ffd54a' } }
  ] },
  // Operador da Estreia: o croma é dado pelo admin (não é automático). yl = cor do que era AMARELO · gas = máscara contra radiação
  // Combatente 65: croma do Combatente 7 · Legado (neon vermelho-laranja). Prêmio final da campanha ZONA UMBRA: NÃO se vende nem se troca (noSell). Traz o conjunto de skins Ferrari 65 e o paraquedas vermelho.
  legado7: { unique: false, list: [ { id: 'c65', n: 'Combatente 65', neon: '#ff3a12', noSell: true, mult: 1.5, p: {} } ] },
  estreia: { unique: false, list: [
    { id: 'umbra', n: 'Operador de Umbra', yl: '#7dff1a', gas: true, mult: 1.35, p: {} },
    { id: 'gelo', n: 'Operador Ártico', hue: 150, sat: 0.1, p: {} }
  ] },
  // ---- demais skins: cromas SÓ pelo admin (Jogadores › Croma), compra ou troca de croma. hue/sat/lit = mudança de cor de tudo que não é pele · as = aparência de OUTRA skin · dk = armadura negra
  cavaleiro: { unique: false, list: [
    { id: 'trevas', n: 'Cavaleiro das Trevas', dk: true, mult: 1.5, p: {} },
    { id: 'ouro', n: 'Cavaleiro Dourado', hue: -170, sat: 0.55, lit: 0.02, p: {} }
  ] },
  boxeador: { unique: false, list: [
    { id: 'azul', n: 'Boxeador Azul', gl: '#1e5ad6', p: { pants: '#1e5ad6' } },
    { id: 'ouro', n: 'Boxeador Dourado', gl: '#d9a441', p: { pants: '#d9a441', shoes: '#d9a441' } },
    { id: 'mascara', n: 'Lutador Mascarado', gl: '#6a1b9a', p: { pants: '#6a1b9a', mask: 'balaclava' } }
  ] },
  ninja: { unique: false, list: [ { id: 'samurai', n: 'Ninja Samurai', as: 'samurai', mult: 1.1, p: {} } ] },
  guara: { unique: false, list: [
    { id: 'lobomau', n: 'Lobo Mau', sat: -1, lit: -0.12, tintSkin: true, p: {} },
    { id: 'neve', n: 'Lobo da Neve', sat: -1, lit: 0.3, tintSkin: true, p: {} }
  ] },
  bombeiro: { unique: false, list: [ { id: 'especial', n: 'Bombeiro Operação Especial', hue: -48, gas: true, yl: '#ff3b1a', mult: 1.2, p: {} } ] },
  alien: { unique: false, list: [
    { id: 'roxo', n: 'Alien Roxo', p: { skin: '#9a4bd6' } },
    { id: 'vermelho', n: 'Alien Rubro', p: { skin: '#d64b4b' } },
    { id: 'azul', n: 'Alien Glacial', p: { skin: '#4bb4d6' } },
    { id: 'dourado', n: 'Alien Dourado', mult: 1.25, p: { skin: '#e0b030' } }
  ] },
  samurai: { unique: false, list: [ { id: 'escarlate', n: 'Samurai Escarlate', hue: 130, sat: 0.25, p: {} } ] },
  viking: { unique: false, list: [ { id: 'gelo', n: 'Viking do Gelo', hue: 175, sat: 0.2, lit: 0.1, p: {} } ] },
  vampiro: { unique: false, list: [ { id: 'conde', n: 'Conde Carmesim', p: { shirt: '#6b0f1a', pants: '#2a0a0f' } } ] },
  // ZÉ PEQUENO: 3 cromas à venda no Mercado (price = moedas). tex = estampa da camisa · kit = acessórios extras · mir = óculos juliete espelhado
  ze: { unique: false, list: [
    { id: 'timao', n: 'Zé Pequeno Corinthiano', tex: 'corinthians', kit: 'corinthians', mir: true, price: 600, p: { vest: 'plate', pack: 'assault', goggles: 'tac', shirt: '#f3f3ef' } },
    { id: 'mengao', n: 'Zé Pequeno Rubro-Negro', tex: 'flamengo', kit: 'flamengo', mir: true, price: 600, p: { vest: 'plate', pack: 'assault', goggles: 'tac', shirt: '#c8102e' } },
    { id: 'mandrake', n: 'Zé Mandrake', kit: 'mandrake', mir: true, price: 650, p: { helmet: 'cap', goggles: 'tac', shirt: '#0e1013', pants: '#15181d', accent: '#101215' } }
  ] },
  pm: { unique: false, list: [ { id: 'rotam', n: 'PM Rotam', p: { shirt: '#14161a', pants: '#0e1013' } } ] },
  cowboy: { unique: false, list: [ { id: 'foralei', n: 'Cowboy Fora da Lei', p: { shirt: '#2a2a2a', pants: '#3a2a1a' } } ] }
};
// preço na Loja Oficial = preço da skin × mult (padrão 2/3). mult > 1 = croma MAIS CARO que a própria skin (raros)
export const CHROMA_MULT = 2 / 3;
export const chromasOf = (skin) => CHROMAS[skin]?.list || [];
export const chromaDef = (skin, id) => chromasOf(skin).find((c) => c.id === id) || null;
export const chromaAuto = (skin) => !!CHROMAS[skin]?.auto;   // recebe croma sozinho (quem já tinha a skin ganha um sorteado)
export const chromaUnique = (skin) => !!CHROMAS[skin]?.unique;
// valor do item conforme os cromas que vêm com ele: 1 croma = 1×, 2 = 3×, depois +1× por croma até 10× (ex.: skin de 100 → 300 com 2 cromas → 1.000 com todos)
export const chromaMult = (n) => (n <= 1 ? 1 : n === 2 ? 3 : Math.min(10, n + 1));
