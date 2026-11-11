// MODELOS DAS ARMAS — extraídos do software "Arsenal" (arsenal_3d_lowpoly.html), sem alterar a geometria.
// Eixo do cano = +X no modelo original; client/js/weapons/gunModels.js normaliza (cano -Z, metros reais).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const V=(...a)=>new THREE.Vector3(...a),rnd=Math.random,ZERO=14;
// ---------- texturas e materiais ----------
const T=(w,f)=>{const c=document.createElement('canvas');c.width=c.height=w;f(c.getContext('2d'),w);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t};
const woodT=T(256,(x,w)=>{x.fillStyle='#8a5c36';x.fillRect(0,0,w,w);for(let i=0;i<90;i++){x.strokeStyle=`rgba(${30+rnd()*50|0},${15+rnd()*20|0},5,${.12+rnd()*.25})`;x.lineWidth=1+rnd()*2.5;x.beginPath();const y=rnd()*w;x.moveTo(0,y);x.bezierCurveTo(w*.3,y+rnd()*14-7,w*.6,y+rnd()*14-7,w,y+rnd()*8-4);x.stroke()}});
const camoT=T(256,(x,w)=>{x.fillStyle='#56603f';x.fillRect(0,0,w,w);for(let i=0;i<40;i++){x.fillStyle=['#2d3524','#9a8a5c','#1c2117'][i%3];x.beginPath();x.ellipse(rnd()*w,rnd()*w,10+rnd()*30,6+rnd()*18,rnd()*3,0,7);x.fill()}});
const stipT=T(64,(x,w)=>{x.fillStyle='#808080';x.fillRect(0,0,w,w);for(let i=0;i<500;i++){x.fillStyle=rnd()<.5?'#000':'#fff';x.fillRect(rnd()*w,rnd()*w,2,2)}});stipT.repeat.set(5,5);
const tgtT=T(256,(x,w)=>{x.fillStyle='#e9e6dc';x.fillRect(0,0,w,w);[[120,'#1b1f24'],[96,'#e9e6dc'],[72,'#c33a2e'],[48,'#e9e6dc'],[24,'#c33a2e'],[6,'#e9e6dc']].forEach(([r,c])=>{x.fillStyle=c;x.beginPath();x.arc(w/2,w/2,r,0,7);x.fill()})});
const glowT=T(64,(x,w)=>{const g=x.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,w)});
const tonT=T(128,(x,w)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.moveTo(0,w*.38);x.quadraticCurveTo(w*.5,w*.3,w,w*.5);x.quadraticCurveTo(w*.5,w*.7,0,w*.62);x.fill()});
const Mt=(c,m,r,o={})=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r,...o});
const MT={steel:Mt(0x9aa5ae,.95,.28),blued:Mt(0x1f2a37,.9,.28),black:Mt(0x1b1f24,.7,.38),poly:Mt(0x2d343b,.1,.72,{bumpMap:stipT,bumpScale:.8}),tan:Mt(0xb89d6a,.1,.62),od:Mt(0x4d5a3b,.15,.6),navy:Mt(0x28405a,.5,.38),wood:Mt(0xffffff,.1,.5,{map:woodT}),camo:Mt(0xffffff,.1,.7,{map:camoT}),chrome:Mt(0xeef3f8,1,.1),gold:Mt(0xd9a43f,.9,.24),red:Mt(0xb3342b,.3,.5),rubber:Mt(0x101316,.05,.9),
 glow:Mt(0x42d8ed,.3,.2,{emissive:0x13a8c8,emissiveIntensity:2.4}),glow2:Mt(0xff9a3d,.3,.2,{emissive:0xff5a10,emissiveIntensity:2.4}),glowR:Mt(0xff2a3a,.3,.2,{emissive:0xff1020,emissiveIntensity:2.6}),magT:Mt(0x2a3036,.2,.25,{transparent:true,opacity:.5}),shell:Mt(0xb03020,.3,.5),glass:new THREE.MeshStandardMaterial({color:0x7fc8ff,transparent:true,opacity:.14,roughness:0,metalness:0,depthWrite:false})};
// ---------- helpers de geometria (eixo do cano = +X, cano em y=0) ----------
const add=(g,geo,m,p=[0,0,0],r)=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);if(r)o.rotation.set(...r);o.castShadow=o.receiveShadow=true;g.add(o);return o};
const B=(g,s,p,m,r)=>add(g,new RoundedBoxGeometry(s[0],s[1],s[2],2,Math.min(.03,Math.min(...s)*.3)),m,p,r);
const C=(g,r1,r2,l,p,m,sg=12,r=[0,0,Math.PI/2])=>add(g,new THREE.CylinderGeometry(r1,r2,l,sg),m,p,r);
const P=(g,pts,t,m,p=[0,0,0])=>{const geo=new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(a=>new THREE.Vector2(...a))),{depth:t,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:1});geo.translate(0,0,-t/2);return add(g,geo,m,p)};
const mz=(g,x,y=0,z=0)=>{const o=new THREE.Object3D();o.position.set(x,y,z);g.add(o);g.userData.mz=(g.userData.mz||[]).concat(o)};
const eyeA=(g,x,y,z,info)=>{const o=new THREE.Object3D();o.position.set(x,y,z);g.add(o);g.userData.eye=o;g.userData.sight=info};
const fin=g=>{const b=new THREE.Box3().setFromObject(g);g.userData.ej=V(b.min.x+(b.max.x-b.min.x)*.42,.05,.1);g.userData.mz.forEach(o=>{o.userData.eye=g.userData.eye;o.userData.g=g});return g};
MT.tipk=new THREE.MeshStandardMaterial({color:0x07080a,roughness:.55,metalness:.35});MT.glassG=new THREE.MeshStandardMaterial({color:0x39ff6a,emissive:0x1bd44a,emissiveIntensity:.45,transparent:true,opacity:.16,roughness:0,metalness:0,depthWrite:false});
let OV={};
function tipFx(g,x,t,r,y=0,z=0){
 C(g,r*1.1,r*1.1,.07,[x-.02,y,z],MT.tipk,12);   // PONTA DO CANO sempre preta e lisa (nenhuma skin pinta/texturiza este anel)
 if(t==='supp'){C(g,r*1.9,r*1.9,.62,[x+.3,y,z],MT.tipk,14);for(let i=0;i<4;i++)C(g,r*2.05,r*2.05,.03,[x+.12+i*.14,y,z],MT.steel,14);return x+.64}
 if(t==='brake'){C(g,r*1.5,r*1.5,.2,[x+.08,y,z],MT.tipk,10);return x+.2}
 if(t==='comp'){C(g,r*1.4,r*1.2,.14,[x+.06,y,z],MT.tipk,8);return x+.14}
 if(t==='none')return x;
 C(g,r,r*1.35,.13,[x+.05,y,z],MT.tipk,8);return x+.12}
// ---------- miras ----------
function irons(g,xr,xf,yS,m=MT.black){for(const s of[-1,1])B(g,[.05,.1,.03],[xr,yS-.03,s*.045],m);B(g,[.07,yS-.08,.14],[xr,(yS-.08)/2,0],m);B(g,[.05,yS-.07,.05],[xf,(yS-.07)/2,0],m);B(g,[.014,.07,.014],[xf,yS-.035,0],MT.gold);eyeA(g,xr-.5,yS,0,{k:'iron',fov:[32],n:['Ferro · alça e massa']})}
const OP={dot:['dot',[30,17],['Red dot · 1x','Red dot · 2x']],holo:['holo',[30,17],['Holográfica · 1x','Holográfica · 2x']],gdot:['gdot',[30,17],['Red dot verde · 1x','Red dot verde · 2x']],mini:['mini',[30,17],['Mini red dot · 1x','Mini red dot · 2x']],gholo:['gholo',[30,17],['Holográfica verde · 1x','Holográfica verde · 2x']],acog:['acog',[22,12],['ACOG · 2x','ACOG · 4x']],gacog:['gacog',[22,12],['ACOG verde · 2x','ACOG verde · 4x']],s4:['scope',[18,10],['Luneta · 2x','Luneta · 4x']],s6:['scope',[14,8,5],['Luneta · 3x','Luneta · 6x','Luneta · 9x']],s12:['scope',[12,7,4],['Luneta · 4x','Luneta · 8x','Luneta · 12x']]};
function optic(g,x,yS,t){const [k,fov,n]=OP[t],bk=MT.black;let back;
 if(k==='dot'||k==='gdot'||k==='mini'||k==='holo'||k==='gholo'){const mini=k==='mini',holo=k==='holo'||k==='gholo',L=mini?.17:holo?.4:.28,hh=mini?.1:.17,ys=mini?yS-.04:yS,w=mini?.11:.15,zs=mini?.045:.06,lens=k==='gdot'||k==='gholo'?MT.glassG:MT.glass,bot=ys-hh/2;B(g,[w+.01,bot-.1,.1],[x,(bot+.1)/2,0],bk);for(const s of[-1,1])B(g,[L,hh,.022],[x,ys,s*zs],bk);B(g,[L,.03,w],[x,ys+hh/2+.015,0],bk);B(g,[L,.025,w],[x,bot-.012,0],bk);B(g,[.01,hh-.02,w-.05],[x+L*.2,ys,0],lens);back=x-L/2-.4;yS=ys}
 else{const og=new THREE.Group(),ac=k==='acog'||k==='gacog',len=ac?.45:t==='s4'?.55:t==='s6'?.7:.9,r=ac?.07:.055;g.add(og);g.userData.hide=og;C(og,r,r,len,[x,yS,0],bk,14);C(og,r*1.5,r,.16,[x-len/2-.05,yS,0],bk,14);C(og,r,r*1.6,.2,[x+len/2+.02,yS,0],bk,14);add(og,new THREE.CylinderGeometry(.03,.03,.1,10),bk,[x,yS+r+.04,0]);
  if(k==='gacog')for(const e of[-1,1])C(og,r*.8,r*.8,.012,[x+e*(len/2+(e<0?.14:.12)),yS,0],MT.glassG,12);
  for(const d of[-.3,.3]){C(og,r*1.3,r*1.3,.06,[x+d*len,yS,0],MT.steel,14);B(g,[.08,yS-r-.1,.08],[x+d*len,(.1+yS-r)/2,0],bk)}back=x-len/2-.45}
 eyeA(g,back,yS,0,{k,fov,n})}
// ---------- armas longas ----------
function rifle(o){const g=new THREE.Group(),c=o.c,L=o.L||1.1,xF=L/2,xR=-L/2,hg=o.hg,bl=o.bl,x0=o.mx??xF-.45,xh=xF-.05;
 B(g,[L,.27,.17],[0,-.02,0],c.b);B(g,[L*.7,.07,.19],[.02,.15,0],c.m);B(g,[L*.45,.05,.18],[xF*.15,.05,0],c.a);B(g,[.12,.07,.19],[xR*.2,.06,0],MT.black);
 const gx=o.gx||0;P(g,[[xR+.14+gx,-.14],[xR+.34+gx,-.14],[xR+.28+gx,-.6],[xR+.06+gx,-.56]],.15,o.gm||c.p);
 const mm=o.mm||c.p,ex=o.drum?2:OV.mag|0,dy=ex===1?.3:0;if(o.mag==='box')B(g,[.5,.4+ex*.2,.26],[x0+.15,-.36-ex*.1,0],mm);else if(o.mag!=='none'){if(ex===2){P(g,[[x0,-.14],[x0+.2,-.14],[x0+.2,-.3],[x0,-.3]],.15,mm);add(g,new THREE.CylinderGeometry(.27,.27,.17,18),mm,[x0+.1,-.5,0],[Math.PI/2,0,0])}else P(g,o.mag==='curved'?[[x0,-.14],[x0+.22,-.14],[x0+.36+dy*.2,-.68-dy],[x0+.12+dy*.2,-.72-dy]]:[[x0,-.14],[x0+.2,-.14],[x0+.2,-.64-dy],[x0,-.64-dy]],.15,mm)}
 const gl=Math.max(.12,x0-(xR+.34));B(g,[gl,.025,.12],[xR+.34+gl/2,-.28,0],c.m);B(g,[.03,.1,.03],[xR+.46,-.2,0],MT.black);
 if(hg){C(g,.075,.075,hg,[xh+hg/2,0,0],o.hm||c.p,8);for(let i=0;i<3;i++)C(g,.083,.083,.035,[xh+hg*(.2+.3*i),0,0],c.a,8)}
 C(g,.03,.03,hg+bl+.05,[xh+(hg+bl+.05)/2,0,0],c.m,10);const xe=xh+hg+bl;let m=xe;
 m=tipFx(g,xe,(o.fixTip?o.tip:(OV.tip||o.tip||'flash')),.03);
 mz(g,m);
 if(o.s==='tel'){P(g,[[xR,.08],[xR,-.14],[xR-.5,-.2],[xR-.56,.02]],.13,c.p);C(g,.04,.04,.5,[xR-.25,-.02,0],c.m,10)}
 else if(o.s==='wood'){P(g,[[xR,.1],[xR,-.16],[xR-.75,-.34],[xR-.8,.04]],.15,MT.wood);B(g,[.05,.4,.16],[xR-.79,-.15,0],MT.rubber,[0,0,.12])}
 if(o.bip)for(const s of[-1,1])B(g,[.03,.4,.03],[xh+hg*.75,-.2,s*.08],MT.steel,[0,0,.25]);
 if(o.shield)C(g,.1,.1,hg*.7,[xh+hg*.4,0,0],c.m,10);
 if(o.belt){const S=V(x0+.05,.13,.11),E=V(x0+.2,-.14,.15),Q=V(x0-.15,-.02,.5);for(let i=0;i<16;i++){const t=i/15,a=(1-t)*(1-t),b=2*(1-t)*t,cc=t*t,p=[S.x*a+Q.x*b+E.x*cc,S.y*a+Q.y*b+E.y*cc,S.z*a+Q.z*b+E.z*cc];C(g,.022,.022,.1,p,MT.gold,6,[Math.PI/2,0,0]);B(g,[.07,.035,.03],p,MT.steel)}}
 if(o.bolt){const bg=new THREE.Group();bg.position.set(xR*.2,.05,.1);bg.userData.role='bolt';bg.userData.bx=xR*.2;g.add(bg);C(bg,.015,.015,.2,[0,0,.02],c.m,8,[Math.PI/2,0,0]);add(bg,new THREE.SphereGeometry(.04,8,6),c.m,[0,0,.14])}
 {const op=OV.op||o.op;if(op==='irons')irons(g,xR+.1,xh+hg+Math.min(bl,.15),.29);else optic(g,o.ox??xR*.1,.33,op)}
 // DETALHES (tudo rente ao corpo e abaixo da linha de mira — nada tapa a visada; fica na mesma malha fundida, custo de desenho zero)
 {const bk=MT.black,bx=(sx,sy,sz,p,m=bk,r)=>add(g,new THREE.BoxGeometry(sx,sy,sz),m,p,r),rl=L*.7,nS=Math.max(3,Math.round(rl/.07));
  for(let i=0;i<nS;i++)bx(.02,.012,.15,[.02-rl/2+.03+i*(rl-.06)/(nS-1),.187,0]);   // fendas do trilho
  bx(.2,.07,.012,[-L*.04,.05,.087]);bx(.2,.012,.012,[-L*.04,.088,.087],MT.steel);   // janela de ejeção
  bx(.05,.035,.05,[xR+.3,.19,0],MT.steel);bx(.02,.08,.02,[xR+.4,-.2,0],MT.steel,[0,0,.3]);   // alavanca de carregar e gatilho
  for(const x of[xR+.2,xF*.15])add(g,new THREE.CylinderGeometry(.014,.014,.2,8),MT.steel,[x,-.08,0],[Math.PI/2,0,0]);   // pinos
  if(hg>=.2&&!o.shield)for(let i=0;i<Math.floor((hg-.08)/.09);i++)for(const sd of[-1,1])bx(.05,.028,.012,[xh+.07+i*.09,0,sd*.071]);   // aberturas de ventilação
  if(o.mag!=='none'&&o.mag!=='box'&&!o.drum&&!o.belt)bx(.3,.04,.2,[x0+.11,-.155,0],c.b)}   // boca do carregador
 return fin(g)}
function ener(k){const a=k==='arc',g=rifle({c:{b:MT.navy,m:MT.steel,p:MT.black,a:a?MT.glow2:MT.glow},L:a?1:1.1,hg:a?.5:.7,bl:a?.3:.2,tip:'flash',fixTip:a,mag:'straight',s:'tel',op:a?'dot':'holo'}),gm=a?MT.glow2:MT.glow;
 B(g,[.5,.05,.18],[0,-.08,0],gm);
 if(!a){for(let i=0;i<5;i++)add(g,new THREE.TorusGeometry(.09,.02,6,14),gm,[.62+i*.14,0,0],[0,Math.PI/2,0])}
 else{C(g,.1,.22,.4,[1.45,0,0],gm,14);for(const s of[-1,1]){C(g,.05,.05,.8,[.9,0,s*.2],MT.gold,10);B(g,[.3,.1,.12],[.5,0,s*.14],MT.black)};g.userData.mz[0].position.x=1.66}
 return g}
// ---------- pistola / revólver / escopeta ----------
function pist(o){const g=new THREE.Group(),L=o.L||1,c=o.c,r=-.4*L,fr=.6*L;
 B(g,[L,.2,.16],[L*.1,0,0],c.m);B(g,[L*.9,.09,.15],[L*.05,-.14,0],c.p);P(g,[[r+.02,-.09],[r+.28,-.09],[r+.2,-.62],[r-.1,-.58]],.15,c.p);B(g,[.2,.04,.16],[r+.05,-.62,0],c.m);if(OV.mag)B(g,[.22,.3,.16],[r+.02,-.76,0],c.p);
 B(g,[.3,.025,.11],[.16*L,-.22,0],c.p);B(g,[.025,.1,.11],[.3*L,-.17,0],c.p);B(g,[.03,.1,.03],[.1,-.2,0],MT.black);
 for(let i=0;i<4;i++)B(g,[.02,.2,.17],[r+.08+i*.045,0,0],c.b);B(g,[.3,.012,.17],[L*.2,.02,0],c.a);
 C(g,.04,.04,.1,[fr+.03,0,0],c.b,10);mz(g,tipFx(g,fr+.07,OV.tip||'none',.04));{const op=OV.op||'irons';if(op==='irons')irons(g,r+.05,fr-.05,.17);else optic(g,L*.05,.3,op)}
 {const bk=MT.black,bx=(sx,sy,sz,p,m=bk,rr)=>add(g,new THREE.BoxGeometry(sx,sy,sz),m,p,rr);   // detalhes: janela de ejeção, placas de aderência, ponta do cano, gatilho
  bx(.2,.06,.01,[L*.12,.04,.083]);bx(.2,.012,.01,[L*.12,.074,.083],MT.steel);
  for(const sd of[-1,1]){bx(.13,.38,.01,[r+.1,-.35,sd*.079],bk,[0,0,-.15]);for(let i=0;i<5;i++)bx(.11,.008,.012,[r+.1-i*.012,-.2-i*.07,sd*.08],MT.steel,[0,0,-.15])}
  bx(.02,.07,.02,[.13,-.18,0],MT.steel,[0,0,.25]);bx(.02,.02,.1,[fr-.02,.115,0],MT.steel)}
 return fin(g)}
function rev(o){const g=new THREE.Group(),m=o.m,bl=o.bl;
 B(g,[.62,.26,.15],[-.05,0,0],m);const dg=new THREE.Group();dg.position.set(.12,0,0);dg.userData.role='drum';g.add(dg);C(dg,.14,.14,.4,[0,0,0],m,12);for(let i=0;i<6;i++){const a=i*Math.PI/3;C(dg,.03,.03,.42,[0,Math.cos(a)*.085,Math.sin(a)*.085],MT.black,8)}
 C(g,.05,.05,bl,[.3+bl/2,0,0],m,12);B(g,[bl,.03,.04],[.3+bl/2,.06,0],m);B(g,[bl*.6,.07,.07],[.3+bl*.3,-.07,0],m);
 P(g,[[-.34,-.1],[-.14,-.1],[-.2,-.58],[-.5,-.5]],.16,MT.wood);B(g,[.05,.12,.03],[-.36,.13,0],m,[0,0,.5]);B(g,[.3,.025,.1],[-.1,-.2,0],m);
 mz(g,tipFx(g,.3+bl,OV.tip||'none',.05));{const gp=new THREE.Object3D();gp.position.set(.28,0,0);g.add(gp);g.userData.gap=gp}{const op=OV.op||'irons';if(op==='irons')irons(g,-.32,.3+bl-.05,.19,m);else optic(g,-.02,.3,op)}return fin(g)}
function shot(db){const g=new THREE.Group(),m=MT.steel,s=MT.wood;
 B(g,[.85,.26,db?.2:.17],[0,-.03,0],MT.blued);P(g,[[-.34,-.1],[-.14,-.1],[-.2,-.58],[-.5,-.5]],.16,s);P(g,[[-.4,.1],[-.4,-.16],[-1.2,-.34],[-1.25,.04]],.16,s);B(g,[.05,.4,.17],[-1.24,-.15,0],MT.rubber,[0,0,.12]);B(g,[.3,.025,.11],[-.1,-.2,0],MT.blued);
 if(db){for(const z of[-1,1]){C(g,.05,.05,1.4,[1.1,0,z*.05],m,12);mz(g,tipFx(g,1.8,OV.tip||'none',.04,0,z*.05),0,z*.05)}B(g,[1.4,.025,.1],[1.1,.07,0],m);B(g,[.5,.12,.2],[.55,-.1,0],s);{const op=OV.op||'irons';if(op==='irons')irons(g,-.3,1.75,.19);else optic(g,.1,.3,op)}}
 else{C(g,.05,.05,1.5,[1.2,0,0],m,12);C(g,.04,.04,1.1,[1.0,-.12,0],m,10);{const pu=B(g,[.55,.15,.2],[.95,-.12,0],s);pu.userData.role='pump';pu.userData.bx=.95}C(g,.05,.05,.06,[1.52,-.12,0],MT.black,10);mz(g,tipFx(g,1.95,OV.tip||'none',.05));{const op=OV.op||'irons';if(op==='irons')irons(g,-.3,1.9,.2);else optic(g,.1,.3,op)}if(OV.mag)C(g,.04,.04,.4,[1.7,-.12,0],m,10)}
 return fin(g)}
function dual(fn,gp,gap=.6){const w=new THREE.Group(),a=fn(),b=fn(),th=Math.atan(gap/ZERO);
 a.position.set(.1,0,gap);b.position.set(-.1,0,-gap);a.rotation.y=th;b.rotation.y=-th;a.rotation.x=.06;b.rotation.x=-.06;w.add(a,b);

 w.userData.mz=[...a.userData.mz,...b.userData.mz];const e=a.userData.eye.position;eyeA(w,e.x+.1-.4,e.y+.08,0,{k:'holo',fov:[55],n:['Mira dupla']});w.userData.mz.forEach(o=>o.userData.eye=w.userData.eye);return w}
function px90(){const g=new THREE.Group();
 B(g,[1.3,.3,.2],[0,-.02,0],MT.black);B(g,[.4,.22,.19],[.7,-.03,0],MT.poly);P(g,[[-.65,.13],[-.65,-.3],[-.4,-.3],[-.3,.13]],.17,MT.poly);
 B(g,[1+(OV.mag?.35:0),.1,.17],[-.05-(OV.mag?.17:0),.2,0],MT.magT);for(let i=0;i<(OV.mag?13:9);i++)C(g,.022,.022,.13,[-.45-(OV.mag?.35:0)+i*.1,.2,0],MT.gold,6,[Math.PI/2,0,0]);
 P(g,[[0,-.16],[.2,-.16],[.15,-.5],[-.05,-.5]],.16,MT.poly);B(g,[.3,.025,.12],[.12,-.2,0],MT.poly);B(g,[.03,.1,.03],[.02,-.22,0],MT.black);
 C(g,.03,.03,.4,[.95,0,0],MT.steel,10);B(g,[.3,.04,.2],[-.1,.05,0],MT.glow);mz(g,tipFx(g,1.15,OV.tip||'flash',.04));{const op=OV.op||'dot';if(op==='irons')irons(g,-.45,.8,.3);else optic(g,0,.36,op)}return fin(g)}
function sci(red){const g=new THREE.Group(),W2=Mt(0xe9eef4,.3,.35),D=MT.blued,GL=red?MT.glowR:MT.glow,bd=red?MT.black:W2,ex=OV.mag?.25:0;
 P(g,[[-.62,.1],[-.3,.2],[.5,.18],[.78,.07],[.78,-.09],[.3,-.13],[.12,-.13],[-.1,-.16],[-.62,-.12]],.2,bd);
 P(g,[[-.06,-.12],[.16,-.12],[.1,-.55],[-.12,-.5]],.16,D);P(g,[[-.62,.1],[-.62,-.14],[-.95,-.3],[-1.05,.02]],.14,bd);
 B(g,[.7,.05,.22],[.05,.02,0],GL);C(g,.085,.085,.7+ex,[.1-ex/2,.22,0],MT.glass,14);C(g,.055,.055,.62+ex,[.1-ex/2,.22,0],GL,12);
 for(const s of[-1,1]){B(g,[.9,.05,.05],[1,0,s*.07],D);B(g,[.9,.015,.03],[1,0,s*.07],GL)}
 for(let i=0;i<3;i++){const rg=new THREE.Group();rg.position.set(.55+i*.25,0,0);rg.userData.role='ring';g.add(rg);add(rg,new THREE.TorusGeometry(.13,.018,6,16),GL,[0,0,0],[0,Math.PI/2,0]);for(const y of[-1,1])B(rg,[.05,.05,.05],[0,y*.13,0],D)}
 if(red)for(let i=0;i<4;i++)B(g,[.04,.2,.21],[-.45+i*.1,-.01,0],MT.glowR);
 mz(g,1.5);{const op=OV.op||'holo';if(op==='irons')irons(g,-.45,.5,.36);else optic(g,-.05,.36,op)}return fin(g)}
function flame(){const g=rifle({c:CS(MT.black,MT.steel,MT.black,MT.red),L:1,hg:.3,bl:.8,tip:'none',mag:'none',s:'tel',op:'irons'});
 C(g,.2,.2,.8,[.3,-.42,0],MT.red,14);for(const x of[-.1,.7])C(g,.215,.215,.05,[x,-.42,0],MT.steel,14);C(g,.03,.03,.4,[.4,-.17,0],MT.rubber,8);C(g,.04,.06,.24,[1.5,0,0],MT.steel,10);g.userData.mz[0].position.x=1.62;return g}
const CS=(b,m,p,a)=>({b,m,p,a});
const BUILD={
 ar:()=>rifle({c:CS(MT.od,MT.steel,MT.black,MT.gold),hg:.9,bl:.25,tip:'brake',mag:'curved',s:'tel',op:'holo'}),
 carbine:()=>rifle({c:CS(MT.tan,MT.blued,MT.tan,MT.black),L:1,hg:.55,bl:.12,tip:'flash',mag:'straight',s:'tel',op:'dot'}),
 lmg:()=>rifle({c:CS(MT.camo,MT.steel,MT.black,MT.red),L:1.3,hg:1,bl:.7,tip:'flash',mag:'box',s:'tel',bip:1,op:'acog'}),
 smg:()=>rifle({c:CS(MT.navy,MT.steel,MT.black,MT.gold),L:.8,hg:.3,bl:.2,tip:'supp',mag:'straight',s:'tel',op:'irons'}),
 pdw:()=>rifle({c:CS(MT.black,MT.steel,MT.poly,MT.glow),L:.62,hg:.12,bl:.18,tip:'flash',mag:'curved',mx:-.2,s:'none',op:'dot'}),
 dualsmg:()=>dual(()=>rifle({c:CS(MT.tan,MT.blued,MT.black,MT.red),L:.8,hg:.3,bl:.2,tip:'flash',mag:'straight',s:'none',op:'irons'}),[-.2,-.35]),
 pistol:()=>pist({c:CS(MT.black,MT.blued,MT.poly,MT.gold)}),
 dualpistol:()=>dual(()=>pist({c:CS(MT.black,MT.steel,MT.poly,MT.gold)}),[-.3,-.34]),
 deagle:()=>pist({L:1.25,c:CS(MT.black,MT.chrome,MT.black,MT.gold)}),
 revolver:()=>rev({bl:.85,m:MT.steel}),
 dualrev:()=>dual(()=>rev({bl:.7,m:MT.blued}),[-.3,-.32]),
 shotgun:()=>shot(0),dbl:()=>shot(1),
 dmr:()=>rifle({c:CS(MT.camo,MT.blued,MT.black,MT.gold),L:1.2,hg:1.1,bl:.7,tip:'brake',mag:'straight',s:'wood',bip:1,op:'s6'}),
 sniper:()=>rifle({c:CS(MT.od,MT.blued,MT.black,MT.gold),L:1.2,hg:.8,bl:1.2,tip:'brake',mag:'straight',s:'tel',bip:1,op:'s12',bolt:1}),
 ion:()=>ener('ion'),arc:()=>ener('arc'),px90:()=>px90(),flame:()=>flame(),
 m60:()=>rifle({c:CS(MT.black,MT.steel,MT.black,MT.od),L:1.35,hg:.9,bl:.8,tip:'flash',mag:'box',mm:MT.od,s:'wood',bip:1,op:'irons',belt:1,shield:1}),
 ak:()=>rifle({c:CS(MT.blued,MT.steel,MT.black,MT.gold),L:1,hg:.65,bl:.4,tip:'brake',mag:'curved',mm:MT.steel,hm:MT.wood,gm:MT.wood,s:'wood',op:'irons'}),
 azure:()=>sci(0),crimson:()=>sci(1)};
// armas novas = modelo de uma arma-base (o look próprio vem de weapons/skins.js)
BUILD.scout = () => BUILD.sniper(); BUILD.vector = () => BUILD.pdw(); BUILD.pump = () => BUILD.shotgun();
function stub(g,x){g.userData.noads=1;mz(g,x);eyeA(g,-1,0,0,{k:'iron',fov:[40],n:['—']});return fin(g)}
const rod=(g,a,b,r,m,sg=8)=>{a=V(...a);b=V(...b);const d=b.clone().sub(a),o=add(g,new THREE.CylinderGeometry(r,r,d.length(),sg),m,a.clone().add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return o};
const sgt=(g,def,xr,xf,yS,xo,yo)=>{const op=OV.op||def;if(op==='irons')irons(g,xr,xf,yS);else optic(g,xo,yo,op)};
function bullpupB(){const g=rifle({c:CS(MT.od,MT.steel,MT.black,MT.gold),L:1.05,hg:.4,bl:.3,gx:.42,mx:-.4,tip:'brake',mag:'curved',s:'none',op:'holo'});B(g,[.22,.3,.19],[-.55,-.02,0],MT.black);return g}
function leverB(){const g=rifle({c:CS(MT.blued,MT.steel,MT.wood,MT.gold),L:1.1,hg:.6,bl:.55,tip:'none',mag:'none',s:'wood',op:'irons',hm:MT.wood});
 const lv=new THREE.Group();lv.position.set(-.05,-.14,0);lv.userData.role='lever';g.add(lv);
 B(lv,[.5,.035,.05],[.22,-.2,0],MT.steel);B(lv,[.035,.2,.05],[-.02,-.1,0],MT.steel);B(lv,[.035,.2,.05],[.47,-.1,0],MT.steel);return g}
function amrB(){const g=rifle({c:CS(MT.od,MT.blued,MT.black,MT.gold),L:1.4,hg:1.0,bl:1.3,tip:'brake',mag:'box',mm:MT.black,mx:-.15,s:'tel',bip:1,op:'s12',bolt:1});C(g,.065,.065,1.5,[1.65,0,0],MT.blued,12);C(g,.1,.1,.3,[2.85,0,0],MT.black,10);return g}
function microB(){const g=rifle({c:CS(MT.black,MT.chrome,MT.black,MT.gold),L:.55,hg:.04,bl:.12,mag:'straight',mx:-.2,s:'none',op:'irons',tip:'flash'});
 rod(g,[-.28,.06,.07],[-.78,.06,.07],.012,MT.steel);rod(g,[-.28,.06,-.07],[-.78,.06,-.07],.012,MT.steel);rod(g,[-.78,.06,.07],[-.78,.06,-.07],.012,MT.steel);return g}
function spasB(){const g=rifle({c:CS(MT.black,MT.steel,MT.poly,MT.gold),L:1.1,hg:.7,bl:.45,mag:'none',s:'tel',op:'irons',tip:'brake'});
 C(g,.04,.04,.9,[.75,-.12,0],MT.steel,10);const pu=B(g,[.4,.12,.18],[.7,-.12,0],MT.poly);pu.userData.role='pump';pu.userData.bx=.7;return g}
function hmgB(){const g=rifle({c:CS(MT.od,MT.steel,MT.black,MT.gold),L:1.4,hg:.7,bl:1.0,tip:'brake',mag:'box',mm:MT.od,mx:.1,s:'none',op:'irons',belt:1,shield:1});
 for(const [x,z] of[[.45,0],[-.35,.5],[-.35,-.5]])rod(g,[.1,-.3,0],[x*1.5+.1,-1.25,z*1.5],.035,MT.black,8);
 B(g,[.4,.12,.5],[-.7,.02,0],MT.black);for(const s of[-1,1])rod(g,[-.85,.02,s*.22],[-1.1,.02,s*.22],.03,MT.rubber);return g}
function sawedB(){const g=new THREE.Group(),m=MT.steel,s=MT.wood;
 B(g,[.5,.26,.2],[0,-.03,0],MT.blued);P(g,[[-.34,-.1],[-.14,-.1],[-.2,-.58],[-.5,-.5]],.16,s);B(g,[.3,.025,.11],[-.1,-.2,0],MT.blued);
 for(const z of[-1,1]){C(g,.055,.055,.75,[.6,0,z*.055],m,12);mz(g,tipFx(g,.98,OV.tip||'none',.04,0,z*.055),0,z*.055)}
 B(g,[.75,.025,.1],[.6,.07,0],m);B(g,[.4,.12,.2],[.4,-.1,0],s);B(g,[.04,.1,.05],[-.2,.08,.1],MT.black,[0,0,.5]);sgt(g,'irons',-.2,.95,.3,.1,.3);return fin(g)}
function minigunB(){const g=new THREE.Group();
 B(g,[1,.42,.34],[0,0,0],MT.black);C(g,.21,.21,.55,[-.78,0,0],MT.steel,16);C(g,.16,.16,.2,[-1.1,0,0],MT.black,16);C(g,.17,.17,.12,[.58,0,0],MT.steel,16);
 const br=new THREE.Group();br.userData.role='gat';g.add(br);
 for(let i=0;i<6;i++){const a=i*Math.PI/3;C(br,.04,.04,1.55,[1.35,Math.cos(a)*.1,Math.sin(a)*.1],MT.blued,8)}
 for(const x of[.75,1.3,2.0])C(br,.15,.15,.05,[x,0,0],MT.steel,12);C(br,.07,.07,1.55,[1.35,0,0],MT.black,10);
 P(g,[[-.15,-.2],[.05,-.2],[0,-.62],[-.2,-.58]],.15,MT.poly);P(g,[[.25,-.2],[.4,-.2],[.35,-.56],[.2,-.54]],.15,MT.poly);
 B(g,[.7,.04,.04],[0,.3,0],MT.steel);rod(g,[-.3,.2,0],[-.3,.3,0],.025,MT.steel);rod(g,[.3,.2,0],[.3,.3,0],.025,MT.steel);
 B(g,[.55,.45,.3],[-.1,-.55,.5],MT.od);const S=V(-.1,-.35,.5),E=V(.15,-.1,.2),Q=V(.2,-.5,.55);
 for(let i=0;i<10;i++){const t=i/9,a=(1-t)*(1-t),b=2*(1-t)*t,cc=t*t;C(g,.022,.022,.1,[S.x*a+Q.x*b+E.x*cc,S.y*a+Q.y*b+E.y*cc,S.z*a+Q.z*b+E.z*cc],MT.gold,6,[Math.PI/2,0,0])}
 mz(g,2.15);irons(g,-.9,.9,.36);return fin(g)}
function railB(){const g=new THREE.Group();
 B(g,[1,.3,.24],[0,0,0],MT.navy);P(g,[[-.12,-.14],[.1,-.14],[.04,-.6],[-.2,-.55]],.17,MT.black);P(g,[[-.5,.12],[-.5,-.14],[-1.1,-.3],[-1.2,.0]],.15,MT.black);
 for(const s of[-1,1]){B(g,[1.9,.07,.07],[1.45,0,s*.1],MT.chrome);B(g,[1.8,.02,.075],[1.45,0,s*.1],MT.glow)}
 B(g,[1.9,.05,.2],[1.45,-.07,0],MT.black);
 for(let i=0;i<5;i++){const rg=new THREE.Group();rg.position.set(.75+i*.34,0,0);rg.userData.role='ring';g.add(rg);add(rg,new THREE.TorusGeometry(.17,.025,6,16),MT.glow,[0,0,0],[0,Math.PI/2,0])}
 C(g,.1,.1,.55,[-.05,.27,0],MT.glass,14);C(g,.06,.06,.5,[-.05,.27,0],MT.glow,12);mz(g,2.45);sgt(g,'acog',-.4,2.2,.4,.3,.5);return fin(g)}
function teslaB(){const g=new THREE.Group();
 B(g,[.9,.3,.24],[0,0,0],MT.navy);P(g,[[-.12,-.14],[.1,-.14],[.04,-.6],[-.2,-.55]],.17,MT.black);P(g,[[-.45,.12],[-.45,-.14],[-.95,-.28],[-1.0,0]],.14,MT.black);
 C(g,.07,.07,.8,[.85,0,0],MT.steel,12);
 for(let i=0;i<4;i++){const rg=new THREE.Group();rg.position.set(.6+i*.2,0,0);rg.userData.role='ring';g.add(rg);add(rg,new THREE.TorusGeometry(.2-i*.04,.03,6,16),MT.gold,[0,0,0],[0,Math.PI/2,0])}
 add(g,new THREE.SphereGeometry(.14,14,10),MT.glow,[1.38,0,0]);add(g,new THREE.SphereGeometry(.2,14,10),new THREE.MeshBasicMaterial({color:0x9fd0ff,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false}),[1.38,0,0]).castShadow=false;
 mz(g,1.5);sgt(g,'holo',-.3,1.2,.28,0,.33);return fin(g)}
function bazookaB(){const g=new THREE.Group();
 C(g,.17,.17,2.1,[.2,0,0],MT.od,18);C(g,.25,.17,.35,[-.95,0,0],MT.black,18);C(g,.19,.19,.12,[1.3,0,0],MT.steel,18);for(const x of[-.5,.2,.9])C(g,.185,.185,.06,[x,0,0],MT.steel,18);
 C(g,.1,.1,.25,[1.42,0,0],MT.steel,12);add(g,new THREE.ConeGeometry(.1,.3,12).rotateZ(-Math.PI/2),MT.red,[1.7,0,0]);
 B(g,[.5,.12,.32],[-.4,-.19,0],MT.rubber);P(g,[[-.02,-.15],[.18,-.15],[.12,-.55],[-.1,-.5]],.15,MT.black);P(g,[[.65,-.15],[.85,-.15],[.8,-.52],[.6,-.5]],.15,MT.black);B(g,[.3,.025,.1],[.1,-.2,0],MT.black);
 mz(g,1.85);sgt(g,'irons',-.55,1.1,.34,.2,.4);return fin(g)}
function rpgB(){const g=new THREE.Group();
 C(g,.085,.085,1.7,[0,0,0],MT.wood,12);C(g,.15,.085,.4,[-1.0,0,0],MT.black,14);C(g,.11,.11,.6,[.1,0,0],MT.black,12);C(g,.05,.05,.4,[.95,0,0],MT.od,8);
 const w=add(g,new THREE.SphereGeometry(.19,14,10),MT.od,[1.2,0,0]);w.scale.set(1.5,1,1);add(g,new THREE.ConeGeometry(.15,.4,12).rotateZ(-Math.PI/2),MT.red,[1.68,0,0]);
 for(let i=0;i<2;i++){const f=B(g,[.22,.012,.22],[.92,0,0]);f.rotation.x=i*Math.PI/2}
 P(g,[[-.12,-.08],[.08,-.08],[.02,-.5],[-.2,-.46]],.14,MT.black);P(g,[[.35,-.08],[.52,-.08],[.48,-.42],[.32,-.4]],.14,MT.black);
 mz(g,1.9);sgt(g,'irons',-.55,.9,.3,0,.32);return fin(g)}
function seekerB(){const g=new THREE.Group();
 const ys=[-.12,.12],zs=[-.17,0,.17];B(g,[1.4,.5,.52],[.2,0,0],MT.navy);
 for(const y of ys)for(const z of zs){C(g,.075,.075,1.5,[.35,y,z],MT.steel,10);C(g,.05,.05,.04,[1.1,y,z],MT.black,8);mz(g,1.15,y,z)}
 add(g,new THREE.SphereGeometry(.09,10,8),MT.glow,[.9,.32,0]);B(g,[.6,.12,.36],[-.35,-.28,0],MT.rubber);
 P(g,[[-.02,-.28],[.18,-.28],[.12,-.7],[-.1,-.65]],.15,MT.black);P(g,[[.55,-.28],[.72,-.28],[.68,-.62],[.52,-.6]],.15,MT.black);
 sgt(g,'holo',-.4,1.0,.45,0,.5);return fin(g)}
function thermoB(){const g=new THREE.Group();
 C(g,.22,.22,1.6,[.2,0,0],MT.black,18);C(g,.32,.2,.4,[-.85,0,0],MT.steel,18);
 const bl=add(g,new THREE.SphereGeometry(.3,16,12),MT.red,[1.2,0,0]);bl.scale.set(1.3,1,1);
 for(const x of[-.3,.2,.7])add(g,new THREE.TorusGeometry(.23,.02,6,18),MT.glow2,[x,0,0],[0,Math.PI/2,0]);
 C(g,.12,.12,.1,[.0,.24,0],MT.steel,10);C(g,.1,.1,.02,[.0,.31,0],MT.glow2,10,[0,0,0]);
 B(g,[.5,.12,.36],[-.5,-.24,0],MT.rubber);P(g,[[-.02,-.2],[.2,-.2],[.14,-.62],[-.1,-.56]],.16,MT.black);P(g,[[.55,-.2],[.75,-.2],[.7,-.56],[.5,-.54]],.16,MT.black);
 mz(g,1.65);sgt(g,'irons',-.5,.95,.4,.1,.45);return fin(g)}
function katanaB(){const g=new THREE.Group();
 P(g,[[.2,.05],[1.9,.065],[2.35,.02],[2.4,-.01],[1.9,-.035],[.2,-.035]],.03,MT.chrome);P(g,[[.25,.0],[1.9,.02],[2.2,.0],[1.9,-.012],[.25,-.012]],.036,MT.steel);
 C(g,.16,.16,.035,[.17,0,0],MT.gold,16);C(g,.045,.05,.75,[-.2,0,0],MT.black,10);for(let i=0;i<6;i++)B(g,[.05,.1,.1],[-.5+i*.11,0,0],MT.red,[Math.PI/4,0,0]);add(g,new THREE.SphereGeometry(.06,8,6),MT.gold,[-.6,0,0]);return stub(g,2.4)}
function macheteB(){const g=new THREE.Group();
 P(g,[[.18,.1],[1.55,.14],[1.9,.12],[2.0,.0],[1.7,-.08],[.18,-.08]],.04,MT.steel);P(g,[[.2,.1],[1.6,.14],[1.6,.1],[.2,.07]],.05,MT.black);
 C(g,.05,.055,.6,[-.2,0,0],MT.black,10);for(let i=0;i<3;i++)add(g,new THREE.SphereGeometry(.03,6,5),MT.gold,[-.35+i*.15,0,.055]);B(g,[.05,.2,.14],[.15,0,0],MT.black);return stub(g,2.0)}
function karambitB(){const g=new THREE.Group();
 P(g,[[.1,.08],[.5,.14],[.8,.02],[.88,-.3],[.7,-.34],[.66,-.1],[.4,.0],[.1,-.05]],.035,MT.chrome);
 C(g,.045,.05,.5,[-.15,0,0],MT.black,10);add(g,new THREE.TorusGeometry(.12,.025,8,16),MT.black,[-.5,0,0]);return stub(g,.88)}
function hammerB(){const g=new THREE.Group();
 C(g,.05,.06,2.2,[.4,0,0],MT.wood,10);B(g,[.45,.42,.85],[1.5,0,0],MT.black);B(g,[.5,.46,.12],[1.5,0,.45],MT.steel);B(g,[.5,.46,.12],[1.5,0,-.45],MT.steel);
 for(let i=0;i<4;i++)C(g,.08,.08,.04,[-.5+i*.1,0,0],MT.rubber,10);add(g,new THREE.SphereGeometry(.09,10,8),MT.rubber,[-.72,0,0]);return stub(g,1.85)}
function spearB(){const g=new THREE.Group();
 C(g,.04,.04,3,[.8,0,0],MT.wood,10);P(g,[[2.3,.0],[2.55,.13],[3.15,0],[2.55,-.13]],.03,MT.chrome);C(g,.06,.04,.15,[2.3,0,0],MT.gold,10);
 add(g,new THREE.ConeGeometry(.09,.4,8).rotateZ(-Math.PI/2),MT.red,[2.15,0,0]);add(g,new THREE.ConeGeometry(.05,.3,8).rotateZ(Math.PI/2),MT.steel,[-.85,0,0]);for(let i=0;i<4;i++)C(g,.05,.05,.04,[-.3+i*.1,0,0],MT.rubber,10);return stub(g,3.15)}
function plasmaB(){const g=new THREE.Group();
 C(g,.05,.055,.55,[-.15,0,0],MT.black,10);for(let i=0;i<4;i++)C(g,.06,.06,.03,[-.35+i*.1,0,0],MT.steel,10);B(g,[.06,.1,.38],[.15,0,0],MT.steel);C(g,.08,.06,.22,[.28,0,0],MT.steel,12);add(g,new THREE.SphereGeometry(.07,8,6),MT.glow,[-.45,0,0]);
 C(g,.045,.045,2.0,[1.4,0,0],MT.glow,10);const hm=new THREE.MeshBasicMaterial({color:0x42d8ed,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false});
 C(g,.1,.1,2.0,[1.4,0,0],hm,12).castShadow=false;add(g,new THREE.SphereGeometry(.1,10,8),hm,[2.4,0,0]).castShadow=false;
 return stub(g,2.4)}
function batB(){const g=new THREE.Group();
 C(g,.04,.1,1.9,[.5,0,0],MT.wood,12);for(let i=0;i<5;i++)C(g,.05,.05,.04,[-.35+i*.08,0,0],MT.rubber,10);
 for(let i=0;i<14;i++){const x=.9+rnd()*.5,a=rnd()*6.28;rod(g,[x,Math.cos(a)*.08,Math.sin(a)*.08],[x,Math.cos(a)*.17,Math.sin(a)*.17],.012,MT.steel,5)}return stub(g,1.45)}
Object.assign(BUILD,{
 bullpup:bullpupB,
 battle:()=>rifle({c:CS(MT.tan,MT.blued,MT.black,MT.black),L:1.15,hg:.75,bl:.4,tip:'brake',mag:'straight',s:'wood',op:'acog'}),
 ghost:()=>rifle({c:CS(MT.black,MT.blued,MT.poly,MT.steel),L:1.05,hg:.8,bl:.3,tip:'supp',mag:'straight',s:'tel',op:'holo'}),
 lever:leverB,amr:amrB,
 mp5:()=>rifle({c:CS(MT.black,MT.steel,MT.poly,MT.steel),L:.85,hg:.45,bl:.2,tip:'flash',mag:'curved',s:'tel',op:'irons'}),
 vector:()=>rifle({c:CS(MT.tan,MT.blued,MT.black,MT.black),L:.78,hg:.12,bl:.12,mx:-.25,tip:'comp',mag:'straight',s:'tel',op:'dot'}),
 micro:microB,
 tommy:()=>rifle({c:CS(MT.blued,MT.steel,MT.wood,MT.gold),L:.95,hg:.45,bl:.25,tip:'comp',mag:'straight',drum:1,mm:MT.blued,hm:MT.wood,gm:MT.wood,s:'wood',op:'irons'}),
 aa12:()=>rifle({c:CS(MT.black,MT.steel,MT.poly,MT.red),L:1.05,hg:.6,bl:.35,tip:'comp',mag:'straight',drum:1,s:'tel',op:'irons'}),
 sawed:sawedB,spas:spasB,minigun:minigunB,
 mg42:()=>rifle({c:CS(MT.blued,MT.steel,MT.black,MT.gold),L:1.35,hg:.9,bl:.75,tip:'flash',mag:'box',mm:MT.tan,s:'wood',bip:1,op:'irons',belt:1,shield:1}),
 hmg:hmgB,bazooka:bazookaB,rpg:rpgB,seeker:seekerB,thermo:thermoB,rail:railB,tesla:teslaB,
 katana:katanaB,machete:macheteB,karambit:karambitB,hammer:hammerB,spear:spearB,plasma:plasmaB,bat:batB});

// ===== ARMAS PRÓPRIAS DO LASTLINE (mesmo kit de peças): pistolas, duplas, precisão e especiais =====
function berettaB(){return pist({L:1.08,c:CS(MT.black,MT.steel,MT.black,MT.gold)})}
function machpistB(){const g=pist({L:1.12,c:CS(MT.poly,MT.blued,MT.poly,MT.red),});return g}   /* sem a peça em cima do ferrolho: ela tapava a mira */
function hunterB(){return rifle({c:CS(MT.tan,MT.blued,MT.wood,MT.gold),L:1.1,hg:.9,bl:.55,tip:'none',mag:'straight',s:'wood',op:'s6'})}
function extinguisherB(){const g=new THREE.Group();C(g,.22,.22,.78,[0,0,0],MT.red,18);C(g,.23,.23,.06,[.34,0,0],MT.black,18);C(g,.23,.23,.06,[-.34,0,0],MT.black,18);B(g,[.16,.1,.12],[-.02,.27,0],MT.black);B(g,[.34,.05,.06],[-.08,.34,0],MT.steel);B(g,[.06,.2,.06],[.2,-.28,0],MT.black);rod(g,[.1,.27,0],[.5,.05,0],.035,MT.rubber);C(g,.05,.035,.22,[.62,.03,0],MT.steel,10);C(g,.03,.03,.2,[-.55,.03,0],MT.black,8);return stub(g,.74)}
function crossbowB(){const g=new THREE.Group();
B(g,[.62,.07,.06],[-.15,0,0],MT.wood);B(g,[.5,.04,.045],[.28,.03,0],MT.steel);                     // coronha e trilho
B(g,[.03,.03,1.0],[.5,.06,0],MT.black);                                                             // ARCO: fino e baixo (não passa pela linha de mira)
rod(g,[.5,.06,.5],[.06,.07,0],.006,MT.chrome,5);rod(g,[.5,.06,-.5],[.06,.07,0],.006,MT.chrome,5);    // corda
B(g,[.06,.18,.05],[-.02,-.12,0],MT.wood);B(g,[.1,.07,.06],[-.46,-.01,0],MT.wood);                   // empunhadura e ombreira
C(g,.012,.012,.5,[.25,.085,0],MT.steel,6);                                                          // virote
B(g,[.007,.03,.007],[-.1,.1,.02],MT.black);B(g,[.007,.03,.007],[-.1,.1,-.02],MT.black);B(g,[.01,.05,.01],[.44,.1,0],MT.black);   // mira de ferro MINÚSCULA
mz(g,.62,.085,0);eyeA(g,-.52,.135,0,{k:'iron',fov:[38],n:['Mira de ferro']});return fin(g)}
function nailgunB(){const g=new THREE.Group();B(g,[.42,.2,.12],[0,0,0],MT.gold);B(g,[.3,.1,.12],[.06,.15,0],MT.black);B(g,[.06,.26,.1],[-.1,-.2,0],MT.black);B(g,[.4,.05,.08],[.04,.26,0],MT.steel);C(g,.035,.035,.24,[.32,.03,0],MT.steel,8);C(g,.012,.012,.1,[.46,.03,0],MT.chrome,6);for(let i=0;i<5;i++)B(g,[.02,.1,.1],[-.12+i*.08,.26,0],MT.red);mz(g,.47,.03,0);irons(g,-.18,.36,.33);return fin(g)}
function torchB(){const g=rifle({c:CS(MT.black,MT.steel,MT.black,MT.gold),L:.7,hg:.12,bl:.5,tip:'none',mag:'none',s:'none',op:'irons'});C(g,.13,.13,.42,[-.05,-.2,0],MT.gold,14);C(g,.14,.14,.04,[.16,-.2,0],MT.steel,14);C(g,.14,.14,.04,[-.26,-.2,0],MT.steel,14);C(g,.05,.07,.2,[.95,0,0],MT.steel,10);g.userData.mz[0].position.x=1.05;return g}
Object.assign(BUILD,{beretta:berettaB,machpist:machpistB,dualberetta:()=>dual(berettaB,[-.3,-.34]),dualmicro:()=>dual(microB,[-.2,-.3]),hunter:hunterB,extinguisher:extinguisherB,crossbow:crossbowB,nailgun:nailgunB,torch:torchB});

// ---------- ARMAS EXTRAS (8 comuns) + ARMAS DE EVENTO (Natal, Páscoa, Halloween e os outros meses) ----------
Object.assign(MT,{xred:Mt(0xd62a33,.4,.35),snow:Mt(0xf6f8fb,.05,.7),pink:Mt(0xff8fc8,.25,.45),rose:Mt(0xff4a8a,.3,.4),pur:Mt(0x4a1f80,.3,.4),glowP:Mt(0xb45cff,.3,.2,{emissive:0x8a2cff,emissiveIntensity:2.4}),glowO:Mt(0xff7a00,.3,.2,{emissive:0xff6a00,emissiveIntensity:2.8}),grn:Mt(0x1f8f3c,.3,.5),yel:Mt(0xffdf00,.3,.45),blu:Mt(0x1f4fbf,.4,.4),bone:Mt(0xe8e2cf,.05,.7),orange:Mt(0xff7a1a,.1,.55),leaf:Mt(0x2fa05a,.05,.7),bam:Mt(0xc9b36a,.05,.65),aqua:Mt(0x4fd6ff,.2,.25,{transparent:true,opacity:.72})});
function lnch(o){const g=new THREE.Group(),r=o.r||.16,Ln=o.len||2;C(g,r,r,Ln,[.2,0,0],o.m,18);C(g,r*1.4,r,.35,[-.95,0,0],o.m2||MT.black,18);for(let i=0;i<5;i++)C(g,r*1.06,r*1.06,.06,[-.55+i*.4,0,0],o.rm||MT.steel,18);C(g,r*1.15,r*1.15,.12,[.2+Ln/2,0,0],o.rm||MT.steel,18);
 B(g,[.5,.12,.32],[-.4,-.19,0],MT.rubber);P(g,[[-.02,-.15],[.18,-.15],[.12,-.55],[-.1,-.5]],.15,MT.black);P(g,[[.65,-.15],[.85,-.15],[.8,-.52],[.6,-.5]],.15,MT.black);B(g,[.3,.025,.1],[.1,-.2,0],MT.black);
 if(o.deco)o.deco(g,.2+Ln/2);mz(g,.2+Ln/2+(o.mzx||.25));sgt(g,'irons',-.55,.2+Ln/2-.1,r+.2,.2,r+.3);return fin(g)}
const egg=(g,c,p,s=1)=>{const e=add(g,new THREE.SphereGeometry(.09*s,12,10),c,p);e.scale.set(1,1.28,1);return e};
function fogosB(){return lnch({r:.15,len:1.9,m:MT.rose,rm:MT.gold,deco:(g,x)=>{for(let i=0;i<8;i++)C(g,.158,.158,.07,[-.5+i*.24,0,0],i%2?MT.yel:MT.snow,16);C(g,.06,.06,.4,[x+.15,0,0],MT.snow,10);add(g,new THREE.ConeGeometry(.08,.22,10).rotateZ(-Math.PI/2),MT.xred,[x+.43,0,0]);for(let i=0;i<6;i++)add(g,new THREE.SphereGeometry(.035,6,5),[MT.yel,MT.rose,MT.glow][i%3],[-.2+i*.2,.17,0]);for(const s of[-1,1])C(g,.012,.012,.4,[x+.2,0,s*.1],MT.glowR,6)},mzx:.55})}
function cannonB(){return lnch({r:.19,len:1.6,m:MT.xred,rm:MT.gold,deco:(g,x)=>{for(let i=0;i<5;i++)C(g,.192,.192,.16,[-.35+i*.4,0,0],MT.snow,16);add(g,new THREE.SphereGeometry(.15,14,12),MT.xred,[x+.12,0,0]);for(const s of[-1,1])C(g,.24,.24,.07,[-.35,-.28,s*.22],MT.wood,16,[Math.PI/2,0,0]);for(let i=0;i<8;i++){const a=i*Math.PI/4;add(g,new THREE.SphereGeometry(.014,5,4),MT.gold,[x+.12+Math.cos(a)*.05,Math.sin(a)*.16,.0])}},mzx:.3})}
function ovosB(){return lnch({r:.17,len:1.7,m:MT.pink,rm:MT.snow,deco:(g,x)=>{const cl=[MT.yel,MT.glow,MT.rose,MT.grn];for(let i=0;i<6;i++)egg(g,cl[i%4],[-.5+i*.34,.2,0],.9);egg(g,MT.rose,[x+.1,0,0],1.4);for(let i=0;i<4;i++)C(g,.171,.171,.035,[-.3+i*.45,0,0],cl[i],18)},mzx:.4})}
function rojaoB(){const g=new THREE.Group();for(let i=0;i<6;i++){const a=i*Math.PI/3,y=Math.cos(a)*.14,z=Math.sin(a)*.14;C(g,.07,.07,1.7,[.2,y,z],MT.bam,8);for(let j=0;j<3;j++)C(g,.075,.075,.03,[-.4+j*.55,y,z],MT.xred,8);add(g,new THREE.ConeGeometry(.05,.14,8).rotateZ(-Math.PI/2),[MT.yel,MT.rose,MT.xred][i%3],[1.12,y,z])}
 for(const x of[-.2,.5])C(g,.235,.235,.05,[x,0,0],MT.xred,14);B(g,[.5,.12,.32],[-.4,-.25,0],MT.rubber);P(g,[[-.02,-.2],[.18,-.2],[.12,-.6],[-.1,-.55],],.15,MT.black);P(g,[[.65,-.2],[.85,-.2],[.8,-.57],[.6,-.55]],.15,MT.black);mz(g,1.3);sgt(g,'irons',-.5,1.0,.3,.2,.45);return fin(g)}
function abobocanhaoB(){return lnch({r:.15,len:1.6,m:MT.orange,rm:MT.black,deco:(g,x)=>{const p=add(g,new THREE.SphereGeometry(.34,16,12),MT.orange,[x+.1,.0,0]);p.scale.set(1.05,1,1);for(let i=0;i<8;i++){const a=i*Math.PI/4;C(g,.04,.04,.6,[x+.1+Math.cos(a)*.3,0,Math.sin(a)*.3],MT.orange,6,[0,0,0])}
  for(const s of[-1,1]){B(g,[.09,.08,.02],[x+.0,.1,s*.33],MT.glowO);B(g,[.09,.08,.02],[x+.2,.1,s*.33],MT.glowO);B(g,[.3,.06,.02],[x+.1,-.1,s*.34],MT.glowO)}add(g,new THREE.CylinderGeometry(.04,.06,.16,8),MT.leaf,[x+.1,.35,0]);add(g,new THREE.SphereGeometry(.1,10,8),MT.glowO,[x+.45,0,0])},mzx:.55})}
function presenteB(){return lnch({r:.16,len:1.55,m:MT.grn,rm:MT.gold,deco:(g,x)=>{B(g,[.4,.4,.4],[x+.2,0,0],MT.xred);B(g,[.42,.08,.42],[x+.2,0,0],MT.gold);B(g,[.08,.42,.42],[x+.2,0,0],MT.gold);B(g,[.42,.42,.08],[x+.2,0,0],MT.gold);for(const s of[-1,1]){const l=add(g,new THREE.SphereGeometry(.1,8,6),MT.gold,[x+.2,.25,s*.12]);l.scale.set(1,.6,1.4)}for(let i=0;i<5;i++)C(g,.165,.165,.05,[-.5+i*.4,0,0],i%2?MT.xred:MT.snow,16)},mzx:.55})}
function champB(){const g=rifle({c:CS(MT.grn,MT.steel,MT.wood,MT.gold),L:1,hg:.6,bl:.35,mag:'none',s:'wood',op:'irons',tip:'none',hm:MT.grn});C(g,.1,.1,.5,[.55,-.14,0],MT.grn,12);C(g,.05,.04,.18,[.88,-.14,0],MT.gold,10);add(g,new THREE.SphereGeometry(.05,8,6),MT.snow,[1.0,-.14,0]);for(let i=0;i<3;i++)C(g,.103,.103,.03,[.4+i*.14,-.14,0],MT.gold,12);g.userData.mz[0].position.x+=.1;return g}
function confeteB(){const g=rifle({c:CS(MT.rose,MT.steel,MT.black,MT.yel),L:.9,hg:.4,bl:.25,mag:'none',s:'tel',op:'irons',tip:'brake'});C(g,.07,.22,.34,[1.15,0,0],MT.yel,14);const cl=[0xff3d81,0x27d3ff,0xffd400,0x7cff4f,0xff7a1a];for(let i=0;i<14;i++){const a=i*2.4;add(g,new THREE.BoxGeometry(.07,.02,.05),new THREE.MeshBasicMaterial({color:cl[i%5]}),[1.2+Math.cos(a)*.14,Math.sin(a)*.24,Math.sin(a*1.7)*.2],[a,a*2,0])}g.userData.mz[0].position.x+=.35;return g}
function tamborimB(){const g=rifle({c:CS(MT.poly,MT.steel,MT.rose,MT.gold),L:.7,hg:.1,bl:.14,mag:'none',s:'none',op:'irons',tip:'flash'});add(g,new THREE.CylinderGeometry(.24,.24,.15,20),MT.snow,[.05,-.38,0],[Math.PI/2,0,0]);for(const s of[-1,1])add(g,new THREE.TorusGeometry(.24,.025,6,20),MT.rose,[.05,-.38,s*.08]);const fc=[MT.yel,MT.glowP,MT.rose,MT.glow,MT.grn];for(let i=0;i<6;i++)add(g,new THREE.ConeGeometry(.04,.34,5),fc[i%5],[-.6-i*.03,.06+i*.045,(i-2.5)*.03],[0,0,Math.PI/2+.3]);return g}
function aguasB(){const g=rifle({c:CS(MT.blu,MT.chrome,MT.snow,MT.glow),L:.7,hg:.1,bl:.18,mag:'none',s:'none',op:'irons',tip:'flash'});C(g,.17,.17,.7,[.0,.36,0],MT.aqua,16);C(g,.172,.172,.05,[-.33,.36,0],MT.blu,16);C(g,.172,.172,.05,[.33,.36,0],MT.blu,16);B(g,[.3,.1,.1],[.1,.58,0],MT.yel);add(g,new THREE.SphereGeometry(.07,8,6),MT.glow,[.0,.48,0]);C(g,.06,.04,.18,[.62,0,0],MT.snow,10);return g}
function buzinaB(){const g=pist({L:1,c:CS(MT.xred,MT.chrome,MT.snow,MT.yel)});add(g,new THREE.SphereGeometry(.07,10,8),MT.xred,[.7,0,0]);add(g,new THREE.ConeGeometry(.09,.24,10).rotateZ(-Math.PI/2),MT.yel,[.0,.2,0]);add(g,new THREE.SphereGeometry(.1,10,8),MT.xred,[-.2,.2,0]);for(let i=0;i<3;i++)B(g,[.03,.21,.17],[-.15+i*.12,0,0],i%2?MT.snow:MT.yel);return g}
function natalinaB(){const g=pist({L:1.05,c:CS(MT.xred,MT.snow,MT.xred,MT.gold)});for(let i=0;i<4;i++)B(g,[.05,.215,.172],[-.1+i*.14,0,0],MT.snow);add(g,new THREE.SphereGeometry(.06,10,8),MT.gold,[.72,.0,0]);const l=add(g,new THREE.SphereGeometry(.07,8,6),MT.gold,[-.28,-.45,.09]);l.scale.set(1,.6,.5);return g}
function assombradoB(){const g=rev({bl:.8,m:MT.bone});for(const s of[-1,1]){add(g,new THREE.SphereGeometry(.03,8,6),MT.glowP,[-.34,-.22,s*.085]);add(g,new THREE.SphereGeometry(.03,8,6),MT.glowP,[.12,0,s*.2])}add(g,new THREE.SphereGeometry(.09,10,8),MT.bone,[-.4,-.58,0]);B(g,[.34,.025,.1],[.5,.08,0],MT.glowP);return g}
function coelhasB(){const mk=()=>{const g=rifle({c:CS(MT.pink,MT.snow,MT.rose,MT.rose),L:.7,hg:.15,bl:.14,mag:'straight',mx:-.15,s:'none',op:'irons',tip:'flash'});for(const s of[-1,1]){const e=add(g,new THREE.CapsuleGeometry(.04,.3,4,8),MT.snow,[-.05,.34,s*.05],[s*.18,0,.12]);add(g,new THREE.CapsuleGeometry(.02,.22,4,6),MT.pink,[-.05,.34,s*.05+s*.012],[s*.18,0,.12])}add(g,new THREE.SphereGeometry(.09,10,8),MT.snow,[-.62,-.02,0]);const b=add(g,new THREE.SphereGeometry(.06,8,6),MT.rose,[.28,.16,0]);return g};return dual(mk,[-.2,-.3])}
function morcegoB(){const g=rifle({c:CS(MT.black,MT.pur,MT.black,MT.glowP),L:.7,hg:.15,bl:.14,mag:'curved',mx:-.15,s:'none',op:'irons',tip:'flash'});for(const s of[-1,1]){P(g,[[0,0],[.12,.22],[.2,.08],[.34,.2],[.3,-.02],[.4,-.1],[.18,-.08],[.04,-.12]],.02,MT.black,[-.1,.05,s*.12]);B(g,[.3,.02,.02],[.05,.04,s*.12],MT.glowP)}return g}
function verdeamareloB(){const g=rifle({c:CS(MT.grn,MT.yel,MT.grn,MT.blu),L:1,hg:.65,bl:.4,tip:'brake',mag:'curved',mm:MT.yel,hm:MT.yel,gm:MT.grn,s:'tel',op:'holo'});for(let i=0;i<3;i++)C(g,.085,.085,.05,[.7+i*.2,0,0],MT.blu,10);B(g,[.5,.04,.2],[.05,.0,0],MT.yel);return g}
function mosqueteB(){const g=rifle({c:CS(MT.wood,MT.steel,MT.wood,MT.gold),L:1.3,hg:1.3,bl:.8,mag:'none',s:'wood',op:'irons',tip:'none',hm:MT.wood});for(let i=0;i<4;i++)C(g,.04,.04,.035,[.75+i*.38,0,0],MT.gold,10);B(g,[.1,.12,.04],[-.1,.17,.0],MT.steel,[0,0,.5]);return g}
function zarabatanaB(){const g=new THREE.Group();C(g,.05,.05,2.1,[.4,0,0],MT.bam,10);for(let i=0;i<7;i++)C(g,.056,.056,.03,[-.5+i*.33,0,0],MT.od,10);C(g,.075,.05,.12,[-.68,0,0],MT.wood,10);const fc=[MT.xred,MT.yel,MT.glow,MT.grn];for(let i=0;i<4;i++)add(g,new THREE.ConeGeometry(.03,.2,5),fc[i],[.3+i*.05,-.1,(i-1.5)*.06],[.2,0,Math.PI/2+.3]);mz(g,1.5);sgt(g,'irons',-.55,1.3,.1,.1,.2);return fin(g)}
function petalaB(){const g=crossbowB();for(let i=0;i<7;i++){const z=-.46+i*.153,c=[MT.rose,MT.pink,MT.xred][i%3];add(g,new THREE.SphereGeometry(.05,8,6),c,[.5,.085,z]);add(g,new THREE.SphereGeometry(.028,6,5),MT.yel,[.5,.115,z]);const l=add(g,new THREE.SphereGeometry(.04,6,5),MT.leaf,[.5,.07,z+.05]);l.scale.set(.5,.3,1.5)}rod(g,[.5,.065,-.5],[.5,.065,.5],.008,MT.leaf,5);return g}
function santaB(){const g=rifle({c:CS(MT.xred,MT.chrome,MT.black,MT.gold),L:1.2,hg:.8,bl:1.1,tip:'brake',mag:'straight',mm:MT.xred,hm:MT.snow,gm:MT.xred,s:'wood',bip:1,op:'s12',bolt:1});
 for(let i=0;i<9;i++)C(g,.037,.037,.055,[1.42+i*.12,0,0],MT.xred,10);
 for(let i=0;i<4;i++)C(g,.084,.084,.06,[.72+i*.17,0,0],MT.xred,12);
 add(g,new THREE.TorusGeometry(.108,.035,8,18),MT.od,[.64,0,0],[0,Math.PI/2,0]);
 for(let i=0;i<7;i++){const a=i*Math.PI*2/7;add(g,new THREE.SphereGeometry(.022,8,6),MT.red,[.64,Math.cos(a)*.108,Math.sin(a)*.108])}
 B(g,[.09,.29,.19],[.1,-.02,0],MT.gold);
 for(const s of[-1,1]){add(g,new THREE.SphereGeometry(.035,8,6),MT.gold,[.1,-.02,s*.105]);for(const d of[-1,1]){const l=add(g,new THREE.SphereGeometry(.05,8,6),MT.gold,[.1+d*.07,-.02,s*.105]);l.scale.set(1.3,.7,.4);l.rotation.z=d*.45}B(g,[.025,.1,.012],[.1,-.1,s*.11],MT.gold,[0,0,.25*s])}
 add(g,new THREE.SphereGeometry(.11,12,10),MT.snow,[-1.5,-.12,0]);return g}
function lynxB(){return rifle({c:CS(MT.tan,MT.steel,MT.black,MT.black),L:.8,hg:.35,bl:.1,tip:'flash',mag:'straight',s:'tel',op:'dot'})}
function phantomB(){const g=rifle({c:CS(MT.black,MT.steel,MT.poly,MT.gold),L:1.1,hg:.6,bl:.3,tip:'brake',mag:'curved',mm:MT.black,s:'tel',op:'acog'});B(g,[.06,.3,.08],[.85,-.2,0],MT.black);return g}
function badgerB(){const g=rifle({c:CS(MT.od,MT.black,MT.black,MT.red),L:.6,hg:.1,bl:.14,mag:'straight',mx:-.12,s:'none',op:'irons',tip:'flash'});B(g,[.06,.28,.1],[.3,-.2,0],MT.black);return g}
function coyoteB(){return rev({bl:1.0,m:MT.chrome})}
function bulldogB(){const g=rifle({c:CS(MT.poly,MT.steel,MT.black,MT.gold),L:.9,hg:.5,bl:.3,mag:'none',s:'tel',op:'irons',tip:'brake'});C(g,.05,.05,.5,[.65,-.1,0],MT.steel,10);return g}
function ripperB(){return rifle({c:CS(MT.od,MT.steel,MT.black,MT.red),L:1.2,hg:.8,bl:.6,tip:'flash',mag:'box',mm:MT.od,s:'tel',bip:1,op:'acog',belt:1})}
function longbowB(){return rifle({c:CS(MT.black,MT.blued,MT.black,MT.gold),L:1.2,hg:1,bl:.9,tip:'supp',mag:'straight',s:'wood',bip:1,op:'s6'})}
function voltB(){const g=pist({L:1,c:CS(MT.navy,MT.chrome,MT.black,MT.glow)});B(g,[.4,.03,.17],[.16,.06,0],MT.glow);for(let i=0;i<3;i++)add(g,new THREE.TorusGeometry(.055,.012,6,10),MT.glow,[.46+i*.07,0,0],[0,Math.PI/2,0]);return g}
Object.assign(BUILD,{lynx:lynxB,phantom:phantomB,badger:badgerB,coyote:coyoteB,bulldog:bulldogB,ripper:ripperB,longbow:longbowB,volt:voltB,fogos:fogosB,champ:champB,confete:confeteB,tamborim:tamborimB,buzina:buzinaB,cannon:cannonB,coelhas:coelhasB,ovos:ovosB,petala:petalaB,rojao:rojaoB,aguas:aguasB,zarabatana:zarabatanaB,verdeamarelo:verdeamareloB,abobocanhao:abobocanhaoB,assombrado:assombradoB,morcego:morcegoB,mosquete:mosqueteB,santa:santaB,natalina:natalinaB,presente:presenteB});
import { STORE_BUILD } from './storeModels.js';
Object.assign(BUILD, STORE_BUILD);   // armas da loja (edição lendária)
// armas novas/temáticas que não tinham onde encaixar mira: a mira escolhida no Arsenal (ferro, red dot, holo, ACOG, lunetas) aparece EM CIMA delas
for (const id of ['petala', 'boto', 'dragao', 'sucuri', 'berimbau', 'saci', 'iara', 'boitata', 'cuca', 'onca', 'cangaco', 'tamandua', 'cristal', 'lobisomem', 'tucano', 'mula', 'piranha', 'diabo', 'minigun']) {
  const f = BUILD[id]; if (!f) continue;
  BUILD[id] = () => { const g = f(), op = OV.op; if (!op || op === 'def') return g; const b = new THREE.Box3().setFromObject(g), cx = (b.min.x + b.max.x) / 2, top = b.max.y;
    if (op === 'irons') irons(g, cx - .25, cx + .35, top + .06); else optic(g, cx, top + .2, op);
    (g.userData.mz || []).forEach((o) => { o.userData.eye = g.userData.eye; }); return g; };
}
export { BUILD, MT, OP };
export function setOV(o){ OV = o || {}; }
export function getOV(){ return OV; }
// FERROLHO: todo sniper de FERROLHO (os de tiro lento e dano alto) puxa o ferrolho e ejeta o cartucho depois do tiro; os semiautomáticos não (por isso dão menos dano e atiram mais rápido). Quem ainda não tinha a peça ganha aqui.
for (const id of ['hunter', 'mosquete', 'dragao', 'cangaco']) {
  const f = BUILD[id]; if (!f) continue;
  BUILD[id] = () => { const g = f(); let has = false; g.traverse((o) => { if (o.userData?.role === 'bolt') has = true; }); if (has) return g;
    const b = new THREE.Box3().setFromObject(g), cx = b.min.x + (b.max.x - b.min.x) * 0.3, cy = b.min.y + (b.max.y - b.min.y) * 0.62, bg = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0x23262b, metalness: 0.8, roughness: 0.4 });
    bg.position.set(cx, cy, 0.1); bg.userData.role = 'bolt'; bg.userData.bx = cx;
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8), m); h.rotation.x = Math.PI / 2; h.position.set(0, 0, 0.02); bg.add(h);
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), m); k.position.set(0, 0, 0.14); bg.add(k); g.add(bg); return g; };
}
