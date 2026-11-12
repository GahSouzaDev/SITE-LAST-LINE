import * as THREE from 'three';
import { MT } from './arsenalModels.js';
import { SKIN_PACK } from '/shared/skinsPack.js';
import { emitSpec, lowQ } from './rareSkins.js';
// SKINS DO ARSENAL DO USUÁRIO (arsenal.html): materiais com textura (camuflagem, carbono, mármore, sakura, matrix, circuito, escamas, galáxia...), brilhos animados
// (pulsar, rolar a textura, piscar) e efeitos de partículas (brasas, fogo, gelo, pétalas, bolhas, faíscas, abismo). 100% cosméticas.
const rnd = Math.random, rr = (a, b) => a + rnd() * (b - a);
const T=(w,f)=>{const c=document.createElement('canvas');c.width=c.height=w;f(c.getContext('2d'),w);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t};
const Mt = (c, m, r, o = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r, ...o });
const desT=T(256,(x,w)=>{x.fillStyle='#c4a874';x.fillRect(0,0,w,w);for(let i=0;i<40;i++){x.fillStyle=['#9a7f52','#e0cc9a','#7a6a48'][i%3];x.beginPath();x.ellipse(Math.random()*w,Math.random()*w,10+Math.random()*30,6+Math.random()*18,Math.random()*3,0,7);x.fill()}});
const carbonT=T(128,(x,w)=>{x.fillStyle='#0c0d10';x.fillRect(0,0,w,w);const s=w/8;for(let i=0;i<8;i++)for(let j=0;j<8;j++){const g=x.createLinearGradient(i*s,j*s,i*s+s,j*s+s),a=(i+j)%2;g.addColorStop(0,a?'#2a2d33':'#14161a');g.addColorStop(1,a?'#14161a':'#2a2d33');x.fillStyle=g;x.fillRect(i*s+1,j*s+1,s-2,s-2)}});carbonT.repeat.set(3,3);
const digiT=T(256,(x,w)=>{const c=['#4b5a3a','#2f3a27','#8b8f6a','#1d241a'];x.fillStyle=c[0];x.fillRect(0,0,w,w);for(let i=0;i<260;i++){x.fillStyle=c[1+(Math.random()*3|0)];const s=8+(Math.random()*3|0)*8;x.fillRect((Math.random()*w/8|0)*8,(Math.random()*w/8|0)*8,s,s)}});
const rustT=T(256,(x,w)=>{x.fillStyle='#6b5a52';x.fillRect(0,0,w,w);for(let i=0;i<120;i++){x.fillStyle=['rgba(150,70,25,.5)','rgba(110,50,20,.5)','rgba(60,45,40,.5)','rgba(190,110,50,.35)'][i%4];x.beginPath();x.ellipse(Math.random()*w,Math.random()*w,4+Math.random()*26,3+Math.random()*16,Math.random()*3,0,7);x.fill()}});
const marbleT=T(256,(x,w)=>{x.fillStyle='#ecebe6';x.fillRect(0,0,w,w);for(let i=0;i<14;i++){x.strokeStyle=`rgba(90,90,100,${.1+Math.random()*.3})`;x.lineWidth=.5+Math.random()*2;x.beginPath();let px=Math.random()*w,py=0;x.moveTo(px,py);for(let k=0;k<8;k++){px+=rr(-30,30);py+=w/8;x.lineTo(px,py)}x.stroke()}});
const sakuraT=T(256,(x,w)=>{const g=x.createLinearGradient(0,0,w,w);g.addColorStop(0,'#ffd1e3');g.addColorStop(1,'#f27aa7');x.fillStyle=g;x.fillRect(0,0,w,w);for(let i=0;i<30;i++){x.fillStyle=`rgba(255,255,255,${.3+Math.random()*.5})`;x.save();x.translate(Math.random()*w,Math.random()*w);x.rotate(Math.random()*6);for(let k=0;k<5;k++){x.rotate(1.2566);x.beginPath();x.ellipse(5,0,5,2.5,0,0,7);x.fill()}x.restore()}});
const toxT=T(256,(x,w)=>{x.fillStyle='#16240e';x.fillRect(0,0,w,w);for(let i=0;i<50;i++){x.fillStyle=`rgba(${100+Math.random()*60|0},255,${Math.random()*60|0},${.15+Math.random()*.35})`;x.beginPath();x.arc(Math.random()*w,Math.random()*w,2+Math.random()*12,0,7);x.fill()}x.fillStyle='rgba(140,255,40,.5)';for(let i=0;i<10;i++)x.fillRect(Math.random()*w,0,3,Math.random()*w)});
const matrixT=T(256,(x,w)=>{x.fillStyle='#000';x.fillRect(0,0,w,w);x.font='14px monospace';const ch='01ABCDEFXZ#$%&*+<>';for(let c=0;c<w/14;c++){const n=3+(Math.random()*14|0),y0=Math.random()*w;for(let k=0;k<n;k++){const a=k/n;x.fillStyle=k===n-1?'#d8ffe0':`rgba(0,255,90,${.12+a*.7})`;x.fillText(ch[Math.random()*ch.length|0],c*14,(y0+k*14)%w)}}});matrixT.repeat.set(2,2);
const circuitT=T(256,(x,w)=>{x.fillStyle='#000';x.fillRect(0,0,w,w);x.lineWidth=2;for(let i=0;i<26;i++){x.strokeStyle=i%3?'#00e5ff':'#ff2bd6';x.beginPath();let px=(Math.random()*w/16|0)*16,py=(Math.random()*w/16|0)*16;x.moveTo(px,py);for(let k=0;k<5;k++){if(k%2)px+=((Math.random()*5|0)-2)*16;else py+=((Math.random()*5|0)-2)*16;x.lineTo(px,py)}x.stroke();x.fillStyle=x.strokeStyle;x.fillRect(px-3,py-3,6,6)}});
const crackT=T(256,(x,w)=>{x.fillStyle='#000';x.fillRect(0,0,w,w);for(let i=0;i<16;i++){x.strokeStyle=['#ff3a00','#ff9a1a','#ffd23a'][i%3];x.lineWidth=1+Math.random()*3;x.beginPath();let px=Math.random()*w,py=Math.random()*w;x.moveTo(px,py);for(let k=0;k<7;k++){px+=rr(-40,40);py+=rr(-40,40);x.lineTo(px,py)}x.stroke()}});
const frostT=T(256,(x,w)=>{x.fillStyle='#bfe3ff';x.fillRect(0,0,w,w);for(let i=0;i<60;i++){x.strokeStyle=`rgba(255,255,255,${.2+Math.random()*.5})`;x.lineWidth=1;const px=Math.random()*w,py=Math.random()*w,a=Math.random()*6;for(let k=0;k<6;k++){const b=a+k*1.047;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(b)*(6+Math.random()*14),py+Math.sin(b)*(6+Math.random()*14));x.stroke()}}});
const scaleT=T(128,(x,w)=>{x.fillStyle='#1a0a08';x.fillRect(0,0,w,w);const s=16;for(let j=-1;j<w/s*2;j++)for(let i=0;i<w/s+1;i++){const px=i*s+(j%2?s/2:0),py=j*s*.5,g=x.createRadialGradient(px,py,1,px,py,s*.7);g.addColorStop(0,'#c0301c');g.addColorStop(1,'#3a0d08');x.fillStyle=g;x.beginPath();x.arc(px,py,s*.55,0,Math.PI);x.fill();x.strokeStyle='rgba(255,178,58,.35)';x.lineWidth=1;x.stroke()}});
const galaxyT=T(256,(x,w)=>{const g=x.createLinearGradient(0,0,w,w);g.addColorStop(0,'#0a0420');g.addColorStop(.5,'#3a0f6e');g.addColorStop(1,'#08204a');x.fillStyle=g;x.fillRect(0,0,w,w);for(let i=0;i<10;i++){const px=Math.random()*w,py=Math.random()*w,rg=x.createRadialGradient(px,py,0,px,py,60),c=['255,60,200','60,140,255','150,80,255'][i%3];rg.addColorStop(0,`rgba(${c},.45)`);rg.addColorStop(1,`rgba(${c},0)`);x.fillStyle=rg;x.fillRect(0,0,w,w)}for(let i=0;i<220;i++){x.fillStyle=`rgba(255,255,255,${.3+Math.random()*.7})`;const s=Math.random()<.1?2.5:1;x.fillRect(Math.random()*w,Math.random()*w,s,s)}});
const ALLM=['steel','chrome','blued','black','poly','tan','od','navy','camo','wood'],TRIM=['gold','red'];
const SKD={
 gold:(s,M)=>{const a=M(0xffcf4d,1,.14),b=M(0xc8921f,1,.22);s(['steel','chrome','tan','camo','gold'],a);s(['blued','poly','od','navy'],b);s(['black','red'],M(0x3a2a10,.6,.4))},
 ww2:(s,M)=>{s(['steel','chrome'],M(0x3b3e3a,.75,.5));s(['blued'],M(0x2a2d29,.7,.5));s(['black'],M(0x1c1e1c,.6,.55));s(['poly','tan'],MT.wood);s(['od','navy','camo'],M(0x4a5236,.1,.7));s(['gold'],M(0x9c7a2f,.8,.35))},
 desert:(s,M)=>{s(['steel','chrome'],M(0x7a705c,.6,.55));s(['blued'],M(0x4e4636,.6,.5));s(['black'],M(0x3a3528,.5,.6));s(['poly','od','navy','tan'],M(0xc9ae7c,.1,.7));s(['camo'],M(0xffffff,.1,.7,{map:desT}));s(['wood'],M(0x9a7448,.1,.6));s(['gold'],M(0x6a5a3a,.8,.4))},
 neon:(s,M)=>{s(['steel','chrome'],M(0x1a2032,.9,.2));s(['blued'],M(0x10162a,.9,.2));s(['black'],M(0x0a0e1c,.8,.25));s(['poly'],M(0x151b30,.3,.3));s(['tan','od','navy','camo'],M(0x20204a,.5,.3));s(['gold'],M(0xff3de0,.3,.2,{emissive:0xff1fcf,emissiveIntensity:2.6}));s(['red'],M(0x3de0ff,.3,.2,{emissive:0x1fc0ff,emissiveIntensity:2.6}))},
 obsidian:(s,M)=>{s(['steel','chrome','blued','black','poly','tan','od','navy','camo'],M(0x08090c,.95,.08));s(['gold','red'],MT.glowR)},
 ice:(s,M)=>{s(['steel','chrome'],M(0xdff0ff,1,.08));s(['blued'],M(0x9cc8ee,.9,.12));s(['black'],M(0x3d6a96,.6,.2));s(['poly'],M(0x7fb6e8,.2,.15));s(['tan','od','navy','camo'],M(0xbfe0ff,.4,.2));s(['wood'],M(0xdff0ff,.2,.1));s(['gold'],MT.glow)},
 lava:(s,M)=>{s(['steel','chrome'],M(0x4a3a36,.8,.4));s(['blued'],M(0x2a1d1b,.8,.4));s(['black'],M(0x120b0a,.6,.5));s(['poly'],M(0x1d1210,.2,.7));s(['tan','od','navy','camo'],M(0x2a1a16,.3,.6));s(['gold','red'],MT.glow2)},
 digi:(s,M)=>{s(ALLM,M(0xffffff,.1,.7,{map:digiT}));s(['steel','chrome'],M(0x3a3f3a,.7,.45));s(['black','blued'],M(0x1d211d,.6,.5));s(['gold'],M(0x6a6a50,.8,.4))},
 rust:(s,M)=>{s(ALLM,M(0xffffff,.7,.8,{map:rustT}));s(TRIM,M(0x7a3a1a,.5,.7))},
 carbon:(s,M)=>{s(ALLM,M(0xffffff,.55,.3,{map:carbonT}));s(['steel','chrome'],M(0x9aa5ae,1,.15));s(['gold'],M(0xff3b3b,.6,.3,{emissive:0xff1010,emissiveIntensity:.8}));s(['red'],M(0xff3b3b,.6,.3,{emissive:0xff1010,emissiveIntensity:.8}))},
 bronze:(s,M)=>{s(ALLM,M(0x8a5a2b,.9,.35));s(['steel','chrome'],M(0xc98a4a,1,.2));s(TRIM,M(0x2a1a0c,.6,.5))},
 chrome:(s,M)=>{s(ALLM,M(0xf2f6fa,1,.04));s(['black'],M(0x20242a,.9,.1));s(TRIM,M(0x2b6fff,1,.05))},
 marble:(s,M)=>{s(ALLM,M(0xffffff,.2,.15,{map:marbleT}));s(['steel','chrome','blued'],M(0xd9a43f,1,.2));s(['black'],M(0x151515,.5,.2));s(TRIM,M(0xd9a43f,1,.2))},
 sakura:(s,M)=>{s(ALLM,M(0xffffff,.2,.4,{map:sakuraT}));s(['steel','chrome','blued'],M(0x3a1e2a,.8,.3));s(['black'],M(0x2a1520,.6,.4));s(TRIM,M(0xffe6f0,.9,.2,{emissive:0xff7fb0,emissiveIntensity:.8}))},
 toxic:(s,M)=>{const g=M(0x8bff2a,.2,.3,{emissive:0x5eff00,emissiveIntensity:2.5});s(ALLM,M(0xffffff,.3,.4,{map:toxT}));s(['steel','chrome','blued','black'],M(0x1a2a14,.8,.3));s(TRIM,g);s(['glow'],g)},
 matrix:(s,M,mp)=>{const b=M(0x02140a,.7,.4,{emissive:0xffffff,emissiveMap:matrixT,emissiveIntensity:1.2}),g=M(0x00ff66,.2,.3,{emissive:0x00ff66,emissiveIntensity:3});s(ALLM,b);s(['steel','chrome'],M(0x0b2a15,.9,.3,{emissive:0xffffff,emissiveMap:matrixT,emissiveIntensity:.9}));s(TRIM,g);s(['glow'],g);mp.scroll=[[matrixT,0,-.25]];mp.pulse=[[g,3,1,4]]},
 circuit:(s,M,mp)=>{const b=M(0x0e1824,.8,.3,{emissive:0xffffff,emissiveMap:circuitT,emissiveIntensity:1.3}),c=M(0x00e5ff,.2,.2,{emissive:0x00e5ff,emissiveIntensity:3}),p=M(0xff2bd6,.2,.2,{emissive:0xff2bd6,emissiveIntensity:3});s(ALLM,b);s(['steel','chrome'],M(0xaab8c8,1,.12));s(['gold'],c);s(['red'],p);s(['glow'],c);mp.pulse=[[b,1.3,.5,3],[c,3,1,5],[p,3,1,4]]},
 inferno:(s,M,mp)=>{const b=M(0x140c0a,.7,.5,{emissive:0xffffff,emissiveMap:crackT,emissiveIntensity:1.8}),c=M(0x2a1a14,.9,.35,{emissive:0xffffff,emissiveMap:crackT,emissiveIntensity:1.2});s(ALLM,b);s(['steel','chrome'],c);s(TRIM,MT.glow2);s(['glow'],MT.glow2);mp.pulse=[[b,1.8,.8,5],[c,1.2,.6,4]]},
 frost:(s,M)=>{s(ALLM,M(0xdff3ff,.3,.12,{map:frostT,emissive:0x2a7fb8,emissiveIntensity:.45}));s(['steel','chrome'],M(0xffffff,1,.05));s(['blued','black'],M(0x5aa2dc,.6,.15));s(TRIM,MT.glow)},
 volt:(s,M,mp)=>{const y=M(0xffe34a,.3,.2,{emissive:0xffd400,emissiveIntensity:3});s(ALLM,M(0x14182a,.9,.25));s(['steel','chrome'],M(0x6a7898,1,.2));s(TRIM,y);s(['glow'],y);mp.flick=[y]},
 laser:(s,M,mp)=>{const c=M(0x00e5ff,.2,.2,{emissive:0x00e5ff,emissiveIntensity:3}),p=M(0xff2bd6,.2,.2,{emissive:0xff2bd6,emissiveIntensity:3});s(ALLM,M(0xeef2f8,.35,.22));s(['steel','chrome','blued'],M(0x2a3140,.9,.2));s(['black'],M(0x10141c,.8,.25));s(['gold'],c);s(['red'],p);s(['glow'],c);mp.pulse=[[c,3,1.2,4],[p,3,1.2,3.3]]},
 dragon:(s,M,mp)=>{const g=M(0xff5a10,.3,.3,{emissive:0xff4400,emissiveIntensity:2.4});s(ALLM,M(0xffffff,.6,.35,{map:scaleT}));s(['steel','chrome'],M(0xd9a43f,1,.25));s(TRIM,g);s(['glow'],g);mp.pulse=[[g,2.4,1,4]]},
 galaxy:(s,M,mp)=>{s(ALLM,M(0xffffff,.5,.3,{map:galaxyT,emissive:0xffffff,emissiveMap:galaxyT,emissiveIntensity:.9}));s(['steel','chrome'],M(0xcfc0ff,1,.1));s(TRIM,M(0xff7fe0,.3,.2,{emissive:0xff5fd0,emissiveIntensity:2.5}));mp.scroll=[[galaxyT,.015,.008]]},
 void:(s,M,mp)=>{const g=M(0xa23bff,.3,.2,{emissive:0x8a1fff,emissiveIntensity:3.5});s(ALLM,M(0x07030f,.95,.15));s(['steel','chrome'],M(0x1b0a33,1,.1));s(TRIM,g);s(['glow'],g);mp.pulse=[[g,3.5,1.5,3]]},
 prism:(s,M,mp)=>{const a=M(0xff0040,.9,.18,{emissive:0xff0040,emissiveIntensity:.35}),b=M(0x00ffaa,.9,.18,{emissive:0x00ffaa,emissiveIntensity:.35}),c=M(0x4040ff,.5,.2,{emissive:0x4040ff,emissiveIntensity:1.2});s(ALLM,a);s(['steel','chrome'],b);s(TRIM,c);s(['glow'],c);mp.rb=[[a,0],[b,.33],[c,.66]]},
 holo:(s,M)=>{const H=()=>new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:1,roughness:.12,iridescence:1,iridescenceIOR:1.9,iridescenceThicknessRange:[250,900],clearcoat:1,clearcoatRoughness:.05});s(ALLM,H());s(['steel','chrome'],H());s(TRIM,M(0x7fffe8,.3,.2,{emissive:0x40ffd8,emissiveIntensity:2.5}))}};
const SKMAP = {};
// KIT DA ESTREIA: preto + amarelo + branco (partes pretas do modelo ficam PRETAS de verdade; metal amarelo; polímero branco; detalhes brilhantes brancos)
SKD.estreia = (s, M) => { s(['steel', 'chrome', 'blued'], M(0xf2c200, .7, .3)); s(['black'], M(0x101216, .5, .35)); s(['poly', 'tan', 'od', 'navy', 'camo', 'wood'], M(0xf4f4ee, .25, .4)); s(['gold', 'red'], M(0xf4f4ee, .3, .25, { emissive: 0xffe066, emissiveIntensity: .9 })); };
// LEGADO 7: amarelo-tema nas partes de metal e polímero, preto nas partes escuras e detalhes brilhando
SKD.ferrari65 = (s, M) => { s(['steel', 'chrome', 'blued', 'poly', 'tan', 'od', 'navy', 'camo', 'wood'], M(0xd40000, .45, .22)); s(['black'], M(0x1a0505, .5, .35)); s(['gold', 'red'], M(0xff2a10, .3, .25, { emissive: 0xff2a10, emissiveIntensity: .9 })); };
SKD.azul54 = (s, M) => { s(['steel', 'chrome', 'blued', 'poly', 'tan', 'od', 'navy', 'camo', 'wood'], M(0x1e5ad6, .45, .3)); s(['black'], M(0x0b1530, .5, .35)); s(['gold', 'red'], M(0x4aa3ff, .3, .25, { emissive: 0x27a8ff, emissiveIntensity: .8 })); };
SKD.legado7 = (s, M) => { s(['steel', 'chrome', 'blued'], M(0xffc400, .65, .3)); s(['black'], M(0x0e0f12, .5, .35)); s(['poly', 'tan', 'od', 'navy', 'camo', 'wood'], M(0xf5b800, .35, .4)); s(['gold', 'red'], M(0xfff1a0, .3, .25, { emissive: 0xffd400, emissiveIntensity: 1.4 })); };
// LOJA: Rosa Choque = cor sólida (corpo rosa-choque, peças escuras em rosa mais fechado); Fogo = TEXTURA de fogo estática (sem animação nem partículas) cobrindo a arma inteira.
// A textura nasce uma vez só (preguiçosa) e é compartilhada pelas 3 armas; os materiais ficam em cache por skin.
let _fireT; const fireT = () => _fireT || (_fireT = T(256, (x, w) => {
  const g = x.createLinearGradient(0, w, 0, 0); g.addColorStop(0, '#5a0800'); g.addColorStop(.35, '#d12a00'); g.addColorStop(.7, '#ff7a00'); g.addColorStop(1, '#ffd23a'); x.fillStyle = g; x.fillRect(0, 0, w, w);
  for (let i = 0; i < 34; i++) { const bx = Math.random() * w, bw = 14 + Math.random() * 30, h = 70 + Math.random() * 150, cols = ['#ff3d00', '#ff8a1a', '#ffc21a', '#fff07a']; x.fillStyle = cols[i % 4]; x.globalAlpha = .55 + Math.random() * .4;
    x.beginPath(); x.moveTo(bx - bw / 2, w); x.bezierCurveTo(bx - bw, w - h * .4, bx - bw * .2, w - h * .7, bx + (Math.random() - .5) * 10, w - h); x.bezierCurveTo(bx + bw * .3, w - h * .65, bx + bw, w - h * .35, bx + bw / 2, w); x.closePath(); x.fill(); }
  x.globalAlpha = 1; }));
const ROSA = (s, M) => { const a = M(0xff2d95, .3, .3), b = M(0xe01a82, .3, .35), c = M(0x8f1052, .3, .5); s(['steel', 'chrome', 'tan', 'camo', 'gold'], a); s(['poly', 'od', 'navy', 'wood'], b); s(['blued', 'black', 'red'], c); };
const FOGO = (s, M) => { const a = M(0xffffff, .15, .5, { map: fireT() }), b = M(0xb8b8b8, .15, .55, { map: fireT() }), c = M(0x6a2a1a, .2, .6, { map: fireT() }); s(['steel', 'chrome', 'tan', 'camo', 'gold'], a); s(['poly', 'od', 'navy', 'wood'], b); s(['blued', 'black', 'red'], c); };
const SOLID = (c1, c2, c3) => (s, M) => { const a = M(c1, .3, .3), b = M(c2, .3, .35), c = M(c3, .3, .5); s(['steel', 'chrome', 'tan', 'camo', 'gold'], a); s(['poly', 'od', 'navy', 'wood'], b); s(['blued', 'black', 'red'], c); };
const ROXO = SOLID(0xb388ff, 0x8c5cf5, 0x4a2a9a), BEBE = SOLID(0x89cff0, 0x5fb5e6, 0x2f7fae);
for (const k of Object.keys(SKIN_PACK)) if (SKIN_PACK[k].store) SKD[k] = k.startsWith('loja_rosa') ? ROSA : k.startsWith('loja_roxo') ? ROXO : k.startsWith('loja_bebe') ? BEBE : FOGO;
for (const k of Object.keys(SKIN_PACK)) if (SKIN_PACK[k].evt && !SKD[k]) { const { c1, c2 } = SKIN_PACK[k]; SKD[k] = (s, M) => { s(['steel', 'chrome', 'blued', 'black'], M(c1, .7, .3)); s(['poly', 'tan', 'od', 'navy', 'camo', 'wood'], M(c2, .25, .4)); s(['gold', 'red'], M(c2, .3, .25, { emissive: c2, emissiveIntensity: 1.2 })); }; }
function skinMapPack(k) { if (SKMAP[k]) return SKMAP[k]; const mp = new Map(), s = (ks, mat) => ks.forEach((x) => { if (MT[x]) mp.set(MT[x], mat); }); if (SKD[k]) SKD[k](s, Mt, mp); return (SKMAP[k] = mp); }
// animações dos materiais (rolar textura, pulsar, piscar, arco-íris): um relógio global só atualiza as skins em uso
const actives = new Set(); let running = false;
function startAnim() { if (running) return; running = true; let last = performance.now(); const f = (now) => { requestAnimationFrame(f); const dt = Math.min(0.1, (now - last) / 1000), t = now / 1000; last = now;
  for (const mp of actives) { if (mp.scroll) for (const [tx, dx, dy] of mp.scroll) { tx.offset.x += dx * dt; tx.offset.y += dy * dt; } if (mp.pulse) for (const [mt, b, a, s] of mp.pulse) mt.emissiveIntensity = b + a * Math.sin(t * s);
    if (mp.rb) for (const [mt, o] of mp.rb) { const h = (t * 0.12 + o) % 1; mt.color.setHSL(h, 0.85, 0.5); mt.emissive.setHSL(h, 0.9, 0.28); } if (mp.flick) for (const mt of mp.flick) mt.emissiveIntensity = 2 + Math.random() * 3; } }; requestAnimationFrame(f); }
const FXSPEC = { ember: { n: 30, c: [1, .55, .15], size: 0.04, mode: 'rise', speed: 0.7, rise: 0.9 }, fire: { n: 44, c: [1, .4, .08], size: 0.06, mode: 'rise', speed: 1.1, rise: 1.1 }, frost: { n: 40, c: [.8, .95, 1], size: 0.045, mode: 'fall', speed: 0.35, rise: 0.8 },
  spark: { n: 30, c: [1, 1, 1], size: 0.045, mode: 'spark', speed: 2 }, petal: { n: 34, c: [1, .7, .82], size: 0.05, mode: 'fall', speed: 0.4, rise: 0.9 }, bubble: { n: 30, c: [.5, 1, .2], size: 0.055, mode: 'rise', speed: 0.45, rise: 0.7 },
  elec: { n: 44, c: [.85, .95, 1], size: 0.05, mode: 'spark', speed: 3 }, void: { n: 44, c: [.65, .3, 1], size: 0.04, mode: 'twinkle', speed: 1 } };
const SPARKC = { gold: [1, .88, .54], frost: [.81, .96, 1], prism: [-1, 0, 0], holo: [.75, .99, 1], galaxy: [1, 1, 1] };
const ICE = new THREE.MeshStandardMaterial({ color: 0xcfefff, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.78, emissive: 0x4aa8ff, emissiveIntensity: 0.6 });
// Cristais de gelo NASCEM DA SUPERFÍCIE da arma: cada um é lançado por um raio (de cima, de baixo ou do lado) contra as peças e fica com a base ENCOSTADA no ponto atingido, apontando na direção da superfície (antes ficavam soltos no ar em volta da caixa da arma)
function crystals(model) {
  model.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(model), sz = b.getSize(new THREE.Vector3()), mat = ICE.clone(); model.userData.hasFx = true;
  const meshes = []; model.traverse((o) => { if (o.isMesh && !o.userData.fx && o.visible) meshes.push(o); }); if (!meshes.length) return;
  const rc = new THREE.Raycaster(), inv = new THREE.Matrix4().copy(model.matrixWorld).invert(), Y = new THREE.Vector3(0, 1, 0), org = new THREE.Vector3(), dir = new THREE.Vector3(), nrm = new THREE.Vector3(), pl = new THREE.Vector3();
  const want = lowQ() ? 8 : 16; let placed = 0;
  for (let tries = 0; tries < want * 10 && placed < want; tries++) {
    const rx = b.min.x + Math.random() * sz.x, ry = b.min.y + Math.random() * sz.y, rz = b.min.z + Math.random() * sz.z, w = Math.random();
    if (w < 0.55) { org.set(rx, b.max.y + 0.3, rz); dir.set(0, -1, 0); } else if (w < 0.72) { org.set(rx, b.min.y - 0.3, rz); dir.set(0, 1, 0); } else { const sd = Math.random() < 0.5 ? 1 : -1; org.set(rx, ry, sd > 0 ? b.max.z + 0.3 : b.min.z - 0.3); dir.set(0, 0, -sd); }
    rc.set(org, dir); const hit = rc.intersectObjects(meshes, false)[0]; if (!hit || !hit.face) continue;
    nrm.copy(hit.face.normal).transformDirection(hit.object.matrixWorld).transformDirection(inv); pl.copy(hit.point).applyMatrix4(inv);
    const h = 0.12 + Math.random() * 0.2, r = 0.025 + Math.random() * 0.03, c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), mat);
    c.userData.fx = 'mesh'; c.userData.baseOp = 0.78; c.quaternion.setFromUnitVectors(Y, nrm); c.position.copy(pl).addScaledVector(nrm, h * 0.5 - 0.025);   // a base entra um pouco na peça: encostado, sem frestas
    model.add(c); placed++;
  }
}
// Metal espelhado (Cromo Espelho etc.) precisa de um mapa de AMBIENTE para refletir; sem ele fica PRETO. O ambiente de verdade (o mesmo da cena do jogo) chega por setSkinEnv()
// assim que existe; enquanto isso um ambiente provisório de alto contraste (céu claro, horizonte, chão escuro e janelas brilhantes) evita o preto — e os materiais são TROCADOS pelo de verdade depois.
let REAL = null, FALL = null; const FB = [];
function fallbackEnv() {
  if (FALL) return FALL; const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.36, '#eaf2ff'); g.addColorStop(0.49, '#ffffff'); g.addColorStop(0.5, '#5d6875'); g.addColorStop(0.62, '#12161b'); g.addColorStop(1, '#05070a'); x.fillStyle = g; x.fillRect(0, 0, 512, 256);
  x.fillStyle = '#ffffff'; for (const [px, w] of [[20, 70], [140, 30], [230, 90], [370, 40], [450, 50]]) x.fillRect(px, 14, w, 70); x.fillStyle = '#0a0d12'; for (const px of [95, 330]) x.fillRect(px, 30, 14, 90);   // faixas escuras: dão o contraste de espelho
  FALL = new THREE.CanvasTexture(c); FALL.mapping = THREE.EquirectangularReflectionMapping; FALL.colorSpace = THREE.SRGBColorSpace; return FALL;
}
export function setSkinEnv(tex) { REAL = tex; for (const m of FB) { m.envMap = tex; m.envMapIntensity = 1; m.needsUpdate = true; } FB.length = 0; }
export function applyPack(model, skin, melee = false) {
  const S = SKIN_PACK[skin]; if (!S || skin === 'base') return false; const mp = skinMapPack(skin); if (!mp.size) return false;
  if (melee) {   // ARMA BRANCA: lâmina/guarda (metálico) pega o material de metal da skin; cabo/empunhadura pega o material de corpo da skin
    const first = (...keys) => keys.map((x) => mp.get(MT[x])).find(Boolean), metalM = first('steel', 'blued', 'chrome', 'gold', 'black'), bodyM = first('poly', 'wood', 'camo', 'tan', 'od', 'black', 'blued') || metalM;
    model.traverse((o) => { if (!o.isMesh || !o.material || (o.material.emissive?.getHex?.() && o.material.emissiveIntensity > 0.8) || o.material.transparent) return; const metallic = (o.material.metalness ?? 0) > 0.5; const m = metallic ? metalM : bodyM; if (m) o.material = m; else { o.material = o.material.clone(); o.material.color?.lerp(new THREE.Color(SKIN_PACK[skin]?.sw || '#888888'), 0.75); } });
  } else model.traverse((o) => { if (o.isMesh && mp.has(o.material)) o.material = mp.get(o.material); });
  for (const m of mp.values()) if (m?.isMeshStandardMaterial && m.metalness >= 0.8) { if (REAL) { if (m.envMap !== REAL) { m.envMap = REAL; m.envMapIntensity = 1; m.needsUpdate = true; } } else if (!m.envMap) { m.envMap = fallbackEnv(); m.envMapIntensity = 1; m.needsUpdate = true; FB.push(m); } }
  if (mp.scroll || mp.pulse || mp.rb || mp.flick) { actives.add(mp); startAnim(); }
  for (const f of S.fx) { if (f === 'crystal') crystals(model); else if (f === 'tube') model.userData.wantTubes = 0x00e5ff; else if (FXSPEC[f]) { const sp = { ...FXSPEC[f] }; if (f === 'spark' && SPARKC[skin]) sp.c = SPARKC[skin]; emitSpec(model, sp); } }
  return true;
}
