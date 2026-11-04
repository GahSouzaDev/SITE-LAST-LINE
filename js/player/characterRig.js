// PERSONAGEM — extraído de "criador-de-personagem.html" (versão atualizada: mais skins/roupas e correções de modelo).
// Rig com ossos, IK dos braços, poses, roupas, cabelos e skins especiais. Uma instância por jogador. Metros (1,8 m com height=1).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { chromaDef } from '../../../shared/chromas.js';
export function createCharacter(initial = {}) {
const rad = (d) => d * Math.PI / 180, clamp = THREE.MathUtils.clamp, T = Math.PI, K = 1 / 0.3;
const WPS = { on: false };
const tagFP = () => {}, applyFP = () => {}, fpOn = () => false;   // do modo de teste do criador (não usado no jogo)
const D={gender:'male',mode:'player',tab:'body',pose:'armed',
 height:1,build:1,shoulders:1,head:1,skin:'#b9805f',eyes:'#4b7a8c',
 hairStyle:'short',hair:'#2a1d18',beard:'none',
 camo:'woodland',helmet:'ach',goggles:'none',headset:'comms',mask:'none',
 vest:'plate',pack:'none',weapon:'rifle',gloves:'on',kneepads:'on',accent:'#d39b3b',outfit:'military',shirt:'#3c4a5a',pants:'#2f3640',shoes:'#e8e8e8',weaponColor:'#1c1e21',special:'none',
 zSkin:'verde',zBlood:'medio',zBloodCol:'#8a0f18',zMouth:'sangue',zEyes:'amarelo',zWound:'mordidas',zBones:'none',zHead:'normal',zVeins:'on',zTorn:'on'};
const S=JSON.parse(JSON.stringify(D));
const L={
 hair:[['short','Curto militar'],['crew','Raspado'],['slick','Penteado p/ trás'],['long','Longo solto'],['ponytail','Rabo de cavalo'],['bun','Coque'],['bob','Chanel curto'],['pixie','Pixie com franja'],['twin','Maria-chiquinha'],['braid','Trança'],['mohawk','Moicano'],['wavy','Longo ondulado'],['highpony','Rabo alto'],['halfup','Meio preso'],['sidebraid','Trança lateral'],['curlylong','Cacheado longo'],['afro','Black power'],['curly','Cacheado curto'],['bald','Careca']],
 beard:[['none','Sem barba'],['stubble','Barba por fazer'],['beard','Barba cheia']],
 camo:[['woodland','Woodland'],['desert','Deserto'],['urban','Urbano'],['olive','Verde oliva'],['black','Preto tático'],['snow','Neve']],
 helmet:[['none','Sem capacete'],['ach','Capacete tático'],['boonie','Chapéu boonie'],['cap','Boné'],['beanie','Touca'],['bucket','Chapéu de pescador'],['hardhat','Capacete de obra'],['chef','Toca de chef'],['beret','Boina'],['headband','Faixa na testa'],['tophat','Cartola'],['sun','Chapéu de palha']],
 goggles:[['none','Nenhum'],['tac','Óculos tático'],['nvg','Visão noturna']],
 headset:[['none','Nenhum'],['comms','Headset de rádio']],
 mask:[['none','Nenhuma'],['bandana','Bandana'],['balaclava','Balaclava']],
 vest:[['none','Sem colete'],['plate','Porta-placas'],['heavy','Colete pesado']],
 pack:[['none','Sem mochila'],['assault','Mochila de assalto'],['large','Mochila grande']],
 weapon:[['none','Desarmado'],['rifle','Fuzil de assalto'],['lmg','Metralhadora pesada'],['shotgun','Escopeta'],['sniper','Sniper'],['smg','Mini metralhadora'],['pistol','Pistola'],['dualPistol','Pistolas duplas'],['dualSmg','Mini metralhadoras duplas']],
 special:[['none','Nenhuma (roupa normal)'],['onca','Onça-Pintada Ancestral ★ Mítica'],['lobo','Lobisomem da Lua Cheia ★ Mítica'],['tupa','Tupã, Senhor do Trovão ★ Mítica'],['boiuna','Boiúna, a Cobra Grande ★ Mítica'],['bateria','Rainha da Bateria Dourada ★ Lendária'],['uira','Uirapuru Encantado ★ Lendária'],['caboclo','Caboclo de Lança ★ Lendária'],['frevo','Passista de Frevo ★ Lendária'],['anhanga','Anhangá, Espírito do Campo ★ Mítica'],['bicho','Bicho-Papão ★ Mítica'],['paje','Pajé da Floresta ★ Mítica'],['curupira2','Curupira de Fogo ★ Mítica'],['gigante','Gigante de Olinda ★ Lendária'],['vitoria','Vitória-Régia Encantada ★ Lendária'],['pirarucu','Pirarucu Guerreiro ★ Lendária'],['vaqueiro','Vaqueiro do Laço de Fogo ★ Lendária'],['maeouro','Mãe do Ouro ★ Mítica'],['matinta','Matinta Perera ★ Mítica'],['guara','Lobo-Guará Guardião ★ Mítica'],['carranca','Carranca do São Francisco ★ Lendária'],['sanfa','Sanfoneiro Encantado ★ Lendária'],['jang','Jangadeiro dos Ventos ★ Lendária'],['manda','Mandacaru Vivo ★ Lendária'],['garantido','Boi Garantido ★ Mítica'],['caprichoso','Boi Caprichoso ★ Mítica'],['boitata','Boitatá ★ Mítica'],['mula','Mula-sem-Cabeça ★ Mítica'],['boto','Boto Cor-de-Rosa ★ Lendária'],['mapinguari','Mapinguari ★ Lendária'],['cuca','Cuca ★ Lendária'],
  ['astronaut','Astronauta ★ Épica'],['astro_or','Astronauta Laranja ★ Rara'],['futuro','Combatente do Futuro ★ Lendária'],['legado7','Combatente 7 · Legado ★ Mítica'],['c54','Combatente 54 ★ Mítica'],['ceifador','Ceifador das Almas ★ Mítica'],['cyber','Cyberpunk Neon ★ Mítica'],['robo','Robô Titã ★ Mítica'],['anjo','Anjo da Guarda ★ Mítica'],['demonio','Demônio Infernal ★ Mítica'],['mago','Arquimago ★ Mítica'],['saci','Saci Pererê ★ Mítica'],['alien','Alienígena ★ Mítica'],
  ['gaucho','Gaúcho ★ Lendária'],['cangaceiro','Cangaceiro ★ Lendária'],['ze','Zé Pequeno ★ Lendária'],['samurai','Samurai ★ Lendária'],['cavaleiro','Cavaleiro Medieval ★ Lendária'],['indio','Guerreiro Indígena ★ Lendária'],['curupira','Curupira ★ Lendária'],
  ['cowboy','Cowboy ★ Épica'],['bope','BOPE ★ Épica'],['fab','Piloto da FAB ★ Épica'],['coronel','Coronel da 2ª Guerra ★ Épica'],['viking','Viking ★ Épica'],['ninja','Ninja ★ Épica'],['pirata','Pirata dos 7 Mares ★ Épica'],['rock','Astro do Rock ★ Épica'],['f1','Piloto de F1 ★ Épica'],['vampiro','Conde Vampiro ★ Épica'],['selecao','Craque da Seleção ★ Épica'],
  ['gotinha','Agente Gotinha ★ Épica'],['cupido','Cupido ★ Lendária'],['bruxa','Bruxa do Pântano ★ Épica'],['servidor','Servidor Público ★ Rara'],['catrina','Catrina ★ Épica'],['sambista','Sambista de Terno Branco ★ Rara'],['dev','Dev da Madrugada ★ Épica'],
  ['pm','Policial Militar (P.M.) ★ Rara'],['gcm','Guarda Civil (G.C.M.) ★ Rara'],['marinheiro','Marinheiro ★ Rara'],['esquimo','Esquimó ★ Rara'],['capoeira','Capoeirista ★ Rara'],['malandro','Malandro Carioca ★ Rara'],['bombeiro','Bombeiro ★ Rara'],['mergulhador','Mergulhador ★ Rara'],['boxeador','Boxeador Campeão ★ Rara'],['caipira','Caipira de Festa Junina ★ Rara'],['chef','Chef de Cozinha ★ Rara'],['estreia','Operador da Estreia ★ Kit da Estreia'],['noel','Papai Noel ★ Evento de Natal'],['coelho','Coelhinho da Páscoa ★ Evento de Páscoa'],['reveillon','Foliã do Réveillon ★ Evento'],['folia','Passista do Carnaval ★ Evento'],['palhaco','Palhaço do Circo ★ Evento'],['florista','Florista (Dia das Mães) ★ Evento'],['sanfoneiro','Sanfoneiro Junino ★ Evento'],['surfista','Surfista de Julho ★ Evento'],['iara','Iara do Folclore ★ Evento'],['patriota','Patriota 7 de Setembro ★ Evento'],['petista','Petista de Camisa Vermelha ★ Evento'],['abobora','Cabeça de Abóbora ★ Evento'],['marechal','Marechal da República ★ Evento'],['samu','Socorrista (SAMU) ★ Rara']],
 yn:[['on','Sim'],['off','Não']],
 zSkin:[['verde','Verde doentio'],['palido','Pálido cadavérico'],['cinza','Cinza morto'],['roxo','Roxo (necrose)'],['podre','Amarelo podre'],['queimado','Queimado / carbonizado']],
 zBlood:[['none','Sem sangue'],['leve','Pouco sangue'],['medio','Sangrento'],['muito','Muito sangue'],['banho','Banho de sangue']],
 zMouth:[['fechada','Fechada'],['sangue','Ensanguentada'],['aberta','Aberta (mandíbula caída)'],['aberta_sangue','Aberta e ensanguentada']],
 zEyes:[['amarelo','Amarelos'],['branco','Brancos leitosos'],['vermelho','Vermelhos brilhantes'],['vazado','Um olho vazado']],
 zWound:[['none','Nenhum'],['mordidas','Mordidas'],['cortes','Cortes profundos'],['tiros','Tiros'],['tudo','Tudo (mordidas, cortes e tiros)']],
 zBones:[['none','Nenhum'],['costelas','Costelas expostas'],['braco','Osso do braço exposto'],['tripas','Barriga aberta (tripas)'],['tudo','Costelas + braço + tripas']],
 zHead:[['normal','Normal'],['aberto','Crânio aberto (cérebro)'],['machado','Machado na cabeça'],['furo','Tiro na testa']],
 outfit:[['military','Militar tático'],['tshirt','Camiseta e calça'],['shorts','Camiseta e short'],['hoodie','Moletom e calça'],['social','Social (camisa e gravata)'],['jaqueta','Jaqueta de couro'],['jaleco','Jaleco'],['macacao','Macacão'],['regata','Regata e bermuda'],['vestido','Vestido']]
};
const PAL={
 skin:['#f1c7a8','#dba283','#b9805f','#8a5b43','#6a4332','#4a2f24'],
 hair:['#0c0b0a','#2a1d18','#4b2e1e','#7a4a28','#b08a52','#d9c9a0','#7d7d7d','#c8c8c8','#7a2e24'],
 eyes:['#4b7a8c','#3a5f3a','#6b4a2c','#2b2b2b','#7a8c96'],
 accent:['#d39b3b','#b94138','#3c8da8','#4b915d','#d5d5d5','#2b2f33'],
 shirt:['#e8e8e8','#1f2326','#3c4a5a','#8a2f2f','#3f6b4a','#c9a23c','#6a4a8a','#f2d21b','#e0652a','#2a5db0','#ff5fa2','#0f766e'],
 pants:['#2f3640','#1c1f22','#4a5a72','#6b5a42','#7a7f85','#2f4a3a','#f1ecdf','#3d5a80','#2a5db0','#8a2f2f'],
 shoes:['#e8e8e8','#1c1f22','#8a2f2f','#3c4a5a','#6b5a42','#f2d21b','#2a5db0'],
 weaponColor:['#1c1e21','#3a3d40','#5a4a35','#7a7f85','#c9a23c','#4b5a32'],
 zBloodCol:['#8a0f18','#b3121c','#5a0d12','#2a0a0c','#3f6b12','#6a1a5a']
};
const TABS={
 body:[['r','height','Altura',.85,1.15],['r','build','Estrutura',.85,1.25],['r','shoulders','Ombros',.9,1.15],['c','skin','Pele']],
 face:[['r','head','Tamanho da cabeça',.9,1.12],['c','eyes','Olhos'],['s','beard','Barba',L.beard],['s','goggles','Óculos',L.goggles],['s','mask','Máscara',L.mask]],
 hair:[['s','hairStyle','Estilo',L.hair],['c','hair','Cor do cabelo']],
 outfit:[['s','outfit','Tipo de roupa',L.outfit],['s','camo','Camuflagem (militar)',L.camo],['c','shirt','Cor da camiseta/moletom'],['c','pants','Cor da calça/short'],['c','shoes','Cor do tênis'],['c','accent','Cor de detalhe']],
 rare:[['s','special','Skin rara (troca roupa e chapéu)',L.special],['c','accent','Cor do lenço / detalhe']],
 weapon:[['s','weapon','Arma (vale para qualquer personagem)',L.weapon],['c','weaponColor','Cor da arma']],
 gear:[['s','helmet','Cabeça',L.helmet],['s','headset','Rádio',L.headset],['s','vest','Colete',L.vest],
  ['s','pack','Mochila',L.pack],['s','gloves','Luvas',L.yn],['s','kneepads','Joelheiras (militar)',L.yn]],
 zumbi:[['s','zSkin','Pele infectada',L.zSkin],['s','zBlood','Quantidade de sangue',L.zBlood],['c','zBloodCol','Cor do sangue'],['s','zMouth','Boca',L.zMouth],['s','zEyes','Olhos',L.zEyes],['s','zWound','Ferimentos',L.zWound],['s','zBones','Ossos / órgãos expostos',L.zBones],['s','zHead','Cabeça',L.zHead],['s','zVeins','Veias da infecção',L.yn],['s','zTorn','Roupa rasgada',L.yn]]
};
const ZS={verde:['#7f8f6c',.6],palido:['#c9cfc4',.65],cinza:['#7d8386',.7],roxo:['#6a5a7a',.55],podre:['#8a8a3a',.62],queimado:['#241a16',.72]},ZE={amarelo:'#d8d45a',branco:'#d6d9cb',vermelho:'#ff2a2a'};
const SPACC={gaucho:'#b3262a',cowboy:'#b3262a',astronaut:'#e0652a',astro_or:'#ffffff',cangaceiro:'#c9a23c',esquimo:'#efe6d3',pm:'#d9d9d9',gcm:'#8fb3d9',bope:'#c9c9c9',ze:'#d9a441',marinheiro:'#1c2e5a',fab:'#d9a441',coronel:'#d9a441',futuro:'#26e0ff',legado7:'#ffc400',c54:'#27a8ff',
 ceifador:'#8affc9',cyber:'#ff2fd0',robo:'#26e0ff',anjo:'#ffe58a',demonio:'#ff5a1f',mago:'#f1c40f',saci:'#d62828',alien:'#7cff4f',samurai:'#c9a23c',cavaleiro:'#d9a441',indio:'#e03a2a',curupira:'#ff7a1a',
 viking:'#b9b9b9',ninja:'#c1121f',pirata:'#c9a23c',rock:'#ff2fd0',f1:'#f2d21b',vampiro:'#b3262a',selecao:'#1e8e3c',capoeira:'#1e8e3c',malandro:'#c1121f',bombeiro:'#f2d21b',mergulhador:'#f2d21b',boxeador:'#d9a441',caipira:'#d9bf72',chef:'#b94138',noel:'#ff3b3b',estreia:'#f2c200',coelho:'#ff9fd0',reveillon:'#f2c14e',folia:'#ff2fd0',palhaco:'#e8222e',florista:'#ff7aa8',sanfoneiro:'#c1121f',surfista:'#27d3ff',iara:'#1fb5a8',patriota:'#ffdf00',petista:'#d4121f',abobora:'#e8761a',marechal:'#f2c14e',samu:'#f4f4f1'};
const SPDEF={gaucho:{shirt:'#e8e2d2',pants:'#6b6a45',shoes:'#2a1d14'},cowboy:{shirt:'#a32d2d',pants:'#3d5a80',shoes:'#5a3a22'},astronaut:{shirt:'#eef1f3',pants:'#eef1f3',shoes:'#8a8f94'},astro_or:{shirt:'#e8651a',pants:'#e8651a',shoes:'#3a2a1a'},
 cangaceiro:{shirt:'#b59b6b',pants:'#8a7448',shoes:'#5a3a22'},esquimo:{shirt:'#7a5a3c',pants:'#5a4430',shoes:'#3a2a1c'},
 pm:{shirt:'#27406b',pants:'#1f3355',shoes:'#111111'},gcm:{shirt:'#16243c',pants:'#101b2e',shoes:'#111111'},bope:{shirt:'#0d0e10',pants:'#0d0e10',shoes:'#0a0a0a'},
 ze:{shirt:'#f2d21b',pants:'#2a5db0',shoes:'#f4f4f4',outfit:'shorts'},marinheiro:{shirt:'#f4f4f1',pants:'#f4f4f1',shoes:'#111111'},fab:{shirt:'#5b6a3f',pants:'#5b6a3f',shoes:'#1a1a1a'},
 coronel:{shirt:'#6b6a3d',pants:'#6b6a3d',shoes:'#3a2a1c'},futuro:{shirt:'#1a2230',pants:'#1a2230',shoes:'#0c1118'},legado7:{shirt:'#0e0f12',pants:'#0e0f12',shoes:'#08090b'},c54:{shirt:'#14388c',pants:'#0f2a6b',shoes:'#08142e'},
 ceifador:{shirt:'#0b0b10',pants:'#0b0b10',shoes:'#0b0b10',skin:'#e9e6d8'},cyber:{shirt:'#161426',pants:'#1c1f2e',shoes:'#ff2fd0',hair:'#27e0ff'},robo:{shirt:'#8a949c',pants:'#6d7780',shoes:'#3b4248',skin:'#aeb7bd'},
 anjo:{shirt:'#f6f1e7',pants:'#f6f1e7',shoes:'#e8dcc0'},demonio:{shirt:'#2a0d0d',pants:'#2a0d0d',shoes:'#140808',skin:'#b3302a'},mago:{shirt:'#4b2a86',pants:'#3a206b',shoes:'#2a1d14',hair:'#f1ecdf'},
 saci:{shirt:'#c01f1f',pants:'#c01f1f',shoes:'#2a1d14',outfit:'shorts'},alien:{shirt:'#2b3a55',pants:'#2b3a55',shoes:'#1a2230',skin:'#7fd35a',head:1.12},
 samurai:{shirt:'#2a2f4a',pants:'#1c1f33',shoes:'#2a1d14'},cavaleiro:{shirt:'#aab4bd',pants:'#8f99a3',shoes:'#6d7780'},indio:{shirt:'#000000',pants:'#c9a46b',shoes:'#000000'},curupira:{shirt:'#2f6b3a',pants:'#3f7a45',shoes:'#6b4a2a',hair:'#ff7a1a'},
 viking:{shirt:'#7a5a3c',pants:'#4a3a2a',shoes:'#3a2a1c',beard:'beard',hair:'#a8642a'},ninja:{shirt:'#0d0e12',pants:'#0d0e12',shoes:'#0d0e12'},pirata:{shirt:'#f1ecdf',pants:'#3a2a1c',shoes:'#1a1208'},
 rock:{shirt:'#1c1c24',pants:'#15151b',shoes:'#c1121f',hairStyle:'mohawk',hair:'#ff2fd0'},f1:{shirt:'#1e3a8a',pants:'#1e3a8a',shoes:'#f2d21b'},vampiro:{shirt:'#1a0b10',pants:'#120a0d',shoes:'#0a0a0a',skin:'#e8dede',eyes:'#d62828',hairStyle:'slick',hair:'#0c0b0a'},
 selecao:{shirt:'#f2d21b',pants:'#2a5db0',shoes:'#f4f4f4',outfit:'shorts'},capoeira:{shirt:'#000000',pants:'#f4f1e8',shoes:'#000000'},malandro:{shirt:'#f4f1e8',pants:'#f4f1e8',shoes:'#f4f1e8'},
 bombeiro:{shirt:'#d9a31e',pants:'#1c1f26',shoes:'#111111'},mergulhador:{shirt:'#101820',pants:'#101820',shoes:'#101820'},boxeador:{shirt:'#000000',pants:'#1e8e3c',shoes:'#f4f4f4',outfit:'shorts'},
 caipira:{shirt:'#c0392b',pants:'#3d5a80',shoes:'#5a3a22'},chef:{shirt:'#f6f6f2',pants:'#2f3640',shoes:'#f6f6f2'},samu:{shirt:'#e0652a',pants:'#e0652a',shoes:'#111111'},estreia:{shirt:'#15171b',pants:'#1a1c21',shoes:'#0f1013',outfit:'jaqueta'},noel:{shirt:'#c1121f',pants:'#c1121f',shoes:'#1a1208',beard:'beard',hair:'#ffffff'},coelho:{shirt:'#ff9fd0',pants:'#8a5a34',shoes:'#f6f6f2',hair:'#f6f6f2'},reveillon:{shirt:'#f6f6f2',pants:'#f6f6f2',shoes:'#f2c14e'},folia:{shirt:'#ff2fd0',pants:'#27e0ff',shoes:'#ffd400'},palhaco:{shirt:'#e8222e',pants:'#27a8e8',shoes:'#ffd400'},florista:{shirt:'#ff9fc4',pants:'#fff3f8',shoes:'#c77dff'},sanfoneiro:{shirt:'#a32d2d',pants:'#3d5a80',shoes:'#5a3a22'},surfista:{shirt:'#e0ac85',pants:'#ff7a1a',shoes:'#e0ac85'},iara:{shirt:'#1fb5a8',pants:'#0e6f78',shoes:'#0e6f78'},patriota:{shirt:'#ffdf00',pants:'#0c8f3c',shoes:'#f6f6f2'},petista:{shirt:'#d4121f',pants:'#1f3f7a',shoes:'#f6f6f2'},abobora:{shirt:'#2a1a3a',pants:'#1c1030',shoes:'#111111'},marechal:{shirt:'#17306b',pants:'#f1efe6',shoes:'#1a1208'}};
const NEW=['estreia','ceifador','cyber','robo','anjo','demonio','mago','saci','alien','samurai','cavaleiro','indio','curupira','viking','ninja','pirata','rock','f1','vampiro','selecao','capoeira','malandro','bombeiro','mergulhador','boxeador','caipira','chef','samu','noel','coelho','reveillon','folia','palhaco','florista','sanfoneiro','surfista','iara','patriota','petista','abobora','marechal'];
const HAT_HAIR=['cangaceiro','pm','gcm','marinheiro','coronel','mago','saci','pirata','malandro','caipira','noel','ze','estreia','samu','chef','curupira','coelho'];   // só chapéu/boné: o cabelo comprido aparece por baixo
const HIDE=['estreia','ze','cangaceiro','pm','bope','gcm','marinheiro','fab','coronel','esquimo','futuro','legado7','c54','ceifador','robo','mago','saci','alien','samurai','cavaleiro','viking','ninja','pirata','f1','curupira','malandro','bombeiro','mergulhador','caipira','chef','samu','noel','coelho','palhaco','abobora','marechal','sanfoneiro','iara'];
HIDE.push('gotinha','cupido','bruxa','servidor','catrina','sambista','dev');NEW.push('gotinha','cupido','bruxa','servidor','catrina','sambista','dev');
Object.assign(SPACC,{gotinha:'#35c2ff',cupido:'#ff5c93',bruxa:'#6fcf3a',servidor:'#8aa1b8',catrina:'#ff9f2e',sambista:'#e0252e',dev:'#2fe08a'});
Object.assign(SPDEF,{gotinha:{shirt:'#f4f7fb',pants:'#f4f7fb',shoes:'#35c2ff'},cupido:{shirt:'#f6f1e7',pants:'#f6f1e7',shoes:'#e8dcc0',outfit:'shorts',hair:'#f2c14e'},bruxa:{shirt:'#4b2a86',pants:'#2b1950',shoes:'#140a22',skin:'#7fd35a',hair:'#1a1a1a'},
 servidor:{shirt:'#f1f3f6',pants:'#2b3442',shoes:'#15171b'},catrina:{shirt:'#15101c',pants:'#15101c',shoes:'#15101c',skin:'#f4f1e8',hair:'#15101c'},sambista:{shirt:'#f6f6f2',pants:'#f6f6f2',shoes:'#f6f6f2'},dev:{shirt:'#1d2733',pants:'#202a38',shoes:'#f4f4f4'}});
const BARE=['capoeira','saci','indio','boxeador','surfista'],BAREFOOT=['capoeira','saci','indio','surfista'];
Object.assign(SPACC,Object.assign({},{onca:'#7cff4f',lobo:'#ff2a1a',tupa:'#27b8ff',boiuna:'#27e0c0',bateria:'#ff3fa4',uira:'#27e0c0',caboclo:'#e0302a',frevo:'#f2d21b'},{curupira2:'#ff7a1a',anhanga:'#7cffd0',paje:'#7cffd0',vaqueiro:'#d9a441',gigante:'#ff3fa4',vitoria:'#ff8fc0',bicho:'#ff2a3a',pirarucu:'#c9532a'},{saci:'#c01f1f',maeouro:'#ffcf3a',matinta:'#ffd23a',guara:'#ff9a1a',carranca:'#d9a441',sanfa:'#c1121f',jang:'#2a5db0',manda:'#fff6ec'},{garantido:'#ff2a3a',caprichoso:'#3a6bff',boitata:'#ff7a1a',iara:'#27e0c0',boto:'#ff7ab8',mapinguari:'#ff3a2a',cuca:'#9cff4a',mula:'#ff6a1a'}));
Object.assign(SPDEF,Object.assign({},{onca:{shirt:'#d99a2b',pants:'#d99a2b',shoes:'#241208',skin:'#d99a2b'},lobo:{shirt:'#6b5a4a',pants:'#3a3a40',shoes:'#2c2c34',skin:'#4a4a52'},
 tupa:{shirt:'#6b4028',pants:'#e8e2d0',shoes:'#6b4028',skin:'#6b4028'},boiuna:{shirt:'#1f6b3a',pants:'#1f6b3a',shoes:'#1f6b3a',skin:'#3f8a54'},
 bateria:{shirt:'#a8673f',pants:'#a8673f',shoes:'#e8b53a',skin:'#a8673f'},uira:{shirt:'#b3501c',pants:'#7a2f10',shoes:'#f08a1c',skin:'#b3501c'},
 caboclo:{shirt:'#c1121f',pants:'#2a5db0',shoes:'#1a1a1a',skin:'#6a4332'},frevo:{shirt:'#f2d21b',pants:'#2a5db0',shoes:'#e0302a',skin:'#8a5b43'}},{curupira2:{shirt:'#3f7a45',pants:'#5a3c22',shoes:'#6b4a2a',skin:'#4f8a4a'},anhanga:{shirt:'#16241f',pants:'#16241f',shoes:'#0a0a0c',skin:'#efe6d3'},
 paje:{shirt:'#6b4a2a',pants:'#6b4a2a',shoes:'#4a2e1a',skin:'#8a5b43'},vaqueiro:{shirt:'#6b4a2a',pants:'#3d5a80',shoes:'#4a2e1a',skin:'#b9805f'},
 gigante:{shirt:'#f2d21b',pants:'#e0302a',shoes:'#2a5db0',skin:'#f2c9a0'},vitoria:{shirt:'#2f8a5a',pants:'#1f8f5a',shoes:'#1f8f5a',skin:'#c99a7a'},
 bicho:{shirt:'#08080c',pants:'#08080c',shoes:'#08080c',skin:'#14101e'},pirarucu:{shirt:'#7a2f1e',pants:'#5a6a5a',shoes:'#8a2a1a',skin:'#5a6a5a'}},{saci:{shirt:'#2a1a10',pants:'#c01f1f',shoes:'#2a1a10',skin:'#2a1a10'},maeouro:{shirt:'#e8b53a',pants:'#e8b53a',shoes:'#e8b53a',skin:'#f1c85a'},
 matinta:{shirt:'#2e2a38',pants:'#2e2a38',shoes:'#14100c',skin:'#a88a64'},carranca:{shirt:'#3a2a1c',pants:'#2a5db0',shoes:'#4a2e1a',skin:'#8a5530'},
 guara:{shirt:'#d9691f',pants:'#14100c',shoes:'#14100c',skin:'#d9691f'},sanfa:{shirt:'#e8e2d0',pants:'#4a5a72',shoes:'#4a2e1a',skin:'#b9805f'},
 jang:{shirt:'#f4f1ea',pants:'#2a5db0',shoes:'#b9805f',skin:'#b9805f'},manda:{shirt:'#3f8a4a',pants:'#2b6a38',shoes:'#2b6a38',skin:'#3f8a4a'}},{garantido:{shirt:'#c1121f',pants:'#f4f1ea',shoes:'#c9a23c',skin:'#7a4a32'},caprichoso:{shirt:'#1e40af',pants:'#0b0b10',shoes:'#c9a23c',skin:'#7a4a32'},
 boitata:{shirt:'#1a0a06',pants:'#1a0a06',shoes:'#ff7a1a',skin:'#3a1a0e'},iara:{shirt:'#0f9d8a',pants:'#0f9d8a',shoes:'#0f9d8a',skin:'#e6d3c3'},
 boto:{shirt:'#f6f3ea',pants:'#f6f3ea',shoes:'#f6f3ea',skin:'#f08ab4'},mapinguari:{shirt:'#6b4a2a',pants:'#5a3c22',shoes:'#3a2616',skin:'#6b4a2a'},
 cuca:{shirt:'#5b2a86',pants:'#3a1a5a',shoes:'#1a0d24',skin:'#5a8a3a'},mula:{shirt:'#4a0d12',pants:'#2a0a0c',shoes:'#140808',skin:'#cfc0b0'}}));
const WIDEX=Object.assign({},{lobo:1.2,onca:1.1,tupa:1.05},{bicho:1.1,pirarucu:1.12},{guara:1.05,matinta:1.05},{mapinguari:1.3,garantido:1.08,caprichoso:1.08,cuca:1.05});
BARE.push(...[].concat(['tupa','bateria'],[],['saci'],[]));BAREFOOT.push(...[].concat(['tupa','onca','lobo'],['paje','vitoria','curupira2'],['saci','jang'],['mapinguari','boitata']));
HIDE.push(...Object.keys(SPDEF).filter(k=>!HIDE.includes(k)));NEW.push(...Object.keys(SPDEF).filter(k=>!NEW.includes(k)));
const LS=['hoodie','jaqueta','jaleco','social','macacao'];
const GLV={samurai:'#2a2f4a',cavaleiro:'#9aa4ae',ninja:'#0d0e12',robo:'#6d7780',bombeiro:'#1c1f26',mergulhador:'#101820',f1:'#f2d21b',viking:'#3a2a1c',ceifador:'#0b0b10',samu:'#1c1f26',cyber:'#161426',estreia:'#15171b'};
const SETS={
 'Executivo':{outfit:'social',shirt:'#e8e8e8',pants:'#1c1f22',shoes:'#1c1f22',accent:'#b94138',hairStyle:'slick'},
 'Streetwear':{outfit:'hoodie',shirt:'#6a4a8a',pants:'#2f3640',shoes:'#f2d21b',helmet:'cap',accent:'#e0652a'},
 'Rockeiro':{outfit:'jaqueta',shirt:'#1f2326',pants:'#1c1f22',shoes:'#1c1f22',accent:'#d5d5d5'},
 'Médico':{outfit:'jaleco',shirt:'#f4f4f4',pants:'#3c8da8',shoes:'#e8e8e8'},
 'Mecânico':{outfit:'macacao',shirt:'#2a5db0',shoes:'#1c1f22',helmet:'cap',accent:'#f2d21b'},
 'Pedreiro':{outfit:'tshirt',shirt:'#c9a23c',pants:'#4a5a72',shoes:'#6b5a42',helmet:'hardhat'},
 'Cozinheiro':{outfit:'jaleco',shirt:'#f6f6f2',pants:'#2f3640',shoes:'#e8e8e8',helmet:'chef'},
 'Praia':{outfit:'regata',shirt:'#ff5fa2',pants:'#e0652a',shoes:'#e8e8e8',helmet:'sun',accent:'#d9bf72'},
 'Pescador':{outfit:'tshirt',shirt:'#3f6b4a',pants:'#6b5a42',shoes:'#3a2a1c',helmet:'bucket',accent:'#d9bf72'},
 'Futebol de domingo':{outfit:'shorts',shirt:'#f2d21b',pants:'#2a5db0',shoes:'#e8e8e8'},
 'Skatista':{outfit:'tshirt',shirt:'#1f2326',pants:'#7a7f85',shoes:'#e8e8e8',helmet:'beanie'},
 'Festa de gala':{outfit:'vestido',shirt:'#b94138',shoes:'#111111',hairStyle:'bun'},
 'Artista':{outfit:'social',shirt:'#6a4a8a',pants:'#e8e8e8',shoes:'#8a2f2f',helmet:'beret',accent:'#c9a23c'},
 'Mágico de cartola':{outfit:'social',shirt:'#e8e8e8',pants:'#1c1f22',shoes:'#1c1f22',helmet:'tophat',accent:'#b94138'}
};
const KITS={
 'Fuzileiro':{camo:'woodland',helmet:'ach',vest:'plate',goggles:'none',headset:'comms',mask:'none',pack:'assault',hairStyle:'crew',beard:'none'},
 'Recon':{camo:'desert',helmet:'boonie',vest:'plate',goggles:'tac',headset:'none',mask:'bandana',pack:'large',hairStyle:'short',beard:'beard'},
 'Fantasma':{camo:'black',helmet:'ach',vest:'heavy',goggles:'nvg',headset:'comms',mask:'balaclava',pack:'none'},
 'Inverno':{camo:'snow',helmet:'beanie',vest:'plate',goggles:'tac',headset:'none',mask:'bandana',pack:'assault'},
 'Urbano':{outfit:'tshirt',camo:'urban',helmet:'cap',vest:'none',goggles:'none',headset:'none',mask:'none',pack:'none'},
 'Pesado':{camo:'olive',helmet:'ach',vest:'heavy',goggles:'tac',headset:'comms',mask:'none',pack:'large'}
};
const POSES={ // graus [x,y,z]; x negativo = para frente
 idle:{head:[0,0,0],spine:[0,0,0],aL:[0,0,4],aR:[0,0,-4],fL:[-8,0,0],fR:[-8,0,0]},
 armed:{head:[0,6,0],spine:[0,-6,0],aL:[-62,0,-22],aR:[-42,0,10],fL:[-45,0,0],fR:[-70,0,0]},
 aim:{head:[-4,14,0],spine:[2,-14,0],aL:[-78,0,-18],aR:[-58,0,8],fL:[-30,0,0],fR:[-60,0,0]},
 relax:{head:[0,0,0],spine:[0,0,0],aL:[3,0,8],aR:[3,0,-8],fL:[-15,0,0],fR:[-15,0,0]},
 zombie:{head:[14,8,6],spine:[12,0,0],aL:[-85,0,-8],aR:[-80,0,8],fL:[-10,0,0],fR:[-10,0,0]}
};
const CAMO={woodland:['#4b5a32','#2f3a22','#6b5a3a','#1f2417'],desert:['#b99c6b','#9a7f52','#d2bd91','#7a6340'],urban:['#6f757a','#4c5156','#8e949a','#2f3236'],
 olive:['#4a5240','#3b4232','#59614b','#2e3328'],black:['#1b1d20','#25282c','#141517','#2d3135'],snow:['#d8dde0','#b9c1c6','#eef1f2','#8f979d']};
const VEST={woodland:'#3d4433',desert:'#8a7650',urban:'#2f3438',olive:'#3a4030',black:'#1c1e21',snow:'#9aa3a8'};

// ---------- helpers de geometria ----------
let rig={};const root=new THREE.Group();
const camoCache={};
function camoTex(n){
 if(camoCache[n])return camoCache[n];
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),p=CAMO[n];
 g.fillStyle=p[0];g.fillRect(0,0,128,128);let seed=n.length*977+13;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let i=0;i<70;i++){g.fillStyle=p[1+i%3];g.beginPath();g.ellipse(rnd()*128,rnd()*128,6+rnd()*16,4+rnd()*9,rnd()*3,0,7);g.fill()}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.repeat.set(1.5,1.5);
 return camoCache[n]=t;
}
const camoMat=(n,z)=>new THREE.MeshStandardMaterial({map:camoTex(n),roughness:.88,metalness:0,color:z?0x8f8a7a:0xffffff});
let TINT=null;   // croma com mudança de cor (hue/sat/lit): vale para tudo que não é pele
const M=(c,mt=.05,r=.75)=>{const m=new THREE.MeshStandardMaterial({color:c,metalness:mt,roughness:r});if(TINT&&typeof c==='string'&&c.toLowerCase()!==TINT.skin){const t={};m.color.getHSL(t,THREE.SRGBColorSpace);m.color.setHSL(t.h+TINT.h/360,Math.max(0,Math.min(1,t.s+TINT.s)),Math.max(0,Math.min(1,t.l+TINT.l)),THREE.SRGBColorSpace)}return m};   // cálculo em sRGB (a cor que o olho vê)
const glow=(c,i=1.8)=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:i});
const mix=(a,b,t)=>'#'+new THREE.Color(a).lerp(new THREE.Color(b),t).getHexString();
// ---- skins vivas: chamas e brasas animadas ----
const flameG=(par,n,rx,rz,y,h,c1,c2,k=1,cx=0)=>{const a=[];for(let i=0;i<n;i++){const an=i*2.4;a.push(mesh(par,new THREE.ConeGeometry(.035*k,h*(.7+(i%3)*.2),8),i%2?c1:c2,[cx+Math.cos(an)*rx*(.3+(i%4)*.2),y,Math.sin(an)*rz*(.3+(i%4)*.2)]))}
 rig.fx.push(t=>a.forEach((m,i)=>{m.scale.set(1,1+Math.sin(t*9+i*1.9)*.25+Math.sin(t*14+i)*.12,1);m.rotation.z=Math.sin(t*5+i)*.15;m.rotation.x=Math.cos(t*4+i*1.3)*.15}));return a};
const embersG=(par,n,rad,y0,hgt,col,sp=.4)=>{const a=[];for(let i=0;i<n;i++)a.push(ball(par,.012,[0,0,0],glow(col,2)));
 rig.fx.push(t=>a.forEach((b,i)=>{const k=(t*sp+i/n)%1;b.position.set(Math.sin(i*2.4+k*3)*rad*(1-k*.5),y0+k*hgt,Math.cos(i*2.4+k*3)*rad*(1-k*.5));b.scale.setScalar(1-k)}))};
const mesh=(p,g,m,pos=[0,0,0],rot=[0,0,0],sc=[1,1,1])=>{const o=new THREE.Mesh(g,m);o.position.set(...pos);o.rotation.set(...rot);o.scale.set(...sc);o.castShadow=o.receiveShadow=true;p.add(o);return o};
const bx=(p,s,pos,m,rot)=>mesh(p,new THREE.BoxGeometry(...s),m,pos,rot);
const ball=(p,r,pos,m,sc)=>mesh(p,new THREE.SphereGeometry(r,16,12),m,pos,[0,0,0],sc);
const cyl=(p,r,h,pos,m,rot)=>mesh(p,new THREE.CylinderGeometry(r,r,h,18),m,pos,rot);
const cap=(p,len,r,m)=>mesh(p,new THREE.CapsuleGeometry(r,Math.max(.01,len-r),4,12),m,[0,-len/2,0]);
const J=(p,n,pos)=>{const g=new THREE.Group();g.position.set(...pos);p.add(g);rig[n]=g;return g};

let plaidT;
function plaidMat(){if(!plaidT){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#a32d2d';g.fillRect(0,0,64,64);
 g.fillStyle='rgba(20,20,20,.55)';for(let i=0;i<64;i+=32){g.fillRect(i,0,10,64);g.fillRect(0,i,64,10)}g.fillStyle='rgba(240,230,210,.6)';g.fillRect(18,0,2,64);g.fillRect(0,18,64,2);
 plaidT=new THREE.CanvasTexture(c);plaidT.wrapS=plaidT.wrapT=THREE.RepeatWrapping;plaidT.repeat.set(2,2);plaidT.colorSpace=THREE.SRGBColorSpace}
 return new THREE.MeshStandardMaterial({map:plaidT,roughness:.9})}
function makeWeapon(type,side,col){
 const g=new THREE.Group(),d=M(col||'#1c1e21',.5,.45),t=M('#2e3236',.4,.5);let grips;
 if(type==='pistol'){bx(g,[.035,.05,.17],[0,0,.1],d);bx(g,[.03,.1,.04],[0,-.07,.03],d,[.25,0,0]);bx(g,[.02,.015,.02],[0,.03,.18],t);grips=[[side,[0,-.07,.03]]]}
 else if(type==='smg'){bx(g,[.05,.07,.3],[0,0,.12],d);cyl(g,.011,.16,[0,.01,.35],t,[T/2,0,0]);bx(g,[.03,.14,.05],[0,-.1,.14],d,[.1,0,0]);bx(g,[.035,.1,.04],[0,-.08,0],d,[.3,0,0]);bx(g,[.03,.03,.1],[0,.05,.1],t);grips=[[side,[0,-.08,0]]]}
 else if(type==='lmg'){bx(g,[.06,.09,.5],[0,0,.18],d);bx(g,[.045,.045,.3],[0,0,.5],t);cyl(g,.013,.3,[0,.01,.8],d,[T/2,0,0]);bx(g,[.11,.1,.14],[0,-.11,.2],t);bx(g,[.05,.12,.05],[0,-.08,.02],d,[.4,0,0]);bx(g,[.05,.1,.14],[0,-.01,-.07],t);bx(g,[.02,.1,.02],[.03,-.06,.7],d,[0,0,.4]);bx(g,[.02,.1,.02],[-.03,-.06,.7],d,[0,0,-.4]);bx(g,[.04,.04,.18],[0,.075,.2],d);grips=[['R',[0,-.09,.02]],['L',[0,-.04,.4]]]}
 else if(type==='shotgun'){bx(g,[.05,.06,.34],[0,0,.14],d);cyl(g,.015,.5,[0,.02,.5],t,[T/2,0,0]);bx(g,[.06,.05,.22],[0,-.025,.42],t);bx(g,[.045,.1,.05],[0,-.07,.02],d,[.35,0,0]);bx(g,[.045,.09,.14],[0,-.01,-.07],t);grips=[['R',[0,-.08,.02]],['L',[0,-.03,.42]]]}
 else if(type==='sniper'){bx(g,[.05,.07,.4],[0,0,.15],d);cyl(g,.011,.5,[0,.01,.6],t,[T/2,0,0]);bx(g,[.045,.05,.3],[0,0,.45],t);cyl(g,.03,.22,[0,.095,.18],d,[T/2,0,0]);bx(g,[.03,.1,.04],[0,.045,.18],t);bx(g,[.035,.12,.06],[0,-.09,.2],d,[.1,0,0]);bx(g,[.045,.11,.05],[0,-.08,.02],d,[.4,0,0]);bx(g,[.05,.1,.16],[0,-.01,-.08],t);bx(g,[.02,.12,.02],[.03,-.07,.75],t,[0,0,.4]);bx(g,[.02,.12,.02],[-.03,-.07,.75],t,[0,0,-.4]);grips=[['R',[0,-.09,.02]],['L',[0,-.03,.36]]]}
 else{bx(g,[.05,.07,.46],[0,0,.18],d);bx(g,[.04,.04,.3],[0,0,.44],t);cyl(g,.01,.22,[0,.01,.7],d,[T/2,0,0]);bx(g,[.035,.16,.06],[0,-.1,.2],d,[.15,0,0]);
  bx(g,[.045,.12,.05],[0,-.08,.02],d,[.4,0,0]);bx(g,[.045,.09,.12],[0,-.01,-.06],t);bx(g,[.04,.045,.14],[0,.065,.2],t);grips=[['R',[0,-.09,.02]],['L',[0,-.03,.36]]]}
 return {g,grips,type,side};
}

// ---------- construção do personagem (só quando algo muda) ----------
const _tx={};
function txt(t,fg,ratio=.3){const k=t+fg;if(_tx[k])return _tx[k];const c=document.createElement('canvas');c.width=256;c.height=Math.round(256*ratio);const g=c.getContext('2d');
 const fs=Math.floor(Math.min(c.height*.8,c.width*.92/(t.length*.62)));g.fillStyle=fg;g.font='bold '+fs+'px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,128,c.height/2);
 const x=new THREE.CanvasTexture(c);x.colorSpace=THREE.SRGBColorSpace;return _tx[k]=new THREE.MeshBasicMaterial({map:x,transparent:true,depthWrite:false})}
function build(){
 root.traverse(o=>o.geometry&&o.geometry.dispose());root.clear();rig={fx:[]};
 const CV=S.special!=='none'&&S.chroma?chromaDef(S.special,S.chroma):null,s=S.special!=='none'?Object.assign({},S,{helmet:'none',goggles:'none',mask:'none',headset:'none',vest:'none',pack:'none',kneepads:'off',outfit:'tshirt'},SPDEF[CV&&CV.as||S.special],CV?Object.assign({cv:CV},CV.p,CV.as?{special:CV.as}:null):null):S,P1=CV&&CV.a?CV.a:'#ff2fd0',P2=CV&&CV.b?CV.b:'#27e0ff',YL=CV&&CV.yl,DK=!!(CV&&CV.dk),H=s.height,B=s.build,SH=s.shoulders,hs=s.head,z=s.mode==='zombie',f=s.gender==='female';
 TINT=CV&&(CV.hue!=null||CV.sat!=null||CV.lit!=null)?{h:CV.hue||0,s:CV.sat||0,l:CV.lit||0,skin:CV.tintSkin?'':String(s.skin||'').toLowerCase()}:null;
 if(s.special!=='none'){if(BARE.includes(s.special))s.shirt=s.skin;if(BAREFOOT.includes(s.special))s.shoes=s.skin}
 const zs=ZS[s.zSkin]||ZS.verde,skin=M(z?mix(s.skin,zs[0],zs[1]):s.skin,0,.82),cm=camoMat(s.camo,z),vm=M(VEST[s.camo],.1,.8),dark=M('#1b1c1e',.25,.65),ink=M('#1c2630',0,.9),NEONC=s.special==='c54'?'#27a8ff':s.special==='legado7'?(CV&&CV.neon||'#ffc400'):'#26e0ff',neon=new THREE.MeshStandardMaterial({color:NEONC,emissive:NEONC,emissiveIntensity:1.8});
 const SPK=s.special,spc=SPK!=='none',mil=s.outfit==='military',tall=mil||(spc&&!BAREFOOT.includes(SPK)),wide=WIDEX[SPK]?WIDEX[SPK]:SPK==='gaucho'?1.5:(SPK==='astronaut'||SPK==='astro_or')?1.2:['cavaleiro','robo','viking','samurai','demonio'].includes(SPK)?1.12:1,tm=mil?cm:(SPK==='cowboy'||SPK==='caipira'||SPK==='sanfoneiro')?plaidMat():SPK==='robo'?M(s.shirt,.85,.28):M(s.shirt,0,.9),pm=mil?cm:(s.outfit==='macacao'||s.outfit==='vestido')?tm:SPK==='robo'?M(s.pants,.85,.3):M(s.pants,0,.85);
 const boot=M(mil?'#1d1a17':s.shoes,.2,.6),acc=M(s.accent,.15,.55),glove=SPK==='astro_or'?M('#e8651a',.1,.5):SPK==='astronaut'?M('#eef1f3',.1,.5):SPK==='bope'||(SPK==='futuro'||SPK==='legado7'||SPK==='c54')?dark:GLV[SPK]?M(GLV[SPK],.3,.6):spc?skin:(s.gloves==='on'&&!z?dark:skin);
 const sho=s.outfit==='shorts'||s.outfit==='regata',dress=s.outfit==='vestido',slv=s.outfit==='regata';
 const hipsY=.9*H+.07,thL=.46*H,shL=.44*H,sw=.2*B*SH*(f?.92:1),hw=.095*B*(f?1.12:1);
 const legFx=(t,sh,sd)=>{const stl=M(DK?'#17191d':'#aab4bd',.8,.3),gd=M('#d9a441',.8,.3),sv=M('#d5d5d5',.5,.3),fu=M('#4a3220',0,1);
  if(SPK==='selecao'){cyl(sh,.058*B,.3,[0,-shL*.7,0],M('#f4f4f1',0,.8));cyl(sh,.059*B,.04,[0,-shL*.48,0],M('#1e8e3c',0,.7))}
  if(SPK==='cavaleiro'){cyl(sh,.066*B*wide,.34,[0,-shL*.55,0],stl);cyl(t,.083*B*wide,.3,[0,-thL*.45,0],stl);ball(sh,.06*B,[0,0,.02],stl)}
  if(SPK==='samurai'){cyl(sh,.066*B*wide,.22,[0,-shL*.5,0],M('#2a2f4a',.3,.6));cyl(sh,.068*B*wide,.03,[0,-shL*.15,0],gd)}
  if(SPK==='viking'){cyl(sh,.067*B*wide,.2,[0,-shL*.55,0],M('#7a5a3c',0,1));cyl(sh,.069*B*wide,.02,[0,-shL*.3,0],M('#2a1d14',0,.9))}
  if(SPK==='bombeiro'){cyl(sh,.062*B,.03,[0,-shL*.55,0],sv);cyl(t,.08*B,.03,[0,-thL*.5,0],sv)}
  if(SPK==='mergulhador'){bx(sh,[.12*B,.022,.46],[0,-shL+.03,.2],M('#f2d21b',0,.6));cyl(t,.081*B,.03,[0,-thL*.5,0],M('#f2d21b',0,.6))}
  if(SPK==='f1')cyl(t,.081*B,.03,[0,-thL*.55,0],M('#f4f4f1',0,.6));
  if(SPK==='estreia'){cyl(t,.083*B,.035,[0,-thL*.5,0],YL?glow(YL,.9):M('#f2c200',.2,.5));cyl(sh,.062*B,.03,[0,-shL*.55,0],M('#f1f0ea',.1,.55))}
  if(SPK==='pirata'){const lt=M('#2a1d14',.1,.7);cyl(sh,.07*B,.16,[0,-shL*.8,0],lt);cyl(sh,.092*B,.035,[0,-shL*.66,0],lt)}
  if(SPK==='caipira')bx(t,[.07,.07,.012],[0,-thL*.5,.08*B],M('#c9a23c',0,.9));
  if(SPK==='indio')cyl(sh,.06*B,.025,[0,-shL*.25,0],M('#e03a2a',0,.8));
  if(SPK==='ninja')cyl(sh,.06*B,.12,[0,-shL*.6,0],M('#2a2d34',0,.9));
  if(SPK==='cyber')bx(t,[.012,.3*H,.012],[0,-thL*.5,.082*B],glow(P1));
  if(SPK==='robo'){ball(sh,.065*B,[0,0,0],M('#4a525a',.85,.3));bx(t,[.012,.3*H,.012],[0,-thL*.5,.082*B],glow('#26e0ff'))}
  if(SPK==='curupira')cyl(sh,.06*B,.04,[0,-shL*.8,0],M('#2f6b3a',0,.9));
  if(SPK==='anjo')cyl(sh,.06*B,.03,[0,-shL*.2,0],gd);
  if(SPK==='tupa')cyl(sh,.06*B,.05,[0,-shL*.3,0],M('#27b8ff',.3,.4));
  if(SPK==='bateria')cyl(sh,.06*B,.05,[0,-shL*.15,0],M('#e8b53a',.9,.2));
  if(SPK==='caboclo')cyl(sh,.066*B,.14,[0,-shL*.7,0],M('#f2d21b',0,.8));
  if(SPK==='lobo')cyl(sh,.07*B*wide,.2,[0,-shL*.5,0],M('#2c2c34',0,1));
  if(SPK==='curupira2')flameG(sh,4,.05,.05,-shL+.08,.2,glow('#ff7a1a',2.2),glow('#ffd23a',2.4),.7);
  if(SPK==='vaqueiro'){const lt=M('#6b4a2a',.05,.8);cyl(sh,.075*B,.34,[0,-shL*.55,0],lt);cyl(t,.092*B,.3,[0,-thL*.5,0],lt);
   const sr=mesh(sh,new THREE.TorusGeometry(.03,.006,6,10),M('#d9a441',.9,.25),[0,-shL+.03,-.1],[0,T/2,0]);rig.fx.push(tm=>{sr.rotation.x=tm*6})}
  if(SPK==='carranca')cyl(sh,.062*B,.05,[0,-shL*.3,0],M('#d9a441',.9,.25));
  if(SPK==='garantido'||SPK==='caprichoso')cyl(sh,.066*B*wide,.1,[0,-shL*.55,0],gd);
  if(SPK==='mapinguari'){cyl(sh,.07*B*wide,.2,[0,-shL*.5,0],fu);cyl(t,.085*B*wide,.2,[0,-thL*.5,0],fu)}
  if(SPK==='boitata')bx(sh,[.012,.3,.012],[0,-shL*.5,.062*B],glow('#ff7a1a',2));
  if(SPK==='cuca')cyl(sh,.06*B,.04,[0,-shL*.3,0],M('#f1d046',0,.6));
 };
 const armFx=(a,fr,sd)=>{const stl=M(DK?'#17191d':'#aab4bd',.8,.3),gd=M('#d9a441',.8,.3),sv=M('#d5d5d5',.5,.3);
  if(SPK==='selecao')cyl(a,.054*B,.04,[0,-.2,0],M('#1e8e3c',0,.8));
  if(SPK==='cavaleiro'){cyl(fr,.05*B*wide,.2,[0,-.15,0],stl);if(sd===1&&!DK){bx(fr,[.03,.36,.28],[.075,-.12,.03],M('#2c5aa0',.2,.6));bx(fr,[.01,.28,.045],[.095,-.12,.03],M('#f4f4f1',0,.8));bx(fr,[.01,.045,.2],[.095,-.08,.03],M('#f4f4f1',0,.8))}}
  if(SPK==='samurai'){cyl(fr,.048*B*wide,.2,[0,-.15,0],M('#2a2f4a',.3,.6));bx(a,[.11,.03,.12],[0,-.05,0],M('#8a1c1c',.2,.5))}
  if(SPK==='viking')cyl(fr,.049*B,.1,[0,-.2,0],M('#7a5a3c',0,1));
  if(SPK==='indio'){mesh(a,new THREE.TorusGeometry(.056*B,.01,6,14),M('#e03a2a',0,.8),[0,-.1,0],[T/2,0,0]);for(let i=0;i<3;i++)bx(fr,[.05,.012,.012],[0,-.08-i*.05,.043*B],M('#c1121f',0,.8))}
  if(SPK==='boxeador'){ball(fr,.075,[0,-.33,.02],M(CV&&CV.gl?CV.gl:'#c1121f',.1,.5),[1,1.15,1]);cyl(fr,.046*B,.06,[0,-.26,0],M('#f4f4f1',0,.9))}
  if(SPK==='robo'){ball(fr,.05*B,[0,0,0],M('#4a525a',.85,.3));bx(fr,[.012,.2,.012],[0,-.13,.046*B],glow('#26e0ff'))}
  if(SPK==='cyber'){cyl(a,.054*B,.04,[0,-.2,0],glow(P1,1.2));if(sd===-1){cyl(fr,.048*B,.26,[0,-.13,0],M('#2b2f3a',.9,.25));bx(fr,[.012,.2,.012],[0,-.13,.052*B],glow(P2))}}
  if(SPK==='demonio')for(let i=0;i<3;i++)mesh(fr,new THREE.ConeGeometry(.008,.05,6),M('#1a0808',.3,.5),[(i-1)*.02,-.385,.025],[T,0,0]);
  if(SPK==='mago'){cyl(fr,.06*B,.2,[0,-.2,0],M('#6b3fc0',0,.8));if(sd===-1){cyl(fr,.014,1.5,[0,-.2,.07],M('#5a3a22',0,.8));ball(fr,.05,[0,.58,.07],glow('#8f5bff',1.6));mesh(fr,new THREE.TorusGeometry(.045,.008,6,14),gd,[0,.52,.07])}}
  if(SPK==='vampiro')cyl(fr,.046*B,.03,[0,-.255,0],M('#f4f4f1',0,.8));
  if(SPK==='pirata'){cyl(fr,.055*B,.07,[0,-.22,0],M('#5a3a22',0,.8));if(sd===1)mesh(fr,new THREE.TorusGeometry(.035,.008,6,14,T*1.4),stl,[0,-.4,.02],[0,T/2,0])}
  if(SPK==='bombeiro')cyl(fr,.046*B,.03,[0,-.15,0],sv);
  if(SPK==='mergulhador')cyl(fr,.046*B,.03,[0,-.15,0],M('#f2d21b',0,.6));
  if(SPK==='f1')cyl(a,.054*B,.04,[0,-.14,0],M('#f4f4f1',0,.6));
  if(SPK==='estreia'){cyl(a,.058*B,.05,[0,-.07,0],YL?glow(YL,.9):M('#f2c200',.2,.5));cyl(fr,.048*B,.03,[0,-.15,0],M('#f1f0ea',.1,.55))}
  if(SPK==='capoeira')cyl(fr,.046*B,.04,[0,-.25,0],M('#1e8e3c',0,.8));
  if(SPK==='rock')cyl(fr,.046*B,.03,[0,-.25,0],M('#c9c9c9',.8,.3));
  if(SPK==='anjo')cyl(fr,.046*B,.03,[0,-.25,0],gd);
  if(SPK==='onca'||SPK==='lobo')for(let i=0;i<3;i++)mesh(fr,new THREE.ConeGeometry(.012,SPK==='lobo'?.14:.1,6),M('#f4f1ea',0,.5),[(i-1)*.025,-.4,.02],[T,0,0]);
  if(SPK==='tupa'&&sd===-1){const o=ball(fr,.06,[0,-.42,.05],glow('#9fe8ff',2.2));rig.fx.push(t=>o.scale.setScalar(1+Math.sin(t*9)*.25))}
  if(SPK==='bateria')cyl(fr,.048*B,.05,[0,-.22,0],M('#e8b53a',.9,.2));
  if(SPK==='uira')cyl(fr,.05*B,.05,[0,-.2,0],M('#f1c40f',0,.6));
  if(SPK==='boiuna')cyl(fr,.048*B,.06,[0,-.2,0],M('#d9a441',.5,.4));
  if(SPK==='frevo'&&sd===1){for(let i=0;i<3;i++){const g=new THREE.Group();g.position.set(0,-.25,0);fr.add(g);const cs=['#e0302a','#1e8e3c','#2a5db0'],bm=M(cs[i],0,.8);bm.side=2;bx(g,[.03,.4,.004],[(i-1)*.03,-.2,0],bm);rig.fx.push(t=>{g.rotation.x=Math.sin(t*4+i)*.4;g.rotation.z=Math.cos(t*3+i)*.3})}}
  if(SPK==='frevo'&&sd===-1){const um=new THREE.Group();um.position.set(0,.34,.02);fr.add(um);cyl(fr,.008,.8,[0,.1,.02],M('#c9a23c',.8,.3));
   for(let i=0;i<8;i++){const m=M(['#e0302a','#f2d21b','#1e8e3c','#2a5db0'][i%4],0,.6);m.side=THREE.DoubleSide;mesh(um,new THREE.CylinderGeometry(.01,.4,.14,2,1,true,i*T/4,T/4),m,[0,0,0])}
   rig.fx.push(t=>{um.rotation.y=t*5})}
  if(SPK==='caboclo'&&sd===-1){cyl(fr,.014,1.7,[0,.55,.03],M('#5a3a22',0,.8));mesh(fr,new THREE.ConeGeometry(.03,.16,8),M('#d5d5d5',.9,.2),[0,1.48,.03]);
   const cs=['#e0302a','#f2d21b','#1e8e3c','#2a5db0','#ff3fa4'];
   for(let i=0;i<10;i++){const g=new THREE.Group();g.position.set(0,1.3-(i%3)*.05,.03);fr.add(g);const bm=M(cs[i%5],0,.8);bm.side=2;bx(g,[.03,.6,.004],[Math.sin(i)*.03,-.3,0],bm);const ph=i*.7;rig.fx.push(t=>{g.rotation.x=Math.sin(t*3+ph)*.35;g.rotation.z=Math.cos(t*2.4+ph)*.3})}}
  if(SPK==='curupira2')flameG(fr,4,.03,.03,-.38,.22,glow('#ff7a1a',2.2),glow('#ffd23a',2.4),.6);
  if(SPK==='anhanga')for(let i=0;i<3;i++)mesh(fr,new THREE.ConeGeometry(.012,.12,6),M('#efe6d3',0,.5),[(i-1)*.025,-.4,.02],[T,0,0]);
  if(SPK==='bicho')for(let i=0;i<3;i++)mesh(fr,new THREE.ConeGeometry(.012,.22,6),M('#0e0c16',0,.6),[(i-1)*.025,-.46,.02],[T,0,0]);
  if(SPK==='pirarucu')mesh(fr,new THREE.ConeGeometry(.03,.12,4),M('#c9532a',.3,.4),[sd*.05,-.12,0],[0,0,-sd*1.4]);
  if(SPK==='paje'&&sd===-1){cyl(fr,.014,1.5,[0,.45,.03],M('#5a3a22',0,.8));const og=new THREE.Group();og.position.set(0,1.25,.03);fr.add(og);
   [0,1,2].forEach(i=>ball(og,.035,[Math.cos(i*2.09)*.1,0,Math.sin(i*2.09)*.1],glow(['#7cffd0','#ffd23a','#ff7ab8'][i],2)));const c=ball(fr,.06,[0,1.25,.03],glow('#bfffe8',2));
   rig.fx.push(t=>{og.rotation.y=t*4;og.rotation.z=Math.sin(t*2)*.3;c.scale.setScalar(1+Math.sin(t*6)*.2)})}
  if(SPK==='vaqueiro'&&sd===-1){const lg=new THREE.Group();lg.position.set(0,-.3,.03);fr.add(lg);bx(lg,[.5,.01,.01],[.25,0,0],M('#d9c9a0',0,.9));
   mesh(lg,new THREE.TorusGeometry(.3,.012,6,40),M('#d9c9a0',0,.9),[.8,0,0],[T/2,0,0]);rig.fx.push(t=>{lg.rotation.y=t*7;lg.rotation.z=.4+Math.sin(t*2)*.1})}
  if(SPK==='guara')cyl(fr,.046*B,.22,[0,-.15,0],M('#14100c',0,.9));
  if(SPK==='carranca')cyl(fr,.048*B,.05,[0,-.2,0],M('#d9a441',.9,.25));
  if(SPK==='matinta')for(let i=0;i<3;i++)mesh(fr,new THREE.ConeGeometry(.012,.1,6),M('#2a1a10',0,.6),[(i-1)*.025,-.4,.02],[T,0,0]);
  if(SPK==='maeouro')flameG(fr,3,.03,.03,-.38,.2,glow('#ff9a1a',2.2),glow('#fff0a0',2.4),.5);
  if(SPK==='garantido'||SPK==='caprichoso')cyl(fr,.048*B,.05,[0,-.2,0],gd);
  if(SPK==='mapinguari')for(let i=0;i<3;i++)mesh(fr,new THREE.ConeGeometry(.012,.12,6),M('#efe6d3',0,.5),[(i-1)*.025,-.4,.02],[T,0,0]);
  if(SPK==='mula')mesh(fr,new THREE.TorusGeometry(.04,.01,6,14,T*1.6),M('#8a8f94',.9,.3),[0,-.4,.02],[0,T/2,0]);
  if(SPK==='boitata')cyl(fr,.046*B,.03,[0,-.15,0],glow('#ff7a1a',2));
  if(SPK==='iara')cyl(fr,.046*B,.02,[0,-.25,0],M('#f4f1ea',.3,.2));
 };

 // pernas
 const hips=J(root,'hips',[0,hipsY,0]);hips.userData.y=hipsY;
 bx(hips,[hw*2+.1,.2,.2*B+.04],[0,0,0],pm);bx(hips,[hw*2+.12,.05,.21*B+.04],[0,.1,0],dark);
 for(const [sd,n] of [[1,'L'],[-1,'R']]){
  const t=J(hips,'t'+n,[sd*hw,-.02,0]);cap(t,thL,.075*B*(f?1.05:1)*wide,dress?skin:pm);
  const sh=J(t,'s'+n,[0,-thL,0]);cap(sh,shL,.057*B*wide,(sho||dress)?skin:pm);
  const bt=bx(sh,[.1*B,.1,.28],[0,-shL,.06],boot);if(SPK==='curupira')bt.position.z=-.06;if(tall)cyl(sh,.06*B,.17,[0,-shL+.08,0],boot);if(SPK==='cowboy')ball(sh,.016,[0,-shL+.03,-.075],M('#d9a441',.8,.3));
  if((SPK==='futuro'||SPK==='legado7'||SPK==='c54')){bx(t,[.012,.3*H,.012],[0,-thL*.5,.082*B],neon);bx(sh,[.012,.28*H,.012],[0,-shL*.5,.062*B],neon)}
  if(SPK==='ze')bx(sh,[.104*B,.035,.14],[0,-shL+.02,.06],M('#e0302a',0,.6));
  if(s.kneepads==='on'&&mil)bx(sh,[.11*B,.1,.05],[0,-.03,.066*B],dark);
  legFx(t,sh,sd);
 }
 // tronco
 const sp=J(hips,'spine',[0,.07,0]);
 mesh(sp,new THREE.CapsuleGeometry(.13,.22*H,6,16),tm,[0,.25*H,0],[0,0,0],[sw/.13*.95,1,(.11*B)/.13]);
 mesh(sp,new THREE.CapsuleGeometry(.12,.1,4,12),tm,[0,.05,0],[0,0,0],[hw*2.3/.24,1,.9*B]);
 for(const sd of [1,-1])ball(sp,.055*B,[sd*sw,.46*H,0],tm);
 if(s.outfit==='hoodie')bx(sp,[sw*1.1,.09,.03],[0,.14*H,.115*B],tm);
 if(s.outfit==='social'){bx(sp,[.034,.22*H,.012],[0,.35*H,.114*B],acc);bx(sp,[.05,.04,.014],[0,.465*H,.114*B],acc);bx(sp,[.14,.03,.07],[0,.505*H,.06*B],M('#f4f4f1',0,.8))}
 if(s.outfit==='jaqueta'){const jm=M(s.shirt,.2,.55),jf=.1*B+.03;bx(sp,[sw*1.9,.3*H,.2*B+.06],[0,.3*H,0],jm);bx(sp,[.1,.26*H,.012],[0,.3*H,jf+.002],M('#e8e8e8',0,.9));bx(sp,[.014,.3*H,.012],[0,.3*H,jf+.008],acc);bx(sp,[.15,.05,.09],[0,.5*H,.03],jm);bx(sp,[sw*1.75,.05,.2*B+.04],[0,.02,0],jm);for(const sd of [1,-1])bx(sp,[.09,.035,.012],[sd*.09,.2*H,jf+.004],acc)}
 if(s.outfit==='jaleco'){bx(sp,[sw*1.9,.34*H,.2*B+.05],[0,.3*H,0],tm);bx(hips,[hw*2+.14,.55*H,.2*B+.06],[0,-.22*H,0],tm);for(const sd of [1,-1]){bx(hips,[.08,.06,.012],[sd*.08,-.12,.1*B+.034],M('#c9ced2',0,.9));bx(sp,[.05,.24*H,.012],[sd*.05,.37*H,.1*B+.033],M('#dfe3e6',0,.9),[0,0,sd*.15])}mesh(sp,new THREE.TorusGeometry(.075,.008,6,18),M('#2b2f33',0,.6),[0,.44*H,.1*B+.036])}
 if(s.outfit==='macacao'){bx(sp,[.016,.3*H,.012],[0,.3*H,.113*B+.002],acc);bx(sp,[sw*1.75,.04,.2*B+.04],[0,.02,0],acc);bx(sp,[.07,.07,.012],[.08,.36*H,.113*B],acc)}
 if(dress){mesh(hips,new THREE.CylinderGeometry(.14*B,.27*B,.42*H,24),tm,[0,-.22*H,0]);bx(sp,[sw*1.7,.04,.2*B+.03],[0,.02,0],acc)}

 if(s.vest!=='none'){
  const hv=s.vest==='heavy';
  bx(sp,[sw*2.0,.32*H,.2*B+.07],[0,.3*H,0],vm);
  for(const x of [-.085,0,.085])bx(sp,[.07,.09,.04],[x*B,.22*H,.12*B],dark);
  for(const sd of [1,-1]){bx(sp,[.06,.2,.2*B+.06],[sd*sw*.62,.43*H,0],vm);if(hv)ball(sp,.07,[sd*(sw+.02),.5*H,0],vm,[1,.7,1.1])}
  if(hv)bx(sp,[sw*1.2,.07,.1],[0,.5*H+.02,.08],vm);
  bx(sp,[.05,.04,.012],[-.07,.4*H,.115*B+.01],acc);
 }
 // cinto
 bx(sp,[sw*1.7,.035,.2*B+.03],[0,.0,0],dark);
 // pescoço e cabeça
 cyl(sp,.045,.15,[0,.54*H,0],skin);
 if(s.mask==='bandana')cyl(sp,.052,.07,[0,.53*H,0],M('#23262a',0,.85));
 const head=J(sp,'head',[0,.64*H,0]);
 const RX=.092*hs,RY=.118*hs,RZ=.108*hs,fz=(x,y)=>RZ*Math.sqrt(Math.max(.02,1-(x/RX)**2-(y/RY)**2));
 mesh(head,new THREE.SphereGeometry(1,32,24),skin,[0,0,0],[0,0,0],[RX,RY,RZ]);
 mesh(head,new THREE.SphereGeometry(1,24,16),skin,[0,-RY*.5,RZ*.18],[0,0,0],[RX*(f?.72:.8),RY*.62,RZ*.82]);
 const part=(mat,sc,a,b,tilt,off=[0,0,0])=>mesh(head,new THREE.SphereGeometry(1,32,18,0,T*2,a,b),mat,off,[tilt,0,0],[RX*sc,RY*sc,RZ*sc]);
 const hm=M(s.hair,0,.5);
 // rosto: tudo posicionado na superfície da elipse da cabeça
 const eyeWhite=M('#e9ecee',0,.3),eyeC=z&&s.zEyes==='vermelho'?glow('#ff2a2a',1.2):M(z?(ZE[s.zEyes]||ZE.amarelo):s.eyes,0,.2),pup=M(z&&s.zEyes==='branco'?'#aeb2a2':'#0a0a0a',0,.3);
 for(const sd of [1,-1]){
  const x=sd*RX*.4,y=RY*.08,zz=fz(x,y);
  ball(head,.015*hs,[x,y,zz-.001],eyeWhite,[1,.8,.6]);ball(head,.0085*hs,[x,y,zz+.006],eyeC,[1,1,.5]);ball(head,.0045*hs,[x,y,zz+.0085],pup,[1,1,.5]);
  const by=RY*.33;bx(head,[RX*.5,.008,.01],[x,by,fz(x,by)+.002],z?dark:hm,[0,0,sd*-.1]);
  mesh(head,new THREE.SphereGeometry(.02*hs,10,8),skin,[sd*(RX+.003),-.005,-.005],[0,0,0],[.4,1,.7]);
 }
 bx(head,[.014*hs,.04*hs,.02],[0,-RY*.12,fz(0,-RY*.12)+.004],skin);ball(head,.011*hs,[0,-RY*.27,fz(0,-RY*.27)+.002],skin);
 bx(head,[RX*.4,.006,.008],[0,-RY*.5,fz(0,-RY*.5)+.001],M('#5a2c2c',0,.8));
 
 // barba
 if(s.beard!=='none'&&s.mask==='none'&&!f){const st=s.beard==='stubble',k=st?1.06:1.14,bm=M(st?mix(s.skin,'#000',.5):s.hair,0,.75);
  mesh(head,new THREE.SphereGeometry(1,24,14,0,T*2,T*.55,T*.45),bm,[0,-RY*.5,RZ*.18],[0,0,0],[RX*.78*k,RY*.62*k*1.1,RZ*.82*k]);
  for(const sd of [1,-1]){const x=sd*RX*.72,y=-RY*.32,x2=sd*RX*.9;ball(head,.03*hs,[x,y,fz(x,y)-.004],bm,[.7,1.1,.7]);ball(head,.02*hs,[x2,-RY*.1,fz(x2,-RY*.1)-.004],bm,[.5,1.2,.7])}
  bx(head,[RX*.5,.01,.01],[0,-RY*.42,fz(0,-RY*.42)+.004],bm)}

 // cabelo — sempre casca por FORA da cabeça, inclinada para trás (testa livre, nada atravessa o rosto)
 const hat=s.helmet,style=(z&&s.zHead==='aberto')?'bald':s.hairStyle,HS=!HIDE.includes(SPK),showTop=(hat==='none'||hat==='headband')&&SPK!=='gaucho'&&SPK!=='cowboy'&&HS,tails=hat!=='ach'&&s.mask!=='balaclava'&&(HS||HAT_HAIR.includes(SPK))&&!['astronaut','astro_or'].includes(SPK);
 if(style!=='bald'&&s.mask!=='balaclava'){
  if(showTop){
   if(style==='crew')part(hm,1.07,0,T*.5,-.5);
   else if(style==='mohawk'){part(hm,1.05,0,T*.44,-.45);for(let i=-4;i<=4;i++)bx(head,[.03,.05-Math.abs(i)*.004,.03],[0,RY*1.02+.012-Math.abs(i)*.003,i*.026-.01],hm)}
   else if(style==='afro')part(hm,1.4,0,T*.52,-.7,[0,.025,-.03]);
   else if(style==='curly'){part(hm,1.1,0,T*.5,-.6);
    for(let i=0;i<26;i++){const a=i*2.4,e=.35+((i*37)%10)/16,x=Math.sin(a)*Math.cos(e),y=Math.sin(e),zz=Math.cos(a)*Math.cos(e);
     if(zz>.55&&y<.75)continue;ball(head,.03,[RX*1.09*x,RY*1.09*y,RZ*1.09*zz],hm)}}
   else if(style==='curlylong'){part(hm,1.1,0,T*.5,-.6);for(let i=0;i<22;i++){const a=i*2.4,e=.35+((i*37)%10)/16,x=Math.sin(a)*Math.cos(e),y=Math.sin(e),zz=Math.cos(a)*Math.cos(e);if(zz>.55&&y<.75)continue;ball(head,.03,[RX*1.09*x,RY*1.09*y,RZ*1.09*zz],hm)}}
   else{part(hm,1.1,0,T*(style==='slick'?.5:.52),style==='slick'?-.8:-.6);if(style==='short')part(hm,1.15,0,T*.4,-.55,[0,.008,-.004]);if(style==='pixie')part(hm,1.14,0,T*.42,-.1,[0,.008,.008])}
  }
  if(tails){
   if(style==='wavy'||style==='curlylong'||style==='halfup'){mesh(head,new THREE.SphereGeometry(1,20,14),hm,[0,-.12*hs,-RZ*.52],[0,0,0],[RX*1.14,.25*hs,RZ*.64]);for(const sd of [1,-1])for(let i=0;i<5;i++)ball(head,.034,[sd*(RX*1.02+(i%2?.012:0)),-.03-i*.05,-RZ*.2-i*.01],hm)}
   if(style==='halfup')ball(head,.05,[0,.11*hs,-RZ*.8],hm);
   if(style==='highpony'){mesh(head,new THREE.CapsuleGeometry(.03,.24,4,8),hm,[0,.1*hs,-RZ-.1],[-.9,0,0]);ball(head,.024,[0,.13*hs,-RZ*.82],acc)}
   if(style==='sidebraid'){mesh(head,new THREE.SphereGeometry(1,20,14),hm,[0,-.07*hs,-RZ*.5],[0,0,0],[RX*1.1,.14*hs,RZ*.6]);for(let i=0;i<8;i++)ball(head,.026-i*.0012,[RX*.95+i*.004,-.03*i-.02,-RZ*.1+i*.012],hm);ball(head,.018,[RX*.98,-.27,.0],acc)}
   if(style==='long'||style==='braid')mesh(head,new THREE.SphereGeometry(1,20,14),hm,[0,-.1*hs,-RZ*.52],[0,0,0],[RX*1.12,(style==='long'?.21:.12)*hs,RZ*.62]);
   if(style==='ponytail'){mesh(head,new THREE.CapsuleGeometry(.024,.16,4,8),hm,[0,-.07,-RZ-.07],[.56,0,0]);ball(head,.02,[0,.01,-RZ-.005],acc)}
   if(style==='bun')ball(head,.048,[0,.1*hs,-RZ*.78],hm);
   if(style==='bob')mesh(head,new THREE.SphereGeometry(1,20,14),hm,[0,-.05*hs,-RZ*.4],[0,0,0],[RX*1.2,.14*hs,RZ*.85]);
   if(style==='twin')for(const sd of [1,-1]){mesh(head,new THREE.CapsuleGeometry(.026,.2,4,8),hm,[sd*RX*.95,-.1,-RZ*.55],[.12,0,sd*-.18]);ball(head,.02,[sd*RX*.9,.03,-RZ*.5],acc)}
   if(style==='braid')for(let i=0;i<7;i++)ball(head,.024,[0,-.03*i-.02,-RZ*1.1-i*.012],hm);
  }
 }
 // máscara
 if(s.mask==='bandana')part(M('#23262a',0,.85),1.06,T*.56,T*.34,0);
 if(CV&&CV.gas){const gk=M('#16181c',.3,.7),fl=M('#2b2f36',.5,.4),gy=glow(CV.yl||'#7dff1a',.9);bx(head,[RX*1.3,.075,.05],[0,-RY*.34,fz(0,-RY*.34)+.028],gk);for(const sd of [1,-1]){cyl(head,.033,.06,[sd*RX*.62,-RY*.4,fz(sd*RX*.62,-RY*.4)+.05],fl,[T/2,0,0]);cyl(head,.022,.012,[sd*RX*.62,-RY*.4,fz(sd*RX*.62,-RY*.4)+.088],gy,[T/2,0,0])}}
 if(s.mask==='balaclava'){part(M('#1d2024',0,.9),1.06,0,T,0);bx(head,[RX*1.25,.034*hs,.004],[0,RY*.08,RZ*1.07],skin)}
 // cabeça
 if(hat==='ach'){part(cm,1.3,0,T*.56,-.42,[0,.026,-.004]);bx(head,[.045,.035,.03],[0,.09*hs,.142*hs],dark);
  for(const sd of [1,-1])bx(head,[.006,.07,.006],[sd*RX*.98,-.06,0],dark)}
 if(hat==='boonie'){cyl(head,.12*hs,.1,[0,.1*hs,0],cm);cyl(head,.2*hs,.008,[0,.055*hs,0],cm)}
 if(hat==='cap'){part(acc,1.17,0,T*.5,-.5,[0,.02,0]);bx(head,[.13*hs,.008,.09],[0,.065,.125*hs],acc,[.2,0,0])}
 if(hat==='beanie')part(M('#25292e',0,.95),1.18,0,T*.58,-.3,[0,.022,0]);
if(hat==='bucket'){const bm2=M(s.accent,0,.9);cyl(head,.11*hs,.09,[0,.095*hs,0],bm2);mesh(head,new THREE.CylinderGeometry(.19*hs,.15*hs,.014,26),bm2,[0,.06*hs,0],[0,0,0],[1,1,1.05])}
if(hat==='hardhat'){const hh=M('#f2c200',.1,.4);part(hh,1.22,0,T*.55,-.35,[0,.02,-.004]);bx(head,[.012*hs,.02,.2*hs],[0,.128*hs,0],hh);bx(head,[.15*hs,.01,.07],[0,.075*hs,.13*hs],hh,[.15,0,0])}
if(hat==='chef'){const ch=M('#f6f6f2',0,.9);cyl(head,.105*hs,.07,[0,.09*hs,0],ch);ball(head,.125*hs,[0,.2*hs,0],ch,[1,.8,1])}
if(hat==='beret')mesh(head,new THREE.SphereGeometry(1,24,12),M(s.accent,0,.95),[.025,.105*hs,0],[0,0,.15],[RX*1.35,.05,RZ*1.35]);
if(hat==='headband'){const hbm=M(s.accent,0,.8);hbm.side=THREE.DoubleSide;mesh(head,new THREE.CylinderGeometry(1,1,.032,26,1,true),hbm,[0,RY*.42,0],[0,0,0],[RX*.97,1,RZ*.97])}
if(hat==='tophat'){const th=M('#0f1114',.2,.5);cyl(head,.1*hs,.17,[0,.17*hs,0],th);cyl(head,.17*hs,.012,[0,.088*hs,0],th);cyl(head,.102*hs,.03,[0,.12*hs,0],M(s.accent,0,.7))}
if(hat==='sun'){const sm=M('#d9bf72',0,.95);cyl(head,.11*hs,.08,[0,.095*hs,0],sm);mesh(head,new THREE.CylinderGeometry(.22*hs,.22*hs,.008,28),sm,[0,.06*hs,0],[0,0,0],[1,1,1.08]);cyl(head,.112*hs,.02,[0,.09*hs,0],M(s.accent,0,.8))}

 if(s.goggles==='tac'){const lens=s.cv&&s.cv.lens?glow(s.cv.lens,1.6):M('#10202b',.6,.15);
  const strap=new THREE.CylinderGeometry(1,1,.028,28,1,true);const sm=M('#16181b',0,.8);sm.side=THREE.DoubleSide;
  mesh(head,strap,sm,[0,RY*.08,0],[0,0,0],[RX*1.07,1,RZ*1.07]);
  for(const sd of [1,-1]){const x=sd*RX*.4,zz=fz(x,RY*.08)+.014;bx(head,[.075*hs,.05*hs,.012],[x,RY*.08,zz-.002],dark);bx(head,[.065*hs,.04*hs,.01],[x,RY*.08,zz+.004],lens)}
 }
 if(s.goggles==='nvg'){const lens=new THREE.MeshStandardMaterial({color:'#2a2f2a',emissive:'#3cff7a',emissiveIntensity:1.4});
  for(const sd of [1,-1]){const x=sd*RX*.42;cyl(head,.028,.08,[x,RY*.1,fz(x,RY*.1)+.045],dark,[T/2,0,0]);cyl(head,.02,.006,[x,RY*.1,fz(x,RY*.1)+.088],lens,[T/2,0,0])}
  bx(head,[RX*1.1,.02,.03],[0,RY*.1,fz(0,RY*.1)+.012],dark);
 }
 if(s.headset==='comms'){
  for(const sd of [1,-1])cyl(head,.035,.03,[sd*(RX+.012),-.004,0],dark,[0,0,T/2]);
  if(hat==='none'||hat==='beanie'||hat==='cap')mesh(head,new THREE.TorusGeometry(RX*1.12,.006,8,28,T),dark,[0,0,0],[0,0,0],[1,1.3,1]);
 }
 // ===== skins raras =====
if(spc){const lea=M('#4a2e1a',.1,.7),gold=M('#d9a441',.8,.3),wh=M('#eef1f3',.1,.5);
  if(SPK!=='astronaut'&&SPK!=='astro_or'&&!NEW.includes(SPK)){
   if(['gaucho','cowboy','cangaceiro'].includes(SPK)){cyl(sp,.062,.045,[0,.5*H,0],acc);bx(sp,[.07,.07,.02],[0,.46*H,.1*B],acc,[0,0,.785])}
   bx(sp,[sw*1.75,.07,.2*B+.035],[0,0,0],SPK==='gaucho'?lea:M('#3b2a1c',.1,.7));bx(sp,[.06,.05,.012],[0,0,.105*B+.02],gold)}
  if(SPK==='gaucho'){const fe=M('#17140f',0,.9);
   cyl(head,.12*hs,.1,[0,.1*hs,0],fe);cyl(head,.17*hs,.01,[0,.055*hs,0],fe);cyl(head,.122*hs,.016,[0,.07*hs,0],acc);
   for(const sd of [1,-1])bx(head,[.004,.1,.004],[sd*RX*1.0,-.055,.012],fe);bx(head,[RX*1.9,.004,.004],[0,-RY*.92,RZ*.12],fe)}
  if(SPK==='cowboy'){const ta=M('#a67c4e',0,.85);
   bx(sp,[sw*1.95,.3*H,.2*B+.07],[0,.3*H,0],M('#6b4a2e',.05,.8));bx(sp,[.035,.035,.01],[.07,.4*H,.1*B+.04],gold,[0,0,.785]);
   cyl(head,.12*hs,.11,[0,.105*hs,0],ta);cyl(head,.122*hs,.022,[0,.07*hs,0],M('#3b2a1c',0,.8));
   mesh(head,new THREE.CylinderGeometry(.2*hs,.2*hs,.01,28),ta,[0,.058*hs,0],[0,0,0],[1,1,1.12]);
   for(const sd of [1,-1])bx(head,[.12*hs,.01,.1],[sd*.17*hs,.078*hs,0],ta,[0,0,sd*-.4])}

  const vestOn=(col,t)=>{const vd=.2*B+.07;bx(sp,[sw*2.05,.34*H,vd],[0,.3*H,0],M(col,.1,.8));const m=txt(t,'#ffffff'),w=Math.min(.3,sw*1.4);
   mesh(sp,new THREE.PlaneGeometry(w,w*.3),m,[0,.38*H,vd/2+.002]);mesh(sp,new THREE.PlaneGeometry(w*1.3,w*.39),m,[0,.32*H,-vd/2-.002],[0,T,0])};
  const capOn=(col,trim)=>{const c=M(col,0,.8);cyl(head,.108*hs,.075,[0,.088*hs,0],c);cyl(head,.13*hs,.022,[0,.12*hs,0],c);
   bx(head,[.12*hs,.008,.075],[0,.07*hs,.135*hs],M('#0f1114',.2,.4),[.15,0,0]);if(trim)bx(head,[.03,.03,.01],[0,.095*hs,.108*hs],M(trim,.8,.3))};
  if(SPK==='pm'){capOn('#27406b','#d9d9d9');vestOn('#15191f','P.M.')}
  if(SPK==='gcm'){capOn('#16243c','#8fb3d9');vestOn('#0d1424','G.C.M.')}
  if(SPK==='bope'){const bk=M('#0d0e10',.1,.85);mesh(head,new THREE.SphereGeometry(1,24,12,0,T*2,0,T*.5),bk,[.02,.055*hs,0],[-.2,0,.25],[RX*1.22,RY*.95,RZ*1.22]);
   part(M('#0d0e10',0,.9),1.06,T*.56,T*.34,0);vestOn('#0d0e10','B.O.P.E.')}
  if(SPK==='cangaceiro'){const lt=M('#6b4a2a',.05,.8);
   cyl(head,.115*hs,.09,[0,.1*hs,0],lt);mesh(head,new THREE.CylinderGeometry(.2*hs,.2*hs,.01,28),lt,[0,.058*hs,0],[0,0,0],[1,1,1.1]);
   for(const sd of [1,-1]){bx(head,[.14*hs,.01,.12],[sd*.2*hs,.095*hs,0],lt,[0,0,sd*-.65]);bx(head,[.004,.1,.004],[sd*RX*1.0,-.055,.012],lt)}
   bx(head,[RX*1.9,.004,.004],[0,-RY*.92,RZ*.12],lt);bx(head,[.04,.04,.01],[0,.14*hs,.118*hs],gold,[0,0,.785]);for(let i=0;i<5;i++)ball(head,.009,[(i-2)*.03*hs,.07*hs,.114*hs],gold);
   for(const sg of [1,-1]){bx(sp,[.05,.5*H,.2*B+.05],[0,.3*H,0],lea,[0,0,sg*.62]);
    for(let i=-3;i<=3;i++){const t=i*.055;bx(sp,[.022,.04,.01],[-t*Math.sin(sg*.62),.3*H+t*Math.cos(.62),.1*B+.03],gold)}}}
  if(SPK==='esquimo'){const pk=M('#7a5a3c',0,.95),fu=M('#efe6d3',0,1);
   bx(sp,[sw*2.0,.32*H,.2*B+.07],[0,.3*H,0],pk);bx(sp,[sw*1.95,.06,.2*B+.09],[0,.08,0],fu);
   part(pk,1.38,0,T*.6,-.25,[0,0,-.015]);mesh(head,new THREE.TorusGeometry(RX*1.12,.026,10,28),fu,[0,-.002,RZ*.55],[0,0,0],[1,1.22,1]);
   mesh(sp,new THREE.TorusGeometry(.085,.03,10,20),fu,[0,.52*H,0],[T/2,0,0])}
  if(SPK==='ze'){const blk=M('#1a1208',.8,.15),cols=['#e8d27a','#ff3d81','#27d3ff','#7cff4f','#ffd400'];
   part(M('#e8d27a',0,.6),1.07,0,T*.5,-.5);
   for(let i=0;i<34;i++){const a=i*2.4,e=.3+((i*37)%10)/14,v=new THREE.Vector3(Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e));if(v.z>.6&&v.y<.6)continue;
    const o=mesh(head,new THREE.ConeGeometry(.022,.075,6),M(cols[i%5],0,.5),[v.x*RX*1.02,v.y*RY*1.02,v.z*RZ*1.02]);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize())}
   for(const [r,tl] of [[.125,.55],[.14,.75]])mesh(sp,new THREE.TorusGeometry(r,.008,8,28),gold,[0,.5*H,.035],[T/2+tl,0,0]);
   bx(sp,[.04,.05,.012],[0,.5*H-.07,.145],gold);
   for(const sd of [1,-1]){const x=sd*RX*.4,zz=fz(x,RY*.08)+.014;bx(head,[.07*hs,.04*hs,.012],[x,RY*.08,zz],blk);bx(head,[.004,.008,.1],[sd*RX*.98,RY*.1,.01],gold);
    for(let i=0;i<3;i++){const x2=sd*RX*.66,y2=-RY*.18-i*.012;bx(head,[.014,.006,.006],[x2,y2,fz(x2,y2)+.001],ink,[0,sd*.5,0])}}
   bx(head,[RX*1.1,.01,.01],[0,RY*.1,fz(0,RY*.1)+.012],gold);
   const gn=new THREE.Group(),bk=M('#1b1c1e',.5,.45);gn.position.set(.03,.27*H,-.1*B-.07);gn.rotation.z=.4;sp.add(gn);
   bx(gn,[.045,.3,.05],[0,0,0],bk);bx(gn,[.03,.13,.04],[0,-.1,.045],bk);bx(gn,[.02,.1,.02],[0,-.2,0],bk);bx(sp,[.03,.5*H,.2*B+.05],[0,.3*H,0],M('#111111',0,.9),[0,0,-.55]);
   bx(sp,[.05,.11,.035],[sw*.65,-.01,.105*B],dark);bx(sp,[.007,.09,.007],[sw*.65+.015,.09,.105*B],dark)}
  if(SPK==='marinheiro'){const nv=M('#1c2e5a',0,.85),wt=M('#f4f4f1',0,.8);
   bx(sp,[sw*1.5,.2,.02],[0,.4*H,-.1*B-.012],nv);for(const sd of [1,-1])bx(sp,[.06,.22,.02],[sd*.06,.41*H,.1*B+.012],nv,[0,0,-sd*.4]);
   bx(sp,[.05,.05,.02],[0,.36*H,.1*B+.016],M('#111111',0,.9),[0,0,.785]);
   cyl(head,.11*hs,.06,[0,.09*hs,0],wt);cyl(head,.125*hs,.03,[0,.115*hs,0],wt);cyl(head,.112*hs,.015,[0,.065*hs,0],nv)}
  if(SPK==='fab'){const hm3=M('#e8ecef',.2,.4),vs=M('#7a5a1a',.9,.12),od=M('#d96a1e',0,.8);
   part(hm3,1.2,0,T*.58,-.5);mesh(head,new THREE.SphereGeometry(1,32,16,.2*T,.6*T,.3*T,.32*T),vs,[0,.012,-.004],[0,0,0],[RX*1.22,RY*1.18,RZ*1.22]);
   bx(head,[.07*hs,.055*hs,.045],[0,-RY*.5,RZ*.92],dark);bx(head,[.012,.1,.012],[0,-RY*.9,RZ*.8],dark,[.3,0,0]);
   for(const sd of [1,-1])bx(sp,[.045,.3*H,.2*B+.06],[sd*.085,.3*H,0],od);
   bx(sp,[.05,.03,.01],[.1,.38*H,.1*B+.012],M('#1e8e3c',0,.7));bx(sp,[.016,.016,.01],[.1,.38*H,.1*B+.016],M('#f1c40f',0,.6),[0,0,.785])}
  if(SPK==='coronel'){const ol=M('#6b6a3d',0,.85),br=M('#4a2e1a',.1,.7);
   cyl(head,.108*hs,.07,[0,.09*hs,0],ol);cyl(head,.135*hs,.02,[0,.124*hs,0],ol,[.12,0,0]);cyl(head,.11*hs,.012,[0,.065*hs,0],gold);
   bx(head,[.12*hs,.008,.08],[0,.06*hs,.138*hs],M('#0f1114',.3,.4),[.2,0,0]);ball(head,.014,[0,.09*hs,.108*hs],gold);
   bx(sp,[.045,.5*H,.2*B+.05],[0,.3*H,0],br,[0,0,-.55]);
   ['#2e8b57','#f1c40f','#2c5aa0','#c0392b'].forEach((c,i)=>bx(sp,[.018,.03,.01],[-.12+i*.021,.4*H,.1*B+.012],M(c,0,.6)));
   for(const sd of [1,-1]){bx(sp,[.07,.07,.012],[sd*.09,.22*H,.1*B+.01],M('#5d5c33',0,.9));bx(sp,[.07,.01,.1],[sd*(sw-.02),.48*H+.01,0],ol);for(let i=0;i<3;i++)bx(sp,[.012,.012,.012],[sd*(sw-.02),.48*H+.02,-.03+i*.03],gold)}
   bx(sp,[.05,.1,.04],[-sw*.7,-.04,.105*B],br)}
  if((SPK==='futuro'||SPK==='legado7'||SPK==='c54')){const YEL=SPK==='legado7',BLU=SPK==='c54',hm2=YEL?M('#0b0c0e',.25,.55):BLU?M('#12306e',.5,.4):M('#1b2430',.8,.25),vz=new THREE.MeshStandardMaterial({color:YEL?'#080600':BLU?'#061a3a':'#06303c',emissive:YEL?NEONC:BLU?'#27a8ff':'#26e0ff',emissiveIntensity:YEL?.04:.8,transparent:true,opacity:.9,metalness:YEL?.05:.5,roughness:YEL?.35:.1});
   mesh(head,new THREE.SphereGeometry(1,32,24),hm2,[0,.012,-.004],[0,0,0],[RX*1.3,RY*1.24,RZ*1.3]);
   mesh(head,new THREE.SphereGeometry(1,32,16,.2*T,.6*T,.28*T,.5*T),vz,[0,.012,-.004],[0,0,0],[RX*1.32,RY*1.26,RZ*1.32]);
   bx(head,[.03,.05,.1],[0,.13*hs,-.02],neon);for(const sd of [1,-1]){cyl(head,.03,.04,[sd*RX*1.28,0,0],hm2,[0,0,T/2]);ball(sp,.07,[sd*(sw+.03),.47*H,0],hm2,[1,.7,1.1])}
   for(const x of [-.06,.06])bx(sp,[.012,.3*H,.2*B+.06],[x,.3*H,0],neon);bx(sp,[.07,.07,.012],[0,.37*H,.1*B+.012],neon,[0,0,.785]);
   bx(sp,[.34*B,.4,.12],[0,.3*H,-.2*B],hm2);bx(sp,[.1,.18,.015],[0,.3*H,-.2*B-.06],neon)}
  if(SPK==='c54'){const gk=M('#16181c',.3,.7),fl=M('#2b2f36',.5,.4),gy=glow('#27a8ff',.9);bx(head,[RX*1.3,.075,.05],[0,-RY*.34,fz(0,-RY*.34)+.028],gk);for(const sd of [1,-1]){cyl(head,.033,.06,[sd*RX*.62,-RY*.4,fz(sd*RX*.62,-RY*.4)+.05],fl,[T/2,0,0]);cyl(head,.022,.012,[sd*RX*.62,-RY*.4,fz(sd*RX*.62,-RY*.4)+.088],gy,[T/2,0,0])}cyl(head,.012,.5,[RX*.7,RY*1.3+.2,0],gk);ball(head,.03,[RX*.7,RY*1.3+.46,0],gy,[1,1,1])}
  if(SPK==='astronaut'||SPK==='astro_or'){
   const glass=new THREE.MeshStandardMaterial({color:'#9fc3d9',transparent:true,opacity:.22,metalness:.6,roughness:.05,depthWrite:false}),vis=M('#d9a441',1,.12);
   mesh(head,new THREE.SphereGeometry(1,32,24),glass,[0,.01,0],[0,0,0],[.165*hs,.17*hs,.17*hs]);
   mesh(head,new THREE.SphereGeometry(1,32,16,.2*T,.6*T,.28*T,.5*T),vis,[0,.01,0],[0,0,0],[.168*hs,.172*hs,.172*hs]);
   mesh(head,new THREE.TorusGeometry(.1*hs,.018,10,28),wh,[0,-.12*hs,0],[T/2,0,0]);
   for(const sd of [1,-1]){cyl(head,.03,.03,[sd*.168*hs,0,0],wh,[0,0,T/2]);ball(sp,.075,[sd*(sw+.02),.46*H,0],wh)}
   cyl(head,.006,.1,[.1*hs,.19*hs,-.05],wh);
   bx(sp,[.14,.1,.04],[0,.34*H,.115*B+.01],M('#2b2f33',.3,.5));ball(sp,.012,[-.03,.34*H,.115*B+.035],acc);ball(sp,.012,[.03,.34*H,.115*B+.035],M('#3c8da8',0,.4));
   bx(sp,[.36*B,.46,.2],[0,.3*H,-.2*B-.01],wh);bx(sp,[.3*B,.08,.02],[0,.2*H,-.3*B-.02],acc);cyl(sp,.065,.05,[0,.56*H,0],wh)}

  // ===== novas skins =====
  const blk=M('#0b0b10',.1,.9),stl=M(DK?'#17191d':'#aab4bd',.85,.28),dst=M('#6d7780',.85,.3),wd=M('#5a3a22',0,.8),bone=M('#efe6d3',0,.7),gl=glow,
   ov=(m,wm=2.0,h=.32,y=.3,d=.07)=>bx(sp,[sw*wm,h*H,.2*B+d],[0,y*H,0],m),
   robe=(m,r1,r2,h,y)=>mesh(hips,new THREE.CylinderGeometry(r1*B,r2*B,h*H,24),m,[0,y*H,0]),
   wings=(m,n,len,amp,yb)=>{for(const sd of [1,-1])for(let i=0;i<n;i++){const Lw=len*(1-i*.13),ang=amp-i*.2;bx(sp,[Lw,.075,.012],[sd*(.1+Math.cos(ang)*Lw/2),yb*H+Math.sin(ang)*Lw/2-i*.04,-.16*B-.04],m,[0,0,sd*ang])}},
   zf=.1*B+.036;
  const fxs=rig.fx=[],live=f=>fxs.push(f);
  const rib=(p,pos,len,col,ph,w=.035)=>{const g=new THREE.Group();g.position.set(...pos);p.add(g);const m=M(col,0,.8);m.side=THREE.DoubleSide;bx(g,[w,len,.004],[0,-len/2,0],m);live(t=>{g.rotation.x=Math.sin(t*3+ph)*.25;g.rotation.z=Math.sin(t*2.2+ph*1.7)*.18});return g};
  const orbit=(p,n,rad,y0,hgt,col,sz)=>{const g=new THREE.Group();p.add(g);const a=[];for(let i=0;i<n;i++)a.push(ball(g,sz,[Math.cos(i*2.4)*rad,y0+(i*.37%1)*hgt,Math.sin(i*2.4)*rad],gl(col,2)));live(t=>{g.rotation.y=t*.8;a.forEach((s,i)=>s.scale.setScalar(.6+Math.sin(t*4+i*1.7)*.4))});return g};
  const tail=(par,n,r0,mat,mat2,y,z0,k)=>{const a=[];for(let i=0;i<n;i++)a.push(ball(par,r0-r0*.5*i/n,[0,y,z0-i*.08],i>n-3?mat2:mat));live(t=>a.forEach((s,i)=>{s.position.x=Math.sin(t*3-i*.6)*k*(i+1);s.position.y=y+i*.018+Math.sin(t*2-i*.5)*.02*i}))};
  const COL4=['#e0302a','#2c8cff','#f1c40f','#f4f1ea'];
  const wingsG=(mt,y,amp,spd)=>{const wg=[];for(const sd of [1,-1]){const g=new THREE.Group();g.position.set(sd*.12,y*H,-.14*B);sp.add(g);wg.push([g,sd]);
    for(let i=0;i<7;i++){const Lw=.9-i*.08,ang=.35-i*.12;mesh(g,new THREE.SphereGeometry(1,10,6),mt[i%mt.length],[sd*(.04+Math.cos(ang)*Lw/2),Math.sin(ang)*Lw/2,0],[0,0,sd*ang],[Lw/2,.045,.01])}}
   live(t=>wg.forEach(([g,sd])=>g.rotation.z=sd*(.3+Math.sin(t*spd)*amp)))};
  const bird=(par,c1,c2,rad,y,spd)=>{const b=new THREE.Group();par.add(b);ball(b,.04,[0,0,0],gl(c1,1.5),[1,1,2]);
   const wb=[1,-1].map(sd=>{const w=new THREE.Group();b.add(w);mesh(w,new THREE.SphereGeometry(1,8,6),gl(c2,1.2),[sd*.07,0,0],[0,0,0],[.07,.01,.04]);return [w,sd]});
   live(t=>{b.position.set(Math.cos(t*spd)*rad,y+Math.sin(t*2)*.08,Math.sin(t*spd*1.3)*rad);b.rotation.y=-t*spd;wb.forEach(([w,sd])=>w.rotation.z=sd*Math.sin(t*30)*.7)})};
  if(SPK==='saci'){const rd=M('#c01f1f',0,.85),pp=M('#3a2616',0,.8),dm=M('#c9a46b',0,1);
   rig.tR.visible=false;
   mesh(head,new THREE.ConeGeometry(.115*hs,.32*hs,16),rd,[0,.2*hs,-.04],[-.6,0,0]);rib(head,[0,.3*hs,-.14*hs],.45,'#c01f1f',0,.07);rib(head,[0,.27*hs,-.1*hs],.3,'#c01f1f',1.5,.05);
   bx(head,[.01,.01,.12],[RX*.3,-RY*.45,fz(0,-RY*.45)+.07],pp);ball(head,.02,[RX*.3,-RY*.45+.012,fz(0,-RY*.45)+.13],pp);embersG(head,10,.05,-RY*.4,.5,'#cfc8b8',.4);
   for(const sd of [1,-1]){const x=sd*RX*.4,y=RY*.08;ball(head,.018*hs,[x,y,fz(x,y)+.008],gl('#ffd23a',1.4),[1,.8,.5])}
   const N=48,ds=[];for(let i=0;i<N;i++)ds.push(ball(root,.022,[0,0,0],dm));
   const rg=[0,1,2].map(i=>mesh(root,new THREE.TorusGeometry(1,.012,6,40),new THREE.MeshBasicMaterial({color:'#c9a46b',transparent:true,opacity:.5,depthWrite:false}),[0,.05,0],[T/2,0,0]));
   live(t=>{ds.forEach((d,i)=>{const h=(i/N+t*.35)%1,a=t*5+i*2.4,r=.25+h*.75;d.position.set(Math.sin(a)*r,h*2.0,Math.cos(a)*r);d.scale.setScalar(1-h*.5)});
    rg.forEach((r,i)=>{const k=(t*.5+i/3)%1;r.scale.setScalar(.3+k*.9);r.material.opacity=(1-k)*.5});rig.hips.position.y+=Math.abs(Math.sin(t*4))*.12})}
  const star=(m,r)=>{const sh=new THREE.Shape();for(let i=0;i<10;i++){const a=i*T/5+T/2,q=i%2?r*.42:r,x=Math.cos(a)*q,y=Math.sin(a)*q;i?sh.lineTo(x,y):sh.moveTo(x,y)}return new THREE.Mesh(new THREE.ShapeGeometry(sh),m)};
  const heartS=(m,r)=>{const sh=new THREE.Shape();sh.moveTo(0,-r);sh.bezierCurveTo(-r*1.5,-r*.1,-r*.9,r*1.1,0,r*.4);sh.bezierCurveTo(r*.9,r*1.1,r*1.5,-r*.1,0,-r);return new THREE.Mesh(new THREE.ShapeGeometry(sh),m)};
  const bull=(c,c2,hc,mk,mc)=>{const f=M(c,0,.75),f2=M(c2,0,.6),hm2=M(hc,.35,.3);hm2.side=THREE.DoubleSide;mc.side=THREE.DoubleSide;
   /* CHIFRE de boi: sai da lateral da cabeça, abre para fora, sobe e curva para a frente (tubo ao longo de uma curva) */
   const hornGeo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.07,.0,.02),new THREE.Vector3(.13,.04,.05),new THREE.Vector3(.17,.11,.09),new THREE.Vector3(.17,.2,.14),new THREE.Vector3(.14,.28,.19)]),24,.024,8,false);
   mesh(head,new THREE.SphereGeometry(1,28,20),f,[0,.012,.025],[0,0,0],[RX*1.5,RY*1.3,RZ*1.4]);
   mesh(head,new THREE.CylinderGeometry(.06*hs,.085*hs,.15*hs,18),f2,[0,-.045*hs,RZ*1.55],[T/2,0,0]);
   for(const sd of [1,-1]){ball(head,.012*hs,[sd*.03*hs,-.04*hs,RZ*1.55+.075*hs],dark);
    ball(head,.017*hs,[sd*RX*.85,RY*.28,RZ*1.1],M('#f4f1ea',0,.3));ball(head,.009*hs,[sd*RX*.85,RY*.28,RZ*1.1+.012],dark);
    mesh(head,new THREE.SphereGeometry(1,12,8),f2,[sd*RX*1.55,RY*.45,-RZ*.1],[0,0,sd*-.5],[.07,.035,.045]);
    mesh(head,hornGeo,hm2,[sd*RX*1.02,RY*.42,.0],[0,0,0],[sd,1,1])}
   const m=mk(mc,.035);m.position.set(0,RY*.62,RZ*1.23+.004);m.rotation.x=-.35;head.add(m)};
  const manto=(c,tr)=>{const mc=M(c,.1,.7),tm2=M(tr,.85,.28);ov(mc,2.1,.36);robe(mc,.15,.3,.42,-.2);
   bx(sp,[.5*B,.8,.02],[0,.12*H,-.17*B-.03],mc,[.08,0,0]);bx(sp,[.5*B,.05,.024],[0,-.28,-.17*B-.035],tm2,[.08,0,0]);
   for(let i=0;i<7;i++)ball(sp,.018,[(i-3)*.05*B,.45*H,zf+.01],tm2);
   for(const sd of [1,-1])ball(sp,.075,[sd*(sw+.03),.48*H,0],tm2,[1,.6,1.1])};
  if(SPK==='ceifador'){
   robe(blk,.15,.3,.84,-.38);ov(blk,2.05,.34);part(blk,1.4,0,T*.62,-.25,[0,0,-.015]);
   for(const sd of [1,-1]){const x=sd*RX*.4,y=RY*.08;ball(head,.016*hs,[x,y,fz(x,y)+.008],gl('#8affc9',2.2),[1,.8,.5])}
   bx(sp,[.028,1.5,.028],[.2,.3*H+.15,-.17*B],wd,[0,0,-.22]);bx(sp,[.36,.05,.012],[.2,.3*H+.86,-.17*B],stl,[0,0,-.08]);ball(sp,.025,[0,.36*H,zf+.01],gl('#8affc9',2))}
  if(SPK==='cyber'){const pk=gl(P1),cy=gl(P2),jk=M('#161426',.3,.5);
   ov(jk,1.95,.3);bx(sp,[.2,.07,.12],[0,.52*H,-.01],jk);
   for(const x of [-.075,.075])bx(sp,[.012,.3*H,.012],[x,.3*H,zf+.002],pk);bx(sp,[.15,.012,.012],[0,.18*H,zf+.002],cy);
   bx(head,[RX*1.95,.045*hs,.02],[0,RY*.1,fz(0,RY*.1)+.014],gl(P2,1.4));
   for(const sd of [1,-1]){ball(sp,.07,[sd*(sw+.03),.47*H,0],M('#161426',.8,.3),[1,.7,1.1]);bx(sp,[.1,.012,.1],[sd*(sw+.03),.52*H,0],pk);cyl(head,.03,.03,[sd*(RX+.012),0,0],jk,[0,0,T/2]);mesh(head,new THREE.TorusGeometry(.03,.006,6,14),pk,[sd*(RX+.03),0,0],[0,T/2,0])}
   bx(sp,[.3*B,.36,.06],[0,.3*H,-.145*B],M('#161426',.8,.3));bx(sp,[.2,.012,.012],[0,.3*H,-.145*B-.032],pk)}
  if(SPK==='robo'){const ey=gl('#ff3131',2),cy=gl('#26e0ff');
   ov(M('#8a949c',.85,.28),2.0,.34);cyl(sp,.04,.02,[0,.36*H,zf+.01],cy,[T/2,0,0]);
   for(const sd of [1,-1]){ball(sp,.075,[sd*(sw+.03),.47*H,0],dst,[1,.8,1.1]);cyl(head,.035,.03,[sd*(RX+.012),0,0],dst,[0,0,T/2])}
   bx(head,[RX*1.7,.035*hs,.02],[0,RY*.1,fz(0,RY*.1)+.014],ey);part(dst,1.12,0,T*.45,-.5);bx(head,[RX*.6,.03,.01],[0,-RY*.5,fz(0,-RY*.5)+.006],dark);
   cyl(head,.006,.1,[.05*hs,.19*hs,0],dst);ball(head,.012,[.05*hs,.245*hs,0],ey);
   bx(sp,[.34*B,.4,.1],[0,.3*H,-.15*B],dst);for(const x of [-.1,.1])cyl(sp,.04,.1,[x,.1*H,-.2*B],cy)}
  if(SPK==='anjo'){const wg=M('#fdfaf0',0,.6),hl=gl('#ffe58a',1.8);
   robe(tm,.15,.24,.5,-.22);ov(tm,2.0,.34);bx(sp,[sw*1.75,.045,.2*B+.03],[0,0,0],gold);bx(sp,[.05,.34*H,.012],[0,.3*H,zf+.002],gold);
   wings(wg,5,.55,.6,.46);mesh(head,new THREE.TorusGeometry(.1*hs,.012,8,28),hl,[0,.2*hs,-.01],[T/2,0,0]);
   for(const sd of [1,-1])ball(sp,.06,[sd*(sw+.02),.49*H,0],gold,[1,.7,1.1])}
  if(SPK==='demonio'){const hn=M('#1a0808',.3,.5),fl=gl('#ff7a1a',2);
   ov(M('#2a0d0d',.4,.5),2.0,.34);bx(hips,[hw*2+.1,.3,.24*B],[0,-.14,0],M('#2a0d0d',0,.9));
   for(const sd of [1,-1]){mesh(head,new THREE.ConeGeometry(.024*hs,.15*hs,8),hn,[sd*RX*.6,RY*.95,0],[0,0,-sd*.55]);ball(sp,.07,[sd*(sw+.02),.5*H,0],hn,[1,.7,1.1]);mesh(sp,new THREE.ConeGeometry(.022,.1,6),hn,[sd*(sw+.02),.56*H,0]);const x=sd*RX*.4,y=RY*.08;ball(head,.015*hs,[x,y,fz(x,y)+.008],fl,[1,.8,.5])}
   wings(M('#5a0f12',0,.7),4,.62,.9,.46);
   for(let i=0;i<8;i++)ball(hips,.028-i*.002,[0,-.06-.02*i+(i>4?(i-4)*.06:0),-.12*B-i*.045],skin);mesh(hips,new THREE.ConeGeometry(.03,.07,6),hn,[0,.04,-.12*B-.4],[-T/2,0,0]);
   bx(sp,[.07,.07,.012],[0,.36*H,zf+.002],fl,[0,0,.785])}
  if(SPK==='mago'){const rb=M('#4b2a86',0,.85),st=gl('#f1c40f',1.2),w3=M('#f1ecdf',0,.9);
   robe(rb,.15,.29,.84,-.38);ov(rb,2.0,.34);bx(sp,[sw*1.75,.05,.2*B+.03],[0,0,0],gold);cyl(hips,.292*B,.04,[0,-.78*H,0],gold);
   mesh(head,new THREE.ConeGeometry(.13*hs,.42*hs,20),rb,[0,.29*hs,-.015],[-.12,0,0]);cyl(head,.2*hs,.012,[0,.09*hs,0],rb);cyl(head,.132*hs,.03,[0,.1*hs,0],gold);ball(head,.016,[0,.5*hs,-.03],st);
   mesh(head,new THREE.ConeGeometry(.075,.3,12),w3,[0,-RY*.85-.1,.06],[T,0,0]);bx(head,[RX*.7,.012,.012],[0,-RY*.36,fz(0,-RY*.36)+.012],w3)}
  if(SPK==='saci'){const rd=M('#c01f1f',0,.8),wm4=M('#d8c9a8',0,1);wm4.transparent=true;wm4.opacity=.35;
   mesh(head,new THREE.ConeGeometry(.1*hs,.26*hs,16),rd,[.03,.2*hs,-.03],[-.5,0,-.35]);cyl(head,.108*hs,.06,[0,.075*hs,0],rd);
   bx(head,[.012,.012,.1],[RX*.35,-RY*.52,fz(RX*.35,-RY*.5)+.04],wd);cyl(head,.018,.04,[RX*.35,-RY*.5+.02,fz(RX*.35,-RY*.5)+.09],wd);
   for(let i=0;i<3;i++)mesh(root,new THREE.TorusGeometry(.28+i*.1,.01,6,24),wm4,[0,.08+i*.22,0],[T/2,0,0])}
  if(SPK==='alien'){const sk=M('#2b3a55',.5,.4),g2=gl('#7cff4f',1.6);
   ov(sk,2.0,.34);for(const x of [-.06,.06])bx(sp,[.012,.3*H,.012],[x,.3*H,zf+.002],g2);bx(sp,[sw*1.75,.04,.2*B+.03],[0,0,0],g2);
   for(const sd of [1,-1]){const x=sd*RX*.42,y=RY*.04;mesh(head,new THREE.SphereGeometry(1,16,12),M('#05080a',.9,.1),[x,y,fz(x,y)+.002],[0,0,sd*.35],[.036*hs,.052*hs,.02*hs])}
   cyl(head,.005,.12,[0,.17*hs,0],M('#4a8a3a',0,.8));ball(head,.016,[0,.24*hs,0],g2)}
  if(SPK==='samurai'){const lq=M('#8a1c1c',.2,.5),ir=M('#2a2f4a',.5,.4);
   ov(ir,2.0,.34);for(let i=0;i<5;i++)bx(sp,[sw*2.02,.022,.2*B+.075],[0,(.16+i*.065)*H,0],lq);
   bx(hips,[hw*2+.2,.24,.28*B],[0,-.14,0],ir);for(let i=0;i<3;i++)bx(hips,[hw*2+.2,.02,.285*B],[0,-.06-i*.07,0],lq);bx(sp,[sw*1.75,.05,.2*B+.035],[0,0,0],gold);
   for(const sd of [1,-1])for(let i=0;i<3;i++)bx(sp,[.14,.03,.16],[sd*(sw+.03),.5*H-i*.035,0],i%2?lq:ir,[0,0,sd*-.3]);
   part(ir,1.26,0,T*.56,-.42,[0,.02,-.004]);part(lq,1.1,T*.56,T*.34,0);bx(head,[RX*2.1,.07,.06],[0,-RY*.05,-RZ*.95],ir,[.3,0,0]);
   mesh(head,new THREE.TorusGeometry(.06*hs,.008,6,16,T*1.2),gold,[0,.17*hs,.1*hs],[0,0,T*.9]);
   bx(sp,[.03,.03,.9],[sw*.75,-.1,.02],M('#111111',.3,.5),[-.25,0,0]);ball(sp,.02,[sw*.75,-.02,.4],gold)}
  if(SPK==='cavaleiro'){const rc=M('#b3262a',0,.8),wc=M('#f4f4f1',0,.8);
   ov(stl,2.05,.34);
   if(DK){const kb=M('#0c0d10',.5,.5),sk=M('#ecebe4',.1,.6),rd=glow('#e01616',1.2);bx(sp,[.3,.34*H,.02],[0,.3*H,zf+.012],kb);for(const y of [.465,.135])bx(sp,[.3,.014,.012],[0,y*H,zf+.024],rd);for(const x of [-.145,.145])bx(sp,[.014,.34*H,.012],[x,.3*H,zf+.024],rd);ball(sp,.058,[0,.335*H,zf+.036],sk,[1,1.1,.7]);bx(sp,[.05,.03,.012],[0,.275*H,zf+.034],sk);for(const x of [-.02,.02])ball(sp,.014,[x,.34*H,zf+.066],kb);bx(sp,[.012,.02,.012],[0,.322*H,zf+.07],kb);for(const x of [-.016,0,.016])bx(sp,[.006,.022,.006],[x,.27*H,zf+.042],kb)}
   else{bx(sp,[.3,.34*H,.02],[0,.3*H,zf+.012],rc);bx(sp,[.05,.28*H,.012],[0,.3*H,zf+.026],wc);bx(sp,[.18,.045,.012],[0,.37*H,zf+.026],wc)}
   for(const sd of [1,-1])ball(sp,.085,[sd*(sw+.03),.48*H,0],stl,[1.1,.8,1.2]);
   cyl(head,.127*hs,.27*hs,[0,.015,0],stl);mesh(head,new THREE.CylinderGeometry(.06*hs,.127*hs,.05,24),stl,[0,.175*hs,0]);
   bx(head,[.2*hs,.014,.01],[0,RY*.1,.127*hs+.002],blk);bx(head,[.014,.1*hs,.01],[0,-.02,.127*hs+.002],blk);bx(head,[.03,.07,.2*hs],[0,.2*hs,-.02],rc);
   bx(sp,[sw*1.9,.75*H,.025],[0,.17*H,-.13*B-.03],rc,[.06,0,0]);bx(sp,[sw*1.75,.05,.2*B+.035],[0,0,0],M('#3b2a1c',.1,.7))}
  if(SPK==='viking'){const fur=M('#8a6a45',0,1),ir=M('#7d858c',.8,.35),lt=M('#5a3a22',0,.8);
   ov(lt,2.0,.34);for(const sg of [1,-1])bx(sp,[.04,.5*H,.2*B+.08],[0,.3*H,0],M('#2a1d14',0,.8),[0,0,sg*.5]);
   mesh(sp,new THREE.TorusGeometry(.17,.045,10,22),fur,[0,.5*H,0],[T/2,0,0],[1.1,1,1]);for(const sd of [1,-1])ball(sp,.08,[sd*(sw+.02),.49*H,0],fur,[1.2,.8,1.2]);
   bx(sp,[sw*1.75,.06,.2*B+.035],[0,0,0],lt);bx(sp,[.06,.05,.012],[0,0,.1*B+.04],ir);
   part(ir,1.2,0,T*.5,-.42,[0,.022,-.004]);bx(head,[.016*hs,.08*hs,.01],[0,.03*hs,.115*hs],ir);
   for(const sd of [1,-1])mesh(head,new THREE.ConeGeometry(.026*hs,.15*hs,8),bone,[sd*RX*1.12,.05*hs,0],[0,0,-sd*.95]);
   cyl(sp,.2,.025,[0,.3*H,-.14*B-.03],lt,[T/2,0,0]);mesh(sp,new THREE.TorusGeometry(.2,.014,6,24),ir,[0,.3*H,-.14*B-.03]);ball(sp,.04,[0,.3*H,-.14*B-.06],ir)}
  if(SPK==='indio'){const fc=['#e03a2a','#f1c40f','#2c8a3c','#f4f4f1','#2c5aa0'],bd=M('#e03a2a',0,.8);bd.side=THREE.DoubleSide;
   mesh(head,new THREE.CylinderGeometry(1,1,.04,26,1,true),bd,[0,RY*.42,0],[0,0,0],[RX*.97,1,RZ*.97]);
   for(let i=0;i<17;i++){const ang=-T*.5+i*(T/16),Lf=.17+((i%2)?.045:0);bx(head,[.032,Lf,.008],[Math.sin(ang)*(.1*hs+Lf/2),RY*.42+Math.cos(ang)*(.1*hs+Lf/2),-.04*hs],M(fc[i%5],0,.8),[0,0,-ang])}
   for(const sd of [1,-1])for(const yy of [-.2,-.4]){const x=sd*RX*.62,y=yy*RY;bx(head,[.05*hs,.01,.006],[x,y,fz(x,y)+.001],M('#c1121f',0,.8),[0,sd*.5,0])}
   for(let i=0;i<3;i++)bx(sp,[sw*.8,.014,.012],[0,(.18+i*.08)*H,.105*B],M('#c1121f',0,.8));
   mesh(sp,new THREE.TorusGeometry(.125,.012,6,28),bone,[0,.5*H,.035],[T/2+.65,0,0]);
   const sg=M('#d9bf72',0,1);bx(hips,[hw*2+.06,.24,.26*B],[0,-.13,0],sg);for(let i=0;i<9;i++)bx(hips,[.02,.1,.01],[(i-4)*.035,-.28,.13*B],sg)}
  if(SPK==='curupira'){const lf=M('#2f6b3a',0,.9),fl=gl('#ff7a1a',1.2);
   for(let i=0;i<22;i++){const a=i*2.4,e=.2+((i*37)%10)/16,v=new THREE.Vector3(Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e));if(v.z>.55&&v.y<.7)continue;
    const o=mesh(head,new THREE.ConeGeometry(.026,.14+((i*13)%5)*.02,6),i%2?gl('#ffb52e',1.4):fl,[v.x*RX*1.02,v.y*RY*1.02,v.z*RZ*1.02]);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize())}
   for(const sd of [1,-1]){const x=sd*RX*.4,y=RY*.08;ball(head,.014*hs,[x,y,fz(x,y)+.008],fl,[1,.8,.5])}
   bx(sp,[.04,.5*H,.2*B+.08],[0,.3*H,0],M('#4a8a3a',0,.9),[0,0,.6]);mesh(sp,new THREE.TorusGeometry(.09,.03,6,12),lf,[0,.52*H,0],[T/2,0,0]);mesh(hips,new THREE.CylinderGeometry(.14*B,.2*B,.2*H,10),lf,[0,-.14*H,0])}
  if(SPK==='ninja'){const bk=M('#0d0e12',0,.9),rd2=M('#c1121f',0,.8),bd=M('#c1121f',0,.8);bd.side=THREE.DoubleSide;
   part(bk,1.07,0,T,0);
   for(const sd of [1,-1]){const x=sd*RX*.4,y=RY*.08,zm=RZ*.989+.004;bx(head,[.05*hs,.03*hs,.004],[x,y,zm-.002],skin);ball(head,.011*hs,[x,y,zm+.002],M('#f4f4f1',0,.4),[1.3,.7,.3]);ball(head,.005*hs,[x,y,zm+.006],M('#0a0a0a'),[1,1,.3])}
   mesh(head,new THREE.CylinderGeometry(1,1,.04,26,1,true),bd,[0,RY*.45,0],[0,0,0],[RX*1.01,1,RZ*1.01]);
   bx(head,[.03,.2,.008],[.02,-.08,-RZ-.045],rd2,[.25,0,.25]);bx(head,[.03,.17,.008],[-.02,-.07,-RZ-.04],rd2,[.2,0,-.3]);
   ov(bk,1.95,.34);bx(sp,[.04,.5*H,.2*B+.08],[0,.3*H,0],M('#2a2d34',0,.9),[0,0,.55]);mesh(sp,new THREE.TorusGeometry(.07,.022,8,16),rd2,[0,.52*H,0],[T/2,0,0]);bx(sp,[sw*1.7,.05,.2*B+.03],[0,0,0],rd2);
   bx(sp,[.03,.95,.025],[0,.3*H,-.15*B],M('#111111',.3,.5),[0,0,-.6]);bx(sp,[.036,.2,.032],[.325,.3*H+.47,-.15*B],rd2,[0,0,-.6])}
  if(SPK==='pirata'){const bk=M('#14110d',0,.85),lt=M('#5a3a22',0,.8),rd2=M('#b3262a',0,.8);
   ov(M('#f1ecdf',0,.8),2.0,.34);for(const sd of [1,-1])bx(sp,[sw*.62,.3*H,.2*B+.08],[sd*sw*.62,.3*H,0],lt);bx(sp,[sw*1.75,.06,.2*B+.035],[0,0,0],rd2);
   mesh(head,new THREE.CylinderGeometry(.2*hs,.2*hs,.02,3),bk,[0,.105*hs,0]);cyl(head,.1*hs,.06,[0,.12*hs,0],bk);ball(head,.016*hs,[0,.12*hs,.095*hs],M('#f4f4f1',0,.6));
   bx(head,[.05*hs,.05*hs,.01],[RX*.4,RY*.08,fz(RX*.4,RY*.08)+.012],bk);
   const pr=M('#d62828',0,.7);ball(sp,.035,[-(sw+.01),.58*H,.02],pr,[1,1.3,1]);ball(sp,.025,[-(sw+.01),.64*H,.04],pr);mesh(sp,new THREE.ConeGeometry(.01,.03,6),M('#f1c40f',0,.6),[-(sw+.01),.635*H,.075],[T/2,0,0]);bx(sp,[.025,.09,.01],[-(sw+.01),.52*H,-.03],M('#2c8a3c',0,.7),[.3,0,0]);bx(sp,[.01,.05,.04],[-(sw+.035),.58*H,.02],M('#2c5aa0',0,.7))}
  if(SPK==='rock'){const lt=M('#15151b',.2,.5),st2=M('#c9c9c9',.8,.3),gt=M('#c1121f',.15,.45);
   ov(lt,1.95,.3);bx(sp,[.1,.26*H,.012],[0,.3*H,zf+.002],M('#e8e8e8',0,.9));bx(sp,[.15,.05,.09],[0,.5*H,.02],lt);for(let i=0;i<4;i++)for(const sd of [1,-1])ball(sp,.008,[sd*.08,(.4-i*.07)*H,zf+.004],st2);
   bx(sp,[sw*1.75,.05,.2*B+.035],[0,0,0],lt);bx(sp,[.06,.05,.012],[0,0,.1*B+.04],st2);
   for(const sd of [1,-1]){const x=sd*RX*.4;bx(head,[.075*hs,.05*hs,.014],[x,RY*.08,fz(x,RY*.08)+.012],blk)}bx(head,[RX*1.1,.01,.01],[0,RY*.1,fz(0,RY*.1)+.012],blk);
   const gu=new THREE.Group();gu.position.set(0,.3*H,-.17*B-.02);gu.rotation.z=.5;sp.add(gu);ball(gu,.11,[0,-.2,0],gt,[1,1.25,.28]);ball(gu,.08,[0,-.02,0],gt,[1,1,.28]);bx(gu,[.035,.46,.02],[0,.3,0],wd);bx(gu,[.05,.08,.02],[0,.56,0],blk);cyl(gu,.035,.01,[0,-.1,-.04],blk,[T/2,0,0]);
   bx(sp,[.045,.5*H,.2*B+.05],[0,.3*H,0],blk,[0,0,-.55])}
  if(SPK==='f1'){const hl=M('#f2d21b',.5,.3),vz=new THREE.MeshStandardMaterial({color:'#0c1a2e',emissive:'#1e5ea8',emissiveIntensity:.5,metalness:.8,roughness:.1});
   mesh(head,new THREE.SphereGeometry(1,32,24),hl,[0,.012,-.004],[0,0,0],[RX*1.3,RY*1.24,RZ*1.3]);
   mesh(head,new THREE.SphereGeometry(1,32,16,.2*T,.6*T,.28*T,.5*T),vz,[0,.012,-.004],[0,0,0],[RX*1.32,RY*1.26,RZ*1.32]);
   bx(head,[.025*hs,.012,.2],[0,RY*1.24,0],M('#1e8e3c',0,.6));bx(sp,[.2,.05,.12],[0,.52*H,0],dark);
   mesh(sp,new THREE.PlaneGeometry(.22,.07),txt('BRASIL','#ffffff'),[0,.38*H,.114*B]);bx(sp,[sw*.9,.03,.012],[0,.26*H,.113*B],M('#1e8e3c',0,.7));bx(sp,[sw*.9,.02,.012],[0,.22*H,.113*B],M('#f2d21b',0,.7));
   mesh(sp,new THREE.PlaneGeometry(.2,.12),txt('12','#ffffff',.6),[0,.36*H,-.115*B],[0,T,0])}
  if(SPK==='vampiro'){const bk=M('#0b0709',0,.8),rd2=M('#7a0f1f',0,.7);
   ov(rd2,1.95,.3);for(const sd of [1,-1]){bx(sp,[sw*.6,.34*H,.2*B+.08],[sd*sw*.7,.3*H,0],bk);bx(sp,[.03,.14,.1],[sd*.085,.55*H,-.03],bk,[0,0,sd*.25])}
   bx(sp,[sw*2.2,.9*H,.03],[0,.12*H,-.13*B-.03],bk,[.07,0,0]);ball(sp,.014,[0,.47*H,zf+.004],gl('#d62828',1.4));bx(sp,[.05,.1,.012],[0,.45*H,zf+.002],M('#f1ecdf',0,.8));
   for(const sd of [1,-1])bx(head,[.007,.022,.006],[sd*.014,-RY*.52-.012,fz(sd*.014,-RY*.5)+.004],M('#ffffff',0,.5))}
  if(SPK==='selecao'){const gr=M('#1e8e3c',0,.7);
   mesh(sp,new THREE.TorusGeometry(.085,.016,8,16),gr,[0,.52*H,0],[T/2,0,0]);ball(sp,.022,[.075,.4*H,.113*B+.002],gr,[1,1.1,.4]);
   mesh(sp,new THREE.PlaneGeometry(.2,.12),txt('10','#1e8e3c',.6),[0,.34*H,-.113*B-.002],[0,T,0])}
  if(SPK==='capoeira'){const cd=M('#f2d21b',0,.8);
   bx(sp,[sw*1.7,.04,.2*B+.03],[0,0,0],cd);for(const [x,c] of [[.05,'#1e8e3c'],[.075,'#2c5aa0'],[.02,'#f2d21b']])bx(sp,[.018,.22,.012],[x,-.1,.1*B+.02],M(c,0,.8),[0,0,x*2]);
   cyl(sp,.008,.95,[.18,.3*H,-.15*B-.02],wd,[0,0,.12]);ball(sp,.06,[.24,.3*H-.45,-.15*B-.02],M('#d9a441',0,.8),[1,1.1,1])}
  if(SPK==='malandro'){const wt=M('#f4f1e8',0,.85),rd2=M('#c1121f',0,.7),bk=M('#14110d',0,.8);
   ov(wt,2.0,.34);for(const sd of [1,-1])bx(sp,[.06,.3*H,.012],[sd*.06,.36*H,zf+.002],M('#e4dfd0',0,.9),[0,0,sd*.2]);
   mesh(sp,new THREE.TorusGeometry(.07,.017,8,16),rd2,[0,.52*H,0],[T/2,0,0]);bx(sp,[.05,.1,.012],[0,.46*H,zf+.004],rd2);
   cyl(head,.105*hs,.07,[0,.1*hs,0],wt);cyl(head,.108*hs,.02,[0,.085*hs,0],bk);mesh(head,new THREE.CylinderGeometry(.18*hs,.18*hs,.01,26),wt,[0,.062*hs,0],[0,0,0],[1,1,1.1])}
  if(SPK==='bombeiro'){const sv=M('#d5d5d5',.5,.3),rh=M('#c0392b',.3,.45),yl=M('#f2d21b',.3,.5);
   ov(M('#d9a31e',0,.8),2.0,.34);for(const y of [.14,.28])bx(sp,[sw*2.02,.028,.2*B+.075],[0,y*H,0],sv);bx(sp,[sw*1.75,.05,.2*B+.035],[0,0,0],M('#1c1f26',0,.8));
   part(rh,1.22,0,T*.55,-.35,[0,.02,-.004]);bx(head,[.012*hs,.02,.2*hs],[0,.128*hs,0],rh);bx(head,[.2*hs,.012,.14],[0,.04,-.12],rh,[.35,0,0]);bx(head,[.05*hs,.05*hs,.012],[0,.1*hs,.128*hs],yl);
   for(const x of [-.07,.07])cyl(sp,.055,.4,[x,.3*H,-.15*B-.04],yl)}
  if(SPK==='mergulhador'){const yl=M('#f2d21b',0,.6),bk=M('#101820',0,.7);
   for(const x of [-.07,.07])cyl(sp,.062,.46,[x,.3*H,-.16*B-.04],M('#d5d5d5',.6,.3));
   for(const sd of [1,-1])bx(sp,[.02,.3*H,.2*B+.07],[sd*sw*.95,.3*H,0],yl);bx(sp,[sw*1.7,.05,.2*B+.035],[0,0,0],M('#2b2f33',0,.8));
   part(bk,1.08,0,T*.62,-.3);bx(head,[RX*1.95,.075*hs,.03],[0,RY*.1,fz(0,RY*.1)+.014],yl);
   for(const sd of [1,-1])bx(head,[.07*hs,.045*hs,.01],[sd*RX*.4,RY*.1,fz(sd*RX*.4,RY*.1)+.032],M('#7fd0ff',.6,.1));cyl(head,.012,.2,[-RX*1.05,.04*hs,.03],yl)}
  if(SPK==='estreia'){const yl=YL?glow(YL,.9):M('#f2c200',.2,.5),wt=M('#f1f0ea',.1,.55),dk=M('#101216',.3,.6),hm=M('#17191e',.35,.5),vz=new THREE.MeshStandardMaterial({color:'#0e1a33',emissive:'#17408f',emissiveIntensity:.55,metalness:.7,roughness:.12}),tank=M('#e9e9e4',.5,.35);
   ov(dk,2.08,.36,.3,.08);bx(sp,[sw*1.2,.11*H,.012],[0,.4*H,zf+.012],yl);bx(sp,[sw*1.2,.035,.014],[0,.3*H,zf+.014],wt);bx(sp,[sw*1.2,.035,.014],[0,.25*H,zf+.014],yl);
   for(const sd of [1,-1]){bx(sp,[.05,.4*H,.012],[sd*.085,.38*H,zf+.004],hm);bx(sp,[.07,.075,.022],[sd*.075,.12*H,zf+.014],yl);cyl(sp,.055,.4,[sd*.07,.3*H,-.15*B-.05],tank);cyl(sp,.057,.04,[sd*.07,.4*H,-.15*B-.05],yl)}
   mesh(sp,new THREE.TorusGeometry(.078,.03,8,18),yl,[0,.54*H,0],[T/2,0,0]);
   bx(sp,[sw*1.75,.055,.2*B+.035],[0,0,0],dk);bx(sp,[.06,.05,.012],[0,0,.105*B+.02],yl);
   part(hm,1.24,0,T*.6,-.3,[0,.02,-.004]);bx(head,[.03*hs,.02,.21*hs],[0,.13*hs,0],yl);bx(head,[.2*hs,.02,.14],[0,.03,-.12],hm,[.35,0,0]);
   bx(head,[RX*2.15,.1*hs,.035],[0,RY*.1,fz(0,RY*.1)+.016],hm);bx(head,[RX*1.85,.075*hs,.03],[0,RY*.1,fz(0,RY*.1)+.034],vz);
   bx(head,[RX*1.7,.07*hs,.05],[0,-RY*.52,fz(0,-RY*.52)+.024],dk);bx(head,[.07*hs,.022*hs,.02],[0,-RY*.5,fz(0,-RY*.5)+.05],yl);bx(head,[.07*hs,.022*hs,.02],[0,-RY*.62,fz(0,-RY*.62)+.05],wt);
   for(const sd of [1,-1]){cyl(head,.009,.2*hs,[sd*RX*.78,-RY*.3,.02],dk);bx(head,[.012,.09*hs,.1*hs],[sd*RX*1.03,.02,.0],yl)}}
  if(SPK==='boxeador'){
   bx(hips,[hw*2+.12,.06,.2*B+.06],[0,.06,0],M('#f2d21b',0,.6));bx(sp,[sw*1.75,.09,.2*B+.04],[0,.04,0],gold);bx(sp,[.1,.1,.012],[0,.04,.1*B+.036],M('#1e8e3c',.5,.4))}
  if(SPK==='caipira'){const sm=M('#d9bf72',0,.95);
   cyl(head,.11*hs,.09,[0,.1*hs,0],sm);mesh(head,new THREE.CylinderGeometry(.22*hs,.22*hs,.008,28),sm,[0,.06*hs,0],[0,0,0],[1,1,1.08]);cyl(head,.112*hs,.02,[0,.085*hs,0],M('#c0392b',0,.8));
   for(const sd of [1,-1])bx(sp,[.03,.34*H,.012],[sd*.075,.3*H,.113*B+.004],wd);bx(sp,[.07,.07,.012],[.08,.2*H,.113*B+.004],M('#2c5aa0',0,.9));
   bx(head,[.005,.005,.09],[.01,-RY*.5,fz(0,-RY*.5)+.05],M('#e8c76a',0,.8),[.3,0,0]);mesh(sp,new THREE.TorusGeometry(.07,.018,8,14),M('#c0392b',0,.8),[0,.52*H,0],[T/2,0,0])}
  if(SPK==='reveillon'){const gd2=M('#f2c14e',.8,.3),cf=['#ff3d81','#27d3ff','#ffd400','#7cff4f'];mesh(head,new THREE.ConeGeometry(.1*hs,.3*hs,14),gd2,[0,.22*hs,0]);ball(head,.035*hs,[0,.38*hs,0],M('#ffffff',0,.5));cyl(head,.102*hs,.03,[0,.075*hs,0],M('#1d1f24',0,.6));
   mesh(sp,new THREE.TorusGeometry(.075,.018,8,14),gd2,[0,.52*H,0],[T/2,0,0]);bx(sp,[.045,.55*H,.012],[0,.3*H,.113*B+.004],gd2,[0,0,.6]);
   for(let i=0;i<10;i++){const a=i/10*T*2;ball(sp,.016,[Math.cos(a)*.22,.64*H+(i%3)*.04,Math.sin(a)*.15],M(cf[i%4],0,.6))}}
  if(SPK==='folia'){const cl=['#ff2fd0','#27e0ff','#ffd400','#7cff4f','#ff7a1a','#7a3ad1','#ff3131'];for(let i=0;i<9;i++){const a=(i-4)/4*1.1,fe=mesh(head,new THREE.ConeGeometry(.035*hs,.34*hs,6),M(cl[i%7],0,.7),[Math.sin(a)*.18*hs,.14*hs+Math.cos(a)*.2*hs,-.1*hs],[0,0,-a]);fe.scale.set(1,1,.5)}
   cyl(head,.108*hs,.03,[0,.075*hs,0],M('#f2c14e',.8,.3));bx(head,[RX*1.9,.06*hs,.03],[0,RY*.12,.108*hs],M('#ff2fd0',.2,.4));
   for(let i=0;i<5;i++)ball(sp,.05,[(i-2)*.085,.55*H,0],M(cl[i],0,.7),[1,.4,1]);bx(hips,[hw*2+.08,.14,.2*B+.08],[0,-.02,0],M('#ff2fd0',0,.7))}
  if(SPK==='palhaco'){const cl=['#ff3131','#ffd400','#27e0ff','#7cff4f','#ff2fd0','#ff7a1a'];[[.15,0],[-.15,0],[.11,-.11],[-.11,-.11],[0,-.15],[.13,-.05],[-.13,-.05]].forEach(([x,z],i)=>ball(head,.07*hs,[x*hs,.02*hs,z*hs],M(cl[i%6],0,.8)));ball(head,.075*hs,[0,.12*hs,-.02*hs],M('#ff7a1a',0,.8));
   ball(head,.036*hs,[0,-.02*hs,.12*hs],M('#e8222e',0,.5));mesh(sp,new THREE.TorusGeometry(.1,.035,8,16),M('#ffffff',0,.9),[0,.54*H,0],[T/2,0,0]);mesh(sp,new THREE.TorusGeometry(.12,.012,8,16),M('#ff3131',0,.8),[0,.54*H,0],[T/2,0,0]);
   for(let i=0;i<6;i++)ball(sp,.025,[((i%3)-1)*.09,(.2+Math.floor(i/3)*.16)*H,.1*B+.008],M(cl[i],0,.7));for(const sd of[1,-1])bx(sp,[.03,.5*H,.012],[sd*.08,.3*H,.113*B+.004],M('#27e0ff',0,.8))}
  if(SPK==='florista'){const fc=['#ff7aa8','#ffd84a','#ffffff','#c77dff','#ff9f2e'];for(let i=0;i<10;i++){const a=i/10*T*2;if(Math.sin(a)>.92)continue;ball(head,.032*hs,[Math.cos(a)*.115*hs,.085*hs,Math.sin(a)*.115*hs],M(fc[i%5],0,.7));ball(head,.016*hs,[Math.cos(a)*.115*hs,.085*hs+.03*hs,Math.sin(a)*.115*hs],M('#3a8a3a',0,.8))}
   bx(hips,[hw*2+.1,.55*H,.03],[0,-.22*H,.1*B+.02],M('#fff3f8',0,.9));for(let i=0;i<5;i++)ball(hips,.03,[(i-2)*.05,-.1*H-(i%2)*.07,.1*B+.04],M(fc[i%5],0,.7));ball(sp,.055,[.1,.4*H,.12*B],M('#ff7aa8',0,.7));ball(sp,.025,[.1,.4*H,.12*B+.03],M('#ffd84a',0,.7))}
  if(SPK==='sanfoneiro'){const sm=M('#d9bf72',0,.95),rd2=M('#c1121f',.2,.5),wt2=M('#f6f6f2',0,.6);cyl(head,.11*hs,.09,[0,.1*hs,0],sm);mesh(head,new THREE.CylinderGeometry(.22*hs,.22*hs,.008,28),sm,[0,.06*hs,0],[0,0,0],[1,1,1.08]);cyl(head,.112*hs,.02,[0,.085*hs,0],M('#c0392b',0,.8));
   bx(sp,[.3*B,.3,.1],[0,.28*H,.14*B+.02],rd2);for(let i=0;i<6;i++)bx(sp,[.31*B,.012,.105],[0,.2*H+i*.05,.14*B+.02],wt2);bx(sp,[.06,.3,.11],[-.15*B,.28*H,.14*B+.02],M('#1d1f24',0,.6));
   ['#27e0ff','#ffd400','#ff2fd0','#7cff4f'].forEach((c,i)=>mesh(head,new THREE.ConeGeometry(.02*hs,.04*hs,3),M(c,0,.7),[(i-1.5)*.1*hs,.0,.2*hs],[T,0,0]))}
  if(SPK==='surfista'){const gl2=new THREE.MeshStandardMaterial({color:'#101820',roughness:.15,metalness:.8}),lc=['#ff7aa8','#ffd84a','#ff9f2e','#7cff4f'];bx(head,[RX*1.95,.045*hs,.03],[0,RY*.12,.11*hs],gl2);for(const sd of[1,-1])bx(head,[.07*hs,.05*hs,.014],[sd*RX*.45,RY*.1,.112*hs],gl2);
   for(let i=0;i<10;i++){const a=i/10*T*2;ball(sp,.022,[Math.cos(a)*.11,.52*H,Math.sin(a)*.09],M(lc[i%4],0,.7))}
   mesh(sp,new THREE.SphereGeometry(.5,14,10),M('#27d3ff',.1,.4),[.1,.3*H,-.2*B-.06],[0,0,.12],[.24,1.15,.07]);bx(sp,[.04,1.0,.078],[.1,.3*H,-.2*B-.06],M('#ffffff',0,.6),[0,0,.12]);bx(hips,[hw*2+.1,.3*H,.2*B+.07],[0,-.1*H,0],M('#ff7a1a',0,.8))}
  if(SPK==='iara'){const hr=M('#1fb5a8',0,.7),dk=M('#0e6f78',0,.7);dk.side=THREE.DoubleSide;mesh(head,new THREE.SphereGeometry(.118*hs,18,12),hr,[0,.025*hs,-.02*hs],[0,0,0],[1.04,1,1]);
   mesh(sp,new THREE.CapsuleGeometry(.075,.62*H,4,10),hr,[0,.28*H,-.13*B],[0,0,0]);for(const sd of[1,-1])mesh(sp,new THREE.CapsuleGeometry(.04,.4*H,4,8),hr,[sd*.15*B,.38*H,.05],[0,0,sd*.05]);
   for(let i=0;i<5;i++){const a=(i-2)*.45;mesh(head,new THREE.ConeGeometry(.03*hs,.09*hs,6),M('#ffb3d9',.3,.4),[Math.sin(a)*.12*hs,.12*hs,Math.cos(a)*.1*hs],[.3,0,-a*.5])}
   for(let i=0;i<10;i++){const a=i/10*T*2;ball(sp,.014,[Math.cos(a)*.1,.53*H,Math.sin(a)*.08],M('#ffffff',.4,.2))}mesh(hips,new THREE.CylinderGeometry(.12*B,.2*B,.5*H,16,1,true),dk,[0,-.2*H,0])}
  if(SPK==='patriota'){const gr=M('#0c8f3c',0,.8),yl2=M('#ffdf00',0,.8),bl=M('#1f4fbf',0,.7);bx(sp,[.34*B,.62*H,.03],[0,.28*H,-.12*B-.02],gr,[.12,0,0]);bx(sp,[.36*B,.64*H,.012],[0,.28*H,-.12*B-.045],yl2,[.12,0,0]);
   cyl(head,.108*hs,.04,[0,.07*hs,0],gr);ball(head,.022*hs,[0,.07*hs,.107*hs],yl2);for(const sd of[1,-1]){bx(head,[.07*hs,.015,.01],[sd*RX*.55,-RY*.15,.108*hs],sd>0?gr:yl2)}
   ball(sp,.06,[0,.35*H,.1*B],bl,[1,1,.3]);bx(sp,[.12,.012,.03],[0,.35*H,.108*B+.01],M('#ffffff',0,.6))}
  if(SPK==='petista'){const rd=M('#d4121f',0,.8),wh=M('#ffffff',0,.6),st=(par,x,y,z,r)=>{for(let i=0;i<5;i++){const a=i/5*Math.PI*2;bx(par,[.014*r,.05*r,.008],[x+Math.sin(a)*.025*r,y+Math.cos(a)*.025*r,z],wh,[0,0,-a])}ball(par,.02*r,[x,y,z],wh,[1,1,.3])};
   st(sp,0,.3*H,.108*B+.012,1.7);cyl(head,.108*hs,.04,[0,.07*hs,0],rd);bx(head,[.12*hs,.012,.07*hs],[0,.045*hs,.14*hs],rd);st(head,0,.085*hs,.112*hs,.7);
   bx(sp,[.34*B,.07*H,.03],[0,.02*H,.1*B+.002],wh)}
  if(SPK==='abobora'){const or=M('#e8761a',.1,.6),dkor=M('#b84e0c',.1,.7),gc=gl('#ffd23a',2.2),dk2=M('#1a0d05',0,.9);ball(head,.205*hs,[0,.03*hs,0],or,[1.15,1,1.05]);
   for(let i=0;i<4;i++)mesh(head,new THREE.TorusGeometry(.2*hs,.011*hs,6,24),dkor,[0,.03*hs,0],[0,i*T/4,0],[1.18,1,1.08]);
   cyl(head,.028*hs,.09*hs,[0,.25*hs,0],M('#4a6b2a',0,.9),[0,0,.3]);for(const sd of[1,-1])mesh(head,new THREE.ConeGeometry(.045*hs,.075*hs,3),gc,[sd*.075*hs,.07*hs,.225*hs],[0,0,sd>0?.2:-.2]);
   mesh(head,new THREE.ConeGeometry(.03*hs,.05*hs,3),gc,[0,.0,.23*hs],[0,0,T]);bx(head,[.22*hs,.035*hs,.02],[0,-.08*hs,.225*hs],gc);for(let i=0;i<4;i++)bx(head,[.018*hs,.04*hs,.024],[(i-1.5)*.05*hs,-.08*hs,.226*hs],dk2);
   bx(sp,[.46*B,.8*H,.03],[0,.2*H,-.13*B],M('#1c1030',0,.9),[.1,0,0]);for(let i=0;i<5;i++)bx(sp,[.08*B,.12*H,.03],[(i-2)*.09*B,-.22*H,-.14*B-.02],M('#1c1030',0,.9),[.1,0,(i%2?.1:-.1)])}
  if(SPK==='gotinha'){const bl=M('#35c2ff',.1,.5),wh=M('#f6f9fc',0,.8),rd=M('#e63946',0,.6);mesh(head,new THREE.ConeGeometry(.125*hs,.26*hs,16),bl,[0,.2*hs,0]);ball(head,.032*hs,[0,.34*hs,0],bl);cyl(head,.122*hs,.035,[0,.09*hs,0],wh);
   ball(sp,.045,[0,.3*H,.118*B],bl,[1,1.1,.5]);mesh(sp,new THREE.ConeGeometry(.04,.07,10),bl,[0,.345*H,.118*B],[0,0,0],[1,1,.5]);bx(sp,[.07,.018,.012],[0,.2*H,.118*B],rd);bx(sp,[.018,.07,.012],[0,.2*H,.118*B],rd)}
  if(SPK==='cupido'){const wh=M('#fbf7ee',0,.9),pk=M('#ff5c93',.1,.5);for(const sx of[-1,1]){mesh(sp,new THREE.SphereGeometry(.5,12,8),wh,[sx*.2,.36*H,-.17*B],[0,sx*.5,sx*.35],[.1,.34*H,.2]);mesh(sp,new THREE.SphereGeometry(.5,12,8),wh,[sx*.3,.28*H,-.19*B],[0,sx*.6,sx*.6],[.09,.26*H,.16])}
   for(const sx of[-1,1])ball(head,.035*hs,[sx*.024*hs,.2*hs,0],pk);mesh(head,new THREE.ConeGeometry(.045*hs,.07*hs,6),pk,[0,.16*hs,0],[T,0,0]);mesh(head,new THREE.TorusGeometry(.13*hs,.012*hs,6,18),M('#f2c14e',.8,.3),[0,.1*hs,0],[T/2,0,0]);bx(sp,[.015,.5*H,.015],[.18,.26*H,.13*B],M('#8a5a34',0,.9),[0,0,.5])}
  if(SPK==='bruxa'){const pu=M('#2a1448',0,.85),gr=M('#8dff3f',.5,.3);cyl(head,.2*hs,.025,[0,.1*hs,0],pu);mesh(head,new THREE.ConeGeometry(.12*hs,.34*hs,14),pu,[0,.28*hs,0],[0,0,.18]);cyl(head,.121*hs,.04,[0,.14*hs,0],M('#8dff3f',0,.6));
   ball(head,.02*hs,[-.12*hs,-.0,.08*hs],M('#4f9e2a',0,.9));for(let i=0;i<4;i++)ball(sp,.035,[(i-1.5)*.08,.05*H,.12*B],gr);bx(sp,[.5*B,.08*H,.22*B],[0,.04*H,0],pu)}
  if(SPK==='servidor'){const ti=M('#1c3e8c',0,.7),yl=M('#f2c14e',.3,.5);bx(sp,[.045,.34*H,.012],[0,.3*H,.118*B+.004],ti);bx(sp,[.06,.05,.014],[0,.46*H,.118*B+.004],ti);bx(sp,[.05,.06,.012],[.07,.2*H,.118*B+.004],yl);bx(sp,[.012,.3*H,.01],[0,.34*H,.118*B],M('#ff7a1a',0,.6));
   bx(head,[.19*hs,.04*hs,.012],[0,.03*hs,.108*hs],M('#111',0,.5))}
  if(SPK==='catrina'){const wh=M('#f6f3ea',0,.7),bk=M('#0d0b10',0,.8),fl=['#ff9f2e','#ff4f8b','#f2c14e','#c1121f'];ball(head,.118*hs,[0,0,.012*hs],wh,[1,1.06,.97]);for(const sx of[-1,1]){ball(head,.034*hs,[sx*.048*hs,.02*hs,.108*hs],bk);ball(head,.012*hs,[sx*.048*hs,.02*hs,.138*hs],M('#ff9f2e',0,.5))}
   mesh(head,new THREE.ConeGeometry(.018*hs,.04*hs,3),bk,[0,-.02*hs,.12*hs],[T,0,0]);for(let i=0;i<7;i++)bx(head,[.008*hs,.03*hs,.01],[(i-3)*.02*hs,-.075*hs,.115*hs],bk);cyl(head,.2*hs,.02,[0,.12*hs,0],bk);cyl(head,.11*hs,.1,[0,.17*hs,0],bk);
   for(let i=0;i<7;i++){const a=i/7*T*2;ball(head,.034*hs,[Math.cos(a)*.1*hs,.22*hs,Math.sin(a)*.1*hs],M(fl[i%4],0,.7))}}
  if(SPK==='sambista'){const wh=M('#fbfaf6',0,.85),rd=M('#e0252e',0,.6);cyl(head,.2*hs,.02,[0,.1*hs,0],wh);cyl(head,.115*hs,.11,[0,.16*hs,0],wh);cyl(head,.117*hs,.03,[0,.115*hs,0],M('#15171b',0,.7));
   bx(sp,[.045,.3*H,.012],[0,.3*H,.118*B+.004],rd);bx(sp,[.07,.05,.012],[-.1,.38*H,.118*B+.004],rd);bx(hips,[hw*2+.05,.04,.2*B+.05],[0,.02,0],M('#15171b',0,.7))}
  if(SPK==='dev'){const bk=M('#101418',0,.7),gl=M('#2fe08a',.2,.3);ball(head,.15*hs,[0,.02*hs,-.04*hs],M('#1d2733',0,.9),[1,1.05,.9]);mesh(head,new THREE.TorusGeometry(.125*hs,.014*hs,6,18,T),bk,[0,.09*hs,0],[0,0,0]);for(const sx of[-1,1])cyl(head,.05*hs,.04*hs,[sx*.125*hs,0,0],bk,[0,0,T/2]);
   bx(head,[.19*hs,.04*hs,.012],[0,.03*hs,.112*hs],gl);bx(sp,[.34*B,.26*H,.03],[0,.12*H,-.16*B],M('#2b3340',.3,.5));bx(sp,[.1,.04,.01],[0,.12*H,-.18*B],gl)}
  if(SPK==='marechal'){const nv=M('#17306b',0,.8),gd2=M('#f2c14e',.8,.3);mesh(head,new THREE.SphereGeometry(.5,14,8),nv,[0,.13*hs,0],[0,0,0],[.7*hs,.22*hs,.34*hs]);bx(head,[.34*hs,.02,.01],[0,.12*hs,.17*hs],gd2);mesh(head,new THREE.ConeGeometry(.02*hs,.12*hs,6),M('#0c8f3c',0,.7),[0,.3*hs,0]);
   for(const sd of[1,-1]){bx(sp,[.13,.025,.11],[sd*(sw+.02),.47*H,0],gd2);for(let i=0;i<4;i++)bx(sp,[.012,.05,.012],[sd*(sw+.02)+(i-1.5)*.03,.44*H,0],gd2)}
   bx(sp,[.06,.55*H,.012],[0,.28*H,.113*B+.006],M('#0c8f3c',0,.7),[0,0,.55]);bx(sp,[.025,.55*H,.014],[0,.28*H,.113*B+.008],M('#ffdf00',0,.7),[0,0,.55]);
   for(let i=0;i<3;i++)ball(sp,.02,[-.08+i*.05,.4*H,.115*B],gd2);bx(hips,[hw*2+.06,.04,.2*B+.07],[0,.02,0],M('#1a1208',0,.7))}
  if(SPK==='coelho'){const wh=M('#f6f6f2',0,.95),pk=M('#ff9fd0',0,.8);for(const sx of[-1,1]){mesh(head,new THREE.CapsuleGeometry(.04*hs,.22*hs,4,10),wh,[sx*.06*hs,.3*hs,-.01*hs],[0,0,sx*-.12]);mesh(head,new THREE.CapsuleGeometry(.022*hs,.17*hs,4,8),pk,[sx*.06*hs,.3*hs,.012*hs],[0,0,sx*-.12])}ball(head,.026*hs,[0,-.02*hs,.115*hs],pk);ball(hips,.07,[0,-.02,-.12*B-.02],wh);for(const sx of[-1,1])ball(head,.03*hs,[sx*.07*hs,-.05*hs,.1*hs],M('#ffb3d9',0,.8),[1,.8,.5])}
  if(SPK==='noel'){const rd=M('#c1121f',0,.85),wh=M('#f6f6f2',0,.95);mesh(head,new THREE.ConeGeometry(.115*hs,.28*hs,16),rd,[0,.2*hs,0],[0,0,.22]);cyl(head,.122*hs,.045,[0,.088*hs,0],wh);ball(head,.04*hs,[.07*hs,.335*hs,0],wh);bx(hips,[hw*2+.07,.06,.2*B+.07],[0,.05,0],M('#111',0,.7));bx(hips,[.07,.07,.012],[0,.05,.1*B+.04],M('#e8c76a',.6,.3));cyl(head,.12*hs,.05,[0,-.07*hs,0],M('#f6f6f2',0,.95));mesh(sp,new THREE.TorusGeometry(.085,.03,8,14),M('#f6f6f2',0,.95),[0,.53*H,0],[T/2,0,0])}
  if(SPK==='chef'){const wt=M('#f6f6f2',0,.9);
   cyl(head,.105*hs,.07,[0,.09*hs,0],wt);ball(head,.125*hs,[0,.2*hs,0],wt,[1,.8,1]);ov(wt,2.0,.34);
   for(const x of [-.045,.045])for(let i=0;i<3;i++)ball(sp,.009,[x,(.22+i*.07)*H,zf+.004],gold);
   bx(hips,[hw*2+.06,.5*H,.03],[0,-.22*H,.1*B+.02],M('#2f3640',0,.9));mesh(sp,new THREE.TorusGeometry(.07,.018,8,14),M('#b94138',0,.8),[0,.52*H,0],[T/2,0,0])}
  if(SPK==='samu'){capOn('#f4f4f1','#e0652a');vestOn('#c9531a','SAMU');
   bx(sp,[sw*2.1,.03,.2*B+.08],[0,.14*H,0],M('#e8e8e8',.4,.4));
   bx(sp,[.3*B,.3,.14],[0,.28*H,-.2*B],M('#e0652a',0,.8));bx(sp,[.1,.1,.012],[0,.3*H,-.2*B-.077],wh);bx(sp,[.08,.025,.014],[0,.3*H,-.2*B-.08],M('#c1121f',0,.7));bx(sp,[.025,.08,.014],[0,.3*H,-.2*B-.08],M('#c1121f',0,.7))}
  if(SPK==='onca'){const fy=M('#d99a2b',0,.85),fw=M('#f1e3bf',0,.9),dk2=M('#241208',0,.9),ge=gl('#7cff4f',2),tt=M('#f4f1ea',0,.4);
   const ch=ov(fy,2.0,.32);
   mesh(head,new THREE.SphereGeometry(1,24,16),fy,[0,.01,.02],[0,0,0],[RX*1.3,RY*1.2,RZ*1.3]);
   mesh(head,new THREE.SphereGeometry(1,16,12),fw,[0,-RY*.35,RZ*1.05],[0,0,0],[RX*.65,RY*.45,RZ*.55]);
   ball(head,.022*hs,[0,-RY*.2,RZ*1.5],dk2,[1.3,.8,1]);
   for(const sd of [1,-1]){ball(head,.045*hs,[sd*RX*.95,RY*.95,-.01],fy,[1,1,.5]);ball(head,.024*hs,[sd*RX*.95,RY*.95,.005],dk2,[1,1,.4]);
    ball(head,.017*hs,[sd*RX*.5,RY*.2,RZ*1.22],ge,[1.4,.6,.5]);mesh(head,new THREE.ConeGeometry(.007,.035,5),tt,[sd*.03*hs,-RY*.48,RZ*1.35],[T,0,0]);bx(sp,[.01,.2,.01],[sd*.1,.35*H,zf+.004],ge)}
   for(let i=0;i<16;i++){const a=i*2.4,y=(.04+((i*29)%46)/100)*H;mesh(sp,new THREE.TorusGeometry(.022,.007,6,10),dk2,[Math.sin(a)*sw*.97,y,Math.cos(a)*.12*B],[0,a,0])}
   tail(hips,9,.04,fy,dk2,-.05,-.12,.035);live(t=>{ge.emissiveIntensity=1.6+Math.sin(t*4)*.8;ch.scale.set(1+Math.sin(t*2)*.02,1,1+Math.sin(t*2)*.04)})}
  if(SPK==='lobo'){const fu=M('#4a4a52',0,1),fu2=M('#2c2c34',0,1),re=gl('#ff2a1a',2.2),tt=M('#f4f1ea',0,.4),bk=M('#0a0a0c',0,.8);
   const ch=ov(M('#6b5a4a',0,.95),2.0,.32);
   for(let i=0;i<26;i++){const a=i*2.4,y=(.02+((i*37)%44)/100)*H;ball(sp,.045,[Math.sin(a)*sw*1.0,y,Math.cos(a)*.13*B],fu2,[1,1.4,1])}
   mesh(head,new THREE.SphereGeometry(1,24,16),fu,[0,.01,0],[0,0,0],[RX*1.3,RY*1.22,RZ*1.28]);
   mesh(head,new THREE.CylinderGeometry(.035*hs,.07*hs,.2*hs,14),fu,[0,-RY*.22,RZ*1.2+.04],[T/2,0,0]);ball(head,.03*hs,[0,-RY*.12,RZ*1.2+.15*hs],bk);
   const jaw=bx(head,[.075*hs,.02*hs,.17*hs],[0,-RY*.52,RZ*1.15+.03],fu2);
   for(const sd of [1,-1]){for(let i=0;i<3;i++)mesh(head,new THREE.ConeGeometry(.007,.035,5),tt,[sd*(.022+i*.004)*hs,-RY*.4,RZ*1.12+.04+i*.04],[T,0,0]);
    mesh(head,new THREE.ConeGeometry(.04*hs,.14*hs,6),fu,[sd*RX*.75,RY*1.0+.03,-.02],[0,0,sd*-.25]);ball(head,.018*hs,[sd*RX*.5,RY*.2,RZ*1.16],re,[1.2,.7,.5])}
   const br=[];for(let i=0;i<5;i++)br.push(ball(head,.014,[0,0,0],gl('#cfd8e0',.8)));
   tail(hips,8,.05,fu,fu2,-.05,-.12,.03);
   const moon=ball(root,.2,[0,2.2,0],gl('#fff0c0',.9));
   live(t=>{moon.position.set(Math.cos(t*.7)*.9,2.2+Math.sin(t*1.4)*.1,Math.sin(t*.7)*.9);moon.scale.setScalar(1+Math.sin(t*2)*.04);
    jaw.rotation.x=.14+Math.sin(t*3)*.12;ch.scale.set(1+Math.sin(t*2.4)*.03,1,1+Math.sin(t*2.4)*.06);
    br.forEach((b,i)=>{const k=(t*.5+i*.2)%1;b.position.set(0,-RY*.3+k*.12,RZ*1.45+k*.14);b.scale.setScalar(.3+k*.9)})})}
  if(SPK==='tupa'){const bl=gl('#27b8ff',1.8),fe=['#2c8cff','#f4f1ea','#f1c40f','#e03a2a'],cl=M('#3a4250',0,1);cl.emissive.set('#000000');
   for(let i=0;i<9;i++)bx(sp,[.012,.05+(i%2)*.04,.012],[(i-4)*.035,.46*H+(i%2)*.012,zf+.01],bl);
   for(const sd of [1,-1]){const x=sd*RX*.4,y=RY*.08;ball(head,.016*hs,[x,y,fz(x,y)+.008],bl,[1,.7,.5]);bx(head,[.012,.05*hs,.01],[sd*RX*.6,-RY*.15,fz(sd*RX*.6,-RY*.15)+.005],bl)}
   const f=[];for(let row=0;row<2;row++)for(let i=0;i<19-row*5;i++){const a=(i/(18-row*5)-.5)*(row?2.0:3.2),r=(.21+row*.1)*hs;
    f.push(mesh(head,new THREE.SphereGeometry(1,8,6),M(fe[(i+row)%4],0,.7),[Math.sin(a)*(r+.09),Math.cos(a)*(r+.09),-RZ*(.45+row*.15)],[0,0,-a],[.022,.1+row*.05,.008]));f[f.length-1].userData.a=a}
   live(t=>f.forEach((m,i)=>m.rotation.z=-m.userData.a+Math.sin(t*2+i)*.05));
   const cd=new THREE.Group();cd.position.set(0,1.05*H,0);sp.add(cd);[[0,0,0,.2],[.18,-.03,.05,.15],[-.18,-.02,-.04,.16],[.05,.05,-.1,.15],[-.06,.04,.1,.13]].forEach(([x,y,z,r])=>ball(cd,r,[x,y,z],cl,[1.2,.8,1]));
   const bolts=[-.22,.25].map(x=>{const g=new THREE.Group();g.position.set(x,1.0*H,.05);sp.add(g);for(let i=0;i<7;i++)bx(g,[.015,.16,.015],[0,-i*.14,0],bl);return g});
   live(t=>{cd.rotation.y=t*.4;const on=Math.sin(t*5)>.75||Math.sin(t*7.3)>.92;cl.emissive.set(on?'#6ab8ff':'#000000');cl.emissiveIntensity=.9;
    bolts.forEach((g,j)=>{g.visible=on&&(j?Math.sin(t*5)>.5:true);if(g.visible)g.children.forEach(c=>{c.position.x=(Math.random()-.5)*.1;c.rotation.z=(Math.random()-.5)*1.2})})})}
  if(SPK==='bateria'){const au=M('#e8b53a',.9,.2),mg=M('#e0208a',.3,.4),cols=['#e8b53a','#ff3fa4','#12c9b8','#e8b53a','#ff3fa4'];
   ov(au,1.9,.2,.38,.04);for(const sd of [1,-1])ball(sp,.06,[sd*.065,.4*H,zf],au,[1,1,.7]);
   robe(mg,.12,.19,.14,-.01);bx(sp,[sw*1.8,.03,.2*B+.04],[0,0,0],au);
   for(let i=0;i<7;i++){const a=(i-3)*.32;mesh(head,new THREE.ConeGeometry(.016,.16*hs+(3-Math.abs(i-3))*.025,6),au,[Math.sin(a)*.12*hs,RY*.9+.03,0],[0,0,-a])}
   mesh(head,new THREE.TorusGeometry(RX*1.05,.012,6,24),au,[0,RY*.55,0],[T/2,0,0],[1,1.1,1]);
   const fan=new THREE.Group();fan.position.set(0,.34*H,-.2*B);sp.add(fan);const fs=[];
   for(let i=0;i<15;i++){const a=(i-7)*.17;fs.push(mesh(fan,new THREE.SphereGeometry(1,10,8),M(cols[i%5],.2,.5),[Math.sin(a)*.55,.15+Math.cos(a)*.55,0],[0,0,-a],[.07,.5,.012]))}
   orbit(sp,28,.55,0,1.2,'#ffe58a',.014);
   live(t=>{fs.forEach((f,i)=>f.rotation.z=-(i-7)*.17+Math.sin(t*2+i*.5)*.05);fan.scale.setScalar(1+Math.sin(t*1.5)*.025)})}
  if(SPK==='frevo'){const cols=['#e0302a','#f2d21b','#1e8e3c','#2a5db0'],bk=M('#14110d',0,.8);
   for(let i=0;i<4;i++)bx(sp,[sw*1.9,.02,.2*B+.06],[0,(.18+i*.08)*H,0],M(cols[i],0,.7));
   cyl(head,.1*hs,.08,[0,.1*hs,0],bk);cyl(head,.17*hs,.01,[0,.06*hs,0],bk);
   rib(head,[.08,.09*hs,-.05],.35,cols[0],0);rib(head,[-.08,.09*hs,-.05],.35,cols[2],1.3);rib(head,[0,.09*hs,-.09],.4,cols[3],2.6);
   orbit(sp,16,.7,.05,1.3,'#f2d21b',.02)}
  if(SPK==='uira'){const rf=M('#b3501c',0,.7),au2=M('#f1c40f',0,.6),tg=gl('#27e0c0',1.5),mt=[rf,au2,tg];
   ov(rf,2.0,.3);for(let i=0;i<12;i++)bx(sp,[.05,.012,.012],[((i%3)-1)*.07,(.05+Math.floor(i/3)*.07)*H+.18,zf+.006],au2);
   mesh(head,new THREE.SphereGeometry(1,24,16),rf,[0,.01,.02],[0,0,0],[RX*1.15,RY*1.1,RZ*1.15]);
   mesh(head,new THREE.ConeGeometry(.04*hs,.16*hs,8),M('#f08a1c',0,.5),[0,-RY*.15,RZ*1.15+.07],[T/2,0,0]);
   for(const sd of [1,-1])ball(head,.016*hs,[sd*RX*.5,RY*.2,RZ*1.02],gl('#27e0c0',2),[1,1,.5]);
   for(let i=0;i<7;i++)mesh(head,new THREE.ConeGeometry(.014,.14+.03*(3-Math.abs(i-3)),5),i%2?au2:tg,[0,RY*.9,(i-3)*.03-.02],[-(i-3)*.12-.3,0,0]);
   const wg=[];for(const sd of [1,-1]){const g=new THREE.Group();g.position.set(sd*.12,.42*H,-.14*B);sp.add(g);wg.push([g,sd]);
    for(let i=0;i<7;i++){const Lw=.9-i*.08,ang=.35-i*.12;mesh(g,new THREE.SphereGeometry(1,10,6),mt[i%3],[sd*(.04+Math.cos(ang)*Lw/2),Math.sin(ang)*Lw/2,0],[0,0,sd*ang],[Lw/2,.045,.01])}}
   rib(hips,[0,-.05,-.12],.9,'#12c9b8',0,.06);rib(hips,[.05,-.05,-.12],.75,'#f1c40f',1,.05);rib(hips,[-.05,-.05,-.12],.75,'#b3501c',2,.05);
   const nt=[];for(let i=0;i<8;i++)nt.push(bx(head,[.025,.025,.025],[0,0,0],gl('#ffe58a',2)));
   live(t=>{wg.forEach(([g,sd])=>g.rotation.z=sd*(.15+Math.sin(t*4)*.5));nt.forEach((n,i)=>{const k=(t*.3+i/8)%1;n.position.set(Math.sin(k*9+i)*.12,-RY*.1+k*.5,RZ*1.2+k*.25);n.scale.setScalar(Math.sin(k*3.14)*1.2+.01)})})}
  if(SPK==='caboclo'){const cols=['#e0302a','#f2d21b','#1e8e3c','#2a5db0','#ff3fa4','#f4f1ea'];
   for(let r=0;r<4;r++)mesh(sp,new THREE.CylinderGeometry(.46-r*.07,.5-r*.07,.035,40),M(cols[r*2%6],.3,.5),[0,.47*H+r*.03,0]);
   const sq=[];for(let i=0;i<22;i++){const a=i*T*2/22;sq.push(ball(sp,.016,[Math.cos(a)*.47,.47*H+.03,Math.sin(a)*.47],gl('#ffe58a',1.5)))}
   robe(M('#c1121f',0,.8),.15,.3,.45,-.2);
   cyl(head,.1*hs,.12,[0,.14*hs,0],M('#c1121f',0,.8));bx(head,[RX*1.8,.03*hs,.01],[0,RY*.1,fz(0,RY*.1)+.012],M('#0a0a0c',.5,.2));
   for(let i=0;i<12;i++){const a=i*.52;rib(head,[Math.sin(a)*.09*hs,.12*hs,Math.cos(a)*.09*hs],.4,cols[i%6],i*.6)}
   live(t=>sq.forEach((s,i)=>s.scale.setScalar(.6+Math.sin(t*5+i*1.3)*.5)))}
  if(SPK==='boiuna'){const gr=M('#1f6b3a',.3,.5),gd=M('#d9a441',.5,.4),cy=gl('#27e0c0',1.6),hdM=M('#0f3d24',.3,.5);
   rig.tL.visible=rig.tR.visible=false;
   const n=18,sg=[];for(let i=0;i<n;i++){const r=.15-.007*i,s2=mesh(hips,new THREE.SphereGeometry(r,14,10),i%2?gr:gd,[0,0,0],[0,0,0],[1,.9,1.5]);mesh(s2,new THREE.ConeGeometry(.02,.07,4),cy,[0,r*.9,0]);sg.push(s2)}
   const hood=mesh(head,new THREE.SphereGeometry(1,24,12),hdM,[0,-RY*.1,-RZ*.8],[0,0,0],[.28*hs,.3*hs,.015]);mesh(head,new THREE.SphereGeometry(1,16,10),cy,[0,-RY*.1,-RZ*.8+.012],[0,0,0],[.16*hs,.18*hs,.01]);
   for(const sd of [1,-1]){const x=sd*RX*.4,y=RY*.08;ball(head,.018*hs,[x,y,fz(x,y)+.01],cy,[1,.5,.5]);mesh(head,new THREE.ConeGeometry(.015,.14,5),gd,[sd*RX*.8,RY*.9,-.02],[-.5,0,sd*-.3])}
   for(let i=0;i<5;i++)bx(sp,[sw*1.9,.012,.2*B+.06],[0,(.1+i*.06)*H,0],gd);
   const tg=bx(head,[.008,.008,.12],[0,-RY*.5,RZ*1.1+.1],M('#e0302a',0,.6));
   live(t=>{sg.forEach((s,i)=>{const k=i/n;s.position.set(i>4?Math.sin(t*2-i*.55)*.3*k:0,-hipsY*Math.min(1,(i+1)/5)+(.15-.007*i)*.9,-Math.max(0,i-4)*.19)});
    hood.scale.set(.28*hs*(1+Math.sin(t*2)*.08),.3*hs*(1+Math.sin(t*2)*.05),.015);tg.scale.z=.3+Math.max(0,Math.sin(t*6))*.9;tg.position.z=RZ*1.0+.05+tg.scale.z*.06})}
  if(SPK==='curupira2'){const fl=gl('#ff7a1a',2.2),fl2=gl('#ffd23a',2.4),lf=M('#2f6b3a',0,.9),gn=M('#3f7a45',0,.9);
   ov(gn,2.0,.32);for(let i=0;i<6;i++)bx(sp,[sw*1.9,.014,.2*B+.06],[0,(.06+i*.05)*H,0],lf);
   for(const sd of [1,-1]){const x=sd*RX*.4,y=RY*.08;ball(head,.02*hs,[x,y,fz(x,y)+.008],fl2,[1,.7,.5]);mesh(head,new THREE.ConeGeometry(.03*hs,.12*hs,6),gn,[sd*RX*.95,RY*.15,0],[0,0,sd*-1.2])}
   flameG(head,16,RX,RZ,RY*1.0,.34,fl,fl2,1.1);embersG(head,14,.18,RY,.7,'#ffb040',.5);flameG(sp,5,.18,.1,.62*H,.22,fl,fl2,.7,.0);
   live(t=>{fl.emissiveIntensity=1.8+Math.sin(t*10)*.5})}
  if(SPK==='anhanga'){const bn=M('#efe6d3',0,.6),dk3=M('#0a0a0c',0,.9),gf=gl('#7cffd0',2.0),gf2=gl('#bfffe8',2.2),cl=M('#16241f',0,1);
   robe(cl,.15,.3,.82,-.36);ov(cl,2.05,.36);for(let i=0;i<5;i++)bx(sp,[.15-.012*i,.012,.012],[0,(.36-i*.05)*H,zf+.01],bn);bx(sp,[.012,.26*H,.012],[0,.3*H,zf+.01],bn);
   mesh(head,new THREE.SphereGeometry(1,24,16),bn,[0,.01,.02],[0,0,0],[RX*1.2,RY*1.2,RZ*1.25]);
   bx(head,[.07*hs,.06*hs,.22*hs],[0,-RY*.3,RZ*1.15+.05],bn);bx(head,[.06*hs,.02*hs,.2*hs],[0,-RY*.55,RZ*1.15+.04],bn);
   for(const sd of [1,-1]){const x=sd*RX*.55;ball(head,.032*hs,[x,RY*.25,RZ*1.1],dk3,[1,1.1,.6]);ball(head,.016*hs,[x,RY*.25,RZ*1.1+.008],gf,[1,1,.5]);
    const g=new THREE.Group();g.position.set(sd*RX*.5,RY*.85,-.02);head.add(g);const sg=(l,x,y,r)=>cyl(g,.012,l,[sd*x,y,0],bn,[0,0,-sd*r]);
    sg(.28,.07,.12,.5);sg(.15,.152,.184,1.1);sg(.14,.179,.234,1.2);sg(.12,.146,.307,.1);flameG(g,4,.015,.015,.36,.2,gf,gf2,.8,sd*.15)}
   orbit(sp,18,.6,0,1.4,'#7cffd0',.02);embersG(head,12,.2,RY,.6,'#bfffe8',.5);live(t=>{gf.emissiveIntensity=1.6+Math.sin(t*3)*.7})}
  if(SPK==='paje'){const lf=M('#2f8a3a',0,.8),lf2=M('#4fb04a',0,.8);
   ov(M('#6b4a2a',0,.9),1.95,.3);const lv=[];
   for(let r=0;r<4;r++)for(let k=0;k<10;k++){const a=k*T*2/10+r*.3,m=mesh(sp,new THREE.SphereGeometry(1,8,6),(k+r)%2?lf:lf2,[Math.sin(a)*(.2+r*.03),(.5-r*.1)*H,Math.cos(a)*(.14+r*.03)],[.4,a,0],[.05,.012,.11]);m.userData.k=k+r;lv.push(m)}
   for(let i=0;i<13;i++){const a=(i/12-.5)*2.6;mesh(head,new THREE.SphereGeometry(1,8,6),M(COL4[i%4],0,.7),[Math.sin(a)*.27*hs,Math.cos(a)*.27*hs,-RZ*.4],[0,0,-a],[.02,.09,.008])}
   for(const sd of [1,-1])bx(head,[.012,.05*hs,.01],[sd*RX*.6,-RY*.15,fz(sd*RX*.6,-RY*.15)+.005],gl('#7cffd0',1.8));
   const sp1=new THREE.Group();sp.add(sp1);const bird=new THREE.Group();sp1.add(bird);ball(bird,.04,[0,0,0],gl('#7cffd0',1.5),[1,1,2]);
   const wb=[1,-1].map(sd=>{const w=new THREE.Group();bird.add(w);mesh(w,new THREE.SphereGeometry(1,8,6),gl('#bfffe8',1.2),[sd*.07,0,0],[0,0,0],[.07,.01,.04]);return [w,sd]});
   const ser=[];for(let i=0;i<14;i++)ser.push(ball(sp1,.022-.001*i,[0,0,0],gl('#ffd23a',1.6)));
   live(t=>{lv.forEach(m=>m.rotation.x=.4+Math.sin(t*2+m.userData.k)*.15);bird.position.set(Math.cos(t*1.2)*.7,.95*H+Math.sin(t*2)*.08,Math.sin(t*1.2)*.7);bird.rotation.y=-t*1.2;
    wb.forEach(([w,sd])=>w.rotation.z=sd*Math.sin(t*14)*.7);ser.forEach((s,i)=>{const a=-t*.9+T-i*.12;s.position.set(Math.cos(a)*.62,.4*H+Math.sin(t*3-i*.5)*.06+i*.01,Math.sin(a)*.62)})})}
  if(SPK==='vaqueiro'){const lt=M('#6b4a2a',.05,.8),lt2=M('#4a2e1a',.05,.8),gd=M('#d9a441',.9,.25);
   ov(lt,2.0,.34);for(let i=0;i<6;i++)ball(sp,.014,[((i%3)-1)*.08,(.4-Math.floor(i/3)*.1)*H,zf+.01],gd);
   for(const sd of [1,-1])for(let i=0;i<4;i++)rib(sp,[sd*(sw+.01),.44*H,(i-1.5)*.04],.22,'#6b4a2a',i+sd,.018);
   cyl(head,.115*hs,.1,[0,.1*hs,0],lt2);mesh(head,new THREE.SphereGeometry(1,20,10),lt2,[0,.06*hs,0],[0,0,0],[.22*hs,.02,.2*hs]);bx(head,[.05*hs,.05*hs,.012],[0,.13*hs,.115*hs],gd,[0,0,.785]);
   bx(sp,[sw*1.8,.06,.2*B+.04],[0,0,0],lt2);bx(sp,[.06,.05,.012],[0,0,.105*B+.02],gd)}
  if(SPK==='gigante'){const cols=['#e0302a','#f2d21b','#1e8e3c','#2a5db0','#ff3fa4'],bkk=M('#14110d',0,.8);rig.tL.visible=rig.tR.visible=false;
   for(let i=0;i<5;i++)mesh(hips,new THREE.CylinderGeometry((.2+.075*i)*B,(.2+.075*(i+1))*B,.18*H,28),M(cols[i],0,.8),[0,(-.05-i*.18)*H,0]);
   ov(M(cols[1],0,.8),2.0,.34);mesh(head,new THREE.SphereGeometry(1,28,20),M('#f2c9a0',0,.7),[0,.02,0],[0,0,0],[RX*2.4,RY*2.2,RZ*2.2]);
   for(const sd of [1,-1]){ball(head,.06*hs,[sd*RX*.9,RY*.3,RZ*2.02],M('#ffffff',0,.3),[1,1.1,.5]);ball(head,.03*hs,[sd*RX*.9,RY*.3,RZ*2.02+.03],bkk,[1,1,.5]);
    ball(head,.05*hs,[sd*RX*1.5,-RY*.35,RZ*1.72],M('#ff7a8a',0,.7),[1,1,.4]);ball(head,.05*hs,[sd*RX*.35,-RY*.62,RZ*2.08],bkk,[1.6,.6,.6]);ball(head,.07*hs,[sd*RX*2.3,0,0],M('#f2c9a0',0,.7),[.5,1,.7])}
   mesh(head,new THREE.TorusGeometry(.1*hs,.014,6,16,T),M('#a01a1a',0,.6),[0,-RY*.52,RZ*2.14],[0,0,T]);ball(head,.05*hs,[0,-RY*.1,RZ*2.15],M('#e0605a',0,.6),[1,1,.9]);
   for(let i=0;i<3;i++)cyl(head,.17*hs,.09*hs,[0,(.3+i*.09)*hs,0],M(cols[i*2%5],0,.7));cyl(head,.3*hs,.012,[0,.255*hs,0],M(cols[0],0,.7));const pom=ball(head,.05*hs,[0,.62*hs,0],M('#ffffff',0,.9));
   orbit(sp,24,.9,0,1.4,'#f2d21b',.02);
   live(t=>{rig.aR.rotation.set(0,0,-1.9+Math.sin(t*3)*.3);rig.aL.rotation.set(0,0,1.9-Math.sin(t*3+1)*.3);rig.fL.rotation.set(0,0,0);rig.fR.rotation.set(0,0,0);
    rig.head.rotation.z=Math.sin(t*1.6)*.09;rig.head.rotation.y=Math.sin(t*.8)*.3;rig.spine.rotation.z=Math.sin(t*1.6)*.03;pom.position.y=.62*hs+Math.abs(Math.sin(t*3))*.05})}
  if(SPK==='vitoria'){const lp=M('#1f8f5a',0,.7),lp2=M('#2fb070',0,.7),pk=M('#ff8fc0',0,.6),wh=M('#fff2f8',0,.6);
   const pad=new THREE.Group();pad.position.set(0,.35*H,-.24*B);sp.add(pad);mesh(pad,new THREE.CylinderGeometry(.55,.55,.02,36),lp,[0,0,0],[T/2,0,0]);mesh(pad,new THREE.TorusGeometry(.55,.03,6,36),lp2,[0,0,0]);
   for(let i=0;i<12;i++){const a=i*T/6;bx(pad,[.5,.008,.024],[Math.cos(a)*.25,Math.sin(a)*.25,.012],M('#17704a',0,.8),[0,0,a])}
   robe(lp,.15,.3,.4,-.2);mesh(hips,new THREE.TorusGeometry(.3*B,.025,6,30),lp2,[0,-.4*H,0],[T/2,0,0]);ov(M('#2f8a5a',0,.8),1.95,.3);
   const pt=[];for(let k=0;k<2;k++)for(let i=0;i<12;i++){const p=mesh(head,new THREE.SphereGeometry(1,8,6),(i+k)%2?pk:wh,[0,0,-RZ*.55],[0,0,0],[.035,.12+k*.04,.008]);p.userData={a:i/12*T*2,k};pt.push(p)}
   ball(head,.03,[0,0,-RZ*.5],gl('#ffe58a',2));
   const rings=[0,1,2].map(i=>mesh(root,new THREE.TorusGeometry(1,.012,6,48),new THREE.MeshBasicMaterial({color:'#8fe0ff',transparent:true,opacity:.5,depthWrite:false}),[0,.05,0],[T/2,0,0]));
   orbit(sp,20,.5,0,1.3,'#8fe0ff',.012);
   live(t=>{rings.forEach((r,i)=>{const k=(t*.4+i/3)%1;r.scale.setScalar(.35+k*1.1);r.material.opacity=(1-k)*.55});
    pt.forEach(p=>{const {a,k}=p.userData,r=((.2+k*.1)*hs+.08)*(1+Math.sin(t*1.5+k)*.12);p.position.set(Math.sin(a)*r,Math.cos(a)*r,-RZ*.55);p.rotation.z=-a});pad.rotation.z=Math.sin(t*1.2)*.04;pad.rotation.x=Math.sin(t*.9)*.03})}
  if(SPK==='bicho'){const bk=M('#08080c',0,1),pu=M('#14101e',.1,.8),ey=gl('#ff2a3a',2.2),ey2=gl('#ffd23a',2.2),tt=M('#f4f1ea',0,.4),sk=M('#6b5a3a',0,1);
   ov(bk,2.0,.36);robe(bk,.15,.3,.7,-.3);mesh(head,new THREE.SphereGeometry(1,24,16),pu,[0,.01,0],[0,0,0],[RX*1.4,RY*1.3,RZ*1.35]);
   const ez=(x,y)=>RZ*1.35*Math.sqrt(Math.max(.03,1-(x/(RX*1.4))**2-(y/(RY*1.3))**2));
   const eyes=[[-.5,.5],[.5,.5],[0,.8],[-.95,.1],[.95,.1],[-.3,.12],[.3,.12]].map(([x,y],i)=>ball(head,(i<3?.02:.016)*hs,[x*RX,y*RY,ez(x*RX,y*RY)+.004],i%2?ey:ey2,[1,1,.5]));
   ball(head,.07*hs,[0,-RY*.55,ez(0,-RY*.55)],M('#2a0008',0,.9),[1.6,.5,.4]);
   for(let i=0;i<9;i++){mesh(head,new THREE.ConeGeometry(.008,.03,5),tt,[(i-4)*.017*hs,-RY*.5,ez(0,-RY*.5)+.012],[T,0,0]);mesh(head,new THREE.ConeGeometry(.008,.03,5),tt,[(i-4)*.017*hs,-RY*.62,ez(0,-RY*.62)+.012],[0,0,0])}
   for(let i=0;i<8;i++)rib(sp,[(i-3.5)*.07,.45*H,-.16*B],1.0,'#0e0c16',i*.9,.05);
   const sack=ball(sp,.2,[0,.25*H,-.27*B],sk,[1,1.3,.8]);for(const x of [-.05,.05])ball(sp,.012,[x,.3*H,-.27*B-.16],ey2);
   embersG(sp,16,.3,0,1.6,'#6a5a9a',.3);
   live(t=>{eyes.forEach((e,i)=>e.scale.y=Math.sin(t*.9+i*2.7)>.9?.05:1);sack.scale.set(1+Math.sin(t*7)*.03,1.3+Math.sin(t*5)*.05,.8)})}
  if(SPK==='pirarucu'){const sc=M('#7a2f1e',.3,.5),sc2=M('#c9532a',.3,.4),fh=M('#5a6a5a',.3,.5),fh2=M('#8a2a1a',.3,.4),wt=M('#f4f1ea',0,.3),dk3=M('#0a0a0c',0,.8);
   ov(sc,1.95,.3);for(let r=0;r<5;r++)for(let k=0;k<7;k++){const a=(k-3)*.36+(r%2)*.18;ball(sp,.045,[Math.sin(a)*sw*.97,(.08+r*.075)*H,Math.cos(a)*.115*B],r%2?sc:sc2,[1,.8,.45])}
   mesh(head,new THREE.SphereGeometry(1,24,16),fh,[0,.01,.04],[0,0,0],[RX*1.2,RY*1.1,RZ*1.5]);
   const jaw=bx(head,[.09*hs,.03*hs,.2*hs],[0,-RY*.5,RZ*1.25],fh2);bx(head,[.1*hs,.035*hs,.2*hs],[0,-RY*.28,RZ*1.3],fh2);
   for(const sd of [1,-1]){ball(head,.028*hs,[sd*RX*1.0,RY*.3,RZ*.78],wt,[1,1,.6]);ball(head,.014*hs,[sd*(RX*1.0+.012),RY*.3,RZ*.78],dk3)}
   const gg=[1,-1].map(sd=>[mesh(head,new THREE.SphereGeometry(1,10,8),sc2,[sd*RX*1.08,-RY*.05,-RZ*.1],[0,0,0],[.01,.09*hs,.07*hs]),sd]);
   for(let i=0;i<7;i++)mesh(sp,new THREE.ConeGeometry(.03,.14+.02*(i%3),4),fh2,[0,(.5-i*.06)*H,-.15*B-.03],[-.3,0,0]);mesh(head,new THREE.ConeGeometry(.03*hs,.14*hs,4),fh2,[0,RY*1.1,0],[-.3,0,0]);
   const tf=new THREE.Group();tf.position.set(0,-.1,-.15*B);hips.add(tf);for(let i=0;i<5;i++){const a=(i-2)*.35;mesh(tf,new THREE.SphereGeometry(1,10,8),i%2?sc2:sc,[0,.2*Math.sin(a)-.1,-.2*Math.cos(a)],[a,0,0],[.012,.05,.2])}
   embersG(head,12,.12,-RY*.2,.6,'#bfeaff',.5);
   live(t=>{jaw.rotation.x=.05+Math.max(0,Math.sin(t*2))*.2;gg.forEach(([g,sd])=>g.rotation.y=sd*Math.sin(t*5)*.4);tf.rotation.y=Math.sin(t*3)*.4})}
  if(SPK==='maeouro'){const go=gl('#ffcf3a',1.6),go2=gl('#fff0a0',2.2),fl=gl('#ff9a1a',2.2),gm=M('#e8b53a',1,.2);
   flameG(head,18,RX,RZ,RY*1,.4,fl,go2,1.2);const hl=mesh(head,new THREE.TorusGeometry(.2*hs,.01,6,32),go,[0,RY*1.6,0],[T/2,0,0]);
   for(const sd of [1,-1]){const x=sd*RX*.4,y=RY*.08;ball(head,.02*hs,[x,y,fz(x,y)+.008],go2,[1,.7,.5])}
   ball(sp,.05,[0,.38*H,zf],go2,[1,1,.5]);
   const au=mesh(root,new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:'#ffcf3a',transparent:true,opacity:.14,depthWrite:false}),[0,1.3,0],[0,0,0],[.5,1.05,.5]);
   const gr=mesh(root,new THREE.CircleGeometry(.8,32),new THREE.MeshBasicMaterial({color:'#ffcf3a',transparent:true,opacity:.35,depthWrite:false}),[0,.05,0],[-T/2,0,0]);
   const cn=[];for(let i=0;i<10;i++)cn.push(cyl(root,.06,.012,[0,0,0],gm));embersG(root,24,.5,.2,2,'#ffcf3a',.4);
   live(t=>{rig.hips.position.y+=.28+Math.sin(t*2)*.05;hl.rotation.z=t;au.scale.set(.5+Math.sin(t*2)*.03,1.05,.5+Math.sin(t*2)*.03);gr.material.opacity=.3+Math.sin(t*2)*.1;
    cn.forEach((c,i)=>{const a=t*1.5+i*.63;c.position.set(Math.cos(a)*(.7+Math.sin(t+i)*.1),.9+Math.sin(t*2+i)*.5,Math.sin(a)*(.7+Math.sin(t+i)*.1));c.rotation.set(t*3+i,t*2,0)})})}
  if(SPK==='matinta'){const fe=M('#5a4636',0,.95),fe2=M('#a88a64',0,.95),ey=gl('#ffd23a',2.2),bk=M('#2a1a10',0,.8),cl=M('#2e2a38',0,1);
   robe(cl,.15,.3,.8,-.36);ov(cl,2.05,.36);for(let r=0;r<3;r++)for(let k=0;k<5;k++)ball(sp,.03,[(k-2)*.06+(r%2)*.03,(.4-r*.07)*H,zf+.01],fe2,[1,1.2,.4]);
   mesh(head,new THREE.SphereGeometry(1,24,16),fe,[0,.01,.02],[0,0,0],[RX*1.25,RY*1.2,RZ*1.25]);
   for(const sd of [1,-1]){mesh(head,new THREE.SphereGeometry(1,16,12),fe2,[sd*RX*.5,RY*.15,RZ*1.0],[0,0,0],[RX*.55,RY*.55,RZ*.2]);ball(head,.03*hs,[sd*RX*.5,RY*.15,RZ*1.12],ey,[1,1,.5]);ball(head,.012*hs,[sd*RX*.5,RY*.15,RZ*1.12+.02],bk);
    mesh(head,new THREE.ConeGeometry(.03*hs,.12*hs,5),fe,[sd*RX*.7,RY*1.15,0],[0,0,sd*-.3])}
   mesh(head,new THREE.ConeGeometry(.02*hs,.06*hs,5),bk,[0,-RY*.15,RZ*1.2],[T/2+.4,0,0]);
   wingsG([fe,fe2,fe],.42,.35,2.2);embersG(sp,14,.5,0,1.5,'#a88a64',.25);
   live(t=>{ey.emissiveIntensity=1.6+Math.sin(t*3)*.8;rig.head.rotation.y+=Math.sin(t*.8)*.6})}
  if(SPK==='carranca'){const wd3=M('#6b3f22',0,.9),wd2=M('#8a5530',0,.9),rd=M('#c1121f',0,.7),gd=M('#d9a441',.9,.25),wt=M('#f4f1ea',0,.4),ey=gl('#ffd23a',1.6);
   ov(M('#3a2a1c',0,.9),2.0,.32);mesh(sp,new THREE.TorusGeometry(.2,.012,6,24),gd,[0,.34*H,.02],[T/2,0,0],[1.1,.7,1]);
   mesh(head,new THREE.SphereGeometry(1,24,16),wd3,[0,.01,.02],[0,0,0],[RX*1.4,RY*1.35,RZ*1.4]);bx(head,[RX*2.2,.04*hs,.05*hs],[0,RY*.4,RZ*1.1],wd2);
   ball(head,.05*hs,[0,-RY*.2,RZ*1.35],wd2,[1.4,1,1]);bx(head,[RX*1.6,.05*hs,.04*hs],[0,-RY*.6,RZ*1.2],rd);
   for(const sd of [1,-1]){ball(head,.04*hs,[sd*RX*.6,RY*.15,RZ*1.15],wt);ball(head,.022*hs,[sd*RX*.6,RY*.15,RZ*1.15+.025],ey);ball(head,.01*hs,[sd*.03*hs,-RY*.22,RZ*1.35+.04],M('#0a0a0c'));
    mesh(head,new THREE.ConeGeometry(.012,.07,5),gd,[sd*.05*hs,-RY*.7,RZ*1.2],[T,0,0])}
   for(let i=0;i<7;i++)mesh(head,new THREE.ConeGeometry(.008,.03,5),wt,[(i-3)*.02*hs,-RY*.57,RZ*1.22],[T,0,0]);
   const rr=[];for(let i=0;i<16;i++){const a=i*T*2/16;rr.push(mesh(head,new THREE.ConeGeometry(.035,.14,6),i%2?wd2:gd,[Math.sin(a)*RX*1.6,Math.cos(a)*RY*1.6,-.02],[0,0,-a]))}
   embersG(head,6,.03,-RY*.7,-.5,'#8fe0ff',.6);embersG(head,6,.03,-RY*.2,.3,'#cfd8e0',.5);
   live(t=>{ey.emissiveIntensity=1.2+Math.sin(t*9)*.5+Math.sin(t*3)*.4;rr.forEach((m,i)=>m.scale.y=1+Math.sin(t*4+i)*.2)})}
  if(SPK==='guara'){const fo=M('#d9691f',0,.9),bk=M('#14100c',0,.9),wh=M('#f4f1ea',0,.8),ge=gl('#ffcf3a',1.8);
   ov(fo,2.0,.32);for(let i=0;i<8;i++)bx(sp,[.05,.06,.04],[0,(.55-i*.06)*H,-.15*B],bk);
   mesh(head,new THREE.SphereGeometry(1,24,16),fo,[0,.01,.0],[0,0,0],[RX*1.2,RY*1.15,RZ*1.25]);mesh(head,new THREE.CylinderGeometry(.03*hs,.06*hs,.2*hs,12),fo,[0,-RY*.25,RZ*1.2+.05],[T/2,0,0]);
   ball(head,.022*hs,[0,-RY*.2,RZ*1.2+.15*hs],bk);ball(head,.05*hs,[0,-RY*.75,RZ*.9],wh,[1.2,.8,1]);
   const ears=[];for(const sd of [1,-1]){ball(head,.016*hs,[sd*RX*.5,RY*.2,RZ*1.08],ge,[1.2,.7,.5]);
    const e=mesh(head,new THREE.ConeGeometry(.06*hs,.28*hs,6),fo,[sd*RX*.8,RY*1.3,-.01],[0,0,sd*-.25]);mesh(e,new THREE.ConeGeometry(.035*hs,.2*hs,6),bk,[0,-.01,.02]);ears.push([e,sd])}
   tail(hips,9,.05,fo,wh,-.05,-.12,.03);
   live(t=>{ears.forEach(([e,sd],i)=>e.rotation.z=sd*-.25+Math.sin(t*5+i*2)*.12*(Math.sin(t*.7)>.6?1:.2));ge.emissiveIntensity=1.5+Math.sin(t*3)*.5})}
  if(SPK==='sanfa'){const hat=M('#4a2e1a',.05,.8),gd=M('#d9a441',.9,.25);
   cyl(head,.115*hs,.1,[0,.1*hs,0],hat);mesh(head,new THREE.SphereGeometry(1,20,10),hat,[0,.06*hs,0],[0,0,0],[.22*hs,.02,.2*hs]);bx(head,[.05*hs,.05*hs,.012],[0,.13*hs,.115*hs],gd,[0,0,.785]);
   ov(M('#4a5a72',0,.9),1.95,.24,.2,.07);
   const ac=new THREE.Group();ac.position.set(0,.28*H,zf+.12);sp.add(ac);const rd=M('#c1121f',.2,.5),bkb=M('#1a1a1e',0,.8),wt=M('#f4f1ea',0,.4);
   const L1=bx(ac,[.05,.28,.2],[0,0,0],rd),R1=bx(ac,[.05,.28,.2],[0,0,0],rd);for(let i=0;i<5;i++)bx(R1,[.012,.03,.02],[.03,(i-2)*.05,.05],wt);
   const bel=[];for(let i=0;i<9;i++)bel.push(bx(ac,[.024,.25-(i%2)*.04,.17-(i%2)*.03],[0,0,0],i%2?bkb:wt));
   embersG(sp,14,.2,.35*H,1.2,'#ffe58a',.5);
   live(t=>{const w=.22+.08*Math.sin(t*3);L1.position.x=-w;R1.position.x=w;bel.forEach((b,i)=>b.position.x=-w+(i+1)*2*w/10);
    rig.aL.rotation.set(-1.0,0,-.15);rig.aR.rotation.set(-1.0,0,.15);rig.fL.rotation.set(-.8,0,0);rig.fR.rotation.set(-.8,0,0);rig.sR.rotation.x=Math.max(0,Math.sin(t*6))*.5;rig.spine.rotation.z=Math.sin(t*3)*.05})}
  if(SPK==='jang'){const st=M('#d9bf72',0,.95),pole=M('#5a3a22',0,.8);
   cyl(head,.11*hs,.08,[0,.095*hs,0],st);mesh(head,new THREE.CylinderGeometry(.22*hs,.22*hs,.008,28),st,[0,.06*hs,0],[0,0,0],[1,1,1.08]);cyl(head,.112*hs,.02,[0,.09*hs,0],M('#1e8e3c',0,.8));
   cyl(sp,.015,1.6,[0,.3*H+.1,-.22*B-.01],pole);cyl(sp,.012,.7,[0,.3*H+.85,-.22*B-.01],pole,[0,0,T/2]);
   const sg=new THREE.Group();sg.position.set(0,.3*H+.28,-.22*B);sp.add(sg);const cs=['#f4f1ea','#2a5db0','#f4f1ea'],pn=[];
   for(let i=0;i<3;i++){const m=M(cs[i],0,.9);m.side=THREE.DoubleSide;pn.push(mesh(sg,new THREE.PlaneGeometry(.2,1.1),m,[(i-1)*.22,0,0]))}
   const rg=[0,1,2].map(i=>mesh(root,new THREE.TorusGeometry(1,.012,6,48),new THREE.MeshBasicMaterial({color:'#8fe0ff',transparent:true,opacity:.5,depthWrite:false}),[0,.05,0],[T/2,0,0]));
   embersG(root,20,.6,.1,1.2,'#bfeaff',.5);
   const fs=[0,1,2].map(()=>{const f=new THREE.Group();root.add(f);ball(f,.05,[0,0,0],M('#cfd8e0',.7,.3),[1.6,.6,.4]);mesh(f,new THREE.ConeGeometry(.04,.08,4),M('#cfd8e0',.7,.3),[-.09,0,0],[0,0,T/2]);return f});
   live(t=>{pn.forEach((p,i)=>p.rotation.y=Math.sin(t*2+i*.9)*.3);sg.rotation.y=Math.sin(t*1.5)*.12;rg.forEach((r,i)=>{const k=(t*.4+i/3)%1;r.scale.setScalar(.35+k*1.1);r.material.opacity=(1-k)*.55});
    fs.forEach((f,i)=>{const a=t*1.1+i*2.1;f.position.set(Math.cos(a)*.85,.25+Math.abs(Math.sin(a*2))*.6,Math.sin(a)*.85);f.rotation.set(0,-a,Math.cos(a*2)*.8)})})}
  if(SPK==='manda'){const gr=M('#3f8a4a',0,.8),gd=M('#2b6a38',0,.85),sp2=M('#f1e8c0',0,.6),flm=gl('#fff6ec',.6),fc=gl('#ffd23a',1.4);
   for(let i=0;i<10;i++){const a=i*T*2/10;bx(sp,[.02,.34*H,.02],[Math.sin(a)*sw*1.0,.3*H,Math.cos(a)*.125*B],gd)}
   for(let i=0;i<40;i++){const a=i*2.4,y=(.05+((i*29)%50)/100)*H;mesh(sp,new THREE.ConeGeometry(.006,.05,4),sp2,[Math.sin(a)*sw*1.02,y,Math.cos(a)*.13*B],[Math.cos(a)*T/2,0,-Math.sin(a)*T/2])}
   mesh(head,new THREE.SphereGeometry(1,24,16),gr,[0,.01,0],[0,0,0],[RX*1.2,RY*1.25,RZ*1.2]);
   for(const sd of [1,-1]){const x=sd*RX*.4,y=RY*.08;ball(head,.016*hs,[x,y,fz(x,y)+.008],fc,[1,.7,.5]);cyl(sp,.04,.35,[sd*(sw+.12),.55*H,0],gr);cyl(sp,.03,.12,[sd*(sw+.06),.5*H,0],gr,[0,0,T/2])}
   const fl=[],mk=(par,pos)=>{const g=new THREE.Group();g.position.set(...pos);par.add(g);ball(g,.02,[0,0,0],fc);const ps=[];for(let i=0;i<8;i++){const pv=new THREE.Group();pv.rotation.y=i*T/4;g.add(pv);const pt=new THREE.Group();pv.add(pt);mesh(pt,new THREE.SphereGeometry(1,8,6),flm,[0,0,.05],[0,0,0],[.012,.015,.06]);ps.push(pt)}fl.push(ps)};
   mk(head,[0,RY*1.2,0]);for(const sd of [1,-1])mk(sp,[sd*(sw+.12),.55*H+.2,0]);
   bird(root,'#27e0c0','#ff3fa4',.6,1.2,.9);
   live(t=>{fl.forEach((ps,j)=>{const o=-1.4+(Math.sin(t*1.2+j)*.5+.5)*1.2;ps.forEach(p=>p.rotation.x=o)});rig.spine.rotation.z=Math.sin(t*1.1)*.03})}
  if(SPK==='garantido'){bull('#f4f1ea','#e8ddd0','#e9d9a6',heartS,gl('#ff1a2e',1.3));manto('#c1121f','#d9a441')}
  if(SPK==='caprichoso'){bull('#15161a','#0c0d10','#d5dbe3',star,gl('#3a8bff',2));manto('#1e40af','#d9a441')}
  if(SPK==='boitata'){const fl=gl('#ff7a1a',2.2),fl2=gl('#ffd23a',2.4),ch=M('#1a0a06',.2,.9);
   ov(ch,1.95,.32);for(let i=0;i<8;i++)bx(sp,[.012,.28*H,.012],[(i-3.5)*.04,.3*H,zf+.003],fl);
   for(let i=0;i<10;i++)mesh(sp,new THREE.TorusGeometry(.19*B,.028-.0012*i,8,26),i%3?fl:fl2,[0,(.02+i*.052)*H,0],[T/2+.3,0,0],[1.05,.7,1]);
   for(let i=0;i<9;i++){const a=i*.7;mesh(head,new THREE.ConeGeometry(.03,.15+.05*(i%3),8),i%2?fl:fl2,[Math.cos(a)*RX*.7,RY*.95+.02,Math.sin(a)*RZ*.7],[Math.sin(a)*.4,0,-Math.cos(a)*.4])}
   for(const sd of [1,-1]){const x=sd*RX*.4,y=RY*.08;ball(head,.024*hs,[x,y,fz(x,y)+.01],fl2,[1,.7,.5])}
   mesh(sp,new THREE.SphereGeometry(.05,14,10),ch,[sw+.02,.56*H,.05],[0,0,0],[1,.8,1.5]);ball(sp,.012,[sw+.04,.58*H,.11],fl)}
  if(SPK==='iara'){const tl=M('#0f9d8a',.45,.3),tl2=M('#27e0c0',.3,.4),hr=M('#1f8f5a',0,.5),pr=M('#f4f1ea',.3,.2),co=M('#ff6a5a',0,.6);
   rig.tL.visible=rig.tR.visible=false;robe(tl,.16,.07,.9,-.44);
   for(let r=0;r<5;r++)for(let k=0;k<8;k++){const a=k*T/4+r*.4,y=-.08-r*.15,rad=(.16-.09*(-y)/.9)*B+.012;ball(hips,.026,[Math.sin(a)*rad,y*H,Math.cos(a)*rad],tl2,[1,.7,.4])}
   for(const sd of [1,-1])mesh(hips,new THREE.SphereGeometry(1,14,10),tl2,[sd*.09,-.9*H,0],[0,0,sd*.6],[.015,.14,.1]);
   part(hr,1.1,0,T*.52,-.6);mesh(head,new THREE.SphereGeometry(1,20,14),hr,[0,-.2*hs,-RZ*.5],[0,0,0],[RX*1.25,.36*hs,RZ*.75]);
   for(let i=0;i<5;i++)mesh(head,new THREE.ConeGeometry(.014,.09,6),co,[(i-2)*.03*hs,RY*.98+.02,0],[0,0,(i-2)*-.25]);
   for(let i=0;i<9;i++){const a=i*.7;ball(sp,.012,[Math.sin(a)*.06,.5*H,Math.cos(a)*.06+.01],pr)}
   for(const sd of [1,-1])ball(sp,.05,[sd*.065,.38*H,zf],M('#ff9ec0',.2,.4),[1,1,.6])}
  if(SPK==='boto'){const wh=M('#f6f3ea',0,.85),pk=M('#f08ab4',.1,.5),pk2=M('#d8639a',.1,.5);
   ov(wh,2.0,.34);bx(sp,[.034,.22*H,.012],[0,.36*H,zf+.004],pk2);
   cyl(head,.108*hs,.09,[0,.1*hs,0],wh);mesh(head,new THREE.CylinderGeometry(.2*hs,.2*hs,.012,28),wh,[0,.058*hs,0],[0,0,0],[1,1,1.08]);cyl(head,.11*hs,.02,[0,.085*hs,0],pk2);
   mesh(head,new THREE.CylinderGeometry(.018*hs,.03*hs,.12*hs,12),pk,[0,-RY*.25,fz(0,-RY*.25)+.05*hs],[T/2,0,0]);
   mesh(sp,new THREE.ConeGeometry(.09,.3,4),pk,[0,.3*H,-.19*B-.05],[-.35,0,0],[.25,1,1]);
   for(let i=0;i<10;i++){const a=i*.63;ball(sp,.015,[Math.sin(a)*.3,(.1+(i%4)*.12)*H,Math.cos(a)*.3],gl('#8fe0ff',1))}}
  if(SPK==='mapinguari'){const fu=M('#6b4a2a',0,1),fu2=M('#4a3220',0,1),cl=M('#efe6d3',0,.5),rd=gl('#ff3a2a',1.6),mo=M('#2a0a0c',0,.9);
   ov(fu,2.2,.42,.3,.12);for(let i=0;i<26;i++){const a=i*2.4,y=(.02+((i*37)%40)/100)*H;ball(sp,.045,[Math.sin(a)*sw*1.0,y,Math.cos(a)*.13*B],fu2,[1,1.4,1])}
   ball(sp,.075,[0,.2*H,zf+.01],mo,[1.3,.8,.4]);for(let i=0;i<6;i++)bx(sp,[.014,.03,.012],[(i-2.5)*.022,.2*H+(i%2?.03:-.03),zf+.03],cl);
   mesh(head,new THREE.SphereGeometry(1,24,16),fu,[0,.01,0],[0,0,0],[RX*1.35,RY*1.28,RZ*1.3]);
   ball(head,.034*hs,[0,RY*.25,RZ*1.25],M('#f4f1ea',0,.3),[1,1,.6]);ball(head,.018*hs,[0,RY*.25,RZ*1.25+.02],rd);ball(head,.045*hs,[0,-RY*.35,RZ*1.15],M('#2a1a10',0,.8),[1.2,.8,1])}
  if(SPK==='cuca'){const gr=M('#5a8a3a',0,.6),gr2=M('#3f6b2a',0,.7),pu=M('#5b2a86',0,.85),yl=M('#f1d046',0,.5),tt=M('#f4f1ea',0,.4),ye=gl('#ffd23a',1.8);
   robe(pu,.15,.3,.7,-.3);ov(pu,2.0,.34);
   mesh(head,new THREE.SphereGeometry(1,24,16),gr,[0,.01,.01],[0,0,0],[RX*1.2,RY*1.15,RZ*1.2]);
   bx(head,[.11*hs,.04*hs,.22*hs],[0,-RY*.18,RZ*1.1+.06],gr);bx(head,[.1*hs,.025*hs,.2*hs],[0,-RY*.42,RZ*1.1+.05],gr2,[.05,0,0]);
   for(const sd of [1,-1]){for(let i=0;i<5;i++)mesh(head,new THREE.ConeGeometry(.008,.03,5),tt,[sd*.04*hs,-RY*.27,RZ*1.1+.02+i*.035],[T,0,0]);
    ball(head,.03*hs,[sd*RX*.55,RY*.5,RZ*.95],gr);ball(head,.016*hs,[sd*RX*.55,RY*.5,RZ*.95+.025],ye,[1,.6,.5])}
   mesh(head,new THREE.ConeGeometry(.12*hs,.38*hs,20),pu,[0,.075*hs+.19*hs,-.01],[-.18,0,0]);cyl(head,.2*hs,.01,[0,.075*hs,0],pu);cyl(head,.122*hs,.02,[0,.09*hs,0],yl);
   mesh(head,new THREE.SphereGeometry(1,20,14),yl,[0,-.18*hs,-RZ*.7],[0,0,0],[RX*1.1,.34*hs,RZ*.5]);
   bx(sp,[.026,1.4,.026],[.22,.3*H+.1,-.15*B],wd,[0,0,-.2]);ball(sp,.06,[.36,.3*H+.85,-.15*B],ye)}
  if(SPK==='mula'){const fl=gl('#ff6a1a',2.4),fl2=gl('#ffd23a',2.4),ir=M('#8a8f94',.9,.3);
   head.visible=false;ov(M('#4a0d12',.05,.85),2.05,.36);robe(M('#2a0a0c',0,.9),.15,.3,.5,-.25);
   ball(sp,.07,[0,.6*H,0],fl2,[1,.5,1]);for(let i=0;i<14;i++){const a=i*.9,r=.04+.02*(i%3);mesh(sp,new THREE.ConeGeometry(.045,.28+.12*(i%4),8),i%2?fl:fl2,[Math.cos(a)*r,.66*H+.08*(i%4),Math.sin(a)*r],[Math.sin(a)*.25,0,-Math.cos(a)*.25])}
   mesh(sp,new THREE.TorusGeometry(.2,.012,6,24),ir,[0,.34*H,0],[T/2,0,0],[1.1,.7,1])}
  if(SPK==='mula'||SPK==='boitata'){const pl=new THREE.PointLight(0xff6a1a,1.6,3);pl.position.set(0,.68*H,.1);sp.add(pl)}
 }
 // mochila
 if(s.pack!=='none'){const big=s.pack==='large';bx(sp,[.3*B,big?.46:.34,big?.2:.15],[0,.3*H,-.2*B-(big?.035:.01)],cm);
  if(big)bx(sp,[.34*B,.1,.2],[0,.58*H,-.24*B],cm);bx(sp,[.2*B,.1,.04],[0,.28*H,-.3*B-(big?.055:.02)],vm)}
 // braços
 for(const [sd,n] of [[1,'L'],[-1,'R']]){
  const a=J(sp,'a'+n,[sd*(sw+.02),.45*H,0]);cap(a,.29,.05*B,(SPK==='ze'||slv)?skin:tm);
  const fr=J(a,'f'+n,[0,-.29,0]);cap(fr,.26,.042*B,z?skin:(mil||LS.includes(s.outfit)||(spc&&SPK!=='ze'))?tm:skin);
  if(SPK==='ze'){const go=M('#d9a441',.9,.25);for(let i=0;i<5;i++)bx(fr,[.034,.02,.012],[(i%2?.014:-.014),-.05-i*.045,.043*B],ink,[0,0,i*.7]);for(let i=0;i<4;i++)bx(a,[.03,.03,.012],[(i%2?.012:-.012),-.06-i*.05,.054*B],ink,[0,0,i*.9]);cyl(fr,(sd===1?.047:.046)*B,sd===1?.03:.012,[0,-.215,0],go)}
  if((SPK==='futuro'||SPK==='legado7'||SPK==='c54')){bx(fr,[.012,.2,.012],[0,-.13,.046*B],neon);bx(a,[.012,.2,.012],[0,-.15,.056*B],neon)}
  armFx(a,fr,sd);
  bx(fr,[.075,.085,.045],[0,-.29,0],glove);bx(fr,[.07,.03,.05],[0,-.335,.02],glove);bx(fr,[.02,.05,.03],[-sd*.045,-.3,.02],glove);
 }

 // ---------- infectado: sangue, ferimentos, ossos, cabeça ----------
 if(z){
  const lv={none:0,leve:12,medio:28,muito:52,banho:90}[s.zBlood]??28,bc=s.zBloodCol||'#8a0f18',bl=new THREE.MeshStandardMaterial({color:bc,roughness:.22,metalness:.15}),bd=M(mix(bc,'#000000',.55),0,.55),
   fl=new THREE.MeshStandardMaterial({color:'#b8404a',roughness:.3}),fl2=M('#c9707a',0,.35),flD=M('#3a080c',0,.6),bone=M('#e6dfc8',0,.65),V=THREE.Vector3,rn=i=>((i*7919+13)%1000)/1000,
   ex=(s.vest!=='none'||s.outfit==='jaqueta')?.03:s.outfit==='jaleco'?.027:0,rxU=.95*sw,rzU=.11*B,rxL=hw*1.15,rzL=.108*B,
   tz=(x,y)=>{const dU=y<.14*H?.14*H-y:y>.36*H?y-.36*H:0,dL=y<0?-y:y>.1?y-.1:0;return Math.max(rzU*Math.sqrt(Math.max(0,1-(x/rxU)**2-(dU/.13)**2)),rzL*Math.sqrt(Math.max(0,1-(x/rxL)**2-(dL/.12)**2)))+ex},
   frontN=x=>[x/rxU*.6,0,1],
   blot=(p,pos,n,r,m=bl,k=.28)=>{const o=ball(p,r,pos,m,[1,1,k]);o.quaternion.setFromUnitVectors(new V(0,0,1),new V(...n).normalize());return o},
   wnd=(p,pos,n,r,kind,rot=0)=>{const g=new THREE.Group();g.position.set(...pos);g.quaternion.setFromUnitVectors(new V(0,0,1),new V(...n).normalize());g.rotateZ(rot);p.add(g);
    if(kind==='b'){ball(g,r,[0,0,0],flD,[1,.85,.3]);ball(g,r*.66,[0,0,r*.06],fl,[1,.8,.3]);ball(g,r*.3,[0,0,r*.12],flD,[1,1,.3]);for(let i=0;i<8;i++){const a=i*.785;ball(g,r*.14,[Math.cos(a)*r*1.08,Math.sin(a)*r*.92,0],bd,[1,1,.4])}}
    else if(kind==='c'){bx(g,[r*2.4,r*.5,.006],[0,0,0],flD);bx(g,[r*2.2,r*.22,.008],[0,0,.002],fl);bx(g,[r*2.6,r*.12,.005],[0,r*.38,0],bl);bx(g,[r*2.6,r*.12,.005],[0,-r*.38,0],bl)}
    else if(kind==='g'){ball(g,r*1.6,[0,0,0],bl,[1,1,.25]);ball(g,r*.6,[0,0,r*.1],flD,[1,1,.3]);bx(g,[r*.5,r*4,.004],[0,-r*2.4,.001],bl)}
    else if(kind==='r'){ball(g,r,[0,0,0],flD,[.85,1.2,.3]);for(let i=0;i<4;i++)bx(g,[r*1.5,r*.17,.012],[0,-r*.7+i*r*.46,r*.14],bone,[0,0,.14]);bx(g,[r*.18,r*1.7,.01],[-r*.62,0,r*.1],fl)}
    else if(kind==='a'){ball(g,r,[0,0,0],flD,[1,1.3,.3]);ball(g,r*.7,[0,0,.003],fl,[1,1.2,.3]);cyl(g,r*.28,r*3,[0,0,r*.9],bone,[T/2,0,0]);ball(g,r*.36,[r*.12,0,r*2.35],bone);ball(g,r*.3,[-r*.18,0,r*2.25],bone)}
    return g},
   trail=(x,y0,n,dy,r)=>{for(let j=0;j<n;j++){const y=y0-j*dy;ball(head,r*(1-j*.07),[x,y,fz(x,y)+.002],bl,[.8,1.3,.5])}};
  // sangue espalhado (tronco, costas, braços, rosto, pernas, mãos)
  for(let i=0;i<lv;i++){const r1=rn(i),r2=rn(i+31),r3=rn(i+57),rad=(.012+r1*.026)*(lv>60?1.5:lv>25?1.15:1),m=r3>.6?bd:bl,g=i%7,ang=r2*6.28,sn=Math.sin(ang),cs=Math.cos(ang);
   if(g<3){const x=(r2-.5)*1.5*rxU*.85,y=(.08+r1*.36)*H,back=g===2;blot(sp,[x,y,(back?-1:1)*(tz(x,y)+.002)],[x/rxU*.6,0,back?-1:1],rad,m);if(!back&&r3>.7){const l=.04+r1*.08;bx(sp,[.007,l,.004],[x,y-l/2,tz(x,y)+.003],bl)}}
   else if(g<5){const sd=g===3?'L':'R';blot(rig['a'+sd],[.05*B*sn,-.04-r1*.24,.05*B*cs],[sn,0,cs],rad,m);blot(rig['f'+sd],[.042*B*sn,-.04-r3*.2,.042*B*cs],[sn,0,cs],rad*.9,m)}
   else if(g===5){const x=(r2-.5)*RX*1.2,y=(r1-.5)*RY*1.2;blot(head,[x,y,fz(x,y)+.002],[x/RX*.4,y/RY*.4,1],rad*.8,m)}
   else{const sd=r3>.5?'L':'R',sh=r1>.55,R=(sh?.057:.075*(f?1.05:1))*B*wide;blot(rig[(sh?'s':'t')+sd],[R*sn,-.05-r2*((sh?shL:thL)-.1),R*cs],[sn,0,cs],rad,m)}}
  if(lv>=28)for(const sd of ['L','R'])bx(rig['f'+sd],[.079,lv>=52?.088:.05,.049],[0,lv>=52?-.29:-.31,0],bl);
  // boca / mandíbula
  const my=-RY*.5,jz=y=>RZ*.18+RZ*.82*Math.sqrt(Math.max(.05,1-((y+RY*.5)/(RY*.62))**2)),sz=y=>Math.max(jz(y),fz(0,y))+.003;
  if(/aberta/.test(s.zMouth)){bx(head,[RX*.5,.035*hs,.02],[0,my-.012,sz(my-.012)],flD);for(let i=-2;i<=2;i++){bx(head,[.0085*hs,.011*hs,.007],[i*.0105*hs,my+.01*hs,sz(my+.01*hs)+.004],bone);bx(head,[.0085*hs,.009*hs,.007],[i*.0105*hs,my-.034*hs,sz(my-.034*hs)+.004],bone)}ball(head,.014*hs,[0,my-.02*hs,sz(my-.02*hs)+.004],fl,[1.4,.7,.6])}
  if(/sangue/.test(s.zMouth)){ball(head,.02*hs,[0,my-.012,sz(my-.012)+.006],bl,[1.7,1,.3]);for(const k of [-.014,0,.016])for(let j=0;j<5;j++){const y=my-.02-j*.016;ball(head,.0065*(1-j*.1),[k,y,Math.max(jz(y),fz(k,y))+.003],bl,[.8,1.4,.5])}}
  if(s.zEyes==='vazado'){const x=-RX*.4,y=RY*.08,zz=fz(x,y);ball(head,.027*hs,[x,y,zz+.001],bl,[1,1.05,.4]);ball(head,.02*hs,[x,y,zz+.005],M('#1a0305',0,.9),[1,1,.5]);trail(x,y-.02,5,.016,.008)}
  // ferimentos
  const wz=s.zWound,bit=wz==='mordidas'||wz==='tudo',cut=wz==='cortes'||wz==='tudo',gun=wz==='tiros'||wz==='tudo';
  if(bit){wnd(sp,[.036,.5*H,.027],[.8,0,.6],.03,'b',.3);wnd(rig.aL,[.05*B,-.13,.015],[1,0,.3],.032,'b',.5);wnd(rig.tR,[-.065*B*wide,-.2,.03],[-1,0,.4],.034,'b',.2);wnd(rig.sL,[0,-.18,-.057*B*wide],[0,0,-1],.028,'b',0)}
  if(cut){for(const [x,y,r] of [[-.07,.34,.6],[.01,.3,.5],[.08,.26,.55]])wnd(sp,[x,y*H,tz(x,y*H)+.002],frontN(x),.032,'c',r);wnd(rig.fL,[0,-.1,.042*B+.001],[0,0,1],.026,'c',1.45);wnd(rig.fL,[0,-.19,.042*B+.001],[0,0,1],.026,'c',1.3);wnd(head,[-RX*.5,-RY*.2,fz(-RX*.5,-RY*.2)+.001],[-.25,0,1],.022,'c',.9)}
  if(gun){for(const [x,y] of [[.03,.38],[-.04,.33],[.06,.22],[-.02,.16]])wnd(sp,[x,y*H,tz(x,y*H)+.002],frontN(x),.012,'g');wnd(rig.aR,[-.05*B,-.12,.015],[-1,0,.3],.012,'g')}
  // ossos / órgãos
  const zb=s.zBones;
  if(zb==='costelas'||zb==='tudo')wnd(sp,[-.075,.3*H,tz(-.075,.3*H)+.003],frontN(-.075),.06,'r',0);
  if(zb==='braco'||zb==='tudo')wnd(rig.fR,[0,-.13,.042*B+.001],[0,0,1],.03,'a',0);
  if(zb==='tripas'||zb==='tudo'){const gg=new THREE.Group();gg.position.set(0,.18*H,tz(0,.18*H)+.003);sp.add(gg);ball(gg,.07,[0,0,0],flD,[1,.9,.3]);
   [[-.03,-.02,.6],[0,-.05,-.4],[.03,-.07,.8],[-.012,-.1,1.2],[.025,-.12,-.7]].forEach(([x,y,r],i)=>mesh(gg,new THREE.CapsuleGeometry(.014,.06,4,8),i%2?fl2:fl,[x,y,.02],[0,0,r]));
   mesh(gg,new THREE.CapsuleGeometry(.012,.14,4,8),fl2,[.01,-.17,.02],[0,0,.15])}
  // cabeça
  const zh=s.zHead;
  if(zh==='aberto'){mesh(head,new THREE.SphereGeometry(1,20,14),M('#d98a96',0,.4),[0,RY*.86,-RZ*.1],[0,0,0],[RX*.5,RY*.3,RZ*.5]);mesh(head,new THREE.TorusGeometry(RX*.5,.011,8,20),bl,[0,RY*.86,-RZ*.1],[T/2,0,0],[1,RZ/RX,1]);
   for(const [x,zz] of [[.012,-.01],[-.014,-.03],[.01,-.05]])ball(head,.011,[x,RY*1.13,-RZ*.1+zz],M('#b8606c',0,.45),[1,.6,1]);trail(RX*.3,RY*.62,6,.02,.009);trail(-RX*.25,RY*.65,5,.02,.008)}
  if(zh==='machado'){const x=RX*.1,y=RY*.8;wnd(head,[x,y,fz(x,y)+.001],[0,.3,1],.04,'c',1.4);bx(head,[.012,.07,.05],[x,y,fz(x,y)+.015],M('#aab4bd',.8,.3));bx(head,[.014,.3,.014],[x,y+.17,fz(x,y)+.02],M('#5a3a22',0,.8),[-.35,0,0]);trail(x,y-.03,7,.02,.009)}
  if(zh==='furo'){const x=RX*.12,y=RY*.52;wnd(head,[x,y,fz(x,y)+.001],[0,0,1],.014,'g');trail(x,y-.04,5,.018,.006)}
  // veias da infecção
  if(s.zVeins==='on'){const vc=M(mix(mix(s.skin,zs[0],zs[1]),'#2a1040',.55),0,.9);
   for(const t of [-.55,0,.55])bx(sp,[.004,.07,.004],[.046*Math.sin(t),.525*H,.046*Math.cos(t)],vc,[0,t,t*.4]);
   for(const sd of [1,-1])for(const [x,y] of [[.62,.3],[.7,-.1]])bx(head,[.003,.05,.003],[sd*RX*x,RY*y,fz(sd*RX*x,RY*y)+.001],vc,[0,0,sd*.5]);
   for(const n of ['L','R']){for(const k of [-1,0,1]){const x=k*.013,R=.042*B;bx(rig['f'+n],[.004,.16,.004],[x,-.13,Math.sqrt(R*R-x*x)+.0015],vc,[0,0,k*.12])}
    for(const k of [-1,1]){const x=k*.016,R=.05*B;bx(rig['a'+n],[.004,.13,.004],[x,-.14,Math.sqrt(R*R-x*x)+.0015],vc,[0,0,k*.1])}}}
  // roupa rasgada
  if(s.zTorn==='on'){for(const [x,y,r] of [[-.08,.38,.4],[.06,.2,-.3],[.1,.33,.8]])bx(sp,[.07,.05,.01],[x,y*H,tz(x,y*H)+.001],skin,[0,0,r]);
   for(let i=0;i<5;i++)bx(sp,[.035,.06+.03*rn(i),.008],[(i-2)*.035,-.03,.1*B+.026],tm,[0,0,i%2?.15:-.15]);
   if(!sho&&!dress){bx(rig.tL,[.05,.07,.01],[.01,-.2,.075*B*wide+.0005],skin,[0,0,.3]);bx(rig.sR,[.04,.06,.01],[-.005,-.15,.057*B*wide+.0005],skin,[0,0,-.3])}}
 }
 // arma
 rig.weps=[];
 if(s.weapon!=='none'){const kind={rifle:['rifle'],lmg:['lmg'],shotgun:['shotgun'],sniper:['sniper'],pistol:['pistol'],dualPistol:['pistol','pistol'],smg:['smg'],dualSmg:['smg','smg']}[s.weapon];
  kind.forEach((tp,i)=>{const w=makeWeapon(tp,kind.length>1?(i?'L':'R'):'R',s.weaponColor);sp.add(w.g);rig.weps.push(w)})}
 if(SPK==='saci'&&rig.tR)rig.tR.visible=false;
 if(spc&&!s.noAura){const rl=(L.special.find(x=>x[0]===SPK)||[0,''])[1],rc=/Mítica/.test(rl)?'#ff3df2':/Lendária/.test(rl)?'#ffb52e':/Épica/.test(rl)?'#a45bff':'#3fa3ff';
  const am=new THREE.MeshStandardMaterial({color:rc,emissive:rc,emissiveIntensity:1.4,transparent:true,opacity:.85});
  const r1=new THREE.Mesh(new THREE.TorusGeometry(.62,.018,8,64),am);r1.rotation.x=T/2;r1.position.y=.07;root.add(r1);
  const r2=new THREE.Mesh(new THREE.TorusGeometry(.5,.01,8,64),am);r2.rotation.x=T/2;r2.position.y=.07;root.add(r2);
  const spk=new THREE.Group();root.add(spk);for(let i=0;i<12;i++)ball(spk,.014,[Math.cos(i*.52)*.55,.3+i*.1,Math.sin(i*.52)*.55],am);
  rig.aura=am;rig.spark=spk}
 tagFP();
}

// ---------- animação (esqueleto fixo, sem reconstruir) ----------
const AX=new THREE.Vector3(1,0,0),WR=[[-.1,.34,.2],[-.07,.575,.17]];
const WP={rifle:WR,lmg:[[-.1,.32,.2],[-.07,.56,.16]],shotgun:WR,sniper:WR,melee:[[-.17,.5,.3],[-.15,.56,.34]],pistol:[[-.12,.36,.38],[-.06,.585,.38]],smg:[[-.12,.35,.36],[-.06,.575,.36]]};
let aimT=0,SW=null;const Y_DN=new THREE.Vector3(0,-1,0),_d=new THREE.Vector3(),_p=new THREE.Vector3(),_e=new THREE.Vector3(),_t=new THREE.Vector3(),_q=new THREE.Quaternion();
function ik(arm,fore,sd,T3){ // braço de 2 ossos: leva a mão até o ponto de empunhadura
 const S0=arm.position,l1=.29,l2=.29,d0=_d.copy(T3).sub(S0),d=clamp(d0.length(),.12,l1+l2-.005),u=d0.normalize();
 const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));
 _p.set(sd*.6,-1,-.2);_p.addScaledVector(u,-_p.dot(u)).normalize();
 _e.copy(S0).addScaledVector(u,a).addScaledVector(_p,h);
 arm.quaternion.setFromUnitVectors(Y_DN,_t.copy(_e).sub(S0).normalize());
 fore.quaternion.setFromUnitVectors(Y_DN,_t.copy(T3).sub(_e).normalize().applyQuaternion(_q.copy(arm.quaternion).invert()));
}
const cur={};let ph=0,crouch=0;
function animate(dt,spd,sgn,pitch,air){
 if(rig.fx&&rig.fx.length){const ft=performance.now()/1000;for(const f of rig.fx)f(ft)}   // partes animadas das skins vivas
 if(rig.aura){const tt=performance.now()/1000;rig.aura.emissiveIntensity=1.2+Math.sin(tt*3)*.6;if(rig.spark){rig.spark.rotation.y=tt*.9;rig.spark.children.forEach((c,i)=>{c.position.y=.25+((i*.13)%1.4)+Math.sin(tt*2+i)*.06})}}
 const key=S.mode==='zombie'?'zombie':S.pose,P=POSES[key];
 for(const k in P){const c=cur[k]||(cur[k]=P[k].slice());for(let i=0;i<3;i++)c[i]+=(P[k][i]-c[i])*Math.min(1,dt*9)}
 const mv=spd>.1,A=mv?.28+.32*Math.min(1,spd/4.6):0;if(mv)ph+=dt*spd*2.4*sgn;
 const w=Math.sin(ph)*A,armed=key==='armed'||key==='aim'||key==='zombie',aw=armed?.1:.9,br=Math.sin(performance.now()/1000*1.7)*.012;
 const set=(o,v,x=0,y=0,zz=0)=>o.rotation.set(rad(v[0])+x,rad(v[1])+y,rad(v[2])+zz);
 set(rig.head,cur.head,-pitch*.85);
 set(rig.spine,cur.spine,br+crouch*.25,mv?-w*.12:0);
 set(rig.aL,cur.aL,w*aw*1.3);set(rig.aR,cur.aR,-w*aw*1.3);
 set(rig.fL,cur.fL,-Math.abs(w)*.5*aw);set(rig.fR,cur.fR,-Math.abs(w)*.5*aw);
 // golpe corpo a corpo (soco/facada/coronhada): progresso 0..1 e deslocamento da mão em 3ª pessoa (frente do rig = +Z)
 let swp=-1,swk='';if(SW){SW.t+=dt/SW.dur;if(SW.t>=1)SW=null;else{swp=SW.t;swk=SW.k}}
 const sws=swp>=0?Math.sin(Math.PI*swp):0,swe=swp>=0?Math.sin(Math.PI*Math.min(1,swp*1.6)):0;
 if(swp>=0&&swk==='pour'){const e=Math.sin(Math.PI*Math.min(1,swp*5))*(swp<.9?1:Math.max(0,(1-swp)*10));rig.spine.rotation.x+=.5*e;rig.head.rotation.x+=.2*e;if(!rig.weps.length){rig.aR.rotation.x-=1.25*e;rig.aL.rotation.x-=.9*e;rig.fR.rotation.x=-.6*e;rig.fL.rotation.x=-.5*e}}   // abastecer: tronco inclinado, braços à frente segurando o galão
 if(swp>=0&&swk!=='pour'&&!rig.weps.length){const sd=SW.n%2?'R':'L',ar=rig['a'+sd],fo=rig['f'+sd];ar.rotation.x-=1.55*swe;ar.rotation.z+=(sd==='R'?-1:1)*.15*swe;fo.rotation.x=-.15*swe;rig.spine.rotation.y+=(sd==='R'?1:-1)*.45*(swe-.3)}   // soco: braço vai à frente, tronco gira
 const tuck=air?.6:0;
 rig.tL.rotation.set(-w-crouch*1.1-tuck,0,0);rig.tR.rotation.set(w-crouch*1.1,0,0);
 rig.sL.rotation.set(Math.max(0,Math.cos(ph))*A*1.2*(mv?1:0)+crouch*1.5+tuck*1.2,0,0);
 rig.sR.rotation.set(Math.max(0,-Math.cos(ph))*A*1.2*(mv?1:0)+crouch*1.5,0,0);
 rig.hips.position.y=rig.hips.userData.y-crouch*.26*S.height+(mv?Math.abs(Math.sin(ph))*.025:0);
 const act=(key==='armed'||key==='aim')&&rig.weps.length>0;aimT+=((key==='aim'?1:0)-aimT)*Math.min(1,dt*10);
 const wsw=w;for(const w of rig.weps){w.g.visible=act;if(!act)continue;
  if(w.hand){const sd=w.side==='L'?'L':'R',sg=sd==='R'?1:-1,ar=rig['a'+sd],fo=rig['f'+sd],oa=rig[sd==='R'?'aL':'aR'],of=rig[sd==='R'?'fL':'fR'],sm=(t)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
   oa.rotation.set(rad(6)+wsw*aw*.5,0,sg*rad(8));of.rotation.set(rad(-14),0,0);                       // a outra mão fica solta, relaxada
   ar.rotation.set(rad(-48)-wsw*aw*.4,0,sg*rad(-8));fo.rotation.set(rad(-78),0,0);w.g.rotation.set(w.elev!=null?.9+(1.5708-w.elev)/.76:.67,0,0);   /* elev = inclinação da lâmina acima da horizontal (a mesma da 1ª pessoa); 0,9 = lâmina na vertical */
   if(w.two){oa.rotation.set(rad(-64),0,-sg*rad(16));of.rotation.set(rad(-58),0,0);ar.rotation.x-=rad(8)}   // arma longa/pesada (lança, machado, martelo, motosserra): a outra mão segura o cabo   // mão da arma à frente do peito, lâmina para cima e levemente à frente
   if(swp>=0){const q=swp,k=swk;let d=0,t=0,tw=0,wr=0;   // d = quanto o braço sobe(-)/desce(+); t = giro do tronco; wr = inclinação da lâmina
    if(k==='stab'){const a=sm(q/.3),b=sm((q-.3)/.22),c=sm((q-.55)/.45);const ext=b*(1-c);ar.rotation.x+=.35*a*(1-b)-.75*ext;fo.rotation.x+=-.5*a*(1-b)+1.15*ext;ar.rotation.z-=sg*.1*ext;t=-.25*a*(1-c)+.3*ext;wr=-.8*ext;}
    else if(k==='heavy'||k==='chop'){const hv=k==='heavy',w0=hv?.42:.34,s0=hv?.62:.56,cv=(wv,sv)=>q<w0?wv*sm(q/w0):q<s0?wv+(sv-wv)*sm((q-w0)/(s0-w0)):sv*(1-sm((q-s0)/(1-s0)));   // ergue (windup), desce com tudo, recupera — volta a zero no fim
     d=cv(hv?-1.5:-1.9,hv?.8:.9);ar.rotation.x+=d;fo.rotation.x+=cv(-.5,.4);t=cv(-.4,.5)*sg;wr=cv(0,-.3);rig.spine.rotation.x+=cv(-.12,.3);ar.rotation.z+=sg*cv(-.15,.25);}
    else if(k==='slashU'){const cv=(wv,sv)=>q<.25?wv*sm(q/.25):q<.62?wv+(sv-wv)*sm((q-.25)/.37):sv*(1-sm((q-.62)/.38));   // recolhe para baixo/fora e sobe cortando para dentro
     ar.rotation.x+=cv(.55,-1.25);fo.rotation.x+=cv(.3,-.35);ar.rotation.z+=sg*cv(.5,-.9);t=cv(.45,-.6)*sg;wr=cv(.3,-.5);}
    else if(k==='saw'){const e=Math.sin(Math.PI*Math.min(1,q*1.2)),v=Math.sin(q*Math.PI*14)*e;ar.rotation.x+=-.45*e;fo.rotation.x+=-.25*e+.05*v;ar.rotation.z+=sg*.05*v;t=sg*.35*Math.sin(q*Math.PI*3)*e;rig.spine.rotation.x+=.1*e;}   // motosserra: empurra à frente e serra de lado a lado, vibrando
    else{const dg=k==='slashD'?1:0,a=sm(q/.3),b=sm((q-.3)/.3),c=sm((q-.62)/.38);d=-.75*a+1.55*b*(1-c);ar.rotation.x+=d;fo.rotation.x+=-.3*a*(1-b)+.25*b*(1-c);ar.rotation.z+=sg*(-.55*a+1.1*b*(1-c))*(dg?1.4:.6);t=(-.4*a+.9*b*(1-c))*sg;wr=-.25*b*(1-c);}
    rig.spine.rotation.y+=t;w.g.rotation.x+=wr;}
   continue;}
  const pz=WP[w.type],m=(w.side==='L'?-1:1)*(rig.weps.length>1?1.45:1),Hh=S.height;
  w.g.position.set(m*(pz[0][0]+(pz[1][0]-pz[0][0])*aimT),Hh*(pz[0][1]+(pz[1][1]-pz[0][1])*aimT)+(mv?Math.sin(ph*2)*A*.012:br),pz[0][2]+(pz[1][2]-pz[0][2])*aimT);
  _t.copy(w.g.position);_t.y-=.6*Hh;_t.applyAxisAngle(AX,-pitch);w.g.position.set(_t.x,_t.y+.6*Hh,_t.z);w.g.rotation.set(-pitch,0,0);
  if(swp>=0&&swk==='pour'){const e=Math.sin(Math.PI*Math.min(1,swp*5))*(swp<.9?1:Math.max(0,(1-swp)*10));w.g.position.y-=.25*Hh*e;w.g.position.z+=.12*Hh*e;w.g.rotation.x+=.5*e}
  else if(swp>=0){const k=swk,q=swp,z=Hh;let ox=0,oy=0,oz=0,rx=0,rz=0;
   if(k==='slash'){ox=(.5-q)*.7*z;oz=.25*sws*z;rz=(.5-q)*1.6}
   else if(k==='slashD'){ox=(.5-q)*.6*z;oy=(.5-q)*.5*z;oz=.22*sws*z;rz=(.5-q)*2}
   else if(k==='stab'){oz=.5*sws*z;rx=-.2*sws}
   else if(k==='heavy'){oy=(q<.45?q/.45:1-(q-.45)/.55*1.5)*.3*z;oz=(q<.45?0:.35*sws)*z;rx=q<.45?-.9*q/.45:-.9+1.7*(q-.45)/.55}
   else{oz=.3*sws*z;oy=.1*sws*z;rx=-.5*sws}
   w.g.position.x+=ox;w.g.position.y+=oy;w.g.position.z+=oz;w.g.rotation.x+=rx;w.g.rotation.z+=rz}
  for(const [sd,gp] of w.grips)ik(rig['a'+sd],rig['f'+sd],sd==='L'?1:-1,_t.set(gp[0],gp[1],gp[2]).applyQuaternion(w.g.quaternion).add(w.g.position).clone());
 }
}

// ---------- teste de movimento ----------

Object.assign(S, initial);
build();
return {
  root, S, D, L, KITS, POSES, WP, WPS,
  get rig() { return rig; }, rebuild() { build(); }, animate, ik,
  swing(k,dur){SW={t:0,k,dur,n:(SW?SW.n:0)+1};},
  setCrouch(v) { crouch = v; }
};
}
