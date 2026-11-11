// TEXTURAS PROCEDURAIS DOS PERSONAGENS — vêm do "criador-de-personagem.html" (versão com texturas): tecido, couro/polímero, metal escovado, pele com poros,
// cabelo em fios, rosto pintado (órbitas, bochechas, veias do infectado), íris e camuflagem com sujeira/desgaste.
// LEVES: canvas pequenos, gerados UMA vez, guardados em cache e COMPARTILHADOS por todos os personagens (nenhuma textura por jogador).
import * as THREE from 'three';
const ANI = 4, PT = {};
export const rndSeed = (n) => () => (n = (n * 16807) % 2147483647) / 2147483647;
function pTex(key, size, rep, srgb, draw) {
  if (PT[key]) return PT[key];
  const c = document.createElement('canvas'), [cw, ch] = Array.isArray(size) ? size : [size, size]; c.width = cw; c.height = ch; draw(c.getContext('2d'), cw, ch);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = ANI;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return (PT[key] = t);
}
// desenha também nas bordas opostas, para a textura ladrilhar sem emenda
function wrapDraw(size, x, y, r, fn) { for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) { const px = x + ox * size, py = y + oy * size; if (px + r < 0 || py + r < 0 || px - r > size || py - r > size) continue; fn(px, py); } }
// tecido: trama + sarja (fino) + dobras/amassados (médio, aparece até de longe)
export const fabricBump = () => pTex('fab', 192, 3, false, (g, n) => {
  const rnd = rndSeed(7), im = g.createImageData(n, n), d = im.data, P = Math.PI * 2;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const tw = Math.sin((x + y) * P / 8) * .5 + Math.sin(x * P / 4) * Math.sin(y * P / 4) * .25, v = 128 + tw * 34 + (rnd() - .5) * 26, i = (y * n + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(im, 0, 0); g.lineCap = 'round';
  for (let i = 0; i < 34; i++) {
    const x = rnd() * n, y = rnd() * n, l = 22 + rnd() * 52, a = rnd() * Math.PI, w = 3 + rnd() * 5, cx = Math.cos(a) * l / 2, cy = Math.sin(a) * l / 2, qx = Math.sin(a) * l * .2, qy = -Math.cos(a) * l * .2;
    wrapDraw(n, x, y, l, (px, py) => {
      g.lineWidth = w; g.globalAlpha = .17;
      g.strokeStyle = '#000'; g.beginPath(); g.moveTo(px - cx, py - cy); g.quadraticCurveTo(px + qx, py + qy, px + cx, py + cy); g.stroke();
      g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(px - cx + 3, py - cy + 3); g.quadraticCurveTo(px + qx + 3, py + qy + 3, px + cx + 3, py + cy + 3); g.stroke();
    });
  }
  g.globalAlpha = 1;
});
// couro / polímero: grão fino
export const grainBump = () => pTex('grain', 96, 4, false, (g, n) => {
  const rnd = rndSeed(11); g.fillStyle = '#808080'; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 400; i++) { const x = rnd() * n, y = rnd() * n, r = 1 + rnd() * 2.4, dk = rnd() < .6; wrapDraw(n, x, y, r, (px, py) => { g.fillStyle = dk ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.2)'; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); }); }
});
// metal: riscos de escovado (variação de brilho)
export const metalRough = () => pTex('metal', 96, 3, false, (g, n) => {
  const rnd = rndSeed(5); g.fillStyle = '#b8b8b8'; g.fillRect(0, 0, n, n); g.lineWidth = 1;
  for (let i = 0; i < 180; i++) { const x = rnd() * n, y = rnd() * n, l = 10 + rnd() * 40, v = 150 + rnd() * 105 | 0; g.strokeStyle = 'rgba(' + v + ',' + v + ',' + v + ',.5)'; wrapDraw(n, x, y, l / 2, (px, py) => { g.beginPath(); g.moveTo(px - l / 2, py); g.lineTo(px + l / 2, py); g.stroke(); }); }
});
// pele: manchas suaves de tom/vermelhidão + poros (cor) e relevo fino (bump)
export const skinMap = () => pTex('skin', 192, 2, true, (g, n) => {
  const rnd = rndSeed(3); g.fillStyle = '#fbfbfb'; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 70; i++) { const x = rnd() * n, y = rnd() * n, r = 10 + rnd() * 24, c = i % 3 ? '200,110,100' : '150,120,95'; wrapDraw(n, x, y, r, (px, py) => { const gr = g.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, 'rgba(' + c + ',.10)'); gr.addColorStop(1, 'rgba(' + c + ',0)'); g.fillStyle = gr; g.fillRect(px - r, py - r, r * 2, r * 2); }); }
  for (let i = 0; i < 320; i++) { const x = rnd() * n, y = rnd() * n, r = .5 + rnd() * .9; wrapDraw(n, x, y, r, (px, py) => { g.fillStyle = 'rgba(90,55,45,.12)'; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); }); }
 for(let i=0;i<120;i++){const x=rnd()*n,y=rnd()*n,r=.9+rnd()*1.6;wrapDraw(n,x,y,r,(px,py)=>{g.fillStyle='rgba(120,70,50,.10)';g.beginPath();g.arc(px,py,r,0,7);g.fill()})}   // sardas
 g.lineWidth=.8;for(let i=0;i<14;i++){const x=rnd()*n,y=rnd()*n,l=24+rnd()*40,a=rnd()*Math.PI;wrapDraw(n,x,y,l,(px,py)=>{g.strokeStyle='rgba(110,130,170,.06)';g.beginPath();g.moveTo(px,py);g.quadraticCurveTo(px+Math.cos(a)*l*.5+6,py+Math.sin(a)*l*.5-6,px+Math.cos(a)*l,py+Math.sin(a)*l);g.stroke()})}   // veias finas
});
export const skinBump = () => pTex('skinb', 192, 2, false, (g, n) => {
  const rnd = rndSeed(9), im = g.createImageData(n, n), d = im.data;
  for (let i = 0; i < n * n; i++) { const v = 128 + (rnd() - .5) * 30; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0);
  for (let i = 0; i < 480; i++) { const x = rnd() * n, y = rnd() * n, r = .6 + rnd() * 1.1; wrapDraw(n, x, y, r, (px, py) => { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); }); }
});
// cabelo: fios em linhas (a esfera do cabelo faz os fios partirem do topo da cabeça)
export const hairMap = () => pTex('hair', 96, 1, true, (g, n) => {
  const rnd = rndSeed(21);
  for (let x = 0; x < n; x++) { const v = 170 + rnd() * 85 | 0; g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; g.fillRect(x, 0, 1, n); }
  for (let i = 0; i < 12; i++) { const x = rnd() * n, w = 3 + rnd() * 6; g.fillStyle = rnd() < .5 ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.2)'; for (const ox of [-n, 0, n]) g.fillRect(x + ox - w / 2, 0, w, n); }
});
// rosto pintado: sombras de órbita, olheiras, bochechas, sulcos, cantos da boca (e veias/cavidades no infectado).
// A cabeça e a mandíbula são 2 esferas, então cada uma ganha sua própria textura, na projeção esférica da própria esfera.
const FW = 512, FH = 256, PXR = FW / (Math.PI * 2);
export function faceMap(zom, fem, part, tat) {
  const jx = fem ? .72 : .8, jaw = part === 'jaw';
  return pTex('face' + part + (zom ? 'z' : 'n') + (fem ? 'f' : 'm') + (tat ? 't' : ''), [FW, FH], 1, true, (g, W, H) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
    const rnd = rndSeed(33 + (zom ? 1 : 0) + (fem ? 2 : 0) + (jaw ? 4 : 0));
    const proj = (xn, yn) => {
      let a = xn, b = yn; if (jaw) { a = xn / jx; b = (yn + .5) / .62; }
      const q = 1 - a * a - b * b; if (q <= .02) return null;
      const zn = Math.sqrt(q), sT = Math.sqrt(1 - b * b);
      return { cx: Math.atan2(zn, -a) / (Math.PI * 2) * W, cy: Math.acos(b) / Math.PI * H, kx: (jaw ? 1 / jx : 1) / zn * PXR, ky: (jaw ? 1 / .62 : 1) / Math.max(.2, sT) * PXR };
    };
    const blob = (xn, yn, rx, ry, col, al) => {
      const p = proj(xn, yn); if (!p) return; const px = rx * p.kx, py = ry * p.ky;
      for (const ox of [0, W, -W]) { g.save(); g.translate(p.cx + ox, p.cy); g.scale(1, py / px); const gr = g.createRadialGradient(0, 0, 0, 0, 0, px); gr.addColorStop(0, 'rgba(' + col + ',' + al + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(-px, -px, px * 2, px * 2); g.restore(); }
    };
    const sym = (xn, yn, rx, ry, col, al) => { blob(xn, yn, rx, ry, col, al); blob(-xn, yn, rx, ry, col, al); };
    const line = (pts, col, al, w) => { const P = pts.map((q) => proj(q[0], q[1])); if (P.some((q) => !q)) return; g.strokeStyle = 'rgba(' + col + ',' + al + ')'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = Math.max(1, w * P[0].kx); g.beginPath(); g.moveTo(P[0].cx, P[0].cy); for (let i = 1; i < P.length; i++) g.lineTo(P[i].cx, P[i].cy); g.stroke(); };
    for (let i = 0; i < 34; i++) blob(rnd() * 1.8 - .9, rnd() * 2 - 1.1, .26, .2, i % 2 ? '200,110,100' : '150,120,95', .07);   // tom desigual
    if (!zom) {
      sym(.52, -.26, .3, .2, '225,95,105', fem ? .32 : .18);   // bochechas
      sym(.4, .1, .34, .2, '110,70,80', .24);                  // órbitas
      sym(.4, -.04, .26, .08, '105,75,100', .2);               // olheiras
      sym(.42, .33, .34, .08, '75,55,50', .15);                // arcada
      sym(.13, -.2, .07, .14, '90,50,45', .13);                // lateral do nariz
      sym(.8, .3, .18, .4, '90,60,50', .13);                   // têmporas
      sym(.22, -.5, .07, .05, '80,40,40', .27);                // cantos da boca
      sym(.62, -.62, .3, .3, '90,60,55', .11);                 // linha da mandíbula
      blob(0, -.86, .45, .11, '90,60,50', .15);                // sob o lábio
      for (const sd of [1, -1]) line([[sd * .17, -.3], [sd * .25, -.38], [sd * .28, -.5]], '90,55,50', .18, .022);   // sulcos nasolabiais
    } else {
      sym(.4, .08, .38, .25, '30,15,40', .62);                 // órbitas fundas
      sym(.4, -.06, .28, .09, '70,40,80', .45);
      sym(.55, -.36, .32, .3, '50,40,60', .36);                // bochechas encovadas
      sym(.22, -.5, .08, .06, '40,20,25', .4);
      blob(0, -.86, .45, .12, '50,35,40', .22);
      sym(.42, .33, .34, .09, '50,35,45', .25);
      for (let i = 0; i < 16; i++) { const sd = i % 2 ? 1 : -1, x0 = sd * (.3 + rnd() * .2), y0 = .1 + rnd() * .15; line([[x0, y0], [x0 + sd * (.1 + rnd() * .15), y0 - .2 - rnd() * .15], [x0 + sd * (.15 + rnd() * .25), y0 - .5 - rnd() * .3]], '55,70,115', .32, .012); }   // veias
    }
  if(tat&&!jaw){   // tatuagens do rosto: cruz na bochecha, três pontos, lágrima e riscos na têmpora
   const K='30,38,60';
   line([[.62,-.02],[.62,-.2]],K,.88,.034);line([[.54,-.09],[.7,-.09]],K,.88,.034);blob(.62,-.09,.07,.07,K,.1);
   for(let i=0;i<3;i++)blob(-.64,-.06-i*.075,.028,.028,K,.92);
   blob(-.43,-.17,.022,.034,K,.92);line([[-.43,-.12],[-.43,-.15]],K,.8,.014);
   for(let i=0;i<3;i++)line([[.68,.26+i*.06],[.78,.31+i*.06]],K,.82,.018);
  }
    for (let i = 0; i < 1000; i++) { const x = rnd() * W, y = rnd() * H, r = .5 + rnd() * .7; g.fillStyle = 'rgba(90,55,45,.09)'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }   // poros
  });
}
// íris: fibras, colarete, anel escuro (límbico) e pupila — pintada na projeção esférica da esfera do olho
export const irisMap = () => pTex('iris', [192, 96], 1, true, (g, W, H) => {
  const im = g.createImageData(W, H), d = im.data, rnd = rndSeed(77), fib = []; for (let i = 0; i < 64; i++) fib.push(.75 + rnd() * .25);
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const ph = (px + .5) / W * Math.PI * 2, th = (py + .5) / H * Math.PI, x = -Math.cos(ph) * Math.sin(th), y = Math.cos(th), z = Math.sin(ph) * Math.sin(th);
    const t = Math.acos(Math.max(-1, Math.min(1, z))) / 1.15; let v;
    if (t > 1) v = .35;
    else { const f = fib[((Math.atan2(y, x) + Math.PI) / (Math.PI * 2) * 64 | 0) % 64]; v = (.78 + .22 * (1 - t)) * (.8 + .2 * f); v *= 1 + .18 * Math.exp(-(((t - .38) / .07) ** 2)); if (t < .16) v *= .25 + .75 * (t / .16); if (t > .78) v *= 1 - (t - .78) / .22 * .7; }
    const c = Math.max(0, Math.min(255, v * 255)) | 0, i = (py * W + px) * 4; d[i] = d[i + 1] = d[i + 2] = c; d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
});
// camuflagem: manchas + pontinhos + sujeira + desgaste + fio do tecido (rip-stop)
const CAMO = { woodland: ['#4b5a32', '#2f3a22', '#6b5a3a', '#1f2417'], desert: ['#b99c6b', '#9a7f52', '#d2bd91', '#7a6340'], urban: ['#6f757a', '#4c5156', '#8e949a', '#2f3236'], olive: ['#4a5240', '#3b4232', '#59614b', '#2e3328'], black: ['#1b1d20', '#25282c', '#141517', '#2d3135'], snow: ['#d8dde0', '#b9c1c6', '#eef1f2', '#8f979d'] };
const camoCache = {};
export function camoTex(n, pal) {
  if (camoCache[n]) return camoCache[n];
  const N = 192, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), p = pal || CAMO[n] || CAMO.woodland;
  g.fillStyle = p[0]; g.fillRect(0, 0, N, N); let seed = n.length * 977 + 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) { g.fillStyle = p[1 + i % 3]; const x = rnd() * N, y = rnd() * N, rx = 7 + rnd() * 20, ry = 4 + rnd() * 11, a = rnd() * 3; wrapDraw(N, x, y, rx + 2, (px, py) => { g.beginPath(); g.ellipse(px, py, rx, ry, a, 0, 7); g.fill(); }); }
  g.globalAlpha = .8;
  for (let i = 0; i < 200; i++) { g.fillStyle = p[1 + i % 3]; const x = rnd() * N, y = rnd() * N, r = 1.5 + rnd() * 3.5; wrapDraw(N, x, y, r, (px, py) => { g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); }); }
  g.globalAlpha = .11; g.fillStyle = '#2a2016';   // sujeira
  for (let i = 0; i < 40; i++) { const x = rnd() * N, y = rnd() * N, r = 10 + rnd() * 20; wrapDraw(N, x, y, r, (px, py) => { g.beginPath(); g.ellipse(px, py, r, r * .7, rnd() * 3, 0, 7); g.fill(); }); }
  g.globalAlpha = .09; g.fillStyle = '#e2dac2';   // desgaste claro
  for (let i = 0; i < 28; i++) { const x = rnd() * N, y = rnd() * N, r = 5 + rnd() * 10; wrapDraw(N, x, y, r, (px, py) => { g.beginPath(); g.ellipse(px, py, r, r * .5, rnd() * 3, 0, 7); g.fill(); }); }
  g.globalAlpha = .07; g.fillStyle = '#000';
  for (let i = 0; i < N; i += 4) { g.fillRect(i, 0, 1, N); g.fillRect(0, i, N, 1); }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1.5, 1.5); t.anisotropy = ANI;
  return (camoCache[n] = t);
}

// ---------- texturas de COR para roupas/equipamento + TATUAGENS (do criador-de-personagem novo) ----------
export const knitMap=()=>pTex('knitA',128,5,true,(g,n)=>{
 const rnd=rndSeed(21),im=g.createImageData(n,n),d=im.data;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const v=238+12*Math.sin((y+Math.abs(x%4-1.5)*1.3)*Math.PI/2)+(rnd()-.5)*9,i=(y*n+x)*4;
  d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}
 g.putImageData(im,0,0);
 g.fillStyle='rgba(0,0,0,.05)';for(let x=0;x<n;x+=16)g.fillRect(x,0,2,n);   // canelado
});
// jeans: sarja diagonal + fios soltos + desbotado nos joelhos/costuras
export const denimMap=()=>pTex('denimA',128,4,true,(g,n)=>{
 const rnd=rndSeed(33),im=g.createImageData(n,n),d=im.data;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const tw=((x+y)%6<3)?9:-9,wp=(x%2)?-5:5,v=232+tw+wp+(rnd()-.5)*12,i=(y*n+x)*4;
  d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}
 g.putImageData(im,0,0);
 for(let i=0;i<240;i++){const x=rnd()*n,y=rnd()*n,w=2+rnd()*6;g.fillStyle=rnd()<.7?'rgba(255,255,255,.35)':'rgba(0,0,0,.18)';wrapDraw(n,x,y,w,(px,py)=>g.fillRect(px,py,w,1))}
 for(let i=0;i<10;i++){const x=rnd()*n,y=rnd()*n,r=14+rnd()*22;g.fillStyle=rnd()<.6?'rgba(255,255,255,.06)':'rgba(0,0,0,.045)';wrapDraw(n,x,y,r,(px,py)=>{g.beginPath();g.ellipse(px,py,r,r*.7,rnd()*3,0,7);g.fill()})}
});
// couro: grão com rugas e marcas de uso
export const leatherMap=()=>pTex('leatherA',128,4,true,(g,n)=>{
 const rnd=rndSeed(45);g.fillStyle='#e6e6e6';g.fillRect(0,0,n,n);
 for(let i=0;i<700;i++){const x=rnd()*n,y=rnd()*n,r=1.6+rnd()*2.6;
  wrapDraw(n,x,y,r+1,(px,py)=>{g.fillStyle='rgba(0,0,0,.04)';g.beginPath();g.arc(px,py,r,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.11)';g.lineWidth=.9;g.stroke()})}
 g.lineCap='round';
 for(let i=0;i<26;i++){const x=rnd()*n,y=rnd()*n,l=18+rnd()*40,a=rnd()*Math.PI,cx=Math.cos(a)*l/2,cy=Math.sin(a)*l/2;
  wrapDraw(n,x,y,l,(px,py)=>{g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=1.3;g.beginPath();g.moveTo(px-cx,py-cy);g.quadraticCurveTo(px+cy*.3,py-cx*.3,px+cx,py+cy);g.stroke()})}
 for(let i=0;i<12;i++){const x=rnd()*n,y=rnd()*n,l=10+rnd()*26,a=rnd()*Math.PI;
  wrapDraw(n,x,y,l,(px,py)=>{g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1.6;g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);g.stroke()})}
});
// cordura + tiras MOLLE (colete tático)
export const molleMap=()=>pTex('molleA',256,1,true,(g,n)=>{
 g.fillStyle='#e4e4e2';g.fillRect(0,0,n,n);
 g.fillStyle='rgba(0,0,0,.06)';for(let i=0;i<n;i+=3){g.fillRect(i,0,1,n);g.fillRect(0,i,n,1)}   // rip-stop
 for(let ry=10;ry<n-12;ry+=28){
  g.fillStyle='#f2f2f0';g.fillRect(0,ry,n,13);
  g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,ry,n,1);g.fillRect(0,ry+12,n,1);
  for(let x=6;x<n;x+=22){g.fillStyle='rgba(0,0,0,.4)';g.fillRect(x,ry+1,2,11);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x+10,ry+1,1,11)}
 }
 const rnd=rndSeed(57);for(let i=0;i<40;i++){const x=rnd()*n,y=rnd()*n,r=6+rnd()*16;g.fillStyle='rgba(0,0,0,.05)';g.beginPath();g.ellipse(x,y,r,r*.6,rnd()*3,0,7);g.fill()}
});
// metal escovado: riscos finos na mesma direção + pequenos pontos de desgaste
export const brushedMap=()=>pTex('brushA',128,3,true,(g,n)=>{
 const rnd=rndSeed(63),im=g.createImageData(n,n),d=im.data;
 for(let y=0;y<n;y++){const row=212+(rnd()-.5)*34;
  for(let x=0;x<n;x++){const v=row+(rnd()-.5)*12,i=(y*n+x)*4;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}}
 g.putImageData(im,0,0);
 for(let i=0;i<46;i++){const x=rnd()*n,y=rnd()*n,l=12+rnd()*50,a=(rnd()-.5)*.5;
  wrapDraw(n,x,y,l,(px,py)=>{g.strokeStyle=rnd()<.5?'rgba(255,255,255,.3)':'rgba(0,0,0,.2)';g.lineWidth=.8;g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);g.stroke()})}
 for(let i=0;i<30;i++){const x=rnd()*n,y=rnd()*n,r=.8+rnd()*1.6;g.fillStyle='rgba(0,0,0,.25)';wrapDraw(n,x,y,r,(px,py)=>{g.beginPath();g.arc(px,py,r,0,7);g.fill()})}
});
// tecido comum: trama simples com fios irregulares
export const weaveMap=()=>pTex('weaveA',128,4,true,(g,n)=>{
 const rnd=rndSeed(71),im=g.createImageData(n,n),d=im.data;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const v=238+(((x>>1)+(y>>1))%2?6:-6)+(rnd()-.5)*8,i=(y*n+x)*4;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}
 g.putImageData(im,0,0);
 for(let i=0;i<60;i++){const x=rnd()*n,y=rnd()*n,w=3+rnd()*9;g.fillStyle=rnd()<.5?'rgba(255,255,255,.28)':'rgba(0,0,0,.12)';wrapDraw(n,x,y,w,(px,py)=>g.fillRect(px,py,w,1))}
});
// ---------- tatuagens de verdade (desenhadas em textura transparente, em cima da pele) ----------
// u dá a volta no braço (frente = .25, lado de fora do braço L = .5 / do R = 0), v vai do ombro (topo da imagem) ao pulso
const TAT_INK='24,34,52';
const tatStroke=(g,w,al)=>{g.strokeStyle='rgba('+TAT_INK+','+al+')';g.lineWidth=w;g.lineCap='round';g.lineJoin='round'};
const tatFill=(g,al)=>{g.fillStyle='rgba('+TAT_INK+','+al+')'};
// cada traço é feito 2x: um halo largo e suave + o traço firme (dá o aspecto de tinta que "assenta" na pele)
function tatDo(g,fn){g.save();fn(g,1);g.restore()}
const tatLine=(g,pts,w,close)=>{for(const [ww,al] of [[w+2.2,.2],[w,.86]]){tatStroke(g,ww,al);g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);if(close)g.closePath();g.stroke()}};
const tatPoly=(g,pts)=>{for(const [w,al] of [[2.4,.22],[0,.88]]){tatFill(g,al);g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fill();if(w){tatStroke(g,w,.22);g.stroke()}}};
const tatDot=(g,x,y,r)=>{tatFill(g,.22);g.beginPath();g.arc(x,y,r+1.2,0,7);g.fill();tatFill(g,.88);g.beginPath();g.arc(x,y,r,0,7);g.fill()};
const tatRing=(g,x,y,r,w)=>{for(const [ww,al] of [[w+2,.2],[w,.86]]){tatStroke(g,ww,al);g.beginPath();g.arc(x,y,r,0,7);g.stroke()}};
const tatStar=(g,x,y,R,r0)=>{const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r0:R;p.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr])}tatPoly(g,p)};
// faixa tribal que fecha o círculo do braço sem emenda
function tatBand(g,W,y,h,n){
 tatLine(g,[[0,y],[W,y]],3.2);tatLine(g,[[0,y+4.5],[W,y+4.5]],1.2);
 const sw=W/n;for(let i=0;i<n;i++){const x=i*sw;tatPoly(g,[[x+1.5,y+7],[x+sw-1.5,y+7],[x+sw*.5,y+7+h]]);tatPoly(g,[[x+sw*.5-3,y+7],[x+sw*.5+3,y+7],[x+sw*.5,y+7+h*.45]].map(p=>[p[0],p[1]]))}
}
function tatSun(g,cx,cy,R){
 const n=18;for(let i=0;i<n;i++){const a=i*Math.PI*2/n,b=a+Math.PI/n*.55,c=a-Math.PI/n*.55;
  tatPoly(g,[[cx+Math.cos(c)*(R*.62),cy+Math.sin(c)*(R*.62)],[cx+Math.cos(a)*R,cy+Math.sin(a)*R],[cx+Math.cos(b)*(R*.62),cy+Math.sin(b)*(R*.62)]])}
 tatRing(g,cx,cy,R*.55,2.4);tatRing(g,cx,cy,R*.36,1.4);tatDot(g,cx,cy,R*.14);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;tatDot(g,cx+Math.cos(a)*R*.45,cy+Math.sin(a)*R*.45,1.2)}
}
function tatSnake(g,cx,y0,y1,A){
 const pts=[];const N=46;for(let i=0;i<=N;i++){const t=i/N;pts.push([cx+Math.sin(t*Math.PI*3.2)*A*(1-.3*t),y0+(y1-y0)*t,Math.sin(Math.PI*Math.min(1,t*1.12+.02))*5.2+.9])}
 for(const [e,al] of [[1.6,.22],[0,.9]])for(const p of pts){tatFill(g,al);g.beginPath();g.arc(p[0],p[1],p[2]+e,0,7);g.fill()}
 // escamas (riscos claros recortados)
 g.save();g.globalCompositeOperation='destination-out';for(let i=3;i<N-2;i+=2){const p=pts[i];g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=.9;g.beginPath();g.arc(p[0],p[1],Math.max(1,p[2]*.55),.2,Math.PI-.2);g.stroke()}g.restore();
 // cabeça + língua
 const h=pts[0];tatFill(g,.9);g.beginPath();g.ellipse(h[0],h[1]-5,7.5,9.5,0,0,7);g.fill();
 g.save();g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,1)';g.beginPath();g.arc(h[0]-3,h[1]-7,1.4,0,7);g.arc(h[0]+3,h[1]-7,1.4,0,7);g.fill();g.restore();
 tatLine(g,[[h[0],h[1]-13],[h[0],h[1]-20],[h[0]-3,h[1]-24]],1.2);tatLine(g,[[h[0],h[1]-20],[h[0]+3,h[1]-24]],1.2);
}
function tatRosary(g,cx,y0,y1){
 const pts=[];const N=11;for(let i=0;i<=N;i++){const t=i/N;pts.push([cx+Math.sin(t*Math.PI*1.4)*12,y0+(y1-y0)*t])}
 tatLine(g,pts,1.1);for(const p of pts)tatRing(g,p[0],p[1],4.2,1.6),tatDot(g,p[0],p[1],1.4);
 const l=pts[N];
 tatLine(g,[[l[0],l[1]+6],[l[0],l[1]+44]],3.6);tatLine(g,[[l[0]-13,l[1]+19],[l[0]+13,l[1]+19]],3.6);
 for(const [dx,dy] of [[0,6],[0,44],[-13,19],[13,19]])tatDot(g,l[0]+dx,l[1]+dy,3);
 for(let i=0;i<8;i++){const a=i*Math.PI/4+.4;tatLine(g,[[l[0]+Math.cos(a)*10,l[1]+25+Math.sin(a)*10],[l[0]+Math.cos(a)*20,l[1]+25+Math.sin(a)*20]],1)}
}
function tatRose(g,cx,cy,R){   // rosa-dos-ventos
 tatRing(g,cx,cy,R,2);tatRing(g,cx,cy,R*.62,1.2);
 for(let i=0;i<4;i++){const a=i*Math.PI/2-Math.PI/2,L=R*1.55;
  const P=(r,t)=>[cx+Math.cos(a+t)*r,cy+Math.sin(a+t)*r];tatPoly(g,[P(L,0),P(R*.2,.42),P(R*.2,-.42)])}
 for(let i=0;i<4;i++){const a=i*Math.PI/2-Math.PI/4,L=R*.98;
  const P=(r,t)=>[cx+Math.cos(a+t)*r,cy+Math.sin(a+t)*r];tatPoly(g,[P(L,0),P(R*.18,.55),P(R*.18,-.55)])}
 tatDot(g,cx,cy,R*.14);
}
// 4 peças: braço (L/R) e antebraço (L/R). Origem u: arte centrada na quina frente/fora de cada braço
function tatSkull(g,cx,cy,R){
 tatRing(g,cx,cy,R,2);tatLine(g,[[cx-R*.55,cy+R*.8],[cx-R*.55,cy+R*1.35],[cx+R*.55,cy+R*1.35],[cx+R*.55,cy+R*.8]],1.7);
 for(const k of [-1,1])tatDot(g,cx+k*R*.38,cy,R*.24);
 tatPoly(g,[[cx,cy+R*.28],[cx-R*.12,cy+R*.55],[cx+R*.12,cy+R*.55]]);
 for(let i=-2;i<=2;i++)tatLine(g,[[cx+i*R*.2,cy+R*1.05],[cx+i*R*.2,cy+R*1.35]],1);
}
function tatDagger(g,cx,y0,y1){
 const gy=y0+(y1-y0)*.3;tatPoly(g,[[cx-4.5,gy],[cx+4.5,gy],[cx,y1]]);
 tatLine(g,[[cx-12,gy],[cx+12,gy]],3.2);tatLine(g,[[cx,y0+8],[cx,gy]],3.6);tatDot(g,cx,y0+4,4);
}
function tatCrown(g,cx,cy,w){
 tatLine(g,[[cx-w,cy+10],[cx-w,cy-6],[cx-w/2,cy+3],[cx,cy-10],[cx+w/2,cy+3],[cx+w,cy-6],[cx+w,cy+10]],2.2,true);
 tatDot(g,cx-w,cy-8,2.4);tatDot(g,cx,cy-12,2.4);tatDot(g,cx+w,cy-8,2.4);tatLine(g,[[cx-w,cy+14],[cx+w,cy+14]],2.6);
}
function tatCross(g,cx,cy,s){
 tatPoly(g,[[cx-s*.18,cy-s],[cx+s*.18,cy-s],[cx+s*.18,cy-s*.3],[cx+s*.6,cy-s*.3],[cx+s*.6,cy+s*.05],[cx+s*.18,cy+s*.05],[cx+s*.18,cy+s],[cx-s*.18,cy+s],[cx-s*.18,cy+s*.05],[cx-s*.6,cy+s*.05],[cx-s*.6,cy-s*.3],[cx-s*.18,cy-s*.3]]);
}
function tatFlames(g,W,y,h,n){const sw=W/n;for(let i=0;i<n;i++){const x=i*sw;tatPoly(g,[[x,y],[x+sw*.25,y-h*.55],[x+sw*.5,y-h],[x+sw*.75,y-h*.5],[x+sw,y]])}}
function tatText(g,t,x,y,size,rot){g.save();g.translate(x,y);g.rotate(rot);g.font='italic 800 '+size+'px Georgia,"Times New Roman",serif';g.textAlign='center';g.textBaseline='middle';
 for(const [dx,al] of [[1.2,.22],[0,.9]]){g.fillStyle='rgba('+TAT_INK+','+al+')';g.fillText(t,dx,dx)}g.restore()}
// camada extra: mais desenhos (nos flancos e nos espaços livres), por cima dos desenhos originais
function tatExtra(g,W,kind,sd){
 const cu=(sd===1?.38:.12)*W,wrap=fn=>{for(const o of [-W,0,W]){g.save();g.translate(o,0);fn();g.restore()}},R=-Math.PI/2;
 if(kind==='up'){
  if(sd===1)wrap(()=>{tatCrown(g,cu,62,13);for(const i of [-1,0,1])tatStar(g,cu+i*24,190,6,2.6);tatDagger(g,cu-62,60,200);tatDagger(g,cu+62,60,200)});
  else wrap(()=>{tatSkull(g,cu,52,15);tatDagger(g,cu-62,56,206);tatDagger(g,cu+62,56,206)});
  tatFlames(g,W,252,22,10);
 }else if(kind==='fo'){
  if(sd===1)wrap(()=>{tatCross(g,cu,168,16);tatText(g,'DEUS É FIEL',cu+60,86,20,R);tatText(g,'FAMÍLIA',cu-60,100,18,R);tatSkull(g,cu,222,12)});
  else wrap(()=>{tatDagger(g,cu-60,30,200);tatText(g,'LEALDADE',cu+60,110,18,R);tatCrown(g,cu,200,13);tatCross(g,cu,236,10)});
 }else if(kind==='th'){
  wrap(()=>{tatDagger(g,cu-62,40,230);tatDagger(g,cu+62,40,230)});
  tatFlames(g,W,252,22,10);
 }else{
  wrap(()=>{tatCross(g,cu-60,110,14);tatCross(g,cu+60,110,14);tatSkull(g,cu,232,9)});
  tatFlames(g,W,252,18,10);
 }
}
function tatDraw(g,W,H,kind,sd){tatDraw0(g,W,H,kind,sd);tatExtra(g,W,kind,sd)}
function tatDraw0(g,W,H,kind,sd){
 const cu=(sd===1?.38:.12)*W,wrap=fn=>{for(const o of [-W,0,W]){g.save();g.translate(o,0);fn();g.restore()}};
 if(kind==='th'){
  tatBand(g,W,10,18,14);
  if(sd===1){wrap(()=>{tatSun(g,cu,96,46);tatRosary(g,cu,150,244)})}
  else{wrap(()=>{tatSnake(g,cu,60,236,22);tatRose(g,cu,40,18)})}
 }else if(kind==='sh'){
  if(sd===1){wrap(()=>{tatRosary(g,cu,20,140);tatRose(g,cu,190,24)})}
  else{wrap(()=>{tatSnake(g,cu,24,170,18);tatStar(g,cu-26,206,7,3);tatStar(g,cu,206,7,3);tatStar(g,cu+26,206,7,3)})}
 }else if(kind==='up'){
  tatBand(g,W,12,20,14);
  if(sd===1){wrap(()=>tatSun(g,cu,126,40));tatLine(g,[[0,214],[W,214]],2.4);tatLine(g,[[0,220],[W,220]],1)}
  else{wrap(()=>tatSnake(g,cu,76,206,19));tatLine(g,[[0,226],[W,226]],2.4)}
 }else{
  if(sd===1){wrap(()=>tatRosary(g,cu,26,128));}
  else{
   wrap(()=>{
    g.save();g.translate(cu,62);g.font='italic 800 58px Georgia,"Times New Roman",serif';g.textAlign='center';g.textBaseline='middle';
    for(const [dx,dy,al] of [[1.4,1.4,.22],[0,0,.9]]){g.fillStyle='rgba('+TAT_INK+','+al+')';g.fillText('FÉ',dx,dy)}g.restore();
    tatLine(g,[[cu-34,98],[cu+34,98]],1.6);
    tatStar(g,cu-26,112,6,2.6);tatStar(g,cu,112,6,2.6);tatStar(g,cu+26,112,6,2.6);
    tatRose(g,cu,150,15)});
  }
 }
}
const tatTex=(kind,sd)=>pTex('tat'+kind+sd,[256,256],1,true,(g,W,H)=>{g.clearRect(0,0,W,H);tatDraw(g,W,H,kind,sd)});
export const tatMat=(kind,sd)=>new THREE.MeshStandardMaterial({map:tatTex(kind,sd),transparent:true,depthWrite:false,roughness:.55,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
