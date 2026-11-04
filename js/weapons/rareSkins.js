import * as THREE from 'three';
import { MT } from './arsenalModels.js';
import { effective } from '../core/graphics.js';
// GRÁFICO BAIXO / MUITO BAIXO: a skin mantém o visual (cores, brilho, partículas) mas com o shader mais leve (2 camadas de ruído em vez de 4) e 40% das partículas
export const lowQ = () => { try { return (effective().particles ?? 1) <= 0.5; } catch { return false; } };
// SKINS RARAS DE ARMA — efeitos de verdade (shader animado no próprio corpo da arma + partículas): lava e fogo, raios, gelo, palhaço, tóxico, arco-íris, galáxia, dragão.
// Só VISUAL: não muda dano, disparo nem a forma da arma. Todos os jogadores veem o efeito na arma de quem usa.
export const RARE_FX = ['plasma', 'clown', 'rainbow'];   // as demais raras vêm do arsenal.html (skinsPack.js)
const uT = { value: 0 }; let ticking = false;
const tick = () => { uT.value = performance.now() / 1000; requestAnimationFrame(tick); };
const GLSL = `
float h31(vec3 p){ p=fract(p*0.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f); return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=.5,s=0.; for(int i=0;i<4;i++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }
vec3 hsv(float h,float s,float v){ vec3 k=clamp(abs(fract(h+vec3(0.,.6667,.3333))*6.-3.)-1.,0.,1.); return v*mix(vec3(1.),k,s); }
`;
// cada efeito define: fxAlbedo(p,t,base) e fxEmit(p,t)
const EFFECTS = {
  plasma: { // TEMPESTADE: aço escuro com RAIOS amarelos/azuis correndo pela arma
    albedo: 'return mix(vec3(.05,.06,.09), vec3(.12,.14,.2), fbm(p*3.));',
    emit: `float n=fbm(p*3.6+vec3(t*1.7,0.,t*.9)), n2=fbm(p*7.+vec3(0.,t*2.3,t*1.1)); float l=1.-smoothstep(0.,.045,abs(n-.5)), l2=1.-smoothstep(0.,.03,abs(n2-.52)); float fl=step(.55,h31(vec3(floor(t*14.),3.,1.)));
      return vec3(1.,.88,.15)*l*(1.6+3.5*fl)+vec3(.25,.6,1.)*l2*(.9+2.*fl)+vec3(.05,.12,.3)*(.5+.5*sin(t*6.));` },
  inferno: { // INFERNO: rocha vulcânica com LAVA incandescente
    albedo: 'return mix(vec3(.035,.025,.022), vec3(.12,.07,.05), fbm(p*4.));',
    emit: `float n=fbm(p*3.+vec3(0.,t*.12,0.)); float c=1.-smoothstep(0.,.09,abs(n-.5)); float m=fbm(p*8.+vec3(t*.6)); vec3 lava=mix(vec3(1.,.18,.01),vec3(1.,.8,.15),m);
      return lava*(c*3.4+smoothstep(.62,.8,fbm(p*2.2-t*.1))*1.2)*(.85+.25*sin(t*3.+p.x*5.));` },
  frost: { // GLACIAL: gelo azul-branco brilhante com cristais cintilando
    albedo: 'return mix(vec3(.55,.8,.95), vec3(.9,.97,1.), fbm(p*5.));',
    emit: `float sp=pow(h31(floor(p*46.)+floor(t*2.)),26.); float vein=1.-smoothstep(0.,.05,abs(fbm(p*4.)-.5)); return vec3(.7,.95,1.)*(sp*6.+vein*.9)+vec3(.05,.2,.35);` },
  clown: { // PALHAÇO: remendos coloridos, listras e confete
    albedo: `float cell=floor(p.x*7.)+floor(p.y*6.)*3.+floor(p.z*5.)*7.; float stripe=step(.5,fract(p.x*9.+p.y*4.)); vec3 a=hsv(fract(cell*.137),.95,.95), b=hsv(fract(cell*.137+.5),.9,1.); return mix(a,b,stripe);`,
    emit: 'return vec3(.12)*(.5+.5*sin(t*4.+p.x*8.));' },
  toxic: { // TÓXICO: verde radioativo com bolhas de gosma brilhante
    albedo: 'return mix(vec3(.03,.1,.03), vec3(.08,.22,.05), fbm(p*4.));',
    emit: `float b=smoothstep(.56,.62,fbm(p*5.+vec3(0.,-t*.6,0.))); float v=1.-smoothstep(0.,.06,abs(fbm(p*3.+t*.1)-.5)); return vec3(.35,1.,.1)*(b*2.6+v*1.4)+vec3(.02,.12,0.)*(.6+.4*sin(t*2.));` },
  rainbow: { // ARCO-ÍRIS: ondas de cor que correm pela arma
    albedo: 'return vec3(.07,.07,.1);',
    emit: 'float h=fract(p.x*.45+p.y*.3-t*.25); return hsv(h,.9,1.)*(1.4+.6*sin(t*5.+p.x*10.));' },
  void: { // GALÁXIA: espaço profundo com nebulosa e estrelas piscando
    albedo: 'return vec3(.02,.01,.05);',
    emit: `float st=pow(h31(floor(p*70.)),38.)*(.5+.5*sin(t*4.+h31(floor(p*70.))*30.)); float neb=fbm(p*2.4+vec3(t*.05)); vec3 col=mix(vec3(.35,.08,.7),vec3(.1,.35,.9),fbm(p*3.+7.)); return col*smoothstep(.35,.8,neb)*1.6+vec3(1.)*st*7.;` },
  dragon: { // DRAGÃO: escamas vermelho-escuras com fendas de brasa
    albedo: 'vec2 q=p.xy*9.; q.x+=mod(floor(q.y),2.)*.5; return mix(vec3(.2,.02,.02),vec3(.4,.06,.03),h31(vec3(floor(q),p.z*2.)));',
    emit: `vec2 q=p.xy*9.; q.x+=mod(floor(q.y),2.)*.5; vec2 f=fract(q)-.5; float d=length(f*vec2(1.,1.15)); float edge=smoothstep(.34,.5,d); return vec3(1.,.4,.06)*edge*(1.5+1.2*sin(t*2.5+h31(vec3(floor(q),1.))*20.))+vec3(.25,.03,.0)*fbm(p*3.+t*.2);` }
};
// partículas (GPU): brasas, faíscas, neve, confete, bolhas, estrelas — posição calculada no vertex shader a partir do tempo
const PARTS = {
  plasma: { n: 46, c: [1, .9, .25], size: 0.05, mode: 'spark', speed: 2.6 }, inferno: { n: 46, c: [1, .45, .08], size: 0.06, mode: 'rise', speed: .7, rise: .9 },
  frost: { n: 40, c: [.8, .95, 1], size: 0.04, mode: 'fall', speed: .35, rise: .8 }, clown: { n: 44, c: [-1, 0, 0], size: 0.06, mode: 'fall', speed: .5, rise: .9 },
  toxic: { n: 36, c: [.4, 1, .15], size: 0.06, mode: 'rise', speed: .45, rise: .7 }, rainbow: { n: 40, c: [-1, 0, 0], size: 0.05, mode: 'spark', speed: 1.4 },
  void: { n: 40, c: [.8, .6, 1], size: 0.035, mode: 'twinkle', speed: 1 }, dragon: { n: 50, c: [1, .4, .06], size: 0.06, mode: 'rise', speed: .9, rise: 1 }
};
const mats = {};
function fxMaterial(k, dark) {
  const low = lowQ(), key = k + (dark ? 'd' : '') + (low ? 'L' : ''); if (mats[key]) return mats[key]; const e = EFFECTS[k];
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: e.mr ? e.mr[0] : k === 'clown' ? 0.15 : k === 'frost' ? 0.55 : 0.8, roughness: e.mr ? e.mr[1] : k === 'frost' ? 0.12 : k === 'clown' ? 0.4 : 0.28 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uT = uT;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vOP; uniform float uT;\n${low ? GLSL.replace('i<4;', 'i<2;') : GLSL}\nvec3 fxAlbedo(vec3 p,float t,vec3 bs){ ${e.albedo} }\nvec3 fxEmit(vec3 p,float t){ ${e.emit} }`)
      .replace('#include <color_fragment>', `#include <color_fragment>\ndiffuseColor.rgb = fxAlbedo(vOP, uT, diffuseColor.rgb)${dark ? ' * .55' : ''};`).replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\ntotalEmissiveRadiance += fxEmit(vOP, uT)${dark ? ' * .7' : ''};`);
  };
  m.customProgramCacheKey = () => 'rare-' + key; return (mats[key] = m);
}
function particles(model, k) { particlesSpec(model, PARTS[k]); }
export function emitSpec(model, P) { if (!ticking) { ticking = true; requestAnimationFrame(tick); } particlesSpec(model, P); }
function particlesSpec(model, P) {
  if (!P) return; const b = new THREE.Box3().setFromObject(model), s = b.getSize(new THREE.Vector3()), N = lowQ() ? Math.max(8, Math.round(P.n * 0.4)) : P.n, pos = new Float32Array(N * 3), seed = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { pos[i * 3] = b.min.x + Math.random() * s.x; pos[i * 3 + 1] = b.min.y + Math.random() * s.y; pos[i * 3 + 2] = b.min.z + Math.random() * s.z; for (let j = 0; j < 4; j++) seed[i * 4 + j] = Math.random(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  const mode = { rise: 0, fall: 1, spark: 2, twinkle: 3 }[P.mode];
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT, uFade: { value: 1 }, uC: { value: new THREE.Vector3(...P.c) }, uSize: { value: P.size }, uMode: { value: mode }, uSpeed: { value: P.speed }, uRise: { value: P.rise || .5 }, uH: { value: s.y } },
    vertexShader: `uniform float uT,uSize,uSpeed,uRise,uH; uniform int uMode; attribute vec4 aSeed; varying float vA; varying float vH; void main(){ vec3 p=position; float life=fract(uT*uSpeed*(.5+aSeed.w)+aSeed.x*7.); vA=1.;
      if(uMode==0){ p.y+=life*uRise; p.x+=sin(uT*2.+aSeed.y*20.)*.03*life; vA=sin(life*3.14159); }
      else if(uMode==1){ p.y+=uH*.5-life*uRise; p.x+=sin(uT+aSeed.y*20.)*.04; vA=sin(life*3.14159); }
      else if(uMode==2){ float on=step(.55,fract(uT*(3.+aSeed.z*4.)+aSeed.y*9.)); p+=(aSeed.xyz-.5)*.25*life; vA=on*(1.-life); }
      else { vA=pow(.5+.5*sin(uT*3.*uSpeed+aSeed.y*40.),3.); }
      vH=aSeed.z; vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=uSize*(.6+aSeed.z)*projectionMatrix[1][1]*250./max(-mv.z,.1); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uC; uniform float uFade; varying float vA; varying float vH; ${GLSL} void main(){ vec2 d=gl_PointCoord-.5; float r=length(d); if(r>.5) discard; vec3 c=uC.x<0.?hsv(vH*7.,.9,1.):uC; gl_FragColor=vec4(c*1.5, vA*smoothstep(.5,.0,r)*.85*uFade); }` });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.userData.fx = 'pts'; model.userData.hasFx = true; model.add(pts);
}
// aplica a skin rara no modelo: troca os materiais do corpo pelo efeito e adiciona as partículas
export function applyRare(model, k, melee = false) {
  if (!EFFECTS[k]) return false; if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  const A = fxMaterial(k, false), B = fxMaterial(k, true), body = ['steel', 'chrome', 'tan', 'camo', 'gold'].map((x) => MT[x]).filter(Boolean), dark = ['blued', 'black', 'poly', 'od', 'navy'].map((x) => MT[x]).filter(Boolean), acc = ['red', 'glow', 'glow2', 'glowR'].map((x) => MT[x]).filter(Boolean);
  if (melee) model.traverse((o) => { if (!o.isMesh || !o.material || (o.material.emissive?.getHex?.() && o.material.emissiveIntensity > 0.8) || o.material.transparent) return; o.material = (o.material.metalness ?? 0) > 0.5 ? A : B; });   // ARMA BRANCA: lâmina/metal = material A, cabo = B
  else model.traverse((o) => { if (!o.isMesh) return; if (body.includes(o.material)) o.material = A; else if (dark.includes(o.material)) o.material = B; else if (acc.includes(o.material)) o.material = A; });
  particles(model, k); return true;
}

// Para QUEM usa a arma: ao mirar os efeitos (partículas, cristais, tubos) ficam transparentes para não tapar a mira. Os outros jogadores veem a arma normal.
export function setFxFade(model, a) {
  if (!model?.userData.hasFx) return; const q = Math.round(a * 20) / 20; if (model.userData._fq === q) return; model.userData._fq = q;
  model.traverse((o) => { if (o.userData.fx === 'pts') o.material.uniforms.uFade.value = q; else if (o.userData.fx === 'mesh') { o.material.transparent = true; o.material.opacity = (o.userData.baseOp ?? 1) * q; o.visible = q > 0.02; } });
}

// ===== SKINS MÍTICAS DE EVENTO: cada mês tem seu PADRÃO ANIMADO próprio (não é só troca de cor) =====
import { EVENTS } from '/shared/events.js';
const hx = (h) => `vec3(${(((h >> 16) & 255) / 255).toFixed(3)},${(((h >> 8) & 255) / 255).toFixed(3)},${((h & 255) / 255).toFixed(3)})`;
const EVT = {
  evt01: (A, B) => ({ albedo: `return mix(${A}, vec3(.02,.03,.08), fbm(p*3.));`, emit: `float s=pow(h31(floor(p*55.)+floor(t*3.)),28.); float b=step(.97,fract(t*.35+h31(floor(p*4.))))*(1.-fract(t*.35+h31(floor(p*4.)))); return ${B}*s*7.+hsv(fract(p.x*2.+t*.3),.8,1.)*b*1.4+${B}*.12;`, part: { n: 50, c: [1, .85, .3], size: 0.05, mode: 'spark', speed: 1.8 }, mr: [0.5, 0.3] }),
  evt02: () => ({ albedo: `float c=floor(p.x*9.+sin(p.y*7.)*1.6); return hsv(fract(c*.173),.85,.95);`, emit: `float cf=step(.965,h31(floor(p*32.)+floor(t*5.))); return hsv(fract(h31(floor(p*32.))*5.+t*.3),.9,1.)*cf*5.+vec3(.1)*(.5+.5*sin(t*5.+p.x*9.));`, part: { n: 56, c: [-1, 0, 0], size: 0.06, mode: 'fall', speed: .6, rise: 1 }, mr: [0.2, 0.4] }),
  evt03: (A, B) => ({ albedo: `return mix(${A}, ${B}, step(.5,fract(p.x*7.+p.z*3.)));`, emit: `float bulb=step(.88,fract(p.x*9.))*step(.8,fract(p.y*5.)); return vec3(1.,.85,.3)*bulb*(1.2+1.8*sin(t*7.-p.x*18.));`, part: { n: 36, c: [1, .85, .3], size: 0.05, mode: 'twinkle', speed: 1.4 }, mr: [0.25, 0.4] }),
  evt04: (A, B) => ({ albedo: `float z=sin(p.x*14.)*.12+p.y*5.; float i=floor(z*1.2); vec3 pal[4]; pal[0]=${B}; pal[1]=vec3(1.,.95,.6); pal[2]=vec3(.6,.95,.85); pal[3]=vec3(.65,.8,1.); return pal[int(mod(i,4.))];`, emit: `float sp=pow(h31(floor(p*40.)+floor(t*2.)),30.); return vec3(1.,.9,.95)*sp*4.+vec3(.12,.07,.1);`, part: { n: 40, c: [-1, 0, 0], size: 0.05, mode: 'rise', speed: .5, rise: .8 }, mr: [0.15, 0.45] }),
  evt05: (A, B) => ({ albedo: `vec2 q=p.xy*8.; vec2 f=fract(q)-.5; float d=length(f); vec3 base=mix(${A}, vec3(1.,.8,.88), fbm(p*3.)); return mix(base, ${B}, smoothstep(.34,.28,d)) + vec3(1.,.85,.2)*smoothstep(.1,.06,d);`, emit: `return ${B}*.12*(.5+.5*sin(t*2.+p.x*6.));`, part: { n: 40, c: [1, .6, .75], size: 0.06, mode: 'fall', speed: .4, rise: .9 }, mr: [0.1, 0.5] }),
  evt06: (A, B) => ({ albedo: `vec2 q=floor(p.xy*6.); float ck=mod(q.x+q.y,2.); vec3 c=mix(${A}, ${B}, ck); vec2 f=fract(p.xy*6.); float st=smoothstep(.04,.0,min(abs(f.x-.5),abs(f.y-.5)))*.35; return c-vec3(st);`, emit: `float fl=fbm(p*5.+vec3(0.,-t*1.4,0.)); return vec3(1.,.5,.1)*smoothstep(.62,.8,fl)*1.8;`, part: { n: 46, c: [1, .55, .1], size: 0.05, mode: 'rise', speed: .9, rise: .9 }, mr: [0.1, 0.55] }),
  evt07: (A, B) => ({ albedo: `return mix(${A}, vec3(.35,.85,1.), smoothstep(.2,.9,fbm(p*3.)));`, emit: `float c1=1.-smoothstep(0.,.06,abs(fbm(p*5.+vec3(t*.3,0.,t*.2))-.5)); return vec3(.6,.95,1.)*c1*1.6+${B}*.08;`, part: { n: 40, c: [.8, .95, 1], size: 0.05, mode: 'rise', speed: .6, rise: .8 }, mr: [0.35, 0.18] }),
  evt08: (A, B) => ({ albedo: `vec2 q=p.xy*8.; q.x+=mod(floor(q.y),2.)*.5; vec2 f=fract(q)-.5; float e=smoothstep(.3,.5,length(f)); return mix(vec3(.05,.2,.08), ${A}*1.5, e);`, emit: `float ff=pow(h31(floor(p*26.)+floor(t*1.5)),24.); float v=1.-smoothstep(0.,.05,abs(fbm(p*3.)-.5)); return vec3(.4,1.,.4)*v*.9+${B}*ff*6.;`, part: { n: 34, c: [.7, 1, .3], size: 0.06, mode: 'twinkle', speed: 1.2 }, mr: [0.4, 0.4] }),
  evt09: (A, B) => ({ albedo: `float d=abs(p.x*2.+p.y*3.)+abs(p.z*2.); float band=fract(p.x*2.6+p.y*1.4); vec3 c=mix(${A}, ${B}, step(.5,band)); return mix(c, vec3(.12,.3,.75), smoothstep(.1,.05,abs(fract(p.x*2.6+p.y*1.4)-.5)-.35));`, emit: `return ${B}*.12*(.6+.4*sin(t*3.+p.x*8.))+vec3(.08)*pow(h31(floor(p*45.)+floor(t*2.)),24.)*60.;`, part: { n: 36, c: [1, .9, .2], size: 0.05, mode: 'spark', speed: 1.2 }, mr: [0.3, 0.4] }),
  evt10: (A, B) => ({ albedo: `return mix(${A}, vec3(.16,.05,.22), fbm(p*4.));`, emit: `float n=fbm(p*3.+vec3(0.,t*.35,0.)); float c=1.-smoothstep(0.,.08,abs(n-.5)); float g=smoothstep(.55,.75,fbm(p*2.-vec3(0.,t*.2,0.))); return ${B}*(c*3.+g*1.4)*(.8+.3*sin(t*5.+p.y*9.))+vec3(.5,.1,.9)*.08;`, part: { n: 56, c: [1, .45, .05], size: 0.06, mode: 'rise', speed: .8, rise: 1 }, mr: [0.4, 0.35] }),
  evt11: (A, B) => ({ albedo: `return mix(${A}*.55, ${A}, fbm(p*3.));`, emit: `float st=pow(h31(floor(p*48.)),22.)*(.5+.5*sin(t*3.+h31(floor(p*48.))*30.)); float ln=1.-smoothstep(0.,.03,abs(fract(p.y*5.)-.5)-.44); return vec3(1.,.84,.2)*(st*6.+ln*.8)+${B}*.05;`, part: { n: 40, c: [1, .85, .3], size: 0.04, mode: 'twinkle', speed: 1.1 }, mr: [0.6, 0.25] }),
  evt12: (A, B) => ({ albedo: `float s=fract((p.x+p.y*1.2)*6.); vec3 c=mix(${A}, ${B}, step(.5,s)); return mix(c, vec3(.1,.5,.2), smoothstep(.02,.0,abs(s-.5)-.02)*0.);`, emit: `float sn=pow(h31(floor(p*52.)+floor(t*2.)),26.); return vec3(1.)*sn*6.+vec3(.1,.02,.02)*(.5+.5*sin(t*2.));`, part: { n: 52, c: [1, 1, 1], size: 0.05, mode: 'fall', speed: .45, rise: .9 }, mr: [0.25, 0.35] })
};
for (const e of EVENTS) { const f = EVT[e.id]; if (!f) continue; const d = f(hx(e.c1), hx(e.c2)); EFFECTS[e.id] = { albedo: d.albedo, emit: d.emit, mr: d.mr }; PARTS[e.id] = d.part; RARE_FX.push(e.id); }
